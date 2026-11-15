import { cellKey } from './footprint.js';

// 楕円(ellipse)のセル計算。Python の py/voxel_schem/geometry/ellipse.py と同じ結果になること
// （tests/fixtures/ellipse_cases.json を両方のテストが確認する）。
// セル(lx, lz)の中心は (lx+0.5, lz+0.5)、楕円の中心と半軸は (sx/2, sz/2)。
// 比較は整数だけで行う（中心・座標を2倍した値で比べ、小数の誤差を避ける）。

// 楕円に含まれるセル: セル中心が楕円の内側または境界上にあるセル。戻り値: [[lx, lz], ...]
/** @param {number} sx @param {number} sz @returns {import('../types.js').Cell2[]} */
export function ellipseFootprint(sx, sz) {
  /** @type {import('../types.js').Cell2[]} */
  const cells = [];
  for (let lx = 0; lx < sx; lx++) {
    const dx = 2 * lx + 1 - sx; // 2*(セル中心 - 楕円中心)
    for (let lz = 0; lz < sz; lz++) {
      const dz = 2 * lz + 1 - sz;
      if (dx * dx * sz * sz + dz * dz * sx * sx <= sx * sx * sz * sz) cells.push([lx, lz]);
    }
  }
  return cells;
}

// 軸ごとの条件（B用の辺判定）
//  ・中心 <= 座標（セル中心が楕円の中心と同じか大きい側）: 軸方向に +1 のセルが存在しない
//  ・座標 <= 中心（同じか小さい側）: 軸方向に -1 のセルが存在しない
//  ちょうど中心と等しいとき（奇数サイズの中央）は両方を満たす必要がある
/** @param {Set<string>} cellSet @param {number} lx @param {number} lz @param {0|1} axis @param {number} size */
function axisCondition(cellSet, lx, lz, axis, size) {
  const twice = 2 * (axis === 0 ? lx : lz) + 1; // 2*セル中心
  const plus = axis === 0 ? cellKey(lx + 1, lz) : cellKey(lx, lz + 1);
  const minus = axis === 0 ? cellKey(lx - 1, lz) : cellKey(lx, lz - 1);
  if (size <= twice && cellSet.has(plus)) return false;
  if (twice <= size && cellSet.has(minus)) return false;
  return true;
}

// 設置タイプ B で置くセル（キーは `${lx},${lz}`）
//  top: 最下層・最上層 = x条件 または z条件 / mid: それ以外の層 = x条件 かつ z条件
/** @param {number} sx @param {number} sz @returns {{ cells: import('../types.js').Cell2[], top: Set<string>, mid: Set<string> }} */
export function ellipseEdgeCells(sx, sz) {
  const cells = ellipseFootprint(sx, sz);
  const cellSet = new Set(cells.map(([x, z]) => cellKey(x, z)));
  const top = new Set();
  const mid = new Set();
  for (const [lx, lz] of cells) {
    const xOk = axisCondition(cellSet, lx, lz, 0, sx);
    const zOk = axisCondition(cellSet, lx, lz, 1, sz);
    if (xOk || zOk) top.add(cellKey(lx, lz));
    if (xOk && zOk) mid.add(cellKey(lx, lz));
  }
  return { cells, top, mid };
}

// 辺ボクセルの [lx, ly, lz] 一覧（Python の設置タイプ B と同じセル）
/** @param {number} sx @param {number} sy @param {number} sz @returns {import('../types.js').Voxel3[]} */
export function computeEllipseEdgeVoxels(sx, sy, sz) {
  const { cells, top, mid } = ellipseEdgeCells(sx, sz);
  /** @type {import('../types.js').Voxel3[]} */
  const voxels = [];
  for (let ly = 0; ly < sy; ly++) {
    const edge = (ly === 0 || ly === sy - 1) ? top : mid;
    for (const [lx, lz] of cells) {
      if (edge.has(cellKey(lx, lz))) voxels.push([lx, ly, lz]);
    }
  }
  return voxels;
}

// サイズ欄の変更に伴う連動（isCircle / is_fixed_center）。入力欄の値 {ox,oy,oz,sx,sy,sz} から新しい値を返す
//  ・isCircle: x と z のサイズを同じにする（片方が増減したら、もう片方も同じ値になる）
//  ・fixedCenter: サイズが d 増減した軸は、位置を d/2 だけ逆に動かす（+2 → -1）。位置は minOrigin 未満にならない
//    奇数の増減（直接入力など）は端数を切り捨てる
// 引数: id = 変更した欄 ('sx'|'sy'|'sz')、newSize = 新しい値
/** @param {{ ox: number, oy: number, oz: number, sx: number, sy: number, sz: number }} values
 * @param {string} id @param {number} newSize
 * @param {{ isCircle: boolean, fixedCenter: boolean, minSize: number, minOrigin: number }} opts */
export function resizeEllipse(values, id, newSize, { isCircle, fixedCenter, minSize, minOrigin }) {
  const next = { ...values };
  const size = Math.max(minSize, newSize);
  if (id === 'sy') {
    next.sy = size;
    return next;
  }
  const axes = isCircle ? ['x', 'z'] : [id === 'sx' ? 'x' : 'z'];
  for (const axis of axes) {
    const sizeKey = /** @type {'sx'|'sz'} */ ('s' + axis);
    const originKey = /** @type {'ox'|'oz'} */ ('o' + axis);
    const delta = size - values[sizeKey];
    next[sizeKey] = size;
    if (fixedCenter) next[originKey] = Math.max(minOrigin, values[originKey] - Math.trunc(delta / 2));
  }
  return next;
}
