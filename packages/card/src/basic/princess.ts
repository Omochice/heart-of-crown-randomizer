import { Princess } from "../type";

export const princesses = [
  {
    id: 0,
    type: "princess",
    name: "第一皇女 ルルナサイカ",
    mainType: "princess",
    cost: 6,
    succession: 6,
    edition: 0,
    effect: "",
  },
  {
    id: 1,
    type: "princess",
    name: "第二皇女 ラオリリ",
    mainType: "princess",
    cost: 6,
    succession: 0,
    edition: 0,
    effect: "このプリンセスを擁立した時、「宮廷侍女」を5枚まで獲得しても良い。",
  },
  {
    id: 2,
    type: "princess",
    name: "南海の市姫 クラムクラム",
    mainType: "princess",
    cost: 6,
    succession: 0,
    edition: 0,
    effect:
      "あなたの〔カードの購入コスト〕は-1される（ただし1未満にはならない）。",
  },
  {
    id: 3,
    type: "princess",
    name: "大方博雅の姫 ベルガモット",
    mainType: "princess",
    cost: 6,
    succession: 0,
    edition: 0,
    effect:
      "手札からカードを1枚捨てる：あなたの捨て札から《行動》カードを1枚手札に加える。この能力はメインフェイズに1回のみ使用出来る。",
  },
  {
    id: 4,
    type: "princess",
    name: "姫将軍 フラマリア",
    mainType: "princess",
    cost: 6,
    succession: 0,
    edition: 0,
    effect:
      "このプリンセスを擁立した時、マーケットから〔コストが5以下のカード〕を2枚まで選び、あなたの山札の一番上に好きな順番で置いても良い。",
  },
  {
    id: 5,
    type: "princess",
    name: "双子の姫 レイン＆シオン",
    mainType: "princess",
    cost: 6,
    succession: 0,
    edition: 0,
    effect:
      "このプリンセスを擁立した時、あなたのフィールドにあるカードの総数が22~24なら2個、25以上なら3個の『双子カウンター』を得る。『双子カウンター』を1個ゲームから取り除く：このターンの後に追加のターンを得る。この能力で続けて追加のターンは得られない。",
  },
] as const satisfies Princess[];
