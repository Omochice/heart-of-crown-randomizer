import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("placeholder", () => {
	it("should return expected string", () => {
		expect(placeholder()).toBe("randomizer package");
	});
});
