import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "../../type";
import { isHighCost } from "../shared/card-properties";
import { pickFromPool } from "../shared/pick-from-pool";

const costPredicates: Array<(c: CommonCard) => boolean> = [
  (c) => c.cost === 2,
  (c) => c.cost === 3,
  (c) => c.cost === 4,
  isHighCost,
];

/**
 * Costs are filled sequentially (2, 3, 4, cost>=5) rather than all at once
 * so that each {@link pickFromPool} call sees the updated pool after
 * previous picks, preventing the same card from being selected twice.
 */
export const eachCost2to5: Constraint = {
  id: 5,
  label: "コスト2〜4、5以上を各1枚以上含む",

  isSatisfied(cards: readonly CommonCard[]): boolean {
    return costPredicates.every((pred) => cards.some(pred));
  },

  canApply(context: Readonly<SelectionContext>): boolean {
    const allCards = [...context.pool, ...context.required];
    const hasCost = costPredicates.every((pred) => allCards.some(pred));
    return hasCost && allCards.length >= context.count;
  },

  apply(context: SelectionContext): SelectionContext {
    let current = context;
    for (const pred of costPredicates) {
      const alreadyHas = current.required.some(pred);
      if (!alreadyHas) {
        current = pickFromPool(current, pred, 1);
      }
    }
    return current;
  },
};
