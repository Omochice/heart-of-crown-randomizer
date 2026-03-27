/**
 * Parse card IDs from URL parameter
 *
 * We filter invalid values rather than throwing errors because invalid
 * URLs (e.g., ?pin=abc, ?pin=1.5) should not crash the app, just be ignored.
 *
 * Card IDs must be non-negative integers.
 */
export function parseCardIdsFromUrl(url: URL, param: string): Set<number> {
	return new Set(
		url.searchParams
			.getAll(param)
			.map(Number)
			.filter((id) => Number.isInteger(id) && id >= 0),
	);
}

/**
 * Build URL with card state
 *
 * We delete params before appending rather than using set() because
 * URLSearchParams doesn't support setting multiple values with one
 * call, and we need to support multiple IDs per parameter.
 */
export function buildUrlWithCardState(
	baseUrl: URL,
	pinnedIds: Set<number>,
	excludedIds: Set<number>,
): URL {
	const url = new URL(baseUrl);
	url.searchParams.delete("pin");
	url.searchParams.delete("exclude");

	for (const id of pinnedIds) {
		url.searchParams.append("pin", String(id));
	}
	for (const id of excludedIds) {
		url.searchParams.append("exclude", String(id));
	}

	return url;
}

/**
 * Compare two Sets for value equality
 *
 * We need this for URL→State sync to skip updates when the URL
 * params already match the current state, preventing circular
 * effect triggers between URL→State and State→URL effects.
 */
export function setsEqual(a: Set<number>, b: Set<number>): boolean {
	if (a.size !== b.size) return false;
	for (const id of a) {
		if (!b.has(id)) return false;
	}
	return true;
}
