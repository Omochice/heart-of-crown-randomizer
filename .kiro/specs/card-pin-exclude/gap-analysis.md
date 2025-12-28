# Implementation Gap Analysis

## 概要

この分析は、カードのピン留め・除外機能の要件と既存のコードベースの間のギャップを特定し、実装戦略を提示します。

### 分析範囲

- **対象要件**: Requirement 1-6（カード状態管理、UI操作、状態解除、再ランダマイズ、URL同期、アクセシビリティ）
- **既存コードベースの調査範囲**: packages/randomizer、packages/site
- **主な調査ポイント**: 既存の除外機能の実装パターン、URL状態管理、Randomizer APIの拡張性

### 主な発見

- ✅ **既存の除外機能**: `excludedCommons`がlocalStorageベースで実装済み（packages/site/src/routes/+page.svelte:15-32）→ **削除対象**
- ✅ **URL状態管理**: カードIDベースのURLパラメータシステムが存在（packages/site/src/routes/+page.svelte:34-47, 54-61）
- ✅ **Randomizer API**: `select()`関数が`constraints.require`をサポート（packages/randomizer/src/select.ts:88-109）
- ⚠️ **ギャップ**: ピン機能なし、UI操作ボタンなし、URL同期が除外/ピン状態に対応していない

---

## 1. 現状調査

### 既存アーキテクチャの主要パターン

#### データフロー

```
URL Params (card IDs)
  ↓ $effect (L36-47)
selectedCommons
  ↓ drawRandomCards() / drawMissingCommons()
Randomizer API (select, filterByIds)
  ↓
selectedCommons ← URL更新 (goto)
```

#### 状態管理アプローチ

- **URL-first**: カード選択結果はURLパラメータ（`?card=1&card=2`）に保存
- **localStorage**: 除外カード（`excludedCommons`）はローカルストレージに永続化
- **Svelte runes**: `$state`、`$effect`、`$derived`を使用したリアクティブシステム

#### 重要ファイル

| ファイル | 責務 | ピン/除外機能への関連性 |
|---------|-----|---------------------|
| `packages/site/src/routes/+page.svelte` | メインUIロジック | 拡張対象（状態管理、UI追加） |
| `packages/site/src/lib/Card.svelte` | カード表示コンポーネント | UI拡張対象（ピン/除外ボタン追加） |
| `packages/randomizer/src/select.ts` | カード選択ロジック | `constraints.require`を利用可能 |
| `packages/randomizer/src/filter.ts` | フィルタリングユーティリティ | `filterByIds`を除外に利用可能 |

#### 既存のコーディング規約

- **命名**: kebab-case（ファイル名）、camelCase（変数/関数）
- **テスト分離**: 関心ごとに分割（`page.reactivity.test.ts`, `page.url-reactivity.test.ts`など）
- **インポート**: workspace imports（`@heart-of-crown-randomizer/*`）、相対パス（同一パッケージ内）
- **型安全性**: TypeScript strictモード、discriminated unions

---

## 2. 要件と既存資産のマッピング

### Requirement 1: カード状態管理

| 受入基準 | 既存資産 | ギャップ | タグ |
|---------|---------|---------|-----|
| 1.1 3つの状態管理（通常、ピン、除外） | `excludedCommons: CommonCard[]` (L16) | ピン状態の管理構造なし | **Missing** |
| 1.2 ピン状態のカードを必須扱い | `select()` with `constraints.require` | Randomizer APIは対応済み、Site側の連携なし | **Partial** |
| 1.3 除外状態のカードを選択から除外 | `filterByIds(allCommons, excludedIds)` (L67) | 実装済み | ✅ |
| 1.4 状態クリア機能 | `removeFromExcludedCommons()` (L222) | ピン状態のクリアなし | **Missing** |
| 1.5 URL経由の状態共有 | `localStorage`（除外のみ） | ピン/除外のURL同期なし | **Missing** |

**技術的制約**:
- `select()`の`constraints.require`は配列参照を要求（L92-100）
- 現在のURL形式は選択結果のみ（`?card=1&card=2`）でメタデータ（ピン/除外）を含まない

### Requirement 2: UI操作インターフェース

| 受入基準 | 既存資産 | ギャップ | タグ |
|---------|---------|---------|-----|
| 2.1 ピン/除外ボタンの表示 | `Card.svelte`に削除ボタン（L58-67） | ピン/除外ボタンなし | **Missing** |
| 2.2-2.3 ボタンクリックで状態変更 | スワイプ削除ロジック（L134-219） | ピン/除外のクリックハンドラなし | **Missing** |
| 2.4-2.5 ボタンの見た目変更 | Tailwind CSS、動的クラスバインディング | 状態に応じた視覚的フィードバックなし | **Missing** |
| 2.6-2.7 カードの視覚的区別 | `borderColor`, `textColor` (L24-27) | ピン/除外状態のスタイルなし | **Missing** |

**既存パターン**:
- Tailwind CSSベースのスタイリング
- `$derived`を使った動的クラス計算
- イベントハンドラの`Props`経由での受け渡し

### Requirement 3: 状態解除操作

| 受入基準 | 既存資産 | ギャップ | タグ |
|---------|---------|---------|-----|
| 3.1-3.2 再クリックで状態解除 | N/A | トグルロジックなし | **Missing** |
| 3.3 通常スタイルへの復元 | 動的スタイル計算 | 状態管理との統合なし | **Missing** |
| 3.4 トグル動作の実装 | N/A | トグル状態管理なし | **Missing** |

### Requirement 4: 再ランダマイズ時の状態維持

| 受入基準 | 既存資産 | ギャップ | タグ |
|---------|---------|---------|-----|
| 4.1 ピンカードを結果に含める | `select()` with `constraints.require` | Site側でrequireの渡し方が未実装 | **Missing** |
| 4.2 除外カードを除外 | `filterByIds(allCommons, excludedIds)` (L67) | 実装済み | ✅ |
| 4.3 ピン/除外状態の反映 | `drawRandomCards()` (L64-73) | ピン状態の考慮なし | **Missing** |
| 4.4-4.5 エラーメッセージ表示 | N/A | バリデーションロジックなし | **Missing** |

**技術的考慮事項**:
- `select()`は`ConstraintConflictError`を投げる（packages/randomizer/src/constraint.ts:5-21）
- 既存のエラーハンドリングパターンなし（調査範囲内）

### Requirement 5: URL状態の同期

| 受入基準 | 既存資産 | ギャップ | タグ |
|---------|---------|---------|-----|
| 5.1 URLパラメータへの状態反映 | `cardsToQuery()` (L54-61) | ピン/除外のエンコードなし | **Missing** |
| 5.2 ページロード時の状態復元 | `$effect` (L36-47) | ピン/除外のデコードなし | **Missing** |
| 5.3 既存URL管理との統合 | `goto()` (L71, 235) | 統合戦略が必要 | **Missing** |
| 5.4 URL長の最適化 | N/A | エンコード方式の検討が必要 | **Research Needed** |

**技術的検討事項**:
- 現在: `?card=1&card=2`（選択結果のみ）
- 必要: ピン/除外メタデータの追加（例: `?card=1&pin=1&exclude=3`）
- URL長制限: 2000文字程度（ブラウザ依存）

### Requirement 6: アクセシビリティ

| 受入基準 | 既存資産 | ギャップ | タグ |
|---------|---------|---------|-----|
| 6.1 キーボード操作 | `onkeydown` (L54-56) | ピン/除外キーボード操作なし | **Missing** |
| 6.2 フォーカスインジケーター | Tailwind `focus:` utilities | 新規ボタンへの適用が必要 | **Partial** |
| 6.3 色以外の視覚的区別 | Link highlight (L30-38, L94-107) | ピン/除外のアイコン未定義 | **Missing** |
| 6.4-6.5 ARIA属性 (MAY) | `aria-label` (L45) | ピン/除外ボタンのARIAなし | **Optional** |

**既存パターン**:
- `role="button"`, `tabindex="0"`, `aria-label`の使用実績あり
- キーボードイベント処理の実績あり（Delete/Backspace）

### Requirement 7: 既存機能の移行

| 受入基準 | 既存資産 | ギャップ | タグ |
|---------|---------|---------|-----|
| 7.1 localStorageベースの除外機能削除 | `excludedCommons` (L16-32, L222-225) | 削除が必要 | **Delete** |
| 7.2 除外カードリスト表示削除 | UIセクション (L320-351) | 削除が必要 | **Delete** |
| 7.3 localStorage関連コード削除 | `localStorage.setItem/getItem/removeItem` | 削除が必要 | **Delete** |
| 7.4 移行通知の表示 (SHOULD) | N/A | 実装が必要 | **Missing** |
| 7.5 全状態のURL管理 | 部分的実装（selectedCommonsのみ） | ピン/除外の追加が必要 | **Missing** |

**削除対象コード**:
- `excludedCommons` state (L16)
- localStorage読み込み $effect (L19-32)
- `removeFromExcludedCommons()` (L222-225)
- `clearExcludedCommons()` (L256-259)
- 除外カードリストUI (L320-351)
- `drawRandomCards()`, `drawMissingCommons()`内のexcludedIds参照 (L66-67, L244)

---

## 3. 実装アプローチのオプション

### Option A: 既存コンポーネントの拡張

**対象ファイル**:
- `packages/site/src/routes/+page.svelte`: 状態管理ロジックを拡張
- `packages/site/src/lib/Card.svelte`: ピン/除外ボタンUIを追加

**拡張内容**:

1. **状態管理**（+page.svelte）
   - `pinnedCommons: CommonCard[]`を追加（`excludedCommons`と並列）
   - `togglePinCard()`, `toggleExcludeCard()`関数を追加
   - `drawRandomCards()`で`select()`の`constraints.require`にピンカードを渡す

2. **URL同期**（+page.svelte）
   - `cardsToQuery()`を拡張してピン/除外IDを含める
   - `$effect`でURLパラメータからピン/除外状態を復元

3. **UIコンポーネント**（Card.svelte）
   - Propsに`isPinned`, `isExcluded`, `onTogglePin`, `onToggleExclude`を追加
   - ピン/除外ボタンを削除ボタンと並列配置
   - 状態に応じた視覚スタイルを`$derived`で計算

**互換性評価**:
- ✅ 既存のAPI（`select`, `filterByIds`）は変更不要
- ✅ 削除ボタン、スワイプ機能は既存のまま維持
- ⚠️ `+page.svelte`が500行→600行程度に増加（複雑度上昇）

**トレードオフ**:
- ✅ 最小限のファイル変更で実装可能
- ✅ 既存パターン（localStorage、URL同期）を再利用
- ❌ `+page.svelte`の責務が増加（状態管理が複雑化）
- ❌ テストファイルの肥大化（page.*.test.tsに追加テストが必要）

### Option B: 新規コンポーネント作成

**新規ファイル**:
- `packages/site/src/lib/stores/card-state.svelte.ts`: ピン/除外状態管理のSvelteストア
- `packages/site/src/lib/CardWithActions.svelte`: アクションボタン付きカード

**責務分離**:

1. **card-state.svelte.ts**
   - `pinnedCards`, `excludedCards`の状態管理
   - `togglePin()`, `toggleExclude()`, `clearPin()`, `clearExclude()`
   - URL同期ロジック（`encodeState()`, `decodeState()`）
   - **Note**: URLが状態の単一情報源（Single Source of Truth）となるため、localStorage永続化は不要

2. **CardWithActions.svelte**
   - カード表示（`Card.svelte`をラップ）
   - ピン/除外ボタンUI
   - 状態に応じた視覚スタイル
   - アクションハンドラ（storeと連携）

3. **+page.svelte**
   - `card-state`ストアをインポート
   - `drawRandomCards()`で`store.pinnedCards`を`select()`に渡す
   - `CardWithActions`を使用

**統合ポイント**:
- `+page.svelte`は既存の`selectedCommons`管理を継続
- 新規ストアは`pinnedCards`/`excludedCards`のみ管理
- `drawRandomCards()`でストアとRandomizer APIを接続

**トレードオフ**:
- ✅ 関心の分離（状態管理、UI、ビジネスロジック）
- ✅ テスト容易性向上（ストア、コンポーネント単位でテスト可能）
- ✅ `+page.svelte`の複雑度抑制
- ❌ ファイル数増加（+2ファイル）
- ❌ 初期実装コスト増加（インターフェース設計）

### Option C: ハイブリッドアプローチ

**戦略**:

**Phase 1: 最小実装（Option Aベース）**
- `+page.svelte`に`pinnedCommons`状態を追加
- `Card.svelte`にピン/除外ボタンを追加
- ベーシックなURL同期（例: `?pin=1,2&exclude=3,4`）

**Phase 2: リファクタリング（Option Bへ移行）**
- 状態管理を`card-state.svelte.ts`に抽出
- URL同期を最適化（Base64エンコードなど）
- `CardWithActions.svelte`への分離

**フェーズ分割の根拠**:
- Phase 1で要件を満たし、早期フィードバック取得
- Phase 2でコード品質向上、保守性改善
- 段階的に複雑度を管理

**リスク緩和**:
- Phase 1実装時にストア抽出を想定した設計
- テストカバレッジ確保でリファクタリング安全性向上

**トレードオフ**:
- ✅ 段階的な実装でリスク分散
- ✅ 早期リリース可能
- ❌ 計画的リファクタリングが必要（追加工数）
- ❌ Phase 1の技術的負債を意図的に作る

---

## 4. 実装複雑度とリスク

### 工数見積もり

**S (1-3日)**: 該当なし

**M (3-7日)**:
- **Option A: 既存拡張**
  - 既存コード削除: 0.5日
  - 状態管理追加: 1日
  - UI実装: 1日
  - URL同期: 2日
  - テスト: 1日
  - **合計**: 5.5日

**L (1-2週)**:
- **Option B: 新規作成**
  - 既存コード削除: 0.5日
  - ストア設計・実装: 2日
  - CardWithActions実装: 1日
  - 統合・URL同期: 2日
  - テスト: 2日
  - **合計**: 7.5日

- **Option C: ハイブリッド**
  - Phase 1: 5.5日（Option Aと同等）
  - Phase 2: 3日（リファクタリング）
  - **合計**: 8.5日

**XL (2週+)**: 該当なし

### リスク評価

**Medium**:
- **理由**:
  - 既存パターン（URL同期、localStorage）の再利用が可能
  - Randomizer APIの`constraints.require`が利用可能
  - TypeScript strictモードで型安全性確保
  - 既存テストパターン（関心ごと分割）が確立
- **不確実性**:
  - URL長最適化の具体的手法（Base64 vs カスタムエンコード）
  - 大量のピン/除外カード時のパフォーマンス
  - ブラウザ間のURL長制限の差異

**リスク緩和策**:
- URL長: 設計フェーズで圧縮手法を検証（Base64、ビットマップ）
- パフォーマンス: プロパティベーステスト（`@fast-check/vitest`）で検証
- ブラウザ互換性: 2000文字制限を安全マージンとして設定

---

## 5. 設計フェーズへの推奨事項

### 推奨アプローチ

**Option B: 新規コンポーネント作成**を推奨

**理由**:
1. **保守性**: 状態管理の責務分離により、長期的なメンテナンスコストが低い
2. **テスト容易性**: ストア、コンポーネント単位でのテストが可能
3. **拡張性**: 将来的な機能追加（例: プリセット機能）に対応しやすい
4. **コード品質**: プロジェクトのSeparation of Concernsの哲学に合致

**次フェーズで決定すべき事項**:
1. **URL同期の具体的手法**:
   - カンマ区切り（`?card=1&card=2&pin=1&exclude=3`）
   - Base64エンコード（`?state=eyJwaW4iOlsxLDJdLCJleGNsdWRlIjpbM119`）
   - ビットマップ（カードIDを2進数で表現）
2. **エラーハンドリング**:
   - `ConstraintConflictError`のUI表示方法
   - カード不足時のユーザー通知
3. **移行通知の設計**:
   - 既存のlocalStorageデータが存在する場合の通知UI
   - 通知の表示タイミングと内容
   - 移行ガイダンスの提供方法

### 設計フェーズの研究項目

| 項目 | 優先度 | 詳細 |
|-----|-------|-----|
| URL長最適化手法の選定 | 高 | Base64、ビットマップ、カスタムエンコードの比較検証 |
| Svelte 5 runesベストプラクティス | 中 | `$state`のモジュールスコープ利用パターン調査 |
| エラーメッセージのUI設計 | 中 | トースト通知、インラインエラー、モーダルの選択 |
| アイコンライブラリの選定 | 低 | ピン/除外アイコンの視覚デザイン（MAYのARIA対応含む） |

---

## 6. まとめ

### ギャップサマリー

- **削除対象**: 既存の除外機能（localStorageベース、約200行のコード）
- **新規実装が必要**: ピン状態管理、UI操作ボタン、ピン/除外のURL同期、状態トグル、エラーハンドリング、移行通知
- **既存資産の活用**: `select()`の`constraints.require`、`filterByIds()`、URL同期パターン、テスト分割パターン
- **アーキテクチャ改善**: localStorageとURLの二重管理を解消し、URLを単一情報源（Single Source of Truth）に統一

### 技術的実現可能性

**高**: 既存のアーキテクチャとAPIがピン/除外機能をサポートしており、大規模な構造変更は不要。

### 次ステップ

`/kiro:spec-design card-pin-exclude`を実行して技術設計フェーズに進んでください。
