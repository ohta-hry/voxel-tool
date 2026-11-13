import { SCHEM_TYPES, SCHEM_EXT } from './constants.js';

/**
 * 画面で入力したファイル名を b6.py に渡す形に整える。
 *  - 前後の空白と、末尾の ".schem"（b6.py は拡張子不要。付けると .schem.schem になる）を取り除く
 *  - ファイル名に使えない文字が含まれていたらエラー
 * @param {string} raw
 * @returns {string} 空文字なら「省略」（b6.py が日時付きの名前を付ける）
 */
export function normalizeFilename(raw) {
  let name = (raw ?? '').trim();
  if (name.toLowerCase().endsWith(SCHEM_EXT)) name = name.slice(0, -SCHEM_EXT.length).trim();
  if (!name) return '';
  if (/[\\/:*?"<>|\u0000-\u001f]/.test(name) || name === '.' || name === '..') {
    throw new Error('ファイル名に使えない文字が含まれています（\\ / : * ? " < > |）');
  }
  return name;
}

/** 画面のボタン名とファイル名から、b6.py のコマンドライン引数を作る
 * @param {string} type  'filled' | 'outline' | 'checked_wool'
 * @param {string} filename
 * @returns {string[]} 例: ['A', 'my_name']（ファイル名が空なら ['A']） */
export function buildB6Args(type, filename) {
  const typeArg = /** @type {Record<string, string>} */ (SCHEM_TYPES)[type];
  if (!typeArg) throw new Error(`未対応のタイプです: ${type}`);
  const name = normalizeFilename(filename);
  return name ? [typeArg, name] : [typeArg];
}

/**
 * b6.py を実行して .schem を作り、ダウンロードさせる。
 * @param {{ runtime: ReturnType<typeof import('./pyodide-runtime.js').createPyodideRuntime>,
 *           getPayload: () => string,
 *           download: (fileName: string, bytes: Uint8Array) => void,
 *           onLog?: (message: string) => void }} deps
 */
export function createSchemExporter({ runtime, getPayload, download, onLog = () => {} }) {
  /**
   * @param {{ type: string, filename: string }} options
   * @returns {Promise<{ name: string, size: number }>}
   */
  async function exportSchem({ type, filename }) {
    const argv = buildB6Args(type, filename);
    const payload = getPayload();
    onLog(`b6.py ${argv.join(' ')} を実行します`);

    const { exitCode, files } = await runtime.runB6(argv, payload);
    if (exitCode !== 0) throw new Error(`b6.py が失敗しました（終了コード ${exitCode}）。ログを確認してください`);
    if (files.length === 0) throw new Error('.schem が生成されませんでした');
    if (files.length > 1) onLog(`⚠️ .schem が${files.length}個できました。最初の1つだけダウンロードします`);

    const { name, bytes } = files[0];
    download(name, bytes);
    onLog(`ダウンロードを開始しました: ${name}（${bytes.length.toLocaleString()} bytes）`);
    return { name, size: bytes.length };
  }

  return { exportSchem };
}
