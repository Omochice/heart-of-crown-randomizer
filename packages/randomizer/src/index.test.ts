import { describe, expect, it } from "vitest";
import { createRNG, shuffle } from "./index.js";

describe("module exports", () => {
	it("should export createRNG function", () => {
		expect(typeof createRNG).toBe("function");
	});

	it("should export shuffle function", () => {
		expect(typeof shuffle).toBe("function");
	});
});
