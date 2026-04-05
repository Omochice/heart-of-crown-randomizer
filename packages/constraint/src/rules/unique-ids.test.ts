import { describe, expect, it } from "vitest";
import { allConstraints } from "./index";

describe("constraint ID uniqueness", () => {
  it("has no duplicate ids", () => {
    const ids = allConstraints.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
