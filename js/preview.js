import * as THREE from 'three';
import { THEME } from './config.js';
import { state, placedBoxes } from './state.js';
import { scene } from './scene.js';
import { createSolidMaterial, PREVIEW_MAT, PREVIEW_EMAT } from './materials.js';
import { makeShapeMesh } from './shapes.js';
import { getEntryType } from './shape-defs.js';
import { getValues } from './form.js';
import { hexToInt } from './utils.js';

export function updatePreview() {
  if (state.previewMesh) { scene.remove(state.previewMesh); state.previewMesh = null; }

  const { ox, oy, oz, sx, sy, sz } = getValues();
  const editing = state.editingIndex >= 0;
  const type = editing ? getEntryType(placedBoxes[state.editingIndex]) : state.activeType;

  // 編集中は半透明プレビュー、新規配置時は選択色でプレビュー
  const mat = editing
    ? PREVIEW_MAT
    : createSolidMaterial(new THREE.Color(hexToInt(state.activeColor)), { opacity: THEME.opacity.activePreview, depthWrite: false });
  const mesh = makeShapeMesh(type, ox, oy, oz, sx, sy, sz, mat, PREVIEW_EMAT);

  if (mesh.userData && (mesh.userData.isCrossPillar || mesh.userData.isRoof)) {
    for (const child of mesh.children) child.visible = !state.wireframeMode;
  } else {
    mesh.visible = !state.wireframeMode;
  }
  state.previewMesh = mesh;
  scene.add(mesh);
}
