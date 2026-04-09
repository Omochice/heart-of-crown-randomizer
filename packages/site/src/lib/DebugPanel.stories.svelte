<script
	module
	lang="ts"
>
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { Edition } from "@heart-of-crown-randomizer/card/type";
	import type { Constraint, SelectionContext } from "@heart-of-crown-randomizer/constraint";
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import DebugPanel from "./DebugPanel.svelte";

	const sampleCards: CommonCard[] = [
		{
			id: 1,
			type: "common",
			name: "隠れ家",
			cost: 2,
			hasChild: false,
			mainType: ["action"],
			link: 1,
			effect: "Example effect",
			edition: Edition.BASIC,
		},
		{
			id: 2,
			type: "common",
			name: "都市開発",
			cost: 3,
			hasChild: false,
			mainType: ["action"],
			link: 0,
			effect: "Example effect",
			edition: Edition.BASIC,
		},
		{
			id: 3,
			type: "common",
			name: "交易船",
			cost: 4,
			hasChild: false,
			mainType: ["action"],
			link: 1,
			effect: "Example effect",
			edition: Edition.BASIC,
		},
		{
			id: 4,
			type: "common",
			name: "魔法の絨毯",
			cost: 5,
			hasChild: false,
			mainType: ["action"],
			link: 2,
			effect: "Example effect",
			edition: Edition.FAR_EASTERN_BORDER,
		},
	];

	const sampleConstraints: Constraint[] = [
		{
			id: 1,
			label: "コスト2〜5",
			canApply: (_context: Readonly<SelectionContext>) => true,
			apply: (context: SelectionContext) => context,
			isSatisfied: (_cards: readonly CommonCard[]) => true,
		},
		{
			id: 2,
			label: "リンクあり",
			canApply: (_context: Readonly<SelectionContext>) => true,
			apply: (context: SelectionContext) => context,
			isSatisfied: (_cards: readonly CommonCard[]) => false,
		},
	];

	const { Story } = defineMeta({
		title: "Components/DebugPanel",
		component: DebugPanel,
		parameters: {
			docs: {
				description: {
					component: "Debug panel showing constraint status and card pool details.",
				},
			},
		},
	});
</script>

<Story
	name="Default"
	args={{
		constraints: sampleConstraints,
		selectedCards: [sampleCards[0], sampleCards[2]],
		allCards: sampleCards,
		pinnedCards: [sampleCards[0]],
		excludedIds: new Set([4]),
		count: 10,
	}}
/>
