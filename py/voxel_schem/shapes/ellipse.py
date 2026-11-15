"""ellipse（楕円）: xz 面が楕円の柱。

- 設置タイプ A: 楕円のセルを全高さ分、andesite で敷き詰める（styles.py）
- 設置タイプ B: 辺のセルだけ smooth_stone。最下層・最上層は「x条件 または z条件」、
  それ以外の層は「x条件 かつ z条件」（geometry/ellipse.py の ellipse_edge_cells）
- 設置タイプ C: B と同じセルに、黒/白の羊毛の市松。原点セル (0,0,0) が黒で、(lx+ly+lz) が偶数なら黒、奇数なら白
  （(0,0) のセルが楕円の外でも、市松の位相は変わらない）
- 保存データの isCircle / isFixedCenter は画面の入力補助のため、ここでは使わない
"""
from ..voxel import Voxel, ELLIPSE
from ..geometry.ellipse import ellipse_footprint, ellipse_edge_cells


def ellipse_voxels(entry):
    ox, oy, oz = entry['ox'], entry['oy'], entry['oz']
    sx, sy, sz = entry['sx'], entry['sy'], entry['sz']

    cells = ellipse_footprint(sx, sz)
    top_cells, mid_cells = ellipse_edge_cells(sx, sz)

    for ly in range(sy):
        is_top_bottom = (ly == 0 or ly == sy - 1)
        edge_cells = top_cells if is_top_bottom else mid_cells

        for (lx, lz) in cells:
            # 市松: 原点 (0,0,0) が 0（黒）。楕円のセルでなくても位相の基準になる
            yield Voxel(ox + lx, oy + ly, oz + lz, kind=ELLIPSE, edge=(lx, lz) in edge_cells,
                        checker=(lx + ly + lz) % 2)
