import { describe, expectTypeOf, it } from "vitest";
import { rares } from "../../src/basic/rare";
import type { RareCard } from "../../src/type";
import { assert } from "typia";

describe("basic/rare", () => {
  it.each(rares)("card($id) satisfy type `RareCard`", (rare) => {
    expectTypeOf(assert<RareCard>(rare)).toEqualTypeOf<RareCard>();
  });
});
