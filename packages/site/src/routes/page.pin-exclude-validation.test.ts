import { describe, it, expect } from "vitest";
import { validatePinConstraints, validateExcludeConstraints } from "$lib/utils/validation";

/**
 * RED PHASE: Tests for pin/exclude validation functions
 *
 * These tests will fail initially because the implementations throw errors.
 * Following TDD methodology: Write tests first, then implement.
 */

describe("validatePinConstraints", () => {
	it("should return ok when pinned count is less than target count", () => {
		const result = validatePinConstraints(3, 10);

		expect(result.ok).toBe(true);
	});

	it("should return ok when pinned count equals target count", () => {
		const result = validatePinConstraints(10, 10);

		expect(result.ok).toBe(true);
	});

	it("should return ok when pinned count is zero", () => {
		// We allow pinnedCount === 0 because users may want random selection
		// without any pinned cards.
		const result = validatePinConstraints(0, 10);

		expect(result.ok).toBe(true);
	});

	it("should return error when pinned count exceeds target count", () => {
		const result = validatePinConstraints(12, 10);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("ピンされたカードが多すぎます");
			expect(result.message).toContain("12");
			expect(result.message).toContain("10");
			expect(result.message).toContain("2"); // Should suggest removing 2 cards
		}
	});

	it("should calculate correct number of cards to remove in error message", () => {
		const result = validatePinConstraints(15, 10);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("5"); // 15 - 10 = 5 cards to remove
		}
	});
});

describe("validateExcludeConstraints", () => {
	it("should return ok when available count exceeds target count", () => {
		const result = validateExcludeConstraints(20, 10);

		expect(result.ok).toBe(true);
	});

	it("should return ok when available count equals target count", () => {
		const result = validateExcludeConstraints(10, 10);

		expect(result.ok).toBe(true);
	});

	it("should return error when available count is less than target count", () => {
		// We require strict inequality (< not <=) because we need exactly
		// targetCount cards to select from, not just "at least targetCount".
		const result = validateExcludeConstraints(5, 10);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("除外により選択可能なカードが不足しています");
			expect(result.message).toContain("5");
			expect(result.message).toContain("10");
			expect(result.message).toContain("5"); // Should suggest removing 5 exclusions
		}
	});

	it("should calculate correct number of exclusions to remove in error message", () => {
		const result = validateExcludeConstraints(3, 10);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("7"); // 10 - 3 = 7 exclusions to remove
		}
	});

	it("should return error when available count is zero", () => {
		const result = validateExcludeConstraints(0, 10);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("0");
			expect(result.message).toContain("10");
		}
	});
});
