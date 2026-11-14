# 保存データ形式と schem 書き出し

アプリのシーンを `.schem`（Minecraft の建築データ）にするときの、データの受け渡しの決まりごとです。
JS 側（保存・復元）と Python 側（`py/voxel_schem/`）が、この形式を共通の約束にしています。

## 1. 全体の流れ

```
アプリ(JS)  →  保存データ(JSON)  →  base64  →  b6_runner.run / b6.py  →  .schem
persistence.js  createSaveData()                  voxel_schem.export_schem
```

- base64 は「UTF-8 の JSON 文字列」を符号化したものです（エクスポート用のセーブコードと同じ）。
- ブラウザでは Pyodide 上の `b6_runner.run(argv_json, payload, out_dir)` を呼びます。コマンドラインでは `python py/b6.py <A|B|C> [ファイル名]` を実行し、base64 を入力します。

## 2. 保存データ

```json
{ "canvasX": 32, "canvasZ": 32, "boxes": [ { ...エントリ... }, ... ] }
```

| キー | 必須 | 内容 |
|---|---|---|
| `boxes` | ○ | エントリ（オブジェクト）の配列。箱以外の形状もここに入る（歴史的な名前） |
| `canvasX` / `canvasZ` | － | キャンバスの大きさ。Python では使わない |

### エントリ共通

| キー | 必須 | 内容 |
|---|---|---|
| `ox` `oy` `oz` | ○ | 原点（整数。負の値も可） |
| `sx` `sy` `sz` | ○ | サイズ（整数） |
| `type` | － | 形状の種類。省略すると `box` |
| `label` | － | 表示名。Python ではエラーメッセージに使うだけ |
| `color` | － | 色。Python では使わない |

### 形状ごとの固有キー（JS の `shapes/*.js` の `params.serialize` が決める）

| type | 固有キー | 内容 |
|---|---|---|
| `box` | なし | 直方体 |
| `cross_pillar` | なし | 十字柱（四隅を欠いた柱） |
| `roof` | `roofAxis` | `+x` `-x` `+z` `-z`。旧形式 `x` / `z` は `+x` / `+z` として読む。空・不正な値は `+x`（JS の `normalizeRoofAxis` と同じ規則） |
| `roof` | `roofGable` | `true` で両流れ（省略は `false`） |

## 3. Python 側の検証

| 状況 | 動作 |
|---|---|
| base64 や JSON として読めない | エラー（終了コード 1）。「base64データの読み込みに失敗しました」 |
| `boxes` が無い・配列でない・要素がオブジェクトでない | エラー |
| 既知の type で、原点・サイズが無い／整数でない | エラー。「エントリN（label）: 'sx' がありません」のように位置を示す |
| 未知の type | 警告を出してそのエントリだけスキップ（他は書き出す） |
| サイズが 0 以下 | 何も置かない（エラーにはしない） |
| 設置タイプが A/B/C 以外 | エラー（CLI とブラウザは A/B/C しか渡さない） |

## 4. 設置タイプ(A/B/C)と形状の仕様

形状は「どのボクセルが辺か」「市松の色」を決め、設置タイプはそれをブロックに対応させます（`voxel.py` / `styles.py`）。

| 設置タイプ | 躯体（箱・十字柱） | 屋根 |
|---|---|---|
| A 敷き詰め | 全ボクセルを stone | end_stone |
| B 辺のみ滑石 | 辺のボクセルだけ smooth_stone | end_stone |
| C まだら辺 | 辺のボクセルだけ、市松に gray_wool / white_wool | end_stone |

形状ごとの定義（意図した仕様。リファクタリングでも変えない）:

| 形状 | 辺の定義 | 市松（C） |
|---|---|---|
| box | 3軸のうち2軸以上で端に接するセル | 原点セルを偶数とし、偶数=gray / 奇数=white |
| cross_pillar | 上下面: 外周（角を除く）と内側の4角（中央は空洞）。中間層: 角の隣のセルだけ | 偶数=white / 奇数=gray（**箱とは逆位相**） |
| roof | （辺の概念なし。全セルを屋根として置く） | － |

※ 十字柱の辺は、JS の「辺ボクセル表示」とは別の定義です（これも意図した仕様）。

## 5. 新しい形状(type)を追加するとき

JS 側
1. `js/constants.js` の `SHAPE_TYPE` に追加し、`js/shapes/<name>.js` を作って `js/shapes/index.js` に登録する
2. 固有パラメータがあるなら、`params.serialize` / `deserialize` で保存キーを決める → **この文書の 2 章の表を更新する**
3. アイコン（`type-icons.js`）などの UI

Python 側
1. `py/voxel_schem/shapes/<name>.py` に、エントリ(dict)から `Voxel` を返す関数を作る。**辺の定義と市松の位相を決める**（`voxel.py` 参照）。座標計算が長いなら `geometry/` に分ける
2. `py/voxel_schem/shapes/__init__.py` の `SHAPES` に1行追加する
3. `python tools/make_py_manifest.py` で `py/manifest.json` を更新する（ブラウザへ配置するファイル一覧）
4. テスト: `tests/golden/scenes/` にシーンを足し、`python tests/golden/generate_expected.py` でお手本を作る。このスクリプトは全件を作り直すので、実行後は `git diff` を見て、**既存シーンのお手本が変わっていない**ことを確認する（変わっていたら仕様変更になっている）。`tests/test_differential.py` は旧実装との比較用なので、新タイプは対象外

## 6. テスト

リポジトリ直下で:

```
python -m unittest discover -s tests -v     # Python（golden master・差分・検証・書き出し・manifest）
node --test tests/js/runtime.test.mjs       # JS（Pyodide 配置・呼び出し。Node 22 以降）
```

`tests/golden/README.md` に golden master の詳細があります。書き出しのテストは `pip install mcschematic` が無いとスキップされます。
