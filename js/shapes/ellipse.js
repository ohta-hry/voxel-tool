import { UI } from '../config.js';
import { SHAPE_TYPE } from '../constants.js';
import { ellipseFootprint, computeEllipseEdgeVoxels, resizeEllipse } from '../logic/ellipse.js';
import { TYPE_SVGS } from '../type-icons.js';
import { setCellGroupVisibility, highlightCellGroup, setCellGroupColor } from './cell-group.js';
import { buildCellColumns } from './cell-columns.js';

// 楕円（type: ellipse）: xz 面が楕円の柱。サイズ xz の長径/短径が、xz のセル(ピクセル)上の楕円になる。
// 角欠け直方体と同じ「セルごとの柱」で作る（組み立ては cell-columns.js）。直方体・角欠け直方体と相互に変換できる（category: solid）。
// 形状固有パラメータ params = { isCircle, fixedCenter }（画面の入力補助。schem 出力には関係しない）
//  ・isCircle: x と z のサイズを同じにする（片方を増減すると、もう片方も同じだけ増減）
//  ・fixedCenter: サイズの増減幅を2にし、xz のサイズが2増えたら位置を1減らす（逆も同様）
/** @type {import('../types.js').ShapeDefinition} */
export const ellipseShape = {
  id: SHAPE_TYPE.ELLIPSE,
  label: '楕円',
  desc: 'xz面が楕円の柱',
  icon: TYPE_SVGS.ellipse,
  category: 'solid', // 直方体・角欠け直方体と相互に変換できる
  controlsId: 'ellipse-options-row', // 選択中のみ表示する「円」「中心固定」ボタン

  build: (spec, ctx) => buildCellColumns(ellipseFootprint(spec.sx, spec.sz), spec, ctx),

  setVisibility: setCellGroupVisibility,
  highlight: highlightCellGroup,
  setColor: setCellGroupColor,

  // 辺ボクセル: Python の設置タイプ B で置くセルと同じ
  edgeVoxels: ({ sx, sy, sz }) => computeEllipseEdgeVoxels(sx, sy, sz),

  // 中心固定のとき、xz のサイズの増減幅は2
  sizeStep: (id, state) => (state.ellipseFixedCenter && (id === 'sx' || id === 'sz')) ? 2 : 1,

  // サイズ欄の変更に伴う連動（円: xz を同じに / 中心固定: 位置を動かす）
  resizeLinked: (values, id, newSize, state) => resizeEllipse(values, id, newSize, {
    isCircle: state.ellipseCircle,
    fixedCenter: state.ellipseFixedCenter,
    minSize: UI.minSize,
    minOrigin: UI.minOrigin,
  }),

  params: {
    normalize: p => ({ isCircle: !!p?.isCircle, fixedCenter: !!p?.fixedCenter }),
    fromState: state => ({ isCircle: state.ellipseCircle, fixedCenter: state.ellipseFixedCenter }),
    // 編集開始時: このエントリの設定をUI状態へ反映
    toState(p, state) {
      state.ellipseCircle = p.isCircle;
      state.ellipseFixedCenter = p.fixedCenter;
    },
    // 他形状の編集開始時は、ボタンを OFF に戻す
    reset(state) {
      state.ellipseCircle = false;
      state.ellipseFixedCenter = false;
    },
    serialize: p => ({ isCircle: p.isCircle, isFixedCenter: p.fixedCenter }),
    deserialize: raw => ({ isCircle: !!raw.isCircle, fixedCenter: !!raw.isFixedCenter }),
  },

  typeLabel: () => ' [楕円]',
};
