# Implementation Plan

## 1. 既存localStorage機能の削除

- [x] 1.1 (P) localStorage依存コードを削除
  - `excludedCommons` state宣言を削除 (L16)
  - localStorage読み込み `$effect` を削除 (L19-32)
  - `removeFromExcludedCommons()` 関数を削除 (L222-225)
  - `clearExcludedCommons()` 関数を削除 (L256-259)
  - 除外カードリストUI section を削除 (L320-351)
  - `drawRandomCards()`, `drawMissingCommons()` 内の `excludedIds` 参照を削除 (L66-67, L244)
  - ビルドエラーがないことを確認
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

## 2. CardState状態管理の実装

- [ ] 2.1 (P) CardStateモジュールを作成
  - `packages/site/src/lib/stores/card-state.svelte.ts` を作成
  - `CardStateType` 型定義（`"normal" | "pinned" | "excluded"`）
  - モジュールスコープ状態: `pinnedCardIds`, `excludedCardIds` (`$state<Set<number>>`)
  - SSR警告コメント追加（モジュールスコープの永続化リスク）
  - _Requirements: 1.1_

- [ ] 2.2 状態取得関数を実装
  - `getCardState(cardId)` 関数
  - ピンID → "pinned"、除外ID → "excluded"、その他 → "normal" を返す
  - _Requirements: 1.1_

- [ ] 2.3 ピントグル関数を実装
  - `togglePin(cardId)` 関数
  - ピン中なら削除、未ピンなら追加
  - 追加時は `excludedCardIds` から自動削除（相互排他）
  - Svelte 5 runes対応: Set再代入でリアクティブトリガー
  - "why not"コメント: 手動unexclude不要の理由、再代入の理由
  - _Requirements: 1.2, 1.4, 3.1, 3.4_

- [ ] 2.4 除外トグル関数を実装
  - `toggleExclude(cardId)` 関数
  - 除外中なら削除、未除外なら追加
  - 追加時は `pinnedCardIds` から自動削除（相互排他）
  - Svelte 5 runes対応: Set再代入でリアクティブトリガー
  - "why not"コメント: 手動unpin不要の理由、再代入の理由
  - _Requirements: 1.3, 1.4, 3.2, 3.4_

- [ ] 2.5 ヘルパー関数を実装
  - `getPinnedCards(allCards)` - ピンカードのフィルタリング
  - `getExcludedCards(allCards)` - 除外カードのフィルタリング
  - _Requirements: 1.2, 1.3_

- [ ] 2.6* CardStateユニットテストを作成
  - `togglePin()` のトグル動作テスト（通常→ピン、ピン→通常）
  - `togglePin()` の相互排他テスト（除外→ピン で除外解除）
  - `toggleExclude()` のトグル動作テスト（通常→除外、除外→通常）
  - `toggleExclude()` の相互排他テスト（ピン→除外 でピン解除）
  - `getCardState()` の状態取得テスト
  - `getPinnedCards()` / `getExcludedCards()` のフィルタリングテスト
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.4_

## 3. CardWithActionsコンポーネントの実装

- [ ] 3.1 (P) CardWithActionsコンポーネントを作成
  - `packages/site/src/lib/CardWithActions.svelte` を作成
  - Props型定義: `type Props = { card: CommonCard }`
  - CardStateから状態取得（`$derived(getCardState(card.id))`）
  - カード表示: カード名、カテゴリ
  - _Requirements: 2.1_

- [ ] 3.2 ピンボタンを実装
  - ピンボタンUI（📌アイコン）
  - `onclick` で `togglePin(card.id)` 呼び出し
  - 状態に応じたスタイル変更（ピン中: `bg-blue-500 text-white`、未ピン: `bg-gray-200`）
  - `aria-pressed` 属性で状態表示
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 3.3 除外ボタンを実装
  - 除外ボタンUI（🚫アイコン）
  - `onclick` で `toggleExclude(card.id)` 呼び出し
  - 状態に応じたスタイル変更（除外中: `bg-red-500 text-white`、未除外: `bg-gray-200`）
  - `aria-pressed` 属性で状態表示
  - _Requirements: 2.1, 2.3, 2.5_

- [ ] 3.4 カード状態の視覚的フィードバックを実装
  - ピン状態: 青い背景（`bg-blue-100`）、青いボーダー（`border-blue-500`）
  - 除外状態: グレー背景（`bg-gray-100`）、透明度60%（`opacity-60`）、取り消し線（`line-through`）
  - 通常状態: デフォルトスタイル
  - カラー以外の区別: アイコン（📌、🚫）
  - _Requirements: 2.4, 2.5, 2.6, 2.7, 3.3, 6.3_

- [ ] 3.5 アクセシビリティ対応を実装
  - `<button>` 要素でキーボードフォーカス可能
  - `focus:ring-*` でフォーカスインジケーター表示
  - _Requirements: 6.1, 6.2_

- [ ] 3.6* CardWithActionsコンポーネントテストを作成
  - ピンボタンクリック → `togglePin()` 呼び出しテスト
  - 除外ボタンクリック → `toggleExclude()` 呼び出しテスト
  - 視覚的フィードバックのスタイルテスト（ピン状態、除外状態）
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3_

## 4. URL同期ロジックの実装

- [ ] 4.1 URL解析ヘルパー関数を実装
  - `parseCardIdsFromUrl(url, param)` 関数を `+page.svelte` に追加
  - `URLSearchParams.getAll(param)` でIDを取得
  - `Number()` で変換、`filter(id => !isNaN(id))` でNaN除外
  - `Set<number>` を返す
  - "why not"コメント: NaN除外理由（エラーではなく無視）
  - _Requirements: 5.2_

- [ ] 4.2 URL構築ヘルパー関数を実装
  - `buildUrlWithCardState(baseUrl, pinnedIds, excludedIds)` 関数を `+page.svelte` に追加
  - 既存パラメータ削除（`delete("pin")`, `delete("exclude")`）
  - ループで `append("pin", id)`, `append("exclude", id)`
  - "why not"コメント: delete+append理由（set()は複数値非対応）
  - _Requirements: 5.1_

- [ ] 4.3 URL → State同期を実装
  - `$effect` でURL変更を監視
  - `parseCardIdsFromUrl($page.url, "pin")` で `pinnedCardIds` を更新
  - `parseCardIdsFromUrl($page.url, "exclude")` で `excludedCardIds` を更新
  - "why not"コメント: キャッシュせず毎回解析する理由（手動編集/戻る進む対応）
  - _Requirements: 1.5, 5.2, 5.3_

- [ ] 4.4 State → URL同期を実装
  - `$effect` で状態変更を監視
  - `buildUrlWithCardState($page.url, pinnedCardIds, excludedCardIds)` でURL構築
  - `goto(url, { replaceState: true, noScroll: true })` で更新
  - "why not"コメント: replaceState理由（履歴汚染回避）
  - _Requirements: 1.5, 5.1, 5.3_

- [ ] 4.5* URL同期のユニットテストを作成
  - URL → State同期テスト（`?pin=1,5` → `pinnedCardIds = {1, 5}`）
  - State → URL同期テスト（`togglePin(12)` → URL contains `pin=12`）
  - 無効なID処理テスト（`?pin=abc` → NaN除外、エラーなし）
  - _Requirements: 1.5, 5.1, 5.2, 5.3_

## 5. ランダマイズ制約ロジックの実装

- [ ] 5.1 バリデーション関数を実装
  - `ValidationResult` 型定義（`{ ok: true } | { ok: false; message: string }`）
  - `validatePinConstraints(pinnedCount, targetCount)` 関数
  - ピン数 > 選択枠 → エラーメッセージ（"ピンされたカードが多すぎます（X/Y）。ピンをZ枚解除してください。"）
  - "why not"コメント: pinnedCount === 0 を許可する理由
  - `validateExcludeConstraints(availableCount, targetCount)` 関数
  - 利用可能カード < 選択枠 → エラーメッセージ（"除外により選択可能なカードが不足しています（X/Y）。除外をZ枚解除してください。"）
  - "why not"コメント: 厳密な不等号（< not <=）を使う理由
  - _Requirements: 4.4, 4.5_

- [ ] 5.2 選択ヘルパー関数を実装
  - `selectWithConstraints(allCards, pinnedCards, excludedIds, count)` 関数
  - `select()` に `constraints.require: pinnedCards` を渡す
  - `select()` に `constraints.exclude: [(card) => excludedIds.has(card.id)]` を渡す
  - "why not"コメント: ピンカードを直接渡す理由（二重フィルタリング回避）
  - _Requirements: 1.2, 1.3, 4.1, 4.2_

- [ ] 5.3 drawRandomCards()を更新
  - `validatePinConstraints()` でピン数チェック
  - エラー時は `errorMessage` 設定、早期リターン
  - `validateExcludeConstraints()` で利用可能カードチェック
  - エラー時は `errorMessage` 設定、早期リターン
  - `selectWithConstraints()` でカード選択
  - 成功時は `errorMessage = ""` をクリア
  - _Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5.4* ランダマイズ制約のユニットテストを作成
  - ピン数超過エラーテスト（ピン5枚、選択枠3 → エラー）
  - 除外不足エラーテスト（利用可能2枚、選択枠3 → エラー）
  - 制約適用テスト（ピンカードが `constraints.require` に含まれる）
  - 制約適用テスト（除外IDが `constraints.exclude` に含まれる）
  - _Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5_

## 6. +page.svelteへの統合

- [ ] 6.1 CardWithActionsをページに統合
  - 既存のカード表示を `CardWithActions` コンポーネントに置き換え
  - `{#each selectedCommons as card}` 内で `<CardWithActions {card} />` を使用
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [ ] 6.2* Full Flow E2Eテストを作成
  - ピン → ランダマイズ → 結果確認（ピンカードが必ず含まれる）
  - 除外 → ランダマイズ → 結果確認（除外カードが含まれない）
  - URL共有 → 状態復元（別タブで同じ状態が復元される）
  - _Requirements: 1.2, 1.3, 1.5, 4.1, 4.2, 4.3, 5.2_

## 7. アクセシビリティとSSRテスト

- [ ] 7.1* アクセシビリティテストを作成
  - キーボード操作テスト（Tabでフォーカス、Enterで実行）
  - フォーカスインジケーターテスト（`focus:ring-*` の表示確認）
  - `aria-pressed` 属性テスト（ボタン状態の正確性）
  - _Requirements: 6.1, 6.2_

- [ ] 7.2* SSR安全性テストを作成
  - 複数SSRリクエストでの状態独立性テスト（Request A: `?pin=1` → Request B: `?pin=2` で状態リークなし）
  - `$effect`初期化の優先順位テスト（URL由来の状態で上書きされる）
  - 並行リクエストでの状態混在テスト（異なるユーザーの状態が混在しない）
  - SvelteKit `@sveltejs/kit/test` を使用してSSR環境シミュレート
  - _Requirements: 1.5, 5.2_

## 実装順序の注意

- タスク1（localStorage削除）は独立しており、他のタスクと並行実行可能 `(P)`
- タスク2（CardState）とタスク3（CardWithActions）は独立しており、並行実行可能 `(P)`
- タスク4（URL同期）はタスク2（CardState）に依存（状態変数を使用）
- タスク5（ランダマイズ制約）はタスク2（CardState）に依存（状態変数を使用）
- タスク6（統合）はタスク3とタスク4、タスク5の完了後に実施
- タスク7（テスト）は全実装完了後に実施

## 要件カバレッジ確認

- Requirement 1 (カード状態管理): タスク2.1-2.5
- Requirement 2 (UI操作): タスク3.1-3.5
- Requirement 3 (状態解除): タスク2.3, 2.4, 3.4
- Requirement 4 (再ランダマイズ時の維持): タスク5.2, 5.3
- Requirement 5 (URL状態の同期): タスク4.1-4.4
- Requirement 6 (アクセシビリティ): タスク3.5, 7.1
- Requirement 7 (既存機能の移行): タスク1.1

全7要件がタスクにマッピングされています。
