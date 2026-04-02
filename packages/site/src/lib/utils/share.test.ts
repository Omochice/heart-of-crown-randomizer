import { describe, expect, it, vi } from "vitest";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { buildShareUrl, shareOrCopy } from "./share";

function makeCard(id: number): CommonCard {
	return {
		id,
		type: "common",
		name: `Card ${id}`,
		mainType: ["action"],
		cost: id,
		link: 1,
		effect: "",
		hasChild: false,
		edition: 0,
	} as CommonCard;
}

describe("buildShareUrl", () => {
	it("should build share URL with origin and card query params", () => {
		const cards = [makeCard(1), makeCard(5), makeCard(12)];

		const result = buildShareUrl("https://example.com", cards);

		expect(result).toBe("https://example.com?card=1&card=5&card=12");
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
