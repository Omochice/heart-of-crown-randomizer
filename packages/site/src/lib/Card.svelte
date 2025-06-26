<script lang="ts">
	import type { CommonCard } from '@heart-of-crown-randomizer/card/type';

	export let common: CommonCard;
	export let cardType: 'basic' | 'far-eastern';
	export let onRemove: (index: number) => void;
	export let onSwipeStart: (e: MouseEvent | TouchEvent, index: number) => void;
	export let onSwipeMove: (e: TouchEvent) => void;
	export let onSwipeEnd: (e: TouchEvent) => void;
	export let onSwipeCancel: (e: TouchEvent) => void;
	export let getLinkHighlightClass: (link: number) => string;
	export let originalIndex: number;

	$: borderColor = cardType === 'basic' ? 'border-blue-300' : 'border-orange-300';
	$: textColor = cardType === 'basic' ? 'text-blue-600' : 'text-orange-600';
</script>

<div
	role="button"
	tabindex="0"
	aria-label="カード {common.name} をスワイプして削除"
	class="border-2 {borderColor} rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 relative card-common {getLinkHighlightClass(
		common.hasChild ? 0 : common.link,
	)} select-none cursor-grab active:cursor-grabbing"
	on:mousedown={(e) => onSwipeStart(e, originalIndex)}
	on:touchstart={(e) => onSwipeStart(e, originalIndex)}
	on:touchmove={onSwipeMove}
	on:touchend={onSwipeEnd}
	on:touchcancel={onSwipeCancel}
	on:keydown={(e) => {
		if (e.key === 'Delete' || e.key === 'Backspace') onRemove(originalIndex);
	}}
>
	<button
		on:click={() => onRemove(originalIndex)}
		class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
		title="このカードを削除する"
	>
		✕
	</button>
	<div class={textColor}>
		<div class="font-bold text-sm mb-1">{common.name}</div>
		<div class="text-xs text-gray-600">
			コスト: {common.cost}
			{#if 'coin' in common && common.coin}
				| コイン: {common.coin}
			{/if}
			{#if 'succession' in common && common.succession}
				| 継承点: {common.succession}
			{/if}
		</div>
	</div>
</div>