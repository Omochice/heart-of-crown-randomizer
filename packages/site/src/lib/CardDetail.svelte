<script lang="ts">
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { Coins, Layers, X } from "lucide-svelte";
	import { onMount } from "svelte";
	import { fade, fly } from "svelte/transition";
	import { getCategoryLabels } from "$lib/utils/card-display";
	import { swipeDownToDismiss } from "$lib/utils/swipe-down-to-dismiss";

	type Props = {
		/** Card data to display in the detail sheet */
		card: CommonCard;
		/** Callback to close the detail sheet */
		onClose: () => void;
	};

	let { card, onClose }: Props = $props();

	const categoryLabels = $derived(getCategoryLabels(card));

	const effect = $derived(card.hasChild ? "" : card.effect);

	const linkCount = $derived(card.hasChild ? 0 : card.link);

	const succession = $derived(card.hasChild ? undefined : card.succession);

	const coin = $derived(card.hasChild ? undefined : card.coin);

	let dialogRef: HTMLDialogElement;

	// `showModal` is what makes the background inert and the dialog top-layer;
	// the `open` attribute alone would not. Focus moves to the close button (the
	// only focusable descendant) automatically, so no manual focus is needed.
	//
	// `showModal` does not lock page scrolling, so the page behind would still
	// scroll; locking the body keeps the gesture contained to the sheet until
	// the sheet is dismissed.
	onMount(() => {
		dialogRef.showModal();
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});

	// A modal dialog reports backdrop clicks as clicks on the dialog itself, but
	// so are clicks on the dialog's own padding gutter. Comparing against the
	// sheet's bounds dismisses only when the click truly landed outside it.
	function handleDialogClick(event: MouseEvent) {
		const rect = dialogRef.getBoundingClientRect();
		const isOutsideSheet =
			event.clientX < rect.left ||
			event.clientX > rect.right ||
			event.clientY < rect.top ||
			event.clientY > rect.bottom;
		if (isOutsideSheet) {
			onClose();
		}
	}

	// Let Svelte's exit transition drive the close instead of the dialog closing
	// itself instantly, so the sheet animates out on Escape like every other path.
	function handleCancel(event: Event) {
		event.preventDefault();
		onClose();
	}
</script>

<div
	class="detail-backdrop"
	transition:fade={{ duration: 200 }}
	aria-hidden="true"
></div>

<dialog
	bind:this={dialogRef}
	class="detail-sheet"
	aria-label="カード詳細: {card.name}"
	transition:fly={{ y: 400, duration: 300 }}
	onclick={handleDialogClick}
	oncancel={handleCancel}
	use:swipeDownToDismiss={{ onDismiss: onClose }}
>
	<div class="detail-handle"></div>

	<div class="detail-content">
		<div class="detail-header">
			<h2 class="detail-title">{card.name}</h2>
			{#each categoryLabels as cat}
				<span
					class="detail-dot"
					style:background-color={cat.color}
				></span>
			{/each}
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
			{#each categoryLabels as cat}
				<span
					class="detail-badge detail-badge--category"
					style:background-color={cat.color}
				>
					{cat.label}
				</span>
			{/each}
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
				{#each card.cards as variant, i (i)}
					<div class="detail-variant">
						<span class="detail-variant-name">{variant.name}</span>
						<span class="detail-variant-effect">{variant.effect}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</dialog>

<style>
	/*
	 * Visual dim only. The dialog's own ::backdrop is kept transparent and used
	 * solely for modal hit-testing, so this element can fade in and out with the
	 * sheet via a Svelte transition, which ::backdrop cannot do on exit.
	 */
	.detail-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		z-index: 50;
	}

	.detail-sheet {
		position: fixed;
		inset: auto 0 0 0;
		margin: 0 auto;
		background: var(--bg-primary);
		border: none;
		border-radius: 24px 24px 0 0;
		width: 100%;
		max-width: 48rem;
		max-height: 80vh;
		overflow-y: auto;
		/* Stop a swipe or scroll at the sheet edge from chaining to the page. */
		overscroll-behavior: contain;
		/* Reset the UA dialog padding; only the top gap is wanted here. */
		padding: 12px 0 0;
	}

	.detail-sheet::backdrop {
		background: transparent;
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
