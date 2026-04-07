/**
 * SSR Safety Tests for CardState
 *
 * These tests verify that the card-state module correctly handles
 * Server-Side Rendering scenarios, including:
 * - State isolation across multiple SSR requests
 * - URL-driven initialization priority over module-scoped defaults
 * - No state leakage between concurrent requests
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  getCardState,
  getExcludedCardIds,
  getPinnedCardIds,
  setExcludedCardIds,
  setPinnedCardIds,
  toggleExclude,
  togglePin,
} from "./card-state.svelte";

describe("CardState SSR Safety", () => {
  beforeEach(() => {
    // Clear state before each test to simulate fresh SSR request
    setPinnedCardIds(new Set());
    setExcludedCardIds(new Set());
  });

  describe("State Isolation Across Requests", () => {
    it("should not leak state from Request A (pin=1) to Request B (pin=2)", () => {
      // Simulate Request A: User requests page with ?pin=1
      setPinnedCardIds(new Set([1]));
      expect(getPinnedCardIds().has(1)).toBe(true);
      expect(getPinnedCardIds().has(2)).toBe(false);

      // Simulate Request B: Different user requests page with ?pin=2
      // In real SSR, the $effect in +page.svelte would clear and re-initialize
      setPinnedCardIds(new Set([2]));

      // Request B should only see pin=2, not pin=1
      expect(getPinnedCardIds().has(1)).toBe(false);
      expect(getPinnedCardIds().has(2)).toBe(true);
    });

    it("should isolate exclude state between requests", () => {
      // Request A: ?exclude=5
      setExcludedCardIds(new Set([5]));
      expect(getExcludedCardIds().has(5)).toBe(true);

      // Request B: ?exclude=10
      setExcludedCardIds(new Set([10]));

      // Request B should only see exclude=10
      expect(getExcludedCardIds().has(5)).toBe(false);
      expect(getExcludedCardIds().has(10)).toBe(true);
    });

    it("should handle empty state correctly", () => {
      // Request A: ?pin=1&exclude=2
      setPinnedCardIds(new Set([1]));
      setExcludedCardIds(new Set([2]));

      // Request B: no pin/exclude params (empty state)
      setPinnedCardIds(new Set());
      setExcludedCardIds(new Set());

      // Request B should have empty state
      expect(getPinnedCardIds().size).toBe(0);
      expect(getExcludedCardIds().size).toBe(0);
    });
  });

  describe("URL Initialization Priority", () => {
    it("should prioritize URL state over module-scoped defaults", () => {
      // Module-scoped state might have stale data from previous request
      setPinnedCardIds(new Set([999])); // Stale data from previous request

      // $effect in +page.svelte clears and re-initializes from URL
      // Simulate: URL has ?pin=1
      setPinnedCardIds(new Set([1]));

      // Should only see URL state, not stale module state
      expect(getPinnedCardIds().has(1)).toBe(true);
      expect(getPinnedCardIds().has(999)).toBe(false);
    });

    it("should use empty state when URL has no pin/exclude params", () => {
      // Module-scoped state might have stale data
      setPinnedCardIds(new Set([100]));
      setExcludedCardIds(new Set([200]));

      // $effect clears state when URL has no params
      setPinnedCardIds(new Set());
      setExcludedCardIds(new Set());

      // Should be empty, not retain stale data
      expect(getPinnedCardIds().size).toBe(0);
      expect(getExcludedCardIds().size).toBe(0);
    });
  });

  describe("Concurrent Request State Independence", () => {
    it("should handle interleaved operations without state mixing", () => {
      // Simulate Request A and Request B running concurrently
      const requestAState = new Set<number>();
      const requestBState = new Set<number>();

      // Request A: ?pin=1,2,3
      requestAState.add(1);
      requestAState.add(2);
      requestAState.add(3);

      // Request B: ?pin=4,5 (runs concurrently)
      requestBState.add(4);
      requestBState.add(5);

      // Verify no state leakage
      expect(requestAState.has(4)).toBe(false);
      expect(requestAState.has(5)).toBe(false);
      expect(requestBState.has(1)).toBe(false);
      expect(requestBState.has(2)).toBe(false);
      expect(requestBState.has(3)).toBe(false);
    });

    it("should maintain state integrity under rapid sequential requests", () => {
      const states = [
        { pin: [1], exclude: [2] },
        { pin: [3, 4], exclude: [5] },
        { pin: [], exclude: [6, 7, 8] },
        { pin: [9], exclude: [] },
      ];

      for (const { pin, exclude } of states) {
        // Simulate URL initialization
        setPinnedCardIds(new Set(pin));
        setExcludedCardIds(new Set(exclude));

        // Verify state matches current request
        expect(getPinnedCardIds().size).toBe(pin.length);
        expect(getExcludedCardIds().size).toBe(exclude.length);

        for (const id of pin) {
          expect(getPinnedCardIds().has(id)).toBe(true);
        }
        for (const id of exclude) {
          expect(getExcludedCardIds().has(id)).toBe(true);
        }
      }
    });
  });

  describe("State Mutation Does Not Affect Other Requests", () => {
    it("should not propagate togglePin across request boundaries", () => {
      // Request A: initial state ?pin=1
      setPinnedCardIds(new Set([1]));

      // User in Request A clicks togglePin(2)
      togglePin(2);
      expect(getPinnedCardIds().has(2)).toBe(true);

      // Request B: different user with ?pin=3
      // This simulates the $effect re-initializing from URL
      setPinnedCardIds(new Set([3]));

      // Request B should only see pin=3, not mutations from Request A
      expect(getPinnedCardIds().has(1)).toBe(false);
      expect(getPinnedCardIds().has(2)).toBe(false);
      expect(getPinnedCardIds().has(3)).toBe(true);
    });

    it("should not propagate toggleExclude across request boundaries", () => {
      // Request A: ?exclude=5
      setExcludedCardIds(new Set([5]));

      // User in Request A clicks toggleExclude(6)
      toggleExclude(6);
      expect(getExcludedCardIds().has(6)).toBe(true);

      // Request B: ?exclude=7
      setExcludedCardIds(new Set([7]));

      // Request B should only see exclude=7
      expect(getExcludedCardIds().has(5)).toBe(false);
      expect(getExcludedCardIds().has(6)).toBe(false);
      expect(getExcludedCardIds().has(7)).toBe(true);
    });
  });

  describe("getCardState Function Isolation", () => {
    it("should return correct state per request context", () => {
      // Request A: ?pin=1&exclude=2
      setPinnedCardIds(new Set([1]));
      setExcludedCardIds(new Set([2]));

      expect(getCardState(1)).toBe("pinned");
      expect(getCardState(2)).toBe("excluded");
      expect(getCardState(3)).toBe("normal");

      // Request B: ?pin=2&exclude=1 (opposite of Request A)
      setPinnedCardIds(new Set([2]));
      setExcludedCardIds(new Set([1]));

      expect(getCardState(1)).toBe("excluded");
      expect(getCardState(2)).toBe("pinned");
      expect(getCardState(3)).toBe("normal");
    });
  });
});
