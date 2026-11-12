import * as THREE from 'three';
import { SCENE } from './config.js';

// ── OrbitControls ─────────────────────────────────────────────────────────────
export class OrbitControls {
  constructor(camera, domElement) {
    this.camera = camera; this.domElement = domElement;
    this.target = new THREE.Vector3();
    this._spherical = new THREE.Spherical(); this._sphericalDelta = new THREE.Spherical();
    this._scale = 1; this._panOffset = new THREE.Vector3();
    this._rotateStart = new THREE.Vector2(); this._rotateEnd = new THREE.Vector2(); this._rotateDelta = new THREE.Vector2();
    this._panStart = new THREE.Vector2(); this._panEnd = new THREE.Vector2(); this._panDelta = new THREE.Vector2();
    this._dollyStart = new THREE.Vector2(); this._dollyEnd = new THREE.Vector2();
    this._state = -1;
    this.rotateSpeed = 1; this.panSpeed = 1; this.zoomSpeed = 1;
    this.minDistance = 1; this.maxDistance = Infinity;
    this.minPolarAngle = 0; this.maxPolarAngle = Math.PI;
    this._offset = new THREE.Vector3();
    this._quat = new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0,1,0));
    this._quatInverse = this._quat.clone().invert();
    this._bindEvents();
  }
  _bindEvents() {
    const el = this.domElement;
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('mousedown', e => this._onMouseDown(e));
    el.addEventListener('wheel', e => this._onWheel(e), { passive: false });
    el.addEventListener('touchstart', e => this._onTouchStart(e), { passive: false });
    el.addEventListener('touchmove', e => this._onTouchMove(e), { passive: false });
    el.addEventListener('touchend', () => { this._state = -1; });
    window.addEventListener('mousemove', e => this._onMouseMove(e));
    window.addEventListener('mouseup', () => { this._state = -1; });
  }
  _onMouseDown(e) {
    if (e.button===0){this._state=0;this._rotateStart.set(e.clientX,e.clientY);}
    else if(e.button===2){this._state=2;this._panStart.set(e.clientX,e.clientY);}
    else if(e.button===1){this._state=1;this._dollyStart.set(e.clientX,e.clientY);}
  }
  _onMouseMove(e) {
    const el = this.domElement;
    if(this._state===0){
      this._rotateEnd.set(e.clientX,e.clientY);
      this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);
      this._sphericalDelta.theta-=2*Math.PI*this._rotateDelta.x/el.clientHeight;
      this._sphericalDelta.phi-=2*Math.PI*this._rotateDelta.y/el.clientHeight;
      this._rotateStart.copy(this._rotateEnd);
    } else if(this._state===2){
      this._panEnd.set(e.clientX,e.clientY);
      this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed);
      this._pan(this._panDelta.x,this._panDelta.y); this._panStart.copy(this._panEnd);
    } else if(this._state===1){
      this._dollyEnd.set(e.clientX,e.clientY);
      const dy=this._dollyEnd.y-this._dollyStart.y;
      if(dy>0)this._scale/=Math.pow(SCENE.controls.zoomFactor,this.zoomSpeed);
      else if(dy<0)this._scale*=Math.pow(SCENE.controls.zoomFactor,this.zoomSpeed);
      this._dollyStart.copy(this._dollyEnd);
    }
  }
  _onWheel(e){e.preventDefault();if(e.deltaY<0)this._scale*=Math.pow(SCENE.controls.zoomFactor,this.zoomSpeed);else if(e.deltaY>0)this._scale/=Math.pow(SCENE.controls.zoomFactor,this.zoomSpeed);}
  _onTouchStart(e){
    e.preventDefault();
    if(e.touches.length===1){this._state=0;this._rotateStart.set(e.touches[0].clientX,e.touches[0].clientY);}
    else if(e.touches.length===2){
      this._state=3;
      const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY;
      this._dollyStart.set(0,Math.sqrt(dx*dx+dy*dy));
      this._panStart.set((e.touches[0].clientX+e.touches[1].clientX)/2,(e.touches[0].clientY+e.touches[1].clientY)/2);
    }
  }
  _onTouchMove(e){
    e.preventDefault();
    const el=this.domElement;
    if(this._state===0&&e.touches.length===1){
      this._rotateEnd.set(e.touches[0].clientX,e.touches[0].clientY);
      this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);
      this._sphericalDelta.theta-=2*Math.PI*this._rotateDelta.x/el.clientHeight;
      this._sphericalDelta.phi-=2*Math.PI*this._rotateDelta.y/el.clientHeight;
      this._rotateStart.copy(this._rotateEnd);
    } else if(this._state===3&&e.touches.length===2){
      const dx=e.touches[0].clientX-e.touches[1].clientX, dy=e.touches[0].clientY-e.touches[1].clientY;
      const dist=Math.sqrt(dx*dx+dy*dy);
      this._dollyEnd.set(0,dist);
      if(this._dollyEnd.y>this._dollyStart.y)this._scale*=Math.pow(SCENE.controls.zoomFactor,this.zoomSpeed);
      else if(this._dollyEnd.y<this._dollyStart.y)this._scale/=Math.pow(SCENE.controls.zoomFactor,this.zoomSpeed);
      this._dollyStart.copy(this._dollyEnd);
      const mx=(e.touches[0].clientX+e.touches[1].clientX)/2, my=(e.touches[0].clientY+e.touches[1].clientY)/2;
      this._panEnd.set(mx,my);
      this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed);
      this._pan(this._panDelta.x,this._panDelta.y); this._panStart.copy(this._panEnd);
    }
  }
  _pan(deltaX,deltaY){
    const el=this.domElement, cam=this.camera;
    this._offset.copy(cam.position).sub(this.target);
    const td=this._offset.length()*Math.tan((cam.fov/2)*Math.PI/180);
    const v=new THREE.Vector3();
    v.setFromMatrixColumn(cam.matrix,0).multiplyScalar(-2*deltaX*td/el.clientHeight);
    this.target.add(v); cam.position.add(v);
    v.setFromMatrixColumn(cam.matrix,1).multiplyScalar(2*deltaY*td/el.clientHeight);
    this.target.add(v); cam.position.add(v);
  }
  update(){
    const cam=this.camera;
    this._offset.copy(cam.position).sub(this.target).applyQuaternion(this._quat);
    this._spherical.setFromVector3(this._offset);
    this._spherical.theta+=this._sphericalDelta.theta;
    this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi+this._sphericalDelta.phi));
    this._spherical.makeSafe();
    this._spherical.radius=Math.max(this.minDistance,Math.min(this.maxDistance,this._spherical.radius*this._scale));
    this.target.add(this._panOffset);
    this._offset.setFromSpherical(this._spherical).applyQuaternion(this._quatInverse);
    cam.position.copy(this.target).add(this._offset);
    cam.lookAt(this.target);
    this._sphericalDelta.set(0,0,0); this._scale=1; this._panOffset.set(0,0,0);
  }
}
