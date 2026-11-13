import { UI } from '../config.js';
import { dom } from '../dom.js';
import { state } from '../state.js';
import { buildGrid } from '../scene.js';
import { queryAll } from '../dom-utils.js';

/** 設定ドロワーを閉じる */
export function closeDrawer() {
  dom.drawer.classList.remove('open');
  dom.toggleBtn.classList.remove('active');
}


/**
 * 「表示 / データ」の切り替え（#settings-tabs）。押したボタンだけを active にし、
 * data-pane の指すペイン（.drawer-pane）だけを表示する。
 * （filled / outline / checked_wool の選択は ui/schem-panel.js が state で管理する）
 */
function initSegmentedToggles() {
  queryAll('#settings-tabs').forEach(group => {
    const buttons = /** @type {HTMLElement[]} */ ([...group.querySelectorAll('.seg-btn')]);
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.toggle('active', b === btn));
        const paneId = btn.dataset.pane;
        if (paneId) queryAll('.drawer-pane').forEach(p => p.classList.toggle('active', p.id === paneId));
      });
    });
  });
}

/** 設定ドロワー（開閉・キャンバスサイズ適用・表示/データ切り替え）を配線する */
export function initDrawer() {
  initSegmentedToggles();

  dom.toggleBtn.addEventListener('click', () => {
    const open = dom.drawer.classList.toggle('open');
    dom.toggleBtn.classList.toggle('active', open);
  });

  dom.btnApplySettings.addEventListener('click', () => {
    state.canvasX = Math.max(UI.minSize, parseInt(dom.canvasXInput.value) || UI.defaultCanvasSize);
    state.canvasZ = Math.max(UI.minSize, parseInt(dom.canvasZInput.value) || UI.defaultCanvasSize);
    dom.canvasXInput.value = String(state.canvasX);
    dom.canvasZInput.value = String(state.canvasZ);
    buildGrid(state.canvasX, state.canvasZ);
    closeDrawer();
  });
}
