import type { Princess } from "../type";

export const princesses = [
  {
    id: 48,
    type: "princess",
    name: "極東の算法姫 オウカ",
    mainType: "princess",
    cost: 6,
    succession: 0,
    edition: 1,
    effect:
      "〔手札かプレイエリア〕にある、コスト6以下で異なる名前を持つ《領地・災い》以外のカードを2枚選んで追放する。そうした場合、〔追放したカードの合計コスト-1に等しいコストを持つカード〕をマーケットから1枚選んであなたの山札の一番上に公開して置く。この能力はセカンドフェイズ終了時に1回のみ使用出来る。",
  },
] as const satisfies Princess[];
