import { loadDefaultJapaneseParser } from "budoux";

const parser = loadDefaultJapaneseParser();

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
