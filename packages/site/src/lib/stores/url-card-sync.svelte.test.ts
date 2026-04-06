import { describe, expect, it } from "vitest";
import { resolveCardsFromUrl, shouldUpdatePinExclude } from "./url-card-sync.svelte";
import { makeCard } from "$lib/test-helpers";
import { encodeIds } from "@heart-of-crown-randomizer/id-codec";

const allCommons = Array.from({ length: 20 }, (_, i) => makeCard(i + 1));

describe("resolveCardsFromUrl", () => {
	it("should resolve cards from encoded s parameter", () => {
		const encoded = encodeIds([1, 5, 12]);
		const url = new URL(`https://example.com?s=${encoded}`);

		const result = resolveCardsFromUrl(url, allCommons);

		expect(result.map((c) => c.id)).toEqual([1, 5, 12]);
	});

	it("should filter out unknown card IDs", () => {
		const encoded = encodeIds([1, 999]);
		const url = new URL(`https://example.com?s=${encoded}`);

		const result = resolveCardsFromUrl(url, allCommons);

		expect(result.map((c) => c.id)).toEqual([1]);
	});

	it("should return empty array when no s param", () => {
		const url = new URL("https://example.com");

		const result = resolveCardsFromUrl(url, allCommons);

		expect(result).toEqual([]);
	});

	it("should return sorted card IDs", () => {
		const encoded = encodeIds([5, 1, 3]);
		const url = new URL(`https://example.com?s=${encoded}`);

		const result = resolveCardsFromUrl(url, allCommons);

		expect(result.map((c) => c.id)).toEqual([1, 3, 5]);
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
