"""cross_pillar（十字柱）の設置。"""
from ..geometry.cross_pillar import (
    get_cross_pillar_cells,
    get_cross_pillar_top_cells,
    get_cross_pillar_mid_cells,
)


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
