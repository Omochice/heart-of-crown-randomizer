/**
 * Parse card IDs from URL parameter
 *
 * We filter NaN values rather than throwing errors because invalid
 * URLs (e.g., ?pin=abc) should not crash the app, just be ignored.
 */
export function parseCardIdsFromUrl(url: URL, param: string): Set<number> {
	return new Set(
		url.searchParams
			.getAll(param)
			.map(Number)
			.filter((id) => !Number.isNaN(id)),
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
