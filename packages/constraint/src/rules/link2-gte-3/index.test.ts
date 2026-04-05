import { describe, expect, it } from "vitest";
import {
  makeContext,
  makeDuplicateCard,
  seededRng,
} from "../shared/test-helpers";
import { link2Gte3 } from "./index";

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
