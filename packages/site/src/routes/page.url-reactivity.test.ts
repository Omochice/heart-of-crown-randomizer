import { describe, expect, it, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("+page.svelte URL Reactivity Bug", () => {
	let pageContent: string;

	beforeEach(() => {
		pageContent = readFileSync(join(__dirname, "+page.svelte"), "utf-8");
	});

	it("should use reactive page store from $app/stores", () => {
		// The bug: Using non-reactive page from $app/state
		// Expected: Should import from $app/stores for reactivity
		expect(pageContent).toContain('import { page } from "$app/stores"');
		expect(pageContent).not.toContain('import { page } from "$app/state"');
	});

	it("should NOT use isInitialized guard that prevents reactivity", () => {
		// The bug: isInitialized flag prevents $effect from re-running on URL changes
		// Expected: Should not have manual initialization guard
		expect(pageContent).not.toContain("let isInitialized");
		expect(pageContent).not.toContain("if (!isInitialized)");
	});

	it("should search in both Basic and FarEasternBorder commons", () => {
		// The bug: Only searches Basic.commons
		// Expected: Should search both card sets
		const allCommonsPattern = /\[\.\.\.Basic\.commons,\s*\.\.\.FarEasternBorder\.commons\]/;
		expect(pageContent).toMatch(allCommonsPattern);
	});

	it("should have separate $effect blocks for different concerns", () => {
		// Expected: Separate effects for localStorage, URL params, and shareUrl updates
		// This helps with proper dependency tracking
		const effectCount = (pageContent.match(/\$effect\(/g) || []).length;
		expect(effectCount).toBeGreaterThanOrEqual(2);
	});

	it("should use $page store syntax for accessing URL params", () => {
		// When using reactive page store, should use $page syntax
		// Expected: $page.url.searchParams instead of page.url.searchParams
		if (pageContent.includes('from "$app/stores"')) {
			expect(pageContent).toContain("$page.url.searchParams");
		}
	});
});

describe("+page.svelte URL Reactivity - Integration Behavior", () => {
	it("documents the expected behavior after fix", () => {
		// After fix, the component should:
		// 1. Load cards from URL on mount
		// 2. Update selectedCommons when URL changes (browser back/forward)
		// 3. Load excludedCommons from localStorage once
		// 4. Update shareUrl when selectedCommons changes

		const expectedBehavior = `
			Expected behavior after fix:
			- When user navigates with browser back/forward buttons
			- URL parameters change (e.g., ?card=1&card=2 -> ?card=3&card=4)
			- $effect watching $page.url should re-run
			- selectedCommons should update to reflect new URL
			- shareUrl should update reactively

			Current bug:
			- isInitialized flag prevents $effect from re-running
			- URL changes are not reflected in selectedCommons
			- User sees stale card data
		`;

		expect(expectedBehavior).toBeTruthy();
	});
});
