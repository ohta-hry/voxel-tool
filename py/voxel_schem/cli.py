"""コマンドライン入口。引数の解釈・入力の受け取り・.schem の保存を担当する。"""
import argparse
import sys
import os
import mcschematic
from datetime import datetime

from .config import OUT_DIR, MC_VERSION_NAME
from .loader import decode_save
from .generator import generate_placements


def parse_args():
    """コマンドライン引数から設置タイプとファイル名を取得"""
    parser = argparse.ArgumentParser(
        description="base64の建築データから .schem を生成します（base64は起動後に入力）"
    )
    parser.add_argument(
        "type", type=str.upper, choices=["A", "B", "C"],
        help="設置タイプ (A:敷き詰め / B:辺のみ滑石 / C:まだら辺)"
    )
    parser.add_argument(
        "filename", nargs="?", default=None,
        help="出力ファイル名（拡張子不要。省略でデフォルト名）"
    )
    args = parser.parse_args()

    name = (args.filename or "").strip()
    if not name:
        name = f"generated_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    return args.type, name


def get_data():
    """実行中に base64 文字列（またはそれが書かれたファイルのパス）を入力させる"""
    while True:
        text = input("base64データを貼り付けてEnter（ファイルパスも可）: ").strip()
        if not text:
            print("❌ 入力が空です。もう一度入力してください。")
            continue
        if os.path.isfile(text):
            with open(text, 'r', encoding='utf-8') as f:
                return f.read().strip()
        return text


def main():
    build_type, filename = parse_args()

    encoded_data = get_data()
    try:
        data = decode_save(encoded_data)
    except Exception as e:
        print(f"❌ base64データの読み込みに失敗しました: {e}")
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)
    schem = mcschematic.MCSchematic()

    placements, warnings = generate_placements(data['boxes'], build_type)
    for message in warnings:
        print(message)
    for pos, block in placements:
        schem.setBlock(pos, block)

    schem.save(OUT_DIR, filename, getattr(mcschematic.Version, MC_VERSION_NAME))

    print(f"✅ 保存完了しました！")
    print(f"ファイル → {OUT_DIR}/{filename}.schem")
    print(f"設置タイプ: {build_type}")
