"""アプリの保存データ(base64)から Minecraft の .schem を生成するパッケージ。

構成（段階1: b6.py の中身を責務ごとのファイルに移しただけで、処理内容は変えていない）
  cli.py        コマンドライン入口（引数・入力・保存）
  loader.py     base64 の保存データを dict に戻す
  config.py     出力先・Minecraftバージョンなどの設定値
  styles.py     ビルドタイプ(A/B/C)ごとのブロック選択（箱用）
  geometry/     形状ごとの座標計算（屋根・十字柱）
  shapes/       形状ごとの設置処理と、typeによる振り分け
"""
