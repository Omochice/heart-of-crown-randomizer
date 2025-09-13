import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import type { IUrlManager } from "../types/index.js";

/**
 * TypeScript implementation of URL management for card sharing
 * Provides immutable, type-safe URL generation and parsing
 */
export class UrlManager implements IUrlManager {
  private readonly _allCards: readonly CommonCard[];

  constructor() {
    // Cache all cards for ID lookup
    this._allCards = Object.freeze([
      ...Basic.commons,
      ...FarEasternBorder.commons,
    ]);
  }

  /**
   * Convert cards to URL query string
   */
  cardsToQueryString(cards: readonly CommonCard[]): string {
    if (cards.length === 0) {
      return "";
    }

    const params = new URLSearchParams();
    for (const card of cards) {
      params.append("card", card.id.toString());
    }

    return params.toString();
  }

  /**
   * Parse cards from URL card ID parameters
   */
  parseCardsFromUrl(cardIds: readonly string[]): readonly CommonCard[] {
    const cards: CommonCard[] = [];

    for (const idString of cardIds) {
      // Parse ID as number
      const id = Number.parseInt(idString, 10);
      
      // Skip invalid numbers
      if (Number.isNaN(id)) {
        continue;
      }

      // Find card by ID
      const card = this._findCardById(id);
      if (card) {
        cards.push(card);
      }
    }

    return Object.freeze(cards);
  }

  /**
   * Generate share URL with cards
   */
  generateShareUrl(cards: readonly CommonCard[], origin: string): string {
    const queryString = this.cardsToQueryString(cards);
    
    if (queryString === "") {
      return origin;
    }

    // Handle origin with or without trailing slash
    const separator = origin.endsWith("/") ? "" : origin.includes("?") ? "&" : "?";
    return `${origin}${origin.includes("?") ? "&" : "?"}${queryString}`;
  }

  /**
   * Copy URL to clipboard with fallback support
   */
  async copyToClipboard(url: string, title: string): Promise<void> {
    // Try Web Share API first
    if (this._isShareApiAvailable()) {
      try {
        await navigator.share({ url, title });
        return;
      } catch (error) {
        // Fall through to clipboard API
      }
    }

    // Fallback to Clipboard API
    if (this._isClipboardApiAvailable()) {
      try {
        await navigator.clipboard.writeText(url);
        return;
      } catch (error) {
        throw new Error(`Failed to copy URL to clipboard: ${error}`);
      }
    }

    // If neither API is available, throw error
    throw new Error("Neither Web Share API nor Clipboard API is available");
  }

  /**
   * Find card by ID in all available cards
   */
  private _findCardById(id: number): CommonCard | undefined {
    return this._allCards.find((card) => card.id === id);
  }

  /**
   * Check if Web Share API is available
   */
  private _isShareApiAvailable(): boolean {
    return (
      typeof navigator !== "undefined" &&
      "share" in navigator &&
      typeof navigator.share === "function"
    );
  }

  /**
   * Check if Clipboard API is available
   */
  private _isClipboardApiAvailable(): boolean {
    return (
      typeof navigator !== "undefined" &&
      "clipboard" in navigator &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    );
  }
}