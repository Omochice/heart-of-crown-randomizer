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

const mainTypeColors: Record<MainType, string> = {
  action: "var(--card-action)",
  attack: "var(--card-attack)",
  territory: "var(--card-territory)",
  succession: "var(--card-succession)",
  disaster: "var(--card-disaster)",
  princess: "var(--card-princess)",
};

export function getStripColors(card: CommonCard): string[] {
  const types = getMainTypes(card);
  return types.map((t) => mainTypeColors[t]);
}

export function getCategoryLabels(
  card: CommonCard,
): { label: string; color: string }[] {
  const types = getMainTypes(card);
  return types.map((t) => ({
    label: mainTypeLabels[t],
    color: mainTypeColors[t],
  }));
}

export function getSubTypeLabel(card: CommonCard): string | undefined {
  const subType = card.hasChild ? card.cards[0]?.subType : card.subType;
  return subType ? subTypeLabels[subType] : undefined;
}
