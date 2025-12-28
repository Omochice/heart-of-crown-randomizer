# Requirements Document

## Project Description (Input)

必須のカードと除外のカードを選べるようにしたい。

- ランダマイズしたカードにpinと除外のボタンがあること
- 除外/pinに選択したら、それがわかること
- 除外/pinの場所からはずすことができること

## Introduction

この機能は、ランダマイズされたカードに対して、ユーザーが特定のカードを必須化（ピン留め）または除外できるようにするものです。
これにより、プレイヤーは自分の好みに応じてカード選択をカスタマイズし、より柔軟なゲームセットアップを実現できます。

また、既存のlocalStorageベースの除外機能を削除し、全ての状態をURL経由で管理することで、データの一貫性と共有性を向上させます。

## Requirements

### Requirement 1: カード状態管理

**Objective:** ユーザーとして、ランダマイズされたカードを必須または除外の状態に設定したいので、自分の好みに応じたカード構成を作成できる

#### Acceptance Criteria

1. The Randomizer MUST カードごとに3つの状態（通常、ピン、除外）を管理できる
2. When ユーザーがカードをピン状態に変更する, the Randomizer MUST そのカードを必須カードとして扱う
3. When ユーザーがカードを除外状態に変更する, the Randomizer MUST そのカードを選択対象から除外する
4. When ユーザーがピンまたは除外状態をクリアする, the Randomizer MUST カードを通常状態に戻す
5. The Randomizer MUST 各カードの状態をURL経由で共有可能な形式で保持する

### Requirement 2: UI操作インターフェース

**Objective:** ユーザーとして、ランダマイズされたカードに対してピンと除外のアクションを実行したいので、直感的にカード状態を変更できる

#### Acceptance Criteria

1. When ランダマイズ結果が表示される, the Site MUST 各カードにピンボタンと除外ボタンを表示する
2. When ユーザーがピンボタンをクリックする, the Site MUST カードをピン状態に変更し視覚的フィードバックを提供する
3. When ユーザーが除外ボタンをクリックする, the Site MUST カードを除外状態に変更し視覚的フィードバックを提供する
4. When カードがピン状態である, the Site MUST ピンボタンの見た目を変更してピン状態であることを示す
5. When カードが除外状態である, the Site MUST 除外ボタンの見た目を変更して除外状態であることを示す
6. The Site MUST ピン状態のカードを特定可能なスタイル（例：背景色、アイコン）で表示する
7. The Site MUST 除外状態のカードを特定可能なスタイル（例：グレーアウト、取り消し線）で表示する

### Requirement 3: 状態解除操作

**Objective:** ユーザーとして、ピンまたは除外状態のカードを通常状態に戻したいので、誤操作を修正したり選択を変更できる

#### Acceptance Criteria

1. When ユーザーがピン状態のカードのピンボタンを再度クリックする, the Site MUST カードを通常状態に戻す
2. When ユーザーが除外状態のカードの除外ボタンを再度クリックする, the Site MUST カードを通常状態に戻す
3. When カードが通常状態に戻る, the Site MUST 通常表示スタイルに復元する
4. The Site MUST 状態変更操作をトグル動作として実装する（同じボタンで状態のON/OFFを切り替え）

### Requirement 4: 再ランダマイズ時の状態維持

**Objective:** ユーザーとして、再ランダマイズを実行した際にピンと除外の設定を維持したいので、設定を保持したまま新しいランダム結果を得られる

#### Acceptance Criteria

1. When ユーザーが再ランダマイズを実行する, the Randomizer MUST ピン状態のカードを必ず結果に含める
2. When ユーザーが再ランダマイズを実行する, the Randomizer MUST 除外状態のカードを結果から除外する
3. When 再ランダマイズ結果が表示される, the Site MUST 既存のピン/除外状態を新しい結果に反映する
4. If ピンされたカード数が選択可能枠を超える, then the Randomizer MUST エラーメッセージを表示する
5. If 除外されたカードにより選択可能なカードが不足する, then the Randomizer MUST エラーメッセージを表示する

### Requirement 5: URL状態の同期

**Objective:** ユーザーとして、ピンと除外の設定をURL経由で共有・保存したいので、特定の構成を他のユーザーと共有したりブックマークできる

#### Acceptance Criteria

1. When ユーザーがカードをピンまたは除外状態に変更する, the Site MUST URLパラメータに状態を反映する
2. When URLパラメータにピン/除外情報が含まれる, the Site MUST ページロード時にその状態を復元する
3. The Site MUST ピン/除外状態を既存のURL状態管理メカニズム（シード値など）と統合する
4. The Site SHOULD URL長が実用的な範囲内に収まる形式でピン/除外情報をエンコードする

### Requirement 6: アクセシビリティ

**Objective:** すべてのユーザーとして、支援技術を使用している場合でもピン/除外機能を利用したいので、アクセシブルなインターフェースを提供する

#### Acceptance Criteria

1. The Site MUST キーボードのみでピン/除外操作を実行可能にする
2. The Site MUST フォーカス可能な要素に明確なフォーカスインジケーターを表示する
3. The Site MUST カラーだけに依存しない視覚的区別を提供する（アイコン、パターンなど）
4. The Site MAY ピンボタンと除外ボタンに適切なARIAラベルを提供する
5. When カードの状態が変更される, the Site MAY スクリーンリーダーに変更を通知する（aria-live または同等の手段）

### Requirement 7: 既存機能の移行

**Objective:** 開発者として、既存のlocalStorageベースの除外機能を削除し、URL-firstアプローチに統一したいので、データの一貫性と共有性を向上させる

#### Acceptance Criteria

1. The Site MUST 既存のlocalStorageベースのカード除外機能（`excludedCommons`）を削除する
2. The Site MUST 除外カードリスト表示セクションを削除する
3. The Site MUST localStorage関連のコード（保存、読み込み、クリア）を削除する
4. The Site SHOULD 既存のlocalStorageデータが存在する場合、初回アクセス時に移行通知を表示する
5. The Site MUST 全てのカード状態（選択結果、ピン、除外）をURL経由で管理する

