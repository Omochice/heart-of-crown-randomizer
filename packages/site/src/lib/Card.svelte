<script lang="ts">
	import { type CommonCard, Edition } from "@heart-of-crown-randomizer/card/type";

	export let common: CommonCard;
	export let onRemove: (index: number) => void;
	export let onSwipeStart: (e: MouseEvent | TouchEvent, index: number) => void;
	export let onSwipeMove: (e: TouchEvent | MouseEvent) => void;
	export let onSwipeEnd: () => void;
	export let onSwipeCancel: () => void;
	export let originalIndex: number;
	export let isPinned: boolean = false;
	export let onTogglePin: (common: CommonCard) => void;

	$: borderColor = common.edition === Edition.BASIC ? "border-blue-300" : "border-orange-300";
	$: textColor = common.edition === Edition.BASIC ? "text-blue-600" : "text-orange-600";

	// Get highlight style based on link value
	function getLinkHighlightClass(link: 0 | 1 | 2) {
		switch (link) {
			case 1:
				return "link-1";
			case 2:
				return "link-2";
			default:
				return "";
		}
	}
</script>

<div
	role="button"
	tabindex="0"
	aria-label="カード {common.name} をスワイプして削除"
	class="border-2 {borderColor} rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 relative card-common {getLinkHighlightClass(
		common.hasChild ? 0 : common.link,
	)} select-none cursor-grab active:cursor-grabbing {isPinned ? 'pinned' : ''}"
	on:mousedown={(e) => onSwipeStart(e, originalIndex)}
	on:touchstart={(e) => onSwipeStart(e, originalIndex)}
	on:touchmove={(e) => onSwipeMove(e)}
	on:touchend={() => onSwipeEnd()}
	on:touchcancel={() => onSwipeCancel()}
	on:keydown={(e) => {
		if (e.key === "Delete" || e.key === "Backspace") onRemove(originalIndex);
	}}
>
	<button
		on:click|stopPropagation={() => onRemove(originalIndex)}
		class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
		title="このカードを削除する"
	>
		✕
	</button>
	<button
		on:click|stopPropagation={() => onTogglePin(common)}
		class="absolute top-1 left-1 w-6 h-6 {isPinned ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 hover:bg-gray-500'} text-white rounded-full flex items-center justify-center text-xs transition-colors"
		title={isPinned ? "このカードのピンを外す" : "このカードをピンする"}
	>
		📌
	</button>
	<div class={textColor}>
		<div class="font-bold text-sm mb-1">{common.name}</div>
		<div class="text-xs text-gray-600">
			コスト: {common.cost}
			{#if "coin" in common && common.coin}
				| コイン: {common.coin}
			{/if}
			{#if "succession" in common && common.succession}
				| 継承点: {common.succession}
			{/if}
		</div>
	</div>
</div>

<style>
	/* Common card style - green border */
	.card-common {
		box-shadow: 3px 3px 0 #059669;
		touch-action: pan-y; /* Allow vertical scrolling, control horizontal with swipe */
		will-change: transform, opacity; /* Optimize for animations */
	}

	/* Pinned card style - golden border and glow effect */
	.card-common.pinned {
		box-shadow: 3px 3px 0 #f59e0b, 0 0 10px rgba(245, 158, 11, 0.3);
		border-color: #f59e0b !important;
		background: linear-gradient(145deg, #ffffff, #fffbf5);
	}

	/* Card style during swipe */
	.card-common:active {
		cursor: grabbing;
	}
	/* Link 1: Yellow highlight on right side */
	.link-1 {
		box-shadow:
			3px 0 0 #fbbf24,
			3px 3px 0 #059669;
	}

	/* Link 2: Yellow highlight on right and bottom */
	.link-2 {
		box-shadow:
			3px 0 0 #fbbf24,
			0 3px 0 #fbbf24,
			3px 3px 0 #fbbf24;
	}

	/* Override link styles for pinned cards */
	.card-common.pinned.link-1 {
		box-shadow:
			3px 0 0 #fbbf24,
			3px 3px 0 #f59e0b,
			0 0 10px rgba(245, 158, 11, 0.3);
	}

	.card-common.pinned.link-2 {
		box-shadow:
			3px 0 0 #fbbf24,
			0 3px 0 #fbbf24,
			3px 3px 0 #fbbf24,
			0 0 10px rgba(245, 158, 11, 0.3);
	}
</style>
