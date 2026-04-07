import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "../../type";
import { countInCards, getLink, isLink2 } from "../shared/card-properties";
import { pickFromPool } from "../shared/pick-from-pool";

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
  id: 2,
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

    const link2Deficit = Math.max(0, requiredLink0 + 1 - requiredLink2);
    if (link2Deficit <= 0) {
      return context;
    }
    return pickFromPool(context, isLink2, link2Deficit);
  },
};
