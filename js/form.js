import { UI } from './config.js';
import { state } from './state.js';
import { readParamsFromState } from './shapes/index.js';

// 基準点(ox,oy,oz)・サイズ(sx,sy,sz)のスピナー入力を読み書きする
const el = id => document.getElementById(id);

export function getValues() {
  const origin = id => Math.max(UI.minOrigin, parseInt(el(id).value) || UI.minOrigin);
  const size   = id => Math.max(UI.minSize,   parseInt(el(id).value) || UI.minSize);
  return { ox: origin('ox'), oy: origin('oy'), oz: origin('oz'), sx: size('sx'), sy: size('sy'), sz: size('sz') };
}

export function setValues(ox, oy, oz, sx, sy, sz) {
  el('ox').value = ox; el('oy').value = oy; el('oz').value = oz;
  el('sx').value = sx; el('sy').value = sy; el('sz').value = sz;
}

// 現在のフォーム値 + 選択中のタイプ・形状固有パラメータから、形状の仕様（spec）を作る
export function readShapeSpec() {
  const type = state.activeType;
  return { type, ...getValues(), params: readParamsFromState(type) };
}
