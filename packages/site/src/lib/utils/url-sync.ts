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
