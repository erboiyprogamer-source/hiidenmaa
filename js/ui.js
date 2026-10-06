/* Hiidenmaa – ui.js
   HUD, viestit, paneelit (reppu, valmistus, rakennus, arkku), kartta, tavoitteet */
'use strict';
if(DEV){const p=document.createElement('div');p.id='devP';p.className='panel';p.hidden=true;p.innerHTML='<button class="close" data-close="1" aria-label="Sulje">✕</button><h2>DEV-valikko</h2><div id="devBody"></div>';document.body.appendChild(p);p.querySelector('.close').addEventListener('click',()=>closePanels());}
if(DEV){const d=document.createElement('div');d.textContent='DEV-tila · V = 10× nopeus · Ä = DEV-valikko';d.style.cssText='position:fixed;left:50%;top:4px;transform:translateX(-50%);z-index:50;font:700 12px sans-serif;color:#ffd36a;background:rgba(0,0,0,.55);padding:2px 7px;border-radius:3px;pointer-events:none';document.body.appendChild(d);}

/* ---------------- UI ---------------- */
// Viestin näkyvyysaika riippuu pituudesta: 3 s + 70 ms / merkki, rajattuna 4–13 s.
const msgEls=[],msgLog=[];
function msg(t,cls=''){msgLog.push({t,cls,at:playTime});if(msgLog.length>10)msgLog.shift();const el=$('#msgs');const d=document.createElement('div');d.textContent=t;if(cls)d.className=cls;el.appendChild(d);d._life=clamp(3+t.length*.07,4,13);msgEls.push(d);while(msgEls.length>7){const o=msgEls.shift();o.remove();}}
function updateMsgs(dt){for(let i=msgEls.length-1;i>=0;i--){const d=msgEls[i];d._life-=dt;if(d._life<1)d.style.opacity=Math.max(0,d._life);if(d._life<=0){d.remove();msgEls.splice(i,1);}}}
const floaters=[];
function floatText(t,x,y,z,color){const el=document.createElement('div');el.className='floater';el.textContent=t;el.style.color=color||'#eee';$('#floaters').appendChild(el);floaters.push({el,p:new V3(x,y,z),t:0});if(floaters.length>24){const o=floaters.shift();o.el.remove();}}
function updateFloaters(dt){for(let i=floaters.length-1;i>=0;i--){const f=floaters[i];f.t+=dt;f.p.y+=dt*1.2;_tmpV.copy(f.p).project(camera);if(_tmpV.z>1||f.t>1){f.el.remove();floaters.splice(i,1);continue;}f.el.style.left=((_tmpV.x+1)/2*innerWidth)+'px';f.el.style.top=((1-_tmpV.y)/2*innerHeight)+'px';f.el.style.opacity=1-f.t;}}
// v1.21 (lista 2, kohta 13): palkki = 100 hp, rivit päällekkäin (enint. 5), ylin tyhjenee ensin; yli 500 hp:n mobeilla toinen
// värikerros (oranssi) rivien päällä. Nimi ja kallot nousevat rivien mukana (pino kasvaa ylöspäin, ei peitä mobia).
// Pomot, joilla on ruudun yläreunan palkki (Kalmanvartija, ulottuvuuspomot), eivät saa palkkia pään päälle.
const mobBars=[];for(let i=0;i<8;i++){const d=document.createElement('div');d.className='mobbar';d.innerHTML='<div class="rows">'+'<div class="r"><i class="a"></i><i class="b"></i></div>'.repeat(5)+'</div><span class="nm"></span><span class="sk"></span>';d.hidden=true;$('#floaters').appendChild(d);mobBars.push(d);}
// Terveyspalkit: näkyvät 10 s iskusta tai kun pelaaja katsoo mobia läheltä (< 12 m); vaikeat (≥3 pääkalloa) jo kaukaa (< 70 m).
// Yksi kerros = pelaajan perusterveys (60); useampikerroksinen palkki on pidempi ja kerrokset eri värisiä. Alla pääkallot vaikeustasosta.
const HP_ROW=100,HP_ROWS=5,_cd=new V3();
const _mbB=new THREE.Box3();
function updateMobBars(){let k=0;camera.getWorldDirection(_cd);
  for(const m of mobs){if(k>=mobBars.length)break;if(m.dead||m===boss||m.def.ai==='rboss'||m.dun!==P.inDun)continue;
    const sk=MOB_SKULL[m.type]||0,d=Math.hypot(m.pos.x-P.pos.x,m.pos.z-P.pos.z),recent=playTime-m.hurtT<10;
    // Mallin todellinen korkeus (kerran mobia kohden): palkki 0,45 m pään/sarvien yläpuolelle (v0.73, ennen r × 2,8 + 0,8 → osui päähän).
    if(m.barH===undefined){m.f.g.updateMatrixWorld(true);_mbB.setFromObject(m.f.g);m.barH=Math.max(.6,_mbB.max.y-m.f.g.position.y);}
    // Näkyy vain, kun katse osuu mobiin selvästi (kulma ~11°, vahvoilla ~9°) – ennen 22°/18°; lyöty mobi näkyy 10 s aina.
    const ex=m.pos.x-camera.position.x,ey=m.pos.y+m.barH*.55-camera.position.y,ez=m.pos.z-camera.position.z,el=Math.hypot(ex,ey,ez)||1,look=(ex*_cd.x+ey*_cd.y+ez*_cd.z)/el>(sk>=3?.988:.982);
    if(!(recent||(look&&(d<12||(sk>=3&&d<70)))))continue;
    _tmpV.set(m.pos.x,m.pos.y+m.barH+.45,m.pos.z).project(camera);if(_tmpV.z>1||Math.abs(_tmpV.x)>1.1||Math.abs(_tmpV.y)>1.1)continue;
    const b=mobBars[k++],cap=HP_ROW*HP_ROWS,n=Math.min(HP_ROWS,Math.ceil(Math.min(m.maxHp,cap)/HP_ROW)),hp=Math.max(0,m.hp),rows=b.firstChild.children;
    b.hidden=false;b.style.left=((_tmpV.x+1)/2*innerWidth)+'px';b.style.top=((1-_tmpV.y)/2*innerHeight)+'px';
    for(let j=0;j<HP_ROWS;j++){const r=rows[HP_ROWS-1-j];if(j>=n){r.style.display='none';continue;}r.style.display='';   // j = rivi alhaalta
      const c=Math.min(HP_ROW,Math.min(m.maxHp,cap)-j*HP_ROW),c2=Math.min(HP_ROW,Math.max(0,m.maxHp-cap-j*HP_ROW));
      r.children[0].style.width=clamp((hp-j*HP_ROW)/c*100,0,100)+'%';r.children[1].style.width=c2>0?clamp((hp-cap-j*HP_ROW)/HP_ROW*100,0,100)+'%':'0%';}
    b.children[1].textContent=`${m.def.n} ${Math.ceil(m.hp)}/${m.maxHp}`;b.children[2].textContent='☠'.repeat(sk);}
  for(;k<mobBars.length;k++)mobBars[k].hidden=true;}
function slotHTML(s,key){if(!s)return `<div class="slot">${key?`<span class="k">${key}</span>`:''}</div>`;const d=ITEMS[s.id];return `<div class="slot${s.eq?' eq':''}" style="background-image:url(${icon(s.id)})" title="${d.n}" data-it="${s.id}" data-q="${s.q||1}" data-n="${s.n}">${key?`<span class="k">${key}</span>`:''}${(s.q||1)>1?`<span class="q">★${s.q}</span>`:''}${s.id==='soihtu'?`<span class="fu${s.lit===false?' off':''}"><i style="width:${Math.max(0,(s.fuel??torchMax(s))/torchMax(s)*100)}%"></i></span>`:''}${s.n>1?`<span class="n">${s.n}</span>`:''}</div>`;}
let hudT=0,msgHidden=false;
function updateHUD(dt){
  hudT-=dt;updateMsgs(dt);updateFloaters(dt);updateMobBars();
  $('#hurt').style.opacity=Math.min(1,P.hurtFlash*1.5+(P.hp<maxHp()*.25&&!P.dead?.35:0));
  // prompt
  // v1.23 (kohta 17): tähtäysympyrä = nuolen hajonta: iso alussa, pienenee vedettäessä, keltainen → punainen, täysi veto = pieni + piste
  {const c=$('#cross');if(P.drawing){const sp=bowSpread(),k=Math.min(1,P.bowDraw||0),R=Math.max(4,Math.tan(sp*Math.PI/180)/Math.tan(camera.fov*Math.PI/360)*innerHeight/2);
      c.className='aim'+(sp<.35?' full':'');c.style.width=c.style.height=(R*2)+'px';c.style.margin=`${-R-2}px 0 0 ${-R-2}px`;
      c.style.borderColor=`rgb(${Math.round(lerp(232,224,k))},${Math.round(lerp(196,72,k))},${Math.round(lerp(90,60,k))})`;}
    else if(c.className){c.className='';c.style.width=c.style.height=c.style.margin=c.style.borderColor='';}}
  // Ruudun ilmoitukset piilotetaan kun jokin valikko/paneeli on auki (tai peli tauolla); ne säilyvät T-lokissa ja palaavat valikon sulkeuduttua.
  {const hide=!!openPanel||state!=='play';if(hide!==msgHidden){msgHidden=hide;$('#msgs').style.visibility=hide?'hidden':'';}}
  if(hudT>0)return;hudT=.1;
  const w=curWeapon();
  if(w.cat==='hammer'){const bh=$('#buildhint');bh.hidden=false;const h=buildSel?`<b>${PIECES[buildSel].n}</b> · ${reqText(PIECES[buildSel].req)} · <span class="kb">Hiiri V</span>rakenna <span class="kb">R</span>käännä 45° <span class="kb">Shift+R</span>asento <span class="kb">G</span>kohdistus: ${SNAP_NAMES[snapMode]} <span class="kb">X</span>pura <span class="kb">F</span>korjaa <span class="kb">B</span>valikko`+(ghost&&ghost.visible&&!ghostOk&&lastInvalid?` · <span style="color:var(--bad)">${lastInvalid}</span>`:''):`<span class="kb">B</span> tai hiiren oikea: valitse rakennus`;if(bh._h!==h){bh._h=h;bh.innerHTML=h;}}else $('#buildhint').hidden=true;
  $('#lockhint').hidden=!(state==='play'&&!locked&&!lockFailed&&!P.dead);
  const hp=$('.bar.hp'),st=$('.bar.st'),hu=$('.bar.hu');
  hp.firstChild.style.width=(P.hp/maxHp()*100)+'%';hp.lastChild.textContent=`TERVEYS ${Math.ceil(P.hp)}/${maxHp()}`;hp.classList.toggle('low',P.hp<maxHp()*.25);
  st.firstChild.style.width=(P.stam/maxStam()*100)+'%';st.lastChild.textContent=`KESTÄVYYS ${Math.floor(P.stam)}`;
  hu.firstChild.style.width=P.hunger+'%';hu.lastChild.textContent=`KYLLÄISYYS ${Math.floor(P.hunger)}`;hu.classList.toggle('low',P.hunger<15);
  {const li=lvlInfo();$('#lvlbox').innerHTML=`Taso ${li.L}<span class="track"><i style="width:${li.need?li.xp/li.need*100:100}%"></i></span>`;}
  const wt=invWeight();const we=$('#weight');we.textContent=`Paino ${wt.toFixed(0)}/${MAXW}`;we.classList.toggle('over',wt>MAXW);
  const t=lookTarget,pr=$('#prompt');
  if(t&&!P.dead){const l=t.kind==='it'?t.it.label():t.label;pr.innerHTML=`<kbd>E</kbd>${l}`;}else pr.innerHTML='';
  // status chips
  const fxs=effects();$('#status').innerHTML=fxs.map(e=>`<div class="chip ${e.kind}" title="${e.desc}"><b></b>${e.name}${e.t?' '+fmtT(e.t):''}</div>`).join('');
  if(openPanel==='inv'&&performance.now()-fxAt>400){fxAt=performance.now();renderEffects(fxs);}
  // clock
  const hh=Math.floor(dayT*24),mm=Math.floor((dayT*24-hh)*60/10)*10;$('#clock').innerHTML=`Päivä ${dayN} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} <span>· ${P.inDun?(P.realm?REALMS[P.realm].n:'Hautakumpu'):WEATHERS[weather.cur].n}${!P.inDun&&P.zone&&BIOMES[P.zone]?' · '+BIOMES[P.zone].n:''}</span>`;
  if(invDirty){invDirty=false;updateBack();$('#hotbar').innerHTML=inv.slice(0,8).map((s,i)=>slotHTML(s,i+1).replace('class="slot','class="slot'+(i===hotSel?' hsel':''))).join('');if(openPanel==='inv')renderInv();if(openPanel==='chest')renderChest();if(openPanel==='build')renderBuild();}
  if(boss&&!boss.dead){$('#bossbar i').style.width=(boss.hp/boss.maxHp*100)+'%';}
  drawMinimap();
}
let openPanel=null,selSlot=-1,curChest=null;
let panelOpenedAt=0;
// Viimeiset 10 ilmoitusta (L, v1.18; ennen T): uusin ylimpänä, kellonaika pelin ajassa.
// DEV-valikko (Ä): sää, kellonaika, terveys ja kylläisyys – muutokset heti. Sää pysyy valittuna 10 min.
function renderDev(){const B=$('#devBody');if(!B)return;const clk=()=>{const h=dayT*24;return `${Math.floor(h)}:${String(Math.floor(h%1*60)).padStart(2,'0')}`;};
  B.innerHTML=`<div class="devRow"><b>Sää</b><div class="devBtns">${Object.entries(WEATHERS).map(([k,w])=>`<button class="btn${weather.cur===k?' on':''}" data-w="${k}">${w.n}</button>`).join('')}</div></div>
  <div class="devRow"><b>Aika <span id="devClk">${clk()}</span></b><input id="devT" type="range" min="0" max="1" step="0.005" value="${dayT}"><div class="devBtns">${[['Aamu',.28],['Päivä',.5],['Ilta',.74],['Yö',.95]].map(([n,v])=>`<button class="btn" data-t="${v}">${n}</button>`).join('')}</div></div>
  <div class="devRow"><b>Terveys <span id="devHpV">${Math.round(P.hp)} / ${maxHp()}</span></b><input id="devHp" type="range" min="1" max="${maxHp()}" step="1" value="${P.hp}"></div>
  <div class="devRow"><b>Kylläisyys <span id="devHuV">${Math.round(P.hunger)}</span></b><input id="devHu" type="range" min="0" max="100" step="1" value="${P.hunger}"></div>
  <div class="devRow"><b>Jumalvoimat</b><div class="devChk">${[['god','Ei voi kuolla'],['food','Ei nälkää'],['stam','Rajaton kestävyys'],['lvl','Korkein taso'],['weight','Ei painorajaa']].map(([k,n])=>`<label><input type="checkbox" data-dv="${k}"${DEVF[k]?' checked':''}> ${n}</label>`).join('')}</div>
    <div class="devBtns"><button class="btn" data-dvall="1">Kaikki päälle</button><button class="btn" data-dvall="0">Kaikki pois</button></div></div>
  <div class="devRow"><b>Hae esine (DEV)</b><div class="devGive"><input id="devQ" class="search" type="search" placeholder="Hae esinettä nimellä…" autocomplete="off" spellcheck="false" value="${esc(devQ)}">
    <input id="devN" type="number" min="1" max="999" value="${devN}" title="Määrä"><button class="btn" id="devGo">Hae</button></div><div id="devList" class="devList"></div></div>
  <div class="devRow"><b>Kartta</b><div class="devBtns"><button class="btn" id="devMap">Paljasta kartta ja kohteet</button></div></div>`;
  B.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{weather.cur=b.dataset.w;weather.until=playTime+600;renderDev();});
  B.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{dayT=+b.dataset.t;renderDev();});
  $('#devT').oninput=e=>{dayT=+e.target.value;$('#devClk').textContent=clk();};
  $('#devHp').oninput=e=>{P.hp=+e.target.value;$('#devHpV').textContent=`${P.hp} / ${maxHp()}`;};
  $('#devHu').oninput=e=>{P.hunger=+e.target.value;$('#devHuV').textContent=P.hunger;};
  B.querySelectorAll('[data-dv]').forEach(c=>c.onchange=()=>{DEVF[c.dataset.dv]=c.checked?1:0;saveDevF();invDirty=true;});
  B.querySelectorAll('[data-dvall]').forEach(b=>b.onclick=()=>{for(const k in DEVF)DEVF[k]=+b.dataset.dvall;saveDevF();invDirty=true;renderDev();});
  // v1.05 DEV-esinehaku: hakusana + määrä hakunapin vieressä, osumalista "Anna"-napeilla (lähtee pois DEV-tilan mukana)
  const listGive=()=>{const q=fold($('#devQ').value.trim()),L=$('#devList');devQ=$('#devQ').value;devN=Math.max(1,Math.min(999,Math.round(+$('#devN').value||1)));
    const rank=id=>{const n=fold(ITEMS[id].n);return n===q||id===q?0:n.startsWith(q)||id.startsWith(q)?1:2;};
  const ids=Object.keys(ITEMS).filter(id=>!q||searchHit(ITEMS[id].n,q)||id.includes(q)).sort((a,b)=>(q?rank(a)-rank(b):0)||ITEMS[a].n.localeCompare(ITEMS[b].n,'fi')).slice(0,q?40:200);
    L.innerHTML=ids.map(id=>`<div class="devIt"><span class="ic" style="background-image:url(${icon(id)})"></span><span class="nm">${esc(ITEMS[id].n)}</span><button class="btn" data-give="${id}">Anna ${devN}</button></div>`).join('')||'<div class="note">Ei osumia.</div>';
    L.querySelectorAll('[data-give]').forEach(b=>b.onclick=()=>devGive(b.dataset.give));};
  $('#devGo').onclick=listGive;$('#devQ').oninput=listGive;$('#devN').oninput=listGive;$('#devQ').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const f=$('#devList [data-give]');if(f)devGive(f.dataset.give);}};listGive();
  $('#devMap').onclick=()=>{devRevealMap();msg('Kartta ja kaikki kohteet paljastettu.','loot');};}
let devQ='',devN=1;
// DEV: antaa esinettä määrän verran (ei mahtuvat putoavat maahan); ilmoitus kertoo paljonko saatiin
function devGive(id){const n=devN||1,left=invAdd(id,n);if(left>0)spawnDrop(id,left,P.pos.x,P.pos.y+1,P.pos.z);invDirty=true;updateGear();sfx('pickup');msg(`DEV: +${n} ${ITEMS[id].n}${left>0?` (${left} maahan, reppu täynnä)`:''}`,'loot');}
// DEV: poistaa karttapilvet kokonaan ja merkitsee kaikki nimetyt paikat (rauniot, portaalit, riimukivet…) löydetyiksi.
function devRevealMap(){explored.fill(1);resetFog();for(const k in LOC){const L=LOC[k];if(k!=='spawn'&&L&&L.name)flags.disc[k]=1;}}
// v0.82: alueet (biomit). Nykyinen alue P.zone tarkistetaan 0,4 s välein; ensimmäisellä kerralla "Uusi alue löydetty" (flags.bio).
let zoneT=0,zoneBanT=0;
function updateZone(dt){zoneT-=dt;if(zoneT>0)return;zoneT=.4;if(P.inDun||P.dead)return;
  const z=zoneAt(P.pos.x,P.pos.z);if(z===P.zone&&!zoneQuiet)return;const ch=z!==P.zone;P.zone=z;if(!flags.bio)flags.bio={meadow:1};
  if(!flags.bio[z]){flags.bio[z]=1;if(!zoneQuiet)showZoneBanner(BIOMES[z].n);}
  if(ch&&z==='aarni'&&!zoneQuiet&&playTime-(flags.aarniMsg||-99)>60){flags.aarniMsg=playTime;setTimeout(()=>msg('Hirviöt ovat vihaisia Aarnimetsässä – ne liikkuvat täällä nopeammin.','warn'),flags.bio.aarni===1&&$('#zoneBan').classList.contains('on')?1500:0);}
  zoneQuiet=false;if(ch&&openPanel==='inv')renderBiome();}
function showZoneBanner(name){const el=$('#zoneBan');$('#zoneBanN').textContent=name;el.classList.add('on');sfx('discover');msg(`Uusi alue löydetty: ${name}`,'loot');
  clearTimeout(zoneBanT);zoneBanT=setTimeout(()=>el.classList.remove('on'),4000);}
function renderBiome(){const B=$('#biomeBox');if(!B)return;if(P.inDun||!P.zone||!BIOMES[P.zone]){B.innerHTML='';return;}const b=BIOMES[P.zone],dg=['','Rauhallinen','Kohtalainen','Vaarallinen'][b.danger]||'';
  B.innerHTML=`<h3>Alue: ${b.n}</h3><div class="bRow"><span>Sää ja lämpö</span><span>${b.temp}</span></div><div class="bRow"><span>Vaarallisuus</span><span>${dg}</span></div>
  <div class="bRow"><span>Eläimet</span><span>${b.life}</span></div><div class="bRow"><span>Viholliset</span><span>${b.foe}</span></div><div class="bRow"><span>Resurssit</span><span>${b.res}</span></div>${b.note?`<div class="bNote">${b.note}</div>`:''}
  <div class="bRow" style="margin-top:4px"><span>Löydetyt alueet</span><span>${Object.keys(flags.bio||{}).filter(k=>BIOMES[k]).length} / ${Object.keys(BIOMES).length}</span></div>`;}
// v0.93 Shift-tietoikkuna: kun Shift on pohjassa, hiiren alla olevan esineen (reppu, pikapalkki, arkku, valmistuslista) tiedot näkyvät
// kursorin vieressä – Shift pohjassa voi selata tietoja pelkästään hiirellä esineiden yli liikkumalla.
let tipEv=null;
function updateItemTip(){const tip=$('#itemTip');if(!tip)return;const e=tipEv,el=e&&e.shiftKey&&document.elementFromPoint(e.clientX,e.clientY);const t=el&&el.closest&&el.closest('[data-it]');
  if(!t||!ITEMS[t.dataset.it]){tip.hidden=true;return;}const id=t.dataset.it,d=ITEMS[id],q=+t.dataset.q||1,s={id,n:+t.dataset.n||1,q};
  tip.innerHTML=`<div class="t">${d.n}${q>1?` <span class="qs">★${q}</span>`:''}</div><div class="s">${d.d||''}</div><table class="props">${itemProps(s,q).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;
  tip.hidden=false;const W=tip.offsetWidth,H=tip.offsetHeight;tip.style.left=Math.min(innerWidth-W-8,e.clientX+18)+'px';tip.style.top=Math.max(8,Math.min(innerHeight-H-8,e.clientY+14))+'px';}
addEventListener('mousemove',e=>{tipEv=e;updateItemTip();});
addEventListener('keydown',e=>{if(e.key==='Shift'&&tipEv){tipEv=Object.assign({},{clientX:tipEv.clientX,clientY:tipEv.clientY,shiftKey:true});updateItemTip();}});
addEventListener('keyup',e=>{if(e.key==='Shift'){const t=$('#itemTip');if(t)t.hidden=true;if(tipEv)tipEv={clientX:tipEv.clientX,clientY:tipEv.clientY,shiftKey:false};}});
function renderLog(){const fm=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  $('#logBody').innerHTML=msgLog.length?[...msgLog].reverse().map(m=>`<div class="lg ${m.cls}"><span class="num">${fm(m.at)}</span>${m.t.replace(/</g,'&lt;')}</div>`).join(''):'<div class="note">Ei ilmoituksia vielä.</div>';}
function togglePanel(name){if(openPanel===name){closePanels();return;}if(P.dead)return;panelOpenedAt=performance.now();closePanels(true);openPanel=name;state='ui';releaseLock();mouseL=false;mouseR=false;P.drawing=false;
  if(name==='inv'){$('#inv').hidden=false;renderInv();renderBiome();}if(name==='build'){$('#build').hidden=false;renderBuild();}if(name==='map'){$('#mapP').hidden=false;mapZ=1;mapCX=P.pos.x;mapCZ=P.pos.z;if(!mapRAF)mapRAF=requestAnimationFrame(mapLoop);}if(name==='chest')$('#chest').hidden=false;if(name==='prog'){$('#progP').hidden=false;renderProg();}if(name==='log'){$('#logP').hidden=false;renderLog();}if(name==='dev'&&$('#devP')){$('#devP').hidden=false;renderDev();}}
function closePanels(keep,skipLock){upPrev=null;chestSel=null;if(openPanel)panelClosedAt=performance.now();for(const id of ['#inv','#build','#mapP','#chest','#progP','#logP','#devP'])if($(id))$(id).hidden=true;openPanel=null;curChest=null;selSlot=-1;selHalf=false;slotDrag=null;if(typeof updGhost==='function')updGhost();if(!keep){state='play';if(!skipLock)requestLock();}}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closePanels()));
function nearStations(){const s={};for(const p of pieces){const k=isFirePiece(p.t)?'nuotio':p.t;if(['tyopenkki','nuotio','ahjo'].includes(k)&&dist2(p.x,p.z,P.pos.x,P.pos.z)<(k==='nuotio'?4:8)**2&&!P.inDun){if(k==='nuotio'&&p.data.fuel<=0)continue;s[k]=1;}}return s;}
let fxAt=0;
// Tilat repun vieressä: nimi, jäljellä oleva aika ja vaikutus (osoita hiirellä tai lue suoraan).
function renderEffects(fxs){fxs=fxs||effects();$('#effects').innerHTML=`<h3>Tilat</h3>`+(fxs.length?fxs.map(e=>`<div class="fx ${e.kind}" title="${e.desc}"><b>${e.name}${e.t?' · '+fmtT(e.t):''}</b><span>${e.desc}</span></div>`).join(''):'<div class="s">Ei erityisiä tiloja.</div>');}
let craftTab='suos';
function renderInv(){initSearch();renderEffects();
  const g=$('#invGrid');g.innerHTML=inv.map((s,i)=>slotHTML(s,i<8?i+1:'')).join('');
  // v0.75: napsautus valitsee; toinen napsautus toiseen paikkaan siirtää/vaihtaa paikat (sama esine pinotaan); sama paikka poistaa valinnan.
  // Hiiren oikea puolittaa pinon tyhjään paikkaan. Kaksoisnapsautus käyttää.
  [...g.children].forEach((el,i)=>{el.classList.toggle('sel',i===selSlot);el.onclick=()=>{
      if(selSlot>=0&&selSlot!==i&&inv[selSlot]){(selHalf?moveHalf:moveSlot)(inv,selSlot,inv,i);selSlot=-1;selHalf=false;upPrev=null;invDirty=true;updateGear();renderInv();return;}
      upPrev=null;selHalf=false;selSlot=selSlot===i?-1:(inv[i]?i:-1);renderInv();};
    // v1.08 (lista 2, kohta 1): valittuna oikea klikkaus toiseen ruutuun siirtää puolet; ilman valintaa puolittaa pinon kuten ennen
    el.ondblclick=()=>{useSlot(i);selSlot=-1;renderInv();};el.oncontextmenu=e=>{e.preventDefault();if(dragEat)return;if(selSlot>=0&&selSlot!==i&&inv[selSlot]){moveHalf(inv,selSlot,inv,i);invDirty=true;updateGear();renderInv();}
      else{const h=pickHalf(inv[i]);upPrev=null;if(selSlot===i&&selHalf===h){selSlot=-1;selHalf=false;}else{selSlot=inv[i]?i:-1;selHalf=h;}renderInv();}};   // v1.30: oikea = ota puolet valituksi
    slotUX(el,'i',i);});
  $('#invW').textContent=`Paino ${invWeight().toFixed(0)} / ${MAXW}`;updGhost();
  upBtn($('#invUp'),PACK_UP[P.packLv+1],`Isompi reppu (taso ${P.packLv+2})`,()=>{setPack(P.packLv+1);msg('Reppu kasvoi!','loot');},'pack',
    [['Paikkoja',invN(),invN()+8],['Kantokyky',MAXW,MAXW+40]],renderInv,'Reppu');
  if(selSlot<0)selHalf=false;const det=$('#detail'),s=inv[selSlot];
  if(!s){det.innerHTML='<div class="s">Valitse esine napsauttamalla tai raahaa se hiirellä toiseen ruutuun. Kaksoisnapsautus käyttää, hiiren oikea puolittaa pinon.</div>';}
  else{const d=ITEMS[s.id];const q=s.q||1;
    const up=upgradeInfo(s),props=itemProps(s,q),open=up&&upPrev==='item'+selSlot;
    det.innerHTML=`<div class="selHint">${selHalf?`Puolet valittu (${Math.floor(s.n/2)} kpl) – napsauta ruutua siirtääksesi ne.`:'Valittu – napsauta toista ruutua siirtääksesi, oikea napsautus siirtää puolet. Voit myös raahata.'}</div><div class="t">${d.n}${q>1?` <span class="qs">★${q}</span>`:''}</div><div class="s">${d.d||''}</div>`+
      `<table class="props">${props.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`+
      (open?upPreviewHTML(props,itemProps(s,q+1),up.req,`★${q} → ★${q+1}`):'')+`<div class="btns"></div>`;
    const b=det.querySelector('.btns');
    if(d.food){const x=document.createElement('button');x.className='btn pri';x.textContent='Syö';x.onclick=()=>{eat(s);renderInv();};b.appendChild(x);}
    if(d.cat){const x=document.createElement('button');x.className='btn pri';x.textContent=s.eq?'Riisu':'Varusta';x.onclick=()=>{toggleEquip(s);renderInv();};b.appendChild(x);}
    // Paranna: ensimmäinen painallus näyttää mitä muuttuu, vasta "Päivitä nyt" tekee päivityksen.
    if(up){const x=document.createElement('button');x.className='btn'+(open?' on':'');x.textContent=open?`Piilota ★${q+1}`:`Paranna ★${q+1} …`;x.onclick=()=>{upPrev=open?null:'item'+selSlot;renderInv();};b.appendChild(x);
      if(open){const y=document.createElement('button');y.className='btn pri';y.textContent='Päivitä nyt';y.disabled=!up.ok;y.title=up.why||'';
        y.onclick=()=>{if(!upgradeInfo(s)||!upgradeInfo(s).ok)return;const m0=s.id==='soihtu'?torchMax(s):0;for(const [id,n] of Object.entries(up.req))invRemove(id,n);s.q=q+1;
          if(s.id==='soihtu')s.fuel=(s.fuel??m0)+torchMax(s)-m0;upPrev=null;sfx('craft');msg(`${d.n} paranneltu tasolle ${q+1}.`,'loot');invDirty=true;renderInv();};
        det.querySelector('.upPrev').appendChild(y);if(up.why){const w=document.createElement('span');w.className='rq';w.innerHTML=` <span class="mat bad">${up.why}</span>`;det.querySelector('.upPrev').appendChild(w);}}}
    if(s.id==='soihtu'&&(s.fuel??torchMax(s))<torchMax(s)){const x=document.createElement('button');x.className='btn';x.textContent='Lisää pihkaa (+60 s)';x.disabled=invCount('pihka')<1;x.onclick=()=>{if(invCount('pihka')<1)return;invRemove('pihka',1);s.fuel=Math.min(torchMax(s),(s.fuel??0)+60);sfx('build');renderInv();};b.appendChild(x);}
    // Ammus: valinta tai automaattinen (heikoimmasta parhaaseen); valitun napin uusi painallus palauttaa automaattiseen
    if(AMMO.includes(s.id)){const sel=flags.ammo===s.id,x=document.createElement('button');x.className='btn'+(sel?' on':'');x.textContent=sel?'Valittu ammus (paina: automaattinen)':'Käytä ammuksena';x.title='Automaattinen: heikoimmasta parhaaseen';x.onclick=()=>{flags.ammo=sel?null:s.id;renderInv();};b.appendChild(x);}
    const dr=document.createElement('button');dr.className='btn';dr.textContent='Pudota (Q / Shift+Q)';dr.onclick=()=>{inv[selSlot]=null;if(s.eq){s.eq=false;}spawnDrop(s.id,s.n,P.pos.x+Math.sin(P.yaw),P.pos.y+1,P.pos.z+Math.cos(P.yaw),s.q);invDirty=true;updateGear();selSlot=-1;renderInv();};b.appendChild(dr);}
  // crafting
  const st=nearStations();
  $('#stationLine').textContent='Lähellä: '+(Object.keys(st).map(k=>STATION_NAME[k]).join(', ')||'ei työpisteitä')+'. Uusia ohjeita aukeaa, kun löydät uusia aineita.';
  const cl=$('#craftList');cl.innerHTML='';
  const tabs=$('#craftTabs');tabs.innerHTML='';
  // Haku ohittaa välilehdet ja hakee kaikista tunnetuista ohjeista; Ehdotukset = suggestCrafts().
  const qs=searchQ('#craftSearch'),sug=!qs&&craftTab==='suos'?suggestCrafts(st):null;
  for(const [id,nm] of [['suos','Ehdotukset'],...CRAFT_CATS]){const b=document.createElement('button');b.className='tab'+(id===craftTab&&!qs?' on':'')+(id==='suos'?' sug':'');b.textContent=nm;b.onclick=()=>{craftTab=id;$('#craftSearch').value='';renderInv();};tabs.appendChild(b);}
  const sugL=sug?[...(sug.now.length?[{h:'Voit valmistaa nyt'}]:[]),...sug.now,...(sug.next.length?[{h:'Hyödyllistä seuraavaksi'}]:[]),...sug.next]:null;
  const list=qs?RECIPES.filter(r=>recipeKnown(r)&&searchHit(ITEMS[r.id].n,qs)):sugL?sugL.map(x=>x.h?x:x.r):RECIPES.filter(r=>recipeKnown(r)&&(craftTab==='alku'?r.alku:recipeCat(r)===craftTab));
  if(!list.length)cl.innerHTML=`<div class="note">${qs?'Ei osumia haulle “'+esc(qs)+'”.':'Ei ehdotuksia juuri nyt.'}</div>`;
  for(let li=0;li<list.length;li++){const r=list[li];if(r.h){const h=document.createElement('div');h.className='sugH';h.textContent=r.h;cl.appendChild(h);continue;}
    const why=sugL?sugL[li].why:'';
    const open=recipeOpen(r);
    const okSt=!r.st||st[r.st];const okMat=Object.entries(r.req).every(([id,n])=>invCount(id)>=n);
    const el=document.createElement('div');el.className='rec'+(okSt&&okMat&&open?'':' na');
    el.dataset.it=r.id;el.dataset.n=r.n||1;
    el.innerHTML=`<div class="ic" style="background-image:url(${icon(r.id)})"></div><div><div class="nm">${ITEMS[r.id].n}${r.n?` ×${r.n}`:''}${why?` <span class="why">${why}</span>`:''}</div><div class="rq">${Object.entries(r.req).map(([id,n])=>`<span class="${invCount(id)>=n?'':'miss'}">${n} ${ITEMS[id].n.toLowerCase()}</span>`).join(', ')}${r.st?` · <span class="${okSt?'':'miss'}">${STATION_NAME[r.st]}</span>`:''}${open?'':` · <span class="miss">Taso ${r.lvl}</span>`}</div></div>`;
    const b=document.createElement('button');b.className='btn pri';b.textContent=open?'Valmista':'Lukittu';b.disabled=!(okSt&&okMat&&open);b.onclick=()=>craft(r);el.appendChild(b);cl.appendChild(el);}
}
function upgradeInfo(s){const d=ITEMS[s.id];if(!d.cat||d.cat==='hammer')return null;const q=s.q||1;if(q>=3)return null;const r=RECIPE_BY[s.id];if(!r)return null;
  const req={};for(const [id,n] of Object.entries(r.req))req[id]=Math.ceil(n/2)*q;const st=r.st||'tyopenkki';const near=nearStations()[st];
  const ok=near&&Object.entries(req).every(([id,n])=>invCount(id)>=n);return{req,ok,why:near?'':`Tarvitset: ${STATION_NAME[st]}`};}
function craft(r){if(!recipeOpen(r))return;for(const [id,n] of Object.entries(r.req))invRemove(id,n);bump('crafted');xpFirst('c_'+r.id,6,'uusi esine');const left=invAdd(r.id,r.n||1);if(left)spawnDrop(r.id,left,P.pos.x,P.pos.y+1,P.pos.z);sfx('craft');msg(`Valmistit: ${ITEMS[r.id].n}`,'loot');
  if(ITEMS[r.id].cat&&!equipped(ITEMS[r.id].cat==='bow'||ITEMS[r.id].cat==='hammer'?'weapon':ITEMS[r.id].cat)){const s=inv.find(s=>s&&s.id===r.id&&!s.eq);if(s)toggleEquip(s);}
  invDirty=true;renderInv();}
let buildTab='suos';
// ---- Haku ja ehdotukset (rakennusvalikko ja valmistus) ----
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fold=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function searchQ(sel){const el=$(sel);return el?fold(el.value.trim()):'';}
const searchHit=(name,q)=>fold(name).includes(q);
const recipeKnown=r=>Object.keys(r.req).some(id=>flags.seen[id])||!r.st;
// Varusteen vertailuryhmä ja teho: kirveet hakkuutehon, hakut louhinnan, aseet vahingon, haarniskat suojan, kilvet torjunnan mukaan.
function gearKey(d){return d.cat==='weapon'?(d.chop?'chop':d.pick?'pick':'weapon'):d.cat;}
function gearPow(d){return d.chop?d.chop*10+d.dmg*.01:d.pick?d.pick*10+d.dmg*.01:d.cat==='armor'?d.arm:d.cat==='shield'?d.block:d.dmg||1;}
function bestOwned(key){let b=-1;for(const s of inv)if(s&&ITEMS[s.id].cat&&gearKey(ITEMS[s.id])===key)b=Math.max(b,gearPow(ITEMS[s.id]));return b;}
// v1.16 (lista 2, kohta 7) Valmistusehdotukset kahdessa osiossa:
//  now  = "Voit valmistaa nyt": aineet repussa (enint. 6). Työpiste puuttuu läheltä → merkintä; jos työpistettä ei ole rakennettu
//         ollenkaan, esine näkyy myös next-osiossa.
//  next = "Hyödyllistä seuraavaksi": aineita puuttuu, mutta esine on hyödyllinen ja pelin vaiheeseen sopiva (enint. 4).
//  Järjestys kummassakin: 1) ei koskaan valmistettu, 2) usein tarvittavat (nuolet, soihdut, ruoka, hiili), 3) valmistettu ennen mutta ei
//  mukana, 4) välituotteet, joita tarvitaan sinulle uuden esineen valmistukseen. Tarpeettomia (huonompi/jo omistettu varuste) ei ehdoteta.
const SUG_REPEAT=['nuolet','sulkanuolet','tulinuolet','soihtu','hiili','varras'];
function suggestCrafts(st){const hasBow=inv.some(s=>s&&ITEMS[s.id].cat==='bow'),made=id=>!!(flags.first&&flags.first['c_'+id]),own=id=>invCount(id)>0;
  const stBuilt=k=>pieces.some(p=>k==='nuotio'?isFirePiece(p.t):p.t===k||PIECES[p.t].base===k);
  // pelin vaihe: korkein omistetun varusteen ohjetaso (keskeneräiset myöhemmät tasot eivät hyppää kärkeen)
  let stage=1;for(const x of inv)if(x&&RECIPE_BY[x.id]&&ITEMS[x.id].cat)stage=Math.max(stage,RECIPE_BY[x.id].lvl||1);
  const newUse=id=>RECIPES.some(r=>r.id!==id&&r.req[id]&&recipeKnown(r)&&recipeOpen(r)&&!made(r.id)&&invCount(id)<r.req[id]);
  const useful=r=>{const d=ITEMS[r.id];
    if(d.cat==='shovel'||d.cat==='hammer')return own(r.id)?null:'Sinulla ei ole vielä';
    if(d.cat==='offhand'||r.id==='soihtu')return own(r.id)?null:'Valoa öihin';
    if(d.cat){const k=gearKey(d),b=bestOwned(k);if(b<0)return 'Sinulla ei ole vielä';if(gearPow(d)>b)return 'Parempi kuin nykyinen';return null;}
    if(/nuolet$/.test(r.id))return hasBow&&invCount(r.id)<40?(invCount('nuolet')+invCount('sulkanuolet')+invCount('tulinuolet')<20?'Nuolet vähissä':'Lisää nuolia'):null;
    if(d.food)return P.hunger<70||!inv.some(x=>x&&ITEMS[x.id].food&&!ITEMS[x.id].food.raw)?'Ruokaa':null;
    if(newUse(r.id))return 'Tarvitaan uuteen esineeseen';return null;};
  const bucket=r=>{const d=ITEMS[r.id];if(!made(r.id)&&!own(r.id))return SUG_REPEAT.includes(r.id)?1:0;if(SUG_REPEAT.includes(r.id)||d.food)return 1;if(!own(r.id))return 2;return 3;};
  const now=[],next=[];
  for(const r of RECIPES){if(!recipeKnown(r)||!recipeOpen(r))continue;const u=useful(r);if(!u)continue;
    const okMat=Object.entries(r.req).every(([id,n])=>invCount(id)>=n),okSt=!r.st||st[r.st],built=!r.st||stBuilt(r.st);
    const have=Object.entries(r.req).reduce((a,[id,n])=>a+Math.min(1,invCount(id)/n),0)/Object.keys(r.req).length,b=newUse(r.id)&&!ITEMS[r.id].cat&&!ITEMS[r.id].food&&!SUG_REPEAT.includes(r.id)?3:bucket(r);
    const d0=ITEMS[r.id],pri=(d0.chop||d0.pick||d0.cat==='hammer'?0:d0.cat==='bow'||d0.cat==='weapon'?1:d0.cat==='armor'||d0.cat==='shield'?2:d0.cat==='shovel'?3:1.5)*.8;   // tasapelissä: keräystyökalut → aseet/jousi → suojat → lapio/kuokka
    const why=[u];if(!okSt)why.push('Tarvitset: '+STATION_NAME[r.st]+(built?'':' (rakenna ensin)'));
    if(okMat){now.push({r,b,sc:b*10+(okSt?0:5)+pri-have,why:why.join(' · ')});if(!built)next.push({r,b,sc:b*10+pri-have,why:why.join(' · ')});}
    else if((r.lvl||1)<=stage+2)next.push({r,b,sc:b*10+(1-have)*4+((r.lvl||1)-stage)*.6+pri,why:why.join(' · ')});}
  return{now:now.sort((a,b)=>a.sc-b.sc).slice(0,6),next:next.sort((a,b)=>a.sc-b.sc).slice(0,4)};}
// Rakennusehdotukset: puuttuvat perusasiat (työpenkki, nuotio, sänky, suoja, arkku, sulatin, ahjo), varaa rakentaa, ei vielä rakennettu. Enintään 10.
function suggestBuilds(hasBench){const out=[],has=t=>pieces.some(p=>p.t===t||PIECES[p.t].base===t),wallN=pieces.filter(p=>PIECES[p.t].snap==='wall'||isFloor(p)).length;
  const ore=invCount('malmi')+invCount('rautamalmi'),full=inv.filter(Boolean).length/inv.length;
  for(const [t,d] of Object.entries(PIECES)){let sc=0;const why=[];const okMat=Object.entries(d.req).every(([id,n])=>invCount(id)>=n),okB=d.noBench||hasBench;
    const base=bt(t),stone=!!d.stone;
    if(base==='tyopenkki'&&!has('tyopenkki')){sc+=10;why.push('Rakenna ensin');}
    if(base==='nuotio'&&!has('nuotio')&&!has('grilli')){sc+=6;why.push('Lämpöä ja ruoanlaittoa');}
    if(base==='sanky'&&!has('sanky')){sc+=5;why.push('Syntymispaikka ja lepo');}
    if(['lattia','seina','ovi','katto'].includes(base)&&!stone&&wallN<12){sc+=4;why.push('Suoja yöksi');}
    if(base==='arkku'&&full>.6&&!stone){sc+=4;why.push('Reppu täyttyy');}
    if(base==='sulatin'&&!has('sulatin')&&ore>0){sc+=7;why.push('Sulata malmi');}
    if(base==='ahjo'&&!has('ahjo')&&invCount('kupari')>0){sc+=6;why.push('Kupariaseet ja -varusteet');}
    if(stone&&invCount('kivi')>=30&&wallN>=12&&['kiviseina','kivilattia'].includes(t)){sc+=3;why.push('Kestävämpi kuin puu');}
    if(sc>0||(!has(base)&&okMat&&okB&&wallN>=12)){if(okMat&&okB)sc+=2;else if(!okMat)sc-=1;if(!has(base)&&!why.length){sc+=2.5;why.push('Uusi');}
      if(okMat&&okB)why.push('Varaa rakentaa');if(sc>=3)out.push({t,sc,why:why.join(' · ')});}}
  return out.sort((a,b)=>b.sc-a.sc).slice(0,10);}
let _srchInit=false;
function initSearch(){if(_srchInit)return;_srchInit=true;
  const cs=$('#craftSearch'),bs=$('#buildSearch');if(cs)cs.addEventListener('input',()=>renderInv());if(bs)bs.addEventListener('input',()=>renderBuild());
  for(const el of [cs,bs])if(el)el.addEventListener('keydown',e=>{if(e.key==='Escape'){if(el.value){el.value='';el.dispatchEvent(new Event('input'));}else el.blur();e.stopPropagation();}});}
const costChips=req=>Object.entries(req).map(([id,n])=>{const h=invCount(id);return `<span class="mat ${h>=n?'ok':'bad'}">${ITEMS[id].n} ${Math.min(h,999)}/${n}</span>`;}).join('');
function renderBuild(){initSearch();const c=$('#buildCards');c.innerHTML='';const hasBench=!!nearPiece('tyopenkki',P.pos.x,P.pos.z,20);
  const tabs=$('#buildTabs');tabs.innerHTML='';const qs=searchQ('#buildSearch'),sug=!qs&&buildTab==='suos'?suggestBuilds(hasBench):null;
  for(const [id,nm] of [['suos','Ehdotukset'],...BUILD_CATS]){const b=document.createElement('button');b.className='tab'+(id===buildTab&&!qs?' on':'')+(id==='suos'?' sug':'');b.textContent=nm;b.onclick=()=>{buildTab=id;$('#buildSearch').value='';renderBuild();};tabs.appendChild(b);}
  const list=qs?Object.keys(PIECES).filter(t=>searchHit(PIECES[t].n,qs)):sug?sug.map(x=>x.t):Object.keys(PIECES).filter(t=>buildTab==='alku'?PIECES[t].alku:PIECES[t].cat===buildTab);
  if(!list.length)c.innerHTML=`<div class="note">${qs?'Ei osumia haulle “'+esc(qs)+'”.':'Ei ehdotuksia juuri nyt.'}</div>`;
  for(const t of list){const d=PIECES[t],why=sug?sug.find(x=>x.t===t).why:'';
    const okMat=Object.entries(d.req).every(([id,n])=>invCount(id)>=n);const okB=d.noBench||hasBench;
    const b=document.createElement('button');b.className='card'+(okMat&&okB?'':' na');b.innerHTML=`<div class="nm">${d.n}</div>${why?`<div class="why">${why}</div>`:''}<div class="rq">${costChips(d.req)}</div>${okB?'':'<div class="rq"><span class="mat bad">tarvitsee työpenkin</span></div>'}`;
    // Oikealla napilla avattu valikko ei saa valita korttia heti (hiiri on vielä alhaalla).
    b.onclick=()=>{if(performance.now()-panelOpenedAt<400)return;setBuildSel(t);closePanels();};c.appendChild(b);}}
// Päivityspainike: näyttää hinnan (punainen = puuttuu) ja tekee päivityksen napsautuksesta.
// Päivityksen esikatselu: muuttuvat ominaisuudet (nykyinen → uusi), hinta ja "Päivitä nyt" -painikkeen paikka (.upPrev).
let upPrev=null;
function upPreviewHTML(a,b,cost,head){const rows=[];for(let i=0;i<b.length;i++){const o=a.find(r=>r[0]===b[i][0]);if(!o||o[1]!==b[i][1])rows.push([b[i][0],o?o[1]:'–',b[i][1]]);}
  return `<div class="upPrev"><div class="uh">Päivitys ${head}</div><table class="props">${rows.length?rows.map(([k,x,y])=>`<tr><td>${k}</td><td>${x} <span class="arr">→</span> <b>${y}</b></td></tr>`).join(''):'<tr><td colspan="2">Ei muutoksia ominaisuuksiin.</td></tr>'}</table><div class="rq">Hinta: ${costChips(cost)}</div></div>`;}
// Repun ja arkkujen laajennus: ensin "mitä muuttuu" (chg = [[nimi, nyt, uusi]]), sitten Päivitä nyt.
function upBtn(el,cost,label,fn,key,chg,rerender,what){if(!cost){el.innerHTML=`<div class="note">${what||label} on korkeimmalla tasollaan.</div>`;return;}
  const open=upPrev===key;
  el.innerHTML=`<button class="btn${open?' on':''}">${open?'Piilota':label+' …'}</button>`+(open?upPreviewHTML(chg.map(c=>[c[0],c[1]]),chg.map(c=>[c[0],c[2]]),cost,`– ${label}`):'');
  el.firstChild.onclick=()=>{upPrev=open?null:key;rerender();};
  if(open){const ok=Object.entries(cost).every(([id,n])=>invCount(id)>=n),y=document.createElement('button');y.className='btn pri';y.textContent='Päivitä nyt';y.disabled=!ok;
    y.onclick=()=>{if(!Object.entries(cost).every(([id,n])=>invCount(id)>=n))return;for(const [id,n] of Object.entries(cost))invRemove(id,n);upPrev=null;fn();sfx('craft');invDirty=true;rerender();};el.querySelector('.upPrev').appendChild(y);}}
// Tavaran ominaisuudet listana [nimi, arvo] annetulla ★-tasolla (tietopaneeli ja päivityksen vertailu).
function itemProps(s,q){const d=ITEMS[s.id],o=[],f1=v=>v.toFixed(1).replace('.',','),pc=v=>Math.round(v*100)+' %',mss=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')} min`,mq=d.cat&&d.cat!=='hammer'&&RECIPE_BY[s.id];
  if(mq)o.push(['Taso','★'+q+' / ★3']);
  if(d.cat==='weapon'){const w={...d,q};o.push(['Vahinko',weaponDmg(w).toFixed(0)],['Vahinkotyyppi',{slash:'viiltävä',blunt:'murskaava',pierce:'pistävä',fire:'tuli'}[d.dt]||'–'],['Kestävyyttä / isku',f1(d.st*matStamK(s.id))+(matStamK(s.id)<1?` (−${Math.round((1-matStamK(s.id))*100)} %)`:'')]);
    if(d.chop)o.push(['Hakkuuteho',((5+d.chop*4)*(1+.25*(q-1))).toFixed(0)]);if(d.pick)o.push(['Louhintateho',((9+d.pick*3)*(1+.25*(q-1))).toFixed(0)]);if(d.range)o.push(['Ulottuvuus',f1(d.range)+' m']);if(d.kb)o.push(['Tönäisy',f1(d.kb/7.5)+' m'+(d.kb>=10?' (vahva)':'')]);}
  if(d.cat==='bow'){const b=bowStats(s);o.push(['Vahinko enintään',weaponDmg({...d,q}).toFixed(0)],['Jännitysaika',f1(b.draw/(1+.25*(q-1)))+' s'],['Nuolen nopeus',((14+36)*(1+.1*(q-1))*b.spd).toFixed(0)+' m/s'],
    ['Hajonta vajaalla vedolla','enint. '+f1(10*b.acc/(1+.3*(q-1)))+'°']);}
  if(d.cat==='shield')o.push(['Torjuu',pc(Math.min(.95,d.block*(1+.1*(q-1))))],['Torjunnan kestävyys',pc(SHIELD_COST[s.id]||.9)+' iskusta']);
  // v1.23 (kohta 15): nuolten tiedot
  if(AMMO_STATS[s.id]){const a=AMMO_STATS[s.id],r=v=>v===1?'normaali':(v>1?'+':'−')+Math.round(Math.abs(v-1)*100)+' %';
    o.push(['Lentonopeus',r(a.spd)],['Kaaren pudotus',r(a.grav)],['Vahinko',r(a.dmg)],['Tuulen vaikutus',a.wind<1?'puolet':'normaali']);if(a.fire)o.push(['Sytyttää','5–10 s, 5 terveyttä/s (sade sammuttaa)']);}
  if(d.cat==='shovel')o.push(...(s.id==='kuokka'?[['Vasen','nostaa maata 0,3 m'],['Oikea','palauttaa maan värin']]:[['Vasen','kaivaa kuoppaa 0,3 m'],['Oikea','ruskea polku']]),['Kestävyyttä / käyttö','6']);
  if(d.cat==='armor'){const a=d.arm*(1+.2*(q-1));o.push(['Suoja',a.toFixed(0)],['Vahinko pienenee',pc(1-20/(20+a))]);if(d.warm)o.push(['Lämmin','kyllä']);}
  if(AMMO.includes(s.id))o.push(['Ammus',flags.ammo===s.id?'valittu':ammoId()===s.id?'käytössä (automaattinen)':flags.ammo?'ei käytössä':'automaattinen: heikoimmasta parhaaseen']);
  if(s.id==='soihtu'){const m=TORCH_T*(1+.5*(q-1));o.push(['Palamisaika (max)',mss(m)]);if(q===(s.q||1))o.push(['Jäljellä',`${mss(Math.max(0,Math.min(m,s.fuel??m)))} (${Math.round(Math.max(0,(s.fuel??m))/m*100)} %)`],['Tila',s.lit===false?'sammunut':'palaa kun pidät kädessä']);}
  else if(d.cat==='offhand')o.push(['Käsi','toinen käsi']);
  if(d.food)o.push(['Kylläisyys','+'+d.food.h],...(d.food.hp?[['Terveys','+'+d.food.hp]]:[]),...(d.food.st?[['Kestävyys','+'+d.food.st]]:[]),...(d.food.buff?[['Vaikutus','tehoruoka']]:[]),...(d.food.raw?[['Raaka','voi aiheuttaa pahoinvointia']]:[]));
  if(d.fuel)o.push(['Polttoarvo',d.fuel+'× puu']);
  o.push(['Paino',f1(d.w*s.n)+(s.n>1?` (${f1(d.w)} / kpl)`:'')]);if(d.s>1)o.push(['Määrä',`${s.n} / ${d.s}`]);
  return o;}
function openChest(p){togglePanel('chest');curChest=p;renderChest();}
// Löydetyt arkut, kirstut ja tynnyrit avautuvat arkkuikkunaan kuten omat arkut. Sisältö luodaan ensimmäisellä avauksella saalistaulukosta
// ja tallentuu flags.fc[avain] (myös pelaajan sinne jättämät esineet). Jos paikka on avattu vanhassa tallennuksessa (saalis jo annettu), se on tyhjä.
function foundItems(key,loot,slots=8){const fc=fo('fc');if(!fc[key]){const it=[];for(const [id,n,q] of loot||[])if(ITEMS[id])it.push({id,n,q:q||1});while(it.length<slots)it.push(null);fc[key]=it;}return fc[key];}
function openFound(key,title,loot){const items=foundItems(key,loot);if(openPanel)closePanels(true);togglePanel('chest');curChest={found:true,title,data:{items}};sfx('pickup');renderChest();}
const foundEmpty=key=>{const it=fo('fc')[key];return !!it&&!it.some(Boolean);};
function renderChest(){if(!curChest)return;const items=curChest.data.items;$('#chestTitle').textContent=curChest.found?curChest.title:PIECES[curChest.t].n+(curChest.data.lv?` (taso ${curChest.data.lv+1})`:'');
  if(curChest.found)$('#chestUp').innerHTML='';else
  upBtn($('#chestUp'),STORE_UP[(curChest.data.lv||0)+1],`Laajenna (taso ${(curChest.data.lv||0)+2})`,()=>{curChest.data.lv=(curChest.data.lv||0)+1;while(items.length<storeSlots(curChest))items.push(null);msg('Säilytystila kasvoi.','loot');},'chest',
    [['Paikkoja',storeSlots(curChest),storeSlots(curChest)+8]],renderChest,PIECES[curChest.t].n);
  if(curChest.grave&&!items.some(Boolean)){const g=curChest.grave;closePanels();if(graves.includes(g)){graveVanish(g);msg('Hautakasa on tyhjä.','loot');}return;}
  $('#chestGrid').innerHTML=items.map(s=>slotHTML(s)).join('');$('#chestInv').innerHTML=inv.map(s=>slotHTML(s)).join('');
  // v0.75: napsautus valitsee esineen (arkusta tai repusta) ja seuraava napsautus siirtää/vaihtaa sen valittuun paikkaan;
  // Shift+napsautus siirtää heti toiselle puolelle (kuten ennen).
  const C=$('#chestGrid'),I=$('#chestInv');
  for(const [G,el0] of [['c',C],['i',I]])[...el0.children].forEach((el,i)=>{el.classList.toggle('sel',!!chestSel&&chestSel.g===G&&chestSel.i===i);el.onclick=e=>chestClick(G,i,e.shiftKey);
    el.oncontextmenu=ev=>{ev.preventDefault();const arr=G==='c'?items:inv;   // v1.08: valittuna oikea klikkaus siirtää puolet, muuten puolittaa pinon samalla puolella
      if(dragEat)return;if(chestSel&&!(chestSel.g===G&&chestSel.i===i)){moveHalf(chestSel.g==='c'?items:inv,chestSel.i,arr,i);invDirty=true;updateGear();}
      else{const h=pickHalf(arr[i]);if(chestSel&&chestSel.g===G&&chestSel.i===i&&!!chestSel.half===h)chestSel=null;else chestSel=arr[i]?{g:G,i,half:h}:null;}renderChest();};
    slotUX(el,G,i);});
  const h=$('#chestHint');if(h)h.textContent=chestSel&&chestSel.half?'Puolet valittu – napsauta ruutua siirtääksesi ne.':chestSel?'Valittu – napsauta ruutua siirtääksesi (oikea napsautus: puolet). Shift+napsautus siirtää heti toiselle puolelle.':'Napsauta tai raahaa esinettä siirtääksesi sen. Shift+napsautus siirtää heti toiselle puolelle.';updGhost();}
let chestSel=null;
function chestClick(g,i,shift){const items=curChest.data.items,arr=g==='c'?items:inv,s=arr[i];
  if(shift){chestSel=null;if(!s)return;if(g==='c'){const left=invAdd(s.id,s.n,s.q||1);if(left===0){items[i]=null;if(s.fuel!==undefined){const t=[...inv].reverse().find(x=>x&&x.id===s.id&&x.fuel===undefined);if(t){t.fuel=s.fuel;t.lit=s.lit;}}}else s.n=left;}
    else{if(s.eq){s.eq=false;updateGear();}const j=items.findIndex(x=>!x);if(j<0){msg('Arkku on täynnä.','warn');return;}items[j]=s;inv[i]=null;}
    invDirty=true;renderChest();return;}
  if(!chestSel){if(s){chestSel={g,i};renderChest();}return;}
  if(chestSel.g===g&&chestSel.i===i){chestSel=null;renderChest();return;}
  const src=chestSel.g==='c'?items:inv;(chestSel.half?moveHalf:moveSlot)(src,chestSel.i,arr,i);chestSel=null;invDirty=true;updateGear();renderChest();}
// Siirto paikasta toiseen: tyhjään siirtyy, samaan pinottavaan esineeseen yhdistyy, muuten paikat vaihtuvat.
// Arkkuun siirtyvä varuste riisutaan.
function moveSlot(sa,si,da,di){const a=sa[si],b=da[di];if(!a||(sa===da&&si===di))return;
  if(b&&b.id===a.id&&ITEMS[a.id].s>1&&(b.q||1)===(a.q||1)){const k=Math.min(a.n,ITEMS[a.id].s-b.n);b.n+=k;a.n-=k;if(a.n<=0)sa[si]=null;return;}
  da[di]=a;sa[si]=b;if(da!==inv&&a.eq)a.eq=false;if(sa!==inv&&b&&b.eq)b.eq=false;}
// Pinon puolitus (hiiren oikea): puolet tyhjään paikkaan.
function splitSlot(i){if(splitIn(inv,i)&&openPanel==='inv')renderInv();}
function splitIn(arr,i){const s=arr[i];if(!s||s.n<2)return false;const j=arr.findIndex(x=>!x);if(j<0){msg(arr===inv?'Repussa ei ole tyhjää paikkaa.':'Arkussa ei ole tyhjää paikkaa.','warn');return false;}
  const k=Math.floor(s.n/2);s.n-=k;arr[j]={id:s.id,n:k,q:s.q};invDirty=true;return true;}
// v1.08 (lista 2, kohta 1): puolet pinosta toiseen ruutuun (tyhjään tai samaan esineeseen). Yksittäinen esine siirtyy kokonaan.
function moveHalf(sa,si,da,di){const a=sa[si],b=da[di];if(!a||(sa===da&&si===di))return;if(a.n<2){moveSlot(sa,si,da,di);return;}
  const k=Math.floor(a.n/2);if(!b){da[di]={id:a.id,n:k,q:a.q};a.n-=k;return;}
  if(b.id===a.id&&ITEMS[a.id].s>1&&(b.q||1)===(a.q||1)){const m=Math.min(k,ITEMS[a.id].s-b.n);b.n+=m;a.n-=m;if(a.n<=0)sa[si]=null;return;}
  msg('Ruudussa on toinen esine – puolikkaan voi siirtää vain tyhjään tai samaan esineeseen.','warn');}
/* v1.08 (lista 2, kohta 1) – valinnan selkeys ja raahaus repussa ja arkussa:
   valittu ruutu sykkii, sen kuvake seuraa hiirtä haamuna (#ghostIt), kohderuudussa vihje Siirrä / Pinoa / Vaihda,
   raahaus (hiiri pohjassa > 6 px) siirtää ruutuun jonka päällä päästetään irti; paneelin ulkopuolelle = pudota maahan. */
const GHOST=document.createElement('div');GHOST.id='ghostIt';document.body.appendChild(GHOST);
let mouseXY=[0,0],slotDrag=null,dragEat=false,selHalf=false;
// v1.30: oikea napsautus / oikealla raahaus ottaa pinosta puolet (sama valintakorostus ja haamukuvake; haamussa siirrettävä määrä)
function pickHalf(s){return !!(s&&s.n>1);}
function uxArr(g){return g==='c'&&curChest?curChest.data.items:inv;}
function curSel(){if(openPanel==='inv'&&selSlot>=0&&inv[selSlot])return{g:'i',i:selSlot,half:selHalf};if(openPanel==='chest'&&chestSel&&uxArr(chestSel.g)[chestSel.i])return chestSel;return null;}
function updGhost(){const s=curSel(),it=s&&uxArr(s.g)[s.i];if(!it){GHOST.style.display='none';return;}
  const u=icon(it.id);if(GHOST.dataset.u!==u){GHOST.style.backgroundImage=`url(${u})`;GHOST.dataset.u=u;}
  {const n=s.half?Math.floor(it.n/2):it.n,t=n>1?String(n):'';if(GHOST.textContent!==t)GHOST.textContent=t;GHOST.classList.toggle('half',!!s.half);}
  GHOST.classList.toggle('drag',!!(slotDrag&&slotDrag.on));GHOST.style.display='flex';GHOST.style.left=mouseXY[0]+'px';GHOST.style.top=mouseXY[1]+'px';}
function slotHint(sg,si,dg,di,half){const a=uxArr(sg)[si],b=uxArr(dg)[di];if(!a||(sg===dg&&si===di))return '';const st=b&&b.id===a.id&&ITEMS[a.id].s>1&&(b.q||1)===(a.q||1);
  if(half)return !b?'Siirrä ½':st?'Pinoa ½':'Ei käy';if(!b)return 'Siirrä';return st?'Pinoa':'Vaihda';}
function slotUX(el,g,i){el.dataset.g=g;el.dataset.i=i;
  el.onmouseenter=()=>{const s=curSel();const h=s?slotHint(s.g,s.i,g,i,s.half):'';el.classList.toggle('tgt',!!h);if(h)el.dataset.hint=h;};
  el.onmouseleave=()=>el.classList.remove('tgt');
  el.onmousedown=e=>{if((e.button!==0&&e.button!==2)||e.shiftKey||!uxArr(g)[i])return;slotDrag={g,i,x:e.clientX,y:e.clientY,on:false,half:e.button===2&&pickHalf(uxArr(g)[i])};};}
function selectFor(g,i,half){if(openPanel==='inv'){selSlot=i;selHalf=!!half;upPrev=null;}else chestSel={g,i,half:!!half};}
function uxRerender(){if(openPanel==='inv')renderInv();else if(openPanel==='chest')renderChest();}
addEventListener('mousemove',e=>{mouseXY=[e.clientX,e.clientY];
  if(slotDrag&&!slotDrag.on&&Math.hypot(e.clientX-slotDrag.x,e.clientY-slotDrag.y)>6){slotDrag.on=true;selectFor(slotDrag.g,slotDrag.i,slotDrag.half);uxRerender();}
  if(GHOST.style.display==='flex')updGhost();});
addEventListener('mouseup',e=>{const d=slotDrag;slotDrag=null;if(!d||!d.on)return;dragEat=true;setTimeout(()=>dragEat=false,0);
  const src=uxArr(d.g),a=src[d.i];if(!a){uxRerender();return;}
  const t=document.elementFromPoint(e.clientX,e.clientY),sl=t&&t.closest('.slot[data-g]'),pan=openPanel==='chest'?$('#chest'):$('#inv');
  const hb=t&&t.closest('#hotbar .slot');   /* pikapalkki = repun 8 ensimmäistä ruutua */
  const mv=d.half?moveHalf:moveSlot;
  if(sl){mv(src,d.i,uxArr(sl.dataset.g),+sl.dataset.i);}
  else if(hb){mv(src,d.i,inv,[...hb.parentNode.children].indexOf(hb));}
  else if(pan&&!pan.contains(t)){const k=d.half?Math.floor(a.n/2):a.n;if(a.eq&&k>=a.n){a.eq=false;}spawnDrop(a.id,k,P.pos.x+Math.sin(P.yaw),P.pos.y+1,P.pos.z+Math.cos(P.yaw),a.q);a.n-=k;if(a.n<=0)src[d.i]=null;sfx('pickup',.8,.5);msg(`Pudotit: ${ITEMS[a.id].n}${k>1?' ×'+k:''}`);}
  else{uxRerender();updGhost();return;}
  selSlot=-1;selHalf=false;chestSel=null;invDirty=true;updateGear();uxRerender();updGhost();});
addEventListener('click',e=>{if(dragEat){dragEat=false;e.stopPropagation();e.preventDefault();}},true);
addEventListener('contextmenu',e=>{if(dragEat){e.stopPropagation();e.preventDefault();}},true);   // v1.30: oikealla raahauksen jälkeinen contextmenu
// Valitun esineen pudotus (Q yksi, Shift+Q kaikki).
function dropSel(all){const s=inv[selSlot];if(!s)return;const n=all?s.n:1;if(s.eq&&(all||s.n<=1)){s.eq=false;updateGear();}
  spawnDrop(s.id,n,P.pos.x+Math.sin(P.yaw),P.pos.y+1,P.pos.z+Math.cos(P.yaw),s.q);s.n-=n;if(s.n<=0){inv[selSlot]=null;selSlot=-1;}sfx('pickup',.8,.5);invDirty=true;renderInv();}

/* ---------------- MAP ---------------- */
const MAPW=HALF*2,MAPC=document.createElement('canvas');MAPC.width=MAPC.height=MAPW;
(function(){const g=MAPC.getContext('2d'),img=g.createImageData(MAPW,MAPW);
  for(let y=0;y<MAPW;y++)for(let x=0;x<MAPW;x++){const wx=x-HALF,wz=y-HALF,h=terrainH(wx,wz);let r,gg,b;
    if(h<0){const k=clamp(-h/14,0,1);r=lerp(70,28,k);gg=lerp(120,62,k);b=lerp(130,88,k);}
    else{const gx=Math.min(GN,Math.round((wx+HALF)/GS)),gz=Math.min(GN,Math.round((wz+HALF)/GS)),i=(gz*HN+gx)*3;r=terrainColors[i]*255;gg=terrainColors[i+1]*255;b=terrainColors[i+2]*255;const sh=clamp((terrainH(wx-1,wz-1)-h)*.12,-.25,.25);r*=1-sh;gg*=1-sh;b*=1-sh;}
    const o=(y*MAPW+x)*4;img.data[o]=r;img.data[o+1]=gg;img.data[o+2]=b;img.data[o+3]=255;}
  g.putImageData(img,0,0);})();
// Sumu (tuntematon alue): FOGC 2 m / pikseli. Paljastus tehdään pehmeillä säteittäisillä gradienteilla (sileä reuna), joten kartta ei ole kulmikas.
const FOGS=EXN*2,FOGK=FOGS/MAPW;
const FOGC=document.createElement('canvas');FOGC.width=FOGC.height=FOGS;const fogG=FOGC.getContext('2d');
// Tuntematon alue on pilviverhon peitossa (läpinäkymätön), joten maastoa ei erota.
const FOGIMG=(function(){const im=fogG.createImageData(FOGS,FOGS);for(let y=0;y<FOGS;y++)for(let x=0;x<FOGS;x++){const v=18+fbm(x*.045+3,y*.045-7,4)*40,o=(y*FOGS+x)*4;im.data[o]=v;im.data[o+1]=v*.97;im.data[o+2]=v*.93;im.data[o+3]=255;}return im;})();
function fogReveal(wx,wz,r){const x=(wx+HALF)*FOGK,y=(wz+HALF)*FOGK,rr=r*FOGK,gr=fogG.createRadialGradient(x,y,rr*.3,x,y,rr);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');
  fogG.globalCompositeOperation='destination-out';fogG.fillStyle=gr;fogG.beginPath();fogG.arc(x,y,rr,0,TAU);fogG.fill();fogG.globalCompositeOperation='source-over';}
function resetFog(){if(explored.every(v=>v)){fogG.clearRect(0,0,FOGS,FOGS);return;}fogG.putImageData(FOGIMG,0,0);for(let i=0;i<explored.length;i++)if(explored[i])fogReveal(((i%EXN)+.5)*4-HALF,(((i/EXN)|0)+.5)*4-HALF,7);}
// Tutkittu alue: 4 m ruudut, säde 3 ruutua (12 m, aiemmin 24 m)
function exploreTick(){if(P.inDun)return;const cx=Math.floor((P.pos.x+HALF)/4),cz=Math.floor((P.pos.z+HALF)/4);for(let z=cz-3;z<=cz+3;z++)for(let x=cx-3;x<=cx+3;x++){if(x<0||z<0||x>=EXN||z>=EXN)continue;if((x-cx)**2+(z-cz)**2>9)continue;const i=z*EXN+x;if(!explored[i]){explored[i]=1;fogReveal((x+.5)*4-HALF,(z+.5)*4-HALF,7);}}
  for(const k of ['ruinF','ruinM','ruinC','barrow','circle',...CAMPS.map(c=>c.k),...STASHES.map(c=>c.k)]){const L=LOC[k];if(!flags.disc[k]&&dist2(L.x,L.z,P.pos.x,P.pos.z)<30*30){flags.disc[k]=1;msg(`Löysit paikan: ${L.name}`,'loot');}}}
// Rakennukset kartalle ylhäältä: 1 pikseli / metri (BLDC), päivitetään kun rakennukset muuttuvat
const BLDC=document.createElement('canvas');BLDC.width=BLDC.height=MAPW;const bldG=BLDC.getContext('2d');
function drawBld(){bldDirty=false;bldG.clearRect(0,0,MAPW,MAPW);
  const col=p=>{const d=PIECES[p.t];return d.stone||p.t==='kiviseina'?'#a9a79f':/tervas/.test(p.t)?'#5a4030':d.roof?(d.stone?'#7a7870':'#d0ad4c'):'#a8723e';};
  const order=p=>PIECES[p.t].roof?3:PIECES[bt(p.t)]&&(bt(p.t)==='lattia'||bt(p.t)==='tervaslattia')?0:PIECES[p.t].snap==='wall'?1:2;
  for(const o of [0,1,2,3])for(const p of pieces){if(order(p)!==o)continue;const x=p.x+HALF,z=p.z+HALF;bldG.fillStyle=col(p);
    if(o===0||o===3)bldG.fillRect(Math.round(x-1.25),Math.round(z-1.25),3,3);
    else if(o===1){if(p.rot%4===0)bldG.fillRect(Math.round(x-1.25),Math.round(z-.5),3,1);else bldG.fillRect(Math.round(x-.5),Math.round(z-1.25),1,3);}
    else bldG.fillRect(Math.round(x-.5),Math.round(z-.5),2,2);}}
// Liikkuvat pilvet kartalla (vain kun kartta on auki). Kaksi saumatonta pilvikerrosta: jaksollinen arvokohina (fbm, 5 oktaavia)
// muotoillaan pyöreiksi kumpupilviksi (kynnys + pehmeä reuna), valaistaan luoteesta (vaalea yläreuna, harmaa pohja) ja
// alle piirretään pilven varjo. Kerrokset liukuvat eri nopeuksilla ja eri suuntiin, jolloin pilvet näyttävät muuttavan muotoaan.
function mkMapClouds(S,seed,cover,scale){const c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),im=g.createImageData(S,S),r=mulberry32(seed);
  const oct=[];for(let o=0;o<5;o++){const n=(scale<<o),v=new Float32Array(n*n);for(let i=0;i<v.length;i++)v[i]=r();oct.push({n,v,a:Math.pow(.52,o)});}
  const val=(O,x,y)=>{const n=O.n,fx=x*n,fy=y*n,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),
    i0=((ix%n)+n)%n,i1=(i0+1)%n,j0=((iy%n)+n)%n,j1=(j0+1)%n,v=O.v;return lerp(lerp(v[j0*n+i0],v[j0*n+i1],sx),lerp(v[j1*n+i0],v[j1*n+i1],sx),sy);};
  const fb=(x,y)=>{let s=0,w=0;for(const O of oct){s+=val(O,x,y)*O.a;w+=O.a;}return s/w;};
  const H=new Float32Array(S*S);for(let y=0;y<S;y++)for(let x=0;x<S;x++)H[y*S+x]=fb(x/S,y/S);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const h=H[y*S+x],d=clamp((h-cover)/.14,0,1),dens=d*d*(3-2*d);
    const hs=H[((y+S-3)%S)*S+(x+S-3)%S],lit=clamp(.82+(h-hs)*5,.55,1.08),o=(y*S+x)*4;
    im.data[o]=235*lit;im.data[o+1]=238*lit;im.data[o+2]=246*Math.min(1,lit+.04);im.data[o+3]=dens*215;}
  g.putImageData(im,0,0);return c;}
const CLOUDC=mkMapClouds(256,911,.52,4),CLOUDC2=mkMapClouds(256,377,.56,3);
const CLOUDSH=(function(){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.globalAlpha=.25;for(const [dx,dy] of [[0,0],[2,1],[-2,1],[1,-2],[-1,2]])for(const ox of [-256,0,256])for(const oy of [-256,0,256])g.drawImage(CLOUDC,dx+ox,dy+oy);g.globalAlpha=1;g.globalCompositeOperation='source-in';g.fillStyle='#000';g.fillRect(0,0,256,256);return c;})();
const FOGTMP=document.createElement('canvas');FOGTMP.width=FOGTMP.height=640;
let mapZ=1,mapCX=0,mapCZ=0,mapRAF=0,mapDrag=null,mapMouse=null,mapWindA=.9;
function mapView(){const sw=MAPW/mapZ;return{sw,x0:clamp(mapCX+HALF-sw/2,0,MAPW-sw),y0:clamp(mapCZ+HALF-sw/2,0,MAPW-sw)};}
function mapLoop(){if(openPanel!=='map'){mapRAF=0;return;}drawBigMap();mapRAF=requestAnimationFrame(mapLoop);}
// Onko kohta paljastettu kartalla (pelaaja on käynyt ~12 m säteellä). Löydetyn paikan merkki näkyy vain paljastetulla alueella,
// vaikka riimukivi tai tavoite olisi jo kertonut paikan (suunta näkyy silloin tehtävässä) – pilviverhon takana ei näy merkkejä.
function isExplored(x,z){const cx=Math.floor((x+HALF)/4),cz=Math.floor((z+HALF)/4);for(let dz=-3;dz<=3;dz++)for(let dx=-3;dx<=3;dx++){const X=cx+dx,Z=cz+dz;if(X<0||Z<0||X>=EXN||Z>=EXN)continue;if(explored[Z*EXN+X])return true;}return false;}
function mapMarkers(g,sx,ox,oz){
  const pt=(x,z)=>[(x+ox)*sx,(z+oz)*sx];
  for(const k in flags.disc){const L=LOC[k];if(!L||!isExplored(L.x,L.z))continue;const [x,y]=pt(L.x,L.z);g.fillStyle='#8fd8cf';g.save();g.translate(x,y);g.rotate(Math.PI/4);g.fillRect(-4,-4,8,8);g.restore();if(sx>1&&L.name){g.save();g.shadowColor='rgba(0,0,0,.9)';g.shadowBlur=3;g.shadowOffsetX=1;g.shadowOffsetY=1;   /* v1.20 (kohta 11): pehmeä varjo, erottuu lumisilla vuorilla */
    g.fillStyle='#eee5d3';g.font='600 12px Alegreya Sans, sans-serif';g.fillText(L.name,x+8,y+4);g.restore();}}
  for(const p of pieces)if(p.t==='tyopenkki'||p.t==='sanky'){const [x,y]=pt(p.x,p.z);g.fillStyle='#e8893b';g.fillRect(x-3,y-3,6,6);}
  // Pääkallo näkyy kunnes hautakasan tavarat on kerätty.
  for(const gr of graves){const [x,y]=pt(gr.x,gr.z),r=sx>1?8:6;g.save();g.translate(x,y);g.fillStyle='#f2ecdc';g.strokeStyle='#7a1a12';g.lineWidth=1.6;g.beginPath();g.arc(0,-r*.15,r*.8,0,TAU);g.fill();g.stroke();g.fillRect(-r*.45,r*.4,r*.9,r*.6);g.strokeRect(-r*.45,r*.4,r*.9,r*.6);g.fillStyle='#1a1410';g.beginPath();g.arc(-r*.33,-r*.2,r*.22,0,TAU);g.arc(r*.33,-r*.2,r*.22,0,TAU);g.fill();g.restore();}
}
// v0.84: tuulikompassi isolla kartalla (nuoli = puhallussuunta, kartan ylös = pohjoinen) + teksti "Tuuli: lounaasta 6 m/s".
const mapCO={x:0,y:0,t:0};
function windArrow(g,x,y,L,col){g.save();g.translate(x,y);g.rotate(Math.atan2(WIND.z,WIND.x));g.strokeStyle=col;g.fillStyle=col;g.lineWidth=Math.max(1.5,L*.09);g.lineCap='round';
  g.beginPath();g.moveTo(-L*.5,0);g.lineTo(L*.32,0);g.stroke();g.beginPath();g.moveTo(L*.5,0);g.lineTo(L*.18,-L*.2);g.lineTo(L*.18,L*.2);g.closePath();g.fill();
  g.beginPath();g.moveTo(-L*.5,0);g.lineTo(-L*.62,-L*.16);g.moveTo(-L*.38,0);g.lineTo(-L*.5,-L*.16);g.stroke();g.restore();}
// v1.04 selkeämpi tuulinäyttö: isompi kompassi (r 46), paksu nuoli, "Tuuli lounaasta" + iso nopeus "6 m/s", voimakkuuspalkki (0–22 m/s)
function drawWindCompass(g,x,y,r){g.save();g.fillStyle='rgba(19,17,14,.42)';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.strokeStyle='rgba(232,164,74,.9)';g.lineWidth=2;g.stroke();
  g.strokeStyle='rgba(238,229,211,.25)';g.lineWidth=1;for(let i=0;i<16;i++){const a=i/16*TAU,l=i%4?5:9;g.beginPath();g.moveTo(x+Math.cos(a)*(r-2),y+Math.sin(a)*(r-2));g.lineTo(x+Math.cos(a)*(r-2-l),y+Math.sin(a)*(r-2-l));g.stroke();}
  g.fillStyle='#eee5d3';g.font='800 13px Alegreya Sans, sans-serif';g.textAlign='center';g.textBaseline='middle';
  for(const [t,dx,dy] of [['P',0,-1],['I',1,0],['E',0,1],['L',-1,0]])g.fillText(t,x+dx*(r-17),y+dy*(r-17));
  windArrow(g,x,y,r*1.35,'#8fd8cf');g.textBaseline='alphabetic';
  const W=150,top=y+r+8;g.fillStyle='rgba(19,17,14,.5)';g.fillRect(x-W/2,top,W,50);g.strokeStyle='rgba(232,164,74,.6)';g.strokeRect(x-W/2+.5,top+.5,W-1,49);
  g.fillStyle='#d8cdb6';g.font='700 12px Alegreya Sans, sans-serif';g.fillText(`Tuuli ${windFromText()}`,x,top+15);
  g.fillStyle='#8fd8cf';g.font='800 18px Alegreya Sans, sans-serif';g.fillText(`${WIND.spd.toFixed(1).replace('.',',')} m/s`,x,top+35);
  const k=Math.min(1,WIND.spd/22);g.fillStyle='rgba(238,229,211,.15)';g.fillRect(x-W/2+10,top+41,W-20,4);g.fillStyle=k>.65?'#e0614f':k>.35?'#e8a44a':'#8fd8cf';g.fillRect(x-W/2+10,top+41,(W-20)*k,4);g.restore();}
// v1.04 tuuliviirut isolla kartalla: lyhyitä vaaleita viiruja, jotka liukuvat tuulen suuntaan (nopeus ja pituus tuulen voimakkuuden mukaan)
function drawWindStreaks(g,W){const t=performance.now()/1000,sp=12+WIND.spd*6,len=10+WIND.spd*2.2;g.save();g.lineCap='round';
  for(let i=0;i<34;i++){const h1=grassHash(i,7),h2=grassHash(3,i),ph=(t*sp/W+h1)%1,px=(h2*W+WIND.x*ph*W*1.3+W*2)%W,py=(grassHash(i,i+1)*W+WIND.z*ph*W*1.3+W*2)%W,al=Math.sin(ph*Math.PI)*.35;
    g.strokeStyle=`rgba(230,240,245,${al.toFixed(3)})`;g.lineWidth=1.6;g.beginPath();g.moveTo(px,py);g.lineTo(px-WIND.x*len,py-WIND.z*len);g.stroke();}g.restore();}
function drawPlayerArrow(g,x,y,s){g.save();g.translate(x,y);g.rotate(-camYaw);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-s);g.lineTo(s*.7,s*.8);g.lineTo(0,s*.4);g.lineTo(-s*.7,s*.8);g.closePath();g.fill();g.stroke();g.restore();}
function drawBigMap(){const c=$('#bigmap'),g=c.getContext('2d'),W=c.width,v=mapView(),S=W/v.sw;
  g.imageSmoothingEnabled=true;g.drawImage(MAPC,v.x0,v.y0,v.sw,v.sw,0,0,W,W);
  if(bldDirty)drawBld();g.imageSmoothingEnabled=false;g.drawImage(BLDC,v.x0,v.y0,v.sw,v.sw,0,0,W,W);g.imageSmoothingEnabled=true;
  const t=FOGTMP.getContext('2d');t.globalCompositeOperation='source-over';t.clearRect(0,0,W,W);t.drawImage(FOGC,v.x0*FOGK,v.y0*FOGK,v.sw*FOGK,v.sw*FOGK,0,0,W,W);
  t.globalCompositeOperation='source-atop';{const now=performance.now()/1000,dd=Math.min(.1,now-(mapCO.t||now));mapCO.t=now;const ws=.6+WIND.spd*.12;mapCO.x+=WIND.x*ws*dd;mapCO.y+=WIND.z*ws*dd;
    // v0.84: kartan pilvet liikkuvat tuulen suuntaan (kertynyt siirtymä, joten suunnan kääntyminen ei hyppää)
    const lay=(img,sp,dx,dy,sc,al)=>{t.save();t.globalAlpha=al;t.scale(sc,sc);t.translate((mapCO.x*sp*dx+mapCO.y*sp*(1-dx)*.3)%256,(mapCO.y*sp*dx-mapCO.x*sp*(1-dx)*.3)%256);t.fillStyle=t.createPattern(img,'repeat');t.fillRect(-256,-256,W/sc+512,W/sc+512);t.restore();};
    lay(CLOUDSH,6,1,.45,2.2,.22);lay(CLOUDC2,4,.8,.6,2.6,.55);lay(CLOUDC,7,1,.4,2,.85);}
  t.globalCompositeOperation='source-over';g.drawImage(FOGTMP,0,0);
  /* v1.20 (lista 2, kohta 10): ohuet pilvet liikkuvat tuulen mukana myös avatun alueen päällä (n. 20 % peitto) */
  {g.save();g.globalAlpha=.2;g.scale(2.4,2.4);g.translate((mapCO.x*5+mapCO.y*.5)%256,(mapCO.y*5-mapCO.x*.5)%256);g.fillStyle=g.createPattern(CLOUDC,'repeat');g.fillRect(-256,-256,W/2.4+512,W/2.4+512);g.restore();}
  drawWindStreaks(g,W);
  /* v1.07 tuulikompassi kartan päällä oikeassa yläkulmassa, mutta ei peitä mitään: läpikuultava tausta, häipyy (alfa ~0,12) kun hiiri
     on sen kohdalla, ja kartan merkit + pelaajan nuoli piirretään sen PÄÄLLE (ennen v1.06 kompassi peitti ne) */
  {const hov=mapMouse&&mapMouse.x>W-175&&mapMouse.y<180;mapWindA+=((hov?.12:.9)-mapWindA)*.25;g.save();g.globalAlpha=mapWindA;drawWindCompass(g,W-90,62,46);g.restore();}
  mapMarkers(g,S,HALF-v.x0,HALF-v.y0);if(!P.inDun)drawPlayerArrow(g,(P.pos.x+HALF-v.x0)*S,(P.pos.z+HALF-v.y0)*S,9);
  g.shadowColor='rgba(0,0,0,.9)';g.shadowBlur=3;g.shadowOffsetX=1;g.shadowOffsetY=1;g.fillStyle='rgba(238,229,211,.8)';g.font='700 12px Alegreya Sans, sans-serif';g.textAlign='left';g.fillText(mapZ>1?`Zoom ×${mapZ.toFixed(1)} · vedä siirtääksesi · kaksoisnapsautus keskittää`:'Rulla = zoom',10,630);}
// Kartan zoom (rulla) ja siirto (vetäminen)
(function(){const c=$('#bigmap');
  c.addEventListener('wheel',e=>{e.preventDefault();const r=c.getBoundingClientRect(),W=c.width,v=mapView(),fx=(e.clientX-r.left)/r.width,fy=(e.clientY-r.top)/r.height,wx=v.x0+fx*v.sw-HALF,wz=v.y0+fy*v.sw-HALF;
    mapZ=clamp(mapZ*(e.deltaY<0?1.25:.8),1,6);const v2=MAPW/mapZ;mapCX=wx-(fx-.5)*v2;mapCZ=wz-(fy-.5)*v2;},{passive:false});
  c.addEventListener('mousedown',e=>{mapDrag={x:e.clientX,y:e.clientY};});
  /* v1.07 hiiren paikka kartan kankaan koordinaateissa (tuulikompassin häivytys) */
  c.addEventListener('mousemove',e=>{const r=c.getBoundingClientRect();mapMouse={x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height};});c.addEventListener('mouseleave',()=>{mapMouse=null;});
  addEventListener('mouseup',()=>{mapDrag=null;});
  addEventListener('mousemove',e=>{if(!mapDrag||openPanel!=='map')return;const r=c.getBoundingClientRect(),v=mapView(),k=v.sw/r.width;mapCX-=(e.clientX-mapDrag.x)*k;mapCZ-=(e.clientY-mapDrag.y)*k;mapDrag={x:e.clientX,y:e.clientY};});
  c.addEventListener('dblclick',()=>{mapCX=P.pos.x;mapCZ=P.pos.z;});})();
// Minikartan zoomitasot (näppäin BIND.minizoom): 60 m (oletus), 35 m, 110 m säde
const MINI_R=[60,35,110];let miniZ=0;
function cycleMiniZoom(){miniZ=(miniZ+1)%MINI_R.length;msg(`Minikartta: ${MINI_R[miniZ]} m säde (${keyLabel(BIND.minizoom)} vaihtaa)`);}
// Minikartan napsautus vaihtaa myös zoomia (toimii kun hiiri on vapaana, esim. Esc)
$('#mini').addEventListener('click',e=>{e.stopPropagation();cycleMiniZoom();});
function drawMinimap(){const c=$('#mini'),g=c.getContext('2d'),W=c.width,R=MINI_R[miniZ],S=W/(R*2);g.save();g.clearRect(0,0,W,W);g.beginPath();g.arc(W/2,W/2,W/2,0,TAU);g.clip();g.fillStyle='#1d1a16';g.fillRect(0,0,W,W);
  if(!P.inDun){const sx=P.pos.x+HALF-R,sz=P.pos.z+HALF-R;g.drawImage(MAPC,sx,sz,R*2,R*2,0,0,W,W);if(bldDirty)drawBld();g.imageSmoothingEnabled=false;g.drawImage(BLDC,sx,sz,R*2,R*2,0,0,W,W);g.imageSmoothingEnabled=true;g.drawImage(FOGC,sx*FOGK,sz*FOGK,R*2*FOGK,R*2*FOGK,0,0,W,W);mapMarkers(g,S,-(P.pos.x-R),-(P.pos.z-R));
    for(const m of mobs){if(m.dead||m.dun)continue;const x=(m.pos.x-P.pos.x+R)*S,y=(m.pos.z-P.pos.z+R)*S;if(m.state==='chase'||m===boss){g.fillStyle=m===boss?'#8fd8cf':'#c8463b';g.beginPath();g.arc(x,y,m===boss?5:2.5,0,TAU);g.fill();}}}
  else{g.fillStyle='#a99d89';g.font='700 12px Alegreya Sans, sans-serif';g.textAlign='center';g.fillText('Hautakumpu',W/2,W/2+30);}
  drawPlayerArrow(g,W/2,W/2,7);g.restore();
  g.fillStyle='#eee5d3';g.font='800 11px Alegreya Sans, sans-serif';g.textAlign='center';g.fillText('P',W/2,12);
  // v0.84: tuulinuoli minikartan reunalla – sijaitsee sillä puolella, josta tuuli tulee, ja osoittaa puhallussuuntaan; vieressä m/s
  if(!P.inDun){const ra=W/2-13,ax=W/2-WIND.x*ra,ay=W/2-WIND.z*ra;g.fillStyle='rgba(19,17,14,.7)';g.beginPath();g.arc(ax,ay,10,0,TAU);g.fill();windArrow(g,ax,ay,15,'#8fd8cf');
    g.font='700 9px Alegreya Sans, sans-serif';g.fillStyle='#d8cdb6';g.fillText(`${Math.round(WIND.spd)} m/s`,ax,ay+(ay>W/2?-12:19));}
  g.font='700 10px Alegreya Sans, sans-serif';g.fillStyle='rgba(19,17,14,.65)';g.fillRect(W/2-22,W-17,44,13);g.fillStyle='#d8cdb6';g.fillText(`${R} m · ${keyLabel(BIND.minizoom)}`,W/2,W-7);}

/* v1.18 (lista 2, kohta 8): tehtävän (oikealla) ja tavoitteen (vasemmalla) näkyvyys kiertää T:llä: molemmat → vain tehtävä →
   vain tavoite → ei kumpaakaan. Piilotettuna tavoitteen paikalla pieni teksti "… piilotettu / Näytä painamalla (T)". Muistetaan (SET). */
function applyHudMode(){const md=SET.hudMode|0,g=$('#goal'),q=$('#quest');if(!g||!q)return;g.style.display=md===1||md===3?'none':'';q.style.display=md===2||md===3?'none':'';
  let h=$('#hudHint');if(!h){h=document.createElement('div');h.id='hudHint';$('#hud').appendChild(h);}
  const what=md===3?'Tehtävä ja tavoite piilotettu':md===1?'Tavoite piilotettu':md===2?'Tehtävä piilotettu':'';
  h.style.display=what?'':'none';h.classList.toggle('below',md===2);if(what)h.innerHTML=`<b>${what}</b><span>Näytä painamalla (${keyLabel(BIND.hud)})</span>`;
  if(md===2)h.style.top=(g.offsetTop+g.offsetHeight+6)+'px';else h.style.top='';}
applyHudMode();
