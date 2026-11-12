import { state } from './state.js';
import { scene } from './scene.js';
import { getShape, makeEdgeVoxelGroupForEntry } from './shapes/index.js';

// 表示モード（ワイヤーフレーム/辺ボクセル）の適用。形状ごとの違いは shape プラグイン側が持つ。
// registry には依存せず、エントリ配列は呼び出し側から受け取る。

// 新規作成/再構築したエントリに、現在の表示モードを反映する
// 辺ボクセルモードの対象外の形状（edgeVoxels なし）はモードの影響を受けない
/** @param {import('./types.js').BoxEntry} entry */
export function applyDisplayModesToEntry(entry) {
  const shape = getShape(entry.type);
  if (!shape.edgeVoxels) return;
  shape.setVisibility(entry.mesh, !state.edgeVoxelMode && !state.wireframeMode, !state.edgeVoxelMode);
  if (state.edgeVoxelMode) {
    entry.edgeGroup = makeEdgeVoxelGroupForEntry(entry);
    scene.add(entry.edgeGroup);
  }
}

/** @param {import('./types.js').BoxEntry[]} entries */
export function applyWireframeMode(entries) {
  for (const e of entries) {
    getShape(e.type).setVisibility(e.mesh, !state.wireframeMode, true);
  }
}

/** @param {import('./types.js').BoxEntry[]} entries */
export function applyEdgeVoxelMode(entries) {
  for (const e of entries) {
    const shape = getShape(e.type);
    if (!shape.edgeVoxels) continue; // 表示状態を変えない

    shape.setVisibility(e.mesh, !state.edgeVoxelMode && !state.wireframeMode, !state.edgeVoxelMode);

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
}
