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

describe("select - Required Card Constraints", () => {
	it("should include all required cards in result", () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const requiredCards = [3, 7];

		const result = select(items, 5, {
			constraints: {
				require: requiredCards,
			},
		});

		expect(result).toHaveLength(5);
		// All required cards must be included
		for (const required of requiredCards) {
			expect(result).toContain(required);
		}
	});

	it("should return only required cards when required count exceeds requested count", () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const requiredCards = [1, 2, 3, 4, 5];

		const result = select(items, 3, {
			constraints: {
				require: requiredCards,
			},
		});

		// Should return all required cards even if count < required.length
		expect(result).toHaveLength(5);
		expect(result).toEqual(expect.arrayContaining(requiredCards));
	});

	it("should throw ConstraintConflictError when required cards are excluded by predicates", () => {
		type Card = { id: number; type: string };
		const cards: Card[] = [
			{ id: 1, type: "action" },
			{ id: 2, type: "attack" },
			{ id: 3, type: "defense" },
		];

		const requiredCard: Card = { id: 2, type: "attack" };

		expect(() => {
			select(cards, 3, {
				constraints: {
					exclude: [(card) => card.type === "attack"],
					require: [requiredCard],
				},
			});
		}).toThrow("Constraint conflict");
	});

	it("should combine required cards with random selection from remaining items", () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const requiredCards = [5, 10];

		const result = select(items, 5, {
			seed: 42,
			constraints: {
				require: requiredCards,
			},
		});

		expect(result).toHaveLength(5);
		// Required cards must be included
		expect(result).toContain(5);
		expect(result).toContain(10);
		// Remaining 3 cards should be from items
		for (const item of result) {
			expect(items).toContain(item);
		}
	});

	it("should use deterministic selection with seed and required cards", () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const requiredCards = [3, 7];
		const seed = 42;

		const result1 = select(items, 5, {
			seed,
			constraints: {
				require: requiredCards,
			},
		});

		const result2 = select(items, 5, {
			seed,
			constraints: {
				require: requiredCards,
			},
		});

		expect(result1).toEqual(result2);
	});

	it("should handle empty required array", () => {
		const items = [1, 2, 3, 4, 5];

		const result = select(items, 3, {
			constraints: {
				require: [],
			},
		});

		expect(result).toHaveLength(3);
	});

	it("should work with both exclusion and required constraints", () => {
		type Card = { id: number; cost: number; type: string };
		const cards: Card[] = [
			{ id: 1, cost: 2, type: "action" },
			{ id: 2, cost: 3, type: "action" },
			{ id: 3, cost: 4, type: "attack" },
			{ id: 4, cost: 5, type: "defense" },
			{ id: 5, cost: 6, type: "action" },
		];

		const requiredCard: Card = { id: 2, cost: 3, type: "action" };

		const result = select(cards, 3, {
			seed: 42,
			constraints: {
				exclude: [(card) => card.type === "attack"],
				require: [requiredCard],
			},
		});

		expect(result).toHaveLength(3);
		// Required card must be included
		expect(result).toContainEqual(requiredCard);
		// No attack cards should be included
		for (const card of result) {
			expect(card.type).not.toBe("attack");
		}
	});
});
