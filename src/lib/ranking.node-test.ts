import test from "node:test";
import assert from "node:assert/strict";

import { applyElo, expectedScore, normalizeOrientation } from "@/lib/ranking";

test("expectedScore favors the stronger image", () => {
  assert.ok(expectedScore(1400, 1200) > 0.5);
});

test("applyElo increases winner and reduces loser", () => {
  const result = applyElo({ rating: 1200 }, { rating: 1200 });

  assert.ok(result.winnerRating > 1200);
  assert.ok(result.loserRating < 1200);
  assert.ok(result.delta > 0);
});

test("normalizeOrientation accepts valid values only", () => {
  assert.equal(normalizeOrientation("portrait"), "PORTRAIT");
  assert.equal(normalizeOrientation("banana"), undefined);
});
