import { describe, it, expect, beforeEach } from "vitest";
import {
	getEnabledConstraintIds,
	toggleConstraint,
	getEnabledConstraints,
} from "./constraint-state.svelte";
import type { Constraint } from "@heart-of-crown-randomizer/constraint";

const mockConstraints: Constraint[] = [
	{
		id: "test-a",
		label: "Test A",
		canApply: () => true,
		isSatisfied: () => true,
		apply: (ctx) => ctx,
	},
	{
		id: "test-b",
		label: "Test B",
		canApply: () => true,
		isSatisfied: () => true,
		apply: (ctx) => ctx,
	},
];

describe("constraint-state", () => {
	beforeEach(() => {
		// Reset state by toggling off any enabled constraints
		for (const id of getEnabledConstraintIds()) {
			toggleConstraint(id);
		}
	});

	it("should start with no enabled constraints", () => {
		expect(getEnabledConstraintIds().size).toBe(0);
	});

	it("should enable a constraint when toggled", () => {
		toggleConstraint("test-a");
		expect(getEnabledConstraintIds().has("test-a")).toBe(true);
	});

	it("should disable a constraint when toggled twice", () => {
		toggleConstraint("test-a");
		toggleConstraint("test-a");
		expect(getEnabledConstraintIds().has("test-a")).toBe(false);
	});

	it("should return enabled constraint objects", () => {
		toggleConstraint("test-a");
		const enabled = getEnabledConstraints(mockConstraints);
		expect(enabled).toHaveLength(1);
		expect(enabled[0].id).toBe("test-a");
	});

	it("should handle multiple enabled constraints", () => {
		toggleConstraint("test-a");
		toggleConstraint("test-b");
		const enabled = getEnabledConstraints(mockConstraints);
		expect(enabled).toHaveLength(2);
	});

	it("should return empty array when no constraints match", () => {
		toggleConstraint("nonexistent");
		const enabled = getEnabledConstraints(mockConstraints);
		expect(enabled).toHaveLength(0);
	});
});
