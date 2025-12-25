import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";
import { filter, filterByIds, select, shuffle } from "./index";

describe("Edge Cases - Duplicate Elements", () => {
	describe("shuffle with duplicates", () => {
		it("should preserve duplicate elements when shuffling", () => {
			const items = [1, 1, 2, 2, 3, 3, 4, 4];
			const shuffled = shuffle(items, 42);

			// Length should be same
			expect(shuffled).toHaveLength(items.length);

			// Create frequency map to verify duplicates are preserved
			const countMap = (arr: number[]) => {
				const map = new Map<number, number>();
				for (const item of arr) {
					map.set(item, (map.get(item) || 0) + 1);
				}
				return map;
			};

			expect(countMap(shuffled)).toEqual(countMap(items));
		});

		it("should shuffle array with all identical elements", () => {
			const items = [5, 5, 5, 5, 5];
			const shuffled = shuffle(items, 42);

			expect(shuffled).toHaveLength(5);
			expect(shuffled).toEqual([5, 5, 5, 5, 5]);
		});

		it("should handle array with mostly duplicates", () => {
			const items = [1, 1, 1, 1, 1, 2, 3];
			const shuffled = shuffle(items, 42);

			expect(shuffled).toHaveLength(7);
			expect(shuffled.filter((x) => x === 1)).toHaveLength(5);
			expect(shuffled.filter((x) => x === 2)).toHaveLength(1);
			expect(shuffled.filter((x) => x === 3)).toHaveLength(1);
		});
	});

	describe("select with duplicates", () => {
		it("should select from array with duplicate elements", () => {
			const items = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
			const result = select(items, 5, { seed: 42 });

			expect(result).toHaveLength(5);
			// All selected items should be from original array
			for (const item of result) {
				expect(items).toContain(item);
			}
		});

		it("should handle required cards with duplicates", () => {
			const items = [1, 1, 2, 2, 3, 3, 4, 4];
			const requiredCards = [1, 1]; // Duplicate required cards

			const result = select(items, 5, {
				seed: 42,
				constraints: {
					require: requiredCards,
				},
			});

			expect(result).toHaveLength(5);
			// Both duplicate required cards should be included
			const countOnes = result.filter((x) => x === 1).length;
			expect(countOnes).toBeGreaterThanOrEqual(2);
		});

		it("should filter duplicates correctly with exclusion", () => {
			const items = [1, 1, 2, 2, 3, 3, 4, 4];
			const result = select(items, 4, {
				seed: 42,
				constraints: {
					exclude: [(item) => item % 2 === 0], // Exclude even numbers
				},
			});

			// Only odd numbers (1, 1, 3, 3) should be available
			expect(result).toHaveLength(4);
			for (const item of result) {
				expect(item % 2).toBe(1);
			}
		});
	});

	describe("filter with duplicates", () => {
		it("should preserve duplicates when filtering", () => {
			const items = [1, 1, 2, 2, 3, 3, 4, 4];
			const result = filter(items, (item) => item % 2 === 1);

			expect(result).toEqual([1, 1, 3, 3]);
		});

		it("should filter array with all duplicates", () => {
			const items = [5, 5, 5, 5, 5];
			const result = filter(items, (item) => item === 5);

			expect(result).toEqual([5, 5, 5, 5, 5]);
		});
	});

	describe("filterByIds with duplicates", () => {
		it("should handle duplicate IDs in items", () => {
			type Item = { id: number; name: string };
			const items: Item[] = [
				{ id: 1, name: "a" },
				{ id: 1, name: "b" },
				{ id: 2, name: "c" },
				{ id: 2, name: "d" },
			];

			const result = filterByIds(items, [1]);

			// Should exclude all items with id: 1
			expect(result).toEqual([
				{ id: 2, name: "c" },
				{ id: 2, name: "d" },
			]);
		});

		it("should handle duplicate IDs in exclusion list", () => {
			type Item = { id: number; name: string };
			const items: Item[] = [
				{ id: 1, name: "a" },
				{ id: 2, name: "b" },
				{ id: 3, name: "c" },
			];

			const result = filterByIds(items, [1, 1, 1]); // Duplicate exclusions

			expect(result).toEqual([
				{ id: 2, name: "b" },
				{ id: 3, name: "c" },
			]);
		});
	});

	test.prop([fc.array(fc.integer(), { minLength: 1 })])(
		"shuffle should preserve element frequency (duplicates property)",
		(items) => {
			const shuffled = shuffle(items, 42);

			const countMap = (arr: number[]) => {
				const map = new Map<number, number>();
				for (const item of arr) {
					map.set(item, (map.get(item) || 0) + 1);
				}
				return map;
			};

			expect(countMap(shuffled)).toEqual(countMap(items));
		},
	);
});

describe("Edge Cases - Large Arrays", () => {
	describe("shuffle with large arrays", () => {
		it("should shuffle 1000 element array correctly", () => {
			const items = Array.from({ length: 1000 }, (_, i) => i);
			const shuffled = shuffle(items, 42);

			expect(shuffled).toHaveLength(1000);
			// All elements should be present
			const sorted = [...shuffled].sort((a, b) => a - b);
			expect(sorted).toEqual(items);
		});

		it("should shuffle 1000 element array within reasonable time", () => {
			const items = Array.from({ length: 1000 }, (_, i) => i);
			const start = performance.now();
			shuffle(items);
			const duration = performance.now() - start;

			// Should complete within 100ms (requirement 9.1)
			expect(duration).toBeLessThan(100);
		});

		it("should be deterministic with large arrays", () => {
			const items = Array.from({ length: 1000 }, (_, i) => i);
			const result1 = shuffle(items, 12345);
			const result2 = shuffle(items, 12345);

			expect(result1).toEqual(result2);
		});

		it("should shuffle 10000 element array efficiently", () => {
			const items = Array.from({ length: 10000 }, (_, i) => i);
			const start = performance.now();
			const shuffled = shuffle(items, 42);
			const duration = performance.now() - start;

			expect(shuffled).toHaveLength(10000);
			// Should be O(n), roughly proportional to array size
			// 10x larger array should take less than 10x time
			expect(duration).toBeLessThan(1000);
		});
	});

	describe("select with large arrays", () => {
		it("should select from 1000 element array correctly", () => {
			const items = Array.from({ length: 1000 }, (_, i) => i);
			const result = select(items, 100, { seed: 42 });

			expect(result).toHaveLength(100);
			// All selected items should be from original array
			for (const item of result) {
				expect(items).toContain(item);
			}
		});

		it("should select from 1000 element array with exclusion", () => {
			const items = Array.from({ length: 1000 }, (_, i) => i);
			const result = select(items, 100, {
				seed: 42,
				constraints: {
					exclude: [(item) => item % 2 === 0], // Exclude even numbers
				},
			});

			expect(result).toHaveLength(100);
			// All should be odd
			for (const item of result) {
				expect(item % 2).toBe(1);
			}
		});

		it("should select with large required array", () => {
			const items = Array.from({ length: 1000 }, (_, i) => i);
			const requiredItems = Array.from({ length: 50 }, (_, i) => i * 10);

			const result = select(items, 200, {
				seed: 42,
				constraints: {
					require: requiredItems,
				},
			});

			expect(result).toHaveLength(200);
			// All required items should be included
			for (const required of requiredItems) {
				expect(result).toContain(required);
			}
		});

		it("should handle large array with complex constraints efficiently", () => {
			const items = Array.from({ length: 1000 }, (_, i) => i);
			// Use odd required items to avoid conflict with even exclusion
			const requiredItems = [101, 201, 301];

			const start = performance.now();
			const result = select(items, 100, {
				seed: 42,
				constraints: {
					exclude: [
						(item) => item % 2 === 0, // Exclude even
						(item) => item > 800, // Exclude large numbers
					],
					require: requiredItems,
				},
			});
			const duration = performance.now() - start;

			expect(result.length).toBeGreaterThan(0);
			// Should complete reasonably fast
			expect(duration).toBeLessThan(100);
		});
	});

	describe("filter with large arrays", () => {
		it("should filter 1000 element array efficiently", () => {
			const items = Array.from({ length: 1000 }, (_, i) => i);

			const start = performance.now();
			const result = filter(items, (item) => item % 2 === 0);
			const duration = performance.now() - start;

			expect(result).toHaveLength(500);
			expect(duration).toBeLessThan(50);
		});

		it("should filterByIds with large exclusion list", () => {
			type Item = { id: number };
			const items: Item[] = Array.from({ length: 1000 }, (_, i) => ({
				id: i,
			}));
			const excludedIds = Array.from({ length: 500 }, (_, i) => i * 2); // Even IDs

			const start = performance.now();
			const result = filterByIds(items, excludedIds);
			const duration = performance.now() - start;

			expect(result).toHaveLength(500);
			expect(duration).toBeLessThan(100);
		});
	});
});

describe("Edge Cases - Complex Constraint Combinations", () => {
	describe("multiple exclusion predicates", () => {
		it("should handle 5 exclusion predicates with OR logic", () => {
			type Card = {
				id: number;
				cost: number;
				type: string;
				rarity: string;
				element: string;
			};

			const cards: Card[] = Array.from({ length: 100 }, (_, i) => ({
				id: i,
				cost: (i % 10) + 1,
				type: ["action", "attack", "defense", "support"][i % 4],
				rarity: ["common", "rare", "epic"][i % 3],
				element: ["fire", "water", "earth", "air"][i % 4],
			}));

			const result = select(cards, 20, {
				seed: 42,
				constraints: {
					exclude: [
						(card) => card.type === "attack",
						(card) => card.cost > 7,
						(card) => card.rarity === "epic",
						(card) => card.element === "fire",
						(card) => card.id % 10 === 0,
					],
				},
			});

			// Verify none of the exclusion criteria are met
			for (const card of result) {
				expect(card.type).not.toBe("attack");
				expect(card.cost).toBeLessThanOrEqual(7);
				expect(card.rarity).not.toBe("epic");
				expect(card.element).not.toBe("fire");
				expect(card.id % 10).not.toBe(0);
			}
		});

		it("should handle exclusion predicates that exclude most items", () => {
			const items = Array.from({ length: 100 }, (_, i) => i);

			// Exclude 90% of items (all except multiples of 10)
			const result = select(items, 5, {
				seed: 42,
				constraints: {
					exclude: [(item) => item % 10 !== 0],
				},
			});

			// Only 10 items pass filter (0, 10, 20, ..., 90)
			expect(result).toHaveLength(5);
			for (const item of result) {
				expect(item % 10).toBe(0);
			}
		});

		it("should handle empty result when all items are excluded", () => {
			const items = [1, 2, 3, 4, 5];

			const result = select(items, 10, {
				constraints: {
					exclude: [
						(item) => item > 0, // Excludes all positive numbers
					],
				},
			});

			expect(result).toEqual([]);
		});
	});

	describe("complex required and exclusion combinations", () => {
		it("should handle large required array with exclusions", () => {
			type Card = { id: number; type: string; cost: number };
			const cards: Card[] = Array.from({ length: 100 }, (_, i) => ({
				id: i,
				type: i % 2 === 0 ? "action" : "attack",
				cost: (i % 10) + 1,
			}));

			// Require 20 action cards with cost <= 5 to avoid conflicts
			const requiredCards = cards
				.filter((c) => c.type === "action" && c.cost <= 5)
				.slice(0, 20);

			const result = select(cards, 30, {
				seed: 42,
				constraints: {
					exclude: [(card) => card.cost > 5],
					require: requiredCards,
				},
			});

			// All required cards should be included
			for (const required of requiredCards) {
				expect(result).toContainEqual(required);
			}

			// No high-cost cards should be included
			for (const card of result) {
				expect(card.cost).toBeLessThanOrEqual(5);
			}
		});

		it("should handle required array that nearly fills count", () => {
			const items = Array.from({ length: 100 }, (_, i) => i);
			const requiredItems = Array.from({ length: 48 }, (_, i) => i);

			const result = select(items, 50, {
				seed: 42,
				constraints: {
					require: requiredItems,
				},
			});

			expect(result).toHaveLength(50);
			// All 48 required items should be included
			for (const required of requiredItems) {
				expect(result).toContain(required);
			}
		});

		it("should handle required array larger than count", () => {
			const items = Array.from({ length: 100 }, (_, i) => i);
			const requiredItems = Array.from({ length: 60 }, (_, i) => i);

			const result = select(items, 50, {
				seed: 42,
				constraints: {
					require: requiredItems,
				},
			});

			// Should return all required items (60) even though count is 50
			expect(result).toHaveLength(60);
			for (const required of requiredItems) {
				expect(result).toContain(required);
			}
		});

		it("should handle complex scenario with nested object constraints", () => {
			type ComplexCard = {
				id: number;
				stats: {
					attack: number;
					defense: number;
				};
				tags: string[];
				metadata: {
					edition: string;
					banned: boolean;
				};
			};

			const cards: ComplexCard[] = Array.from({ length: 50 }, (_, i) => ({
				id: i,
				stats: {
					attack: i % 10,
					defense: (i % 5) + 1,
				},
				tags: i % 2 === 0 ? ["fast", "strong"] : ["slow", "weak"],
				metadata: {
					edition: i % 3 === 0 ? "first" : "second",
					banned: i % 7 === 0,
				},
			}));

			// Select required cards that don't match any exclusion criteria
			// cards[2]: id=2, attack=2, not banned, tags=["fast","strong"]
			// cards[4]: id=4, attack=4, not banned, tags=["fast","strong"]
			const requiredCards = [cards[2], cards[4]];

			const result = select(cards, 20, {
				seed: 42,
				constraints: {
					exclude: [
						(card) => card.stats.attack > 7,
						(card) => card.metadata.banned,
						(card) => card.tags.includes("weak"),
					],
					require: requiredCards,
				},
			});

			// Required cards should be included
			for (const required of requiredCards) {
				expect(result).toContainEqual(required);
			}

			// Excluded cards should not be present (except required ones)
			for (const card of result) {
				const isRequired = requiredCards.some((r) => r.id === card.id);
				if (!isRequired) {
					expect(card.stats.attack).toBeLessThanOrEqual(7);
					expect(card.metadata.banned).toBe(false);
					expect(card.tags).not.toContain("weak");
				}
			}
		});
	});

	describe("deterministic behavior with complex constraints", () => {
		it("should be deterministic with multiple predicates and large required array", () => {
			type Card = { id: number; cost: number; type: string };
			const cards: Card[] = Array.from({ length: 200 }, (_, i) => ({
				id: i,
				cost: (i % 10) + 1,
				type: ["action", "attack", "defense"][i % 3],
			}));

			// Filter required cards to only include those with cost <= 6
			const requiredCards = cards
				.filter((c) => c.type === "action" && c.cost <= 6)
				.slice(0, 30);

			const options = {
				seed: 42,
				constraints: {
					exclude: [
						(card: Card) => card.cost > 6,
						(card: Card) => card.type === "attack",
					],
					require: requiredCards,
				},
			};

			const result1 = select(cards, 50, options);
			const result2 = select(cards, 50, options);

			expect(result1).toEqual(result2);
		});

		it("should produce different results with different seeds in complex scenario", () => {
			type Card = { id: number; cost: number };
			const cards: Card[] = Array.from({ length: 100 }, (_, i) => ({
				id: i,
				cost: (i % 10) + 1,
			}));

			const requiredCards = [cards[0], cards[1]];

			const result1 = select(cards, 30, {
				seed: 100,
				constraints: {
					exclude: [(card) => card.cost > 7],
					require: requiredCards,
				},
			});

			const result2 = select(cards, 30, {
				seed: 200,
				constraints: {
					exclude: [(card) => card.cost > 7],
					require: requiredCards,
				},
			});

			// Required cards should be same
			expect(result1).toContain(cards[0]);
			expect(result1).toContain(cards[1]);
			expect(result2).toContain(cards[0]);
			expect(result2).toContain(cards[1]);

			// But overall results should differ
			expect(result1).not.toEqual(result2);
		});
	});

	describe("edge cases with constraints", () => {
		it("should handle undefined constraints gracefully", () => {
			const items = [1, 2, 3, 4, 5];

			const result = select(items, 3, {
				constraints: undefined,
			});

			expect(result).toHaveLength(3);
		});

		it("should handle empty exclude and require arrays", () => {
			const items = [1, 2, 3, 4, 5];

			const result = select(items, 3, {
				constraints: {
					exclude: [],
					require: [],
				},
			});

			expect(result).toHaveLength(3);
		});

		it("should handle exclude predicates that never match", () => {
			const items = [1, 2, 3, 4, 5];

			const result = select(items, 3, {
				seed: 42,
				constraints: {
					exclude: [(item) => item > 100], // Never matches
				},
			});

			expect(result).toHaveLength(3);
		});

		it("should handle required items that don't exist in items array", () => {
			const items = [1, 2, 3, 4, 5];
			const requiredItems = [99, 100]; // Don't exist in items

			const result = select(items, 3, {
				seed: 42,
				constraints: {
					require: requiredItems,
				},
			});

			// Required items that don't exist in original array are included anyway
			expect(result).toContain(99);
			expect(result).toContain(100);
		});
	});

	test.prop([
		fc.array(fc.integer({ min: 0, max: 100 }), {
			minLength: 20,
			maxLength: 100,
		}),
		fc.integer({ min: 5, max: 50 }), // Ensure count is reasonable
	])(
		"complex constraints should maintain invariants (property-based)",
		(items, count) => {
			// Filter required items to only include odd numbers <= 80 to avoid conflicts
			// Limit to 3 required items to ensure count > requiredItems.length
			const requiredItems = items
				.filter((item) => item % 2 === 1 && item <= 80)
				.slice(0, 3);

			// Skip test if no valid required items or if count <= requiredItems.length
			if (requiredItems.length === 0 || count <= requiredItems.length) {
				return;
			}

			const result = select(items, count, {
				seed: 42,
				constraints: {
					exclude: [
						(item) => item % 2 === 0, // Exclude even
						(item) => item > 80, // Exclude large
					],
					require: requiredItems,
				},
			});

			// All required items should be included
			for (const required of requiredItems) {
				expect(result).toContain(required);
			}

			// Non-required items should respect exclusions
			for (const item of result) {
				const isRequired = requiredItems.includes(item);
				if (!isRequired) {
					expect(item % 2).toBe(1); // Must be odd
					expect(item).toBeLessThanOrEqual(80); // Must be <= 80
				}
			}
		},
	);
});
