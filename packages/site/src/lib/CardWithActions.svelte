<script lang="ts">
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { getCardState, toggleExclude, togglePin } from "$lib/stores/card-state.svelte";

	type Props = {
		card: CommonCard;
		onSwipeStart: (e: MouseEvent | TouchEvent, index: number) => void;
		onSwipeMove: (e: TouchEvent | MouseEvent) => void;
		onSwipeEnd: () => void;
		onSwipeCancel: () => void;
		originalIndex: number;
	};

	let { card, onSwipeStart, onSwipeMove, onSwipeEnd, onSwipeCancel, originalIndex }: Props =
		$props();

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

<div
	role="button"
	tabindex="0"
	aria-label="カード {card.name}"
	class="border rounded p-4 select-none cursor-grab active:cursor-grabbing card-swipeable"
	class:bg-blue-100={isPinned}
	class:border-blue-500={isPinned}
	class:bg-gray-100={isExcluded}
	class:opacity-60={isExcluded}
	onmousedown={(e) => onSwipeStart(e, originalIndex)}
	ontouchstart={(e) => onSwipeStart(e, originalIndex)}
	ontouchmove={(e) => onSwipeMove(e)}
	ontouchend={() => onSwipeEnd()}
	ontouchcancel={() => onSwipeCancel()}
>
	<div class="card-content">
		<h3 class:line-through={isExcluded}>
			{card.name}
		</h3>
		<p class="text-sm text-gray-600">コスト: {card.cost}</p>
	</div>

	<div class="flex gap-2 mt-2">
		<button
			type="button"
			onclick={handleTogglePin}
			class="px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
			class:bg-blue-500={isPinned}
			class:text-white={isPinned}
			class:bg-gray-200={!isPinned}
			class:text-gray-700={!isPinned}
			aria-pressed={isPinned}
		>
			{isPinned ? "📌 ピン中" : "📌 ピン"}
		</button>

		<button
			type="button"
			onclick={handleToggleExclude}
			class="px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
			class:bg-red-500={isExcluded}
			class:text-white={isExcluded}
			class:bg-gray-200={!isExcluded}
			class:text-gray-700={!isExcluded}
			aria-pressed={isExcluded}
		>
			{isExcluded ? "🚫 除外中" : "🚫 除外"}
		</button>
	</div>
</div>

<style>
	.card-swipeable {
		touch-action: pan-y; /* Allow vertical scrolling, control horizontal with swipe */
		will-change: transform, opacity; /* Optimize for animations */
	}

	.card-swipeable:active {
		cursor: grabbing;
	}
</style>
