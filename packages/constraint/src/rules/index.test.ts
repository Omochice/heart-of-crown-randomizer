import { describe, expect, it } from "vitest";
import { allConstraints } from "./index";

describe("allConstraints", () => {
  it("contains 5 constraints", () => {
    expect(allConstraints).toHaveLength(5);
  });

  it("is sorted by id in ascending order", () => {
    for (let i = 1; i < allConstraints.length; i++) {
      expect(allConstraints[i].id).toBeGreaterThan(allConstraints[i - 1].id);
    }
  });
});
