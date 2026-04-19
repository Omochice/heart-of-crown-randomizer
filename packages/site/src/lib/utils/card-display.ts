import type {
  CommonCard,
  MainType,
  SubType,
} from "@heart-of-crown-randomizer/card/type";

const subTypeLabels: Record<SubType, string> = {
  maid: "侍女",
  military: "兵力",
  magic: "魔法",
  merchant: "商人",
  plot: "計略",
};

const mainTypeLabels: Record<MainType, string> = {
  action: "行動",
  attack: "攻撃",
  territory: "領地",
  succession: "継承",
  disaster: "災い",
  princess: "姫",
};

export function getMainTypes(card: CommonCard): MainType[] {
  return card.hasChild
    ? [...new Set(card.cards.flatMap((c) => c.mainType))]
    : card.mainType;
}

export function getStripColor(card: CommonCard): string {
  const types = getMainTypes(card);
  if (types.includes("attack")) {
    return "var(--accent-red)";
  }
  if (types.includes("territory")) {
    return "var(--accent-green)";
  }
  return "var(--accent-indigo)";
}

export function getCategoryLabel(card: CommonCard): string {
  const types = getMainTypes(card);
  return mainTypeLabels[types[0]];
}

export function getSubTypeLabel(card: CommonCard): string | undefined {
  const subType = card.hasChild ? card.cards[0]?.subType : card.subType;
  return subType ? subTypeLabels[subType] : undefined;
}
