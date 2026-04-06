import { describe, expect, it } from "vitest";
import { decodeIds } from "@heart-of-crown-randomizer/id-codec";
import { buildGitHubIssueUrl } from "./github-issue";

const GITHUB_ISSUE_BASE = "https://github.com/Omochice/heart-of-crown-randomizer/issues/new";

describe("buildGitHubIssueUrl", () => {
	it("should return a URL pointing to the GitHub issues/new endpoint", () => {
		const result = buildGitHubIssueUrl({
			origin: "https://example.com",
			selectedCardIds: [],
			pinnedIds: new Set(),
			excludedIds: new Set(),
			constraintIds: new Set(),
		});

		expect(result).toContain(GITHUB_ISSUE_BASE);
	});

	it("should include debug=true in the reproduction URL", () => {
		const result = buildGitHubIssueUrl({
			origin: "https://example.com",
			selectedCardIds: [],
			pinnedIds: new Set(),
			excludedIds: new Set(),
			constraintIds: new Set(),
		});

		const body = new URL(result).searchParams.get("body")!;
		expect(body).toContain("debug=true");
	});

	it("should encode selected card IDs into the reproduction URL", () => {
		const result = buildGitHubIssueUrl({
			origin: "https://example.com",
			selectedCardIds: [1, 5, 10],
			pinnedIds: new Set(),
			excludedIds: new Set(),
			constraintIds: new Set(),
		});

		const body = new URL(result).searchParams.get("body")!;
		const reproUrl = extractReproductionUrl(body);
		const reproParams = new URL(reproUrl).searchParams;
		expect(new Set(decodeIds(reproParams.get("s")!))).toEqual(new Set([1, 5, 10]));
	});

	it("should encode pinned, excluded, and constraint IDs", () => {
		const result = buildGitHubIssueUrl({
			origin: "https://example.com",
			selectedCardIds: [1],
			pinnedIds: new Set([1]),
			excludedIds: new Set([3, 7]),
			constraintIds: new Set([2]),
		});

		const body = new URL(result).searchParams.get("body")!;
		const reproUrl = extractReproductionUrl(body);
		const reproParams = new URL(reproUrl).searchParams;

		expect(new Set(decodeIds(reproParams.get("p")!))).toEqual(new Set([1]));
		expect(new Set(decodeIds(reproParams.get("e")!))).toEqual(new Set([3, 7]));
		expect(new Set(decodeIds(reproParams.get("c")!))).toEqual(new Set([2]));
	});

	it("should omit empty state params from the reproduction URL", () => {
		const result = buildGitHubIssueUrl({
			origin: "https://example.com",
			selectedCardIds: [1],
			pinnedIds: new Set(),
			excludedIds: new Set(),
			constraintIds: new Set(),
		});

		const body = new URL(result).searchParams.get("body")!;
		const reproUrl = extractReproductionUrl(body);
		const reproParams = new URL(reproUrl).searchParams;

		expect(reproParams.has("p")).toBe(false);
		expect(reproParams.has("e")).toBe(false);
		expect(reproParams.has("c")).toBe(false);
	});

	it("should use the provided origin in the reproduction URL", () => {
		const result = buildGitHubIssueUrl({
			origin: "https://my-app.example.com",
			selectedCardIds: [],
			pinnedIds: new Set(),
			excludedIds: new Set(),
			constraintIds: new Set(),
		});

		const body = new URL(result).searchParams.get("body")!;
		expect(body).toContain("https://my-app.example.com");
	});
});

function extractReproductionUrl(body: string): string {
	const lines = body.split("\n");
	const urlLine = lines.find((line) => line.startsWith("http"));
	if (!urlLine) throw new Error("No reproduction URL found in body");
	return urlLine;
}
