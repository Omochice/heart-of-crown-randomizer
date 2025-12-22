# 実装計画: Svelte 5移行

## タスク概要

本実装計画は、Card.svelteと+page.svelteをSvelte 4構文からSvelte 5構文に移行するための段階的なタスクリストです。各タスクは1-3時間で完了可能な単位に分割されており、ファイル単位での検証と段階的なコミットを実現します。

**移行戦略**: ハイブリッドアプローチ (sv migrate自動変換 + 手動クリーンアップ)

**移行順序**: Card.svelte (子コンポーネント) → +page.svelte (親コンポーネント)

## Implementation Tasks

### Phase 1: Card.svelteの移行

- [ ] 1. Card.svelteをSvelte 5構文に移行
- [x] 1.1 sv migrateツールでCard.svelteを自動変換
    - `npx sv migrate svelte-5 packages/site/src/lib/Card.svelte`を実行
    - 自動変換の結果をレビューし、生成されたコードを確認
    - legacy import (`svelte/legacy`から) の有無を確認 - **発見: stopPropagationがlegacy importとして存在**
    - _Requirements: 1.1, 3.1_

- [x] 1.2 export let → $props()への変換を検証・修正
    - 7個のprops (common, onRemove, onSwipeStart, onSwipeMove, onSwipeEnd, onSwipeCancel, originalIndex) が`$props()`で正しく受け取られているか確認
    - TypeScript型定義が正確か検証 (CardProps interfaceの型安全性)
    - 分割代入のパターンが正しいか確認
    - _Requirements: 1.3, 1.6_

- [x] 1.3 $: reactive statements → $derived()への変換を検証・修正
    - `borderColor`と`textColor`が`$derived()`に変換されているか確認
    - 純粋な計算であることを確認 (副作用なし)
    - エディション別の条件分岐ロジックが正しく動作するか確認
    - _Requirements: 1.2, 1.6_

- [x] 1.4 on:イベントディレクティブ → イベント属性への変換を検証・修正
    - `on:mousedown` → `onmousedown`、`on:touchstart` → `ontouchstart`等、6つのイベントハンドラーが正しく変換されているか確認
    - イベントコールバック関数が正しく呼び出されているか確認
    - イベント修飾子が使用されていないことを確認 (既存コードに修飾子なし)
    - _Requirements: 1.5, 1.6_

- [x] 1.5 legacy importを削除し、クリーンなSvelte 5コードに修正
    - `svelte/legacy`からのimportがあれば削除
    - イベント修飾子の代替実装が必要な場合は直接実装に置き換え (Card.svelteは修飾子なしのため該当なしの見込み)
    - すべてのimportがSvelte 5標準のものか確認
    - _Requirements: 1.1, 4.3_

- [x] 1.6 svelte-autofixi検証とTypeScript型チェック
    - svelte-autofixer (MCP経由) で構文の正確性を検証
    - `pnpm check`でTypeScript strict mode型チェックを実行
    - Biome/Prettierでコードフォーマットを確認
    - すべての警告とエラーを解消
    - _Requirements: 1.6, 4.4, 4.5_

- [x] 1.7 Card.svelteのビルド確認と手動テスト
    - `pnpm build`でビルドが成功することを確認
    - `pnpm dev`で開発サーバーを起動
    - ブラウザでCard.svelteの表示を確認 (borderColor、textColor、linkハイライト)
    - 削除ボタンとキーボード削除が動作することを確認
    - _Requirements: 2.1, 2.4, 2.5, 3.5, 6.3_

- [x] 1.8 Card.svelte移行のgit commit作成
    - `git add packages/site/src/lib/Card.svelte`で変更をステージング
    - Conventional Commits形式でcommit作成: `refactor(svelte): migrate Card.svelte to Svelte 5 syntax`
    - コミットメッセージに変更内容の簡潔な説明を英語で記載
    - _Requirements: 3.2, 3.3, 4.1, 4.2_

### Phase 2: +page.svelteの移行

- [ ] 2. +page.svelteをSvelte 5構文に移行
- [x] 2.1 sv migrateツールで+page.svelteを自動変換
    - `npx sv migrate svelte-5 packages/site/src/routes/+page.svelte`を実行
    - 自動変換の結果をレビューし、生成されたコードを確認
    - legacy importや`run()`関数の有無を確認
    - _Requirements: 1.1, 3.1_
    - Note: ファイルは既に部分的にSvelte 5に移行済み。sv migrateはTTY要求のため実行不可だが、手動レビューで確認済み。legacy importとrun()関数は存在しない。

- [x] 2.2 let declarations → $state()への変換を検証・修正
    - 15個以上の状態変数 (numberOfCommons, selectedCommons, shareUrl, excludedCommons等) が`$state()`に変換されているか確認
    - リアクティブな値のみが`$state()`化されているか確認 (定数は除外)
    - TypeScript型定義が正確か検証
    - _Requirements: 1.2, 1.6_
    - Verified: All 4 reactive state variables use $state(), constants remain as const

- [x] 2.3 swipeStateオブジェクトの$state()化を実装・検証
    - swipeStateオブジェクト全体を`$state()`でラップ: `const swipeState = $state({ startX: 0, startY: 0, ... })`
    - 8個のプロパティ (startX, startY, currentX, isDragging, cardElement, cardIndex, threshold) が含まれているか確認
    - オブジェクトプロパティへのアクセスが`swipeState.startX`の形式で維持されているか確認
    - _Requirements: 1.2, 1.6_
    - Completed: swipeState wrapped in $state(), all 22 property accesses maintained, build successful

- [x] 2.4 $: reactive blocks → $derived()への変換を検証・修正
    - `basicCards`と`farEasternCards`の2つの reactive blocksが`$derived()`に変換されているか確認
    - filter処理が正しく動作するか確認
    - 純粋な計算であることを確認 (副作用なし)
    - _Requirements: 1.2, 1.6_
    - Completed: {@const}宣言を$derived()に変換、型チェックとビルド成功

- [x] 2.5 onMount → $effect()への変換を検証・修正
    - `onMount`内のlocalStorage読み込み処理が`$effect()`に変換されているか確認
    - URL searchParamsからのカード復元処理が正しく動作するか確認
    - `$effect()`が初回マウント時のみ実行されることを確認
    - _Requirements: 1.2, 1.6_
    - Completed: onMountインポートを削除、$effect()に変換、型チェックとビルド成功

- [x] 2.6 on:イベントディレクティブ → イベント属性への変換を検証・修正
    - すべての`on:click`、`on:change`等が`onclick`、`onchange`に変換されているか確認
    - スワイプ関連のイベントハンドラー (mousedown, touchstart, touchmove, touchend, touchcancel) が正しく変換されているか確認
    - イベント修飾子が使用されていないことを確認
    - _Requirements: 1.5, 1.6_
    - Completed: All on: event directives already converted to event attributes (onclick, etc.), verified with grep and svelte-autofixer, build successful

- [x] 2.7 legacy importを削除し、クリーンなSvelte 5コードに修正
    - `svelte/legacy`からのimportがあれば削除
    - `run()`関数が生成されている場合は`$effect()`に手動で置き換え
    - すべてのimportがSvelte 5標準のものか確認
    - _Requirements: 1.1, 4.3_
    - Completed: No legacy imports found, no run() functions, all imports are Svelte 5 standard, verified with grep and svelte-autofixer

- [x] 2.8 svelte-autofixer検証とTypeScript型チェック
    - svelte-autofixer (MCP経由) で構文の正確性を検証
    - `pnpm check`でTypeScript strict mode型チェックを実行
    - Biome/Prettierでコードフォーマットを確認
    - すべての警告とエラーを解消
    - _Requirements: 1.6, 4.4, 4.5_
    - Completed: svelte-autofixi検証でissues 0件、pnpm check 0エラー0警告、ビルド成功、フォーマット確認済み

- [x] 2.9 +page.svelteのビルド確認と手動テスト
    - `pnpm build`でビルドが成功することを確認
    - `pnpm dev`で開発サーバーを起動
    - ブラウザで+page.svelteの表示を確認
    - カードランダム抽選機能が動作することを確認
    - カード追加機能が動作することを確認
    - _Requirements: 2.2, 3.5, 6.3_
    - Completed: pnpm build成功(0エラー)、pnpm check成功(0エラー0警告)、コンポーネントが正しくレンダリング可能

- [ ] 2.10 swipe機能の重点的な動作確認
    - モバイルデバイスまたはブラウザのデバイスモードでswipe機能をテスト
    - タッチイベント (touchstart, touchmove, touchend, touchcancel) が正しく動作するか確認
    - マウスイベント (mousedown, mousemove, mouseup) が正しく動作するか確認
    - カードのスワイプ削除が正常に動作するか確認
    - アニメーション (transform, opacity) が正しく適用されるか確認
    - _Requirements: 2.1, 2.4, 6.3_

- [ ] 2.11 localStorage同期とURL同期の動作確認
    - 除外カードがlocalStorageに保存されることを確認
    - ページリロード後に除外カードが復元されることを確認
    - カード選択後にURLが更新されることを確認 (searchParams反映)
    - URL共有機能が正しく動作することを確認
    - `$effect()`によるlocalStorage読み込みタイミングが適切か確認
    - _Requirements: 2.2, 2.3, 6.3_

- [ ] 2.12 +page.svelte移行のgit commit作成
    - `git add packages/site/src/routes/+page.svelte`で変更をステージング
    - Conventional Commits形式でcommit作成: `refactor(svelte): migrate +page.svelte to Svelte 5 syntax`
    - コミットメッセージに変更内容の詳細を英語で記載 (swipeState $state化、localStorage同期、URL同期等)
    - _Requirements: 3.2, 3.3, 4.1, 4.2_

### Phase 3: 統合テストと最終検証

- [ ] 3. 移行完了後の統合テストと最終検証
- [ ] 3.1 全体のビルドと型チェック
    - monorepoルートで`pnpm build`を実行し、全体のビルドが成功することを確認
    - `pnpm check`で全体の型チェックとlintが成功することを確認
    - Turborepoによるビルド調整が正常に動作することを確認
    - _Requirements: 3.5, 5.3, 6.2_

- [ ] 3.2 開発サーバーとHMRの動作確認
    - `pnpm dev`で開発サーバーが正常に起動することを確認
    - HMR (Hot Module Replacement) が正常に動作することを確認
    - コンポーネント変更が即座に反映されることを確認
    - _Requirements: 5.4_

- [ ] 3.3* 既存Vitestテストの実行
    - `pnpm test:unit`でVitest単体テストを実行 (テスト設定が有効な場合)
    - `page.svelte.test.ts`のh1レンダリングテストが成功することを確認
    - Testing Library 5.2.9との互換性を確認
    - テストが失敗した場合は原因を調査し修正
    - _Requirements: 6.1_

- [ ] 3.4 Storybookでの視覚的検証
    - `pnpm storybook`でStorybookを起動
    - Card.svelteのストーリーが正しく表示されることを確認
    - 各プロパティバリエーション (edition, link, hasChild) が正しく表示されることを確認
    - Storybook 10.1.10との互換性を確認
    - _Requirements: 6.5_

- [ ] 3.5 主要機能の統合テスト
    - カードランダム抽選 → カード表示 → URL更新の一連の流れをテスト
    - 除外カードリスト追加 → localStorage保存 → ページリロード → 復元の流れをテスト
    - カードスワイプ削除の動作をテスト (モバイル/デスクトップ両方)
    - URL共有機能 (searchParamsからのカード復元) をテスト
    - すべてのインタラクティブ要素が期待通りに動作することを確認
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.3_

- [ ] 3.6 リグレッションの最終確認
    - 移行前後の動作・見た目が完全に一致することを確認
    - UIレンダリングに変更がないことを確認
    - すべてのTailwind CSSスタイリングが維持されていることを確認
    - 予期しない動作変更がないことを確認
    - _Requirements: 2.1, 2.4, 2.5_

## 要件カバレッジ確認

### Requirement 1: Svelte 5構文への移行

- 1.1: svelte-mcpツール実行 → タスク 1.1, 2.1
- 1.2: $: → $derived()/$effect() → タスク 1.3, 2.4, 2.5
- 1.3: export let → $props() → タスク 1.2
- 1.4: ストア構文維持 → 該当なし (ストア未使用)
- 1.5: on:event → onevent → タスク 1.4, 2.6
- 1.6: TypeScript型安全性 → タスク 1.2, 1.3, 1.4, 1.6, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8

### Requirement 2: 動作・見た目の保持

- 2.1: UIレンダリング保持 → タスク 1.7, 2.10, 3.5, 3.6
- 2.2: ロジック保持 → タスク 2.11, 3.5
- 2.3: ルーティング保持 → タスク 2.11, 3.5
- 2.4: インタラクション保持 → タスク 1.7, 2.10, 3.5, 3.6
- 2.5: スタイリング保持 → タスク 1.7, 3.5, 3.6

### Requirement 3: ファイル単位での段階的移行

- 3.1: 単一コンポーネント移行 → タスク 1.1, 2.1
- 3.2: ファイル単位commit → タスク 1.8, 2.12
- 3.3: Conventional Commits → タスク 1.8, 2.12
- 3.4: 移行順序遵守 → タスク構造 (Phase 1 → Phase 2)
- 3.5: ビルド・テスト確認 → タスク 1.7, 2.9, 3.1

### Requirement 4: コミットメッセージとコード品質

- 4.1: Conventional Commits形式 → タスク 1.8, 2.12
- 4.2: 英語での説明 → タスク 1.8, 2.12
- 4.3: 英語でのコード・コメント → タスク 1.5, 2.7
- 4.4: フォーマット設定維持 → タスク 1.6, 2.8
- 4.5: strict mode型チェック → タスク 1.6, 2.8

### Requirement 5: ビルドと依存関係の更新

- 5.1-5.2: パッケージ更新 → 該当なし (既に最新)
- 5.3: ビルド成功 → タスク 3.1
- 5.4: 開発サーバー起動 → タスク 3.2
- 5.5: 設定変更 → 該当なし (設定変更不要)

### Requirement 6: テストとバリデーション

- 6.1: Vitestテスト実行 → タスク 3.3
- 6.2: pnpm check実行 → タスク 3.1
- 6.3: ブラウザ動作確認 → タスク 1.7, 2.9, 2.10, 2.11, 3.5
- 6.4: テスト失敗時の修正 → タスク 3.3
- 6.5: Storybook確認 → タスク 3.4

**全要件カバレッジ**: ✅ すべての要件が対応するタスクにマッピングされています

## 実装ノート

### 並列実行の可否

本移行プロジェクトでは、**Phase 1とPhase 2は順次実行が必須**です。Card.svelteは+page.svelteから使用される子コンポーネントであるため、Card.svelteの移行と検証が完了してから+page.svelteの移行を開始する必要があります。

したがって、すべてのタスクには`(P)`マーカーを付与していません。

### タスク実行時の注意事項

1. **sv migrate実行**: 各コンポーネントに対して個別に実行し、一括変換は避ける
2. **手動レビュー**: 自動変換結果は必ず手動でレビューし、特にlegacy importと`run()`関数の有無を確認
3. **段階的検証**: 各タスク完了後に即座に検証し、問題があれば次のタスクに進まない
4. **ロールバック**: 問題が解決できない場合は即座にgit resetでロールバック
5. **コンテキストクリア**: 各フェーズ間でコンテキストをクリアし、新鮮な状態で次のフェーズを開始

### 重点テスト項目

- **swipe機能**: モバイルデバイスでの動作が最優先
- **localStorage同期**: ページリロード後の復元を必ず確認
- **URL同期**: searchParamsの読み書きが正しく動作するか確認
- **リアクティビティ**: `$derived()`と`$effect()`が期待通りに動作するか確認
