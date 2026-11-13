import { dom } from '../dom.js';
import { queryAll } from '../dom-utils.js';
import { state } from '../state.js';
import { registry } from '../registry.js';
import { listShapes, getShape } from '../shapes/index.js';

// タイプ選択（state.activeType の変更が reactions.js 経由で syncTypeCards / プレビューに反映される）
/** @param {string} typeId */
export function setActiveType(typeId) {
  state.activeType = typeId;
}

// 選択カードの強調表示と、形状専用UI（controlsId）の表示切り替え

export function syncTypeCards() {
  queryAll('.type-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.type === state.activeType);
  });
  for (const shape of listShapes()) {
    if (!shape.controlsId) continue;
    const row = document.getElementById(shape.controlsId);
    if (row) row.style.display = (shape.id === state.activeType) ? 'flex' : 'none';
  }
}

// タイプグリッドを動的生成

export function buildTypeGrid() {
  const grid = dom.typeGrid;
  grid.innerHTML = '';
  for (const def of listShapes()) {
    const id = def.id;
    const card = document.createElement('button');
    card.className = 'type-card' + (id === state.activeType ? ' selected' : '');
    card.dataset.type = id;
    card.innerHTML = `
      <div class="type-icon">${def.icon}</div>
      <div class="type-label">${def.label}<br><span style="color:#3a4a5a;font-size:8px">${def.desc.replace('\n', '<br>')}</span></div>
    `;
    card.addEventListener('click', () => {
      // 編集中: カテゴリ（solid ↔ roof）を越える変更は禁止
      if (state.editingIndex >= 0) {
        const current = getShape(registry.get(state.editingIndex).type);
        if (current.category !== def.category) return;
      }
      setActiveType(id);
    });
    grid.appendChild(card);
  }
}
