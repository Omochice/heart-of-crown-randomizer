import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "../../type";
import { hasMainType } from "../_utils";

/**
 * For UniqueCards, if any sub-card has "attack", the entire card is
 * excluded because a UniqueCard is played as a single unit.
 */
export const noAttack: Constraint = {
  id: 1,
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
