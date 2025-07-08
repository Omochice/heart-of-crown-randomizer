import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { CardsByEdition, CardFilterPredicate } from "../types/index.js";

/**
 * Get all common cards from both editions
 */
export function getAllCommonCards(): readonly CommonCard[] {
  return Object.freeze([
    ...Basic.commons,
    ...FarEasternBorder.commons,
  ]);
}

/**
 * Filter available cards excluding specified cards
 */
export function getAvailableCards(excludedCards: readonly CommonCard[]): readonly CommonCard[] {
  const allCards = getAllCommonCards();
  const available = allCards.filter(
    (card) => !excludedCards.some((excluded) => excluded.id === card.id)
  );
  return Object.freeze(available);
}

/**
 * Separate cards by edition and sort by cost
 */
export function separateCardsByEdition(cards: readonly CommonCard[]): CardsByEdition {
  const basicCards = cards
    .filter((card) => card.edition === 0)
    .sort((a, b) => a.cost - b.cost);
    
  const farEasternCards = cards
    .filter((card) => card.edition === 1)
    .sort((a, b) => a.cost - b.cost);

  return Object.freeze({
    basicCards: Object.freeze(basicCards),
    farEasternCards: Object.freeze(farEasternCards),
  });
}

/**
 * Filter cards using a predicate function
 */
export function filterCards(
  cards: readonly CommonCard[],
  predicate: CardFilterPredicate
): readonly CommonCard[] {
  return Object.freeze(cards.filter(predicate));
}

/**
 * Find card by ID
 */
export function findCardById(id: number): CommonCard | undefined {
  const allCards = getAllCommonCards();
  return allCards.find((card) => card.id === id);
}

/**
 * Group cards by cost
 */
export function groupCardsByCost(cards: readonly CommonCard[]): ReadonlyMap<number, readonly CommonCard[]> {
  const groups = new Map<number, CommonCard[]>();
  
  for (const card of cards) {
    if (!groups.has(card.cost)) {
      groups.set(card.cost, []);
    }
    groups.get(card.cost)!.push(card);
  }

  // Freeze all arrays in the map
  const frozenGroups = new Map<number, readonly CommonCard[]>();
  for (const [cost, cardList] of groups) {
    frozenGroups.set(cost, Object.freeze(cardList));
  }

  return frozenGroups;
}

/**
 * Get cards within a cost range
 */
export function getCardsByCostRange(
  cards: readonly CommonCard[],
  minCost: number,
  maxCost: number
): readonly CommonCard[] {
  const filtered = cards.filter(
    (card) => card.cost >= minCost && card.cost <= maxCost
  );
  return Object.freeze(filtered);
}

/**
 * Shuffle array using Fisher-Yates algorithm (pure function)
 */
export function shuffleCards(cards: readonly CommonCard[]): readonly CommonCard[] {
  const shuffled = [...cards];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  
  return Object.freeze(shuffled);
}