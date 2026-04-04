import { describe, expect, test } from "vitest";
import { encodeCardIds } from "./encode";

describe("encodeCardIds", () => {
  test("returns empty string for empty input", () => {
    expect(encodeCardIds([])).toBe("");
  });
});
