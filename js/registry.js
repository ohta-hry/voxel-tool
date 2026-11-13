import { SHAPE_TYPE } from './constants.js';
import { scene } from './scene.js';
import { createSolidMaterial, createEdgeMaterial } from './materials.js';
import { disposeObject3D } from './dispose.js';
import { getShape, hasShape, buildShapeMesh, makeEdgeVoxelGroupForEntry } from './shapes/index.js';
import { applyDisplayModesToEntry } from './modes.js';

// 配置済みボックスの管理。シーンへの追加/削除・メッシュ再構築・リソース解放をここに集約する。
// DOM・ドロップダウン・保存には触れない（呼び出し側が担当）。形状ごとの処理は shapes/ のプラグインに委譲。
//
// spec:  { type, ox,oy,oz, sx,sy,sz, color(0xRRGGBB の数値), params? }
// entry: spec + { mesh, edgeGroup, label }

/** @param {import('./types.js').BoxEntry} entry @param {number} index */
export function formatBoxLabel(entry, index) {
  const typeLabel = getShape(entry.type).typeLabel(entry);
  return `Box ${index + 1}${typeLabel} (${entry.ox},${entry.oy},${entry.oz}) ${entry.sx}×${entry.sy}×${entry.sz}`;
}

/** @param {import('./types.js').BoxEntry} entry */
function discardEdgeGroup(entry) {
  if (!entry.edgeGroup) return;
  scene.remove(entry.edgeGroup);
  disposeObject3D(entry.edgeGroup);
  entry.edgeGroup = null;
}

class BoxRegistry {
  constructor() {
    /** @type {import('./types.js').BoxEntry[]} */
    this._entries = [];
  }

  get entries() { return this._entries; } // 読み取り専用として扱うこと
  get count() { return this._entries.length; }
  /** @param {number} index */
  get(index) { return this._entries[index]; }

  /** @param {import('./types.js').ShapeSpec} spec @returns {import('./types.js').BoxEntry} */
  add(spec) {
    const entry = /** @type {import('./types.js').BoxEntry} */ ({ mesh: null, edgeGroup: null, label: '' });
    this._assignSpec(entry, spec);
    entry.label = formatBoxLabel(entry, this._entries.length);
    entry.mesh = this._buildMesh(entry);
    scene.add(entry.mesh);
    applyDisplayModesToEntry(entry);
    this._entries.push(entry);
    return entry;
  }

  // 形状・位置・サイズ・タイプを差し替えてメッシュを再構築する（色は維持）
  /** @param {number} index @param {import('./types.js').ShapeSpec} spec */
  update(index, spec) {
    const entry = this._entries[index];
    this._assignSpec(entry, { ...spec, color: entry.color });
    entry.label = formatBoxLabel(entry, index);
    this._rebuild(entry);
    return entry;
  }

  /** @param {number} index @param {number} color */
  recolor(index, color) {
    const entry = this._entries[index];
    entry.color = color;
    getShape(entry.type).setColor(entry.mesh, color);
    if (entry.edgeGroup) {
      discardEdgeGroup(entry);
      entry.edgeGroup = makeEdgeVoxelGroupForEntry(entry);
      scene.add(entry.edgeGroup);
    }
  }

  /** @param {number} index @param {boolean} on */
  highlight(index, on) {
    const entry = this._entries[index];
    if (entry) getShape(entry.type).highlight(entry.mesh, on);
  }

  /** @param {number} index */
  remove(index) {
    this._disposeEntry(this._entries[index]);
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
  /** @param {import('./types.js').BoxEntry} entry @param {import('./types.js').ShapeSpec} spec */
  _assignSpec(entry, spec) {
    const type = hasShape(spec.type) ? spec.type : SHAPE_TYPE.BOX;
    const shape = getShape(type);
    entry.type = type;
    entry.ox = spec.ox; entry.oy = spec.oy; entry.oz = spec.oz;
    entry.sx = spec.sx; entry.sy = spec.sy; entry.sz = spec.sz;
    entry.color = spec.color;
    entry.params = shape.params ? shape.params.normalize(spec.params) : undefined;
  }

  /** @param {import('./types.js').BoxEntry} entry */
  _buildMesh(entry) {
    // 確定済みなので Face Culling 等の最適化を適用（confirmed = true）
    return buildShapeMesh(entry, {
      mat: createSolidMaterial(entry.color),
      edgeMat: createEdgeMaterial(),
      confirmed: true,
    });
  }

  /** @param {import('./types.js').BoxEntry} entry */
  _rebuild(entry) {
    scene.remove(entry.mesh);
    disposeObject3D(entry.mesh);
    discardEdgeGroup(entry);
    entry.mesh = this._buildMesh(entry);
    scene.add(entry.mesh);
    applyDisplayModesToEntry(entry);
  }

  /** @param {import('./types.js').BoxEntry} entry */
  _disposeEntry(entry) {
    scene.remove(entry.mesh);
    disposeObject3D(entry.mesh);
    discardEdgeGroup(entry);
  }
}

export const registry = new BoxRegistry();
