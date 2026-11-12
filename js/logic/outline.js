import { cellKey } from './footprint.js';

// cross_pillar の外形輪郭エッジ（線分の端点を平坦に並べた配列）を返す
//  ・上面(y=sy)・下面(y=0)の外周水平線
//  ・真の凸コーナー点のみ垂直線(y=0〜sy)
//
// 凸コーナーの判定:
//   格子点(px, pz)を共有する4セル領域のうち存在するセル数が奇数 → 折れ点
//   偶数（0 / 2 / 4）→ 真っ直ぐな辺 or 内部点
/** @param {import('../types.js').Cell2[]} cells @param {Set<string>} cellSet
 * @param {number} ox @param {number} oy @param {number} oz @param {number} sy
 * @returns {number[]} 線分端点を平坦に並べた配列（6要素=1線分） */
export function computeCrossPillarOutlinePoints(cells, cellSet, ox, oy, oz, sy) {
  const pts = [];
  const addSeg = (ax, ay, az, bx, by, bz) => {
    pts.push(ax + ox, ay + oy, az + oz, bx + ox, by + oy, bz + oz);
  };

  // 水平外周辺（上下面）
  for (const [lx, lz] of cells) {
    if (!cellSet.has(cellKey(lx + 1, lz))) {
      const x = lx + 1, z0 = lz, z1 = lz + 1;
      addSeg(x, 0, z0, x, 0, z1);
      addSeg(x, sy, z0, x, sy, z1);
    }
    if (!cellSet.has(cellKey(lx - 1, lz))) {
      const x = lx, z0 = lz, z1 = lz + 1;
      addSeg(x, 0, z0, x, 0, z1);
      addSeg(x, sy, z0, x, sy, z1);
    }
    if (!cellSet.has(cellKey(lx, lz + 1))) {
      const z = lz + 1, x0 = lx, x1 = lx + 1;
      addSeg(x0, 0, z, x1, 0, z);
      addSeg(x0, sy, z, x1, sy, z);
    }
    if (!cellSet.has(cellKey(lx, lz - 1))) {
      const z = lz, x0 = lx, x1 = lx + 1;
      addSeg(x0, 0, z, x1, 0, z);
      addSeg(x0, sy, z, x1, sy, z);
    }
  }

  // 垂直線: 凸コーナー点のみ
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [lx, lz] of cells) {
    if (lx < minX) minX = lx;
    if (lx > maxX) maxX = lx;
    if (lz < minZ) minZ = lz;
    if (lz > maxZ) maxZ = lz;
  }
  for (let px = minX; px <= maxX + 1; px++) {
    for (let pz = minZ; pz <= maxZ + 1; pz++) {
      const c00 = cellSet.has(cellKey(px - 1, pz - 1)) ? 1 : 0;
      const c10 = cellSet.has(cellKey(px,     pz - 1)) ? 1 : 0;
      const c01 = cellSet.has(cellKey(px - 1, pz    )) ? 1 : 0;
      const c11 = cellSet.has(cellKey(px,     pz    )) ? 1 : 0;
      if ((c00 + c10 + c01 + c11) % 2 === 1) {
        addSeg(px, 0, pz, px, sy, pz);
      }
    }
  }
  return pts;
}
