"""入力データの読み込み。"""
import base64
import json


def decode_save(encoded_data):
    """base64 文字列を保存データ(dict)に戻す。失敗時は例外をそのまま投げる。"""
    decoded = base64.b64decode(encoded_data)
    return json.loads(decoded)
