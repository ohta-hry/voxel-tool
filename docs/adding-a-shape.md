# 新しい形状(type)を追加する

直方体・十字柱・屋根と並列の新しい形状（例: ドーム）を足す手順です。
形状は JS（見た目・保存・復元）と Python（`.schem` 書き出し）の両方に必要です。

## 考え方

| 役割 | 担当 | 決めること |
|---|---|---|
| 形状 | JS: `js/shapes/<name>.js` / Python: `py/voxel_schem/shapes/<name>.py` | どのセルが埋まるか、**どれが辺か**、**市松の色**（C 用） |
| 設置タイプ A/B/C | Python: `py/voxel_schem/styles.py` | 形状が返した性質から、どのブロックを置くか |

形状側で A/B/C の分岐を書く必要はありません。形状は `Voxel`（`voxel.py`）を返すだけです。

- `edge` … 設置タイプ B/C は辺だけを置く（A は辺でなくても置く）。辺の定義は形状ごとに決めてよい（十字柱のように、JS の辺ボクセル表示とは別定義でもよい。その場合は意図を `docs/save-format.md` の仕様表に書く）
- `checker` … 設置タイプ C の市松。0 = gray_wool / 1 = white_wool。位相は形状ごとに決める
- `kind` … 通常は `BODY`。屋根のように設置タイプによらず別の素材にしたい形状は `ROOF`（素材を増やすなら `styles.py` の `block_for`）

## 手順A: 固有パラメータが無い形状（直方体・十字柱と同じ種類）

### 1. 雛形を作る

リポジトリ直下で:

```
python tools/new_shape.py dome --label ドーム --desc "半球状のドーム"
```

次を自動で行います（`--dry-run` で内容だけ確認できます）。

- Python: `py/voxel_schem/shapes/dome.py` を作成し、`shapes/__init__.py` の `SHAPES` に登録、`py/manifest.json` を更新
- JS: `js/shapes/dome.js` を作成し、`js/constants.js` の `SHAPE_TYPE` と `js/shapes/index.js` に登録
- テスト: `tests/golden/scenes/dome_3x3x3.json`（その形状を1つ置いたシーン）を作成

雛形は最初「直方体と同じ動作」なので、この時点でブラウザ表示・保存・書き出しまで一通り動きます。

### 2. 形状を書く

| 場所 | 書き換えるもの |
|---|---|
| `js/shapes/dome.js` | `build()`（見た目のメッシュ）、`edgeVoxels()`（辺ボクセル表示の対象。不要なら削除）、`icon`、`typeLabel` |
| `py/voxel_schem/shapes/dome.py` | `dome_voxels()`（どの座標にボクセルを置くか、`edge`、`checker`）。同じ座標を2回返さないこと |

座標の計算が長いときは、`py/voxel_schem/geometry/` に分けます（屋根・十字柱が見本）。

`category`（JS）は、編集中にタイプを切り替えられる範囲です。同じ `category` 同士でだけ切り替えられます。

### 3. お手本とテスト

```
python tests/golden/generate_expected.py dome_3x3x3        # 新しいシーンのお手本だけを作る
python -m unittest discover -s tests -v
node --test tests/js/runtime.test.mjs
```

- 形が分かるシーンを、`tests/golden/scenes/` に足します（小さい形・大きい形・原点が負の位置など）。足したら同じ要領でお手本を作ります。
- `generate_expected.py` は、**指定したシーンのお手本だけ**を作ります。既存のお手本は変わりません。`--all` は全件を上書きするので、仕様を意図して変えたとき以外は使いません。
- お手本を作る前に、そのシーンの出力が意図どおりかを自分の目で確かめてください（お手本は「正しい」ではなく「今と同じ」を保証するものです）。

### 4. ブラウザで確認

配置 → 色変更 → 辺ボクセル表示 → 編集 → 保存コードの書き出し／読み込み → schem 書き出し（A/B/C）を試し、Minecraft（または schem ビューア）で見た目を確認します。

## 手順B: 固有パラメータがある形状（屋根の向きのようなもの）

屋根が見本です。手順A に加えて次が必要です。

JS
1. `params`（`ShapeParams`、`js/types.js`）を定義する: `normalize` / `fromState` / `toState` / `reset` / `serialize` / `deserialize`。保存キーは `serialize` が決める（屋根の `roofAxis` / `roofGable` が見本）
2. `js/state.js` と `js/types.js` の `AppState` に、フォーム／プレビュー用の状態を足す
3. 専用UI: `index.html` に操作部品の行を足し、`controlsId` にその id を指定する（選択中だけ表示される）。`js/dom.js` に要素を足し、`js/ui/<name>-controls.js` で状態と配線し、`js/reactions.js` で状態の変更をプレビューとボタン表示に反映する

Python
1. 保存キーを、その形状の `*_voxels()` の中で読む。不正値・欠落値の扱いは **JS の `normalize` と同じ規則**にする（屋根の `normalize_roof_axis` が見本。JS と Python で扱いが違うと、プレビューと書き出しが食い違う）
2. `docs/save-format.md` の「形状ごとの固有キー」の表に、キーと意味を足す
3. パラメータの値を変えたシーン（全ての向き・オン/オフなど）をテストに足す

## 設置タイプ（A/B/C）を足したい場合

形状の追加とは別の作業です。

- Python: `py/voxel_schem/styles.py` の `BUILD_TYPES` と `block_for`
- JS: `js/schem/constants.js` の `SCHEM_TYPES`、`js/types.js` の `SchemType`、`index.html` の書き出しタイプのボタン（`data-schem-type`）
- テスト: `tests/golden/generate_expected.py` と `test_golden.py` の `BUILD_TYPES`、`generate_expected.py --all` でお手本を作り直す

## 自動で守られること

| テスト | 見ていること |
|---|---|
| `test_shape_parity.py` | JS の `SHAPE_TYPE` と Python の `SHAPES` が一致している（JS だけに足して書き出しで形が消える、を防ぐ） |
| `test_shape_contract.py` | 全形状が `Voxel` を返し、同じ座標を重複して返さない。golden のシーンが各形状にある |
| `test_golden.py` | 登録済みシーンの出力が、お手本と一致する |
| `test_manifest.py` | `py/manifest.json` が `py/` 配下と一致している（`python tools/make_py_manifest.py` で更新） |

## うまくいかないとき

- 書き出し時のログに「未対応のtype 'xxx' をスキップ」→ Python 側の `SHAPES` に未登録
- ブラウザで `ModuleNotFoundError` → `py/manifest.json` が古い（`python tools/make_py_manifest.py`）
- 動かしても古いコードのまま → ブラウザのキャッシュ。強制再読み込み
