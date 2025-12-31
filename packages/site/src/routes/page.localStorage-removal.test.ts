import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

describe("localStorage removal", () => {
	it("should not contain excludedCommons state declaration", async () => {
		const pagePath = join(__dirname, "+page.svelte");
		const content = await readFile(pagePath, "utf-8");

		// excludedCommons should not be declared as a state variable
		expect(content).not.toMatch(/let\s+excludedCommons.*=.*\$state/);
	});

	it("should not contain localStorage read effect", async () => {
		const pagePath = join(__dirname, "+page.svelte");
		const content = await readFile(pagePath, "utf-8");

		// localStorage.getItem("excludedCommons") should not exist
		expect(content).not.toContain('localStorage.getItem("excludedCommons")');
	});

	it("should not contain removeFromExcludedCommons function", async () => {
		const pagePath = join(__dirname, "+page.svelte");
		const content = await readFile(pagePath, "utf-8");

		// removeFromExcludedCommons function should not exist
		expect(content).not.toContain("function removeFromExcludedCommons");
	});

	it("should not contain clearExcludedCommons function", async () => {
		const pagePath = join(__dirname, "+page.svelte");
		const content = await readFile(pagePath, "utf-8");

		// clearExcludedCommons function should not exist
		expect(content).not.toContain("function clearExcludedCommons");
	});

	it("should not contain excluded card list UI section", async () => {
		const pagePath = join(__dirname, "+page.svelte");
		const content = await readFile(pagePath, "utf-8");

		// "除外カードリスト" heading should not exist
		expect(content).not.toContain("除外カードリスト");
	});

	it("should not reference excludedIds in drawRandomCards", async () => {
		const pagePath = join(__dirname, "+page.svelte");
		const content = await readFile(pagePath, "utf-8");

		// Extract drawRandomCards function
		const drawRandomCardsMatch = content.match(
			/function drawRandomCards\(\)[\s\S]*?(?=\n\t(?:function|\/\/|$))/,
		);

		if (drawRandomCardsMatch) {
			const drawRandomCardsBody = drawRandomCardsMatch[0];
			// excludedIds should not be used in drawRandomCards
			expect(drawRandomCardsBody).not.toContain("excludedIds");
			// excludedCommons should not be used in drawRandomCards
			expect(drawRandomCardsBody).not.toContain("excludedCommons");
		}
	});

	it("should not reference excludedIds in drawMissingCommons", async () => {
		const pagePath = join(__dirname, "+page.svelte");
		const content = await readFile(pagePath, "utf-8");

		// Extract drawMissingCommons function
		const drawMissingCommonsMatch = content.match(
			/function drawMissingCommons\(\)[\s\S]*?(?=\n\t(?:function|\/\/|$))/,
		);

		if (drawMissingCommonsMatch) {
			const drawMissingCommonsBody = drawMissingCommonsMatch[0];
			// excludedIds should not reference excludedCommons
			expect(drawMissingCommonsBody).not.toMatch(/excludedIds.*excludedCommons/);
		}
	});

	it("should not contain any localStorage.setItem for excludedCommons", async () => {
		const pagePath = join(__dirname, "+page.svelte");
		const content = await readFile(pagePath, "utf-8");

		// localStorage.setItem("excludedCommons", ...) should not exist
		expect(content).not.toMatch(/localStorage\.setItem\(['"']excludedCommons['"']/);
	});

	it("should not contain any localStorage.removeItem for excludedCommons", async () => {
		const pagePath = join(__dirname, "+page.svelte");
		const content = await readFile(pagePath, "utf-8");

		// localStorage.removeItem("excludedCommons") should not exist
		expect(content).not.toMatch(/localStorage\.removeItem\(['"']excludedCommons['"']/);
	});
});
