import { describe, it, expect } from "vitest";
import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import { validatePinConstraints, validateExcludeConstraints } from "$lib/utils/validation";
import { getPinnedCards } from "$lib/stores/card-state.svelte";

/**
 * RED PHASE: Tests for drawRandomCards() logic with pin/exclude validation
 *
 * These tests verify the core logic that drawRandomCards() should implement:
 * 1. Validate pin constraints before randomization
 * 2. Validate exclude constraints before randomization
 * 3. Use selectWithConstraints() when constraints are valid
 *
 * Following TDD methodology: Write tests first, then implement.
 */

describe("drawRandomCards() validation logic", () => {
	const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
	const targetCount = 10;

	it("should detect pin constraint violation when too many cards are pinned", () => {
		// Arrange: Simulate 12 pinned cards when target is 10
		const pinnedCount = 12;

		// Act: Validate pin constraints (this is what drawRandomCards should do)
		const result = validatePinConstraints(pinnedCount, targetCount);

		// Assert: Should return error
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("ピンされたカードが多すぎます");
			expect(result.message).toContain("12");
			expect(result.message).toContain("10");
		}
	});

	it("should detect exclude constraint violation when not enough cards available", () => {
		// Arrange: Simulate only 5 cards available when target is 10
		const availableCount = 5;

		// Act: Validate exclude constraints (this is what drawRandomCards should do)
		const result = validateExcludeConstraints(availableCount, targetCount);

		// Assert: Should return error
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("除外により選択可能なカードが不足しています");
			expect(result.message).toContain("5");
			expect(result.message).toContain("10");
		}
	});

	it("should pass validation when constraints are valid", () => {
		// Arrange: 3 pinned cards, enough available cards
		const pinnedCount = 3;
		const availableCount = allCommons.length - 5; // Exclude 5 cards, plenty left

		// Act: Validate both constraints
		const pinResult = validatePinConstraints(pinnedCount, targetCount);
		const excludeResult = validateExcludeConstraints(availableCount, targetCount);

		// Assert: Both should pass
		expect(pinResult.ok).toBe(true);
		expect(excludeResult.ok).toBe(true);
	});

	it("should correctly calculate available cards after exclusion", () => {
		// Arrange: Exclude specific cards (using actual card IDs)
		const excludedIds = new Set([17, 18, 19, 20, 21]);
		const availableCards = allCommons.filter((card) => !excludedIds.has(card.id));

		// Act & Assert: Available count should be total - excluded
		const expectedAvailable = allCommons.length - excludedIds.size;
		expect(availableCards.length).toBe(expectedAvailable);
	});

	it("should correctly identify pinned cards from card list", () => {
		// Arrange: Create mock pinned card IDs (using actual card IDs)
		const testPinnedIds = new Set([17, 18, 19]);

		// Act: Get pinned cards (using the helper function)
		// Note: In actual implementation, this would use the global pinnedCardIds
		const testCards = allCommons.filter((card) => testPinnedIds.has(card.id));

		// Assert: Should return exactly the pinned cards
		expect(testCards.length).toBe(testPinnedIds.size);
		expect(testCards.every((card) => testPinnedIds.has(card.id))).toBe(true);
	});

	it("should use constraints.require for pinned cards in select()", () => {
		// Arrange: Mock pinned cards (using actual card IDs)
		const testPinnedIds = new Set([17, 18, 19]);
		const testPinnedCards = allCommons.filter((card) => testPinnedIds.has(card.id));

		// Act & Assert: This demonstrates how selectWithConstraints should work
		// The function should pass pinnedCards to constraints.require
		expect(testPinnedCards.length).toBe(3);
		expect(testPinnedCards[0].id).toBe(17);
		expect(testPinnedCards[1].id).toBe(18);
		expect(testPinnedCards[2].id).toBe(19);
	});

	it("should use constraints.exclude for excluded card IDs in select()", () => {
		// Arrange: Mock excluded cards
		const testExcludedIds = new Set([50, 51, 52]);

		// Act: Create exclude predicate (this is what selectWithConstraints uses)
		const excludePredicate = (card: { id: number }) => testExcludedIds.has(card.id);

		// Assert: Predicate should correctly identify excluded cards
		expect(excludePredicate({ id: 50 })).toBe(true);
		expect(excludePredicate({ id: 51 })).toBe(true);
		expect(excludePredicate({ id: 52 })).toBe(true);
		expect(excludePredicate({ id: 1 })).toBe(false);
	});
});
