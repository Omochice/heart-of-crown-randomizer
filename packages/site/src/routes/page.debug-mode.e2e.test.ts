import { describe, it, expect, beforeEach } from "vitest";
import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { Constraint, SelectionContext } from "@heart-of-crown-randomizer/constraint";
import {
	setPinnedCardIds,
	setExcludedCardIds,
	getPinnedCardIds,
	getExcludedCardIds,
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

describe("Debug Mode E2E: debug param preservation", () => {
	beforeEach(() => {
		setPinnedCardIds(new Set());
		setExcludedCardIds(new Set());
		for (const c of allConstraints) {
			if (getEnabledConstraintIds().has(c.id)) {
				toggleConstraint(c.id);
			}
		}
	});

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
	beforeEach(() => {
		setPinnedCardIds(new Set());
		setExcludedCardIds(new Set());
		for (const c of allConstraints) {
			if (getEnabledConstraintIds().has(c.id)) {
				toggleConstraint(c.id);
			}
		}
	});

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
		toggleConstraint("no-attack");

		const enabledConstraints = getEnabledConstraints(allConstraints);
		expect(enabledConstraints).toHaveLength(1);

		const pool = allCommons.filter((card) => !new Set<number>().has(card.id));
		let context: SelectionContext = {
			pool,
			required: [],
			count: 10,
			rng: () => 0.5,
		};

		for (const constraint of enabledConstraints) {
			if (constraint.canApply(context)) {
				context = constraint.apply(context);
			}
		}

		const attackCards = allCommons.filter((c) => "mainType" in c && c.mainType.includes("attack"));
		for (const attackCard of attackCards) {
			expect(context.pool.find((c) => c.id === attackCard.id)).toBeUndefined();
		}
	});

	it("should combine pin, exclude, and constraint filtering correctly", () => {
		const pinnedCards = allCommons.slice(0, 2);
		const pinnedIds = new Set(pinnedCards.map((c) => c.id));
		const excludedIds = new Set([allCommons[5].id]);

		toggleConstraint("no-attack");
		const enabledConstraints = getEnabledConstraints(allConstraints);

		const filteredPool = allCommons.filter(
			(card) => !excludedIds.has(card.id) && !pinnedIds.has(card.id),
		);

		let context: SelectionContext = {
			pool: filteredPool,
			required: [...pinnedCards],
			count: 10,
			rng: () => 0.5,
		};

		for (const constraint of enabledConstraints) {
			if (constraint.canApply(context)) {
				context = constraint.apply(context);
			}
		}

		for (const id of excludedIds) {
			expect(context.pool.find((c) => c.id === id)).toBeUndefined();
		}
		for (const card of pinnedCards) {
			expect(context.pool.find((c) => c.id === card.id)).toBeUndefined();
		}

		const attackCards = allCommons.filter((c) => "mainType" in c && c.mainType.includes("attack"));
		for (const attackCard of attackCards) {
			expect(context.pool.find((c) => c.id === attackCard.id)).toBeUndefined();
		}
	});
});
