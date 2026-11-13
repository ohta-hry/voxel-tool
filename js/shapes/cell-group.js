import { THEME } from '../config.js';
import { SELECT_EMAT, createEdgeMaterial } from '../materials.js';

// 複数セルを Group にまとめる形状（十字柱・屋根）共通の表示/強調/着色処理。
// Group の子 = 各セルの Mesh（+ 任意で外形輪郭の LineSegments: userData.isOutlineEdge）

/** @param {import('three').Object3D} child */
const isOutline = child => !!(child.userData && child.userData.isOutlineEdge);

/** @param {import('three').Object3D} group @param {boolean} faceVisible @param {boolean} edgeVisible */
export function setCellGroupVisibility(group, faceVisible, edgeVisible) {
  for (const child of group.children) {
    if (isOutline(child)) {
      child.visible = edgeVisible;
    } else {
      child.visible = faceVisible;
      if (child.children[0]) child.children[0].visible = edgeVisible;
    }
  }
}

/** @param {import('three').Object3D} group @param {boolean} on */
export function highlightCellGroup(group, on) {
  const edgeMatFor = () => (on ? SELECT_EMAT : createEdgeMaterial());
  const opacity = on ? THEME.opacity.selected : THEME.opacity.solid;
  for (const child of group.children) {
    if (isOutline(child)) {
      /** @type {import('three').Line} */ (child).material = edgeMatFor();
    } else {
      const cell = /** @type {import('three').Mesh} */ (child);
      /** @type {import('three').Material} */ (cell.material).opacity = opacity;
      if (child.children[0]) /** @type {import('three').Line} */ (child.children[0]).material = edgeMatFor();
    }
  }
}

/** @param {import('three').Object3D} group @param {number} color */
export function setCellGroupColor(group, color) {
  for (const child of group.children) {
    if (isOutline(child)) continue;
    /** @type {import('three').MeshLambertMaterial} */ (/** @type {import('three').Mesh} */ (child).material).color.setHex(color);
  }
}
