import { THEME } from '../config.js';
import { ROOF_AXIS, ROOF_AXIS_CYCLE } from '../constants.js';
import { dom } from '../dom.js';
import { state } from '../state.js';
import { updatePreview } from '../preview.js';

const isXAxis = axis => axis === ROOF_AXIS.PLUS_X || axis === ROOF_AXIS.MINUS_X;
const isZAxis = axis => axis === ROOF_AXIS.PLUS_Z || axis === ROOF_AXIS.MINUS_Z;

function paintButton(btn, active) {
  btn.style.background = active ? THEME.css.primaryBg : THEME.css.panel;
  btn.style.borderColor = active ? THEME.css.primaryBorder : THEME.css.panelBorder;
  btn.style.color = active ? THEME.css.primaryText : THEME.css.mutedText;
}

export function updateRoofAxisButtons() {
  const isX = isXAxis(state.roofAxis);
  const isZ = isZAxis(state.roofAxis);

  dom.btnRoofX.textContent = isX ? state.roofAxis.toUpperCase() : '+X';
  paintButton(dom.btnRoofX, isX);

  dom.btnRoofZ.textContent = isZ ? state.roofAxis.toUpperCase() : '+Z';
  paintButton(dom.btnRoofZ, isZ);

  // 両屋根ボタン: ON=紫ハイライト / OFF=グレー
  const bg = dom.btnRoofGable;
  if (bg) {
    bg.style.background = state.roofGable ? THEME.css.gableBg : THEME.css.panel;
    bg.style.borderColor = state.roofGable ? THEME.css.gableBorder : THEME.css.panelBorder;
    bg.style.color = state.roofGable ? THEME.css.gableText : THEME.css.mutedText;
  }
}

export function initRoofControls() {
  // 選択中の軸と同じ系統なら +/- 反転、別系統なら + にリセット
  dom.btnRoofX.addEventListener('click', () => {
    state.roofAxis = isXAxis(state.roofAxis) ? ROOF_AXIS_CYCLE[state.roofAxis] : ROOF_AXIS.PLUS_X;
    updateRoofAxisButtons();
    updatePreview();
  });

  dom.btnRoofZ.addEventListener('click', () => {
    state.roofAxis = isZAxis(state.roofAxis) ? ROOF_AXIS_CYCLE[state.roofAxis] : ROOF_AXIS.PLUS_Z;
    updateRoofAxisButtons();
    updatePreview();
  });

  dom.btnRoofGable.addEventListener('click', () => {
    state.roofGable = !state.roofGable;
    updateRoofAxisButtons();
    updatePreview();
  });
}
