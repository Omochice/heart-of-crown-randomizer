<script lang="ts">
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import type { MainType } from "@heart-of-crown-randomizer/card/type";
	import { getCardState, toggleExclude, togglePin } from "$lib/stores/card-state.svelte";
	import { Pin, Ban } from "lucide-svelte";

	type Props = {
		card: CommonCard;
		onSwipeStart: (e: MouseEvent | TouchEvent, index: number) => void;
		onSwipeMove: (e: TouchEvent | MouseEvent) => void;
		onSwipeEnd: () => void;
		onSwipeCancel: () => void;
		originalIndex: number;
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

	const mainTypeLabels: Record<MainType, string> = {
		action: "行動",
		attack: "攻撃",
		territory: "領地",
		succession: "継承",
		disaster: "災い",
		princess: "姫",
	};

	const primaryMainType = $derived<MainType>(
		card.hasChild ? (card.cards[0]?.mainType[0] ?? "action") : card.mainType[0],
	);

	const stripColor = $derived(primaryMainType === "attack" ? "#EF4444" : "var(--accent-indigo)");

	const categoryLabel = $derived(mainTypeLabels[primaryMainType]);

	const linkCount = $derived(card.hasChild ? (card.cards[0]?.link ?? 0) : card.link);

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
		if (e.key === "Enter" || e.key === " ") handleCardClick();
	}}
>
	<div
		class="card-strip"
		style:background-color={stripColor}
	></div>

	<div class="card-body">
		<span
			class="card-category"
			style:color={stripColor}>{categoryLabel}</span
		>

		<span
			class="card-name"
			class:line-through={isExcluded}>{card.name}</span
		>

		<span class="card-cost">{card.cost}</span>

		{#if linkCount > 0}
			<span class="card-links">
				{#each Array(linkCount) as _}
					<span class="card-link-dot"></span>
				{/each}
			</span>
		{/if}

		<button
			type="button"
			onclick={handleTogglePin}
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
		overflow: hidden;
		cursor: grab;
		user-select: none;
		touch-action: pan-y;
		will-change: transform, opacity;
		transition: box-shadow 0.15s ease;
	}

	.card-row:hover {
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
	}

	.card-row:active {
		cursor: grabbing;
	}

	.card-row--pinned {
		background-color: #eff6ff;
		box-shadow: inset 0 0 0 1px var(--accent-indigo);
	}

	.card-row--excluded {
		opacity: 0.6;
		background-color: var(--border-subtle);
	}

	.card-strip {
		width: 4px;
		flex-shrink: 0;
	}

	.card-body {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 9px 10px;
		flex: 1;
		min-width: 0;
	}

	.card-category {
		font-size: 9px;
		font-weight: 700;
		flex-shrink: 0;
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

	.card-cost {
		font-size: 10px;
		color: var(--text-secondary);
		flex-shrink: 0;
	}

	.card-links {
		display: flex;
		gap: 2px;
		flex-shrink: 0;
	}

	.card-link-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--accent-indigo);
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
		background: #ef4444;
		border-color: #ef4444;
		color: white;
	}
</style>
