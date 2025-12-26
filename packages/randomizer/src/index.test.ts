import { describe, expect, it } from "vitest";
import {
	createRNG,
	filter,
	filterByIds,
	shuffle,
	type Identifiable,
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

	it("should export Identifiable type", () => {
		// Type-level test: this should compile without errors
		const item: Identifiable = { id: 42 };
		expect(item.id).toBe(42);
	});
});
