import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "../../type";
import { countInCards, isLink2 } from "../shared/card-properties";
import { pickFromPool } from "../shared/pick-from-pool";

/**
 * Only DuplicateCards are counted because UniqueCards lack a top-level
 * link property and cannot contribute to link-based constraints.
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
