import { VOXEL } from '../config.js';
import { ROOF_AXIS } from '../constants.js';

const VALID_AXES = new Set(Object.values(ROOF_AXIS));

// 'x' のような符号なし旧データを '+x' に補正する
export function normalizeRoofAxis(value) {
  return VALID_AXES.has(value) ? value : '+' + value;
}

// DDAで屋根ボクセルを生成する
// axis: '+x'|'-x'|'+z'|'-z'
// +x: ステップ0(x=0)が低く, ステップsxが高い → 低→高へ
// -x: ステップ0(x=0)が高く, ステップsxが低い → 高→低へ（reversed）
export function computeRoofVoxels(sx, sy, sz, axis) {
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
export function computeGableVoxels(sx, sy, sz, axis) {
  const baseAxis = axis.slice(-1);
  const steps = (baseAxis === 'x') ? sx : sz;
  const half = Math.ceil(steps / 2);

  const seen = new Set();
  const voxels = [];
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
