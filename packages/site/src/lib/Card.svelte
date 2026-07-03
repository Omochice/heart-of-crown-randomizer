<script lang="ts">
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { Ban, Pin } from "lucide-svelte";
	import { getCardState, toggleExclude, togglePin } from "$lib/stores/card-state.svelte";
	import { getCategoryLabels, getSubTypeLabel } from "$lib/utils/card-display";

	type Props = {
		/** Card data to render */
		card: CommonCard;
		/** Called when a swipe gesture begins */
		onSwipeStart: (e: MouseEvent | TouchEvent, index: number) => void;
		/** Called during a swipe gesture */
		onSwipeMove: (e: TouchEvent | MouseEvent) => void;
		/** Called when a swipe gesture completes */
		onSwipeEnd: () => void;
		/** Called when a swipe gesture is cancelled */
		onSwipeCancel: () => void;
		/** Original index of this card in the list, used for swipe tracking */
		originalIndex: number;
		/** Called when the card is clicked */
		onclick?: () => void;
	};

	let {
		card,
		onSwipeStart,
		onSwipeMove,
		onSwipeEnd,
		onSwipeCancel,
		originalIndex,
		onclick,
	}: Props = $props();

	const state = $derived(getCardState(card.id));
	const isPinned = $derived(state === "pinned");
	const isExcluded = $derived(state === "excluded");

	const categoryLabels = $derived(getCategoryLabels(card));
	const linkCount = $derived(card.hasChild ? 0 : card.link);
	const subTypeLabel = $derived(getSubTypeLabel(card));

	function handleTogglePin(e: MouseEvent) {
		e.stopPropagation();
		togglePin(card.id);
	}

	function handleToggleExclude(e: MouseEvent) {
		e.stopPropagation();
		toggleExclude(card.id);
	}

	function handleCardClick() {
		onclick?.();
	}
</script>

<div
	role="button"
	tabindex="0"
	aria-label="カード {card.name}"
	class="card-row card-swipeable"
	class:card-row--pinned={isPinned}
	class:card-row--excluded={isExcluded}
	onmousedown={(e) => onSwipeStart(e, originalIndex)}
	ontouchstart={(e) => onSwipeStart(e, originalIndex)}
	ontouchmove={(e) => onSwipeMove(e)}
	ontouchend={() => onSwipeEnd()}
	ontouchcancel={() => onSwipeCancel()}
	onclick={handleCardClick}
	onkeydown={(e) => {
		if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) handleCardClick();
	}}
>
	<div class="card-strip">
		{#each categoryLabels as cat (cat.label)}
			<div
				class="card-strip-segment"
				style:background-color={cat.color}
			></div>
		{/each}
	</div>

	<div class="card-body">
		<span class="card-categories">
			{#each categoryLabels as cat (cat.label)}
				<span
					class="card-category"
					style:color={cat.color}>{cat.label}</span
				>
			{/each}
		</span>

		<span
			class="card-name"
			class:line-through={isExcluded}>{card.name}</span
		>

		{#if subTypeLabel}
			<span class="card-subtype">{subTypeLabel}</span>
		{/if}

		<span class="card-cost">{card.cost}</span>

		<span class="card-links">
			{#if linkCount === 0}
				<span class="card-link-dot card-link-dot--gray"></span>
			{:else}
				{#each Array(linkCount) as _, i (i)}
					<span class="card-link-dot"></span>
				{/each}
			{/if}
		</span>

		<button
			type="button"
			onclick={handleTogglePin}
			onmousedown={(e) => e.stopPropagation()}
			ontouchstart={(e) => e.stopPropagation()}
			class="card-icon-btn"
			class:card-icon-btn--active-pin={isPinned}
			aria-label={isPinned ? "ピン中" : "ピン"}
			aria-pressed={isPinned}
		>
			<Pin size={11} />
		</button>

		<button
			type="button"
			onclick={handleToggleExclude}
			onmousedown={(e) => e.stopPropagation()}
			ontouchstart={(e) => e.stopPropagation()}
			class="card-icon-btn"
			class:card-icon-btn--active-exclude={isExcluded}
			aria-label={isExcluded ? "除外中" : "除外"}
			aria-pressed={isExcluded}
		>
			<Ban size={11} />
		</button>
	</div>
</div>

<style>
	.card-row {
		display: flex;
		border-radius: 10px;
		background-color: var(--bg-card);
		border: 1px solid transparent;
		overflow: hidden;
		cursor: grab;
		user-select: none;
		touch-action: pan-y;
		will-change: transform, opacity;
		transition: border-color 0.15s ease;
	}

	.card-row:hover {
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
	}

	.card-row:active {
		cursor: grabbing;
	}

	.card-row--pinned {
		background-color: var(--bg-pinned);
		border-color: var(--accent-indigo);
	}

	.card-row--excluded {
		opacity: 0.6;
		background-color: var(--border-subtle);
	}

	.card-strip {
		width: 4px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
	}

	.card-strip-segment {
		flex: 1;
	}

	.card-body {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 9px 10px;
		flex: 1;
		min-width: 0;
	}

	.card-categories {
		display: flex;
		gap: 2px;
		width: 40px;
		flex-shrink: 0;
	}

	.card-category {
		font-size: 9px;
		font-weight: 700;
	}

	.card-name {
		font-size: 12px;
		font-weight: 700;
		color: var(--text-primary);
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-subtype {
		font-size: 9px;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.card-cost {
		font-size: 10px;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.card-links {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
		width: 18px;
		justify-content: center;
		align-items: center;
	}

	.card-link-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--accent-indigo);
	}

	.card-link-dot--gray {
		background-color: var(--border-default);
	}

	.card-icon-btn {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 1px solid var(--border-default);
		background: var(--bg-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
		color: var(--text-tertiary);
		padding: 0;
	}

	.card-icon-btn:focus-visible {
		outline: 2px solid var(--accent-indigo);
		outline-offset: 1px;
	}

	.card-icon-btn--active-pin {
		background: var(--accent-indigo);
		border-color: var(--accent-indigo);
		color: white;
	}

	.card-icon-btn--active-exclude {
		background: var(--accent-red);
		border-color: var(--accent-red);
		color: white;
	}
</style>
