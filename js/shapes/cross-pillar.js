import * as THREE from 'three';
import { VOXEL } from '../config.js';
import { SHAPE_TYPE } from '../constants.js';
import { crossPillarFootprint, toCellSet, computeCrossPillarEdgeVoxels } from '../logic/footprint.js';
import { computeCulledCellData } from '../logic/culled-cell.js';
import { computeCrossPillarOutlinePoints } from '../logic/outline.js';
import { TYPE_SVGS } from '../type-icons.js';
import { setCellGroupVisibility, highlightCellGroup, setCellGroupColor } from './cell-group.js';

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

// 十字柱: 5×5ベースで四隅1マス欠けの柱
/** @type {import('../types.js').ShapeDefinition} */
export const crossPillarShape = {
  id: SHAPE_TYPE.CROSS_PILLAR,
  label: '十字柱',
  desc: '角1マス欠け\n直方体亜種',
  icon: TYPE_SVGS.cross_pillar,
  category: 'solid',

  // 各フットプリントセルを1×sy×1の直方体にした Group
  // confirmed=true のとき内部面カリング＋外形輪郭エッジを適用
  build({ ox, oy, oz, sx, sy, sz }, { mat, edgeMat, confirmed, wireframe }) {
    const cells = crossPillarFootprint(sx, sz);
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
      mesh.visible = !wireframe;

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
  },

  setVisibility: setCellGroupVisibility,
  highlight: highlightCellGroup,
  setColor: setCellGroupColor,

  edgeVoxels({ sx, sy, sz }) {
    const cells = crossPillarFootprint(sx, sz);
    return computeCrossPillarEdgeVoxels(cells, toCellSet(cells), sy);
  },

  typeLabel: () => ' [十字柱]',
};
