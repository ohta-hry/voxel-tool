// タイプ選択カード用のSVGアイコン
export const TYPE_SVGS = {
  roof: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<!-- 片流れ屋根 等角投影風 -->
<!-- 底面グリッド（3×1段） -->
<polygon points="3,30 13,25 13,33 3,38" fill="#2a3a5a" opacity="1"/>
<polygon points="13,25 23,20 23,28 13,33" fill="#2a3a5a" opacity="1"/>
<polygon points="23,20 33,15 33,23 23,28" fill="#2a3a5a" opacity="1"/>
<!-- 上面（傾斜した屋根面） -->
<polygon points="3,22 33,7 33,15 3,30" fill="#5ba8ff" opacity="1"/>
<!-- 上面縁 -->
<polygon points="3,22 33,7 33,15 3,30" fill="none" stroke="#8ec8f8" stroke-width="1.2"/>
<!-- 左端の垂直面 -->
<polygon points="3,22 3,30 3,38 3,30" fill="none" stroke="#6aaad8" stroke-width="1"/>
<!-- 各段の縦線 -->
<line x1="13" y1="11" x2="13" y2="33" stroke="#4a6a9a" stroke-width="0.8" opacity="1"/>
<line x1="23" y1="7" x2="23" y2="28" stroke="#4a6a9a" stroke-width="0.8" opacity="1"/>
<!-- 外枠 -->
<polyline points="3,22 33,7" stroke="#8ec8f8" stroke-width="1.2" fill="none"/>
<polyline points="3,30 33,15" stroke="#6aaad8" stroke-width="1" fill="none"/>
<line x1="3" y1="22" x2="3" y2="30" stroke="#6aaad8" stroke-width="1.2"/>
<line x1="33" y1="7" x2="33" y2="15" stroke="#6aaad8" stroke-width="1.2"/>
</svg>`,

  box: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<!-- 等角投影ボックス -->
<!-- 上面 -->
<polygon points="19,3 35,11 19,19 3,11" fill="#5ba8ff" opacity="1"/>
<!-- 左面 -->
<polygon points="3,11 19,19 19,35 3,27" fill="#2a4a7a" opacity="1"/>
<!-- 右面 -->
<polygon points="35,11 19,19 19,35 35,27" fill="#3a60a0" opacity="1"/>
<!-- 上面縁 -->
<polygon points="19,3 35,11 19,19 3,11" fill="none" stroke="#8ec8f8" stroke-width="1.2"/>
<!-- 左面縁 -->
<polygon points="3,11 19,19 19,35 3,27" fill="none" stroke="#6aaad8" stroke-width="1.2"/>
<!-- 右面縁 -->
<polygon points="35,11 19,19 19,35 35,27" fill="none" stroke="#6aaad8" stroke-width="1.2"/>
</svg>`,

  cross_pillar: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<!-- 角1マス欠け 5×5 平面図（上から） -->
<!-- セルサイズ: 6px, マージン: 1px, 開始: 2 -->
<!-- row0: 欠け(0,0) 有(1,0) 有(2,0) 有(3,0) 欠け(4,0) -->
<rect x="9" y="2" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="16" y="2" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="23" y="2" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<!-- row1: 全5マス -->
<rect x="2" y="9" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="9" y="9" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="16" y="9" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="23" y="9" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="30" y="9" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<!-- row2: 全5マス -->
<rect x="2" y="16" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="9" y="16" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="16" y="16" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="23" y="16" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="30" y="16" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<!-- row3: 全5マス -->
<rect x="2" y="23" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="9" y="23" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="16" y="23" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="23" y="23" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="30" y="23" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<!-- row4: 欠け(0,4) 有(1,4) 有(2,4) 有(3,4) 欠け(4,4) -->
<rect x="9" y="30" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="16" y="30" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<rect x="23" y="30" width="6" height="6" fill="#3ab3da" opacity="1" rx="0.5"/>
<!-- 欠けマスのガイド枠 -->
<rect x="2" y="2" width="6" height="6" fill="none" stroke="#2a3a5a" stroke-width="0.8" stroke-dasharray="2,1.5" rx="0.5"/>
<rect x="30" y="2" width="6" height="6" fill="none" stroke="#2a3a5a" stroke-width="0.8" stroke-dasharray="2,1.5" rx="0.5"/>
<rect x="2" y="30" width="6" height="6" fill="none" stroke="#2a3a5a" stroke-width="0.8" stroke-dasharray="2,1.5" rx="0.5"/>
<rect x="30" y="30" width="6" height="6" fill="none" stroke="#2a3a5a" stroke-width="0.8" stroke-dasharray="2,1.5" rx="0.5"/>
</svg>`,
  pillar: `<svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<polygon points="19,3 27,7 19,11 11,7" fill="#5ba8ff" fill-opacity="0.55" stroke="#6aaad8" stroke-width="1"/>
<polygon points="11,7 19,11 19,35 11,31" fill="#2a4a7a" fill-opacity="0.85" stroke="#6aaad8" stroke-width="1"/>
<polygon points="27,7 19,11 19,35 27,31" fill="#3a60a0" fill-opacity="0.85" stroke="#6aaad8" stroke-width="1"/>
</svg>`,
};
