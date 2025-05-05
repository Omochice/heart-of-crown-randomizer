<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  // カードの設定
  const suits = ["♥", "♦", "♣", "♠"];
  const values = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];

  type Card = {
    suit: string;
    value: string;
  };

  // オプション設定
  let includeAllSuits = false;
  let numberOfCards = 10;
  let selectedCards: Card[] = [];
  let shareUrl = "";

  // 除外カードリスト
  let excludedCards: Card[] = [];

  // localStorageから除外カードを読み込む
  onMount(() => {
    const results = page.url.searchParams.get("results");
    if (results) {
      selectedCards = results.split(/\s+/).map((card) => ({
        suit: card[0],
        value: card.substring(1),
      }));
    }

    // localStorageから除外カードを読み込む
    const storedExcludedCards = localStorage.getItem("excludedCards");
    if (storedExcludedCards) {
      excludedCards = JSON.parse(storedExcludedCards);
    }

    // 共有用URLを生成
    updateShareUrl();
  });

  // カードをランダムに選択する関数
  function drawRandomCards() {
    const deck: Card[] = [];

    // デッキを作成（除外カードを除く）
    for (const suit of suits) {
      for (const value of values) {
        // 除外リストにないカードのみデッキに追加
        if (!isCardExcluded(suit, value)) {
          deck.push({ suit, value });
        }
      }
    }

    // カードをシャッフル
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);

    if (includeAllSuits) {
      // 各スートから少なくとも1枚ずつ選ぶ（除外カードを考慮）
      const cardsBySuit = {};
      suits.forEach((suit) => {
        cardsBySuit[suit] = shuffledDeck.filter((card) => card.suit === suit);
      });

      selectedCards = [];
      suits.forEach((suit) => {
        if (cardsBySuit[suit].length > 0) {
          selectedCards.push(cardsBySuit[suit][0]);
        }
      });

      // 残りのカードをランダムに選択
      const remainingCards = shuffledDeck.filter(
        (card) =>
          !selectedCards.some(
            (selected) =>
              selected.suit === card.suit && selected.value === card.value,
          ),
      );

      while (
        selectedCards.length < numberOfCards &&
        remainingCards.length > 0
      ) {
        const randomIndex = Math.floor(Math.random() * remainingCards.length);
        selectedCards.push(remainingCards[randomIndex]);
        remainingCards.splice(randomIndex, 1);
      }
    } else {
      // 単純にランダムに選択
      selectedCards = shuffledDeck.slice(0, numberOfCards);
    }

    // 結果ページへ移動
    const resultParam = selectedCards
      .map((card) => `${card.suit}${card.value}`)
      .join("+");
    goto(`?results=${resultParam}`);

    // 共有用URLを更新
    updateShareUrl();
  }

  // 共有用URLを更新
  function updateShareUrl() {
    if (selectedCards.length > 0) {
      const resultParam = selectedCards
        .map((card) => `${card.suit}${card.value}`)
        .join("+");
      shareUrl = `${window.location.origin}?results=${resultParam}`;
    }
  }

  // SNSで共有する関数
  function shareOnTwitter() {
    const text = "トランプカードランダマイザーの結果をチェック！";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  }

  function shareOnFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank");
  }

  function copyToClipboard() {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        alert("URLをクリップボードにコピーしました！");
      })
      .catch((err) => {
        console.error("クリップボードへのコピーに失敗しました:", err);
      });
  }

  // カードの色を決定
  function getCardColor(suit) {
    return suit === "♥" || suit === "♦" ? "text-red-600" : "text-black";
  }

  // カードの特別なスタイルを決定
  function getCardStyle(suit) {
    if (suit === "♠") {
      return "card-spade";
    } else if (suit === "♥") {
      return "card-heart";
    }
    return "";
  }

  // カードを除外リストに追加
  function excludeCard(suit, value) {
    // 既に除外リストにあるか確認
    if (!isCardExcluded(suit, value)) {
      excludedCards = [...excludedCards, { suit, value }];
      // localStorageに保存
      localStorage.setItem("excludedCards", JSON.stringify(excludedCards));
    }
  }

  // カードが除外リストにあるか確認
  function isCardExcluded(suit, value) {
    return excludedCards.some(
      (card) => card.suit === suit && card.value === value,
    );
  }

  // 除外リストからカードを削除
  function removeFromExcluded(suit, value) {
    excludedCards = excludedCards.filter(
      (card) => !(card.suit === suit && card.value === value),
    );
    // localStorageに保存
    localStorage.setItem("excludedCards", JSON.stringify(excludedCards));
  }

  // 選択されたカードを表示リストから削除（除外リストには追加しない）
  function removeSelectedCard(index) {
    // カードを選択リストから削除
    selectedCards = selectedCards.filter((_, i) => i !== index);

    // 結果ページへ移動
    const resultParam = selectedCards
      .map((card) => `${card.suit}${card.value}`)
      .join("+");
    goto(`?results=${resultParam}`);

    // 共有用URLを更新
    updateShareUrl();
  }

  // 足りない分のカードを引きなおす
  function drawMissingCards() {
    if (selectedCards.length >= numberOfCards) return;

    const deck = [];

    // デッキを作成（除外カードと既に選択されたカードを除く）
    for (const suit of suits) {
      for (const value of values) {
        // 除外リストにないカードかつ既に選択されていないカードのみデッキに追加
        if (
          !isCardExcluded(suit, value) &&
          !selectedCards.some(
            (card) => card.suit === suit && card.value === value,
          )
        ) {
          deck.push({ suit, value });
        }
      }
    }

    if (deck.length === 0) return; // 選べるカードがない場合

    // カードをシャッフル
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);

    // 足りない分だけカードを追加
    const cardsToAdd = Math.min(
      numberOfCards - selectedCards.length,
      shuffledDeck.length,
    );
    const newCards = shuffledDeck.slice(0, cardsToAdd);

    selectedCards = [...selectedCards, ...newCards];

    // 結果ページへ移動
    const resultParam = selectedCards
      .map((card) => `${card.suit}${card.value}`)
      .join("+");
    goto(`?results=${resultParam}`);

    // 共有用URLを更新
    updateShareUrl();
  }

  // 除外リストをクリア
  function clearExcludedCards() {
    excludedCards = [];
    localStorage.removeItem("excludedCards");
  }
</script>

<div class="container mx-auto p-4 max-w-3xl">
  <h1 class="text-3xl font-bold mb-6 text-center">
    トランプカードランダマイザー
  </h1>

  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <h2 class="text-xl font-semibold mb-4">オプション設定</h2>

    <div class="mb-4">
      <label class="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          bind:checked={includeAllSuits}
          class="form-checkbox h-5 w-5 text-blue-600"
        />
        <span>全てのスート（♥, ♦, ♣, ♠）を含める</span>
      </label>
    </div>

    <div class="mb-6">
      <label class="block mb-2">カード枚数: {numberOfCards}</label>
      <input
        type="range"
        min="1"
        max="20"
        bind:value={numberOfCards}
        class="w-full"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <button
        on:click={drawRandomCards}
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
      >
        カードを引く
      </button>

      <button
        on:click={drawMissingCards}
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
        disabled={selectedCards.length >= numberOfCards}
      >
        足りない枚数を引く ({numberOfCards - selectedCards.length})
      </button>
    </div>
  </div>

  <!-- 除外カードリスト -->
  <div class="bg-white rounded-lg shadow-md p-6 mb-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">除外カードリスト</h2>
      <button
        on:click={clearExcludedCards}
        class="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded focus:outline-none focus:shadow-outline transition duration-300"
      >
        リストをクリア
      </button>
    </div>

    {#if excludedCards.length === 0}
      <p class="text-gray-500 italic">除外カードはありません</p>
    {:else}
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-2">
        {#each excludedCards as card}
          <div
            class="border border-gray-300 rounded p-2 flex items-center justify-between"
          >
            <span class={getCardColor(card.suit)}>
              {card.suit}{card.value}
            </span>
            <button
              on:click={() => removeFromExcluded(card.suit, card.value)}
              class="text-gray-500 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if selectedCards.length > 0}
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">
        結果 ({selectedCards.length}/{numberOfCards}枚)
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        {#each selectedCards as card, index}
          <div
            class={`border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center aspect-[2/3] shadow-sm hover:shadow-md transition-shadow relative ${getCardStyle(card.suit)}`}
          >
            <!-- 除外ボタン -->
            <button
              on:click={() => removeSelectedCard(index)}
              class="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              title="このカードを削除する"
            >
              ✕
            </button>

            <span class={`text-2xl font-bold ${getCardColor(card.suit)}`}>
              {card.suit}{card.value}
            </span>
          </div>
        {/each}
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
    font-family: "Helvetica Neue", Arial, sans-serif;
  }

  /* スペードのカードスタイル - 右と下に黄色の縁取り */
  .card-spade {
    box-shadow: 3px 3px 0 #ffd700;
  }

  /* ハートのカードスタイル - 右に黄色の縁取り */
  .card-heart {
    box-shadow: 3px 0 0 #ffd700;
  }
</style>
