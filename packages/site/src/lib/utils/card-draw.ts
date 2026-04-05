import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { encodeCardIds } from "@heart-of-crown-randomizer/card-codec";
import type { Constraint } from "@heart-of-crown-randomizer/constraint";
import { filterByIds, select } from "@heart-of-crown-randomizer/randomizer";
import { validatePinConstraints, validateExcludeConstraints } from "./validation";
import { selectWithConstraints } from "./select-with-constraints";

type DrawResult = { ok: true; cards: CommonCard[] } | { ok: false; message: string };

/**
 * We validate constraints before selecting rather than catching errors
 * from select(), because validation produces user-facing Japanese
 * messages while select() would throw generic errors.
 */
export function drawRandomCards(
	allCommons: CommonCard[],
	numberOfCommons: number,
	pinnedCards: CommonCard[],
	excludedIds: ReadonlySet<number>,
	constraints?: readonly Constraint[],
): DrawResult {
	const pinValidation = validatePinConstraints(pinnedCards.length, numberOfCommons);
	if (!pinValidation.ok) {
		return { ok: false, message: pinValidation.message };
	}

	const availableCount = allCommons.reduce(
		(count, card) => count + (excludedIds.has(card.id) ? 0 : 1),
		0,
	);
	const excludeValidation = validateExcludeConstraints(availableCount, numberOfCommons);
	if (!excludeValidation.ok) {
		return { ok: false, message: excludeValidation.message };
	}

	const cards = selectWithConstraints(
		allCommons,
		pinnedCards,
		excludedIds,
		numberOfCommons,
		constraints,
	);
	return { ok: true, cards: cards.sort((a, b) => a.id - b.id) };
}

/**
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

/**
 * We include pin/exclude params in every URL transition rather than
 * relying on the State-to-URL effect, because goto() triggers the
 * URL-to-State effect which would clear pin/exclude state if the
 * params are absent from the URL.
 */
export function buildCardUrl(
	cards: CommonCard[],
	pinnedIds: ReadonlySet<number>,
	excludedIds: ReadonlySet<number>,
	currentSearchParams?: URLSearchParams,
): string {
	const params = new URLSearchParams();
	if (cards.length > 0) {
		params.set("s", encodeCardIds(cards.map((c) => c.id)));
	}
	for (const id of pinnedIds) {
		params.append("pin", String(id));
	}
	for (const id of excludedIds) {
		params.append("exclude", String(id));
	}
	const debug = currentSearchParams?.get("debug");
	if (debug != null) {
		params.set("debug", debug);
	}
	return `?${params.toString()}`;
}
