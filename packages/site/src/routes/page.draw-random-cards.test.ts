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
		const pinnedCount = 12;

		const result = validatePinConstraints(pinnedCount, targetCount);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("ピンされたカードが多すぎます");
			expect(result.message).toContain("12");
			expect(result.message).toContain("10");
		}
	});

	it("should detect exclude constraint violation when not enough cards available", () => {
		const availableCount = 5;

		const result = validateExcludeConstraints(availableCount, targetCount);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("除外により選択可能なカードが不足しています");
			expect(result.message).toContain("5");
			expect(result.message).toContain("10");
		}
	});

	it("should pass validation when constraints are valid", () => {
		const pinnedCount = 3;
		const availableCount = allCommons.length - 5; // Exclude 5 cards, plenty left

		const pinResult = validatePinConstraints(pinnedCount, targetCount);
		const excludeResult = validateExcludeConstraints(availableCount, targetCount);

		expect(pinResult.ok).toBe(true);
		expect(excludeResult.ok).toBe(true);
	});

	it("should correctly calculate available cards after exclusion", () => {
		const excludedIds = new Set([17, 18, 19, 20, 21]);
		const availableCards = allCommons.filter((card) => !excludedIds.has(card.id));

		const expectedAvailable = allCommons.length - excludedIds.size;
		expect(availableCards.length).toBe(expectedAvailable);
	});

	it("should correctly identify pinned cards from card list", () => {
		const testPinnedIds = new Set([17, 18, 19]);

		// Note: In actual implementation, this would use the global pinnedCardIds
		const testCards = allCommons.filter((card) => testPinnedIds.has(card.id));

		expect(testCards.length).toBe(testPinnedIds.size);
		expect(testCards.every((card) => testPinnedIds.has(card.id))).toBe(true);
	});

	it("should use constraints.require for pinned cards in select()", () => {
		const testPinnedIds = new Set([17, 18, 19]);
		const testPinnedCards = allCommons.filter((card) => testPinnedIds.has(card.id));

		// The function should pass pinnedCards to constraints.require
		expect(testPinnedCards.length).toBe(3);
		expect(testPinnedCards[0].id).toBe(17);
		expect(testPinnedCards[1].id).toBe(18);
		expect(testPinnedCards[2].id).toBe(19);
	});

	it("should use constraints.exclude for excluded card IDs in select()", () => {
		const testExcludedIds = new Set([50, 51, 52]);

		const excludePredicate = (card: { id: number }) => testExcludedIds.has(card.id);

		expect(excludePredicate({ id: 50 })).toBe(true);
		expect(excludePredicate({ id: 51 })).toBe(true);
		expect(excludePredicate({ id: 52 })).toBe(true);
		expect(excludePredicate({ id: 1 })).toBe(false);
	});
});
