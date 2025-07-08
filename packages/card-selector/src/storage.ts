import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

const EXCLUDED_CARDS_KEY = "excludedCommons";

export function loadExcludedCards(): CommonCard[] {
  if (typeof localStorage === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(EXCLUDED_CARDS_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveExcludedCards(excludedCards: CommonCard[]): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(EXCLUDED_CARDS_KEY, JSON.stringify(excludedCards));
}

export function clearExcludedCards(): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.removeItem(EXCLUDED_CARDS_KEY);
}

export function addExcludedCard(card: CommonCard, currentExcluded: CommonCard[]): CommonCard[] {
  const isAlreadyExcluded = currentExcluded.some((excluded) => excluded.id === card.id);
  if (isAlreadyExcluded) {
    return currentExcluded;
  }

  const newExcluded = [...currentExcluded, card];
  saveExcludedCards(newExcluded);
  return newExcluded;
}

export function removeExcludedCard(card: CommonCard, currentExcluded: CommonCard[]): CommonCard[] {
  const newExcluded = currentExcluded.filter((excluded) => excluded.id !== card.id);
  saveExcludedCards(newExcluded);
  return newExcluded;
}