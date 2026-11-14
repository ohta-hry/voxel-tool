"""roof（屋根）: アプリと同じDDAロジックで求めたセルを、屋根(ROOF)として返す。"""
from ..voxel import Voxel, ROOF
from ..geometry.roof import compute_roof_voxels, compute_gable_voxels, normalize_roof_axis


def roof_voxels(roof):
    ox, oy, oz = roof['ox'], roof['oy'], roof['oz']
    sx, sy, sz = roof['sx'], roof['sy'], roof['sz']

    axis = normalize_roof_axis(roof.get('roofAxis'))

    gable = bool(roof.get('roofGable', False))

    voxels = compute_gable_voxels(sx, sy, sz, axis) if gable \
             else compute_roof_voxels(sx, sy, sz, axis)

    for (lx, ly, lz) in voxels:
        yield Voxel(ox + lx, oy + ly, oz + lz, kind=ROOF)
