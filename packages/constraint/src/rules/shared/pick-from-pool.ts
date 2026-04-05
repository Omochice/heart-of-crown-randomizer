import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { SelectionContext } from "../../type";

/**
 * Pick n cards matching predicate from pool using Fisher-Yates partial shuffle.
 *
 * Fisher-Yates is used instead of sort-based shuffling because it provides
 * uniform distribution with O(n) swaps and avoids sort comparison bias.
 */
export function pickFromPool(
  context: SelectionContext,
  predicate: (card: CommonCard) => boolean,
  n: number,
): SelectionContext {
  const candidates: { index: number; card: CommonCard }[] = [];
  for (let i = 0; i < context.pool.length; i++) {
    if (predicate(context.pool[i])) {
      candidates.push({ index: i, card: context.pool[i] });
    }
  }

  const pickCount = Math.min(n, candidates.length);
  for (
    let i = candidates.length - 1;
    i > candidates.length - 1 - pickCount;
    i--
  ) {
    const j = Math.floor(context.rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const picked = candidates.slice(candidates.length - pickCount);
  const pickedIndices = new Set(picked.map((p) => p.index));

  return {
    ...context,
    pool: context.pool.filter((_, i) => !pickedIndices.has(i)),
    required: [...context.required, ...picked.map((p) => p.card)],
  };
}
