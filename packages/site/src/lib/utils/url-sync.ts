import { decodeCardIds, encodeCardIds } from "@heart-of-crown-randomizer/card-codec";

/**
 * Parse compressed IDs from a single URL parameter.
 *
 * We use the same bitfield+base64url encoding as the card selection
 * parameter (`s`), keeping all ID sets compact and consistent.
 */
export function parseCompressedIds(url: URL, param: string): Set<number> {
	const encoded = url.searchParams.get(param);
	if (encoded === null || encoded === "") return new Set();
	return new Set(decodeCardIds(encoded));
}

/**
 * Build URL with card state using compressed encoding.
 *
 * We delete both old-format (`pin`/`exclude`) and new-format (`p`/`e`/`c`)
 * params before writing, so stale bookmarks with old params get cleaned up
 * on the first state-to-URL sync.
 */
export function buildUrlWithCardState(
	baseUrl: URL,
	pinnedIds: ReadonlySet<number>,
	excludedIds: ReadonlySet<number>,
	constraintIds: ReadonlySet<number>,
): URL {
	const url = new URL(baseUrl);

	url.searchParams.delete("pin");
	url.searchParams.delete("exclude");
	url.searchParams.delete("p");
	url.searchParams.delete("e");
	url.searchParams.delete("c");

	const pEncoded = encodeCardIds([...pinnedIds]);
	const eEncoded = encodeCardIds([...excludedIds]);
	const cEncoded = encodeCardIds([...constraintIds]);

	if (pEncoded) url.searchParams.set("p", pEncoded);
	if (eEncoded) url.searchParams.set("e", eEncoded);
	if (cEncoded) url.searchParams.set("c", cEncoded);

	return url;
}

/**
 * Compare two Sets for value equality.
 *
 * We need this for URL-State sync to skip updates when the URL
 * params already match the current state, preventing circular
 * effect triggers between URL-to-State and State-to-URL effects.
 */
export function setsEqual(a: ReadonlySet<number>, b: ReadonlySet<number>): boolean {
	if (a.size !== b.size) return false;
	for (const id of a) {
		if (!b.has(id)) return false;
	}
	return true;
}
