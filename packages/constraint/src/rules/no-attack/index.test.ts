import { describe, expect, it } from "vitest";
import { makeContext, makeDuplicateCard } from "../shared/test-helpers";
import { noAttack } from "./index";

describe("noAttack", () => {
  describe("canApply", () => {
    it("returns true when enough non-attack cards exist", () => {
      const pool = [
        makeDuplicateCard({ id: 1, mainType: ["action"] }),
        makeDuplicateCard({ id: 2, mainType: ["action"] }),
        makeDuplicateCard({ id: 3, mainType: ["attack"] }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 2,
      });

      expect(noAttack.canApply(context)).toBe(true);
    });

    it("returns false when not enough non-attack cards exist", () => {
      const pool = [
        makeDuplicateCard({ id: 1, mainType: ["attack"] }),
        makeDuplicateCard({ id: 2, mainType: ["attack"] }),
        makeDuplicateCard({ id: 3, mainType: ["action"] }),
      ];
      const context = makeContext({
        pool,
        required: [],
        count: 3,
      });

      expect(noAttack.canApply(context)).toBe(false);
    });

    it("returns false when required contains an attack card", () => {
      const pool = [
        makeDuplicateCard({ id: 1, mainType: ["action"] }),
        makeDuplicateCard({ id: 2, mainType: ["action"] }),
      ];
      const context = makeContext({
        pool,
        required: [makeDuplicateCard({ id: 3, mainType: ["attack"] })],
        count: 2,
      });

      expect(noAttack.canApply(context)).toBe(false);
    });
  });
});
