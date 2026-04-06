import { describe, it, expect, beforeEach } from "vitest";
import {
	getEnabledConstraintIds,
	toggleConstraint,
	getEnabledConstraints,
	setEnabledConstraintIds,
} from "./constraint-state.svelte";
import type { Constraint } from "@heart-of-crown-randomizer/constraint";

const mockConstraints: Constraint[] = [
	{
		id: 100,
		label: "Test A",
		canApply: () => true,
		isSatisfied: () => true,
		apply: (ctx) => ctx,
	},
	{
		id: 200,
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
		toggleConstraint(100);
		expect(getEnabledConstraintIds().has(100)).toBe(true);
	});

	it("should disable a constraint when toggled twice", () => {
		toggleConstraint(100);
		toggleConstraint(100);
		expect(getEnabledConstraintIds().has(100)).toBe(false);
	});

	it("should return enabled constraint objects", () => {
		toggleConstraint(100);
		const enabled = getEnabledConstraints(mockConstraints);
		expect(enabled).toHaveLength(1);
		expect(enabled[0].id).toBe(100);
	});

	it("should handle multiple enabled constraints", () => {
		toggleConstraint(100);
		toggleConstraint(200);
		const enabled = getEnabledConstraints(mockConstraints);
		expect(enabled).toHaveLength(2);
	});

	it("should return empty array when no constraints match", () => {
		toggleConstraint(999);
		const enabled = getEnabledConstraints(mockConstraints);
		expect(enabled).toHaveLength(0);
	});

	describe("setEnabledConstraintIds", () => {
		it("should replace all enabled IDs with the given set", () => {
			toggleConstraint(100);
			setEnabledConstraintIds(new Set([200]));
			expect(getEnabledConstraintIds().has(100)).toBe(false);
			expect(getEnabledConstraintIds().has(200)).toBe(true);
		});

		it("should clear all enabled IDs when given an empty set", () => {
			toggleConstraint(100);
			toggleConstraint(200);
			setEnabledConstraintIds(new Set());
			expect(getEnabledConstraintIds().size).toBe(0);
		});

		it("should not alias the input set", () => {
			const input = new Set([100]);
			setEnabledConstraintIds(input);
			input.add(200);
			expect(getEnabledConstraintIds().has(200)).toBe(false);
		});
	});
});
