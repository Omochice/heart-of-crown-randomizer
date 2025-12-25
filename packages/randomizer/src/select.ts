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
	// Handle empty array
	if (items.length === 0) {
		return [];
	}

	// Handle count = 0
	if (count === 0) {
		return [];
	}

	// Validate constraints for conflicts
	validateConstraints(options?.constraints);

	// Get required cards
	const requiredCards = options?.constraints?.require ?? [];

	// Apply exclusion constraints
	let availableItems = items;
	const excludePredicates = options?.constraints?.exclude;
	if (excludePredicates && excludePredicates.length > 0) {
		// OR logic: exclude item if ANY predicate returns true
		availableItems = items.filter((item) => {
			return !excludePredicates.some((predicate) => predicate(item));
		});
	}

	// If required cards count >= requested count, return required cards only
	if (requiredCards.length >= count) {
		return requiredCards;
	}

	// Remove required cards from available items to avoid duplicates
	const availableWithoutRequired = availableItems.filter(
		(item) => !requiredCards.includes(item),
	);

	// Shuffle available items (excluding required) with optional seed
	const shuffled = shuffle(availableWithoutRequired, options?.seed);

	// Calculate remaining slots after required cards
	const remainingSlots = count - requiredCards.length;

	// Select remaining cards from shuffled pool
	const selectedFromPool = shuffled.slice(
		0,
		Math.min(remainingSlots, shuffled.length),
	);

	// Combine required cards with randomly selected cards
	return [...requiredCards, ...selectedFromPool];
}
