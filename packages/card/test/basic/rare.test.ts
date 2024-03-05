import { describe, expect, test } from "vitest";
import { rares } from "../../src/basic/rare";
import { isRareCard } from "../../src/type";

describe("basic/rare", () => {
  test("check schema", () => {
    for (const rare of rares) {
      expect(isRareCard(rare)).toBe(true);
    }
  });
});
