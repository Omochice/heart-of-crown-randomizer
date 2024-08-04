import { describe, expect, test as it } from "vitest";
import { commons, princesses } from "../../src/far-eastern-border";

describe("basic/index", () => {
  it("Each card kind should have individual id", () => {
    const cards = [...princesses, ...commons];
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
  });
});
