import { encodeIds } from "@heart-of-crown-randomizer/id-codec";
import { render, waitFor } from "@testing-library/svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PageComponent from "./+page.svelte";

/**
 * A plain mutable object stands in for the rune-backed page state rather
 * than a reactive mock: every test sets the URL before render, so the
 * component only ever reads the value, never needs to observe a change.
 */
vi.mock("$app/state", () => ({
  page: {
    url: new URL("http://localhost"),
    params: {},
    route: { id: "/" },
    status: 200,
    error: null,
    data: {},
    form: null,
    state: {},
  },
}));

vi.mock("$app/navigation", () => ({
  goto: vi.fn(),
}));

async function setPageUrl(url: URL): Promise<void> {
  const { page } = await import("$app/state");
  (page as unknown as { url: URL }).url = url;
}

describe("+page.svelte URL parameter card restoration", () => {
  beforeEach(() => {
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    vi.stubGlobal("localStorage", localStorageMock);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should restore Basic cards from URL parameters", async () => {
    await setPageUrl(new URL(`http://localhost?s=${encodeIds([17, 18, 19])}`));

    const { container } = render(PageComponent);

    await waitFor(() => {
      const cards = container.querySelectorAll(".card-swipeable");
      expect(cards.length).toBe(3);
    });
  });

  it("should restore Far Eastern Border cards from URL parameters", async () => {
    await setPageUrl(new URL(`http://localhost?s=${encodeIds([49, 50, 51])}`));

    const { container } = render(PageComponent);

    await waitFor(() => {
      const cards = container.querySelectorAll(".card-swipeable");
      expect(cards.length).toBe(3);
    });
  });

  it("should restore mixed Basic and Far Eastern Border cards", async () => {
    await setPageUrl(
      new URL(`http://localhost?s=${encodeIds([17, 18, 49, 50])}`),
    );

    const { container } = render(PageComponent);

    await waitFor(() => {
      const cards = container.querySelectorAll(".card-swipeable");
      expect(cards.length).toBe(4);
    });
  });
});
