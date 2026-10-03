/* Hiidenmaa – input.js
   Näppäimistö, hiiri ja hiiren lukitus */
'use strict';

/* ---------------- INPUT ---------------- */
const keys={};let mouseL=false,mouseR=false,locked=false,lockFailed=false,invertY=false;
const canvas=renderer.domElement;
addEventListener('keydown',e=>{
  if(e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT')return;
  keys[e.code]=true;
  if(e.code==='Tab'){e.preventDefault();}
  if(state!=='play'&&state!=='ui')return;
  if(e.repeat)return;
  if(e.code==='Tab'||e.code==='KeyI')togglePanel('inv');
  else if(e.code==='KeyM')togglePanel('map');
  else if(e.code==='KeyB'){const w=equipped('weapon');if(w&&w.id==='vasara')togglePanel('build');else msg('Ota vasara käteen rakentaaksesi.','warn');}
  else if(e.code==='Escape'){if(openPanel)closePanels();}
  else if(state==='play'){
    if(e.code==='KeyE')interact();
    else if(e.code==='KeyR'){buildRot=(buildRot+1)%4;}
    else if(e.code==='KeyX')removeLooked();
    else if(/^Digit[1-8]$/.test(e.code))useSlot(+e.code.slice(5)-1);
  }
});
addEventListener('keyup',e=>{keys[e.code]=false;});
let dragLook=null;
canvas.addEventListener('mousedown',e=>{
  audio();if(actx&&actx.state!=='running')actx.resume();
  if(state!=='play')return;
  if(!locked&&!lockFailed){requestLock(true);return;}
  if(e.button===0){mouseL=true;dragLook={x:e.clientX,y:e.clientY,moved:false};onPrimary();}
  if(e.button===2){mouseR=true;onSecondary();}
});
addEventListener('mouseup',e=>{if(e.button===0){mouseL=false;onPrimaryUp();}if(e.button===2)mouseR=false;dragLook=null;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{
  if(state!=='play')return;
  let dx=0,dy=0;
  if(locked){dx=e.movementX;dy=e.movementY;}else if(lockFailed&&(e.buttons&1||e.buttons&2)){dx=e.movementX;dy=e.movementY;}
  if(Math.abs(dx)>200||Math.abs(dy)>200)return;
  camYaw-=dx*.0028;camPitch=clamp(camPitch+dy*.0028*(invertY?-1:1),-.6,1.25);
});
canvas.addEventListener('wheel',e=>{if(state==='play'){camDist=clamp(camDist+Math.sign(e.deltaY)*.6,2.2,10);}},{passive:true});
let lockFails=0;
function lockFail(fromClick){if(!fromClick)return;lockFails++;if(lockFails>=2&&!lockFailed){lockFailed=true;msg('Hiiren lukitus ei ole käytössä: käännä kameraa vetämällä hiirellä.','warn');}}
function requestLock(fromClick){try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>lockFail(fromClick));}catch(e){lockFail(fromClick);}}
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;if(locked)lockFails=0;if(!locked&&state==='play'&&!openPanel&&!suppressPause)pauseGame();suppressPause=false;});
document.addEventListener('pointerlockerror',()=>{});
let suppressPause=false;
function releaseLock(){if(document.pointerLockElement){suppressPause=true;document.exitPointerLock();}}
