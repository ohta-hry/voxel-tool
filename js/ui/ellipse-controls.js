import { UI } from '../config.js';
import { dom } from '../dom.js';
import { state } from '../state.js';
import { getValues, setValues } from '../form.js';
import { resizeEllipse } from '../logic/ellipse.js';
import { paintButton } from './roof-controls.js';

/** 「円」「中心固定」ボタンの表示を state に合わせる */
export function updateEllipseButtons() {
  paintButton(dom.btnEllipseCircle, state.ellipseCircle);
  paintButton(dom.btnEllipseCenter, state.ellipseFixedCenter);
}

/**
 * 「円」がONのとき、xz のサイズをそろえる（大きい方に合わせるので、小さくはならない）。
 * 「中心固定」がONなら、増えた側の位置も動かす。変更があれば true
 */
export function equalizeEllipseSizes() {
  const v = getValues();
  if (v.sx === v.sz) return false;
  const next = resizeEllipse(v, v.sx < v.sz ? 'sx' : 'sz', Math.max(v.sx, v.sz), {
    isCircle: false, fixedCenter: state.ellipseFixedCenter, minSize: UI.minSize, minOrigin: UI.minOrigin,
  });
  setValues(next.ox, next.oy, next.oz, next.sx, next.sy, next.sz);
  return true;
}

/** @param {() => void} onFormChanged  入力欄の値が変わったときに呼ぶ（プレビュー更新） */
export function initEllipseControls(onFormChanged) {
  dom.btnEllipseCircle.addEventListener('click', () => {
    state.ellipseCircle = !state.ellipseCircle;
    if (state.ellipseCircle && equalizeEllipseSizes()) onFormChanged();
  });
  dom.btnEllipseCenter.addEventListener('click', () => {
    state.ellipseFixedCenter = !state.ellipseFixedCenter;
  });
  updateEllipseButtons();
}
