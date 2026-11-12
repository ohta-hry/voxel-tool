import { THEME, TIMING } from '../config.js';

// ボタンを確認状態に変え、次のクリックで onConfirm を実行（時間切れでキャンセル）
export function askConfirm(targetBtn, message, onConfirm) {
  if (targetBtn.dataset.confirming === '1') return; // 既に確認中
  targetBtn.dataset.confirming = '1';

  const original = targetBtn.textContent;

  targetBtn.textContent = message;
  targetBtn.style.background = THEME.css.confirmBg;
  targetBtn.style.borderColor = THEME.css.confirmBorder;
  targetBtn.style.color = THEME.css.confirmText;

  const timer = setTimeout(cancel, TIMING.confirmMs);

  function confirm() {
    cleanup();
    onConfirm();
  }
  function cancel() {
    cleanup();
  }
  function cleanup() {
    clearTimeout(timer);
    targetBtn.removeEventListener('click', confirm);
    targetBtn.dataset.confirming = '';
    targetBtn.textContent = original;
    targetBtn.style.background = '';
    targetBtn.style.borderColor = '';
    targetBtn.style.color = '';
  }

  // 次のクリックで確定
  setTimeout(() => {
    targetBtn.addEventListener('click', confirm, { once: true });
  }, 0);
}
