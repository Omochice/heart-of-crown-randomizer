import { describe, expectTypeOf, it } from "vitest";
import { basics } from "../../src/basic/basic";
import type { BasicCard } from "../../src/type";
import { assert } from "typia";

describe("basic/basic", () => {
  it.each(basics)("card($id) satisfy type `BasicCard`", (basic) => {
    expectTypeOf(assert<BasicCard>(basic)).toEqualTypeOf<BasicCard>();
  });
});
