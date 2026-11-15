import { SHAPE_TYPE } from '../constants.js';
import { crossPillarFootprint, toCellSet, computeCrossPillarEdgeVoxels } from '../logic/footprint.js';
import { TYPE_SVGS } from '../type-icons.js';
import { setCellGroupVisibility, highlightCellGroup, setCellGroupColor } from './cell-group.js';
import { buildCellColumns } from './cell-columns.js';

// 角欠け直方体（type: cross_pillar）: 5×5ベースで四隅1マス欠けの柱
/** @type {import('../types.js').ShapeDefinition} */
export const crossPillarShape = {
  id: SHAPE_TYPE.CROSS_PILLAR,
  label: '角欠け直方体',
  desc: '四隅を1マスずつ\n欠いた直方体',
  icon: TYPE_SVGS.cross_pillar,
  category: 'solid',

  // 各フットプリントセルを1×sy×1の直方体にした Group（組み立ては cell-columns.js）
  build: (spec, ctx) => buildCellColumns(crossPillarFootprint(spec.sx, spec.sz), spec, ctx),

  setVisibility: setCellGroupVisibility,
  highlight: highlightCellGroup,
  setColor: setCellGroupColor,

  edgeVoxels({ sx, sy, sz }) {
    const cells = crossPillarFootprint(sx, sz);
    return computeCrossPillarEdgeVoxels(cells, toCellSet(cells), sy);
  },

  typeLabel: () => ' [角欠け直方体]',
};
