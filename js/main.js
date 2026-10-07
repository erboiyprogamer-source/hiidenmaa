/* Hiidenmaa – main.js
   Valikko, pääsilmukka ja testirajapinta window.__game */
'use strict';
window.__JSV2='1.82';   // v1.58: versiotarkistus (viimeinen skripti)
// v1.24 KORJAUS (KORJAUKSET 22): valikkokameran tila esitellään ennen kuin startPlay voidaan kutsua (karttavaihdon jälkeinen automaattinen
// aloitus tapahtuu jo tiedoston alussa; ennen let-muuttujat olivat vielä alustamatta → ReferenceError → peli jäi mustaksi).
let frameErrShown=false;
/* v1.27: KÄYTTÄJÄN PYYNTÖ – valikkokameran muutokset (v1.15 3D-kierros, v1.25 animoidut kuvat) väliaikaisesti pois.
   true = alkuperäinen valikkokamera (kiertää kartan keskikohtaa). Palautus: false. Koodi säilyy (menuCam, menubg.js). */
const MENU_V2_OFF=false;   // v1.29: palautettu käyttöön (v1.27 väliaikaisesti true)
function menuCamOld(dt){menuA+=dt*.03;const cx=Math.cos(menuA)*60,cz=Math.sin(menuA)*60;camera.position.set(cx,terrainH(cx,cz)+22,cz);camera.lookAt(0,6,6);P.pos.set(0,5,6);updateEnvironment(dt);if(!started)fig.g.visible=true;}
const MENU_SHOT_T=20;let menuShot=null,menuSpots=null,menuDeco=[],menuMob=null,menuLight=null,menuFading=false;

/* ---------------- MENU ---------------- */
function hasSave(){return slotMeta().some(Boolean);}
// v1.36 (lista 3, kohta 20): päävalikon maailmalista (enint. 5): nimi, viimeksi pelattu, päivä, taso ja kartta; Pelaa, Nimeä, Poista (vahvistus)
// ja Uusi maailma omalla nimellä. Pelin aikana toiseen maailmaan siirtyminen tallentaa nykyisen ensin.
// v1.43 (lista 4, kohta 32): taukovalikon tila – Tauko (maailma pysähtyy) tai Käynnissä (maailma päivittyy valikon takana)
let pauseRun=false,intro=null,menuVis=true,uiAlt=false;   // intro ennen karttavaihdon jatkoa (KORJAUKSET 22)
try{pauseRun=localStorage.getItem('hiidenmaa_prun')==='1';}catch(e){}
function refreshMenu(){const inGame=started;$('#bResume').hidden=!inGame;$('#bSave').hidden=!inGame;{const b=$('#bRun');if(b){b.hidden=!inGame;$('#bRunT').textContent='Tila: '+(pauseRun?'Käynnissä':'Tauko');b.classList.toggle('on',pauseRun);}}
  const m=slotMeta();$('#mapName').textContent=inGame?`Kartta: ${MAP.name}`:'';$('#curWorld').textContent=inGame&&curSlot>=0&&m[curSlot]?`Maailma: ${m[curSlot].name}`:'';renderWorlds();
  // v1.46: sankaripainike – jatka viimeisintä maailmaa tai aloita ensimmäinen; Maailmat-painikkeen alateksti
  {const used=m.filter(Boolean).length,li=lastWorld(m),c=$('#bContinue');if(c){c.hidden=inGame;
    if(li>=0){const w=m[li];$('#bContT').textContent='Jatka seikkailua';$('#bContS').textContent=`${w.name} · päivä ${w.day||1} · taso ${w.lvl||1} · ${(MAPS[w.mapId||0]||MAPS[0]).name}`;}
    else{$('#bContT').textContent='Aloita seikkailu';$('#bContS').textContent='Uusi maailma – haaksirikko, ranta ja arvottu saari';}}
   const ws=$('#bWorldsS');if(ws)ws.textContent=used?`${used} / ${SLOTS} maailmaa – pelaa, nimeä tai aloita uusi`:'Ei vielä maailmoja – aloita uusi';}
  $('#menu').classList.toggle('inGame',inGame);menuStagger();}
function lastWorld(m){let b=-1,t=-1;m.forEach((w,i)=>{if(w&&(w.at||0)>t){t=w.at||0;b=i;}});return b;}
/* v1.46: valikon näkymät. 'main' = päänäkymä ilman vieritystä; 'worlds' ja 'settings' (Asetukset/Näppäimet) korvaavat sen leveällä
   näkymällä tyhjään tilaan. Takaisin-painike tai P palaa. #settings-paneelin hidden-tila ohjaa settings-näkymää (MutationObserver). */
function setMenuView(v){const M=$('#menu');if(!M||M.dataset.view===v)return;M.dataset.view=v;
  if(v==='worlds')$('#mvTitle').textContent='Maailmat';else if(v==='settings')$('#mvTitle').textContent=setTab==='keys'?'Näppäimet':'Asetukset';
  else{M.classList.remove('anim');void M.offsetWidth;M.classList.add('anim');}
  if(typeof sfx==='function')sfx('pickup',v==='main'?.8:1.2,.25);}
function menuBack(){const M=$('#menu');if(!M||M.dataset.view==='main')return false;if(!$('#settings').hidden)$('#settings').hidden=true;setMenuView('main');return true;}
function menuStagger(){let i=0;for(const b of $('#menu').querySelectorAll('.menuBtns>*'))if(!b.hidden)b.style.setProperty('--i',i++);}
(function(){const M=$('#menu');if(!M)return;
  for(const b of M.querySelectorAll('.mbtn[data-rune]')){if(b.querySelector('.mIco'))continue;const i=document.createElement('i');i.className='mIco';i.textContent=b.dataset.rune;b.prepend(i);const sh=document.createElement('b');sh.className='mSheen';b.appendChild(sh);}
  new MutationObserver(()=>{const open=!$('#settings').hidden;if(open)setMenuView('settings');else if(M.dataset.view==='settings')setMenuView('main');}).observe($('#settings'),{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(()=>{if(M.dataset.view==='settings')$('#mvTitle').textContent=setTab==='keys'?'Näppäimet':'Asetukset';}).observe($('#setTabs'),{childList:true});
  $('#bBack').onclick=menuBack;$('#bWorlds').onclick=()=>setMenuView('worlds');
  $('#bContinue').onclick=()=>{const m=slotMeta(),li=lastWorld(m);if(li>=0){const b=$(`#worlds [data-play="${li}"]`);if(b)b.click();}else{const nb=$('#bNewWorld');if(nb)nb.click();}};
  M.classList.add('anim');})();
const fmtAt=t=>{try{return new Date(t).toLocaleString('fi-FI',{dateStyle:'short',timeStyle:'short'});}catch(e){return '';}};
function renderWorlds(){const el=$('#worlds');if(!el)return;const m=slotMeta(),used=m.filter(Boolean).length,free=m.findIndex(x=>!x);
  el.innerHTML=`<h3>Maailmat <span class="note">${used} / ${SLOTS}</span></h3>`+m.map((w,i)=>!w?'':`<div class="world${started&&i===curSlot?' cur':''}" data-i="${i}">
    <div class="wInfo"><b class="wName">${esc(w.name)}</b><span>${fmtAt(w.at)} · päivä ${w.day||1} · taso ${w.lvl||1} · ${(MAPS[w.mapId||0]||MAPS[0]).name}${w.min?` · ${w.min} min`:''}</span></div>
    <div class="wBtns"><button class="btn pri" data-play="${i}">${started&&i===curSlot?'Pelissä':'Pelaa'}</button><button class="btn" data-ren="${i}">Nimeä</button><button class="btn" data-del="${i}">Poista</button></div></div>`).join('')+
    (free>=0?`<div class="wNew"><input id="newName" class="search" maxlength="28" placeholder="Maailma ${free+1}"><button class="mbtn" id="bNewWorld"><i class="mIco">ᚨ</i>Uusi maailma<small>Aloita rannalta ilman mitään – kartta arvotaan</small><b class="mSheen"></b></button></div>`
      :`<div class="note">Kaikki ${SLOTS} paikkaa ovat käytössä. Poista maailma tehdäksesi uuden.</div>`);
  el.querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>{const i=+b.dataset.play;if(started&&i===curSlot){$('#bResume').click();return;}
    const go=()=>{const d=slotData(i);if(!d){$('#saveMsg').textContent='Tallennus puuttuu tai on rikki.';return;}setCurSlot(i);playSave(d,`Tervetuloa takaisin: ${m[i].name}.`);};
    if(started)keyDialog(`Siirrytäänkö maailmaan «${m[i].name}»? Nykyinen maailma tallennetaan ensin.`,[['Vahvista',()=>{saveGame(true);go();}],['Peruuta',null]]);else go();});
  el.querySelectorAll('[data-ren]').forEach(b=>b.onclick=()=>{const i=+b.dataset.ren,row=el.querySelector(`.world[data-i="${i}"] .wName`);const inp=document.createElement('input');inp.className='search';inp.maxLength=28;inp.value=m[i].name;row.replaceWith(inp);inp.focus();inp.select();
    const done=ok=>{if(inp.dataset.done)return;inp.dataset.done=1;if(ok&&inp.value.trim()){const mm=slotMeta();mm[i].name=inp.value.trim();setSlotMeta(mm);}refreshMenu();};
    inp.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')done(true);else if(e.key==='Escape')done(false);};inp.onblur=()=>done(true);});
  el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const i=+b.dataset.del;keyDialog(`Poistetaanko maailma «${m[i].name}» pysyvästi?`,[['Vahvista',()=>{deleteSlot(i);refreshMenu();}],['Peruuta',null]],'Poistoa ei voi perua.');});
  const nb=$('#bNewWorld');if(nb){const ni=$('#newName');ni.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')nb.click();};
    nb.onclick=()=>{const name=ni.value.trim()||`Maailma ${free+1}`;const go=()=>{const mm=slotMeta();mm[free]={name,at:Date.now(),day:1,lvl:1,mapId:MAP_ID,min:0};setSlotMeta(mm);setCurSlot(free);startNewGame();};
      if(started)keyDialog(`Aloitetaanko uusi maailma «${name}»? Nykyinen maailma tallennetaan ensin.`,[['Vahvista',()=>{saveGame(true);go();}],['Peruuta',null]]);else go();};}}
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
(function(){const h=$('#pcHint');if(!h||true)return;   // v1.55: varoitus näytetään vain ensikäynnin aloitusjaksossa
  /* ajastin alkaa vasta kun valikko on piirretty (2. kehys), jotta latausaika ei syö näkymisaikaa */
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(started)return;h.hidden=false;setTimeout(()=>h.classList.add('fade'),3000);setTimeout(()=>{h.hidden=true;},4600);   /* v1.30: 3 s (ennen 6 s) */}));})();
function startPlay(){if(typeof menuClear==='function')menuClear();if(typeof mbgShow==='function'&&MBG.cv)mbgShow(false);setTimeout(()=>{if(typeof applyHudMode==='function')applyHudMode();},50);{const f=$('#menuFade');if(f)f.style.opacity=0;}fig.g.visible=true;started=true;{const h=$('#pcHint');if(h&&!h.hidden){h.classList.add('fade');setTimeout(()=>h.hidden=true,1600);}}state='play';$('#menu').hidden=true;$('#hud').hidden=false;requestLock();invDirty=true;}
function pauseGame(){if(state!=='play'||openPanel||P.dead)return;state='paused';pausedAt=performance.now();$('#menu').hidden=false;$('#settings').hidden=true;setMenuView('main');if(typeof logoRandom==='function')logoRandom();/* v1.48: uusi logoteema joka valikkokäynnillä */$('#hud').hidden=true;refreshMenu();mouseL=mouseR=false;P.drawing=false;}
addEventListener('beforeunload',e=>{if(started&&!flags.won&&!reloading){e.preventDefault();e.returnValue='';}});
// Maailma rakennetaan skriptien latautuessa, joten kartan vaihto = sivun uudelleenlataus.
let reloading=false;
function switchMap(id,pending,data){try{localStorage.setItem('hiidenmaa_map',String(id));sessionStorage.setItem('hiidenmaa_pending',pending);if(data)sessionStorage.setItem('hiidenmaa_data',data);}catch(e){return false;}
  reloading=true;$('#fade').style.opacity=1;location.reload();return true;}
function startNewGame(){const id=Math.floor(Math.random()*MAPS.length);if(id!==MAP_ID&&switchMap(id,'new'))return;worldLoad(()=>{newGame();startPlay();saveGame(true);msg(`Kartta: ${MAP.name}`);startIntro(true);});}
function playSave(s,welcome){if(curSlot<0){const f=freeSlot();setCurSlot(f<0?0:f);}const mid=s.mapId||0;if(mid!==MAP_ID&&switchMap(mid,'load',JSON.stringify(s)))return;loadData(s);startPlay();msg(welcome,'loot');}
$('#bRun').onclick=()=>{pauseRun=!pauseRun;try{localStorage.setItem('hiidenmaa_prun',pauseRun?'1':'0');}catch(e){}refreshMenu();};
$('#bResume').onclick=()=>{state='play';$('#menu').hidden=true;$('#hud').hidden=false;requestLock();};
// Tallenna: ei avaa asetuksia; ilmoitus näkyy painikkeessa ja valikon tilariviltä
$('#bSave').onclick=()=>{const ok=saveGame(true);refreshMenu();const lbl=$('#bSave .bLbl'),prevT='Tallenna nyt';$('#bSave').classList.toggle('saved',!!ok);   // v1.49: oma tekstielementti (firstChild on riimulaatta)
  $('#saveMsg').textContent=ok?'Tallennettu selaimeen.':'Selaimen tallennus ei ole käytössä – avaa Asetukset › Tallennus ja tallenna koodi tai tiedosto.';
  lbl.textContent=ok?'Tallennettu ✓':'Tallennus epäonnistui';setTimeout(()=>{lbl.textContent=prevT;$('#saveMsg').textContent='';$('#bSave').classList.remove('saved');},2200);};
$('#bKeys').onclick=()=>{if(!$('#settings').hidden&&setTab==='keys'){$('#settings').hidden=true;return;}openSettings('keys');};
$('#bMenuToggle').onclick=()=>{if(!$('#settings').hidden&&setTab!=='keys'){$('#settings').hidden=true;return;}openSettings(setTab==='keys'?'gfx':setTab);};
$('#bSetClose').onclick=()=>{$('#settings').hidden=true;};
$('#bRespawn').onclick=respawn;
$('#bWinCont').onclick=()=>{$('#winS').hidden=true;$('#hud').hidden=false;state='play';requestLock();};
refreshMenu();scrollHints($("#menu"));
// Kartanvaihdon jälkeinen jatko: aloita uusi peli tai lataa tallennus automaattisesti.
(function(){let p=null,d=null;try{p=sessionStorage.getItem('hiidenmaa_pending');d=sessionStorage.getItem('hiidenmaa_data');sessionStorage.removeItem('hiidenmaa_pending');sessionStorage.removeItem('hiidenmaa_data');}catch(e){}
  if(p==='new'){newGame();startPlay();saveGame(true);setTimeout(()=>msg(`Kartta: ${MAP.name}`),300);startIntro(true);introVeil(true);window.__ldAfter=introRelease;}
  else if(p==='load'&&d){try{loadData(JSON.parse(d));startPlay();setTimeout(()=>msg('Tervetuloa takaisin.','loot'),300);}catch(e){}}})();

/* v1.43 (lista 4, kohta 11): uuden maailman intro ~6 s. 4 s korkealla pilvien yläpuolella (175 m, hidas kierto pelaajan ympäri),
   "Hiidenmaa" ja kartan nimi animoituna; sitten 2 s nopea syöksy (easeInOut) tavalliseen kameraan. Ohitus millä tahansa näppäimellä tai napsautuksella. */
const _iP=new THREE.Vector3(),_iQ=new THREE.Quaternion(),_iH=new THREE.Vector3(),_iHQ=new THREE.Quaternion();
function startIntro(hold){if(P.inDun)return;intro={t:0,a0:Math.random()*TAU,hold:!!hold};state='intro';$('#hud').hidden=true;const el=$('#introT');if(!el)return;$('#introMap').textContent='Kartta · '+MAP.name;
  el.hidden=false;el.classList.remove('on','out');if(hold){el.classList.add('out');return;}void el.offsetWidth;el.classList.add('on');}
function endIntro(){if(!intro)return;intro=null;introCloudsClear();const el=$('#introT');if(el){el.classList.add('out');el.classList.remove('on');setTimeout(()=>{if(!intro)el.hidden=true;},900);}
  if(state==='intro'){state='play';$('#hud').hidden=false;}}
function introCam(dt){if(!intro)return;if(!intro.hold)intro.t+=Math.min(dt,.05);const t=intro.t,px=P.pos.x,py=P.pos.y,pz=P.pos.z;
  _iP.copy(camera.position);_iQ.copy(camera.quaternion);   // tavallinen kolmannen persoonan kamera (updateCamera juuri laski)
  const a=intro.a0+t*.11;_iH.set(px+Math.cos(a)*80,175,pz+Math.sin(a)*80);camera.position.copy(_iH);camera.lookAt(px,py,pz);_iHQ.copy(camera.quaternion);
  let k=0;if(t>4){const u=Math.min(1,(t-4)/2);k=u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;}
  camera.position.lerpVectors(_iH,_iP,k);camera.quaternion.copy(_iHQ).slerp(_iQ,k);
  if(k<1){const nf=scene.fog.near,ff=scene.fog.far;scene.fog.near=lerp(260,nf,k);scene.fog.far=lerp(700,ff,k);updateChunkVis();}
  if(t>=4.3&&$('#introT').classList.contains('on')){$('#introT').classList.remove('on');$('#introT').classList.add('out');}
  introCloudsTick(dt);if(t>=6)endIntro();}
/* v1.52 (lista 5, kohta 4): uusi maailma latausnäytön takana. Riimukivi näytetään (__ldShow), maailma rakennetaan, intron korkea
   kamera piirretään muutama kuva valmiiksi (varjostimet, ruudut) intro pidossa (hold). Kun latausnäyttö leimahtaa ja alkaa häipyä
   (__ldAfter), pilvet aukeavat sivuille: Medium ja yli → 3D-lisäpilvet kameran edessä (poistetaan animaation jälkeen), alle Medium
   CSS-pilviverho (#cloudVeil). Sitten intro jatkuu normaalisti (4 s ylhäällä + 2 s syöksy). Karttavaihdossa (sivun lataus) sama pito. */
function introHiQ(){const pi=presetIdx();return pi<0?(SET.shadow==='high'&&(+SET.lights||6)>=6):pi>=3;}
function worldLoad(build){if(window.__ldShow)window.__ldShow('Saari nousee merestä…');if(window.__ldSet)window.__ldSet(.08);
  introVeil(true);
  setTimeout(()=>{if(window.__ldSet)window.__ldSet(.45);build();let n=0;const tick=()=>{if(window.__ldSet)window.__ldSet(.45+n/24*.55);if(++n<24)requestAnimationFrame(tick);else introReady();};requestAnimationFrame(tick);},90);}
function introReady(){window.__ldAfter=introRelease;if(window.__ldDone)window.__ldDone();else introRelease();}
function introRelease(){if(!intro){introVeil(false);return;}intro.hold=false;intro.t=0;const el=$('#introT');if(el){el.classList.remove('out');void el.offsetWidth;el.classList.add('on');}
  if(introHiQ()){introVeil(false,true);introCloudsMake();}else introVeil(false);}
// CSS-pilviverho (alle Medium). v1.62: kolme kerrosta kummallakin puolella (taka/keski/etu), maalattu kerran canvasiin pehmeistä
// varjostetuista pilvipalloista (alta sinertävä varjo, päältä valo), sävy vuorokaudenajan mukaan (lightK). Aukeaminen: kerrokset liukuvat
// sivuille eri nopeuksilla ja kasvavat (lento pilvien läpi), keskeltä hehkuu valo. Vain transform/opacity → sulava heikollakin koneella.
function veilCloud(side,layer,tint){const w=420,h=520,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),R=Math.random;
  const o=document.createElement('canvas');o.width=w;o.height=h;const q=o.getContext('2d'),dk=1-(2-layer)*.08,T=(v)=>Math.round(v*tint*dk);
  // kumpupilvi: läpinäkymättömät kummut, valo ylävasemmalta ja sinertävä varjo alla; ylhäältä alas piirretyt kummut peittävät
  // edellisten varjopuolen → kerroksellinen, pöyheä pinta. Sisäreuna aaltoilee (kaksi siniaaltoa + satunnaisuus) ja on kumpujen rosottama.
  const C=[],lim=w*(.98-layer*.13),ph=R()*6;
  for(let y=-50;y<h+50;y+=10+R()*16){const e=lim*(.66+.16*Math.sin(y*.011+ph)+.1*Math.sin(y*.029+ph*2.3)+(R()-.5)*.08),r=20+R()*(26+layer*10);
    C.push([e-r*.35,y,r]);if(R()<.5)C.push([e-r*.9,y+(R()-.5)*16,r*(.6+R()*.5)]);for(let x=e-r*1.3-R()*30;x>-90;x-=60+R()*70)C.push([x,y+(R()-.5)*40,45+R()*75]);}
  C.sort((p,k)=>p[1]-k[1]);
  for(const [x0,y,r] of C){const x=side<0?x0:w-x0,gr=q.createRadialGradient(x-r*.28*side*-1,y-r*.45,r*.08,x,y,r*1.02);
    gr.addColorStop(0,`rgb(${T(255)},${T(253)},${T(250)})`);gr.addColorStop(.5,`rgb(${T(236)},${T(241)},${T(248)})`);gr.addColorStop(.86,`rgb(${T(206)},${T(215)},${T(230)})`);gr.addColorStop(1,`rgba(${T(170)},${T(182)},${T(204)},0)`);
    q.fillStyle=gr;q.beginPath();q.arc(x,y,r,0,6.2832);q.fill();}
  // utu sisäosan päälle: suuret läpikuultavat vaaleat läiskät häivyttävät toistuvan kumpukuvion
  for(let i=0;i<14;i++){const yy=R()*h,rr=60+R()*90,xx0=lim*(.1+R()*.45),xx=side<0?xx0:w-xx0,hz=q.createRadialGradient(xx,yy,0,xx,yy,rr);hz.addColorStop(0,`rgba(${T(246)},${T(248)},${T(252)},.55)`);hz.addColorStop(1,`rgba(${T(246)},${T(248)},${T(252)},0)`);q.fillStyle=hz;q.fillRect(xx-rr,yy-rr,rr*2,rr*2);}
  g.filter='blur(3.5px)';g.drawImage(o,0,0);g.filter='none';
  c.className=(side<0?'cL':'cR')+' l'+layer;return c;}
function introVeil(on,instant){let v=$('#cloudVeil');if(on){if(!v){v=document.createElement('div');v.id='cloudVeil';const t=.5+.5*clamp(typeof lightK==='number'?lightK:1,0,1);
    const bg=document.createElement('i');bg.className='cvBg';bg.style.filter=`brightness(${t.toFixed(2)})`;v.appendChild(bg);const sun=document.createElement('i');sun.className='cvSun';v.appendChild(sun);
    for(let l=0;l<3;l++)for(const sd of [-1,1])v.appendChild(veilCloud(sd,l,t));document.body.appendChild(v);}v.className='';return;}
  if(!v)return;if(instant){v.remove();return;}void v.offsetWidth;v.className='open';setTimeout(()=>{if(v.parentNode)v.remove();},3000);}
// 3D-lisäpilvet: sprite-ryppäät kameran edessä, vasen puoli liukuu vasemmalle ja oikea oikealle 2 s:ssa, häipyen
let IC=null;
function introCloudTex(){if(introCloudTex.t)return introCloudTex.t;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  for(let i=0;i<26;i++){const r=28+Math.random()*34,x=r+8+Math.random()*(240-2*r-16),y=r+30+Math.random()*(200-2*r-30),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.6,'rgba(245,248,255,.5)');gr.addColorStop(1,'rgba(240,244,250,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);}
  return introCloudTex.t=new THREE.CanvasTexture(c);}
function introCloudsMake(){introCloudsClear();const tex=introCloudTex(),L=[];const tint=.55+.45*lightK;
  for(let i=0;i<22;i++){const side=i%2?1:-1,m=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,depthTest:false,fog:false,color:new THREE.Color(tint,tint,tint*1.02)}));
    m.renderOrder=999;const sc=5+Math.random()*4;m.scale.set(sc*1.5,sc,1);scene.add(m);L.push({m,side,lx:side*(.3+Math.random()*3.2),ly:(Math.random()-.5)*5,lz:-(5+Math.random()*4),sp:.7+Math.random()*.6});}
  IC={L,t:0};}
const _icV=new THREE.Vector3();
function introCloudsTick(dt){if(!IC)return;IC.t+=Math.min(dt,.05);const k=Math.min(1,IC.t/2.1),e=k*k*(3-2*k);camera.updateMatrixWorld(true);
  for(const c of IC.L){_icV.set(c.lx+c.side*e*14*c.sp,c.ly+e*.8,c.lz+e*1.5);camera.localToWorld(_icV);c.m.position.copy(_icV);c.m.material.opacity=1-Math.max(0,(k-.55)/.45);}
  if(k>=1)introCloudsClear();}
function introCloudsClear(){if(!IC)return;for(const c of IC.L){scene.remove(c.m);c.m.material.dispose();}IC=null;}
addEventListener('keydown',e=>{if(state==='intro'&&!(intro&&intro.hold)){e.stopPropagation();e.preventDefault();endIntro();}},true);
addEventListener('mousedown',e=>{if(state==='intro'&&!(intro&&intro.hold)){e.stopPropagation();endIntro();}},true);
addEventListener('touchstart',()=>{if(state==='intro'&&!(intro&&intro.hold))endIntro();},{capture:true,passive:true});
/* v1.43/v1.60: suorituskykytesti tehdään ennen pelin latausta (js/boot.js, oma kevyt 3D-näkymä). Tulos on localStorage hiidenmaa_perf;
   pend:1 = esiasetusta ei ole vielä otettu käyttöön → otetaan tässä (perfApply) ja merkitään tehdyksi. */
function perfApply(){try{const r=JSON.parse(localStorage.getItem('hiidenmaa_perf')||'null');if(!r||!r.pend)return;applyPreset(clamp(r.idx|0,0,7));r.pend=0;localStorage.setItem('hiidenmaa_perf',JSON.stringify(r));}catch(e){}}
/* ---------------- MAIN LOOP ---------------- */
let last=performance.now(),slowT=0,saveT=0,lightT=0,menuA=0;
function update(dt){
  playTime+=dt;dayT+=dt/DAY_LEN;if(dayT>=1){dayT-=1;dayN++;msg(`Päivä ${dayN}`);}
  const wasNight=isNight();
  updatePlayer(dt);updateEffects(dt);updateDungeons(dt);updateStory(dt);updateMobs(dt);updateProjs(dt);updateDrops(dt);updateFx(dt);updateStations(dt);spawner(dt);survival(dt);updateWeather();
  updateEnvironment(dt);updateCamera(dt);updateBenchRings();updateChunkVis();updateGrass();
  if(state==='play'){lookTarget=findInteract();updateGhost();}else if(ghost)ghost.visible=false;
  lightT-=dt;if(lightT<=0){lightT=.4;updateLights();}
  slowT-=dt;if(slowT<=0){slowT=1;exploreTick();updateGoals();if(Math.floor(playTime)%5===0)respawnNodes();if(isNight()&&!P.inDun)nightRegrow();}
  saveT+=dt;if(saveT>120){saveT=0;saveGame(true);}   // v1.35 (kohta 21): automaattitallennus 2 min välein
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
const MENU_EL=$('#menu');
function frame(now){
  requestAnimationFrame(frame);
  const raw=(now-last)/1000,dt=Math.min(.05,raw);last=now;let skip3d=false;
  if(state==='play'&&SET.autoAll)autoQuality(raw);updateFps(raw);
  try{
    if(state==='play'||state==='ui')update(dt);
    else if(state==='menu'&&MENU_V2_OFF)menuCamOld(dt);
    else if(state==='menu'){if(SET.menuBg==='3d'){mbgShow(false);menuCam(Math.min(.25,raw));}else{mbgFrame(now);skip3d=true;}}   // v1.25: kuvat = ei 3D-piirtoa valikossa
    else if(state==='intro'){update(dt);introCam(dt);}
    else if(state==='paused'&&pauseRun)update(dt);   // v1.43: Käynnissä-tila
    else if(state==='paused'){updateEnvironment(0);updateGrass();updateLights();if(typeof updateMist==='function')updateMist(0);}   // v1.35 (kohta 18): asetusmuutokset näkyvät heti myös tauolla
    else if(state==='dead'||state==='win'){updateMobs(dt*.5);updateEnvironment(dt);updateEffects(dt);}
  }catch(err){console.error(err);if(!frameErrShown&&window.__bootBox){frameErrShown=true;window.__bootBox('Virhe pelisilmukassa: '+(err&&err.message||err));}}   // v1.26 näkyviin
  // v1.38: piirtovirhe näkyy tarkkana (ennen try-lohkon ulkopuolella → selain näytti vain "Script error.", KORJAUKSET 28)
  /* v1.76: valikon partikkelit/animaatiot vain kun valikko näkyy (pelissä ei kuormaa). Valikon avautuessa partikkelikerros häivytetään
     esiin (.mfFade). Asetus "Älä pysäytä valikon animaatioita" (menuAnimKeep) pitää partikkelit käynnissä myös pelin aikana. */
  {const mv=!!(MENU_EL&&!MENU_EL.hidden);if(mv&&!menuVis&&!SET.menuAnimKeep){MENU_EL.classList.add('mfFade');MFX.last=now;requestAnimationFrame(()=>requestAnimationFrame(()=>MENU_EL.classList.remove('mfFade')));}
   menuVis=mv;if(mv||(SET.menuAnimKeep&&started)){try{mfxFrame(now);}catch(err){console.error(err);}}}
  if(state==='ui'&&typeof VC!=='undefined'&&VC.on){uiAlt=!uiAlt;if(uiAlt)skip3d=true;}   // v1.76: paneelin ollessa auki 3D joka toinen ruutu → osoitin päivittyy useammin
  if(!skip3d){try{renderer.render(scene,camera);}catch(err){console.error(err);if(!frameErrShown&&window.__bootBox){frameErrShown=true;window.__bootBox('Virhe piirrossa: '+(err&&err.message||err));}}}
}
updateLights();applyGfx();refreshKeyHints();
perfApply();if(window.__ldDone)window.__ldDone();   // v1.60: testi tehty jo ennen latausta (boot.js)
requestAnimationFrame(frame);
window.__game={renderer,keys,G,WH,get ghost(){return{sel:buildSel,ok:ghostOk,pos:ghostPos,why:lastInvalid}},placeBuild,openChest,scene,camera,P,get mobs(){return mobs},inv:()=>inv,pieces:()=>pieces,invAdd,addPiece,spawnMob,newGame,startPlay,flags:()=>flags,saveGame,serialize,loadData,setState:s=>state=s,get state(){return state},update,interact,togglePanel,useSlot,craft,RECIPE_BY,setBuildSel,enterDungeon,exitDungeon,camYaw:v=>camYaw=v,doMeleeHit,startAttack,nodes,setDay:v=>dayT=v};
