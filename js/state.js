import { UI } from './config.js';
import { PRESET_COLORS } from './color.js';
import { SHAPE_TYPE, ROOF_AXIS } from './constants.js';

// 共有可変状態（暫定: 単純なオブジェクト。将来 subscribe 付き store に置き換える想定）
// persistence.js の `state` 引数と同じプロパティ名（canvasX/canvasZ/roofAxis/roofGable/edgeVoxelMode）を持つ
export const state = {
  canvasX: UI.defaultCanvasSize,
  canvasZ: UI.defaultCanvasSize,

  activeType: SHAPE_TYPE.BOX,
  activeColor: PRESET_COLORS[UI.defaultColorIndex],

  // 屋根パラメータ（プレビュー/配置用。確定済みエントリは entry 側にも持つ）
  roofAxis: ROOF_AXIS.PLUS_X,
  roofGable: false,

  wireframeMode: false,
  edgeVoxelMode: false,

  editingIndex: -1, // -1 = 通常モード, >=0 = そのボックスを編集中
  previewMesh: null,
};

// [{mesh, edgeGroup, ox,oy,oz, sx,sy,sz, color, type, roofAxis, roofGable, label}]
export const placedBoxes = [];
