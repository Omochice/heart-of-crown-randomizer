import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("CardWithActions.svelte Component", () => {
	it("should exist as a file", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should contain script tag with TypeScript
		expect(cardWithActionsContent).toContain("<script");
	});

	it("should use Svelte 5 $props() syntax", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should contain $props() usage
		expect(cardWithActionsContent).toContain("$props()");

		// Should NOT contain old 'export let' syntax
		expect(cardWithActionsContent).not.toMatch(/export\s+let\s+\w+/);
	});

	it("should accept a card prop with CommonCard type", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should contain Props type definition
		expect(cardWithActionsContent).toContain("type Props");
		expect(cardWithActionsContent).toContain("card: CommonCard");
	});

	it("should import card-state functions", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should import from card-state
		expect(cardWithActionsContent).toContain('from "$lib/stores/card-state.svelte"');
		expect(cardWithActionsContent).toContain("getCardState");
		expect(cardWithActionsContent).toContain("togglePin");
		expect(cardWithActionsContent).toContain("toggleExclude");
	});

	it("should use $derived() to get card state", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should contain $derived() usage for state
		expect(cardWithActionsContent).toContain("$derived(");
		expect(cardWithActionsContent).toContain("getCardState(card.id)");
	});

	it("should render a pin button", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should contain pin button
		expect(cardWithActionsContent).toMatch(/📌|ピン/);
		expect(cardWithActionsContent).toContain("onclick={handleTogglePin}");
	});

	it("should render an exclude button", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should contain exclude button
		expect(cardWithActionsContent).toMatch(/🚫|除外/);
		expect(cardWithActionsContent).toContain("onclick={handleToggleExclude}");
	});

	it("should have aria-pressed attributes on action buttons", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should contain aria-pressed for accessibility
		expect(cardWithActionsContent).toContain("aria-pressed");
	});

	it("should have visual feedback classes for pinned state", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should contain blue background for pinned state
		expect(cardWithActionsContent).toContain("bg-blue-100");
		expect(cardWithActionsContent).toContain("border-blue-500");
	});

	it("should have visual feedback classes for excluded state", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should contain gray background and opacity for excluded state
		expect(cardWithActionsContent).toContain("bg-gray-100");
		expect(cardWithActionsContent).toContain("opacity-60");
		expect(cardWithActionsContent).toContain("line-through");
	});

	it("should have focus indicators on buttons", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should contain focus ring classes for accessibility
		expect(cardWithActionsContent).toContain("focus:ring");
	});

	it("should display card name and cost", () => {
		const cardWithActionsContent = readFileSync(join(__dirname, "CardWithActions.svelte"), "utf-8");

		// Should render card.name and card.cost
		expect(cardWithActionsContent).toContain("{card.name}");
		expect(cardWithActionsContent).toContain("{card.cost}");
	});
});
