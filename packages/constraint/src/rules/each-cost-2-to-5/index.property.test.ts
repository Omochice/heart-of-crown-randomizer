import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  commonCardArb,
  contextArb,
  describeApplyInvariants,
} from "../shared/test-helpers";
import { eachCost2to5 } from "./index";

describe("eachCost2to5", () => {
  describeApplyInvariants("eachCost2to5", eachCost2to5);

  const eachCostContextArb = contextArb({
    minLength: 10,
    maxLength: 30,
  }).filter((ctx) => eachCost2to5.canApply(ctx));

  test.prop([eachCostContextArb])(
    "after apply, required covers each cost 2, 3, 4, 5",
    (ctx) => {
      const result = eachCost2to5.apply(ctx);
      for (const cost of [2, 3, 4, 5]) {
        expect(result.required.some((c) => c.cost === cost)).toBe(true);
      }
    },
  );

  test.prop([fc.array(commonCardArb, { minLength: 0, maxLength: 20 })])(
    "isSatisfied is true iff cards include each cost 2, 3, 4, 5",
    (cards) => {
      const hasCosts = [2, 3, 4, 5].every((cost) =>
        cards.some((c) => c.cost === cost),
      );
      expect(eachCost2to5.isSatisfied(cards)).toBe(hasCosts);
    },
  );
});
