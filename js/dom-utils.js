// 型付きのDOM取得ヘルパー（getElementById / querySelectorAll の戻り値を具体的な要素型にする）

/** @param {string} id @returns {HTMLElement} */
export function byId(id) {
  return /** @type {HTMLElement} */ (document.getElementById(id));
}

/** @param {string} id @returns {HTMLInputElement} */
export function inputById(id) {
  return /** @type {HTMLInputElement} */ (document.getElementById(id));
}

/** @param {string} id @returns {HTMLSelectElement} */
export function selectById(id) {
  return /** @type {HTMLSelectElement} */ (document.getElementById(id));
}

/** @param {string} id @returns {HTMLCanvasElement} */
export function canvasById(id) {
  return /** @type {HTMLCanvasElement} */ (document.getElementById(id));
}

/** @param {string} id @returns {HTMLTextAreaElement} */
export function textareaById(id) {
  return /** @type {HTMLTextAreaElement} */ (document.getElementById(id));
}

/** @param {string} selector @returns {HTMLElement[]} */
export function queryAll(selector) {
  return /** @type {HTMLElement[]} */ ([...document.querySelectorAll(selector)]);
}
