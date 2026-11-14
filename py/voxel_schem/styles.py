"""ビルドタイプ(A/B/C)ごとのブロック選択。"""


def pick_block(build_type, x, y, z, ox, oy, oz, sx, sy, sz):
    """
    座標(x,y,z)に置くブロックIDを返す。
    置かない場合は None を返す。
    """
    if build_type == "A":
        return "minecraft:stone"

    elif build_type == "B":
        on_edge = (
            (x == ox or x == ox + sx - 1) +
            (y == oy or y == oy + sy - 1) +
            (z == oz or z == oz + sz - 1)
        )
        return "minecraft:smooth_stone" if on_edge >= 2 else None

    elif build_type == "C":
        on_edge = (
            (x == ox or x == ox + sx - 1) +
            (y == oy or y == oy + sy - 1) +
            (z == oz or z == oz + sz - 1)
        )
        if on_edge < 2:
            return None
        parity = (x - ox + y - oy + z - oz) % 2
        return "minecraft:gray_wool" if parity == 0 else "minecraft:white_wool"

    return None
