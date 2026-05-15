<script
	module
	lang="ts"
>
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { Edition } from "@heart-of-crown-randomizer/card/type";
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { fn } from "storybook/test";
	import CardDetail from "./CardDetail.svelte";

	const actionCard: CommonCard = {
		id: 1,
		type: "common",
		name: "Sample Action Card",
		cost: 3,
		hasChild: false,
		mainType: ["action"],
		link: 1,
		effect: "Draw 2 cards from the deck.",
		edition: Edition.BASIC,
	};

	const coinCard: CommonCard = {
		id: 2,
		type: "common",
		name: "Merchant Ship",
		cost: 5,
		hasChild: false,
		mainType: ["territory"],
		link: 0,
		coin: 3,
		effect: "Produces 3 coins.",
		edition: Edition.BASIC,
	};

	const successionCard: CommonCard = {
		id: 3,
		type: "common",
		name: "Royal Estate",
		cost: 6,
		hasChild: false,
		mainType: ["succession"],
		succession: 3,
		link: 0,
		effect: "Worth 3 succession points.",
		edition: Edition.BASIC,
	};

	const attackCard: CommonCard = {
		id: 4,
		type: "common",
		name: "Raid",
		cost: 4,
		hasChild: false,
		mainType: ["action", "attack"],
		link: 1,
		effect: "Each other player discards 1 card from hand.",
		edition: Edition.FAR_EASTERN_BORDER,
	};

	const { Story } = defineMeta({
		title: "Components/CardDetail",
		component: CardDetail,
		parameters: {
			docs: {
				description: {
					component: "Displays detailed card information in a bottom sheet dialog.",
				},
			},
		},
	});
</script>

<Story
	name="Default"
	args={{ card: actionCard, onClose: fn() }}
/>

<Story
	name="WithCoin"
	args={{ card: coinCard, onClose: fn() }}
/>

<Story
	name="WithSuccession"
	args={{ card: successionCard, onClose: fn() }}
/>

<Story
	name="AttackCard"
	args={{ card: attackCard, onClose: fn() }}
/>
