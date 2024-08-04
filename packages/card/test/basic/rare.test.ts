import { assert } from "typia";
import { describe, expectTypeOf, it } from "vitest";
import { rares } from "../../src/basic/rare";
import type { RareCard } from "../../src/type";

describe("basic/rare", () => {
  it.each(rares)("card($id) satisfy type `RareCard`", (rare) => {
    expectTypeOf(assert<RareCard>(rare)).toEqualTypeOf<RareCard>();
  });
});
