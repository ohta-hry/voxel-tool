import { SHAPE_TYPE } from '../constants.js';
import { state } from '../state.js';
import { boxShape } from './box.js';
import { crossPillarShape } from './cross-pillar.js';
import { roofShape } from './roof.js';
import { makeEdgeVoxelCubes } from './edge-voxel-group.js';

// ── 形状プラグインのレジストリ ────────────────────────────────────────────────
// 新しい形状は shapes/xxx.js に定義を書き、下で registerShape するだけで追加できる。
// 定義の形は types.js の ShapeDefinition を参照。
const shapes = new Map();
const REQUIRED = ['id', 'label', 'desc', 'icon', 'category', 'build', 'setVisibility', 'highlight', 'setColor', 'typeLabel'];

export function registerShape(def) {
  for (const key of REQUIRED) {
    if (def[key] === undefined) throw new Error(`shape "${def.id}": "${key}" がありません`);
  }
  shapes.set(def.id, def);
}

registerShape(boxShape);          // 表示順 = 登録順
registerShape(crossPillarShape);
registerShape(roofShape);

export const hasShape = type => shapes.has(type);
export const listShapes = () => [...shapes.values()];
// 未知のタイプ（旧データなど）は直方体として扱う
export const getShape = type => shapes.get(type) ?? shapes.get(SHAPE_TYPE.BOX);

// spec: { type, ox,oy,oz, sx,sy,sz, params }
export function buildShapeMesh(spec, { mat, edgeMat, confirmed = false }) {
  return getShape(spec.type).build(spec, { mat, edgeMat, confirmed, wireframe: state.wireframeMode });
}

// 辺ボクセル表示用グループ。辺ボクセルモードの対象外の形状は null
export function makeEdgeVoxelGroupForEntry(entry) {
  const shape = getShape(entry.type);
  if (!shape.edgeVoxels) return null;
  return makeEdgeVoxelCubes(entry.ox, entry.oy, entry.oz, shape.edgeVoxels(entry), entry.color);
}

// 現在のUI状態から、形状固有パラメータを取り出す
export function readParamsFromState(type) {
  return getShape(type).params?.fromState(state);
}

// 編集開始時: エントリの固有パラメータをUI状態に反映（他形状の固有状態はリセット）
export function syncStateFromEntry(entry) {
  for (const shape of shapes.values()) {
    if (!shape.params) continue;
    if (shape.id === entry.type) shape.params.toState(entry.params, state);
    else shape.params.reset?.(state);
  }
}
