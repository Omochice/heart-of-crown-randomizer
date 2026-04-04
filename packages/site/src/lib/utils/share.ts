import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { encodeCardIds } from "@heart-of-crown-randomizer/card-codec";

/**
 * Build a shareable URL containing only card selection (no pin/exclude).
 *
 * We intentionally omit pin/exclude from the share URL because shared
 * links represent a specific card set, not the author's editing state.
 */
export function buildShareUrl(origin: string, cards: CommonCard[]): string {
	if (cards.length === 0) return "";
	return `${origin}?s=${encodeCardIds(cards.map((c) => c.id))}`;
}

/**
 * Build the text for sharing, including card names and the URL.
 */
export function buildShareText(cardNames: readonly string[], url: string): string {
	return `ハトクラなう。今回のサプライ: ${cardNames.join(", ")} ${url}`;
}

export async function shareOrCopy(url: string): Promise<void> {
	await navigator
		.share({
			url,
			title: "ハートオブクラウンランダマイザー",
		})
		.catch(() => {
			return navigator.clipboard.writeText(url);
		})
		.catch((cause) => {
			console.error("Failed to copy URL", { cause });
		});
}
