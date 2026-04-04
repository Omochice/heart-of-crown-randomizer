import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { describe, expect, it } from "vitest";
import {
  eachCost2to5,
  highCostGte2,
  link2Gte3,
  link2GteLink0,
  noAttack,
} from "./presets";
import type { SelectionContext } from "./type";
import { validateCombination } from "./validate-combination";

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
    // An empty pool cannot satisfy link2Gte3 which requires 3 link=2 cards
    const context = makeContext([], 10);
    expect(validateCombination([link2Gte3], context)).toBe(false);
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

  it("returns true when link2GteLink0 and link2Gte3 both compete for link-2 cards", () => {
    // Both constraints need link-2 cards from pool.
    // link2GteLink0 forces some link-2 into required, then link2Gte3
    // needs at least 3 total link-2 in required.
    // Basic has 4 link-2 cards (早馬, 星詠みの魔女, のみの市, 補給部隊),
    // enough for both constraints.
    const pool = [...Basic.commons, ...FarEasternBorder.commons];
    const context = makeContext(pool, 10);
    expect(validateCombination([link2GteLink0, link2Gte3], context)).toBe(true);
  });

  it("returns true when eachCost2to5 and highCostGte2 both need high-cost cards", () => {
    // eachCost2to5 picks one card per cost 2-5, including one cost-5.
    // highCostGte2 then needs 2 cost>=5 cards in required, but one
    // is already provided by eachCost2to5, so only 1 more is needed.
    // Basic has enough high-cost cards (皇室領, 舞踏会, 冒険者, 錬金術師, etc.)
    const context = makeContext([...Basic.commons], 10);
    expect(validateCombination([eachCost2to5, highCostGte2], context)).toBe(
      true,
    );
  });

  it("returns true when all five constraints are enabled together with a large pool", () => {
    const pool = [...Basic.commons, ...FarEasternBorder.commons];
    const context = makeContext(pool, 10);
    // noAttack removes attack cards, then remaining constraints
    // must still be satisfiable from the filtered pool.
    expect(
      validateCombination(
        [noAttack, link2GteLink0, highCostGte2, link2Gte3, eachCost2to5],
        context,
      ),
    ).toBe(true);
  });

  it("returns false when link2GteLink0 becomes inapplicable after noAttack removes attack link-2 cards", () => {
    // 密偵 (id:56) is the only attack+link-2 card.
    // Construct a pool where the only link-2 card is 密偵.
    // After noAttack removes it, link2GteLink0 has no link-2 cards left.
    const poolWithOnlyAttackLink2 = [...FarEasternBorder.commons].filter(
      (c) => {
        // Keep 密偵 as the sole link-2 card; exclude other link-2 cards
        if (!c.hasChild && c.link === 2 && c.id !== 56) return false;
        return true;
      },
    );
    const context = makeContext(poolWithOnlyAttackLink2, 10);

    // Without noAttack, link2GteLink0 can use 密偵
    expect(validateCombination([link2GteLink0], context)).toBe(true);

    // With noAttack first, 密偵 is removed, no link-2 remains
    expect(validateCombination([noAttack, link2GteLink0], context)).toBe(false);
  });
});
