"""roof（屋根）: アプリと同じDDAロジックで求めたセルを、屋根(ROOF)として返す。"""
from ..voxel import Voxel, ROOF
from ..geometry.roof import compute_roof_voxels, compute_gable_voxels


def roof_voxels(roof):
    ox, oy, oz = roof['ox'], roof['oy'], roof['oz']
    sx, sy, sz = roof['sx'], roof['sy'], roof['sz']

    # roofAxisの正規化（'+x'|'-x'|'+z'|'-z'）
    raw_axis  = roof.get('roofAxis', '+x')
    if raw_axis[0] not in ('+', '-'):
        raw_axis = '+' + raw_axis
    axis = raw_axis

    gable = bool(roof.get('roofGable', False))

    voxels = compute_gable_voxels(sx, sy, sz, axis) if gable \
             else compute_roof_voxels(sx, sy, sz, axis)

    for (lx, ly, lz) in voxels:
        yield Voxel(ox + lx, oy + ly, oz + lz, kind=ROOF)
