import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { applyBudoux } from "$lib/utils/budoux";

export const allCommons: CommonCard[] = [...Basic.commons, ...FarEasternBorder.commons];

const effectCache = new Map<number, string>();
const variantEffectCache = new Map<number, string[]>();

for (const card of allCommons) {
	if (card.hasChild) {
		effectCache.set(card.id, applyBudoux(card.cards[0]?.effect ?? ""));
		variantEffectCache.set(
			card.id,
			card.cards.map((v) => applyBudoux(v.effect)),
		);
	} else {
		effectCache.set(card.id, applyBudoux(card.effect));
	}
}

/** Get BudouX-processed effect HTML for a card's primary effect. */
export function getEffectHtml(card: CommonCard): string {
	return effectCache.get(card.id) ?? "";
}

/** Get BudouX-processed effect HTML for all variants of a UniqueCard. */
export function getVariantEffectsHtml(card: CommonCard): string[] {
	return variantEffectCache.get(card.id) ?? [];
}
