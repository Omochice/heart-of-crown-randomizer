import type { RareCard } from "../type";

export const rares = [
  {
    id: 15,
    type: "rare",
    name: "帝都カリクマ",
    mainType: ["territory", "succession"],
    cost: 11,
    succession: 6,
    coin: 3,
    link: 1,
    effect:
      "クリンナップフェイズの開始時に、あなたの直轄地があるならば、このカードをセットする。",
    edition: 0,
  },
  {
    id: 16,
    type: "rare",
    name: "皇帝の冠",
    mainType: ["succession"],
    cost: 14,
    succession: 14,
    coin: 0,
    link: 0,
    effect: "",
    edition: 0,
  },
] as const satisfies RareCard[];
