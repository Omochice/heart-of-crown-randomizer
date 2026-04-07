import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { decodeIds, encodeIds } from "@heart-of-crown-randomizer/id-codec";
import { select } from "@heart-of-crown-randomizer/randomizer";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getExcludedCardIds,
  getPinnedCardIds,
  getPinnedCards,
  setExcludedCardIds,
  setPinnedCardIds,
  toggleExclude,
  togglePin,
} from "$lib/stores/card-state.svelte";
import {
  getEnabledConstraintIds,
  setEnabledConstraintIds,
} from "$lib/stores/constraint-state.svelte";
import { buildUrlWithCardState, parseCompressedIds } from "$lib/utils/url-sync";
import {
  validateExcludeConstraints,
  validatePinConstraints,
} from "$lib/utils/validation";

describe("Full Flow E2E: Pin → Randomize → Result", () => {
  const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
  const targetCount = 10;

  beforeEach(() => {
    setPinnedCardIds(new Set());
    setExcludedCardIds(new Set());
  });

  function selectWithConstraints(
    allCards: CommonCard[],
    pinnedCards: CommonCard[],
    excludedIds: ReadonlySet<number>,
    count: number,
  ): CommonCard[] {
    return select(allCards, count, {
      constraints: {
        require: pinnedCards,
        exclude: [(card) => excludedIds.has(card.id)],
      },
    });
  }

  it("should include all pinned cards in randomization result", () => {
    const cardsToBePinned = allCommons.slice(0, 3);
    for (const card of cardsToBePinned) {
      togglePin(card.id);
    }

    expect(getPinnedCardIds().size).toBe(3);
    for (const card of cardsToBePinned) {
      expect(getPinnedCardIds().has(card.id)).toBe(true);
    }

    for (let i = 0; i < 10; i++) {
      const pinnedCards = getPinnedCards(allCommons);
      const result = selectWithConstraints(
        allCommons,
        pinnedCards,
        getExcludedCardIds(),
        targetCount,
      );

      for (const pinnedCard of cardsToBePinned) {
        const foundInResult = result.find((c) => c.id === pinnedCard.id);
        expect(foundInResult).toBeDefined();
        expect(foundInResult?.id).toBe(pinnedCard.id);
      }
    }
  });

  it("should handle pinning up to target count cards", () => {
    const cardsToBePinned = allCommons.slice(0, targetCount);
    for (const card of cardsToBePinned) {
      togglePin(card.id);
    }

    const validation = validatePinConstraints(
      getPinnedCardIds().size,
      targetCount,
    );
    expect(validation.ok).toBe(true);

    const pinnedCards = getPinnedCards(allCommons);
    const result = selectWithConstraints(
      allCommons,
      pinnedCards,
      getExcludedCardIds(),
      targetCount,
    );

    expect(result.length).toBe(targetCount);
    for (const card of cardsToBePinned) {
      const foundInResult = result.find((c) => c.id === card.id);
      expect(foundInResult).toBeDefined();
    }
  });

  it("should detect error when pinned cards exceed target count", () => {
    const cardsToBePinned = allCommons.slice(0, targetCount + 3);
    for (const card of cardsToBePinned) {
      togglePin(card.id);
    }

    const validation = validatePinConstraints(
      getPinnedCardIds().size,
      targetCount,
    );
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.message).toContain("ピンされたカードが多すぎます");
    }
  });
});

describe("Full Flow E2E: Exclude → Randomize → Result", () => {
  const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
  const targetCount = 10;

  beforeEach(() => {
    setPinnedCardIds(new Set());
    setExcludedCardIds(new Set());
  });

  function selectWithConstraints(
    allCards: CommonCard[],
    pinnedCards: CommonCard[],
    excludedIds: ReadonlySet<number>,
    count: number,
  ): CommonCard[] {
    return select(allCards, count, {
      constraints: {
        require: pinnedCards,
        exclude: [(card) => excludedIds.has(card.id)],
      },
    });
  }

  it("should never include excluded cards in randomization result", () => {
    const cardsToBeExcluded = allCommons.slice(0, 5);
    for (const card of cardsToBeExcluded) {
      toggleExclude(card.id);
    }

    expect(getExcludedCardIds().size).toBe(5);
    for (const card of cardsToBeExcluded) {
      expect(getExcludedCardIds().has(card.id)).toBe(true);
    }

    for (let i = 0; i < 20; i++) {
      const pinnedCards = getPinnedCards(allCommons);
      const result = selectWithConstraints(
        allCommons,
        pinnedCards,
        getExcludedCardIds(),
        targetCount,
      );

      for (const excludedCard of cardsToBeExcluded) {
        const foundInResult = result.find((c) => c.id === excludedCard.id);
        expect(foundInResult).toBeUndefined();
      }
    }
  });

  it("should detect error when excluded cards make selection impossible", () => {
    const cardsToKeep = 5;
    const cardsToExclude = allCommons.slice(cardsToKeep);
    for (const card of cardsToExclude) {
      toggleExclude(card.id);
    }

    const availableCards = allCommons.filter(
      (card) => !getExcludedCardIds().has(card.id),
    );

    const validation = validateExcludeConstraints(
      availableCards.length,
      targetCount,
    );
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.message).toContain(
        "除外により選択可能なカードが不足しています",
      );
    }
  });
});

describe("Full Flow E2E: Pin + Exclude → Randomize → Result", () => {
  const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
  const targetCount = 10;

  beforeEach(() => {
    setPinnedCardIds(new Set());
    setExcludedCardIds(new Set());
  });

  function selectWithConstraints(
    allCards: CommonCard[],
    pinnedCards: CommonCard[],
    excludedIds: ReadonlySet<number>,
    count: number,
  ): CommonCard[] {
    return select(allCards, count, {
      constraints: {
        require: pinnedCards,
        exclude: [(card) => excludedIds.has(card.id)],
      },
    });
  }

  it("should handle both pinned and excluded cards correctly", () => {
    const cardsToBePinned = allCommons.slice(0, 3);
    for (const card of cardsToBePinned) {
      togglePin(card.id);
    }

    const cardsToBeExcluded = allCommons.slice(10, 15);
    for (const card of cardsToBeExcluded) {
      toggleExclude(card.id);
    }

    for (let i = 0; i < 10; i++) {
      const pinnedCards = getPinnedCards(allCommons);
      const result = selectWithConstraints(
        allCommons,
        pinnedCards,
        getExcludedCardIds(),
        targetCount,
      );

      for (const pinnedCard of cardsToBePinned) {
        const foundInResult = result.find((c) => c.id === pinnedCard.id);
        expect(foundInResult).toBeDefined();
      }

      for (const excludedCard of cardsToBeExcluded) {
        const foundInResult = result.find((c) => c.id === excludedCard.id);
        expect(foundInResult).toBeUndefined();
      }
    }
  });

  it("should respect state changes during flow", () => {
    const firstPinnedCards = allCommons.slice(0, 2);
    for (const card of firstPinnedCards) {
      togglePin(card.id);
    }

    let pinnedCards = getPinnedCards(allCommons);
    let result = selectWithConstraints(
      allCommons,
      pinnedCards,
      getExcludedCardIds(),
      targetCount,
    );

    for (const card of firstPinnedCards) {
      expect(result.find((c) => c.id === card.id)).toBeDefined();
    }

    togglePin(firstPinnedCards[0].id);
    const newPinnedCard = allCommons.slice(5, 6)[0];
    togglePin(newPinnedCard.id);

    pinnedCards = getPinnedCards(allCommons);
    result = selectWithConstraints(
      allCommons,
      pinnedCards,
      getExcludedCardIds(),
      targetCount,
    );

    expect(result.find((c) => c.id === firstPinnedCards[1].id)).toBeDefined();
    expect(result.find((c) => c.id === newPinnedCard.id)).toBeDefined();
  });
});

describe("Full Flow E2E: URL Sharing → State Restoration", () => {
  beforeEach(() => {
    setPinnedCardIds(new Set());
    setExcludedCardIds(new Set());
    setEnabledConstraintIds(new Set());
  });

  it("should restore pinned cards from compressed URL", () => {
    const encoded = encodeIds([1, 5, 12]);
    const url = new URL(`http://localhost/?p=${encoded}`);
    const parsedPinnedIds = parseCompressedIds(url, "p");

    setPinnedCardIds(parsedPinnedIds);

    expect(getPinnedCardIds().has(1)).toBe(true);
    expect(getPinnedCardIds().has(5)).toBe(true);
    expect(getPinnedCardIds().has(12)).toBe(true);
    expect(getPinnedCardIds().size).toBe(3);
  });

  it("should restore excluded cards from compressed URL", () => {
    const encoded = encodeIds([7, 9]);
    const url = new URL(`http://localhost/?e=${encoded}`);
    const parsedExcludedIds = parseCompressedIds(url, "e");

    setExcludedCardIds(parsedExcludedIds);

    expect(getExcludedCardIds().has(7)).toBe(true);
    expect(getExcludedCardIds().has(9)).toBe(true);
    expect(getExcludedCardIds().size).toBe(2);
  });

  it("should restore constraint state from compressed URL", () => {
    const encoded = encodeIds([2, 4]);
    const url = new URL(`http://localhost/?c=${encoded}`);
    const parsedConstraintIds = parseCompressedIds(url, "c");

    setEnabledConstraintIds(parsedConstraintIds);

    expect(getEnabledConstraintIds().has(2)).toBe(true);
    expect(getEnabledConstraintIds().has(4)).toBe(true);
    expect(getEnabledConstraintIds().size).toBe(2);
  });

  it("should restore all state types from compressed URL", () => {
    const pEncoded = encodeIds([1, 5]);
    const eEncoded = encodeIds([7]);
    const cEncoded = encodeIds([3]);
    const url = new URL(
      `http://localhost/?p=${pEncoded}&e=${eEncoded}&c=${cEncoded}`,
    );

    setPinnedCardIds(parseCompressedIds(url, "p"));
    setExcludedCardIds(parseCompressedIds(url, "e"));
    setEnabledConstraintIds(parseCompressedIds(url, "c"));

    expect(getPinnedCardIds()).toEqual(new Set([1, 5]));
    expect(getExcludedCardIds()).toEqual(new Set([7]));
    expect(getEnabledConstraintIds()).toEqual(new Set([3]));
  });

  it("should build URL with complete state for sharing", () => {
    setPinnedCardIds(new Set([1, 5, 12]));
    setExcludedCardIds(new Set([7, 9]));
    setEnabledConstraintIds(new Set([2, 4]));

    const baseUrl = new URL("http://localhost/");
    const resultUrl = buildUrlWithCardState(
      baseUrl,
      getPinnedCardIds(),
      getExcludedCardIds(),
      getEnabledConstraintIds(),
    );

    expect(new Set(decodeIds(resultUrl.searchParams.get("p") ?? ""))).toEqual(
      new Set([1, 5, 12]),
    );
    expect(new Set(decodeIds(resultUrl.searchParams.get("e") ?? ""))).toEqual(
      new Set([7, 9]),
    );
    expect(new Set(decodeIds(resultUrl.searchParams.get("c") ?? ""))).toEqual(
      new Set([2, 4]),
    );
  });

  it("should support round-trip URL encoding and decoding", () => {
    const originalPinnedIds = new Set([1, 5, 12]);
    const originalExcludedIds = new Set([7, 9]);
    const originalConstraintIds = new Set([2, 4]);

    const baseUrl = new URL("http://localhost/");
    const encodedUrl = buildUrlWithCardState(
      baseUrl,
      originalPinnedIds,
      originalExcludedIds,
      originalConstraintIds,
    );

    const decodedPinnedIds = parseCompressedIds(encodedUrl, "p");
    const decodedExcludedIds = parseCompressedIds(encodedUrl, "e");
    const decodedConstraintIds = parseCompressedIds(encodedUrl, "c");

    expect(decodedPinnedIds).toEqual(originalPinnedIds);
    expect(decodedExcludedIds).toEqual(originalExcludedIds);
    expect(decodedConstraintIds).toEqual(originalConstraintIds);
  });
});
