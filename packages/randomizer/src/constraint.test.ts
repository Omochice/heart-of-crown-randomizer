import { describe, expect, it } from "vitest";
import {
	ConstraintConflictError,
	type Constraint,
	validateConstraints,
} from "./constraint";

describe("validateConstraints", () => {
	describe("no conflict cases", () => {
		it("should not throw when constraint is undefined", () => {
			expect(() => validateConstraints(undefined)).not.toThrow();
		});

		it("should not throw when constraint is empty object", () => {
			const constraint: Constraint<number> = {};
			expect(() => validateConstraints(constraint)).not.toThrow();
		});

		it("should not throw when only exclude predicates are provided", () => {
			const constraint: Constraint<number> = {
				exclude: [(n) => n > 5],
			};
			expect(() => validateConstraints(constraint)).not.toThrow();
		});

		it("should not throw when only require array is provided", () => {
			const constraint: Constraint<number> = {
				require: [1, 2, 3],
			};
			expect(() => validateConstraints(constraint)).not.toThrow();
		});

		it("should not throw when required items do not match exclusion predicates", () => {
			const constraint: Constraint<number> = {
				exclude: [(n) => n > 5],
				require: [1, 2, 3],
			};
			expect(() => validateConstraints(constraint)).not.toThrow();
		});

		it("should not throw when required items match none of multiple exclusion predicates", () => {
			const constraint: Constraint<{ id: number; type: string }> = {
				exclude: [(item) => item.type === "attack", (item) => item.id > 100],
				require: [
					{ id: 1, type: "defense" },
					{ id: 2, type: "support" },
				],
			};
			expect(() => validateConstraints(constraint)).not.toThrow();
		});
	});

	describe("conflict detection", () => {
		it("should throw ConstraintConflictError when required item matches exclusion predicate", () => {
			const constraint: Constraint<number> = {
				exclude: [(n) => n > 5],
				require: [1, 6, 3],
			};

			expect(() => validateConstraints(constraint)).toThrow(
				ConstraintConflictError,
			);
		});

		it("should include conflicting items in error", () => {
			const constraint: Constraint<number> = {
				exclude: [(n) => n > 5],
				require: [1, 6, 7, 3],
			};

			try {
				validateConstraints(constraint);
				expect.fail("Should have thrown ConstraintConflictError");
			} catch (error) {
				expect(error).toBeInstanceOf(ConstraintConflictError);
				const conflictError = error as ConstraintConflictError<number>;
				expect(conflictError.conflictingItems).toEqual([6, 7]);
			}
		});

		it("should detect conflicts with multiple exclusion predicates (OR logic)", () => {
			const constraint: Constraint<{ id: number; type: string }> = {
				exclude: [(item) => item.type === "attack", (item) => item.id > 10],
				require: [
					{ id: 1, type: "defense" },
					{ id: 2, type: "attack" },
					{ id: 15, type: "support" },
				],
			};

			try {
				validateConstraints(constraint);
				expect.fail("Should have thrown ConstraintConflictError");
			} catch (error) {
				expect(error).toBeInstanceOf(ConstraintConflictError);
				const conflictError = error as ConstraintConflictError<{
					id: number;
					type: string;
				}>;
				expect(conflictError.conflictingItems).toHaveLength(2);
				expect(conflictError.conflictingItems).toContainEqual({
					id: 2,
					type: "attack",
				});
				expect(conflictError.conflictingItems).toContainEqual({
					id: 15,
					type: "support",
				});
			}
		});

		it("should provide descriptive error message", () => {
			const constraint: Constraint<number> = {
				exclude: [(n) => n > 5],
				require: [6, 7],
			};

			try {
				validateConstraints(constraint);
				expect.fail("Should have thrown ConstraintConflictError");
			} catch (error) {
				expect(error).toBeInstanceOf(ConstraintConflictError);
				const message = (error as Error).message;
				expect(message).toMatch(/constraint conflict/i);
				expect(message).toMatch(/required/i);
				expect(message).toMatch(/excluded/i);
			}
		});
	});
});
