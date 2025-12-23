# Requirements Document

## Project Description (Input)
カードをランダマイズする部分をパッケージに切り出してテストを容易にしたい
t-wadaのtddに従い、進めてほしい
コードには不要なコメントを含まず、why notを記載すること
コミットにはwhy、バクの修正であれば確認の仕方をきさいすること
ユーザーとの応答には日本語を、コードのコメントやコミットは英語で打つこと. 各タスクごとにコミットをうち、最小の意味単位となるようにコミットを分けること
specへの変更は都度chore(spec):で打つこと

## Introduction

本仕様は、現在 `packages/site/src/routes/+page.svelte` に埋め込まれているカードランダマイズロジックを、独立したテスト可能なパッケージとして抽出することを目的とする。これにより、t-wadaのTDD手法に基づいたテスト駆動開発が可能になり、ロジックの再利用性と保守性が向上する。

現在の実装では、`drawRandomCards()` および `drawMissingCommons()` 関数内で `Math.random()` を使用した配列のシャッフルが行われているが、これはテストが困難である。新しいパッケージでは、決定的なランダム化（シード値による再現可能性）をサポートし、純粋関数として実装することで、完全なユニットテストカバレッジを実現する。

## Requirements

### Requirement 1: 独立パッケージの構造

**Objective:** パッケージ開発者として、カードランダマイズロジックを再利用可能な独立パッケージとして提供したい。これにより、他のプロジェクトでも利用可能になり、保守性が向上する。

#### Acceptance Criteria
1. The Randomizer Package shall be created at `packages/randomizer/` in the monorepo structure
2. The Randomizer Package shall be named `@heart-of-crown-randomizer/randomizer` following the existing naming convention
3. The Randomizer Package shall have zero runtime dependencies except development dependencies for testing
4. The Randomizer Package shall export TypeScript type definitions for all public APIs
5. The Randomizer Package shall use ESM module system consistent with other packages
6. The Randomizer Package shall include `package.json` with proper exports configuration for subpath imports
7. The Randomizer Package shall be buildable via `pnpm build` using unbuild

### Requirement 2: 決定的ランダマイズAPI

**Objective:** テストエンジニアとして、テスト可能なランダマイズ機能を利用したい。これにより、TDD手法に従った開発が可能になり、バグの早期発見と品質向上が実現できる。

#### Acceptance Criteria
1. When a seed value is provided, the Randomizer Package shall produce deterministic, reproducible shuffle results
2. When no seed value is provided, the Randomizer Package shall use cryptographically random values for non-deterministic shuffling
3. The Randomizer Package shall provide a `shuffle<T>(items: T[], seed?: number): T[]` function
4. The Randomizer Package shall provide a `select<T>(items: T[], count: number, options?: SelectOptions): T[]` function where `SelectOptions` includes optional seed and filter
5. The Randomizer Package shall not mutate input arrays
6. When input array is empty, the Randomizer Package shall return an empty array
7. When requested count exceeds available items, the Randomizer Package shall return all available items without error
8. If invalid seed value is provided (NaN, Infinity), the Randomizer Package shall throw a descriptive error

### Requirement 3: カードフィルタリング機能

**Objective:** アプリケーション開発者として、除外リストに基づいてカードをフィルタリングしたい。これにより、ユーザーが除外指定したカードを結果から排除できる。

#### Acceptance Criteria
1. The Randomizer Package shall provide a `filter<T>(items: T[], predicate: (item: T) => boolean): T[]` function
2. The Randomizer Package shall provide a `filterByIds<T extends { id: number }>(items: T[], excludedIds: number[]): T[]` utility function
3. When filtering with empty exclusion list, the Randomizer Package shall return all items
4. The Randomizer Package shall not mutate input arrays during filtering

### Requirement 4: 既存カードデータとの統合

**Objective:** アプリケーション開発者として、既存の `@heart-of-crown-randomizer/card` パッケージと seamless に統合したい。これにより、既存のカード型定義を再利用できる。

#### Acceptance Criteria
1. The Randomizer Package shall accept generic type parameters compatible with `CommonCard`, `Princess`, `RareCard` types from `@heart-of-crown-randomizer/card`
2. The Randomizer Package shall not import or depend on `@heart-of-crown-randomizer/card` package directly
3. When working with card objects having `id` property, the Randomizer Package shall preserve all object properties during operations
4. The Randomizer Package shall provide type guards for common card operations if needed

### Requirement 5: テストカバレッジとTDD

**Objective:** 品質保証担当者として、完全なテストカバレッジを持つコードを提供したい。これにより、リグレッションを防ぎ、将来の変更が安全に行える。

#### Acceptance Criteria
1. The Randomizer Package shall have 100% test coverage for all exported functions
2. The Randomizer Package shall include unit tests written in Vitest
3. When a test fails, the error message shall clearly indicate the expected vs actual behavior
4. The Randomizer Package shall include edge case tests (empty arrays, single item, duplicates)
5. The Randomizer Package shall include property-based tests for shuffle invariants (same length, same elements)
6. The Randomizer Package shall include tests verifying deterministic behavior with seeds
7. The Randomizer Package shall include tests verifying non-deterministic behavior without seeds

### Requirement 6: 開発ワークフローとコミット規約

**Objective:** プロジェクトメンテナーとして、一貫性のある開発ワークフローを維持したい。これにより、コードレビューが容易になり、変更履歴が明確になる。

#### Acceptance Criteria
1. When implementing a feature, the development process shall follow TDD: write test first, implement code, refactor
2. The codebase shall not include unnecessary comments explaining "what" the code does
3. If an alternative approach was rejected, the code shall include a "why not" comment explaining the decision
4. When committing changes, the commit message shall explain "why" the change was made
5. If the commit fixes a bug, the commit message shall include verification steps
6. The Randomizer Package shall be committed in minimal meaningful units (one logical change per commit)
7. When spec files are modified, the commit shall use `chore(spec):` prefix
8. The codebase shall use English for all code comments and commit messages
9. When API documentation is needed, the code shall use JSDoc comments for public functions

### Requirement 7: サイトパッケージとの統合

**Objective:** フロントエンド開発者として、既存のサイトコードを新しいランダマイザーパッケージに移行したい。これにより、UIロジックとランダマイズロジックが分離され、テストが容易になる。

#### Acceptance Criteria
1. When the Randomizer Package is integrated, the `packages/site` shall depend on `@heart-of-crown-randomizer/randomizer`
2. The `drawRandomCards()` function in `+page.svelte` shall be refactored to use Randomizer Package APIs
3. The `drawMissingCommons()` function in `+page.svelte` shall be refactored to use Randomizer Package APIs
4. When migration is complete, the site shall maintain identical user-facing behavior
5. The refactored code shall be verified by existing tests and manual testing

### Requirement 8: パフォーマンスと効率性

**Objective:** パフォーマンスエンジニアとして、ランダマイズ処理が効率的に実行されることを保証したい。これにより、ユーザー体験が損なわれない。

#### Acceptance Criteria
1. When shuffling arrays up to 1000 items, the Randomizer Package shall complete within 100ms
2. The Randomizer Package shall use O(n) time complexity for shuffle operations
3. The Randomizer Package shall use O(n) space complexity for shuffle operations
4. The Randomizer Package shall not perform unnecessary array allocations

### Requirement 9: ドキュメンテーション

**Objective:** パッケージユーザーとして、APIの使い方を理解できるドキュメントが必要である。これにより、パッケージの採用と正しい使用が促進される。

#### Acceptance Criteria
1. The Randomizer Package shall include a `README.md` with usage examples
2. The Randomizer Package shall include JSDoc comments for all exported functions
3. The README shall include examples of deterministic testing with seeds
4. The README shall include examples of filtering cards by exclusion list
5. The README shall include TypeScript usage examples

