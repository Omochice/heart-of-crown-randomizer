/**
 * Custom error for constraint conflicts in card selection.
 * Thrown when required cards are excluded by predicates.
 */
export class ConstraintConflictError<T = unknown> extends Error {
  /**
   * Array of items that caused the conflict
   */
  public readonly conflictingItems: T[];

  /**
   * Creates a new ConstraintConflictError
   * @param message - Error message describing the conflict
   * @param conflictingItems - Items that caused the conflict
   */
  constructor(message: string, conflictingItems: T[]) {
    super(message);
    this.name = "ConstraintConflictError";
    this.conflictingItems = conflictingItems;
  }
}

/**
 * Generic predicate type for filtering
 */
export type Predicate<T> = (item: T) => boolean;

/**
 * Constraint definition for card selection
 */
export interface Constraint<T> {
  /** Array of exclusion predicates (OR logic: any match excludes card) */
  exclude?: Predicate<T>[];
  /** Array of required cards (must be included in result) */
  require?: T[];
}

/**
 * Options for select function
 */
export interface SelectOptions<T> {
  /** Optional seed for deterministic selection */
  seed?: number;
  /** Constraints for card selection */
  constraints?: Constraint<T>;
}

/**
 * Validates constraints for conflicts.
 *
 * @param constraint - Constraint to validate
 * @throws {ConstraintConflictError} If required cards are excluded by predicates
 *
 * @example
 * validateConstraints({
 *   exclude: [card => card.mainType.includes('attack')],
 *   require: [attackCard] // throws error: required card excluded
 * });
 */
export function validateConstraints<T>(
  constraint: Constraint<T> | undefined,
): void {
  if (!constraint || !constraint.require || !constraint.exclude) {
    return;
  }

  const conflictingItems: T[] = [];

  for (const item of constraint.require) {
    const isExcluded = constraint.exclude.some((predicate) => predicate(item));
    if (isExcluded) {
      conflictingItems.push(item);
    }
  }

  if (conflictingItems.length > 0) {
    throw new ConstraintConflictError(
      `Constraint conflict: ${conflictingItems.length} required item(s) are excluded by predicates`,
      conflictingItems,
    );
  }
}
