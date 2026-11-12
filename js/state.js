import { UI } from './config.js';
import { PRESET_COLORS } from './palette.js';
import { SHAPE_TYPE, ROOF_AXIS } from './constants.js';

// ── 共有状態ストア ────────────────────────────────────────────────────────────
// ・state.xxx = value で書き込むと、値が変わったときだけ購読者に通知される
// ・subscribe(keys, fn): fn(changedKeys) が呼ばれる。戻り値は購読解除関数
// ・batch(fn): fn 内の変更はまとめて1回だけ通知（同じ fn は1回だけ呼ばれる）
const data = {
  canvasX: UI.defaultCanvasSize,
  canvasZ: UI.defaultCanvasSize,

  activeType: SHAPE_TYPE.BOX,
  activeColor: PRESET_COLORS[UI.defaultColorIndex],

  // 屋根パラメータ（フォーム/プレビュー用。確定済みエントリは entry 側に持つ）
  roofAxis: ROOF_AXIS.PLUS_X,
  roofGable: false,

  wireframeMode: false,
  edgeVoxelMode: false,

  editingIndex: -1, // -1 = 通常モード, >=0 = そのボックスを編集中
};

const listeners = new Map(); // key -> Set<fn>
const pendingKeys = new Set();
let batchDepth = 0;

function notify(keys) {
  const calls = new Map(); // fn -> 該当キー
  for (const key of keys) {
    for (const fn of listeners.get(key) ?? []) {
      if (!calls.has(fn)) calls.set(fn, []);
      calls.get(fn).push(key);
    }
  }
  for (const [fn, changed] of calls) fn(changed);
}

export const state = new Proxy(data, {
  set(target, key, value) {
    if (!(key in target)) throw new Error(`state: 未定義のキー "${String(key)}"`);
    if (target[key] === value) return true;
    target[key] = value;
    if (batchDepth > 0) pendingKeys.add(key);
    else notify([key]);
    return true;
  },
});

export function subscribe(keys, fn) {
  const list = Array.isArray(keys) ? keys : [keys];
  for (const key of list) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(fn);
  }
  return () => list.forEach(key => listeners.get(key)?.delete(fn));
}

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
