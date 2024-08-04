import { assert } from "typia";
import { describe, expect, expectTypeOf, it } from "vitest";
import { commons } from "../../src/basic/common";
import type { CommonCard } from "../../src/type";

describe("basic/common", () => {
  it.each(commons)("card($id) satisfy type `CommonCard`", (common) => {
    expectTypeOf(assert<CommonCard>(common)).toEqualTypeOf<CommonCard>();
    if (common.cards) {
      expect(common.cards.length).toBe(5);
    }
  });
});
