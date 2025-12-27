import { describe, expect, it } from "vitest";
import {
  type Constraint,
  ConstraintConflictError,
  createRNG,
  filter,
  filterByIds,
  type Identifiable,
  type Predicate,
  type SelectOptions,
  select,
  shuffle,
  validateConstraints,
} from "./index.js";

describe("module exports", () => {
  it("should export createRNG function", () => {
    expect(typeof createRNG).toBe("function");
  });

  it("should export shuffle function", () => {
    expect(typeof shuffle).toBe("function");
  });

  it("should export filter function", () => {
    expect(typeof filter).toBe("function");
  });

  it("should export filterByIds function", () => {
    expect(typeof filterByIds).toBe("function");
  });

  it("should export select function", () => {
    expect(typeof select).toBe("function");
  });

  it("should export validateConstraints function", () => {
    expect(typeof validateConstraints).toBe("function");
  });

  it("should export ConstraintConflictError class", () => {
    expect(ConstraintConflictError).toBeDefined();
    expect(ConstraintConflictError.prototype).toBeInstanceOf(Error);
  });

  it("should export Identifiable type", () => {
    // Type-level test: this should compile without errors
    const item: Identifiable = { id: 42 };
    expect(item.id).toBe(42);
  });

  it("should export Predicate type", () => {
    // Type-level test: this should compile without errors
    const predicate: Predicate<number> = (x) => x > 0;
    expect(predicate(1)).toBe(true);
    expect(predicate(-1)).toBe(false);
  });

  it("should export Constraint type", () => {
    // Type-level test: this should compile without errors
    const constraint: Constraint<number> = {
      exclude: [(x) => x < 0],
      require: [1, 2, 3],
    };
    expect(constraint.exclude).toBeDefined();
    expect(constraint.require).toBeDefined();
  });

  it("should export SelectOptions type", () => {
    // Type-level test: this should compile without errors
    const options: SelectOptions<number> = {
      seed: 42,
      constraints: {
        exclude: [(x) => x < 0],
        require: [1],
      },
    };
    expect(options.seed).toBe(42);
    expect(options.constraints).toBeDefined();
  });
});
