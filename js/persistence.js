import { UI, THEME, TIMING } from './config.js';
import { SHAPE_TYPE } from './constants.js';
import { dom } from './dom.js';
import { state } from './state.js';
import { registry } from './registry.js';
import { getShape, hasShape } from './shapes/index.js';
import { buildGrid } from './scene.js';
import { updatePreview } from './preview.js';
import { refreshDropdown } from './ui/dropdown.js';
import { closeDrawer } from './ui/drawer.js';
import { enterNormalMode } from './ui/edit-mode.js';
import { byId, textareaById } from './dom-utils.js';

// 依存はすべて直接 import（DI引数なし）
/** 保存/読込（localStorage 自動保存・エクスポート/インポートモーダル）を初期化する */
export function initPersistence() {
  const $ = byId;

  /** @returns {import('./types.js').SaveData} */
  function createSaveData() {
    return {
      canvasX: state.canvasX, canvasZ: state.canvasZ,
      boxes: registry.entries.map(e => ({
        ox: e.ox, oy: e.oy, oz: e.oz,
        sx: e.sx, sy: e.sy, sz: e.sz,
        color: e.color, label: e.label,
        type: e.type,
        // 形状固有パラメータ（屋根: roofAxis / roofGable）。保存キーは各形状の serialize が決める
        ...getShape(e.type).params?.serialize(e.params),
      })),
    };
  }

  /** @param {import('./types.js').SavedBox} b */
  function restoreBoxFromData(b) {
    const type = hasShape(b.type) ? b.type : SHAPE_TYPE.BOX;
    registry.add({
      type,
      ox: b.ox, oy: b.oy, oz: b.oz,
      sx: b.sx, sy: b.sy, sz: b.sz,
      color: b.color,
      params: getShape(type).params?.deserialize(b),
    });
  }

  /** @param {import('./types.js').SaveData|null} data
   * @param {{ clearExisting?: boolean, resetMode?: boolean, disableEdgeVoxel?: boolean, saveAfterLoad?: boolean }} [options]
   * @returns {boolean} 読み込めたか */
  function loadSceneData(data, { clearExisting = false, resetMode = false, disableEdgeVoxel = false, saveAfterLoad = false } = {}) {
    if (!data || !Array.isArray(data.boxes)) return false;

    if (disableEdgeVoxel) state.edgeVoxelMode = false; // チェックボックス表示は mode-toggles が同期

    if (clearExisting) registry.clear();
    if (resetMode) enterNormalMode();

    state.canvasX = data.canvasX || UI.defaultCanvasSize;
    state.canvasZ = data.canvasZ || UI.defaultCanvasSize;
    dom.canvasXInput.value = String(state.canvasX);
    dom.canvasZInput.value = String(state.canvasZ);
    buildGrid(state.canvasX, state.canvasZ);

    for (const b of data.boxes) restoreBoxFromData(b);

    refreshDropdown();
    updatePreview();
    if (saveAfterLoad) autoSave();
    return true;
  }

  function serializeSave() {
    const data = createSaveData();
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }

  /** @param {string} code @returns {import('./types.js').SaveData|null} */
  function deserializeSave(code) {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    } catch (e) {
      return null;
    }
  }

  // Open export modal
  $('btn-export-save').addEventListener('click', () => {
    const code = serializeSave();
    textareaById('export-textarea').value = code;
    $('modal-export').classList.add('open');
  });

  // Copy code
  $('btn-export-copy').addEventListener('click', () => {
    const ta = textareaById('export-textarea');
    ta.select();
    navigator.clipboard.writeText(ta.value).catch(() => {
      document.execCommand('copy');
    });
    $('btn-export-copy').textContent = '✓ コピー完了';
    setTimeout(() => { $('btn-export-copy').textContent = '📋 コピー'; }, TIMING.feedbackMs);
  });

  $('btn-export-close').addEventListener('click', () => {
    $('modal-export').classList.remove('open');
  });

  // Open import modal
  $('btn-import-save').addEventListener('click', () => {
    textareaById('import-textarea').value = '';
    $('modal-import').classList.add('open');
  });

  $('btn-import-cancel').addEventListener('click', () => {
    $('modal-import').classList.remove('open');
  });

  function flashImportError() {
    textareaById('import-textarea').style.borderColor = THEME.css.errorBorder;
    setTimeout(() => { textareaById('import-textarea').style.borderColor = ''; }, TIMING.feedbackMs);
  }

  $('btn-import-load').addEventListener('click', () => {
    const data = deserializeSave(textareaById('import-textarea').value);
    if (!data) { flashImportError(); return; }

    const loaded = loadSceneData(data, {
      clearExisting: true,
      resetMode: true,
      disableEdgeVoxel: true,
      saveAfterLoad: true,
    });
    if (!loaded) { flashImportError(); return; }

    $('modal-import').classList.remove('open');
    closeDrawer();
  });

  // ── Auto save / load (localStorage) ──────────────────────────────────────────
  const LS_KEY = 'voxelTool_v1';

  function autoSave() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(createSaveData()));
    } catch (e) { /* quota超過等は無視 */ }
  }

  function autoLoad() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.boxes) || data.boxes.length === 0) return;

      loadSceneData(data);
    } catch (e) { /* 破損データは無視 */ }
  }

  return { autoSave, autoLoad, loadSceneData, createSaveData, serializeSave, deserializeSave };
}
