import { describe, expect, test } from "vitest";
import { princesses } from "../../src/far-eastern-border/princess";
import { isPrincess } from "../../src/type";

describe("far-eastern-border/princess", () => {
  test("check schema", () => {
    princesses.forEach((princess: unknown) => {
      expect(isPrincess(princess)).toBe(true);
    });
  });
});
