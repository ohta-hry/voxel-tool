"""形状ごとの設置処理と、type フィールドによる振り分け。"""
from .box import place_box
from .cross_pillar import place_cross_pillar
from .roof import place_roof

# type 名 → 設置関数
PLACERS = {
    "box": place_box,
    "roof": place_roof,
    "cross_pillar": place_cross_pillar,
}


def process_entry(schem, entry, build_type):
    """type フィールドに応じて処理を振り分ける"""
    entry_type = entry.get("type", "box")

    placer = PLACERS.get(entry_type)
    if placer is not None:
        placer(schem, entry, build_type)
    else:
        print(f"⚠️  未対応のtype '{entry_type}' をスキップ: {entry.get('label', '(ラベルなし)')}")
