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

  // ピラー
  btnPillarX: byId('btn-pillar-x'),
  btnPillarY: byId('btn-pillar-y'),
  btnPillarZ: byId('btn-pillar-z'),

  // サイズ欄（ピラーでは軸に対応する1つだけを「長さ」として表示する）
  sizeHeader: byId('size-header'),
  sizeWraps: { x: byId('size-wrap-x'), y: byId('size-wrap-y'), z: byId('size-wrap-z') },

  // 設定ドロワー
  drawer: byId('settings-drawer'),
  toggleBtn: byId('btn-settings-toggle'),
  canvasXInput: inputById('canvas-x'),
  canvasZInput: inputById('canvas-z'),
  btnApplySettings: byId('btn-apply-settings'),
  chkEdgeVoxel: inputById('chk-edge-voxel'),
  chkEdgeVoxelIcon: byId('chk-edge-voxel-icon'),

  // 「データ」タブ（schem書き出し）
  dataModeToggle: byId('data-mode-toggle'),
  dataFilename: inputById('data-filename'),
  btnDataAction: byId('btn-data-action'),
  dataStatus: byId('data-status'),
  dataLog: byId('data-log'),
};
