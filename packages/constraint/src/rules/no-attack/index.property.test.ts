import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import {
  commonCardArb,
  contextArb,
  describeApplyInvariants,
} from "../shared/test-helpers";
import { noAttack } from "./index";

describe("noAttack", () => {
  describeApplyInvariants("noAttack", noAttack);

  test.prop([contextArb()])(
    "after apply, pool contains no attack cards",
    (ctx) => {
      if (!noAttack.canApply(ctx)) {
        return;
      }
      const result = noAttack.apply(ctx);
      for (const card of result.pool) {
        if (card.hasChild) {
          expect(card.cards.every((s) => !s.mainType.includes("attack"))).toBe(
            true,
          );
        } else {
          expect(card.mainType.includes("attack")).toBe(false);
        }
      }
    },
  );

  test.prop([fc.array(commonCardArb, { minLength: 0, maxLength: 20 })])(
    "isSatisfied is true iff no card has attack type",
    (cards) => {
      const hasAttack = cards.some((c) =>
        c.hasChild
          ? c.cards.some((s) => s.mainType.includes("attack"))
          : c.mainType.includes("attack"),
      );
      expect(noAttack.isSatisfied(cards)).toBe(!hasAttack);
    },
  );
});
