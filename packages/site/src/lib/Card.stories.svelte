<script
	module
	lang="ts"
>
	import { defineMeta } from "@storybook/addon-svelte-csf";
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

	function handleSwipeStart(e: MouseEvent | TouchEvent, index: number) {
		console.log("Swipe start", { event: e.type, index });
	}

	function handleSwipeMove(e: MouseEvent | TouchEvent) {
		console.log("Swipe move", { event: e.type });
	}

	function handleSwipeEnd() {
		console.log("Swipe end");
	}

	function handleSwipeCancel() {
		console.log("Swipe cancel");
	}

	const { Story } = defineMeta({
		title: "Components/Card",
		component: Card,
	});
</script>

<Story
	name="Default"
	args={{
		card: sampleCard,
		onSwipeStart: handleSwipeStart,
		onSwipeMove: handleSwipeMove,
		onSwipeEnd: handleSwipeEnd,
		onSwipeCancel: handleSwipeCancel,
		originalIndex: 0,
	}}
/>
