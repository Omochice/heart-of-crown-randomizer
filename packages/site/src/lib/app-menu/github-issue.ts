import { encodeIds } from "@heart-of-crown-randomizer/id-codec";
import { buildUrlWithCardState } from "$lib/utils/url-sync";

const GITHUB_ISSUE_URL = "https://github.com/Omochice/heart-of-crown-randomizer/issues/new";

export type BugReportState = {
	origin: string;
	selectedCardIds: readonly number[];
	pinnedIds: ReadonlySet<number>;
	excludedIds: ReadonlySet<number>;
	constraintIds: ReadonlySet<number>;
};

/**
 * Build a GitHub issue URL pre-filled with a reproduction link.
 *
 * The reproduction URL includes all state params (s, p, e, c) and
 * debug=true so developers can reproduce the exact application state.
 */
export function buildGitHubIssueUrl(state: BugReportState): string {
	const reproUrl = buildReproductionUrl(state);
	const body = `## Reproduction URL\n${reproUrl}\n\n## Description\n<!-- Please describe the bug -->\n\n## Expected Behavior\n<!-- What did you expect? -->\n\n## Actual Behavior\n<!-- What actually happened? -->`;

	const url = new URL(GITHUB_ISSUE_URL);
	url.searchParams.set("body", body);
	return url.toString();
}

function buildReproductionUrl(state: BugReportState): string {
	const baseUrl = new URL(state.origin);

	const s = encodeIds([...state.selectedCardIds]);
	if (s) baseUrl.searchParams.set("s", s);

	const url = buildUrlWithCardState(
		baseUrl,
		state.pinnedIds,
		state.excludedIds,
		state.constraintIds,
	);
	url.searchParams.set("debug", "true");

	return url.toString();
}
