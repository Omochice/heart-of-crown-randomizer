import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type {
  CardSelectionOptions,
  SwipeConfiguration,
  StorageConfiguration,
  CardSelectionResult,
  SwipeEventHandler,
  CardRemovalHandler,
  CardsByEdition,
} from "../types/index.js";

import { CardSelector } from "../services/card-selector.js";
import { ExcludedCardManager } from "../services/excluded-card-manager.js";
import { SwipeHandler } from "../handlers/swipe-handler.js";
import { UrlManager } from "../utils/url-manager.js";
import { separateCardsByEdition } from "../utils/card-utilities.js";

/**
 * High-level facade that combines all card selector functionality
 * Provides a simple API for common use cases
 */
export class CardSelectorFacade {
  private readonly _cardSelector: CardSelector;
  private readonly _excludedCardManager: ExcludedCardManager;
  private readonly _swipeHandler: SwipeHandler;
  private readonly _urlManager: UrlManager;

  constructor(
    options: Partial<CardSelectionOptions> = {},
    swipeConfig: Partial<SwipeConfiguration> = {},
    storageConfig: Partial<StorageConfiguration> = {}
  ) {
    // Initialize excluded card manager first
    this._excludedCardManager = new ExcludedCardManager(storageConfig);

    // Create card selector with current excluded cards
    const selectorOptions: CardSelectionOptions = {
      numberOfCards: 10,
      excludedCards: this._excludedCardManager.excludedCards,
      ...options,
    };
    this._cardSelector = new CardSelector(selectorOptions);

    // Initialize other components
    this._swipeHandler = new SwipeHandler(this._handleCardRemoval.bind(this), swipeConfig);
    this._urlManager = new UrlManager();
  }

  /**
   * Get current selection options
   */
  get options(): CardSelectionOptions {
    return this._cardSelector.options;
  }

  /**
   * Get currently excluded cards
   */
  get excludedCards(): readonly CommonCard[] {
    return this._excludedCardManager.excludedCards;
  }

  /**
   * Get swipe threshold
   */
  get swipeThreshold(): number {
    return this._swipeHandler.threshold;
  }

  /**
   * Draw random cards
   */
  drawRandomCards(): CardSelectionResult {
    // Update card selector with current excluded cards
    const updatedSelector = new CardSelector({
      ...this._cardSelector.options,
      excludedCards: this._excludedCardManager.excludedCards,
    });
    
    return updatedSelector.drawRandomCards();
  }

  /**
   * Add missing cards to reach target
   */
  drawMissingCards(currentSelection: readonly CommonCard[]): readonly CommonCard[] {
    const updatedSelector = new CardSelector({
      ...this._cardSelector.options,
      excludedCards: this._excludedCardManager.excludedCards,
    });
    
    return updatedSelector.drawMissingCards(currentSelection);
  }

  /**
   * Add card to excluded list
   */
  excludeCard(card: CommonCard): void {
    this._excludedCardManager.addCard(card);
  }

  /**
   * Remove card from excluded list
   */
  includeCard(card: CommonCard): void {
    this._excludedCardManager.removeCard(card);
  }

  /**
   * Clear all excluded cards
   */
  clearExcludedCards(): void {
    this._excludedCardManager.clearAll();
  }

  /**
   * Check if card is excluded
   */
  isCardExcluded(card: CommonCard): boolean {
    return this._excludedCardManager.isExcluded(card);
  }

  /**
   * Generate share URL for cards
   */
  generateShareUrl(cards: readonly CommonCard[], origin: string = window.location.origin): string {
    return this._urlManager.generateShareUrl(cards, origin);
  }

  /**
   * Parse cards from URL parameters
   */
  parseCardsFromUrl(cardIds: readonly string[]): readonly CommonCard[] {
    return this._urlManager.parseCardsFromUrl(cardIds);
  }

  /**
   * Copy URL to clipboard
   */
  async copyToClipboard(url: string, title: string = "Heart of Crown Randomizer"): Promise<void> {
    return this._urlManager.copyToClipboard(url, title);
  }

  /**
   * Separate cards by edition
   */
  separateCardsByEdition(cards: readonly CommonCard[]): CardsByEdition {
    return separateCardsByEdition(cards);
  }

  /**
   * Get swipe event handlers for UI integration
   */
  getSwipeHandlers() {
    return {
      onSwipeStart: this._swipeHandler.onSwipeStart.bind(this._swipeHandler),
      onSwipeMove: this._swipeHandler.onSwipeMove.bind(this._swipeHandler),
      onSwipeEnd: this._swipeHandler.onSwipeEnd.bind(this._swipeHandler),
      onSwipeCancel: this._swipeHandler.onSwipeCancel.bind(this._swipeHandler),
    };
  }

  /**
   * Add swipe event listener
   */
  addSwipeEventListener(handler: SwipeEventHandler): void {
    this._swipeHandler.addEventListener("swipe", handler);
  }

  /**
   * Remove swipe event listener
   */
  removeSwipeEventListener(handler: SwipeEventHandler): void {
    this._swipeHandler.removeEventListener("swipe", handler);
  }

  /**
   * Update number of cards to select
   */
  setNumberOfCards(count: number): void {
    // Create new card selector with updated count
    const newOptions: CardSelectionOptions = {
      ...this._cardSelector.options,
      numberOfCards: count,
      excludedCards: this._excludedCardManager.excludedCards,
    };
    
    // Replace the internal card selector
    (this as any)._cardSelector = new CardSelector(newOptions);
  }

  /**
   * Get all available cards (not excluded)
   */
  getAvailableCards(): readonly CommonCard[] {
    const updatedSelector = new CardSelector({
      ...this._cardSelector.options,
      excludedCards: this._excludedCardManager.excludedCards,
    });
    
    return updatedSelector.getAvailableCards();
  }

  /**
   * Destroy facade and clean up resources
   */
  destroy(): void {
    this._swipeHandler.destroy();
  }

  /**
   * Handle card removal from swipe gesture
   */
  private _handleCardRemoval: CardRemovalHandler = (index: number): void => {
    // This is typically handled by the UI component
    // The facade doesn't maintain card selection state
    // Instead, it provides the removal callback for the swipe handler
    
    // Emit a custom event or call a callback if needed
    console.log(`Card at index ${index} should be removed`);
  };
}