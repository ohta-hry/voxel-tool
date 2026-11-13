import argparse
import sys
import json
import base64
import os
import mcschematic
from datetime import datetime

def parse_args():
    """コマンドライン引数から設置タイプとファイル名を取得"""
    parser = argparse.ArgumentParser(
        description="base64の建築データから .schem を生成します（base64は起動後に入力）"
    )
    parser.add_argument(
        "type", type=str.upper, choices=["A", "B", "C"],
        help="設置タイプ (A:敷き詰め / B:辺のみ滑石 / C:まだら辺)"
    )
    parser.add_argument(
        "filename", nargs="?", default=None,
        help="出力ファイル名（拡張子不要。省略でデフォルト名）"
    )
    args = parser.parse_args()

    name = (args.filename or "").strip()
    if not name:
        name = f"generated_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    return args.type, name

def get_data():
    """実行中に base64 文字列（またはそれが書かれたファイルのパス）を入力させる"""
    while True:
        text = input("base64データを貼り付けてEnter（ファイルパスも可）: ").strip()
        if not text:
            print("❌ 入力が空です。もう一度入力してください。")
            continue
        if os.path.isfile(text):
            with open(text, 'r', encoding='utf-8') as f:
                return f.read().strip()
        return text

# ──────────────────────────────────────────
# 屋根ボクセル生成（アプリのJS実装を移植）
# ──────────────────────────────────────────

def compute_roof_voxels(sx, sy, sz, axis):
    """
    片流れ屋根のDDAボクセルリストを返す。
    axis: '+x'|'-x'|'+z'|'-z'
    戻り値: [(lx, ly, lz), ...] ローカル座標
    """
    base_axis = axis[-1]          # 'x' or 'z'
    reversed_ = axis[0] == '-'    # True = 勾配を逆転

    steps = sx if base_axis == 'x' else sz
    span  = sz if base_axis == 'x' else sx

    voxels = []
    for i in range(steps):
        si = (steps - 1 - i) if reversed_ else i
        y_bot = int(si * sy / steps)
        y_top = int((si + 1) * sy / steps)
        thick = max(1, y_top - y_bot)
        for j in range(span):
            for t in range(thick):
                ly = y_bot + t
                lx = i if base_axis == 'x' else j
                lz = j if base_axis == 'x' else i
                voxels.append((lx, ly, lz))
    return voxels

def compute_gable_voxels(sx, sy, sz, axis):
    """
    両流れ屋根（gable）のボクセルリストを返す。
    左右の片流れを合成して重複を除去。
    """
    base_axis = axis[-1]
    steps = sx if base_axis == 'x' else sz
    half = (steps + 1) // 2  # ceil(steps/2)

    seen = set()
    voxels = []

    def add_voxels(lst):
        for v in lst:
            if v not in seen:
                seen.add(v)
                voxels.append(v)

    if base_axis == 'x':
        left  = compute_roof_voxels(half, sy, sz, '+x')
        right = compute_roof_voxels(half, sy, sz, '-x')
        add_voxels(left)
        add_voxels([(lx + (sx - half), ly, lz) for lx, ly, lz in right])
    else:
        left  = compute_roof_voxels(sx, sy, half, '+z')
        right = compute_roof_voxels(sx, sy, half, '-z')
        add_voxels(left)
        add_voxels([(lx, ly, lz + (sz - half)) for lx, ly, lz in right])

    return voxels

# ──────────────────────────────────────────
# ビルドタイプごとのブロック選択
# ──────────────────────────────────────────

def pick_block(build_type, x, y, z, ox, oy, oz, sx, sy, sz):
    """
    座標(x,y,z)に置くブロックIDを返す。
    置かない場合は None を返す。
    """
    if build_type == "A":
        return "minecraft:stone"

    elif build_type == "B":
        on_edge = (
            (x == ox or x == ox + sx - 1) +
            (y == oy or y == oy + sy - 1) +
            (z == oz or z == oz + sz - 1)
        )
        return "minecraft:smooth_stone" if on_edge >= 2 else None

    elif build_type == "C":
        on_edge = (
            (x == ox or x == ox + sx - 1) +
            (y == oy or y == oy + sy - 1) +
            (z == oz or z == oz + sz - 1)
        )
        if on_edge < 2:
            return None
        parity = (x - ox + y - oy + z - oz) % 2
        return "minecraft:gray_wool" if parity == 0 else "minecraft:white_wool"

    return None

# ──────────────────────────────────────────
# cross_pillar ヘルパー
# ──────────────────────────────────────────

def get_cross_pillar_cells(sx, sz):
    """
    cross_pillarのfootprintセル集合を返す。
    sx<=2 or sz<=2 の場合は角欠けなし（全セル）。
    戻り値: set of (lx, lz)
    """
    if sx <= 2 or sz <= 2:
        return {(lx, lz) for lx in range(sx) for lz in range(sz)}
    excluded = {(0, 0), (sx-1, 0), (0, sz-1), (sx-1, sz-1)}
    return {(lx, lz) for lx in range(sx) for lz in range(sz)
            if (lx, lz) not in excluded}

def is_cross_pillar_outer(cell_set, lx, lz):
    """
    中間層の外周判定：隣接4方向のどれかがcell_setにない = 外周セル。
    （上下面では使わない）
    """
    for dx, dz in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        if (lx + dx, lz + dz) not in cell_set:
            return True
    return False

def get_cross_pillar_top_cells(sx, sz):
    """
    上下面の設置セル集合。
      - 外周（角欠け）: on_border かつ not corner
      - 内周の4角: lx が 1 か sx-2、かつ lz が 1 か sz-2
    5×5例:
      □■■■□
      ■■□■■
      ■□□□■
      ■■□■■
      □■■■□
    """
    cells = set()
    for lx in range(sx):
        for lz in range(sz):
            is_corner  = (lx == 0 or lx == sx-1) and (lz == 0 or lz == sz-1)
            on_border  = (lx == 0 or lx == sx-1 or lz == 0 or lz == sz-1)
            inner_corn = (lx == 1 or lx == sx-2) and (lz == 1 or lz == sz-2)
            if (on_border and not is_corner) or inner_corn:
                cells.add((lx, lz))
    return cells

def get_cross_pillar_mid_cells(sx, sz):
    """
    中間面の設置セル集合。
    外周辺の「端のみ」= 角の隣セル（辺の中央を除く）。
    5×5例:
      □■□■□
      ■□□□■
      □□□□□
      ■□□□■
      □■□■□
    """
    cells = set()
    for lx in range(sx):
        for lz in range(sz):
            # X辺上（lz==0 or lz==sz-1）かつ lx が角隣（1 or sx-2）
            on_z_edge = (lz == 0 or lz == sz-1) and (lx == 1 or lx == sx-2)
            # Z辺上（lx==0 or lx==sx-1）かつ lz が角隣（1 or sz-2）
            on_x_edge = (lx == 0 or lx == sx-1) and (lz == 1 or lz == sz-2)
            if on_z_edge or on_x_edge:
                cells.add((lx, lz))
    return cells

# ──────────────────────────────────────────
# エントリごとの処理ディスパッチ
# ──────────────────────────────────────────

def process_entry(schem, entry, build_type):
    """type フィールドに応じて処理を振り分ける"""
    entry_type = entry.get("type", "box")

    if entry_type == "box":
        place_box(schem, entry, build_type)
    elif entry_type == "roof":
        place_roof(schem, entry, build_type)
    elif entry_type == "cross_pillar":
        place_cross_pillar(schem, entry, build_type)
    else:
        print(f"⚠️  未対応のtype '{entry_type}' をスキップ: {entry.get('label', '(ラベルなし)')}")

def place_box(schem, box, build_type):
    """box エントリをビルドタイプに応じて設置する"""
    ox, oy, oz = box['ox'], box['oy'], box['oz']
    sx, sy, sz = box['sx'], box['sy'], box['sz']

    for y in range(oy, oy + sy):
        for z in range(oz, oz + sz):
            for x in range(ox, ox + sx):
                block = pick_block(build_type, x, y, z, ox, oy, oz, sx, sy, sz)
                if block:
                    schem.setBlock((x, y, z), block)

def place_cross_pillar(schem, box, build_type):
    """
    cross_pillar エントリを設置する。

    A: footprint全セル × 全高さ を stone で敷き詰め

    B/C の設置対象:
      上下面（ly==0 / ly==sy-1）→ get_cross_pillar_top_cells
      中間面（それ以外）        → get_cross_pillar_mid_cells

    C: 全層統一の逆位相まだら（偶数=white / 奇数=gray）
    """
    ox, oy, oz = box['ox'], box['oy'], box['oz']
    sx, sy, sz = box['sx'], box['sy'], box['sz']

    cell_set  = get_cross_pillar_cells(sx, sz)
    top_cells = get_cross_pillar_top_cells(sx, sz)
    mid_cells = get_cross_pillar_mid_cells(sx, sz)

    for ly in range(sy):
        y = oy + ly
        is_top_bottom = (ly == 0 or ly == sy - 1)
        target_cells  = top_cells if is_top_bottom else mid_cells

        if build_type == "A":
            for (lx, lz) in cell_set:
                schem.setBlock((ox + lx, y, oz + lz), "minecraft:stone")

        elif build_type == "B":
            for (lx, lz) in target_cells:
                schem.setBlock((ox + lx, y, oz + lz), "minecraft:smooth_stone")

        elif build_type == "C":
            for (lx, lz) in target_cells:
                parity = (lx + ly + lz) % 2
                block = "minecraft:white_wool" if parity == 0 else "minecraft:gray_wool"
                schem.setBlock((ox + lx, y, oz + lz), block)

def place_roof(schem, roof, build_type):
    """
    roof エントリをアプリと同じDDAロジックで設置する。
    ビルドタイプA → stone で敷き詰め
    ビルドタイプB/C → 辺判定はボクセル単位（1×1×1）で適用
    """
    ox, oy, oz = roof['ox'], roof['oy'], roof['oz']
    sx, sy, sz = roof['sx'], roof['sy'], roof['sz']

    # roofAxisの正規化（'+x'|'-x'|'+z'|'-z'）
    raw_axis  = roof.get('roofAxis', '+x')
    if raw_axis[0] not in ('+', '-'):
        raw_axis = '+' + raw_axis
    axis = raw_axis

    gable = bool(roof.get('roofGable', False))

    # DDAでボクセルリスト取得（アプリ同様）
    voxels = compute_gable_voxels(sx, sy, sz, axis) if gable \
             else compute_roof_voxels(sx, sy, sz, axis)

    for (lx, ly, lz) in voxels:
        wx = ox + lx
        wy = oy + ly
        wz = oz + lz

        if build_type == "A":
            # A専用の屋根処理（将来ここだけ変更可）
            schem.setBlock((wx, wy, wz), "minecraft:end_stone")

        else:  # B, C（将来ここだけ変更可）
            schem.setBlock((wx, wy, wz), "minecraft:end_stone")

def main():
    build_type, filename = parse_args()

    encoded_data = get_data()
    try:
        decoded = base64.b64decode(encoded_data)
        data = json.loads(decoded)
    except Exception as e:
        print(f"❌ base64データの読み込みに失敗しました: {e}")
        sys.exit(1)

    os.makedirs("myschems", exist_ok=True)
    schem = mcschematic.MCSchematic()

    for entry in data['boxes']:
        process_entry(schem, entry, build_type)

    schem.save("myschems", filename, mcschematic.Version.JE_1_21_4)

    print(f"✅ 保存完了しました！")
    print(f"ファイル → myschems/{filename}.schem")
    print(f"設置タイプ: {build_type}")

if __name__ == "__main__":
    main()
