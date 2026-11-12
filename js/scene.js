import * as THREE from 'three';
import { THEME, SCENE, VOXEL } from './config.js';
import { OrbitControls } from './orbit-controls.js';
import { createEdgeMaterial } from './materials.js';
import { dom } from './dom.js';

// ── Renderer / Scene / Camera ────────────────────────────────────────────────
export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(THEME.color.background);
renderer.shadowMap.enabled = true;
renderer.localClippingEnabled = true;
dom.container.appendChild(renderer.domElement);

export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(THEME.color.background, SCENE.fogDensity);
export const camera = new THREE.PerspectiveCamera(SCENE.camera.fov, SCENE.camera.aspect, SCENE.camera.near, SCENE.camera.far);
export const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = SCENE.controls.minDistance;
controls.maxDistance = SCENE.controls.maxDistance;

// ── Lights ───────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(THEME.color.ambientLight, SCENE.ambientLightIntensity));
const dirLight = new THREE.DirectionalLight(THEME.color.white, SCENE.directionalLight.intensity);
dirLight.position.set(...SCENE.directionalLight.position);
dirLight.castShadow = true;
scene.add(dirLight);
// カメラ追従ライト（ズームアウト時も明るさを保つ）
const camLight = new THREE.PointLight(THEME.color.white, SCENE.cameraLight.intensity, SCENE.cameraLight.distance);
scene.add(camLight);

// ── Clipping & Grid ──────────────────────────────────────────────────────────
const clipPlanes = [
  new THREE.Plane(new THREE.Vector3( 1, 0, 0), 0),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
  new THREE.Plane(new THREE.Vector3( 0, 1, 0), 0),
  new THREE.Plane(new THREE.Vector3( 0, 0, 1), 0),
  new THREE.Plane(new THREE.Vector3( 0, 0,-1), 0),
];
renderer.clippingPlanes = clipPlanes;

let gridLines = null;
let boundaryLines = null;
const axisGroup = new THREE.Group();
scene.add(axisGroup);

function lineMaterial(color) {
  return createEdgeMaterial(color, { transparent: false, opacity: 1 });
}

function addAxisLine(a, b, color) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b], VOXEL.bufferPositionItemSize));
  axisGroup.add(new THREE.Line(g, lineMaterial(color)));
}

export function buildGrid(cx, cz) {
  if (gridLines)     { scene.remove(gridLines);     gridLines.geometry.dispose(); }
  if (boundaryLines) { scene.remove(boundaryLines); boundaryLines.geometry.dispose(); }

  const pos = [];
  for (let z = 0; z <= cz; z++) pos.push(0, 0, z, cx, 0, z);
  for (let x = 0; x <= cx; x++) pos.push(x, 0, 0, x, 0, cz);
  const gg = new THREE.BufferGeometry();
  gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, VOXEL.bufferPositionItemSize));
  gridLines = new THREE.LineSegments(gg, lineMaterial(THEME.color.grid));
  scene.add(gridLines);

  const bp = [0,0,0,cx,0,0, cx,0,0,cx,0,cz, cx,0,cz,0,0,cz, 0,0,cz,0,0,0];
  const bg = new THREE.BufferGeometry();
  bg.setAttribute('position', new THREE.Float32BufferAttribute(bp, VOXEL.bufferPositionItemSize));
  boundaryLines = new THREE.LineSegments(bg, lineMaterial(THEME.color.boundary));
  scene.add(boundaryLines);

  axisGroup.clear();
  addAxisLine([0, 0, 0], [cx + VOXEL.unit, 0, 0], THEME.color.xAxis);
  addAxisLine([0, 0, 0], [0, Math.max(cx, cz) * SCENE.axisHeightScale + VOXEL.unit, 0], THEME.color.yAxis);
  addAxisLine([0, 0, 0], [0, 0, cz + VOXEL.unit], THEME.color.zAxis);

  clipPlanes[1].constant = cx;
  clipPlanes[4].constant = cz;

  const cx2 = cx / 2, cz2 = cz / 2;
  const dist = Math.max(cx, cz) * SCENE.initialCamera.distanceMultiplier;
  controls.target.set(cx2, 0, cz2);
  camera.position.set(
    cx2 + dist * SCENE.initialCamera.xOffset,
    dist * SCENE.initialCamera.yOffset,
    cz2 + dist * SCENE.initialCamera.zOffset
  );
  camera.lookAt(cx2, 0, cz2);
}

// ── Resize / Render loop ─────────────────────────────────────────────────────
function resize() {
  const w = dom.container.clientWidth, h = dom.container.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

export function setupResize() {
  new ResizeObserver(resize).observe(dom.container);
  resize();
}

export function startRenderLoop() {
  (function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // カメラ位置にライトを追従させ、距離に応じて強度を上げる
    camLight.position.copy(camera.position);
    const dist = camera.position.distanceTo(controls.target);
    camLight.intensity = Math.max(0, (dist - SCENE.cameraLight.minDistance) * SCENE.cameraLight.gain);
    renderer.render(scene, camera);
  })();
}
