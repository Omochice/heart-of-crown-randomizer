import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { StorageConfiguration } from "../types/index.js";
import { ExcludedCardManager } from "./excluded-card-manager.js";
import { StorageError } from "../types/index.js";
import { mockBasicCards, mockFarEasternCards } from "../test-setup.js";

// Use mock cards from setup
const mockCard1 = mockBasicCards[0];
const mockCard2 = mockBasicCards[1];
const mockCard3 = mockFarEasternCards[0];

describe("ExcludedCardManager", () => {
  let manager: ExcludedCardManager;
  let mockStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockStorage = {};
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: vi.fn(() => {
          mockStorage = {};
        }),
      },
      writable: true,
    });

    manager = new ExcludedCardManager();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create instance with default configuration", () => {
      expect(manager.excludedCards).toEqual([]);
    });

    it("should create instance with custom configuration", () => {
      const config: StorageConfiguration = {
        storageKey: "custom-key",
        enablePersistence: false,
        storageType: "sessionStorage",
      };
      
      const customManager = new ExcludedCardManager(config);
      expect(customManager.excludedCards).toEqual([]);
    });

    it("should load existing cards from storage", () => {
      const existingCards = [mockCard1, mockCard2];
      mockStorage["excludedCommons"] = JSON.stringify(existingCards);
      
      const managerWithExisting = new ExcludedCardManager();
      expect(managerWithExisting.excludedCards).toEqual(existingCards);
    });

    it("should handle corrupted storage data gracefully", () => {
      mockStorage["excludedCommons"] = "invalid-json";
      
      const managerWithCorrupted = new ExcludedCardManager();
      expect(managerWithCorrupted.excludedCards).toEqual([]);
    });
  });

  describe("addCard", () => {
    it("should add card to excluded list", () => {
      manager.addCard(mockCard1);
      
      expect(manager.excludedCards).toContain(mockCard1);
      expect(manager.excludedCards).toHaveLength(1);
    });

    it("should not add duplicate cards", () => {
      manager.addCard(mockCard1);
      manager.addCard(mockCard1);
      
      expect(manager.excludedCards).toHaveLength(1);
    });

    it("should persist to storage when enabled", () => {
      manager.addCard(mockCard1);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "excludedCommons",
        JSON.stringify([mockCard1])
      );
    });

    it("should not persist when persistence is disabled", () => {
      const managerNoPersist = new ExcludedCardManager({
        storageKey: "test-key",
        enablePersistence: false,
        storageType: "localStorage",
      });
      
      managerNoPersist.addCard(mockCard1);
      
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it("should maintain immutability of excludedCards", () => {
      const initialCards = manager.excludedCards;
      manager.addCard(mockCard1);
      
      expect(manager.excludedCards).not.toBe(initialCards);
      expect(() => {
        (manager.excludedCards as any).push(mockCard2);
      }).toThrow();
    });

    it("should handle storage errors gracefully", () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error("Storage full");
      });
      
      expect(() => manager.addCard(mockCard1)).toThrow(StorageError);
    });
  });

  describe("removeCard", () => {
    beforeEach(() => {
      manager.addCard(mockCard1);
      manager.addCard(mockCard2);
      vi.clearAllMocks();
    });

    it("should remove card from excluded list", () => {
      manager.removeCard(mockCard1);
      
      expect(manager.excludedCards).not.toContain(mockCard1);
      expect(manager.excludedCards).toContain(mockCard2);
      expect(manager.excludedCards).toHaveLength(1);
    });

    it("should handle removing non-existent card gracefully", () => {
      manager.removeCard(mockCard3);
      
      expect(manager.excludedCards).toHaveLength(2);
      expect(manager.excludedCards).toContain(mockCard1);
      expect(manager.excludedCards).toContain(mockCard2);
    });

    it("should persist changes to storage", () => {
      manager.removeCard(mockCard1);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "excludedCommons",
        JSON.stringify([mockCard2])
      );
    });

    it("should maintain immutability", () => {
      const beforeRemoval = manager.excludedCards;
      manager.removeCard(mockCard1);
      
      expect(manager.excludedCards).not.toBe(beforeRemoval);
    });
  });

  describe("clearAll", () => {
    beforeEach(() => {
      manager.addCard(mockCard1);
      manager.addCard(mockCard2);
      vi.clearAllMocks();
    });

    it("should remove all excluded cards", () => {
      manager.clearAll();
      
      expect(manager.excludedCards).toEqual([]);
    });

    it("should remove from storage", () => {
      manager.clearAll();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith("excludedCommons");
    });

    it("should maintain immutability", () => {
      const beforeClear = manager.excludedCards;
      manager.clearAll();
      
      expect(manager.excludedCards).not.toBe(beforeClear);
    });
  });

  describe("isExcluded", () => {
    beforeEach(() => {
      manager.addCard(mockCard1);
      manager.addCard(mockCard2);
    });

    it("should return true for excluded cards", () => {
      expect(manager.isExcluded(mockCard1)).toBe(true);
      expect(manager.isExcluded(mockCard2)).toBe(true);
    });

    it("should return false for non-excluded cards", () => {
      expect(manager.isExcluded(mockCard3)).toBe(false);
    });

    it("should handle cards with same ID correctly", () => {
      const duplicateCard: CommonCard = { ...mockCard1 };
      expect(manager.isExcluded(duplicateCard)).toBe(true);
    });
  });

  describe("sessionStorage support", () => {
    let mockSessionStorage: { [key: string]: string };

    beforeEach(() => {
      mockSessionStorage = {};
      
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
          setItem: vi.fn((key: string, value: string) => {
            mockSessionStorage[key] = value;
          }),
          removeItem: vi.fn((key: string) => {
            delete mockSessionStorage[key];
          }),
        },
        writable: true,
      });
    });

    it("should use sessionStorage when configured", () => {
      const sessionManager = new ExcludedCardManager({
        storageKey: "session-excluded",
        enablePersistence: true,
        storageType: "sessionStorage",
      });
      
      sessionManager.addCard(mockCard1);
      
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        "session-excluded",
        JSON.stringify([mockCard1])
      );
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle storage unavailable scenario", () => {
      // Simulate storage not available
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      });
      
      const managerNoStorage = new ExcludedCardManager();
      
      // Should not throw, just work without persistence
      expect(() => {
        managerNoStorage.addCard(mockCard1);
        managerNoStorage.removeCard(mockCard1);
        managerNoStorage.clearAll();
      }).not.toThrow();
    });
  });
});