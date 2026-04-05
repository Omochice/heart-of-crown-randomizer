import { describe, it, expect, beforeEach } from "vitest";
import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { SelectionContext } from "@heart-of-crown-randomizer/constraint";
import {
	setPinnedCardIds,
	setExcludedCardIds,
	getPinnedCards,
} from "$lib/stores/card-state.svelte";
import {
	getEnabledConstraintIds,
	toggleConstraint,
	getEnabledConstraints,
} from "$lib/stores/constraint-state.svelte";
import { buildCardUrl, drawRandomCards } from "$lib/utils/card-draw";
import { buildShareUrl } from "$lib/utils/share";
import {
	noAttack,
	link2GteLink0,
	highCostGte2,
	link2Gte3,
	eachCost2to5,
} from "@heart-of-crown-randomizer/constraint";

const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
const allConstraints = [noAttack, link2GteLink0, highCostGte2, link2Gte3, eachCost2to5] as const;

function applyConstraints(
	context: SelectionContext,
	constraints: readonly {
		canApply(ctx: SelectionContext): boolean;
		apply(ctx: SelectionContext): SelectionContext;
	}[],
): SelectionContext {
	let result = context;
	for (const constraint of constraints) {
		if (constraint.canApply(result)) {
			result = constraint.apply(result);
		}
	}
	return result;
}

function resetState() {
	setPinnedCardIds(new Set());
	setExcludedCardIds(new Set());
	for (const c of allConstraints) {
		if (getEnabledConstraintIds().has(c.id)) {
			toggleConstraint(c.id);
		}
	}
}

describe("Debug Mode E2E: debug param preservation", () => {
	beforeEach(resetState);

	it("should preserve debug=true in buildCardUrl when searchParams contains it", () => {
		const result = drawRandomCards(allCommons, 10, [], new Set());
		if (!result.ok) throw new Error("draw failed");

		const searchParams = new URLSearchParams("debug=true");
		const url = buildCardUrl(result.cards, new Set(), new Set(), searchParams);

		const params = new URLSearchParams(url.slice(1));
		expect(params.get("debug")).toBe("true");
	});

	it("should not include debug param in share URL even when debug mode is active", () => {
		const result = drawRandomCards(allCommons, 10, [], new Set());
		if (!result.ok) throw new Error("draw failed");

		const shareUrl = buildShareUrl("http://localhost", result.cards);

		const url = new URL(shareUrl);
		expect(url.searchParams.get("debug")).toBeNull();
	});

	it("should preserve debug=true alongside pin and exclude params", () => {
		const pinnedIds = new Set([allCommons[0].id]);
		const excludedIds = new Set([allCommons[10].id]);
		const searchParams = new URLSearchParams("debug=true");

		const result = drawRandomCards(allCommons, 10, getPinnedCards(allCommons), excludedIds);
		if (!result.ok) throw new Error("draw failed");

		const url = buildCardUrl(result.cards, pinnedIds, excludedIds, searchParams);
		const params = new URLSearchParams(url.slice(1));

		expect(params.get("debug")).toBe("true");
		expect(params.getAll("pin")).toContain(String(allCommons[0].id));
		expect(params.getAll("exclude")).toContain(String(allCommons[10].id));
		expect(params.get("s")).not.toBeNull();
	});
});

describe("Debug Mode E2E: drawable pool with constraints", () => {
	beforeEach(resetState);

	it("should compute drawable pool that excludes pinned and excluded cards", () => {
		const pinnedCards = allCommons.slice(0, 2);
		const pinnedIds = new Set(pinnedCards.map((c) => c.id));
		const excludedIds = new Set([allCommons[5].id, allCommons[6].id]);

		const pool = allCommons.filter((card) => !excludedIds.has(card.id) && !pinnedIds.has(card.id));

		for (const card of pinnedCards) {
			expect(pool.find((c) => c.id === card.id)).toBeUndefined();
		}
		for (const id of excludedIds) {
			expect(pool.find((c) => c.id === id)).toBeUndefined();
		}
		expect(pool.length).toBe(allCommons.length - pinnedCards.length - excludedIds.size);
	});

	it("should reflect constraint filtering in drawable pool", () => {
		toggleConstraint(noAttack.id);

		const enabledConstraints = getEnabledConstraints(allConstraints);
		expect(enabledConstraints).toHaveLength(1);

		const context = applyConstraints(
			{ pool: [...allCommons], required: [], count: 10, rng: () => 0.5 },
			enabledConstraints,
		);

		expect(context.pool.length).toBeLessThan(allCommons.length);
		expect(noAttack.isSatisfied(context.pool)).toBe(true);
	});

	it("should combine pin, exclude, and constraint filtering correctly", () => {
		const pinnedCards = allCommons.slice(0, 2);
		const pinnedIds = new Set(pinnedCards.map((c) => c.id));
		const excludedIds = new Set([allCommons[5].id]);

		toggleConstraint(noAttack.id);
		const enabledConstraints = getEnabledConstraints(allConstraints);

		const filteredPool = allCommons.filter(
			(card) => !excludedIds.has(card.id) && !pinnedIds.has(card.id),
		);

		const context = applyConstraints(
			{ pool: filteredPool, required: [...pinnedCards], count: 10, rng: () => 0.5 },
			enabledConstraints,
		);

		for (const id of excludedIds) {
			expect(context.pool.find((c) => c.id === id)).toBeUndefined();
		}
		for (const card of pinnedCards) {
			expect(context.pool.find((c) => c.id === card.id)).toBeUndefined();
		}
		expect(noAttack.isSatisfied(context.pool)).toBe(true);
	});
});
