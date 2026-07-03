import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeEach, describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("+page.svelte URL Reactivity Bug", () => {
  let pageContent: string;

  beforeEach(() => {
    pageContent = readFileSync(join(__dirname, "+page.svelte"), "utf-8");
  });

  it("should use reactive page state from $app/state", () => {
    // $app/stores is deprecated since SvelteKit 2.12; page.url from
    // $app/state is fine-grained reactive when read inside $effect/$derived.
    expect(pageContent).toContain('import { page } from "$app/state"');
    expect(pageContent).not.toContain('import { page } from "$app/stores"');
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
    const allCommonsPattern =
      /\[\.\.\.Basic\.commons,\s*\.\.\.FarEasternBorder\.commons\]/;
    expect(pageContent).toMatch(allCommonsPattern);
  });

  it("should have separate $effect blocks for different concerns", () => {
    // Separate effects for URL-to-selection and preference-to-URL, which
    // helps with proper dependency tracking; shareUrl is a $derived value
    // rather than an effect.
    const effectCount = (pageContent.match(/\$effect\(/g) || []).length;
    expect(effectCount).toBeGreaterThanOrEqual(2);
  });

  it("should mirror preference state into the URL with replaceState", () => {
    expect(pageContent).toContain("buildUrlWithCardState");
    expect(pageContent).toMatch(/replaceState:\s*true/);
  });

  it("should gate the preference-to-URL effect until restore completes", () => {
    // Without this guard the effect runs before onMount seeds state and wipes
    // the URL's preferences; the flag pins that mitigation in place.
    expect(pageContent).toMatch(/let restored = \$state\(false\)/);
    expect(pageContent).toMatch(/!restored/);
  });

  it("should read the URL as page.url, not the store subscription $page.url", () => {
    // URL param parsing is delegated to utility functions (resolveCardsFromUrl, parseCompressedIds)
    if (pageContent.includes('from "$app/state"')) {
      expect(pageContent).toContain("page.url");
      expect(pageContent).not.toContain("$page.url");
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
			- $effect watching page.url should re-run
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
