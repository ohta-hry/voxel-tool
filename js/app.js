import { state } from './state.js';
import { initColorUI } from './color.js';
import { initPersistence } from './persistence.js';
import { initReactions } from './reactions.js';
import { bindPersistence } from './autosave.js';
import { buildGrid, setupResize, startRenderLoop } from './scene.js';
import { updatePreview } from './preview.js';

import { initTabs } from './ui/tabs.js';
import { initSpinners } from './ui/spinners.js';
import { initDrawer } from './ui/drawer.js';
import { initModeToggles } from './ui/mode-toggles.js';
import { initRoofControls } from './ui/roof-controls.js';
import { buildTypeGrid } from './ui/type-grid.js';
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
initReactions();
const colorUI = initColorUI();

// ── Export / Import / Auto save ───────────────────────────────────────────────
const persistence = initPersistence();
bindPersistence(persistence);

// ── Start ─────────────────────────────────────────────────────────────────────
colorUI.setActiveColor(state.activeColor);
buildTypeGrid();
updatePreview();
persistence.autoLoad();
