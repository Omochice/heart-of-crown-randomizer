import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  commonCardArb,
  contextArb,
  describeApplyInvariants,
} from "../shared/test-helpers";
import { link2GteLink0 } from "./index";

describe("link2GteLink0", () => {
  describeApplyInvariants("link2GteLink0", link2GteLink0);

  const link2RichContextArb = contextArb({
    minLength: 8,
    maxLength: 30,
  }).filter((ctx) => link2GteLink0.canApply(ctx));

  test.prop([link2RichContextArb])(
    "after apply, required link-2 covers required link-0",
    (ctx) => {
      const result = link2GteLink0.apply(ctx);
      const link2InRequired = result.required.filter(
        (c) => !c.hasChild && c.link === 2,
      ).length;
      const link0InRequired = result.required.filter(
        (c) => !c.hasChild && c.link === 0,
      ).length;
      expect(link2InRequired).toBeGreaterThanOrEqual(link0InRequired);
    },
  );

  test.prop([fc.array(commonCardArb, { minLength: 0, maxLength: 20 })])(
    "isSatisfied is true iff link-2 count >= link-0 count",
    (cards) => {
      const link0 = cards.filter((c) => !c.hasChild && c.link === 0).length;
      const link2 = cards.filter((c) => !c.hasChild && c.link === 2).length;
      expect(link2GteLink0.isSatisfied(cards)).toBe(link2 >= link0);
    },
  );
});
