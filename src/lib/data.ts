import { demoCategories, demoImages, type DuelImageView } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { applyElo, normalizeOrientation } from "@/lib/ranking";

type DuelOptions = {
  category?: string | null;
  categories?: string | null;
  mode?: string | null;
  orientation?: string | null;
  keepId?: string | null;
  excludeId?: string | null;
};

type VoteOptions = {
  winnerId: string;
  loserId: string;
  mode?: string;
  userId?: string;
};

const memoryImages = demoImages.map((image) => ({ ...image }));
const memoryUploads: Array<
  DuelImageView & {
    status: "PENDING";
    createdAt: Date;
    updatedAt: Date;
    sourceUrl: string | null;
    uploaderId?: string;
  }
> = [];

export async function getDashboard() {
  try {
    const [categories, images, votes, users] = await Promise.all([
      prisma.category.findMany({ orderBy: [{ groupName: "asc" }, { name: "asc" }] }),
      prisma.duelImage.findMany({
        where: { status: "APPROVED" },
        include: { category: true },
        orderBy: { rating: "desc" },
        take: 24,
      }),
      prisma.vote.count(),
      prisma.user.count(),
    ]);

    if (categories.length && images.length) {
      return {
        categories,
        topImages: images.map(toView),
        stats: {
          votes,
          users,
          activeDuels: Math.max(3, Math.ceil(votes / 12)),
          images: images.length,
        },
      };
    }
  } catch {
    // Demo fallback keeps the product explorable before PostgreSQL is configured.
  }

  return {
    categories: demoCategories,
    topImages: [...memoryImages].sort((a, b) => b.rating - a.rating).slice(0, 12),
    stats: {
      votes: memoryImages.reduce((sum, image) => sum + image.wins + image.losses, 0),
      users: 1,
      activeDuels: 7,
      images: memoryImages.length,
    },
  };
}

export async function getDuel(options: DuelOptions = {}) {
  const mode =
    options.mode === "chaos" ? "chaos" : options.mode === "mix" ? "mix" : "category";
  const orientation = normalizeOrientation(options.orientation);
  const selectedCategories = parseCategories(options.categories);

  try {
    const kept = options.keepId
      ? await prisma.duelImage.findUnique({
          where: { id: options.keepId },
          include: { category: true },
        })
      : null;
    const excludedIds = [kept?.id, options.excludeId].filter(Boolean) as string[];

    const category = mode === "category" ? options.category ?? kept?.category.slug : undefined;
    const categorySlugs = mode === "mix" ? selectedCategories : undefined;
    const candidates = await prisma.duelImage.findMany({
      where: {
        status: "APPROVED",
        id: excludedIds.length ? { notIn: excludedIds } : undefined,
        orientation: orientation ?? kept?.orientation,
        category: category
          ? { slug: category }
          : categorySlugs?.length
            ? { slug: { in: categorySlugs } }
            : undefined,
      },
      include: { category: true },
      orderBy: [{ appearances: "asc" }, { rating: "desc" }],
      take: 30,
    });

    const pool = candidates.map(toView);
    const left = kept ? toView(kept) : weightedPick(pool);
    const right = weightedPick(pool.filter((image) => image.id !== left?.id));

    if (left && right) {
      return { left, right, mode };
    }
  } catch {
    // Falls through to in-memory demo duel.
  }

  return getMemoryDuel(options);
}

export async function recordVote(options: VoteOptions) {
  try {
    const [winner, loser] = await Promise.all([
      prisma.duelImage.findUnique({ where: { id: options.winnerId } }),
      prisma.duelImage.findUnique({ where: { id: options.loserId } }),
    ]);

    if (!winner || !loser) {
      throw new Error("Images not found");
    }

    const rating = applyElo(
      { rating: winner.rating, uncertainty: winner.uncertainty },
      { rating: loser.rating, uncertainty: loser.uncertainty },
    );

    await prisma.$transaction([
      prisma.duelImage.update({
        where: { id: winner.id },
        data: {
          rating: rating.winnerRating,
          uncertainty: Math.max(80, winner.uncertainty * 0.96),
          wins: { increment: 1 },
          appearances: { increment: 1 },
        },
      }),
      prisma.duelImage.update({
        where: { id: loser.id },
        data: {
          rating: rating.loserRating,
          uncertainty: Math.max(80, loser.uncertainty * 0.96),
          losses: { increment: 1 },
          appearances: { increment: 1 },
        },
      }),
      prisma.vote.create({
        data: {
          winnerId: winner.id,
          loserId: loser.id,
          delta: rating.delta,
          mode: options.mode ?? "category",
          userId: options.userId,
        },
      }),
    ]);

    return { delta: rating.delta };
  } catch {
    const winner = memoryImages.find((image) => image.id === options.winnerId);
    const loser = memoryImages.find((image) => image.id === options.loserId);

    if (!winner || !loser) {
      throw new Error("Images not found");
    }

    const rating = applyElo(winner, loser);
    winner.rating = rating.winnerRating;
    winner.wins += 1;
    winner.appearances += 1;
    loser.rating = rating.loserRating;
    loser.losses += 1;
    loser.appearances += 1;

    return { delta: rating.delta };
  }
}

export async function createUpload(input: {
  title: string;
  imageUrl: string;
  categoryId: string;
  orientation: string;
  uploaderId?: string;
}) {
  const orientation = normalizeOrientation(input.orientation) ?? "PORTRAIT";

  try {
    return await prisma.duelImage.create({
      data: {
        title: input.title,
        imageUrl: input.imageUrl,
        categoryId: input.categoryId,
        orientation,
        uploaderId: input.uploaderId,
        status: "PENDING",
      },
    });
  } catch {
    const category = demoCategories.find((item) => item.id === input.categoryId);

    if (!category) {
      throw new Error("Category not found");
    }

    const now = new Date();
    const upload = {
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      imageUrl: input.imageUrl,
      categoryId: input.categoryId,
      categorySlug: category.slug,
      categoryName: category.name,
      orientation,
      rating: 1200,
      wins: 0,
      losses: 0,
      appearances: 0,
      status: "PENDING" as const,
      createdAt: now,
      updatedAt: now,
      sourceUrl: null,
      uploaderId: input.uploaderId,
    };

    memoryUploads.push(upload);

    return upload;
  }
}

function getMemoryDuel(options: DuelOptions) {
  const mode =
    options.mode === "chaos" ? "chaos" : options.mode === "mix" ? "mix" : "category";
  const kept = options.keepId
    ? memoryImages.find((image) => image.id === options.keepId)
    : undefined;
  const excludedIds = new Set([kept?.id, options.excludeId].filter(Boolean));
  const selectedCategories = new Set(parseCategories(options.categories));
  const category = mode === "category" ? options.category ?? kept?.categorySlug : undefined;
  const orientation = normalizeOrientation(options.orientation) ?? kept?.orientation;

  const pool = memoryImages.filter((image) => {
    if (excludedIds.has(image.id)) return false;
    if (category && image.categorySlug !== category) return false;
    if (mode === "mix" && selectedCategories.size && !selectedCategories.has(image.categorySlug)) {
      return false;
    }
    if (orientation && image.orientation !== orientation) return false;
    return true;
  });

  const left = kept ?? weightedPick(pool);
  const right = weightedPick(pool.filter((image) => image.id !== left?.id));
  const fallbackRight = memoryImages.find((image) => image.id !== left?.id);

  return {
    left: left ?? memoryImages[0],
    right: right ?? fallbackRight ?? memoryImages[1],
    mode,
  };
}

function parseCategories(value?: string | null) {
  return (
    value
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? []
  );
}

function weightedPick(images: DuelImageView[]) {
  if (!images.length) return undefined;
  const sorted = [...images].sort((a, b) => {
    const exposure = a.appearances - b.appearances;
    return exposure || Math.abs(1200 - a.rating) - Math.abs(1200 - b.rating);
  });
  const top = sorted.slice(0, Math.max(2, Math.ceil(sorted.length / 3)));

  return top[Math.floor(Math.random() * top.length)];
}

function toView(image: {
  id: string;
  title: string;
  imageUrl: string;
  categoryId: string;
  category: { slug: string; name: string };
  orientation: "PORTRAIT" | "LANDSCAPE" | "SQUARE";
  rating: number;
  wins: number;
  losses: number;
  appearances: number;
}): DuelImageView {
  return {
    id: image.id,
    title: image.title,
    imageUrl: image.imageUrl,
    categoryId: image.categoryId,
    categorySlug: image.category.slug,
    categoryName: image.category.name,
    orientation: image.orientation,
    rating: image.rating,
    wins: image.wins,
    losses: image.losses,
    appearances: image.appearances,
  };
}
