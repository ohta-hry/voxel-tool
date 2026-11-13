import { WORK_DIR, SCRIPT_DIR, OUT_DIR, B6_FILE, RUNNER_MODULE, PYTHON_FILES, SCHEM_EXT } from './constants.js';

/**
 * @typedef {any} PyodideInterface  Pyodide 本体（CDN から読み込む）
 * @typedef {'unloaded'|'starting'|'installing'|'ready'} RuntimeStatus
 *
 * @typedef {Object} RuntimePlatform  実行環境ごとの差（ブラウザ/テスト）を吸収する
 * @property {() => Promise<PyodideInterface>} loadPyodide  Pyodide を起動して返す
 * @property {(fileName: string) => Promise<string>} fetchPythonSource  py/ 配下の .py の中身を返す
 *
 * @typedef {Object} B6Result
 * @property {number} exitCode  0 = 成功
 * @property {{ name: string, bytes: Uint8Array }[]} files  生成された .schem
 */

/**
 * Pyodide の起動 → mcschematic のインストール → b6.py の実行、を担当する。
 * 共有状態には触れず、状態変化は onStatus / onLog で通知する（UI側が受け取る）。
 *
 * @param {{ platform: RuntimePlatform,
 *           onStatus?: (status: RuntimeStatus) => void,
 *           onLog?: (message: string) => void }} deps
 */
export function createPyodideRuntime({ platform, onStatus = () => {}, onLog = () => {} }) {
  /** @type {PyodideInterface | null} */
  let pyodide = null;
  let ready = false;
  /** @type {Promise<void> | null} */
  let loading = null;

  /** Pyodide本体を起動する（起動済みなら何もしない） */
  async function startPyodide() {
    if (pyodide) return;
    onStatus('starting');
    onLog('Pyodideを読み込んでいます...');
    const py = await platform.loadPyodide();
    py.setStdout({ batched: (/** @type {string} */ line) => onLog(line) });
    py.setStderr({ batched: (/** @type {string} */ line) => onLog(line) });
    onLog(`Pyodide起動成功: ${py.version}`);
    onLog(`Python: ${py.runPython('import sys; sys.version')}`);
    pyodide = py;
  }

  /** mcschematic を PyPI からインストールし、import できることまで確認する */
  async function installMcschematic() {
    onStatus('installing');
    onLog('micropipを読み込んでいます...');
    await pyodide.loadPackage('micropip');
    onLog('PyPIからmcschematicをインストールしています...');
    await pyodide.runPythonAsync('import micropip\nawait micropip.install("mcschematic")');
    const version = pyodide.runPython('import mcschematic\ngetattr(mcschematic, "__version__", "version情報なし")');
    onLog(`mcschematicのimport成功: ${version}`);
  }

  /** b6.py と実行ラッパーを仮想ファイルシステムに置く */
  async function installPythonFiles() {
    onLog('b6.py を配置しています...');
    pyodide.FS.mkdirTree(SCRIPT_DIR);
    for (const fileName of PYTHON_FILES) {
      const source = await platform.fetchPythonSource(fileName);
      pyodide.FS.writeFile(`${SCRIPT_DIR}/${fileName}`, source);
    }
    pyodide.runPython(`import sys\nif "${SCRIPT_DIR}" not in sys.path:\n    sys.path.insert(0, "${SCRIPT_DIR}")`);
  }

  /**
   * 「Pyodide起動」→「mcschematicインストール」を続けて実行する。
   * 途中で失敗しても、再度呼べば続きから（起動済みならインストールから）やり直す。
   */
  function load() {
    if (ready) return Promise.resolve();
    if (loading) return loading;
    loading = (async () => {
      try {
        await startPyodide();
        await installMcschematic();
        await installPythonFiles();
        ready = true;
        onStatus('ready');
      } catch (error) {
        onLog(`読み込みに失敗しました:\n${/** @type {any} */ (error)?.stack || error}`);
        onStatus('unloaded');
        throw error;
      } finally {
        loading = null;
      }
    })();
    return loading;
  }

  /**
   * b6.py を実行し、生成された .schem を回収する。回収後は仮想ファイルを削除する。
   * @param {string[]} argv  コマンドライン引数（例: ['A', 'my_name']）
   * @param {string} payload  input() の代わりに渡す base64 文字列
   * @returns {Promise<B6Result>}
   */
  async function runB6(argv, payload) {
    if (!ready) throw new Error('Pyodide が読み込まれていません');
    const runner = pyodide.pyimport(RUNNER_MODULE);
    /** @type {number} */
    let exitCode;
    try {
      exitCode = runner.run(`${SCRIPT_DIR}/${B6_FILE}`, JSON.stringify(argv), payload, WORK_DIR);
    } finally {
      runner.destroy();
    }

    /** @type {B6Result['files']} */
    const files = [];
    /** @type {string[]} */
    let names = [];
    try {
      names = pyodide.FS.readdir(OUT_DIR).filter((/** @type {string} */ n) => n.endsWith(SCHEM_EXT));
    } catch (e) { /* 出力ディレクトリが無い = 何も生成されなかった */ }
    for (const name of names) {
      const path = `${OUT_DIR}/${name}`;
      files.push({ name, bytes: pyodide.FS.readFile(path) });
      pyodide.FS.unlink(path); // 回収したら消す（仮想FSに溜めない）
    }
    return { exitCode, files };
  }

  return { load, runB6, isReady: () => ready };
}
