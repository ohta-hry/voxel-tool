import { SHARED_RESOURCES } from './materials.js';

// Object3D 配下のジオメトリ・マテリアルを解放する（共有リソースは除く）
// 呼び出し前に scene.remove(root) しておくこと
/** @param {import('three').Object3D} root */
export function disposeObject3D(root) {
  root.traverse(object => {
    const obj = /** @type {import('three').Mesh} */ (object); // geometry/material は Mesh/Line 等が持つ
    if (obj.geometry && !SHARED_RESOURCES.has(obj.geometry)) obj.geometry.dispose();
    const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
    for (const m of mats) {
      if (!SHARED_RESOURCES.has(m)) m.dispose();
    }
  });
}
