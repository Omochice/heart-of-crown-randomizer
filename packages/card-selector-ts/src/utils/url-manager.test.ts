import { describe, it, expect, beforeEach, vi } from "vitest";
import { UrlManager } from "./url-manager.js";
import { mockBasicCards, mockFarEasternCards } from "../test-setup.js";

// Mock navigator.share and clipboard
const mockShare = vi.fn();
const mockWriteText = vi.fn();

Object.defineProperty(navigator, 'share', {
  value: mockShare,
  writable: true,
});

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

describe("UrlManager", () => {
  let urlManager: UrlManager;

  beforeEach(() => {
    urlManager = new UrlManager();
    vi.clearAllMocks();
  });

  describe("cardsToQueryString", () => {
    it("should convert cards to query string", () => {
      const cards = [mockBasicCards[0], mockBasicCards[1]];
      
      const result = urlManager.cardsToQueryString(cards);
      
      expect(result).toBe("card=1&card=2");
    });

    it("should handle empty array", () => {
      const result = urlManager.cardsToQueryString([]);
      
      expect(result).toBe("");
    });

    it("should handle single card", () => {
      const cards = [mockBasicCards[0]];
      
      const result = urlManager.cardsToQueryString(cards);
      
      expect(result).toBe("card=1");
    });

    it("should preserve card order", () => {
      const cards = [mockBasicCards[2], mockBasicCards[0], mockBasicCards[1]];
      
      const result = urlManager.cardsToQueryString(cards);
      
      expect(result).toBe("card=5&card=1&card=2");
    });

    it("should return immutable result", () => {
      const cards = [mockBasicCards[0]];
      const result = urlManager.cardsToQueryString(cards);
      
      // Query string is primitive, so this test ensures the input array isn't mutated
      expect(cards).toHaveLength(1);
      expect(cards[0]).toBe(mockBasicCards[0]);
    });
  });

  describe("parseCardsFromUrl", () => {
    it("should parse valid card IDs", () => {
      const cardIds = ["1", "2", "6"];
      
      const result = urlManager.parseCardsFromUrl(cardIds);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(mockBasicCards[0]);
      expect(result[1]).toEqual(mockBasicCards[1]);
      expect(result[2]).toEqual(mockFarEasternCards[0]);
    });

    it("should filter out invalid card IDs", () => {
      const cardIds = ["1", "999", "2"];
      
      const result = urlManager.parseCardsFromUrl(cardIds);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockBasicCards[0]);
      expect(result[1]).toEqual(mockBasicCards[1]);
    });

    it("should handle empty array", () => {
      const result = urlManager.parseCardsFromUrl([]);
      
      expect(result).toEqual([]);
    });

    it("should handle non-numeric strings", () => {
      const cardIds = ["1", "invalid", "abc", "2"];
      
      const result = urlManager.parseCardsFromUrl(cardIds);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockBasicCards[0]);
      expect(result[1]).toEqual(mockBasicCards[1]);
    });

    it("should preserve order of found cards", () => {
      const cardIds = ["2", "1", "6"];
      
      const result = urlManager.parseCardsFromUrl(cardIds);
      
      expect(result[0]).toEqual(mockBasicCards[1]); // ID 2
      expect(result[1]).toEqual(mockBasicCards[0]); // ID 1
      expect(result[2]).toEqual(mockFarEasternCards[0]); // ID 6
    });

    it("should return immutable array", () => {
      const cardIds = ["1", "2"];
      const result = urlManager.parseCardsFromUrl(cardIds);
      
      expect(() => {
        (result as any).push(mockBasicCards[2]);
      }).toThrow();
    });

    it("should handle duplicate IDs", () => {
      const cardIds = ["1", "1", "2"];
      
      const result = urlManager.parseCardsFromUrl(cardIds);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(mockBasicCards[0]);
      expect(result[1]).toEqual(mockBasicCards[0]);
      expect(result[2]).toEqual(mockBasicCards[1]);
    });
  });

  describe("generateShareUrl", () => {
    it("should generate share URL with cards", () => {
      const cards = [mockBasicCards[0], mockBasicCards[1]];
      const origin = "https://example.com";
      
      const result = urlManager.generateShareUrl(cards, origin);
      
      expect(result).toBe("https://example.com?card=1&card=2");
    });

    it("should handle empty card array", () => {
      const cards: CommonCard[] = [];
      const origin = "https://example.com";
      
      const result = urlManager.generateShareUrl(cards, origin);
      
      expect(result).toBe("https://example.com");
    });

    it("should handle origin without protocol", () => {
      const cards = [mockBasicCards[0]];
      const origin = "example.com";
      
      const result = urlManager.generateShareUrl(cards, origin);
      
      expect(result).toBe("example.com?card=1");
    });

    it("should handle origin with trailing slash", () => {
      const cards = [mockBasicCards[0]];
      const origin = "https://example.com/";
      
      const result = urlManager.generateShareUrl(cards, origin);
      
      expect(result).toBe("https://example.com/?card=1");
    });

    it("should handle complex origins", () => {
      const cards = [mockBasicCards[0]];
      const origin = "https://example.com:8080/path";
      
      const result = urlManager.generateShareUrl(cards, origin);
      
      expect(result).toBe("https://example.com:8080/path?card=1");
    });
  });

  describe("copyToClipboard", () => {
    beforeEach(() => {
      mockShare.mockClear();
      mockWriteText.mockClear();
    });

    it("should use navigator.share when available and successful", async () => {
      mockShare.mockResolvedValue(undefined);
      
      const url = "https://example.com?card=1";
      const title = "Test Title";
      
      await urlManager.copyToClipboard(url, title);
      
      expect(mockShare).toHaveBeenCalledWith({
        url,
        title,
      });
      expect(mockWriteText).not.toHaveBeenCalled();
    });

    it("should fallback to clipboard.writeText when share fails", async () => {
      mockShare.mockRejectedValue(new Error("Share not supported"));
      mockWriteText.mockResolvedValue(undefined);
      
      const url = "https://example.com?card=1";
      const title = "Test Title";
      
      await urlManager.copyToClipboard(url, title);
      
      expect(mockShare).toHaveBeenCalled();
      expect(mockWriteText).toHaveBeenCalledWith(url);
    });

    it("should throw error when both share and clipboard fail", async () => {
      mockShare.mockRejectedValue(new Error("Share not supported"));
      mockWriteText.mockRejectedValue(new Error("Clipboard not accessible"));
      
      const url = "https://example.com?card=1";
      const title = "Test Title";
      
      await expect(urlManager.copyToClipboard(url, title)).rejects.toThrow();
      
      expect(mockShare).toHaveBeenCalled();
      expect(mockWriteText).toHaveBeenCalled();
    });

    it("should handle share API not available", async () => {
      // Temporarily remove navigator.share
      const originalShare = navigator.share;
      delete (navigator as any).share;
      
      mockWriteText.mockResolvedValue(undefined);
      
      const url = "https://example.com?card=1";
      const title = "Test Title";
      
      await urlManager.copyToClipboard(url, title);
      
      expect(mockWriteText).toHaveBeenCalledWith(url);
      
      // Restore navigator.share
      (navigator as any).share = originalShare;
    });

    it("should handle clipboard API not available", async () => {
      const originalClipboard = navigator.clipboard;
      delete (navigator as any).clipboard;
      
      mockShare.mockRejectedValue(new Error("Share not supported"));
      
      const url = "https://example.com?card=1";
      const title = "Test Title";
      
      await expect(urlManager.copyToClipboard(url, title)).rejects.toThrow();
      
      // Restore navigator.clipboard
      (navigator as any).clipboard = originalClipboard;
    });
  });

  describe("integration tests", () => {
    it("should roundtrip cards through URL conversion", () => {
      const originalCards = [mockBasicCards[0], mockFarEasternCards[0], mockBasicCards[1]];
      
      const queryString = urlManager.cardsToQueryString(originalCards);
      const cardIds = new URLSearchParams(queryString).getAll("card");
      const parsedCards = urlManager.parseCardsFromUrl(cardIds);
      
      expect(parsedCards).toEqual(originalCards);
    });

    it("should generate valid URLs that can be parsed back", () => {
      const originalCards = [mockBasicCards[0], mockBasicCards[1]];
      const origin = "https://example.com";
      
      const shareUrl = urlManager.generateShareUrl(originalCards, origin);
      const url = new URL(shareUrl);
      const cardIds = url.searchParams.getAll("card");
      const parsedCards = urlManager.parseCardsFromUrl(cardIds);
      
      expect(parsedCards).toEqual(originalCards);
    });
  });

  describe("error handling", () => {
    it("should handle malformed URL gracefully", () => {
      // This test ensures parseCardsFromUrl doesn't break with edge cases
      const malformedIds = ["", "0", "-1", "Infinity", "NaN"];
      
      const result = urlManager.parseCardsFromUrl(malformedIds);
      
      // Should return empty array since none of these IDs exist
      expect(result).toEqual([]);
    });
  });
});