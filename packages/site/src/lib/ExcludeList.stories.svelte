<script
	module
	lang="ts"
>
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { Edition } from "@heart-of-crown-randomizer/card/type";
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import ExcludeList from "./ExcludeList.svelte";

	const sampleCards: CommonCard[] = [
		{
			id: 1,
			type: "common",
			name: "隠れ家",
			cost: 2,
			hasChild: false,
			mainType: ["action"],
			link: 1,
			effect: "Example",
			edition: Edition.BASIC,
		},
		{
			id: 2,
			type: "common",
			name: "呪詛の魔女",
			cost: 4,
			hasChild: false,
			mainType: ["attack"],
			link: 0,
			effect: "Example",
			edition: Edition.BASIC,
		},
		{
			id: 3,
			type: "common",
			name: "大都市",
			cost: 5,
			hasChild: false,
			mainType: ["territory"],
			link: 2,
			effect: "Example",
			edition: Edition.FAR_EASTERN_BORDER,
		},
	];

	const { Story } = defineMeta({
		title: "Components/ExcludeList",
		component: ExcludeList,
		parameters: {
			docs: {
				description: {
					component: "Collapsible list displaying excluded cards with option to restore them.",
				},
			},
		},
	});
</script>

<Story
	name="Default"
	args={{
		cards: sampleCards,
	}}
/>

<Story
	name="Empty"
	args={{
		cards: [],
	}}
/>
