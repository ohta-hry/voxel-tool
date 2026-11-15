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
| `cross_pillar` | なし | 角欠け直方体（四隅を1マス欠いた直方体）。ページ上の表示名は「角欠け直方体」 |
| `roof` | `roofAxis` | `+x` `-x` `+z` `-z`。旧形式 `x` / `z` は `+x` / `+z` として読む。空・不正な値は `+x`（JS の `normalizeRoofAxis` と同じ規則） |
| `roof` | `roofGable` | `true` で両流れ（省略は `false`） |
| `ellipse` | `isCircle` `isFixedCenter` | 画面の入力補助（`true`/`false`。省略は `false`）。xz のサイズ連動（円）と、中心固定（増減幅2・位置を動かす）のボタンの状態を、編集時に復元するための値で、**`.schem` の出力には関係しない**（Python は読まない）。ページ上の表示名は「楕円」 |
| `pillar` | `pillarAxis` | `x` `y` `z`（伸びる方向）。空・不正な値は `y`（縦）。`sx` `sy` `sz` のうち**軸に対応する値が長さ**で、軸以外は `1` で保存される（Python は軸以外の値を無視する） |

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

| 設置タイプ | 躯体（直方体・角欠け直方体） | ピラー | 楕円 | 屋根 |
|---|---|---|---|---|
| A 敷き詰め | 全ボクセルを stone | 軸付きの polished_basalt（例: `minecraft:polished_basalt[axis=y]`） | 楕円のセル全体を andesite | end_stone |
| B 辺のみ滑石 | 辺のボクセルだけ smooth_stone | A と同じ（全ボクセルが辺のため） | 辺のセルだけ smooth_stone（下記） | end_stone |
| C まだら辺 | 辺のボクセルだけ、市松に gray_wool / white_wool | 直方体（1×1×長さ）と同じ規則 | B と同じセルに、**黒/白の羊毛の市松**（原点 (0,0,0) が黒。(lx+ly+lz) が偶数なら black_wool、奇数なら white_wool） | end_stone |

形状ごとの定義（意図した仕様。リファクタリングでも変えない）:

| 形状 | 辺の定義 | 市松（C） |
|---|---|---|
| box | 3軸のうち2軸以上で端に接するセル | 原点セルを偶数とし、偶数=gray / 奇数=white |
| cross_pillar | 上下面: 外周（角を除く）と内側の4角（中央は空洞）。中間層: 角の隣のセルだけ | 偶数=white / 奇数=gray（**箱とは逆位相**） |
| ellipse | 楕円のセルのうち、下記の条件を満たすセル（B/C） | 黒/白。原点セル (0,0,0) が黒（C のみ。(0,0) が楕円の外でも位相は同じ） |
| pillar | 全ボクセルが辺（1×1×長さ） | 原点セルを偶数とし、偶数=gray / 奇数=white（箱と同じ位相。C のみ） |
| roof | （辺の概念なし。全セルを屋根として置く） | － |

※ 角欠け直方体の辺は、JS の「辺ボクセル表示」とは別の定義です（これも意図した仕様）。

### 楕円（ellipse）のセルと辺

- **楕円のセル**: xz 面で、セルの中心が楕円（中心 (sx/2, sz/2)、半軸 sx/2・sz/2）の内側または境界上にあるセル。5×5 なら四隅を除いた21セル（角欠け直方体と同じ）、3×3 以下は欠けなしの全セル。
- **x条件 / z条件**（設置タイプ B）: セルの中心が楕円の中心と同じか大きい側なら、軸方向に +1 のセルが無いこと。同じか小さい側なら、-1 のセルが無いこと。ちょうど中心と等しい（奇数サイズの中央）ときは両方が必要。
- **置くセル**: 最下層・最上層（y が最小・最大）は「x条件 または z条件」（外周の輪）、それ以外の層は「x条件 かつ z条件」（外周の折れ角に立つ柱）。
- 実装は `py/voxel_schem/geometry/ellipse.py` と `js/logic/ellipse.js`。同じ結果になることは、共有の表 `tests/fixtures/ellipse_cases.json` を両方のテストが確認している。

## 5. 新しい形状(type)を追加するとき

手順は `docs/adding-a-shape.md` にまとめてあります。`python tools/new_shape.py <id> --label 表示名` で、JS・Python 両方の雛形と登録までできます。
形状を足したら、この文書の 2 章（形状ごとの固有キー）と 4 章（辺の定義・市松の位相）の表も更新してください。

## 6. テスト

リポジトリ直下で:

```
python -m unittest discover -s tests -v     # Python（golden master・差分・検証・書き出し・manifest・形状の整合）
node --test tests/js/runtime.test.mjs       # JS（Pyodide 配置・呼び出し。Node 22 以降）
```

`tests/golden/README.md` に golden master の詳細があります。書き出しのテストは `pip install mcschematic` が無いとスキップされます。
