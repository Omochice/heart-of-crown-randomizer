<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { filterByIds, select } from "@heart-of-crown-randomizer/randomizer";
	import { untrack } from "svelte";
	import Card from "$lib/Card.svelte";
	import CardDetail from "$lib/CardDetail.svelte";
	import { isTouchEvent } from "$lib/utils/is-touch-event";
	import {
		getPinnedCardIds,
		getExcludedCardIds,
		setPinnedCardIds,
		setExcludedCardIds,
		getPinnedCards,
	} from "$lib/stores/card-state.svelte";
	import { parseCardIdsFromUrl, buildUrlWithCardState, setsEqual } from "$lib/utils/url-sync";
	import { validatePinConstraints, validateExcludeConstraints } from "$lib/utils/validation";
	import { selectWithConstraints } from "$lib/utils/select-with-constraints";
	import { Shuffle, Plus, Pin, Ban } from "lucide-svelte";

	let numberOfCommons = $state(10);
	let selectedCommons: CommonCard[] = $state([]);
	let shareUrl = $state("");
	let errorMessage = $state("");
	let detailCard: CommonCard | null = $state(null);

	$effect(() => {
		const commonIds = $page.url.searchParams.getAll("card");
		const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
		const newSelectedCommons = commonIds
			.map((id) => allCommons.find((c) => c.id === Number.parseInt(id)))
			.filter(Boolean) as CommonCard[];

		if (JSON.stringify(selectedCommons) !== JSON.stringify(newSelectedCommons)) {
			selectedCommons = newSelectedCommons;
		}
	});

	$effect(() => {
		updateShareUrl();
	});

	/**
	 * Sync pin/exclude state from URL parameters
	 *
	 * We parse on every URL change rather than caching because users
	 * might manually edit the URL or use browser back/forward buttons.
	 *
	 * We skip updates when URL params match current state to prevent
	 * circular triggers with the State→URL sync effect.
	 */
	$effect(() => {
		const newPinnedIds = parseCardIdsFromUrl($page.url, "pin");
		const newExcludedIds = parseCardIdsFromUrl($page.url, "exclude");

		/**
		 * We use untrack for state reads to prevent circular dependency:
		 * togglePin() → version++ → this effect re-runs → URL still old →
		 * resets state. By untracking, this effect only re-runs on URL change.
		 */
		const currentPinned = untrack(() => getPinnedCardIds());
		const currentExcluded = untrack(() => getExcludedCardIds());

		if (setsEqual(currentPinned, newPinnedIds) && setsEqual(currentExcluded, newExcludedIds)) {
			return;
		}

		setPinnedCardIds(newPinnedIds);
		setExcludedCardIds(newExcludedIds);
	});

	/**
	 * Sync pin/exclude state to URL parameters
	 *
	 * We use replaceState rather than pushState to avoid polluting browser
	 * history with every state change (users don't want back button to undo
	 * each individual pin/exclude operation).
	 *
	 * We use untrack() for reading $page.url to avoid circular dependency
	 * with the URL → State sync effect.
	 */
	$effect(() => {
		const pinnedIds = getPinnedCardIds();
		const excludedIds = getExcludedCardIds();

		const currentUrl = untrack(() => $page.url);
		const newUrl = buildUrlWithCardState(currentUrl, pinnedIds, excludedIds);

		if (newUrl.toString() === currentUrl.toString()) return;

		goto(newUrl, { replaceState: true, noScroll: true, keepFocus: true });
	});

	function cardsToQuery(cards: CommonCard[]): string {
		return cards
			.reduce((query, card) => {
				query.append("card", card.id.toString());
				return query;
			}, new URLSearchParams())
			.toString();
	}

	function drawRandomCards() {
		const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
		const pinnedCards = getPinnedCards(allCommons);

		const pinValidation = validatePinConstraints(pinnedCards.length, numberOfCommons);
		if (!pinValidation.ok) {
			errorMessage = pinValidation.message;
			return;
		}

		const excludedIds = getExcludedCardIds();
		const availableCards = allCommons.filter((card) => !excludedIds.has(card.id));

		const excludeValidation = validateExcludeConstraints(availableCards.length, numberOfCommons);
		if (!excludeValidation.ok) {
			errorMessage = excludeValidation.message;
			return;
		}

		const randomCards = selectWithConstraints(
			allCommons,
			pinnedCards,
			excludedIds,
			numberOfCommons,
		);
		selectedCommons = randomCards.sort((a, b) => a.id - b.id);
		errorMessage = "";

		goto(buildCardUrl(selectedCommons), { keepFocus: true, noScroll: true });
		updateShareUrl();
	}

	/**
	 * Build a URL with card selection and pin/exclude state
	 *
	 * We include pin/exclude params in every URL transition rather than
	 * relying on the State→URL effect, because goto() triggers the
	 * URL→State effect which would clear pin/exclude state if the
	 * params are absent from the URL.
	 */
	function buildCardUrl(cards: CommonCard[]): string {
		const params = new URLSearchParams();
		for (const card of cards) {
			params.append("card", card.id.toString());
		}
		for (const id of getPinnedCardIds()) {
			params.append("pin", String(id));
		}
		for (const id of getExcludedCardIds()) {
			params.append("exclude", String(id));
		}
		return `?${params.toString()}`;
	}

	function updateShareUrl() {
		if (selectedCommons.length > 0) {
			shareUrl = `${window.location.origin}?${cardsToQuery(selectedCommons)}`;
		}
	}

	async function copyToClipboard() {
		await navigator
			.share({
				url: shareUrl,
				title: "ハートオブクラウンランダマイザー",
			})
			.catch(() => {
				navigator.clipboard.writeText(shareUrl);
			})
			.catch((cause) => {
				console.error("Failed to copy URL", { cause });
			});
	}

	const VERTICAL_CANCEL_PX = 100;
	const TRANSITION_MS = 200;

	function animateCardReset(element: HTMLElement) {
		element.style.transition = `transform ${TRANSITION_MS}ms ease-out, opacity ${TRANSITION_MS}ms ease-out`;
		element.style.transform = "";
		element.style.opacity = "";
		setTimeout(() => {
			if (element.isConnected) {
				element.style.transition = "";
			}
		}, TRANSITION_MS);
	}

	function resetSwipeState() {
		document.removeEventListener("mousemove", handleSwipeMove);
		document.removeEventListener("mouseup", handleSwipeEnd);
		swipeState.isDragging = false;
		swipeState.cardElement = null;
		swipeState.cardIndex = -1;
	}

	const swipeState = $state({
		startX: 0,
		startY: 0,
		currentX: 0,
		isDragging: false,
		cardElement: null as HTMLElement | null,
		cardIndex: -1,
		threshold: 100,
	});

	function handleSwipeStart(event: TouchEvent | MouseEvent, index: number) {
		const card = selectedCommons[index];
		if (card && getPinnedCardIds().has(card.id)) return;

		const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX;
		const clientY = isTouchEvent(event) ? event.touches[0].clientY : event.clientY;

		swipeState.startX = clientX;
		swipeState.startY = clientY;
		swipeState.currentX = clientX;
		swipeState.isDragging = true;
		swipeState.cardElement = event.currentTarget as HTMLElement;
		swipeState.cardIndex = index;

		swipeState.cardElement.style.transition = "none";

		if (!isTouchEvent(event)) {
			document.addEventListener("mousemove", handleSwipeMove);
			document.addEventListener("mouseup", handleSwipeEnd);
		}
	}

	function handleSwipeMove(event: TouchEvent | MouseEvent) {
		if (!swipeState.isDragging || !swipeState.cardElement) return;

		const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX;
		const deltaX = clientX - swipeState.startX;
		const deltaY = Math.abs(
			(isTouchEvent(event) ? event.touches[0].clientY : event.clientY) - swipeState.startY,
		);

		if (deltaY > VERTICAL_CANCEL_PX) {
			handleSwipeCancel();
			return;
		}

		if (
			isTouchEvent(event) &&
			event.cancelable &&
			Math.abs(deltaX) > 10 &&
			Math.abs(deltaX) > deltaY
		) {
			event.preventDefault();
		}

		swipeState.currentX = clientX;

		swipeState.cardElement.style.transform = `translate3d(${deltaX}px, 0, 0)`;
		swipeState.cardElement.style.opacity = `${Math.max(0.3, 1 - Math.abs(deltaX) / 200)}`;
	}

	function handleSwipeEnd() {
		if (!swipeState.isDragging || !swipeState.cardElement) return;

		const deltaX = swipeState.currentX - swipeState.startX;

		if (Math.abs(deltaX) > swipeState.threshold) {
			removeSelectedCommon(swipeState.cardIndex);
		} else {
			const el = swipeState.cardElement;
			if (el) {
				animateCardReset(el);
			}
		}

		resetSwipeState();
	}

	function handleSwipeCancel() {
		const el = swipeState.cardElement;
		if (el) {
			animateCardReset(el);
		}

		resetSwipeState();
	}

	function removeSelectedCommon(index: number) {
		selectedCommons = selectedCommons.filter((_, i) => i !== index);
		updateUrlAndShare();
	}

	function updateUrlAndShare() {
		goto(buildCardUrl(selectedCommons), { keepFocus: true, noScroll: true });
		updateShareUrl();
	}

	function drawMissingCommons() {
		if (selectedCommons.length >= numberOfCommons) return;

		const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
		const excludedIds = selectedCommons.map((c) => c.id);
		const availableCommons = filterByIds(allCommons, excludedIds);

		if (availableCommons.length === 0) return;

		const cardsToAdd = numberOfCommons - selectedCommons.length;
		const newCards = select(availableCommons, cardsToAdd);

		selectedCommons = [...selectedCommons, ...newCards];
		updateUrlAndShare();
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

	const pinnedCount = $derived(getPinnedCardIds().size);
	const excludedCount = $derived(getExcludedCardIds().size);
	const missingCount = $derived(numberOfCommons - selectedCommons.length);
</script>

<div class="page-container">
	<header class="page-header">
		<div class="page-title">
			<span class="title-main">ハートオブクラウン</span>
			<span class="title-accent">ランダマイザー</span>
		</div>
		{#if selectedCommons.length > 0}
			<span class="count-badge">{selectedCommons.length}枚</span>
		{/if}
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

	{#if pinnedCount > 0 || excludedCount > 0}
		<div class="filter-chips">
			{#if pinnedCount > 0}
				<span class="chip">
					<Pin size={12} />
					Pin {pinnedCount}
				</span>
			{/if}
			{#if excludedCount > 0}
				<span class="chip">
					<Ban size={12} />
					Excluded {excludedCount}
				</span>
			{/if}
		</div>
	{/if}

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

	.count-badge {
		font-size: 13px;
		font-weight: 600;
		color: var(--accent-green);
		background: #f0fdf4;
		padding: 4px 10px;
		border-radius: 10px;
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

	.filter-chips {
		display: flex;
		gap: 8px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 6px 12px;
		border-radius: 10px;
		background: var(--bg-card);
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary);
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
