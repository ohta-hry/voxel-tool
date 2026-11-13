import * as THREE from 'three';
import { SHAPE_TYPE } from './constants.js';
import { state, placedBoxes } from './state.js';
import { scene } from './scene.js';
import { createSolidMaterial, createEdgeMaterial } from './materials.js';
import { makeShapeMesh } from './shapes.js';
import { applyDisplayModesToEntry } from './modes.js';
import { SHAPE_DEFS, getEntryType } from './shape-defs.js';
import { normalizeRoofAxis } from './logic/roof.js';
import { getValues } from './form.js';
import { hexToInt } from './utils.js';

// このモジュールは DOM・ドロップダウン・保存を触らない（呼び出し側 ui/actions.js が担当）

// ── ラベル / エントリ生成 ────────────────────────────────────────────────────
export function formatBoxLabel(entry, index) {
  const type = getEntryType(entry);
  const def = SHAPE_DEFS[type];
  const typeLabel = type === SHAPE_TYPE.BOX
    ? ''
    : ` [${def?.label || type}${type === SHAPE_TYPE.ROOF ? '(' + (entry.roofAxis || state.roofAxis) + ')' : ''}]`;
  return `Box ${index + 1}${typeLabel} (${entry.ox},${entry.oy},${entry.oz}) ${entry.sx}×${entry.sy}×${entry.sz}`;
}

export function createEntry(data, index = placedBoxes.length) {
  const type = data.type || SHAPE_TYPE.BOX;
  const isRoof = type === SHAPE_TYPE.ROOF;
  const entry = {
    mesh: data.mesh,
    ox: data.ox, oy: data.oy, oz: data.oz,
    sx: data.sx, sy: data.sy, sz: data.sz,
    color: data.color,
    type,
    roofAxis: isRoof ? (data.roofAxis || '+x') : undefined,
    roofGable: isRoof ? !!data.roofGable : undefined,
    edgeGroup: data.edgeGroup || null,
  };
  entry.label = data.label || formatBoxLabel(entry, index);
  return entry;
}

export function refreshEntryLabels() {
  placedBoxes.forEach((entry, index) => {
    entry.label = formatBoxLabel(entry, index);
  });
}

// ── メッシュ再構築 ───────────────────────────────────────────────────────────
export function rebuildMesh(entry) {
  scene.remove(entry.mesh);
  if (entry.edgeGroup) { scene.remove(entry.edgeGroup); entry.edgeGroup = null; }

  const type = getEntryType(entry);
  // makeRoofMesh は state.roofAxis/roofGable を参照するため、entry の値を反映しておく
  if (type === SHAPE_TYPE.ROOF && entry.roofAxis) state.roofAxis = normalizeRoofAxis(entry.roofAxis);
  if (type === SHAPE_TYPE.ROOF) state.roofGable = !!entry.roofGable;

  entry.mesh = makeShapeMesh(type, entry.ox, entry.oy, entry.oz, entry.sx, entry.sy, entry.sz,
    createSolidMaterial(entry.color), createEdgeMaterial(), true);
  scene.add(entry.mesh);
  applyDisplayModesToEntry(entry);
}

// ── 追加 / 編集反映 / 削除 ───────────────────────────────────────────────────
// フォームの値と現在のタイプ・色で新規ボックスを配置する
export function placeBox() {
  const { ox, oy, oz, sx, sy, sz } = getValues();
  const type = state.activeType;
  const isRoof = type === SHAPE_TYPE.ROOF;
  const col = new THREE.Color(hexToInt(state.activeColor));

  // 配置確定時は Face Culling 適用（isConfirmed = true）
  const mesh = makeShapeMesh(type, ox, oy, oz, sx, sy, sz, createSolidMaterial(col), createEdgeMaterial(), true);
  scene.add(mesh);

  const entry = createEntry({
    mesh, ox, oy, oz, sx, sy, sz,
    color: col.getHex(),
    type,
    roofAxis: isRoof ? state.roofAxis : undefined,
    roofGable: isRoof ? state.roofGable : undefined,
  });
  applyDisplayModesToEntry(entry);
  placedBoxes.push(entry);
  return entry;
}

// 編集中ボックスにフォームの値・タイプを反映してメッシュを再構築する
export function applyFormToEntry(index) {
  const { ox, oy, oz, sx, sy, sz } = getValues();
  const entry = placedBoxes[index];
  const isRoof = state.activeType === SHAPE_TYPE.ROOF;
  entry.ox = ox; entry.oy = oy; entry.oz = oz;
  entry.sx = sx; entry.sy = sy; entry.sz = sz;
  entry.type = state.activeType;
  entry.roofAxis = isRoof ? state.roofAxis : undefined;
  entry.roofGable = isRoof ? state.roofGable : undefined;
  entry.label = formatBoxLabel(entry, index);
  rebuildMesh(entry);
}

export function removeEntry(index) {
  const entry = placedBoxes[index];
  scene.remove(entry.mesh);
  if (entry.edgeGroup) scene.remove(entry.edgeGroup);
  placedBoxes.splice(index, 1);
}

export function removeAllEntriesFromScene() {
  for (const e of placedBoxes) {
    scene.remove(e.mesh);
    if (e.edgeGroup) scene.remove(e.edgeGroup);
  }
  placedBoxes.length = 0;
}
