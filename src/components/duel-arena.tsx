"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  BadgeCheck,
  Flame,
  Gamepad2,
  Shuffle,
  Trophy,
  Zap,
} from "lucide-react";
import clsx from "clsx";

import type { CategoryView, DuelImageView, Orientation } from "@/lib/demo-data";
import {
  assertDistinctDuel,
  placeWinnerOnSide,
  randomSide,
  type DuelSide,
} from "@/lib/duel-side";

type Duel = {
  left: DuelImageView;
  right: DuelImageView;
  mode: string;
};

type DuelMode = "category" | "mix" | "chaos";

const PRELOAD_TARGET = 10;
const PRELOAD_FETCH_LIMIT = 12;

type Props = {
  initialDuel: Duel;
  categories: CategoryView[];
};

export function DuelArena({ initialDuel, categories }: Props) {
  const [duel, setDuel] = useState(initialDuel);
  const [category, setCategory] = useState(initialDuel.left.categorySlug);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    initialDuel.left.categorySlug,
  ]);
  const [mode, setMode] = useState<DuelMode>("category");
  const [orientation, setOrientation] = useState<Orientation>(
    initialDuel.left.orientation,
  );
  const [streak, setStreak] = useState(0);
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const [shuffleWinnerSide, setShuffleWinnerSide] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [loadingSide, setLoadingSide] = useState<DuelSide | "both" | null>(null);
  const preloadedImages = useRef(new Set<string>());
  const preloadedCandidates = useRef<DuelImageView[]>([]);
  const activePreloadKey = useRef("");
  const preloadInFlightKey = useRef<string | null>(null);

  const aspectClass = useMemo(
    () =>
      orientation === "LANDSCAPE"
        ? "h-[180px] sm:h-auto sm:aspect-[16/10]"
        : orientation === "SQUARE"
          ? "h-[220px] sm:h-auto sm:aspect-square"
          : "h-[330px] sm:h-auto sm:aspect-[9/13]",
    [orientation],
  );

  const selectedCategoriesKey = selectedCategories.join(",");

  useEffect(() => {
    void preloadImage(duel.left.imageUrl, preloadedImages.current);
    void preloadImage(duel.right.imageUrl, preloadedImages.current);
  }, [duel.left.imageUrl, duel.right.imageUrl]);

  useEffect(() => {
    const key = `${mode}:${category}:${orientation}:${selectedCategoriesKey}`;

    activePreloadKey.current = key;
    preloadedCandidates.current = [];

    const params = new URLSearchParams({
      category,
      mode,
      orientation,
    });

    if (mode === "mix") {
      params.set("categories", selectedCategoriesKey);
    }

    void refillPreloadBuffer(
      params,
      key,
      [],
      preloadedCandidates,
      preloadedImages,
      activePreloadKey,
      preloadInFlightKey,
    );
  }, [category, mode, orientation, selectedCategoriesKey]);

  function paramsFor(
    nextMode = mode,
    nextCategory = category,
    nextOrientation = orientation,
    keepId?: string,
    excludeId?: string,
    nextSelectedCategories = selectedCategories,
  ) {
    const params = new URLSearchParams({
      category: nextCategory,
      mode: nextMode,
      orientation: nextOrientation,
    });

    if (nextMode === "mix") {
      params.set("categories", nextSelectedCategories.join(","));
    }

    if (keepId) params.set("keepId", keepId);
    if (excludeId) params.set("excludeId", excludeId);

    return params;
  }

  function preloadKeyFor(
    nextMode = mode,
    nextCategory = category,
    nextOrientation = orientation,
    nextSelectedCategories = selectedCategories,
  ) {
    return `${nextMode}:${nextCategory}:${nextOrientation}:${nextSelectedCategories.join(",")}`;
  }

  function choose(
    winner: DuelImageView,
    loser: DuelImageView,
    winnerSide: DuelSide,
  ) {
    void (async () => {
      const targetSide = shuffleWinnerSide ? randomSide() : winnerSide;

      setIsLoadingNext(true);
      setLoadingSide(shuffleWinnerSide ? "both" : oppositeSide(winnerSide));

      const voteResponse = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winnerId: winner.id,
          loserId: loser.id,
          mode,
        }),
      });
      const vote = (await voteResponse.json()) as { delta?: number };
      setLastDelta(vote.delta ?? null);
      setStreak((value) => value + 1);

      const baseParams = paramsFor(
        mode,
        category,
        orientation,
      );
      const preloadKey = preloadKeyFor();
      const bufferedCandidate = takeBufferedCandidate(preloadedCandidates, [
        winner.id,
        loser.id,
      ]);
      let nextDuel: Duel;

      if (bufferedCandidate) {
        nextDuel = {
          left: winner,
          right: bufferedCandidate,
          mode,
        };
      } else {
        const next = await fetch(
          `/api/duel?${paramsFor(
            mode,
            category,
            orientation,
            winner.id,
            loser.id,
          )}`,
        );
        nextDuel = (await next.json()) as Duel;
      }

      const placedDuel = assertDistinctDuel(
        placeWinnerOnSide(nextDuel, winner, targetSide),
      );

      await preloadDuelImages(placedDuel, preloadedImages.current);

      setDuel({
        ...nextDuel,
        ...placedDuel,
      });
      setIsLoadingNext(false);
      setLoadingSide(null);

      void refillPreloadBuffer(
        baseParams,
        preloadKey,
        [placedDuel.left.id, placedDuel.right.id],
        preloadedCandidates,
        preloadedImages,
        activePreloadKey,
        preloadInFlightKey,
      );
    })().catch(() => {
      setIsLoadingNext(false);
      setLoadingSide(null);
    });
  }

  function reload(
    nextMode = mode,
    nextCategory = category,
    nextOrientation = orientation,
    nextSelectedCategories = selectedCategories,
  ) {
    void (async () => {
      setIsLoadingNext(true);
      setLoadingSide("both");

      const nextPreloadKey = preloadKeyFor(
        nextMode,
        nextCategory,
        nextOrientation,
        nextSelectedCategories,
      );
      const baseParams = paramsFor(
        nextMode,
        nextCategory,
        nextOrientation,
        undefined,
        undefined,
        nextSelectedCategories,
      );

      activePreloadKey.current = nextPreloadKey;
      preloadedCandidates.current = [];

      const response = await fetch(
        `/api/duel?${baseParams}`,
      );
      const rawDuel = (await response.json()) as Duel;
      const nextDuel = assertDistinctDuel(rawDuel);

      await preloadDuelImages(nextDuel, preloadedImages.current);

      setDuel({
        ...rawDuel,
        ...nextDuel,
      });
      setMode(nextMode);
      setCategory(nextCategory);
      setOrientation(nextOrientation);
      setSelectedCategories(nextSelectedCategories);
      setStreak(0);
      setLastDelta(null);
      setIsLoadingNext(false);
      setLoadingSide(null);

      void refillPreloadBuffer(
        baseParams,
        nextPreloadKey,
        [nextDuel.left.id, nextDuel.right.id],
        preloadedCandidates,
        preloadedImages,
        activePreloadKey,
        preloadInFlightKey,
      );
    })().catch(() => {
      setIsLoadingNext(false);
      setLoadingSide(null);
    });
  }

  function toggleMixCategory(slug: string) {
    const nextSelectedCategories = selectedCategories.includes(slug)
      ? selectedCategories.filter((item) => item !== slug)
      : [...selectedCategories, slug];
    const safeSelection = nextSelectedCategories.length
      ? nextSelectedCategories
      : [slug];

    reload("mix", category, orientation, safeSelection);
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_300px] lg:px-8">
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
              Arena ao vivo
            </p>
            <h1 className="text-3xl font-black text-white sm:text-5xl">
              Escolha sem pensar demais.
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-2xl shadow-black/20 backdrop-blur">
            <Flame className="h-4 w-4 text-orange-300" />
            Sequencia {streak}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DuelCard
            image={duel.left}
            aspectClass={aspectClass}
            disabled={isLoadingNext}
            loading={loadingSide === "left" || loadingSide === "both"}
            side="left"
            onChoose={() => choose(duel.left, duel.right, "left")}
          />
          <DuelCard
            image={duel.right}
            aspectClass={aspectClass}
            disabled={isLoadingNext}
            loading={loadingSide === "right" || loadingSide === "both"}
            side="right"
            onChoose={() => choose(duel.right, duel.left, "right")}
          />
        </div>
      </div>

      <aside className="grid min-w-0 content-start gap-4">
        <div className="min-w-0 rounded-lg border border-white/15 bg-slate-950/70 p-4 text-white shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mb-3 flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-cyan-300" />
            <h2 className="text-base font-black">Controles</h2>
          </div>
          <div className="grid min-w-0 grid-cols-3 gap-2">
            <button
              className={controlClass(mode === "category")}
              onClick={() => reload("category")}
            >
              Categoria
            </button>
            <button
              className={controlClass(mode === "mix")}
              onClick={() => reload("mix")}
            >
              Mix
            </button>
            <button
              className={controlClass(mode === "chaos")}
              onClick={() => reload("chaos")}
            >
              <Shuffle className="h-4 w-4" />
              Caos
            </button>
          </div>

          <label className="mt-4 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Categoria
          </label>
          <select
            className="mt-2 w-full min-w-0 rounded-md border border-white/10 bg-slate-900 px-3 py-3 text-sm font-bold text-white outline-none focus:border-cyan-300"
            value={category}
            onChange={(event) =>
              reload("category", event.target.value, orientation, [event.target.value])
            }
          >
            {categories.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.groupName ? `${item.groupName} - ${item.name}` : item.name}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Mix de nichos
          </label>
          <div className="mt-2 max-h-52 overflow-y-auto rounded-md border border-white/10 bg-slate-900/70 p-2">
            {categories.map((item) => (
              <label
                key={item.slug}
                className="flex min-h-10 items-center gap-2 rounded px-2 text-sm font-bold text-slate-100 hover:bg-white/5"
              >
                <input
                  checked={selectedCategories.includes(item.slug)}
                  className="h-4 w-4 accent-cyan-300"
                  onChange={() => toggleMixCategory(item.slug)}
                  type="checkbox"
                />
                <span className="min-w-0 truncate">
                  {item.groupName ? `${item.groupName} - ${item.name}` : item.name}
                </span>
              </label>
            ))}
          </div>

          <label className="mt-4 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Formato
          </label>
          <div className="mt-2 grid min-w-0 grid-cols-3 gap-2">
            {(["PORTRAIT", "LANDSCAPE", "SQUARE"] as const).map((item) => (
              <button
                key={item}
                className={controlClass(orientation === item)}
                onClick={() => reload(mode, category, item)}
              >
                {item === "PORTRAIT" ? "Em pe" : item === "LANDSCAPE" ? "Deitada" : "1:1"}
              </button>
            ))}
          </div>

          <label className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 text-sm font-bold text-white">
            <span>Lado sorteado</span>
            <input
              checked={shuffleWinnerSide}
              className="h-5 w-5 accent-cyan-300"
              onChange={(event) => setShuffleWinnerSide(event.target.checked)}
              type="checkbox"
            />
          </label>
        </div>

        <div className="min-w-0 rounded-lg border border-white/15 bg-white p-4 text-slate-950 shadow-xl">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="font-black">Pontuacao</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Metric label="Elo esquerda" value={Math.round(duel.left.rating)} />
            <Metric label="Elo direita" value={Math.round(duel.right.rating)} />
            <Metric label="Vitorias" value={duel.left.wins + duel.right.wins} />
            <Metric label="Delta" value={lastDelta ? `+${lastDelta}` : "--"} />
          </div>
        </div>
      </aside>
    </section>
  );
}

function DuelCard({
  image,
  aspectClass,
  disabled,
  loading,
  side,
  onChoose,
}: {
  image: DuelImageView;
  aspectClass: string;
  disabled: boolean;
  loading: boolean;
  side: "left" | "right";
  onChoose: () => void;
}) {
  return (
    <button
      className={clsx(
        "group relative min-w-0 overflow-hidden rounded-lg border border-white/15 bg-slate-900 text-left shadow-2xl shadow-black/30 outline-none transition duration-200 focus-visible:ring-4 focus-visible:ring-cyan-300/70 active:scale-[0.99]",
        aspectClass,
        disabled ? "cursor-wait opacity-80" : "hover:-translate-y-1",
      )}
      disabled={disabled}
      onClick={onChoose}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.imageUrl}
        alt={image.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/10" />
      {loading ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-black/55 text-white backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/25 border-t-cyan-300" />
            <span className="text-sm font-black uppercase tracking-[0.18em]">
              Carregando
            </span>
          </div>
        </div>
      ) : null}
      <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur sm:left-4 sm:top-4 sm:gap-2 sm:px-3 sm:py-2 sm:tracking-[0.18em]">
        <Zap className="h-4 w-4 text-yellow-300" />
        {side === "left" ? "A" : "B"}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-2 text-white sm:p-4">
        <div className="mb-2 inline-flex max-w-full items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[11px] font-bold backdrop-blur sm:gap-2 sm:px-3 sm:text-xs">
          <BadgeCheck className="h-4 w-4 text-cyan-200" />
          <span className="truncate">{image.categoryName}</span>
        </div>
        <h3 className="text-base font-black leading-tight sm:text-2xl">
          {image.title}
        </h3>
        <p className="mt-1 text-xs font-semibold text-white/80 sm:text-sm">
          Elo {Math.round(image.rating)} - {image.wins}V / {image.losses}D
        </p>
      </div>
    </button>
  );
}

function oppositeSide(side: DuelSide): DuelSide {
  return side === "left" ? "right" : "left";
}

function preloadDuelImages(
  duel: { left: DuelImageView; right: DuelImageView },
  cache: Set<string>,
) {
  return Promise.all([
    preloadImage(duel.left.imageUrl, cache),
    preloadImage(duel.right.imageUrl, cache),
  ]);
}

function preloadImage(src: string, cache: Set<string>) {
  if (cache.has(src)) {
    return Promise.resolve();
  }

  if (typeof window === "undefined") {
    cache.add(src);
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const image = new window.Image();
    const timeout = window.setTimeout(() => {
      cache.add(src);
      resolve();
    }, 3500);

    image.onload = () => {
      window.clearTimeout(timeout);
      cache.add(src);
      resolve();
    };
    image.onerror = () => {
      window.clearTimeout(timeout);
      cache.add(src);
      resolve();
    };
    image.src = src;
  });
}

function takeBufferedCandidate(
  queue: MutableRefObject<DuelImageView[]>,
  excludeIds: string[],
) {
  const excluded = new Set(excludeIds);
  const index = queue.current.findIndex((candidate) => !excluded.has(candidate.id));

  if (index === -1) {
    return undefined;
  }

  const [candidate] = queue.current.splice(index, 1);

  return candidate;
}

async function refillPreloadBuffer(
  params: URLSearchParams,
  key: string,
  excludeIds: string[],
  queue: MutableRefObject<DuelImageView[]>,
  cache: MutableRefObject<Set<string>>,
  activeKey: MutableRefObject<string>,
  inFlightKey: MutableRefObject<string | null>,
) {
  if (queue.current.length >= PRELOAD_TARGET || inFlightKey.current === key) {
    return;
  }

  inFlightKey.current = key;

  try {
    const excluded = new Set(excludeIds);
    let attempts = 0;

    while (
      activeKey.current === key &&
      queue.current.length < PRELOAD_TARGET &&
      attempts < PRELOAD_FETCH_LIMIT
    ) {
      const warmParams = new URLSearchParams(params);

      warmParams.set("warm", `${Date.now()}-${attempts}`);

      const response = await fetch(`/api/duel?${warmParams}`);
      const duel = assertDistinctDuel((await response.json()) as Duel);
      const candidates = [duel.left, duel.right].filter((candidate) => {
        if (excluded.has(candidate.id)) return false;
        if (queue.current.some((item) => item.id === candidate.id)) return false;
        return true;
      });

      await Promise.all(
        candidates.map((candidate) => preloadImage(candidate.imageUrl, cache.current)),
      );

      if (activeKey.current !== key) {
        return;
      }

      for (const candidate of candidates) {
        if (queue.current.length >= PRELOAD_TARGET) break;
        queue.current.push(candidate);
      }

      attempts += 1;
    }
  } finally {
    if (inFlightKey.current === key) {
      inFlightKey.current = null;
    }
  }
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-slate-100 p-3">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function controlClass(active: boolean) {
  return clsx(
    "flex min-h-11 min-w-0 items-center justify-center gap-1 overflow-hidden rounded-md px-2 text-xs font-black transition sm:gap-2 sm:px-3 sm:text-sm",
    active
      ? "bg-cyan-300 text-slate-950"
      : "border border-white/10 bg-white/5 text-white hover:bg-white/10",
  );
}
