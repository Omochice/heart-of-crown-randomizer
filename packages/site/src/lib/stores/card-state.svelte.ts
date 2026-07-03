import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { SvelteSet } from "svelte/reactivity";

export type CardStateType = "normal" | "pinned" | "excluded";

/**
 * We use SvelteSet rather than a plain Set inside a $state proxy because
 * the proxy does not propagate Set.add()/delete() mutations to $derived
 * in other modules; SvelteSet makes those mutations observable directly.
 */
const pinnedCardIds = new SvelteSet<number>();
const excludedCardIds = new SvelteSet<number>();

/**
 * We diff instead of clear-and-add because clearing would also empty an
 * aliased input set and would invalidate subscribers of members that did
 * not change.
 */
function replaceWith(
  target: SvelteSet<number>,
  ids: ReadonlySet<number>,
): void {
  if (target === ids) {
    return;
  }
  for (const id of target) {
    if (!ids.has(id)) {
      target.delete(id);
    }
  }
  for (const id of ids) {
    target.add(id);
  }
}

export function getPinnedCardIds(): ReadonlySet<number> {
  return pinnedCardIds;
}

export function getExcludedCardIds(): ReadonlySet<number> {
  return excludedCardIds;
}

export function setPinnedCardIds(ids: Set<number>): void {
  replaceWith(pinnedCardIds, ids);
  for (const id of ids) {
    excludedCardIds.delete(id);
  }
}

export function setExcludedCardIds(ids: Set<number>): void {
  replaceWith(excludedCardIds, ids);
  for (const id of ids) {
    pinnedCardIds.delete(id);
  }
}

export function getCardState(cardId: number): CardStateType {
  if (pinnedCardIds.has(cardId)) {
    return "pinned";
  }
  if (excludedCardIds.has(cardId)) {
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
  if (pinnedCardIds.has(cardId)) {
    pinnedCardIds.delete(cardId);
  } else {
    pinnedCardIds.add(cardId);
    excludedCardIds.delete(cardId); // Cannot be both pinned and excluded
  }
}

/**
 * We auto-remove from pinnedCardIds rather than requiring the caller
 * to manually unpin first, because the UI interaction is a single
 * button click and users expect immediate state change.
 */
export function toggleExclude(cardId: number): void {
  if (excludedCardIds.has(cardId)) {
    excludedCardIds.delete(cardId);
  } else {
    excludedCardIds.add(cardId);
    pinnedCardIds.delete(cardId); // Cannot be both excluded and pinned
  }
}

export function getPinnedCards(allCards: CommonCard[]): CommonCard[] {
  return allCards.filter((card) => pinnedCardIds.has(card.id));
}

export function getExcludedCards(allCards: CommonCard[]): CommonCard[] {
  return allCards.filter((card) => excludedCardIds.has(card.id));
}
