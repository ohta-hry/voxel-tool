import { PYODIDE_SCRIPT_URL, PYODIDE_INDEX_URL } from './constants.js';

/** @param {string} src */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(undefined);
    script.onerror = () => reject(new Error(`スクリプトを読み込めません: ${src}`));
    document.head.appendChild(script);
  });
}

/** ブラウザ用: CDN の pyodide.js を必要になった時点で読み込み、Pyodide を起動する */
export async function loadPyodideFromCdn() {
  const g = /** @type {any} */ (globalThis);
  if (typeof g.loadPyodide !== 'function') await loadScript(PYODIDE_SCRIPT_URL);
  return g.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
}

/** ブラウザ用: プロジェクトの py/ 配下の .py を取得する（js/schem/ から見て ../../py/） */
export async function fetchPythonSource(/** @type {string} */ fileName) {
  const url = new URL(`../../py/${fileName}`, import.meta.url);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} を取得できません (HTTP ${response.status})`);
  return response.text();
}

/** @type {import('./pyodide-runtime.js').RuntimePlatform} */
export const browserPlatform = { loadPyodide: loadPyodideFromCdn, fetchPythonSource };
