import { describe, expect, test } from "vitest";
import { decodeCardIds } from "./decode";

describe("decodeCardIds", () => {
  test("returns empty array for empty string input", () => {
    expect(decodeCardIds("")).toEqual([]);
  });

  test("decodes single byte with bit 0 set", () => {
    // 0x01 = bit 0 set, base64url("\\x01") = "AQ"
    expect(decodeCardIds("AQ")).toEqual([0]);
  });

  test("decodes single byte with bit 7 set", () => {
    // 0x80 = bit 7 set, base64url("\\x80") = "gA"
    expect(decodeCardIds("gA")).toEqual([7]);
  });

  test("decodes multi-byte input for card ID 17", () => {
    // ID 17: byte[2] = 0x02 (bit 1 of byte 2 = bit 17 overall)
    // bytes [0x00, 0x00, 0x02] -> base64 "AAAC" -> base64url "AAAC"
    expect(decodeCardIds("AAAC")).toEqual([17]);
  });
});
