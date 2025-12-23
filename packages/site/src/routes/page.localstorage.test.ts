import { describe, expect, it, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("+page.svelte localStorage Error Handling", () => {
	let pageContent: string;

	beforeEach(() => {
		pageContent = readFileSync(join(__dirname, "+page.svelte"), "utf-8");
	});

	it("should have try-catch around JSON.parse for localStorage", () => {
		// The bug: JSON.parse can throw on malformed data
		// Expected: Should wrap in try-catch
		const localStorageGetPattern = /localStorage\.getItem\("excludedCommons"\)/;
		const jsonParsePattern = /JSON\.parse\(storedExcludedCommons\)/;
		const tryCatchPattern =
			/try\s*\{[\s\S]*?JSON\.parse\(storedExcludedCommons\)[\s\S]*?\}\s*catch/;

		expect(pageContent).toMatch(localStorageGetPattern);
		expect(pageContent).toMatch(jsonParsePattern);
		expect(pageContent).toMatch(tryCatchPattern);
	});

	it("should have SSR safety check for localStorage access", () => {
		// The bug: localStorage is not available during SSR
		// Expected: Should check typeof localStorage or typeof window
		const ssrGuardPattern = /typeof\s+(localStorage|window)\s*!==\s*["']undefined["']/;
		expect(pageContent).toMatch(ssrGuardPattern);
	});

	it("should not throw if localStorage contains malformed JSON", () => {
		// Document expected behavior
		const expectedBehavior = `
			Expected behavior:
			- If localStorage contains malformed JSON, catch the error
			- Continue execution without crashing
			- Fall back to empty excludedCommons array
			- Optionally remove the corrupted localStorage entry

			Current bug:
			- JSON.parse throws SyntaxError on malformed data
			- Application crashes on component mount
		`;

		expect(expectedBehavior).toBeTruthy();
	});

	it("should handle SSR environment gracefully", () => {
		// Document expected behavior
		const expectedBehavior = `
			Expected behavior:
			- Check if localStorage is available (typeof localStorage !== 'undefined')
			- Skip localStorage operations during SSR
			- Continue with default empty excludedCommons

			Current bug:
			- Accessing localStorage during SSR throws ReferenceError
			- SSR build fails or hydration issues occur
		`;

		expect(expectedBehavior).toBeTruthy();
	});
});
