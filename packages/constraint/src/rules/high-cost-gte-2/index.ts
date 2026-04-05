import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "../../type";
import { countInCards, isHighCost } from "../shared/card-properties";
import { pickFromPool } from "../shared/pick-from-pool";

/**
 * Uses Fisher-Yates partial shuffle via {@link pickFromPool} to fill
 * the deficit, avoiding full-array shuffles for better performance.
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
