import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, PickContext, SelectionContext } from "../../type";
import { countInCards, isLink0, isLink2 } from "../shared/card-properties";
import { pickFromPool } from "../shared/pick-from-pool";

/**
 * Constraint ensuring the number of link-2 cards is at least as large
 * as the number of link-0 cards in the final selection.
 *
 * apply() forces a minimal number of link-2 cards into required to
 * cover any required link-0 cards, ensuring validateCombination works.
 *
 * filterPoolForNextPick() dynamically narrows the candidate pool on
 * each iterative pick using a link budget algorithm, allowing all
 * link-0 cards to remain in the pool while guaranteeing the constraint.
 */
export const link2GteLink0: Constraint = {
  id: 2,
  label: "リンク2の数 ≧ リンク0の数",

  isSatisfied(cards: readonly CommonCard[]): boolean {
    const link0Count = countInCards(cards, isLink0);
    const link2Count = countInCards(cards, isLink2);
    return link2Count >= link0Count;
  },

  canApply(context: Readonly<SelectionContext>): boolean {
    const poolLink2 = countInCards(context.pool, isLink2);
    const requiredLink2 = countInCards(context.required, isLink2);
    return poolLink2 + requiredLink2 >= 1;
  },

  apply(context: SelectionContext): SelectionContext {
    const requiredLink0 = countInCards(context.required, isLink0);
    const requiredLink2 = countInCards(context.required, isLink2);

    const link2Deficit = Math.max(0, requiredLink0 - requiredLink2);
    const remainingSlots = Math.max(0, context.count - context.required.length);
    const forcedLink2 = Math.min(link2Deficit, remainingSlots);
    if (forcedLink2 <= 0) {
      return context;
    }
    return pickFromPool(context, isLink2, forcedLink2);
  },

  filterPoolForNextPick(context: Readonly<PickContext>): readonly CommonCard[] {
    const budget =
      countInCards(context.picked, isLink2) -
      countInCards(context.picked, isLink0);
    const slack = budget + context.remainingCount;

    if (slack >= 2) {
      return context.pool;
    }
    if (slack === 1) {
      return context.pool.filter((c) => !isLink0(c));
    }
    return context.pool.filter(isLink2);
  },
};
