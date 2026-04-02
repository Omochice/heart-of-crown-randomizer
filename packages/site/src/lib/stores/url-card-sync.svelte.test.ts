import { describe, expect, it } from "vitest";
import { resolveCardsFromUrl, shouldUpdatePinExclude } from "./url-card-sync.svelte";
import { makeCard } from "$lib/test-helpers";

const allCommons = Array.from({ length: 20 }, (_, i) => makeCard(i + 1));

describe("resolveCardsFromUrl", () => {
	it("should resolve cards from URL card parameters", () => {
		const url = new URL("https://example.com?card=1&card=5&card=12");

		const result = resolveCardsFromUrl(url, allCommons);

		expect(result.map((c) => c.id)).toEqual([1, 5, 12]);
	});

	it("should filter out invalid card IDs", () => {
		const url = new URL("https://example.com?card=1&card=abc&card=999");

		const result = resolveCardsFromUrl(url, allCommons);

		expect(result.map((c) => c.id)).toEqual([1]);
	});

	it("should return empty array when no card params", () => {
		const url = new URL("https://example.com");

		const result = resolveCardsFromUrl(url, allCommons);

		expect(result).toEqual([]);
	});

	it("should preserve URL parameter order", () => {
		const url = new URL("https://example.com?card=5&card=1&card=3");

		const result = resolveCardsFromUrl(url, allCommons);

		expect(result.map((c) => c.id)).toEqual([5, 1, 3]);
	});
});

describe("shouldUpdatePinExclude", () => {
	it("should return true when pinned IDs differ", () => {
		const result = shouldUpdatePinExclude(
			new Set([1, 2]),
			new Set(),
			new Set([1, 2, 3]),
			new Set(),
		);

		expect(result).toBe(true);
	});

	it("should return true when excluded IDs differ", () => {
		const result = shouldUpdatePinExclude(new Set(), new Set([1]), new Set(), new Set([1, 2]));

		expect(result).toBe(true);
	});

	it("should return false when both match", () => {
		const result = shouldUpdatePinExclude(
			new Set([1, 2]),
			new Set([3]),
			new Set([1, 2]),
			new Set([3]),
		);

		expect(result).toBe(false);
	});

	it("should return false when both are empty", () => {
		const result = shouldUpdatePinExclude(new Set(), new Set(), new Set(), new Set());

		expect(result).toBe(false);
	});
});
