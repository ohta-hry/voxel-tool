/** バイト列をファイルとしてブラウザにダウンロードさせる
 * @param {string} fileName
 * @param {Uint8Array} bytes */
export function downloadBytes(fileName, bytes) {
  const blob = new Blob([/** @type {BlobPart} */ (bytes)], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
