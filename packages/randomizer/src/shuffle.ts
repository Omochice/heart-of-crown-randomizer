import { createRNG } from "./rng";

/**
 * Shuffles array using Fisher-Yates algorithm with optional seed for deterministic results.
 *
 * @param items - Array to shuffle (not mutated)
 * @param seed - Optional seed for deterministic randomization
 * @returns New shuffled array
 * @throws {Error} If seed is NaN or Infinity
 *
 * @example
 * const cards = [1, 2, 3, 4, 5];
 * const shuffled = shuffle(cards, 42); // deterministic
 * const random = shuffle(cards);       // non-deterministic
 */
export function shuffle<T>(items: T[], seed?: number): T[] {
  // Validate seed if provided
  if (seed !== undefined && !Number.isFinite(seed)) {
    throw new Error("Invalid seed: seed must be a finite number");
  }

  // Handle empty array
  if (items.length === 0) {
    return [];
  }

  // Handle single element
  if (items.length === 1) {
    return [items[0]];
  }

  // Create new array to preserve immutability
  const result = [...items];

  // Create RNG
  const rng = createRNG(seed);

  // Fisher-Yates shuffle (modern algorithm, reverse direction)
  // Why reverse: better cache locality, avoids redundant swap
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
