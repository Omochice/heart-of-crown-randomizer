import { describe, expect, it } from "vitest";
import {
  makeContext,
  makeDuplicateCard,
  seededRng,
} from "../shared/test-helpers";
import { eachCost2to5 } from "./index";

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
      const costs = result.required.map((c) => c.cost);
      expect(costs).toContain(2);
      expect(costs).toContain(3);
      expect(costs).toContain(4);
      expect(costs).toContain(5);
    });

    it("picks a card with cost > 5 to fill the high-cost slot", () => {
      const context = makeContext({
        pool: [
          makeDuplicateCard({ id: 1, cost: 2 }),
          makeDuplicateCard({ id: 2, cost: 3 }),
          makeDuplicateCard({ id: 3, cost: 4 }),
          makeDuplicateCard({ id: 4, cost: 6 }),
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
      expect(costs.some((c) => c >= 5)).toBe(true);
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

    it("returns true when cost > 5 is available instead of exact 5", () => {
      const pool = [
        makeDuplicateCard({ id: 1, cost: 2 }),
        makeDuplicateCard({ id: 2, cost: 3 }),
        makeDuplicateCard({ id: 3, cost: 4 }),
        makeDuplicateCard({ id: 4, cost: 6 }),
      ];
      const context = makeContext({ pool, required: [], count: 4 });
      expect(eachCost2to5.canApply(context)).toBe(true);
    });
  });

  describe("isSatisfied", () => {
    it("returns true when cards include cost > 5 instead of exact 5", () => {
      const cards = [
        makeDuplicateCard({ id: 1, cost: 2 }),
        makeDuplicateCard({ id: 2, cost: 3 }),
        makeDuplicateCard({ id: 3, cost: 4 }),
        makeDuplicateCard({ id: 4, cost: 7 }),
      ];
      expect(eachCost2to5.isSatisfied(cards)).toBe(true);
    });
  });
});
