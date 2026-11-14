"""base64 の保存データから .schem ファイルを書き出す。CLI とブラウザ(b6_runner)の共通の入口。"""
import os
from datetime import datetime

from .config import OUT_DIR, MC_VERSION_NAME
from .generator import generate_placements
from .loader import decode_save


def default_filename(now=None):
    """ファイル名が省略されたときの既定名（拡張子なし）"""
    return f"generated_{(now or datetime.now()).strftime('%Y%m%d_%H%M%S')}"


def export_schem(encoded_data, build_type, filename, out_dir=OUT_DIR):
    """保存データ(base64)を .schem として out_dir に保存し、書き出したファイルのパスを返す。

    保存データの不備は SaveDataError。警告（未対応typeのスキップなど）は print で出す。
    """
    import mcschematic  # 書き出し時だけ必要（ブラウザでは起動時にインストールされる）

    data = decode_save(encoded_data)
    placements, warnings = generate_placements(data['boxes'], build_type)
    for message in warnings:
        print(message)

    os.makedirs(out_dir, exist_ok=True)
    schem = mcschematic.MCSchematic()
    for pos, block in placements:
        schem.setBlock(pos, block)
    schem.save(out_dir, filename, getattr(mcschematic.Version, MC_VERSION_NAME))
    return f"{out_dir}/{filename}.schem"


def report_saved(path, build_type):
    """保存完了の表示（CLI とブラウザのログで共通）"""
    print("✅ 保存完了しました！")
    print(f"ファイル → {path}")
    print(f"設置タイプ: {build_type}")
