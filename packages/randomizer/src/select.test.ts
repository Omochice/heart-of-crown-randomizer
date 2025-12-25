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
