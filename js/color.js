export const PRESET_COLORS = [
  '#ffffff','#909090','#343434','#815631',
  '#B02E26','#F9801D','#FED83D','#80C71F',
  '#5E7C16','#3AB3DA','#3C44AA','#C74EBD'
];

export function initColorUI(context) {
  const { UI, getActiveColor, setColorState, getEditingIndex, getPlacedBoxes, scene, hexToInt, makeEdgeVoxelGroupForEntry, confirmEdit, placeBox } = context;
  let activeColor = getActiveColor(); // デフォルト：ターコイズ（既存自動色1）

// パレット生成
const palette = document.getElementById('color-palette');
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

function updateSwatchSelection(hex) {
  document.querySelectorAll('.color-swatch').forEach(sw => {
    sw.classList.toggle('selected', sw.dataset.color.toLowerCase() === hex.toLowerCase());
  });
}

const pickerPreview = document.getElementById('color-picker-preview');

function setActiveColor(hex) {
  // normalize to 6-digit hex
  if (hex.length === UI.hexShortLength) hex = '#'+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
  activeColor = hex;
  setColorState(hex);
  pickerPreview.style.background = hex;
  updateSwatchSelection(hex);
}

// ── Custom Color Picker ───────────────────────────────────────────────────────
let cpHue = 0, cpSat = 1, cpVal = 1;

function hsvToRgb(h, s, v) {
  let r,g,b;
  const i = Math.floor(h*6), f=h*6-i, p=v*(1-s), q=v*(1-f*s), t=v*(1-(1-f)*s);
  switch(i%6){case 0:r=v,g=t,b=p;break;case 1:r=q,g=v,b=p;break;case 2:r=p,g=v,b=t;break;
              case 3:r=p,g=q,b=v;break;case 4:r=t,g=p,b=v;break;case 5:r=v,g=p,b=q;break;}
  return [Math.round(r*255),Math.round(g*255),Math.round(b*255)];
}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');}
function hexToRgb(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return[r,g,b];}
function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;
  let h=0;if(d>0){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h/=6;if(h<0)h+=1;}
  return[h,mx===0?0:d/mx,mx];}

const cpSvCanvas  = document.getElementById('cp-sv-canvas');
const cpHueCanvas = document.getElementById('cp-hue-canvas');
const cpHexInput  = document.getElementById('cp-hex-input');
const cpPreview   = document.getElementById('cp-preview-swatch');
const modalCp     = document.getElementById('modal-color-picker');

function cpDrawSV() {
  const ctx = cpSvCanvas.getContext('2d');
  const w = cpSvCanvas.width, h = cpSvCanvas.height;
  // white→hue gradient (horizontal)
  const gH = ctx.createLinearGradient(0,0,w,0);
  gH.addColorStop(0,'#fff');
  const [hr,hg,hb] = hsvToRgb(cpHue,1,1);
  gH.addColorStop(1,`rgb(${hr},${hg},${hb})`);
  ctx.fillStyle = gH; ctx.fillRect(0,0,w,h);
  // black gradient (vertical)
  const gV = ctx.createLinearGradient(0,0,0,h);
  gV.addColorStop(0,'rgba(0,0,0,0)'); gV.addColorStop(1,'#000');
  ctx.fillStyle = gV; ctx.fillRect(0,0,w,h);
  // cursor
  const cx = cpSat*w, cy = (1-cpVal)*h;
  ctx.beginPath(); ctx.arc(cx,cy,6,0,Math.PI*2);
  ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2);
  ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.stroke();
}
function cpDrawHue() {
  const ctx = cpHueCanvas.getContext('2d');
  const w = cpHueCanvas.width, h = cpHueCanvas.height;
  const g = ctx.createLinearGradient(0,0,w,0);
  for(let i=0;i<=6;i++) g.addColorStop(i/6,`hsl(${i*60},100%,50%)`);
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  // cursor line
  const x = cpHue*w;
  ctx.strokeStyle='#fff'; ctx.lineWidth=2;
  ctx.strokeRect(x-3,0,6,h);
}
function cpUpdateFromHSV() {
  const [r,g,b] = hsvToRgb(cpHue,cpSat,cpVal);
  const hex = rgbToHex(r,g,b);
  cpHexInput.value = hex;
  cpPreview.style.background = hex;
  cpDrawSV(); cpDrawHue();
}
function cpSyncCanvas() {
  cpSvCanvas.width  = cpSvCanvas.offsetWidth;
  cpSvCanvas.height = cpSvCanvas.offsetWidth; // square
  cpHueCanvas.width  = cpHueCanvas.offsetWidth;
  cpHueCanvas.height = cpHueCanvas.offsetHeight || 20;
  cpUpdateFromHSV();
}

// Pointer events for SV canvas
function cpSvPointer(e) {
  e.preventDefault();
  const r = cpSvCanvas.getBoundingClientRect();
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  cpSat = Math.max(0,Math.min(1,(cx-r.left)/r.width));
  cpVal = Math.max(0,Math.min(1,1-(cy-r.top)/r.height));
  cpUpdateFromHSV();
}
cpSvCanvas.addEventListener('pointerdown', e=>{cpSvPointer(e); cpSvCanvas.setPointerCapture(e.pointerId);});
cpSvCanvas.addEventListener('pointermove', e=>{if(e.buttons)cpSvPointer(e);});

// Pointer events for Hue canvas
function cpHuePointer(e) {
  e.preventDefault();
  const r = cpHueCanvas.getBoundingClientRect();
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  cpHue = Math.max(0,Math.min(1 - Number.EPSILON,(cx-r.left)/r.width));
  cpUpdateFromHSV();
}
cpHueCanvas.addEventListener('pointerdown', e=>{cpHuePointer(e); cpHueCanvas.setPointerCapture(e.pointerId);});
cpHueCanvas.addEventListener('pointermove', e=>{if(e.buttons)cpHuePointer(e);});

// HEX input
cpHexInput.addEventListener('change', () => {
  let h = cpHexInput.value.trim();
  if(!h.startsWith('#')) h='#'+h;
  if(!/^#[0-9a-fA-F]{6}$/.test(h)) return;
  const [r,g,b] = hexToRgb(h);
  [cpHue,cpSat,cpVal] = rgbToHsv(r,g,b);
  cpUpdateFromHSV();
});

// Open/close
document.getElementById('btn-open-color-picker').addEventListener('click', () => {
  // Init from activeColor
  const [r,g,b] = hexToRgb(activeColor);
  [cpHue,cpSat,cpVal] = rgbToHsv(r,g,b);
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

function applyColorToTarget() {
  if (getEditingIndex() >= 0) {
    // 編集中ボックスにリアルタイム反映
    const entry = getPlacedBoxes()[getEditingIndex()];
    entry.color = hexToInt(activeColor);
    // mesh or Group の全マテリアルに色反映
    if (entry.mesh.userData && entry.mesh.userData.isCrossPillar) {
      for (const child of entry.mesh.children) {
        if (child.userData && child.userData.isOutlineEdge) continue;
        child.material.color.setHex(entry.color);
      }
    } else if (entry.mesh.userData && entry.mesh.userData.isRoof) {
      // roofはGroupなのでchild(各ボクセルMesh)のmaterialに適用
      for (const child of entry.mesh.children) {
        if (child.material) child.material.color.setHex(entry.color);
      }
    } else {
      entry.mesh.material.color.setHex(entry.color);
    }
    // edgeGroupがあれば再生成
    if (entry.edgeGroup) {
      scene.remove(entry.edgeGroup);
      entry.edgeGroup = makeEdgeVoxelGroupForEntry(entry);
      scene.add(entry.edgeGroup);
    }
  }
  // 非編集時は何もしない
}

// タブBの適用ボタン → タブAと同じ confirmEdit / placeBox 動作
// タブBの適用ボタン

  return { setActiveColor, applyColorToTarget };
}
