"""保存データのエントリ列から、設置するブロックの列を作る（ファイルには触れない純粋な処理）。"""
from .errors import SaveDataError
from .shapes import SHAPES
from .styles import BUILD_TYPES, block_for

# 全形状に共通の必須項目（原点とサイズ）。整数であること
GEOMETRY_KEYS = ("ox", "oy", "oz", "sx", "sy", "sz")


def _require_int_fields(entry, keys):
    for key in keys:
        if key not in entry:
            raise SaveDataError(f"'{key}' がありません")
        value = entry[key]
        if isinstance(value, bool) or not isinstance(value, int):
            raise SaveDataError(f"'{key}' が整数ではありません（値: {value!r}）")


def generate_placements(entries, build_type):
    """エントリ列とビルドタイプから、設置内容を返す。

    戻り値: (placements, warnings)
      placements: [((x, y, z), "minecraft:..."), ...]  設置する順。同じ座標は後のものが勝つ
      warnings:   スキップしたエントリなどの警告メッセージ

    保存データの不備（必須項目の欠落など）は SaveDataError（何番目のエントリかをメッセージに含む）。
    """
    if build_type not in BUILD_TYPES:
        raise ValueError(f"未対応のビルドタイプ: {build_type!r}（{'/'.join(BUILD_TYPES)} のいずれか）")

    placements = []
    warnings = []
    for index, entry in enumerate(entries, start=1):
        entry_type = entry.get("type", "box")
        voxels_of = SHAPES.get(entry_type)
        if voxels_of is None:
            warnings.append(f"⚠️  未対応のtype '{entry_type}' をスキップ: {entry.get('label', '(ラベルなし)')}")
            continue
        try:
            _require_int_fields(entry, GEOMETRY_KEYS)
        except SaveDataError as e:
            raise SaveDataError(f"エントリ{index}（{entry.get('label', 'ラベルなし')}）: {e}") from None
        for voxel in voxels_of(entry):
            block = block_for(build_type, voxel)
            if block:
                placements.append(((voxel.x, voxel.y, voxel.z), block))
    return placements, warnings
