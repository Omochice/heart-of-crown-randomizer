import { fc, test } from "@fast-check/vitest";
import type {
  CommonCard,
  DuplicateCard,
  MainType,
  UniqueCard,
} from "@heart-of-crown-randomizer/card/type";
import { describe, expect } from "vitest";
import type { Constraint, SelectionContext } from "../../type";

// -- Unit test helpers --

export function makeDuplicateCard(
  overrides: Partial<DuplicateCard> = {},
): DuplicateCard {
  return {
    id: 1,
    type: "common",
    name: "Test Card",
    mainType: ["action"],
    cost: 3,
    link: 1,
    effect: "test",
    hasChild: false,
    edition: 0,
    ...overrides,
  };
}

export function makeContext(
  overrides: Partial<SelectionContext> = {},
): SelectionContext {
  return {
    pool: [],
    required: [],
    count: 10,
    rng: Math.random,
    ...overrides,
  };
}

export function seededRng(initialSeed = 42): () => number {
  let seed = initialSeed;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// -- Property test arbitraries --

export const mainTypeArb: fc.Arbitrary<MainType> = fc.constantFrom(
  "action",
  "attack",
  "territory",
  "princess",
  "succession",
  "disaster",
);

export const linkArb: fc.Arbitrary<0 | 1 | 2> = fc.constantFrom(0, 1, 2);

export const duplicateCardArb: fc.Arbitrary<DuplicateCard> = fc
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

export const uniqueCardArb: fc.Arbitrary<UniqueCard> = fc
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

export const commonCardArb: fc.Arbitrary<CommonCard> = fc.oneof(
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

export function contextArb(
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

// -- Shared property test --

/**
 * For every constraint: when canApply is true, apply must not change count,
 * must not create cards, and must keep original required cards.
 */
export function describeApplyInvariants(
  name: string,
  constraint: Constraint,
): void {
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
