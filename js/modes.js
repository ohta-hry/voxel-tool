import { THEME } from './config.js';
import { SHAPE_TYPE } from './constants.js';
import { state, placedBoxes } from './state.js';
import { scene } from './scene.js';
import { SELECT_EMAT, createEdgeMaterial } from './materials.js';
import { makeEdgeVoxelGroupForEntry } from './shapes.js';
import { getEntryType } from './shape-defs.js';

// 複数セルを Group にまとめる形状（十字柱・屋根）かどうか
function isCellGroup(mesh) {
  return !!(mesh.userData && (mesh.userData.isCrossPillar || mesh.userData.isRoof));
}

// mesh または Group に対して表示フラグを設定する
export function setMeshVisibility(mesh, faceVisible, edgeVisible) {
  if (isCellGroup(mesh)) {
    for (const child of mesh.children) {
      if (child.userData && child.userData.isOutlineEdge) {
        child.visible = edgeVisible;
      } else {
        child.visible = faceVisible;
        if (child.children[0]) child.children[0].visible = edgeVisible;
      }
    }
  } else {
    mesh.visible = faceVisible;
    if (mesh.children[0]) mesh.children[0].visible = edgeVisible;
  }
}

// 新規作成/再構築したエントリに、現在の表示モード（辺ボクセル/ワイヤーフレーム）を反映する
// roof は辺ボクセルモードの影響を受けない
export function applyDisplayModesToEntry(entry) {
  if (getEntryType(entry) === SHAPE_TYPE.ROOF) return;
  setMeshVisibility(entry.mesh, !state.edgeVoxelMode && !state.wireframeMode, !state.edgeVoxelMode);
  if (state.edgeVoxelMode) {
    entry.edgeGroup = makeEdgeVoxelGroupForEntry(entry);
    scene.add(entry.edgeGroup);
  }
}

export function highlightBox(idx, on) {
  if (idx < 0 || idx >= placedBoxes.length) return;
  const mesh = placedBoxes[idx].mesh;
  const edgeMatFor = () => (on ? SELECT_EMAT : createEdgeMaterial());
  const opacity = on ? THEME.opacity.selected : THEME.opacity.solid;

  if (isCellGroup(mesh)) {
    for (const child of mesh.children) {
      if (child.userData && child.userData.isOutlineEdge) {
        child.material = edgeMatFor();
      } else {
        child.material.opacity = opacity;
        if (child.children[0]) child.children[0].material = edgeMatFor();
      }
    }
  } else {
    const edgeChild = mesh.children[0];
    if (!edgeChild) return;
    edgeChild.material = edgeMatFor();
    mesh.material.opacity = opacity;
  }
}

export function applyWireframeMode() {
  for (const e of placedBoxes) {
    setMeshVisibility(e.mesh, !state.wireframeMode, true);
  }
  if (state.previewMesh) {
    state.previewMesh.visible = !state.wireframeMode;
    if (state.previewMesh.children[0]) state.previewMesh.children[0].visible = true;
  }
}

export function applyEdgeVoxelMode() {
  for (const e of placedBoxes) {
    if (getEntryType(e) === SHAPE_TYPE.ROOF) continue; // 表示状態を変えない

    setMeshVisibility(e.mesh, !state.edgeVoxelMode && !state.wireframeMode, !state.edgeVoxelMode);

    if (state.edgeVoxelMode) {
      if (!e.edgeGroup) {
        e.edgeGroup = makeEdgeVoxelGroupForEntry(e);
        scene.add(e.edgeGroup);
      }
      e.edgeGroup.visible = true;
    } else if (e.edgeGroup) {
      e.edgeGroup.visible = false;
    }
  }
  // プレビューは edgeVoxelMode 中でも通常表示（配置前の確認用）
  if (state.previewMesh) {
    state.previewMesh.visible = !state.wireframeMode;
  }
}
