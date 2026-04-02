import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { setsEqual } from "$lib/utils/url-sync";

/**
 * Resolve card objects from URL "card" parameters.
 *
 * We filter with Boolean rather than throwing on invalid IDs because
 * users might bookmark or manually edit URLs containing stale card IDs.
 */
export function resolveCardsFromUrl(url: URL, allCommons: CommonCard[]): CommonCard[] {
	return url.searchParams
		.getAll("card")
		.map((id) => allCommons.find((c) => c.id === Number.parseInt(id)))
		.filter(Boolean) as CommonCard[];
}

/**
 * Determine whether pin/exclude state needs updating.
 *
 * We compare current vs new sets to prevent circular triggers between
 * URL-to-State and State-to-URL sync effects.
 */
export function shouldUpdatePinExclude(
	currentPinned: Set<number>,
	currentExcluded: Set<number>,
	newPinned: Set<number>,
	newExcluded: Set<number>,
): boolean {
	return !setsEqual(currentPinned, newPinned) || !setsEqual(currentExcluded, newExcluded);
}
