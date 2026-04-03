import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { describe, expect, it } from "vitest";
import {
  disasterGte1,
  highCostGte2,
  link0GteLink2,
  link2Gte3,
  noAttack,
} from "./presets.js";
import type { SelectionContext } from "./type.js";
import { validateCombination } from "./validate-combination.js";

function makeContext(pool: CommonCard[], count: number): SelectionContext {
  return { pool, required: [], count, rng: () => 0.5 };
}

describe("validateCombination", () => {
  it("returns true for an empty constraint list", () => {
    const context = makeContext([...Basic.commons], 10);
    expect(validateCombination([], context)).toBe(true);
  });

  it("returns true for a single constraint that can be applied", () => {
    const context = makeContext([...Basic.commons], 10);
    expect(validateCombination([noAttack], context)).toBe(true);
  });

  it("returns false for a single constraint that cannot be applied", () => {
    // link2Gte3 requires at least 3 link=2 cards; FarEasternBorder has no link=2 cards
    const context = makeContext([...FarEasternBorder.commons], 10);
    expect(validateCombination([link2Gte3], context)).toBe(false);
  });

  it("returns true when multiple compatible constraints are combined", () => {
    const pool = [...Basic.commons, ...FarEasternBorder.commons];
    const context = makeContext(pool, 10);
    expect(validateCombination([noAttack, highCostGte2], context)).toBe(true);
  });

  it("returns false when a later constraint becomes inapplicable after earlier ones modify the context", () => {
    // noAttack removes attack cards from pool, which may reduce the total
    // pool size enough that link2Gte3 cannot find 3 link=2 cards.
    // With only FarEasternBorder commons (no link=2 cards), link2Gte3 fails.
    const context = makeContext([...FarEasternBorder.commons], 10);
    expect(validateCombination([noAttack, link2Gte3], context)).toBe(false);
  });
});
