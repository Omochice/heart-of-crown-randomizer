import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

export type CardStateType = "normal" | "pinned" | "excluded";

/**
 * We reassign entire Sets rather than mutating them because Svelte 5's
 * $state proxy does not reliably propagate Set.add()/delete() mutations
 * to $derived in other modules. Property reassignment guarantees the
 * proxy detects the change.
 */
const state = $state({
  pinnedCardIds: new Set<number>(),
  excludedCardIds: new Set<number>(),
});

export function getPinnedCardIds(): ReadonlySet<number> {
  return state.pinnedCardIds;
}

export function getExcludedCardIds(): ReadonlySet<number> {
  return state.excludedCardIds;
}

export function setPinnedCardIds(ids: Set<number>): void {
  const nextPinned = new Set(ids);
  const nextExcluded = new Set(state.excludedCardIds);
  for (const id of nextPinned) {
    nextExcluded.delete(id);
  }
  state.pinnedCardIds = nextPinned;
  state.excludedCardIds = nextExcluded;
}

export function setExcludedCardIds(ids: Set<number>): void {
  const nextExcluded = new Set(ids);
  const nextPinned = new Set(state.pinnedCardIds);
  for (const id of nextExcluded) {
    nextPinned.delete(id);
  }
  state.excludedCardIds = nextExcluded;
  state.pinnedCardIds = nextPinned;
}

export function getCardState(cardId: number): CardStateType {
  if (state.pinnedCardIds.has(cardId)) {
    return "pinned";
  }
  if (state.excludedCardIds.has(cardId)) {
    return "excluded";
  }
  return "normal";
}

/**
 * We auto-remove from excludedCardIds rather than requiring the caller
 * to manually unexclude first, because the UI interaction is a single
 * button click and users expect immediate state change.
 */
export function togglePin(cardId: number): void {
  const nextPinned = new Set(state.pinnedCardIds);
  const nextExcluded = new Set(state.excludedCardIds);

  if (nextPinned.has(cardId)) {
    nextPinned.delete(cardId);
  } else {
    nextPinned.add(cardId);
    nextExcluded.delete(cardId); // Cannot be both pinned and excluded
  }

  state.pinnedCardIds = nextPinned;
  state.excludedCardIds = nextExcluded;
}

/**
 * We auto-remove from pinnedCardIds rather than requiring the caller
 * to manually unpin first, because the UI interaction is a single
 * button click and users expect immediate state change.
 */
export function toggleExclude(cardId: number): void {
  const nextPinned = new Set(state.pinnedCardIds);
  const nextExcluded = new Set(state.excludedCardIds);

  if (nextExcluded.has(cardId)) {
    nextExcluded.delete(cardId);
  } else {
    nextExcluded.add(cardId);
    nextPinned.delete(cardId); // Cannot be both excluded and pinned
  }

  state.pinnedCardIds = nextPinned;
  state.excludedCardIds = nextExcluded;
}

export function getPinnedCards(allCards: CommonCard[]): CommonCard[] {
  return allCards.filter((card) => state.pinnedCardIds.has(card.id));
}

export function getExcludedCards(allCards: CommonCard[]): CommonCard[] {
  return allCards.filter((card) => state.excludedCardIds.has(card.id));
}
