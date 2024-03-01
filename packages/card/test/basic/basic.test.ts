import { describe, expect, test } from "vitest";
import { basics } from "../../src/basic/basic";
import { isBasicCard } from "../../src/type";

describe("basic/basic", () => {
  test("check schema", () => {
    for (const basic of basics) {
      expect(isBasicCard(basic)).toBe(true);
    }
  });
});
