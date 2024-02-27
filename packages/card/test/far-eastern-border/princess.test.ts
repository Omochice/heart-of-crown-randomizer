import { describe, expect, test } from "vitest";
import { princesses } from "../../src/far-eastern-border/princess";
import { isPrincess } from "../../src/type";

describe("far-eastern-border/princess", () => {
  test("check schema", () => {
    for (const princess of princesses) {
      expect(isPrincess(princess)).toBe(true);
    }
  });
});
