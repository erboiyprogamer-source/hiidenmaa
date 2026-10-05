/* Hiidenmaa – input.js
   Näppäimistö, hiiri ja hiiren lukitus */
'use strict';

/* ---------------- INPUT ---------------- */
const keys={};let mouseL=false,mouseR=false,locked=false,lockFailed=false,invertY=false;
const canvas=renderer.domElement;
addEventListener('keydown',e=>{
  if(e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT'||e.target.tagName==='SELECT')return;
  keys[e.code]=true;
  if(e.code==='Tab'){e.preventDefault();}
  if(e.code===BIND.full&&!e.repeat&&(state==='play'||state==='ui'||state==='paused'))toggleFullscreen();
  if(state==='paused'&&e.code==='Escape'&&!e.repeat&&performance.now()-pausedAt>400){if(!$('#settings').hidden)$('#settings').hidden=true;else $('#bResume').click();return;}
  // v0.80: kuoleman ruudulla Enter herättää (hiiren lisäksi); kuollessa muut näppäimet eivät avaa valikoita
  if(state==='dead'){if((e.code==='Enter'||e.code==='NumpadEnter')&&!e.repeat){e.preventDefault();respawn();}return;}
  if(P.dead)return;
  if(state!=='play'&&state!=='ui')return;
  if(e.repeat)return;
  const c=e.code;
  if(DEV&&c==='Quote'){togglePanel('dev');return;}// DEV: Ä avaa/sulkee kehitysvalikon
  // v0.75: E sulkee avoimen valikon; repussa Q pudottaa valitusta yhden, Shift+Q kaikki
  if(openPanel&&c===BIND.interact){e.preventDefault();closePanels(false,true);return;}
  if(openPanel==='inv'&&c==='KeyQ'&&selSlot>=0&&inv[selSlot]){dropSel(e.shiftKey);return;}
  if(c===BIND.inv||(c==='KeyI'&&BIND.inv==='Tab'))togglePanel('inv');
  else if(c===BIND.map)togglePanel('map');
  else if(c===BIND.minizoom)cycleMiniZoom();
  else if(c===BIND.prog)togglePanel('prog');
  else if(c===BIND.log)togglePanel('log');
  else if(c===BIND.build){const w=equipped('weapon');if(w&&w.id==='vasara')togglePanel('build');else msg('Ota vasara käteen rakentaaksesi.','warn');}
  else if(c==='Escape'){if(openPanel){e.preventDefault();closePanels(false,true);}else if(state==='play'&&locked){pauseGame();releaseLock();}}
  else if(state==='play'){
    if(c===BIND.interact)interact();
    else if(c===BIND.rot){if(isBuilding()){if(e.shiftKey)cyclePose();else buildRot=(buildRot+1)%8;}}
    else if(c===BIND.snap){if(isBuilding())cycleSnap();}
    else if(c===BIND.vsnap){if(isBuilding())cycleVMode();}
    else if(c===BIND.up){if(isBuilding())liftBuild(1);}
    else if(c===BIND.down){if(isBuilding())liftBuild(-1);}
    else if(c===BIND.remove)removeLooked();
    else if(c===BIND.repair)repairLooked();
    else if(/^Digit[1-8]$/.test(c)){hotSel=+c.slice(5)-1;invDirty=true;useSlot(hotSel);}
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
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('auxclick',e=>{if(e.button===2)e.preventDefault();});
addEventListener('mousemove',e=>{
  if(state!=='play')return;
  let dx=0,dy=0;
  if(locked){dx=e.movementX;dy=e.movementY;}else if(lockFailed&&(e.buttons&1||e.buttons&2)){dx=e.movementX;dy=e.movementY;}
  if(Math.abs(dx)>200||Math.abs(dy)>200)return;
  camYaw-=dx*.0028;camPitch=clamp(camPitch+dy*.0028*(invertY?-1:1),-.6,1.25);
});
// Rulla: zoom tai (asetus) pikapaikan vaihto – valittu pikapaikka varustetaan heti jos esine on varustettava
canvas.addEventListener('wheel',e=>{if(state!=='play')return;
  if(SET.wheelHotbar){hotSel=((hotSel+Math.sign(e.deltaY))%8+8)%8;invDirty=true;const s=inv[hotSel];if(s&&ITEMS[s.id].cat&&!s.eq)toggleEquip(s);}
  else camDist=clamp(camDist+Math.sign(e.deltaY)*.6,2.2,10);},{passive:true});
let lockFails=0;
function lockFail(fromClick){if(!fromClick)return;lockFails++;if(lockFails>=2&&!lockFailed){lockFailed=true;msg('Hiiren lukitus ei ole käytössä: käännä kameraa vetämällä hiirellä.','warn');}}
function requestLock(fromClick){try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>lockFail(fromClick));}catch(e){lockFail(fromClick);}}
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;if(locked)lockFails=0;if(!locked&&state==='play'&&!openPanel&&!suppressPause&&performance.now()-panelClosedAt>600)pauseGame();suppressPause=false;});
document.addEventListener('pointerlockerror',()=>{});
let suppressPause=false,panelClosedAt=-9999,pausedAt=-9999;
// Koko näyttö: Chromessa Esc tulee pelille (ei poistu koko näytöstä) kun näppäimistö on lukittu.
function toggleFullscreen(){try{if(document.fullscreenElement){document.exitFullscreen();return;}
  const p=document.documentElement.requestFullscreen();const lk=()=>{if(navigator.keyboard&&navigator.keyboard.lock)navigator.keyboard.lock(['Escape']).catch(()=>{});};
  if(p&&p.then)p.then(lk).catch(()=>{});else lk();}catch(e){}}
function releaseLock(){if(document.pointerLockElement){suppressPause=true;document.exitPointerLock();}}
