import type {
  CommonCard,
  DuplicateCard,
} from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "./type.js";

/**
 * Extract the link value from a card.
 *
 * UniqueCard has no top-level `link` property (its sub-cards each have
 * their own link values), so we return undefined for it rather than
 * trying to aggregate sub-card links.
 */
function getLink(card: CommonCard): DuplicateCard["link"] | undefined {
  if (card.hasChild) {
    return undefined;
  }
  return card.link;
}

/**
 * Count how many cards in an array satisfy a predicate.
 */
function countInCards(
  cards: readonly CommonCard[],
  predicate: (card: CommonCard) => boolean,
): number {
  return cards.filter(predicate).length;
}

/**
 * Check whether a card contains the specified main type.
 *
 * DuplicateCard has a top-level mainType array, while UniqueCard
 * has sub-cards each with their own mainType. This function handles
 * both variants uniformly.
 */
function hasMainType(
  card: CommonCard,
  type:
    | "attack"
    | "action"
    | "territory"
    | "princess"
    | "succession"
    | "disaster",
): boolean {
  if (card.hasChild) {
    return card.cards.some((sub) => sub.mainType.includes(type));
  }
  return card.mainType.includes(type);
}

function isHighCost(card: CommonCard): boolean {
  return card.cost >= 5;
}

/**
 * Pick n cards matching predicate from pool using Fisher-Yates partial shuffle.
 *
 * Fisher-Yates is used instead of sort-based shuffling because it provides
 * uniform distribution with O(n) swaps and avoids sort comparison bias.
 */
function pickFromPool(
  context: SelectionContext,
  predicate: (card: CommonCard) => boolean,
  n: number,
): SelectionContext {
  const candidates: { index: number; card: CommonCard }[] = [];
  for (let i = 0; i < context.pool.length; i++) {
    if (predicate(context.pool[i])) {
      candidates.push({ index: i, card: context.pool[i] });
    }
  }

  const pickCount = Math.min(n, candidates.length);
  for (
    let i = candidates.length - 1;
    i > candidates.length - 1 - pickCount;
    i--
  ) {
    const j = Math.floor(context.rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const picked = candidates.slice(candidates.length - pickCount);
  const pickedIndices = new Set(picked.map((p) => p.index));

  return {
    ...context,
    pool: context.pool.filter((_, i) => !pickedIndices.has(i)),
    required: [...context.required, ...picked.map((p) => p.card)],
  };
}

/**
 * Constraint that excludes all attack cards from the selection.
 *
 * When applied, cards containing the "attack" main type are removed
 * from the pool. For UniqueCards, if any sub-card has "attack", the
 * entire UniqueCard is excluded.
 */
export const noAttack: Constraint = {
  id: "no-attack",
  label: "攻撃カードを含まない",

  isSatisfied(cards: readonly CommonCard[]): boolean {
    return cards.every((card) => !hasMainType(card, "attack"));
  },

  canApply(context: Readonly<SelectionContext>): boolean {
    const nonAttackPool = context.pool.filter(
      (card) => !hasMainType(card, "attack"),
    );
    const remainingSlots = context.count - context.required.length;
    return nonAttackPool.length >= remainingSlots;
  },

  apply(context: SelectionContext): SelectionContext {
    return {
      ...context,
      pool: context.pool.filter((card) => !hasMainType(card, "attack")),
    };
  },
};

/**
 * Constraint ensuring the number of link-0 cards is at least as large
 * as the number of link-2 cards in the final selection.
 *
 * This promotes balanced link distributions. When applied, it trims
 * link-2 cards from the pool so the random selection cannot violate
 * the invariant.
 */
export const link0GteLink2: Constraint = {
  id: "link0-gte-link2",
  label: "リンク0の数 ≧ リンク2の数",

  isSatisfied(cards: readonly CommonCard[]): boolean {
    const link0Count = countInCards(cards, (c) => getLink(c) === 0);
    const link2Count = countInCards(cards, (c) => getLink(c) === 2);
    return link0Count >= link2Count;
  },

  canApply(context: Readonly<SelectionContext>): boolean {
    const allCards = [...context.pool, ...context.required];
    const totalLink0 = countInCards(allCards, (c) => getLink(c) === 0);
    const totalLink2 = countInCards(allCards, (c) => getLink(c) === 2);
    return totalLink0 >= totalLink2;
  },

  apply(context: SelectionContext): SelectionContext {
    const remainingSlots = context.count - context.required.length;
    const requiredLink0 = countInCards(
      context.required,
      (c) => getLink(c) === 0,
    );
    const requiredLink2 = countInCards(
      context.required,
      (c) => getLink(c) === 2,
    );
    const maxLink2InResult = Math.floor(remainingSlots / 2) + requiredLink0;
    const allowedLink2InPool = Math.max(0, maxLink2InResult - requiredLink2);

    let link2Seen = 0;
    const pool = context.pool.filter((card) => {
      if (getLink(card) !== 2) {
        return true;
      }
      link2Seen++;
      return link2Seen <= allowedLink2InPool;
    });

    return { ...context, pool };
  },
};

/**
 * Constraint that requires at least 2 high-cost (cost >= 5) cards in the selection.
 *
 * When applied, if fewer than 2 high-cost cards are already in required,
 * the deficit is filled by picking from the pool using Fisher-Yates
 * partial shuffle for unbiased random selection.
 */
export const highCostGte2: Constraint = {
  id: "high-cost-gte-2",
  label: "コスト5以上を2枚以上含む",

  isSatisfied(cards: readonly CommonCard[]): boolean {
    return countInCards(cards, isHighCost) >= 2;
  },

  canApply(context: Readonly<SelectionContext>): boolean {
    const totalHighCost =
      countInCards(context.pool, isHighCost) +
      countInCards(context.required, isHighCost);
    const totalCards = context.pool.length + context.required.length;
    return totalHighCost >= 2 && totalCards >= context.count;
  },

  apply(context: SelectionContext): SelectionContext {
    const alreadyHave = countInCards(context.required, isHighCost);
    const deficit = 2 - alreadyHave;
    if (deficit <= 0) {
      return context;
    }
    return pickFromPool(context, isHighCost, deficit);
  },
};
