import { fc, test } from "@fast-check/vitest";
import { describe, expect, it, vi } from "vitest";
import * as rngModule from "./rng";
import { shuffle } from "./shuffle";

describe("Performance Benchmark", () => {
  test.prop([fc.integer({ min: 2, max: 10000 })])(
    "should perform exactly n-1 RNG calls for array of size n (Fisher-Yates invariant)",
    (size) => {
      let callCount = 0;
      const countingRng = () => {
        callCount++;
        return Math.random();
      };

      vi.spyOn(rngModule, "createRNG").mockReturnValue(countingRng);

      const items = Array.from({ length: size }, (_, i) => i);
      shuffle(items);

      expect(callCount).toBe(size - 1);

      vi.restoreAllMocks();
    },
  );

  it("should not call RNG for arrays with 0 or 1 elements", () => {
    let callCount = 0;
    const countingRng = () => {
      callCount++;
      return Math.random();
    };

    vi.spyOn(rngModule, "createRNG").mockReturnValue(countingRng);

    shuffle([]);
    expect(callCount).toBe(0);

    shuffle([1]);
    expect(callCount).toBe(0);

    vi.restoreAllMocks();
  });
});
