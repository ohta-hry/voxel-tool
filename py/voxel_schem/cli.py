"""コマンドライン入口。引数の解釈と、base64 の入力受付を担当する。"""
import argparse
import os
import sys

from .errors import SaveDataError
from .export import default_filename, export_schem, report_saved


def parse_args(argv=None):
    """コマンドライン引数から設置タイプとファイル名を取得（argv が None なら sys.argv）"""
    parser = argparse.ArgumentParser(
        prog="b6.py",
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
    args = parser.parse_args(argv)

    name = (args.filename or "").strip()
    if not name:
        name = default_filename()
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


def main(argv=None):
    build_type, filename = parse_args(argv)
    encoded_data = get_data()
    try:
        path = export_schem(encoded_data, build_type, filename)
    except SaveDataError as e:
        print(f"❌ {e}")
        sys.exit(1)
    report_saved(path, build_type)
