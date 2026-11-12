import { THEME, UI, TIMING } from './config.js';
import { initColorUI } from './color.js';
import { initPersistence } from './persistence.js';

import { state, placedBoxes } from './state.js';
import { dom } from './dom.js';
import { hexToInt } from './utils.js';
import { SHAPE_DEFS } from './shape-defs.js';
import { bindPersistence } from './autosave.js';
import { createSolidMaterial, createEdgeMaterial } from './materials.js';
import { scene, buildGrid, setupResize, startRenderLoop } from './scene.js';
import { makeShapeMesh, makeEdgeVoxelGroupForEntry } from './shapes.js';
import { createEntry, removeAllEntriesFromScene } from './entries.js';
import { updatePreview } from './preview.js';

import { initTabs } from './ui/tabs.js';
import { initSpinners } from './ui/spinners.js';
import { initDrawer } from './ui/drawer.js';
import { initModeToggles } from './ui/mode-toggles.js';
import { initRoofControls, updateRoofAxisButtons } from './ui/roof-controls.js';
import { buildTypeGrid } from './ui/type-grid.js';
import { refreshDropdown } from './ui/dropdown.js';
import { enterNormalMode } from './ui/edit-mode.js';
import { initActions } from './ui/actions.js';

// ── Scene ─────────────────────────────────────────────────────────────────────
buildGrid(state.canvasX, state.canvasZ);
setupResize();
startRenderLoop();

// ── UI wiring ─────────────────────────────────────────────────────────────────
initTabs();
initSpinners();
initDrawer();
initModeToggles();
initRoofControls();
initActions();

// ── Color system ──────────────────────────────────────────────────────────────
const colorUI = initColorUI({
  UI,
  getActiveColor: () => state.activeColor,
  setColorState: hex => { state.activeColor = hex; },
  getEditingIndex: () => state.editingIndex,
  getPlacedBoxes: () => placedBoxes,
  scene, hexToInt, makeEdgeVoxelGroupForEntry,
});

// ── Export / Import / Auto save ───────────────────────────────────────────────
const persistence = initPersistence({
  UI, THEME, TIMING, scene, placedBoxes, SHAPE_DEFS,
  chkEdgeVoxel: dom.chkEdgeVoxel, chkEdgeIcon: dom.chkEdgeVoxelIcon,
  drawer: dom.drawer, toggleBtn: dom.toggleBtn,
  removeAllEntriesFromScene, enterNormalMode, buildGrid, updateRoofAxisButtons,
  createSolidMaterial, createEdgeMaterial, makeShapeMesh, createEntry, refreshDropdown, updatePreview,
  state,
});
bindPersistence(persistence);

// ── Start ─────────────────────────────────────────────────────────────────────
colorUI.setActiveColor(state.activeColor);
buildTypeGrid();
updatePreview();
persistence.autoLoad();
