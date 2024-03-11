import {
  type CommonCard,
  isUniqueCard,
} from "@heart-of-crown-randomizer/card/type";
import type { Rule } from "./type";

/**
 * Check cards has some links
 * @param cards Cards to check
 * @param link Number of links
 * @returns True if cards has some links
 */
function someHas(cards: CommonCard[], link: number): boolean {
  return cards.some((card) => {
    if (isUniqueCard(card)) {
      // NOTE: unique card is treats as no link
      return false;
    }
    return card.link === link;
  });
}

// NOTE: This rule is based on:
// https://github.com/kana/hatokurandom/blob/22cf98853340394f2d53a1c59cfab80d438aca36/lib/utils.js#L1509

export const rule: Rule = {
  description:
    "サプライにリンク0のカードが含まれる場合、リンク2のカードを1枚は含めるようにする。",
  expr: (cards: CommonCard[]) => {
    const hasZero = someHas(cards, 0);
    if (!hasZero) {
      return true;
    }
    return someHas(cards, 2);
  },
};
