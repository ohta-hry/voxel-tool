"""cross_pillar（十字柱）: footprint 全セル×全高さを返し、辺は上下面/中間面で別定義。

  上下面（ly==0 / ly==sy-1）の辺 → get_cross_pillar_top_cells（中央が空洞）
  中間面（それ以外）の辺        → get_cross_pillar_mid_cells
"""
from ..voxel import Voxel
from ..geometry.cross_pillar import (
    get_cross_pillar_cells,
    get_cross_pillar_top_cells,
    get_cross_pillar_mid_cells,
)


def cross_pillar_voxels(box):
    ox, oy, oz = box['ox'], box['oy'], box['oz']
    sx, sy, sz = box['sx'], box['sy'], box['sz']

    cell_set  = get_cross_pillar_cells(sx, sz)
    top_cells = get_cross_pillar_top_cells(sx, sz)
    mid_cells = get_cross_pillar_mid_cells(sx, sz)

    for ly in range(sy):
        is_top_bottom = (ly == 0 or ly == sy - 1)
        edge_cells = top_cells if is_top_bottom else mid_cells

        for (lx, lz) in cell_set:
            # 市松: 偶数 → 1(white)。箱とは逆位相（意図した仕様）
            checker = (lx + ly + lz + 1) % 2
            yield Voxel(ox + lx, oy + ly, oz + lz,
                        edge=(lx, lz) in edge_cells, checker=checker)
