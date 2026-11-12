/** 下部パネルのタブ切替を配線する */
import { queryAll, byId } from '../dom-utils.js';

export function initTabs() {
  queryAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      queryAll('.tab-btn').forEach(b => b.classList.remove('active'));
      queryAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      byId(btn.dataset.tab).classList.add('active');
    });
  });
}
