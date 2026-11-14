# Voxel Tool

ブラウザー上でボクセル形状を配置・編集し、保存コードやブラウザー内ストレージで保存する静的Webアプリです。

## 起動方法

`index.html` をWebサーバー経由で開きます。JavaScript ES Modulesとimport mapを使い、Three.js r128をCDNから読み込みます。ビルドツールやパッケージ管理ファイルはありません。オフライン環境ではThree.jsを読み込めません。

## ファイル構成

- `index.html` — 画面HTML、import map、アプリの起点
- `css/styles.css` — 画面スタイル
- `js/app.js` — シーン、形状生成、配置・編集、UIイベント、描画ループ
- `js/config.js` — 色・UI・シーン・ボクセル・タイミング設定
- `js/orbit-controls.js` — Three.jsを使ったカメラ操作
- `js/color.js` — 色パレットとカスタムピッカー。初期化時にアプリ状態や編集処理を受け取る
- `js/persistence.js` — エクスポート／インポートとlocalStorage。初期化時にシーン・編集処理と状態アクセサーを受け取る

`app.js` はアプリの中心です。形状生成、配置・編集、UIイベントはまだ個別モジュールになっていません。追加で分割するときは依存関係と初期化順を保ち、循環importを避けてください。

## schem書き出し（Python / Pyodide）

アプリのシーンを Minecraft の `.schem` にします。ブラウザでは Pyodide 上で `py/` の Python を動かし、コマンドラインでも同じコードを使えます。

- `py/b6.py` — コマンドライン入口（`python py/b6.py <A|B|C> [ファイル名]`、base64 は起動後に入力。要 `pip install mcschematic`）
- `py/b6_runner.py` — ブラウザ(Pyodide)から呼ぶ入口
- `py/voxel_schem/` — 本体。形状（`shapes/`）と設置タイプ A/B/C（`styles.py`）を分けてあり、新しい形状は形状ファイルを足すだけで追加できる
- `py/manifest.json` — ブラウザへ配置する Python ファイルの一覧。ファイルを増減したら `python tools/make_py_manifest.py` で更新する
- `docs/save-format.md` — 保存データ形式、設置タイプの仕様、新しい形状を追加する手順
- `tests/` — 回帰テスト。`python -m unittest discover -s tests -v`（JS側は `node --test tests/js/runtime.test.mjs`）

## 状態と互換性

- ES Modulesの変数は `window` のグローバルではありません。共有状態は `app.js` が管理し、機能モジュールにはコールバックやアクセサーで渡します。
- localStorageキー `voxelTool_v1` と保存データ形式は既存互換性のため維持してください。
- 主な機能は box／roof／cross_pillar の配置・編集、色変更、ワイヤーフレーム／辺ボクセル表示、保存・復元です。

## 文字コードと文字化け

- HTML、CSS、JavaScript、MarkdownはUTF-8で扱います。現在の `index.html` はUTF-8 BOM付きで、他の対象ファイルはBOMなしです。
- 読み書き時は文字コードを明示してください。PowerShellでは `Get-Content -Encoding UTF8` を使い、既定のコードページでファイルを書き戻さないでください。エディターもUTF-8で保存します。
- ターミナルに日本語が `?` や `置換記号` と表示された場合、ファイル自体の破損とは限りません。表示結果だけで判断せず、UTF-8として読み直し、置換文字（U+FFFD）や不自然なASCIIの `?` 連続がファイル内にないか確認します。
- 今回、READMEの内容が実際に `?` に置き換わっていたため、UTF-8バイト列として書き直しました。ほかの対象ファイルはUTF-8として正常に読め、U+FFFDは見つかりませんでした。

## 現在の確認状況

ユーザーは先行するファイル分割後のアプリが正常に動くと報告しています。その後の色・保存処理のモジュール化ではJavaScript構文を確認しましたが、ブラウザー操作による回帰確認は未実施です。次回は初期表示、配置・編集・削除、色変更、屋根設定、表示切替、エクスポート／インポート、localStorage復元を確認してください。
