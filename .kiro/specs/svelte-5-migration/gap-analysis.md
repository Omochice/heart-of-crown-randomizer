# ギャップ分析: Svelte 5移行

## 1. 現状調査

### 既存のSvelteコンポーネント

プロジェクト内には以下の3つのSvelteコンポーネントが存在します:

#### ✅ +layout.svelte (既に移行済み)
- **状態**: Svelte 5構文を既に使用
- **使用している機能**:
  - `$props()` でprops受け取り
  - `{@render children()}` でコンテンツレンダリング
- **場所**: `packages/site/src/routes/+layout.svelte`

#### ❌ Card.svelte (移行が必要)
- **状態**: Svelte 4構文を使用
- **使用している機能**:
  - `export let` でprops定義 (7個のprops)
  - `$:` reactive declarations (borderColor, textColor)
  - `on:` イベントディレクティブ (mousedown, touchstart, touchmove, touchend, touchcancel, keydown)
  - 通常の関数定義 (getLinkHighlightClass)
- **場所**: `packages/site/src/lib/Card.svelte`
- **複雑度**: 中程度 (イベント処理が多い)

#### ❌ +page.svelte (移行が必要)
- **状態**: Svelte 4構文を使用
- **使用している機能**:
  - `let` 宣言 (15個以上の状態変数)
  - `onMount` ライフサイクルフック
  - `$:` reactive blocks (2箇所: basicCards, farEasternCards)
  - `on:` イベントディレクティブ (複数のボタンとフォーム要素)
  - 複雑な状態管理 (swipeState, selectedCommons, excludedCommons)
  - localStorage統合
- **場所**: `packages/site/src/routes/+page.svelte`
- **複雑度**: 高 (多数の状態、副作用、イベント処理)

### 依存関係の状態

**✅ パッケージは既に最新**:
- `svelte`: 5.46.0 (最新)
- `@sveltejs/kit`: 2.49.2 (最新)
- `@sveltejs/vite-plugin-svelte`: 6.1.3
- その他の依存関係も互換性あり

**結論**: パッケージ更新は不要。コード移行のみ実施。

### テスト環境

- **Vitest**: 設定済みだがテスト設定はコメントアウト済み
- **既存テスト**:
  - `packages/site/src/routes/page.svelte.test.ts` - 基本的なレンダリングテスト
  - `packages/site/src/demo.spec.ts` - ダミーテスト
- **Testing Library**: `@testing-library/svelte` 5.2.9 (Svelte 5対応版)

### ビルドツール

- **Vite**: 設定済み
- **Tailwind CSS**: v4.1.18 (最新)
- **Storybook**: 10.1.10 (Svelte 5対応版)

### 既存のコーディングパターン

1. **状態管理**: 主にコンポーネントローカルstate、localStorageとの連携あり
2. **イベント処理**: マウス・タッチイベントの複雑な処理 (スワイプ削除機能)
3. **URL同期**: `goto`と`page.url.searchParams`を使用
4. **アニメーション**: インラインスタイル操作による手動アニメーション

## 2. 要件実現可能性分析

### Requirement 1: Svelte 5構文への移行

**技術的ニーズ**:
- Svelte 4構文をSvelte 5構文に変換
- `export let` → `$props()`
- `$:` → `$derived()` / `$effect()`
- `on:event` → `onevent`

**ギャップ**:
- ✅ **既存機能**: svelte-mcp (MCP server経由でアクセス可能)
- ✅ **既存機能**: `sv migrate svelte-5` コマンド
- ⚠️ **制約**: 自動移行では100%完璧にならない可能性 (特にイベント修飾子、複雑な$:文)
- ⚠️ **未知**: swipeStateのような複雑なオブジェクトの$state化が必要か要確認

**複雑度シグナル**:
- 中程度の複雑さ: 既存パターンの置き換えが中心
- イベント処理の移行が最も複雑 (特にswipe機能)

### Requirement 2: 動作・見た目の保持

**技術的ニーズ**:
- リグレッションテストの実施
- UIの視覚的検証
- 機能テストの実行

**ギャップ**:
- ⚠️ **欠落**: 包括的なテストカバレッジがない
- ✅ **既存**: Storybookで視覚的検証は可能
- ⚠️ **制約**: 既存テストが最小限 (1ファイルのみ)
- 📝 **研究が必要**: E2Eテスト追加の必要性

### Requirement 3: ファイル単位での段階的移行

**技術的ニーズ**:
- コンポーネント個別の移行
- ファイルごとのcommit
- Conventional Commits形式

**ギャップ**:
- ✅ **既存パターン**: gitリポジトリ使用中
- ✅ **既存**: ファイル構造は明確に分離されている
- ⚠️ **制約**: +layout.svelteが既にSvelte 5構文のため、移行順序の調整が必要

**移行順序の提案**:
1. Card.svelte (依存が少ない、子コンポーネント)
2. +page.svelte (Card.svelteを使用)
3. +layout.svelte (既に完了)

### Requirement 4: コミットメッセージとコード品質

**技術的ニーズ**:
- Conventional Commits
- 英語でのコード・コメント
- Biome/Prettierのフォーマット維持

**ギャップ**:
- ✅ **既存**: Biome (TypeScript用)
- ✅ **既存**: Prettier (Svelte用)
- ✅ **既存パターン**: TypeScript strict mode
- ⚠️ **制約**: 既存のコミット履歴から判断するとConventional Commits使用中

### Requirement 5: ビルドと依存関係の更新

**技術的ニーズ**:
- パッケージ更新
- ビルド成功の確認
- 開発サーバー動作確認

**ギャップ**:
- ✅ **既存**: 依存関係は既にSvelte 5対応済み
- ✅ **既存**: Vite設定は最新
- ✅ **既存**: Turborepo設定あり
- ❌ **欠落**: パッケージ更新は不要

### Requirement 6: テストとバリデーション

**技術的ニーズ**:
- Vitestテスト実行
- 型チェック・lint
- 手動動作確認

**ギャップ**:
- ⚠️ **制約**: テスト設定がコメントアウト済み
- ✅ **既存**: `pnpm check`コマンド存在
- ✅ **既存**: Testing Library導入済み
- 📝 **研究が必要**: テスト設定の有効化方法

## 3. 実装アプローチの選択肢

### Option A: sv migrateツールで自動移行

**内容**:
- `npx sv migrate svelte-5`を実行
- 自動変換されたコードをレビュー
- 手動で修正が必要な箇所を調整

**該当ファイル**:
- `packages/site/src/lib/Card.svelte`
- `packages/site/src/routes/+page.svelte`

**トレードオフ**:
- ✅ 迅速な初期変換
- ✅ 主要な構文変換を自動処理
- ✅ Svelte公式ツールで信頼性高い
- ❌ 100%完璧ではない (手動調整が必要)
- ❌ イベント修飾子は`svelte/legacy`からのimportになる可能性
- ❌ 複雑な`$:`文は`run()`関数になる可能性

**推奨度**: ⭐⭐⭐⭐

### Option B: svelte-mcpで段階的に手動移行

**内容**:
- svelte-mcp serverのドキュメントを参照しながら手動で変換
- `svelte-autofixer`ツールで検証しながら進める
- 各変更後に即座に動作確認

**該当ファイル**:
- `packages/site/src/lib/Card.svelte`
- `packages/site/src/routes/+page.svelte`

**統合ポイント**:
- MCPツールでSvelte 5ドキュメント参照
- 変換パターンの確認
- ベストプラクティスの適用

**トレードオフ**:
- ✅ より正確な変換
- ✅ 学習機会
- ✅ クリーンなコード (legacy importなし)
- ❌ 時間がかかる
- ❌ 人的ミスの可能性
- ❌ パターン理解が必要

**推奨度**: ⭐⭐⭐

### Option C: ハイブリッドアプローチ (推奨)

**組み合わせ戦略**:
1. **フェーズ1**: `sv migrate`で初期変換
2. **フェーズ2**: svelte-mcpでlegacy importを削除
3. **フェーズ3**: 手動でコードクリーンアップ
4. **フェーズ4**: テスト・検証

**具体的な手順**:

**Card.svelte の移行**:
1. `sv migrate svelte-5`実行 (Card.svelteのみを対象に)
2. `export let` → `$props()`の確認
3. `$:` → `$derived()`の確認
4. `on:click` → `onclick`の確認
5. イベント修飾子の手動実装 (preventDefault等)
6. `svelte-autofixer`で検証
7. ビルド確認
8. Commit: `refactor(svelte): migrate Card.svelte to Svelte 5 syntax`

**+page.svelte の移行**:
1. `sv migrate svelte-5`実行
2. `let` → `$state()`の確認 (reactive stateのみ)
3. `onMount` → `$effect()`への変換確認
4. `$:` reactive blocks → `$derived()`の確認
5. 複雑なswipe処理の動作確認
6. `svelte-autofixer`で検証
7. 統合テスト
8. Commit: `refactor(svelte): migrate +page.svelte to Svelte 5 syntax`

**リスク軽減策**:
- ファイルごとにブランチ作成
- 各移行後に動作確認
- 問題があれば即座にロールバック
- Storybookで視覚的検証

**トレードオフ**:
- ✅ 自動化と品質のバランス
- ✅ 段階的な検証
- ✅ 最終的にクリーンなコード
- ⚠️ 複数フェーズで時間はかかる
- ✅ 各フェーズでの学習機会

**推奨度**: ⭐⭐⭐⭐⭐

## 4. 実装の複雑度とリスク

### 工数見積もり

**Card.svelte**: S (1-2時間)
- 理由: 小規模、パターンが明確、依存が少ない

**+page.svelte**: M (3-5時間)
- 理由: 複雑な状態管理、多数のイベント処理、swipe機能のテストが必要

**テスト・検証**: S (1-2時間)
- 理由: 既存テストが少ない、主に手動検証

**合計**: S-M (5-9時間)

### リスク評価

**リスクレベル**: Medium

**理由**:
1. **技術的リスク (Low)**:
   - Svelte 5は安定版
   - 公式移行ツールあり
   - パターンは確立済み

2. **複雑性リスク (Medium)**:
   - swipe機能の複雑なイベント処理
   - 複数の状態の相互依存
   - localStorageとの同期

3. **テストリスク (Medium)**:
   - テストカバレッジが低い
   - 手動検証に依存
   - リグレッション検出が困難

4. **統合リスク (Low)**:
   - +layout.svelteは既に移行済み
   - 依存関係は更新不要
   - ファイル間の依存は明確

### 緩和策

1. **小さな単位でコミット**: 各変更を独立してテスト可能に
2. **Storybookで視覚検証**: UIの変更を即座に確認
3. **ブラウザでの動作確認**: 主要機能を手動テスト
4. **段階的ロールアウト**: 問題があれば即座にロールバック可能

## 5. 設計フェーズへの推奨事項

### 推奨アプローチ

**Option C (ハイブリッドアプローチ)** を推奨

### 主要な決定事項

1. **移行ツール**: `sv migrate svelte-5` + 手動クリーンアップ
2. **移行順序**: Card.svelte → +page.svelte (依存順)
3. **検証方法**: Storybook + ブラウザ手動テスト + pnpm check
4. **コミット戦略**: ファイル単位でConventional Commits

### 設計フェーズで研究すべき項目

1. **swipeState の$state化**:
   - オブジェクト全体を`$state()`でラップするか
   - 個別のプロパティを`$state()`にするか
   - パフォーマンスへの影響

2. **$effect vs $effect.pre の使い分け**:
   - swipe処理での適切な使用
   - DOMアニメーションとの同期

3. **イベント修飾子の代替実装**:
   - `preventDefault`の手動実装
   - `stopPropagation`の必要性確認
   - passive listenerの適切な使用

4. **テスト戦略**:
   - Vitestテスト設定の有効化
   - Testing Libraryでのコンポーネントテスト追加
   - E2Eテストの必要性評価

5. **型安全性の強化**:
   - `$props()`の型定義
   - イベントハンドラーの型定義
   - TypeScript strict modeの維持

## 6. まとめ

### 現状

- ✅ Svelte 5パッケージは導入済み
- ✅ +layout.svelteは既に移行済み
- ❌ Card.svelteとpage.svelteが移行対象
- ⚠️ テストカバレッジが低い

### 実装可能性

**高い**: 技術的な障壁は低く、公式ツールとドキュメントが充実している

### 推奨される次のステップ

1. `/kiro:spec-design svelte-5-migration` を実行して技術設計を作成
2. 設計フェーズで上記の研究項目を調査
3. 実装フェーズでハイブリッドアプローチを採用
