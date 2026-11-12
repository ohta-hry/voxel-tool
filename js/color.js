import { UI } from './config.js';
import { state } from './state.js';
import { registry } from './registry.js';
import { PRESET_COLORS } from './palette.js';
import { hexToInt } from './utils.js';
import { byId, inputById, canvasById, queryAll } from './dom-utils.js';

export { PRESET_COLORS };

/** 色選択UI（パレット・カスタムピッカー）を初期化する。選択色は state.activeColor に反映される
 * @returns {{ setActiveColor: (hex: string) => void, applyColorToTarget: () => void }} */
export function initColorUI() {
  // パレット生成
  const palette = byId('color-palette');
  PRESET_COLORS.forEach(hex => {
    const sw = document.createElement('button');
    sw.className = 'color-swatch';
    sw.style.background = hex;
    sw.dataset.color = hex;
    sw.addEventListener('click', () => {
      setActiveColor(hex);
      applyColorToTarget();
    });
    palette.appendChild(sw);
  });

  /** @param {string} hex */
  function updateSwatchSelection(hex) {
    queryAll('.color-swatch').forEach(sw => {
      sw.classList.toggle('selected', sw.dataset.color.toLowerCase() === hex.toLowerCase());
    });
  }

  const pickerPreview = byId('color-picker-preview');

  /** @param {string} hex  '#rgb' または '#rrggbb' */
  function setActiveColor(hex) {
    // normalize to 6-digit hex
    if (hex.length === UI.hexShortLength) hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    state.activeColor = hex;
    pickerPreview.style.background = hex;
    updateSwatchSelection(hex);
  }

  // ── Custom Color Picker ───────────────────────────────────────────────────────
  let cpHue = 0, cpSat = 1, cpVal = 1;

  /** @param {number} h @param {number} s @param {number} v @returns {[number, number, number]} */
  function hsvToRgb(h, s, v) {
    let r, g, b;
    const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  /** @param {number} r @param {number} g @param {number} b */
  function rgbToHex(r, g, b) { return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''); }
  /** @param {string} hex @returns {[number, number, number]} */
  function hexToRgb(hex) {
    return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
  }
  /** @param {number} r @param {number} g @param {number} b @returns {[number, number, number]} */
  function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d > 0) {
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
      if (h < 0) h += 1;
    }
    return [h, mx === 0 ? 0 : d / mx, mx];
  }

  const cpSvCanvas = canvasById('cp-sv-canvas');
  const cpHueCanvas = canvasById('cp-hue-canvas');
  const cpHexInput = inputById('cp-hex-input');
  const cpPreview = byId('cp-preview-swatch');
  const modalCp = byId('modal-color-picker');

  function cpDrawSV() {
    const ctx = cpSvCanvas.getContext('2d');
    const w = cpSvCanvas.width, h = cpSvCanvas.height;
    // white→hue gradient (horizontal)
    const gH = ctx.createLinearGradient(0, 0, w, 0);
    gH.addColorStop(0, '#fff');
    const [hr, hg, hb] = hsvToRgb(cpHue, 1, 1);
    gH.addColorStop(1, `rgb(${hr},${hg},${hb})`);
    ctx.fillStyle = gH; ctx.fillRect(0, 0, w, h);
    // black gradient (vertical)
    const gV = ctx.createLinearGradient(0, 0, 0, h);
    gV.addColorStop(0, 'rgba(0,0,0,0)'); gV.addColorStop(1, '#000');
    ctx.fillStyle = gV; ctx.fillRect(0, 0, w, h);
    // cursor
    const cx = cpSat * w, cy = (1 - cpVal) * h;
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
  }
  function cpDrawHue() {
    const ctx = cpHueCanvas.getContext('2d');
    const w = cpHueCanvas.width, h = cpHueCanvas.height;
    const g = ctx.createLinearGradient(0, 0, w, 0);
    for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, `hsl(${i * 60},100%,50%)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // cursor line
    const x = cpHue * w;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.strokeRect(x - 3, 0, 6, h);
  }
  function cpUpdateFromHSV() {
    const [r, g, b] = hsvToRgb(cpHue, cpSat, cpVal);
    const hex = rgbToHex(r, g, b);
    cpHexInput.value = hex;
    cpPreview.style.background = hex;
    cpDrawSV(); cpDrawHue();
  }
  function cpSyncCanvas() {
    cpSvCanvas.width = cpSvCanvas.offsetWidth;
    cpSvCanvas.height = cpSvCanvas.offsetWidth; // square
    cpHueCanvas.width = cpHueCanvas.offsetWidth;
    cpHueCanvas.height = cpHueCanvas.offsetHeight || 20;
    cpUpdateFromHSV();
  }

  // Pointer events for SV canvas
  /** @param {PointerEvent & { touches?: TouchList }} e  （旧タッチイベント互換で touches も見る） */
  function cpSvPointer(e) {
    e.preventDefault();
    const r = cpSvCanvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    cpSat = Math.max(0, Math.min(1, (cx - r.left) / r.width));
    cpVal = Math.max(0, Math.min(1, 1 - (cy - r.top) / r.height));
    cpUpdateFromHSV();
  }
  cpSvCanvas.addEventListener('pointerdown', e => { cpSvPointer(e); cpSvCanvas.setPointerCapture(e.pointerId); });
  cpSvCanvas.addEventListener('pointermove', e => { if (e.buttons) cpSvPointer(e); });

  // Pointer events for Hue canvas
  /** @param {PointerEvent & { touches?: TouchList }} e */
  function cpHuePointer(e) {
    e.preventDefault();
    const r = cpHueCanvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    cpHue = Math.max(0, Math.min(1 - Number.EPSILON, (cx - r.left) / r.width));
    cpUpdateFromHSV();
  }
  cpHueCanvas.addEventListener('pointerdown', e => { cpHuePointer(e); cpHueCanvas.setPointerCapture(e.pointerId); });
  cpHueCanvas.addEventListener('pointermove', e => { if (e.buttons) cpHuePointer(e); });

  // HEX input
  cpHexInput.addEventListener('change', () => {
    let h = cpHexInput.value.trim();
    if (!h.startsWith('#')) h = '#' + h;
    if (!/^#[0-9a-fA-F]{6}$/.test(h)) return;
    const [r, g, b] = hexToRgb(h);
    [cpHue, cpSat, cpVal] = rgbToHsv(r, g, b);
    cpUpdateFromHSV();
  });

  // Open/close
  document.getElementById('btn-open-color-picker').addEventListener('click', () => {
    // Init from activeColor
    const [r, g, b] = hexToRgb(state.activeColor);
    [cpHue, cpSat, cpVal] = rgbToHsv(r, g, b);
    modalCp.classList.add('open');
    requestAnimationFrame(cpSyncCanvas);
  });
  document.getElementById('cp-btn-ok').addEventListener('click', () => {
    setActiveColor(cpHexInput.value);
    applyColorToTarget();
    modalCp.classList.remove('open');
  });
  document.getElementById('cp-btn-cancel').addEventListener('click', () => {
    modalCp.classList.remove('open');
  });

  // 編集中のボックスにリアルタイム反映（非編集時は何もしない）
  function applyColorToTarget() {
    if (state.editingIndex >= 0) {
      registry.recolor(state.editingIndex, hexToInt(state.activeColor));
    }
  }

  return { setActiveColor, applyColorToTarget };
}
