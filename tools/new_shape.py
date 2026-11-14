"""新しい形状(type)の雛形を作り、登録まで済ませる。

使い方（リポジトリ直下で）:

    python tools/new_shape.py <id> --label 表示名 [--desc 説明] [--dry-run] [--no-js]

    例) python tools/new_shape.py dome --label ドーム --desc "半球状のドーム"

<id> は小文字英字で始まる英数字とアンダースコア（保存データの type にそのまま入る）。

作るもの・変更するもの
  Python: py/voxel_schem/shapes/<id>.py を作成 → shapes/__init__.py の SHAPES に登録 → py/manifest.json を更新
  JS    : js/shapes/<kebab-id>.js を作成 → js/constants.js の SHAPE_TYPE と js/shapes/index.js に登録
  テスト: tests/golden/scenes/<id>_3x3x3.json（その形状を1つ置いたシーン）を作成（tests/golden がある場合）

雛形は最初「直方体と同じ動作」。JS の build() と Python の <id>_voxels() を書き換えて形状にしていく。
固有パラメータ（屋根の向きのようなもの）が要る形状の追加手順は docs/adding-a-shape.md を参照。
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_py_manifest import build_manifest, MANIFEST_PATH  # noqa: E402

PY_TEMPLATE = '''"""{label}（tools/new_shape.py で作った雛形）。

最初は box（直方体）と同じ動作。次の2点を、この形状の仕様に合わせて書き換える。
  1. どのセルにボクセルを置くか（座標）。同じ座標を2回返さないこと
  2. 各ボクセルの「辺」(edge) と「市松の色」(checker)
     - edge: 設置タイプ B/C が置くのは辺だけ（A は辺でなくても置く）
     - checker: 設置タイプ C の市松。0 = gray_wool / 1 = white_wool（位相は形状ごとに決める）
     屋根のように設置タイプによらず別素材にしたい場合は、kind=ROOF（voxel.py）にする。
"""
from ..voxel import Voxel


def {id}_voxels(entry):
    ox, oy, oz = entry['ox'], entry['oy'], entry['oz']
    sx, sy, sz = entry['sx'], entry['sy'], entry['sz']

    for y in range(oy, oy + sy):
        for z in range(oz, oz + sz):
            for x in range(ox, ox + sx):
                # 辺: 3軸のうち2軸以上で端に接するセル（直方体の定義）
                on_edge = (
                    (x == ox or x == ox + sx - 1) +
                    (y == oy or y == oy + sy - 1) +
                    (z == oz or z == oz + sz - 1)
                )
                # 市松: 原点セルが 0
                parity = (x - ox + y - oy + z - oz) % 2
                yield Voxel(x, y, z, edge=on_edge >= 2, checker=parity)
'''

JS_TEMPLATE = """import * as THREE from 'three';
import {{ THEME }} from '../config.js';
import {{ SHAPE_TYPE }} from '../constants.js';
import {{ SELECT_EMAT, createEdgeMaterial }} from '../materials.js';
import {{ computeEdgeVoxels }} from '../logic/edge-voxels.js';
import {{ TYPE_SVGS }} from '../type-icons.js';

// {label}（tools/new_shape.py で作った雛形。最初は直方体と同じ動作）
// build() で見た目を作り、edgeVoxels() で辺ボクセル表示の対象を返す。
// Python 側の py/voxel_schem/shapes/{id}.py と「どのセルが埋まるか・どれが辺か」を揃えること。
/** @type {{import('../types.js').ShapeDefinition}} */
export const {camel}Shape = {{
  id: SHAPE_TYPE.{key},
  label: '{label}',
  desc: '{desc}',
  icon: TYPE_SVGS.box, // TODO: 専用アイコンを type-icons.js に追加して差し替える
  category: 'solid', // 編集中に変更できるのは同じ category 内のみ

  build({{ ox, oy, oz, sx, sy, sz }}, {{ mat, edgeMat }}) {{
    const geo = new THREE.BoxGeometry(sx, sy, sz);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(ox + sx / 2, oy + sy / 2, oz + sz / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
    edges.visible = true;
    mesh.add(edges);
    return mesh;
  }},

  setVisibility(mesh, faceVisible, edgeVisible) {{
    mesh.visible = faceVisible;
    if (mesh.children[0]) mesh.children[0].visible = edgeVisible;
  }},

  highlight(obj, on) {{
    const mesh = /** @type {{THREE.Mesh}} */ (obj);
    const edgeChild = /** @type {{THREE.LineSegments}} */ (mesh.children[0]);
    if (!edgeChild) return;
    edgeChild.material = on ? SELECT_EMAT : createEdgeMaterial();
    /** @type {{THREE.Material}} */ (mesh.material).opacity = on ? THEME.opacity.selected : THEME.opacity.solid;
  }},

  setColor(obj, color) {{
    /** @type {{THREE.MeshLambertMaterial}} */ (/** @type {{THREE.Mesh}} */ (obj).material).color.setHex(color);
  }},

  // 辺ボクセルモードの対象（無い形状はモードの影響を受けない）
  edgeVoxels: ({{ sx, sy, sz }}) => computeEdgeVoxels(sx, sy, sz),

  typeLabel: () => ' [{label}]',
}};
"""


def detect_newline(text):
    return "\r\n" if "\r\n" in text else "\n"


def read(path):
    raw = path.read_bytes().decode("utf-8")
    nl = detect_newline(raw)
    return raw.replace("\r\n", "\n"), nl


def to_bytes(text, nl):
    return text.replace("\n", nl).encode("utf-8")


def insert_after_last(text, pattern, new_line, what):
    matches = list(re.finditer(pattern, text, re.M))
    if not matches:
        raise SystemExit(f"❌ {what} の挿入位置が見つかりません（ファイルの形が想定と違います）。手動で追加してください")
    end = matches[-1].end()
    return text[:end] + "\n" + new_line + text[end:]


def add_python_registration(text, shape_id):
    text = insert_after_last(text, r"^from \.\w+ import \w+$", f"from .{shape_id} import {shape_id}_voxels", "shapes/__init__.py の import")
    m = re.search(r"^SHAPES = \{\n(.*?)^\}", text, re.M | re.S)
    if not m:
        raise SystemExit("❌ shapes/__init__.py の SHAPES が見つかりません。手動で追加してください")
    pos = m.end(1)
    return text[:pos] + f'    "{shape_id}": {shape_id}_voxels,\n' + text[pos:]


def add_js_constant(text, key, shape_id):
    m = re.search(r"export const SHAPE_TYPE = Object\.freeze\(\{\n(.*?)^\}\);", text, re.M | re.S)
    if not m:
        raise SystemExit("❌ js/constants.js の SHAPE_TYPE が見つかりません。手動で追加してください")
    pos = m.end(1)
    return text[:pos] + f"  {key}: '{shape_id}',\n" + text[pos:]


def add_js_registration(text, camel, kebab):
    text = insert_after_last(text, r"^import \{ \w+Shape \} from '\./[\w-]+\.js';$", f"import {{ {camel}Shape }} from './{kebab}.js';", "js/shapes/index.js の import")
    return insert_after_last(text, r"^registerShape\(\w+\);.*$", f"registerShape({camel}Shape);", "js/shapes/index.js の registerShape")


def main(argv):
    ap = argparse.ArgumentParser(description="新しい形状の雛形を作って登録する")
    ap.add_argument("id", help="形状id（例: dome）。保存データの type になる")
    ap.add_argument("--label", required=True, help="表示名（例: ドーム）")
    ap.add_argument("--desc", default=None, help="タイプ選択カードの説明")
    ap.add_argument("--dry-run", action="store_true", help="何も書かず、やることだけ表示する")
    ap.add_argument("--no-js", action="store_true", help="Python側だけ作る")
    args = ap.parse_args(argv)

    sid = args.id
    if not re.fullmatch(r"[a-z][a-z0-9_]*", sid):
        raise SystemExit("❌ id は小文字英字で始まり、小文字英数字とアンダースコアだけで書いてください")
    if "'" in args.label or "\\" in args.label or "'" in (args.desc or "") or "\\" in (args.desc or ""):
        raise SystemExit("❌ label / desc に ' や \\ は使えません")
    kebab = sid.replace("_", "-")
    parts = sid.split("_")
    camel = parts[0] + "".join(p.capitalize() for p in parts[1:])
    key = sid.upper()
    desc = args.desc or args.label

    writes = {}   # path -> bytes
    notes = []

    # ── Python ──
    py_shape = ROOT / "py" / "voxel_schem" / "shapes" / f"{sid}.py"
    py_init = ROOT / "py" / "voxel_schem" / "shapes" / "__init__.py"
    if py_shape.exists():
        raise SystemExit(f"❌ すでにあります: {py_shape.relative_to(ROOT)}")
    init_text, init_nl = read(py_init)
    if f'"{sid}"' in init_text:
        raise SystemExit(f"❌ SHAPES に '{sid}' がすでに登録されています")
    writes[py_shape] = to_bytes(PY_TEMPLATE.format(id=sid, label=args.label), init_nl)
    writes[py_init] = to_bytes(add_python_registration(init_text, sid), init_nl)
    notes += [f"作成: {py_shape.relative_to(ROOT)}", f"変更: {py_init.relative_to(ROOT)}（import と SHAPES に登録）"]

    # ── JS ──
    if not args.no_js:
        js_shape = ROOT / "js" / "shapes" / f"{kebab}.js"
        js_const = ROOT / "js" / "constants.js"
        js_index = ROOT / "js" / "shapes" / "index.js"
        if js_shape.exists():
            raise SystemExit(f"❌ すでにあります: {js_shape.relative_to(ROOT)}")
        const_text, const_nl = read(js_const)
        if f"'{sid}'" in const_text:
            raise SystemExit(f"❌ SHAPE_TYPE に '{sid}' がすでにあります")
        index_text, index_nl = read(js_index)
        writes[js_shape] = to_bytes(JS_TEMPLATE.format(id=sid, label=args.label, desc=desc, camel=camel, key=key), index_nl)
        writes[js_const] = to_bytes(add_js_constant(const_text, key, sid), const_nl)
        writes[js_index] = to_bytes(add_js_registration(index_text, camel, kebab), index_nl)
        notes += [f"作成: {js_shape.relative_to(ROOT)}",
                  f"変更: {js_const.relative_to(ROOT)}（SHAPE_TYPE.{key}）",
                  f"変更: {js_index.relative_to(ROOT)}（import と registerShape）"]

    # ── テスト用シーン ──
    scenes_dir = ROOT / "tests" / "golden" / "scenes"
    scene_name = f"{sid}_3x3x3"
    if scenes_dir.is_dir():
        scene = {"canvasX": 32, "canvasZ": 32, "boxes": [{
            "ox": 0, "oy": 0, "oz": 0, "sx": 3, "sy": 3, "sz": 3,
            "color": "#888888", "label": f"{sid} 3x3x3", "type": sid}]}
        scene_path = scenes_dir / f"{scene_name}.json"
        if scene_path.exists():
            raise SystemExit(f"❌ すでにあります: {scene_path.relative_to(ROOT)}")
        writes[scene_path] = (json.dumps(scene, ensure_ascii=False, indent=1) + "\n").encode("utf-8")
        notes.append(f"作成: {scene_path.relative_to(ROOT)}")

    if args.dry_run:
        print("【dry-run】次を行います（何も書き込みません）:")
        print("\n".join("  " + n for n in notes) + f"\n  更新: {MANIFEST_PATH.relative_to(ROOT)}")
        return 0

    for path, data in writes.items():
        path.write_bytes(data)
    # manifest は、書き込んだ後の py/ を見て作る
    MANIFEST_PATH.write_text(build_manifest(), encoding="utf-8", newline="\n")
    notes.append(f"更新: {MANIFEST_PATH.relative_to(ROOT)}")

    print("\n".join(notes))
    print(f"""
次にやること:
  1. 形状を書く: js/shapes/{kebab}.js の build() / edgeVoxels() と、py/voxel_schem/shapes/{sid}.py の {sid}_voxels()
     （雛形は直方体と同じ動作なので、書き換えなくても動く）
  2. お手本を作る: python tests/golden/generate_expected.py {scene_name}
  3. テスト: python -m unittest discover -s tests -v   /   node --test tests/js/runtime.test.mjs
  4. ブラウザで、配置 → 保存・復元 → schem 書き出し(A/B/C) を確認する
詳しくは docs/adding-a-shape.md""")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
