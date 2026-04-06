import { describe, expect, it, beforeEach } from "vitest";
import { encodeIds, decodeIds } from "@heart-of-crown-randomizer/card-codec";
import { parseCompressedIds, buildUrlWithCardState } from "$lib/utils/url-sync";
import {
	getPinnedCardIds,
	getExcludedCardIds,
	setPinnedCardIds,
	setExcludedCardIds,
} from "$lib/stores/card-state.svelte";
import {
	getEnabledConstraintIds,
	setEnabledConstraintIds,
} from "$lib/stores/constraint-state.svelte";

describe("parseCompressedIds (page integration)", () => {
	it("should parse compressed pinned IDs from 'p' parameter", () => {
		const encoded = encodeIds([1, 5, 12]);
		const url = new URL(`http://example.com?p=${encoded}`);

		const result = parseCompressedIds(url, "p");

		expect(result).toEqual(new Set([1, 5, 12]));
	});

	it("should parse compressed excluded IDs from 'e' parameter", () => {
		const encoded = encodeIds([7, 9]);
		const url = new URL(`http://example.com?e=${encoded}`);

		const result = parseCompressedIds(url, "e");

		expect(result).toEqual(new Set([7, 9]));
	});

	it("should parse compressed constraint IDs from 'c' parameter", () => {
		const encoded = encodeIds([1, 3, 5]);
		const url = new URL(`http://example.com?c=${encoded}`);

		const result = parseCompressedIds(url, "c");

		expect(result).toEqual(new Set([1, 3, 5]));
	});

	it("should return empty Set when parameter does not exist", () => {
		const url = new URL("http://example.com");

		const result = parseCompressedIds(url, "p");

		expect(result).toEqual(new Set());
	});
});

describe("buildUrlWithCardState (page integration)", () => {
	it("should build URL with compressed pinned card IDs", () => {
		const baseUrl = new URL("http://example.com");
		const pinnedIds = new Set([1, 5, 12]);

		const result = buildUrlWithCardState(baseUrl, pinnedIds, new Set(), new Set());

		expect(new Set(decodeIds(result.searchParams.get("p")!))).toEqual(pinnedIds);
		expect(result.searchParams.has("e")).toBe(false);
		expect(result.searchParams.has("c")).toBe(false);
	});

	it("should build URL with compressed excluded card IDs", () => {
		const baseUrl = new URL("http://example.com");
		const excludedIds = new Set([7, 9]);

		const result = buildUrlWithCardState(baseUrl, new Set(), excludedIds, new Set());

		expect(new Set(decodeIds(result.searchParams.get("e")!))).toEqual(excludedIds);
		expect(result.searchParams.has("p")).toBe(false);
	});

	it("should build URL with all state types", () => {
		const baseUrl = new URL("http://example.com");
		const pinnedIds = new Set([1, 5]);
		const excludedIds = new Set([7]);
		const constraintIds = new Set([2, 4]);

		const result = buildUrlWithCardState(baseUrl, pinnedIds, excludedIds, constraintIds);

		expect(new Set(decodeIds(result.searchParams.get("p")!))).toEqual(pinnedIds);
		expect(new Set(decodeIds(result.searchParams.get("e")!))).toEqual(excludedIds);
		expect(new Set(decodeIds(result.searchParams.get("c")!))).toEqual(constraintIds);
	});

	it("should preserve existing non-state query parameters", () => {
		const baseUrl = new URL("http://example.com?foo=bar&baz=qux");

		const result = buildUrlWithCardState(baseUrl, new Set([1]), new Set(), new Set());

		expect(result.searchParams.get("foo")).toBe("bar");
		expect(result.searchParams.get("baz")).toBe("qux");
	});

	it("should remove old-format pin/exclude params", () => {
		const baseUrl = new URL("http://example.com?pin=99&exclude=88");

		const result = buildUrlWithCardState(baseUrl, new Set([1]), new Set([7]), new Set());

		expect(result.searchParams.has("pin")).toBe(false);
		expect(result.searchParams.has("exclude")).toBe(false);
	});

	it("should handle empty sets by removing parameters", () => {
		const pEncoded = encodeIds([1]);
		const eEncoded = encodeIds([7]);
		const baseUrl = new URL(`http://example.com?p=${pEncoded}&e=${eEncoded}`);

		const result = buildUrlWithCardState(baseUrl, new Set(), new Set(), new Set());

		expect(result.searchParams.has("p")).toBe(false);
		expect(result.searchParams.has("e")).toBe(false);
		expect(result.searchParams.has("c")).toBe(false);
	});

	it("should not mutate the base URL", () => {
		const baseUrl = new URL("http://example.com?foo=bar");
		const originalHref = baseUrl.href;

		buildUrlWithCardState(baseUrl, new Set([1]), new Set(), new Set());

		expect(baseUrl.href).toBe(originalHref);
	});
});

describe("URL -> State sync (integration)", () => {
	beforeEach(() => {
		setPinnedCardIds(new Set());
		setExcludedCardIds(new Set());
		setEnabledConstraintIds(new Set());
	});

	it("should sync pinned card IDs from compressed URL to state", () => {
		const encoded = encodeIds([1, 5]);
		const url = new URL(`http://example.com?p=${encoded}`);
		const pinnedIds = parseCompressedIds(url, "p");

		setPinnedCardIds(pinnedIds);

		expect(getPinnedCardIds().has(1)).toBe(true);
		expect(getPinnedCardIds().has(5)).toBe(true);
		expect(getPinnedCardIds().size).toBe(2);
	});

	it("should sync excluded card IDs from compressed URL to state", () => {
		const encoded = encodeIds([7, 9]);
		const url = new URL(`http://example.com?e=${encoded}`);
		const excludedIds = parseCompressedIds(url, "e");

		setExcludedCardIds(excludedIds);

		expect(getExcludedCardIds().has(7)).toBe(true);
		expect(getExcludedCardIds().has(9)).toBe(true);
		expect(getExcludedCardIds().size).toBe(2);
	});

	it("should sync constraint IDs from compressed URL to state", () => {
		const encoded = encodeIds([2, 4]);
		const url = new URL(`http://example.com?c=${encoded}`);
		const constraintIds = parseCompressedIds(url, "c");

		setEnabledConstraintIds(constraintIds);

		expect(getEnabledConstraintIds().has(2)).toBe(true);
		expect(getEnabledConstraintIds().has(4)).toBe(true);
		expect(getEnabledConstraintIds().size).toBe(2);
	});

	it("should sync all state types from compressed URL", () => {
		const pEncoded = encodeIds([1, 5]);
		const eEncoded = encodeIds([7]);
		const cEncoded = encodeIds([3]);
		const url = new URL(`http://example.com?p=${pEncoded}&e=${eEncoded}&c=${cEncoded}`);

		setPinnedCardIds(parseCompressedIds(url, "p"));
		setExcludedCardIds(parseCompressedIds(url, "e"));
		setEnabledConstraintIds(parseCompressedIds(url, "c"));

		expect(getPinnedCardIds()).toEqual(new Set([1, 5]));
		expect(getExcludedCardIds()).toEqual(new Set([7]));
		expect(getEnabledConstraintIds()).toEqual(new Set([3]));
	});

	it("should clear state when URL has no state parameters", () => {
		setPinnedCardIds(new Set([1]));
		setExcludedCardIds(new Set([7]));
		setEnabledConstraintIds(new Set([3]));

		const url = new URL("http://example.com");
		setPinnedCardIds(parseCompressedIds(url, "p"));
		setExcludedCardIds(parseCompressedIds(url, "e"));
		setEnabledConstraintIds(parseCompressedIds(url, "c"));

		expect(getPinnedCardIds().size).toBe(0);
		expect(getExcludedCardIds().size).toBe(0);
		expect(getEnabledConstraintIds().size).toBe(0);
	});
});

describe("State -> URL sync (integration)", () => {
	beforeEach(() => {
		setPinnedCardIds(new Set());
		setExcludedCardIds(new Set());
		setEnabledConstraintIds(new Set());
	});

	it("should build URL with current pinned state", () => {
		setPinnedCardIds(new Set([1, 5]));

		const currentUrl = new URL("http://example.com");
		const result = buildUrlWithCardState(
			currentUrl,
			getPinnedCardIds(),
			getExcludedCardIds(),
			getEnabledConstraintIds(),
		);

		expect(new Set(decodeIds(result.searchParams.get("p")!))).toEqual(new Set([1, 5]));
	});

	it("should build URL with current excluded state", () => {
		setExcludedCardIds(new Set([7, 9]));

		const currentUrl = new URL("http://example.com");
		const result = buildUrlWithCardState(
			currentUrl,
			getPinnedCardIds(),
			getExcludedCardIds(),
			getEnabledConstraintIds(),
		);

		expect(new Set(decodeIds(result.searchParams.get("e")!))).toEqual(new Set([7, 9]));
	});

	it("should build URL with current constraint state", () => {
		setEnabledConstraintIds(new Set([2, 4]));

		const currentUrl = new URL("http://example.com");
		const result = buildUrlWithCardState(
			currentUrl,
			getPinnedCardIds(),
			getExcludedCardIds(),
			getEnabledConstraintIds(),
		);

		expect(new Set(decodeIds(result.searchParams.get("c")!))).toEqual(new Set([2, 4]));
	});

	it("should remove state parameters when state is empty", () => {
		const pEncoded = encodeIds([1]);
		const eEncoded = encodeIds([7]);
		const currentUrl = new URL(`http://example.com?p=${pEncoded}&e=${eEncoded}`);

		const result = buildUrlWithCardState(
			currentUrl,
			getPinnedCardIds(),
			getExcludedCardIds(),
			getEnabledConstraintIds(),
		);

		expect(result.searchParams.has("p")).toBe(false);
		expect(result.searchParams.has("e")).toBe(false);
		expect(result.searchParams.has("c")).toBe(false);
	});

	it("should preserve non-state parameters when state changes", () => {
		const currentUrl = new URL("http://example.com?card=10&foo=bar");
		setPinnedCardIds(new Set([1]));

		const result = buildUrlWithCardState(
			currentUrl,
			getPinnedCardIds(),
			getExcludedCardIds(),
			getEnabledConstraintIds(),
		);

		expect(result.searchParams.getAll("card")).toEqual(["10"]);
		expect(result.searchParams.get("foo")).toBe("bar");
	});

	it("should round-trip all state through URL", () => {
		const originalPinned = new Set([1, 5, 12]);
		const originalExcluded = new Set([7, 9]);
		const originalConstraints = new Set([2, 4]);

		setPinnedCardIds(originalPinned);
		setExcludedCardIds(originalExcluded);
		setEnabledConstraintIds(originalConstraints);

		const url = buildUrlWithCardState(
			new URL("http://example.com"),
			getPinnedCardIds(),
			getExcludedCardIds(),
			getEnabledConstraintIds(),
		);

		expect(parseCompressedIds(url, "p")).toEqual(originalPinned);
		expect(parseCompressedIds(url, "e")).toEqual(originalExcluded);
		expect(parseCompressedIds(url, "c")).toEqual(originalConstraints);
	});
});
