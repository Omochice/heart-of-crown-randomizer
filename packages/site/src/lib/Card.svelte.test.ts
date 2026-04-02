import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import Card from "./Card.svelte";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import * as cardState from "$lib/stores/card-state.svelte";

const mockCard: CommonCard = {
	id: 1,
	name: "Test Card",
	cost: 3,
	type: "common",
	link: 0,
	mainType: ["attack"],
	effect: "",
	hasChild: false,
	edition: 0,
};

const mockSwipeHandlers = {
	onSwipeStart: vi.fn(),
	onSwipeMove: vi.fn(),
	onSwipeEnd: vi.fn(),
	onSwipeCancel: vi.fn(),
	originalIndex: 0,
};

describe("Card Component Tests", () => {
	beforeEach(() => {
		cardState.setPinnedCardIds(new Set());
		cardState.setExcludedCardIds(new Set());

		vi.clearAllMocks();
	});

	describe("Pin button click behavior", () => {
		it("should call togglePin when pin button is clicked", async () => {
			const togglePinSpy = vi.spyOn(cardState, "togglePin");

			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });
			await fireEvent.click(pinButton);

			expect(togglePinSpy).toHaveBeenCalledWith(mockCard.id);
			expect(togglePinSpy).toHaveBeenCalledTimes(1);
		});

		it("should toggle pin state when clicked multiple times", async () => {
			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });

			expect(cardState.getCardState(mockCard.id)).toBe("normal");

			await fireEvent.click(pinButton);
			expect(cardState.getCardState(mockCard.id)).toBe("pinned");

			await fireEvent.click(pinButton);
			expect(cardState.getCardState(mockCard.id)).toBe("normal");
		});
	});

	describe("Exclude button click behavior", () => {
		it("should call toggleExclude when exclude button is clicked", async () => {
			const toggleExcludeSpy = vi.spyOn(cardState, "toggleExclude");

			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });
			await fireEvent.click(excludeButton);

			expect(toggleExcludeSpy).toHaveBeenCalledWith(mockCard.id);
			expect(toggleExcludeSpy).toHaveBeenCalledTimes(1);
		});

		it("should toggle exclude state when clicked multiple times", async () => {
			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });

			expect(cardState.getCardState(mockCard.id)).toBe("normal");

			await fireEvent.click(excludeButton);
			expect(cardState.getCardState(mockCard.id)).toBe("excluded");

			await fireEvent.click(excludeButton);
			expect(cardState.getCardState(mockCard.id)).toBe("normal");
		});
	});

	describe("Visual feedback for pinned state", () => {
		it("should display pinned visual styles when card is pinned", () => {
			cardState.setPinnedCardIds(new Set([mockCard.id]));

			const { container } = render(Card, {
				props: { card: mockCard, ...mockSwipeHandlers },
			});

			const cardContainer = container.querySelector(".card-row--pinned");
			expect(cardContainer).toBeTruthy();

			const pinButton = screen.getByRole("button", { name: /ピン中/ });
			expect(pinButton).toBeTruthy();
			expect(pinButton.classList.contains("card-icon-btn--active-pin")).toBe(true);
		});

		it("should display normal styles when card is not pinned", () => {
			const { container } = render(Card, {
				props: { card: mockCard, ...mockSwipeHandlers },
			});

			const cardContainer = container.querySelector(".card-row--pinned");
			expect(cardContainer).toBeFalsy();

			const pinButton = screen.getByRole("button", { name: "ピン" });
			expect(pinButton).toBeTruthy();
			expect(pinButton.classList.contains("card-icon-btn--active-pin")).toBe(false);
		});
	});

	describe("Visual feedback for excluded state", () => {
		it("should display excluded visual styles when card is excluded", () => {
			cardState.setExcludedCardIds(new Set([mockCard.id]));

			const { container } = render(Card, {
				props: { card: mockCard, ...mockSwipeHandlers },
			});

			const cardContainer = container.querySelector(".card-row--excluded");
			expect(cardContainer).toBeTruthy();

			const excludeButton = screen.getByRole("button", { name: /除外中/ });
			expect(excludeButton).toBeTruthy();
			expect(excludeButton.classList.contains("card-icon-btn--active-exclude")).toBe(true);
		});

		it("should display normal styles when card is not excluded", () => {
			const { container } = render(Card, {
				props: { card: mockCard, ...mockSwipeHandlers },
			});

			const cardContainer = container.querySelector(".card-row--excluded");
			expect(cardContainer).toBeFalsy();

			const excludeButton = screen.getByRole("button", { name: "除外" });
			expect(excludeButton).toBeTruthy();
			expect(excludeButton.classList.contains("card-icon-btn--active-exclude")).toBe(false);
		});
	});

	describe("Accessibility features", () => {
		it("should have aria-pressed=false on pin button when not pinned", () => {
			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });
			expect(pinButton.getAttribute("aria-pressed")).toBe("false");
		});

		it("should have aria-pressed=true on pin button when pinned", () => {
			cardState.setPinnedCardIds(new Set([mockCard.id]));

			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const pinButton = screen.getByRole("button", { name: /ピン中/ });
			expect(pinButton.getAttribute("aria-pressed")).toBe("true");
		});

		it("should have aria-pressed=false on exclude button when not excluded", () => {
			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });
			expect(excludeButton.getAttribute("aria-pressed")).toBe("false");
		});

		it("should have aria-pressed=true on exclude button when excluded", () => {
			cardState.setExcludedCardIds(new Set([mockCard.id]));

			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const excludeButton = screen.getByRole("button", { name: /除外中/ });
			expect(excludeButton.getAttribute("aria-pressed")).toBe("true");
		});
	});

	describe("Card content display", () => {
		it("should display card name", () => {
			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const cardName = screen.getByText(mockCard.name);
			expect(cardName).toBeTruthy();
		});

		it("should display card cost", () => {
			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const cardCost = screen.getByText(mockCard.cost.toString());
			expect(cardCost).toBeTruthy();
		});

		it("should display category label based on mainType", () => {
			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const categoryLabel = screen.getByText("攻撃");
			expect(categoryLabel).toBeTruthy();
		});
	});

	describe("State mutual exclusivity", () => {
		it("should unexclude card when pinned", async () => {
			cardState.setExcludedCardIds(new Set([mockCard.id]));
			expect(cardState.getCardState(mockCard.id)).toBe("excluded");

			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const pinButton = screen.getByRole("button", { name: /ピン/ });
			await fireEvent.click(pinButton);

			expect(cardState.getCardState(mockCard.id)).toBe("pinned");
			expect(cardState.getExcludedCardIds().has(mockCard.id)).toBe(false);
		});

		it("should unpin card when excluded", async () => {
			cardState.setPinnedCardIds(new Set([mockCard.id]));
			expect(cardState.getCardState(mockCard.id)).toBe("pinned");

			render(Card, { props: { card: mockCard, ...mockSwipeHandlers } });

			const excludeButton = screen.getByRole("button", { name: /除外/ });
			await fireEvent.click(excludeButton);

			expect(cardState.getCardState(mockCard.id)).toBe("excluded");
			expect(cardState.getPinnedCardIds().has(mockCard.id)).toBe(false);
		});
	});
});
