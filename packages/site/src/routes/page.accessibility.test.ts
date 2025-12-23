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

	it("should use fieldset for radio button group", () => {
		// The bug: Using <div> for radio button group container
		// Expected: Should use <fieldset> for semantic grouping
		const fieldsetPattern = /<fieldset[^>]*class="[^"]*mb-6[^"]*"[^>]*>/;
		expect(pageContent).toMatch(fieldsetPattern);
	});

	it("should use legend for radio button group label", () => {
		// The bug: Using <div> for the label "一般カード枚数:"
		// Expected: Should use <legend> for accessible group label
		const legendPattern = /<legend[^>]*>一般カード枚数:<\/legend>/;
		expect(pageContent).toMatch(legendPattern);
	});

	it("should not use div for form control group labels", () => {
		// The bug: <div class="block mb-2">一般カード枚数:</div>
		// Expected: Should not use div for radio group labels
		const divLabelPattern = /<div[^>]*class="[^"]*block\s+mb-2[^"]*"[^>]*>一般カード枚数:<\/div>/;
		expect(pageContent).not.toMatch(divLabelPattern);
	});

	it("documents the accessibility benefits of fieldset/legend", () => {
		const expectedBehavior = `
			Expected behavior:
			- Use <fieldset> to group related form controls (radio buttons)
			- Use <legend> to provide an accessible label for the group
			- Screen readers announce the legend when users navigate to the group
			- Provides proper semantic structure for assistive technologies

			Current bug:
			- Using <div> loses semantic meaning
			- Screen readers may not properly associate label with controls
			- Reduced accessibility for keyboard and screen reader users

			Benefits of fieldset/legend:
			- Proper semantic HTML5 structure
			- Better accessibility (WCAG compliance)
			- Screen readers announce: "一般カード枚数: fieldset"
			- Keyboard navigation is clearer
		`;

		expect(expectedBehavior).toBeTruthy();
	});
});
