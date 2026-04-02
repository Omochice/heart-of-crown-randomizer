import type { CommonCard, MainType } from "@heart-of-crown-randomizer/card/type";

const mainTypeLabels: Record<MainType, string> = {
	action: "行動",
	attack: "攻撃",
	territory: "領地",
	succession: "継承",
	disaster: "災い",
	princess: "姫",
};

export function getMainTypes(card: CommonCard): MainType[] {
	return card.hasChild ? (card.cards[0]?.mainType ?? ["action"]) : card.mainType;
}

export function getStripColor(card: CommonCard): string {
	const types = getMainTypes(card);
	if (types.includes("attack")) return "var(--accent-red)";
	if (types.includes("territory")) return "var(--accent-green)";
	return "var(--accent-indigo)";
}

export function getCategoryLabel(card: CommonCard): string {
	const types = getMainTypes(card);
	return mainTypeLabels[types[0]];
}
