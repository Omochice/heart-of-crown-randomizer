import type {
  CommonCard,
  DuplicateCard,
} from "@heart-of-crown-randomizer/card/type";

/**
 * Extract the link value from a card.
 *
 * UniqueCard has no top-level `link` property (its sub-cards each have
 * their own link values), so we return undefined for it rather than
 * trying to aggregate sub-card links.
 */
export function getLink(card: CommonCard): DuplicateCard["link"] | undefined {
  if (card.hasChild) {
    return undefined;
  }
  return card.link;
}

/**
 * Count how many cards in an array satisfy a predicate.
 */
export function countInCards(
  cards: readonly CommonCard[],
  predicate: (card: CommonCard) => boolean,
): number {
  let count = 0;
  for (const card of cards) {
    if (predicate(card)) count++;
  }
  return count;
}

/**
 * Check whether a card contains the specified main type.
 *
 * DuplicateCard has a top-level mainType array, while UniqueCard
 * has sub-cards each with their own mainType. This function handles
 * both variants uniformly.
 */
export function hasMainType(
  card: CommonCard,
  type:
    | "attack"
    | "action"
    | "territory"
    | "princess"
    | "succession"
    | "disaster",
): boolean {
  if (card.hasChild) {
    return card.cards.some((sub) => sub.mainType.includes(type));
  }
  return card.mainType.includes(type);
}

export function isHighCost(card: CommonCard): boolean {
  return card.cost >= 5;
}

/**
 * Check whether a card has link=0.
 *
 * Only DuplicateCards have a top-level `link` property.
 * UniqueCards have sub-cards with individual link values but no
 * top-level link, so they are never considered link=0 cards.
 */
export function isLink0(card: CommonCard): boolean {
  if (card.hasChild) {
    return false;
  }
  return card.link === 0;
}

/**
 * Check whether a card has link=2.
 *
 * Only DuplicateCards have a top-level `link` property.
 * UniqueCards have sub-cards with individual link values but no
 * top-level link, so they are never considered link=2 cards.
 */
export function isLink2(card: CommonCard): boolean {
  if (card.hasChild) {
    return false;
  }
  return card.link === 2;
}
