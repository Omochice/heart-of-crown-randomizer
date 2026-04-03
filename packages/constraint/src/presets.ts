import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint, SelectionContext } from "./type.js";

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
