<script
	module
	lang="ts"
>
	import { defineMeta } from "@storybook/addon-svelte-csf";
	import AppMenu from "./AppMenu.svelte";

	const { Story } = defineMeta({
		title: "Components/AppMenu",
		component: AppMenu,
		parameters: {
			docs: {
				description: {
					component: "Application menu with bug report functionality.",
				},
			},
		},
	});
</script>

<Story
	name="Default"
	args={{
		selectedCardIds: [1, 3, 5, 7],
		pinnedIds: new Set([1, 3]),
		excludedIds: new Set([10, 20]),
		constraintIds: new Set([5]),
	}}
/>
