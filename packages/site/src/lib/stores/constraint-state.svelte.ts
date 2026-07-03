import type { Constraint } from "@heart-of-crown-randomizer/constraint";
import { SvelteSet } from "svelte/reactivity";

/**
 * We use SvelteSet rather than a plain Set inside a $state proxy because
 * the proxy does not propagate Set mutations to $derived in other
 * modules; SvelteSet makes those mutations observable directly.
 */
const enabledIds = new SvelteSet<number>();

/** Get the set of currently enabled constraint IDs. */
export function getEnabledConstraintIds(): ReadonlySet<number> {
  return enabledIds;
}

/** Toggle a constraint on/off by ID. */
export function toggleConstraint(id: number): void {
  if (enabledIds.has(id)) {
    enabledIds.delete(id);
  } else {
    enabledIds.add(id);
  }
}

/** Bulk-set the enabled constraint IDs (for URL restore). */
export function setEnabledConstraintIds(ids: ReadonlySet<number>): void {
  enabledIds.clear();
  for (const id of ids) {
    enabledIds.add(id);
  }
}

/** Get the enabled Constraint objects from a list of all available constraints. */
export function getEnabledConstraints(
  allConstraints: readonly Constraint[],
): Constraint[] {
  return allConstraints.filter((c) => enabledIds.has(c.id));
}
