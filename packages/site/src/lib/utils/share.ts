import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { encodeIds } from "@heart-of-crown-randomizer/id-codec";

/**
 * Build a shareable URL with the card selection and the constraints behind it.
 *
 * Unlike the live URL, we leave pin/exclude out: those are the author's personal
 * editing state, whereas the constraints shape the draw the recipient sees, so
 * only the constraints are worth carrying into a shared link.
 */
export function buildShareUrl(
  origin: string,
  cards: CommonCard[],
  constraintIds: ReadonlySet<number>,
): string {
  if (cards.length === 0) {
    return "";
  }
  const params = new URLSearchParams();
  params.set("s", encodeIds(cards.map((c) => c.id)));
  const encodedConstraints = encodeIds([...constraintIds]);
  if (encodedConstraints) {
    params.set("c", encodedConstraints);
  }
  return `${origin}?${params.toString()}`;
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
