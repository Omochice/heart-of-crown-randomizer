import { describe, expect, test } from "vitest";
import { princesses, commons, rares, basics } from "../../src/basic";

describe("basic/index", () => {
  test("Each card kind should have individual id", () => {
    const cards = [...princesses, ...commons, ...rares, ...basics];
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
  });
});
