import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "@heart-of-crown-randomizer/constraint";
import { createRNG, select } from "@heart-of-crown-randomizer/randomizer";

/**
 * Pick cards one at a time, narrowing the candidate pool on each pick
 * via constraints that implement filterPoolForNextPick.
 *
 * One-shot select() cannot enforce constraints that depend on the
 * composition of already-picked cards (e.g. link2 >= link0), because
 * the entire selection is drawn at once. Iterative selection solves
 * this by re-evaluating the pool before every pick.
 */
function iterativeSelect(
	context: SelectionContext,
	dynamicConstraints: readonly Constraint[],
): CommonCard[] {
	const picked = [...context.required];
	let pool = [...context.pool];

	while (picked.length < context.count && pool.length > 0) {
		const remaining = context.count - picked.length;

		let available: readonly CommonCard[] = pool;
		for (const constraint of dynamicConstraints) {
			available =
				constraint.filterPoolForNextPick?.({
					picked,
					pool: available,
					remainingCount: remaining,
				}) ?? available;
		}

		// Fallback: when every constraint filters the pool to empty, pick
		// from the unfiltered pool so the caller always receives count cards.
		// This prefers a partial constraint violation over returning fewer
		// cards than requested, which would break UI expectations.
		if (available.length === 0) {
			available = pool;
		}

		const idx = Math.floor(context.rng() * available.length);
		const card = available[idx];
		picked.push(card);
		pool = pool.filter((c) => c !== card);
	}

	return picked;
}

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
		rng: createRNG(),
	};

	if (constraints) {
		for (const constraint of constraints) {
			if (constraint.canApply(context)) {
				context = constraint.apply(context);
			}
		}
	}

	const dynamicConstraints = constraints
		? constraints.filter((c) => c.filterPoolForNextPick != null)
		: [];

	if (dynamicConstraints.length > 0) {
		return iterativeSelect(context, dynamicConstraints);
	}

	const allItems = [...context.required, ...context.pool];
	return select(allItems, context.count, {
		constraints: {
			require: context.required,
		},
	});
}
