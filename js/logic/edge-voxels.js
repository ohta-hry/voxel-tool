import { VOXEL } from '../config.js';

// 直方体の「辺」に属するボクセル座標 [lx, ly, lz] を列挙する
// 辺の定義: 3軸のうち2軸以上が端（0 or max-1）
export function computeEdgeVoxels(sx, sy, sz) {
  const voxels = [];
  const isEdgeCoord = (v, max) => v === 0 || v === max - 1;

  for (let lx = 0; lx < sx; lx++)
    for (let ly = 0; ly < sy; ly++)
      for (let lz = 0; lz < sz; lz++) {
        const ex = isEdgeCoord(lx, sx);
        const ey = isEdgeCoord(ly, sy);
        const ez = isEdgeCoord(lz, sz);
        if ((ex ? 1 : 0) + (ey ? 1 : 0) + (ez ? 1 : 0) >= VOXEL.edgeAxisThreshold) {
          voxels.push([lx, ly, lz]);
        }
      }
  return voxels;
}
