import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

/**
 * Card state type definitions
 */
export type CardStateType = "normal" | "pinned" | "excluded";

/**
 * Internal state: pinned and excluded card IDs
 * WARNING: Module-scoped state can persist across SSR requests.
 * Initialize from URL in +page.svelte $effect to avoid stale data.
 *
 * We use objects with Set properties rather than exporting Sets directly
 * because Svelte 5 runes do not allow reassigning exported state.
 */
const state = $state({
	pinnedCardIds: new Set<number>(),
	excludedCardIds: new Set<number>(),
});

// Export readonly access to the Sets
export const pinnedCardIds = state.pinnedCardIds;
export const excludedCardIds = state.excludedCardIds;

/**
 * Derived state: get card state by ID
 */
export function getCardState(cardId: number): CardStateType {
	if (pinnedCardIds.has(cardId)) return "pinned";
	if (excludedCardIds.has(cardId)) return "excluded";
	return "normal";
}

/**
 * Toggle pin state for a card
 *
 * We auto-remove from excludedCardIds rather than requiring the caller
 * to manually unexclude first, because the UI interaction is a single
 * button click and users expect immediate state change.
 */
export function togglePin(cardId: number): void {
	if (state.pinnedCardIds.has(cardId)) {
		state.pinnedCardIds.delete(cardId);
	} else {
		state.pinnedCardIds.add(cardId);
		state.excludedCardIds.delete(cardId); // Cannot be both pinned and excluded
	}
}

/**
 * Toggle exclude state for a card
 *
 * We auto-remove from pinnedCardIds rather than requiring the caller
 * to manually unpin first, because the UI interaction is a single
 * button click and users expect immediate state change.
 */
export function toggleExclude(cardId: number): void {
	if (state.excludedCardIds.has(cardId)) {
		state.excludedCardIds.delete(cardId);
	} else {
		state.excludedCardIds.add(cardId);
		state.pinnedCardIds.delete(cardId); // Cannot be both excluded and pinned
	}
}

/**
 * Get pinned cards from a list of cards
 */
export function getPinnedCards(allCards: CommonCard[]): CommonCard[] {
	return allCards.filter((card) => pinnedCardIds.has(card.id));
}

/**
 * Get excluded cards from a list of cards
 */
export function getExcludedCards(allCards: CommonCard[]): CommonCard[] {
	return allCards.filter((card) => excludedCardIds.has(card.id));
}
