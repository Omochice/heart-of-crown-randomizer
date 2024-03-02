import { describe, expect, test } from "vitest";
import { commons } from "../../src/far-eastern-border/common";
import { isCommonCard } from "../../src/type";

describe("far-eastern-border/common", () => {
  test("check schema", () => {
    for (const common of commons) {
      expect(isCommonCard(common)).toBe(true);
      if (common.cards) {
        expect(common.cards.length).toBe(5);
      }
    }
  });
});
