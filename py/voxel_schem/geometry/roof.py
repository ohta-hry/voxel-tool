"""屋根ボクセル生成（アプリのJS実装 js/logic/roof.js を移植）。"""


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
