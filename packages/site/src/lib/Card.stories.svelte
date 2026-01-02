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
