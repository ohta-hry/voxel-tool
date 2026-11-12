import { UI, THEME, TIMING } from './config.js';
import { SHAPE_TYPE, ROOF_AXIS } from './constants.js';
import { dom } from './dom.js';
import { state } from './state.js';
import { registry } from './registry.js';
import { SHAPE_DEFS, getEntryType } from './shape-defs.js';
import { buildGrid } from './scene.js';
import { updatePreview } from './preview.js';
import { refreshDropdown } from './ui/dropdown.js';
import { closeDrawer } from './ui/drawer.js';
import { enterNormalMode } from './ui/edit-mode.js';

// 依存はすべて直接 import（DI引数なし）
export function initPersistence() {
  const $ = id => document.getElementById(id);

  function createSaveData() {
    return {
      canvasX: state.canvasX, canvasZ: state.canvasZ,
      boxes: registry.entries.map(e => {
        const type = getEntryType(e);
        const isRoof = type === SHAPE_TYPE.ROOF;
        return {
          ox: e.ox, oy: e.oy, oz: e.oz,
          sx: e.sx, sy: e.sy, sz: e.sz,
          color: e.color, label: e.label,
          type,
          // roof専用: DDA勾配軸 (+x/-x/+z/-z)
          roofAxis: isRoof ? (e.roofAxis || ROOF_AXIS.PLUS_X) : undefined,
          roofGable: isRoof ? !!e.roofGable : undefined,
        };
      }),
    };
  }

  // 'x' のような旧形式は '+x' に補正。不正値は fallback
  function normalizeRoofAxisValue(value, fallback = ROOF_AXIS.PLUS_X) {
    if (!value) return fallback;
    if (Object.values(ROOF_AXIS).includes(value)) return value;
    const normalized = '+' + value;
    return (normalized === ROOF_AXIS.PLUS_X || normalized === ROOF_AXIS.PLUS_Z) ? normalized : fallback;
  }

  function restoreBoxFromData(b) {
    const type = (b.type && SHAPE_DEFS[b.type]) ? b.type : SHAPE_TYPE.BOX;
    const isRoof = type === SHAPE_TYPE.ROOF;
    registry.add({
      type,
      ox: b.ox, oy: b.oy, oz: b.oz,
      sx: b.sx, sy: b.sy, sz: b.sz,
      color: b.color,
      roofAxis: isRoof ? normalizeRoofAxisValue(b.roofAxis) : undefined,
      roofGable: isRoof ? !!b.roofGable : undefined,
    });
  }

  function loadSceneData(data, { clearExisting = false, resetMode = false, disableEdgeVoxel = false, saveAfterLoad = false } = {}) {
    if (!data || !Array.isArray(data.boxes)) return false;

    if (disableEdgeVoxel) state.edgeVoxelMode = false; // チェックボックス表示は mode-toggles が同期

    if (clearExisting) registry.clear();
    if (resetMode) enterNormalMode();

    state.canvasX = data.canvasX || UI.defaultCanvasSize;
    state.canvasZ = data.canvasZ || UI.defaultCanvasSize;
    dom.canvasXInput.value = state.canvasX;
    dom.canvasZInput.value = state.canvasZ;
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
    $('export-textarea').value = code;
    $('modal-export').classList.add('open');
  });

  // Copy code
  $('btn-export-copy').addEventListener('click', () => {
    const ta = $('export-textarea');
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
    $('import-textarea').value = '';
    $('modal-import').classList.add('open');
  });

  $('btn-import-cancel').addEventListener('click', () => {
    $('modal-import').classList.remove('open');
  });

  function flashImportError() {
    $('import-textarea').style.borderColor = THEME.css.errorBorder;
    setTimeout(() => { $('import-textarea').style.borderColor = ''; }, TIMING.feedbackMs);
  }

  $('btn-import-load').addEventListener('click', () => {
    const data = deserializeSave($('import-textarea').value);
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
