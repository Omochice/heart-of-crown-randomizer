import { fc, test } from "@fast-check/vitest";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { describe, expect } from "vitest";
import type { PickContext, SelectionContext } from "../../type";
import {
  commonCardArb,
  contextArb,
  describeApplyInvariants,
  duplicateCardArb,
} from "../shared/test-helpers";
import { link2GteLink0 } from "./index";

function uniqueById(cards: CommonCard[]): CommonCard[] {
  const seen = new Set<number>();
  return cards.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

function isLink0(c: CommonCard): boolean {
  return !c.hasChild && c.link === 0;
}

function isLink2(c: CommonCard): boolean {
  return !c.hasChild && c.link === 2;
}

const pickContextArb: fc.Arbitrary<PickContext> = fc
  .record({
    picked: fc.array(commonCardArb, { minLength: 0, maxLength: 10 }),
    rawPool: fc.array(commonCardArb, { minLength: 1, maxLength: 20 }),
    extraRemaining: fc.integer({ min: 0, max: 9 }),
  })
  .map(({ picked, rawPool, extraRemaining }) => {
    const pickedIds = new Set(picked.map((c) => c.id));
    const pool = uniqueById(rawPool.filter((c) => !pickedIds.has(c.id)));
    return {
      picked,
      pool,
      remainingCount: 1 + extraRemaining,
    };
  })
  .filter((ctx) => ctx.pool.length > 0);

/**
 * Only contexts where the constraint is still satisfiable
 * (budget + remainingCount >= 1) so the filter can guarantee
 * that every allowed pick preserves satisfiability.
 */
const satisfiablePickContextArb: fc.Arbitrary<PickContext> =
  pickContextArb.filter((ctx) => {
    const budget =
      ctx.picked.filter(isLink2).length - ctx.picked.filter(isLink0).length;
    return budget + ctx.remainingCount >= 1;
  });

/**
 * Contexts where the pool has enough link-2 cards relative to count,
 * guaranteeing the iterative selection can always satisfy the constraint.
 */
const link2SufficientContextArb = contextArb({
  minLength: 8,
  maxLength: 30,
  cardArb: duplicateCardArb,
}).filter((ctx) => {
  if (!link2GteLink0.canApply(ctx)) return false;
  const poolLink2 = ctx.pool.filter(isLink2).length;
  return poolLink2 >= Math.ceil(ctx.count / 2);
});

function simulateIterativeSelect(ctx: SelectionContext): CommonCard[] {
  const applied = link2GteLink0.apply(ctx);
  const picked = [...applied.required];
  let pool = [...applied.pool];
  let remaining = applied.count - picked.length;

  while (remaining > 0 && pool.length > 0) {
    const available =
      link2GteLink0.filterPoolForNextPick?.({
        picked,
        pool,
        remainingCount: remaining,
      }) ?? [];
    if (available.length === 0) break;
    const card = available[Math.floor(applied.rng() * available.length)];
    picked.push(card);
    pool = pool.filter((c) => c !== card);
    remaining--;
  }
  return picked;
}

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

  describe("filterPoolForNextPick", () => {
    test.prop([pickContextArb])("result is a subset of input pool", (ctx) => {
      const result = link2GteLink0.filterPoolForNextPick?.(ctx) ?? [];
      for (const card of result) {
        expect(ctx.pool).toContain(card);
      }
    });

    test.prop([
      satisfiablePickContextArb.filter((ctx) => {
        const result = link2GteLink0.filterPoolForNextPick?.(ctx) ?? [];
        return result.length > 0;
      }),
    ])("picking any card from result keeps constraint satisfiable", (ctx) => {
      const available = link2GteLink0.filterPoolForNextPick?.(ctx) ?? [];
      for (const card of available) {
        const newPicked = [...ctx.picked, card];
        const link0Count = newPicked.filter(isLink0).length;
        const link2Count = newPicked.filter(isLink2).length;
        const newBudget = link2Count - link0Count;
        // After this pick, (remainingCount - 1) picks remain.
        // The filter guarantees the new slack stays non-negative.
        const newSlack = newBudget + (ctx.remainingCount - 1);
        expect(newSlack).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("full iterative selection", () => {
    test.prop([link2SufficientContextArb])(
      "always satisfies isSatisfied and selects exactly count cards",
      (ctx) => {
        const applied = link2GteLink0.apply(ctx);
        const result = simulateIterativeSelect(ctx);
        expect(result).toHaveLength(applied.count);
        expect(link2GteLink0.isSatisfied(result)).toBe(true);
      },
    );
  });
});
