import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { cardsToQuery } from "./card-draw";

/**
 * Build a shareable URL containing only card selection (no pin/exclude).
 *
 * We intentionally omit pin/exclude from the share URL because shared
 * links represent a specific card set, not the author's editing state.
 */
export function buildShareUrl(origin: string, cards: CommonCard[]): string {
	if (cards.length === 0) return "";
	return `${origin}?${cardsToQuery(cards)}`;
}

export async function shareOrCopy(url: string): Promise<void> {
	await navigator
		.share({
			url,
			title: "ハートオブクラウンランダマイザー",
		})
		.catch(() => {
			navigator.clipboard.writeText(url);
		})
		.catch((cause) => {
			console.error("Failed to copy URL", { cause });
		});
}
