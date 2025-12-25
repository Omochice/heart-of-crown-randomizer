import { describe, expect, it } from "vitest";
import { shuffle } from "./shuffle";

describe("shuffle", () => {
	describe("edge cases", () => {
		it("should return empty array when input is empty", () => {
			const result = shuffle([]);
			expect(result).toEqual([]);
		});

		it("should return same single element when input has one item", () => {
			const result = shuffle([42]);
			expect(result).toEqual([42]);
		});

		it("should not mutate input array", () => {
			const original = [1, 2, 3, 4, 5];
			const copy = [...original];
			shuffle(original);
			expect(original).toEqual(copy);
		});
	});

	describe("seed validation", () => {
		it("should throw error when seed is NaN", () => {
			expect(() => shuffle([1, 2, 3], Number.NaN)).toThrow(
				"Invalid seed: seed must be a finite number",
			);
		});

		it("should throw error when seed is Infinity", () => {
			expect(() => shuffle([1, 2, 3], Number.POSITIVE_INFINITY)).toThrow(
				"Invalid seed: seed must be a finite number",
			);
		});

		it("should throw error when seed is negative Infinity", () => {
			expect(() => shuffle([1, 2, 3], Number.NEGATIVE_INFINITY)).toThrow(
				"Invalid seed: seed must be a finite number",
			);
		});
	});

	describe("deterministic behavior with seed", () => {
		it("should return same result when called with same seed", () => {
			const items = [1, 2, 3, 4, 5];
			const seed = 42;
			const result1 = shuffle(items, seed);
			const result2 = shuffle(items, seed);
			expect(result1).toEqual(result2);
		});

		it("should return same result for different arrays with same content and seed", () => {
			const items1 = [1, 2, 3, 4, 5];
			const items2 = [1, 2, 3, 4, 5];
			const seed = 12345;
			const result1 = shuffle(items1, seed);
			const result2 = shuffle(items2, seed);
			expect(result1).toEqual(result2);
		});

		it("should return different results for different seeds", () => {
			const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
			const result1 = shuffle(items, 42);
			const result2 = shuffle(items, 43);
			expect(result1).not.toEqual(result2);
		});
	});

	describe("non-deterministic behavior without seed", () => {
		it("should likely return different results when called without seed multiple times", () => {
			const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
			const results = new Set<string>();

			// Run shuffle 100 times and collect results
			for (let i = 0; i < 100; i++) {
				const result = shuffle(items);
				results.add(JSON.stringify(result));
			}

			// With proper randomization, we should get many different results
			// (probability of getting same result 100 times is astronomically low)
			expect(results.size).toBeGreaterThan(1);
		});

		it("should return different results on consecutive calls without seed", () => {
			const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
			const result1 = shuffle(items);
			const result2 = shuffle(items);

			// With 10 elements, probability of getting same shuffle is 1/10! ≈ 1/3628800
			// This test might fail very rarely, but it's acceptable for randomness verification
			expect(result1).not.toEqual(result2);
		});
	});
});
