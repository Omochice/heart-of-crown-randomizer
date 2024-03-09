import { describe, expect, test } from "vitest";
import { commons, princesses } from "../../src/far-eastern-border";

describe("basic/index", () => {
  test("Each card kind should have individual id", () => {
    const cards = [...princesses, ...commons];
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
  });
});
