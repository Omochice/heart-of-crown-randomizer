import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import DebugPanel from "./DebugPanel.svelte";
import type { Constraint, SelectionContext } from "@heart-of-crown-randomizer/constraint";
import { makeCard } from "$lib/test-helpers";
import * as constraintState from "$lib/stores/constraint-state.svelte";

function makeConstraint(id: string, label: string, isSatisfied = true): Constraint {
	return {
		id,
		label,
		canApply: () => true,
		isSatisfied: () => isSatisfied,
		apply: (ctx: SelectionContext) => ctx,
	};
}

const allCards = Array.from({ length: 10 }, (_, i) => makeCard(i + 1));
const constraints = [
	makeConstraint("c1", "Constraint 1"),
	makeConstraint("c2", "Constraint 2", false),
];

const defaultProps = {
	constraints,
	selectedCards: [],
	allCards,
	pinnedCards: [],
	excludedIds: new Set<number>(),
	count: 10,
};

describe("DebugPanel", () => {
	beforeEach(() => {
		// Reset constraint state by toggling off any enabled constraints
		for (const c of constraints) {
			if (constraintState.getEnabledConstraintIds().has(c.id)) {
				constraintState.toggleConstraint(c.id);
			}
		}
	});

	describe("FAB button", () => {
		it("should render the FAB button", () => {
			render(DebugPanel, { props: defaultProps });

			const fab = screen.getByRole("button", { name: /debug panel/i });
			expect(fab).toBeDefined();
		});

		it("should toggle panel visibility on click", async () => {
			render(DebugPanel, { props: defaultProps });

			expect(screen.queryByRole("complementary")).toBeNull();

			const fab = screen.getByRole("button", { name: /open debug panel/i });
			await fireEvent.click(fab);

			expect(screen.queryByRole("complementary")).not.toBeNull();
		});

		it("should close panel on second click", async () => {
			render(DebugPanel, { props: defaultProps });

			const fab = screen.getByRole("button", { name: /open debug panel/i });
			await fireEvent.click(fab);
			expect(screen.queryByRole("complementary")).not.toBeNull();

			const closeFab = screen.getByRole("button", { name: /close debug panel/i });
			await fireEvent.click(closeFab);
			expect(screen.queryByRole("complementary")).toBeNull();
		});
	});

	describe("Constraint status section", () => {
		it("should show all constraints with OFF badge when none enabled", async () => {
			render(DebugPanel, { props: defaultProps });
			await fireEvent.click(screen.getByRole("button", { name: /open debug panel/i }));

			const badges = screen.getAllByText("OFF");
			expect(badges).toHaveLength(2);
		});

		it("should show ON badge for enabled constraints", async () => {
			constraintState.toggleConstraint("c1");

			render(DebugPanel, { props: defaultProps });
			await fireEvent.click(screen.getByRole("button", { name: /open debug panel/i }));

			expect(screen.getByText("ON")).toBeDefined();
			expect(screen.getAllByText("OFF")).toHaveLength(1);
		});
	});

	describe("Constraint satisfaction section", () => {
		it("should show 'No active constraints.' when none enabled", async () => {
			render(DebugPanel, { props: defaultProps });
			await fireEvent.click(screen.getByRole("button", { name: /open debug panel/i }));

			expect(screen.getByText("No active constraints.")).toBeDefined();
		});

		it("should show N/A when constraint is enabled but no cards selected", async () => {
			constraintState.toggleConstraint("c1");

			render(DebugPanel, { props: defaultProps });
			await fireEvent.click(screen.getByRole("button", { name: /open debug panel/i }));

			expect(screen.getByText("N/A")).toBeDefined();
		});

		it("should show PASS for satisfied constraint with selected cards", async () => {
			constraintState.toggleConstraint("c1");
			const selected = allCards.slice(0, 3);

			render(DebugPanel, { props: { ...defaultProps, selectedCards: selected } });
			await fireEvent.click(screen.getByRole("button", { name: /open debug panel/i }));

			expect(screen.getByText("PASS")).toBeDefined();
		});

		it("should show FAIL for unsatisfied constraint with selected cards", async () => {
			constraintState.toggleConstraint("c2");
			const selected = allCards.slice(0, 3);

			render(DebugPanel, { props: { ...defaultProps, selectedCards: selected } });
			await fireEvent.click(screen.getByRole("button", { name: /open debug panel/i }));

			expect(screen.getByText("FAIL")).toBeDefined();
		});
	});

	describe("Drawable pool section", () => {
		it("should show all cards in pool when no exclusions or pins", async () => {
			render(DebugPanel, { props: defaultProps });
			await fireEvent.click(screen.getByRole("button", { name: /open debug panel/i }));

			expect(screen.getByText(`Drawable Pool (${allCards.length})`)).toBeDefined();
		});

		it("should exclude cards from pool based on excludedIds", async () => {
			const excludedIds = new Set([1, 2]);

			render(DebugPanel, { props: { ...defaultProps, excludedIds } });
			await fireEvent.click(screen.getByRole("button", { name: /open debug panel/i }));

			expect(screen.getByText(`Drawable Pool (${allCards.length - 2})`)).toBeDefined();
		});

		it("should exclude pinned cards from pool", async () => {
			const pinnedCards = [allCards[0]];

			render(DebugPanel, { props: { ...defaultProps, pinnedCards } });
			await fireEvent.click(screen.getByRole("button", { name: /open debug panel/i }));

			expect(screen.getByText(`Drawable Pool (${allCards.length - 1})`)).toBeDefined();
		});
	});
});
