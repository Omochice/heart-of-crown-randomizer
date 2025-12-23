# 実装ギャップ分析

## 1. 現状調査

### 1.1 既存のパッケージ構造

**モノレポ構成:**
- pnpm workspace + Turborepo によるビルドオーケストレーション
- `packages/card/`: カードデータライブラリ（`@heart-of-crown-randomizer/card`）
- `packages/site/`: SvelteKitウェブアプリケーション（`@heart-of-crown-randomizer/site`）

**cardパッケージの特徴:**
- ビルドツール: `tsdown`（tech.mdでは「unbuild」と記載されているが、実際はtsdown使用）
- ゼロランタイム依存（devDependenciesのみ）
- ESM専用（`"type": "module"`）
- Subpath exports対応（`./basic`, `./type`など）
- 型定義自動生成（`.d.mts`）

**siteパッケージの特徴:**
- Vitest + Testing Library によるテスト環境構築済み
- テストファイル多数（`*.test.ts`, `*.svelte.test.ts`）
- cardパッケージへのworkspace依存（`workspace:*`）

### 1.2 現在のランダマイズ実装

**実装箇所:** `packages/site/src/routes/+page.svelte`

**主要関数:**

1. `drawRandomCards()` (lines 63-79):
```typescript
const shuffledCommons = [...availableCommons].sort(() => Math.random() - 0.5);
selectedCommons = shuffledCommons.slice(0, numberOfCommons).sort((a, b) => a.id - b.id);
```

2. `drawMissingCommons()` (lines 246-264):
```typescript
const shuffled = [...availableCommons].sort(() => Math.random() - 0.5);
const cardsToAdd = Math.min(numberOfCommons - selectedCommons.length, shuffled.length);
```

**課題:**
- `Math.random()` による非決定的シャッフル → テストが困難
- UI層にロジックが埋め込まれている → 再利用不可
- Fisher-Yatesなどの標準アルゴリズムではなく `sort()` による簡易実装

### 1.3 テスト戦略とパターン

**既存テスト環境:**
- Vitestセットアップ済み（siteパッケージ）
- Testing Library for Svelte使用
- テスト命名規則: `*.test.ts`, `*.svelte.test.ts`
- モック戦略: `vi.fn()`, `vi.stubGlobal()`, `vi.mock()`

**既存テストファイル例:**
- `page.svelte.test.ts`: コンポーネントテスト
- `page.url-reactivity.test.ts`: URL連携テスト
- `card-restoration.test.ts`: ユーティリティテスト

**テスト配置:**
- テストファイルはソースファイルと同じディレクトリ（colocation）

### 1.4 ビルドツールとモノレポ統合

**Turborepo設定 (`turbo.json`):**
```json
{
  "tasks": {
    "build": { "outputs": ["dist/**"] },
    "check": { "dependsOn": ["@heart-of-crown-randomizer/card#build"] },
    "test": {}
  }
}
```

**パッケージ間依存:**
- siteがcardに依存（`dependsOn`設定）
- ビルド順序の自動管理

## 2. 要件の実現可能性分析

### 2.1 技術的ニーズと既存資産のマッピング

| 要件 | 技術的ニーズ | 既存資産 | ギャップ |
|------|------------|---------|---------|
| Req 1: パッケージ構造 | モノレポパッケージ、tsdownビルド、ESM、subpath exports | cardパッケージの構造を参考可能 | **新規**: `packages/randomizer/` 作成 |
| Req 2: 決定的ランダマイズ | シード付きPRNG、Fisher-Yatesシャッフル | なし | **新規**: シード可能なRNG実装、シャッフルアルゴリズム |
| Req 3: フィルタリング | 述語ベースフィルタ、ID除外 | `+page.svelte`の`filter()`ロジック（行66-68, 250-253） | **抽出**: 既存フィルタロジックを汎用化 |
| Req 4: 制約ベース選択 | 必須カード、除外述語、競合検証 | なし | **新規**: 制約エンジン実装 |
| Req 5: カードデータ統合 | ジェネリック型パラメータ | `@heart-of-crown-randomizer/card/type`の型定義 | **活用**: 型のみインポート（ランタイム依存なし） |
| Req 6: テストカバレッジ | Vitest、100%カバレッジ | siteのVitest設定 | **拡張**: 新パッケージ用Vitest設定追加 |
| Req 7: 開発ワークフロー | TDD、コミット規約 | 既存プロジェクトの規約 | **制約**: 既存規約に従う |
| Req 8: サイト統合 | `+page.svelte`リファクタ | 現在のUI実装 | **移行**: 既存UIロジックをAPI呼び出しに置換 |
| Req 9: パフォーマンス | O(n)シャッフル | なし | **実装**: Fisher-Yatesアルゴリズム |
| Req 10: ドキュメント | README、JSDoc | cardパッケージにREADMEなし | **新規**: ドキュメント作成 |

### 2.2 主要なギャップと制約

**Missing（完全に欠落）:**
1. 決定的ランダム化のライブラリまたは実装
2. 制約ベースのカード選択エンジン
3. randomizerパッケージの構造全体

**Unknown（調査・研究が必要）:**
1. **シード可能なRNG選択**: [seedrandom](https://github.com/davidbau/seedrandom) vs [prando](https://github.com/zeh/prando) vs カスタム実装（Mulberry32など）
   - seedrandom: 最も人気、TypeScript型定義あり
   - prando: TypeScriptファースト、ゲーム向け
   - カスタム実装: 依存ゼロ、軽量、但し暗号学的強度は低い
2. **ビルドツールの選択**: tsdown vs unbuild
   - 現cardパッケージはtsdown使用（tech.mdとの不一致）
   - [tsdown](https://tsdown.dev/guide/): Rust製Rolldown基盤、高速、ESMファースト
   - [unbuild](https://github.com/unjs/unbuild): UnJSエコシステム、自動設定推論

**Constraint（既存アーキテクチャの制約）:**
1. ESM専用（CommonJSサポート不要）
2. TypeScript strict mode必須
3. ゼロランタイム依存の原則（cardパッケージに倣う）
4. Turborepoビルド統合が必要
5. pnpm workspace構造に従う

### 2.3 複雑性の指標

**ランダマイズパッケージ:**
- **タイプ**: アルゴリズムロジック（純粋関数）
- **複雑性**: 中程度
  - シャッフルアルゴリズム: シンプル
  - 制約エンジン: ロジック複雑（必須/除外の競合検証）
  - テスタビリティ: 高（純粋関数、決定的）

**サイト統合:**
- **タイプ**: リファクタリング
- **複雑性**: 低〜中程度
  - API呼び出しへの置換: シンプル
  - 既存動作の維持: 回帰テストで検証可能

## 3. 実装アプローチのオプション

### Option A: 拡張 - 該当なし

完全に新規のパッケージを作成するため、既存コンポーネントの拡張は該当しない。

### Option B: 新規作成（推奨）

**新規パッケージ作成:**
- **作成場所**: `packages/randomizer/`
- **パッケージ名**: `@heart-of-crown-randomizer/randomizer`
- **ビルドツール**: tsdown（cardパッケージと同じ）
- **構造**: cardパッケージのpackage.json構造を参考

**責任範囲:**
```
packages/randomizer/
├── src/
│   ├── index.ts           # メインエクスポート
│   ├── shuffle.ts         # shuffle<T>() 関数
│   ├── select.ts          # select<T>() 関数
│   ├── filter.ts          # filter<T>(), filterByIds<T>() 関数
│   ├── rng.ts             # シード可能なRNG実装
│   ├── constraints.ts     # 制約エンジン（require/exclude）
│   └── types.ts           # SelectOptions, Constraint型定義
├── test/
│   ├── shuffle.test.ts
│   ├── select.test.ts
│   ├── filter.test.ts
│   └── constraints.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

**統合ポイント:**
1. **Turborepoタスク追加**:
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["@heart-of-crown-randomizer/randomizer#build"]
    }
  }
}
```

2. **siteパッケージの依存追加**:
```json
{
  "dependencies": {
    "@heart-of-crown-randomizer/randomizer": "workspace:*"
  }
}
```

3. **型定義の参照**:
```typescript
// randomizerパッケージ内
import type { CommonCard } from '@heart-of-crown-randomizer/card/type';
```

**Trade-offs:**
- ✅ 関心の分離（ロジックとUIの分離）
- ✅ テストが容易（純粋関数）
- ✅ 再利用可能（他プロジェクトでも利用可能）
- ✅ 既存パッケージのパターンに従う
- ❌ 新規ファイル多数（但し明確な責任分担）
- ❌ ビルド設定の追加が必要

### Option C: ハイブリッドアプローチ（段階的実装）

**フェーズ1: コアパッケージ作成（Option B）**
- randomizerパッケージの基本機能実装
- `shuffle()`, `select()`, `filter()` のみ
- 制約機能は後回し

**フェーズ2: サイト統合**
- `+page.svelte`のリファクタリング
- 既存動作の維持確認
- 回帰テスト実行

**フェーズ3: 制約機能追加**
- `constraints.ts` 実装
- 必須カード、除外述語機能
- UIへの制約機能追加（将来）

**Trade-offs:**
- ✅ リスク分散（段階的リリース）
- ✅ 各フェーズで動作確認可能
- ✅ MVPを早期にリリース
- ❌ 複数回のリリースサイクル
- ❌ フェーズ間の調整コスト

## 4. 実装の複雑性とリスク評価

### 4.1 Effort（工数見積もり）

**S (1-3日):**
- なし

**M (3-7日):**
- コアランダマイズ機能（shuffle, select, filter）
- テスト実装（基本機能）
- パッケージ構造とビルド設定

**L (1-2週間):**
- 制約エンジン実装
- 完全なテストカバレッジ（100%）
- ドキュメント作成
- サイト統合とリファクタリング

**XL (2週間以上):**
- なし（適切にスコープされている）

**総合見積もり: M〜L（5-10日）**
- TDDアプローチによる開発
- 段階的実装により柔軟に調整可能

### 4.2 Risk（リスク評価）

**Low:**
- 既存パッケージパターンに従う（tsdown、ESM、型定義）
- 純粋関数の実装（副作用なし）
- 明確なスコープ（ランダマイズのみ）

**Medium:**
- RNGライブラリの選択（seedrandom vs prando vs カスタム）
  - 軽減策: seedrandomが最も実績あり、型定義完備
- 制約エンジンのロジック複雑性（必須/除外の競合検証）
  - 軽減策: TDDで段階的に実装、エッジケース網羅
- サイト統合時の回帰リスク
  - 軽減策: 既存テスト実行、手動テストで確認

**High:**
- なし

**総合リスク: Medium**

**リスク軽減策:**
1. TDD手法を徹底（Red → Green → Refactor）
2. seedrandomを採用（実績、型定義、広く使用されている）
3. 段階的実装（コア機能 → サイト統合 → 制約機能）
4. 既存テストスイートを活用した回帰検証

## 5. 設計フェーズへの推奨事項

### 5.1 推奨アプローチ

**Option B（新規作成）を採用、Option C（ハイブリッド）の段階的実装戦略を組み合わせ**

**理由:**
- 関心の分離により保守性向上
- テスタビリティが大幅に改善
- 既存パッケージのベストプラクティスに従う
- 段階的実装によりリスク管理が可能

### 5.2 重要な設計決定事項

**即座に決定すべき事項:**

1. **RNGライブラリの選択**:
   - **推奨**: seedrandom
   - 理由: 最も人気、型定義完備、npmダウンロード数多い、メンテナンス活発
   - 代替: カスタム実装（Mulberry32）でゼロ依存を維持

2. **ビルドツール**:
   - **推奨**: tsdown（既存cardパッケージと統一）
   - tech.mdを更新してtsdown使用を明記

3. **パッケージ構造**:
   - cardパッケージのpackage.json構造を踏襲
   - subpath exportsは不要（シンプルな単一エクスポート）

**設計フェーズで詳細化すべき事項:**

1. **制約エンジンのAPI設計**:
```typescript
interface Constraint<T> {
  exclude?: Predicate<T>[];
  require?: T[];
}
```
   - OR/ANDロジックの表現方法
   - 競合検証のタイミングと方法

2. **エラーハンドリング戦略**:
   - 無効なシード値のエラーメッセージ
   - 制約競合時のエラーメッセージ
   - 空配列の扱い

3. **型定義の詳細**:
```typescript
interface SelectOptions<T> {
  seed?: number;
  constraints?: Constraint<T>;
}
```

### 5.3 研究項目

**設計フェーズで調査が必要:**

1. ✅ **RNGライブラリ選択の最終決定** [調査済み]
   - seedrandom推奨、カスタム実装も検討
   - 参考: [seedrandom](https://github.com/davidbau/seedrandom), [prando](https://github.com/zeh/prando)

2. ✅ **ビルドツール確認** [調査済み]
   - tsdown vs unbuild比較完了
   - 参考: [tsdown guide](https://tsdown.dev/guide/), [unbuild](https://github.com/unjs/unbuild)

3. **Fisher-Yatesアルゴリズム実装の詳細**
   - in-placeシャッフル vs 新配列作成
   - パフォーマンステストの閾値設定

4. **プロパティベーステストの戦略**
   - 不変条件の定義（長さ保持、要素保持）
   - fast-checkなどのライブラリ使用検討

### 5.4 次のステップ

1. `/kiro:spec-design card-randomizer-package` を実行して技術設計を作成
2. 設計ドキュメントでAPI詳細、型定義、実装パターンを具体化
3. RNGライブラリの最終選択（seedrandom推奨）
4. タスク分解とTDDサイクルの計画

## 6. まとめ

本ギャップ分析により、以下が明確になりました：

**既存資産:**
- モノレポ構造とビルドツール（tsdown、Turborepo）
- テスト環境（Vitest、Testing Library）
- 型定義（`@heart-of-crown-randomizer/card/type`）
- フィルタリングロジックの参考実装

**主要ギャップ:**
- 決定的ランダム化の実装（seedrandom採用推奨）
- 制約ベースの選択エンジン
- 新規パッケージ構造全体

**推奨実装アプローチ:**
- Option B（新規作成） + Option C（段階的実装）
- TDD手法による開発
- seedrandomライブラリ使用（または軽量カスタム実装）

**工数とリスク:**
- 見積もり: M〜L（5-10日）
- リスク: Medium（段階的実装とTDDで軽減）

設計フェーズに進むことで、API設計、型定義、実装パターンの詳細が確定し、タスク分解が可能になります。
