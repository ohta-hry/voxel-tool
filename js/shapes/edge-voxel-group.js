import * as THREE from 'three';
import { THEME, VOXEL } from '../config.js';
import { createSolidMaterial, createEdgeMaterial, UNIT_BOX_GEO, UNIT_EDGE_GEO } from '../materials.js';

// 辺ボクセル表示用: voxels = [[lx, ly, lz], ...] を小箱の集合として並べた Group を作る
/** @param {number} ox @param {number} oy @param {number} oz
 * @param {import('../types.js').Voxel3[]} voxels @param {number} color */
export function makeEdgeVoxelCubes(ox, oy, oz, voxels, color) {
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
