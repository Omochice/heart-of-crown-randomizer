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
	if (pinnedCount > targetCount) {
		const cardsToRemove = pinnedCount - targetCount;
		return {
			ok: false,
			message: `ピンされたカードが多すぎます（${pinnedCount}/${targetCount}）。ピンを${cardsToRemove}枚解除してください。`,
		};
	}
	return { ok: true };
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
	if (availableCount < targetCount) {
		const exclusionsToRemove = targetCount - availableCount;
		return {
			ok: false,
			message: `除外により選択可能なカードが不足しています（${availableCount}/${targetCount}）。除外を${exclusionsToRemove}枚解除してください。`,
		};
	}
	return { ok: true };
}
