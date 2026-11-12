// 十字柱（5×5ベースで四隅1マス欠け）のフットプリント計算

/** @param {number} x @param {number} z */
export const cellKey = (x, z) => `${x},${z}`;

/** @param {import('../types.js').Cell2[]} cells @returns {Set<string>} */
export function toCellSet(cells) {
  return new Set(cells.map(([x, z]) => cellKey(x, z)));
}

// 戻り値: [[lx, lz], ...]   sx/sz が 2 以下のときは欠けなしの全マス
/** @param {number} sx @param {number} sz @returns {import('../types.js').Cell2[]} */
export function crossPillarFootprint(sx, sz) {
  /** @type {import('../types.js').Cell2[]} */
  const cells = [];
  if (sx <= 2 || sz <= 2) {
    for (let lx = 0; lx < sx; lx++)
      for (let lz = 0; lz < sz; lz++)
        cells.push([lx, lz]);
    return cells;
  }
  const excluded = new Set([
    cellKey(0, 0), cellKey(sx - 1, 0), cellKey(0, sz - 1), cellKey(sx - 1, sz - 1),
  ]);
  for (let lx = 0; lx < sx; lx++)
    for (let lz = 0; lz < sz; lz++)
      if (!excluded.has(cellKey(lx, lz))) cells.push([lx, lz]);
  return cells;
}

// 「辺」＝ ly=0 or ly=sy-1（上下面） ∪ フットプリント外周セル（隣に空きがある）
/** @param {Set<string>} cellSet @param {number} lx @param {number} lz @param {number} ly @param {number} sy */
export function isCrossPillarEdgeVoxel(cellSet, lx, lz, ly, sy) {
  if (ly === 0 || ly === sy - 1) return true;
  const neighbors = [[lx - 1, lz], [lx + 1, lz], [lx, lz - 1], [lx, lz + 1]];
  for (const [nx, nz] of neighbors) {
    if (!cellSet.has(cellKey(nx, nz))) return true;
  }
  return false;
}

// 辺ボクセルの [lx, ly, lz] 一覧
/** @param {import('../types.js').Cell2[]} cells @param {Set<string>} cellSet @param {number} sy
 * @returns {import('../types.js').Voxel3[]} */
export function computeCrossPillarEdgeVoxels(cells, cellSet, sy) {
  /** @type {import('../types.js').Voxel3[]} */
  const voxels = [];
  for (const [lx, lz] of cells) {
    for (let ly = 0; ly < sy; ly++) {
      if (isCrossPillarEdgeVoxel(cellSet, lx, lz, ly, sy)) voxels.push([lx, ly, lz]);
    }
  }
  return voxels;
}
