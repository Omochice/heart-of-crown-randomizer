import type {
  CommonCard,
  DuplicateCard,
  UniqueCard,
} from "@heart-of-crown-randomizer/card/type";
import { describe, expect, it } from "vitest";
import {
  disasterGte1,
  highCostGte2,
  link0GteLink2,
  noAttack,
} from "./presets.js";
import type { SelectionContext } from "./type.js";

function makeDuplicateCard(
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

function makeUniqueCard(overrides: Partial<UniqueCard> = {}): UniqueCard {
  return {
    id: 100,
    type: "common",
    name: "Unique Test Card",
    cards: [
      {
        name: "Sub Card A",
        mainType: ["action"],
        cost: 2,
        link: 1,
        effect: "sub effect A",
      },
      {
        name: "Sub Card B",
        mainType: ["action"],
        cost: 3,
        link: 0,
        effect: "sub effect B",
      },
    ],
    cost: 3,
    hasChild: true,
    edition: 0,
    ...overrides,
  };
}

function makeContext(
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

function seededRng(): () => number {
  let seed = 42;
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

describe("noAttack", () => {
  describe("isSatisfied", () => {
    it("returns true when no cards have attack type", () => {
      const cards: CommonCard[] = [
        makeDuplicateCard({ id: 1, mainType: ["action"] }),
        makeDuplicateCard({ id: 2, mainType: ["territory"] }),
      ];
      expect(noAttack.isSatisfied(cards)).toBe(true);
    });

    it("returns false when a card has attack type", () => {
      const cards: CommonCard[] = [
        makeDuplicateCard({ id: 1, mainType: ["action"] }),
        makeDuplicateCard({ id: 2, mainType: ["attack"] }),
      ];
      expect(noAttack.isSatisfied(cards)).toBe(false);
    });

    it("checks UniqueCard sub-cards for attack", () => {
      const cards: CommonCard[] = [
        makeUniqueCard({
          id: 100,
          cards: [
            {
              name: "Sub A",
              mainType: ["attack"],
              cost: 2,
              link: 1,
              effect: "effect",
            },
            {
              name: "Sub B",
              mainType: ["action"],
              cost: 3,
              link: 0,
              effect: "effect",
            },
          ],
        }),
      ];
      expect(noAttack.isSatisfied(cards)).toBe(false);
    });

    it("returns true for empty array", () => {
      expect(noAttack.isSatisfied([])).toBe(true);
    });
  });

  describe("apply", () => {
    it("removes attack cards from pool", () => {
      const attackCard = makeDuplicateCard({
        id: 1,
        mainType: ["attack"],
      });
      const actionCard = makeDuplicateCard({
        id: 2,
        mainType: ["action"],
      });
      const context = makeContext({ pool: [attackCard, actionCard] });

      const result = noAttack.apply(context);

      expect(result.pool).toEqual([actionCard]);
    });

    it("removes UniqueCards with attack sub-cards from pool", () => {
      const uniqueWithAttack = makeUniqueCard({
        id: 100,
        cards: [
          {
            name: "Sub A",
            mainType: ["attack"],
            cost: 2,
            link: 1,
            effect: "effect",
          },
          {
            name: "Sub B",
            mainType: ["action"],
            cost: 3,
            link: 0,
            effect: "effect",
          },
        ],
      });
      const safeCard = makeDuplicateCard({
        id: 2,
        mainType: ["action"],
      });
      const context = makeContext({
        pool: [uniqueWithAttack, safeCard],
      });

      const result = noAttack.apply(context);

      expect(result.pool).toEqual([safeCard]);
    });
  });

  describe("canApply", () => {
    it("returns true when enough non-attack cards exist", () => {
      const pool = [
        makeDuplicateCard({ id: 1, mainType: ["action"] }),
        makeDuplicateCard({ id: 2, mainType: ["action"] }),
        makeDuplicateCard({ id: 3, mainType: ["attack"] }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 2,
      });

      expect(noAttack.canApply(context)).toBe(true);
    });

    it("returns false when not enough non-attack cards exist", () => {
      const pool = [
        makeDuplicateCard({ id: 1, mainType: ["attack"] }),
        makeDuplicateCard({ id: 2, mainType: ["attack"] }),
        makeDuplicateCard({ id: 3, mainType: ["action"] }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 3,
      });

      expect(noAttack.canApply(context)).toBe(false);
    });
  });
});

describe("link0GteLink2", () => {
  describe("isSatisfied", () => {
    it("returns true when link0 count >= link2 count", () => {
      const cards: CommonCard[] = [
        makeDuplicateCard({ id: 1, link: 0 }),
        makeDuplicateCard({ id: 2, link: 2 }),
        makeDuplicateCard({ id: 3, link: 1 }),
      ];
      expect(link0GteLink2.isSatisfied(cards)).toBe(true);
    });

    it("returns false when link0 count < link2 count", () => {
      const cards: CommonCard[] = [
        makeDuplicateCard({ id: 1, link: 2 }),
        makeDuplicateCard({ id: 2, link: 2 }),
        makeDuplicateCard({ id: 3, link: 0 }),
      ];
      expect(link0GteLink2.isSatisfied(cards)).toBe(false);
    });

    it("ignores UniqueCards for link counting", () => {
      const cards: CommonCard[] = [
        makeDuplicateCard({ id: 1, link: 2 }),
        makeUniqueCard({ id: 100 }),
      ];
      expect(link0GteLink2.isSatisfied(cards)).toBe(false);
    });

    it("returns true for empty array", () => {
      expect(link0GteLink2.isSatisfied([])).toBe(true);
    });
  });

  describe("apply", () => {
    it("limits link2 cards in pool to prevent exceeding available link0 count", () => {
      const link0Card = makeDuplicateCard({ id: 1, link: 0 });
      const link2CardA = makeDuplicateCard({ id: 2, link: 2 });
      const link2CardB = makeDuplicateCard({ id: 3, link: 2 });
      const link2CardC = makeDuplicateCard({ id: 4, link: 2 });
      const link1Card = makeDuplicateCard({ id: 5, link: 1 });
      const context = makeContext({
        pool: [link0Card, link2CardA, link2CardB, link2CardC, link1Card],
        required: [],
        count: 4,
      });

      const result = link0GteLink2.apply(context);

      const link2InPool = result.pool.filter(
        (c) => !c.hasChild && c.link === 2,
      );
      expect(link2InPool.length).toBeLessThanOrEqual(2);
    });
  });

  describe("canApply", () => {
    it("returns true when total link0 cards >= total link2 cards", () => {
      const pool = [
        makeDuplicateCard({ id: 1, link: 0 }),
        makeDuplicateCard({ id: 2, link: 2 }),
        makeDuplicateCard({ id: 3, link: 1 }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 3,
      });

      expect(link0GteLink2.canApply(context)).toBe(true);
    });

    it("returns false when total link0 cards < total link2 cards", () => {
      const pool = [
        makeDuplicateCard({ id: 1, link: 2 }),
        makeDuplicateCard({ id: 2, link: 2 }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 2,
      });

      expect(link0GteLink2.canApply(context)).toBe(false);
    });
  });
});

describe("highCostGte2", () => {
  describe("isSatisfied", () => {
    it("returns true when 2 or more cards have cost >= 5", () => {
      const cards: CommonCard[] = [
        makeDuplicateCard({ id: 1, cost: 5 }),
        makeDuplicateCard({ id: 2, cost: 6 }),
        makeDuplicateCard({ id: 3, cost: 3 }),
      ];
      expect(highCostGte2.isSatisfied(cards)).toBe(true);
    });

    it("returns false when fewer than 2 cards have cost >= 5", () => {
      const cards: CommonCard[] = [
        makeDuplicateCard({ id: 1, cost: 5 }),
        makeDuplicateCard({ id: 2, cost: 4 }),
        makeDuplicateCard({ id: 3, cost: 3 }),
      ];
      expect(highCostGte2.isSatisfied(cards)).toBe(false);
    });

    it("returns false for empty array", () => {
      expect(highCostGte2.isSatisfied([])).toBe(false);
    });
  });

  describe("apply", () => {
    it("moves high-cost cards from pool to required when required has none", () => {
      const lowCost = makeDuplicateCard({ id: 1, cost: 3 });
      const highCost1 = makeDuplicateCard({ id: 2, cost: 5 });
      const highCost2 = makeDuplicateCard({ id: 3, cost: 6 });
      const highCost3 = makeDuplicateCard({ id: 4, cost: 7 });
      const context = makeContext({
        pool: [lowCost, highCost1, highCost2, highCost3],
        required: [],
        count: 10,
        rng: seededRng(),
      });

      const result = highCostGte2.apply(context);

      const requiredHighCost = result.required.filter((c) => c.cost >= 5);
      expect(requiredHighCost).toHaveLength(2);
      expect(result.pool).toHaveLength(2);
    });

    it("picks only the deficit when required already has one high-cost card", () => {
      const existingHighCost = makeDuplicateCard({ id: 1, cost: 5 });
      const poolHighCost1 = makeDuplicateCard({ id: 2, cost: 6 });
      const poolHighCost2 = makeDuplicateCard({ id: 3, cost: 7 });
      const lowCost = makeDuplicateCard({ id: 4, cost: 3 });
      const context = makeContext({
        pool: [poolHighCost1, poolHighCost2, lowCost],
        required: [existingHighCost],
        count: 10,
        rng: seededRng(),
      });

      const result = highCostGte2.apply(context);

      const requiredHighCost = result.required.filter((c) => c.cost >= 5);
      expect(requiredHighCost).toHaveLength(2);
      expect(result.pool).toHaveLength(2);
    });

    it("skips if required already has enough high-cost cards", () => {
      const highCost1 = makeDuplicateCard({ id: 1, cost: 5 });
      const highCost2 = makeDuplicateCard({ id: 2, cost: 6 });
      const lowCost = makeDuplicateCard({ id: 3, cost: 3 });
      const context = makeContext({
        pool: [lowCost],
        required: [highCost1, highCost2],
        count: 10,
        rng: seededRng(),
      });

      const result = highCostGte2.apply(context);

      expect(result.required).toEqual([highCost1, highCost2]);
      expect(result.pool).toEqual([lowCost]);
    });
  });

  describe("canApply", () => {
    it("returns true when enough high-cost cards are available across pool and required", () => {
      const pool = [
        makeDuplicateCard({ id: 1, cost: 5 }),
        makeDuplicateCard({ id: 2, cost: 6 }),
        makeDuplicateCard({ id: 3, cost: 3 }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 3,
      });

      expect(highCostGte2.canApply(context)).toBe(true);
    });

    it("returns false when not enough high-cost cards are available", () => {
      const pool = [
        makeDuplicateCard({ id: 1, cost: 5 }),
        makeDuplicateCard({ id: 2, cost: 3 }),
        makeDuplicateCard({ id: 3, cost: 2 }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 3,
      });

      expect(highCostGte2.canApply(context)).toBe(false);
    });

    it("returns false when total cards are less than count", () => {
      const pool = [
        makeDuplicateCard({ id: 1, cost: 5 }),
        makeDuplicateCard({ id: 2, cost: 6 }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 10,
      });

      expect(highCostGte2.canApply(context)).toBe(false);
    });
  });
});

describe("disasterGte1", () => {
  describe("isSatisfied", () => {
    it("returns true when a card has disaster type", () => {
      const cards: CommonCard[] = [
        makeDuplicateCard({ id: 1, mainType: ["action"] }),
        makeDuplicateCard({ id: 2, mainType: ["disaster"] }),
      ];
      expect(disasterGte1.isSatisfied(cards)).toBe(true);
    });

    it("returns false when no card has disaster type", () => {
      const cards: CommonCard[] = [
        makeDuplicateCard({ id: 1, mainType: ["action"] }),
        makeDuplicateCard({ id: 2, mainType: ["territory"] }),
      ];
      expect(disasterGte1.isSatisfied(cards)).toBe(false);
    });

    it("detects disaster in UniqueCard sub-cards", () => {
      const cards: CommonCard[] = [
        makeUniqueCard({
          id: 100,
          cards: [
            {
              name: "Sub A",
              mainType: ["disaster"],
              cost: 2,
              link: 1,
              effect: "effect",
            },
            {
              name: "Sub B",
              mainType: ["action"],
              cost: 3,
              link: 0,
              effect: "effect",
            },
          ],
        }),
      ];
      expect(disasterGte1.isSatisfied(cards)).toBe(true);
    });

    it("returns false for empty array", () => {
      expect(disasterGte1.isSatisfied([])).toBe(false);
    });
  });

  describe("apply", () => {
    it("moves a disaster card from pool to required", () => {
      const actionCard = makeDuplicateCard({ id: 1, mainType: ["action"] });
      const disasterCard = makeDuplicateCard({
        id: 2,
        mainType: ["disaster"],
      });
      const context = makeContext({
        pool: [actionCard, disasterCard],
        required: [],
        count: 10,
        rng: seededRng(),
      });

      const result = disasterGte1.apply(context);

      expect(result.required).toHaveLength(1);
      expect(result.required[0].id).toBe(2);
      expect(result.pool).toEqual([actionCard]);
    });

    it("skips if required already has a disaster card", () => {
      const disasterCard = makeDuplicateCard({
        id: 1,
        mainType: ["disaster"],
      });
      const poolDisaster = makeDuplicateCard({
        id: 2,
        mainType: ["disaster"],
      });
      const context = makeContext({
        pool: [poolDisaster],
        required: [disasterCard],
        count: 10,
        rng: seededRng(),
      });

      const result = disasterGte1.apply(context);

      expect(result.required).toEqual([disasterCard]);
      expect(result.pool).toEqual([poolDisaster]);
    });
  });

  describe("canApply", () => {
    it("returns false when no disaster cards are available", () => {
      const pool = [
        makeDuplicateCard({ id: 1, mainType: ["action"] }),
        makeDuplicateCard({ id: 2, mainType: ["territory"] }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 2,
      });

      expect(disasterGte1.canApply(context)).toBe(false);
    });

    it("returns true when disaster cards exist in pool or required", () => {
      const pool = [
        makeDuplicateCard({ id: 1, mainType: ["action"] }),
        makeDuplicateCard({ id: 2, mainType: ["disaster"] }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 2,
      });

      expect(disasterGte1.canApply(context)).toBe(true);
    });
  });
});
