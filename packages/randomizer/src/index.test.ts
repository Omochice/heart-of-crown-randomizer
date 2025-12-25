import { describe, expect, it } from "vitest";
import { createRNG, filter, filterByIds, shuffle } from "./index.js";

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
});
