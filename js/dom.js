import { byId, inputById, selectById } from './dom-utils.js';

// 主要なDOM要素の参照（type="module" は DOM 解析後に実行されるため直接取得できる）
export const dom = {
  container: byId('canvas-container'),

  // 編集パネル
  boxSelect: selectById('box-select'),
  btnPrimary: byId('btn-primary'),
  btnMiddle: byId('btn-middle'),
  btnSecondary: byId('btn-secondary'),
  btnApplyColor: byId('btn-apply-color'),
  btnApplyType: byId('btn-apply-type'),
  typeGrid: byId('type-grid'),

  // 屋根
  btnRoofX: byId('btn-roof-x'),
  btnRoofZ: byId('btn-roof-z'),
  btnRoofGable: byId('btn-roof-gable'),

  // 設定ドロワー
  drawer: byId('settings-drawer'),
  toggleBtn: byId('btn-settings-toggle'),
  canvasXInput: inputById('canvas-x'),
  canvasZInput: inputById('canvas-z'),
  btnApplySettings: byId('btn-apply-settings'),
  chkWireframe: inputById('chk-wireframe'),
  chkWireframeIcon: byId('chk-wireframe-icon'),
  chkEdgeVoxel: inputById('chk-edge-voxel'),
  chkEdgeVoxelIcon: byId('chk-edge-voxel-icon'),
};
