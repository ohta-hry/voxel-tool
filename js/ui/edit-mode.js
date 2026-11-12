import { UI } from '../config.js';
import { SHAPE_TYPE } from '../constants.js';
import { dom } from '../dom.js';
import { state, batch } from '../state.js';
import { registry } from '../registry.js';
import { getEntryType } from '../shape-defs.js';
import { normalizeRoofAxis } from '../logic/roof.js';
import { getValues, setValues } from '../form.js';
import { updatePreview } from '../preview.js';
import { resetBoxSelect } from './dropdown.js';
import { setActiveType } from './type-grid.js';
import { updateRoofAxisButtons } from './roof-controls.js';

function setEditingHighlight(on) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('editing', on));
}

function setButtonsNormal() {
  dom.btnPrimary.textContent = '▶ 配置';
  dom.btnPrimary.className = 'action-btn';
  dom.btnMiddle.textContent = '⌂ 原点';
  dom.btnMiddle.className = 'action-btn';
  dom.btnSecondary.textContent = '✕ クリア';
  dom.btnSecondary.className = 'action-btn';
}

function setButtonsEdit() {
  dom.btnPrimary.textContent = '✓ 編集';
  dom.btnPrimary.className = 'action-btn edit-mode';
  dom.btnMiddle.textContent = '⑂ 派生作成';
  dom.btnMiddle.className = 'action-btn derive-mode';
  dom.btnSecondary.textContent = '🗑 削除';
  dom.btnSecondary.className = 'action-btn cancel-mode';
}

// 編集状態の解除（ハイライト・選択・ボタン表示を通常に戻す）
function leaveEditState() {
  if (state.editingIndex >= 0) registry.highlight(state.editingIndex, false);
  state.editingIndex = -1;
  resetBoxSelect();
  setButtonsNormal();
  setEditingHighlight(false);
}

export function enterNormalMode() {
  leaveEditState();
  const d = UI.defaultBox;
  setValues(d.ox, d.oy, d.oz, d.sx, d.sy, d.sz);
  updatePreview();
}

// 派生作成: 編集モードを終了し、スピナー値は維持したまま新規配置状態にする
export function startDerive() {
  const { ox, oy, oz, sx, sy, sz } = getValues();
  leaveEditState();
  setValues(ox, oy, oz, sx, sy, sz);
  updateRoofAxisButtons();
  updatePreview();
}

export function enterEditMode(idx) {
  if (state.editingIndex >= 0) registry.highlight(state.editingIndex, false);
  state.editingIndex = idx;
  registry.highlight(idx, true);

  const e = registry.get(idx);
  setValues(e.ox, e.oy, e.oz, e.sx, e.sy, e.sz);

  // roof なら entry の roofAxis/roofGable を復元。roofGable は必ず上書きする（前のエントリの状態を残さない）
  // 変更はまとめて通知し、プレビュー/ボタン表示の更新を1回にする
  batch(() => {
    if (getEntryType(e) === SHAPE_TYPE.ROOF) {
      if (e.roofAxis) state.roofAxis = normalizeRoofAxis(e.roofAxis);
      state.roofGable = !!e.roofGable;
    } else {
      state.roofGable = false;
    }
    setActiveType(getEntryType(e));
  });
  updateRoofAxisButtons();

  setButtonsEdit();
  setEditingHighlight(true);
  updatePreview();
}
