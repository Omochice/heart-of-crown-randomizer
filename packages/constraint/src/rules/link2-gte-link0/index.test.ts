import { describe, expect, it } from "vitest";
import { makeContext, makeDuplicateCard } from "../_test-helpers";
import { link2GteLink0 } from "./index";

describe("link2GteLink0", () => {
  describe("apply", () => {
    it("does not force link-2 when required already has enough", () => {
      const link2InReq = makeDuplicateCard({ id: 1, link: 2 });
      const link0CardA = makeDuplicateCard({ id: 2, link: 0 });
      const link0CardB = makeDuplicateCard({ id: 3, link: 0 });
      const link1Card = makeDuplicateCard({ id: 4, link: 1 });
      const context = makeContext({
        pool: [link0CardA, link0CardB, link1Card],
        required: [link2InReq],
        count: 3,
      });

      const result = link2GteLink0.apply(context);

      expect(result.required).toEqual([link2InReq]);
      const link0InPool = result.pool.filter(
        (c) => !c.hasChild && c.link === 0,
      );
      expect(link0InPool).toHaveLength(1);
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
