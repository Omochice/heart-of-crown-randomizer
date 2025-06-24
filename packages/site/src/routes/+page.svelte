<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Basic } from '@heart-of-crown-randomizer/card';
	import type { Princess, CommonCard } from '@heart-of-crown-randomizer/card/src/type';

	// カードの型定義
	type Card = Princess | CommonCard;

	// オプション設定
	let numberOfCommons = 10;
	let selectedPrincesses: Princess[] = [];
	let selectedCommons: CommonCard[] = [];
	let shareUrl = '';

	// 除外カードリスト
	let excludedPrincesses: Princess[] = [];
	let excludedCommons: CommonCard[] = [];

	// localStorageから除外カードを読み込む
	onMount(() => {
		const results = page.url.searchParams.get('results');
		if (results) {
			const [princessIds, commonIds] = results.split('|');
			if (princessIds) {
				selectedPrincesses = princessIds
					.split(',')
					.map((id) => Basic.princesses.find((p) => p.id === parseInt(id)))
					.filter(Boolean) as Princess[];
			}
			if (commonIds) {
				selectedCommons = commonIds
					.split(',')
					.map((id) => Basic.commons.find((c) => c.id === parseInt(id)))
					.filter(Boolean) as CommonCard[];
			}
		}

		// localStorageから除外カードを読み込む
		const storedExcludedPrincesses = localStorage.getItem('excludedPrincesses');
		if (storedExcludedPrincesses) {
			excludedPrincesses = JSON.parse(storedExcludedPrincesses);
		}
		const storedExcludedCommons = localStorage.getItem('excludedCommons');
		if (storedExcludedCommons) {
			excludedCommons = JSON.parse(storedExcludedCommons);
		}

		// 共有用URLを生成
		updateShareUrl();
	});

	// 一般カードをランダムに選択する関数
	function drawRandomCards() {
		// 一般カードのみランダムに選択
		const availableCommons = Basic.commons.filter(
			(c) => !excludedCommons.some((ec) => ec.id === c.id)
		);
		const shuffledCommons = [...availableCommons].sort(() => Math.random() - 0.5);
		selectedCommons = shuffledCommons.slice(0, numberOfCommons);

		// 結果ページへ移動
		const princessIds = selectedPrincesses.map((p) => p.id).join(',');
		const commonIds = selectedCommons.map((c) => c.id).join(',');
		const resultParam = `${princessIds}|${commonIds}`;
		goto(`?results=${resultParam}`);

		// 共有用URLを更新
		updateShareUrl();
	}

	// 共有用URLを更新
	function updateShareUrl() {
		if (selectedCommons.length > 0) {
			const princessIds = selectedPrincesses.map((p) => p.id).join(',');
			const commonIds = selectedCommons.map((c) => c.id).join(',');
			const resultParam = `${princessIds}|${commonIds}`;
			shareUrl = `${window.location.origin}?results=${resultParam}`;
		}
	}

	// SNSで共有する関数
	function shareOnTwitter() {
		const text = 'ハートオブクラウンランダマイザーの結果をチェック！';
		const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
		window.open(url, '_blank');
	}

	function shareOnFacebook() {
		const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
		window.open(url, '_blank');
	}

	function copyToClipboard() {
		navigator.clipboard
			.writeText(shareUrl)
			.then(() => {
				alert('URLをクリップボードにコピーしました！');
			})
			.catch((err) => {
				console.error('クリップボードへのコピーに失敗しました:', err);
			});
	}

	// カードの色を決定
	function getCardColor(card: Card) {
		if (card.type === 'princess') {
			return 'text-purple-600';
		}
		return 'text-blue-600';
	}

	// カードの特別なスタイルを決定
	function getCardStyle(card: Card) {
		if (card.type === 'princess') {
			return 'card-princess';
		}
		return 'card-common';
	}


	// 一般カードが除外リストにあるか確認
	function isCommonExcluded(common: CommonCard) {
		return excludedCommons.some((c) => c.id === common.id);
	}


	// 除外リストから一般カードを削除
	function removeFromExcludedCommons(common: CommonCard) {
		excludedCommons = excludedCommons.filter((c) => c.id !== common.id);
		localStorage.setItem('excludedCommons', JSON.stringify(excludedCommons));
	}


	// 選択された一般カードを表示リストから削除
	function removeSelectedCommon(index: number) {
		selectedCommons = selectedCommons.filter((_, i) => i !== index);
		updateUrlAndShare();
	}

	// URLと共有URLを更新
	function updateUrlAndShare() {
		const princessIds = selectedPrincesses.map((p) => p.id).join(',');
		const commonIds = selectedCommons.map((c) => c.id).join(',');
		const resultParam = `${princessIds}|${commonIds}`;
		goto(`?results=${resultParam}`);
		updateShareUrl();
	}


	// 足りない分の一般カードを引きなおす
	function drawMissingCommons() {
		if (selectedCommons.length >= numberOfCommons) return;

		const availableCommons = Basic.commons.filter(
			(c) =>
				!excludedCommons.some((ec) => ec.id === c.id) &&
				!selectedCommons.some((sc) => sc.id === c.id)
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
		localStorage.removeItem('excludedCommons');
	}
</script>

<div class="container mx-auto p-4 max-w-3xl">
	<h1 class="text-3xl font-bold mb-6 text-center">ハートオブクラウンランダマイザー</h1>

	<div class="bg-white rounded-lg shadow-md p-6 mb-6">
		<h2 class="text-xl font-semibold mb-4">オプション設定</h2>


		<div class="mb-6">
			<label class="block mb-2"
				>一般カード枚数: {numberOfCommons}
				<input
					type="range"
					min="1"
					max={Basic.commons.length}
					bind:value={numberOfCommons}
					class="w-full"
				/>
			</label>
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

	{#if selectedCommons.length > 0}
		<div class="bg-white rounded-lg shadow-md p-6 mb-6">
			<h2 class="text-xl font-semibold mb-4">
				結果
			</h2>

			<div class="mb-6">
				<h3 class="text-lg font-semibold mb-2">一般カード ({selectedCommons.length}/{numberOfCommons}枚)</h3>
					<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
						{#each selectedCommons as common, index}
							<div class="border-2 border-green-300 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative card-common">
								<button
									on:click={() => removeSelectedCommon(index)}
									class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
									title="このカードを削除する"
								>
									✕
								</button>
								<div class="text-green-600">
									<div class="font-bold text-sm mb-1">{common.name}</div>
									<div class="text-xs text-gray-600">
										コスト: {common.cost}
										{#if 'coin' in common && common.coin}
											| コイン: {common.coin}
										{/if}
										{#if 'succession' in common && common.succession}
											| 継承点: {common.succession}
										{/if}
									</div>
									{#if common.effect}
										<div class="text-xs text-gray-500 mt-1">{common.effect}</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
			</div>

			<div class="mt-6">
				<h3 class="text-lg font-semibold mb-2">結果を共有</h3>
				<div class="flex flex-wrap gap-2">
					<button
						on:click={shareOnTwitter}
						class="bg-[#1DA1F2] hover:bg-[#0c85d0] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
					>
						Twitterで共有
					</button>
					<button
						on:click={shareOnFacebook}
						class="bg-[#4267B2] hover:bg-[#365899] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
					>
						Facebookで共有
					</button>
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
		font-family: 'Helvetica Neue', Arial, sans-serif;
	}


	/* 一般カードスタイル - 緑の縁取り */
	.card-common {
		box-shadow: 3px 3px 0 #059669;
	}
</style>
