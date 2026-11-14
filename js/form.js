import { UI } from './config.js';
import { state } from './state.js';
import { inputById } from './dom-utils.js';
import { readParamsFromState, getShape } from './shapes/index.js';

// 基準点(ox,oy,oz)・サイズ(sx,sy,sz)のスピナー入力を読み書きする
/** @param {string} id */
const el = id => inputById(id);

/** @returns {{ ox: number, oy: number, oz: number, sx: number, sy: number, sz: number }} */
export function getValues() {
  /** @param {string} id */
  const origin = id => Math.max(UI.minOrigin, parseInt(el(id).value) || UI.minOrigin);
  /** @param {string} id */
  const size   = id => Math.max(UI.minSize,   parseInt(el(id).value) || UI.minSize);
  return { ox: origin('ox'), oy: origin('oy'), oz: origin('oz'), sx: size('sx'), sy: size('sy'), sz: size('sz') };
}

/** @param {number} ox @param {number} oy @param {number} oz @param {number} sx @param {number} sy @param {number} sz */
export function setValues(ox, oy, oz, sx, sy, sz) {
  el('ox').value = String(ox); el('oy').value = String(oy); el('oz').value = String(oz);
  el('sx').value = String(sx); el('sy').value = String(sy); el('sz').value = String(sz);
}

// 現在のフォーム値 + 指定タイプ（省略=選択中）・形状固有パラメータから、形状の仕様（spec）を作る
// サイズ欄の意味が違う形状（ピラーの「長さ」）は、shape.sizeFromForm で実際のサイズに直す
/** @param {string} [type]
 * @returns {import('./types.js').ShapeSpec} */
export function readShapeSpec(type = state.activeType) {
  const values = getValues();
  const sizes = getShape(type).sizeFromForm?.(values, state) ?? {};
  return { type, ...values, ...sizes, params: readParamsFromState(type) };
}

// 入力欄の値を、その形状が実際に使う値にそろえて書き戻す（形状を切り替える前に使う）
// 例: ピラー→直方体のとき、隠れていた古いサイズ欄が残らないようにする
/** @param {string} type */
export function commitSizesToForm(type) {
  const s = readShapeSpec(type);
  setValues(s.ox, s.oy, s.oz, s.sx, s.sy, s.sz);
}
