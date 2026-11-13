import { UI } from '../config.js';
import { dom } from '../dom.js';
import { state } from '../state.js';
import { registry } from '../registry.js';
import { autoSave } from '../autosave.js';
import { setValues, readShapeSpec } from '../form.js';
import { hexToInt } from '../utils.js';
import { updatePreview } from '../preview.js';
import { refreshDropdown } from './dropdown.js';
import { closeDrawer } from './drawer.js';
import { askConfirm } from './confirm.js';
import { enterNormalMode, enterEditMode, startDerive } from './edit-mode.js';

const CONFIRM_MESSAGE = '本当に消す？';

// ── 各操作（データ変更 → 画面反映 → 保存 の順でまとめる）──────────────────────
function place() {
  registry.add({ ...readShapeSpec(), color: hexToInt(state.activeColor) });
  refreshDropdown();
  autoSave();
  closeDrawer();
  updatePreview();
}

function confirmEdit() {
  if (state.editingIndex < 0) return;
  const savedIdx = state.editingIndex;
  registry.update(savedIdx, readShapeSpec());
  refreshDropdown();
  autoSave();
  enterNormalMode();
  dom.boxSelect.value = String(savedIdx);
}

function deleteEditingEntry() {
  const idx = state.editingIndex;
  askConfirm(dom.btnSecondary, CONFIRM_MESSAGE, () => {
    registry.remove(idx);
    registry.refreshLabels();
    refreshDropdown();
    autoSave();
    enterNormalMode();
    updatePreview();
  });
}

function clearAll() {
  askConfirm(dom.btnSecondary, CONFIRM_MESSAGE, () => {
    registry.clear();
    refreshDropdown();
    autoSave();
    updatePreview();
  });
}

/** 配置・編集確定・派生・削除・クリア・編集対象選択のボタン処理を配線する */
export function initActions() {
  const onPrimary = () => (state.editingIndex >= 0 ? confirmEdit() : place());

  dom.btnPrimary.addEventListener('click', onPrimary);
  dom.btnApplyType.addEventListener('click', onPrimary);

  // タブBの適用ボタン: 編集中のみ反映（非編集時は何もしない）
  dom.btnApplyColor.addEventListener('click', () => {
    if (state.editingIndex >= 0) confirmEdit();
  });

  // 中央ボタン: 編集中=派生作成 / 通常=全スピナーを原点・初期サイズにリセット
  dom.btnMiddle.addEventListener('click', () => {
    if (state.editingIndex >= 0) {
      startDerive();
    } else {
      const d = UI.defaultBox;
      setValues(d.ox, d.oy, d.oz, d.sx, d.sy, d.sz);
      updatePreview();
    }
  });

  // 右ボタン: 編集中=削除 / 通常=全削除（どちらも確認付き）
  dom.btnSecondary.addEventListener('click', () => {
    if (dom.btnSecondary.dataset.confirming === '1') return;
    if (state.editingIndex >= 0) {
      deleteEditingEntry();
    } else if (registry.count > 0) {
      clearAll();
    }
  });

  // 編集対象の選択
  dom.boxSelect.addEventListener('change', () => {
    const val = dom.boxSelect.value;
    if (val === '') {
      if (state.editingIndex >= 0) enterNormalMode();
      return;
    }
    enterEditMode(parseInt(val));
  });
}
