import { describe, expect, it } from "vitest";
import {
  eachCost2to5,
  highCostGte2,
  link2Gte3,
  link2GteLink0,
  noAttack,
} from "./presets";
import {
  makeContext,
  makeDuplicateCard,
  seededRng,
} from "./rules/_test-helpers";
import type { Constraint } from "./type";

describe("Constraint type", () => {
  it("has a numeric id", () => {
    const constraint: Constraint = noAttack;
    expect(typeof constraint.id).toBe("number");
  });
});

describe("noAttack", () => {
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

    it("returns false when required contains an attack card", () => {
      const pool = [
        makeDuplicateCard({ id: 1, mainType: ["action"] }),
        makeDuplicateCard({ id: 2, mainType: ["action"] }),
      ];
      const context = makeContext({
        pool,
        required: [makeDuplicateCard({ id: 3, mainType: ["attack"] })],
        count: 2,
      });

      expect(noAttack.canApply(context)).toBe(false);
    });
  });
});

describe("link2GteLink0", () => {
  describe("apply", () => {
    it("does not force link-2 when required already has enough", () => {
      const link2InReq = makeDuplicateCard({ id: 1, link: 2 });
      const link0CardA = makeDuplicateCard({ id: 2, link: 0 });
      const link1Card = makeDuplicateCard({ id: 3, link: 1 });
      const context = makeContext({
        pool: [link0CardA, link1Card],
        required: [link2InReq],
        count: 3,
      });

      const result = link2GteLink0.apply(context);

      expect(result.required).toEqual([link2InReq]);
      const link0InPool = result.pool.filter(
        (c) => !c.hasChild && c.link === 0,
      );
      expect(link0InPool.length).toBeLessThanOrEqual(1);
    });
  });

  describe("canApply", () => {
    it("returns true when link2 cards exist and enough non-link0 cards for count", () => {
      const pool = [
        makeDuplicateCard({ id: 1, link: 2 }),
        makeDuplicateCard({ id: 2, link: 0 }),
        makeDuplicateCard({ id: 3, link: 1 }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 2,
      });

      expect(link2GteLink0.canApply(context)).toBe(true);
    });

    it("returns false when no link2 cards exist", () => {
      const pool = [
        makeDuplicateCard({ id: 1, link: 0 }),
        makeDuplicateCard({ id: 2, link: 1 }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 2,
      });

      expect(link2GteLink0.canApply(context)).toBe(false);
    });

    it("returns true when link-2 exists even if many link-0 cards present", () => {
      const pool = [
        makeDuplicateCard({ id: 1, link: 2 }),
        makeDuplicateCard({ id: 2, link: 0 }),
        makeDuplicateCard({ id: 3, link: 0 }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 3,
      });

      expect(link2GteLink0.canApply(context)).toBe(true);
    });
  });
});

describe("highCostGte2", () => {
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

describe("link2Gte3", () => {
  describe("apply", () => {
    it("moves link=2 cards from pool to required until 3 are required", () => {
      const link2Cards = [
        makeDuplicateCard({ id: 1, link: 2 }),
        makeDuplicateCard({ id: 2, link: 2 }),
        makeDuplicateCard({ id: 3, link: 2 }),
        makeDuplicateCard({ id: 4, link: 2 }),
      ];
      const otherCards = [
        makeDuplicateCard({ id: 5, link: 1 }),
        makeDuplicateCard({ id: 6, link: 0 }),
      ];
      const context = makeContext({
        pool: [...link2Cards, ...otherCards],
        required: [],
        count: 10,
        rng: seededRng(),
      });

      const result = link2Gte3.apply(context);

      const requiredLink2Count = result.required.filter(
        (card) => !card.hasChild && card.link === 2,
      ).length;
      expect(requiredLink2Count).toBe(3);
      expect(result.required.length).toBe(3);
    });

    it("accounts for existing link=2 cards already in required", () => {
      const existingRequired = makeDuplicateCard({ id: 1, link: 2 });
      const link2Cards = [
        makeDuplicateCard({ id: 2, link: 2 }),
        makeDuplicateCard({ id: 3, link: 2 }),
        makeDuplicateCard({ id: 4, link: 2 }),
      ];
      const otherCards = [makeDuplicateCard({ id: 5, link: 1 })];
      const context = makeContext({
        pool: [...link2Cards, ...otherCards],
        required: [existingRequired],
        count: 10,
        rng: seededRng(),
      });

      const result = link2Gte3.apply(context);

      const requiredLink2Count = result.required.filter(
        (card) => !card.hasChild && card.link === 2,
      ).length;
      expect(requiredLink2Count).toBe(3);
      expect(result.required.length).toBe(3);
    });
  });

  describe("canApply", () => {
    it("returns true when enough link=2 cards exist in pool and required combined", () => {
      const pool = [
        makeDuplicateCard({ id: 1, link: 2 }),
        makeDuplicateCard({ id: 2, link: 2 }),
        makeDuplicateCard({ id: 3, link: 2 }),
        makeDuplicateCard({ id: 4, link: 1 }),
        makeDuplicateCard({ id: 5, link: 0 }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 5,
      });

      expect(link2Gte3.canApply(context)).toBe(true);
    });

    it("returns false when not enough link=2 cards exist", () => {
      const pool = [
        makeDuplicateCard({ id: 1, link: 2 }),
        makeDuplicateCard({ id: 2, link: 2 }),
        makeDuplicateCard({ id: 3, link: 1 }),
        makeDuplicateCard({ id: 4, link: 0 }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 5,
      });

      expect(link2Gte3.canApply(context)).toBe(false);
    });
  });
});

describe("eachCost2to5", () => {
  describe("apply", () => {
    it("picks one card for each missing cost", () => {
      const context = makeContext({
        pool: [
          makeDuplicateCard({ id: 1, cost: 2 }),
          makeDuplicateCard({ id: 2, cost: 3 }),
          makeDuplicateCard({ id: 3, cost: 4 }),
          makeDuplicateCard({ id: 4, cost: 5 }),
          makeDuplicateCard({ id: 5, cost: 1 }),
        ],
        required: [],
        count: 10,
        rng: seededRng(),
      });

      const result = eachCost2to5.apply(context);

      expect(result.required).toHaveLength(4);
      const costs = result.required.map((c) => c.cost);
      expect(costs).toContain(2);
      expect(costs).toContain(3);
      expect(costs).toContain(4);
      expect(costs).toContain(5);
    });

    it("skips costs already in required", () => {
      const context = makeContext({
        pool: [
          makeDuplicateCard({ id: 2, cost: 3 }),
          makeDuplicateCard({ id: 3, cost: 4 }),
          makeDuplicateCard({ id: 4, cost: 5 }),
        ],
        required: [makeDuplicateCard({ id: 1, cost: 2 })],
        count: 10,
        rng: seededRng(),
      });

      const result = eachCost2to5.apply(context);

      expect(result.required).toHaveLength(4);
    });
  });

  describe("canApply", () => {
    it("returns false when a cost is completely missing", () => {
      const pool = [
        makeDuplicateCard({ id: 1, cost: 2 }),
        makeDuplicateCard({ id: 2, cost: 4 }),
        makeDuplicateCard({ id: 3, cost: 5 }),
      ];
      const context = makeContext({ pool, required: [], count: 3 });
      expect(eachCost2to5.canApply(context)).toBe(false);
    });

    it("returns true when all costs 2-5 are available", () => {
      const pool = [
        makeDuplicateCard({ id: 1, cost: 2 }),
        makeDuplicateCard({ id: 2, cost: 3 }),
        makeDuplicateCard({ id: 3, cost: 4 }),
        makeDuplicateCard({ id: 4, cost: 5 }),
      ];
      const context = makeContext({ pool, required: [], count: 4 });
      expect(eachCost2to5.canApply(context)).toBe(true);
    });
  });
});
