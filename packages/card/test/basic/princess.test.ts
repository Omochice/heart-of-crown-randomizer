import { describe, expect, test } from "vitest";
import { princesses } from "../../src/basic/princess";
import { isPrincess } from "../../src/type";

describe("basic/princess", () => {
  test("check schema", () => {
    princesses.forEach((princess: unknown) => {
      expect(isPrincess(princess)).toBe(true);
    });
  });
});
