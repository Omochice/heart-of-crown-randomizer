import { describe, expect, it } from "vitest";
import { encodeCardIds, decodeCardIds } from "@heart-of-crown-randomizer/card-codec";
import { buildUrlWithCardState, parseCompressedIds, setsEqual } from "./url-sync";

describe("parseCompressedIds", () => {
	it("should decode compressed pinned card IDs from 'p' parameter", () => {
		const encoded = encodeCardIds([1, 5, 12]);
		const url = new URL(`https://example.com?p=${encoded}`);

		const result = parseCompressedIds(url, "p");

		expect(result).toEqual(new Set([1, 5, 12]));
	});

	it("should decode compressed excluded card IDs from 'e' parameter", () => {
		const encoded = encodeCardIds([7, 9]);
		const url = new URL(`https://example.com?e=${encoded}`);

		const result = parseCompressedIds(url, "e");

		expect(result).toEqual(new Set([7, 9]));
	});

	it("should decode compressed constraint IDs from 'c' parameter", () => {
		const encoded = encodeCardIds([1, 3, 5]);
		const url = new URL(`https://example.com?c=${encoded}`);

		const result = parseCompressedIds(url, "c");

		expect(result).toEqual(new Set([1, 3, 5]));
	});

	it("should return empty set when parameter is not present", () => {
		const url = new URL("https://example.com");

		const result = parseCompressedIds(url, "p");

		expect(result).toEqual(new Set());
	});

	it("should return empty set when parameter is empty string", () => {
		const url = new URL("https://example.com?p=");

		const result = parseCompressedIds(url, "p");

		expect(result).toEqual(new Set());
	});

	it("should handle zero as a valid ID", () => {
		const encoded = encodeCardIds([0, 1]);
		const url = new URL(`https://example.com?p=${encoded}`);

		const result = parseCompressedIds(url, "p");

		expect(result).toEqual(new Set([0, 1]));
	});
});

describe("buildUrlWithCardState", () => {
	it("should build URL with compressed pinned card IDs", () => {
		const baseUrl = new URL("https://example.com");
		const pinnedIds = new Set([1, 5, 12]);

		const result = buildUrlWithCardState(baseUrl, pinnedIds, new Set(), new Set());

		const pParam = result.searchParams.get("p")!;
		expect(new Set(decodeCardIds(pParam))).toEqual(pinnedIds);
		expect(result.searchParams.has("e")).toBe(false);
		expect(result.searchParams.has("c")).toBe(false);
	});

	it("should build URL with compressed excluded card IDs", () => {
		const baseUrl = new URL("https://example.com");
		const excludedIds = new Set([7, 9]);

		const result = buildUrlWithCardState(baseUrl, new Set(), excludedIds, new Set());

		const eParam = result.searchParams.get("e")!;
		expect(new Set(decodeCardIds(eParam))).toEqual(excludedIds);
		expect(result.searchParams.has("p")).toBe(false);
	});

	it("should build URL with compressed constraint IDs", () => {
		const baseUrl = new URL("https://example.com");
		const constraintIds = new Set([1, 3, 5]);

		const result = buildUrlWithCardState(baseUrl, new Set(), new Set(), constraintIds);

		const cParam = result.searchParams.get("c")!;
		expect(new Set(decodeCardIds(cParam))).toEqual(constraintIds);
	});

	it("should build URL with all three state types", () => {
		const baseUrl = new URL("https://example.com");
		const pinnedIds = new Set([1, 5]);
		const excludedIds = new Set([7]);
		const constraintIds = new Set([2, 4]);

		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds, constraintIds);

		expect(new Set(decodeCardIds(result.searchParams.get("p")!))).toEqual(pinnedIds);
		expect(new Set(decodeCardIds(result.searchParams.get("e")!))).toEqual(excludedIds);
		expect(new Set(decodeCardIds(result.searchParams.get("c")!))).toEqual(constraintIds);
	});

	it("should preserve existing URL parameters other than p/e/c", () => {
		const baseUrl = new URL("https://example.com?card=10&seed=123");
		const pinnedIds = new Set([1]);

		const result = buildUrlWithCardState(baseUrl, pinnedIds, new Set(), new Set());

		expect(result.searchParams.get("card")).toBe("10");
		expect(result.searchParams.get("seed")).toBe("123");
	});

	it("should handle empty sets (no p/e/c parameters)", () => {
		const baseUrl = new URL("https://example.com");

		const result = buildUrlWithCardState(baseUrl, new Set(), new Set(), new Set());

		expect(result.searchParams.has("p")).toBe(false);
		expect(result.searchParams.has("e")).toBe(false);
		expect(result.searchParams.has("c")).toBe(false);
	});

	it("should not mutate the original URL", () => {
		const baseUrl = new URL("https://example.com?p=xx");
		const originalHref = baseUrl.href;

		buildUrlWithCardState(baseUrl, new Set([1]), new Set(), new Set());

		expect(baseUrl.href).toBe(originalHref);
	});

	it("should preserve URL hash fragment", () => {
		const baseUrl = new URL("https://example.com#section");

		const result = buildUrlWithCardState(baseUrl, new Set([1]), new Set(), new Set());

		expect(result.hash).toBe("#section");
	});

	it("should remove old-format pin/exclude params", () => {
		const baseUrl = new URL("https://example.com?pin=1&pin=5&exclude=7");

		const result = buildUrlWithCardState(baseUrl, new Set([2]), new Set([3]), new Set());

		expect(result.searchParams.has("pin")).toBe(false);
		expect(result.searchParams.has("exclude")).toBe(false);
	});
});

describe("URL sync integration (parseCompressedIds + buildUrlWithCardState)", () => {
	it("should round-trip pin/exclude/constraint state through URL", () => {
		const baseUrl = new URL("https://example.com");
		const originalPinnedIds = new Set([1, 5, 12]);
		const originalExcludedIds = new Set([7, 9]);
		const originalConstraintIds = new Set([2, 4]);

		const urlWithState = buildUrlWithCardState(
			baseUrl,
			originalPinnedIds,
			originalExcludedIds,
			originalConstraintIds,
		);

		const parsedPinnedIds = parseCompressedIds(urlWithState, "p");
		const parsedExcludedIds = parseCompressedIds(urlWithState, "e");
		const parsedConstraintIds = parseCompressedIds(urlWithState, "c");

		expect(parsedPinnedIds).toEqual(originalPinnedIds);
		expect(parsedExcludedIds).toEqual(originalExcludedIds);
		expect(parsedConstraintIds).toEqual(originalConstraintIds);
	});

	it("should round-trip empty state through URL", () => {
		const baseUrl = new URL("https://example.com");
		const empty = new Set<number>();

		const urlWithState = buildUrlWithCardState(baseUrl, empty, empty, empty);

		expect(parseCompressedIds(urlWithState, "p")).toEqual(empty);
		expect(parseCompressedIds(urlWithState, "e")).toEqual(empty);
		expect(parseCompressedIds(urlWithState, "c")).toEqual(empty);
	});
});

describe("setsEqual", () => {
	it("should return true for equal sets", () => {
		expect(setsEqual(new Set([1, 2, 3]), new Set([1, 2, 3]))).toBe(true);
	});

	it("should return false for different sets", () => {
		expect(setsEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
	});

	it("should return false for different sizes", () => {
		expect(setsEqual(new Set([1]), new Set([1, 2]))).toBe(false);
	});

	it("should return true for empty sets", () => {
		expect(setsEqual(new Set(), new Set())).toBe(true);
	});
});
