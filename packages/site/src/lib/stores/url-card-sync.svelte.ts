import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { decodeCardIds } from "@heart-of-crown-randomizer/card-codec";
import { setsEqual } from "$lib/utils/url-sync";

/**
 * Resolve card objects from URL "s" parameter (bitfield-encoded card IDs).
 *
 * We filter with Boolean rather than throwing on invalid IDs because
 * future card sets may produce IDs not present in the current allCommons list.
 */
export function resolveCardsFromUrl(url: URL, allCommons: CommonCard[]): CommonCard[] {
	const encoded = url.searchParams.get("s");
	if (encoded === null) return [];
	const ids = decodeCardIds(encoded);
	return ids.map((id) => allCommons.find((c) => c.id === id)).filter(Boolean) as CommonCard[];
}

/**
 * Determine whether pin/exclude state needs updating.
 *
 * We compare current vs new sets to prevent circular triggers between
 * URL-to-State and State-to-URL sync effects.
 */
export function shouldUpdatePinExclude(
	currentPinned: ReadonlySet<number>,
	currentExcluded: ReadonlySet<number>,
	newPinned: Set<number>,
	newExcluded: Set<number>,
): boolean {
	return !setsEqual(currentPinned, newPinned) || !setsEqual(currentExcluded, newExcluded);
}
