import { describe, expect, it } from "vitest";
import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

/**
 * Function extracted from +page.svelte for testing
 * This is the CURRENT (buggy) implementation
 */
function restoreCardsFromUrl_BUGGY(cardIds: string[]): CommonCard[] {
	return cardIds
		.map((id) => Basic.commons.find((c) => c.id === Number.parseInt(id)))
		.filter(Boolean) as CommonCard[];
}

/**
 * FIXED implementation that searches both card sets
 */
function restoreCardsFromUrl_FIXED(cardIds: string[]): CommonCard[] {
	const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
	return cardIds
		.map((id) => allCommons.find((c) => c.id === Number.parseInt(id)))
		.filter(Boolean) as CommonCard[];
}

describe("Card restoration from URL parameters", () => {
	describe("BUGGY implementation", () => {
		it("should restore Basic cards correctly", () => {
			const cardIds = ["17", "18", "19"]; // Basic cards start from ID 17
			const restored = restoreCardsFromUrl_BUGGY(cardIds);

			expect(restored).toHaveLength(3);
			expect(restored.every((card) => card.edition === 0)).toBe(true); // Basic edition
		});

		it("BUG: fails to restore Far Eastern Border cards", () => {
			const cardIds = ["49", "50", "51"];
			const restored = restoreCardsFromUrl_BUGGY(cardIds);

			// 🐛 BUG: Returns empty array instead of 3 cards
			expect(restored).toHaveLength(0); // Documents the bug
		});

		it("BUG: only restores Basic cards from mixed set", () => {
			const cardIds = ["17", "18", "49", "50"]; // Mix of Basic and Far Eastern Border
			const restored = restoreCardsFromUrl_BUGGY(cardIds);

			// 🐛 BUG: Only restores 2 Basic cards, ignores Far Eastern Border
			expect(restored).toHaveLength(2); // Should be 4
			expect(restored.every((card) => card.edition === 0)).toBe(true);
		});
	});

	describe("FIXED implementation", () => {
		it("should restore Basic cards correctly", () => {
			const cardIds = ["17", "18", "19"]; // Basic cards start from ID 17
			const restored = restoreCardsFromUrl_FIXED(cardIds);

			expect(restored).toHaveLength(3);
			expect(restored.every((card) => card.edition === 0)).toBe(true);
		});

		it("should restore Far Eastern Border cards correctly", () => {
			const cardIds = ["49", "50", "51"];
			const restored = restoreCardsFromUrl_FIXED(cardIds);

			// ✅ FIXED: Returns all 3 Far Eastern Border cards
			expect(restored).toHaveLength(3);
			expect(restored.every((card) => card.edition === 1)).toBe(true); // Far Eastern Border edition
		});

		it("should restore mixed Basic and Far Eastern Border cards", () => {
			const cardIds = ["17", "18", "49", "50"]; // Mix of Basic and Far Eastern Border
			const restored = restoreCardsFromUrl_FIXED(cardIds);

			// ✅ FIXED: Returns all 4 cards
			expect(restored).toHaveLength(4);

			const basicCards = restored.filter((card) => card.edition === 0);
			const farEasternCards = restored.filter((card) => card.edition === 1);

			expect(basicCards).toHaveLength(2);
			expect(farEasternCards).toHaveLength(2);
		});

		it("should handle invalid card IDs gracefully", () => {
			const cardIds = ["17", "999", "49"]; // 999 doesn't exist
			const restored = restoreCardsFromUrl_FIXED(cardIds);

			// Should return only valid cards (17 and 49)
			expect(restored).toHaveLength(2);
		});

		it("should handle empty input", () => {
			const cardIds: string[] = [];
			const restored = restoreCardsFromUrl_FIXED(cardIds);

			expect(restored).toHaveLength(0);
		});
	});
});
