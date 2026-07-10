export type RatingInput = {
  rating: number;
  uncertainty?: number;
};

export type RatingResult = {
  winnerRating: number;
  loserRating: number;
  delta: number;
};

const DEFAULT_K = 32;

export function expectedScore(a: number, b: number) {
  return 1 / (1 + 10 ** ((b - a) / 400));
}

export function applyElo(
  winner: RatingInput,
  loser: RatingInput,
  k = DEFAULT_K,
): RatingResult {
  const winnerExpected = expectedScore(winner.rating, loser.rating);
  const uncertaintyBoost =
    ((winner.uncertainty ?? 200) + (loser.uncertainty ?? 200)) / 700;
  const adjustedK = k * Math.max(0.75, Math.min(1.6, uncertaintyBoost));
  const delta = adjustedK * (1 - winnerExpected);

  return {
    winnerRating: Math.round((winner.rating + delta) * 10) / 10,
    loserRating: Math.round((loser.rating - delta) * 10) / 10,
    delta: Math.round(delta * 10) / 10,
  };
}

export function normalizeOrientation(
  value?: string | null,
): "PORTRAIT" | "LANDSCAPE" | "SQUARE" | undefined {
  const normalized = value?.toUpperCase();

  if (
    normalized === "PORTRAIT" ||
    normalized === "LANDSCAPE" ||
    normalized === "SQUARE"
  ) {
    return normalized;
  }

  return undefined;
}
