import { subscribe } from './state.js';
import { registry } from './registry.js';
import { applyEdgeVoxelMode } from './modes.js';
import { updatePreview } from './preview.js';
import { updateRoofAxisButtons } from './ui/roof-controls.js';
import { syncTypeCards } from './ui/type-grid.js';

// 「状態が変わったら何を更新するか」をここに集約する
export function initReactions() {
  subscribe('edgeVoxelMode', () => {
    applyEdgeVoxelMode(registry.entries);
  });
  subscribe(['activeType', 'activeColor', 'roofAxis', 'roofGable'], updatePreview);
  subscribe(['roofAxis', 'roofGable'], updateRoofAxisButtons);
  subscribe('activeType', syncTypeCards);
}
