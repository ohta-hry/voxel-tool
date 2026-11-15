"""楕円(ellipse)のセル計算。アプリのJS実装 js/logic/ellipse.js と同じ結果になること
（tests/fixtures/ellipse_cases.json を Python と JS の両方が確認する）。

座標はすべて「原点からのローカルセル座標 (lx, lz)」。セル(lx, lz)の中心は (lx+0.5, lz+0.5)、
楕円の中心は (sx/2, sz/2)、半軸は (sx/2, sz/2)。計算は整数だけで行う（小数の誤差を避けるため、
中心・座標を2倍した値で比べる）。
"""


def ellipse_footprint(sx, sz):
    """楕円に含まれるセルの集合 {(lx, lz)}。

    セルの中心が楕円の内側または境界上（((x-cx)/a)^2 + ((z-cz)/b)^2 <= 1）にあるセル。
    例: 5×5 は四隅を除いた21セル、3×3 以下は欠けなしの全セル。
    """
    cells = set()
    for lx in range(sx):
        dx = 2 * lx + 1 - sx            # 2*(セル中心 - 楕円中心)
        for lz in range(sz):
            dz = 2 * lz + 1 - sz
            if dx * dx * sz * sz + dz * dz * sx * sx <= sx * sx * sz * sz:
                cells.add((lx, lz))
    return cells


def _axis_condition(cell, cells, axis, size):
    """軸ごとの条件。

    - セル中心が楕円の中心と同じか、より大きい側(中心 <= 座標): 軸方向に +1 のセルが存在しない
    - セル中心が楕円の中心と同じか、より小さい側(座標 <= 中心): 軸方向に -1 のセルが存在しない
    ちょうど中心と等しいとき（奇数サイズの中央）は、両方を満たす必要がある。
    """
    lx, lz = cell
    coord = lx if axis == 0 else lz
    twice = 2 * coord + 1               # 2*セル中心
    plus = (lx + 1, lz) if axis == 0 else (lx, lz + 1)
    minus = (lx - 1, lz) if axis == 0 else (lx, lz - 1)
    if size <= twice and plus in cells:
        return False
    if twice <= size and minus in cells:
        return False
    return True


def ellipse_edge_cells(sx, sz):
    """設置タイプ B で置くセルを (top_cells, mid_cells) で返す。

    - top_cells: 最下層・最上層（y が最小/最大）。x 条件 または z 条件を満たすセル（外周の輪）
    - mid_cells: それ以外の層。x 条件 かつ z 条件を満たすセル（外周の折れ角に立つ柱）
    """
    cells = ellipse_footprint(sx, sz)
    top, mid = set(), set()
    for cell in cells:
        x_ok = _axis_condition(cell, cells, 0, sx)
        z_ok = _axis_condition(cell, cells, 1, sz)
        if x_ok or z_ok:
            top.add(cell)
        if x_ok and z_ok:
            mid.add(cell)
    return top, mid
