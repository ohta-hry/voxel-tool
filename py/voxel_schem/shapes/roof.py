"""roof（屋根）の設置。"""
from ..geometry.roof import compute_roof_voxels, compute_gable_voxels


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
