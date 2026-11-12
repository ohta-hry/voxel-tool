import * as THREE from 'three';
import { THEME, VOXEL } from './config.js';

export function createSolidMaterial(color, { opacity = THEME.opacity.solid, transparent = false, depthWrite = true } = {}) {
  return new THREE.MeshLambertMaterial({ color, transparent, opacity, depthWrite });
}

export function createEdgeMaterial(color = THEME.color.defaultEdge, { opacity = THEME.opacity.edge, transparent = false } = {}) {
  return new THREE.LineBasicMaterial({ color, transparent, opacity });
}

export const UNIT_BOX_GEO = new THREE.BoxGeometry(VOXEL.unit, VOXEL.unit, VOXEL.unit);
export const UNIT_EDGE_GEO = new THREE.EdgesGeometry(UNIT_BOX_GEO);

export const PREVIEW_MAT = createSolidMaterial(THEME.color.preview, { opacity: THEME.opacity.preview, depthWrite: false });
export const PREVIEW_EMAT = createEdgeMaterial(THEME.color.previewEdge, { opacity: THEME.opacity.previewEdge });
export const SELECT_EMAT = createEdgeMaterial(THEME.color.selectedEdge, { opacity: 1.0 });
