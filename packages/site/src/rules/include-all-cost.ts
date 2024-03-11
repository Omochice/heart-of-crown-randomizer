import { type CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Rule } from "./type";

// NOTE: This rule is based on:
// https://github.com/kana/hatokurandom/blob/22cf98853340394f2d53a1c59cfab80d438aca36/lib/utils.js#L1518

export const rule: Rule = {
  description:
    "各コスト帯のカードを1枚以上含めるようにします。ただし6コスト以上のカードは5コスト帯として扱います。",
  expr: (cards: CommonCard[]) => {
    const costs = new Set<number>(
      cards.map((card) => (card.cost > 5 ? 5 : card.cost)),
    );
    return costs.size === 4;
  },
};
