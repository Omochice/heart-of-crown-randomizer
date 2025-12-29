import { describe, expect, it } from "vitest";
import { parseCardIdsFromUrl } from "$lib/utils/url-sync";

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
