import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "../../type";
import { countInCards, isLink2, pickFromPool } from "../_utils";

/**
 * Constraint that requires at least 3 cards with link=2 in the selection.
 *
 * When applied, link=2 DuplicateCards are moved from the pool to
 * required until 3 link=2 cards are guaranteed. UniqueCards are
 * ignored because they lack a top-level link property.
 */
export const link2Gte3: Constraint = {
  id: 3,
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
