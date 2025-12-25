import { fc, test } from "@fast-check/vitest";
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

describe("select - Integration Tests", () => {
	it("should handle complex scenario with seed, exclusion, and required constraints", () => {
		type Card = { id: number; cost: number; type: string; rarity: string };
		const cards: Card[] = [
			{ id: 1, cost: 2, type: "action", rarity: "common" },
			{ id: 2, cost: 3, type: "attack", rarity: "common" },
			{ id: 3, cost: 4, type: "action", rarity: "rare" },
			{ id: 4, cost: 5, type: "defense", rarity: "common" },
			{ id: 5, cost: 6, type: "action", rarity: "rare" },
			{ id: 6, cost: 3, type: "action", rarity: "common" },
			{ id: 7, cost: 7, type: "attack", rarity: "rare" },
			{ id: 8, cost: 2, type: "defense", rarity: "common" },
		];

		const requiredCards: Card[] = [
			{ id: 1, cost: 2, type: "action", rarity: "common" },
			{ id: 6, cost: 3, type: "action", rarity: "common" },
		];

		const result = select(cards, 5, {
			seed: 42,
			constraints: {
				exclude: [
					(card) => card.type === "attack",
					(card) => card.cost > 5,
				],
				require: requiredCards,
			},
		});

		expect(result).toHaveLength(5);
		// All required cards must be included
		for (const required of requiredCards) {
			expect(result).toContainEqual(required);
		}
		// No attack cards or high-cost cards should be included
		for (const card of result) {
			expect(card.type).not.toBe("attack");
			expect(card.cost).toBeLessThanOrEqual(5);
		}
		// All selected cards should be from original array
		for (const card of result) {
			expect(cards).toContainEqual(card);
		}
	});

	it("should produce same result with same seed in complex scenario", () => {
		type Card = { id: number; cost: number; type: string };
		const cards: Card[] = [
			{ id: 1, cost: 2, type: "action" },
			{ id: 2, cost: 3, type: "attack" },
			{ id: 3, cost: 4, type: "action" },
			{ id: 4, cost: 5, type: "defense" },
			{ id: 5, cost: 6, type: "action" },
			{ id: 6, cost: 3, type: "action" },
			{ id: 7, cost: 7, type: "attack" },
			{ id: 8, cost: 2, type: "defense" },
		];

		const requiredCard: Card = { id: 1, cost: 2, type: "action" };
		const seed = 12345;

		const result1 = select(cards, 5, {
			seed,
			constraints: {
				exclude: [(card) => card.type === "attack"],
				require: [requiredCard],
			},
		});

		const result2 = select(cards, 5, {
			seed,
			constraints: {
				exclude: [(card) => card.type === "attack"],
				require: [requiredCard],
			},
		});

		expect(result1).toEqual(result2);
	});

	it("should produce different results with different seeds", () => {
		const items = Array.from({ length: 20 }, (_, i) => i + 1);
		const requiredItems = [1, 2];

		const result1 = select(items, 10, {
			seed: 100,
			constraints: {
				exclude: [(item) => item % 3 === 0],
				require: requiredItems,
			},
		});

		const result2 = select(items, 10, {
			seed: 200,
			constraints: {
				exclude: [(item) => item % 3 === 0],
				require: requiredItems,
			},
		});

		// Both should have same required items
		expect(result1).toContain(1);
		expect(result1).toContain(2);
		expect(result2).toContain(1);
		expect(result2).toContain(2);

		// But different overall results (very high probability)
		expect(result1).not.toEqual(result2);
	});

	it("should throw error for invalid seed (NaN)", () => {
		const items = [1, 2, 3, 4, 5];

		expect(() => {
			select(items, 3, {
				seed: Number.NaN,
			});
		}).toThrow("Invalid seed");
	});

	it("should throw error for invalid seed (Infinity)", () => {
		const items = [1, 2, 3, 4, 5];

		expect(() => {
			select(items, 3, {
				seed: Number.POSITIVE_INFINITY,
			});
		}).toThrow("Invalid seed");
	});

	it("should throw error for invalid seed (-Infinity)", () => {
		const items = [1, 2, 3, 4, 5];

		expect(() => {
			select(items, 3, {
				seed: Number.NEGATIVE_INFINITY,
			});
		}).toThrow("Invalid seed");
	});

	it("should throw error for invalid seed with constraints", () => {
		const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

		expect(() => {
			select(items, 5, {
				seed: Number.NaN,
				constraints: {
					exclude: [(item) => item % 2 === 0],
					require: [1],
				},
			});
		}).toThrow("Invalid seed");
	});
});

describe("select - Property-Based Tests", () => {
	test.prop([fc.array(fc.integer()), fc.nat()])(
		"selected array length should be less than or equal to requested count",
		(items, count) => {
			const result = select(items, count);
			expect(result.length).toBeLessThanOrEqual(count);
		},
	);

	test.prop([fc.array(fc.integer()), fc.nat()])(
		"selected array length should be less than or equal to available items",
		(items, count) => {
			const result = select(items, count);
			expect(result.length).toBeLessThanOrEqual(items.length);
		},
	);

	test.prop([
		fc.array(fc.integer()),
		fc.nat(),
		fc.array(fc.integer()),
	])(
		"all required items should be included in result",
		(items, count, requiredItems) => {
			// Filter required items to only include those that exist in items
			const validRequired = requiredItems.filter((req) => items.includes(req));

			if (validRequired.length === 0) {
				return; // Skip test if no valid required items
			}

			const result = select(items, count, {
				constraints: {
					require: validRequired,
				},
			});

			// All valid required items should be in result
			for (const required of validRequired) {
				expect(result).toContain(required);
			}
		},
	);

	test.prop([
		fc.array(fc.integer({ min: 1, max: 100 })),
		fc.nat({ max: 50 }),
	])(
		"no excluded items should be in result when using exclude predicates",
		(items, count) => {
			// Exclude all even numbers
			const excludePredicate = (item: number) => item % 2 === 0;

			const result = select(items, count, {
				constraints: {
					exclude: [excludePredicate],
				},
			});

			// All items in result should be odd (not excluded)
			for (const item of result) {
				expect(item % 2).toBe(1);
			}
		},
	);

	test.prop([
		fc.array(fc.integer()),
		fc.nat(),
		fc.integer(),
	])(
		"same seed should produce same result (deterministic invariant)",
		(items, count, seed) => {
			const result1 = select(items, count, { seed });
			const result2 = select(items, count, { seed });
			expect(result1).toEqual(result2);
		},
	);

	test.prop([fc.array(fc.integer()), fc.nat()])(
		"should not mutate input array (immutability invariant)",
		(items, count) => {
			const original = [...items];
			select(items, count);
			expect(items).toEqual(original);
		},
	);

	test.prop([
		fc.array(fc.integer({ min: 1, max: 100 })),
		fc.integer({ min: 1, max: 50 }), // Ensure count >= 1
		fc.array(fc.integer({ min: 1, max: 100 })),
	])(
		"result should respect both exclusion and required constraints",
		(items, count, requiredItems) => {
			// Filter required items to only include odd numbers that exist in items
			const validRequired = requiredItems.filter(
				(req) => items.includes(req) && req % 2 === 1,
			);

			// Skip test if no valid required items or count <= validRequired.length
			if (validRequired.length === 0 || count <= validRequired.length) {
				return;
			}

			// Exclude all even numbers
			const excludePredicate = (item: number) => item % 2 === 0;

			const result = select(items, count, {
				constraints: {
					exclude: [excludePredicate],
					require: validRequired,
				},
			});

			// All required items should be included
			for (const required of validRequired) {
				expect(result).toContain(required);
			}

			// No even numbers should be included
			for (const item of result) {
				expect(item % 2).toBe(1);
			}
		},
	);

	test.prop([fc.array(fc.integer()), fc.nat()])(
		"all selected items should be from original array",
		(items, count) => {
			const result = select(items, count);

			// All items in result should exist in original array
			for (const item of result) {
				expect(items).toContain(item);
			}
		},
	);
});
