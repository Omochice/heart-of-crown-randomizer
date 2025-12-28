import { describe, it, expect, beforeEach } from "vitest";
import {
	getCardState,
	togglePin,
	toggleExclude,
	getPinnedCards,
	getExcludedCards,
	pinnedCardIds,
	excludedCardIds,
} from "./card-state.svelte";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

// Test helper: create mock CommonCard
function createMockCard(id: number): CommonCard {
	return {
		id,
		name: `Card ${id}`,
		cost: 3,
		type: "common",
		edition: 0,
		category: "test",
		action: "",
	};
}

describe("CardState", () => {
	beforeEach(() => {
		// Reset state before each test
		pinnedCardIds.clear();
		excludedCardIds.clear();
	});

	describe("getCardState", () => {
		it("should return 'normal' for unpinned and unexcluded card", () => {
			expect(getCardState(1)).toBe("normal");
		});

		it("should return 'pinned' for pinned card", () => {
			pinnedCardIds.add(1);
			expect(getCardState(1)).toBe("pinned");
		});

		it("should return 'excluded' for excluded card", () => {
			excludedCardIds.add(1);
			expect(getCardState(1)).toBe("excluded");
		});

		it("should prioritize pinned over excluded when both exist", () => {
			// This should not happen in normal usage, but test the precedence
			pinnedCardIds.add(1);
			excludedCardIds.add(1);
			expect(getCardState(1)).toBe("pinned");
		});
	});

	describe("togglePin", () => {
		it("should add card to pinnedCardIds when unpinned", () => {
			togglePin(1);
			expect(pinnedCardIds.has(1)).toBe(true);
		});

		it("should remove card from pinnedCardIds when already pinned", () => {
			pinnedCardIds.add(1);
			togglePin(1);
			expect(pinnedCardIds.has(1)).toBe(false);
		});

		it("should remove card from excludedCardIds when pinning excluded card", () => {
			excludedCardIds.add(1);
			togglePin(1);
			expect(excludedCardIds.has(1)).toBe(false);
			expect(pinnedCardIds.has(1)).toBe(true);
		});
	});

	describe("toggleExclude", () => {
		it("should add card to excludedCardIds when not excluded", () => {
			toggleExclude(1);
			expect(excludedCardIds.has(1)).toBe(true);
		});

		it("should remove card from excludedCardIds when already excluded", () => {
			excludedCardIds.add(1);
			toggleExclude(1);
			expect(excludedCardIds.has(1)).toBe(false);
		});

		it("should remove card from pinnedCardIds when excluding pinned card", () => {
			pinnedCardIds.add(1);
			toggleExclude(1);
			expect(pinnedCardIds.has(1)).toBe(false);
			expect(excludedCardIds.has(1)).toBe(true);
		});
	});

	describe("getPinnedCards", () => {
		it("should return empty array when no cards are pinned", () => {
			const allCards = [createMockCard(1), createMockCard(2)];
			expect(getPinnedCards(allCards)).toEqual([]);
		});

		it("should return only pinned cards", () => {
			const allCards = [createMockCard(1), createMockCard(2), createMockCard(3)];
			pinnedCardIds.add(1);
			pinnedCardIds.add(3);

			const result = getPinnedCards(allCards);
			expect(result).toHaveLength(2);
			expect(result.map((c) => c.id)).toEqual([1, 3]);
		});

		it("should not include excluded cards", () => {
			const allCards = [createMockCard(1), createMockCard(2)];
			pinnedCardIds.add(1);
			excludedCardIds.add(1); // Should not happen, but test it
			pinnedCardIds.add(2);

			const result = getPinnedCards(allCards);
			// Should return cards 1 and 2, even though 1 is in excludedCardIds
			expect(result).toHaveLength(2);
		});
	});

	describe("getExcludedCards", () => {
		it("should return empty array when no cards are excluded", () => {
			const allCards = [createMockCard(1), createMockCard(2)];
			expect(getExcludedCards(allCards)).toEqual([]);
		});

		it("should return only excluded cards", () => {
			const allCards = [createMockCard(1), createMockCard(2), createMockCard(3)];
			excludedCardIds.add(1);
			excludedCardIds.add(3);

			const result = getExcludedCards(allCards);
			expect(result).toHaveLength(2);
			expect(result.map((c) => c.id)).toEqual([1, 3]);
		});

		it("should not include pinned cards", () => {
			const allCards = [createMockCard(1), createMockCard(2)];
			excludedCardIds.add(1);
			pinnedCardIds.add(1); // Should not happen, but test it
			excludedCardIds.add(2);

			const result = getExcludedCards(allCards);
			// Should return cards 1 and 2, even though 1 is in pinnedCardIds
			expect(result).toHaveLength(2);
		});
	});
});
