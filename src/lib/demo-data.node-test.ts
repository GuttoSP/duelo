import test from "node:test";
import assert from "node:assert/strict";

import { demoCategories, demoImages } from "@/lib/demo-data";

test("demo data has enough categories and image pairs", () => {
  assert.ok(demoCategories.length >= 35);
  assert.ok(demoImages.length >= demoCategories.length * 20);
});

test("demo images keep a valid orientation and category reference", () => {
  const categoryIds = new Set(demoCategories.map((category) => category.id));

  for (const image of demoImages) {
    assert.ok(categoryIds.has(image.categoryId));
    assert.ok(["PORTRAIT", "LANDSCAPE", "SQUARE"].includes(image.orientation));
  }
});

test("each category and orientation has enough alternatives", () => {
  for (const category of demoCategories) {
    const categoryTotal = demoImages.filter(
      (image) => image.categorySlug === category.slug,
    ).length;

    assert.ok(categoryTotal >= 20, `${category.slug} should have 20+ images`);

    for (const orientation of ["PORTRAIT", "LANDSCAPE", "SQUARE"] as const) {
      const total = demoImages.filter(
        (image) =>
          image.categorySlug === category.slug && image.orientation === orientation,
      ).length;

      assert.ok(
        total >= 6,
        `${category.slug}/${orientation} should have enough demo images`,
      );
    }
  }
});

test("requested categories and niches are present", () => {
  const slugs = new Set(demoCategories.map((category) => category.slug));

  for (const slug of [
    "animais-gatos",
    "animais-peixes",
    "animais-cachorros",
    "animais-calopsitas",
    "aves",
    "natureza-arvores",
    "casas-praia",
    "casas-campo",
    "roupas-biquinis",
    "roupas-jaquetas",
    "roupas-maios",
    "aneis",
    "sandalias",
    "calcados",
    "relogios",
    "moda-praia-infantil",
    "moda-praia-adulto",
    "moda-inverno-adulto",
    "ternos",
    "gravatas",
    "facas",
    "motos",
    "bicicletas",
    "animais-insetos",
    "animais-marinhos",
    "espaco",
    "fotos-natureza",
    "cidades",
  ]) {
    assert.ok(slugs.has(slug), `${slug} should exist`);
  }
});
