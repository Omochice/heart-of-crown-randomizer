import { describe, expect, it } from "vitest";
import { allConstraints } from "./index";

describe("constraint ID uniqueness", () => {
  it("has no duplicate ids", () => {
    const ids = allConstraints.map((c) => c.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(
      duplicates,
      `Duplicate constraint IDs: ${duplicates.join(", ")}`,
    ).toHaveLength(0);
  });
});
