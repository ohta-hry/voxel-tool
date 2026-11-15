import * as THREE from 'three';
import { VOXEL } from '../config.js';
import { toCellSet } from '../logic/footprint.js';
import { computeCulledCellData } from '../logic/culled-cell.js';
import { computeCrossPillarOutlinePoints } from '../logic/outline.js';

// 確定済みのみ Face Culling を適用。プレビューは通常の BoxGeometry
function makeCulledCellGeometry(cellSet, lx, lz, sy, confirmed) {
  if (!confirmed) return new THREE.BoxGeometry(VOXEL.unit, sy, VOXEL.unit);

  const d = computeCulledCellData(cellSet, lx, lz, sy);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(d.positions, VOXEL.bufferPositionItemSize));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(d.normals, VOXEL.bufferPositionItemSize));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(d.uvs, VOXEL.bufferUvItemSize));
  geo.setIndex(d.indices);
  return geo;
}

// フットプリントのセル（[[lx, lz], ...]）を、それぞれ 1×sy×1 の柱にした Group を作る（角欠け直方体・楕円で共通）
// confirmed=true のとき内部面カリング＋外形輪郭エッジを適用
/** @param {import('../types.js').Cell2[]} cells
 * @param {{ ox: number, oy: number, oz: number, sy: number }} spec
 * @param {import('../types.js').ShapeBuildContext} ctx */
export function buildCellColumns(cells, { ox, oy, oz, sy }, { mat, edgeMat, confirmed }) {
  const cellSet = toCellSet(cells);
  const group = new THREE.Group();

  for (const [lx, lz] of cells) {
    const cellGeo = makeCulledCellGeometry(cellSet, lx, lz, sy, confirmed);
    const mesh = new THREE.Mesh(cellGeo, mat.clone());
    // カリング済みジオメトリは底面が y=0、BoxGeometry は中心原点
    const posY = confirmed ? oy : oy + sy / 2;
    mesh.position.set(ox + lx + VOXEL.half, posY, oz + lz + VOXEL.half);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    if (!confirmed) {
      // プレビュー時: 各セルに EdgesGeometry
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cellGeo), edgeMat.clone());
      edges.visible = true;
      mesh.add(edges);
    }
    group.add(mesh);
  }

  if (confirmed) {
    // 確定済み: 外周シルエットを1つの LineSegments として追加
    const pts = computeCrossPillarOutlinePoints(cells, cellSet, ox, oy, oz, sy);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, VOXEL.bufferPositionItemSize));
    const outline = new THREE.LineSegments(geo, edgeMat.clone());
    outline.userData.isOutlineEdge = true;
    group.add(outline);
  }
  return group;
}
