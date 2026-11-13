/** '#rrggbb' → 0xRRGGBB
 * @param {string} hex
 * @returns {number} */
export function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}
