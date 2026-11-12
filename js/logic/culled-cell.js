import { VOXEL } from '../config.js';
import { cellKey } from './footprint.js';

// 1×sy×1 のセルについて、隣接セルが存在しない方向の面だけの頂点データを返す
// （内部接触面を省いて描画負荷を削減）。Y方向（上下面）は常に残す。
// 戻り値: { positions, normals, uvs, indices }（いずれも平坦な数値配列）
/** @param {Set<string>} cellSet @param {number} lx @param {number} lz @param {number} sy
 * @returns {import('../types.js').CulledCellData} */
export function computeCulledCellData(cellSet, lx, lz, sy) {
  const hasRight = cellSet.has(cellKey(lx + 1, lz)); // +X
  const hasLeft  = cellSet.has(cellKey(lx - 1, lz)); // -X
  const hasFront = cellSet.has(cellKey(lx, lz + 1)); // +Z
  const hasBack  = cellSet.has(cellKey(lx, lz - 1)); // -Z

  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];
  const h = sy;
  const p = VOXEL.half;
  let vi = 0;

  function addFace(verts, norm, faceUVs) {
    for (const v of verts) positions.push(...v);
    for (let i = 0; i < VOXEL.faceVertexCount; i++) normals.push(...norm);
    for (const uv of faceUVs) uvs.push(...uv);
    indices.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3); // 2三角形 (CCW)
    vi += 4;
  }

  const UV_DEFAULT = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // +X 面
  if (!hasRight) addFace(
    [[p, 0, p], [p, 0, -p], [p, h, -p], [p, h, p]],
    [1, 0, 0], UV_DEFAULT
  );
  // -X 面
  if (!hasLeft) addFace(
    [[-p, 0, -p], [-p, 0, p], [-p, h, p], [-p, h, -p]],
    [-1, 0, 0], UV_DEFAULT
  );
  // +Y 面 (上: y=h)
  addFace(
    [[-p, h, p], [p, h, p], [p, h, -p], [-p, h, -p]],
    [0, 1, 0], [[0, 1], [1, 1], [1, 0], [0, 0]]
  );
  // -Y 面 (下: y=0)
  addFace(
    [[-p, 0, -p], [p, 0, -p], [p, 0, p], [-p, 0, p]],
    [0, -1, 0], UV_DEFAULT
  );
  // +Z 面
  if (!hasFront) addFace(
    [[-p, 0, p], [p, 0, p], [p, h, p], [-p, h, p]],
    [0, 0, 1], UV_DEFAULT
  );
  // -Z 面
  if (!hasBack) addFace(
    [[p, 0, -p], [-p, 0, -p], [-p, h, -p], [p, h, -p]],
    [0, 0, -1], UV_DEFAULT
  );

  return { positions, normals, uvs, indices };
}
