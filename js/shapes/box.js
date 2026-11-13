import * as THREE from 'three';
import { THEME } from '../config.js';
import { SHAPE_TYPE } from '../constants.js';
import { SELECT_EMAT, createEdgeMaterial } from '../materials.js';
import { computeEdgeVoxels } from '../logic/edge-voxels.js';
import { TYPE_SVGS } from '../type-icons.js';

// 直方体
/** @type {import('../types.js').ShapeDefinition} */
export const boxShape = {
  id: SHAPE_TYPE.BOX,
  label: '直方体',
  desc: '通常の直方体',
  icon: TYPE_SVGS.box,
  category: 'solid', // 編集中に変更できるのは同じ category 内のみ

  build({ ox, oy, oz, sx, sy, sz }, { mat, edgeMat }) {
    const geo = new THREE.BoxGeometry(sx, sy, sz);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(ox + sx / 2, oy + sy / 2, oz + sz / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
    edges.visible = true;
    mesh.add(edges);
    return mesh;
  },

  setVisibility(mesh, faceVisible, edgeVisible) {
    mesh.visible = faceVisible;
    if (mesh.children[0]) mesh.children[0].visible = edgeVisible;
  },

  highlight(obj, on) {
    const mesh = /** @type {THREE.Mesh} */ (obj);
    const edgeChild = /** @type {THREE.LineSegments} */ (mesh.children[0]);
    if (!edgeChild) return;
    edgeChild.material = on ? SELECT_EMAT : createEdgeMaterial();
    /** @type {THREE.Material} */ (mesh.material).opacity = on ? THEME.opacity.selected : THEME.opacity.solid;
  },

  setColor(obj, color) {
    /** @type {THREE.MeshLambertMaterial} */ (/** @type {THREE.Mesh} */ (obj).material).color.setHex(color);
  },

  // 辺ボクセルモードの対象（無い形状はモードの影響を受けない）
  edgeVoxels: ({ sx, sy, sz }) => computeEdgeVoxels(sx, sy, sz),

  typeLabel: () => '',
};
