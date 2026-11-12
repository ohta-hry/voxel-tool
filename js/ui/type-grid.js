import { SHAPE_TYPE } from '../constants.js';
import { dom } from '../dom.js';
import { state } from '../state.js';
import { registry } from '../registry.js';
import { SHAPE_DEFS, getEntryType } from '../shape-defs.js';
import { TYPE_SVGS } from '../type-icons.js';

// タイプ選択（state.activeType の変更が reactions.js 経由で syncTypeCards / プレビューに反映される）
export function setActiveType(typeId) {
  state.activeType = typeId;
}

// 選択カードの強調表示と、屋根専用UIの表示切り替え
export function syncTypeCards() {
  document.querySelectorAll('.type-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.type === state.activeType);
  });
  dom.roofAxisRow.style.display = (state.activeType === SHAPE_TYPE.ROOF) ? 'flex' : 'none';
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
        const currentIsRoof = getEntryType(registry.get(state.editingIndex)) === SHAPE_TYPE.ROOF;
        const targetIsRoof = id === SHAPE_TYPE.ROOF;
        if (currentIsRoof !== targetIsRoof) return;
      }
      setActiveType(id);
    });
    grid.appendChild(card);
  }
}
