import { describe, it, expect } from "vitest";
import {
  getAllCommonCards,
  getAvailableCards,
  drawRandomCards,
  drawMissingCards,
  findCardById,
  parseCardIdsFromUrl,
  separateCardsByEdition,
} from "./card-selection.js";
import type { CardSelectionOptions } from "./types.js";

describe("card-selection", () => {
  describe("getAllCommonCards", () => {
    it("should return all common cards from both editions", () => {
      const allCards = getAllCommonCards();
      expect(allCards.length).toBeGreaterThan(0);
      
      // Should contain cards from both editions
      const hasBasicCards = allCards.some(card => card.edition === 0);
      const hasFarEasternCards = allCards.some(card => card.edition === 1);
      expect(hasBasicCards).toBe(true);
      expect(hasFarEasternCards).toBe(true);
    });
  });

  describe("getAvailableCards", () => {
    it("should filter out excluded cards", () => {
      const allCards = getAllCommonCards();
      const firstCard = allCards[0];
      const excludedCards = [firstCard];
      
      const availableCards = getAvailableCards(excludedCards);
      expect(availableCards).not.toContain(firstCard);
      expect(availableCards.length).toBe(allCards.length - 1);
    });

    it("should return all cards when no exclusions", () => {
      const allCards = getAllCommonCards();
      const availableCards = getAvailableCards([]);
      expect(availableCards).toEqual(allCards);
    });
  });

  describe("drawRandomCards", () => {
    it("should return the specified number of cards", () => {
      const options: CardSelectionOptions = {
        numberOfCards: 5,
        excludedCards: [],
      };
      
      const result = drawRandomCards(options);
      expect(result.selectedCards).toHaveLength(5);
      expect(result.selectedCards.every(card => card.id !== undefined)).toBe(true);
    });

    it("should exclude specified cards", () => {
      const allCards = getAllCommonCards();
      const excludedCard = allCards[0];
      const options: CardSelectionOptions = {
        numberOfCards: 10,
        excludedCards: [excludedCard],
      };
      
      const result = drawRandomCards(options);
      expect(result.selectedCards).not.toContain(excludedCard);
    });

    it("should sort selected cards by ID", () => {
      const options: CardSelectionOptions = {
        numberOfCards: 10,
        excludedCards: [],
      };
      
      const result = drawRandomCards(options);
      const sortedIds = result.selectedCards.map(card => card.id).sort((a, b) => a - b);
      const resultIds = result.selectedCards.map(card => card.id);
      expect(resultIds).toEqual(sortedIds);
    });
  });

  describe("drawMissingCards", () => {
    it("should add cards to reach target number", () => {
      const allCards = getAllCommonCards();
      const currentSelection = allCards.slice(0, 3);
      const options: CardSelectionOptions = {
        numberOfCards: 10,
        excludedCards: [],
      };
      
      const result = drawMissingCards(currentSelection, options);
      expect(result).toHaveLength(10);
      expect(result.slice(0, 3)).toEqual(currentSelection);
    });

    it("should not add cards if already at target", () => {
      const allCards = getAllCommonCards();
      const currentSelection = allCards.slice(0, 10);
      const options: CardSelectionOptions = {
        numberOfCards: 10,
        excludedCards: [],
      };
      
      const result = drawMissingCards(currentSelection, options);
      expect(result).toEqual(currentSelection);
    });

    it("should avoid duplicates and excluded cards", () => {
      const allCards = getAllCommonCards();
      const currentSelection = allCards.slice(0, 5);
      const excludedCards = allCards.slice(5, 10);
      const options: CardSelectionOptions = {
        numberOfCards: 10,
        excludedCards,
      };
      
      const result = drawMissingCards(currentSelection, options);
      
      // Should not contain any excluded cards
      for (const excluded of excludedCards) {
        expect(result).not.toContain(excluded);
      }
      
      // Should not have duplicates
      const uniqueIds = new Set(result.map(card => card.id));
      expect(uniqueIds.size).toBe(result.length);
    });
  });

  describe("findCardById", () => {
    it("should find existing card by ID", () => {
      const allCards = getAllCommonCards();
      const firstCard = allCards[0];
      
      const found = findCardById(firstCard.id);
      expect(found).toEqual(firstCard);
    });

    it("should return undefined for non-existent ID", () => {
      const found = findCardById(99999);
      expect(found).toBeUndefined();
    });
  });

  describe("parseCardIdsFromUrl", () => {
    it("should parse valid card IDs", () => {
      const allCards = getAllCommonCards();
      const cardIds = allCards.slice(0, 3).map(card => card.id.toString());
      
      const result = parseCardIdsFromUrl(cardIds);
      expect(result).toHaveLength(3);
      expect(result.map(card => card.id)).toEqual(cardIds.map(id => Number.parseInt(id)));
    });

    it("should filter out invalid IDs", () => {
      const allCards = getAllCommonCards();
      const validId = allCards[0].id.toString();
      const result = parseCardIdsFromUrl([validId, "invalid", "99999"]);
      expect(result).toHaveLength(1);
    });

    it("should return empty array for empty input", () => {
      const result = parseCardIdsFromUrl([]);
      expect(result).toEqual([]);
    });
  });

  describe("separateCardsByEdition", () => {
    it("should separate cards by edition", () => {
      const allCards = getAllCommonCards();
      const mixedCards = [
        ...allCards.filter(card => card.edition === 0).slice(0, 3),
        ...allCards.filter(card => card.edition === 1).slice(0, 2),
      ];
      
      const result = separateCardsByEdition(mixedCards);
      
      expect(result.basicCards).toHaveLength(3);
      expect(result.farEasternCards).toHaveLength(2);
      expect(result.basicCards.every(card => card.edition === 0)).toBe(true);
      expect(result.farEasternCards.every(card => card.edition === 1)).toBe(true);
    });

    it("should sort cards by cost within each edition", () => {
      const allCards = getAllCommonCards();
      const basicCards = allCards.filter(card => card.edition === 0).slice(0, 5);
      
      const result = separateCardsByEdition(basicCards);
      
      // Check if sorted by cost
      for (let i = 1; i < result.basicCards.length; i++) {
        expect(result.basicCards[i].cost).toBeGreaterThanOrEqual(result.basicCards[i - 1].cost);
      }
    });
  });
});