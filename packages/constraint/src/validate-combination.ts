import type { Constraint, SelectionContext } from "./type";

/**
 * Validates whether a set of constraints can all be applied together.
 * Simulates sequential application: for each constraint, checks canApply
 * on the accumulated context, then applies it. Returns false if any
 * constraint's canApply returns false during simulation.
 */
export function validateCombination(
  constraints: readonly Constraint[],
  context: Readonly<SelectionContext>,
): boolean {
  let current: SelectionContext = { ...context };
  for (const constraint of constraints) {
    if (!constraint.canApply(current)) {
      return false;
    }
    current = constraint.apply(current);
  }
  return true;
}
