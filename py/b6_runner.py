"""ブラウザ (Pyodide) から .schem 書き出しを呼ぶための薄い入口。

コマンドラインと同じ引数の解釈(cli.parse_args)と書き出し(export.export_schem)を、
関数として直接呼ぶ。入力は引数で受け取るので、input() や sys.argv の差し替えは不要。
出力は out_dir（JS側が指定）の直下に <ファイル名>.schem として作られる。
"""
import json
import os
import shutil
import sys
import traceback

from voxel_schem.cli import parse_args
from voxel_schem.errors import SaveDataError
from voxel_schem.export import export_schem, report_saved


def run(argv_json, payload, out_dir):
    """書き出しを実行して終了コードを返す（0 = 成功）。

    argv_json : コマンドライン引数（プログラム名を除く）の JSON 配列。例: '["A", "name"]'
    payload   : アプリのシーンデータ (base64 文字列)
    out_dir   : 出力先フォルダ（絶対パス）。毎回空にしてから使う
    """
    argv = json.loads(argv_json)

    # 前回の出力が混ざらないよう、毎回空にしてから実行する
    shutil.rmtree(out_dir, ignore_errors=True)
    os.makedirs(out_dir, exist_ok=True)

    try:
        build_type, filename = parse_args(argv)
        print("（アプリのシーンデータを入力として渡しました）")
        path = export_schem(payload, build_type, filename, out_dir)
    except SystemExit as e:
        # argparse の引数エラー(2) など
        if e.code is None:
            return 0
        if isinstance(e.code, int):
            return e.code
        print(e.code, file=sys.stderr)
        return 1
    except SaveDataError as e:
        print(f"❌ {e}")
        return 1
    except Exception:
        # 想定外の例外も外へ漏らさず、トレースバックをログに出して失敗(1)として返す
        traceback.print_exc()
        return 1

    report_saved(path, build_type)
    return 0
