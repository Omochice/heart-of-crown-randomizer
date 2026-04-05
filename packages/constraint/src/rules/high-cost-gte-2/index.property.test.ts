import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  commonCardArb,
  contextArb,
  describeApplyInvariants,
} from "../shared/test-helpers";
import { highCostGte2 } from "./index";

describe("highCostGte2", () => {
  describeApplyInvariants("highCostGte2", highCostGte2);

  const highCostContextArb = contextArb({
    minLength: 8,
    maxLength: 30,
  }).filter((ctx) => highCostGte2.canApply(ctx));

  test.prop([highCostContextArb])(
    "after apply, required contains at least 2 high-cost cards",
    (ctx) => {
      const result = highCostGte2.apply(ctx);
      const highCostInRequired = result.required.filter(
        (c) => c.cost >= 5,
      ).length;
      expect(highCostInRequired).toBeGreaterThanOrEqual(2);
    },
  );

  test.prop([fc.array(commonCardArb, { minLength: 0, maxLength: 20 })])(
    "isSatisfied is true iff at least 2 cards have cost >= 5",
    (cards) => {
      const highCostCount = cards.filter((c) => c.cost >= 5).length;
      expect(highCostGte2.isSatisfied(cards)).toBe(highCostCount >= 2);
    },
  );
});
