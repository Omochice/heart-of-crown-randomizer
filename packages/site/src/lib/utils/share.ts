import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { encodeIds } from "@heart-of-crown-randomizer/id-codec";

/**
 * Build a shareable URL containing only card selection (no pin/exclude).
 *
 * We intentionally omit pin/exclude from the share URL because shared
 * links represent a specific card set, not the author's editing state.
 */
export function buildShareUrl(origin: string, cards: CommonCard[]): string {
  if (cards.length === 0) {
    return "";
  }
  return `${origin}?s=${encodeIds(cards.map((c) => c.id))}`;
}

/**
 * Build the text portion for sharing (without URL).
 *
 * The URL is passed separately to navigator.share via its `url` parameter,
 * so embedding it in `text` would cause duplication on most user agents.
 */
export function buildShareText(cardNames: readonly string[]): string {
  return `ハトクラなう。今回のサプライ: ${cardNames.join(", ")} #hatokura #ハトクラ`;
}

export async function shareOrCopy(
  url: string,
  cardNames: readonly string[],
): Promise<void> {
  const text = buildShareText(cardNames);
  await navigator
    .share({
      url,
      title: "ハートオブクラウンランダマイザー",
      text,
    })
    .catch(() => {
      return navigator.clipboard.writeText(`${text} ${url}`);
    })
    .catch((cause) => {
      console.error("Failed to copy URL", { cause });
    });
}
