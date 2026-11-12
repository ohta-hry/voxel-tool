import { SHAPE_TYPE, ROOF_AXIS } from './constants.js';
import { scene } from './scene.js';
import { createSolidMaterial, createEdgeMaterial } from './materials.js';
import { disposeObject3D } from './dispose.js';
import { makeShapeMesh, makeEdgeVoxelGroupForEntry } from './shapes.js';
import { applyDisplayModesToEntry, highlightBox, discardEdgeGroup } from './modes.js';
import { SHAPE_DEFS, getEntryType } from './shape-defs.js';

// 配置済みボックスの管理。シーンへの追加/削除・メッシュ再構築・リソース解放をここに集約する。
// DOM・ドロップダウン・保存には触れない（呼び出し側が担当）。
//
// spec: { type, ox,oy,oz, sx,sy,sz, color(0xRRGGBB の数値), roofAxis?, roofGable? }
// entry: spec + { mesh, edgeGroup, label }

export function formatBoxLabel(entry, index) {
  const type = getEntryType(entry);
  const def = SHAPE_DEFS[type];
  const typeLabel = type === SHAPE_TYPE.BOX
    ? ''
    : ` [${def?.label || type}${type === SHAPE_TYPE.ROOF ? '(' + entry.roofAxis + ')' : ''}]`;
  return `Box ${index + 1}${typeLabel} (${entry.ox},${entry.oy},${entry.oz}) ${entry.sx}×${entry.sy}×${entry.sz}`;
}

// 色の数値を、メッシュ（または Group 配下の各セル）のマテリアルに反映する
function applyColorToMesh(mesh, color) {
  if (mesh.userData && mesh.userData.isCrossPillar) {
    for (const child of mesh.children) {
      if (child.userData && child.userData.isOutlineEdge) continue;
      child.material.color.setHex(color);
    }
  } else if (mesh.userData && mesh.userData.isRoof) {
    for (const child of mesh.children) {
      if (child.material) child.material.color.setHex(color);
    }
  } else {
    mesh.material.color.setHex(color);
  }
}

class BoxRegistry {
  constructor() {
    this._entries = [];
  }

  get entries() { return this._entries; } // 読み取り専用として扱うこと
  get count() { return this._entries.length; }
  get(index) { return this._entries[index]; }

  add(spec) {
    const entry = { mesh: null, edgeGroup: null, label: '' };
    this._assignSpec(entry, spec);
    entry.label = formatBoxLabel(entry, this._entries.length);
    entry.mesh = this._buildMesh(entry);
    scene.add(entry.mesh);
    applyDisplayModesToEntry(entry);
    this._entries.push(entry);
    return entry;
  }

  // 形状・位置・サイズ・タイプを差し替えてメッシュを再構築する（色は維持）
  update(index, spec) {
    const entry = this._entries[index];
    this._assignSpec(entry, { ...spec, color: entry.color });
    entry.label = formatBoxLabel(entry, index);
    this._rebuild(entry);
    return entry;
  }

  recolor(index, color) {
    const entry = this._entries[index];
    entry.color = color;
    applyColorToMesh(entry.mesh, color);
    if (entry.edgeGroup) {
      discardEdgeGroup(entry);
      entry.edgeGroup = makeEdgeVoxelGroupForEntry(entry);
      scene.add(entry.edgeGroup);
    }
  }

  highlight(index, on) {
    const entry = this._entries[index];
    if (entry) highlightBox(entry, on);
  }

  remove(index) {
    const entry = this._entries[index];
    this._disposeEntry(entry);
    this._entries.splice(index, 1);
  }

  clear() {
    for (const entry of this._entries) this._disposeEntry(entry);
    this._entries.length = 0;
  }

  refreshLabels() {
    this._entries.forEach((entry, index) => {
      entry.label = formatBoxLabel(entry, index);
    });
  }

  // ── 内部 ──
  _assignSpec(entry, spec) {
    const type = spec.type || SHAPE_TYPE.BOX;
    const isRoof = type === SHAPE_TYPE.ROOF;
    entry.type = type;
    entry.ox = spec.ox; entry.oy = spec.oy; entry.oz = spec.oz;
    entry.sx = spec.sx; entry.sy = spec.sy; entry.sz = spec.sz;
    entry.color = spec.color;
    entry.roofAxis = isRoof ? (spec.roofAxis || ROOF_AXIS.PLUS_X) : undefined;
    entry.roofGable = isRoof ? !!spec.roofGable : undefined;
  }

  _buildMesh(entry) {
    // 確定済みなので Face Culling 適用（isConfirmed = true）
    return makeShapeMesh(
      getEntryType(entry), entry.ox, entry.oy, entry.oz, entry.sx, entry.sy, entry.sz,
      createSolidMaterial(entry.color), createEdgeMaterial(), true,
      { axis: entry.roofAxis, gable: entry.roofGable }
    );
  }

  _rebuild(entry) {
    scene.remove(entry.mesh);
    disposeObject3D(entry.mesh);
    discardEdgeGroup(entry);
    entry.mesh = this._buildMesh(entry);
    scene.add(entry.mesh);
    applyDisplayModesToEntry(entry);
  }

  _disposeEntry(entry) {
    scene.remove(entry.mesh);
    disposeObject3D(entry.mesh);
    discardEdgeGroup(entry);
  }
}

export const registry = new BoxRegistry();
