"""角欠け直方体(cross_pillar)のセル集合の計算。"""


def get_cross_pillar_cells(sx, sz):
    """
    cross_pillarのfootprintセル集合を返す。
    sx<=2 or sz<=2 の場合は角欠けなし（全セル）。
    戻り値: set of (lx, lz)
    """
    if sx <= 2 or sz <= 2:
        return {(lx, lz) for lx in range(sx) for lz in range(sz)}
    excluded = {(0, 0), (sx-1, 0), (0, sz-1), (sx-1, sz-1)}
    return {(lx, lz) for lx in range(sx) for lz in range(sz)
            if (lx, lz) not in excluded}


def get_cross_pillar_top_cells(sx, sz):
    """
    上下面の設置セル集合。
      - 外周（角欠け）: on_border かつ not corner
      - 内周の4角: lx が 1 か sx-2、かつ lz が 1 か sz-2
    5×5例:
      □■■■□
      ■■□■■
      ■□□□■
      ■■□■■
      □■■■□
    """
    cells = set()
    for lx in range(sx):
        for lz in range(sz):
            is_corner  = (lx == 0 or lx == sx-1) and (lz == 0 or lz == sz-1)
            on_border  = (lx == 0 or lx == sx-1 or lz == 0 or lz == sz-1)
            inner_corn = (lx == 1 or lx == sx-2) and (lz == 1 or lz == sz-2)
            if (on_border and not is_corner) or inner_corn:
                cells.add((lx, lz))
    return cells


def get_cross_pillar_mid_cells(sx, sz):
    """
    中間面の設置セル集合。
    外周辺の「端のみ」= 角の隣セル（辺の中央を除く）。
    5×5例:
      □■□■□
      ■□□□■
      □□□□□
      ■□□□■
      □■□■□
    """
    cells = set()
    for lx in range(sx):
        for lz in range(sz):
            # X辺上（lz==0 or lz==sz-1）かつ lx が角隣（1 or sx-2）
            on_z_edge = (lz == 0 or lz == sz-1) and (lx == 1 or lx == sx-2)
            # Z辺上（lx==0 or lx==sx-1）かつ lz が角隣（1 or sz-2）
            on_x_edge = (lx == 0 or lx == sx-1) and (lz == 1 or lz == sz-2)
            if on_z_edge or on_x_edge:
                cells.add((lx, lz))
    return cells
