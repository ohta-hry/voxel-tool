import { THEME } from '../config.js';
import { SELECT_EMAT, createEdgeMaterial } from '../materials.js';

// 複数セルを Group にまとめる形状（十字柱・屋根）共通の表示/強調/着色処理。
// Group の子 = 各セルの Mesh（+ 任意で外形輪郭の LineSegments: userData.isOutlineEdge）

const isOutline = child => !!(child.userData && child.userData.isOutlineEdge);

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

export function highlightCellGroup(group, on) {
  const edgeMatFor = () => (on ? SELECT_EMAT : createEdgeMaterial());
  const opacity = on ? THEME.opacity.selected : THEME.opacity.solid;
  for (const child of group.children) {
    if (isOutline(child)) {
      child.material = edgeMatFor();
    } else {
      child.material.opacity = opacity;
      if (child.children[0]) child.children[0].material = edgeMatFor();
    }
  }
}

export function setCellGroupColor(group, color) {
  for (const child of group.children) {
    if (isOutline(child)) continue;
    child.material.color.setHex(color);
  }
}
