import { describe, expect, it } from "vitest";
import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
import { Edition } from "@heart-of-crown-randomizer/card/type";

describe("+page.svelte CardWithActions integration preparation", () => {
	const allCommons = [...Basic.commons, ...FarEasternBorder.commons];

	it("should have cards available for CardWithActions to render", () => {
		const selectedCommons: CommonCard[] = [allCommons[0], allCommons[1], allCommons[2]];

		expect(selectedCommons.length).toBe(3);
		expect(selectedCommons[0]).toBeDefined();
		expect(selectedCommons[0].id).toBeDefined();
		expect(selectedCommons[0].name).toBeDefined();
	});

	it("should be able to separate cards by edition (for grid rendering)", () => {
		const selectedCommons: CommonCard[] = [
			Basic.commons[0], // Basic edition
			FarEasternBorder.commons[0], // Far Eastern Border edition
			Basic.commons[1], // Basic edition
		];

		const basicCards = selectedCommons.filter((c) => c.edition === Edition.BASIC);
		const farEasternCards = selectedCommons.filter((c) => c.edition === Edition.FAR_EASTERN_BORDER);

		expect(basicCards.length).toBe(2);
		expect(farEasternCards.length).toBe(1);
	});

	it("should provide card data needed for CardWithActions component", () => {
		const card = allCommons[0];

		expect(card.id).toBeDefined();
		expect(card.name).toBeDefined();
		expect(card.cost).toBeDefined();
		expect(typeof card.id).toBe("number");
		expect(typeof card.name).toBe("string");
		expect(typeof card.cost).toBe("number");
	});

	/**
	 * This test ensures that when we replace Card with CardWithActions in +page.svelte,
	 * the component will have access to the necessary card data.
	 *
	 * After GREEN phase implementation, we should verify in the actual rendered page that:
	 * - Each CardWithActions receives the correct card prop
	 * - Pin and exclude buttons are rendered
	 * - Buttons have correct aria-pressed attributes
	 */
	it("should prepare card data structure compatible with CardWithActions props", () => {
		const card = allCommons[0];
		const cardWithActionsProps = {
			card: card,
		};

		expect(cardWithActionsProps.card).toBeDefined();
		expect(cardWithActionsProps.card.id).toBe(card.id);
		expect(cardWithActionsProps.card.name).toBe(card.name);
	});
});
