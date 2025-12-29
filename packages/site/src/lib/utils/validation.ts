/**
 * Validation utilities for pin/exclude constraints
 *
 * These functions validate whether the current pin/exclude configuration
 * is valid for randomization.
 */

/**
 * Validation result type
 */
export type ValidationResult = { ok: true } | { ok: false; message: string };

/**
 * Validate pin constraints
 *
 * We allow pinnedCount === 0 because users may want random selection
 * without any pinned cards.
 *
 * @param pinnedCount - Number of pinned cards
 * @param targetCount - Target number of cards to select
 * @returns Validation result with error message if invalid
 */
export function validatePinConstraints(pinnedCount: number, targetCount: number): ValidationResult {
	// Implementation will be added in GREEN phase
	throw new Error("Not implemented yet");
}

/**
 * Validate exclude constraints
 *
 * We require strict inequality (< not <=) because we need exactly
 * targetCount cards to select from, not just "at least targetCount".
 *
 * @param availableCount - Number of available cards after exclusions
 * @param targetCount - Target number of cards to select
 * @returns Validation result with error message if invalid
 */
export function validateExcludeConstraints(
	availableCount: number,
	targetCount: number,
): ValidationResult {
	// Implementation will be added in GREEN phase
	throw new Error("Not implemented yet");
}
