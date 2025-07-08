import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type {
  IExcludedCardManager,
  StorageConfiguration,
} from "../types/index.js";
import { DEFAULT_STORAGE_CONFIGURATION } from "../types/index.js";
import { StorageError } from "../types/index.js";

/**
 * TypeScript implementation of excluded card management
 * Provides persistent storage and immutable state management
 */
export class ExcludedCardManager implements IExcludedCardManager {
  private readonly _config: StorageConfiguration;
  private _excludedCards: readonly CommonCard[];

  constructor(config: Partial<StorageConfiguration> = {}) {
    this._config = Object.freeze({
      ...DEFAULT_STORAGE_CONFIGURATION,
      ...config,
    });

    // Load existing excluded cards from storage
    this._excludedCards = this._loadFromStorage();
  }

  /**
   * Get immutable list of excluded cards
   */
  get excludedCards(): readonly CommonCard[] {
    return this._excludedCards;
  }

  /**
   * Add a card to the excluded list
   */
  addCard(card: CommonCard): void {
    // Check if card is already excluded
    if (this.isExcluded(card)) {
      return;
    }

    // Create new immutable array with added card
    this._excludedCards = Object.freeze([...this._excludedCards, card]);

    // Persist to storage if enabled
    if (this._config.enablePersistence) {
      this._saveToStorage();
    }
  }

  /**
   * Remove a card from the excluded list
   */
  removeCard(card: CommonCard): void {
    // Filter out the card by ID
    const filtered = this._excludedCards.filter((excluded) => excluded.id !== card.id);

    // Only update if something was actually removed
    if (filtered.length !== this._excludedCards.length) {
      this._excludedCards = Object.freeze(filtered);

      // Persist to storage if enabled
      if (this._config.enablePersistence) {
        this._saveToStorage();
      }
    }
  }

  /**
   * Clear all excluded cards
   */
  clearAll(): void {
    this._excludedCards = Object.freeze([]);

    // Clear from storage if persistence enabled
    if (this._config.enablePersistence) {
      this._clearStorage();
    }
  }

  /**
   * Check if a card is excluded
   */
  isExcluded(card: CommonCard): boolean {
    return this._excludedCards.some((excluded) => excluded.id === card.id);
  }

  /**
   * Load excluded cards from storage
   */
  private _loadFromStorage(): readonly CommonCard[] {
    if (!this._config.enablePersistence) {
      return Object.freeze([]);
    }

    try {
      const storage = this._getStorage();
      if (!storage) {
        return Object.freeze([]);
      }

      const stored = storage.getItem(this._config.storageKey);
      if (!stored) {
        return Object.freeze([]);
      }

      const parsed = JSON.parse(stored) as CommonCard[];
      
      // Validate that parsed data is an array
      if (!Array.isArray(parsed)) {
        return Object.freeze([]);
      }

      return Object.freeze(parsed);
    } catch (error) {
      // Handle corrupted data gracefully
      console.warn("Failed to load excluded cards from storage:", error);
      return Object.freeze([]);
    }
  }

  /**
   * Save excluded cards to storage
   */
  private _saveToStorage(): void {
    try {
      const storage = this._getStorage();
      if (!storage) {
        return;
      }

      const serialized = JSON.stringify(this._excludedCards);
      storage.setItem(this._config.storageKey, serialized);
    } catch (error) {
      throw new StorageError("save", error as Error, {
        storageType: this._config.storageType,
        storageKey: this._config.storageKey,
        dataSize: this._excludedCards.length,
      });
    }
  }

  /**
   * Clear storage
   */
  private _clearStorage(): void {
    try {
      const storage = this._getStorage();
      if (!storage) {
        return;
      }

      storage.removeItem(this._config.storageKey);
    } catch (error) {
      throw new StorageError("clear", error as Error, {
        storageType: this._config.storageType,
        storageKey: this._config.storageKey,
      });
    }
  }

  /**
   * Get appropriate storage object based on configuration
   */
  private _getStorage(): Storage | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return this._config.storageType === "localStorage"
        ? window.localStorage
        : window.sessionStorage;
    } catch {
      // Storage might not be available (e.g., private browsing mode)
      return null;
    }
  }
}