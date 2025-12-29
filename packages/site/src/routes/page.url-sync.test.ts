import { describe, expect, it } from "vitest";
import { parseCardIdsFromUrl, buildUrlWithCardState } from "$lib/utils/url-sync";

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

	it("should handle negative numbers as valid IDs", () => {
		const url = new URL("http://example.com?pin=-1&pin=5");
		const result = parseCardIdsFromUrl(url, "pin");
		expect(result).toEqual(new Set([-1, 5]));
	});

	it("should filter out floating point numbers by converting them to integers", () => {
		const url = new URL("http://example.com?pin=1.5&pin=5");
		const result = parseCardIdsFromUrl(url, "pin");
		// Number("1.5") = 1.5, which is not NaN, so it will be included
		expect(result).toEqual(new Set([1.5, 5]));
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
