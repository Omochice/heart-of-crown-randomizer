import { describe, expect, it, beforeEach } from "vitest";
import { parseCardIdsFromUrl, buildUrlWithCardState } from "$lib/utils/url-sync";
import { pinnedCardIds, excludedCardIds } from "$lib/stores/card-state.svelte";

describe("parseCardIdsFromUrl", () => {
	it("should parse single card ID from URL parameter", () => {
		const url = new URL("http://example.com?pin=1");
		const result = parseCardIdsFromUrl(url, "pin");
		expect(result).toEqual(new Set([1]));
	});

	it("should parse multiple card IDs from URL parameter", () => {
		const url = new URL("http://example.com?pin=1&pin=5&pin=12");
		const result = parseCardIdsFromUrl(url, "pin");
		expect(result).toEqual(new Set([1, 5, 12]));
	});

	it("should filter out NaN values from invalid IDs", () => {
		const url = new URL("http://example.com?pin=1&pin=abc&pin=5");
		const result = parseCardIdsFromUrl(url, "pin");
		expect(result).toEqual(new Set([1, 5]));
	});

	it("should return empty Set when parameter does not exist", () => {
		const url = new URL("http://example.com");
		const result = parseCardIdsFromUrl(url, "pin");
		expect(result).toEqual(new Set());
	});

	it("should handle exclude parameter", () => {
		const url = new URL("http://example.com?exclude=7&exclude=9");
		const result = parseCardIdsFromUrl(url, "exclude");
		expect(result).toEqual(new Set([7, 9]));
	});

	it("should ignore duplicate IDs (Set deduplication)", () => {
		const url = new URL("http://example.com?pin=1&pin=1&pin=5");
		const result = parseCardIdsFromUrl(url, "pin");
		expect(result).toEqual(new Set([1, 5]));
	});
});

describe("buildUrlWithCardState", () => {
	it("should build URL with single pinned card", () => {
		const baseUrl = new URL("http://example.com");
		const pinnedIds = new Set([1]);
		const excludedIds = new Set<number>();
		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.getAll("pin")).toEqual(["1"]);
		expect(result.searchParams.getAll("exclude")).toEqual([]);
	});

	it("should build URL with multiple pinned cards", () => {
		const baseUrl = new URL("http://example.com");
		const pinnedIds = new Set([1, 5, 12]);
		const excludedIds = new Set<number>();
		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.getAll("pin")).toContain("1");
		expect(result.searchParams.getAll("pin")).toContain("5");
		expect(result.searchParams.getAll("pin")).toContain("12");
		expect(result.searchParams.getAll("pin")).toHaveLength(3);
	});

	it("should build URL with single excluded card", () => {
		const baseUrl = new URL("http://example.com");
		const pinnedIds = new Set<number>();
		const excludedIds = new Set([7]);
		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.getAll("pin")).toEqual([]);
		expect(result.searchParams.getAll("exclude")).toEqual(["7"]);
	});

	it("should build URL with multiple excluded cards", () => {
		const baseUrl = new URL("http://example.com");
		const pinnedIds = new Set<number>();
		const excludedIds = new Set([7, 9, 11]);
		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.getAll("exclude")).toContain("7");
		expect(result.searchParams.getAll("exclude")).toContain("9");
		expect(result.searchParams.getAll("exclude")).toContain("11");
		expect(result.searchParams.getAll("exclude")).toHaveLength(3);
	});

	it("should build URL with both pinned and excluded cards", () => {
		const baseUrl = new URL("http://example.com");
		const pinnedIds = new Set([1, 5]);
		const excludedIds = new Set([7, 9]);
		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.getAll("pin")).toContain("1");
		expect(result.searchParams.getAll("pin")).toContain("5");
		expect(result.searchParams.getAll("exclude")).toContain("7");
		expect(result.searchParams.getAll("exclude")).toContain("9");
	});

	it("should preserve existing query parameters not related to pin/exclude", () => {
		const baseUrl = new URL("http://example.com?foo=bar&baz=qux");
		const pinnedIds = new Set([1]);
		const excludedIds = new Set([7]);
		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.get("foo")).toBe("bar");
		expect(result.searchParams.get("baz")).toBe("qux");
		expect(result.searchParams.getAll("pin")).toEqual(["1"]);
		expect(result.searchParams.getAll("exclude")).toEqual(["7"]);
	});

	it("should delete existing pin/exclude parameters before appending new ones", () => {
		const baseUrl = new URL("http://example.com?pin=99&exclude=88");
		const pinnedIds = new Set([1, 5]);
		const excludedIds = new Set([7]);
		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		// Should not contain old values
		expect(result.searchParams.getAll("pin")).not.toContain("99");
		expect(result.searchParams.getAll("exclude")).not.toContain("88");

		// Should only contain new values
		expect(result.searchParams.getAll("pin")).toContain("1");
		expect(result.searchParams.getAll("pin")).toContain("5");
		expect(result.searchParams.getAll("exclude")).toEqual(["7"]);
	});

	it("should handle empty sets by removing parameters", () => {
		const baseUrl = new URL("http://example.com?pin=1&exclude=7");
		const pinnedIds = new Set<number>();
		const excludedIds = new Set<number>();
		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.has("pin")).toBe(false);
		expect(result.searchParams.has("exclude")).toBe(false);
	});

	it("should return a new URL object without mutating the base URL", () => {
		const baseUrl = new URL("http://example.com?foo=bar");
		const pinnedIds = new Set([1]);
		const excludedIds = new Set<number>();
		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		// Base URL should not be mutated
		expect(baseUrl.searchParams.has("pin")).toBe(false);

		// Result should have pin parameter
		expect(result.searchParams.getAll("pin")).toEqual(["1"]);
	});
});

describe("URL → State sync (integration)", () => {
	beforeEach(() => {
		// Clear state before each test
		pinnedCardIds.clear();
		excludedCardIds.clear();
	});

	it("should sync pinned card IDs from URL to state", () => {
		const url = new URL("http://example.com?pin=1&pin=5");
		const pinnedIds = parseCardIdsFromUrl(url, "pin");

		// Simulate the $effect behavior
		pinnedCardIds.clear();
		for (const id of pinnedIds) {
			pinnedCardIds.add(id);
		}

		expect(pinnedCardIds.has(1)).toBe(true);
		expect(pinnedCardIds.has(5)).toBe(true);
		expect(pinnedCardIds.size).toBe(2);
	});

	it("should sync excluded card IDs from URL to state", () => {
		const url = new URL("http://example.com?exclude=7&exclude=9");
		const excludedIds = parseCardIdsFromUrl(url, "exclude");

		// Simulate the $effect behavior
		excludedCardIds.clear();
		for (const id of excludedIds) {
			excludedCardIds.add(id);
		}

		expect(excludedCardIds.has(7)).toBe(true);
		expect(excludedCardIds.has(9)).toBe(true);
		expect(excludedCardIds.size).toBe(2);
	});

	it("should sync both pinned and excluded card IDs from URL to state", () => {
		const url = new URL("http://example.com?pin=1&pin=5&exclude=7");
		const pinnedIds = parseCardIdsFromUrl(url, "pin");
		const excludedIds = parseCardIdsFromUrl(url, "exclude");

		// Simulate the $effect behavior
		pinnedCardIds.clear();
		excludedCardIds.clear();
		for (const id of pinnedIds) {
			pinnedCardIds.add(id);
		}
		for (const id of excludedIds) {
			excludedCardIds.add(id);
		}

		expect(pinnedCardIds.has(1)).toBe(true);
		expect(pinnedCardIds.has(5)).toBe(true);
		expect(excludedCardIds.has(7)).toBe(true);
	});

	it("should clear state when URL has no pin/exclude parameters", () => {
		// Set initial state
		pinnedCardIds.add(1);
		excludedCardIds.add(7);

		const url = new URL("http://example.com");
		const pinnedIds = parseCardIdsFromUrl(url, "pin");
		const excludedIds = parseCardIdsFromUrl(url, "exclude");

		// Simulate the $effect behavior
		pinnedCardIds.clear();
		excludedCardIds.clear();
		for (const id of pinnedIds) {
			pinnedCardIds.add(id);
		}
		for (const id of excludedIds) {
			excludedCardIds.add(id);
		}

		expect(pinnedCardIds.size).toBe(0);
		expect(excludedCardIds.size).toBe(0);
	});
});

describe("State → URL sync (integration)", () => {
	beforeEach(() => {
		// Clear state before each test
		pinnedCardIds.clear();
		excludedCardIds.clear();
	});

	it("should build URL with current pinned card IDs when state changes", () => {
		// Set up initial state
		pinnedCardIds.add(1);
		pinnedCardIds.add(5);

		const currentUrl = new URL("http://example.com");
		const result = buildUrlWithCardState(currentUrl, pinnedCardIds, excludedCardIds);

		expect(result.searchParams.getAll("pin")).toContain("1");
		expect(result.searchParams.getAll("pin")).toContain("5");
		expect(result.searchParams.getAll("pin")).toHaveLength(2);
	});

	it("should build URL with current excluded card IDs when state changes", () => {
		// Set up initial state
		excludedCardIds.add(7);
		excludedCardIds.add(9);

		const currentUrl = new URL("http://example.com");
		const result = buildUrlWithCardState(currentUrl, pinnedCardIds, excludedCardIds);

		expect(result.searchParams.getAll("exclude")).toContain("7");
		expect(result.searchParams.getAll("exclude")).toContain("9");
		expect(result.searchParams.getAll("exclude")).toHaveLength(2);
	});

	it("should build URL with both pinned and excluded card IDs", () => {
		// Set up initial state
		pinnedCardIds.add(1);
		pinnedCardIds.add(5);
		excludedCardIds.add(7);

		const currentUrl = new URL("http://example.com");
		const result = buildUrlWithCardState(currentUrl, pinnedCardIds, excludedCardIds);

		expect(result.searchParams.getAll("pin")).toContain("1");
		expect(result.searchParams.getAll("pin")).toContain("5");
		expect(result.searchParams.getAll("exclude")).toContain("7");
	});

	it("should remove pin/exclude parameters when state is empty", () => {
		// Start with URL that has parameters
		const currentUrl = new URL("http://example.com?pin=1&exclude=7");

		// State is empty (cleared in beforeEach)
		const result = buildUrlWithCardState(currentUrl, pinnedCardIds, excludedCardIds);

		expect(result.searchParams.has("pin")).toBe(false);
		expect(result.searchParams.has("exclude")).toBe(false);
	});

	it("should update URL when new card is pinned", () => {
		// Initial state: card 1 is already pinned
		pinnedCardIds.add(1);

		// Create URL with current state
		const currentUrl = new URL("http://example.com");
		let result = buildUrlWithCardState(currentUrl, pinnedCardIds, excludedCardIds);
		expect(result.searchParams.getAll("pin")).toEqual(["1"]);

		// Add new pinned card
		pinnedCardIds.add(5);

		// Update URL with new state
		result = buildUrlWithCardState(result, pinnedCardIds, excludedCardIds);

		expect(result.searchParams.getAll("pin")).toContain("1");
		expect(result.searchParams.getAll("pin")).toContain("5");
		expect(result.searchParams.getAll("pin")).toHaveLength(2);
	});

	it("should update URL when pinned card is removed", () => {
		// Initial state: cards 1 and 5 are pinned
		pinnedCardIds.add(1);
		pinnedCardIds.add(5);

		// Create URL with current state
		const currentUrl = new URL("http://example.com");
		let result = buildUrlWithCardState(currentUrl, pinnedCardIds, excludedCardIds);
		expect(result.searchParams.getAll("pin")).toHaveLength(2);

		// Remove one pinned card
		pinnedCardIds.delete(5);

		// Update URL with new state
		result = buildUrlWithCardState(result, pinnedCardIds, excludedCardIds);

		expect(result.searchParams.getAll("pin")).toEqual(["1"]);
		expect(result.searchParams.getAll("pin")).not.toContain("5");
	});

	it("should preserve existing non-pin/exclude parameters when state changes", () => {
		// Start with URL that has other parameters
		const currentUrl = new URL("http://example.com?card=10&card=11&foo=bar");

		// Add pin state
		pinnedCardIds.add(1);

		const result = buildUrlWithCardState(currentUrl, pinnedCardIds, excludedCardIds);

		// Should preserve existing parameters
		expect(result.searchParams.getAll("card")).toEqual(["10", "11"]);
		expect(result.searchParams.get("foo")).toBe("bar");
		// Should add pin parameter
		expect(result.searchParams.getAll("pin")).toEqual(["1"]);
	});
});
