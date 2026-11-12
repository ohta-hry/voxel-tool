export function initPersistence(context) {
  const { UI, THEME, TIMING, scene, placedBoxes, SHAPE_DEFS, chkEdgeVoxel, chkEdgeIcon, drawer, toggleBtn, removeAllEntriesFromScene, enterNormalMode, buildGrid, updateRoofAxisButtons, createSolidMaterial, createEdgeMaterial, makeShapeMesh, createEntry, refreshDropdown, updatePreview } = context;
  const { state } = context;

function createSaveData() {
  return {
    canvasX: state.canvasX, canvasZ: state.canvasZ,
    boxes: placedBoxes.map(e => ({
      ox:e.ox, oy:e.oy, oz:e.oz,
      sx:e.sx, sy:e.sy, sz:e.sz,
      color:e.color, label:e.label,
      type: e.type || 'box',
      // roof専用: DDA勾配軸 (+x/-x/+z/-z)
      roofAxis: (e.type === 'roof') ? (e.roofAxis || '+x') : undefined,
      roofGable: (e.type === 'roof') ? (!!e.roofGable) : undefined
    }))
  };
}

function normalizeRoofAxisValue(value, fallback = '+x') {
  if (!value) return fallback;
  if (value === '+x' || value === '-x' || value === '+z' || value === '-z') return value;
  const normalized = '+' + value;
  return (normalized === '+x' || normalized === '+z') ? normalized : fallback;
}

function restoreBoxFromData(b) {
  const btype = (b.type && SHAPE_DEFS[b.type]) ? b.type : 'box';
  const savedRoofAxis = btype === 'roof' ? normalizeRoofAxisValue(b.roofAxis, state.roofAxis) : undefined;
  const savedRoofGable = btype === 'roof' ? !!b.roofGable : undefined;

  if (btype === 'roof') {
    state.roofAxis = savedRoofAxis;
    state.roofGable = savedRoofGable;
  }

  const mat = createSolidMaterial(b.color);
  const edgeMat = createEdgeMaterial();
  const mesh = makeShapeMesh(btype, b.ox,b.oy,b.oz,b.sx,b.sy,b.sz,mat,edgeMat, true);
  scene.add(mesh);
  const entry = createEntry({
    mesh,
    ox:b.ox, oy:b.oy, oz:b.oz,
    sx:b.sx, sy:b.sy, sz:b.sz,
    color:b.color,
    type:btype,
    roofAxis:savedRoofAxis,
    roofGable:savedRoofGable,
    edgeGroup:null
  });
  placedBoxes.push(entry);
}

function loadSceneData(data, { clearExisting=false, resetMode=false, disableEdgeVoxel=false, saveAfterLoad=false } = {}) {
  if (!data || !Array.isArray(data.boxes)) return false;

  if (disableEdgeVoxel && state.edgeVoxelMode) {
    state.edgeVoxelMode = false;
    chkEdgeVoxel.checked = false;
    chkEdgeIcon.textContent = '';
  }

  if (clearExisting) removeAllEntriesFromScene();
  if (resetMode) enterNormalMode();

  state.canvasX = data.canvasX || UI.defaultCanvasSize;
  state.canvasZ = data.canvasZ || UI.defaultCanvasSize;
  document.getElementById('canvas-x').value = state.canvasX;
  document.getElementById('canvas-z').value = state.canvasZ;
  buildGrid(state.canvasX, state.canvasZ);

  for (const b of data.boxes) restoreBoxFromData(b);

  refreshDropdown();
  if (typeof updateRoofAxisButtons === 'function') updateRoofAxisButtons();
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
  } catch(e) {
    return null;
  }
}

// Open export modal
document.getElementById('btn-export-save').addEventListener('click', () => {
  const code = serializeSave();
  document.getElementById('export-textarea').value = code;
  document.getElementById('modal-export').classList.add('open');
});

// Copy code
document.getElementById('btn-export-copy').addEventListener('click', () => {
  const ta = document.getElementById('export-textarea');
  ta.select();
  navigator.clipboard.writeText(ta.value).catch(() => {
    document.execCommand('copy');
  });
  document.getElementById('btn-export-copy').textContent = '✓ コピー完了';
  setTimeout(() => { document.getElementById('btn-export-copy').textContent = '📋 コピー'; }, TIMING.feedbackMs);
});

document.getElementById('btn-export-close').addEventListener('click', () => {
  document.getElementById('modal-export').classList.remove('open');
});

// Open import modal
document.getElementById('btn-import-save').addEventListener('click', () => {
  document.getElementById('import-textarea').value = '';
  document.getElementById('modal-import').classList.add('open');
});

document.getElementById('btn-import-cancel').addEventListener('click', () => {
  document.getElementById('modal-import').classList.remove('open');
});

document.getElementById('btn-import-load').addEventListener('click', () => {
  const code = document.getElementById('import-textarea').value;
  const data = deserializeSave(code);
  if (!data) {
    document.getElementById('import-textarea').style.borderColor = THEME.css.errorBorder;
    setTimeout(() => { document.getElementById('import-textarea').style.borderColor = ''; }, TIMING.feedbackMs);
    return;
  }

  const loaded = loadSceneData(data, {
    clearExisting: true,
    resetMode: true,
    disableEdgeVoxel: true,
    saveAfterLoad: true
  });
  if (!loaded) {
    document.getElementById('import-textarea').style.borderColor = THEME.css.errorBorder;
    setTimeout(() => { document.getElementById('import-textarea').style.borderColor = ''; }, TIMING.feedbackMs);
    return;
  }

  document.getElementById('modal-import').classList.remove('open');
  drawer.classList.remove('open');
  toggleBtn.classList.remove('active');
});

// ── Auto save / load (localStorage) ──────────────────────────────────────────
const LS_KEY = 'voxelTool_v1';

function autoSave() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(createSaveData()));
  } catch(e) { /* quota超過等は無視 */ }
}

function autoLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.boxes) || data.boxes.length === 0) return;

    loadSceneData(data);
  } catch(e) { /* 破損データは無視 */ }
}

// ── Type grid ─────────────────────────────────────────────────────────────────
// SVGアイコン定義（平面図）

  return { autoSave, autoLoad, loadSceneData, createSaveData, serializeSave, deserializeSave };
}
