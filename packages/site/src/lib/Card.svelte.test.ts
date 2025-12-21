import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Card.svelte Svelte 5 Migration", () => {
	it("should not contain legacy Svelte imports", () => {
		const cardSvelteContent = readFileSync(
			join(__dirname, "Card.svelte"),
			"utf-8",
		);

		// Check for legacy imports from 'svelte/legacy'
		expect(cardSvelteContent).not.toContain("svelte/legacy");

		// Check for legacy import patterns
		expect(cardSvelteContent).not.toMatch(/import\s+.*\s+from\s+['"]svelte\/legacy['"]/);
	});

	it("should use Svelte 5 $props() syntax", () => {
		const cardSvelteContent = readFileSync(
			join(__dirname, "Card.svelte"),
			"utf-8",
		);

		// Should contain $props() usage
		expect(cardSvelteContent).toContain("$props()");

		// Should NOT contain old 'export let' syntax
		expect(cardSvelteContent).not.toMatch(/export\s+let\s+\w+/);
	});

	it("should use Svelte 5 $derived() for reactive values", () => {
		const cardSvelteContent = readFileSync(
			join(__dirname, "Card.svelte"),
			"utf-8",
		);

		// Should contain $derived() usage
		expect(cardSvelteContent).toContain("$derived(");

		// Should NOT contain old reactive statements ($:)
		expect(cardSvelteContent).not.toMatch(/\$:\s+\w+\s*=/);
	});

	it("should use event attributes instead of on: directives", () => {
		const cardSvelteContent = readFileSync(
			join(__dirname, "Card.svelte"),
			"utf-8",
		);

		// Should contain event attributes
		expect(cardSvelteContent).toContain("onmousedown=");
		expect(cardSvelteContent).toContain("ontouchstart=");

		// Should NOT contain old on: directives
		expect(cardSvelteContent).not.toContain("on:mousedown");
		expect(cardSvelteContent).not.toContain("on:touchstart");
	});

	it("should use native stopPropagation without legacy imports", () => {
		const cardSvelteContent = readFileSync(
			join(__dirname, "Card.svelte"),
			"utf-8",
		);

		// Should contain stopPropagation (native browser API)
		expect(cardSvelteContent).toContain("stopPropagation()");

		// But should NOT import it from svelte/legacy
		expect(cardSvelteContent).not.toMatch(/import\s+\{[^}]*stopPropagation[^}]*\}\s+from\s+['"]svelte\/legacy['"]/);
	});
});
