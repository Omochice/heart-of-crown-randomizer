import { describe, it, expect, beforeEach } from "vitest";
import {
	getCardState,
	togglePin,
	toggleExclude,
	getPinnedCards,
	getExcludedCards,
	getPinnedCardIds,
	getExcludedCardIds,
	setPinnedCardIds,
	setExcludedCardIds,
} from "./card-state.svelte";
import type { CommonCard, DuplicateCard } from "@heart-of-crown-randomizer/card/type";

// Test helper: create mock CommonCard
function createMockCard(id: number): CommonCard {
	return {
		id,
		name: `Card ${id}`,
		cost: 3,
		type: "common",
		edition: 0,
		hasChild: false,
		mainType: ["action"],
		link: 0,
		effect: "test effect",
	} satisfies DuplicateCard;
}

describe("CardState", () => {
	beforeEach(() => {
		// Reset state before each test
		setPinnedCardIds(new Set());
		setExcludedCardIds(new Set());
	});

	describe("getCardState", () => {
		it("should return 'normal' for unpinned and unexcluded card", () => {
			expect(getCardState(1)).toBe("normal");
		});

		it("should return 'pinned' for pinned card", () => {
			setPinnedCardIds(new Set([1]));
			expect(getCardState(1)).toBe("pinned");
		});

		it("should return 'excluded' for excluded card", () => {
			setExcludedCardIds(new Set([1]));
			expect(getCardState(1)).toBe("excluded");
		});

		it("should enforce mutual exclusivity via setters", () => {
			setPinnedCardIds(new Set([1]));
			setExcludedCardIds(new Set([1]));
			// setExcludedCardIds removes overlapping IDs from pinned
			expect(getCardState(1)).toBe("excluded");
		});
	});

	describe("togglePin", () => {
		it("should add card to pinnedCardIds when unpinned", () => {
			togglePin(1);
			expect(getPinnedCardIds().has(1)).toBe(true);
		});

		it("should remove card from pinnedCardIds when already pinned", () => {
			setPinnedCardIds(new Set([1]));
			togglePin(1);
			expect(getPinnedCardIds().has(1)).toBe(false);
		});

		it("should remove card from excludedCardIds when pinning excluded card", () => {
			setExcludedCardIds(new Set([1]));
			togglePin(1);
			expect(getExcludedCardIds().has(1)).toBe(false);
			expect(getPinnedCardIds().has(1)).toBe(true);
		});
	});

	describe("toggleExclude", () => {
		it("should add card to excludedCardIds when not excluded", () => {
			toggleExclude(1);
			expect(getExcludedCardIds().has(1)).toBe(true);
		});

		it("should remove card from excludedCardIds when already excluded", () => {
			setExcludedCardIds(new Set([1]));
			toggleExclude(1);
			expect(getExcludedCardIds().has(1)).toBe(false);
		});

		it("should remove card from pinnedCardIds when excluding pinned card", () => {
			setPinnedCardIds(new Set([1]));
			toggleExclude(1);
			expect(getPinnedCardIds().has(1)).toBe(false);
			expect(getExcludedCardIds().has(1)).toBe(true);
		});
	});

	describe("getPinnedCards", () => {
		it("should return empty array when no cards are pinned", () => {
			const allCards = [createMockCard(1), createMockCard(2)];
			expect(getPinnedCards(allCards)).toEqual([]);
		});

		it("should return only pinned cards", () => {
			const allCards = [createMockCard(1), createMockCard(2), createMockCard(3)];
			setPinnedCardIds(new Set([1, 3]));

			const result = getPinnedCards(allCards);
			expect(result).toHaveLength(2);
			expect(result.map((c) => c.id)).toEqual([1, 3]);
		});

		it("should not include cards removed by exclude setter", () => {
			const allCards = [createMockCard(1), createMockCard(2)];
			setPinnedCardIds(new Set([1, 2]));
			setExcludedCardIds(new Set([1]));

			const result = getPinnedCards(allCards);
			// Card 1 was removed from pinned by setExcludedCardIds
			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(2);
		});
	});

	describe("getExcludedCards", () => {
		it("should return empty array when no cards are excluded", () => {
			const allCards = [createMockCard(1), createMockCard(2)];
			expect(getExcludedCards(allCards)).toEqual([]);
		});

		it("should return only excluded cards", () => {
			const allCards = [createMockCard(1), createMockCard(2), createMockCard(3)];
			setExcludedCardIds(new Set([1, 3]));

			const result = getExcludedCards(allCards);
			expect(result).toHaveLength(2);
			expect(result.map((c) => c.id)).toEqual([1, 3]);
		});

		it("should not include cards removed by pin setter", () => {
			const allCards = [createMockCard(1), createMockCard(2)];
			setExcludedCardIds(new Set([1, 2]));
			setPinnedCardIds(new Set([1]));

			const result = getExcludedCards(allCards);
			// Card 1 was removed from excluded by setPinnedCardIds
			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(2);
		});
	});
});
