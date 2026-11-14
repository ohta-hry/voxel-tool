"""ピラーの向き。アプリのJS実装 js/logic/pillar.js と同じ規則。"""

PILLAR_AXES = ('x', 'y', 'z')


def normalize_pillar_axis(value, fallback='y'):
    """pillarAxis を 'x'|'y'|'z' に正規化する。空・不正な値は fallback（縦向き）。"""
    return value if isinstance(value, str) and value in PILLAR_AXES else fallback
