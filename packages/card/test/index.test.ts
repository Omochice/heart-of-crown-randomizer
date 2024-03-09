import { describe, expect, test } from "vitest";
import { Basic, FarEasternBorder } from "../src";

describe("index", () => {
  test("Each card kind should have individual id", () => {
    const cards = [
      ...[
        ...Basic.princesses,
        ...Basic.commons,
        ...Basic.rares,
        ...Basic.basics,
      ],
      ...[...FarEasternBorder.princesses, ...FarEasternBorder.commons],
    ];
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
  });
});
