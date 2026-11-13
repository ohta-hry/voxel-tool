import { UI } from './config.js';
import { PRESET_COLORS } from './palette.js';
import { SHAPE_TYPE, ROOF_AXIS } from './constants.js';

// ── 共有状態ストア ────────────────────────────────────────────────────────────
// ・state.xxx = value で書き込むと、値が変わったときだけ購読者に通知される
// ・subscribe(keys, fn): fn(changedKeys) が呼ばれる。戻り値は購読解除関数
// ・batch(fn): fn 内の変更はまとめて1回だけ通知（同じ fn は1回だけ呼ばれる）
/** @type {import('./types.js').AppState} */
const data = {
  canvasX: UI.defaultCanvasSize,
  canvasZ: UI.defaultCanvasSize,

  activeType: SHAPE_TYPE.BOX,
  activeColor: PRESET_COLORS[UI.defaultColorIndex],

  // 屋根パラメータ（フォーム/プレビュー用。確定済みエントリは entry 側に持つ）
  roofAxis: ROOF_AXIS.PLUS_X,
  roofGable: false,

  edgeVoxelMode: false,

  editingIndex: -1, // -1 = 通常モード, >=0 = そのボックスを編集中
};

/** @typedef {keyof import('./types.js').AppState} StateKey */
/** @typedef {(changed: StateKey[]) => void} StateListener */

/** @type {Map<StateKey, Set<StateListener>>} */
const listeners = new Map();
/** @type {Set<StateKey>} */
const pendingKeys = new Set();
let batchDepth = 0;

/** @param {StateKey[]} keys */
function notify(keys) {
  /** @type {Map<StateListener, StateKey[]>} */
  const calls = new Map(); // fn -> 該当キー
  for (const key of keys) {
    for (const fn of listeners.get(key) ?? []) {
      if (!calls.has(fn)) calls.set(fn, []);
      calls.get(fn).push(key);
    }
  }
  for (const [fn, changed] of calls) fn(changed);
}

/** 共有状態。書き込みは変更検知付き（読み取りは通常のプロパティアクセス）
 * @type {import('./types.js').AppState} */
export const state = new Proxy(data, {
  set(target, key, value) {
    const k = /** @type {StateKey} */ (key);
    if (!(k in target)) throw new Error(`state: 未定義のキー "${String(key)}"`);
    if (target[k] === value) return true;
    /** @type {any} */ (target)[k] = value;
    if (batchDepth > 0) pendingKeys.add(k);
    else notify([k]);
    return true;
  },
});

/**
 * @param {StateKey | StateKey[]} keys
 * @param {StateListener} fn
 * @returns {() => void} 購読解除関数
 */
export function subscribe(keys, fn) {
  const list = Array.isArray(keys) ? keys : [keys];
  for (const key of list) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(fn);
  }
  return () => list.forEach(key => listeners.get(key)?.delete(fn));
}

/** @param {() => void} fn */
export function batch(fn) {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0 && pendingKeys.size > 0) {
      const keys = [...pendingKeys];
      pendingKeys.clear();
      notify(keys);
    }
  }
}
