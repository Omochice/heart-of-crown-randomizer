# 実装タスク

## タスク概要

本仕様の実装は、t-wada TDD手法（Red → Green → Refactor）に従い、テストファーストで進めます。すべてのタスクは、テスト作成→実装→リファクタリングの順で完了させること。

## 実装タスク

- [ ] 1. パッケージ構造とビルド環境のセットアップ
- [x] 1.1 パッケージディレクトリと設定ファイルの作成
  - `packages/randomizer/`ディレクトリを作成
  - package.json（name、exports、scripts、dependencies）を設定
  - tsconfig.json（isolatedDeclarations: true、strict mode）を設定
  - vitest.config.ts（テスト環境設定、@fast-check/vitest統合）を作成
  - turbo.jsonにrandomizerパッケージのビルド依存を追加
  - ソースディレクトリ `src/` を作成（テストはコロケーション: `.test.ts`で同階層に配置）
  - _Requirements: 1.1, 1.2, 1.5, 1.6, 1.7_

- [x] 1.2 依存関係のインストールとビルド確認
  - seedrandom、@types/seedrandomをdependenciesに追加
  - @fast-check/vitestをdevDependenciesに追加
  - `pnpm install`で依存解決を確認
  - `pnpm build`（tsdown）が成功することを確認
  - 型定義ファイル（.d.mts）が正しく生成されることを確認
  - _Requirements: 1.3, 1.4, 1.7_

- [ ] 2. シード付き乱数生成器の実装（TDD）
- [x] 2.1 (P) createRNG関数のテスト作成
  - シード付きRNG生成のテストケース作成（決定性確認）
  - シードなしRNG生成のテストケース作成（Math.random使用確認）
  - 同じシードで同じ乱数列が生成されることを確認するテスト
  - _Requirements: 2.1, 2.2_

- [x] 2.2 (P) createRNG関数の実装
  - seedrandomライブラリを使用してシード付きRNGを生成
  - seedがundefinedの場合はMath.randomを返す
  - テストがグリーンになることを確認
  - _Requirements: 2.1, 2.2_

- [ ] 3. Fisher-Yatesシャッフル機能の実装（TDD）
- [ ] 3.1 shuffle関数の基本テスト作成（エッジケースとバリデーション）
  - 空配列のシャッフルテスト（空配列を返す）
  - 単一要素配列のシャッフルテスト（同じ配列を返す）
  - 無効なシード（NaN、Infinity）でエラーを投げるテスト
  - 入力配列が変更されないこと（非破壊性）のテスト
  - _Requirements: 2.5, 2.6, 2.8_

- [ ] 3.2 (P) shuffle関数の基本実装（Fisher-Yates Modern）
  - Fisher-Yates逆方向ループ（末尾→先頭）で実装
  - 新配列を作成して非破壊性を保証
  - シードバリデーション（NaN、Infinity→エラー）を実装
  - 基本テストがグリーンになることを確認
  - _Requirements: 2.3, 2.5, 2.8, 9.2, 9.3_

- [ ] 3.3 (P) shuffle関数の決定性テスト作成
  - 同じシードで同じ結果が得られることを確認するテスト
  - シードなしで異なる結果が得られることを確認するテスト（確率的テスト、複数回実行）
  - _Requirements: 2.1, 2.2_

- [ ] 3.4 (P) shuffle関数とcreateRNGの統合
  - createRNG関数を使用してRNGを生成
  - Fisher-Yatesアルゴリズムで配列をシャッフル
  - 決定性テストがグリーンになることを確認
  - _Requirements: 2.1, 2.3_

- [ ] 3.5 (P) shuffle関数のプロパティベーステスト作成
  - fast-checkで任意配列を生成（fc.array(fc.anything())）
  - シャッフル後の配列長さ = 元の配列長さ（不変条件）
  - シャッフル後の要素集合 = 元の要素集合（ソート後比較）
  - 同じシードで同じ結果（決定性不変条件）
  - _Requirements: 6.5, 6.6_

- [ ] 4. フィルタリング機能の実装（TDD）
- [ ] 4.1 (P) filter関数のテスト作成
  - 空配列のフィルタリングテスト（空配列を返す）
  - 全要素がマッチする述語のテスト（全要素を返す）
  - 全要素が不一致の述語のテスト（空配列を返す）
  - 入力配列が変更されないこと（非破壊性）のテスト
  - _Requirements: 3.1, 3.4_

- [ ] 4.2 (P) filter関数の実装
  - Array.prototype.filter()のラッパーとして実装
  - 述語関数で要素をフィルタリング
  - 新配列を返して非破壊性を保証
  - テストがグリーンになることを確認
  - _Requirements: 3.1, 3.4_

- [ ] 4.3 (P) filterByIds関数のテスト作成
  - 空のexcludedIdsでフィルタリングテスト（全要素を返す）
  - 特定IDsを除外するテスト（正確性確認）
  - 存在しないIDsを指定したテスト（全要素を返す）
  - 入力配列が変更されないこと（非破壊性）のテスト
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 4.4 (P) filterByIds関数の実装
  - id プロパティを持つオブジェクトのフィルタリング
  - excludedIds配列に含まれるIDを除外
  - 新配列を返して非破壊性を保証
  - テストがグリーンになることを確認
  - _Requirements: 3.2, 3.4_

- [ ] 5. 制約検証エンジンの実装（TDD）
- [ ] 5.1 (P) ConstraintConflictErrorクラスの実装
  - カスタムエラークラスを定義（Errorを継承）
  - conflictingItemsプロパティを追加（競合したアイテムを保持）
  - エラーメッセージと競合アイテムをコンストラクタで設定
  - _Requirements: 4.7_

- [ ] 5.2 (P) validateConstraints関数のテスト作成
  - 制約なし（undefined）のテスト（エラーを投げない）
  - 必須カードと除外述語が矛盾しないテスト（エラーを投げない）
  - 必須カードが除外述語に該当するテスト（ConstraintConflictErrorを投げる）
  - エラーメッセージに競合カードの情報が含まれることを確認
  - _Requirements: 4.7, 4.9_

- [ ] 5.3 (P) validateConstraints関数の実装
  - require配列の各要素をexclude述語で検証
  - 競合検出時はConstraintConflictErrorを投げる
  - エラーメッセージに競合したアイテムの詳細を含める
  - テストがグリーンになることを確認
  - _Requirements: 4.7, 4.9_

- [ ] 6. 制約付きカード選択機能の実装（TDD）
- [ ] 6.1 select関数の基本テスト作成（エッジケース）
  - 空配列からの選択テスト（空配列を返す）
  - count = 0のテスト（空配列を返す）
  - count > 利用可能要素のテスト（全要素を返す、エラーなし）
  - 入力配列が変更されないこと（非破壊性）のテスト
  - _Requirements: 2.5, 2.7_

- [ ] 6.2 select関数の基本実装（制約なし）
  - shuffle関数を使用してカードをシャッフル
  - 指定された数（count）だけ要素を選択
  - 新配列を返して非破壊性を保証
  - 基本テストがグリーンになることを確認
  - _Requirements: 2.4, 2.5, 2.6, 2.7_

- [ ] 6.3 select関数の除外制約テスト作成
  - exclude述語で特定カードを除外するテスト
  - 複数のexclude述語（OR論理）のテスト
  - すべてのカードが除外された場合のテスト（空配列を返す）
  - _Requirements: 4.1, 4.5, 4.6_

- [ ] 6.4 select関数の除外制約実装
  - exclude述語配列でカードをフィルタリング
  - OR論理で除外（いずれかの述語がtrueなら除外）
  - フィルタリング後にshuffle→選択
  - 除外テストがグリーンになることを確認
  - _Requirements: 4.1, 4.5_

- [ ] 6.5 select関数の必須カード制約テスト作成
  - require配列のカードが必ず含まれることを確認するテスト
  - 必須カード数 > countのテスト（必須カードのみ返す）
  - 必須カードと除外述語の競合テスト（ConstraintConflictErrorを投げる）
  - _Requirements: 4.2, 4.3, 4.4, 4.7_

- [ ] 6.6 select関数の必須カード制約実装
  - validateConstraints関数で制約の矛盾を検証
  - require配列を結果に優先配置
  - 残り枠をshuffle→選択で埋める
  - 必須カード数 > countの場合は必須カードのみ返す
  - 必須カードテストがグリーンになることを確認
  - _Requirements: 4.2, 4.3, 4.4, 4.7, 4.9_

- [ ] 6.7 select関数の統合テスト作成
  - seed、exclude、requireを組み合わせた複雑なテスト
  - 同じシードで同じ結果が得られることを確認（決定性）
  - 無効シード（NaN、Infinity）でエラーを投げるテスト
  - _Requirements: 2.1, 2.4, 2.8, 4.8, 4.9_

- [ ] 6.8 select関数のリファクタリングとドキュメント
  - コードの可読性向上（複雑なロジックの分割）
  - JSDocコメントの追加（@param、@returns、@throws、@example）
  - エラーメッセージの明確化
  - _Requirements: 7.2, 7.9, 10.2_

- [ ] 7. プロパティベーステストと統合テストの追加
- [ ] 7.1 (P) select関数のプロパティベーステスト作成
  - fast-checkで任意配列、count、制約を生成
  - プロパティ: selected.length <= count
  - プロパティ: 必須カードがすべて含まれる
  - プロパティ: 除外述語に該当するカードが含まれない
  - _Requirements: 6.5, 6.8_

- [ ] 7.2 (P) エッジケーステスト網羅
  - 重複要素を含む配列のテスト
  - 大きな配列（1000要素）のテスト
  - 複雑な制約の組み合わせテスト
  - _Requirements: 6.4_

- [ ] 8. パフォーマンステストの作成
- [ ] 8.1 (P) ベンチマークテストの実装
  - 1000要素のシャッフルが100ms以内で完了することを確認
  - 100要素 × 1000回シャッフルの平均時間を測定
  - メモリ使用量の測定（O(n)空間計算量確認）
  - パフォーマンス結果をコンソールに出力
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 9. 型定義とエクスポート設定
- [ ] 9.1 型定義ファイルの作成
  - Predicate<T>型の定義
  - Constraint<T>インターフェースの定義
  - SelectOptions<T>インターフェースの定義
  - Identifiable インターフェースの定義
  - ConstraintConflictErrorクラスのエクスポート
  - _Requirements: 1.4, 5.1_

- [ ] 9.2 エクスポート設定の確認
  - package.jsonのexportsフィールドを設定（メインエントリポイント）
  - 型定義ファイル（.d.mts）が正しくエクスポートされることを確認
  - すべての公開関数・型がエクスポートされることを確認
  - ビルド後の型定義が正しく生成されることを確認
  - _Requirements: 1.4, 1.6, 5.2_

- [ ] 10. サイトパッケージとの統合
- [ ] 10.1 サイトパッケージへの依存追加
  - packages/site/package.jsonにrandomizerパッケージを追加（workspace:*）
  - pnpm installで依存解決を確認
  - _Requirements: 8.1_

- [ ] 10.2 drawRandomCards関数のリファクタリング
  - +page.svelteのdrawRandomCards関数をselect APIに移行
  - 除外リスト（excludedList）をfilterByIds関数で処理
  - ランダム選択をselect関数で実装
  - Math.random()ベースのシャッフルを削除
  - _Requirements: 8.2_

- [ ] 10.3 drawMissingCommons関数のリファクタリング
  - +page.svelteのdrawMissingCommons関数をselect APIに移行
  - 除外リスト処理をfilterByIds関数で実装
  - ランダム選択をselect関数で実装
  - Math.random()ベースのシャッフルを削除
  - _Requirements: 8.3_

- [ ] 10.4 統合テストと動作確認
  - 既存のテストスイートを実行（リグレッション確認）
  - ブラウザで手動テスト（カード選択が正しく動作するか）
  - URL復元機能が正しく動作するか確認
  - ユーザー体験が変わらないことを確認
  - _Requirements: 8.4, 8.5_

- [ ] 11. ドキュメンテーション
- [ ] 11.1 README.mdの作成
  - Overview セクション（パッケージの目的、主要機能）
  - Installation セクション（pnpm add コマンド）
  - Quick Start セクション（基本的な使用例）
  - API Reference セクション（各関数のシグネチャと説明）
  - Advanced Usage セクション（制約ベース選択、決定的テスト）
  - TypeScript Support セクション（型定義、ジェネリック型の使用例）
  - Performance セクション（ベンチマーク結果）
  - License セクション（Zlib）
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

## タスク実行ガイド

### TDDサイクル
各サブタスクは以下のサイクルで実行し、**各ステップごとにコミット**すること:

1. **Red**: テストを書く（失敗することを確認）→ **コミット**
2. **Green**: 最小限の実装でテストを通す → **コミット**
3. **Refactor**: コードを改善（テストは通ったまま）→ **コミット**（変更があった場合）

### コミット規約
- **TDDの各ステップごとにコミットを作成**（Red、Green、Refactor）
- コミットメッセージは英語で記述
- コミットメッセージには「why」を記載
- バグ修正の場合は確認方法を記載
- specファイル変更時は `chore(spec):` プレフィックスを使用

#### TDDステップ別のコミット例

**Red（テスト作成）**:
```bash
git commit -m "test(randomizer): add test for shuffle with empty array

Test that shuffle returns empty array when input is empty.
This establishes the baseline behavior for edge case handling.

Why: TDD Red phase - define expected behavior before implementation
Verified by: Test fails as expected (function not implemented yet)"
```

**Green（実装）**:
```bash
git commit -m "feat(randomizer): implement shuffle function

Implement Fisher-Yates algorithm with seed support.
Handles empty array, single element, and basic shuffling.

Why: TDD Green phase - minimal implementation to pass tests
Verified by: npm test -- shuffle.test.ts passes"
```

**Refactor（リファクタリング）**:
```bash
git commit -m "refactor(randomizer): extract RNG creation logic

Extracted createRNG helper to improve shuffle readability.
No behavior change, all tests still pass.

Why: TDD Refactor phase - improve code structure without changing behavior
Verified by: npm test -- shuffle.test.ts still passes"
```

### コード品質
- 不要なコメントは含めない（WHATではなくWHY NOTを記載）
- TypeScript strict mode に準拠
- Biomeでlint/formatを実行
- すべてのテストがグリーンになることを確認

### 並列実行可能なタスク
`(P)`マークが付いたタスクは並列実行可能です。ただし、依存関係を確認し、前提条件が満たされていることを確認してから実行してください。
