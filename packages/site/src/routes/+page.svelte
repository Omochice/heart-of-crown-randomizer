<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { Basic, FarEasternBorder } from "@heart-of-crown-randomizer/card";
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import { filterByIds, select } from "@heart-of-crown-randomizer/randomizer";
	import Card from "$lib/Card.svelte";
	import { isTouchEvent } from "$lib/utils/is-touch-event";

	// Option settings
	let numberOfCommons = $state(10);
	let selectedCommons: CommonCard[] = $state([]);
	let shareUrl = $state("");

	// Reactively sync selectedCommons with URL parameters
	// This allows browser back/forward to update the displayed cards
	$effect(() => {
		const commonIds = $page.url.searchParams.getAll("card");
		const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
		const newSelectedCommons = commonIds
			.map((id) => allCommons.find((c) => c.id === Number.parseInt(id)))
			.filter(Boolean) as CommonCard[];

		// Only update if actually changed to avoid infinite loops
		if (JSON.stringify(selectedCommons) !== JSON.stringify(newSelectedCommons)) {
			selectedCommons = newSelectedCommons;
		}
	});

	// Update share URL when selectedCommons changes
	$effect(() => {
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
		const allCommons = [...Basic.commons, ...FarEasternBorder.commons];
		const randomCards = select(allCommons, numberOfCommons);
		selectedCommons = randomCards.sort((a, b) => a.id - b.id);

		goto(`?${cardsToQuery(selectedCommons)}`, { keepFocus: true, noScroll: true });
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
	const swipeState = $state({
		startX: 0,
		startY: 0,
		currentX: 0,
		isDragging: false,
		cardElement: null as HTMLElement | null,
		cardIndex: -1,
		threshold: 100, // Threshold for swipe deletion (pixels)
	});

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

	// Remove selected common card from display list
	function removeSelectedCommon(index: number) {
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
		const excludedIds = selectedCommons.map((c) => c.id);
		const availableCommons = filterByIds(allCommons, excludedIds);

		if (availableCommons.length === 0) return;

		const cardsToAdd = numberOfCommons - selectedCommons.length;
		const newCards = select(availableCommons, cardsToAdd);

		selectedCommons = [...selectedCommons, ...newCards];
		updateUrlAndShare();
	}

	// Derived values for card filtering and sorting
	const basicCards = $derived(
		selectedCommons.filter((c) => c.edition === 0).sort((a, b) => a.cost - b.cost),
	);
	const farEasternCards = $derived(
		selectedCommons.filter((c) => c.edition === 1).sort((a, b) => a.cost - b.cost),
	);
</script>

<div class="container mx-auto p-4 max-w-3xl">
	<h1 class="text-3xl font-bold mb-6 text-center">ハートオブクラウンランダマイザー</h1>

	<div class="bg-white rounded-lg shadow-md p-6 mb-6">
		<h2 class="text-xl font-semibold mb-4">オプション設定</h2>

		<fieldset class="mb-6">
			<legend class="block mb-2">一般カード枚数:</legend>
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
		</fieldset>

		<div class="grid grid-cols-1 gap-4">
			<button
				onclick={drawRandomCards}
				class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
			>
				一般カードを引く
			</button>

			<button
				onclick={drawMissingCommons}
				class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
				disabled={selectedCommons.length >= numberOfCommons}
			>
				一般カードを追加 ({numberOfCommons - selectedCommons.length})
			</button>
		</div>
	</div>

	{#if selectedCommons.length > 0}
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
								onRemove={removeSelectedCommon}
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
								onRemove={removeSelectedCommon}
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
						onclick={copyToClipboard}
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
