import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

export function cardsToQuery(cards: CommonCard[]): string {
  return cards
    .reduce((query, card) => {
      query.append("card", card.id.toString());
      return query;
    }, new URLSearchParams())
    .toString();
}

export function generateShareUrl(cards: CommonCard[], origin: string): string {
  if (cards.length === 0) {
    return "";
  }
  return `${origin}?${cardsToQuery(cards)}`;
}

export async function copyToClipboard(url: string, title: string): Promise<void> {
  try {
    await navigator.share({
      url,
      title,
    });
  } catch {
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error("Failed to copy URL", { cause: error });
      throw error;
    }
  }
}