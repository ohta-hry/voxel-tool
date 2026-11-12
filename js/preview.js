import * as THREE from 'three';
import { THEME } from './config.js';
import { state } from './state.js';
import { scene } from './scene.js';
import { disposeObject3D } from './dispose.js';
import { registry } from './registry.js';
import { createSolidMaterial, PREVIEW_MAT, PREVIEW_EMAT } from './materials.js';
import { makeShapeMesh } from './shapes.js';
import { getEntryType } from './shape-defs.js';
import { readShapeSpec } from './form.js';
import { hexToInt } from './utils.js';

let previewMesh = null;

export function updatePreview() {
  if (previewMesh) {
    scene.remove(previewMesh);
    disposeObject3D(previewMesh);
    previewMesh = null;
  }

  const spec = readShapeSpec();
  const editing = state.editingIndex >= 0;
  const type = editing ? getEntryType(registry.get(state.editingIndex)) : state.activeType;

  // 編集中は半透明プレビュー、新規配置時は選択色でプレビュー
  const mat = editing
    ? PREVIEW_MAT
    : createSolidMaterial(new THREE.Color(hexToInt(state.activeColor)), { opacity: THEME.opacity.activePreview, depthWrite: false });
  const mesh = makeShapeMesh(type, spec.ox, spec.oy, spec.oz, spec.sx, spec.sy, spec.sz, mat, PREVIEW_EMAT,
    false, { axis: spec.roofAxis, gable: spec.roofGable });

  if (mesh.userData && (mesh.userData.isCrossPillar || mesh.userData.isRoof)) {
    for (const child of mesh.children) child.visible = !state.wireframeMode;
  } else {
    mesh.visible = !state.wireframeMode;
  }
  previewMesh = mesh;
  scene.add(mesh);
}

// ワイヤーフレーム/辺ボクセルモード切替時にプレビューの表示だけ更新する
export function refreshPreviewVisibility() {
  if (!previewMesh) return;
  previewMesh.visible = !state.wireframeMode;
  if (previewMesh.children[0]) previewMesh.children[0].visible = true;
}
