import { describe, expectTypeOf, it, expect } from "vitest";
import { commons } from "../../src/far-eastern-border/common";
import type { CommonCard, UniqueCard } from "../../src/type";
import { assert, is } from "typia";

describe("far-eastern-border/common", () => {
  it.each(commons)("card($id) satisfy type `CommonCard`", (common) => {
    expectTypeOf(assert<CommonCard>(common)).toEqualTypeOf<CommonCard>();
    if (is<UniqueCard>(common)) {
      expect(common.cards.length).toBe(5);
    }
  });
});
