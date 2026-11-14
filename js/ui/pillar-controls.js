import { dom } from '../dom.js';
import { state } from '../state.js';
import { SHAPE_TYPE, PILLAR_AXIS } from '../constants.js';
import { getValues, setValues } from '../form.js';
import { pillarLength, pillarSizes } from '../logic/pillar.js';
import { paintButton } from './roof-controls.js';

const AXIS_BUTTONS = [
  [PILLAR_AXIS.X, () => dom.btnPillarX],
  [PILLAR_AXIS.Y, () => dom.btnPillarY],
  [PILLAR_AXIS.Z, () => dom.btnPillarZ],
];

/** 軸ボタンの表示を state.pillarAxis に合わせる */
export function updatePillarAxisButtons() {
  for (const [axis, getBtn] of AXIS_BUTTONS) paintButton(getBtn(), axis === state.pillarAxis);
}

/**
 * ピラー選択中は、サイズ欄を「長さ」1つにする。
 * 入力欄は sx/sy/sz をそのまま使い回し、軸に対応する1つだけを表示する（他は隠す。値は読まれない）。
 * ピラー以外では、見出しも3つの欄も通常どおり。
 */
export function syncPillarForm() {
  const isPillar = state.activeType === SHAPE_TYPE.PILLAR;
  dom.sizeHeader.textContent = isPillar ? '長さ' : 'サイズ';
  for (const [axis] of AXIS_BUTTONS) {
    dom.sizeWraps[axis].style.visibility = (!isPillar || axis === state.pillarAxis) ? 'visible' : 'hidden';
  }
}

/** 軸を切り替える。長さは引き継ぐ（入力欄を新しい軸の欄に移してから、状態を更新する） */
function changePillarAxis(/** @type {import('../types.js').PillarAxis} */ next) {
  if (next === state.pillarAxis) return;
  const v = getValues();
  const s = pillarSizes(next, pillarLength(state.pillarAxis, v));
  setValues(v.ox, v.oy, v.oz, s.sx, s.sy, s.sz);
  state.pillarAxis = next; // 以降の表示とプレビューの更新は reactions.js 経由
}

export function initPillarControls() {
  for (const [axis, getBtn] of AXIS_BUTTONS) {
    getBtn().addEventListener('click', () => changePillarAxis(axis));
  }
  updatePillarAxisButtons();
  syncPillarForm();
}
