"""保存データのエントリ列から、設置するブロックの列を作る（ファイルには触れない純粋な処理）。"""
from .shapes import SHAPES
from .styles import BUILD_TYPES, block_for


def generate_placements(entries, build_type):
    """エントリ列とビルドタイプから、設置内容を返す。

    戻り値: (placements, warnings)
      placements: [((x, y, z), "minecraft:..."), ...]  設置する順。同じ座標は後のものが勝つ
      warnings:   スキップしたエントリなどの警告メッセージ
    """
    if build_type not in BUILD_TYPES:
        raise ValueError(f"未対応のビルドタイプ: {build_type!r}（{'/'.join(BUILD_TYPES)} のいずれか）")

    placements = []
    warnings = []
    for entry in entries:
        entry_type = entry.get("type", "box")
        voxels_of = SHAPES.get(entry_type)
        if voxels_of is None:
            warnings.append(f"⚠️  未対応のtype '{entry_type}' をスキップ: {entry.get('label', '(ラベルなし)')}")
            continue
        for voxel in voxels_of(entry):
            block = block_for(build_type, voxel)
            if block:
                placements.append(((voxel.x, voxel.y, voxel.z), block))
    return placements, warnings
