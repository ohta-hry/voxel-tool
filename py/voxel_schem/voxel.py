"""形状とビルドタイプ(A/B/C)の受け渡しに使う、1ブロック分の情報。

形状は「どこに・どんな性質のボクセルがあるか」だけを返し、
ビルドタイプ(styles.py)は「その性質からどのブロックを置くか」だけを決める。
新しい形状を足すときは、形状側で次の3つを決めて Voxel を返せばよい。
"""
from typing import NamedTuple

# kind: ボクセルの種類
BODY = "body"   # 躯体。ビルドタイプ(A/B/C)によって置き方が変わる
ROOF = "roof"   # 屋根。ビルドタイプによらず同じブロック


class Voxel(NamedTuple):
    x: int                 # ワールド座標
    y: int
    z: int
    kind: str = BODY       # BODY または ROOF
    edge: bool = False     # 「辺」として扱うか（B/C は辺だけを置く。A は辺でなくても置く）
                           #   辺の定義は形状ごとに異なる（箱と十字柱で別定義）
    checker: int = 0       # 市松の色。C では 0 = gray_wool / 1 = white_wool
                           #   位相は形状ごとに決める（箱と十字柱は逆位相）
