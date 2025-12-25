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
});
