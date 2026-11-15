import { dom } from '../dom.js';
import { queryAll } from '../dom-utils.js';
import { state } from '../state.js';
import { registry } from '../registry.js';
import { listShapes, getShape } from '../shapes/index.js';
import { commitSizesToForm } from '../form.js';

// タイプ選択（state.activeType の変更が reactions.js 経由で syncTypeCards / プレビューに反映される）
/** @param {string} typeId */
export function setActiveType(typeId) {
  state.activeType = typeId;
}

// 選択カードの強調表示と、形状専用UI（controlsId）の表示切り替え

// タイプ欄はスクロールできる。選択中のカードが枠の外にあれば、見える位置までスクロールする
function scrollSelectedCardIntoView() {
  const grid = dom.typeGrid;
  const card = /** @type {HTMLElement | null} */ (grid.querySelector('.type-card.selected'));
  if (!card || grid.clientHeight === 0) return; // 非表示のタブでは何もしない
  const top = card.offsetTop; // grid が position:relative なので、grid 内の位置（スクロール量に依存しない）
  if (top < grid.scrollTop) grid.scrollTop = top;
  else if (top + card.offsetHeight > grid.scrollTop + grid.clientHeight) grid.scrollTop = top + card.offsetHeight - grid.clientHeight;
}

export function syncTypeCards() {
  queryAll('.type-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.type === state.activeType);
  });
  scrollSelectedCardIntoView();
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
      // 編集中: カテゴリ（solid / roof / pillar）を越える変更は禁止
      if (state.editingIndex >= 0) {
        const current = getShape(registry.get(state.editingIndex).type);
        if (current.category !== def.category) return;
      }
      // サイズ欄の意味が違う形状（ピラー）から離れるときは、入力欄を実際のサイズにそろえる
      if (id !== state.activeType && getShape(state.activeType).sizeFromForm) commitSizesToForm(state.activeType);
      setActiveType(id);
    });
    grid.appendChild(card);
  }
}
