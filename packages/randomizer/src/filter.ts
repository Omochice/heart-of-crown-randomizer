/**
 * Filters items by predicate (keeps items where predicate returns true).
 *
 * @param items - Array to filter
 * @param predicate - Filter function (true = keep)
 * @returns New filtered array
 *
 * @example
 * const nonAttackCards = filter(cards, card => !card.mainType.includes('attack'));
 */
export function filter<T>(items: T[], predicate: (item: T) => boolean): T[] {
	return items.filter(predicate);
}

/**
 * Filters out items with specified IDs.
 *
 * @param items - Array with id property
 * @param excludedIds - IDs to exclude
 * @returns New filtered array
 *
 * @example
 * const filtered = filterByIds(cards, [1, 5, 10]); // excludes cards with id 1, 5, 10
 */
export function filterByIds<T extends { id: number }>(
	items: T[],
	excludedIds: number[],
): T[] {
	return items.filter((item) => !excludedIds.includes(item.id));
}
