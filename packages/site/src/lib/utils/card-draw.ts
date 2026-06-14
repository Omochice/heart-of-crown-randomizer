import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { Constraint } from "@heart-of-crown-randomizer/constraint";
import { encodeIds } from "@heart-of-crown-randomizer/id-codec";
import { selectWithConstraints } from "./select-with-constraints";
import {
  validateExcludeConstraints,
  validatePinConstraints,
} from "./validation";

type DrawResult =
  | { ok: true; cards: CommonCard[] }
  | { ok: false; message: string };

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
  const pinValidation = validatePinConstraints(
    pinnedCards.length,
    numberOfCommons,
  );
  if (!pinValidation.ok) {
    return { ok: false, message: pinValidation.message };
  }

  const availableCount = allCommons.reduce(
    (count, card) => count + (excludedIds.has(card.id) ? 0 : 1),
    0,
  );
  const excludeValidation = validateExcludeConstraints(
    availableCount,
    numberOfCommons,
  );
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
 * The already-selected cards are passed as required so the same
 * constraint-aware selection used by the initial draw fills the
 * remaining slots; otherwise an additional draw could add cards that
 * an active constraint excludes (e.g. attack cards under noAttack).
 */
export function drawMissingCommons(
  allCommons: CommonCard[],
  selectedCommons: CommonCard[],
  numberOfCommons: number,
  constraints?: readonly Constraint[],
  excludedIds?: ReadonlySet<number>,
): CommonCard[] {
  if (selectedCommons.length >= numberOfCommons) {
    return [];
  }

  const selectedIds = new Set(selectedCommons.map((c) => c.id));
  const hasAvailable = allCommons.some(
    (c) => !selectedIds.has(c.id) && !excludedIds?.has(c.id),
  );
  if (!hasAvailable) {
    return [];
  }

  const filled = selectWithConstraints(
    allCommons,
    selectedCommons,
    excludedIds ?? new Set(),
    numberOfCommons,
    constraints,
  );
  return filled.filter((c) => !selectedIds.has(c.id));
}

/**
 * Build a navigation URL that updates the card selection while carrying the
 * rest of the query through.
 *
 * We copy the incoming params rather than rebuilding from scratch: pin/exclude/
 * constraint (p/e/c) are continuously synced to the URL, so a fresh query would
 * strip the preferences the user just set on every draw.
 */
export function buildCardUrl(
  cards: CommonCard[],
  currentSearchParams?: URLSearchParams,
): string {
  const params = new URLSearchParams(currentSearchParams);
  if (cards.length > 0) {
    params.set("s", encodeIds(cards.map((c) => c.id)));
  } else {
    params.delete("s");
  }
  return `?${params.toString()}`;
}
