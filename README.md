# Voxel Tool

ブラウザー上でボクセル形状を配置・編集し、保存コードやブラウザー内ストレージで保存する静的Webアプリです。

## 起動方法

`index.html` をWebサーバー経由で開きます。JavaScript ES Modulesとimport mapを使い、Three.js r128をCDNから読み込みます。ビルドツールやパッケージ管理ファイルはありません。オフライン環境ではThree.jsを読み込めません。

## ファイル構成

- `index.html` — 画面HTML、import map、アプリの起点
- `css/` — 画面スタイル（`styles.css`、`settings.css`）
- `js/app.js` — 各モジュールの初期化の順序だけを持つ起点
- `js/state.js` — 共有状態ストア（書き込みの変更検知と `subscribe`）。`js/reactions.js` が「状態が変わったら何を更新するか」を集約する
- `js/registry.js` — 配置済みオブジェクトの管理（シーンへの追加・削除・再構築）
- `js/shapes/` — 形状プラグイン（`box.js` / `cross-pillar.js`（ページ上の表示名は「角欠け直方体」）/ `roof.js` / `pillar.js`）。`index.js` に登録する。新しい形状の追加手順は `docs/adding-a-shape.md`
- `js/logic/` — 形状まわりの純粋な計算（屋根・角欠け直方体の座標、辺ボクセルなど）
- `js/ui/` — 画面部品の配線（タイプ選択、屋根の操作、編集モード、書き出しパネルなど）
- `js/schem/` — schem書き出しのJS側（Pyodide の起動・Python ファイルの配置・実行・ダウンロード）
- `js/persistence.js` — エクスポート／インポートと localStorage。保存形式は `docs/save-format.md`
- `js/scene.js`, `js/orbit-controls.js`, `js/materials.js`, `js/modes.js`, `js/preview.js` — 描画・カメラ・表示モード・プレビュー
- `js/config.js`, `js/constants.js`, `js/types.js` — 設定値、形状IDなどの定数、型定義（JSDocのみ）
- `js/color.js`, `js/palette.js`, `js/form.js`, `js/dom.js` ほか — 色選択、入力フォーム、DOM参照などの小さな部品

## schem書き出し（Python / Pyodide）

アプリのシーンを Minecraft の `.schem` にします。ブラウザでは Pyodide 上で `py/` の Python を動かし、コマンドラインでも同じコードを使えます。

- `py/b6.py` — コマンドライン入口（`python py/b6.py <A|B|C> [ファイル名]`、base64 は起動後に入力。要 `pip install mcschematic`）
- `py/b6_runner.py` — ブラウザ(Pyodide)から呼ぶ入口
- `py/voxel_schem/` — 本体。形状（`shapes/`）と設置タイプ A/B/C（`styles.py`）を分けてあり、新しい形状は形状ファイルを足すだけで追加できる
- `py/manifest.json` — ブラウザへ配置する Python ファイルの一覧。ファイルを増減したら `python tools/make_py_manifest.py` で更新する
- `docs/save-format.md` — 保存データ形式、設置タイプの仕様
- `docs/adding-a-shape.md` — 新しい形状(type)の追加手順。`python tools/new_shape.py <id> --label 表示名` で JS・Python 両方の雛形と登録まで行う
- `tests/` — 回帰テスト。`python -m unittest discover -s tests -v`（JS側は `node --test tests/js/runtime.test.mjs`）

## 状態と互換性

- ES Modulesの変数は `window` のグローバルではありません。共有状態は `js/state.js` の `state` が持ち、変更は `subscribe` で購読します（更新の振り分けは `js/reactions.js`）。
- localStorageキー `voxelTool_v1` と保存データ形式は既存互換性のため維持してください。
- 主な機能は box／roof／cross_pillar の配置・編集、色変更、ワイヤーフレーム／辺ボクセル表示、保存・復元です。

## 文字コードと文字化け

- HTML、CSS、JavaScript、MarkdownはUTF-8で扱います。現在の `index.html` はUTF-8 BOM付きで、他の対象ファイルはBOMなしです。
- 読み書き時は文字コードを明示してください。PowerShellでは `Get-Content -Encoding UTF8` を使い、既定のコードページでファイルを書き戻さないでください。エディターもUTF-8で保存します。
- ターミナルに日本語が `?` や `置換記号` と表示された場合、ファイル自体の破損とは限りません。表示結果だけで判断せず、UTF-8として読み直し、置換文字（U+FFFD）や不自然なASCIIの `?` 連続がファイル内にないか確認します。
- 今回、READMEの内容が実際に `?` に置き換わっていたため、UTF-8バイト列として書き直しました。ほかの対象ファイルはUTF-8として正常に読め、U+FFFDは見つかりませんでした。

## 現在の確認状況

ユーザーは先行するファイル分割後のアプリが正常に動くと報告しています。その後の色・保存処理のモジュール化ではJavaScript構文を確認しましたが、ブラウザー操作による回帰確認は未実施です。次回は初期表示、配置・編集・削除、色変更、屋根設定、表示切替、エクスポート／インポート、localStorage復元を確認してください。
