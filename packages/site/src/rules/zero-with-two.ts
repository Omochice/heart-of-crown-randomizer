import {
  type CommonCard,
  isUniqueCard,
} from "@heart-of-crown-randomizer/card/type";
import type { Rule } from "./type";

function someHas(cards: CommonCard[], link: number): boolean {
  return cards.some((card) => {
    if (isUniqueCard(card)) {
      return card.cards.some((c) => c.link === link);
    }
    return card.link === link;
  });
}

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
