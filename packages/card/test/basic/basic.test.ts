import { assert } from "typia";
import { describe, expectTypeOf, it } from "vitest";
import { basics } from "../../src/basic/basic";
import type { BasicCard } from "../../src/type";

describe("basic/basic", () => {
  it.each(basics)("card($id) satisfy type `BasicCard`", (basic) => {
    expectTypeOf(assert<BasicCard>(basic)).toEqualTypeOf<BasicCard>();
  });
});
