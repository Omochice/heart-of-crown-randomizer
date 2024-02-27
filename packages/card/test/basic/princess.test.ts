import { describe, expect, test } from "vitest";
import { princesses } from "../../src/basic/princess";
import { isPrincess } from "../../src/type";

describe("basic/princess", () => {
  test("check schema", () => {
    for (const princess of princesses) {
      expect(isPrincess(princess)).toBe(true);
    }
  });
});
