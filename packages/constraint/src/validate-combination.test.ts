import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { describe, expect, it } from "vitest";
import { disasterGte1, highCostGte2, link2Gte3, noAttack } from "./presets.js";
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
    // Basic.commons contains no disaster cards, so disasterGte1 cannot apply
    const context = makeContext([...Basic.commons], 10);
    expect(validateCombination([disasterGte1], context)).toBe(false);
  });

  it("returns true when multiple compatible constraints are combined", () => {
    const pool = [...Basic.commons, ...FarEasternBorder.commons];
    const context = makeContext(pool, 10);
    expect(validateCombination([noAttack, highCostGte2], context)).toBe(true);
  });

  it("returns false when a later constraint becomes inapplicable after earlier ones modify the context", () => {
    // FarEasternBorder has link=2 cards that are also attack cards (e.g. 密偵).
    // After noAttack removes attack cards from pool, only non-attack link=2
    // cards remain. If fewer than 3 non-attack link=2 cards exist, link2Gte3 fails.
    // FarEasternBorder has 伝書鳩(link2, non-attack), 密偵(link2, attack),
    // 港町(link2, non-attack), 結盟(link2, non-attack) = 3 non-attack link=2.
    // Remove 結盟 so only 2 non-attack link=2 cards remain after noAttack filters.
    const reducedPool = [...FarEasternBorder.commons].filter(
      (c) => c.id !== 67,
    );
    const context = makeContext(reducedPool, 10);

    // Without noAttack, link2Gte3 can use 伝書鳩 + 密偵 + 港町 = 3 link=2 cards
    expect(validateCombination([link2Gte3], context)).toBe(true);

    // With noAttack first, 密偵 (attack) is removed, leaving only 2 non-attack link=2
    expect(validateCombination([noAttack, link2Gte3], context)).toBe(false);
  });
});
