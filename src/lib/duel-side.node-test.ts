import test from "node:test";
import assert from "node:assert/strict";

import { assertDistinctDuel, placeWinnerOnSide } from "@/lib/duel-side";

const winner = { id: "winner", title: "Winner" };
const challenger = { id: "challenger", title: "Challenger" };

test("keeps the winner on the chosen left side", () => {
  const duel = placeWinnerOnSide(
    { left: winner, right: challenger },
    winner,
    "left",
  );

  assert.equal(duel.left.id, "winner");
  assert.equal(duel.right.id, "challenger");
});

test("keeps the winner on the chosen right side", () => {
  const duel = placeWinnerOnSide(
    { left: winner, right: challenger },
    winner,
    "right",
  );

  assert.equal(duel.left.id, "challenger");
  assert.equal(duel.right.id, "winner");
});

test("rejects simultaneous duplicate images", () => {
  assert.throws(() =>
    assertDistinctDuel({
      left: winner,
      right: winner,
    }),
  );
});
