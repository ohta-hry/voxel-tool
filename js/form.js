import { UI } from './config.js';
import { state } from './state.js';
import { inputById } from './dom-utils.js';
import { readParamsFromState } from './shapes/index.js';

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

// 現在のフォーム値 + 選択中のタイプ・形状固有パラメータから、形状の仕様（spec）を作る
/** @returns {import('./types.js').ShapeSpec} */
export function readShapeSpec() {
  const type = state.activeType;
  return { type, ...getValues(), params: readParamsFromState(type) };
}
