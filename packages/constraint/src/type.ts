import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

/**
 * The current state of the card selection process.
 *
 * Constraints receive and transform this context to influence which cards
 * are selected. The `pool` contains available cards, `required` holds cards
 * that must appear in the final selection, and `rng` provides a source of
 * randomness for deterministic testing.
 */
export type SelectionContext = {
  pool: CommonCard[];
  required: CommonCard[];
  count: number;
  rng: () => number;
};

/**
 * A constraint that influences the card selection process.
 *
 * The three-method interface supports a constructive selection approach:
 * - `canApply` checks whether the constraint is applicable given the current context
 * - `apply` transforms the context to enforce the constraint (e.g., moving cards from pool to required)
 * - `isSatisfied` validates whether a final selection meets the constraint
 */
export type Constraint = {
  /** Unique numeric identifier for this constraint, used for rendering order. */
  readonly id: number;
  /** Human-readable label for display in the UI. */
  readonly label: string;
  /** Determine whether this constraint can be applied to the given context. */
  canApply(context: Readonly<SelectionContext>): boolean;
  /** Transform the selection context to enforce this constraint. */
  apply(context: SelectionContext): SelectionContext;
  /** Check whether a final set of selected cards satisfies this constraint. */
  isSatisfied(cards: readonly CommonCard[]): boolean;
};
