"""base64の建築データから .schem を生成する（コマンドライン入口）。

使い方:  python b6.py <A|B|C> [ファイル名]   ※base64は起動後に入力
処理の本体は voxel_schem パッケージにある（このファイルは入口だけ）。
"""
import os
import sys

# どのフォルダから実行しても、同じ場所の voxel_schem を見つけられるようにする
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from voxel_schem.cli import main

if __name__ == "__main__":
    main()
