<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import type { CommonCard } from "@heart-of-crown-randomizer/card/type";
	import {
		drawRandomCards,
		drawMissingCards,
		parseCardIdsFromUrl,
		separateCardsByEdition,
		cardsToQuery,
		generateShareUrl,
		copyToClipboard,
		createSwipeHandler,
		loadExcludedCards,
		saveExcludedCards,
		clearExcludedCards,
		removeExcludedCard,
		type CardSelectionOptions,
		type SwipeHandlers,
	} from "@heart-of-crown-randomizer/card-selector";
	import { onMount } from "svelte";
	import Card from "$lib/Card.svelte";

	// Option settings
	let numberOfCommons = 10;
	let selectedCommons: CommonCard[] = [];
	let shareUrl = "";

	// Excluded card lists
	let excludedCommons: CommonCard[] = [];

	// Swipe handlers
	let swipeHandlers: SwipeHandlers;

	// Load excluded cards from localStorage on mount
	onMount(() => {
		const commonIds = page.url.searchParams.getAll("card");
		selectedCommons = parseCardIdsFromUrl(commonIds);

		excludedCommons = loadExcludedCards();

		// Initialize swipe handlers
		swipeHandlers = createSwipeHandler(removeSelectedCommon);

		// Generate share URL
		updateShareUrl();
	});

	// Function to randomly select common cards
	function handleDrawRandomCards() {
		const options: CardSelectionOptions = {
			numberOfCards: numberOfCommons,
			excludedCards: excludedCommons,
		};

		const result = drawRandomCards(options);
		selectedCommons = result.selectedCards;

		// Navigate to result page
		goto(`?${cardsToQuery(selectedCommons)}`, { keepFocus: true, noScroll: true });

		// Update share URL
		updateShareUrl();
	}

	// Update share URL
	function updateShareUrl() {
		if (selectedCommons.length > 0) {
			shareUrl = generateShareUrl(selectedCommons, window.location.origin);
		}
	}

	async function handleCopyToClipboard() {
		await copyToClipboard(shareUrl, "ハートオブクラウンランダマイザー");
	}


	// Remove common card from excluded list
	function removeFromExcludedCommons(common: CommonCard) {
		excludedCommons = removeExcludedCard(common, excludedCommons);
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
	function handleDrawMissingCommons() {
		if (selectedCommons.length >= numberOfCommons) return;

		const options: CardSelectionOptions = {
			numberOfCards: numberOfCommons,
			excludedCards: excludedCommons,
		};

		selectedCommons = drawMissingCards(selectedCommons, options);
		updateUrlAndShare();
	}

	function handleClearExcludedCommons() {
		excludedCommons = [];
		clearExcludedCards();
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
				on:click={handleDrawRandomCards}
				class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
			>
				一般カードを引く
			</button>

			<button
				on:click={handleDrawMissingCommons}
				class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
				disabled={selectedCommons.length >= numberOfCommons}
			>
				一般カードを追加 ({numberOfCommons - selectedCommons.length})
			</button>
		</div>
	</div>

	<!-- 除外カードリスト -->
	<div class="bg-white rounded-lg shadow-md p-6 mb-6">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold">除外カードリスト</h2>
			<button
				on:click={handleClearExcludedCommons}
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

	{#if selectedCommons.length > 0}
		{@const { basicCards, farEasternCards } = separateCardsByEdition(selectedCommons)}
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
								onSwipeStart={swipeHandlers.onSwipeStart}
								onSwipeMove={swipeHandlers.onSwipeMove}
								onSwipeEnd={swipeHandlers.onSwipeEnd}
								onSwipeCancel={swipeHandlers.onSwipeCancel}
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
								onSwipeStart={swipeHandlers.onSwipeStart}
								onSwipeMove={swipeHandlers.onSwipeMove}
								onSwipeEnd={swipeHandlers.onSwipeEnd}
								onSwipeCancel={swipeHandlers.onSwipeCancel}
							/>
						{/each}
					</div>
				</div>
			{/if}

			<div class="mt-6">
				<h3 class="text-lg font-semibold mb-2">結果を共有</h3>
				<div class="flex flex-wrap gap-2">
					<button
						on:click={handleCopyToClipboard}
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
