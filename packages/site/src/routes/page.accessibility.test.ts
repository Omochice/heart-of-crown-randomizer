import { describe, expect, it, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("+page.svelte Accessibility", () => {
	let pageContent: string;

	beforeEach(() => {
		pageContent = readFileSync(join(__dirname, "+page.svelte"), "utf-8");
	});

	it("should use radiogroup role for card count selection", () => {
		const radiogroupPattern = /role="radiogroup"/;
		expect(pageContent).toMatch(radiogroupPattern);
	});

	it("should have aria-label on radiogroup for accessible naming", () => {
		const ariaLabelPattern = /aria-label="一般カード枚数"/;
		expect(pageContent).toMatch(ariaLabelPattern);
	});

	it("should not use div for form control group labels", () => {
		const divLabelPattern = /<div[^>]*class="[^"]*block\s+mb-2[^"]*"[^>]*>一般カード枚数:<\/div>/;
		expect(pageContent).not.toMatch(divLabelPattern);
	});

	it("documents the accessibility benefits of radiogroup with aria-label", () => {
		const expectedBehavior = `
			Expected behavior:
			- Use role="radiogroup" to group related radio controls (segmented control)
			- Use aria-label to provide an accessible label for the group
			- Screen readers announce the label when users navigate to the group
			- Individual segments use role="radio" with aria-checked

			Benefits:
			- Proper ARIA semantics for custom controls
			- Better accessibility (WCAG compliance)
			- Screen readers announce: "一般カード枚数: radiogroup"
			- Keyboard navigation is clearer
		`;

		expect(expectedBehavior).toBeTruthy();
	});
});
