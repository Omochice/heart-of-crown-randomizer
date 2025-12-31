import { describe, it, expect, beforeEach } from "vitest";
import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { select } from "@heart-of-crown-randomizer/randomizer";
import {
	pinnedCardIds,
	excludedCardIds,
	getPinnedCards,
	togglePin,
	toggleExclude,
} from "$lib/stores/card-state.svelte";
import { parseCardIdsFromUrl, buildUrlWithCardState } from "$lib/utils/url-sync";
import { validatePinConstraints, validateExcludeConstraints } from "$lib/utils/validation";

describe("Full Flow E2E: Pin → Randomize → Result", () => {
	const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
	const targetCount = 10;

	beforeEach(() => {
		// Clear state before each test
		pinnedCardIds.clear();
		excludedCardIds.clear();
	});

	/**
	 * Helper function to simulate the selectWithConstraints logic
	 * This replicates what +page.svelte does in drawRandomCards()
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

	it("should include all pinned cards in randomization result", () => {
		// WHAT: Test that pinned cards always appear in randomization results
		// WHY: Requirement 4.1 - pinned cards must be guaranteed in the result

		// Step 1: Pin 3 cards
		const cardsToBePinned = allCommons.slice(0, 3);
		for (const card of cardsToBePinned) {
			togglePin(card.id);
		}

		// Verify pin state
		expect(pinnedCardIds.size).toBe(3);
		for (const card of cardsToBePinned) {
			expect(pinnedCardIds.has(card.id)).toBe(true);
		}

		// Step 2: Randomize multiple times
		// The pinned cards should ALWAYS appear in every result
		for (let i = 0; i < 10; i++) {
			const pinnedCards = getPinnedCards(allCommons);
			const result = selectWithConstraints(allCommons, pinnedCards, excludedCardIds, targetCount);

			// All pinned cards must be in the result
			for (const pinnedCard of cardsToBePinned) {
				const foundInResult = result.find((c) => c.id === pinnedCard.id);
				expect(foundInResult).toBeDefined();
				expect(foundInResult?.id).toBe(pinnedCard.id);
			}
		}
	});

	it("should handle pinning up to target count cards", () => {
		// WHAT: Test that we can pin exactly the target count of cards
		// WHY: Requirement 4.1 - edge case where all result slots are pinned

		// Pin exactly targetCount cards
		const cardsToBePinned = allCommons.slice(0, targetCount);
		for (const card of cardsToBePinned) {
			togglePin(card.id);
		}

		// Validation should pass
		const validation = validatePinConstraints(pinnedCardIds.size, targetCount);
		expect(validation.ok).toBe(true);

		// Randomization should work
		const pinnedCards = getPinnedCards(allCommons);
		const result = selectWithConstraints(allCommons, pinnedCards, excludedCardIds, targetCount);

		// Result should contain exactly the pinned cards
		expect(result.length).toBe(targetCount);
		for (const card of cardsToBePinned) {
			const foundInResult = result.find((c) => c.id === card.id);
			expect(foundInResult).toBeDefined();
		}
	});

	it("should detect error when pinned cards exceed target count", () => {
		// WHAT: Test that validation detects too many pinned cards
		// WHY: Requirement 4.4 - must show error when pins exceed target

		// Pin more than target count
		const cardsToBePinned = allCommons.slice(0, targetCount + 3);
		for (const card of cardsToBePinned) {
			togglePin(card.id);
		}

		// Validation should fail
		const validation = validatePinConstraints(pinnedCardIds.size, targetCount);
		expect(validation.ok).toBe(false);
		if (!validation.ok) {
			expect(validation.message).toContain("ピンされたカードが多すぎます");
		}
	});
});

describe("Full Flow E2E: Exclude → Randomize → Result", () => {
	const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
	const targetCount = 10;

	beforeEach(() => {
		// Clear state before each test
		pinnedCardIds.clear();
		excludedCardIds.clear();
	});

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

	it("should never include excluded cards in randomization result", () => {
		// WHAT: Test that excluded cards never appear in randomization results
		// WHY: Requirement 4.2 - excluded cards must be filtered out

		// Step 1: Exclude 5 cards
		const cardsToBeExcluded = allCommons.slice(0, 5);
		for (const card of cardsToBeExcluded) {
			toggleExclude(card.id);
		}

		// Verify exclude state
		expect(excludedCardIds.size).toBe(5);
		for (const card of cardsToBeExcluded) {
			expect(excludedCardIds.has(card.id)).toBe(true);
		}

		// Step 2: Randomize multiple times
		// The excluded cards should NEVER appear in any result
		for (let i = 0; i < 20; i++) {
			const pinnedCards = getPinnedCards(allCommons);
			const result = selectWithConstraints(allCommons, pinnedCards, excludedCardIds, targetCount);

			// No excluded cards should be in the result
			for (const excludedCard of cardsToBeExcluded) {
				const foundInResult = result.find((c) => c.id === excludedCard.id);
				expect(foundInResult).toBeUndefined();
			}
		}
	});

	it("should detect error when excluded cards make selection impossible", () => {
		// WHAT: Test that validation detects insufficient available cards
		// WHY: Requirement 4.5 - must show error when exclusions make selection impossible

		// Exclude all but 5 cards (less than target count of 10)
		const cardsToKeep = 5;
		const cardsToExclude = allCommons.slice(cardsToKeep);
		for (const card of cardsToExclude) {
			toggleExclude(card.id);
		}

		// Calculate available cards
		const availableCards = allCommons.filter((card) => !excludedCardIds.has(card.id));

		// Validation should fail
		const validation = validateExcludeConstraints(availableCards.length, targetCount);
		expect(validation.ok).toBe(false);
		if (!validation.ok) {
			expect(validation.message).toContain("除外により選択可能なカードが不足しています");
		}
	});
});

describe("Full Flow E2E: Pin + Exclude → Randomize → Result", () => {
	const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
	const targetCount = 10;

	beforeEach(() => {
		// Clear state before each test
		pinnedCardIds.clear();
		excludedCardIds.clear();
	});

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

	it("should handle both pinned and excluded cards correctly", () => {
		// WHAT: Test that pins and excludes work together correctly
		// WHY: Requirements 4.1 + 4.2 - both constraints must be applied simultaneously

		// Pin first 3 cards
		const cardsToBePinned = allCommons.slice(0, 3);
		for (const card of cardsToBePinned) {
			togglePin(card.id);
		}

		// Exclude next 5 cards (different from pinned cards)
		const cardsToBeExcluded = allCommons.slice(10, 15);
		for (const card of cardsToBeExcluded) {
			toggleExclude(card.id);
		}

		// Randomize multiple times
		for (let i = 0; i < 10; i++) {
			const pinnedCards = getPinnedCards(allCommons);
			const result = selectWithConstraints(allCommons, pinnedCards, excludedCardIds, targetCount);

			// All pinned cards must be included
			for (const pinnedCard of cardsToBePinned) {
				const foundInResult = result.find((c) => c.id === pinnedCard.id);
				expect(foundInResult).toBeDefined();
			}

			// All excluded cards must NOT be included
			for (const excludedCard of cardsToBeExcluded) {
				const foundInResult = result.find((c) => c.id === excludedCard.id);
				expect(foundInResult).toBeUndefined();
			}
		}
	});

	it("should respect state changes during flow", () => {
		// WHAT: Test that state changes (pin/unpin, exclude/unexclude) work in a flow
		// WHY: Requirement 4.3 - state must be reflected in re-randomization results

		// Step 1: Pin 2 cards
		const firstPinnedCards = allCommons.slice(0, 2);
		for (const card of firstPinnedCards) {
			togglePin(card.id);
		}

		// Randomize
		let pinnedCards = getPinnedCards(allCommons);
		let result = selectWithConstraints(allCommons, pinnedCards, excludedCardIds, targetCount);

		// Verify pinned cards are in result
		for (const card of firstPinnedCards) {
			expect(result.find((c) => c.id === card.id)).toBeDefined();
		}

		// Step 2: Unpin one card, pin a different card
		togglePin(firstPinnedCards[0].id); // Unpin
		const newPinnedCard = allCommons.slice(5, 6)[0];
		togglePin(newPinnedCard.id); // Pin new card

		// Randomize again
		pinnedCards = getPinnedCards(allCommons);
		result = selectWithConstraints(allCommons, pinnedCards, excludedCardIds, targetCount);

		// First card should NOT be guaranteed anymore
		// (it might still appear randomly, but we can't guarantee it won't)
		// Second card from original pins should still be there
		expect(result.find((c) => c.id === firstPinnedCards[1].id)).toBeDefined();
		// New pinned card should be there
		expect(result.find((c) => c.id === newPinnedCard.id)).toBeDefined();
	});
});

describe("Full Flow E2E: URL Sharing → State Restoration", () => {
	beforeEach(() => {
		// Clear state before each test
		pinnedCardIds.clear();
		excludedCardIds.clear();
	});

	it("should restore pinned cards from URL", () => {
		// WHAT: Test that pinned card state is restored from URL parameters
		// WHY: Requirement 5.2 - URL must be the single source of truth for state

		// Simulate URL with pin parameters
		const url = new URL("http://localhost/?pin=1&pin=5&pin=12");
		const parsedPinnedIds = parseCardIdsFromUrl(url, "pin");

		// Simulate the $effect behavior in +page.svelte
		pinnedCardIds.clear();
		for (const id of parsedPinnedIds) {
			pinnedCardIds.add(id);
		}

		// Verify state is restored
		expect(pinnedCardIds.has(1)).toBe(true);
		expect(pinnedCardIds.has(5)).toBe(true);
		expect(pinnedCardIds.has(12)).toBe(true);
		expect(pinnedCardIds.size).toBe(3);
	});

	it("should restore excluded cards from URL", () => {
		// WHAT: Test that excluded card state is restored from URL parameters
		// WHY: Requirement 5.2 - URL must be the single source of truth for state

		// Simulate URL with exclude parameters
		const url = new URL("http://localhost/?exclude=7&exclude=9");
		const parsedExcludedIds = parseCardIdsFromUrl(url, "exclude");

		// Simulate the $effect behavior in +page.svelte
		excludedCardIds.clear();
		for (const id of parsedExcludedIds) {
			excludedCardIds.add(id);
		}

		// Verify state is restored
		expect(excludedCardIds.has(7)).toBe(true);
		expect(excludedCardIds.has(9)).toBe(true);
		expect(excludedCardIds.size).toBe(2);
	});

	it("should restore both pinned and excluded cards from URL", () => {
		// WHAT: Test that both pin and exclude states are restored together
		// WHY: Requirement 5.2 - complete state restoration from URL

		// Simulate URL with both pin and exclude parameters
		const url = new URL("http://localhost/?pin=1&pin=5&exclude=7&exclude=9");
		const parsedPinnedIds = parseCardIdsFromUrl(url, "pin");
		const parsedExcludedIds = parseCardIdsFromUrl(url, "exclude");

		// Simulate the $effect behavior in +page.svelte
		pinnedCardIds.clear();
		excludedCardIds.clear();
		for (const id of parsedPinnedIds) {
			pinnedCardIds.add(id);
		}
		for (const id of parsedExcludedIds) {
			excludedCardIds.add(id);
		}

		// Verify state is restored
		expect(pinnedCardIds.has(1)).toBe(true);
		expect(pinnedCardIds.has(5)).toBe(true);
		expect(excludedCardIds.has(7)).toBe(true);
		expect(excludedCardIds.has(9)).toBe(true);
	});

	it("should build URL with complete state for sharing", () => {
		// WHAT: Test that URL contains complete state for sharing
		// WHY: Requirement 1.5 - state must be shareable via URL

		// Set some pin and exclude state
		pinnedCardIds.add(1);
		pinnedCardIds.add(5);
		pinnedCardIds.add(12);
		excludedCardIds.add(7);
		excludedCardIds.add(9);

		// Build URL with current state
		const baseUrl = new URL("http://localhost/");
		const resultUrl = buildUrlWithCardState(baseUrl, pinnedCardIds, excludedCardIds);

		// Verify URL contains all state
		const pinParams = resultUrl.searchParams.getAll("pin");
		const excludeParams = resultUrl.searchParams.getAll("exclude");

		expect(pinParams).toContain("1");
		expect(pinParams).toContain("5");
		expect(pinParams).toContain("12");
		expect(pinParams).toHaveLength(3);

		expect(excludeParams).toContain("7");
		expect(excludeParams).toContain("9");
		expect(excludeParams).toHaveLength(2);
	});

	it("should support round-trip URL encoding and decoding", () => {
		// WHAT: Test that state can be encoded to URL and decoded back correctly
		// WHY: Requirement 1.5 - URL sharing must preserve exact state

		// Step 1: Set initial state
		const originalPinnedIds = new Set([1, 5, 12]);
		const originalExcludedIds = new Set([7, 9]);

		// Step 2: Build URL from state
		const baseUrl = new URL("http://localhost/");
		const encodedUrl = buildUrlWithCardState(baseUrl, originalPinnedIds, originalExcludedIds);

		// Step 3: Parse URL back to state
		const decodedPinnedIds = parseCardIdsFromUrl(encodedUrl, "pin");
		const decodedExcludedIds = parseCardIdsFromUrl(encodedUrl, "exclude");

		// Step 4: Verify round-trip preservation
		expect(decodedPinnedIds).toEqual(originalPinnedIds);
		expect(decodedExcludedIds).toEqual(originalExcludedIds);
	});

	it("should handle invalid card IDs in URL gracefully", () => {
		// WHAT: Test that invalid IDs in URL are filtered out
		// WHY: Requirement 5.2 - robust URL parsing without crashes

		// URL with some invalid IDs
		const url = new URL("http://localhost/?pin=1&pin=abc&pin=5&exclude=xyz&exclude=7");

		const parsedPinnedIds = parseCardIdsFromUrl(url, "pin");
		const parsedExcludedIds = parseCardIdsFromUrl(url, "exclude");

		// Only valid IDs should be parsed
		expect(parsedPinnedIds).toEqual(new Set([1, 5]));
		expect(parsedExcludedIds).toEqual(new Set([7]));
	});
});
