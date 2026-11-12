import * as THREE from 'three';
import { THEME } from './config.js';
import { state } from './state.js';
import { scene } from './scene.js';
import { disposeObject3D } from './dispose.js';
import { registry } from './registry.js';
import { createSolidMaterial, PREVIEW_MAT, PREVIEW_EMAT } from './materials.js';
import { getShape, buildShapeMesh, readParamsFromState } from './shapes/index.js';
import { readShapeSpec } from './form.js';
import { hexToInt } from './utils.js';

/** @type {import('three').Object3D | null} */
let previewMesh = null;
/** @type {string | null} */
let previewType = null;

/** フォームの値と選択中の形状でプレビューを作り直す */
export function updatePreview() {
  if (previewMesh) {
    scene.remove(previewMesh);
    disposeObject3D(previewMesh);
    previewMesh = null;
  }

  const editing = state.editingIndex >= 0;
  // 編集中は編集対象のタイプ、新規配置時は選択中のタイプでプレビュー
  const type = editing ? registry.get(state.editingIndex).type : state.activeType;
  const spec = { ...readShapeSpec(), type, params: readParamsFromState(type) };

  // 編集中は半透明プレビュー、新規配置時は選択色でプレビュー
  const mat = editing
    ? PREVIEW_MAT
    : createSolidMaterial(new THREE.Color(hexToInt(state.activeColor)), { opacity: THEME.opacity.activePreview, depthWrite: false });
  const mesh = buildShapeMesh(spec, { mat, edgeMat: PREVIEW_EMAT, confirmed: false });

  previewMesh = mesh;
  previewType = type;
  refreshPreviewVisibility();
  scene.add(mesh);
}

// ワイヤーフレームモード切替時にプレビューの表示だけ更新する（面を隠してエッジのみ表示）

export function refreshPreviewVisibility() {
  if (!previewMesh) return;
  getShape(previewType).setVisibility(previewMesh, !state.wireframeMode, true);
}
