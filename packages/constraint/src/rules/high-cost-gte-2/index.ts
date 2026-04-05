import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "../../type";
import { countInCards, isHighCost, pickFromPool } from "../_utils";

/**
 * Constraint that requires at least 2 high-cost (cost >= 5) cards in the selection.
 *
 * When applied, if fewer than 2 high-cost cards are already in required,
 * the deficit is filled by picking from the pool using Fisher-Yates
 * partial shuffle for unbiased random selection.
 */
export const highCostGte2: Constraint = {
  id: 4,
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
