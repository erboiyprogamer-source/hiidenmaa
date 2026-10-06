/* Hiidenmaa – main.js
   Valikko, pääsilmukka ja testirajapinta window.__game */
'use strict';
// v1.24 KORJAUS (KORJAUKSET 22): valikkokameran tila esitellään ennen kuin startPlay voidaan kutsua (karttavaihdon jälkeinen automaattinen
// aloitus tapahtuu jo tiedoston alussa; ennen let-muuttujat olivat vielä alustamatta → ReferenceError → peli jäi mustaksi).
const MENU_SHOT_T=20;let menuShot=null,menuSpots=null,menuDeco=[],menuMob=null,menuLight=null,menuFading=false;

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
function startPlay(){if(typeof menuClear==='function')menuClear();setTimeout(()=>{if(typeof applyHudMode==='function')applyHudMode();},50);{const f=$('#menuFade');if(f)f.style.opacity=0;}fig.g.visible=true;started=true;{const h=$('#pcHint');if(h&&!h.hidden){h.classList.add('fade');setTimeout(()=>h.hidden=true,1600);}}state='play';$('#menu').hidden=true;$('#hud').hidden=false;requestLock();invDirty=true;}
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
/* v1.15 (lista 2, kohta 6): valikon taustakamera näyttää satunnaisia kohteita lähikuvina: luontokohteet (biomit, järvi), hylätty
   leiri päivällä ja yöllä (nuotio palaa) ja eläimiä (kamera seuraa). 20 s per kohde, hidas 30° kierto ja hieman laskeutuen, vaihto
   mustan kautta (#menuFade 0,8 s). Ensimmäinen kohde arvotaan joka latauksella. Pelin aikana (Esc) tausta on pelaajan oma paikka. */
/* menuShot ym. esitelty tiedoston alussa (KORJAUKSET 22) */
function buildMenuSpots(){const S=[],r=Math.random,used=new Set(),want=['koivu','forest','suo','kangas','aarni','tunturi','rakka','beach','meadow','mountain'];
  for(let t=0;t<8000&&used.size<want.length;t++){const x=(r()-.5)*HALF*1.7,z=(r()-.5)*HALF*1.7,h=terrainH(x,z),b=biomeAt(x,z,h);if(h<.6||!want.includes(b)||used.has(b))continue;
    if(Math.abs(terrainH(x+3,z)-h)>1.5||Math.abs(terrainH(x,z+3)-h)>1.5)continue;used.add(b);S.push({k:'nature',x,z,b});}
  for(const [lx,lz,lr] of (MAP.lakes||[]).slice(0,2)){const cx=lx*WS,cz=lz*WS;for(let t=0;t<40;t++){const a=r()*TAU,d=lr*WS*(.9+t*.03),x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;if(terrainH(x,z)>.8){S.push({k:'lake',x,z,lx:cx,lz:cz});break;}}}
  for(const c of CAMPS)S.push({k:'camp',x:c.x,z:c.z,c,night:false},{k:'camp',x:c.x,z:c.z,c,night:true});
  const land=S.filter(s=>s.k==='nature'&&s.b!=='beach'&&s.b!=='mountain');
  for(const t of ['peura','poro','karhu','kettu','hirvi','janis'])if(land.length&&MOBDEF[t]){const s=land[(r()*land.length)|0];S.push({k:'animal',x:s.x,z:s.z,t});}
  return S;}
function menuClear(){for(const o of menuDeco)scene.remove(o);menuDeco=[];if(menuMob){mobRemove(menuMob);menuMob=null;}
  if(menuLight){const i=lightSources.indexOf(menuLight);if(i>=0)lightSources.splice(i,1);menuLight=null;}}
function newMenuShot(){menuClear();if(!menuSpots)menuSpots=buildMenuSpots();if(!menuSpots.length)return;
  let s;for(let i=0;i<6;i++){s=menuSpots[(Math.random()*menuSpots.length)|0];if(!menuShot||s!==menuShot.s)break;}
  const an=s.k==='animal';menuShot={s,t:0,a0:Math.random()*TAU,dist:an?5+Math.random()*1.5:8+Math.random()*4,hgt:an?1.4+Math.random()*.6:2+Math.random()*1.6};
  dayT=s.k==='camp'?(s.night?.9:.47):[.3,.42,.52,.66][(Math.random()*4)|0];weather.cur='selkea';
  if(s.k==='camp'){const c=s.c,a=c.rot*Math.PI/4,fw=(d,q)=>[c.x+Math.sin(a)*d+Math.cos(a)*q,c.z+Math.cos(a)*d-Math.sin(a)*q];
    if(!pieces.some(p=>dist2(p.x,p.z,c.x,c.z)<49)){const [tx,tz]=fw(-3.2,0);
      for(const [t,x,z,rot] of [['teltta',tx,tz,c.rot],['nuotio',c.x,c.z,0]]){const m=buildPieceMesh(t);m.position.set(x,terrainH(x,z),z);m.rotation.y=rot*Math.PI/4;scene.add(m);menuDeco.push(m);
        if(m.userData.flame)for(const f of m.userData.flame)f.visible=s.night;}}
    if(s.night){menuLight={x:c.x,y:terrainH(c.x,c.z)+.9,z:c.z,c:0xff8a3a,i:2.4,on:()=>true};lightSources.push(menuLight);}}
  if(s.k==='animal'){menuMob=spawnMob(s.t,s.x,s.z);if(menuMob){menuMob.yaw=Math.random()*TAU;menuMob.menu=true;}}
  P.pos.set(s.x,terrainH(s.x,s.z),s.z);updateLights();}
function menuCam(dt){if(!started)fig.g.visible=false;
  if(!menuShot)newMenuShot();if(!menuShot){updateEnvironment(dt);return;}
  const sh=menuShot,s=sh.s;sh.t+=dt;const fade=$('#menuFade');
  if(sh.t>MENU_SHOT_T-.85&&!menuFading){menuFading=true;if(fade)fade.style.opacity=1;}
  if(sh.t>MENU_SHOT_T){newMenuShot();menuFading=false;if(fade)setTimeout(()=>{fade.style.opacity=0;},60);}
  let tx=s.x,tz=s.z;const m=menuMob;
  if(m&&!m.dead){m.yaw+=Math.sin(sh.t*.35+sh.a0)*.25*dt;moveMob(m,Math.sin(m.yaw),Math.cos(m.yaw),(m.def.walk||1.5)*.8,dt);animMob(m,dt);tx=m.pos.x;tz=m.pos.z;}
  const k=Math.min(1,sh.t/MENU_SHOT_T),ty=terrainH(tx,tz);
  if(s.k==='lake'){const a=Math.atan2(s.z-s.lz,s.x-s.lx),cx=s.x+Math.cos(a)*4,cz=s.z+Math.sin(a)*4;camera.position.set(cx,Math.max(terrainH(cx,cz),0)+3.5-k,cz);
    const pa=a+Math.PI+(k-.5)*.5;camera.lookAt(s.x+Math.cos(pa)*40,1.2,s.z+Math.sin(pa)*40);}
  else{const ang=sh.a0+k*Math.PI/6,d=sh.dist*(1-.12*k),cx=tx+Math.cos(ang)*d,cz=tz+Math.sin(ang)*d;
    camera.position.set(cx,Math.max(terrainH(cx,cz)+1.2,ty+sh.hgt*(1-.25*k)),cz);
    /* kohde kuvan oikealle puolelle (valikon tekstit ovat vasemmalla): katsepistettä siirretään kameran vasemmalle 30 % etäisyydestä */
    const fx=tx-cx,fz=tz-cz,fl=Math.hypot(fx,fz)||1,off=d*.3;camera.lookAt(tx+fz/fl*off,ty+(s.k==='animal'?.7:1.1),tz-fx/fl*off);}
  P.pos.set(tx,ty,tz);updateEnvironment(dt);if(typeof updateChunkVis==='function')updateChunkVis();
  if(menuLight){const l=LIGHTS.find(l=>l.position.x===menuLight.x&&l.position.z===menuLight.z);if(l)l.intensity=menuLight.i*1.15*(.85+.1*Math.sin(playTime*13+sh.t*7)+.05*Math.sin(sh.t*31));}}
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
