import { SHAPE_TYPE } from '../constants.js';
import { normalizePillarAxis, pillarLength, pillarSizes } from '../logic/pillar.js';
import { TYPE_SVGS } from '../type-icons.js';
import { boxShape } from './box.js';

// ピラー: 指定した軸方向に伸びる 1×1×長さ の柱。形状固有パラメータ params = { axis: 'x'|'y'|'z' }
// 見た目・色・強調表示・辺ボクセルは直方体と同じ（サイズが常に 1×1×長さ になるだけ）。
// 軸以外のサイズは 1 に固定する。保存データの sx/sy/sz のうち、軸に対応する値だけを長さとして使う
// （Python 側 py/voxel_schem/shapes/pillar.py も同じ規則）。

/** 軸と、軸に対応するサイズ（長さ）から、常に 1×1×長さ のサイズを返す
 * @param {{ sx: number, sy: number, sz: number, params?: Record<string, any> }} spec */
function pillarSpecSizes(spec) {
  const axis = normalizePillarAxis(spec.params?.axis);
  return pillarSizes(axis, pillarLength(axis, spec));
}

/** @type {import('../types.js').ShapeDefinition} */
export const pillarShape = {
  ...boxShape,
  id: SHAPE_TYPE.PILLAR,
  label: 'ピラー',
  desc: '指定した軸方向に\n伸びる1×1の柱',
  icon: TYPE_SVGS.pillar,
  category: 'pillar', // 他の形状との相互変換はしない（編集中に category をまたぐ変更は禁止）
  controlsId: 'pillar-axis-row', // 選択中のみ表示する軸ボタン

  // どんな保存データ・入力欄の値でも、描画は常に 1×1×長さ にそろえる
  build: (spec, ctx) => boxShape.build({ ...spec, ...pillarSpecSizes(spec) }, ctx),
  edgeVoxels: spec => boxShape.edgeVoxels?.({ ...spec, ...pillarSpecSizes(spec) }) ?? [],

  // フォーム（サイズ欄は「長さ」1つ）→ 1×1×長さ のサイズ。readShapeSpec が使う
  sizeFromForm: (values, state) => pillarSizes(state.pillarAxis, pillarLength(state.pillarAxis, values)),

  params: {
    normalize: p => ({ axis: normalizePillarAxis(p?.axis) }),
    fromState: state => ({ axis: state.pillarAxis }),
    // 編集開始時: このエントリの軸をUI状態へ反映
    toState(p, state) { state.pillarAxis = p.axis; },
    serialize: p => ({ pillarAxis: p.axis }),
    deserialize: raw => ({ axis: normalizePillarAxis(raw.pillarAxis) }),
  },

  typeLabel: entry => ` [ピラー(${entry.params.axis})]`,
};
