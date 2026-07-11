import test from "node:test";
import assert from "node:assert/strict";

import { uploadSchema } from "@/lib/upload-validation";

test("upload schema accepts a valid pending image payload", () => {
  const parsed = uploadSchema.safeParse({
    title: "Meu carro favorito",
    imageUrl: "https://example.com/carro.jpg",
    categoryId: "cat-carros",
    orientation: "PORTRAIT",
  });

  assert.equal(parsed.success, true);
});

test("upload schema rejects invalid image submissions", () => {
  const parsed = uploadSchema.safeParse({
    title: "x",
    imageUrl: "not-a-url",
    categoryId: "",
    orientation: "DIAGONAL",
  });

  assert.equal(parsed.success, false);
});
