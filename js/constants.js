// ── 文字列定数（形状ID・屋根の勾配軸・ピラーの軸） ─────────────────────────────────────────
export const SHAPE_TYPE = Object.freeze({
  BOX: 'box',
  CROSS_PILLAR: 'cross_pillar',
  ROOF: 'roof',
  PILLAR: 'pillar',
});

// +x = X正方向に勾配上昇, -x = X負方向に上昇, z も同様
export const ROOF_AXIS = Object.freeze({
  PLUS_X: '+x',
  MINUS_X: '-x',
  PLUS_Z: '+z',
  MINUS_Z: '-z',
});

// ピラーの軸（伸びる方向）。既定は縦(y)
export const PILLAR_AXIS = Object.freeze({
  X: 'x',
  Y: 'y',
  Z: 'z',
});

// 同じ軸ボタンを押したときの反転先
export const ROOF_AXIS_CYCLE = Object.freeze({
  [ROOF_AXIS.PLUS_X]: ROOF_AXIS.MINUS_X,
  [ROOF_AXIS.MINUS_X]: ROOF_AXIS.PLUS_X,
  [ROOF_AXIS.PLUS_Z]: ROOF_AXIS.MINUS_Z,
  [ROOF_AXIS.MINUS_Z]: ROOF_AXIS.PLUS_Z,
});
