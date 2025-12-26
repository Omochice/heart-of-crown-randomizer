import { describe, expect, it } from "vitest";
import { createRNG } from "./rng.js";

describe("createRNG", () => {
  describe("seeded RNG", () => {
    it("should generate deterministic random numbers with same seed", () => {
      const rng1 = createRNG(42);
      const rng2 = createRNG(42);

      const sequence1 = Array.from({ length: 5 }, () => rng1());
      const sequence2 = Array.from({ length: 5 }, () => rng2());

      expect(sequence1).toEqual(sequence2);
    });

    it("should generate different sequences with different seeds", () => {
      const rng1 = createRNG(42);
      const rng2 = createRNG(123);

      const sequence1 = Array.from({ length: 5 }, () => rng1());
      const sequence2 = Array.from({ length: 5 }, () => rng2());

      expect(sequence1).not.toEqual(sequence2);
    });

    it("should return numbers between 0 and 1", () => {
      const rng = createRNG(42);

      for (let i = 0; i < 100; i++) {
        const value = rng();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });
  });

  describe("non-seeded RNG", () => {
    it("should use Math.random when no seed is provided", () => {
      const rng = createRNG();

      for (let i = 0; i < 100; i++) {
        const value = rng();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it("should generate non-deterministic sequences when no seed", () => {
      const rng1 = createRNG();
      const rng2 = createRNG();

      const sequence1 = Array.from({ length: 10 }, () => rng1());
      const sequence2 = Array.from({ length: 10 }, () => rng2());

      // With high probability, two unseeded sequences should differ
      expect(sequence1).not.toEqual(sequence2);
    });
  });
});
