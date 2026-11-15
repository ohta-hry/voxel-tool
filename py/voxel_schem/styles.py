"""ビルドタイプ(A/B/C)ごとのブロック選択。形状の種類には関与しない。"""
from .voxel import ROOF, PILLAR, ELLIPSE

BUILD_TYPES = ("A", "B", "C")  # A:敷き詰め / B:辺のみ滑石 / C:まだら辺

STONE = "minecraft:stone"
SMOOTH_STONE = "minecraft:smooth_stone"
GRAY_WOOL = "minecraft:gray_wool"
BLACK_WOOL = "minecraft:black_wool"
WHITE_WOOL = "minecraft:white_wool"
END_STONE = "minecraft:end_stone"
POLISHED_BASALT = "minecraft:polished_basalt"
ANDESITE = "minecraft:andesite"

# ピラーを、向き付きの polished_basalt で置く設置タイプ（C は躯体と同じ規則）
PILLAR_BASALT_BUILD_TYPES = ("A", "B")


def block_for(build_type, voxel):
    """ボクセルに置くブロックIDを返す。置かない場合は None。"""
    if voxel.kind == ROOF:
        # 屋根は現在どのビルドタイプでも end_stone（将来タイプごとに変えるならここ）
        return END_STONE

    if voxel.kind == PILLAR and build_type in PILLAR_BASALT_BUILD_TYPES:
        return f"{POLISHED_BASALT}[axis={voxel.axis}]"

    if build_type == "A":
        return ANDESITE if voxel.kind == ELLIPSE else STONE
    if build_type == "B":
        return SMOOTH_STONE if voxel.edge else None
    if build_type == "C":
        if not voxel.edge:
            return None
        # 楕円は黒/白の市松（原点 (0,0,0) が黒の前提）。それ以外は gray/white
        first = BLACK_WOOL if voxel.kind == ELLIPSE else GRAY_WOOL
        return first if voxel.checker == 0 else WHITE_WOOL

    raise ValueError(f"未対応のビルドタイプ: {build_type!r}（{'/'.join(BUILD_TYPES)} のいずれか）")
