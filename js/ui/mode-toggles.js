import { dom } from '../dom.js';
import { state } from '../state.js';
import { applyWireframeMode, applyEdgeVoxelMode } from '../modes.js';

export function initModeToggles() {
  dom.chkWireframe.addEventListener('change', () => {
    state.wireframeMode = dom.chkWireframe.checked;
    dom.chkWireframeIcon.textContent = state.wireframeMode ? '✓' : '';
    applyWireframeMode();
  });

  dom.chkEdgeVoxel.addEventListener('change', () => {
    state.edgeVoxelMode = dom.chkEdgeVoxel.checked;
    dom.chkEdgeVoxelIcon.textContent = state.edgeVoxelMode ? '✓' : '';
    applyEdgeVoxelMode();
  });
}
