/* Hiidenmaa – input.js
   Näppäimistö, hiiri ja hiiren lukitus */
'use strict';

/* ---------------- INPUT ---------------- */
const keys={};let mouseL=false,mouseR=false,locked=false,lockFailed=false,invertY=false;
const canvas=renderer.domElement;
addEventListener('keydown',e=>{
  // v1.40 (kohta 4): tekstikentässä Enter lopettaa kirjoittamisen, Tab sulkee repun kuten ennen; muut näppäimet menevät tekstiin
  if(e.target.tagName==='TEXTAREA'||e.target.tagName==='INPUT'||e.target.tagName==='SELECT'){if(e.code==='Enter'&&e.target.classList.contains('search')){e.target.blur();return;}if(e.code!=='Tab'||e.target.tagName==='TEXTAREA')return;e.target.blur();}
  // Paneelissa kirjoittaminen menee suoraan hakukenttään (ei tarvitse napsauttaa sitä ensin); toimintonäppäimet toimivat kuten ennen.
  if(state==='ui'&&openPanel&&e.key.length===1&&e.key!==' '&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.repeat){const sf={inv:'#craftSearch',build:'#buildSearch',dev:'#devQ'}[openPanel],el=sf&&$(sf);
    const skip=[BIND.interact,BIND.inv,'KeyI',BIND.menu,BIND.build,BIND.map,BIND.prog,BIND.log,BIND.full,BIND.hud,'KeyQ','Quote','Semicolon'];
    if(el&&!skip.includes(e.code)){e.preventDefault();el.focus();el.value+=e.key;el.dispatchEvent(new Event('input'));setTimeout(()=>{const n=el.value.length;try{el.setSelectionRange(n,n);}catch(err){}},5);return;}}
  keys[e.code]=true;
  if(e.code==='Tab'){e.preventDefault();}
  if(e.code===BIND.full&&!e.repeat&&(state==='play'||state==='ui'||state==='paused'))toggleFullscreen();
  // v1.40 (lista 4, kohta 7): Esc ei tee pelissä mitään (selain vapauttaa silti hiiren lukituksen). P = päävalikko ja yleinen sulkunäppäin.
  if(state==='paused'&&e.code===BIND.menu&&!e.repeat&&performance.now()-pausedAt>250){e.preventDefault();if(!$('#keyDlg').hidden)return;if(!menuBack())$('#bResume').click();return;}
  if(state==='menu'&&(e.code===BIND.menu||e.code==='Escape')&&!e.repeat){if($('#keyDlg').hidden&&menuBack())e.preventDefault();return;}   // v1.46: P/Esc palaa päänäkymään
  // v0.80: kuoleman ruudulla Enter herättää (hiiren lisäksi); kuollessa muut näppäimet eivät avaa valikoita
  if(state==='dead'){if((e.code==='Enter'||e.code==='NumpadEnter')&&!e.repeat){e.preventDefault();respawn();}return;}
  if(P.dead)return;
  if(state!=='play'&&state!=='ui')return;
  if(e.repeat)return;
  const c=e.code;
  if(DEV&&c==='Quote'){togglePanel('dev');return;}// DEV: Ä avaa/sulkee kehitysvalikon
  if(DEV&&(c==='Semicolon'||e.key==='ö'||e.key==='Ö')){togglePanel('devm');return;}   // v1.91 DEV: Ö avaa olento- ja pomovalikon
  // v0.75: E sulkee avoimen valikon; repussa Q pudottaa valitusta yhden, Shift+Q kaikki
  if(openPanel&&c===BIND.interact){e.preventDefault();closePanels(false,true);return;}
  if((openPanel==='inv'||openPanel==='chest')&&c==='KeyQ'&&hoverSlot&&dropAt(hoverSlot.g,hoverSlot.i,e.shiftKey))return;   // v1.31 hiiren alla
  if(openPanel==='inv'&&c==='KeyQ'&&selSlot>=0&&inv[selSlot]){dropSel(e.shiftKey);return;}
  if(c===BIND.inv||(c==='KeyI'&&BIND.inv==='Tab'))togglePanel('inv');
  else if(c===BIND.map)togglePanel('map');
  else if(c===BIND.minizoom)cycleMiniZoom();
  else if(c===BIND.prog)togglePanel('prog');
  else if(c===BIND.log)togglePanel('log');
  else if(c===BIND.hud){SET.hudMode=((SET.hudMode|0)+1)%4;saveSet();applyHudMode();}   // v1.18 (lista 2, kohta 8)
  else if(c===BIND.build){const w=equipped('weapon');if(w&&w.id==='vasara')togglePanel('build');else msg('Ota vasara käteen rakentaaksesi.','warn');}
  else if(c===BIND.menu){e.preventDefault();if(openPanel)closePanels(false);else if(state==='play'){pauseGame();releaseLock();}}
  else if(state==='play'){
    if(c===BIND.interact)interact();
    else if(c===BIND.rot){if(isBuilding()){if(e.shiftKey)cyclePose();else buildRot=(buildRot+1)%8;}}
    else if(c===BIND.snap){if(isBuilding())cycleSnap();}
    else if(c===BIND.vsnap){if(isBuilding())cycleVMode();}
    else if(c===BIND.up){if(isBuilding())liftBuild(1);else dropHot(e.shiftKey);}   // v1.57: pelissä Q pudottaa valitusta pikapaikasta 1, Shift+Q koko pinon
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
  const k=.0028*(+SET.sens||1);camYaw-=dx*k;camPitch=clamp(camPitch+dy*k*(invertY?-1:1),-.6,1.25);   // v1.54 kääntymisen herkkyys
});
// Rulla: zoom tai (asetus) pikapaikan vaihto – valittu pikapaikka varustetaan heti jos esine on varustettava
canvas.addEventListener('wheel',e=>{if(state!=='play')return;
  if(SET.wheelHotbar){hotSel=((hotSel+Math.sign(e.deltaY))%8+8)%8;invDirty=true;const s=inv[hotSel];if(s&&ITEMS[s.id].cat&&!s.eq)toggleEquip(s);}
  else camDist=clamp(camDist+Math.sign(e.deltaY)*.6,2.2,10);},{passive:true});
let lockFails=0;
function lockFail(fromClick){if(!fromClick)return;lockFails++;if(lockFails>=2&&!lockFailed){lockFailed=true;msg('Hiiren lukitus ei ole käytössä: käännä kameraa vetämällä hiirellä.','warn');}}
function requestLock(fromClick){try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>lockFail(fromClick));}catch(e){lockFail(fromClick);}}
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;if(locked)lockFails=0;vcSync();if(!locked&&state==='play'&&!openPanel&&performance.now()-panelClosedAt<600)requestLock();   /* v1.36: yritetään heti takaisin */if(!locked&&state==='play'&&!openPanel&&!suppressPause&&performance.now()-panelClosedAt>600)pauseGame();suppressPause=false;});
document.addEventListener('pointerlockerror',()=>{});
let suppressPause=false,panelClosedAt=-9999,pausedAt=-9999;
// Koko näyttö: Chromessa Esc tulee pelille (ei poistu koko näytöstä) kun näppäimistö on lukittu.
function toggleFullscreen(){try{if(document.fullscreenElement){document.exitFullscreen();return;}
  const p=document.documentElement.requestFullscreen();const lk=()=>{if(navigator.keyboard&&navigator.keyboard.lock)navigator.keyboard.lock(['Escape']).catch(()=>{});};
  if(p&&p.then)p.then(lk).catch(()=>{});else lk();}catch(e){}}
function releaseLock(){if(document.pointerLockElement){suppressPause=true;document.exitPointerLock();}}

/* ---------------- VIRTUAALINEN OSOITIN (v1.36, lista 3 kohta 22) ---------------- */
// Hiiren lukitus pysyy päällä myös repussa, arkussa, rakennusvalikossa, kartassa jne. Peli piirtää oman osoittimen (#vcur), jota liikutetaan
// lukitun hiiren liikkeellä (movementX/Y), ja välittää napsautukset, raahauksen ja rullan osoittimen alla olevalle elementille
// keinotekoisina tapahtumina. Kun paneeli suljetaan näppäimellä, lukitus on yhä päällä → kamera kääntyy heti ilman välinapsautusta.
// Esc vapauttaa lukituksen aina (selaimen sääntö), joten Esc-taukovalikon jälkeen tarvitaan yhä yksi napsautus.
const VC={x:innerWidth/2,y:innerHeight/2,on:false,el:null,hov:null,down:null};
(function(){const el=document.createElement('div');el.id='vcur';el.hidden=true;document.body.appendChild(el);VC.el=el;})();
function vcSync(){const on=locked&&!!openPanel&&state==='ui';if(on!==VC.on){VC.on=on;VC.el.hidden=!on;if(!on)vcHover(null);else{VC.x=clamp(VC.x,0,innerWidth-1);VC.y=clamp(VC.y,0,innerHeight-1);vcMove(0,0,true);}}}
const vcAt=()=>{const t=document.elementFromPoint(VC.x,VC.y);return t||document.body;};
const vcInit=(e,extra)=>Object.assign({bubbles:true,cancelable:true,composed:true,view:window,clientX:VC.x,clientY:VC.y,screenX:VC.x,screenY:VC.y,button:e?e.button:0,buttons:e?e.buttons:0,shiftKey:!!(e&&e.shiftKey)||!!(keys.ShiftLeft||keys.ShiftRight),ctrlKey:!!(e&&e.ctrlKey)||!!(keys.ControlLeft||keys.ControlRight),altKey:!!(e&&e.altKey),metaKey:!!(e&&e.metaKey)},extra||{});
function vcFire(type,e,extra,tgt){const t=tgt||vcAt();t.dispatchEvent(type==='wheel'?new WheelEvent(type,vcInit(e,extra)):new MouseEvent(type,vcInit(e,extra)));return t;}
// :hover ei toimi keinotekoisilla tapahtumilla → hiiren alla oleva elementti ja sen vanhemmat saavat luokan .vh (CSS:ssä samat tyylit kuin :hover)
function vcHover(t){if(t===VC.hov)return;const old=new Set();for(let a=VC.hov;a&&a!==document.body;a=a.parentElement)old.add(a);const nw=new Set();for(let a=t;a&&a!==document.body;a=a.parentElement)nw.add(a);
  for(const a of old)if(!nw.has(a))a.classList.remove('vh');for(const a of nw)a.classList.add('vh');
  if(VC.hov){VC.hov.dispatchEvent(new MouseEvent('mouseout',vcInit(null,{relatedTarget:t})));VC.hov.dispatchEvent(new MouseEvent('mouseleave',vcInit(null,{bubbles:false})));}
  if(t){t.dispatchEvent(new MouseEvent('mouseover',vcInit(null,{relatedTarget:VC.hov})));t.dispatchEvent(new MouseEvent('mouseenter',vcInit(null,{bubbles:false})));}VC.hov=t;}
// v1.54: osoitin siirtyy heti (vain transform, GPU), mutta raskas osa – elementFromPoint (pakottaa asettelun), hover-luokat ja
// keinotekoinen mousemove – tehdään kerran ruudunpäivitystä kohti kertyneellä liikkeellä (ennen joka hiiritapahtumalla → viive).
let vcPend=null;
function vcMove(dx,dy,quiet){VC.x=clamp(VC.x+dx,0,innerWidth-1);VC.y=clamp(VC.y+dy,0,innerHeight-1);VC.el.style.transform=`translate3d(${VC.x}px,${VC.y}px,0)`;
  if(quiet){vcHover(vcAt());return;}if(!vcPend){vcPend={dx:0,dy:0};requestAnimationFrame(vcFlush);}vcPend.dx+=dx;vcPend.dy+=dy;}
function vcFlush(){const p=vcPend;vcPend=null;if(!p||!VC.on)return;const t=vcAt();vcHover(t);vcFire('mousemove',VC.down,{movementX:p.dx,movementY:p.dy,buttons:VC.down?VC.down.buttons:0},t);}
// Oikeat tapahtumat pysäytetään ikkunan kaappausvaiheessa (ennen muita kuuntelijoita) ja korvataan osoittimen kohtaan lähetetyillä.
/* v1.76: Shift/Ctrl pohjassa välittyvät osoittimen tapahtumiin näppäintilasta (ennen VC:n mousemove ilman Shiftiä → esinetiedot katosivat
   liikkuessa). Nopeampi osoitin: Chromen pointerrawupdate (tulee heti, ei ruudun tahdissa) liikuttaa osoitinta; mousemove vain jos sitä ei ole. */
const VC_RAW='onpointerrawupdate' in window;let vcRawT=-1e9;   // varmistus: jos pointerrawupdate ei tule (esim. lukituksessa), mousemove liikuttaa
if(VC_RAW)addEventListener('pointerrawupdate',e=>{vcRawT=performance.now();vcSync();if(!VC.on)return;if(Math.abs(e.movementX)>300||Math.abs(e.movementY)>300)return;const k=+SET.curSens||1;vcMove(e.movementX*k,e.movementY*k);},true);
addEventListener('mousemove',e=>{if(!e.isTrusted)return;vcSync();if(!VC.on)return;e.stopImmediatePropagation();if(VC_RAW&&performance.now()-vcRawT<150)return;if(Math.abs(e.movementX)>300||Math.abs(e.movementY)>300)return;const k=+SET.curSens||1;vcMove(e.movementX*k,e.movementY*k);},true);   // v1.54 osoittimen herkkyys
addEventListener('mousedown',e=>{if(!e.isTrusted)return;vcSync();if(!VC.on)return;if(vcPend)vcFlush();e.stopImmediatePropagation();e.preventDefault();VC.down={button:e.button,buttons:e.buttons,shiftKey:e.shiftKey,ctrlKey:e.ctrlKey,altKey:e.altKey};
  const t=vcFire('mousedown',e);const ae=document.activeElement;if(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)){t.focus();if(t.tagName==='INPUT'&&/^(text|search)$/.test(t.type))setTimeout(()=>{try{t.select();}catch(err){}},0);}   /* v1.65: napsautus valitsee tekstin aina (kirjoita päälle) */
  else if(ae&&/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))ae.blur();},true);
addEventListener('mouseup',e=>{if(!e.isTrusted)return;if(!VC.on){VC.down=null;return;}if(vcPend)vcFlush();e.stopImmediatePropagation();VC.down=null;vcFire('mouseup',e);},true);
for(const ty of ['click','dblclick','contextmenu','auxclick'])addEventListener(ty,e=>{if(!e.isTrusted||!VC.on)return;e.stopImmediatePropagation();e.preventDefault();
  const t=vcAt();if(ty==='click'&&typeof t.click==='function'&&t.tagName==='LABEL'){t.click();return;}vcFire(ty,e,null,t);},true);
// Rulla: välitetään elementille ja vieritetään lähintä vieritettävää vanhempaa (keinotekoinen rulla ei vieritä itsestään).
addEventListener('wheel',e=>{if(!e.isTrusted||!VC.on)return;e.stopImmediatePropagation();const t=vcAt();const ev=new WheelEvent('wheel',vcInit(e,{deltaX:e.deltaX,deltaY:e.deltaY,deltaMode:e.deltaMode}));
  const ok=t.dispatchEvent(ev);if(!ok)return;for(let a=t;a&&a!==document.body;a=a.parentElement){const cs=getComputedStyle(a);if(/(auto|scroll)/.test(cs.overflowY)&&a.scrollHeight>a.clientHeight+1){a.scrollTop+=e.deltaMode===1?e.deltaY*18:e.deltaY;break;}}},{capture:true,passive:true});
addEventListener('resize',()=>{if(VC.on)vcMove(0,0,true);});
