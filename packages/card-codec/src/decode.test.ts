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
});
