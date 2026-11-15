import { subscribe, state } from './state.js';
import { registry } from './registry.js';
import { applyEdgeVoxelMode } from './modes.js';
import { updatePreview } from './preview.js';
import { updateRoofAxisButtons } from './ui/roof-controls.js';
import { updatePillarAxisButtons, syncPillarForm } from './ui/pillar-controls.js';
import { updateEllipseButtons, equalizeEllipseSizes } from './ui/ellipse-controls.js';
import { SHAPE_TYPE } from './constants.js';
import { syncTypeCards } from './ui/type-grid.js';

// 「状態が変わったら何を更新するか」をここに集約する
export function initReactions() {
  subscribe('edgeVoxelMode', () => {
    applyEdgeVoxelMode(registry.entries);
  });
  subscribe(['activeType', 'activeColor', 'roofAxis', 'roofGable', 'pillarAxis'], updatePreview);
  subscribe(['roofAxis', 'roofGable'], updateRoofAxisButtons);
  subscribe('pillarAxis', updatePillarAxisButtons);
  subscribe(['activeType', 'pillarAxis'], syncPillarForm);
  subscribe(['ellipseCircle', 'ellipseFixedCenter'], updateEllipseButtons);
  // 「円」がONのまま楕円を選んだら、xz のサイズをそろえる
  subscribe('activeType', () => {
    if (state.activeType === SHAPE_TYPE.ELLIPSE && state.ellipseCircle && equalizeEllipseSizes()) updatePreview();
  });
  subscribe('activeType', syncTypeCards);
}
