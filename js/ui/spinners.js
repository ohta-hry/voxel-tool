import { UI, TIMING } from '../config.js';
import { updatePreview } from '../preview.js';
import { queryAll, inputById } from '../dom-utils.js';

/** スピナー（±ボタン長押し連続入力・直接入力）を配線する */
export function initSpinners() {
  queryAll('.spin-btn').forEach(btn => {
    const fire = () => {
      const id = btn.dataset.target;
      const delta = parseInt(btn.dataset.delta);
      const input = inputById(id);
      const isSize = id.startsWith('s');
      input.value = String(Math.max(isSize ? UI.minSize : UI.minOrigin, (parseInt(input.value) || 0) + delta));
      updatePreview();
    };
    btn.addEventListener('click', fire);

    // 長押しで連続入力
    let timer, interval;
    const stop = () => { clearTimeout(timer); clearInterval(interval); };
    btn.addEventListener('pointerdown', () => {
      timer = setTimeout(() => { interval = setInterval(fire, TIMING.spinRepeatMs); }, TIMING.spinHoldDelayMs);
    });
    btn.addEventListener('pointerup', stop);
    btn.addEventListener('pointerleave', stop);
  });

  /** @type {HTMLInputElement[]} */ (queryAll('.spin-input')).forEach(inp => {
    inp.addEventListener('input', () => {
      const isSize = inp.id.startsWith('s');
      if (isSize && parseInt(inp.value) < UI.minSize) inp.value = String(UI.minSize);
      if (!isSize && parseInt(inp.value) < UI.minOrigin) inp.value = String(UI.minOrigin);
      updatePreview();
    });
  });
}
