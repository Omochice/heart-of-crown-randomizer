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
