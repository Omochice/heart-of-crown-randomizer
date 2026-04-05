import { describe, expect, it } from "vitest";
import {
  makeContext,
  makeDuplicateCard,
  seededRng,
} from "../shared/test-helpers";
import { highCostGte2 } from "./index";

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
