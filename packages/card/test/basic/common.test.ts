import { describe, expect, test } from "vitest";
import { commons } from "../../src/basic/common";
import { isCommonCard } from "../../src/type";

describe("basic/common", () => {
  test("check schema", () => {
    for (const common of commons) {
      expect(isCommonCard(common)).toBe(true);
      if (common.cards) {
        expect(common.cards.length).toBe(5);
      }
    }
  });
});
