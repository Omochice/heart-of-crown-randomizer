import { describe, expect, it } from "vitest";
import { selectWithConstraints } from "./select-with-constraints";
import { makeCard } from "$lib/test-helpers";
import type {
	Constraint,
	PickContext,
	SelectionContext,
} from "@heart-of-crown-randomizer/constraint";
import { link2GteLink0 } from "@heart-of-crown-randomizer/constraint";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

function makeCardWithLink(id: number, link: 0 | 1 | 2): CommonCard {
	return { ...makeCard(id), link } as CommonCard;
}

const pool = Array.from({ length: 20 }, (_, i) => makeCard(i + 1));

describe("selectWithConstraints", () => {
	it("should select cards without constraints", () => {
		const result = selectWithConstraints(pool, [], new Set(), 5);
		expect(result).toHaveLength(5);
	});

	it("should apply constraint that filters pool", () => {
		const filterConstraint: Constraint = {
			id: 901,
			label: "test",
			canApply: () => true,
			isSatisfied: () => true,
			apply: (ctx: SelectionContext) => ({
				...ctx,
				pool: ctx.pool.filter((c) => c.id <= 5),
			}),
		};

		const result = selectWithConstraints(pool, [], new Set(), 3, [filterConstraint]);
		expect(result).toHaveLength(3);
		for (const card of result) {
			expect(card.id).toBeLessThanOrEqual(5);
		}
	});

	it("should apply constraint that adds required cards", () => {
		const requireConstraint: Constraint = {
			id: 902,
			label: "test",
			canApply: () => true,
			isSatisfied: (cards) => cards.some((c) => c.id === 1),
			apply: (ctx: SelectionContext) => {
				const card1 = ctx.pool.find((c) => c.id === 1);
				if (!card1) return ctx;
				return {
					...ctx,
					pool: ctx.pool.filter((c) => c.id !== 1),
					required: [...ctx.required, card1],
				};
			},
		};

		const result = selectWithConstraints(pool, [], new Set(), 5, [requireConstraint]);
		expect(result).toHaveLength(5);
		expect(result.map((c) => c.id)).toContain(1);
	});

	it("should respect both pinned cards and constraints", () => {
		const pinned = [pool[0]]; // card id=1
		const filterConstraint: Constraint = {
			id: 901,
			label: "test",
			canApply: () => true,
			isSatisfied: () => true,
			apply: (ctx: SelectionContext) => ({
				...ctx,
				pool: ctx.pool.filter((c) => c.id <= 10),
			}),
		};

		const result = selectWithConstraints(pool, pinned, new Set(), 5, [filterConstraint]);
		expect(result).toHaveLength(5);
		expect(result.map((c) => c.id)).toContain(1);
		for (const card of result) {
			expect(card.id).toBeLessThanOrEqual(10);
		}
	});

	it("should respect excluded IDs with constraints", () => {
		const excludedIds = new Set([1, 2, 3]);
		const filterConstraint: Constraint = {
			id: 901,
			label: "test",
			canApply: () => true,
			isSatisfied: () => true,
			apply: (ctx: SelectionContext) => ({
				...ctx,
				pool: ctx.pool.filter((c) => c.id <= 10),
			}),
		};

		const result = selectWithConstraints(pool, [], excludedIds, 5, [filterConstraint]);
		expect(result).toHaveLength(5);
		for (const card of result) {
			expect(card.id).not.toBe(1);
			expect(card.id).not.toBe(2);
			expect(card.id).not.toBe(3);
			expect(card.id).toBeLessThanOrEqual(10);
		}
	});

	it("uses iterative selection when constraint has filterPoolForNextPick", () => {
		const dynamicConstraint: Constraint = {
			id: 900,
			label: "test-dynamic",
			canApply: () => true,
			isSatisfied: () => true,
			apply: (ctx: SelectionContext) => ctx,
			filterPoolForNextPick: (ctx: PickContext) => ctx.pool.filter((c) => c.id <= 5),
		};

		const testPool = Array.from({ length: 20 }, (_, i) => makeCard(i + 1));
		const result = selectWithConstraints(testPool, [], new Set(), 3, [dynamicConstraint]);

		expect(result).toHaveLength(3);
		for (const card of result) {
			expect(card.id).toBeLessThanOrEqual(5);
		}
	});

	it("backward compatibility: constraints without filterPoolForNextPick use one-shot select", () => {
		const staticConstraint: Constraint = {
			id: 901,
			label: "test-static",
			canApply: () => true,
			isSatisfied: () => true,
			apply: (ctx: SelectionContext) => ({
				...ctx,
				pool: ctx.pool.filter((c) => c.id <= 10),
			}),
		};

		const result = selectWithConstraints(pool, [], new Set(), 5, [staticConstraint]);
		expect(result).toHaveLength(5);
		for (const card of result) {
			expect(card.id).toBeLessThanOrEqual(10);
		}
	});

	it("preserves pinned cards with iterative selection", () => {
		const dynamicConstraint: Constraint = {
			id: 900,
			label: "test-dynamic",
			canApply: () => true,
			isSatisfied: () => true,
			apply: (ctx: SelectionContext) => ctx,
			filterPoolForNextPick: (ctx: PickContext) => [...ctx.pool],
		};

		const pinned = [pool[0]];
		const result = selectWithConstraints(pool, pinned, new Set(), 5, [dynamicConstraint]);
		expect(result).toHaveLength(5);
		expect(result.map((c) => c.id)).toContain(1);
	});

	it("with link2GteLink0, all link-0 cards can appear across runs", () => {
		const link0Cards = Array.from({ length: 5 }, (_, i) => makeCardWithLink(i + 1, 0));
		const link2Cards = Array.from({ length: 8 }, (_, i) => makeCardWithLink(i + 100, 2));
		const link1Cards = Array.from({ length: 3 }, (_, i) => makeCardWithLink(i + 200, 1));
		const testPool = [...link0Cards, ...link2Cards, ...link1Cards];

		const seenLink0Ids = new Set<number>();
		for (let i = 0; i < 200; i++) {
			const result = selectWithConstraints(testPool, [], new Set(), 10, [link2GteLink0]);
			for (const card of result) {
				if (!card.hasChild && card.link === 0) {
					seenLink0Ids.add(card.id);
				}
			}
		}

		for (const card of link0Cards) {
			expect(seenLink0Ids).toContain(card.id);
		}
	});

	it("with link2GteLink0, result satisfies isSatisfied", () => {
		const link0Cards = Array.from({ length: 5 }, (_, i) => makeCardWithLink(i + 1, 0));
		const link2Cards = Array.from({ length: 8 }, (_, i) => makeCardWithLink(i + 100, 2));
		const testPool = [...link0Cards, ...link2Cards];

		for (let i = 0; i < 50; i++) {
			const result = selectWithConstraints(testPool, [], new Set(), 10, [link2GteLink0]);
			expect(link2GteLink0.isSatisfied(result)).toBe(true);
		}
	});
});
