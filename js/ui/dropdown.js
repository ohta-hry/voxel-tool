import { dom } from '../dom.js';
import { registry } from '../registry.js';

/** registry の内容でドロップダウンの選択肢を作り直す（有効な選択は維持） */
export function refreshDropdown() {
  const prev = dom.boxSelect.value;
  dom.boxSelect.innerHTML = '<option value="">── 選択 ──</option>';
  registry.entries.forEach((e, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    opt.textContent = e.label;
    dom.boxSelect.appendChild(opt);
  });
  // 選択が有効ならそのまま復元
  if (prev !== '' && registry.get(parseInt(prev))) dom.boxSelect.value = prev;
  else dom.boxSelect.value = '';
}

// ドロップダウンを「新規配置」状態（先頭の空選択）に戻す

export function resetBoxSelect() {
  dom.boxSelect.value = '';
  for (const opt of dom.boxSelect.options) opt.selected = false;
  if (dom.boxSelect.options.length > 0) dom.boxSelect.options[0].selected = true;
}
