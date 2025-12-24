# 研究・設計決定ログ

## Summary

- **Feature**: `svelte-5-migration`
- **Discovery Scope**: Extension (既存システムの構文移行)
- **Key Findings**:
  - Svelte 5パッケージは既に導入済み、依存関係更新は不要
  - +layout.svelteは既に移行済み、残り2ファイルの移行が必要
  - 公式移行ツール `sv migrate svelte-5` が利用可能
  - swipeStateオブジェクトは全体を`$state()`でラップする方が適切

## Research Log

### Svelte 5移行パターンの調査

- **Context**: Card.svelteと+page.svelteをSvelte 4からSvelte 5構文に移行する最適な方法を調査
- **Sources Consulted**:
  - Svelte 5公式移行ガイド (svelte/v5-migration-guide)
  - `sv migrate`コマンドドキュメント (cli/sv-migrate)
  - Svelte 5 runesドキュメント ($state, $derived, $effect, $props)
- **Findings**:
  - `export let` → `$props()`: 分割代入で型安全に受け取り可能
  - `$:` reactive statements → `$derived()` (純粋な計算) または `$effect()` (副作用) に分離
  - `on:event` → `onevent`: イベント修飾子は手動実装が必要
  - `onMount` → `$effect()`: ライフサイクルフックはeffectで代替
  - オブジェクト状態は`$state()`でラップすると深いリアクティビティが得られる
- **Implications**:
  - 自動移行ツールが基礎的な変換を行うが、イベント修飾子とcomplexな`$:`は手動調整が必要
  - swipeStateのような複雑なオブジェクトは全体を`$state()`でラップする設計を採用

### イベント修飾子の代替実装パターン

- **Context**: Svelte 4の`on:click|preventDefault`のような修飾子をSvelte 5で実装する方法
- **Sources Consulted**: Svelte 5移行ガイドのEvent modifiersセクション
- **Findings**:
  - `preventDefault`: イベントハンドラー内で`event.preventDefault()`を直接呼び出す
  - `stopPropagation`: イベントハンドラー内で`event.stopPropagation()`を直接呼び出す
  - `capture`, `passive`, `nonpassive`: `onclickcapture`のようにイベント名にサフィックスを追加
  - 自動移行ツールは`svelte/legacy`から関数をimportする可能性があるが、手動実装を推奨
- **Implications**:
  - Card.svelteのイベントハンドラーは修飾子なしのため影響なし
  - +page.svelteのタッチイベントはpassive設定が重要だが、デフォルトでpassiveになる

### swipeState オブジェクトの状態管理戦略

- **Context**: +page.svelteの複雑なswipeStateオブジェクトをどのように`$state()`化するか
- **Sources Consulted**:
  - $stateドキュメント (svelte/$state)
  - Deep state / Classes セクション
- **Findings**:
  - `$state()`でオブジェクトをラップすると深いリアクティブプロキシが作成される
  - 個別プロパティを`$state()`にするより、オブジェクト全体をラップする方が管理しやすい
  - プリミティブ値 (startX, currentX等) と参照 (cardElement) が混在する場合も同様に扱える
- **Implications**:
  - `const swipeState = $state({ startX: 0, ... })`のパターンを採用
  - オブジェクトプロパティへのアクセスは`swipeState.startX`のまま変更なし

### $derived vs $effect の使い分け

- **Context**: `$:` reactive statementsを`$derived()`と`$effect()`のどちらに変換するか
- **Sources Consulted**:
  - $derivedドキュメント (svelte/$derived)
  - $effectドキュメント (svelte/$effect)
  - 移行ガイドのlet → $state、$: → $derived/$effectセクション
- **Findings**:
  - **$derived()**: 純粋な計算、副作用なし、同期的
    - 例: `borderColor`, `textColor`, `basicCards`, `farEasternCards`
  - **$effect()**: 副作用あり、DOM操作、外部APIコール、localStorage等
    - 例: `onMount`内のlocalStorageロード、URL更新処理
  - 90%のケースでは`$derived()`を使用すべき
- **Implications**:
  - Card.svelteの`$: borderColor`、`$: textColor` → `$derived()`
  - +page.svelteの`$: basicCards`、`$: farEasternCards` → `$derived()`
  - +page.svelteの`onMount` → `$effect()`

### Testing Library for Svelte 5互換性

- **Context**: 既存のテストがSvelte 5移行後も動作するか確認
- **Sources Consulted**: package.jsonの依存関係
- **Findings**:
  - `@testing-library/svelte`: 5.2.9 (Svelte 5対応版)
  - 既存のテストコードはそのまま動作する見込み
  - `render()`関数のAPIは変更なし
- **Implications**:
  - テストコードの大幅な変更は不要
  - 新しいrunesを使用したコンポーネントも既存のテスト方法で検証可能

### Storybook 10.x とSvelte 5の統合

- **Context**: Storybookが移行後も正常に動作するか確認
- **Sources Consulted**: package.jsonの依存関係
- **Findings**:
  - `storybook`: 10.1.10 (Svelte 5対応版)
  - `@storybook/svelte`: 10.1.10
  - `@storybook/sveltekit`: 10.1.10
  - Svelte 5構文のコンポーネントストーリーをサポート
- **Implications**:
  - Storybookの設定変更は不要
  - 移行後のコンポーネントを即座にStorybookで視覚確認可能

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A: sv migrate自動移行のみ | 公式ツールで全ファイルを一括変換 | 迅速、自動化 | legacy importが残る、手動調整が必要 | ギャップ分析で⭐⭐⭐⭐評価 |
| B: 手動移行のみ | svelte-mcpを参照しながら完全手動変換 | クリーンなコード | 時間がかかる、ミスのリスク | ギャップ分析で⭐⭐⭐評価 |
| C: ハイブリッド (選択) | sv migrate + 手動クリーンアップ | 速度と品質のバランス | 複数フェーズ必要 | ギャップ分析で⭐⭐⭐⭐⭐評価 |

## Design Decisions

### Decision: ハイブリッドアプローチの採用

- **Context**: 2つのSvelteファイルを効率的かつ高品質に移行する必要がある
- **Alternatives Considered**:
  1. sv migrate自動移行のみ — 迅速だがlegacy importが残る
  2. 完全手動移行 — クリーンだが時間がかかりミスのリスクがある
- **Selected Approach**:
  1. `sv migrate svelte-5`で初期変換
  2. legacy import (`svelte/legacy`からのpreventDefault等) を手動で標準実装に置き換え
  3. `svelte-autofixer`で検証
  4. ビルド・テスト実行
- **Rationale**:
  - 自動ツールで基礎的な変換を高速化
  - 手動クリーンアップでlegacy依存を排除し、将来のメンテナンス性を確保
  - 各フェーズで検証することでリスクを最小化
- **Trade-offs**:
  - メリット: 速度と品質のバランス、段階的検証、最終的にクリーンなコード
  - デメリット: 単純な自動移行より時間がかかる
- **Follow-up**:
  - 各ファイル移行後にpnpm checkとpnpm devで動作確認
  - Storybookで視覚的検証

### Decision: swipeStateの$state()化パターン

- **Context**: +page.svelteの複雑なswipeStateオブジェクト (8プロパティ) を状態管理する
- **Alternatives Considered**:
  1. 各プロパティを個別に`$state()`化 — `let startX = $state(0); let startY = $state(0); ...`
  2. オブジェクト全体を`$state()`化 — `const swipeState = $state({ startX: 0, ... })`
- **Selected Approach**: オブジェクト全体を`$state()`でラップ
  ```typescript
  const swipeState = $state({
    startX: 0,
    startY: 0,
    currentX: 0,
    isDragging: false,
    cardElement: null as HTMLElement | null,
    cardIndex: -1,
    threshold: 100
  });
  ```
- **Rationale**:
  - Svelte 5の`$state()`はオブジェクトを深いリアクティブプロキシに変換
  - 関連するプロパティをグループ化し、コードの可読性を向上
  - 既存のアクセスパターン (`swipeState.startX`) を維持
- **Trade-offs**:
  - メリット: 管理しやすい、既存コード構造を維持、リアクティビティが自動的に深い
  - デメリット: 特になし (個別管理より優れている)
- **Follow-up**: 移行後にswipe機能の動作テストを重点的に実施

### Decision: $derived()の積極的使用

- **Context**: `$:` reactive statementsを`$derived()`または`$effect()`に変換する
- **Alternatives Considered**:
  1. すべてを`$effect()`に変換 — シンプルだが非効率
  2. 純粋な計算は`$derived()`、副作用は`$effect()`に分離
- **Selected Approach**: 副作用がない計算は`$derived()`を使用
  - Card.svelte: `borderColor`, `textColor` → `$derived()`
  - +page.svelte: `basicCards`, `farEasternCards` → `$derived()`
  - +page.svelte: localStorage処理、URL更新 → `$effect()`
- **Rationale**:
  - `$derived()`は純粋な計算で最適化されている
  - `$effect()`は副作用用で、過度の使用はパフォーマンス低下の原因
  - 移行ガイドでも90%のケースで`$derived()`を推奨
- **Trade-offs**:
  - メリット: パフォーマンス最適化、コードの意図が明確、将来のメンテナンス性
  - デメリット: 判断が必要 (ただし明確な基準あり)
- **Follow-up**: `svelte-autofixer`で不適切な使用を検出

### Decision: イベント修飾子の手動実装

- **Context**: Svelte 4の`on:event|modifier`をSvelte 5で実装する
- **Alternatives Considered**:
  1. `svelte/legacy`からpreventDefault等をimport (自動移行の結果)
  2. イベントハンドラー内で直接`event.preventDefault()`等を呼び出す
- **Selected Approach**: イベントハンドラー内で直接実装
  ```typescript
  function handleSubmit(event: Event) {
    event.preventDefault();
    // logic
  }
  ```
- **Rationale**:
  - `svelte/legacy`は非推奨で、将来のバージョンで削除される可能性
  - 直接実装の方がロジックが一箇所にまとまり可読性が向上
  - 移行ガイドでも直接実装を推奨
- **Trade-offs**:
  - メリット: 将来のメンテナンス性、コードの明確性、legacy依存の排除
  - デメリット: 数行のコード追加 (軽微)
- **Follow-up**: Card.svelteは修飾子なしのため影響なし

### Decision: 移行順序の決定

- **Context**: Card.svelteと+page.svelteのどちらを先に移行するか
- **Alternatives Considered**:
  1. +page.svelte → Card.svelte (親から子へ)
  2. Card.svelte → +page.svelte (子から親へ)
- **Selected Approach**: Card.svelte → +page.svelte (子から親へ)
- **Rationale**:
  - Card.svelteは依存が少なく、複雑度が低い (中程度)
  - +page.svelteはCard.svelteを使用するため、子が先に移行完了している方が安全
  - 問題が発生した場合の影響範囲を限定
- **Trade-offs**:
  - メリット: リスク最小化、段階的検証、問題の早期発見
  - デメリット: 特になし
- **Follow-up**: 各ファイル移行後に個別にcommit

## Risks & Mitigations

- **Risk 1: swipe機能の動作不良** — 移行後にタッチイベント処理が正しく動作しない可能性
  - Mitigation: モバイルデバイスまたはブラウザのデバイスモードで重点的にテスト、各イベントハンドラーのログ出力で動作確認
- **Risk 2: リアクティビティの喪失** — `$derived()`と`$effect()`の使い分けミスでリアクティブ更新が失われる
  - Mitigation: `svelte-autofixer`で構文チェック、ブラウザでの動作確認、既存の状態更新パターンを一つずつ検証
- **Risk 3: 型エラーの発生** — `$props()`への移行でTypeScript型定義が不正確
  - Mitigation: `pnpm check`で型チェック、strict modeを維持、必要に応じて明示的な型注釈を追加
- **Risk 4: localStorage同期の不具合** — `$effect()`への移行でlocalStorageとの同期タイミングがずれる
  - Mitigation: `$effect()`の依存関係を明示的に確認、localStorage操作の前後でログ出力、手動でブラウザ動作確認
- **Risk 5: Storybook表示の問題** — 移行後のコンポーネントがStorybookで正しく表示されない
  - Mitigation: 各ファイル移行後にStorybookを起動して視覚確認、必要に応じてストーリーファイルを調整

## References

- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide) — 公式移行ガイド、すべての構文変更を網羅
- [sv migrate CLI](https://svelte.dev/docs/cli/sv-migrate) — 自動移行ツールの使用方法と制限事項
- [$state rune](https://svelte.dev/docs/svelte/$state) — 状態管理の基本パターン
- [$derived rune](https://svelte.dev/docs/svelte/$derived) — 派生値の作成方法
- [$effect rune](https://svelte.dev/docs/svelte/$effect) — 副作用の実装パターン
- [$props rune](https://svelte.dev/docs/svelte/$props) — プロパティの受け取り方
- [Event handling in Svelte 5](https://svelte.dev/docs/svelte/v5-migration-guide#Event-changes) — イベント処理の変更点
