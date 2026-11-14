"""ビルドタイプ(A/B/C)ごとのブロック選択。形状の種類には関与しない。"""
from .voxel import ROOF

BUILD_TYPES = ("A", "B", "C")  # A:敷き詰め / B:辺のみ滑石 / C:まだら辺

STONE = "minecraft:stone"
SMOOTH_STONE = "minecraft:smooth_stone"
GRAY_WOOL = "minecraft:gray_wool"
WHITE_WOOL = "minecraft:white_wool"
END_STONE = "minecraft:end_stone"


def block_for(build_type, voxel):
    """ボクセルに置くブロックIDを返す。置かない場合は None。"""
    if voxel.kind == ROOF:
        # 屋根は現在どのビルドタイプでも end_stone（将来タイプごとに変えるならここ）
        return END_STONE

    if build_type == "A":
        return STONE
    if build_type == "B":
        return SMOOTH_STONE if voxel.edge else None
    if build_type == "C":
        if not voxel.edge:
            return None
        return GRAY_WOOL if voxel.checker == 0 else WHITE_WOOL

    raise ValueError(f"未対応のビルドタイプ: {build_type!r}（{'/'.join(BUILD_TYPES)} のいずれか）")
