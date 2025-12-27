import { describe, expect, it } from "vitest";
import { filter, filterByIds } from "./filter";

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

describe("filterByIds", () => {
  it("returns all elements when excludedIds is empty", () => {
    const items = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
      { id: 3, name: "C" },
    ];
    const result = filterByIds(items, []);
    expect(result).toEqual(items);
  });

  it("excludes items with specified IDs", () => {
    const items = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
      { id: 3, name: "C" },
      { id: 4, name: "D" },
    ];
    const result = filterByIds(items, [2, 4]);
    expect(result).toEqual([
      { id: 1, name: "A" },
      { id: 3, name: "C" },
    ]);
  });

  it("returns all elements when excludedIds contains non-existent IDs", () => {
    const items = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ];
    const result = filterByIds(items, [99, 100]);
    expect(result).toEqual(items);
  });

  it("does not mutate input array", () => {
    const items = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
      { id: 3, name: "C" },
    ];
    const original = [...items];
    filterByIds(items, [2]);
    expect(items).toEqual(original);
  });

  it("returns empty array when all items are excluded", () => {
    const items = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ];
    const result = filterByIds(items, [1, 2]);
    expect(result).toEqual([]);
  });
});
