import { UI, TIMING } from '../config.js';
import { updatePreview } from '../preview.js';

export function initSpinners() {
  document.querySelectorAll('.spin-btn').forEach(btn => {
    const fire = () => {
      const id = btn.dataset.target;
      const delta = parseInt(btn.dataset.delta);
      const input = document.getElementById(id);
      const isSize = id.startsWith('s');
      input.value = Math.max(isSize ? UI.minSize : UI.minOrigin, (parseInt(input.value) || 0) + delta);
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

  document.querySelectorAll('.spin-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const isSize = inp.id.startsWith('s');
      if (isSize && parseInt(inp.value) < UI.minSize) inp.value = UI.minSize;
      if (!isSize && parseInt(inp.value) < UI.minOrigin) inp.value = UI.minOrigin;
      updatePreview();
    });
  });
}
