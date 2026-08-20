/** Shared scoring for similar-media suggestions (category overlap + popularity + recency). */

const CATEGORY_WEIGHT = 12;
const VIEW_WEIGHT = 2.2;
const LIKE_WEIGHT = 3.5;
const RECENCY_WEIGHT = 1.5;
const RECENCY_HALF_LIFE_DAYS = 45;

export interface ISuggestionCandidate {
  readonly id: number;
  readonly like: number;
  readonly view: number;
  readonly createdAt: Date;
  readonly categories: ReadonlyArray<{ categoryId: number }>;
}

export function scoreSuggestionCandidate(
  candidate: ISuggestionCandidate,
  sourceCategoryIds: ReadonlySet<number>,
  now = Date.now(),
): number {
  const overlap = candidate.categories.reduce(
    (count, item) => (sourceCategoryIds.has(item.categoryId) ? count + 1 : count),
    0,
  );

  const ageDays = Math.max(
    0,
    (now - candidate.createdAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  const recencyBoost = Math.exp(-ageDays / RECENCY_HALF_LIFE_DAYS);

  return (
    overlap * CATEGORY_WEIGHT +
    Math.log1p(candidate.view) * VIEW_WEIGHT +
    Math.log1p(candidate.like) * LIKE_WEIGHT +
    recencyBoost * RECENCY_WEIGHT
  );
}

export function rankSuggestionCandidates<T extends ISuggestionCandidate>(
  candidates: ReadonlyArray<T>,
  sourceCategoryIds: ReadonlyArray<number>,
  limit: number,
): T[] {
  const sourceSet = new Set(sourceCategoryIds);
  const now = Date.now();

  return [...candidates]
    .map((candidate) => ({
      candidate,
      score: scoreSuggestionCandidate(candidate, sourceSet, now),
    }))
    .sort((a, b) => b.score - a.score || b.candidate.createdAt.getTime() - a.candidate.createdAt.getTime())
    .slice(0, limit)
    .map((item) => item.candidate);
}
