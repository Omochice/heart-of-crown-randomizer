<script lang="ts">
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import type { Constraint, SelectionContext } from "@heart-of-crown-randomizer/constraint";
	import { Bug, X } from "lucide-svelte";
	import {
		getEnabledConstraintIds,
		getEnabledConstraints,
	} from "$lib/stores/constraint-state.svelte";

	type Props = {
		/** Available constraints */
		constraints: readonly Constraint[];
		/** Currently selected cards from the draw */
		selectedCards: readonly CommonCard[];
		/** All common cards in the game */
		allCards: CommonCard[];
		/** Cards pinned by the user */
		pinnedCards: CommonCard[];
		/** IDs of cards excluded from the draw pool */
		excludedIds: ReadonlySet<number>;
		/** Number of cards to select */
		count: number;
	};

	let { constraints, selectedCards, allCards, pinnedCards, excludedIds, count }: Props = $props();
	let isOpen = $state(false);

	const enabledIds = $derived(getEnabledConstraintIds());

	const constraintStatus = $derived(
		constraints.map((c) => ({
			id: c.id,
			label: c.label,
			enabled: enabledIds.has(c.id),
		})),
	);

	const constraintSatisfaction = $derived.by(() => {
		return constraints
			.filter((c) => enabledIds.has(c.id))
			.map((c) => ({
				id: c.id,
				label: c.label,
				satisfied: selectedCards.length > 0 ? c.isSatisfied(selectedCards) : null,
			}));
	});

	const excludedCards = $derived(
		allCards.filter((c) => excludedIds.has(c.id)).sort((a, b) => a.id - b.id),
	);

	const drawablePool = $derived.by(() => {
		const pinnedIds = new Set(pinnedCards.map((c) => c.id));
		const filteredPool = allCards.filter(
			(card) => !excludedIds.has(card.id) && !pinnedIds.has(card.id),
		);

		let context: SelectionContext = {
			pool: filteredPool,
			required: [...pinnedCards],
			count,
			rng: () => 0.5,
		};

		const enabledConstraints = getEnabledConstraints(constraints);
		for (const constraint of enabledConstraints) {
			if (constraint.canApply(context)) {
				context = constraint.apply(context);
			}
		}

		return context.pool.sort((a, b) => a.id - b.id);
	});
</script>

<button
	type="button"
	class="debug-fab"
	aria-label={isOpen ? "Close debug panel" : "Open debug panel"}
	onclick={() => (isOpen = !isOpen)}
>
	{#if isOpen}
		<X size={20} />
	{:else}
		<Bug size={20} />
	{/if}
</button>

{#if isOpen}
	<div
		class="debug-panel"
		role="complementary"
		aria-label="Debug panel"
	>
		<section class="debug-section">
			<h3 class="debug-section-title">Constraints</h3>
			<ul class="debug-list">
				{#each constraintStatus as cs (cs.id)}
					<li class="debug-list-item">
						<span
							class="debug-indicator"
							class:debug-indicator--on={cs.enabled}
							class:debug-indicator--off={!cs.enabled}
						></span>
						<span class="debug-list-label">{cs.label}</span>
						<span
							class="debug-badge"
							class:debug-badge--enabled={cs.enabled}
						>
							{cs.enabled ? "ON" : "OFF"}
						</span>
					</li>
				{/each}
			</ul>
		</section>

		<section class="debug-section">
			<h3 class="debug-section-title">Satisfaction</h3>
			{#if constraintSatisfaction.length === 0}
				<p class="debug-empty">No active constraints.</p>
			{:else}
				<ul class="debug-list">
					{#each constraintSatisfaction as cs (cs.id)}
						<li class="debug-list-item">
							<span
								class="debug-indicator"
								class:debug-indicator--pass={cs.satisfied === true}
								class:debug-indicator--fail={cs.satisfied === false}
								class:debug-indicator--na={cs.satisfied === null}
							></span>
							<span class="debug-list-label">{cs.label}</span>
							<span
								class="debug-badge"
								class:debug-badge--pass={cs.satisfied === true}
								class:debug-badge--fail={cs.satisfied === false}
							>
								{#if cs.satisfied === null}
									N/A
								{:else if cs.satisfied}
									PASS
								{:else}
									FAIL
								{/if}
							</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		{#snippet cardList(cards: CommonCard[])}
			{#if cards.length > 0}
				<ul class="debug-pool-list">
					{#each cards as card (card.id)}
						<li class="debug-pool-item">
							<span class="debug-pool-cost">{card.cost}</span>
							<span class="debug-pool-name">{card.name}</span>
						</li>
					{/each}
				</ul>
			{/if}
		{/snippet}

		<section class="debug-section">
			<h3 class="debug-section-title">Pinned ({pinnedCards.length})</h3>
			{@render cardList(pinnedCards)}
		</section>

		<section class="debug-section">
			<h3 class="debug-section-title">Excluded ({excludedCards.length})</h3>
			{@render cardList(excludedCards)}
		</section>

		<section class="debug-section">
			<h3 class="debug-section-title">Drawable Pool ({drawablePool.length})</h3>
			{@render cardList(drawablePool)}
		</section>
	</div>
{/if}

<style>
	.debug-fab {
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 50;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1px solid var(--border-default);
		background: var(--bg-card);
		color: var(--text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		transition: background 0.15s;
	}

	.debug-fab:hover {
		background: var(--bg-primary);
	}

	.debug-panel {
		position: fixed;
		bottom: 72px;
		right: 16px;
		z-index: 49;
		width: 320px;
		max-height: 70vh;
		overflow-y: auto;
		background: var(--bg-card);
		border: 1px solid var(--border-default);
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		display: flex;
		flex-direction: column;
	}

	.debug-section {
		padding: 10px 12px;
	}

	.debug-section + .debug-section {
		border-top: 1px solid var(--border-subtle);
	}

	.debug-section-title {
		font-size: 10px;
		font-weight: 700;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0 0 6px;
	}

	.debug-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.debug-list-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		color: var(--text-primary);
	}

	.debug-list-label {
		flex: 1;
		min-width: 0;
	}

	.debug-indicator {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.debug-indicator--on {
		background: var(--accent-green);
	}

	.debug-indicator--off {
		background: var(--text-tertiary);
	}

	.debug-indicator--pass {
		background: var(--accent-green);
	}

	.debug-indicator--fail {
		background: var(--accent-red);
	}

	.debug-indicator--na {
		background: var(--text-tertiary);
	}

	.debug-badge {
		font-size: 9px;
		font-weight: 700;
		padding: 1px 5px;
		border-radius: 6px;
		color: var(--text-tertiary);
		background: var(--border-subtle);
		flex-shrink: 0;
	}

	.debug-badge--enabled {
		color: var(--accent-indigo);
		background: var(--bg-accent-indigo-light);
	}

	.debug-badge--pass {
		color: var(--accent-green);
		background: var(--bg-accent-green-light);
	}

	.debug-badge--fail {
		color: var(--accent-red);
		background: var(--bg-accent-coral-light);
	}

	.debug-empty {
		font-size: 11px;
		color: var(--text-tertiary);
		margin: 0;
	}

	.debug-pool-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
		max-height: 200px;
		overflow-y: auto;
	}

	.debug-pool-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		color: var(--text-primary);
		padding: 2px 0;
	}

	.debug-pool-cost {
		font-size: 10px;
		font-weight: 700;
		color: var(--text-secondary);
		width: 16px;
		text-align: right;
		flex-shrink: 0;
	}

	.debug-pool-name {
		flex: 1;
		min-width: 0;
	}
</style>
