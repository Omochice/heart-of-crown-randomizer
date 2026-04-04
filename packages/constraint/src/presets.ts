import type {
  CommonCard,
  DuplicateCard,
} from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "./type";

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
  let count = 0;
  for (const card of cards) {
    if (predicate(card)) count++;
  }
  return count;
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
 * Check whether a card has link=2.
 *
 * Only DuplicateCards have a top-level `link` property.
 * UniqueCards have sub-cards with individual link values but no
 * top-level link, so they are never considered link=2 cards.
 */
function isLink2(card: CommonCard): boolean {
  if (card.hasChild) {
    return false;
  }
  return card.link === 2;
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
    if (context.required.some((card) => hasMainType(card, "attack"))) {
      return false;
    }
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
 * Constraint ensuring the number of link-2 cards is at least as large
 * as the number of link-0 cards in the final selection.
 *
 * When applied, link-2 cards are moved from pool to required via
 * pickFromPool, then link-0 cards in pool are trimmed so that the
 * worst-case random selection still satisfies link2 >= link0.
 *
 * Pool trimming alone (without forcing link-2 into required) cannot
 * guarantee the constraint because random selection may pick fewer
 * link-2 cards than link-0 cards from the remaining pool.
 */
export const link2GteLink0: Constraint = {
  id: "link2-gte-link0",
  label: "リンク2の数 ≧ リンク0の数",

  isSatisfied(cards: readonly CommonCard[]): boolean {
    const link0Count = countInCards(cards, (c) => getLink(c) === 0);
    const link2Count = countInCards(cards, (c) => getLink(c) === 2);
    return link2Count >= link0Count;
  },

  canApply(context: Readonly<SelectionContext>): boolean {
    const poolLink2 = countInCards(context.pool, isLink2);
    const requiredLink2 = countInCards(context.required, isLink2);
    return poolLink2 + requiredLink2 >= 1;
  },

  apply(context: SelectionContext): SelectionContext {
    const requiredLink0 = countInCards(
      context.required,
      (c) => getLink(c) === 0,
    );
    const requiredLink2 = countInCards(context.required, isLink2);

    // Force link-2 into required so we can allow some link-0 in pool.
    // Each guaranteed link-2 covers one possible link-0 in the result.
    const link2Deficit = Math.max(0, requiredLink0 + 1 - requiredLink2);
    const current =
      link2Deficit > 0 ? pickFromPool(context, isLink2, link2Deficit) : context;

    // Trim link-0 in pool: allow at most (guaranteed link-2) - (guaranteed link-0).
    // In the worst case all allowed link-0 are selected and no additional
    // link-2 comes from pool, so this cap ensures link2 >= link0.
    const guaranteedLink2 = countInCards(current.required, isLink2);
    const allowedLink0InPool = Math.max(0, guaranteedLink2 - requiredLink0);

    let link0Seen = 0;
    const pool = current.pool.filter((card) => {
      if (getLink(card) !== 0) {
        return true;
      }
      link0Seen++;
      return link0Seen <= allowedLink0InPool;
    });

    return { ...current, pool };
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

/**
 * Constraint that requires at least 3 cards with link=2 in the selection.
 *
 * When applied, link=2 DuplicateCards are moved from the pool to
 * required until 3 link=2 cards are guaranteed. UniqueCards are
 * ignored because they lack a top-level link property.
 */
export const link2Gte3: Constraint = {
  id: "link2-gte-3",
  label: "リンク2を3枚以上含む",

  isSatisfied(cards: readonly CommonCard[]): boolean {
    return countInCards(cards, isLink2) >= 3;
  },

  canApply(context: Readonly<SelectionContext>): boolean {
    const totalLink2 =
      countInCards(context.pool, isLink2) +
      countInCards(context.required, isLink2);
    const totalCards = context.pool.length + context.required.length;
    return totalLink2 >= 3 && totalCards >= context.count;
  },

  apply(context: SelectionContext): SelectionContext {
    const alreadyRequired = countInCards(context.required, isLink2);
    const deficit = 3 - alreadyRequired;

    if (deficit <= 0) {
      return context;
    }

    return pickFromPool(context, isLink2, deficit);
  },
};

/**
 * Constraint that requires at least 1 card for each cost value 2, 3, 4, and 5.
 *
 * When applied, for each missing cost in the required set, one card
 * with that cost is picked from the pool using Fisher-Yates partial shuffle.
 */
export const eachCost2to5: Constraint = {
  id: "each-cost-2-to-5",
  label: "コスト2〜5を各1枚以上含む",

  isSatisfied(cards: readonly CommonCard[]): boolean {
    return [2, 3, 4, 5].every((cost) => cards.some((c) => c.cost === cost));
  },

  canApply(context: Readonly<SelectionContext>): boolean {
    const allCards = [...context.pool, ...context.required];
    const hasCost = [2, 3, 4, 5].every((cost) =>
      allCards.some((c) => c.cost === cost),
    );
    return hasCost && allCards.length >= context.count;
  },

  apply(context: SelectionContext): SelectionContext {
    let current = context;
    for (const cost of [2, 3, 4, 5]) {
      const alreadyHas = current.required.some((c) => c.cost === cost);
      if (!alreadyHas) {
        current = pickFromPool(current, (c) => c.cost === cost, 1);
      }
    }
    return current;
  },
};
