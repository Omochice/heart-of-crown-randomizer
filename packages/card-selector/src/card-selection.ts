import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { CardSelectionOptions, CardSelectionResult } from "./types.js";

export function getAllCommonCards(): CommonCard[] {
  return [...Basic.commons, ...FarEasternBorder.commons];
}

export function getAvailableCards(excludedCards: CommonCard[]): CommonCard[] {
  const allCommons = getAllCommonCards();
  return allCommons.filter(
    (card) => !excludedCards.some((excluded) => excluded.id === card.id)
  );
}

export function drawRandomCards(options: CardSelectionOptions): CardSelectionResult {
  const availableCards = getAvailableCards(options.excludedCards);
  const shuffledCards = [...availableCards].sort(() => Math.random() - 0.5);
  const selectedCards = shuffledCards
    .slice(0, options.numberOfCards)
    .sort((a, b) => a.id - b.id);

  return {
    selectedCards,
    availableCards,
  };
}

export function drawMissingCards(
  currentSelection: CommonCard[],
  options: CardSelectionOptions
): CommonCard[] {
  if (currentSelection.length >= options.numberOfCards) {
    return currentSelection;
  }

  const allCommons = getAllCommonCards();
  const availableCards = allCommons.filter(
    (card) =>
      !options.excludedCards.some((excluded) => excluded.id === card.id) &&
      !currentSelection.some((selected) => selected.id === card.id)
  );

  if (availableCards.length === 0) {
    return currentSelection;
  }

  const shuffled = [...availableCards].sort(() => Math.random() - 0.5);
  const cardsToAdd = Math.min(
    options.numberOfCards - currentSelection.length,
    shuffled.length
  );
  const newCards = shuffled.slice(0, cardsToAdd);

  return [...currentSelection, ...newCards];
}

export function findCardById(cardId: number): CommonCard | undefined {
  const allCommons = getAllCommonCards();
  return allCommons.find((card) => card.id === cardId);
}

export function parseCardIdsFromUrl(cardIds: string[]): CommonCard[] {
  return cardIds
    .map((id) => findCardById(Number.parseInt(id)))
    .filter((card): card is CommonCard => card !== undefined);
}

export function separateCardsByEdition(cards: CommonCard[]): {
  basicCards: CommonCard[];
  farEasternCards: CommonCard[];
} {
  const basicCards = cards
    .filter((card) => card.edition === 0)
    .sort((a, b) => a.cost - b.cost);
  const farEasternCards = cards
    .filter((card) => card.edition === 1)
    .sort((a, b) => a.cost - b.cost);

  return { basicCards, farEasternCards };
}