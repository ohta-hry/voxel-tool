"""入力データの読み込みと、全体の形の検証。エントリごとの検証は generator.py が行う。"""
import base64
import json

from .errors import SaveDataError


def decode_save(encoded_data):
    """base64 文字列を保存データ(dict)に戻し、全体の形を検証して返す。

    不備があれば SaveDataError（メッセージは利用者向け）。
    """
    try:
        data = json.loads(base64.b64decode(encoded_data))
    except Exception as e:
        raise SaveDataError(f"base64データの読み込みに失敗しました: {e}") from e
    return validate_save(data)


def validate_save(data):
    """保存データ全体の形（boxes が、オブジェクトの配列であること）を確認する。"""
    if not isinstance(data, dict) or not isinstance(data.get("boxes"), list):
        raise SaveDataError("保存データに boxes（配列）がありません")
    for i, entry in enumerate(data["boxes"], start=1):
        if not isinstance(entry, dict):
            raise SaveDataError(f"boxes の{i}番目がオブジェクトではありません")
    return data
