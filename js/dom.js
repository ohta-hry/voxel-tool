// 主要なDOM要素の参照（type="module" は DOM 解析後に実行されるため直接取得できる）
const $ = id => document.getElementById(id);

export const dom = {
  container: $('canvas-container'),

  // 編集パネル
  boxSelect: $('box-select'),
  btnPrimary: $('btn-primary'),
  btnMiddle: $('btn-middle'),
  btnSecondary: $('btn-secondary'),
  btnApplyColor: $('btn-apply-color'),
  btnApplyType: $('btn-apply-type'),
  typeGrid: $('type-grid'),

  // 屋根
  roofAxisRow: $('roof-axis-row'),
  btnRoofX: $('btn-roof-x'),
  btnRoofZ: $('btn-roof-z'),
  btnRoofGable: $('btn-roof-gable'),

  // 設定ドロワー
  drawer: $('settings-drawer'),
  toggleBtn: $('btn-settings-toggle'),
  canvasXInput: $('canvas-x'),
  canvasZInput: $('canvas-z'),
  btnApplySettings: $('btn-apply-settings'),
  chkWireframe: $('chk-wireframe'),
  chkWireframeIcon: $('chk-wireframe-icon'),
  chkEdgeVoxel: $('chk-edge-voxel'),
  chkEdgeVoxelIcon: $('chk-edge-voxel-icon'),
};
