"""py/manifest.json（ブラウザ(Pyodide)へ配置する .py の一覧）を生成する。

Pythonファイルを追加・削除・改名したら、リポジトリ直下で次を実行する:

    python tools/make_py_manifest.py

一覧が古いかどうかの確認だけなら --check（古ければ終了コード1）。
tests/test_manifest.py も同じ確認をするので、実行し忘れてもテストで気づける。
"""
import json
import sys
from pathlib import Path

PY_DIR = Path(__file__).resolve().parents[1] / "py"
MANIFEST_PATH = PY_DIR / "manifest.json"


def build_manifest():
    """py/ 配下の .py（py/ からの相対パス）を並べた、manifest.json の内容(文字列)を返す。"""
    files = sorted(
        p.relative_to(PY_DIR).as_posix()
        for p in PY_DIR.rglob("*.py")
        if "__pycache__" not in p.parts
    )
    return json.dumps({"files": files}, ensure_ascii=False, indent=2) + "\n"


def main(argv):
    expected = build_manifest()
    current = MANIFEST_PATH.read_text(encoding="utf-8") if MANIFEST_PATH.exists() else None
    if "--check" in argv:
        if current == expected:
            print("manifest.json は最新です")
            return 0
        print("manifest.json が古い、または存在しません。python tools/make_py_manifest.py を実行してください")
        return 1
    MANIFEST_PATH.write_text(expected, encoding="utf-8", newline="\n")
    print(f"{MANIFEST_PATH} を更新しました（{len(json.loads(expected)['files'])}ファイル）")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
