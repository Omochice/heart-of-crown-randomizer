import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { select } from "@heart-of-crown-randomizer/randomizer";

/**
 * Select cards with constraints
 *
 * We pass pinnedCards directly to constraints.require rather than
 * filtering them out first, because select() guarantees they appear
 * in the result and this avoids double-filtering.
 */
export function selectWithConstraints(
	allCards: CommonCard[],
	pinnedCards: CommonCard[],
	excludedIds: Set<number>,
	count: number,
): CommonCard[] {
	return select(allCards, count, {
		constraints: {
			require: pinnedCards,
			exclude: [(card) => excludedIds.has(card.id)],
		},
	});
}
