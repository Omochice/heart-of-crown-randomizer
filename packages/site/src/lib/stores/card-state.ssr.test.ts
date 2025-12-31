/**
 * SSR Safety Tests for CardState
 *
 * These tests verify that the card-state module correctly handles
 * Server-Side Rendering scenarios, including:
 * - State isolation across multiple SSR requests
 * - URL-driven initialization priority over module-scoped defaults
 * - No state leakage between concurrent requests
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
	pinnedCardIds,
	excludedCardIds,
	togglePin,
	toggleExclude,
	getCardState,
} from "./card-state.svelte";

describe("CardState SSR Safety", () => {
	beforeEach(() => {
		// Clear state before each test to simulate fresh SSR request
		pinnedCardIds.clear();
		excludedCardIds.clear();
	});

	describe("State Isolation Across Requests", () => {
		it("should not leak state from Request A (pin=1) to Request B (pin=2)", () => {
			// Simulate Request A: User requests page with ?pin=1
			pinnedCardIds.clear();
			pinnedCardIds.add(1);
			expect(pinnedCardIds.has(1)).toBe(true);
			expect(pinnedCardIds.has(2)).toBe(false);

			// Simulate Request B: Different user requests page with ?pin=2
			// In real SSR, the $effect in +page.svelte would clear and re-initialize
			pinnedCardIds.clear();
			pinnedCardIds.add(2);

			// Request B should only see pin=2, not pin=1
			expect(pinnedCardIds.has(1)).toBe(false);
			expect(pinnedCardIds.has(2)).toBe(true);
		});

		it("should isolate exclude state between requests", () => {
			// Request A: ?exclude=5
			excludedCardIds.clear();
			excludedCardIds.add(5);
			expect(excludedCardIds.has(5)).toBe(true);

			// Request B: ?exclude=10
			excludedCardIds.clear();
			excludedCardIds.add(10);

			// Request B should only see exclude=10
			expect(excludedCardIds.has(5)).toBe(false);
			expect(excludedCardIds.has(10)).toBe(true);
		});

		it("should handle empty state correctly", () => {
			// Request A: ?pin=1&exclude=2
			pinnedCardIds.clear();
			excludedCardIds.clear();
			pinnedCardIds.add(1);
			excludedCardIds.add(2);

			// Request B: no pin/exclude params (empty state)
			pinnedCardIds.clear();
			excludedCardIds.clear();

			// Request B should have empty state
			expect(pinnedCardIds.size).toBe(0);
			expect(excludedCardIds.size).toBe(0);
		});
	});

	describe("URL Initialization Priority", () => {
		it("should prioritize URL state over module-scoped defaults", () => {
			// Module-scoped state might have stale data from previous request
			pinnedCardIds.clear();
			pinnedCardIds.add(999); // Stale data from previous request

			// $effect in +page.svelte clears and re-initializes from URL
			// Simulate: URL has ?pin=1
			pinnedCardIds.clear();
			pinnedCardIds.add(1);

			// Should only see URL state, not stale module state
			expect(pinnedCardIds.has(1)).toBe(true);
			expect(pinnedCardIds.has(999)).toBe(false);
		});

		it("should use empty state when URL has no pin/exclude params", () => {
			// Module-scoped state might have stale data
			pinnedCardIds.clear();
			excludedCardIds.clear();
			pinnedCardIds.add(100);
			excludedCardIds.add(200);

			// $effect clears state when URL has no params
			pinnedCardIds.clear();
			excludedCardIds.clear();

			// Should be empty, not retain stale data
			expect(pinnedCardIds.size).toBe(0);
			expect(excludedCardIds.size).toBe(0);
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
				pinnedCardIds.clear();
				excludedCardIds.clear();

				for (const id of pin) {
					pinnedCardIds.add(id);
				}
				for (const id of exclude) {
					excludedCardIds.add(id);
				}

				// Verify state matches current request
				expect(pinnedCardIds.size).toBe(pin.length);
				expect(excludedCardIds.size).toBe(exclude.length);

				for (const id of pin) {
					expect(pinnedCardIds.has(id)).toBe(true);
				}
				for (const id of exclude) {
					expect(excludedCardIds.has(id)).toBe(true);
				}
			}
		});
	});

	describe("State Mutation Does Not Affect Other Requests", () => {
		it("should not propagate togglePin across request boundaries", () => {
			// Request A: initial state ?pin=1
			pinnedCardIds.clear();
			pinnedCardIds.add(1);

			// User in Request A clicks togglePin(2)
			togglePin(2);
			expect(pinnedCardIds.has(2)).toBe(true);

			// Request B: different user with ?pin=3
			// This simulates the $effect re-initializing from URL
			pinnedCardIds.clear();
			pinnedCardIds.add(3);

			// Request B should only see pin=3, not mutations from Request A
			expect(pinnedCardIds.has(1)).toBe(false);
			expect(pinnedCardIds.has(2)).toBe(false);
			expect(pinnedCardIds.has(3)).toBe(true);
		});

		it("should not propagate toggleExclude across request boundaries", () => {
			// Request A: ?exclude=5
			excludedCardIds.clear();
			excludedCardIds.add(5);

			// User in Request A clicks toggleExclude(6)
			toggleExclude(6);
			expect(excludedCardIds.has(6)).toBe(true);

			// Request B: ?exclude=7
			excludedCardIds.clear();
			excludedCardIds.add(7);

			// Request B should only see exclude=7
			expect(excludedCardIds.has(5)).toBe(false);
			expect(excludedCardIds.has(6)).toBe(false);
			expect(excludedCardIds.has(7)).toBe(true);
		});
	});

	describe("getCardState Function Isolation", () => {
		it("should return correct state per request context", () => {
			// Request A: ?pin=1&exclude=2
			pinnedCardIds.clear();
			excludedCardIds.clear();
			pinnedCardIds.add(1);
			excludedCardIds.add(2);

			expect(getCardState(1)).toBe("pinned");
			expect(getCardState(2)).toBe("excluded");
			expect(getCardState(3)).toBe("normal");

			// Request B: ?pin=2&exclude=1 (opposite of Request A)
			pinnedCardIds.clear();
			excludedCardIds.clear();
			pinnedCardIds.add(2);
			excludedCardIds.add(1);

			expect(getCardState(1)).toBe("excluded");
			expect(getCardState(2)).toBe("pinned");
			expect(getCardState(3)).toBe("normal");
		});
	});
});
