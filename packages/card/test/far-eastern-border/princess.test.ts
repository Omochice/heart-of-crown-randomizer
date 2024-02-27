import { describe, expect, test } from "vitest";
import { isPrincess } from "../../src/type";
import { princesses } from "../../src/far-eastern-border/princess"

describe("far-eastern-border/princess", () => {
  test("check schema", () => {
    princesses.forEach((princess: unknown) => {
      expect(isPrincess(princess)).toBe(true);
    });
  });
});
