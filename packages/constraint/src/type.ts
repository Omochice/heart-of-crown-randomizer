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
 * Snapshot passed to {@link Constraint.filterPoolForNextPick} on every
 * iterative pick so the constraint can narrow the candidate pool.
 */
export type PickContext = {
  /** Cards already selected (required + previously picked). */
  readonly picked: readonly CommonCard[];
  /** Current candidate pool before filtering. */
  readonly pool: readonly CommonCard[];
  /** Number of cards still to be picked (including the current pick). */
  readonly remainingCount: number;
};

/**
 * A constraint that influences the card selection process.
 *
 * The three-method interface supports a constructive selection approach:
 * - `canApply` checks whether the constraint is applicable given the current context
 * - `apply` transforms the context to enforce the constraint (e.g., moving cards from pool to required)
 * - `isSatisfied` validates whether a final selection meets the constraint
 *
 * Constraints that depend on the balance between card categories (e.g.
 * link-2 >= link-0) can additionally implement `filterPoolForNextPick` to
 * narrow the pool on every iterative pick instead of pre-trimming it.
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
  /**
   * Narrow the candidate pool for the next iterative pick.
   *
   * Called once per pick during iterative selection. Return a subset of
   * `context.pool` that keeps the constraint satisfiable for the remaining
   * picks. If not implemented, the constraint does not need dynamic pool
   * filtering and relies solely on `apply`.
   */
  filterPoolForNextPick?(context: Readonly<PickContext>): CommonCard[];
};
