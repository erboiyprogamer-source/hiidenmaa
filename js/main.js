/* Hiidenmaa – main.js
   Valikko, pääsilmukka ja testirajapinta window.__game */
'use strict';

/* ---------------- MENU ---------------- */
function hasSave(){try{return!!localStorage.getItem(SKEY);}catch(e){return false;}}
function refreshMenu(){const s=hasSave();const inGame=started;$('#bContinue').hidden=!s||inGame;$('#bResume').hidden=!inGame;$('#bSave').hidden=!inGame;$('#bNew').querySelector('small').textContent=inGame?'Aloittaa alusta – nykyinen eteneminen katoaa, ellei sitä ole tallennettu':'Aloita rannalta ilman mitään';
  if(s&&!inGame){try{const d=JSON.parse(localStorage.getItem(SKEY));$('#saveInfo').textContent=`Päivä ${d.dayN} · ${Math.round(d.playTime/60)} min pelattu`;}catch(e){}}}
let started=false,confirmNew=false;
function startPlay(){started=true;state='play';$('#menu').hidden=true;$('#hud').hidden=false;requestLock();invDirty=true;}
function pauseGame(){if(state!=='play')return;state='paused';$('#menu').hidden=false;$('#hud').hidden=true;refreshMenu();mouseL=mouseR=false;P.drawing=false;}
$('#bNew').onclick=()=>{if(started&&!confirmNew){confirmNew=true;$('#bNew').firstChild.textContent='Vahvista: uusi peli';setTimeout(()=>{confirmNew=false;$('#bNew').firstChild.textContent='Uusi peli';},4000);return;}confirmNew=false;$('#bNew').firstChild.textContent='Uusi peli';newGame();startPlay();};
$('#bContinue').onclick=()=>{try{loadData(JSON.parse(localStorage.getItem(SKEY)));startPlay();msg('Tervetuloa takaisin.');}catch(e){$('#ioMsg').textContent='Tallennuksen lataus epäonnistui.';}};
$('#bResume').onclick=()=>{state='play';$('#menu').hidden=true;$('#hud').hidden=false;requestLock();};
$('#bSave').onclick=()=>{const ok=saveGame(true);$('#ioMsg').textContent=ok?'Tallennettu selaimeen.':'Selaimen tallennus ei ole käytössä – kopioi tallennuskoodi.';$('#opts').hidden=false;if(!ok)$('#bExport').click();};
$('#bMenuToggle').onclick=()=>{$('#opts').hidden=!$('#opts').hidden;};
$('#bExport').onclick=()=>{const j=JSON.stringify(serialize());$('#saveCode').value=btoa(unescape(encodeURIComponent(j)));$('#ioMsg').textContent='Koodi luotu nykyisestä pelistä.';};
$('#bCopy').onclick=()=>{const t=$('#saveCode');if(!t.value)$('#bExport').click();navigator.clipboard.writeText(t.value).then(()=>$('#ioMsg').textContent='Kopioitu leikepöydälle.').catch(()=>{t.select();$('#ioMsg').textContent='Valittu – kopioi Ctrl+C:llä.';});};
$('#bImport').onclick=()=>{try{const s=JSON.parse(decodeURIComponent(escape(atob($('#saveCode').value.trim()))));loadData(s);startPlay();msg('Peli ladattu koodista.','loot');}catch(e){$('#ioMsg').textContent='Koodi ei kelpaa.';}};
$('#optShadow').onchange=e=>{renderer.shadowMap.enabled=e.target.checked;scene.traverse(o=>{if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);}});};
$('#optSound').onchange=e=>{soundOn=e.target.checked;};
$('#optInvY').onchange=e=>{invertY=e.target.checked;};
$('#bRespawn').onclick=respawn;
$('#bWinCont').onclick=()=>{$('#winS').hidden=true;$('#hud').hidden=false;state='play';requestLock();};
refreshMenu();

/* ---------------- MAIN LOOP ---------------- */
let last=performance.now(),slowT=0,saveT=0,lightT=0,menuA=0;
function update(dt){
  playTime+=dt;dayT+=dt/DAY_LEN;if(dayT>=1){dayT-=1;dayN++;msg(`Päivä ${dayN}`);}
  const wasNight=isNight();
  updatePlayer(dt);updateMobs(dt);updateProjs(dt);updateDrops(dt);updateFx(dt);updateStations(dt);spawner(dt);survival(dt);updateWeather();
  updateEnvironment(dt);updateCamera(dt);
  if(state==='play'){lookTarget=findInteract();updateGhost();}else if(ghost)ghost.visible=false;
  lightT-=dt;if(lightT<=0){lightT=.4;updateLights();}
  slowT-=dt;if(slowT<=0){slowT=1;exploreTick();updateGoals();if(Math.floor(playTime)%5===0)respawnNodes();}
  saveT+=dt;if(saveT>90){saveT=0;saveGame(true);}
  updateHUD(dt);
}
function menuCam(dt){menuA+=dt*.03;const cx=Math.cos(menuA)*60,cz=Math.sin(menuA)*60;camera.position.set(cx,terrainH(cx,cz)+22,cz);camera.lookAt(0,6,6);P.pos.set(0,5,6);updateEnvironment(dt);if(!started)fig.g.visible=true;}
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;
  try{
    if(state==='play'||state==='ui')update(dt);
    else if(state==='menu')menuCam(dt);
    else if(state==='paused'){updateEnvironment(0);}
    else if(state==='dead'||state==='win'){updateMobs(dt*.5);updateEnvironment(dt);}
  }catch(err){console.error(err);}
  renderer.render(scene,camera);
}
updateLights();
requestAnimationFrame(frame);
window.__game={renderer,get ghost(){return{sel:buildSel,ok:ghostOk,pos:ghostPos,why:lastInvalid}},placeBuild,openChest,scene,camera,P,get mobs(){return mobs},inv:()=>inv,pieces:()=>pieces,invAdd,addPiece,spawnMob,newGame,startPlay,flags:()=>flags,saveGame,serialize,loadData,setState:s=>state=s,get state(){return state},update,interact,togglePanel,useSlot,craft,RECIPE_BY,setBuildSel,enterDungeon,exitDungeon,camYaw:v=>camYaw=v,doMeleeHit,startAttack,nodes,setDay:v=>dayT=v};
