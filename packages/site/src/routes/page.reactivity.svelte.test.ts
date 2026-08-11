import { encodeIds } from "@heart-of-crown-randomizer/id-codec";
import { render, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Page from "./+page.svelte";
import { setPageUrl } from "./app-state.mock.svelte";

/**
 * A rune-backed reactive stand-in rather than the plain object the other page
 * tests use: those set the URL before render and only read it, but this suite
 * mutates the URL after render, so the mock has to notify the component. The
 * state lives in a separate module because a hoisted `vi.mock` factory cannot
 * reference test-scope bindings, which a setter defined here would be.
 */
vi.mock("$app/state", () => import("./app-state.mock.svelte"));

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

function setUrl(ids: number[]): void {
  setPageUrl(new URL(`http://localhost?s=${encodeIds(ids)}`));
}

describe("+page.svelte URL change reactivity", () => {
  beforeEach(() => {
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    vi.stubGlobal("localStorage", localStorageMock);
    setPageUrl(new URL("http://localhost"));
  });

  it("restores the selected commons from the URL s parameter on mount", async () => {
    setUrl([17, 18, 19]);

    const { container } = render(Page);

    await waitFor(() => {
      expect(container.querySelectorAll(".card-swipeable")).toHaveLength(3);
    });
  });

  it("re-runs the restore effect when the URL s parameter changes", async () => {
    setUrl([17, 18, 19]);

    const { container } = render(Page);

    await waitFor(() => {
      expect(container.querySelectorAll(".card-swipeable")).toHaveLength(3);
    });

    setUrl([20]);

    await waitFor(() => {
      expect(container.querySelectorAll(".card-swipeable")).toHaveLength(1);
    });
  });
});
