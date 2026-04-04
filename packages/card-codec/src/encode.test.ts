import { describe, expect, test } from "vitest";
import { encodeCardIds } from "./encode";

describe("encodeCardIds", () => {
  test("returns empty string for empty input", () => {
    expect(encodeCardIds([])).toBe("");
  });

  test("encodes single card id 0 to base64url", () => {
    // ID 0: byte[0] |= 1 << 0 = 0x01, base64 of [0x01] = "AQ"
    expect(encodeCardIds([0])).toBe("AQ");
  });
});
