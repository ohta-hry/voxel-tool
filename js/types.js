// 型定義（JSDoc のみ。実行時コードなし）
// 各モジュールは `import('./types.js').Xxx` で参照する。
// エディタ(VS Code)では jsconfig.json により補完・型チェックが効く。

/** @typedef {'+x'|'-x'|'+z'|'-z'} RoofAxis  屋根の勾配軸 */

/** @typedef {{ axis: RoofAxis, gable: boolean }} RoofParams  屋根固有パラメータ */

/** @typedef {'x'|'y'|'z'} PillarAxis  ピラーの軸（伸びる方向） */

/** @typedef {{ axis: PillarAxis }} PillarParams  ピラー固有パラメータ */

/** @typedef {'filled'|'outline'|'checked_wool'} SchemType  b6.py の設置タイプ（A/B/C に対応） */
/** @typedef {'unloaded'|'starting'|'installing'|'ready'|'exporting'} PyStatus */

/** @typedef {[number, number, number]} Voxel3  ボクセルのローカル座標 [lx, ly, lz] */
/** @typedef {[number, number]} Cell2           フットプリントのセル [lx, lz] */
/** @typedef {{ lx: number, ly: number, lz: number }} VoxelXYZ */

/**
 * 面カリング済みセルの頂点データ（BufferGeometry 用の平坦な配列）
 * @typedef {Object} CulledCellData
 * @property {number[]} positions
 * @property {number[]} normals
 * @property {number[]} uvs
 * @property {number[]} indices
 */

/**
 * 形状の仕様。registry.add / update に渡す。
 * @typedef {Object} ShapeSpec
 * @property {string} type     shapes/index.js に登録済みの id（'box' | 'cross_pillar' | 'roof' | 'pillar' ...）
 * @property {number} ox  @property {number} oy  @property {number} oz   基準点
 * @property {number} sx  @property {number} sy  @property {number} sz   サイズ
 * @property {number} [color]  色の数値（16進で 0xff0000 など）。update では既存の色を維持するため省略可
 * @property {Record<string, any>} [params]  形状固有パラメータ（屋根: RoofParams）
 */

/**
 * 配置済みボックス（registry.entries の要素）。ShapeSpec に表示用の情報が付く。
 * @typedef {ShapeSpec & { color: number, mesh: import('three').Object3D, edgeGroup: import('three').Group|null, label: string }} BoxEntry
 */

/**
 * 形状プラグインの build に渡される実行時コンテキスト
 * @typedef {Object} ShapeBuildContext
 * @property {import('three').Material} mat        面のマテリアル
 * @property {import('three').Material} edgeMat    エッジのマテリアル
 * @property {boolean} confirmed                   確定済み（Face Culling 等の最適化を適用）か、プレビューか
 */

/**
 * 形状固有パラメータの扱い（任意）。
 * @typedef {Object} ShapeParams
 * @property {(p?: Record<string, any>) => Record<string, any>} normalize   欠損/不正値の補正
 * @property {(state: AppState) => Record<string, any>} fromState           UI状態 → params
 * @property {(p: Record<string, any>, state: AppState) => void} toState    params → UI状態（編集開始時）
 * @property {(state: AppState) => void} [reset]                            他形状の編集開始時にUI状態を戻す
 * @property {(p: Record<string, any>) => Record<string, any>} serialize    保存データに展開するキー
 * @property {(raw: Record<string, any>) => Record<string, any>} deserialize 保存データ → params
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
 * @property {(spec: ShapeSpec, ctx: ShapeBuildContext) => import('three').Object3D} build
 * @property {(obj: import('three').Object3D, faceVisible: boolean, edgeVisible: boolean) => void} setVisibility
 * @property {(obj: import('three').Object3D, on: boolean) => void} highlight
 * @property {(obj: import('three').Object3D, color: number) => void} setColor
 * @property {(spec: ShapeSpec) => Voxel3[]} [edgeVoxels]  辺ボクセル座標。無ければ辺ボクセルモードの対象外
 * @property {(values: { sx: number, sy: number, sz: number }, state: AppState) => { sx: number, sy: number, sz: number }} [sizeFromForm]
 *     入力欄の値 → この形状が実際に使うサイズ（サイズ欄の意味が3つのsx/sy/szと違う形状のみ。例: ピラーの「長さ」）
 * @property {(entry: BoxEntry) => string} typeLabel       ラベルに付く形状名（例: ' [屋根(+x)]'）
 * @property {ShapeParams} [params]
 */

/**
 * 共有状態（state.js）
 * @typedef {Object} AppState
 * @property {number} canvasX
 * @property {number} canvasZ
 * @property {string} activeType        選択中の形状 id
 * @property {string} activeColor       '#rrggbb'
 * @property {RoofAxis} roofAxis        屋根の勾配軸（フォーム/プレビュー用）
 * @property {boolean} roofGable        両屋根（切妻）モード
 * @property {PillarAxis} pillarAxis    ピラーの軸（フォーム/プレビュー用）
 * @property {boolean} edgeVoxelMode
 * @property {number} editingIndex      -1 = 通常モード, >=0 = そのボックスを編集中
 * @property {SchemType} schemType      schem書き出しの設置タイプ
 * @property {string} schemFilename     schem書き出しのファイル名（空 = 既定名）
 * @property {PyStatus} pyStatus        Pyodide の読み込み状況
 */

/**
 * セーブデータ（persistence.js）
 * @typedef {Object} SavedBox
 * @property {number} ox  @property {number} oy  @property {number} oz
 * @property {number} sx  @property {number} sy  @property {number} sz
 * @property {number} color
 * @property {string} [label]
 * @property {string} [type]
 * @property {string} [roofAxis]   屋根のみ（旧形式 'x' / 'z' も読める）
 * @property {boolean} [roofGable] 屋根のみ
 * @property {string} [pillarAxis] ピラーのみ（'x'|'y'|'z'。軸以外のサイズは 1）
 */

/**
 * @typedef {Object} SaveData
 * @property {number} [canvasX]
 * @property {number} [canvasZ]
 * @property {SavedBox[]} boxes
 */

export {};
