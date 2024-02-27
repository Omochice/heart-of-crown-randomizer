import { describe, expect, test } from "vitest";
import { isPrincess } from "../../src/type";
import { princesses } from "../../src/basic/princess"

describe("basic/princess", () => {
  test("check schema", () => {
    princesses.forEach((princess: unknown) => {
      expect(isPrincess(princess)).toBe(true);
    });
  });
});
