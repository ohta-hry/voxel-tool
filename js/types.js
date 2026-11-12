// 型定義（JSDoc のみ。実行時コードなし）

/**
 * 形状の仕様。registry.add / update に渡す。
 * @typedef {Object} ShapeSpec
 * @property {string} type     'box' | 'cross_pillar' | 'roof' など（shapes/index.js に登録済みの id）
 * @property {number} ox @property {number} oy @property {number} oz   基準点
 * @property {number} sx @property {number} sy @property {number} sz   サイズ
 * @property {number} color    0xRRGGBB
 * @property {Object} [params] 形状固有パラメータ（屋根: { axis, gable }）
 */

/**
 * 配置済みボックス（registry.entries の要素）。ShapeSpec に表示用の情報が付く。
 * @typedef {ShapeSpec & { mesh: import('three').Object3D, edgeGroup: import('three').Group|null, label: string }} BoxEntry
 */

/**
 * 形状プラグイン。shapes/*.js で定義し、shapes/index.js の registerShape で登録する。
 * @typedef {Object} ShapeDefinition
 * @property {string} id
 * @property {string} label            タイプ選択カードの名前
 * @property {string} desc             カードの説明（\n で改行）
 * @property {string} icon             カード用 SVG 文字列
 * @property {string} category         編集中に変更できるのは同じ category 内のみ
 * @property {string} [controlsId]     選択中のみ表示する専用UIのDOM id
 * @property {(spec: ShapeSpec, ctx: {mat, edgeMat, confirmed: boolean, wireframe: boolean}) => import('three').Object3D} build
 * @property {(obj, faceVisible: boolean, edgeVisible: boolean) => void} setVisibility
 * @property {(obj, on: boolean) => void} highlight
 * @property {(obj, color: number) => void} setColor
 * @property {(spec: ShapeSpec) => number[][]} [edgeVoxels]  辺ボクセル座標。無ければ辺ボクセルモードの対象外
 * @property {(entry: BoxEntry) => string} typeLabel         ラベルに付く形状名（例: ' [屋根(+x)]'）
 * @property {ShapeParams} [params]    形状固有パラメータの扱い
 */

/**
 * @typedef {Object} ShapeParams
 * @property {(p?: Object) => Object} normalize     欠損/不正値の補正
 * @property {(state) => Object} fromState          UI状態 → params
 * @property {(p: Object, state) => void} toState   params → UI状態（編集開始時）
 * @property {(state) => void} [reset]              他形状の編集開始時にUI状態を戻す
 * @property {(p: Object) => Object} serialize      保存データに展開するキー
 * @property {(raw: Object) => Object} deserialize  保存データ → params
 */

export {};
