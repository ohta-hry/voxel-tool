import { UI } from '../config.js';
import { state } from '../state.js';
import { inputById } from '../dom-utils.js';
import { getValues, setValues } from '../form.js';
import { getShape } from '../shapes/index.js';

// 基準点・サイズのスピナー入力の更新処理（イベントの配線は spinners.js）。
// サイズ欄の変更は、選択中の形状が持つ連動規則（shape.sizeStep / shape.resizeLinked）に従う。
// 例: 楕円の「円」（xz を同じサイズに）「中心固定」（増減幅2・位置を逆に動かす）

const isSizeId = (/** @type {string} */ id) => id.startsWith('s');

/**
 * サイズ欄 id を requested にする。形状に連動規則があれば、他の欄・基準点も更新する。
 * @param {string} id  'sx' | 'sy' | 'sz'
 * @param {number} previous  変更前の値  @param {number} requested  変更後の値
 */
function resizeInput(id, previous, requested) {
  const shape = getShape(state.activeType);
  const value = Math.max(UI.minSize, requested);
  if (shape.resizeLinked) {
    const before = { ...getValues(), [id]: previous };
    const next = shape.resizeLinked(before, id, value, state);
    setValues(next.ox, next.oy, next.oz, next.sx, next.sy, next.sz);
  } else {
    const input = inputById(id);
    input.value = String(value);
    input.dataset.prev = String(value);
  }
}

/** ±ボタン1回分。サイズ欄は形状ごとの増減幅（shape.sizeStep）を掛ける
 * @param {string} id  @param {number} direction  -1 | 1 */
export function stepInput(id, direction) {
  const input = inputById(id);
  const current = parseInt(input.value) || 0;
  if (isSizeId(id)) {
    const step = getShape(state.activeType).sizeStep?.(id, state) ?? 1;
    resizeInput(id, current, current + direction * step);
  } else {
    input.value = String(Math.max(UI.minOrigin, current + direction));
  }
}

/** 直接入力（input イベント）の後始末。最小値に直し、サイズ欄は形状の連動規則を適用する
 * @param {HTMLInputElement} input */
export function applyTypedInput(input) {
  const n = parseInt(input.value);
  if (!isSizeId(input.id)) {
    if (n < UI.minOrigin) input.value = String(UI.minOrigin);
    return;
  }
  if (n < UI.minSize) input.value = String(UI.minSize);
  if (Number.isFinite(n) && getShape(state.activeType).resizeLinked) {
    const previous = parseInt(input.dataset.prev ?? '');
    resizeInput(input.id, Number.isFinite(previous) ? previous : n, n);
  } else if (Number.isFinite(n)) {
    input.dataset.prev = String(Math.max(UI.minSize, n));
  }
}
