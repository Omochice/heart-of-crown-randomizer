<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { onMount } from "svelte";
	import Card from "$lib/Card.svelte";
	import { isTouchEvent } from "$lib/utils/is-touch-event";

	// Option settings
	let numberOfCommons = 10;
	let selectedCommons: CommonCard[] = [];
	let shareUrl = "";

	// Excluded card lists
	let excludedCommons: CommonCard[] = [];
	
	// Pinned cards - cards that should be kept when redrawing
	let pinnedCards: CommonCard[] = [];

	// Load excluded cards from localStorage on mount
	onMount(() => {
		const commonIds = page.url.searchParams.getAll("card");
		selectedCommons = commonIds
			.map((id) => Basic.commons.find((c) => c.id === Number.parseInt(id)))
			.filter(Boolean) as CommonCard[];

		const storedExcludedCommons = localStorage.getItem("excludedCommons");
		if (storedExcludedCommons) {
			excludedCommons = JSON.parse(storedExcludedCommons);
		}

		const storedPinnedCards = localStorage.getItem("pinnedCards");
		if (storedPinnedCards) {
			pinnedCards = JSON.parse(storedPinnedCards);
		}

		// Generate share URL
		updateShareUrl();
	});

	function cardsToQuery(cards: CommonCard[]): string {
		return cards
			.reduce((query, card) => {
				query.append("card", card.id.toString());
				return query;
			}, new URLSearchParams())
			.toString();
	}

	// Function to randomly select common cards
	function drawRandomCards() {
		// Combine Basic and Far Eastern Border common cards
		const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
		const availableCommons = allCommons.filter(
			(c) => !excludedCommons.some((ec) => ec.id === c.id),
		);
		const shuffledCommons = [...availableCommons].sort(() => Math.random() - 0.5);
		selectedCommons = shuffledCommons.slice(0, numberOfCommons).sort((a, b) => {
			return a.id - b.id;
		});

		// Navigate to result page
		goto(`?${cardsToQuery(selectedCommons)}`, { keepFocus: true, noScroll: true });

		// Update share URL
		updateShareUrl();
	}

	// Function to redraw only unpinned cards, keeping pinned ones
	function redrawUnpinnedCards() {
		// Get currently pinned cards from selectedCommons
		const currentPinnedCards = selectedCommons.filter(card => isPinned(card));
		
		// Calculate how many new cards we need
		const cardsToRedraw = numberOfCommons - currentPinnedCards.length;
		
		if (cardsToRedraw <= 0) {
			// All cards are pinned, nothing to redraw
			return;
		}

		// Get all available cards excluding excluded ones and currently pinned ones
		const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
		const availableCommons = allCommons.filter(
			(c) => !excludedCommons.some((ec) => ec.id === c.id) &&
			       !currentPinnedCards.some((pc) => pc.id === c.id)
		);
		
		const shuffledCommons = [...availableCommons].sort(() => Math.random() - 0.5);
		const newCards = shuffledCommons.slice(0, cardsToRedraw);
		
		// Combine pinned cards with new random cards
		selectedCommons = [...currentPinnedCards, ...newCards].sort((a, b) => {
			return a.id - b.id;
		});

		// Navigate to result page
		goto(`?${cardsToQuery(selectedCommons)}`, { keepFocus: true, noScroll: true });

		// Update share URL
		updateShareUrl();
	}

	// Update share URL
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

	// Constants for swipe behavior
	const VERTICAL_CANCEL_PX = 100; // Vertical movement threshold to cancel horizontal swipe
	const TRANSITION_MS = 200; // Animation duration in milliseconds

	// Helper function to animate card back to original position
	function animateCardReset(element: HTMLElement) {
		element.style.transition = `transform ${TRANSITION_MS}ms ease-out, opacity ${TRANSITION_MS}ms ease-out`;
		element.style.transform = "";
		element.style.opacity = "";
		// Clear inline transition after animation completes
		setTimeout(() => {
			if (element.isConnected) {
				element.style.transition = "";
			}
		}, TRANSITION_MS);
	}

	// Helper function to reset swipe state and clean up event listeners
	function resetSwipeState() {
		document.removeEventListener("mousemove", handleSwipeMove);
		document.removeEventListener("mouseup", handleSwipeEnd);
		swipeState.isDragging = false;
		swipeState.cardElement = null;
		swipeState.cardIndex = -1;
	}

	// State management for swipe functionality
	const swipeState = {
		startX: 0,
		startY: 0,
		currentX: 0,
		isDragging: false,
		cardElement: null as HTMLElement | null,
		cardIndex: -1,
		threshold: 100, // Threshold for swipe deletion (pixels)
	};

	// Handle swipe start
	function handleSwipeStart(event: TouchEvent | MouseEvent, index: number) {
		const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX;
		const clientY = isTouchEvent(event) ? event.touches[0].clientY : event.clientY;

		swipeState.startX = clientX;
		swipeState.startY = clientY;
		swipeState.currentX = clientX;
		swipeState.isDragging = true;
		swipeState.cardElement = event.currentTarget as HTMLElement;
		swipeState.cardIndex = index;

		// Disable transition at start to avoid conflicts during drag
		swipeState.cardElement.style.transition = "none";

		// For mouse events, listen at document level
		if (!isTouchEvent(event)) {
			document.addEventListener("mousemove", handleSwipeMove);
			document.addEventListener("mouseup", handleSwipeEnd);
		}
	}

	// Handle swipe move with improved responsiveness
	function handleSwipeMove(event: TouchEvent | MouseEvent) {
		if (!swipeState.isDragging || !swipeState.cardElement) return;

		const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX;
		const deltaX = clientX - swipeState.startX;
		const deltaY = Math.abs(
			(isTouchEvent(event) ? event.touches[0].clientY : event.clientY) - swipeState.startY,
		);

		// Cancel swipe if vertical movement is too large (increased threshold for better responsiveness)
		if (deltaY > VERTICAL_CANCEL_PX) {
			handleSwipeCancel();
			return;
		}

		// Prevent default for touch events only when horizontal movement exceeds threshold and is greater than vertical movement
		if (
			isTouchEvent(event) &&
			event.cancelable &&
			Math.abs(deltaX) > 10 &&
			Math.abs(deltaX) > deltaY
		) {
			event.preventDefault();
		}

		swipeState.currentX = clientX;

		// Update card position with hardware acceleration
		swipeState.cardElement.style.transform = `translate3d(${deltaX}px, 0, 0)`;
		swipeState.cardElement.style.opacity = `${Math.max(0.3, 1 - Math.abs(deltaX) / 200)}`;
	}

	// Handle swipe end
	function handleSwipeEnd() {
		if (!swipeState.isDragging || !swipeState.cardElement) return;

		const deltaX = swipeState.currentX - swipeState.startX;

		// Delete card if threshold exceeded
		if (Math.abs(deltaX) > swipeState.threshold) {
			// Delete immediately (no animation)
			removeSelectedCommon(swipeState.cardIndex);
		} else {
			// Return to original position with smooth transition
			const el = swipeState.cardElement;
			if (el) {
				animateCardReset(el);
			}
		}

		// Clean up state and event listeners
		resetSwipeState();
	}

	// Handle swipe cancel
	function handleSwipeCancel() {
		const el = swipeState.cardElement;
		if (el) {
			animateCardReset(el);
		}

		// Clean up state and event listeners
		resetSwipeState();
	}

	// Remove common card from excluded list
	function removeFromExcludedCommons(common: CommonCard) {
		excludedCommons = excludedCommons.filter((c) => c.id !== common.id);
		localStorage.setItem("excludedCommons", JSON.stringify(excludedCommons));
	}

	// Pin/unpin card functions
	function togglePinCard(common: CommonCard) {
		const isPinned = pinnedCards.some((c) => c.id === common.id);
		if (isPinned) {
			pinnedCards = pinnedCards.filter((c) => c.id !== common.id);
		} else {
			pinnedCards = [...pinnedCards, common];
		}
		localStorage.setItem("pinnedCards", JSON.stringify(pinnedCards));
	}

	function isPinned(common: CommonCard): boolean {
		return pinnedCards.some((c) => c.id === common.id);
	}

	// Remove selected common card from display list
	function removeSelectedCommon(index: number) {
		const cardToRemove = selectedCommons[index];
		// Also remove from pinned cards if it was pinned
		if (cardToRemove && isPinned(cardToRemove)) {
			pinnedCards = pinnedCards.filter((c) => c.id !== cardToRemove.id);
			localStorage.setItem("pinnedCards", JSON.stringify(pinnedCards));
		}
		selectedCommons = selectedCommons.filter((_, i) => i !== index);
		updateUrlAndShare();
	}

	// Update URL and share URL
	function updateUrlAndShare() {
		goto(`?${cardsToQuery(selectedCommons)}`, { keepFocus: true, noScroll: true });
		updateShareUrl();
	}

	// Draw missing common cards
	function drawMissingCommons() {
		if (selectedCommons.length >= numberOfCommons) return;

		const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
		const availableCommons = allCommons.filter(
			(c) =>
				!excludedCommons.some((ec) => ec.id === c.id) &&
				!selectedCommons.some((sc) => sc.id === c.id),
		);

		if (availableCommons.length === 0) return;

		const shuffled = [...availableCommons].sort(() => Math.random() - 0.5);
		const cardsToAdd = Math.min(numberOfCommons - selectedCommons.length, shuffled.length);
		const newCards = shuffled.slice(0, cardsToAdd);

		selectedCommons = [...selectedCommons, ...newCards];
		updateUrlAndShare();
	}

	function clearExcludedCommons() {
		excludedCommons = [];
		localStorage.removeItem("excludedCommons");
	}

	function clearPinnedCards() {
		pinnedCards = [];
		localStorage.removeItem("pinnedCards");
	}
</script>

<div class="container mx-auto p-4 max-w-3xl">
	<h1 class="text-3xl font-bold mb-6 text-center">ハートオブクラウンランダマイザー</h1>

	<div class="bg-white rounded-lg shadow-md p-6 mb-6">
		<h2 class="text-xl font-semibold mb-4">オプション設定</h2>

		<div class="mb-6">
			<label class="block mb-2">一般カード枚数:</label>
			<div class="flex gap-4">
				<label class="flex items-center">
					<input
						type="radio"
						name="numberOfCommons"
						value={10}
						bind:group={numberOfCommons}
						class="mr-2"
					/>
					10枚
				</label>
				<label class="flex items-center">
					<input
						type="radio"
						name="numberOfCommons"
						value={14}
						bind:group={numberOfCommons}
						class="mr-2"
					/>
					14枚
				</label>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-4">
			<button
				on:click={drawRandomCards}
				class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
			>
				一般カードを引く
			</button>

			<button
				on:click={drawMissingCommons}
				class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
				disabled={selectedCommons.length >= numberOfCommons}
			>
				一般カードを追加 ({numberOfCommons - selectedCommons.length})
			</button>

			{#if selectedCommons.length > 0}
				<button
					on:click={redrawUnpinnedCards}
					class="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
					disabled={pinnedCards.length >= numberOfCommons}
				>
					ピンしていないカードを引き直す
				</button>
			{/if}
		</div>
	</div>

	<!-- 除外カードリスト -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-6">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold">除外カードリスト</h2>
			<button
				on:click={clearExcludedCommons}
				class="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded focus:outline-none focus:shadow-outline transition duration-300"
			>
				リストをクリア
			</button>
		</div>

		{#if excludedCommons.length === 0}
			<p class="text-gray-500 italic">除外カードはありません</p>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
				{#each excludedCommons as common}
					<div class="border border-green-300 rounded p-2 flex items-center justify-between">
						<span class="text-green-600 text-sm">
							{common.name}
						</span>
						<button
							on:click={() => removeFromExcludedCommons(common)}
							class="text-gray-500 hover:text-red-500"
						>
							✕
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- ピンカードリスト -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-6">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold">ピンカードリスト</h2>
			<button
				on:click={clearPinnedCards}
				class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 px-3 rounded focus:outline-none focus:shadow-outline transition duration-300"
			>
				リストをクリア
			</button>
		</div>

		{#if pinnedCards.length === 0}
			<p class="text-gray-500 italic">ピンカードはありません</p>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
				{#each pinnedCards as common}
					<div class="border border-yellow-300 rounded p-2 flex items-center justify-between bg-yellow-50">
						<span class="text-yellow-700 text-sm">
							{common.name}
						</span>
						<button
							on:click={() => togglePinCard(common)}
							class="text-gray-500 hover:text-red-500"
						>
							✕
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	{#if selectedCommons.length > 0}
		{@const basicCards = selectedCommons
			.filter((c) => c.edition === 0)
			.sort((a, b) => a.cost - b.cost)}
		{@const farEasternCards = selectedCommons
			.filter((c) => c.edition === 1)
			.sort((a, b) => a.cost - b.cost)}
		<div class="bg-white rounded-lg shadow-md p-6 mb-6">
			<h2 class="text-xl font-semibold mb-4">結果</h2>

			{#if basicCards.length > 0}
				<div class="mb-6">
					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{#each basicCards as common (common.id)}
							{@const originalIndex = selectedCommons.findIndex((c) => c.id === common.id)}
							<Card
								{common}
								{originalIndex}
								isPinned={isPinned(common)}
								onRemove={removeSelectedCommon}
								onTogglePin={togglePinCard}
								onSwipeStart={handleSwipeStart}
								onSwipeMove={handleSwipeMove}
								onSwipeEnd={handleSwipeEnd}
								onSwipeCancel={handleSwipeCancel}
							/>
						{/each}
					</div>
				</div>
			{/if}

			{#if farEasternCards.length > 0}
				<div class="mb-6">
					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{#each farEasternCards as common (common.id)}
							{@const originalIndex = selectedCommons.findIndex((c) => c.id === common.id)}
							<Card
								{common}
								{originalIndex}
								isPinned={isPinned(common)}
								onRemove={removeSelectedCommon}
								onTogglePin={togglePinCard}
								onSwipeStart={handleSwipeStart}
								onSwipeMove={handleSwipeMove}
								onSwipeEnd={handleSwipeEnd}
								onSwipeCancel={handleSwipeCancel}
							/>
						{/each}
					</div>
				</div>
			{/if}

			<div class="mt-6">
				<h3 class="text-lg font-semibold mb-2">結果を共有</h3>
				<div class="flex flex-wrap gap-2">
					<button
						on:click={copyToClipboard}
						class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
					>
						URLをコピー
					</button>
				</div>
			</div>

			<div class="mt-4">
				<p class="text-sm text-gray-600 break-all">共有URL: {shareUrl}</p>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		background-color: #f5f7fa;
		font-family: "Helvetica Neue", Arial, sans-serif;
	}
</style>
