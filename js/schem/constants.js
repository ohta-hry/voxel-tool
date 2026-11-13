// Pyodide / b6.py まわりの定数

// Pyodide のバージョンは固定（動作確認済みのものを使う）
export const PYODIDE_VERSION = '0.29.3';
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const PYODIDE_SCRIPT_URL = `${PYODIDE_INDEX_URL}pyodide.js`;

// Pyodide 内の仮想ファイルシステム上の場所
export const WORK_DIR = '/home/pyodide';          // b6.py の作業ディレクトリ
export const SCRIPT_DIR = `${WORK_DIR}/py`;       // b6.py / b6_runner.py を置く場所
export const OUT_DIR = `${WORK_DIR}/myschems`;    // b6.py の保存先（b6.py 内の "myschems" と一致させる）

export const B6_FILE = 'b6.py';
export const RUNNER_MODULE = 'b6_runner';
export const RUNNER_FILE = `${RUNNER_MODULE}.py`;
export const PYTHON_FILES = [B6_FILE, RUNNER_FILE];

export const SCHEM_EXT = '.schem';

// 画面のボタン名 → b6.py の設置タイプ引数
export const SCHEM_TYPES = Object.freeze({
  filled: 'A',        // 敷き詰め
  outline: 'B',       // 辺のみ滑石
  checked_wool: 'C',  // まだら辺
});
export const DEFAULT_SCHEM_TYPE = 'filled';
