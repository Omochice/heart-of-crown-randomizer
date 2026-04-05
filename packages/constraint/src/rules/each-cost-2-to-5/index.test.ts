import { describe, expect, it } from "vitest";
import { makeContext, makeDuplicateCard, seededRng } from "../_test-helpers";
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
