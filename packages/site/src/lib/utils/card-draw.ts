import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { filterByIds, select } from "@heart-of-crown-randomizer/randomizer";
import { validatePinConstraints, validateExcludeConstraints } from "./validation";
import { selectWithConstraints } from "./select-with-constraints";

type DrawResult = { ok: true; cards: CommonCard[] } | { ok: false; message: string };

/**
 * Draw a full set of random cards with pin/exclude constraints.
 *
 * We validate constraints before selecting rather than catching errors
 * from select(), because validation produces user-facing Japanese
 * messages while select() would throw generic errors.
 */
export function drawRandomCards(
	allCommons: CommonCard[],
	numberOfCommons: number,
	pinnedCards: CommonCard[],
	excludedIds: Set<number>,
): DrawResult {
	const pinValidation = validatePinConstraints(pinnedCards.length, numberOfCommons);
	if (!pinValidation.ok) {
		return { ok: false, message: pinValidation.message };
	}

	const availableCards = allCommons.filter((card) => !excludedIds.has(card.id));
	const excludeValidation = validateExcludeConstraints(availableCards.length, numberOfCommons);
	if (!excludeValidation.ok) {
		return { ok: false, message: excludeValidation.message };
	}

	const cards = selectWithConstraints(allCommons, pinnedCards, excludedIds, numberOfCommons);
	return { ok: true, cards: cards.sort((a, b) => a.id - b.id) };
}

/**
 * Draw additional cards to fill missing slots in the current selection.
 *
 * We filter out already-selected cards by ID rather than by reference
 * because card objects may differ between renders while IDs are stable.
 */
export function drawMissingCommons(
	allCommons: CommonCard[],
	selectedCommons: CommonCard[],
	numberOfCommons: number,
): CommonCard[] {
	if (selectedCommons.length >= numberOfCommons) return [];

	const excludedIds = selectedCommons.map((c) => c.id);
	const availableCommons = filterByIds(allCommons, excludedIds);

	if (availableCommons.length === 0) return [];

	const cardsToAdd = numberOfCommons - selectedCommons.length;
	return select(availableCommons, cardsToAdd);
}

export function cardsToQuery(cards: CommonCard[]): string {
	return cards
		.reduce((query, card) => {
			query.append("card", card.id.toString());
			return query;
		}, new URLSearchParams())
		.toString();
}

/**
 * Build a URL string with card selection and pin/exclude state.
 *
 * We include pin/exclude params in every URL transition rather than
 * relying on the State-to-URL effect, because goto() triggers the
 * URL-to-State effect which would clear pin/exclude state if the
 * params are absent from the URL.
 */
export function buildCardUrl(
	cards: CommonCard[],
	pinnedIds: Set<number>,
	excludedIds: Set<number>,
): string {
	const params = new URLSearchParams();
	for (const card of cards) {
		params.append("card", card.id.toString());
	}
	for (const id of pinnedIds) {
		params.append("pin", String(id));
	}
	for (const id of excludedIds) {
		params.append("exclude", String(id));
	}
	return `?${params.toString()}`;
}
