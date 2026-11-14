"""box（直方体）の設置。"""
from ..styles import pick_block


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
