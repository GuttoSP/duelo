import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@prisma/client";
import { demoCategories, demoImages } from "../src/lib/demo-data";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@duelo.local" },
    update: {},
    create: {
      name: "Admin Duelo",
      email: "admin@duelo.local",
      passwordHash: await bcrypt.hash("duelo123", 10),
      role: "ADMIN",
    },
  });

  for (const category of demoCategories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        groupName: category.groupName,
        description: category.description,
        icon: category.icon,
      },
      create: category,
    });
  }

  for (const image of demoImages) {
    await prisma.duelImage.upsert({
      where: { id: image.id },
      update: {
        title: image.title,
        imageUrl: image.imageUrl,
        rating: image.rating,
        wins: image.wins,
        losses: image.losses,
        appearances: image.appearances,
      },
      create: {
        id: image.id,
        title: image.title,
        imageUrl: image.imageUrl,
        categoryId: image.categoryId,
        orientation: image.orientation,
        rating: image.rating,
        wins: image.wins,
        losses: image.losses,
        appearances: image.appearances,
        uploaderId: admin.id,
      },
    });
  }

  await prisma.duelRoom.upsert({
    where: { slug: "caos-total" },
    update: {},
    create: {
      name: "Caos total",
      slug: "caos-total",
      isChaos: true,
      ownerId: admin.id,
    },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
