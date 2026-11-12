// ── Constants ─────────────────────────────────────────────────────────────────
export const THEME = {
  color: {
    background: 0x0d0f14,
    ambientLight: 0xb0c0d8,
    white: 0xffffff,
    grid: 0x1e2530,
    boundary: 0x3a4a5a,
    xAxis: 0xff5f6e,
    yAxis: 0x4fc97a,
    zAxis: 0x5ba8ff,
    preview: 0x7ab8f8,
    previewEdge: 0xaad4ff,
    selectedEdge: 0xffd060,
    defaultEdge: 0x8ec8f8,
  },
  css: {
    panel: '#1b1f2a',
    panelBorder: '#2a2f3d',
    primaryBg: '#2a4a6e',
    primaryBorder: '#3a6a9e',
    primaryText: '#8ec8f8',
    mutedText: '#555c70',
    gableBg: '#4a2a6e',
    gableBorder: '#7a3a9e',
    gableText: '#c89af8',
    confirmBg: '#4a1e1e',
    confirmBorder: '#9a3030',
    confirmText: '#ff8080',
    errorBorder: '#d05050',
  },
  opacity: {
    preview: 1.0,
    activePreview: 1.0,
    previewEdge: 1.0,
    solid: 1.0,
    selected: 1.0,
    edge: 1.0,
    edgeVoxel: 1.0,
    edgeVoxelLine: 1.0,
  },
};

export const UI = {
  defaultCanvasSize: 16,
  defaultBox: { ox: 0, oy: 0, oz: 0, sx: 1, sy: 1, sz: 1 },
  minOrigin: 0,
  minSize: 1,
  defaultColorIndex: 9,
  hexShortLength: 4,
  hexInputLength: 7,
};

export const SCENE = {
  fogDensity: 0.006,
  camera: { fov: 45, aspect: 1, near: 0.1, far: 2000 },
  controls: { minDistance: 2, maxDistance: 500, zoomFactor: 0.95 },
  directionalLight: { intensity: 1.2, position: [10, 20, 10] },
  ambientLightIntensity: 1.0,
  cameraLight: { intensity: 0.0, distance: 0, minDistance: 20, gain: 0.04 },
  initialCamera: { distanceMultiplier: 1.5, xOffset: 0.5, yOffset: 0.75, zOffset: 0.9 },
  axisHeightScale: 0.4,
};

export const VOXEL = {
  unit: 1,
  half: 0.5,
  edgeAxisThreshold: 2,
  bufferPositionItemSize: 3,
  bufferUvItemSize: 2,
  faceVertexCount: 4,
};

export const TIMING = {
  confirmMs: 3000,
  feedbackMs: 1500,
  spinHoldDelayMs: 400,
  spinRepeatMs: 80,
};

// ── OrbitControls ─────────────────────────────────────────────────────────────
