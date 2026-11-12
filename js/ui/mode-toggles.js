import { dom } from '../dom.js';
import { state, subscribe } from '../state.js';

// チェックボックス ⇔ state の同期のみ担当（実際の表示切替は reactions.js）
export function initModeToggles() {
  dom.chkWireframe.addEventListener('change', () => {
    state.wireframeMode = dom.chkWireframe.checked;
  });
  dom.chkEdgeVoxel.addEventListener('change', () => {
    state.edgeVoxelMode = dom.chkEdgeVoxel.checked;
  });

  // state が他所（インポート時など）で変更された場合も見た目を合わせる
  subscribe('wireframeMode', () => {
    dom.chkWireframe.checked = state.wireframeMode;
    dom.chkWireframeIcon.textContent = state.wireframeMode ? '✓' : '';
  });
  subscribe('edgeVoxelMode', () => {
    dom.chkEdgeVoxel.checked = state.edgeVoxelMode;
    dom.chkEdgeVoxelIcon.textContent = state.edgeVoxelMode ? '✓' : '';
  });
}
