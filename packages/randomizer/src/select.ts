import { shuffle } from "./shuffle";
import { validateConstraints } from "./constraint";
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
	if (items.length === 0) {
		return [];
	}

	if (count === 0) {
		return [];
	}

	validateConstraints(options?.constraints);

	const requiredCards = options?.constraints?.require ?? [];

	let availableItems = items;
	const excludePredicates = options?.constraints?.exclude;
	if (excludePredicates && excludePredicates.length > 0) {
		// Why not AND logic: We want to exclude items matching ANY predicate (more flexible filtering)
		availableItems = items.filter((item) => {
			return !excludePredicates.some((predicate) => predicate(item));
		});
	}

	if (requiredCards.length >= count) {
		return requiredCards;
	}

	// Why not shuffle all items then remove required: Required cards must be guaranteed first
	const availableWithoutRequired = availableItems.filter(
		(item) => !requiredCards.includes(item),
	);

	const shuffled = shuffle(availableWithoutRequired, options?.seed);
	const remainingSlots = count - requiredCards.length;
	const selectedFromPool = shuffled.slice(
		0,
		Math.min(remainingSlots, shuffled.length),
	);

	return [...requiredCards, ...selectedFromPool];
}
