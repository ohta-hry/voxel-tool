import { PILLAR_AXIS } from '../constants.js';

/** @type {Set<string>} */
const VALID_AXES = new Set(Object.values(PILLAR_AXIS));

// ピラーの軸を 'x'|'y'|'z' に補正する。不正値は fallback（縦）。Python の normalize_pillar_axis と同じ規則
/** @param {unknown} [value]
 * @param {import('../types.js').PillarAxis} [fallback]
 * @returns {import('../types.js').PillarAxis} */
export function normalizePillarAxis(value, fallback = PILLAR_AXIS.Y) {
  return typeof value === 'string' && VALID_AXES.has(value)
    ? /** @type {import('../types.js').PillarAxis} */ (value)
    : fallback;
}

// 軸に対応するサイズ（x→sx / y→sy / z→sz）が「長さ」
/** @param {string} axis @param {{ sx: number, sy: number, sz: number }} sizes */
export function pillarLength(axis, { sx, sy, sz }) {
  return axis === PILLAR_AXIS.X ? sx : axis === PILLAR_AXIS.Z ? sz : sy;
}

// 長さ → サイズ（軸以外は 1 に固定）
/** @param {string} axis @param {number} length */
export function pillarSizes(axis, length) {
  return {
    sx: axis === PILLAR_AXIS.X ? length : 1,
    sy: axis === PILLAR_AXIS.Y ? length : 1,
    sz: axis === PILLAR_AXIS.Z ? length : 1,
  };
}
