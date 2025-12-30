/**
 * Unit tests for randomization constraint validation and application
 *
 * Tests validate:
 * 1. Pin constraint validation (too many pins, valid pins)
 * 2. Exclude constraint validation (insufficient available cards, valid exclusions)
 * 3. Constraint application in selectWithConstraints
 *
 * Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { describe, it, expect } from "vitest";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { validatePinConstraints, validateExcludeConstraints } from "$lib/utils/validation";
import { select } from "@heart-of-crown-randomizer/randomizer";

// Mock card data for testing
const mockCards: CommonCard[] = [
	{
		id: 1,
		name: "Card 1",
		cost: 2,
		mainType: ["attack"],
		link: 0,
		effect: "",
		edition: 0,
		type: "common",
		hasChild: false,
	},
	{
		id: 2,
		name: "Card 2",
		cost: 3,
		mainType: ["action"],
		link: 0,
		effect: "",
		edition: 0,
		type: "common",
		hasChild: false,
	},
	{
		id: 3,
		name: "Card 3",
		cost: 4,
		mainType: ["succession"],
		link: 0,
		effect: "",
		edition: 0,
		type: "common",
		hasChild: false,
	},
	{
		id: 4,
		name: "Card 4",
		cost: 5,
		mainType: ["attack"],
		link: 0,
		effect: "",
		edition: 0,
		type: "common",
		hasChild: false,
	},
	{
		id: 5,
		name: "Card 5",
		cost: 6,
		mainType: ["action"],
		link: 0,
		effect: "",
		edition: 0,
		type: "common",
		hasChild: false,
	},
];

describe("Pin Constraint Validation", () => {
	it("should return error when pinned cards exceed target count", () => {
		// Test with 5 pinned cards, target 3 cards
		const result = validatePinConstraints(5, 3);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("ピンされたカードが多すぎます");
			expect(result.message).toContain("5/3");
			expect(result.message).toContain("2枚解除");
		}
	});

	it("should return success when pinned cards equal target count", () => {
		// Test with 3 pinned cards, target 3 cards
		const result = validatePinConstraints(3, 3);

		expect(result.ok).toBe(true);
	});

	it("should return success when pinned cards are less than target count", () => {
		// Test with 2 pinned cards, target 5 cards
		const result = validatePinConstraints(2, 5);

		expect(result.ok).toBe(true);
	});

	it("should return success when no cards are pinned", () => {
		// Test with 0 pinned cards, target 3 cards
		// Users may want random selection without any pinned cards
		const result = validatePinConstraints(0, 3);

		expect(result.ok).toBe(true);
	});
});

describe("Exclude Constraint Validation", () => {
	it("should return error when available cards are insufficient", () => {
		// Test with 2 available cards, target 3 cards
		const result = validateExcludeConstraints(2, 3);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("除外により選択可能なカードが不足しています");
			expect(result.message).toContain("2/3");
			expect(result.message).toContain("1枚解除");
		}
	});

	it("should return success when available cards equal target count", () => {
		// Test with 3 available cards, target 3 cards
		const result = validateExcludeConstraints(3, 3);

		expect(result.ok).toBe(true);
	});

	it("should return success when available cards exceed target count", () => {
		// Test with 10 available cards, target 5 cards
		const result = validateExcludeConstraints(10, 5);

		expect(result.ok).toBe(true);
	});

	it("should return error when all cards are excluded", () => {
		// Test with 0 available cards, target 3 cards
		const result = validateExcludeConstraints(0, 3);

		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.message).toContain("除外により選択可能なカードが不足しています");
			expect(result.message).toContain("0/3");
			expect(result.message).toContain("3枚解除");
		}
	});
});

describe("Constraint Application in selectWithConstraints", () => {
	/**
	 * Helper function to select cards with constraints
	 *
	 * This matches the implementation in +page.svelte
	 */
	function selectWithConstraints(
		allCards: CommonCard[],
		pinnedCards: CommonCard[],
		excludedIds: Set<number>,
		count: number,
	): CommonCard[] {
		return select(allCards, count, {
			constraints: {
				require: pinnedCards,
				exclude: [(card) => excludedIds.has(card.id)],
			},
		});
	}

	it("should include all pinned cards in result", () => {
		// Pin cards with id 1 and 2, select 3 cards
		const pinnedCards = mockCards.filter((c) => c.id === 1 || c.id === 2);
		const excludedIds = new Set<number>();

		const result = selectWithConstraints(mockCards, pinnedCards, excludedIds, 3);

		// All pinned cards must be in result
		expect(result).toHaveLength(3);
		expect(result.find((c) => c.id === 1)).toBeDefined();
		expect(result.find((c) => c.id === 2)).toBeDefined();
	});

	it("should exclude all excluded cards from result", () => {
		// Exclude cards with id 1 and 2, select 3 cards
		const pinnedCards: CommonCard[] = [];
		const excludedIds = new Set([1, 2]);

		const result = selectWithConstraints(mockCards, pinnedCards, excludedIds, 3);

		// No excluded cards should be in result
		expect(result).toHaveLength(3);
		expect(result.find((c) => c.id === 1)).toBeUndefined();
		expect(result.find((c) => c.id === 2)).toBeUndefined();
	});

	it("should work with both pinned and excluded cards", () => {
		// Pin card 1, exclude card 2, select 3 cards
		const pinnedCards = mockCards.filter((c) => c.id === 1);
		const excludedIds = new Set([2]);

		const result = selectWithConstraints(mockCards, pinnedCards, excludedIds, 3);

		// Pinned card must be included, excluded card must not be included
		expect(result).toHaveLength(3);
		expect(result.find((c) => c.id === 1)).toBeDefined(); // Pinned card
		expect(result.find((c) => c.id === 2)).toBeUndefined(); // Excluded card
	});

	it("should select from remaining cards when constraints are applied", () => {
		// Pin card 1, exclude cards 2 and 3, select 2 cards (1 pinned + 1 random from {4, 5})
		const pinnedCards = mockCards.filter((c) => c.id === 1);
		const excludedIds = new Set([2, 3]);

		const result = selectWithConstraints(mockCards, pinnedCards, excludedIds, 2);

		// Result should have exactly 2 cards
		expect(result).toHaveLength(2);
		// Must include pinned card
		expect(result.find((c) => c.id === 1)).toBeDefined();
		// Must not include excluded cards
		expect(result.find((c) => c.id === 2)).toBeUndefined();
		expect(result.find((c) => c.id === 3)).toBeUndefined();
		// Remaining card must be from {4, 5}
		const otherCard = result.find((c) => c.id !== 1);
		expect(otherCard).toBeDefined();
		expect([4, 5]).toContain(otherCard?.id);
	});

	it("should work with empty constraints", () => {
		// No pins, no excludes, select 3 cards
		const pinnedCards: CommonCard[] = [];
		const excludedIds = new Set<number>();

		const result = selectWithConstraints(mockCards, pinnedCards, excludedIds, 3);

		// Result should have exactly 3 cards
		expect(result).toHaveLength(3);
		// All result cards should be from mockCards
		for (const card of result) {
			expect(mockCards.find((c) => c.id === card.id)).toBeDefined();
		}
	});
});
