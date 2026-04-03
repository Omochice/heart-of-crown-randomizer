import type {
  CommonCard,
  DuplicateCard,
  UniqueCard,
} from "@heart-of-crown-randomizer/card/type";
import { describe, expect, it } from "vitest";
import { noAttack } from "./presets.js";
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
