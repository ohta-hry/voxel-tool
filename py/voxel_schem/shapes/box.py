"""box（直方体）: 全セルを返し、辺は『3軸のうち2軸以上で端に接するセル』。"""
from ..voxel import Voxel


def box_voxels(box):
    ox, oy, oz = box['ox'], box['oy'], box['oz']
    sx, sy, sz = box['sx'], box['sy'], box['sz']

    for y in range(oy, oy + sy):
        for z in range(oz, oz + sz):
            for x in range(ox, ox + sx):
                on_edge = (
                    (x == ox or x == ox + sx - 1) +
                    (y == oy or y == oy + sy - 1) +
                    (z == oz or z == oz + sz - 1)
                )
                # 市松: 原点セルが偶数 → 0(gray)。角欠け直方体とは逆位相（意図した仕様）
                parity = (x - ox + y - oy + z - oz) % 2
                yield Voxel(x, y, z, edge=on_edge >= 2, checker=parity)
