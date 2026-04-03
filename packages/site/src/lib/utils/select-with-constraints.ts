import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "@heart-of-crown-randomizer/constraint";
import { select } from "@heart-of-crown-randomizer/randomizer";

/**
 * Select cards with constraints.
 *
 * When constraints are provided, they are applied sequentially to a
 * SelectionContext before calling select(). This allows constraints to
 * modify the pool and required cards before random selection occurs.
 *
 * We pass pinnedCards directly to constraints.require rather than
 * filtering them out first, because select() guarantees they appear
 * in the result and this avoids double-filtering.
 */
export function selectWithConstraints(
	allCards: CommonCard[],
	pinnedCards: CommonCard[],
	excludedIds: ReadonlySet<number>,
	count: number,
	constraints?: readonly Constraint[],
): CommonCard[] {
	if (constraints && constraints.length > 0) {
		const filteredPool = allCards.filter((card) => !excludedIds.has(card.id));

		let context: SelectionContext = {
			pool: filteredPool,
			required: [...pinnedCards],
			count,
			rng: Math.random,
		};

		for (const constraint of constraints) {
			if (constraint.canApply(context)) {
				context = constraint.apply(context);
			}
		}

		// Combine required and pool so select() can find required items by reference
		const allItems = [...context.required, ...context.pool];
		return select(allItems, context.count, {
			constraints: {
				require: context.required,
			},
		});
	}

	return select(allCards, count, {
		constraints: {
			require: pinnedCards,
			exclude: [(card) => excludedIds.has(card.id)],
		},
	});
}
