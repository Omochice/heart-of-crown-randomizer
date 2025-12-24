# Requirements Document

## Project Description (Input)

今のアプリはsvelte4の記法で書かれている。

svelte-mcpでsvelte5の記法に変換してほしい。

なお、動作や見た目は変えないようにしてほしい。

以降のやり取りは日本語でされるが、コードやコメントは英語で記載すること。
これについてはrulesに記載を追加して。

作業は最小意味の単位でcommitし、conventional commitの形式のcommitをすること。

## Introduction

本仕様は、Heart of Crown Randomizerアプリケーションの既存Svelte 4コードベースをSvelte 5の記法に移行することを目的とします。
この移行により、最新のSvelteフレームワーク機能を活用しつつ、アプリケーションの既存の動作と見た目を完全に保持します。

移行作業では以下を重視します:

- **後方互換性**: ユーザー体験に一切の変更を加えない
- **段階的移行**: 最小意味単位での変更とコミット
- **品質保証**: svelte-mcpツールを活用した正確な構文変換
- **コード品質**: 英語でのコード・コメント記述の維持

## Requirements

### Requirement 1: Svelte 5構文への移行

**Objective:** 開発者として、既存のSvelte 4コンポーネントをSvelte 5の記法に変換したい。
これにより、最新のフレームワーク機能を活用できるようにする。

#### Acceptance Criteria

1. When svelte-mcpツールが実行される, the Migration Tool shall Svelteコンポーネントファイル内のSvelte 4構文をSvelte 5構文に変換する
2. When Svelte 4のリアクティブ宣言($:)が検出される, the Migration Tool shall Svelte 5の$derived()または$effect()に変換する
3. When Svelte 4のpropsバインディング(export let)が検出される, the Migration Tool shall Svelte 5の$props()に変換する
4. When Svelte 4のストア構文が検出される, the Migration Tool shall Svelte 5互換の記法を維持または更新する
5. When コンポーネントイベントハンドラが検出される, the Migration Tool shall Svelte 5のイベントハンドリング構文に変換する
6. The Migration Tool shall すべての変換においてTypeScriptの型安全性を保持する

### Requirement 2: 動作・見た目の保持

**Objective:** ユーザーとして、アプリケーションの動作と見た目が移行前後で変わらないことを確認したい。
これにより、既存機能が正常に動作し続けることを保証する。

#### Acceptance Criteria

1. When 移行後のアプリケーションが実行される, the Application shall 移行前と同一のUIレンダリングを行う
2. When ユーザーがカードランダマイズ機能を使用する, the Application shall 移行前と同一のロジックで動作する
3. When ユーザーがページ間を遷移する, the Application shall 移行前と同一のルーティング動作を行う
4. The Application shall すべてのインタラクティブ要素(ボタン、フォーム等)で移行前と同一の挙動を保持する
5. The Application shall すべてのスタイリング(Tailwind CSS)を移行前と同一に保持する

### Requirement 3: ファイル単位での段階的移行

**Objective:** 開発者として、各コンポーネントを個別に移行したい。
これにより、問題の早期発見とレビューの容易性を確保する。

#### Acceptance Criteria

1. When 単一のSvelteコンポーネントが移行される, the Migration Process shall そのコンポーネントのみを変更し他のファイルに影響を与えない
2. When 移行が完了する, the Migration Process shall 変更されたファイルごとに個別のgit commitを作成する
3. When commitが作成される, the Git Commit shall Conventional Commits形式に従う
4. The Migration Process shall 以下の順序でファイルを移行する: Card.svelte → +page.svelte → +layout.svelte
5. When 各ファイルの移行が完了する, the Migration Process shall ビルドとテストが成功することを確認する

### Requirement 4: コミットメッセージとコード品質

**Objective:** 開発者として、移行履歴を明確に追跡し、コード品質基準を維持したい。
これにより、将来のメンテナンスを容易にする。

#### Acceptance Criteria

1. When git commitが作成される, the Commit Message shall Conventional Commitsの形式(`refactor(svelte): migrate [component] to Svelte 5 syntax`)に従う
2. When コミットメッセージが作成される, the Commit Message shall 変更内容の簡潔な説明を英語で含む
3. When コードやコメントが追加・変更される, the Code and Comments shall 英語で記述される
4. The Migration Process shall BiomeとPrettierの既存のフォーマット設定を尊重する
5. When TypeScriptコードが変更される, the TypeScript Code shall strict modeの型チェックに合格する

### Requirement 5: ビルドと依存関係の更新

**Objective:** 開発者として、Svelte 5への移行に必要なパッケージ更新と設定変更を適用したい。
これにより、アプリケーションが正しくビルド・実行できることを保証する。

#### Acceptance Criteria

1. When package.jsonが更新される, the Package Configuration shall Svelte 5とSvelteKit 5の互換バージョンを指定する
2. When 依存関係が更新される, the Build System shall pnpm installで正常にインストールが完了する
3. When アプリケーションがビルドされる, the Build Process shall エラーなく完了する
4. When 開発サーバーが起動される, the Development Server shall 正常に起動しHMRが動作する
5. If Vite設定やTurborepo設定の変更が必要である, then the Configuration Files shall Svelte 5互換の設定に更新される

### Requirement 6: テストとバリデーション

**Objective:** 開発者として、移行後のコードが品質基準を満たすことを検証したい。
これにより、リグレッションを防止する。

#### Acceptance Criteria

1. When 各コンポーネントの移行が完了する, the Testing Process shall 既存のVitest単体テストを実行し合格を確認する
2. When 全ての移行が完了する, the Validation Process shall pnpm checkコマンドで型チェックとlintが合格することを確認する
3. When アプリケーションが起動される, the Manual Testing shall ブラウザ上で主要機能が動作することを目視確認する
4. If テストが失敗する, then the Migration Process shall 問題を修正し再度テストを実行する
5. The Validation Process shall Storybookのコンポーネントストーリーが正常にレンダリングされることを確認する
