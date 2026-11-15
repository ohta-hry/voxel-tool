"""形状の登録表。type 名 → 「エントリからボクセル列を返す関数」。

新しい形状を足す手順:
  1. shapes/<name>.py に、エントリ(dict)を受け取って Voxel を返す関数を作る
     （辺の定義と市松の位相は形状ごとに決める → voxel.py 参照）
  2. 下の SHAPES に1行追加する
  3. python tools/make_py_manifest.py で py/manifest.json を更新する（ブラウザへ配置するファイル一覧）
"""
from .box import box_voxels
from .cross_pillar import cross_pillar_voxels
from .roof import roof_voxels
from .pillar import pillar_voxels
from .ellipse import ellipse_voxels

SHAPES = {
    "box": box_voxels,
    "roof": roof_voxels,
    "cross_pillar": cross_pillar_voxels,
    "pillar": pillar_voxels,
    "ellipse": ellipse_voxels,
}
