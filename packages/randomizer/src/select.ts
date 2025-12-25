import { shuffle } from "./shuffle";
import { validateConstraints } from "./constraint";
import type { SelectOptions } from "./constraint";

/**
 * Selects a specified number of items from an array with optional constraints.
 *
 * This function supports:
 * - Deterministic selection via seed for reproducible results
 * - Exclusion of items matching predicates (OR logic)
 * - Required items that must be included in the result
 *
 * When both exclusion and required constraints are specified, the function validates
 * that required items are not excluded by predicates before selection.
 *
 * @template T - The type of items in the array
 * @param items - Array of items to select from (not mutated)
 * @param count - Number of items to select. If count > available items after filtering, returns all available items
 * @param options - Optional selection configuration
 * @param options.seed - Optional seed for deterministic selection (same seed produces same result)
 * @param options.constraints - Optional constraints for selection
 * @param options.constraints.exclude - Array of predicates; items matching ANY predicate are excluded (OR logic)
 * @param options.constraints.require - Array of items that must be included in the result
 * @returns Array of selected items. If required items count >= count, returns only required items
 * @throws {ConstraintConflictError} If required items are excluded by predicates
 * @throws {Error} If seed is invalid (NaN or Infinity)
 *
 * @example
 * // Basic selection with seed
 * const items = [1, 2, 3, 4, 5];
 * const result = select(items, 3, { seed: 42 });
 *
 * @example
 * // Selection with exclusion constraints
 * const cards = [...allCards];
 * const result = select(cards, 10, {
 *   constraints: {
 *     exclude: [
 *       card => card.type === 'attack',
 *       card => card.cost > 5
 *     ]
 *   }
 * });
 *
 * @example
 * // Selection with required items
 * const result = select(cards, 10, {
 *   seed: 42,
 *   constraints: {
 *     exclude: [card => card.type === 'attack'],
 *     require: [specificCard1, specificCard2]
 *   }
 * });
 */
export function select<T>(
	items: T[],
	count: number,
	options?: SelectOptions<T>,
): T[] {
	// Edge case: empty input array
	if (items.length === 0) {
		return [];
	}

	// Edge case: zero count requested
	if (count === 0) {
		return [];
	}

	// Validate constraint conflicts before processing
	validateConstraints(options?.constraints);

	const requiredItems = options?.constraints?.require ?? [];
	const excludePredicates = options?.constraints?.exclude;

	// Apply exclusion filters if specified
	// Why not AND logic: We want to exclude items matching ANY predicate (more flexible filtering)
	const filteredItems = applyExclusionFilters(items, excludePredicates);

	// Edge case: required items count meets or exceeds requested count
	if (requiredItems.length >= count) {
		return requiredItems;
	}

	// Remove required items from pool to avoid duplicates
	// Why not shuffle all items then remove required: Required items must be guaranteed first
	const selectionPool = filteredItems.filter(
		(item) => !requiredItems.includes(item),
	);

	// Shuffle selection pool and select items to fill remaining slots
	const shuffledPool = shuffle(selectionPool, options?.seed);
	const remainingSlots = count - requiredItems.length;
	const selectedItems = shuffledPool.slice(
		0,
		Math.min(remainingSlots, shuffledPool.length),
	);

	// Combine required items (guaranteed) with selected items (randomized)
	return [...requiredItems, ...selectedItems];
}

/**
 * Applies exclusion predicates to filter items (OR logic).
 *
 * @param items - Array of items to filter
 * @param excludePredicates - Array of predicates; items matching ANY predicate are excluded
 * @returns Filtered array with excluded items removed
 */
function applyExclusionFilters<T>(
	items: T[],
	excludePredicates?: Array<(item: T) => boolean>,
): T[] {
	if (!excludePredicates || excludePredicates.length === 0) {
		return items;
	}

	return items.filter((item) => {
		return !excludePredicates.some((predicate) => predicate(item));
	});
}
