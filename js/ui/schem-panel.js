import { dom } from '../dom.js';
import { state, subscribe } from '../state.js';
import { registry } from '../registry.js';
import { getSaveCode } from '../persistence-link.js';
import { queryAll } from '../dom-utils.js';
import { createPyodideRuntime } from '../schem/pyodide-runtime.js';
import { createSchemExporter, normalizeFilename } from '../schem/export-schem.js';
import { browserPlatform } from '../schem/browser-platform.js';
import { downloadBytes } from '../schem/download.js';
import { ICON_POWER, ICON_DOWNLOAD } from '../schem/icons.js';

const MAX_LOG_LINES = 300;

/** 大ボタンの見た目。kind: 'load'（赤・電源）/ 'export'（緑・ダウンロード）
 * @type {Record<import('../types.js').PyStatus, { icon: string, label: string, disabled: boolean, kind: 'load' | 'export', hint: string }>} */
const ACTION_VIEW = {
  unloaded:   { icon: ICON_POWER,    label: '読み込み',            disabled: false, kind: 'load',   hint: '' },
  starting:   { icon: ICON_POWER,    label: 'Pyodide起動中…',      disabled: true,  kind: 'load',   hint: 'Pyodideを起動しています（初回は時間がかかります）' },
  installing: { icon: ICON_POWER,    label: 'mcschematic導入中…',  disabled: true,  kind: 'load',   hint: 'mcschematicをインストールしています' },
  ready:      { icon: ICON_DOWNLOAD, label: 'schemエクスポート',   disabled: false, kind: 'export', hint: '' },
  exporting:  { icon: ICON_DOWNLOAD, label: '出力中…',             disabled: true,  kind: 'export', hint: 'b6.py を実行しています' },
};

/**
 * 「データ」タブの schem 書き出し UI を配線する。
 *  - filled / outline / checked_wool ボタン → state.schemType（b6.py のタイプ引数）
 *  - ファイル名テキストボックス            → state.schemFilename（b6.py のファイル名引数）
 *  - 大ボタン: 未読込なら Pyodide 起動 → mcschematic インストール、読込済みなら b6.py を実行してダウンロード
 *
 * @param {{ platform?: import('../schem/pyodide-runtime.js').RuntimePlatform,
 *           download?: (fileName: string, bytes: Uint8Array) => void }} [overrides]  テスト用の差し替え
 */
export function initSchemPanel({ platform = browserPlatform, download = downloadBytes } = {}) {
  const logLines = /** @type {string[]} */ ([]);

  /** @param {string} message */
  function appendLog(message) {
    logLines.push(...String(message).split('\n'));
    if (logLines.length > MAX_LOG_LINES) logLines.splice(0, logLines.length - MAX_LOG_LINES);
    dom.dataLog.textContent = logLines.join('\n');
    dom.dataLog.scrollTop = dom.dataLog.scrollHeight;
  }

  /** @param {string} message @param {boolean} [isError] */
  function setStatusText(message, isError = false) {
    dom.dataStatus.textContent = message;
    dom.dataStatus.classList.toggle('error', isError);
  }

  const runtime = createPyodideRuntime({
    platform,
    onStatus: status => { state.pyStatus = status; },
    onLog: appendLog,
  });
  const exporter = createSchemExporter({ runtime, getPayload: getSaveCode, download, onLog: appendLog });

  // ── 設置タイプ（filled / outline / checked_wool）──
  const typeButtons = queryAll('#data-mode-toggle .seg-btn');
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.schemType = /** @type {import('../types.js').SchemType} */ (btn.dataset.schemType);
    });
  });
  function renderTypeButtons() {
    typeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.schemType === state.schemType));
  }
  subscribe('schemType', renderTypeButtons);
  renderTypeButtons();

  // ── ファイル名 ──
  dom.dataFilename.addEventListener('input', () => {
    state.schemFilename = dom.dataFilename.value;
  });

  // ── 大ボタン ──
  function renderActionButton() {
    const view = ACTION_VIEW[state.pyStatus];
    const btn = dom.btnDataAction;
    btn.dataset.kind = view.kind;
    /** @type {HTMLButtonElement} */ (btn).disabled = view.disabled;
    btn.innerHTML = `<span class="btn-icon">${view.icon}</span><span class="btn-label">${view.label}</span>`;
    if (view.hint) setStatusText(view.hint);
  }
  subscribe('pyStatus', renderActionButton);
  renderActionButton();

  async function loadRuntime() {
    try {
      await runtime.load();
      setStatusText('読み込み完了。schemエクスポートできます');
    } catch (error) {
      setStatusText('読み込みに失敗しました。もう一度押すと再試行します（詳細はログ）', true);
    }
  }

  async function exportSchem() {
    let filename;
    try {
      filename = normalizeFilename(state.schemFilename); // 使えない文字は実行前にエラーにする
    } catch (error) {
      setStatusText(/** @type {Error} */ (error).message, true);
      return;
    }
    if (registry.count === 0) {
      setStatusText('配置済みのボックスがありません', true);
      return;
    }

    state.pyStatus = 'exporting';
    try {
      const { name, size } = await exporter.exportSchem({ type: state.schemType, filename });
      setStatusText(`出力しました: ${name}（${size.toLocaleString()} bytes）`);
    } catch (error) {
      appendLog(`エラー: ${/** @type {any} */ (error)?.stack || error}`);
      setStatusText(`出力に失敗しました: ${/** @type {Error} */ (error).message}`, true);
    } finally {
      state.pyStatus = 'ready';
    }
  }

  dom.btnDataAction.addEventListener('click', () => {
    if (state.pyStatus === 'unloaded') loadRuntime();
    else if (state.pyStatus === 'ready') exportSchem();
  });

  return { runtime, exporter };
}
