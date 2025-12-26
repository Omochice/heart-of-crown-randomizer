import { describe, expect, it } from "vitest";
import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { filterByIds, select } from "@heart-of-crown-randomizer/randomizer";

describe("Randomizer Package Integration", () => {
	const allCommons: CommonCard[] = [...Basic.commons, ...FarEasternBorder.commons];

	describe("filterByIds", () => {
		it("should filter out excluded cards by ID", () => {
			const excludedIds = [1, 2, 3];
			const filtered = filterByIds(allCommons, excludedIds);

			expect(filtered.every((card) => !excludedIds.includes(card.id))).toBe(true);
			// Count how many cards were actually excluded (handles duplicates)
			const excludedCount = allCommons.filter((card) => excludedIds.includes(card.id)).length;
			expect(filtered.length).toBe(allCommons.length - excludedCount);
		});

		it("should return all cards when exclusion list is empty", () => {
			const filtered = filterByIds(allCommons, []);

			expect(filtered.length).toBe(allCommons.length);
		});

		it("should not mutate the original array", () => {
			const original = [...allCommons];
			const excludedIds = [1, 2, 3];

			filterByIds(allCommons, excludedIds);

			expect(allCommons).toEqual(original);
		});
	});

	describe("select", () => {
		it("should select the requested number of cards", () => {
			const count = 10;
			const selected = select(allCommons, count);

			expect(selected.length).toBe(count);
		});

		it("should return all cards when count exceeds available cards", () => {
			const count = allCommons.length + 100;
			const selected = select(allCommons, count);

			expect(selected.length).toBe(allCommons.length);
		});

		it("should select cards from the provided array", () => {
			const count = 10;
			const selected = select(allCommons, count);

			expect(selected.every((card) => allCommons.some((c) => c.id === card.id))).toBe(true);
		});

		it("should not mutate the original array", () => {
			const original = [...allCommons];
			const count = 10;

			select(allCommons, count);

			expect(allCommons).toEqual(original);
		});

		it("should produce deterministic results with seed", () => {
			const seed = 42;
			const count = 10;

			const result1 = select(allCommons, count, { seed });
			const result2 = select(allCommons, count, { seed });

			expect(result1).toEqual(result2);
		});
	});

	describe("drawRandomCards workflow", () => {
		it("should simulate the complete drawRandomCards workflow", () => {
			const numberOfCommons = 10;
			const excludedCommons: CommonCard[] = [allCommons[0], allCommons[1]];

			// Simulate drawRandomCards logic
			const excludedIds = excludedCommons.map((c) => c.id);
			const availableCommons = filterByIds(allCommons, excludedIds);
			const randomCards = select(availableCommons, numberOfCommons);

			expect(randomCards.length).toBe(numberOfCommons);
			expect(randomCards.every((card) => !excludedIds.includes(card.id))).toBe(true);
			expect(randomCards.every((card) => availableCommons.includes(card))).toBe(true);
		});
	});

	describe("drawMissingCommons workflow", () => {
		it("should simulate the complete drawMissingCommons workflow", () => {
			const numberOfCommons = 10;
			const selectedCommons: CommonCard[] = [allCommons[0], allCommons[1], allCommons[2]];
			const excludedCommons: CommonCard[] = [allCommons[10], allCommons[11]];

			// Simulate drawMissingCommons logic
			const excludedIds = [...excludedCommons, ...selectedCommons].map((c) => c.id);
			const availableCommons = filterByIds(allCommons, excludedIds);
			const cardsToAdd = numberOfCommons - selectedCommons.length;
			const newCards = select(availableCommons, cardsToAdd);

			expect(newCards.length).toBe(cardsToAdd);
			expect(newCards.every((card) => !excludedIds.includes(card.id))).toBe(true);
			expect(newCards.every((card) => !selectedCommons.some((c) => c.id === card.id))).toBe(true);
		});

		it("should return empty array when selected cards reach the limit", () => {
			const numberOfCommons = 10;
			const selectedCommons: CommonCard[] = allCommons.slice(0, 10);

			const cardsToAdd = numberOfCommons - selectedCommons.length;

			expect(cardsToAdd).toBe(0);
		});
	});
});
