import { describe, expectTypeOf, it } from "vitest";
import { princesses } from "../../src/far-eastern-border/princess";
import type { Princess } from "../../src/type";
import { assert } from "typia";

describe("far-eastern-border/princess", () => {
  it.each(princesses)("card($id) satisfy type `Princess`", (princess) => {
    expectTypeOf(assert<Princess>(princess)).toEqualTypeOf<Princess>();
  });
});
