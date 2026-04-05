import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  commonCardArb,
  contextArb,
  describeApplyInvariants,
} from "../_test-helpers";
import { link2Gte3 } from "./index";

describe("link2Gte3", () => {
  describeApplyInvariants("link2Gte3", link2Gte3);

  const link2ContextArb = contextArb({
    minLength: 8,
    maxLength: 30,
  }).filter((ctx) => link2Gte3.canApply(ctx));

  test.prop([link2ContextArb])(
    "after apply, required contains at least 3 link-2 cards",
    (ctx) => {
      const result = link2Gte3.apply(ctx);
      const link2InRequired = result.required.filter(
        (c) => !c.hasChild && c.link === 2,
      ).length;
      expect(link2InRequired).toBeGreaterThanOrEqual(3);
    },
  );

  test.prop([fc.array(commonCardArb, { minLength: 0, maxLength: 20 })])(
    "isSatisfied is true iff at least 3 cards have link=2",
    (cards) => {
      const link2Count = cards.filter(
        (c) => !c.hasChild && c.link === 2,
      ).length;
      expect(link2Gte3.isSatisfied(cards)).toBe(link2Count >= 3);
    },
  );
});
