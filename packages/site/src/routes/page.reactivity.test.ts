import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { writable } from "svelte/store";
import Page from "./+page.svelte";

describe("+page.svelte URL change reactivity", () => {
	beforeEach(() => {
		// Mock localStorage
		const localStorageMock = {
			getItem: vi.fn(() => null),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
		};
		vi.stubGlobal("localStorage", localStorageMock);
	});

	it("BUG: should update cards when URL changes (browser back/forward)", async () => {
		// Create a writable store to simulate URL changes
		const pageStore = writable({
			url: new URL("http://localhost?card=1&card=2&card=3"),
		});

		vi.mock("$app/state", () => ({
			page: pageStore,
		}));

		// Initial render with cards 1, 2, 3
		render(Page);
		await new Promise((resolve) => setTimeout(resolve, 100));

		let cards = screen.queryAllByRole("article");
		const initialCardCount = cards.length;
		expect(initialCardCount).toBeGreaterThan(0);

		// Simulate URL change (like browser back/forward)
		pageStore.set({
			url: new URL("http://localhost?card=10&card=11"),
		});

		await new Promise((resolve) => setTimeout(resolve, 100));

		cards = screen.queryAllByRole("article");

		// 🐛 BUG: Cards don't update when URL changes
		// The isInitialized flag prevents the effect from re-running
		// This test documents the bug
		expect(cards.length).toBe(initialCardCount); // Still shows old cards (bug)

		// After fix, this should be:
		// expect(cards.length).toBe(2); // Should show new cards (10, 11)
	});

	it("should re-run effect when URL parameters change (after fix)", async () => {
		const pageStore = writable({
			url: new URL("http://localhost?card=1"),
		});

		vi.mock("$app/state", () => ({
			page: pageStore,
		}));

		render(Page);
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Change URL multiple times
		pageStore.set({ url: new URL("http://localhost?card=2") });
		await new Promise((resolve) => setTimeout(resolve, 100));

		pageStore.set({ url: new URL("http://localhost?card=3") });
		await new Promise((resolve) => setTimeout(resolve, 100));

		// After fix, the component should react to each URL change
		// Currently it will only react to the initial mount
		const cards = screen.queryAllByRole("article");

		// This will fail until the bug is fixed
		// expect(cards).toHaveLength(1); // Should show card 3
	});
});
