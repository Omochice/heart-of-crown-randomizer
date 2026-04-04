import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "@heart-of-crown-randomizer/constraint";
import { select } from "@heart-of-crown-randomizer/randomizer";

/**
 * Select cards with constraints.
 *
 * Exclusion filtering and constraint application use a single code path
 * so that required cards from constraints are always correctly passed
 * through to select().
 */
export function selectWithConstraints(
	allCards: CommonCard[],
	pinnedCards: CommonCard[],
	excludedIds: ReadonlySet<number>,
	count: number,
	constraints?: readonly Constraint[],
): CommonCard[] {
	const pinnedIds = new Set(pinnedCards.map((c) => c.id));
	const filteredPool = allCards.filter(
		(card) => !excludedIds.has(card.id) && !pinnedIds.has(card.id),
	);

	let context: SelectionContext = {
		pool: filteredPool,
		required: [...pinnedCards],
		count,
		rng: Math.random,
	};

	if (constraints) {
		for (const constraint of constraints) {
			if (constraint.canApply(context)) {
				context = constraint.apply(context);
			}
		}
	}

	const allItems = [...context.required, ...context.pool];
	return select(allItems, context.count, {
		constraints: {
			require: context.required,
		},
	});
}
