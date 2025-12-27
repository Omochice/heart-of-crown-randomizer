import { describe, expect, it } from "vitest";
import type { Identifiable } from "./types";

describe("Identifiable type", () => {
  it("should allow objects with numeric id property", () => {
    const item: Identifiable = { id: 1 };
    expect(item.id).toBe(1);
  });

  it("should allow objects with id and additional properties", () => {
    const item: Identifiable = { id: 42, name: "test", value: 100 };
    expect(item.id).toBe(42);
  });

  it("should be compatible with filterByIds type constraint", () => {
    // Type-level test: this should compile without errors
    type TestItem = { id: number; data: string };
    const _typeCheck: Identifiable = { id: 1 } as TestItem;
    expect(_typeCheck).toBeDefined();
  });
});
