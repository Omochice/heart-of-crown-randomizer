import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import {
  allConstraints,
  noAttack,
  type SelectionContext,
} from "@heart-of-crown-randomizer/constraint";
import { beforeEach, describe, expect, it } from "vitest";
import {
  setExcludedCardIds,
  setPinnedCardIds,
} from "$lib/stores/card-state.svelte";
import {
  getEnabledConstraintIds,
  getEnabledConstraints,
  toggleConstraint,
} from "$lib/stores/constraint-state.svelte";
import { buildCardUrl, drawRandomCards } from "$lib/utils/card-draw";
import { buildShareUrl } from "$lib/utils/share";

const allCommons = [...Basic.commons, ...FarEasternBorder.commons];

function applyConstraints(
  context: SelectionContext,
  constraints: readonly {
    canApply(ctx: SelectionContext): boolean;
    apply(ctx: SelectionContext): SelectionContext;
  }[],
): SelectionContext {
  let result = context;
  for (const constraint of constraints) {
    if (constraint.canApply(result)) {
      result = constraint.apply(result);
    }
  }
  return result;
}

function resetState() {
  setPinnedCardIds(new Set());
  setExcludedCardIds(new Set());
  for (const c of allConstraints) {
    if (getEnabledConstraintIds().has(c.id)) {
      toggleConstraint(c.id);
    }
  }
}

describe("Debug Mode E2E: debug param preservation", () => {
  beforeEach(resetState);

  it("should preserve debug=true in buildCardUrl when searchParams contains it", () => {
    const result = drawRandomCards(allCommons, 10, [], new Set());
    if (!result.ok) {
      throw new Error("draw failed");
    }

    const searchParams = new URLSearchParams("debug=true");
    const url = buildCardUrl(result.cards, searchParams);

    const params = new URLSearchParams(url.slice(1));
    expect(params.get("debug")).toBe("true");
  });

  it("should not include debug param in share URL even when debug mode is active", () => {
    const result = drawRandomCards(allCommons, 10, [], new Set());
    if (!result.ok) {
      throw new Error("draw failed");
    }

    const shareUrl = buildShareUrl("http://localhost", result.cards, new Set());

    const url = new URL(shareUrl);
    expect(url.searchParams.get("debug")).toBeNull();
  });

  it("should preserve debug=true and not include p/e/c params", () => {
    const searchParams = new URLSearchParams("debug=true");

    const result = drawRandomCards(allCommons, 10, [], new Set());
    if (!result.ok) {
      throw new Error("draw failed");
    }

    const url = buildCardUrl(result.cards, searchParams);
    const params = new URLSearchParams(url.slice(1));

    expect(params.get("debug")).toBe("true");
    expect(params.get("s")).not.toBeNull();
    expect(params.has("p")).toBe(false);
    expect(params.has("e")).toBe(false);
    expect(params.has("c")).toBe(false);
  });
});

describe("Debug Mode E2E: drawable pool with constraints", () => {
  beforeEach(resetState);

  it("should compute drawable pool that excludes pinned and excluded cards", () => {
    const pinnedCards = allCommons.slice(0, 2);
    const pinnedIds = new Set(pinnedCards.map((c) => c.id));
    const excludedIds = new Set([allCommons[5].id, allCommons[6].id]);

    const pool = allCommons.filter(
      (card) => !excludedIds.has(card.id) && !pinnedIds.has(card.id),
    );

    for (const card of pinnedCards) {
      expect(pool.find((c) => c.id === card.id)).toBeUndefined();
    }
    for (const id of excludedIds) {
      expect(pool.find((c) => c.id === id)).toBeUndefined();
    }
    expect(pool.length).toBe(
      allCommons.length - pinnedCards.length - excludedIds.size,
    );
  });

  it("should reflect constraint filtering in drawable pool", () => {
    toggleConstraint(noAttack.id);

    const enabledConstraints = getEnabledConstraints(allConstraints);
    expect(enabledConstraints).toHaveLength(1);

    const context = applyConstraints(
      { pool: [...allCommons], required: [], count: 10, rng: () => 0.5 },
      enabledConstraints,
    );

    expect(context.pool.length).toBeLessThan(allCommons.length);
    expect(noAttack.isSatisfied(context.pool)).toBe(true);
  });

  it("should combine pin, exclude, and constraint filtering correctly", () => {
    const pinnedCards = allCommons.slice(0, 2);
    const pinnedIds = new Set(pinnedCards.map((c) => c.id));
    const excludedIds = new Set([allCommons[5].id]);

    toggleConstraint(noAttack.id);
    const enabledConstraints = getEnabledConstraints(allConstraints);

    const filteredPool = allCommons.filter(
      (card) => !excludedIds.has(card.id) && !pinnedIds.has(card.id),
    );

    const context = applyConstraints(
      {
        pool: filteredPool,
        required: [...pinnedCards],
        count: 10,
        rng: () => 0.5,
      },
      enabledConstraints,
    );

    for (const id of excludedIds) {
      expect(context.pool.find((c) => c.id === id)).toBeUndefined();
    }
    for (const card of pinnedCards) {
      expect(context.pool.find((c) => c.id === card.id)).toBeUndefined();
    }
    expect(noAttack.isSatisfied(context.pool)).toBe(true);
  });
});
