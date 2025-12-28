# Research & Design Decisions

---
**目的**: 設計判断の根拠となる調査結果、アーキテクチャ検討、および意思決定の記録

**使用方法**:
- 発見フェーズ中の調査活動と成果をログに記録
- `design.md`には詳細すぎる設計判断のトレードオフを文書化
- 将来の監査や再利用のための参考資料と証拠を提供
---

## Summary
- **Feature**: `card-pin-exclude`
- **Discovery Scope**: Extension（既存システムの拡張）
- **Key Findings**:
  - URL状態管理にはカンマ区切り形式が最適（可読性とシンプルさ）
  - Svelte 5 runesの`.svelte.ts`モジュールスコープをSSR対応で使用
  - 既存の`select()`関数の`constraints.require`でピン機能を実装可能

## Research Log

### URL Query Parameter Encoding Methods

- **Context**: ピン/除外カード情報をURL経由で共有可能な形式でエンコードする必要がある
- **Sources Consulted**:
  - Web研究: URL query parameter encoding methods comparison 2025
  - MDN Web Docs: URLSearchParams API
  - 既存コード: `+page.svelte` L34-47のURL同期パターン
- **Findings**:
  - **Base64エンコード**:
    - URLセーフではない（`+`が空白になる問題）
    - 追加のURL encodeが必要（`%2B`など）
    - 人間による読解が困難
  - **カンマ区切り形式**:
    - URLSearchParams APIで直接サポート (`getAll()`)
    - 既存コード（L34-47）で同パターンを使用中
    - 人間が読みやすい: `?pin=1,5,12&exclude=7,9`
    - 実装がシンプル
- **Implications**:
  - カンマ区切り形式を採用（既存パターンとの一貫性）
  - `URLSearchParams.getAll("pin")`, `getAll("exclude")`で取得
  - デコード処理は既存の`selectedCommons`と同じパターンを再利用

### Svelte 5 Runes Module Scope State Management

- **Context**: カードのピン/除外状態をコンポーネント間で共有する必要がある
- **Sources Consulted**:
  - Web研究: Svelte 5 runes module scope state management best practices 2025
  - Svelte公式ドキュメント: Runes (`$state`, `$derived`, `$effect`)
  - SvelteKit公式ドキュメント: SSR considerations
- **Findings**:
  - **`.svelte.ts`拡張子**: モジュールスコープ状態用の規約
  - **パフォーマンス**: Svelte 5 runesはストアより高速
  - **型安全性**: TypeScript統合が優れている
  - **SSR警告**: モジュールスコープ状態はサーバーリクエスト間で永続化する
    - 解決策: URL由来の状態はページコンポーネントで初期化
    - ストアは派生状態のみを保持（URL同期は`$effect`で処理）
- **Implications**:
  - `card-state.svelte.ts`を作成（モジュールスコープ）
  - URL → State同期は`+page.svelte`の`$effect`で実装
  - State → URL同期は`goto()`で実装（既存パターンと一貫）

### Existing Constraint API for Pinned Cards

- **Context**: ピン機能を実装するための既存APIの調査
- **Sources Consulted**:
  - `packages/randomizer/src/select.ts` L1-82
  - Gap Analysis: 既存機能の活用可能性
- **Findings**:
  - `select()`関数は既に`constraints.require`パラメータをサポート
  - 必須アイテムは結果に自動的に含まれる
  - バリデーション: 必須アイテムが`items`配列に含まれることを確認
  - エラーハンドリング: 制約違反時に明確なエラーメッセージ
- **Implications**:
  - ピン機能は既存APIをそのまま使用可能
  - 新規API追加は不要
  - `drawRandomCards()`呼び出し時に`constraints.require`を渡すだけ

## Architecture Pattern Evaluation

gap-analysis.mdで評価した3つのオプション:

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Option A | `+page.svelte`内に直接実装 | 迅速な実装、既存パターンとの一貫性 | 将来的な分離が困難、テスト性の低下 | 既存の`excludedCommons`と同じパターン |
| Option B | 新規コンポーネント分離 | 保守性向上、テストが容易、再利用可能 | 初期開発コスト増加（約0.5日） | **推奨**: 長期的な保守性を優先 |
| Option C | randomizer層への状態管理追加 | 純粋関数性の維持、型安全性 | オーバーエンジニアリング、既存設計との不整合 | 現在のスコープには過剰 |

**選択**: Option B（新規コンポーネント分離）

## Design Decisions

### Decision: URL Encoding Format（URLエンコード形式）

- **Context**: ピン/除外カードIDをURLパラメータで表現する必要がある
- **Alternatives Considered**:
  1. **Base64エンコード** — コンパクトだが可読性が低く、追加のURL encodeが必要
  2. **カンマ区切り形式** — 可読性が高く、既存コードと一貫性がある
  3. **ビットマップ形式** — 最もコンパクトだが、実装が複雑で可読性が最悪
- **Selected Approach**: カンマ区切り形式
  - `?pin=1,5,12&exclude=7,9`
  - `URLSearchParams.getAll("pin")`で取得
  - 既存の`card`パラメータと同じパターン（L34-47）
- **Rationale**:
  - 既存コードとの一貫性（保守性向上）
  - 実装のシンプルさ（開発時間削減）
  - デバッグの容易さ（URLを直接読める）
- **Trade-offs**:
  - **Benefits**: 可読性、シンプルさ、既存パターン再利用
  - **Compromises**: URL長が多少長くなる（実用上は問題なし）
- **Follow-up**:
  - カードID数が非常に多い場合のURL長制限テスト
  - ブラウザのURL長制限（~2000文字）内に収まることを確認

### Decision: State Management Approach（状態管理アプローチ）

- **Context**: カードのピン/除外状態をコンポーネント間で共有し、URL同期する必要がある
- **Alternatives Considered**:
  1. **Svelte Stores (`writable`)** — 従来のアプローチ、安定しているが冗長
  2. **Svelte 5 Runes (`.svelte.ts`)** — モダン、高速、型安全だがSSR考慮が必要
  3. **Props Drilling** — 最もシンプルだが、複数コンポーネントで非現実的
- **Selected Approach**: Svelte 5 Runes (`.svelte.ts`)
  - `packages/site/src/lib/stores/card-state.svelte.ts`を作成
  - `$state()`でリアクティブ状態を定義
  - `$effect()`でURL同期（`+page.svelte`内）
- **Rationale**:
  - Svelte 5のベストプラクティスに準拠
  - TypeScript統合が優れている（型安全性）
  - パフォーマンスが向上（reactivity system）
  - 既存のストアパターンからの移行を促進
- **Trade-offs**:
  - **Benefits**: 型安全性、パフォーマンス、モダンなAPI
  - **Compromises**: SSR考慮が必要（初期化はページコンポーネントで実施）
- **Follow-up**:
  - SSR環境でのモジュールスコープ状態の動作確認
  - 複数タブ間での状態独立性の確認

### Decision: Component Boundary（コンポーネント境界）

- **Context**: UI操作インターフェースをどのレベルで分離するか
- **Alternatives Considered**:
  1. **`+page.svelte`に直接実装** — 迅速だが保守性が低い
  2. **新規`CardWithActions.svelte`コンポーネント** — 保守性が高く再利用可能
  3. **既存`CardComponent`の拡張** — 既存コンポーネントがない場合は不適切
- **Selected Approach**: 新規`CardWithActions.svelte`コンポーネント
  - Props: `card`, `state` (pin/exclude/normal)
  - Events: `onTogglePin()`, `onToggleExclude()`
  - 視覚的フィードバックを含む
- **Rationale**:
  - Single Responsibility Principle（SRP）に準拠
  - テストが容易（コンポーネント単位）
  - 将来的な再利用性（他のページでも使用可能）
  - `structure.md`の「Separation of Concerns」に準拠
- **Trade-offs**:
  - **Benefits**: 保守性、テスト性、再利用性
  - **Compromises**: 初期開発コスト（約0.5日追加）
- **Follow-up**:
  - アクセシビリティ要件（キーボード操作、フォーカス管理）の実装確認
  - 視覚的フィードバックのデザインレビュー

### Decision: Migration from localStorage（localStorage移行）

- **Context**: Requirement 7により、既存のlocalStorageベースの除外機能を削除する必要がある
- **Alternatives Considered**:
  1. **データ移行スクリプト** — 複雑で、URL-firstの原則に反する
  2. **移行通知のみ表示** — ユーザーに手動で設定し直してもらう
  3. **完全削除（移行なし）** — 最もシンプルだが、既存ユーザーへの影響大
- **Selected Approach**: 完全削除（移行なし）
  - `excludedCommons`状態を削除
  - localStorage関連コードを削除（~200行）
  - 移行通知は表示しない（URL-firstが新しいデフォルト）
- **Rationale**:
  - URL-first architectureへの明確な移行
  - Single Source of Truth（URL）の確立
  - コードベースのシンプル化
  - localStorageデータは既に共有不可能（ユーザー体験が限定的）
- **Trade-offs**:
  - **Benefits**: アーキテクチャの一貫性、コードのシンプル化
  - **Compromises**: 既存の除外設定がリセットされる（影響は限定的）
- **Follow-up**:
  - リリースノートで変更を明記
  - URL経由での除外設定方法をドキュメント化

## Risks & Mitigations

- **Risk 1: URL長制限**
  - 多数のカードをピン/除外した場合、URL長がブラウザ制限（~2000文字）を超える可能性
  - **Mitigation**: 初期実装では制限チェックなし、将来的にビットマップ形式への移行を検討

- **Risk 2: SSR状態永続化**
  - `.svelte.ts`モジュールスコープ状態がサーバーリクエスト間で永続化する可能性
  - **Mitigation**: URL由来の初期化は`+page.svelte`の`$effect`で実施、ストアは派生状態のみ保持

- **Risk 3: 制約競合エラー**
  - ピンカード数が選択枠を超える、または除外により選択可能カードが不足する場合
  - **Mitigation**: Requirement 4.4, 4.5に従い、明確なエラーメッセージを表示（実装時に詳細設計）

- **Risk 4: アクセシビリティ対応不足**
  - Requirement 6でMAYとなったが、基本的なキーボード操作は必要
  - **Mitigation**: ボタン要素を使用（フォーカス可能）、明確なフォーカスインジケーター

## References

- [Svelte 5 Documentation - Runes](https://svelte.dev/docs/svelte/$state) — `$state`, `$effect`, `$derived`の公式ドキュメント
- [SvelteKit Documentation - SSR](https://kit.svelte.dev/docs/server-side-rendering) — SSR環境での状態管理の注意点
- [MDN - URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) — URL query parameter APIリファレンス
- Gap Analysis (`.kiro/specs/card-pin-exclude/gap-analysis.md`) — 実装ギャップとオプション評価
- Requirements (`.kiro/specs/card-pin-exclude/requirements.md`) — 7つの要件定義
