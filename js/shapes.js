import * as THREE from 'three';
import { THEME, VOXEL } from './config.js';
import { SHAPE_TYPE } from './constants.js';
import { state } from './state.js';
import { createSolidMaterial, createEdgeMaterial, UNIT_BOX_GEO, UNIT_EDGE_GEO } from './materials.js';
import { crossPillarFootprint, toCellSet, computeCrossPillarEdgeVoxels } from './logic/footprint.js';
import { computeRoofVoxels, computeGableVoxels } from './logic/roof.js';
import { computeEdgeVoxels } from './logic/edge-voxels.js';
import { computeCulledCellData } from './logic/culled-cell.js';
import { computeCrossPillarOutlinePoints } from './logic/outline.js';

// ── 直方体 ───────────────────────────────────────────────────────────────────
function makeBoxMesh(ox, oy, oz, sx, sy, sz, mat, edgeMat) {
  const geo = new THREE.BoxGeometry(sx, sy, sz);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(ox + sx / 2, oy + sy / 2, oz + sz / 2);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  // ワイヤーフレームモード時は面を非表示（エッジは常に表示）
  mesh.visible = !state.wireframeMode;
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
  edges.visible = true;
  mesh.add(edges);
  return mesh;
}

// ── 十字柱 ───────────────────────────────────────────────────────────────────
// 確定済みのみ Face Culling を適用。プレビューは通常の BoxGeometry
function makeCulledCellGeometry(cellSet, lx, lz, sy, isConfirmed) {
  if (!isConfirmed) return new THREE.BoxGeometry(VOXEL.unit, sy, VOXEL.unit);

  const d = computeCulledCellData(cellSet, lx, lz, sy);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(d.positions, VOXEL.bufferPositionItemSize));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(d.normals, VOXEL.bufferPositionItemSize));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(d.uvs, VOXEL.bufferUvItemSize));
  geo.setIndex(d.indices);
  return geo;
}

// 各フットプリントセルを1×sy×1の直方体にした Group
// isConfirmed=true のとき内部面カリング＋外形輪郭エッジを適用
function makeCrossPillarMesh(ox, oy, oz, sx, sy, sz, mat, edgeMat, isConfirmed = false) {
  const cells = crossPillarFootprint(sx, sz);
  const cellSet = toCellSet(cells);
  const group = new THREE.Group();
  group.userData.isCrossPillar = true;

  for (const [lx, lz] of cells) {
    const cellGeo = makeCulledCellGeometry(cellSet, lx, lz, sy, isConfirmed);
    const mesh = new THREE.Mesh(cellGeo, mat.clone());
    // カリング済みジオメトリは底面が y=0、BoxGeometry は中心原点
    const posY = isConfirmed ? oy : oy + sy / 2;
    mesh.position.set(ox + lx + VOXEL.half, posY, oz + lz + VOXEL.half);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.visible = !state.wireframeMode;

    if (!isConfirmed) {
      // プレビュー時: 各セルに EdgesGeometry
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cellGeo), edgeMat.clone());
      edges.visible = true;
      mesh.add(edges);
    }
    group.add(mesh);
  }

  if (isConfirmed) {
    // 確定済み: 外周シルエットを1つの LineSegments として group 座標系に追加
    const pts = computeCrossPillarOutlinePoints(cells, cellSet, ox, oy, oz, sy);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, VOXEL.bufferPositionItemSize));
    const outline = new THREE.LineSegments(geo, edgeMat.clone());
    outline.userData.isOutlineEdge = true;
    group.add(outline);
  }

  group.visible = true;
  return group;
}

// ── 屋根 ─────────────────────────────────────────────────────────────────────
// 注: 勾配軸・両屋根は state.roofAxis / state.roofGable を参照する（段階3で引数化予定）
function makeRoofMesh(ox, oy, oz, sx, sy, sz, mat, edgeMat) {
  const voxels = state.roofGable
    ? computeGableVoxels(sx, sy, sz, state.roofAxis)
    : computeRoofVoxels(sx, sy, sz, state.roofAxis);

  const group = new THREE.Group();
  group.userData.isRoof = true;

  for (const { lx, ly, lz } of voxels) {
    const mesh = new THREE.Mesh(UNIT_BOX_GEO, mat.clone());
    mesh.position.set(ox + lx + VOXEL.half, oy + ly + VOXEL.half, oz + lz + VOXEL.half);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.visible = !state.wireframeMode;
    const edges = new THREE.LineSegments(UNIT_EDGE_GEO, edgeMat.clone());
    edges.visible = true;
    mesh.add(edges);
    group.add(mesh);
  }
  group.visible = true;
  return group;
}

export function makeShapeMesh(type, ox, oy, oz, sx, sy, sz, mat, edgeMat, isConfirmed = false) {
  if (type === SHAPE_TYPE.CROSS_PILLAR) return makeCrossPillarMesh(ox, oy, oz, sx, sy, sz, mat, edgeMat, isConfirmed);
  if (type === SHAPE_TYPE.ROOF) return makeRoofMesh(ox, oy, oz, sx, sy, sz, mat, edgeMat);
  return makeBoxMesh(ox, oy, oz, sx, sy, sz, mat, edgeMat);
}

// ── 辺ボクセル表示用グループ ─────────────────────────────────────────────────
// voxels: [[lx, ly, lz], ...] を小箱の集合として並べる
function makeEdgeVoxelCubes(ox, oy, oz, voxels, color) {
  const group = new THREE.Group();
  const mat = createSolidMaterial(color, { opacity: THEME.opacity.edgeVoxel });
  const edgeMat = createEdgeMaterial(THEME.color.defaultEdge, { opacity: THEME.opacity.edgeVoxelLine });

  for (const [lx, ly, lz] of voxels) {
    const cube = new THREE.Mesh(UNIT_BOX_GEO, mat.clone());
    cube.position.set(ox + lx + VOXEL.half, oy + ly + VOXEL.half, oz + lz + VOXEL.half);
    cube.castShadow = true;
    cube.add(new THREE.LineSegments(UNIT_EDGE_GEO, edgeMat.clone()));
    group.add(cube);
  }
  group.userData.isEdgeVoxelGroup = true;
  return group;
}

export function makeEdgeVoxelGroupForEntry(entry) {
  const { ox, oy, oz, sx, sy, sz, color } = entry;
  if (entry.type === SHAPE_TYPE.CROSS_PILLAR) {
    const cells = crossPillarFootprint(sx, sz);
    const voxels = computeCrossPillarEdgeVoxels(cells, toCellSet(cells), sy);
    return makeEdgeVoxelCubes(ox, oy, oz, voxels, color);
  }
  return makeEdgeVoxelCubes(ox, oy, oz, computeEdgeVoxels(sx, sy, sz), color);
}
