import { describe, expect, it } from "vitest";
import { basics, commons, princesses, rares } from "../../src/basic";

describe("basic/index", () => {
  it("Each card kind should have individual id", () => {
    const cards = [...princesses, ...commons, ...rares, ...basics];
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
  });
});
