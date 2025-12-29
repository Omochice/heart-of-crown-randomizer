# TDD Process with Svelte-MCP Verification

## Overview

このプロジェクトでは、Svelte 5コンポーネントの実装にTest-Driven Development (TDD)とsvelte-mcp検証を組み合わせたプロセスを採用します。

## 4-Phase TDD Cycle

### Phase 1: RED - 失敗するテストを書く

**目的**: 実装すべき機能の仕様をテストとして定義する

**手順**:
1. テストファイルを作成（例: `ComponentName.svelte.test.ts`）
2. 実装すべき機能をテストケースとして記述
   - Svelte 5構文の使用確認（`$props()`, `$derived()`）
   - Props型定義の確認
   - UIレンダリングの確認
   - イベントハンドラーの確認
   - アクセシビリティ属性の確認
3. テストを実行して**すべて失敗する**ことを確認
4. テストファイルをコミット
   ```bash
   git add <test-file>
   git commit -m "test: add <component-name> tests (RED phase)

   <test description>

   Verification: pnpm test:unit <test-file>"
   ```

**検証コマンド**:
```bash
cd packages/site && pnpm test:unit <test-file>
```

**期待される結果**: すべてのテストが失敗（FAIL）

---

### Phase 2: GREEN - 最小限の実装でテストを通す

**目的**: テストを通過させる最小限のコードを書く

**手順**:
1. コンポーネントファイルを作成（例: `ComponentName.svelte`）
2. テストを通過させるための最小限の実装
   - 過剰な機能追加はしない
   - テストで要求されていることだけを実装
3. テストを実行して**すべて通過する**ことを確認
4. 実装をコミット
   ```bash
   git add <component-file>
   git commit -m "feat: implement <component-name> (GREEN phase)

   <implementation description>

   Verification: cd packages/site && pnpm test:unit <test-file>"
   ```

**検証コマンド**:
```bash
cd packages/site && pnpm test:unit <test-file>
```

**期待される結果**: すべてのテストが通過（PASS）

---

### Phase 3: VERIFY - svelte-mcpで実装を検証

**目的**: Svelte 5のベストプラクティスに従っているか確認し、潜在的な問題を検出する

**手順**:
1. svelte-autofixerツールで実装を検証
   ```typescript
   // svelte-autofixerを呼び出し
   mcp__svelte__svelte-autofixer({
     code: "<component-code>",
     desired_svelte_version: 5,
     filename: "ComponentName.svelte"
   })
   ```

2. 結果を確認:
   - **issues**: 修正が必要な問題
   - **suggestions**: 改善提案

3. **issuesがある場合**:
   - 提案された修正を適用
   - テストを再実行して通過を確認
   - 修正をコミット
     ```bash
     git add <component-file>
     git commit -m "fix: apply svelte-mcp suggestions (VERIFY phase)

     <fix description>

     Verification: cd packages/site && pnpm test:unit <test-file>"
     ```

4. **issuesがない場合**:
   - 次のフェーズ（REFACTOR）に進む

**検証コマンド**:
- svelte-autofixerツールを使用（MCPサーバー経由）
- テスト再実行: `cd packages/site && pnpm test:unit <test-file>`

**期待される結果**:
- `issues: []` （問題なし）
- すべてのテストが通過（PASS）

---

### Phase 4: REFACTOR - コード品質を向上

**目的**: テストを通過させたまま、コードの可読性・保守性を向上させる

**手順**:
1. コードの改善を検討:
   - 派生ステートの抽出（`$derived`）
   - 重複コードの削除
   - 命名の改善
   - クラス属性の整理（Svelteディレクティブの活用）
   - コメントの追加（"why not"パターン）

2. リファクタリングを実施

3. テストを実行して**すべて通過する**ことを確認

4. （オプション）svelte-autofixerで再検証
   - リファクタリングで新たな問題が発生していないか確認

5. リファクタリングをコミット
   ```bash
   git add <component-file>
   git commit -m "refactor: improve <component-name> code quality (REFACTOR phase)

   <refactoring description>

   Why NOT <alternative-approach>:
   <explanation>

   Verification: cd packages/site && pnpm test:unit <test-file>"
   ```

**検証コマンド**:
```bash
cd packages/site && pnpm test:unit <test-file>
```

**期待される結果**: すべてのテストが通過（PASS）

---

## Commit Message Format

各フェーズのコミットメッセージは以下の形式に従う:

```
<type>: <summary> (<phase-name> phase)

<detailed description>

<why-not explanation (REFACTOR phase only)>

Verification: <command to verify>
```

**Types**:
- RED: `test`
- GREEN: `feat` または `fix`（ユーザー影響に基づく）
- VERIFY: `fix`（修正がある場合）
- REFACTOR: `refactor`

**Phase Names**:
- `RED phase`
- `GREEN phase`
- `VERIFY phase`（修正がある場合）
- `REFACTOR phase`

---

## Example: Task 3.1 Implementation

### RED Phase
```bash
# Create failing tests
git commit -m "test: add CardWithActions component tests (RED phase)

Tests cover:
- Svelte 5 syntax ($props, $derived)
- Props interface with CommonCard type
- Card state integration (togglePin, toggleExclude)
- Pin/exclude button rendering with emoji icons
- Visual feedback (bg-blue-100, line-through, etc.)
- Accessibility (aria-pressed, focus:ring)
- Card display (name, category)

All tests currently fail as component doesn't exist yet.

Verification: pnpm test:unit CardWithActions.svelte.test.ts"
```

### GREEN Phase
```bash
# Implement minimal component
git commit -m "feat: implement CardWithActions component (GREEN phase)

Implements minimal CardWithActions component to make all tests pass:
- Accepts card prop with CommonCard type (Props interface)
- Integrates with card-state.svelte (getCardState, togglePin, toggleExclude)
- Renders pin and exclude buttons with emoji icons (📌, 🚫)
- Provides visual feedback based on card state:
  - Pinned: blue background (bg-blue-100), blue border (border-blue-500)
  - Excluded: gray background (bg-gray-100), opacity 60%, line-through on name
- Implements accessibility features:
  - aria-pressed attributes on buttons
  - focus:ring for keyboard navigation
- Displays card name and category

All 12 tests pass.

Verification: cd packages/site && pnpm test:unit CardWithActions.svelte.test.ts"
```

### VERIFY Phase
```bash
# Run svelte-autofixer
Result: { issues: [], suggestions: [] }
# No issues found, proceed to REFACTOR phase
```

### REFACTOR Phase
```bash
git commit -m "refactor: improve CardWithActions code quality (REFACTOR phase)

Refactoring improvements:
- Extract derived boolean states (isPinned, isExcluded) for better readability
- Replace template literal class strings with Svelte class directive syntax
- Use Svelte's class:directive for conditional line-through styling
- Improve code consistency and maintainability

Why NOT keep template literals:
- Svelte's class directive is more idiomatic and type-safe
- Better IDE support and autocompletion
- Cleaner separation of static and dynamic classes

All tests still pass.

Verification: cd packages/site && pnpm test:unit CardWithActions.svelte.test.ts"
```

---

## Best Practices

1. **1つのタスク = 1つのTDDサイクル**
   - 各タスクで完全なRED-GREEN-VERIFY-REFACTORサイクルを実施

2. **各フェーズで個別にコミット**
   - フェーズごとに独立したコミットを作成
   - コミット履歴からTDDプロセスが明確にわかるようにする

3. **svelte-autofixerは必須**
   - GREENフェーズ後は必ずVERIFYフェーズを実施
   - issuesが見つかった場合は修正してから次に進む

4. **テストは常にグリーン**
   - REFACTORフェーズ中もテストは常に通過している状態を保つ
   - テストが失敗したら、リファクタリングを元に戻す

5. **"why not"コメントを活用**
   - REFACTORフェーズでは、「なぜ別のアプローチを選ばなかったか」を明記
   - コミットメッセージとコード内コメントの両方で説明

---

## Troubleshooting

### svelte-autofixerでissuesが見つかった場合

1. issuesの内容を確認
2. 提案された修正を適用
3. テストを再実行
4. すべて通過したらコミット（VERIFY phase）
5. 必要に応じてREFACTORフェーズに進む

### リファクタリング後にテストが失敗した場合

1. リファクタリングを元に戻す（`git restore <file>`）
2. より小さな単位でリファクタリングを試みる
3. 各変更後にテストを実行

### svelte-autofixerが利用できない場合

1. 手動でSvelte 5のベストプラクティスを確認
2. 公式ドキュメントを参照
3. 既存コンポーネント（Card.svelte等）のパターンに従う
