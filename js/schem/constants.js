// Pyodide / b6.py まわりの定数

// Pyodide のバージョンは固定（動作確認済みのものを使う）
export const PYODIDE_VERSION = '0.29.3';
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const PYODIDE_SCRIPT_URL = `${PYODIDE_INDEX_URL}pyodide.js`;

// Pyodide 内の仮想ファイルシステム上の場所
export const WORK_DIR = '/home/pyodide';          // 作業ディレクトリ
export const SCRIPT_DIR = `${WORK_DIR}/py`;       // py/ の中身（b6.py / b6_runner.py / voxel_schem/）を置く場所
export const OUT_DIR = `${WORK_DIR}/myschems`;    // .schem の出力先。b6_runner.run に渡す（Python側に同じ値を持たせない）

// 配置する Python ファイルの一覧は py/manifest.json から読む。
// Python ファイルを増減したら python tools/make_py_manifest.py で更新する（tests/test_manifest.py が古さを検出する）
export const MANIFEST_FILE = 'manifest.json';
export const RUNNER_MODULE = 'b6_runner';

export const SCHEM_EXT = '.schem';

// 画面のボタン名 → 設置タイプ引数（py/voxel_schem/styles.py の BUILD_TYPES）
export const SCHEM_TYPES = Object.freeze({
  filled: 'A',        // 敷き詰め
  outline: 'B',       // 辺のみ滑石
  checked_wool: 'C',  // まだら辺
});
export const DEFAULT_SCHEM_TYPE = 'filled';
