<script lang="ts">
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { getCardState, toggleExclude, togglePin } from "$lib/stores/card-state.svelte";

	type Props = {
		card: CommonCard;
	};

	let { card }: Props = $props();

	const state = $derived(getCardState(card.id));

	function handleTogglePin() {
		togglePin(card.id);
	}

	function handleToggleExclude() {
		toggleExclude(card.id);
	}
</script>

<!-- Visual feedback based on state -->
<div
	class={`
    card-container
    ${state === "pinned" ? "bg-blue-100 border-blue-500" : ""}
    ${state === "excluded" ? "bg-gray-100 opacity-60" : ""}
    border rounded p-4
  `}
>
	<!-- Card content -->
	<div class="card-content">
		<h3 class={state === "excluded" ? "line-through" : ""}>
			{card.name}
		</h3>
		<p class="text-sm text-gray-600">{card.category}</p>
	</div>

	<!-- Action buttons -->
	<div class="flex gap-2 mt-2">
		<!-- Pin button -->
		<button
			type="button"
			onclick={handleTogglePin}
			class={`
        px-3 py-1 rounded
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${state === "pinned" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}
      `}
			aria-pressed={state === "pinned"}
		>
			{state === "pinned" ? "📌 ピン中" : "📌 ピン"}
		</button>

		<!-- Exclude button -->
		<button
			type="button"
			onclick={handleToggleExclude}
			class={`
        px-3 py-1 rounded
        focus:outline-none focus:ring-2 focus:ring-red-500
        ${state === "excluded" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"}
      `}
			aria-pressed={state === "excluded"}
		>
			{state === "excluded" ? "🚫 除外中" : "🚫 除外"}
		</button>
	</div>
</div>
