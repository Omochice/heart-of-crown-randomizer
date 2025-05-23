import type { CommonCard } from "../type";

export const commons = [
  {
    id: 17,
    type: "common",
    name: "隠れ家",
    mainType: ["action"],
    cost: 2,
    hasChild: false,
    coin: 1,
    link: 1,
    effect:
      "このターン中に、初めて「隠れ家」をプレイしている場合、あなたの捨て札にある〔攻撃を持たない《行動／継承権》カード〕を1枚選んで、あなたの山札の一番上に公開して置いても良い。",
    edition: 0,
  },
  {
    id: 18,
    type: "common",
    name: "寄付",
    mainType: ["action"],
    cost: 2,
    hasChild: false,
    link: 1,
    effect: "手札からカードを1枚追放する。",
    edition: 0,
  },
  {
    id: 19,
    type: "common",
    name: "城壁",
    mainType: ["action"],
    cost: 2,
    coin: 1,
    hasChild: false,
    link: 1,
    effect:
      "このターン中に、初めて「城壁」をプレイしている場合、あなたの捨て札にある〔最もコストの低い《領地》カード〕を1枚手札に加えても良い。",
    edition: 0,
  },
  {
    id: 20,
    type: "common",
    name: "斥候",
    mainType: ["action"],
    subType: "millitary",
    cost: 2,
    hasChild: false,
    link: 1,
    effect:
      "あなたの山札の一番上にあるカードを見る。あなたはそのカードを捨てても良い。その後、カードを1枚引く。",
    edition: 0,
  },
  {
    id: 21,
    type: "common",
    name: "願いの泉",
    mainType: ["action"],
    cost: 2,
    hasChild: false,
    link: 1,
    effect:
      "手札から好きな枚数のカードを捨てる。その後、そうして捨てたカードと同じ枚数のカードを引く。",
    edition: 0,
  },
  {
    id: 22,
    type: "common",
    name: "早馬",
    mainType: ["action"],
    cost: 2,
    hasChild: false,
    link: 2,
    effect: "カードを1枚引く。",
    edition: 0,
  },
  {
    id: 23,
    type: "common",
    name: "埋もれた財宝",
    mainType: ["action"],
    cost: 3,
    hasChild: false,
    link: 1,
    effect:
      "サプライの一番下にあるカードを取り、サプライの一番上に公開して置く。このターン中、そうして公開したカードはマーケットにある物として扱い、その購入コストは-3になる（ただし0未満にはならない）。",
    edition: 0,
  },
  {
    id: 24,
    type: "common",
    name: "交易船",
    mainType: ["action"],
    subType: "merchant",
    cost: 3,
    hasChild: false,
    link: 0,
    effect: "次の効果の中から1つを選んで得る。カードを2枚引く。2コイン得る。",
    edition: 0,
  },
  {
    id: 25,
    type: "common",
    name: "御用商人",
    mainType: ["action"],
    subType: "merchant",
    cost: 3,
    coin: 2,
    hasChild: false,
    link: 1,
    effect: "",
    edition: 0,
  },
  {
    id: 26,
    type: "common",
    name: "都市開発",
    mainType: ["action"],
    subType: "merchant",
    cost: 3,
    hasChild: false,
    link: 1,
    effect:
      "次の効果の中から1つを選んで得る。1コイン支払う。そうした場合、手札から「農村」を1枚追放する。その後、「都市」を1枚マーケットから手札に加える。1コイン支払う。そうした場合、手札から「都市」を1枚追放する。その後、「大都市」を1枚マーケットから手札に加える。",
    edition: 0,
  },
  {
    id: 27,
    type: "common",
    name: "破城槌",
    mainType: ["action", "attack"],
    cost: 3,
    hasChild: false,
    link: 1,
    effect:
      "カードを1枚引く。〔全ての対戦相手〕は、〔各自の直轄地にキープされているコストが最も低いカード〕を1枚捨てる。",
    edition: 0,
  },
  {
    id: 28,
    type: "common",
    name: "星詠みの魔女",
    mainType: ["action"],
    subType: "magic",
    cost: 3,
    hasChild: false,
    link: 2,
    effect:
      "あなたの山札の一番上から2枚のカードを見る。その中から、好きな枚数のカードを捨て、残りを好きな順番で山札の一番上に戻す。その後、カードを1枚引く。",
    edition: 0,
  },
  {
    id: 29,
    type: "common",
    name: "魔法の護符",
    mainType: ["action"],
    subType: "magic",
    cost: 3,
    coin: 2,
    hasChild: false,
    link: 0,
    effect:
      "このターン中に、初めて「魔法の護符」をプレイしている場合、次の効果の中から1つを選んで得る。あなたの〔捨て札か手札〕にある《災い》カードを1枚追放する。あなたの捨て札にある《行動・継承権》カードを1枚手札に加える。",
    edition: 0,
  },
  {
    id: 30,
    type: "common",
    name: "よろず屋",
    mainType: ["action"],
    subType: "merchant",
    cost: 3,
    hasChild: false,
    link: 0,
    effect:
      "次の効果の中から1つを選んで得る。手札から《災い》以外のカードを1枚追放する。「コインカウンター」を1個得る。この効果で貯められる「コインカウンター」は2個までである。",
    edition: 0,
  },
  {
    id: 31,
    type: "common",
    name: "追い立てられた魔獣",
    mainType: ["action", "attack"],
    subType: "plot",
    cost: 4,
    hasChild: false,
    link: 1,
    effect:
      "カードを1枚引く。〔手札を5枚以上持つ全ての対戦相手〕は、各自の手札から〔コストが5以上のカード〕を1枚捨てる。手札にコスト5以上のカードが1枚もない場合、手札を公開する。",
    edition: 0,
  },
  {
    id: 32,
    type: "common",
    name: "お付きの侍女",
    cost: 4,
    edition: 0,
    cards: [
      {
        name: "お付きの侍女 シャリファ",
        mainType: ["succession", "attack"],
        subType: "maid",
        cost: 4,
        succession: 2,
        coin: 0,
        link: 0,
        effect:
          "（このカードは「お付きの侍女」である。「お付きの侍女」同士はマーケットでスタックし、スタックしたカードの中から選んで購入・獲得出来る。）このカードを購入したとき、あなたの直轄地があるなら、このカードをセットしてもよい。このカードを直轄地にセットした時、次の効果を得る。〔全ての対戦相手〕は、「呪い」をマーケットから1枚取り各自の山札の一番上に公開して置く。",
      },
      {
        name: "お付きの侍女 プティー",
        mainType: ["succession", "attack"],
        subType: "maid",
        cost: 4,
        succession: 2,
        coin: 0,
        link: 0,
        effect:
          "（このカードは「お付きの侍女」である。「お付きの侍女」同士はマーケットでスタックし、スタックしたカードの中から選んで購入・獲得出来る。）このカードを購入したとき、あなたの直轄地があるなら、このカードをセットしてもよい。このカードを直轄地にセットした時、次の効果を得る。〔全ての対戦相手〕は、各自の直轄地にある「宮廷侍女」「議員」「公爵」の中から〔最もコストの低いカード〕を1枚捨てる。",
      },
      {
        name: "お付きの侍女 ホノカ",
        mainType: ["succession"],
        subType: "maid",
        cost: 4,
        succession: 2,
        coin: 0,
        link: 0,
        effect:
          "（このカードは「お付きの侍女」である。「お付きの侍女」同士はマーケットでスタックし、スタックしたカードの中から選んで購入・獲得出来る。）このカードを購入したとき、あなたの直轄地があるなら、このカードをセットしてもよい。あなたの直轄地に、このカードの他に《侍女》カードがないならば、このカードの継承点は4として扱う。",
      },
      {
        name: "お付きの侍女 ミンニャン",
        mainType: ["succession"],
        subType: "maid",
        cost: 4,
        succession: 2,
        coin: 0,
        link: 0,
        effect:
          "（このカードは「お付きの侍女」である。「お付きの侍女」同士はマーケットでスタックし、スタックしたカードの中から選んで購入・獲得出来る。）このカードを購入したとき、あなたの直轄地があるなら、このカードをセットしてもよい。このカードを直轄地にセットした時、あなたは「コインカウンター」を1個得る。",
      },
      {
        name: "お付きの侍女 リリー",
        mainType: ["succession"],
        subType: "maid",
        cost: 4,
        succession: 2,
        coin: 0,
        link: 0,
        effect:
          "（このカードは「お付きの侍女」である。「お付きの侍女」同士はマーケットでスタックし、スタックしたカードの中から選んで購入・獲得出来る。）このカードを購入したとき、あなたの直轄地があるなら、このカードをセットしてもよい。（このカードが直轄地にセットされている時）3コイン支払う：あなたの直轄地にあるプリンセスカードの上に「+1継承権カウンター」を1個置く。この能力はあなたのメインフェイズ中に1回のみ使用できる。",
      },
    ],
    hasChild: true,
  },
  {
    id: 33,
    type: "common",
    name: "開墾令",
    mainType: ["action", "attack"],
    subType: "plot",
    cost: 4,
    hasChild: false,
    coin: 2,
    link: 0,
    effect:
      "〔山札の一番上に「農村」が公開されていない全ての対戦相手〕は、マーケットから「農村」を1枚取り、各自の山札の一番上に公開して置く。",
    edition: 0,
  },
  {
    id: 34,
    type: "common",
    name: "銀行",
    mainType: ["action"],
    subType: "merchant",
    cost: 4,
    hasChild: false,
    coin: 2,
    link: 0,
    effect:
      "このターン中、既に「都市」か「大都市」をプレイしているなら、追加の1コインを得る。",
    edition: 0,
  },
  {
    id: 35,
    type: "common",
    name: "図書館",
    mainType: ["action"],
    cost: 4,
    coin: 1,
    hasChild: false,
    link: 1,
    effect:
      "このターン中に、初めて「図書館」をプレイしている場合、次の効果を得る。このターン中に、行動カードをプレイする時、追加の1コインを得る。 ",
    edition: 0,
  },
  {
    id: 36,
    type: "common",
    name: "のみの市",
    mainType: ["action"],
    subType: "merchant",
    cost: 4,
    coin: 1,
    hasChild: false,
    link: 2,
    effect: "カードを1枚引く。",
    edition: 0,
  },
  {
    id: 37,
    type: "common",
    name: "補給部隊",
    mainType: ["action"],
    subType: "millitary",
    cost: 4,
    hasChild: false,
    link: 2,
    effect:
      "カードを1枚引く。クリンナップフェイズの開始時に、あなたのプレイエリアにある「補給部隊」以外の《行動》カードを1枚選び、あなたの山札の一番上に公開して置いてもよい。",
    edition: 0,
  },
  {
    id: 38,
    type: "common",
    name: "歩兵大隊",
    mainType: ["action", "attack"],
    subType: "millitary",
    cost: 4,
    coin: 2,
    hasChild: false,
    link: 0,
    effect:
      "〔手札を5枚以上持つ全ての対戦相手〕は、各自の手札から《領地》カードを1枚捨てる。手札に《領地》カードが無い場合は、手札を公開する。",
    edition: 0,
  },
  {
    id: 39,
    type: "common",
    name: "皇室領",
    mainType: ["territory", "succession"],
    cost: 5,
    succession: 2,
    coin: 2,
    hasChild: false,
    link: 1,
    effect:
      "クリンナップフェイズの開始時に、あなたの直轄地があるならば、このカードをセットする。",
    edition: 0,
  },
  {
    id: 40,
    type: "common",
    name: "近衛騎士団",
    mainType: ["action", "attack"],
    subType: "millitary",
    cost: 5,
    coin: 2,
    hasChild: false,
    link: 0,
    effect: "〔全ての対戦相手〕は、各自の山札の上から3枚のカードを捨てる。",
    edition: 0,
  },
  {
    id: 41,
    type: "common",
    name: "呪詛の魔女",
    mainType: ["action", "attack"],
    subType: "magic",
    cost: 5,
    hasChild: false,
    link: 0,
    effect:
      "1コイン支払うか、手札から《行動・継承権》カードを1枚選んで追放する。そうした場合、次の効果の中から1つを選んで得る。〔全ての対戦相手〕は「呪い」を1枚獲得する。あなたはカードを2枚引く。",
    edition: 0,
  },
  {
    id: 42,
    type: "common",
    name: "舞踏会",
    mainType: ["action"],
    cost: 5,
    hasChild: false,
    link: 1,
    effect:
      "カードを1枚引く。このターン中に、初めて「舞踏会」をプレイしている場合、次の効果の中から1つを選んで得る。1コイン得る。このターン中に《継承権》カードを購入する場合、購入コストは-1される（ただし2未満にはならない）。",
    edition: 0,
  },
  {
    id: 43,
    type: "common",
    name: "冒険者",
    mainType: ["action"],
    cost: 5,
    hasChild: false,
    link: 0,
    effect:
      "手札から《災い》以外のカードを1枚追放する。そうした場合、〔追放したカードのコスト+2以下のコストを持つカード〕をマーケットから1枚獲得する。",
    edition: 0,
  },
  {
    id: 44,
    type: "common",
    name: "魅了術の魔女",
    mainType: ["action", "attack"],
    subType: "magic",
    cost: 5,
    hasChild: false,
    link: 1,
    effect:
      "カードを1枚引く。〔手札を5枚以上持つ全ての対戦相手〕は、各自の手札から《行動・継承権》カードを1枚捨てる。手札に《行動・継承権》カードがない場合、手札を公開する。このターン中に、〔この効果により対戦相手が捨てたカードと同じタイプを持つカード〕の購入コストは-1される（ただし2未満にはならない）。",
    edition: 0,
  },
  {
    id: 45,
    type: "common",
    name: "錬金術師",
    mainType: ["action"],
    cost: 5,
    hasChild: false,
    link: 1,
    effect: "カードを2枚引く。",
    edition: 0,
  },
  {
    id: 46,
    type: "common",
    name: "噂好きの公爵夫人",
    mainType: ["succession", "attack"],
    cost: 6,
    succession: 3,
    hasChild: false,
    link: 0,
    effect:
      "このカードを直轄地にセットした時、次の効果を得る。〔全ての対戦相手〕は、各自の直轄地にある「宮廷侍女」「議員」「公爵」の中から〔最もコストの高いカード〕を1枚捨てる。",
    edition: 0,
  },
  {
    id: 47,
    type: "common",
    name: "辺境伯",
    mainType: ["action", "succession"],
    cost: 6,
    succession: 3,
    coin: 3,
    hasChild: false,
    link: 0,
    effect:
      "このカードはキープ出来ない。クリンナップフェイズの開始時に、あなたの直轄地があるならば、このカードをセットする。",
    edition: 0,
  },
] as const satisfies CommonCard[];
