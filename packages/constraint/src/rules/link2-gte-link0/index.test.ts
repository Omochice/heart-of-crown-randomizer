import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { describe, expect, it } from "vitest";
import type { PickContext } from "../../type";
import { makeContext, makeDuplicateCard } from "../shared/test-helpers";
import { link2GteLink0 } from "./index";

describe("link2GteLink0", () => {
  describe("apply", () => {
    it("does not force additional link-2 when link-2 count equals link-0 count", () => {
      const link2InReq = makeDuplicateCard({ id: 1, link: 2 });
      const link0InReq = makeDuplicateCard({ id: 2, link: 0 });
      const link1Card = makeDuplicateCard({ id: 3, link: 1 });
      const extraLink2 = makeDuplicateCard({ id: 4, link: 2 });
      const context = makeContext({
        pool: [link1Card, extraLink2],
        required: [link2InReq, link0InReq],
        count: 3,
      });

      const result = link2GteLink0.apply(context);

      expect(result.required).toEqual([link2InReq, link0InReq]);
      expect(result.pool).toEqual([link1Card, extraLink2]);
    });

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
      expect(link0InPool).toHaveLength(2);
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

  describe("filterPoolForNextPick", () => {
    const link0Card = makeDuplicateCard({ id: 10, link: 0 });
    const link1Card = makeDuplicateCard({ id: 11, link: 1 });
    const link2Card = makeDuplicateCard({ id: 12, link: 2 });
    const pool: CommonCard[] = [link0Card, link1Card, link2Card];

    it("returns full pool when budget + remaining >= 2", () => {
      const pickContext: PickContext = {
        picked: [
          makeDuplicateCard({ id: 1, link: 2 }),
          makeDuplicateCard({ id: 2, link: 2 }),
        ],
        pool,
        remainingCount: 1,
      };

      const result = link2GteLink0.filterPoolForNextPick?.(pickContext);

      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(pool));
    });

    it("excludes link-0 when budget + remaining == 1", () => {
      const pickContext: PickContext = {
        picked: [
          makeDuplicateCard({ id: 1, link: 2 }),
          makeDuplicateCard({ id: 2, link: 0 }),
        ],
        pool,
        remainingCount: 1,
      };

      const result = link2GteLink0.filterPoolForNextPick?.(pickContext);

      expect(result).toEqual([link1Card, link2Card]);
    });

    it("returns link-2 only when budget + remaining <= 0", () => {
      const pickContext: PickContext = {
        picked: [makeDuplicateCard({ id: 1, link: 0 })],
        pool,
        remainingCount: 1,
      };

      const result = link2GteLink0.filterPoolForNextPick?.(pickContext);

      expect(result).toEqual([link2Card]);
    });

    it("returns empty array for empty pool", () => {
      const pickContext: PickContext = {
        picked: [],
        pool: [],
        remainingCount: 1,
      };

      const result = link2GteLink0.filterPoolForNextPick?.(pickContext);

      expect(result).toEqual([]);
    });

    it("keeps UniqueCard when budget + remaining == 1", () => {
      const uniqueCard: CommonCard = {
        id: 99,
        type: "common" as const,
        hasChild: true as const,
        cards: [
          {
            name: "sub",
            mainType: ["action" as const],
            link: 0 as const,
            effect: "",
          },
        ],
        cost: 3,
        edition: 0 as const,
      };
      const poolWithUnique: CommonCard[] = [link0Card, link1Card, uniqueCard];

      const pickContext: PickContext = {
        picked: [
          makeDuplicateCard({ id: 1, link: 2 }),
          makeDuplicateCard({ id: 2, link: 0 }),
        ],
        pool: poolWithUnique,
        remainingCount: 1,
      };

      const result = link2GteLink0.filterPoolForNextPick?.(pickContext);

      expect(result).toEqual([link1Card, uniqueCard]);
    });
  });
});
