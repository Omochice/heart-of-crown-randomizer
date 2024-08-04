import { it, describe, expect, expectTypeOf } from "vitest";
import { commons } from "../../src/basic/common";
import type { CommonCard } from "../../src/type";
import { assert } from "typia";

describe("basic/common", () => {
  it.each(commons)("card($id) satisfy type `CommonCard`", (common) => {
    expectTypeOf(assert<CommonCard>(common)).toEqualTypeOf<CommonCard>();
    if (common.cards) {
      expect(common.cards.length).toBe(5);
    }
  });
});
