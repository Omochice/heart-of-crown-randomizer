import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import ExcludeList from "./ExcludeList.svelte";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import * as cardState from "$lib/stores/card-state.svelte";

const mockAttackCard: CommonCard = {
	id: 1,
	name: "破城槌",
	cost: 3,
	type: "common",
	link: 1,
	mainType: ["attack"],
	effect: "",
	hasChild: false,
	edition: 0,
};

const mockActionCard: CommonCard = {
	id: 2,
	name: "早馬",
	cost: 2,
	type: "common",
	link: 0,
	mainType: ["action"],
	effect: "",
	hasChild: false,
	edition: 0,
};

describe("ExcludeList Component", () => {
	beforeEach(() => {
		cardState.setPinnedCardIds(new Set());
		cardState.setExcludedCardIds(new Set());
		vi.clearAllMocks();
	});

	describe("Visibility", () => {
		it("should render header even when no cards are excluded", () => {
			render(ExcludeList, { props: { cards: [] } });
			expect(screen.getByText("除外")).toBeTruthy();
		});

		it("should not show badge when no cards are excluded", () => {
			const { container } = render(ExcludeList, { props: { cards: [] } });
			expect(container.querySelector(".exclude-badge")).toBeFalsy();
		});

		it("should render when excluded cards exist", () => {
			render(ExcludeList, { props: { cards: [mockAttackCard] } });
			expect(screen.getByText("除外")).toBeTruthy();
		});
	});

	describe("Header display", () => {
		it("should show excluded card count in badge", () => {
			const { container } = render(ExcludeList, {
				props: { cards: [mockAttackCard, mockActionCard] },
			});
			const badge = container.querySelector(".exclude-badge");
			expect(badge).toBeTruthy();
			expect(badge?.textContent).toBe("2");
		});

		it("should show chevron-up icon when expanded by default", () => {
			const { container } = render(ExcludeList, {
				props: { cards: [mockAttackCard] },
			});
			const header = container.querySelector(".exclude-toggle-header");
			expect(header).toBeTruthy();
		});
	});

	describe("Card list display", () => {
		it("should display card name", () => {
			render(ExcludeList, { props: { cards: [mockAttackCard] } });
			expect(screen.getByText("破城槌")).toBeTruthy();
		});

		it("should display card category label", () => {
			render(ExcludeList, { props: { cards: [mockAttackCard] } });
			expect(screen.getByText("攻撃")).toBeTruthy();
		});

		it("should display card cost", () => {
			render(ExcludeList, { props: { cards: [mockAttackCard] } });
			expect(screen.getByText("3")).toBeTruthy();
		});

		it("should display multiple excluded cards", () => {
			render(ExcludeList, {
				props: { cards: [mockAttackCard, mockActionCard] },
			});
			expect(screen.getByText("破城槌")).toBeTruthy();
			expect(screen.getByText("早馬")).toBeTruthy();
		});
	});

	describe("Toggle expand/collapse", () => {
		it("should hide card list when header is clicked", async () => {
			render(ExcludeList, { props: { cards: [mockAttackCard] } });

			expect(screen.getByText("破城槌")).toBeTruthy();

			const header = screen.getByRole("button", { name: /^除外 \d+$/ });
			await fireEvent.click(header);

			expect(screen.queryByText("破城槌")).toBeFalsy();
		});

		it("should show card list again when header is clicked twice", async () => {
			render(ExcludeList, { props: { cards: [mockAttackCard] } });

			const header = screen.getByRole("button", { name: /^除外 \d+$/ });
			await fireEvent.click(header);
			await fireEvent.click(header);

			expect(screen.getByText("破城槌")).toBeTruthy();
		});
	});

	describe("Remove button", () => {
		it("should call toggleExclude when remove button is clicked", async () => {
			const toggleExcludeSpy = vi.spyOn(cardState, "toggleExclude");

			render(ExcludeList, { props: { cards: [mockAttackCard] } });

			const removeButton = screen.getByRole("button", {
				name: /除外解除/,
			});
			await fireEvent.click(removeButton);

			expect(toggleExcludeSpy).toHaveBeenCalledWith(mockAttackCard.id);
		});

		it("should call toggleExclude for the correct card", async () => {
			const toggleExcludeSpy = vi.spyOn(cardState, "toggleExclude");

			render(ExcludeList, {
				props: { cards: [mockAttackCard, mockActionCard] },
			});

			const removeButtons = screen.getAllByRole("button", {
				name: /除外解除/,
			});
			await fireEvent.click(removeButtons[1]);

			expect(toggleExcludeSpy).toHaveBeenCalledWith(mockActionCard.id);
		});
	});
});
