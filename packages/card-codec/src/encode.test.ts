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

  test("encodes multiple card ids into a bitfield", () => {
    // ID 17: byte[2] |= 1<<1 = 0x02
    // ID 23: byte[2] |= 1<<7 = 0x80 -> byte[2] = 0x82
    // ID 35: byte[4] |= 1<<3 = 0x08
    // bytes = [0x00, 0x00, 0x82, 0x00, 0x08]
    // bytes = [0x00, 0x00, 0x82, 0x00, 0x08] -> base64url "AACCAAg"
    expect(encodeCardIds([17, 23, 35])).toBe("AACCAAg");
  });

  test("output contains only URL-safe characters", () => {
    const ids = Array.from({ length: 72 }, (_, i) => i);
    const result = encodeCardIds(ids);
    expect(result).toMatch(/^[A-Za-z0-9_-]*$/);
  });

  test("produces shorter output for lower card ids due to trailing zero stripping", () => {
    expect(encodeCardIds([0]).length).toBeLessThan(encodeCardIds([71]).length);
  });

  test("handles high card id without throwing", () => {
    const result = encodeCardIds([200]);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});
