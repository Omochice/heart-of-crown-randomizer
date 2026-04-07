import { decodeIds } from "@heart-of-crown-randomizer/id-codec";
import { describe, expect, it, vi } from "vitest";
import { makeCard } from "$lib/test-helpers";
import { buildShareText, buildShareUrl, shareOrCopy } from "./share";

describe("buildShareUrl", () => {
  it("should build share URL with compressed 's' parameter that round-trips back to original card IDs", () => {
    const cards = [makeCard(1), makeCard(5), makeCard(12)];

    const result = buildShareUrl("https://example.com", cards);

    expect(result).toMatch(/^https:\/\/example\.com\?s=.+$/);
    const sParam = new URL(result).searchParams.get("s") ?? "";
    expect(decodeIds(sParam)).toEqual([1, 5, 12]);
  });

  it("should return empty string for empty cards", () => {
    const result = buildShareUrl("https://example.com", []);

    expect(result).toBe("");
  });
});

describe("buildShareText", () => {
  it("should include card names without URL", () => {
    const result = buildShareText(["願いの泉", "寄付", "交易船"]);

    expect(result).toBe(
      "ハトクラなう。今回のサプライ: 願いの泉, 寄付, 交易船 #hatokura #ハトクラ",
    );
  });
});

describe("shareOrCopy", () => {
  const cardNames = ["願いの泉", "寄付"];
  const url = "https://example.com?card=1";
  const expectedText = buildShareText(cardNames);

  it("should call navigator.share with text containing card names", async () => {
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      value: { share: shareMock, clipboard: { writeText: vi.fn() } },
      writable: true,
    });

    await shareOrCopy(url, cardNames);

    expect(shareMock).toHaveBeenCalledWith({
      url,
      title: "ハートオブクラウンランダマイザー",
      text: expectedText,
    });
  });

  it("should fall back to clipboard with share text when share fails", async () => {
    const clipboardMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      value: {
        share: vi.fn().mockRejectedValue(new Error("not supported")),
        clipboard: { writeText: clipboardMock },
      },
      writable: true,
    });

    await shareOrCopy(url, cardNames);

    expect(clipboardMock).toHaveBeenCalledWith(`${expectedText} ${url}`);
  });
});
