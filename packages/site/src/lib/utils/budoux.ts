// Import Parser and model directly to avoid jsdom dependency
// that loadDefaultJapaneseParser() pulls in via HTMLProcessingParser.
// This is necessary for Cloudflare Workers compatibility.
import { Parser } from "budoux/module/parser.js";
import { model } from "budoux/module/data/models/ja.js";

const parser = new Parser(model);

/**
 * Apply BudouX phrase-based segmentation to Japanese text.
 * Inserts `<wbr>` tags at phrase boundaries while preserving newlines.
 */
export function applyBudoux(text: string): string {
	return text
		.split("\n")
		.map((line) => parser.parse(line).join("<wbr>"))
		.join("\n");
}
