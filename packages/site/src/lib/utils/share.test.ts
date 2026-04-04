import { describe, expect, it, vi } from "vitest";
import { buildShareUrl, shareOrCopy } from "./share";
import { makeCard } from "$lib/test-helpers";
import { decodeCardIds } from "@heart-of-crown-randomizer/card-codec";

describe("buildShareUrl", () => {
	it("should build share URL with compressed 's' parameter that round-trips back to original card IDs", () => {
		const cards = [makeCard(1), makeCard(5), makeCard(12)];

		const result = buildShareUrl("https://example.com", cards);

		expect(result).toMatch(/^https:\/\/example\.com\?s=.+$/);
		const sParam = new URL(result).searchParams.get("s")!;
		expect(decodeCardIds(sParam)).toEqual([1, 5, 12]);
	});

	it("should return empty string for empty cards", () => {
		const result = buildShareUrl("https://example.com", []);

		expect(result).toBe("");
	});
});

describe("shareOrCopy", () => {
	it("should call navigator.share when available", async () => {
		const shareMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(globalThis, "navigator", {
			value: { share: shareMock, clipboard: { writeText: vi.fn() } },
			writable: true,
		});

		await shareOrCopy("https://example.com?card=1");

		expect(shareMock).toHaveBeenCalledWith({
			url: "https://example.com?card=1",
			title: "ハートオブクラウンランダマイザー",
		});
	});

	it("should fall back to clipboard when share fails", async () => {
		const clipboardMock = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(globalThis, "navigator", {
			value: {
				share: vi.fn().mockRejectedValue(new Error("not supported")),
				clipboard: { writeText: clipboardMock },
			},
			writable: true,
		});

		await shareOrCopy("https://example.com?card=1");

		expect(clipboardMock).toHaveBeenCalledWith("https://example.com?card=1");
	});
});
