/* Hiidenmaa – main.js
   Valikko, pääsilmukka ja testirajapinta window.__game */
'use strict';

/* ---------------- MENU ---------------- */
function hasSave(){try{return!!localStorage.getItem(SKEY);}catch(e){return false;}}
function refreshMenu(){const s=hasSave();const inGame=started;$('#bContinue').hidden=!s||inGame;$('#bResume').hidden=!inGame;$('#bSave').hidden=!inGame;$('#bNew').querySelector('small').textContent=inGame?'Aloittaa alusta uudella arvotulla kartalla – nykyinen eteneminen katoaa, ellei sitä ole tallennettu':'Aloita rannalta ilman mitään – kartta arvotaan';
  $('#mapName').textContent=`Kartta: ${MAP.name}`;
  if(s&&!inGame){try{const d=JSON.parse(localStorage.getItem(SKEY));$('#saveInfo').textContent=`${(MAPS[d.mapId||0]||MAPS[0]).name} · päivä ${d.dayN} · ${Math.round(d.playTime/60)} min pelattu`;}catch(e){}}}
// Valikon vierityksen vihjeet: ohuet, raaputetun näköiset tikkunuolet ylä- ja alareunassa, jotka sykkivät rauhallisesti,
// kun sivua on piilossa ylhäällä tai alhaalla. Vierityspalkki on piilotettu CSS:llä.
function scrollHints(el){
  const svg=(up)=>`<svg viewBox="0 0 16 36" width="12" height="30" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="${up?'M8.2 34 L7.8 19 L8.3 3.2':'M7.8 2 L8.2 17 L7.7 32.8'}" stroke-width="1.3"/><path d="${up?'M8.6 33 L8.4 4.4':'M7.4 3 L7.6 31.6'}" stroke-width=".6" opacity=".6"/>
    <path d="${up?'M2.6 9.4 L8.1 3 L13.6 9.8':'M2.4 26.6 L7.9 33 L13.4 26.2'}" stroke-width="1.3"/><path d="${up?'M3.4 10.2 L8.3 4.2':'M3.2 25.8 L8.1 31.8'}" stroke-width=".6" opacity=".6"/></g></svg>`;
  const mk=(cls,up)=>{const d=document.createElement('div');d.className='scrollHint '+cls;d.innerHTML=svg(up);el.appendChild(d);return d;};
  const u=mk('up',true),dn=mk('down',false);
  const upd=()=>{u.classList.toggle('on',el.scrollTop>6);dn.classList.toggle('on',el.scrollTop+el.clientHeight<el.scrollHeight-6);};
  el.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);
  if(window.ResizeObserver)new ResizeObserver(upd).observe(el.firstElementChild||el);
  new MutationObserver(upd).observe(el,{subtree:true,attributes:true,attributeFilter:['hidden'],childList:true});
  setTimeout(upd,50);return upd;}
let started=false,confirmNew=false;
// v1.14 (lista 2, kohta 5): "Toimii parhaiten tietokoneella…" näkyy ruudun yläkeskellä kerran per käynnistys 6 s ja häipyy 1,5 s:ssa
(function(){const h=$('#pcHint');if(!h)return;/* ajastin alkaa vasta kun valikko on piirretty (2. kehys), jotta latausaika ei syö näkymisaikaa */
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(started)return;h.hidden=false;setTimeout(()=>h.classList.add('fade'),6000);setTimeout(()=>{h.hidden=true;},7600);}));})();
function startPlay(){started=true;{const h=$('#pcHint');if(h&&!h.hidden){h.classList.add('fade');setTimeout(()=>h.hidden=true,1600);}}state='play';$('#menu').hidden=true;$('#hud').hidden=false;requestLock();invDirty=true;}
function pauseGame(){if(state!=='play'||openPanel||P.dead)return;state='paused';pausedAt=performance.now();$('#menu').hidden=false;$('#hud').hidden=true;refreshMenu();mouseL=mouseR=false;P.drawing=false;}
addEventListener('beforeunload',e=>{if(started&&!flags.won&&!reloading){e.preventDefault();e.returnValue='';}});
// Maailma rakennetaan skriptien latautuessa, joten kartan vaihto = sivun uudelleenlataus.
let reloading=false;
function switchMap(id,pending,data){try{localStorage.setItem('hiidenmaa_map',String(id));sessionStorage.setItem('hiidenmaa_pending',pending);if(data)sessionStorage.setItem('hiidenmaa_data',data);}catch(e){return false;}
  reloading=true;$('#fade').style.opacity=1;location.reload();return true;}
function startNewGame(){const id=Math.floor(Math.random()*MAPS.length);if(id!==MAP_ID&&switchMap(id,'new'))return;newGame();startPlay();msg(`Kartta: ${MAP.name}`);}
function playSave(s,welcome){const mid=s.mapId||0;if(mid!==MAP_ID&&switchMap(mid,'load',JSON.stringify(s)))return;loadData(s);startPlay();msg(welcome,'loot');}
$('#bNew').onclick=()=>{if(started&&!confirmNew){confirmNew=true;$('#bNew').firstChild.textContent='Vahvista: uusi peli';setTimeout(()=>{confirmNew=false;$('#bNew').firstChild.textContent='Uusi peli';},4000);return;}confirmNew=false;$('#bNew').firstChild.textContent='Uusi peli';startNewGame();};
$('#bContinue').onclick=()=>{try{playSave(JSON.parse(localStorage.getItem(SKEY)),'Tervetuloa takaisin.');}catch(e){$('#ioMsg').textContent='Tallennuksen lataus epäonnistui.';}};
$('#bResume').onclick=()=>{state='play';$('#menu').hidden=true;$('#hud').hidden=false;requestLock();};
// Tallenna: ei avaa asetuksia; ilmoitus näkyy painikkeessa ja valikon tilariviltä
$('#bSave').onclick=()=>{const ok=saveGame(true);const lbl=$('#bSave').firstChild,prevT=lbl.textContent;
  $('#saveMsg').textContent=ok?'Tallennettu selaimeen.':'Selaimen tallennus ei ole käytössä – avaa Asetukset › Tallennus ja tallenna koodi tai tiedosto.';
  lbl.textContent=ok?'Tallennettu ✓':'Tallennus epäonnistui';setTimeout(()=>{lbl.textContent=prevT;$('#saveMsg').textContent='';},2200);};
$('#bKeys').onclick=()=>{if(!$('#settings').hidden&&setTab==='keys'){$('#settings').hidden=true;return;}openSettings('keys');};
$('#bMenuToggle').onclick=()=>{if(!$('#settings').hidden&&setTab!=='keys'){$('#settings').hidden=true;return;}openSettings(setTab==='keys'?'gfx':setTab);};
$('#bSetClose').onclick=()=>{$('#settings').hidden=true;};
$('#bRespawn').onclick=respawn;
$('#bWinCont').onclick=()=>{$('#winS').hidden=true;$('#hud').hidden=false;state='play';requestLock();};
refreshMenu();scrollHints($("#menu"));
// Kartanvaihdon jälkeinen jatko: aloita uusi peli tai lataa tallennus automaattisesti.
(function(){let p=null,d=null;try{p=sessionStorage.getItem('hiidenmaa_pending');d=sessionStorage.getItem('hiidenmaa_data');sessionStorage.removeItem('hiidenmaa_pending');sessionStorage.removeItem('hiidenmaa_data');}catch(e){}
  if(p==='new'){newGame();startPlay();setTimeout(()=>msg(`Kartta: ${MAP.name}`),300);}
  else if(p==='load'&&d){try{loadData(JSON.parse(d));startPlay();setTimeout(()=>msg('Tervetuloa takaisin.','loot'),300);}catch(e){}}})();

/* ---------------- MAIN LOOP ---------------- */
let last=performance.now(),slowT=0,saveT=0,lightT=0,menuA=0;
function update(dt){
  playTime+=dt;dayT+=dt/DAY_LEN;if(dayT>=1){dayT-=1;dayN++;msg(`Päivä ${dayN}`);}
  const wasNight=isNight();
  updatePlayer(dt);updateDungeons(dt);updateStory(dt);updateMobs(dt);updateProjs(dt);updateDrops(dt);updateFx(dt);updateStations(dt);spawner(dt);survival(dt);updateWeather();
  updateEnvironment(dt);updateCamera(dt);updateBenchRings();updateChunkVis();updateGrass();
  if(state==='play'){lookTarget=findInteract();updateGhost();}else if(ghost)ghost.visible=false;
  lightT-=dt;if(lightT<=0){lightT=.4;updateLights();}
  slowT-=dt;if(slowT<=0){slowT=1;exploreTick();updateGoals();if(Math.floor(playTime)%5===0)respawnNodes();if(isNight()&&!P.inDun)nightRegrow();}
  saveT+=dt;if(saveT>90){saveT=0;saveGame(true);}
  updateZone(dt);updateHUD(dt);
}
function menuCam(dt){menuA+=dt*.03;const cx=Math.cos(menuA)*60,cz=Math.sin(menuA)*60;camera.position.set(cx,terrainH(cx,cz)+22,cz);camera.lookAt(0,6,6);P.pos.set(0,5,6);updateEnvironment(dt);if(!started)fig.g.visible=true;}
// Mukautuva laatu: liukuva keskiarvo kehysajasta; >36 ms 3 s → laatu −1 taso, <18 ms 12 s → +1 taso (min 6 s välein).
let fAvg=.016,qBadT=0,qGoodT=0,qCool=0;
function autoQuality(raw){if(raw>.5)return;fAvg+=(raw-fAvg)*.05;qCool-=raw;
  if(fAvg>.036){qBadT+=raw;qGoodT=0;}else if(fAvg<.018){qGoodT+=raw;qBadT=0;}else{qBadT=Math.max(0,qBadT-raw);qGoodT=Math.max(0,qGoodT-raw);}
  /* v1.12: osa-alueet laskevat järjestyksessä varjot → hiukkaset/usva/ruoho → resoluutio → piirtoetäisyys (vain päällä olevat),
     ja palautuvat käänteisessä järjestyksessä. Yksi askel kerrallaan, vähintään 6 s välein. */
  if(qCool<=0){const C=[['q',()=>QUAL.lvl,QUAL.max],['fx',()=>AUTO.fx,2],['res',()=>AUTO.res,3],['dist',()=>AUTO.dist,2]].filter(c=>autoOn(c[0]));
    const step=(k,d)=>{if(k==='q')setQuality(QUAL.lvl+d);else{AUTO[k]+=d;applyGfx();}qCool=6;};
    if(qBadT>3){const c=C.find(c=>c[1]()<c[2]);if(c){step(c[0],1);qBadT=0;}}
    else if(qGoodT>12){const c=[...C].reverse().find(c=>c[1]()>0);if(c){step(c[0],-1);qGoodT=0;}}}}
// v1.12 FPS-näyttö (asetus fps): päivittyy 2 kertaa sekunnissa, väri sujuvuuden mukaan
let fpsN=0,fpsT=0;
function updateFps(raw){if(SET.fps==='off')return;fpsN++;fpsT+=raw;if(fpsT<.5)return;const f=Math.round(fpsN/fpsT),el=$('#fps');fpsN=0;fpsT=0;
  if(el){el.textContent=f+' FPS';el.style.color=f>=50?'#8fd8a0':f>=30?'#e8c45a':'#e0614f';}}
function frame(now){
  requestAnimationFrame(frame);
  const raw=(now-last)/1000,dt=Math.min(.05,raw);last=now;
  if(state==='play'&&SET.autoAll)autoQuality(raw);updateFps(raw);
  try{
    if(state==='play'||state==='ui')update(dt);
    else if(state==='menu')menuCam(dt);
    else if(state==='paused'){updateEnvironment(0);}
    else if(state==='dead'||state==='win'){updateMobs(dt*.5);updateEnvironment(dt);}
  }catch(err){console.error(err);}
  renderer.render(scene,camera);
}
updateLights();applyGfx();
requestAnimationFrame(frame);
window.__game={renderer,keys,G,WH,get ghost(){return{sel:buildSel,ok:ghostOk,pos:ghostPos,why:lastInvalid}},placeBuild,openChest,scene,camera,P,get mobs(){return mobs},inv:()=>inv,pieces:()=>pieces,invAdd,addPiece,spawnMob,newGame,startPlay,flags:()=>flags,saveGame,serialize,loadData,setState:s=>state=s,get state(){return state},update,interact,togglePanel,useSlot,craft,RECIPE_BY,setBuildSel,enterDungeon,exitDungeon,camYaw:v=>camYaw=v,doMeleeHit,startAttack,nodes,setDay:v=>dayT=v};
