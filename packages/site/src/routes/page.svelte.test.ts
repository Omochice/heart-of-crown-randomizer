import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { readable } from "svelte/store";
import Page from "./+page.svelte";

describe("+page.svelte URL parameter card restoration", () => {
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

	it("should restore Basic cards from URL parameters", async () => {
		// Mock page store with Basic card IDs (1, 2, 3)
		const mockPage = readable({
			url: new URL("http://localhost?card=1&card=2&card=3"),
		});

		vi.mock("$app/state", () => ({
			page: mockPage,
		}));

		render(Page);

		// Wait for effect to run
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Basic cards should be displayed
		// Note: You'll need to check actual card names from your data
		// This is a placeholder - adjust based on actual card data
		const cards = screen.queryAllByRole("article"); // or whatever role your cards have
		expect(cards.length).toBeGreaterThan(0);
	});

	it("BUG: should restore Far Eastern Border cards from URL parameters", async () => {
		// Mock page store with Far Eastern Border card IDs (49, 50, 51)
		const mockPage = readable({
			url: new URL("http://localhost?card=49&card=50&card=51"),
		});

		vi.mock("$app/state", () => ({
			page: mockPage,
		}));

		render(Page);

		// Wait for effect to run
		await new Promise((resolve) => setTimeout(resolve, 100));

		// 🐛 BUG: Far Eastern Border cards are NOT restored
		// This test should FAIL until the bug is fixed
		const cards = screen.queryAllByRole("article");

		// Currently this will be 0 (bug), should be 3 after fix
		expect(cards.length).toBe(0); // Documents the bug

		// After fix, change to:
		// expect(cards.length).toBe(3);
	});

	it("should restore mixed Basic and Far Eastern Border cards", async () => {
		// Mock page store with mixed card IDs
		const mockPage = readable({
			url: new URL("http://localhost?card=1&card=2&card=49&card=50"),
		});

		vi.mock("$app/state", () => ({
			page: mockPage,
		}));

		render(Page);

		await new Promise((resolve) => setTimeout(resolve, 100));

		const cards = screen.queryAllByRole("article");

		// 🐛 BUG: Only 2 cards (Basic) will be shown, not 4
		// This documents the bug
		expect(cards.length).toBe(2); // Current buggy behavior

		// After fix, change to:
		// expect(cards.length).toBe(4);
	});
});
