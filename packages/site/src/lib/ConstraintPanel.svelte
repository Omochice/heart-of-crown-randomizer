<script lang="ts">
	import type { Constraint, SelectionContext } from "@heart-of-crown-randomizer/constraint";
	import { validateCombination } from "@heart-of-crown-randomizer/constraint";
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { getEnabledConstraintIds, toggleConstraint } from "$lib/stores/constraint-state.svelte";
	import { getPinnedCards } from "$lib/stores/card-state.svelte";
	import { SlidersHorizontal, ChevronUp, ChevronDown, Check } from "lucide-svelte";

	type Props = {
		constraints: readonly Constraint[];
		allCards: CommonCard[];
		excludedIds: ReadonlySet<number>;
		count: number;
	};

	let { constraints, allCards, excludedIds, count }: Props = $props();
	let expanded = $state(true);

	const enabledIds = $derived(getEnabledConstraintIds());
	const enabledCount = $derived(enabledIds.size);
	const selectionContext = $derived.by(() => {
		const pinnedCards = getPinnedCards(allCards);
		const pinnedIds = new Set(pinnedCards.map((c) => c.id));
		const pool = allCards.filter((c) => !excludedIds.has(c.id) && !pinnedIds.has(c.id));
		return { pool, required: [...pinnedCards], count, rng: Math.random } satisfies SelectionContext;
	});

	/**
	 * We always allow disabling an already-enabled constraint. For enabling,
	 * we simulate the new combination and check validity via validateCombination
	 * rather than checking canApply alone, because constraints may conflict
	 * with each other even when individually applicable.
	 */
	function canToggle(constraint: Constraint): boolean {
		if (enabledIds.has(constraint.id)) return true;

		const hypothetical = constraints.filter((c) => enabledIds.has(c.id) || c.id === constraint.id);
		return validateCombination(hypothetical, selectionContext);
	}

	function handleToggle(constraint: Constraint) {
		if (!canToggle(constraint)) return;
		toggleConstraint(constraint.id);
	}
</script>

<div class="constraint-panel">
	<button
		type="button"
		class="constraint-toggle-header"
		aria-label="制約条件 {enabledCount}"
		aria-expanded={expanded}
		aria-controls="constraint-panel"
		onclick={() => (expanded = !expanded)}
	>
		<span class="constraint-toggle-left">
			<SlidersHorizontal size={12} />
			<span class="constraint-label">制約条件</span>
			{#if enabledCount > 0}
				<span class="constraint-badge">{enabledCount}</span>
			{/if}
		</span>
		{#if expanded}
			<ChevronUp size={14} />
		{:else}
			<ChevronDown size={14} />
		{/if}
	</button>

	{#if expanded}
		<div
			class="constraint-list"
			id="constraint-panel"
		>
			{#each constraints as constraint, i (constraint.id)}
				{#if i > 0}
					<div class="constraint-divider"></div>
				{/if}
				{@const checked = enabledIds.has(constraint.id)}
				{@const disabled = !canToggle(constraint)}
				<button
					type="button"
					class="constraint-item"
					class:constraint-item--disabled={disabled}
					role="checkbox"
					aria-checked={checked}
					aria-disabled={disabled}
					{disabled}
					onclick={() => handleToggle(constraint)}
				>
					<span
						class="constraint-checkbox"
						class:constraint-checkbox--checked={checked}
					>
						{#if checked}
							<Check size={9} />
						{/if}
					</span>
					<span
						class="constraint-item-label"
						class:constraint-item-label--checked={checked}
						class:constraint-item-label--disabled={disabled}
					>
						{constraint.label}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.constraint-panel {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.constraint-toggle-header {
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

	.constraint-toggle-left {
		display: flex;
		align-items: center;
		gap: 5px;
		color: var(--text-secondary);
	}

	.constraint-label {
		font-size: 10px;
		font-weight: 600;
		color: var(--text-secondary);
	}

	.constraint-badge {
		font-size: 9px;
		font-weight: 700;
		color: var(--accent-indigo);
		background: var(--bg-accent-indigo-light);
		padding: 1px 6px;
		border-radius: 8px;
	}

	.constraint-list {
		background: var(--bg-card);
		border-radius: 8px;
		overflow: hidden;
	}

	.constraint-divider {
		height: 1px;
		background: var(--border-subtle);
	}

	.constraint-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px;
		width: 100%;
		border: none;
		background: transparent;
		cursor: pointer;
	}

	.constraint-item--disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.constraint-checkbox {
		width: 14px;
		height: 14px;
		border-radius: 3px;
		border: 1.5px solid var(--border-default);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.constraint-checkbox--checked {
		background: var(--accent-indigo);
		border-color: var(--accent-indigo);
		color: white;
	}

	.constraint-item-label {
		font-size: 10px;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.constraint-item-label--checked {
		color: var(--text-primary);
	}

	.constraint-item-label--disabled {
		color: var(--text-tertiary);
	}
</style>
