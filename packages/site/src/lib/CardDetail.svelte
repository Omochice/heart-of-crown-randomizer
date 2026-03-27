<script lang="ts">
	import type { CommonCard, MainType } from "@heart-of-crown-randomizer/card/type";
	import { X, Layers, Coins } from "lucide-svelte";
	import { fly, fade } from "svelte/transition";

	type Props = {
		card: CommonCard;
		onClose: () => void;
	};

	let { card, onClose }: Props = $props();

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

	const effect = $derived(card.hasChild ? (card.cards[0]?.effect ?? "") : card.effect);

	const linkCount = $derived(card.hasChild ? (card.cards[0]?.link ?? 0) : card.link);

	const succession = $derived(
		card.hasChild ? (card.cards[0]?.succession ?? undefined) : card.succession,
	);

	const coin = $derived(card.hasChild ? (card.cards[0]?.coin ?? undefined) : card.coin);

	function handleBackdropClick() {
		onClose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape") onClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="detail-backdrop"
	transition:fade={{ duration: 200 }}
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="detail-sheet"
		role="dialog"
		tabindex="-1"
		aria-label="カード詳細: {card.name}"
		transition:fly={{ y: 400, duration: 300 }}
		onclick={(e) => e.stopPropagation()}
	>
		<div class="detail-handle"></div>

		<div class="detail-content">
			<div class="detail-header">
				<h2 class="detail-title">{card.name}</h2>
				<span
					class="detail-dot"
					style:background-color={stripColor}
				></span>
				<button
					type="button"
					class="detail-close"
					onclick={onClose}
					aria-label="閉じる"
				>
					<X size={16} />
				</button>
			</div>

			<div class="detail-meta">
				<span
					class="detail-badge detail-badge--category"
					style:background-color={stripColor}
				>
					{categoryLabel}
				</span>
				<span class="detail-badge detail-badge--cost">
					コスト {card.cost}
				</span>
				{#if linkCount > 0}
					<span class="detail-badge detail-badge--link">
						<Layers size={12} />
						リンク {linkCount}
					</span>
				{/if}
			</div>

			{#if succession !== undefined}
				<div class="detail-info-row">
					<span class="detail-info-label">継承点</span>
					<span class="detail-info-value">{succession}</span>
				</div>
			{/if}

			{#if coin !== undefined}
				<div class="detail-info-row">
					<Coins size={14} />
					<span class="detail-info-label">コイン</span>
					<span class="detail-info-value">{coin}</span>
				</div>
			{/if}

			<div class="detail-divider"></div>

			{#if effect}
				<div class="detail-section">
					<h3 class="detail-section-label">カード説明</h3>
					<p class="detail-effect">{effect}</p>
				</div>
			{/if}

			{#if card.hasChild && card.cards.length > 1}
				<div class="detail-section">
					<h3 class="detail-section-label">バリエーション</h3>
					{#each card.cards as variant, i}
						<div class="detail-variant">
							<span class="detail-variant-name">{variant.name}</span>
							<span class="detail-variant-effect">{variant.effect}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.detail-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 50;
		display: flex;
		align-items: flex-end;
		justify-content: center;
	}

	.detail-sheet {
		background: var(--bg-primary);
		border-radius: 24px 24px 0 0;
		width: 100%;
		max-width: 48rem;
		max-height: 80vh;
		overflow-y: auto;
		padding-top: 12px;
	}

	.detail-handle {
		width: 40px;
		height: 4px;
		border-radius: 2px;
		background: var(--border-default);
		margin: 0 auto 16px;
	}

	.detail-content {
		padding: 0 24px 34px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.detail-header {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.detail-title {
		font-size: 24px;
		font-weight: 700;
		color: var(--text-primary);
		flex: 1;
		margin: 0;
	}

	.detail-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.detail-close {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid var(--border-default);
		background: var(--bg-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--text-secondary);
		flex-shrink: 0;
		padding: 0;
	}

	.detail-close:hover {
		background: var(--bg-card);
	}

	.detail-meta {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.detail-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
	}

	.detail-badge--category {
		color: white;
	}

	.detail-badge--cost {
		background: var(--bg-card);
		color: var(--text-secondary);
	}

	.detail-badge--link {
		background: var(--bg-card);
		color: var(--text-secondary);
	}

	.detail-info-row {
		display: flex;
		align-items: center;
		gap: 6px;
		color: var(--text-secondary);
		font-size: 13px;
	}

	.detail-info-label {
		font-weight: 600;
	}

	.detail-info-value {
		color: var(--text-primary);
	}

	.detail-divider {
		height: 1px;
		background: var(--border-default);
	}

	.detail-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.detail-section-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		margin: 0;
	}

	.detail-effect {
		font-size: 14px;
		color: var(--text-primary);
		line-height: 1.6;
		margin: 0;
		white-space: pre-wrap;
	}

	.detail-variant {
		padding: 8px 12px;
		background: var(--bg-card);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.detail-variant-name {
		font-size: 12px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.detail-variant-effect {
		font-size: 12px;
		color: var(--text-secondary);
		white-space: pre-wrap;
	}
</style>
