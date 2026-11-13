"""b6.py をブラウザ (Pyodide) 上で、コマンドライン実行と同じ形で動かすための薄いラッパー。

b6.py 自体は書き換えない。次の2点だけ差し替えて `__main__` として実行する。
  - sys.argv : ["b6.py", タイプ(A/B/C), (任意) ファイル名]
  - input()  : アプリのシーンデータ (base64) を返す
出力は b6.py の仕様どおり、作業ディレクトリ直下の myschems/<ファイル名>.schem になる。
"""
import builtins
import json
import os
import runpy
import shutil
import sys
import traceback

OUT_DIR = "myschems"  # b6.py が保存先にしている相対パス（b6.py 側と一致させる）


def run(script_path, argv_json, payload, work_dir):
    """b6.py を実行して終了コードを返す（0 = 成功）。

    script_path : b6.py のパス
    argv_json   : コマンドライン引数（b6.py 自身の名前を除く）の JSON 配列
    payload     : input() の代わりに返す base64 文字列
    work_dir    : 作業ディレクトリ（この直下に myschems/ ができる）
    """
    argv = json.loads(argv_json)

    os.chdir(work_dir)
    # 前回の出力が混ざらないよう、毎回空にしてから実行する
    shutil.rmtree(OUT_DIR, ignore_errors=True)
    os.makedirs(OUT_DIR, exist_ok=True)

    calls = {"n": 0}

    def fake_input(prompt=""):
        calls["n"] += 1
        if calls["n"] > 1:  # 空入力などで b6 の入力ループが回り続けるのを防ぐ
            raise EOFError("input() が2回以上呼ばれました")
        print("（アプリのシーンデータを入力として渡しました）")
        return payload

    saved_input, saved_argv = builtins.input, sys.argv
    builtins.input = fake_input
    sys.argv = [script_path, *argv]
    try:
        runpy.run_path(script_path, run_name="__main__")
        return 0
    except SystemExit as e:
        # argparse のエラー(2) や b6.py の sys.exit(1) など
        if e.code is None:
            return 0
        if isinstance(e.code, int):
            return e.code
        print(e.code, file=sys.stderr)
        return 1
    except Exception:
        # 想定外の例外（入力ループ防止の EOFError など）も例外のまま外へ漏らさず、
        # トレースバックをログに出して失敗(1)として返す
        traceback.print_exc()
        return 1
    finally:
        builtins.input, sys.argv = saved_input, saved_argv
