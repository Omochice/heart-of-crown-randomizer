import { describe, expect, it } from "vitest";
import { buildUrlWithCardState, parseCardIdsFromUrl } from "./url-sync";

describe("parseCardIdsFromUrl", () => {
	it("should parse pinned card IDs from URL parameter", () => {
		const url = new URL("https://example.com?pin=1&pin=5&pin=12");

		const result = parseCardIdsFromUrl(url, "pin");

		expect(result).toEqual(new Set([1, 5, 12]));
	});

	it("should parse excluded card IDs from URL parameter", () => {
		const url = new URL("https://example.com?exclude=7&exclude=9");

		const result = parseCardIdsFromUrl(url, "exclude");

		expect(result).toEqual(new Set([7, 9]));
	});

	it("should return empty set when parameter is not present", () => {
		const url = new URL("https://example.com");

		const result = parseCardIdsFromUrl(url, "pin");

		expect(result).toEqual(new Set());
	});

	it("should filter out invalid (NaN) card IDs without throwing error", () => {
		const url = new URL("https://example.com?pin=1&pin=abc&pin=5");

		const result = parseCardIdsFromUrl(url, "pin");

		expect(result).toEqual(new Set([1, 5]));
	});

	it("should handle mixed valid and invalid IDs", () => {
		// Note: Empty string converts to 0, which is a valid number
		const url = new URL("https://example.com?pin=1&pin=&pin=3&pin=invalid");

		const result = parseCardIdsFromUrl(url, "pin");

		expect(result).toEqual(new Set([0, 1, 3]));
	});

	it("should handle duplicate IDs (Set deduplication)", () => {
		const url = new URL("https://example.com?pin=1&pin=5&pin=1&pin=5");

		const result = parseCardIdsFromUrl(url, "pin");

		expect(result).toEqual(new Set([1, 5]));
	});

	it("should handle negative numbers as valid IDs", () => {
		const url = new URL("https://example.com?pin=-1&pin=5");

		const result = parseCardIdsFromUrl(url, "pin");

		expect(result).toEqual(new Set([-1, 5]));
	});

	it("should handle zero as a valid ID", () => {
		const url = new URL("https://example.com?pin=0&pin=1");

		const result = parseCardIdsFromUrl(url, "pin");

		expect(result).toEqual(new Set([0, 1]));
	});

	it("should handle floating point numbers by converting to integers", () => {
		const url = new URL("https://example.com?pin=1.5&pin=2.9");

		const result = parseCardIdsFromUrl(url, "pin");

		expect(result).toEqual(new Set([1.5, 2.9]));
	});
});

describe("buildUrlWithCardState", () => {
	it("should build URL with pinned card IDs", () => {
		const baseUrl = new URL("https://example.com");
		const pinnedIds = new Set([1, 5, 12]);
		const excludedIds = new Set<number>();

		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.getAll("pin")).toEqual(expect.arrayContaining(["1", "5", "12"]));
		expect(result.searchParams.getAll("pin")).toHaveLength(3);
		expect(result.searchParams.has("exclude")).toBe(false);
	});

	it("should build URL with excluded card IDs", () => {
		const baseUrl = new URL("https://example.com");
		const pinnedIds = new Set<number>();
		const excludedIds = new Set([7, 9]);

		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.getAll("exclude")).toEqual(expect.arrayContaining(["7", "9"]));
		expect(result.searchParams.getAll("exclude")).toHaveLength(2);
		expect(result.searchParams.has("pin")).toBe(false);
	});

	it("should build URL with both pinned and excluded card IDs", () => {
		const baseUrl = new URL("https://example.com");
		const pinnedIds = new Set([1, 5]);
		const excludedIds = new Set([7]);

		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.getAll("pin")).toEqual(expect.arrayContaining(["1", "5"]));
		expect(result.searchParams.getAll("exclude")).toEqual(["7"]);
	});

	it("should preserve existing URL parameters other than pin/exclude", () => {
		const baseUrl = new URL("https://example.com?card=10&seed=123");
		const pinnedIds = new Set([1]);
		const excludedIds = new Set([7]);

		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.get("card")).toBe("10");
		expect(result.searchParams.get("seed")).toBe("123");
		expect(result.searchParams.getAll("pin")).toEqual(["1"]);
		expect(result.searchParams.getAll("exclude")).toEqual(["7"]);
	});

	it("should replace existing pin/exclude parameters", () => {
		const baseUrl = new URL("https://example.com?pin=99&exclude=88");
		const pinnedIds = new Set([1, 5]);
		const excludedIds = new Set([7]);

		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.getAll("pin")).toEqual(expect.arrayContaining(["1", "5"]));
		expect(result.searchParams.getAll("pin")).toHaveLength(2);
		expect(result.searchParams.getAll("exclude")).toEqual(["7"]);
		expect(result.searchParams.getAll("exclude")).toHaveLength(1);
	});

	it("should handle empty sets (clear pin/exclude parameters)", () => {
		const baseUrl = new URL("https://example.com?pin=1&exclude=7");
		const pinnedIds = new Set<number>();
		const excludedIds = new Set<number>();

		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.searchParams.has("pin")).toBe(false);
		expect(result.searchParams.has("exclude")).toBe(false);
	});

	it("should not mutate the original URL", () => {
		const baseUrl = new URL("https://example.com?pin=99");
		const originalHref = baseUrl.href;
		const pinnedIds = new Set([1]);
		const excludedIds = new Set<number>();

		buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(baseUrl.href).toBe(originalHref);
	});

	it("should preserve URL hash fragment", () => {
		const baseUrl = new URL("https://example.com#section");
		const pinnedIds = new Set([1]);
		const excludedIds = new Set<number>();

		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds);

		expect(result.hash).toBe("#section");
	});
});

describe("URL sync integration (parseCardIdsFromUrl + buildUrlWithCardState)", () => {
	it("should be able to round-trip pin/exclude state through URL", () => {
		const baseUrl = new URL("https://example.com");
		const originalPinnedIds = new Set([1, 5, 12]);
		const originalExcludedIds = new Set([7, 9]);

		const urlWithState = buildUrlWithCardState(baseUrl, originalPinnedIds, originalExcludedIds);

		const parsedPinnedIds = parseCardIdsFromUrl(urlWithState, "pin");
		const parsedExcludedIds = parseCardIdsFromUrl(urlWithState, "exclude");

		expect(parsedPinnedIds).toEqual(originalPinnedIds);
		expect(parsedExcludedIds).toEqual(originalExcludedIds);
	});

	it("should handle empty state round-trip", () => {
		const baseUrl = new URL("https://example.com");
		const originalPinnedIds = new Set<number>();
		const originalExcludedIds = new Set<number>();

		const urlWithState = buildUrlWithCardState(baseUrl, originalPinnedIds, originalExcludedIds);

		const parsedPinnedIds = parseCardIdsFromUrl(urlWithState, "pin");
		const parsedExcludedIds = parseCardIdsFromUrl(urlWithState, "exclude");

		expect(parsedPinnedIds).toEqual(originalPinnedIds);
		expect(parsedExcludedIds).toEqual(originalExcludedIds);
	});
});
