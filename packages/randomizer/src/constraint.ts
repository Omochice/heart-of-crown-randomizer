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
