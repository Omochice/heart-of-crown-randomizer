<script lang="ts">
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { Ban, ChevronDown, ChevronUp, X } from "lucide-svelte";
	import { toggleExclude } from "$lib/stores/card-state.svelte";
	import { getCategoryLabel, getStripColor } from "$lib/utils/card-display";

	type Props = {
		cards: CommonCard[];
	};

	let { cards }: Props = $props();

	let expanded = $state(true);

	function handleRemove(cardId: number) {
		toggleExclude(cardId);
	}
</script>

<div class="exclude-list">
	<button
		type="button"
		class="exclude-toggle-header"
		aria-label="除外 {cards.length}"
		aria-expanded={expanded}
		aria-controls="exclude-panel"
		onclick={() => (expanded = !expanded)}
	>
		<span class="exclude-toggle-left">
			<Ban size={12} />
			<span class="exclude-label">除外</span>
			{#if cards.length > 0}
				<span class="exclude-badge">{cards.length}</span>
			{/if}
		</span>
		{#if expanded && cards.length > 0}
			<ChevronUp size={14} />
		{:else}
			<ChevronDown size={14} />
		{/if}
	</button>

	{#if expanded && cards.length > 0}
		<div
			class="exclude-card-list"
			id="exclude-panel"
		>
			{#each cards as card, i (card.id)}
				{#if i > 0}
					<div class="exclude-divider"></div>
				{/if}
				<div class="exclude-row">
					<div
						class="exclude-strip"
						style:background-color={getStripColor(card)}
					></div>
					<span
						class="exclude-category"
						style:color={getStripColor(card)}>{getCategoryLabel(card)}</span
					>
					<span class="exclude-card-name">{card.name}</span>
					<span class="exclude-cost">{card.cost}</span>
					<button
						type="button"
						class="exclude-remove-btn"
						aria-label="除外解除 {card.name}"
						onclick={() => handleRemove(card.id)}
					>
						<X size={10} />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.exclude-list {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.exclude-toggle-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: var(--bg-card);
		border: none;
		border-radius: 8px;
		padding: 7px 10px;
		cursor: pointer;
		color: var(--text-tertiary);
	}

	.exclude-toggle-left {
		display: flex;
		align-items: center;
		gap: 5px;
		color: var(--accent-coral);
	}

	.exclude-label {
		font-size: 10px;
		font-weight: 600;
		color: var(--accent-coral);
	}

	.exclude-badge {
		font-size: 9px;
		font-weight: 700;
		color: var(--accent-coral);
		background: var(--bg-accent-coral-light);
		padding: 1px 6px;
		border-radius: 8px;
	}

	.exclude-card-list {
		background: var(--bg-card);
		border-radius: 8px;
		overflow: hidden;
	}

	.exclude-divider {
		height: 1px;
		background: var(--border-subtle);
	}

	.exclude-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
	}

	.exclude-strip {
		width: 3px;
		border-radius: 2px;
		align-self: stretch;
	}

	.exclude-category {
		font-size: 9px;
		font-weight: 600;
		flex-shrink: 0;
	}

	.exclude-card-name {
		font-size: 11px;
		font-weight: 600;
		color: var(--text-primary);
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.exclude-cost {
		font-size: 10px;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.exclude-remove-btn {
		width: 18px;
		height: 18px;
		border-radius: 9px;
		border: none;
		background: var(--bg-accent-coral-light);
		color: var(--accent-coral);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
		padding: 0;
	}
</style>
