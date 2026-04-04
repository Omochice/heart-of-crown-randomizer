import { describe, expect, test } from "vitest";
import { decodeCardIds } from "./decode";

describe("decodeCardIds", () => {
  test("returns empty array for empty string input", () => {
    expect(decodeCardIds("")).toEqual([]);
  });
});
