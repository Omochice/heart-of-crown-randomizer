import { describe, expect, it } from "vitest";
import { select } from "./select";

describe("select - Edge Cases", () => {
	it("should return empty array when selecting from empty array", () => {
		const result = select([], 5);
		expect(result).toEqual([]);
	});

	it("should return empty array when count is 0", () => {
		const items = [1, 2, 3, 4, 5];
		const result = select(items, 0);
		expect(result).toEqual([]);
	});

	it("should return all available items when count exceeds array length", () => {
		const items = [1, 2, 3];
		const result = select(items, 10);
		expect(result).toHaveLength(3);
		expect(result).toEqual(expect.arrayContaining(items));
	});

	it("should not mutate input array", () => {
		const items = [1, 2, 3, 4, 5];
		const original = [...items];
		select(items, 3);
		expect(items).toEqual(original);
	});

	it("should select exact count when count is less than array length", () => {
		const items = [1, 2, 3, 4, 5];
		const result = select(items, 3);
		expect(result).toHaveLength(3);
	});

	it("should select all items when count equals array length", () => {
		const items = [1, 2, 3, 4, 5];
		const result = select(items, 5);
		expect(result).toHaveLength(5);
		expect(result).toEqual(expect.arrayContaining(items));
	});
});

describe("select - Exclusion Constraints", () => {
	it("should exclude items matching single exclude predicate", () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		// Exclude even numbers
		const result = select(items, 5, {
			constraints: {
				exclude: [(item) => item % 2 === 0],
			},
		});

		expect(result).toHaveLength(5);
		// All selected items should be odd
		for (const item of result) {
			expect(item % 2).toBe(1);
		}
	});

	it("should exclude items matching multiple exclude predicates (OR logic)", () => {
		type Card = { id: number; cost: number; type: string };
		const cards: Card[] = [
			{ id: 1, cost: 2, type: "action" },
			{ id: 2, cost: 3, type: "attack" },
			{ id: 3, cost: 4, type: "action" },
			{ id: 4, cost: 5, type: "defense" },
			{ id: 5, cost: 6, type: "attack" },
			{ id: 6, cost: 2, type: "action" },
		];

		// Exclude attack cards OR cards with cost > 4
		const result = select(cards, 3, {
			constraints: {
				exclude: [(card) => card.type === "attack", (card) => card.cost > 4],
			},
		});

		expect(result).toHaveLength(3);
		// None should be attack cards or have cost > 4
		for (const card of result) {
			expect(card.type).not.toBe("attack");
			expect(card.cost).toBeLessThanOrEqual(4);
		}
	});

	it("should return empty array when all items are excluded", () => {
		const items = [2, 4, 6, 8, 10];
		// Exclude all even numbers
		const result = select(items, 5, {
			constraints: {
				exclude: [(item) => item % 2 === 0],
			},
		});

		expect(result).toEqual([]);
	});

	it("should handle empty exclude predicates array", () => {
		const items = [1, 2, 3, 4, 5];
		const result = select(items, 3, {
			constraints: {
				exclude: [],
			},
		});

		expect(result).toHaveLength(3);
		// All selected items should be from original array
		for (const item of result) {
			expect(items).toContain(item);
		}
	});

	it("should use deterministic selection with seed and exclusion", () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const seed = 42;

		const result1 = select(items, 3, {
			seed,
			constraints: {
				exclude: [(item) => item % 2 === 0],
			},
		});

		const result2 = select(items, 3, {
			seed,
			constraints: {
				exclude: [(item) => item % 2 === 0],
			},
		});

		expect(result1).toEqual(result2);
	});
});
