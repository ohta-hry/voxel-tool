import * as THREE from 'three';
import { camera, renderer } from '../scene.js';
import { registry } from '../registry.js';
import { enterEditMode, enterNormalMode } from './edit-mode.js';
import { state } from '../state.js';
import { TIMING } from '../config.js';

/** Enable selection of an existing shape by holding on it in the 3D viewport. */
export function initViewportSelection() {
  const canvas = renderer.domElement;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  /** @type {{ id: number, x: number, y: number, timer: number } | null} */
  let hold = null;

  const cancel = () => {
    if (hold) window.clearTimeout(hold.timer);
    hold = null;
  };

  const onDown = event => {
    if (event.button !== 0 || !event.isPrimary) return;
    cancel();
    const x = event.clientX;
    const y = event.clientY;
    const id = event.pointerId;
    const timer = window.setTimeout(() => {
      if (!hold || hold.id !== id) return;
      const rect = canvas.getBoundingClientRect();
      pointer.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(registry.entries.map(entry => entry.mesh), true);
      const hit = hits.find(result => {
        let object = result.object;
        while (object && !registry.entries.some(entry => entry.mesh === object)) object = object.parent;
        return !!object?.visible;
      });
      if (hit) {
        let object = hit.object;
        while (object && !registry.entries.some(entry => entry.mesh === object)) object = object.parent;
        const index = registry.entries.findIndex(entry => entry.mesh === object);
        if (index >= 0) enterEditMode(index);
      } else if (state.editingIndex >= 0) {
        enterNormalMode();
      }
      cancel();
    }, TIMING.viewportSelectionHoldMs);
    hold = { id, x, y, timer };
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', event => {
    if (hold && hold.id === event.pointerId && Math.hypot(event.clientX - hold.x, event.clientY - hold.y) > TIMING.viewportSelectionMoveTolerancePx) cancel();
  });
  canvas.addEventListener('pointerup', cancel);
  canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('lostpointercapture', cancel);
  window.addEventListener('blur', cancel);
}
