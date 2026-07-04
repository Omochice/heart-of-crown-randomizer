import { encodeIds } from "@heart-of-crown-randomizer/id-codec";
import { render, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "$app/state";
import Page from "./+page.svelte";

/**
 * A rune-backed reactive stand-in rather than the plain object the other page
 * tests use: those set the URL before render and only read it, but this suite
 * mutates the URL after render, so the `$state` proxy is needed to notify the
 * component. The factory seeds a bare URL because a hoisted `vi.mock` factory
 * cannot reference the imported `encodeIds`; `setUrl` fills the query in from
 * test scope.
 */
vi.mock("$app/state", () => {
  const page = $state({
    url: new URL("http://localhost"),
    params: {},
    route: { id: "/" },
    status: 200,
    error: null,
    data: {},
    form: null,
    state: {},
  });
  return { page };
});

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

function setUrl(ids: number[]): void {
  (page as unknown as { url: URL }).url = new URL(
    `http://localhost?s=${encodeIds(ids)}`,
  );
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
