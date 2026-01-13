<script
	module
	lang="ts"
>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import { fn } from "@storybook/test";
	import Card from "./Card.svelte";
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { Edition } from "@heart-of-crown-randomizer/card/type";

	const sampleCard: CommonCard = {
		id: 1,
		type: "common",
		name: "Sample Card",
		cost: 3,
		hasChild: false,
		mainType: ["action"],
		link: 1,
		effect: "Example card effect text",
		edition: Edition.BASIC,
	};

	const cardWithCoin: CommonCard = {
		id: 2,
		type: "common",
		name: "Card with Coin",
		cost: 2,
		hasChild: false,
		mainType: ["action"],
		link: 1,
		coin: 2,
		effect: "Card with coin value",
		edition: Edition.BASIC,
	};

	const cardWithSuccession: CommonCard = {
		id: 3,
		type: "common",
		name: "Card with Succession",
		cost: 4,
		hasChild: false,
		mainType: ["succession"],
		link: 0,
		succession: 3,
		effect: "Card with succession value",
		edition: Edition.BASIC,
	};

	const cardWithBoth: CommonCard = {
		id: 4,
		type: "common",
		name: "Card with Both",
		cost: 5,
		hasChild: false,
		mainType: ["action", "succession"],
		link: 1,
		coin: 2,
		succession: 2,
		effect: "Card with both coin and succession",
		edition: Edition.BASIC,
	};

	const uniqueCardWithVaryingValues: CommonCard = {
		id: 5,
		type: "common",
		name: "Unique Card",
		cost: 3,
		hasChild: true,
		cards: [
			{
				name: "Child A",
				mainType: ["action"],
				cost: 3,
				link: 1,
				coin: 1,
				succession: 2,
				effect: "Child A effect",
			},
			{
				name: "Child B",
				mainType: ["action"],
				cost: 3,
				link: 1,
				coin: 2,
				succession: 3,
				effect: "Child B effect",
			},
		],
		edition: Edition.BASIC,
	};

	const { Story } = defineMeta({
		title: "Components/Card",
		component: Card,
	});
</script>

<Story
	name="Default"
	args={{
		card: sampleCard,
		onSwipeStart: fn(),
		onSwipeMove: fn(),
		onSwipeEnd: fn(),
		onSwipeCancel: fn(),
		originalIndex: 0,
	}}
/>

<Story
	name="With Coin"
	args={{
		card: cardWithCoin,
		onSwipeStart: fn(),
		onSwipeMove: fn(),
		onSwipeEnd: fn(),
		onSwipeCancel: fn(),
		originalIndex: 0,
	}}
/>

<Story
	name="With Succession"
	args={{
		card: cardWithSuccession,
		onSwipeStart: fn(),
		onSwipeMove: fn(),
		onSwipeEnd: fn(),
		onSwipeCancel: fn(),
		originalIndex: 0,
	}}
/>

<Story
	name="With Both Coin and Succession"
	args={{
		card: cardWithBoth,
		onSwipeStart: fn(),
		onSwipeMove: fn(),
		onSwipeEnd: fn(),
		onSwipeCancel: fn(),
		originalIndex: 0,
	}}
/>

<Story
	name="UniqueCard with Varying Values"
	args={{
		card: uniqueCardWithVaryingValues,
		onSwipeStart: fn(),
		onSwipeMove: fn(),
		onSwipeEnd: fn(),
		onSwipeCancel: fn(),
		originalIndex: 0,
	}}
/>
