import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "../../type";
import { pickFromPool } from "../_utils";

/**
 * Constraint that requires at least 1 card for each cost value 2, 3, 4, and 5.
 *
 * When applied, for each missing cost in the required set, one card
 * with that cost is picked from the pool using Fisher-Yates partial shuffle.
 */
export const eachCost2to5: Constraint = {
  id: 5,
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
