import { SHAPE_TYPE } from '../constants.js';
import { dom } from '../dom.js';
import { state, placedBoxes } from '../state.js';
import { SHAPE_DEFS, getEntryType } from '../shape-defs.js';
import { TYPE_SVGS } from '../type-icons.js';
import { updatePreview } from '../preview.js';

export function setActiveType(typeId) {
  state.activeType = typeId;
  document.querySelectorAll('.type-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.type === typeId);
  });
  // 屋根軸UIの表示切り替え
  dom.roofAxisRow.style.display = (typeId === SHAPE_TYPE.ROOF) ? 'flex' : 'none';
  updatePreview();
}

// タイプグリッドを動的生成
export function buildTypeGrid() {
  const grid = dom.typeGrid;
  grid.innerHTML = '';
  for (const [id, def] of Object.entries(SHAPE_DEFS)) {
    const card = document.createElement('button');
    card.className = 'type-card' + (id === state.activeType ? ' selected' : '');
    card.dataset.type = id;
    card.innerHTML = `
      <div class="type-icon">${TYPE_SVGS[id] || ''}</div>
      <div class="type-label">${def.label}<br><span style="color:#3a4a5a;font-size:8px">${def.desc.replace('\n', '<br>')}</span></div>
    `;
    card.addEventListener('click', () => {
      // 編集中: roof ↔ box/cross_pillar のカテゴリ越え変更を禁止
      if (state.editingIndex >= 0) {
        const currentIsRoof = getEntryType(placedBoxes[state.editingIndex]) === SHAPE_TYPE.ROOF;
        const targetIsRoof = id === SHAPE_TYPE.ROOF;
        if (currentIsRoof !== targetIsRoof) return;
      }
      setActiveType(id);
    });
    grid.appendChild(card);
  }
}
