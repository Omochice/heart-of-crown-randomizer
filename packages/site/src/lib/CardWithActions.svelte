<script lang="ts">
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { getCardState, toggleExclude, togglePin } from "$lib/stores/card-state.svelte";

	type Props = {
		card: CommonCard;
	};

	let { card }: Props = $props();

	const state = $derived(getCardState(card.id));
	const isPinned = $derived(state === "pinned");
	const isExcluded = $derived(state === "excluded");

	function handleTogglePin() {
		togglePin(card.id);
	}

	function handleToggleExclude() {
		toggleExclude(card.id);
	}
</script>

<!-- Visual feedback based on state -->
<div
	class="border rounded p-4 {isPinned ? 'bg-blue-100 border-blue-500' : ''} {isExcluded
		? 'bg-gray-100 opacity-60'
		: ''}"
>
	<!-- Card content -->
	<div class="card-content">
		<h3 class:line-through={isExcluded}>
			{card.name}
		</h3>
		<p class="text-sm text-gray-600">コスト: {card.cost}</p>
	</div>

	<!-- Action buttons -->
	<div class="flex gap-2 mt-2">
		<!-- Pin button -->
		<button
			type="button"
			onclick={handleTogglePin}
			class="px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 {isPinned
				? 'bg-blue-500 text-white'
				: 'bg-gray-200 text-gray-700'}"
			aria-pressed={isPinned}
		>
			{isPinned ? "📌 ピン中" : "📌 ピン"}
		</button>

		<!-- Exclude button -->
		<button
			type="button"
			onclick={handleToggleExclude}
			class="px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 {isExcluded
				? 'bg-red-500 text-white'
				: 'bg-gray-200 text-gray-700'}"
			aria-pressed={isExcluded}
		>
			{isExcluded ? "🚫 除外中" : "🚫 除外"}
		</button>
	</div>
</div>
