import type { DuplicateCard } from "@heart-of-crown-randomizer/card/type";
import {
  type Constraint,
  noAttack,
  type SelectionContext,
} from "@heart-of-crown-randomizer/constraint";
import { decodeIds } from "@heart-of-crown-randomizer/id-codec";
import { describe, expect, it } from "vitest";
import { makeCard } from "$lib/test-helpers";
import { buildCardUrl, drawMissingCommons, drawRandomCards } from "./card-draw";

const allCommons = Array.from({ length: 20 }, (_, i) => makeCard(i + 1));

describe("drawRandomCards", () => {
  it("should return error when pinned count exceeds target", () => {
    const pinned = [makeCard(1), makeCard(2), makeCard(3)];

    const result = drawRandomCards(allCommons, 2, pinned, new Set());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("ピンされたカード");
    }
  });

  it("should return error when excluded cards leave too few available", () => {
    const excludedIds = new Set(Array.from({ length: 18 }, (_, i) => i + 1));

    const result = drawRandomCards(allCommons, 10, [], excludedIds);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("除外");
    }
  });

  it("should return sorted cards on success", () => {
    const result = drawRandomCards(allCommons, 5, [], new Set());

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cards).toHaveLength(5);
      for (let i = 1; i < result.cards.length; i++) {
        expect(result.cards[i].id).toBeGreaterThanOrEqual(
          result.cards[i - 1].id,
        );
      }
    }
  });

  it("should include pinned cards in result", () => {
    const pinned = allCommons.filter((c) => c.id === 1 || c.id === 2);

    const result = drawRandomCards(allCommons, 5, pinned, new Set());

    expect(result.ok).toBe(true);
    if (result.ok) {
      const ids = result.cards.map((c) => c.id);
      expect(ids).toContain(1);
      expect(ids).toContain(2);
    }
  });

  it("should exclude cards with excluded IDs", () => {
    const excludedIds = new Set([1, 2, 3]);

    const result = drawRandomCards(allCommons, 5, [], excludedIds);

    expect(result.ok).toBe(true);
    if (result.ok) {
      const ids = result.cards.map((c) => c.id);
      expect(ids).not.toContain(1);
      expect(ids).not.toContain(2);
      expect(ids).not.toContain(3);
    }
  });
});

describe("drawRandomCards with constraints", () => {
  it("should pass constraints to selectWithConstraints", () => {
    const filterConstraint: Constraint = {
      id: 901,
      label: "test",
      canApply: () => true,
      isSatisfied: () => true,
      apply: (ctx: SelectionContext) => ({
        ...ctx,
        pool: ctx.pool.filter((c) => c.id <= 5),
      }),
    };

    const result = drawRandomCards(allCommons, 3, [], new Set(), [
      filterConstraint,
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.cards).toHaveLength(3);
      for (const card of result.cards) {
        expect(card.id).toBeLessThanOrEqual(5);
      }
    }
  });

  it("should still validate pin constraints before applying constraints", () => {
    const dummyConstraint: Constraint = {
      id: 902,
      label: "test",
      canApply: () => true,
      isSatisfied: () => true,
      apply: (ctx: SelectionContext) => ctx,
    };
    const pinned = [makeCard(1), makeCard(2), makeCard(3)];

    const result = drawRandomCards(allCommons, 2, pinned, new Set(), [
      dummyConstraint,
    ]);

    expect(result.ok).toBe(false);
  });
});

describe("drawMissingCommons", () => {
  it("should return empty array when already at target count", () => {
    const selected = allCommons.slice(0, 10);

    const result = drawMissingCommons(allCommons, selected, 10);

    expect(result).toHaveLength(0);
  });

  it("should return new cards to fill missing slots", () => {
    const selected = allCommons.slice(0, 7);

    const result = drawMissingCommons(allCommons, selected, 10);

    expect(result).toHaveLength(3);
  });

  it("should not include already-selected cards", () => {
    const selected = allCommons.slice(0, 5);
    const selectedIds = selected.map((c) => c.id);

    const result = drawMissingCommons(allCommons, selected, 10);

    for (const card of result) {
      expect(selectedIds).not.toContain(card.id);
    }
  });

  it("should return empty array when no cards are available", () => {
    const result = drawMissingCommons(allCommons, allCommons, 25);

    expect(result).toHaveLength(0);
  });
});

describe("drawMissingCommons with constraints", () => {
  const makeAttackCard = (id: number): DuplicateCard => ({
    ...(makeCard(id) as DuplicateCard),
    mainType: ["attack"],
  });

  it("does not fill with attack cards when noAttack is active and non-attack cards are available", () => {
    const selected = Array.from({ length: 9 }, (_, i) => makeCard(i + 1));
    const pool = [
      ...selected,
      ...Array.from({ length: 3 }, (_, i) => makeCard(i + 10)),
      ...Array.from({ length: 6 }, (_, i) => makeAttackCard(i + 13)),
    ];

    const result = drawMissingCommons(pool, selected, 10, [noAttack]);

    expect(result).toHaveLength(1);
    expect(noAttack.isSatisfied([...selected, ...result])).toBe(true);
  });
});

describe("buildCardUrl", () => {
  it("should include only compressed card IDs without p/e/c params", () => {
    const cards = [makeCard(1), makeCard(5)];

    const result = buildCardUrl(cards);

    const params = new URLSearchParams(result.slice(1));
    expect(new Set(decodeIds(params.get("s") ?? ""))).toEqual(new Set([1, 5]));
    expect(params.has("p")).toBe(false);
    expect(params.has("e")).toBe(false);
    expect(params.has("c")).toBe(false);
  });

  it("should preserve debug param from currentSearchParams", () => {
    const cards = [makeCard(1)];
    const searchParams = new URLSearchParams("debug=true");

    const result = buildCardUrl(cards, searchParams);

    const params = new URLSearchParams(result.slice(1));
    expect(params.get("debug")).toBe("true");
  });

  it("should not include debug param when currentSearchParams lacks it", () => {
    const cards = [makeCard(1)];
    const searchParams = new URLSearchParams();

    const result = buildCardUrl(cards, searchParams);

    const params = new URLSearchParams(result.slice(1));
    expect(params.get("debug")).toBeNull();
  });

  it("should not include debug param when currentSearchParams is omitted", () => {
    const cards = [makeCard(1)];

    const result = buildCardUrl(cards);

    const params = new URLSearchParams(result.slice(1));
    expect(params.get("debug")).toBeNull();
  });
});
