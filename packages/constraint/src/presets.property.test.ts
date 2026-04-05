import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  eachCost2to5,
  highCostGte2,
  link2Gte3,
  link2GteLink0,
  noAttack,
} from "./presets";
import {
  commonCardArb,
  contextArb,
  describeApplyInvariants,
} from "./rules/_test-helpers";

describe("noAttack", () => {
  describeApplyInvariants("noAttack", noAttack);

  test.prop([contextArb()])(
    "after apply, pool contains no attack cards",
    (ctx) => {
      if (!noAttack.canApply(ctx)) return;
      const result = noAttack.apply(ctx);
      for (const card of result.pool) {
        if (card.hasChild) {
          expect(card.cards.every((s) => !s.mainType.includes("attack"))).toBe(
            true,
          );
        } else {
          expect(card.mainType.includes("attack")).toBe(false);
        }
      }
    },
  );

  test.prop([fc.array(commonCardArb, { minLength: 0, maxLength: 20 })])(
    "isSatisfied is true iff no card has attack type",
    (cards) => {
      const hasAttack = cards.some((c) =>
        c.hasChild
          ? c.cards.some((s) => s.mainType.includes("attack"))
          : c.mainType.includes("attack"),
      );
      expect(noAttack.isSatisfied(cards)).toBe(!hasAttack);
    },
  );
});

describe("link2GteLink0", () => {
  describeApplyInvariants("link2GteLink0", link2GteLink0);

  const link2RichContextArb = contextArb({
    minLength: 8,
    maxLength: 30,
  }).filter((ctx) => link2GteLink0.canApply(ctx));

  test.prop([link2RichContextArb])(
    "after apply, pool link-0 count <= required link-2 count",
    (ctx) => {
      const result = link2GteLink0.apply(ctx);
      const link0InPool = result.pool.filter(
        (c) => !c.hasChild && c.link === 0,
      ).length;
      const link2InRequired = result.required.filter(
        (c) => !c.hasChild && c.link === 2,
      ).length;
      expect(link0InPool).toBeLessThanOrEqual(link2InRequired);
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
