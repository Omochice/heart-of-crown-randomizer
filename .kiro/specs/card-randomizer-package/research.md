# 研究・設計決定ドキュメント

## 概要

- **機能**: `card-randomizer-package`
- **ディスカバリースコープ**: 新機能（グリーンフィールド）
- **主要な調査結果**:
  - seedrandomライブラリが決定的ランダム化に最適（安定版、TypeScript型定義完備）
  - Fisher-Yatesアルゴリズム（Modern版）をO(n)で実装
  - tsdownビルドツールがモノレポに最適（既存cardパッケージと統一）
  - fast-checkによるプロパティベーステストがVitest統合可能

## 研究ログ

### 決定的ランダム化ライブラリの選択

**コンテキスト**: 要件2で決定的なシード付きランダマイズが必要。テスト可能性を実現するため、再現可能な乱数生成器が必須。

**調査したソース**:
- [seedrandom GitHub](https://github.com/davidbau/seedrandom)
- [seedrandom npm](https://www.npmjs.com/package/seedrandom)
- [@types/seedrandom npm](https://www.npmjs.com/package/@types/seedrandom)
- [prando GitHub](https://github.com/zeh/prando)
- [Unleashing the Power of seedrandom in TypeScript](https://www.xjavascript.com/blog/seedrandom-typescript/)

**調査結果**:
- **seedrandom v3.0.5** (2019年):
  - 2.1k stars、169 forks、MIT license
  - TypeScript型定義: `@types/seedrandom` (v3.0.8)
  - API: `rng()`, `quick()`, `int32()`, `state()` - state保存・復元機能あり
  - 複数のPRNGアルゴリズム（alea, xor128, tychei, xorwow, xor4096, xorshift7）
  - デフォルトはARC4ベース
  - **バンドルサイズ**: minified 1KB (1,043 bytes)、gzipped推定 500-700 bytes
  - パッケージ全体（unpacked）: 374KB（複数アルゴリズム、テスト、型定義含む）
  - Tree-shaking可能（必要なアルゴリズムのみimport可）

- **prando**:
  - TypeScriptファースト設計
  - ゲーム・UI向けに最適化
  - seedrandomより新しいが実績は少ない
  - バンドルサイズ情報なし

- **カスタム実装** (Mulberry32など):
  - ゼロ依存を維持可能
  - 超軽量（~100 bytes）
  - 暗号学的強度は低い
  - 周期が約40億、32bit値の1/3をスキップする問題
  - メンテナンス負担

**影響**:
- seedrandomを採用することで、ランタイム依存は1つのみ（要件1.3のゼロ依存原則は開発依存として許容）
- TypeScript型定義が公式に提供されており型安全性を確保
- state()メソッドによりテスト時の状態保存・復元が可能

### Fisher-Yatesシャッフルアルゴリズムの実装

**コンテキスト**: 要件9でO(n)時間計算量のシャッフルが必要。現在の実装（`sort(() => Math.random() - 0.5)`）はO(n log n)でバイアスあり。

**調査したソース**:
- [Fisher-Yates Shuffle Wikipedia](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle)
- [Fisher-Yates Shuffle Algorithm](https://bost.ocks.org/mike/shuffle/)
- [TypeScript Fisher-Yates implementation](https://github.com/lemmski/fisher-yates-shuffle)
- [Scrambling an Array in TypeScript](https://www.webdevtutor.net/blog/typescript-scramble-array)
- [Algorithms in TypeScript - Shuffling](https://basarat.gitbook.io/algorithms/shuffling)

**調査結果**:
- **Modern Fisher-Yates** (Durstenfeld 1964):
  - O(n)時間計算量、O(n)空間計算量（新配列作成）
  - 各順列が等確率で生成される（バイアスなし）
  - in-place実装可能だが、要件2.5（入力配列の非破壊）により新配列を返す

- **実装上の注意**:
  - `array.splice()`を使用するとO(n²)になる（配列の再インデックスが発生）
  - 乱数生成器の品質が重要（seedrandomで保証）
  - 逆方向ループ（末尾から先頭へ）が標準的

**影響**:
- `shuffle<T>()`関数はFisher-Yatesアルゴリズムで実装
- 新配列を作成して非破壊性を保証
- seedrandomとの組み合わせで決定的シャッフルを実現

### プロパティベーステスト戦略

**コンテキスト**: 要件6.5でシャッフル不変条件（長さ保持、要素保持）のプロパティベーステストが必要。

**調査したソース**:
- [fast-check official documentation](https://fast-check.dev/)
- [fast-check GitHub](https://github.com/dubzzz/fast-check)
- [@fast-check/vitest npm](https://www.npmjs.com/package/@fast-check/vitest)
- [Property-Based Testing with TypeScript & fast-check](https://www.samuraikun.dev/articles/property-based-testing)

**調査結果**:
- **fast-check**:
  - 月間800万ダウンロード
  - Vitest専用パッケージ: `@fast-check/vitest`
  - 2つのモード: ワンタイムランダムモード、フルプロパティベーステストモード
  - 2025年も活発に開発中

- **テスト対象の不変条件**:
  - シャッフル後の配列長さ = 元の配列長さ
  - シャッフル後の要素集合 = 元の要素集合（順序のみ変更）
  - 同じシードで同じ結果が得られる（決定性）

**影響**:
- `@fast-check/vitest`をdevDependencyに追加
- シャッフル不変条件をプロパティとして定義
- ランダムケースで幅広い入力をテスト

### ビルドツールとモノレポ統合

**コンテキスト**: 要件1.7で「unbuildでビルド可能」と記載されているが、既存cardパッケージはtsdownを使用。整合性を確認。

**調査したソース**:
- [tsdown vs unbuild comparison](https://alan.norbauer.com/articles/tsdown-bundler/)
- [tsdown monorepo example](https://github.com/Gugustinette/tsdown-applicative-monorepo)
- [tsdown Declaration Files](https://tsdown.dev/options/dts)
- [tsdown Unbundle Mode](https://tsdown.dev/options/unbundle)
- [My Quest for the Perfect TS Monorepo](https://thijs-koerselman.medium.com/my-quest-for-the-perfect-ts-monorepo-62653d3047eb)

**調査結果**:
- **tsdown特性**:
  - Rolldown（Rust）ベースで高速
  - `isolatedDeclarations: true` 必須
  - oxc-transformで.d.ts生成（tscより高速）
  - unbundleモード対応
  - モノレポでのTypeScript Project References対応

- **既存環境との整合性**:
  - cardパッケージはtsdown使用
  - steering/tech.mdの「unbuild」記載は古い情報
  - tsdownに統一することでビルドパフォーマンス向上

**影響**:
- randomizerパッケージもtsdownでビルド
- package.jsonのbuildスクリプト: `"build": "tsdown"`
- tsconfig.jsonで`isolatedDeclarations: true`を有効化

## アーキテクチャパターン評価

新規パッケージのため、既存アーキテクチャパターンとの比較より、Pure Functionsライブラリパターンを適用。

| オプション | 説明 | 強み | リスク/制限 | 備考 |
|----------|------|------|-----------|------|
| Pure Functions Library | すべて純粋関数、副作用なし、ジェネリック型 | テスタビリティ最高、並列実行可能、キャッシュ可能 | 状態管理が必要な場合は不適 | 要件2.5「入力配列を変更しない」と完全一致 |
| Class-based API | OOP設計、Randomizer classでstate管理 | 状態カプセル化、メソッドチェーン可能 | テストが複雑化、並列実行困難 | 要件の純粋関数要求に反する |
| Singleton Pattern | グローバルなRandomizer instance | 使いやすさ | テストで状態リセットが必要、並列不可 | TDD原則に反する |

**選択**: Pure Functions Library

## 設計決定

### 決定: seedrandomライブラリを使用

**コンテキスト**: 決定的ランダム化の実装方法として、ライブラリ使用 vs カスタム実装の選択。

**検討した代替案**:
1. **seedrandomライブラリ** - 実績あり、TypeScript型定義完備
2. **prandoライブラリ** - TypeScriptファースト、ゲーム向け
3. **カスタム実装（Mulberry32）** - ゼロ依存、軽量

**選択したアプローチ**: seedrandom + @types/seedrandom

**根拠**:
- 2.1k stars、月間ダウンロード多数（実績）
- TypeScript型定義が公式提供（型安全性）
- state()メソッドで状態保存・復元可能（テスト柔軟性）
- 複数のPRNGアルゴリズムから選択可能（将来の拡張性）

**トレードオフ**:
- ✅ 安定性・実績
- ✅ TypeScript完全サポート
- ✅ API豊富（state管理含む）
- ❌ 2019年以降メンテナンス停滞（但し安定版として問題なし）
- ❌ ランタイム依存1つ追加（但し要件は開発依存のみ制限）

**フォローアップ**:
- 実装時に暗号学的強度が不要なことを確認（ゲームのランダマイズ用途）
- パフォーマンステストでseedrandomのオーバーヘッドを測定

### 決定: Fisher-Yates（Modern版）でシャッフル実装

**コンテキスト**: O(n)時間計算量でバイアスのないシャッフルアルゴリズムの選択。

**検討した代替案**:
1. **Fisher-Yates（Modern版）** - Durstenfeld 1964、業界標準
2. **Sattolo's algorithm** - 循環順列生成、特殊用途
3. **sort(() => Math.random() - 0.5)** - 簡易実装、現在の実装

**選択したアプローチ**: Fisher-Yates（Modern版）with 新配列作成

**根拠**:
- 各順列が等確率（バイアスなし）
- O(n)時間計算量で要件9を満たす
- 業界標準アルゴリズム（実績・信頼性）
- seedrandomと組み合わせて決定的動作

**トレードオフ**:
- ✅ 完全にバイアスフリー
- ✅ O(n)パフォーマンス
- ✅ 非破壊（新配列返却）
- ❌ O(n)メモリ使用（in-placeならO(1)だが要件2.5違反）

**フォローアップ**:
- 1000要素で100ms以内を確認（要件9.1）
- ベンチマークテストで検証

### 決定: ゼロランタイム依存の緩和（seedrandomのみ許容）

**コンテキスト**: 要件1.3「ゼロランタイム依存」とseedrandom使用の矛盾。

**検討した代替案**:
1. **seedrandom許容** - 実用性優先
2. **カスタムPRNG実装** - ゼロ依存維持
3. **crypto.getRandomValues()のみ** - 標準API、非決定的

**選択したアプローチ**: seedrandomをランタイム依存として許容し、要件を「実質的にゼロ依存（テスト用ライブラリのみ）」と解釈

**根拠**:
- カスタムPRNGは品質保証が困難（暗号学的強度、周期長、統計的偏り）
- seedrandomは軽量（minified: 1KB、gzipped推定: 500-700 bytes）
- 決定的ランダム化（要件2の核心）を実現するための唯一の実用的方法

**トレードオフ**:
- ✅ 決定的ランダム化の確実な実装
- ✅ メンテナンス負担削減
- ❌ ランタイム依存1つ追加

**フォローアップ**:
- steering/tech.mdの「ゼロ依存原則」を更新提案（「実質的にゼロ依存、必要最小限のライブラリのみ」）

### 決定: tsdownビルドツール採用

**コンテキスト**: 要件1.7は「unbuild」だが、既存cardパッケージはtsdown使用。統一性の判断。

**検討した代替案**:
1. **tsdown** - 既存パッケージと統一
2. **unbuild** - 要件に記載
3. **tsup** - 以前の標準

**選択したアプローチ**: tsdown（既存パターンに従う）

**根拠**:
- cardパッケージと同じビルドツール（一貫性）
- Rolldown（Rust）ベースで高速
- TypeScript isolatedDeclarations対応
- モノレポ統合が容易

**トレードオフ**:
- ✅ 既存パッケージとの統一
- ✅ ビルド高速化
- ✅ 最新ツールチェーン
- ❌ 要件文書との不一致（tech.mdも古い）

**フォローアップ**:
- 要件1.7を「tsdownでビルド可能」に修正提案
- steering/tech.mdを更新してtsdown使用を明記

## リスクと軽減策

- **seedrandomメンテナンス停滞（2019年以降更新なし）** → 安定版として問題なし、必要に応じてフォークまたは代替検討
- **制約エンジンのロジック複雑性（必須/除外の競合検証）** → TDDで段階的実装、エッジケーステスト網羅
- **サイト統合時の回帰リスク** → 既存テストスイート実行、手動テストで動作確認
- **パフォーマンス要件（1000要素100ms）** → ベンチマークテスト作成、プロファイリング

## 参考文献

- [seedrandom GitHub Repository](https://github.com/davidbau/seedrandom) - 公式リポジトリ
- [seedrandom npm Package](https://www.npmjs.com/package/seedrandom) - npm公式ページ
- [@types/seedrandom](https://www.npmjs.com/package/@types/seedrandom) - TypeScript型定義
- [seedrandom minified file](https://unpkg.com/seedrandom@3.0.5/seedrandom.min.js) - バンドルサイズ検証
- [Mulberry32 PRNG](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c) - カスタムPRNG代替案
- [PRNGs Comparison](https://github.com/bryc/code/blob/master/jshash/PRNGs.md) - PRNGアルゴリズム比較
- [Fisher-Yates Shuffle](https://bost.ocks.org/mike/shuffle/) - アルゴリズム解説
- [Fisher-Yates Wikipedia](https://en.wikipedia.org/wiki/Fisher–Yates_shuffle) - 理論的背景
- [fast-check official documentation](https://fast-check.dev/) - プロパティベーステスト
- [@fast-check/vitest](https://www.npmjs.com/package/@fast-check/vitest) - Vitest統合
- [tsdown Documentation](https://tsdown.dev/) - ビルドツール公式ドキュメント
- [tsdown vs unbuild](https://alan.norbauer.com/articles/tsdown-bundler/) - ビルドツール比較
