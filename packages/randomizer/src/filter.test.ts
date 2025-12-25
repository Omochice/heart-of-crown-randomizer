import { describe, it, expect } from "vitest";
import { filter } from "./filter";

describe("filter", () => {
	it("returns empty array when input is empty", () => {
		const result = filter([], () => true);
		expect(result).toEqual([]);
	});

	it("returns all elements when predicate matches all", () => {
		const items = [1, 2, 3, 4, 5];
		const result = filter(items, () => true);
		expect(result).toEqual([1, 2, 3, 4, 5]);
	});

	it("returns empty array when predicate matches none", () => {
		const items = [1, 2, 3, 4, 5];
		const result = filter(items, () => false);
		expect(result).toEqual([]);
	});

	it("filters elements based on predicate", () => {
		const items = [1, 2, 3, 4, 5];
		const result = filter(items, (item) => item % 2 === 0);
		expect(result).toEqual([2, 4]);
	});

	it("does not mutate input array", () => {
		const items = [1, 2, 3, 4, 5];
		const original = [...items];
		filter(items, (item) => item % 2 === 0);
		expect(items).toEqual(original);
	});
});
