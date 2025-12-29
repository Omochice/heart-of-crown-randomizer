import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import CardWithActions from "./CardWithActions.svelte";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import * as cardState from "$lib/stores/card-state.svelte";

// Mock card data
const mockCard: CommonCard = {
	id: 1,
	name: "Test Card",
	cost: 3,
	type: "common",
	link: 0,
	category: "攻撃",
};

describe("CardWithActions Component Tests", () => {
	beforeEach(() => {
		// Reset card state before each test by clearing the Sets
		cardState.pinnedCardIds.clear();
		cardState.excludedCardIds.clear();

		// Clear all mocks
		vi.clearAllMocks();
	});

	describe("Pin button click behavior", () => {
		it("should call togglePin when pin button is clicked", async () => {
			const togglePinSpy = vi.spyOn(cardState, "togglePin");

			render(CardWithActions, { props: { card: mockCard } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });
			await fireEvent.click(pinButton);

			expect(togglePinSpy).toHaveBeenCalledWith(mockCard.id);
			expect(togglePinSpy).toHaveBeenCalledTimes(1);
		});

		it("should toggle pin state when clicked multiple times", async () => {
			render(CardWithActions, { props: { card: mockCard } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });

			// Initial state: not pinned
			expect(cardState.getCardState(mockCard.id)).toBe("normal");

			// First click: pin
			await fireEvent.click(pinButton);
			expect(cardState.getCardState(mockCard.id)).toBe("pinned");

			// Second click: unpin
			await fireEvent.click(pinButton);
			expect(cardState.getCardState(mockCard.id)).toBe("normal");
		});
	});

	describe("Exclude button click behavior", () => {
		it("should call toggleExclude when exclude button is clicked", async () => {
			const toggleExcludeSpy = vi.spyOn(cardState, "toggleExclude");

			render(CardWithActions, { props: { card: mockCard } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });
			await fireEvent.click(excludeButton);

			expect(toggleExcludeSpy).toHaveBeenCalledWith(mockCard.id);
			expect(toggleExcludeSpy).toHaveBeenCalledTimes(1);
		});

		it("should toggle exclude state when clicked multiple times", async () => {
			render(CardWithActions, { props: { card: mockCard } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });

			// Initial state: not excluded
			expect(cardState.getCardState(mockCard.id)).toBe("normal");

			// First click: exclude
			await fireEvent.click(excludeButton);
			expect(cardState.getCardState(mockCard.id)).toBe("excluded");

			// Second click: unexclude
			await fireEvent.click(excludeButton);
			expect(cardState.getCardState(mockCard.id)).toBe("normal");
		});
	});

	describe("Visual feedback for pinned state", () => {
		it("should display pinned visual styles when card is pinned", () => {
			// Pin the card first
			cardState.pinnedCardIds.add(mockCard.id);

			const { container } = render(CardWithActions, { props: { card: mockCard } });

			// Check for pinned visual styles
			const cardContainer = container.querySelector(".bg-blue-100");
			expect(cardContainer).toBeTruthy();
			expect(cardContainer?.classList.contains("border-blue-500")).toBe(true);

			// Pin button should show "ピン中"
			const pinButton = screen.getByRole("button", { name: /ピン中/ });
			expect(pinButton).toBeTruthy();
			expect(pinButton.classList.contains("bg-blue-500")).toBe(true);
			expect(pinButton.classList.contains("text-white")).toBe(true);
		});

		it("should display normal styles when card is not pinned", () => {
			const { container } = render(CardWithActions, { props: { card: mockCard } });

			// Should NOT have pinned visual styles
			const cardContainer = container.querySelector(".bg-blue-100");
			expect(cardContainer).toBeFalsy();

			// Pin button should show "ピン" (not "ピン中")
			const pinButton = screen.getByRole("button", { name: /^📌 ピン$/ });
			expect(pinButton).toBeTruthy();
			expect(pinButton.classList.contains("bg-gray-200")).toBe(true);
		});
	});

	describe("Visual feedback for excluded state", () => {
		it("should display excluded visual styles when card is excluded", () => {
			// Exclude the card first
			cardState.excludedCardIds.add(mockCard.id);

			const { container } = render(CardWithActions, { props: { card: mockCard } });

			// Check for excluded visual styles
			const cardContainer = container.querySelector(".bg-gray-100");
			expect(cardContainer).toBeTruthy();
			expect(cardContainer?.classList.contains("opacity-60")).toBe(true);

			// Card name should have line-through
			const cardName = screen.getByRole("heading", { level: 3 });
			expect(cardName.classList.contains("line-through")).toBe(true);

			// Exclude button should show "除外中"
			const excludeButton = screen.getByRole("button", { name: /除外中/ });
			expect(excludeButton).toBeTruthy();
			expect(excludeButton.classList.contains("bg-red-500")).toBe(true);
			expect(excludeButton.classList.contains("text-white")).toBe(true);
		});

		it("should display normal styles when card is not excluded", () => {
			const { container } = render(CardWithActions, { props: { card: mockCard } });

			// Should NOT have excluded visual styles
			const cardContainer = container.querySelector(".opacity-60");
			expect(cardContainer).toBeFalsy();

			// Card name should NOT have line-through
			const cardName = screen.getByRole("heading", { level: 3 });
			expect(cardName.classList.contains("line-through")).toBe(false);

			// Exclude button should show "除外" (not "除外中")
			const excludeButton = screen.getByRole("button", { name: /^🚫 除外$/ });
			expect(excludeButton).toBeTruthy();
			expect(excludeButton.classList.contains("bg-gray-200")).toBe(true);
		});
	});

	describe("Accessibility features", () => {
		it("should have aria-pressed=false on pin button when not pinned", () => {
			render(CardWithActions, { props: { card: mockCard } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });
			expect(pinButton.getAttribute("aria-pressed")).toBe("false");
		});

		it("should have aria-pressed=true on pin button when pinned", () => {
			cardState.pinnedCardIds.add(mockCard.id);

			render(CardWithActions, { props: { card: mockCard } });

			const pinButton = screen.getByRole("button", { name: /ピン中/ });
			expect(pinButton.getAttribute("aria-pressed")).toBe("true");
		});

		it("should have aria-pressed=false on exclude button when not excluded", () => {
			render(CardWithActions, { props: { card: mockCard } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });
			expect(excludeButton.getAttribute("aria-pressed")).toBe("false");
		});

		it("should have aria-pressed=true on exclude button when excluded", () => {
			cardState.excludedCardIds.add(mockCard.id);

			render(CardWithActions, { props: { card: mockCard } });

			const excludeButton = screen.getByRole("button", { name: /除外中/ });
			expect(excludeButton.getAttribute("aria-pressed")).toBe("true");
		});

		it("should have focus ring classes on buttons", () => {
			const { container } = render(CardWithActions, { props: { card: mockCard } });

			const buttons = container.querySelectorAll("button");
			expect(buttons.length).toBe(2);

			// Both buttons should have focus ring classes
			for (const button of buttons) {
				expect(button.classList.contains("focus:outline-none")).toBe(true);
				expect(
					button.classList.contains("focus:ring-2") || button.className.includes("focus:ring-2"),
				).toBe(true);
			}
		});
	});

	describe("Card content display", () => {
		it("should display card name", () => {
			render(CardWithActions, { props: { card: mockCard } });

			const cardName = screen.getByText(mockCard.name);
			expect(cardName).toBeTruthy();
		});

		it("should display card cost", () => {
			render(CardWithActions, { props: { card: mockCard } });

			const cardCost = screen.getByText(`コスト: ${mockCard.cost}`);
			expect(cardCost).toBeTruthy();
		});
	});

	describe("State mutual exclusivity", () => {
		it("should unexclude card when pinned", async () => {
			// Exclude the card first
			cardState.excludedCardIds.add(mockCard.id);
			expect(cardState.getCardState(mockCard.id)).toBe("excluded");

			render(CardWithActions, { props: { card: mockCard } });

			// Click pin button
			const pinButton = screen.getByRole("button", { name: /ピン/ });
			await fireEvent.click(pinButton);

			// Should be pinned, not excluded
			expect(cardState.getCardState(mockCard.id)).toBe("pinned");
			expect(cardState.excludedCardIds.has(mockCard.id)).toBe(false);
		});

		it("should unpin card when excluded", async () => {
			// Pin the card first
			cardState.pinnedCardIds.add(mockCard.id);
			expect(cardState.getCardState(mockCard.id)).toBe("pinned");

			render(CardWithActions, { props: { card: mockCard } });

			// Click exclude button
			const excludeButton = screen.getByRole("button", { name: /除外/ });
			await fireEvent.click(excludeButton);

			// Should be excluded, not pinned
			expect(cardState.getCardState(mockCard.id)).toBe("excluded");
			expect(cardState.pinnedCardIds.has(mockCard.id)).toBe(false);
		});
	});
});
