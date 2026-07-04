import { encodeIds } from "@heart-of-crown-randomizer/id-codec";
import { render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "$app/state";
import Page from "./+page.svelte";

/**
 * A rune-backed reactive stand-in for the page state: reassigning `page.url`
 * on this `$state` proxy notifies the component, which is what lets the tests
 * assert that the URL-restore effect re-runs on navigation rather than only on
 * mount. The factory seeds a bare URL because a `vi.mock` factory is hoisted
 * above the imports and therefore cannot reference `encodeIds`; `setUrl` fills
 * the query in from test scope instead.
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
  page.url = new URL(`http://localhost?s=${encodeIds(ids)}`);
}

function cardCount(): number {
  return screen.queryAllByRole("button", { name: /^カード / }).length;
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
    render(Page);

    await waitFor(() => {
      expect(cardCount()).toBe(3);
    });
  });

  it("re-runs the restore effect when the URL s parameter changes", async () => {
    setUrl([17, 18, 19]);
    render(Page);

    await waitFor(() => {
      expect(cardCount()).toBe(3);
    });

    setUrl([20]);

    await waitFor(() => {
      expect(cardCount()).toBe(1);
    });
  });
});
