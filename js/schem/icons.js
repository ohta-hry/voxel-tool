// ボタン用アイコン（フォント依存を避けるためインラインSVG）。色は currentColor に従う
const svg = (/** @type {string} */ body) =>
  `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

/** 電源マーク */
export const ICON_POWER = svg('<path d="M12 3v8"/><path d="M6.3 6.8a8 8 0 1 0 11.4 0"/>');

/** ダウンロードマーク */
export const ICON_DOWNLOAD = svg('<path d="M12 3v12"/><path d="M7 10.5l5 5 5-5"/><path d="M4 20h16"/>');
