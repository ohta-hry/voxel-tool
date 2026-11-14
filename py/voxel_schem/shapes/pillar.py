"""pillar（ピラー）: 指定した軸方向に伸びる 1×1×長さ の柱。

- 軸以外のサイズは 1 に固定。保存データの sx/sy/sz のうち、軸に対応する値だけを「長さ」として使う
  （軸以外の値が 1 でなくても無視する）
- 全ボクセルを「辺」として返す（1×1×長さ は、箱の辺の定義でも全セルが辺になる）
- 設置タイプ A/B は、軸付きの polished_basalt（styles.py）。C は箱と同じ規則（市松は原点セルが gray）
"""
from ..voxel import Voxel, PILLAR
from ..geometry.pillar import normalize_pillar_axis


def pillar_voxels(entry):
    ox, oy, oz = entry['ox'], entry['oy'], entry['oz']
    axis = normalize_pillar_axis(entry.get('pillarAxis'))
    length = entry['s' + axis]   # 軸に対応するサイズ（sx / sy / sz）が長さ

    for i in range(length):
        x = ox + (i if axis == 'x' else 0)
        y = oy + (i if axis == 'y' else 0)
        z = oz + (i if axis == 'z' else 0)
        # 市松: 原点セルが 0(gray)。箱と同じ位相
        yield Voxel(x, y, z, kind=PILLAR, edge=True, checker=i % 2, axis=axis)
