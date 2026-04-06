import type { Constraint } from "@heart-of-crown-randomizer/constraint";

/**
 * We reassign the entire Set rather than mutating because Svelte 5's
 * $state proxy does not reliably propagate Set mutations to $derived
 * in other modules.
 */
const state = $state({
	enabledIds: new Set<number>(),
});

/** Get the set of currently enabled constraint IDs. */
export function getEnabledConstraintIds(): ReadonlySet<number> {
	return state.enabledIds;
}

/** Toggle a constraint on/off by ID. */
export function toggleConstraint(id: number): void {
	const next = new Set(state.enabledIds);
	if (next.has(id)) {
		next.delete(id);
	} else {
		next.add(id);
	}
	state.enabledIds = next;
}

/** Bulk-set the enabled constraint IDs (for URL restore). */
export function setEnabledConstraintIds(ids: ReadonlySet<number>): void {
	state.enabledIds = new Set(ids);
}

/** Get the enabled Constraint objects from a list of all available constraints. */
export function getEnabledConstraints(allConstraints: readonly Constraint[]): Constraint[] {
	return allConstraints.filter((c) => state.enabledIds.has(c.id));
}
