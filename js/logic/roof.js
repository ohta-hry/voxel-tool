import { VOXEL } from '../config.js';
import { ROOF_AXIS } from '../constants.js';

/** @type {Set<string>} */
const VALID_AXES = new Set(Object.values(ROOF_AXIS));

// 'x' のような符号なし旧データを '+x' に補正する。不正値は fallback
/** @param {string} [value]
 * @param {import('../types.js').RoofAxis} [fallback]
 * @returns {import('../types.js').RoofAxis} */
export function normalizeRoofAxis(value, fallback = ROOF_AXIS.PLUS_X) {
  if (!value) return fallback;
  if (VALID_AXES.has(value)) return /** @type {import('../types.js').RoofAxis} */ (value);
  const normalized = '+' + value;
  return (normalized === ROOF_AXIS.PLUS_X || normalized === ROOF_AXIS.PLUS_Z) ? normalized : fallback;
}

// DDAで屋根ボクセルを生成する
// axis: '+x'|'-x'|'+z'|'-z'
// +x: ステップ0(x=0)が低く, ステップsxが高い → 低→高へ
// -x: ステップ0(x=0)が高く, ステップsxが低い → 高→低へ（reversed）
/** @param {number} sx @param {number} sy @param {number} sz
 * @param {string} axis  '+x'|'-x'|'+z'|'-z'
 * @returns {import('../types.js').VoxelXYZ[]} */
export function computeRoofVoxels(sx, sy, sz, axis) {
  /** @type {import('../types.js').VoxelXYZ[]} */
  const voxels = [];
  const baseAxis = axis.slice(-1); // 'x' or 'z'
  const reversed = axis[0] === '-';
  const steps = (baseAxis === 'x') ? sx : sz;
  const span = (baseAxis === 'x') ? sz : sx;

  for (let i = 0; i < steps; i++) {
    const si = reversed ? (steps - 1 - i) : i;
    const yBot = Math.floor(si * sy / steps);
    const yTop = Math.floor((si + 1) * sy / steps);
    const thick = Math.max(VOXEL.unit, yTop - yBot);
    for (let j = 0; j < span; j++) {
      for (let t = 0; t < thick; t++) {
        const ly = yBot + t;
        const lx = (baseAxis === 'x') ? i : j;
        const lz = (baseAxis === 'x') ? j : i;
        voxels.push({ lx, ly, lz });
      }
    }
  }
  return voxels;
}

// 両屋根用: 両サイドのvoxelを結合して返す（重複座標はSetで除去）
/** @param {number} sx @param {number} sy @param {number} sz
 * @param {string} axis  '+x'|'-x'|'+z'|'-z'
 * @returns {import('../types.js').VoxelXYZ[]} */
export function computeGableVoxels(sx, sy, sz, axis) {
  const baseAxis = axis.slice(-1);
  const steps = (baseAxis === 'x') ? sx : sz;
  const half = Math.ceil(steps / 2);

  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {import('../types.js').VoxelXYZ[]} */
  const voxels = [];
  /** @param {import('../types.js').VoxelXYZ[]} list */
  const addVoxels = (list) => {
    for (const v of list) {
      const k = `${v.lx},${v.ly},${v.lz}`;
      if (!seen.has(k)) { seen.add(k); voxels.push(v); }
    }
  };

  if (baseAxis === 'x') {
    const leftRaw = computeRoofVoxels(half, sy, sz, '+x');
    const rightRaw = computeRoofVoxels(half, sy, sz, '-x');
    addVoxels(leftRaw);
    addVoxels(rightRaw.map(v => ({ ...v, lx: v.lx + (sx - half) })));
  } else {
    const leftRaw = computeRoofVoxels(sx, sy, half, '+z');
    const rightRaw = computeRoofVoxels(sx, sy, half, '-z');
    addVoxels(leftRaw);
    addVoxels(rightRaw.map(v => ({ ...v, lz: v.lz + (sz - half) })));
  }
  return voxels;
}
