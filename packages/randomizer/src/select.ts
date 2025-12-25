import { shuffle } from "./shuffle";
import type { SelectOptions } from "./constraint";

/**
 * Selects N cards from items with optional constraints.
 *
 * @param items - Array of cards to select from
 * @param count - Number of cards to select
 * @param options - Selection options (seed, constraints)
 * @returns Selected cards array
 * @throws {Error} If required cards are excluded by predicates (conflict)
 * @throws {Error} If seed is invalid (NaN, Infinity)
 *
 * @example
 * const cards = [...allCards];
 * const selected = select(cards, 10, {
 *   seed: 42,
 *   constraints: {
 *     exclude: [card => card.mainType.includes('attack')],
 *     require: [specificCard]
 *   }
 * });
 */
export function select<T>(
	items: T[],
	count: number,
	options?: SelectOptions<T>,
): T[] {
	// Handle empty array
	if (items.length === 0) {
		return [];
	}

	// Handle count = 0
	if (count === 0) {
		return [];
	}

	// Shuffle items with optional seed
	const shuffled = shuffle(items, options?.seed);

	// Select up to count items (or all if count > length)
	return shuffled.slice(0, Math.min(count, shuffled.length));
}
