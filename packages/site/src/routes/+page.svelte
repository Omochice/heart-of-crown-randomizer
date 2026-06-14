<script lang="ts">
	import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { allConstraints } from "@heart-of-crown-randomizer/constraint";
	import { Plus, Shuffle } from "lucide-svelte";
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import AppMenu from "$lib/app-menu/AppMenu.svelte";
	import Card from "$lib/Card.svelte";
	import CardDetail from "$lib/CardDetail.svelte";
	import ConstraintPanel from "$lib/ConstraintPanel.svelte";
	import DebugPanel from "$lib/DebugPanel.svelte";
	import ExcludeList from "$lib/ExcludeList.svelte";
	import {
		getExcludedCardIds,
		getExcludedCards,
		getPinnedCardIds,
		getPinnedCards,
		setExcludedCardIds,
		setPinnedCardIds,
	} from "$lib/stores/card-state.svelte";
	import {
		getEnabledConstraintIds,
		getEnabledConstraints,
		setEnabledConstraintIds,
	} from "$lib/stores/constraint-state.svelte";
	import { resolveCardsFromUrl } from "$lib/stores/url-card-sync.svelte";
	import {
		buildCardUrl,
		drawMissingCommons as drawMissingCommonsLogic,
		drawRandomCards as drawRandomCardsLogic,
	} from "$lib/utils/card-draw";
	import { buildShareUrl, shareOrCopy } from "$lib/utils/share";
	import { createSwipeHandlers } from "$lib/utils/swipe-gesture.svelte";
	import { buildUrlWithCardState, parseCompressedIds, setsEqual } from "$lib/utils/url-sync";

	const isDebugMode = $derived($page.url.searchParams.get("debug") === "true");

	let numberOfCommons = $state(10);
	let selectedCommons: CommonCard[] = $state([]);
	let shareUrl = $state("");
	let errorMessage = $state("");
	let detailCard: CommonCard | null = $state(null);
	// Gates the preference-to-URL effect until onMount has restored state from the
	// URL; without it the effect would run first against empty state and navigate
	// the URL's preferences away before they are read back.
	let restored = $state(false);

	/**
	 * We use $effect instead of $derived because buildShareUrl requires
	 * window.location.origin, which is unavailable during SSR.
	 */
	$effect(() => {
		shareUrl = buildShareUrl(window.location.origin, selectedCommons, getEnabledConstraintIds());
	});

	$effect(() => {
		const newSelectedCommons = resolveCardsFromUrl($page.url, allCommons);
		const idsMatch =
			selectedCommons.length === newSelectedCommons.length &&
			selectedCommons.every((card, i) => card.id === newSelectedCommons[i]?.id);

		if (!idsMatch) {
			selectedCommons = newSelectedCommons;
		}
	});

	/**
	 * Restore pin/exclude/constraint state from the URL on initial page load.
	 *
	 * The params are kept in the URL continuously (see the effect below), so this
	 * read is what restores the preferences after a reload, not just on a fresh
	 * shared link.
	 */
	onMount(() => {
		const url = $page.url;
		let pinnedIds: Set<number>;
		let excludedIds: Set<number>;
		let constraintIds: Set<number>;
		try {
			pinnedIds = parseCompressedIds(url, "p");
			excludedIds = parseCompressedIds(url, "e");
			constraintIds = parseCompressedIds(url, "c");
		} catch {
			// A hand-edited, malformed param should not crash the page load.
			pinnedIds = new Set();
			excludedIds = new Set();
			constraintIds = new Set();
		}

		// Pin takes precedence over exclude for overlapping IDs
		for (const id of pinnedIds) {
			excludedIds.delete(id);
		}

		if (pinnedIds.size > 0 || excludedIds.size > 0) {
			setPinnedCardIds(pinnedIds);
			setExcludedCardIds(excludedIds);
		}
		if (constraintIds.size > 0) {
			setEnabledConstraintIds(constraintIds);
		}
		restored = true;
	});

	/**
	 * Mirror pin/exclude/constraint state into the URL so a reload restores it.
	 * Toggling a preference does not navigate on its own, so this effect is what
	 * keeps the URL current.
	 *
	 * We gate on `restored` rather than letting it run on mount, because before
	 * onMount seeds state the effect would compare empty state against a populated
	 * URL and navigate the preferences away. replaceState keeps rapid toggles out
	 * of the history that draws push onto.
	 */
	$effect(() => {
		const pinnedIds = getPinnedCardIds();
		const excludedIds = getExcludedCardIds();
		const constraintIds = getEnabledConstraintIds();
		const url = $page.url;
		const ready = restored;
		if (!ready) {
			return;
		}

		let urlPinned: Set<number>;
		let urlExcluded: Set<number>;
		let urlConstraints: Set<number>;
		try {
			urlPinned = parseCompressedIds(url, "p");
			urlExcluded = parseCompressedIds(url, "e");
			urlConstraints = parseCompressedIds(url, "c");
		} catch {
			// Treat a malformed param as absent so it gets overwritten, not thrown.
			urlPinned = new Set();
			urlExcluded = new Set();
			urlConstraints = new Set();
		}

		if (
			setsEqual(urlPinned, pinnedIds) &&
			setsEqual(urlExcluded, excludedIds) &&
			setsEqual(urlConstraints, constraintIds)
		) {
			return;
		}

		goto(buildUrlWithCardState(url, pinnedIds, excludedIds, constraintIds).search, {
			replaceState: true,
			keepFocus: true,
			noScroll: true,
		});
	});

	function drawRandomCards() {
		const pinnedCards = getPinnedCards(allCommons);
		const excludedIds = getExcludedCardIds();

		const activeConstraints = getEnabledConstraints(allConstraints);

		const result = drawRandomCardsLogic(
			allCommons,
			numberOfCommons,
			pinnedCards,
			excludedIds,
			activeConstraints,
		);
		if (!result.ok) {
			errorMessage = result.message;
			return;
		}

		selectedCommons = result.cards;
		errorMessage = "";

		goto(buildCardUrl(selectedCommons, $page.url.searchParams), {
			keepFocus: true,
			noScroll: true,
		});
	}

	async function copyToClipboard() {
		await shareOrCopy(
			shareUrl,
			[...basicCards, ...farEasternCards].map((c) => c.name),
		);
	}

	function removeSelectedCommon(index: number) {
		selectedCommons = selectedCommons.filter((_, i) => i !== index);
		navigateWithCardState();
	}

	function navigateWithCardState() {
		goto(buildCardUrl(selectedCommons, $page.url.searchParams), {
			keepFocus: true,
			noScroll: true,
		});
	}

	const { handleSwipeStart, handleSwipeMove, handleSwipeEnd, handleSwipeCancel } =
		createSwipeHandlers({
			isPinned: (index: number) => {
				const card = selectedCommons[index];
				return card !== undefined && getPinnedCardIds().has(card.id);
			},
			onRemove: removeSelectedCommon,
		});

	function drawMissingCommons() {
		const activeConstraints = getEnabledConstraints(allConstraints);
		const excludedIds = getExcludedCardIds();
		const newCards = drawMissingCommonsLogic(
			allCommons,
			selectedCommons,
			numberOfCommons,
			activeConstraints,
			excludedIds,
		);
		if (newCards.length === 0) {
			return;
		}

		selectedCommons = [...selectedCommons, ...newCards];
		navigateWithCardState();
	}

	const basicCards = $derived(
		selectedCommons.filter((c) => c.edition === 0).sort((a, b) => a.cost - b.cost),
	);
	const farEasternCards = $derived(
		selectedCommons.filter((c) => c.edition === 1).sort((a, b) => a.cost - b.cost),
	);

	function getOriginalIndex(cardId: number): number {
		return selectedCommons.findIndex((c) => c.id === cardId);
	}

	const allCommons = [...Basic.commons, ...FarEasternBorder.commons];

	const selectedCardIds = $derived(selectedCommons.map((c) => c.id));
	const excludedCards = $derived(getExcludedCards(allCommons));
	const missingCount = $derived(Math.max(0, numberOfCommons - selectedCommons.length));
</script>

<div class="page-container">
	<header class="page-header">
		<div class="page-title">
			<span class="title-main">ハートオブクラウン</span>
			<span class="title-accent">ランダマイザー</span>
		</div>
		<AppMenu
			{selectedCardIds}
			pinnedIds={getPinnedCardIds()}
			excludedIds={getExcludedCardIds()}
			constraintIds={getEnabledConstraintIds()}
		/>
	</header>

	<div
		class="segmented-control"
		role="radiogroup"
		aria-label="一般カード枚数"
	>
		<button
			type="button"
			class="segment"
			class:segment--active={numberOfCommons === 10}
			role="radio"
			aria-checked={numberOfCommons === 10}
			onclick={() => (numberOfCommons = 10)}
		>
			10枚
		</button>
		<button
			type="button"
			class="segment"
			class:segment--active={numberOfCommons === 14}
			role="radio"
			aria-checked={numberOfCommons === 14}
			onclick={() => (numberOfCommons = 14)}
		>
			14枚
		</button>
	</div>

	<ExcludeList cards={excludedCards} />

	<ConstraintPanel
		constraints={allConstraints}
		allCards={allCommons}
		excludedIds={getExcludedCardIds()}
		count={numberOfCommons}
	/>

	{#if errorMessage}
		<div
			class="error-message"
			role="alert"
		>
			<p>{errorMessage}</p>
		</div>
	{/if}

	<div class="card-grid">
		{#each [...basicCards, ...farEasternCards] as common (common.id)}
			<Card
				card={common}
				originalIndex={getOriginalIndex(common.id)}
				onSwipeStart={handleSwipeStart}
				onSwipeMove={handleSwipeMove}
				onSwipeEnd={handleSwipeEnd}
				onSwipeCancel={handleSwipeCancel}
				onclick={() => (detailCard = common)}
			/>
		{/each}
	</div>

	<div class="action-buttons">
		<button
			type="button"
			class="btn-primary"
			onclick={drawRandomCards}
		>
			<Shuffle size={16} />
			引き直す
		</button>

		<button
			type="button"
			class="btn-secondary"
			onclick={drawMissingCommons}
			disabled={selectedCommons.length >= numberOfCommons}
		>
			<Plus size={16} />
			追加 ({missingCount})
		</button>

		{#if shareUrl}
			<button
				type="button"
				class="btn-secondary"
				onclick={copyToClipboard}
			>
				共有
			</button>
		{/if}
	</div>
</div>

{#if detailCard}
	<CardDetail
		card={detailCard}
		onClose={() => (detailCard = null)}
	/>
{/if}

{#if isDebugMode}
	<DebugPanel
		constraints={allConstraints}
		selectedCards={selectedCommons}
		allCards={allCommons}
		pinnedCards={getPinnedCards(allCommons)}
		excludedIds={getExcludedCardIds()}
		count={numberOfCommons}
	/>
{/if}

<style>
	:global(body) {
		background-color: var(--bg-primary);
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		margin: 0;
	}

	.page-container {
		max-width: 48rem;
		margin: 0 auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.page-title {
		display: flex;
		align-items: baseline;
		gap: 2px;
	}

	.title-main {
		font-size: 18px;
		font-weight: 700;
		color: var(--text-primary);
	}

	.title-accent {
		font-size: 18px;
		color: var(--accent-coral);
	}

	.segmented-control {
		display: flex;
		background: var(--bg-card);
		border-radius: 18px;
		padding: 3px;
		height: 34px;
	}

	.segment {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		border-radius: 15px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.segment--active {
		background: var(--bg-primary);
		color: var(--text-primary);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}

	.error-message {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 10px 14px;
		border-radius: 10px;
		font-size: 13px;
	}

	.error-message p {
		margin: 0;
	}

	.card-grid {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.action-buttons {
		display: flex;
		gap: 8px;
		padding-top: 4px;
	}

	.btn-primary {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		height: 40px;
		border: none;
		border-radius: 20px;
		background: var(--accent-coral);
		color: white;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.btn-secondary {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		height: 40px;
		border: 1px solid var(--border-default);
		border-radius: 20px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}

	.btn-secondary:hover {
		background: var(--bg-card);
	}

	.btn-secondary:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
