import * as THREE from 'three';
import { VOXEL } from '../config.js';
import { SHAPE_TYPE } from '../constants.js';
import { computeRoofVoxels, computeGableVoxels, normalizeRoofAxis } from '../logic/roof.js';
import { UNIT_BOX_GEO, UNIT_EDGE_GEO } from '../materials.js';
import { TYPE_SVGS } from '../type-icons.js';
import { setCellGroupVisibility, highlightCellGroup, setCellGroupColor } from './cell-group.js';

// 屋根（DDA平面）。形状固有パラメータ params = { axis: '+x'|'-x'|'+z'|'-z', gable: boolean }
/** @type {import('../types.js').ShapeDefinition} */
export const roofShape = {
  id: SHAPE_TYPE.ROOF,
  label: '屋根',
  desc: '片流れ屋根\n(DDA平面)',
  icon: TYPE_SVGS.roof,
  category: 'roof',
  controlsId: 'roof-axis-row', // 選択中のみ表示する専用UI

  build({ ox, oy, oz, sx, sy, sz, params }, { mat, edgeMat, wireframe }) {
    const voxels = params.gable
      ? computeGableVoxels(sx, sy, sz, params.axis)
      : computeRoofVoxels(sx, sy, sz, params.axis);

    const group = new THREE.Group();
    for (const { lx, ly, lz } of voxels) {
      const mesh = new THREE.Mesh(UNIT_BOX_GEO, mat.clone());
      mesh.position.set(ox + lx + VOXEL.half, oy + ly + VOXEL.half, oz + lz + VOXEL.half);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.visible = !wireframe;
      const edges = new THREE.LineSegments(UNIT_EDGE_GEO, edgeMat.clone());
      edges.visible = true;
      mesh.add(edges);
      group.add(mesh);
    }
    return group;
  },

  setVisibility: setCellGroupVisibility,
  highlight: highlightCellGroup,
  setColor: setCellGroupColor,

  // edgeVoxels なし: 辺ボクセルモードの影響を受けない

  params: {
    normalize: p => ({ axis: normalizeRoofAxis(p?.axis), gable: !!p?.gable }),
    fromState: state => ({ axis: state.roofAxis, gable: state.roofGable }),
    // 編集開始時: このエントリの値をUI状態へ反映
    toState(p, state) { state.roofAxis = p.axis; state.roofGable = p.gable; },
    // 別形状を編集開始したとき: 前のエントリの両屋根状態を残さない
    reset(state) { state.roofGable = false; },
    // 保存形式（従来の roofAxis / roofGable キーを維持）
    serialize: p => ({ roofAxis: p.axis, roofGable: p.gable }),
    deserialize: raw => ({ axis: normalizeRoofAxis(raw.roofAxis), gable: !!raw.roofGable }),
  },

  typeLabel: entry => ` [屋根(${entry.params.axis})]`,
};
