"""形状とビルドタイプ(A/B/C)の受け渡しに使う、1ブロック分の情報。

形状は「どこに・どんな性質のボクセルがあるか」だけを返し、
ビルドタイプ(styles.py)は「その性質からどのブロックを置くか」だけを決める。
新しい形状を足すときは、形状側で次の3つを決めて Voxel を返せばよい。
"""
from typing import NamedTuple, Optional

# kind: ボクセルの種類
BODY = "body"   # 躯体。ビルドタイプ(A/B/C)によって置き方が変わる
ROOF = "roof"   # 屋根。ビルドタイプによらず同じブロック
PILLAR = "pillar"  # ピラー。A/B は軸(axis)付きの polished_basalt、C は躯体と同じ規則


class Voxel(NamedTuple):
    x: int                 # ワールド座標
    y: int
    z: int
    kind: str = BODY       # BODY または ROOF
    edge: bool = False     # 「辺」として扱うか（B/C は辺だけを置く。A は辺でなくても置く）
                           #   辺の定義は形状ごとに異なる（箱と角欠け直方体で別定義）
    checker: int = 0       # 市松の色。C では 0 = gray_wool / 1 = white_wool
                           #   位相は形状ごとに決める（箱と角欠け直方体は逆位相）
    axis: Optional[str] = None  # 'x'|'y'|'z'。向きを持つブロック（ピラー）だけが指定する
