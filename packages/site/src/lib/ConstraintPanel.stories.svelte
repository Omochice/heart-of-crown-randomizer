<script
	module
	lang="ts"
>
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { Edition } from "@heart-of-crown-randomizer/card/type";
	import type { Constraint, SelectionContext } from "@heart-of-crown-randomizer/constraint";
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import ConstraintPanel from "./ConstraintPanel.svelte";

	const sampleCards: CommonCard[] = [
		{
			id: 1,
			type: "common",
			name: "Sample Card A",
			cost: 3,
			hasChild: false,
			mainType: ["action"],
			link: 1,
			effect: "Example effect A",
			edition: Edition.BASIC,
		},
		{
			id: 2,
			type: "common",
			name: "Sample Card B",
			cost: 5,
			hasChild: false,
			mainType: ["action"],
			link: 2,
			effect: "Example effect B",
			edition: Edition.BASIC,
		},
	];

	const sampleConstraints: Constraint[] = [
		{
			id: 1,
			label: "コスト3以下を含む",
			canApply: () => true,
			apply: (ctx: SelectionContext) => ctx,
			isSatisfied: () => true,
		},
		{
			id: 2,
			label: "リンク2以上を含む",
			canApply: () => true,
			apply: (ctx: SelectionContext) => ctx,
			isSatisfied: () => true,
		},
	];

	const { Story } = defineMeta({
		title: "Components/ConstraintPanel",
		component: ConstraintPanel,
		parameters: {
			docs: {
				description: {
					component: "Panel for toggling card selection constraints.",
				},
			},
		},
	});
</script>

<Story
	name="Default"
	args={{
		constraints: sampleConstraints,
		allCards: sampleCards,
		excludedIds: new Set(),
		count: 10,
	}}
/>

<Story
	name="Empty"
	args={{
		constraints: [],
		allCards: sampleCards,
		excludedIds: new Set(),
		count: 10,
	}}
/>
