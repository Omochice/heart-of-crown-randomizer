import { describe, expect, it } from "vitest";
import { selectWithConstraints } from "./select-with-constraints";
import { makeCard } from "$lib/test-helpers";
import type { Constraint, SelectionContext } from "@heart-of-crown-randomizer/constraint";

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
});
