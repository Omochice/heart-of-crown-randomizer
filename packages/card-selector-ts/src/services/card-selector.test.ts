import { describe, it, expect, beforeEach } from "vitest";
import type { 
  CardSelectionOptions, 
  CardSelectionResult,
  SelectionMetadata 
} from "../types/index.js";
import { CardSelector } from "./card-selector.js";
import { InsufficientCardsError } from "../types/index.js";
import { mockBasicCards, mockFarEasternCards } from "../test-setup.js";

describe("CardSelector", () => {
  let defaultOptions: CardSelectionOptions;
  let cardSelector: CardSelector;

  beforeEach(() => {
    defaultOptions = {
      numberOfCards: 3,
      excludedCards: [],
      allowDuplicates: false,
      sortByIdAfterSelection: true,
    };
    cardSelector = new CardSelector(defaultOptions);
  });

  describe("constructor", () => {
    it("should create instance with provided options", () => {
      expect(cardSelector.options).toEqual(defaultOptions);
    });

    it("should apply default options when not provided", () => {
      const selector = new CardSelector({ numberOfCards: 5, excludedCards: [] });
      expect(selector.options.allowDuplicates).toBe(false);
      expect(selector.options.sortByIdAfterSelection).toBe(true);
    });

    it("should freeze options to prevent mutation", () => {
      expect(() => {
        (cardSelector.options as any).numberOfCards = 10;
      }).toThrow();
    });
  });

  describe("getAvailableCards", () => {
    it("should return all cards when no exclusions", () => {
      const available = cardSelector.getAvailableCards();
      expect(available).toHaveLength(8); // 5 basic + 3 far eastern
      expect(available).toEqual([...mockBasicCards, ...mockFarEasternCards]);
    });

    it("should exclude specified cards", () => {
      const excludedCards = [mockBasicCards[0], mockFarEasternCards[0]];
      const selector = new CardSelector({
        numberOfCards: 3,
        excludedCards,
      });
      
      const available = selector.getAvailableCards();
      expect(available).toHaveLength(6);
      expect(available).not.toContain(mockBasicCards[0]);
      expect(available).not.toContain(mockFarEasternCards[0]);
    });

    it("should return immutable array", () => {
      const available = cardSelector.getAvailableCards();
      expect(() => {
        (available as any).push(mockBasicCards[0]);
      }).toThrow();
    });
  });

  describe("drawRandomCards", () => {
    it("should return requested number of cards", () => {
      const result = cardSelector.drawRandomCards();
      
      expect(result.selectedCards).toHaveLength(3);
      expect(result.availableCards).toHaveLength(8);
    });

    it("should return sorted cards by ID when sortByIdAfterSelection is true", () => {
      const result = cardSelector.drawRandomCards();
      const ids = result.selectedCards.map(card => card.id);
      const sortedIds = [...ids].sort((a, b) => a - b);
      
      expect(ids).toEqual(sortedIds);
    });

    it("should not sort cards when sortByIdAfterSelection is false", () => {
      const selector = new CardSelector({
        numberOfCards: 3,
        excludedCards: [],
        sortByIdAfterSelection: false,
      });
      
      // Since we're testing randomness, we'll just ensure the result is valid
      const result = selector.drawRandomCards();
      expect(result.selectedCards).toHaveLength(3);
    });

    it("should not include excluded cards", () => {
      const excludedCards = [mockBasicCards[0], mockBasicCards[1]];
      const selector = new CardSelector({
        numberOfCards: 3,
        excludedCards,
      });
      
      const result = selector.drawRandomCards();
      
      for (const excluded of excludedCards) {
        expect(result.selectedCards).not.toContain(excluded);
      }
    });

    it("should throw InsufficientCardsError when not enough cards available", () => {
      const selector = new CardSelector({
        numberOfCards: 10,
        excludedCards: [...mockBasicCards, ...mockFarEasternCards],
      });
      
      expect(() => selector.drawRandomCards()).toThrow(InsufficientCardsError);
    });

    it("should include correct metadata", () => {
      const result = cardSelector.drawRandomCards();
      const metadata = result.selectionMetadata;
      
      expect(metadata.requestedCount).toBe(3);
      expect(metadata.actualCount).toBe(3);
      expect(metadata.totalAvailable).toBe(8);
      expect(metadata.excludedCount).toBe(0);
      expect(metadata.hasReachedLimit).toBe(false);
      expect(metadata.timestamp).toBeInstanceOf(Date);
    });

    it("should return immutable result", () => {
      const result = cardSelector.drawRandomCards();
      
      expect(() => {
        (result.selectedCards as any).push(mockBasicCards[0]);
      }).toThrow();
      
      expect(() => {
        (result as any).selectedCards = [];
      }).toThrow();
    });
  });

  describe("drawMissingCards", () => {
    it("should add cards to reach target number", () => {
      const currentSelection = [mockBasicCards[0], mockBasicCards[1]];
      const result = cardSelector.drawMissingCards(currentSelection);
      
      expect(result).toHaveLength(3);
      expect(result.slice(0, 2)).toEqual(currentSelection);
    });

    it("should not modify current selection if already at target", () => {
      const currentSelection = [mockBasicCards[0], mockBasicCards[1], mockBasicCards[2]];
      const result = cardSelector.drawMissingCards(currentSelection);
      
      expect(result).toEqual(currentSelection);
    });

    it("should not add duplicates", () => {
      const currentSelection = [mockBasicCards[0]];
      const result = cardSelector.drawMissingCards(currentSelection);
      
      const uniqueIds = new Set(result.map(card => card.id));
      expect(uniqueIds.size).toBe(result.length);
    });

    it("should not add excluded cards", () => {
      const excludedCards = [mockBasicCards[1], mockBasicCards[2]];
      const selector = new CardSelector({
        numberOfCards: 3,
        excludedCards,
      });
      
      const currentSelection = [mockBasicCards[0]];
      const result = selector.drawMissingCards(currentSelection);
      
      for (const excluded of excludedCards) {
        expect(result).not.toContain(excluded);
      }
    });

    it("should throw InsufficientCardsError when not enough unique cards available", () => {
      const currentSelection = [mockBasicCards[0]];
      const excludedCards = [...mockBasicCards.slice(1), ...mockFarEasternCards];
      const selector = new CardSelector({
        numberOfCards: 3,
        excludedCards,
      });
      
      expect(() => selector.drawMissingCards(currentSelection)).toThrow(InsufficientCardsError);
    });

    it("should return immutable array", () => {
      const currentSelection = [mockBasicCards[0]];
      const result = cardSelector.drawMissingCards(currentSelection);
      
      expect(() => {
        (result as any).push(mockBasicCards[1]);
      }).toThrow();
    });
  });

  describe("edge cases", () => {
    it("should handle empty card pool gracefully", () => {
      const selector = new CardSelector({
        numberOfCards: 1,
        excludedCards: [...mockBasicCards, ...mockFarEasternCards],
      });
      
      expect(() => selector.drawRandomCards()).toThrow(InsufficientCardsError);
    });

    it("should handle requesting more cards than available", () => {
      const selector = new CardSelector({
        numberOfCards: 20,
        excludedCards: [],
      });
      
      expect(() => selector.drawRandomCards()).toThrow(InsufficientCardsError);
    });

    it("should handle zero card request", () => {
      const selector = new CardSelector({
        numberOfCards: 0,
        excludedCards: [],
      });
      
      const result = selector.drawRandomCards();
      expect(result.selectedCards).toHaveLength(0);
    });
  });
});