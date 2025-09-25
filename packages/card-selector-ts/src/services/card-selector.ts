import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type {
  ICardSelector,
  CardSelectionOptions,
  CardSelectionResult,
  SelectionMetadata,
} from "../types/index.js";
import { DEFAULT_CARD_SELECTION_OPTIONS } from "../types/index.js";
import { InsufficientCardsError } from "../types/index.js";

/**
 * TypeScript implementation of card selection functionality
 * Provides immutable, type-safe card selection with comprehensive metadata
 */
export class CardSelector implements ICardSelector {
  private readonly _options: Required<CardSelectionOptions>;
  private readonly _allCards: readonly CommonCard[];

  constructor(options: CardSelectionOptions) {
    // Merge with defaults and freeze for immutability
    this._options = Object.freeze({
      ...DEFAULT_CARD_SELECTION_OPTIONS,
      ...options,
      excludedCards: Object.freeze([...options.excludedCards]),
    });

    // Cache all available cards
    this._allCards = Object.freeze([
      ...Basic.commons,
      ...FarEasternBorder.commons,
    ]);
  }

  /**
   * Get immutable options
   */
  get options(): Required<CardSelectionOptions> {
    return this._options;
  }

  /**
   * Get all available cards excluding specified excluded cards
   */
  getAvailableCards(): readonly CommonCard[] {
    const available = this._allCards.filter(
      (card) => !this._options.excludedCards.some((excluded) => excluded.id === card.id)
    );
    return Object.freeze(available);
  }

  /**
   * Draw random cards according to selection options
   */
  drawRandomCards(): CardSelectionResult {
    const availableCards = this.getAvailableCards();
    const { numberOfCards, sortByIdAfterSelection } = this._options;

    // Validate sufficient cards available
    if (availableCards.length < numberOfCards) {
      throw new InsufficientCardsError(numberOfCards, availableCards.length, {
        excludedCount: this._options.excludedCards.length,
        totalCards: this._allCards.length,
      });
    }

    // Handle edge case of zero cards
    if (numberOfCards === 0) {
      return this._createResult([], availableCards);
    }

    // Shuffle and select cards
    const shuffled = this._shuffleArray([...availableCards]);
    let selectedCards = shuffled.slice(0, numberOfCards);

    // Sort by ID if requested
    if (sortByIdAfterSelection) {
      selectedCards = selectedCards.sort((a, b) => a.id - b.id);
    }

    return this._createResult(selectedCards, availableCards);
  }

  /**
   * Add missing cards to reach the target number
   */
  drawMissingCards(currentSelection: readonly CommonCard[]): readonly CommonCard[] {
    const { numberOfCards } = this._options;
    const currentCount = currentSelection.length;

    // Return current selection if already at target
    if (currentCount >= numberOfCards) {
      return Object.freeze([...currentSelection]);
    }

    const cardsToAdd = numberOfCards - currentCount;
    const availableCards = this.getAvailableCards();

    // Filter out cards already in current selection
    const candidateCards = availableCards.filter(
      (card) => !currentSelection.some((selected) => selected.id === card.id)
    );

    // Validate sufficient unique cards available
    if (candidateCards.length < cardsToAdd) {
      throw new InsufficientCardsError(cardsToAdd, candidateCards.length, {
        currentSelection: currentSelection.length,
        target: numberOfCards,
        excludedCount: this._options.excludedCards.length,
      });
    }

    // Shuffle and select additional cards
    const shuffled = this._shuffleArray([...candidateCards]);
    const additionalCards = shuffled.slice(0, cardsToAdd);

    return Object.freeze([...currentSelection, ...additionalCards]);
  }

  /**
   * Create immutable selection result with metadata
   */
  private _createResult(
    selectedCards: CommonCard[],
    availableCards: readonly CommonCard[]
  ): CardSelectionResult {
    const metadata: SelectionMetadata = Object.freeze({
      timestamp: new Date(),
      totalAvailable: availableCards.length,
      excludedCount: this._options.excludedCards.length,
      requestedCount: this._options.numberOfCards,
      actualCount: selectedCards.length,
      hasReachedLimit: selectedCards.length === this._options.numberOfCards,
    });

    return Object.freeze({
      selectedCards: Object.freeze(selectedCards),
      availableCards,
      selectionMetadata: metadata,
    });
  }

  /**
   * Fisher-Yates shuffle algorithm for array randomization
   */
  private _shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i]!;
      array[i] = array[j]!;
      array[j] = temp;
    }
    return array;
  }
}