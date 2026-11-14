"""形状の登録表。type 名 → 「エントリからボクセル列を返す関数」。

新しい形状を足す手順:
  1. shapes/<name>.py に、エントリ(dict)を受け取って Voxel を返す関数を作る
     （辺の定義と市松の位相は形状ごとに決める → voxel.py 参照）
  2. 下の SHAPES に1行追加する
  3. js/schem/constants.js の PYTHON_FILES にファイルを追加する
"""
from .box import box_voxels
from .cross_pillar import cross_pillar_voxels
from .roof import roof_voxels

SHAPES = {
    "box": box_voxels,
    "roof": roof_voxels,
    "cross_pillar": cross_pillar_voxels,
}
