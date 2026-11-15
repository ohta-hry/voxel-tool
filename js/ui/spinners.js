import { TIMING } from '../config.js';
import { updatePreview } from '../preview.js';
import { queryAll } from '../dom-utils.js';
import { stepInput, applyTypedInput } from './size-input.js';

/** スピナー（±ボタン長押し連続入力・直接入力）を配線する。値の更新規則は size-input.js */
export function initSpinners() {
  queryAll('.spin-btn').forEach(btn => {
    const fire = () => {
      stepInput(btn.dataset.target, parseInt(btn.dataset.delta));
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
      applyTypedInput(inp);
      updatePreview();
    });
  });
}
