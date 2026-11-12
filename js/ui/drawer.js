import { UI } from '../config.js';
import { dom } from '../dom.js';
import { state } from '../state.js';
import { buildGrid } from '../scene.js';

export function closeDrawer() {
  dom.drawer.classList.remove('open');
  dom.toggleBtn.classList.remove('active');
}

export function initDrawer() {
  dom.toggleBtn.addEventListener('click', () => {
    const open = dom.drawer.classList.toggle('open');
    dom.toggleBtn.classList.toggle('active', open);
  });

  dom.btnApplySettings.addEventListener('click', () => {
    state.canvasX = Math.max(UI.minSize, parseInt(dom.canvasXInput.value) || UI.defaultCanvasSize);
    state.canvasZ = Math.max(UI.minSize, parseInt(dom.canvasZInput.value) || UI.defaultCanvasSize);
    dom.canvasXInput.value = state.canvasX;
    dom.canvasZInput.value = state.canvasZ;
    buildGrid(state.canvasX, state.canvasZ);
    closeDrawer();
  });
}
