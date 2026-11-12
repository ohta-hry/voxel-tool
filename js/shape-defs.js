import { SHAPE_TYPE } from './constants.js';

// 形状のメタ情報（タイプ選択UI・ラベル用）。表示順 = オブジェクトのキー順
export const SHAPE_DEFS = {
  [SHAPE_TYPE.BOX]: {
    id: SHAPE_TYPE.BOX,
    label: '直方体',
    desc: '通常の直方体',
  },
  [SHAPE_TYPE.CROSS_PILLAR]: {
    id: SHAPE_TYPE.CROSS_PILLAR,
    label: '十字柱',
    desc: '角1マス欠け\n直方体亜種',
  },
  [SHAPE_TYPE.ROOF]: {
    id: SHAPE_TYPE.ROOF,
    label: '屋根',
    desc: '片流れ屋根\n(DDA平面)',
  },
};

// 旧データ（type未設定）は直方体として扱う
export function getEntryType(entry) {
  return entry.type || SHAPE_TYPE.BOX;
}
