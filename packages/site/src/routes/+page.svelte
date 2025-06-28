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

		// For mouse events, listen at document level
		if (!isTouchEvent(event)) {
			document.addEventListener("mousemove", handleSwipeMove);
			document.addEventListener("mouseup", handleSwipeEnd);
		}
	}

	// Handle swipe move
	function handleSwipeMove(event: TouchEvent | MouseEvent) {
		if (!swipeState.isDragging || !swipeState.cardElement) return;

		const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX;
		const deltaX = clientX - swipeState.startX;
		const deltaY = Math.abs(
			(isTouchEvent(event) ? event.touches[0].clientY : event.clientY) - swipeState.startY,
		);

		// Cancel swipe if vertical movement is too large
		if (deltaY > 50) {
			handleSwipeCancel();
			return;
		}

		swipeState.currentX = clientX;

		// Update card position
		swipeState.cardElement.style.transform = `translateX(${deltaX}px)`;
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
			handleSwipeCancel();
		} else {
			// Return to original position
			swipeState.cardElement.style.transform = "";
			swipeState.cardElement.style.opacity = "";
		}

		// Clean up event listeners
		document.removeEventListener("mousemove", handleSwipeMove);
		document.removeEventListener("mouseup", handleSwipeEnd);

		swipeState.isDragging = false;
	}

	// Handle swipe cancel
	function handleSwipeCancel() {
		if (swipeState.cardElement) {
			swipeState.cardElement.style.transform = "";
			swipeState.cardElement.style.opacity = "";
		}

		document.removeEventListener("mousemove", handleSwipeMove);
		document.removeEventListener("mouseup", handleSwipeEnd);

		swipeState.isDragging = false;
		swipeState.cardElement = null;
		swipeState.cardIndex = -1;
	}

	// Remove common card from excluded list
	function removeFromExcludedCommons(common: CommonCard) {
		excludedCommons = excludedCommons.filter((c) => c.id !== common.id);
		localStorage.setItem("excludedCommons", JSON.stringify(excludedCommons));
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
</script>

<div class="container mx-auto p-4 max-w-3xl">
	<h1 class="text-3xl font-bold mb-6 text-center text-primary">ハートオブクラウンランダマイザー</h1>

	<div class="card bg-base-100 shadow-xl mb-6">
		<div class="card-body">
			<h2 class="card-title mb-4">オプション設定</h2>

		<div class="mb-6">
			<fieldset>
				<legend class="block mb-2">一般カード枚数:</legend>
				<div class="flex gap-4">
					<label class="flex items-center">
						<input
							type="radio"
							name="numberOfCommons"
							value={10}
							bind:group={numberOfCommons}
							class="radio radio-primary mr-2"
						/>
						10枚
					</label>
					<label class="flex items-center">
						<input
							type="radio"
							name="numberOfCommons"
							value={14}
							bind:group={numberOfCommons}
							class="radio radio-primary mr-2"
						/>
						14枚
					</label>
				</div>
			</fieldset>
		</div>

		<div class="grid grid-cols-1 gap-4">
			<button
				on:click={drawRandomCards}
				class="btn btn-primary w-full"
			>
				一般カードを引く
			</button>

			<button
				on:click={drawMissingCommons}
				class="btn btn-success w-full"
				disabled={selectedCommons.length >= numberOfCommons}
			>
				一般カードを追加 ({numberOfCommons - selectedCommons.length})
			</button>
			</div>
		</div>
	</div>

	<!-- 除外カードリスト -->
	<div class="card bg-base-100 shadow-xl mb-6">
		<div class="card-body">
			<div class="flex justify-between items-center mb-4">
				<h2 class="card-title">除外カードリスト</h2>
				<button
					on:click={clearExcludedCommons}
					class="btn btn-success btn-sm"
				>
					リストをクリア
				</button>
			</div>

			{#if excludedCommons.length === 0}
				<p class="text-base-content/70 italic">除外カードはありません</p>
			{:else}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
					{#each excludedCommons as common}
						<div class="badge badge-success p-3 flex items-center justify-between gap-2">
							<span class="text-sm">
								{common.name}
							</span>
							<button
								on:click={() => removeFromExcludedCommons(common)}
								class="btn btn-ghost btn-xs text-error hover:bg-error hover:text-error-content"
							>
								✕
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	{#if selectedCommons.length > 0}
		{@const basicCards = selectedCommons
			.filter((c) => c.edition === 0)
			.sort((a, b) => a.cost - b.cost)}
		{@const farEasternCards = selectedCommons
			.filter((c) => c.edition === 1)
			.sort((a, b) => a.cost - b.cost)}
		<div class="card bg-base-100 shadow-xl mb-6">
			<div class="card-body">
				<h2 class="card-title mb-4">結果</h2>

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
							on:click={copyToClipboard}
							class="btn btn-neutral"
						>
							URLをコピー
						</button>
					</div>
				</div>

				<div class="mt-4">
					<p class="text-sm text-base-content/70 break-all">共有URL: {shareUrl}</p>
				</div>
			</div>
		</div>
	{/if}
</div>

