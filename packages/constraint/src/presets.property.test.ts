import { fc, test } from "@fast-check/vitest";
import type {
  CommonCard,
  DuplicateCard,
  MainType,
  UniqueCard,
} from "@heart-of-crown-randomizer/card/type";
import { describe, expect } from "vitest";
import {
  eachCost2to5,
  highCostGte2,
  link2Gte3,
  link2GteLink0,
  noAttack,
} from "./presets";
import type { Constraint, SelectionContext } from "./type";

// -- Arbitraries --

const mainTypeArb: fc.Arbitrary<MainType> = fc.constantFrom(
  "action",
  "attack",
  "territory",
  "princess",
  "succession",
  "disaster",
);

const linkArb: fc.Arbitrary<0 | 1 | 2> = fc.constantFrom(0, 1, 2);

const duplicateCardArb: fc.Arbitrary<DuplicateCard> = fc
  .record({
    id: fc.integer({ min: 1, max: 10000 }),
    mainType: fc.array(mainTypeArb, { minLength: 1, maxLength: 3 }),
    cost: fc.integer({ min: 1, max: 8 }),
    link: linkArb,
  })
  .map(({ id, mainType, cost, link }) => ({
    id,
    type: "common" as const,
    name: `Card ${id}`,
    mainType,
    cost,
    link,
    effect: "effect",
    hasChild: false as const,
    edition: 0 as const,
  }));

const uniqueCardArb: fc.Arbitrary<UniqueCard> = fc
  .record({
    id: fc.integer({ min: 10001, max: 20000 }),
    cost: fc.integer({ min: 1, max: 8 }),
    subMainTypes: fc.array(mainTypeArb, { minLength: 1, maxLength: 2 }),
  })
  .map(({ id, cost, subMainTypes }) => ({
    id,
    type: "common" as const,
    name: `Unique ${id}`,
    cards: subMainTypes.map((mt, i) => ({
      name: `Sub ${i}`,
      mainType: [mt],
      cost,
      link: (i % 3) as 0 | 1 | 2,
      effect: "sub effect",
    })),
    cost,
    hasChild: true as const,
    edition: 0 as const,
  }));

const commonCardArb: fc.Arbitrary<CommonCard> = fc.oneof(
  { weight: 8, arbitrary: duplicateCardArb },
  { weight: 1, arbitrary: uniqueCardArb },
);

function uniqueById(cards: CommonCard[]): CommonCard[] {
  const seen = new Set<number>();
  return cards.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

function contextArb(
  poolConstraints?: {
    minLength?: number;
    maxLength?: number;
    cardArb?: fc.Arbitrary<CommonCard>;
  },
  countRange?: { min: number; max: number },
): fc.Arbitrary<SelectionContext> {
  const cardGen = poolConstraints?.cardArb ?? commonCardArb;
  return fc
    .record({
      pool: fc
        .array(cardGen, {
          minLength: poolConstraints?.minLength ?? 5,
          maxLength: poolConstraints?.maxLength ?? 30,
        })
        .map(uniqueById),
      count: fc.integer({
        min: countRange?.min ?? 3,
        max: countRange?.max ?? 12,
      }),
      seed: fc.integer({ min: 1, max: 2147483646 }),
    })
    .filter(({ pool, count }) => pool.length >= count)
    .map(({ pool, count, seed }) => ({
      pool,
      required: [] as CommonCard[],
      count,
      rng: seededRng(seed),
    }));
}

function seededRng(initialSeed: number): () => number {
  let seed = initialSeed;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// -- Shared properties --

/**
 * For every constraint: when canApply is true, apply must not change count,
 * must not create cards, and must keep original required cards.
 */
function describeApplyInvariants(name: string, constraint: Constraint) {
  describe(`${name} - apply invariants`, () => {
    test.prop([contextArb()])(
      "apply never creates cards (total can only shrink or stay)",
      (ctx) => {
        if (!constraint.canApply(ctx)) return;
        const result = constraint.apply(ctx);
        const before = ctx.pool.length + ctx.required.length;
        const after = result.pool.length + result.required.length;
        expect(after).toBeLessThanOrEqual(before);
      },
    );

    test.prop([contextArb()])("apply does not change count", (ctx) => {
      if (!constraint.canApply(ctx)) return;
      const result = constraint.apply(ctx);
      expect(result.count).toBe(ctx.count);
    });

    test.prop([contextArb()])(
      "apply keeps required as superset of original required",
      (ctx) => {
        if (!constraint.canApply(ctx)) return;
        const result = constraint.apply(ctx);
        for (const card of ctx.required) {
          expect(result.required).toContain(card);
        }
      },
    );
  });
}

// -- Constraint-specific properties --

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
