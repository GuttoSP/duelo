export type DuelSide = "left" | "right";

export type SideDuel<T extends { id: string }> = {
  left: T;
  right: T;
};

export function placeWinnerOnSide<T extends { id: string }>(
  nextDuel: SideDuel<T>,
  winner: T,
  targetSide: DuelSide,
): SideDuel<T> {
  const nextWinner =
    nextDuel.left.id === winner.id
      ? nextDuel.left
      : nextDuel.right.id === winner.id
        ? nextDuel.right
        : winner;
  const challenger =
    nextDuel.left.id !== winner.id ? nextDuel.left : nextDuel.right;

  if (challenger.id === nextWinner.id) {
    throw new Error("Duel cannot show the same image on both sides");
  }

  return targetSide === "left"
    ? { left: nextWinner, right: challenger }
    : { left: challenger, right: nextWinner };
}

export function assertDistinctDuel<T extends { id: string }>(
  duel: SideDuel<T>,
): SideDuel<T> {
  if (duel.left.id === duel.right.id) {
    throw new Error("Duel cannot show the same image on both sides");
  }

  return duel;
}

export function randomSide(): DuelSide {
  return Math.random() < 0.5 ? "left" : "right";
}
