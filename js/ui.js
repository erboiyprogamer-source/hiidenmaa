/* Hiidenmaa – ui.js
   HUD, viestit, paneelit (reppu, valmistus, rakennus, arkku), kartta, tavoitteet */
'use strict';

/* ---------------- UI ---------------- */
// Viestin näkyvyysaika riippuu pituudesta: 3 s + 70 ms / merkki, rajattuna 4–13 s.
const msgEls=[],msgLog=[];
function msg(t,cls=''){msgLog.push({t,cls,at:playTime});if(msgLog.length>10)msgLog.shift();const el=$('#msgs');const d=document.createElement('div');d.textContent=t;if(cls)d.className=cls;el.appendChild(d);d._life=clamp(3+t.length*.07,4,13);msgEls.push(d);while(msgEls.length>7){const o=msgEls.shift();o.remove();}}
function updateMsgs(dt){for(let i=msgEls.length-1;i>=0;i--){const d=msgEls[i];d._life-=dt;if(d._life<1)d.style.opacity=Math.max(0,d._life);if(d._life<=0){d.remove();msgEls.splice(i,1);}}}
const floaters=[];
function floatText(t,x,y,z,color){const el=document.createElement('div');el.className='floater';el.textContent=t;el.style.color=color||'#eee';$('#floaters').appendChild(el);floaters.push({el,p:new V3(x,y,z),t:0});if(floaters.length>24){const o=floaters.shift();o.el.remove();}}
function updateFloaters(dt){for(let i=floaters.length-1;i>=0;i--){const f=floaters[i];f.t+=dt;f.p.y+=dt*1.2;_tmpV.copy(f.p).project(camera);if(_tmpV.z>1||f.t>1){f.el.remove();floaters.splice(i,1);continue;}f.el.style.left=((_tmpV.x+1)/2*innerWidth)+'px';f.el.style.top=((1-_tmpV.y)/2*innerHeight)+'px';f.el.style.opacity=1-f.t;}}
const mobBars=[];for(let i=0;i<8;i++){const d=document.createElement('div');d.className='mobbar';d.innerHTML='<i></i><span class="nm"></span><span class="sk"></span>';d.hidden=true;$('#floaters').appendChild(d);mobBars.push(d);}
// Terveyspalkit: näkyvät 10 s iskusta tai kun pelaaja katsoo mobia läheltä (< 12 m); vaikeat (≥3 pääkalloa) jo kaukaa (< 70 m).
// Yksi kerros = pelaajan perusterveys (60); useampikerroksinen palkki on pidempi ja kerrokset eri värisiä. Alla pääkallot vaikeustasosta.
const HP_LAYER=60,LAYER_C=['#c0392b','#e07a2a','#d9b43a','#7fae3a','#3a9ad9','#9a5ad9'],_cd=new V3();
function updateMobBars(){let k=0;camera.getWorldDirection(_cd);
  for(const m of mobs){if(k>=mobBars.length)break;if(m.dead||m===boss||m.dun!==P.inDun)continue;
    const sk=MOB_SKULL[m.type]||0,d=Math.hypot(m.pos.x-P.pos.x,m.pos.z-P.pos.z),recent=playTime-m.hurtT<10;
    const ex=m.pos.x-camera.position.x,ey=m.pos.y+1-camera.position.y,ez=m.pos.z-camera.position.z,el=Math.hypot(ex,ey,ez)||1,look=(ex*_cd.x+ey*_cd.y+ez*_cd.z)/el>(sk>=3?.95:.93);
    if(!(recent||(look&&(d<12||(sk>=3&&d<70)))))continue;
    _tmpV.set(m.pos.x,m.pos.y+(m.def.r*2.8+.8),m.pos.z).project(camera);if(_tmpV.z>1||Math.abs(_tmpV.x)>1.1||Math.abs(_tmpV.y)>1.1)continue;
    const b=mobBars[k++],layers=Math.ceil(m.maxHp/HP_LAYER),L=Math.max(1,Math.ceil(m.hp/HP_LAYER)),fill=(m.hp-(L-1)*HP_LAYER)/Math.min(HP_LAYER,m.maxHp);
    b.hidden=false;b.style.left=((_tmpV.x+1)/2*innerWidth)+'px';b.style.top=((1-_tmpV.y)/2*innerHeight)+'px';b.style.width=Math.round(56*Math.min(3,1+(layers-1)*.4))+'px';
    b.style.background=L>1?LAYER_C[(L-2)%6]:'rgba(0,0,0,.6)';b.firstChild.style.width=clamp(fill*100,0,100)+'%';b.firstChild.style.background=LAYER_C[(L-1)%6];
    b.children[1].textContent=`${m.def.n} ${Math.ceil(m.hp)}/${m.maxHp}${layers>1?' ×'+L:''}`;b.children[2].textContent='☠'.repeat(sk);}
  for(;k<mobBars.length;k++)mobBars[k].hidden=true;}
function slotHTML(s,key){if(!s)return `<div class="slot">${key?`<span class="k">${key}</span>`:''}</div>`;const d=ITEMS[s.id];return `<div class="slot${s.eq?' eq':''}" style="background-image:url(${icon(s.id)})" title="${d.n}">${key?`<span class="k">${key}</span>`:''}${(s.q||1)>1?`<span class="q">★${s.q}</span>`:''}${s.id==='soihtu'?`<span class="fu${s.lit===false?' off':''}"><i style="width:${Math.max(0,(s.fuel??TORCH_T)/TORCH_T*100)}%"></i></span>`:''}${s.n>1?`<span class="n">${s.n}</span>`:''}</div>`;}
let hudT=0;
function updateHUD(dt){
  hudT-=dt;updateMsgs(dt);updateFloaters(dt);updateMobBars();
  $('#hurt').style.opacity=Math.min(1,P.hurtFlash*1.5+(P.hp<maxHp()*.25&&!P.dead?.35:0));
  // prompt
  $('#cross').className=P.drawing?'aim':'';
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
  const hh=Math.floor(dayT*24),mm=Math.floor((dayT*24-hh)*60/10)*10;$('#clock').innerHTML=`Päivä ${dayN} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} <span>· ${P.inDun?'Hautakumpu':WEATHERS[weather.cur].n}</span>`;
  if(invDirty){invDirty=false;updateBack();$('#hotbar').innerHTML=inv.slice(0,8).map((s,i)=>slotHTML(s,i+1)).join('');if(openPanel==='inv')renderInv();if(openPanel==='chest')renderChest();if(openPanel==='build')renderBuild();}
  if(boss&&!boss.dead){$('#bossbar i').style.width=(boss.hp/boss.maxHp*100)+'%';}
  drawMinimap();
}
let openPanel=null,selSlot=-1,curChest=null;
let panelOpenedAt=0;
// Viimeiset 10 ilmoitusta (T): uusin ylimpänä, kellonaika pelin ajassa.
function renderLog(){const fm=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
  $('#logBody').innerHTML=msgLog.length?[...msgLog].reverse().map(m=>`<div class="lg ${m.cls}"><span class="num">${fm(m.at)}</span>${m.t.replace(/</g,'&lt;')}</div>`).join(''):'<div class="note">Ei ilmoituksia vielä.</div>';}
function togglePanel(name){if(openPanel===name){closePanels();return;}panelOpenedAt=performance.now();closePanels(true);openPanel=name;state='ui';releaseLock();mouseL=false;mouseR=false;P.drawing=false;
  if(name==='inv'){$('#inv').hidden=false;renderInv();}if(name==='build'){$('#build').hidden=false;renderBuild();}if(name==='map'){$('#mapP').hidden=false;drawBigMap();}if(name==='chest')$('#chest').hidden=false;if(name==='prog'){$('#progP').hidden=false;renderProg();}if(name==='log'){$('#logP').hidden=false;renderLog();}}
function closePanels(keep,skipLock){if(openPanel)panelClosedAt=performance.now();for(const id of ['#inv','#build','#mapP','#chest','#progP','#logP'])$(id).hidden=true;openPanel=null;curChest=null;selSlot=-1;if(!keep){state='play';if(!skipLock)requestLock();}}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closePanels()));
function nearStations(){const s={};for(const p of pieces){const k=isFirePiece(p.t)?'nuotio':p.t;if(['tyopenkki','nuotio','ahjo'].includes(k)&&dist2(p.x,p.z,P.pos.x,P.pos.z)<(k==='nuotio'?4:8)**2&&!P.inDun){if(k==='nuotio'&&p.data.fuel<=0)continue;s[k]=1;}}return s;}
let fxAt=0;
// Tilat repun vieressä: nimi, jäljellä oleva aika ja vaikutus (osoita hiirellä tai lue suoraan).
function renderEffects(fxs){fxs=fxs||effects();$('#effects').innerHTML=`<h3>Tilat</h3>`+(fxs.length?fxs.map(e=>`<div class="fx ${e.kind}" title="${e.desc}"><b>${e.name}${e.t?' · '+fmtT(e.t):''}</b><span>${e.desc}</span></div>`).join(''):'<div class="s">Ei erityisiä tiloja.</div>');}
let craftTab='alku';
function renderInv(){renderEffects();
  const g=$('#invGrid');g.innerHTML=inv.map((s,i)=>slotHTML(s,i<8?i+1:'')).join('');
  [...g.children].forEach((el,i)=>{el.classList.toggle('sel',i===selSlot);el.onclick=e=>{if(selSlot>=0&&selSlot!==i&&e.shiftKey===false&&inv[selSlot]&&!inv[i]){inv[i]=inv[selSlot];inv[selSlot]=null;selSlot=i;invDirty=true;renderInv();return;}selSlot=i;renderInv();};el.ondblclick=()=>{useSlot(i);renderInv();};el.oncontextmenu=e=>{e.preventDefault();if(inv[i]){useSlot(i);renderInv();}};});
  $('#invW').textContent=`Paino ${invWeight().toFixed(0)} / ${MAXW}`;
  upBtn($('#invUp'),PACK_UP[P.packLv+1],`Isompi reppu (taso ${P.packLv+2}: +8 paikkaa, +40 painoa)`,()=>{setPack(P.packLv+1);msg('Reppu kasvoi!','loot');});
  const det=$('#detail'),s=inv[selSlot];
  if(!s){det.innerHTML='<div class="s">Valitse esine. Kaksoisnapsautus tai hiiren oikea käyttää. Napsauta tyhjää paikkaa siirtääksesi valitun esineen.</div>';}
  else{const d=ITEMS[s.id];const q=s.q||1;let stat='';
    if(d.cat==='weapon')stat=`Vahinko ${weaponDmg({...d,q}).toFixed(0)} (${{slash:'viiltävä',blunt:'murskaava',pierce:'pistävä',fire:'tuli'}[d.dt]}) · kestävyys/isku ${d.st}`+(d.chop?' · kaataa puita':'')+(d.pick?' · louhii':'');
    if(d.cat==='bow')stat=`Vahinko jopa ${weaponDmg({...d,q}).toFixed(0)}`;
    if(d.cat==='shield')stat=`Torjuu ${Math.round(Math.min(.95,d.block*(1+.1*(q-1)))*100)} %`;
    if(d.cat==='shovel')stat='Tasoittaa maata · kestävyys/käyttö 6';
    if(d.cat==='offhand')stat='Toisen käden tarvike – voi pitää yhdessä aseen kanssa.';
    if(d.cat==='armor')stat=`Suoja ${(d.arm*(1+.2*(q-1))).toFixed(0)}${d.warm?' · lämmin':''}`;
    if(d.food)stat=`Kylläisyys +${d.food.h}${d.food.hp?` · terveys +${d.food.hp}`:''}${d.food.st?` · kestävyys +${d.food.st}`:''}`;
    const up=upgradeInfo(s);
    det.innerHTML=`<div class="t">${d.n}${q>1?` <span style="color:var(--frost)">★${q}</span>`:''}</div><div class="s">${d.d||''}${stat?`<br><b>${stat}</b>`:''}<br>Paino ${(d.w*s.n).toFixed(1)}</div><div class="btns"></div>`;
    const b=det.querySelector('.btns');
    if(d.food){const x=document.createElement('button');x.className='btn pri';x.textContent='Syö';x.onclick=()=>{eat(s);renderInv();};b.appendChild(x);}
    if(d.cat){const x=document.createElement('button');x.className='btn pri';x.textContent=s.eq?'Riisu':'Varusta';x.onclick=()=>{toggleEquip(s);renderInv();};b.appendChild(x);}
    if(up){const x=document.createElement('button');x.className='btn';x.textContent=`Paranna ★${q+1} (${reqText(up.req)})`;x.disabled=!up.ok;x.title=up.why||'';x.onclick=()=>{for(const [id,n] of Object.entries(up.req))invRemove(id,n);s.q=q+1;sfx('craft');msg(`${d.n} paranneltu tasolle ${q+1}.`,'loot');invDirty=true;renderInv();};b.appendChild(x);}
    if(s.id==='soihtu'&&(s.fuel??TORCH_T)<TORCH_T){const x=document.createElement('button');x.className='btn';x.textContent='Lisää pihkaa (+30 s)';x.disabled=invCount('pihka')<1;x.onclick=()=>{if(invCount('pihka')<1)return;invRemove('pihka',1);s.fuel=Math.min(TORCH_T,(s.fuel??0)+30);sfx('build');renderInv();};b.appendChild(x);}
    const dr=document.createElement('button');dr.className='btn';dr.textContent='Pudota';dr.onclick=()=>{inv[selSlot]=null;if(s.eq){s.eq=false;}spawnDrop(s.id,s.n,P.pos.x+Math.sin(P.yaw),P.pos.y+1,P.pos.z+Math.cos(P.yaw),s.q);invDirty=true;updateGear();selSlot=-1;renderInv();};b.appendChild(dr);}
  // crafting
  const st=nearStations();
  $('#stationLine').textContent='Lähellä: '+(Object.keys(st).map(k=>STATION_NAME[k]).join(', ')||'ei työpisteitä')+'. Uusia ohjeita aukeaa, kun löydät uusia aineita.';
  const cl=$('#craftList');cl.innerHTML='';
  const tabs=$('#craftTabs');tabs.innerHTML='';
  for(const [id,nm] of CRAFT_CATS){const b=document.createElement('button');b.className='tab'+(id===craftTab?' on':'');b.textContent=nm;b.onclick=()=>{craftTab=id;renderInv();};tabs.appendChild(b);}
  for(const r of RECIPES){const known=Object.keys(r.req).some(id=>flags.seen[id])||!r.st;if(!known)continue;
    if(craftTab==='alku'?!r.alku:recipeCat(r)!==craftTab)continue;
    const open=recipeOpen(r);
    const okSt=!r.st||st[r.st];const okMat=Object.entries(r.req).every(([id,n])=>invCount(id)>=n);
    const el=document.createElement('div');el.className='rec'+(okSt&&okMat&&open?'':' na');
    el.innerHTML=`<div class="ic" style="background-image:url(${icon(r.id)})"></div><div><div class="nm">${ITEMS[r.id].n}${r.n?` ×${r.n}`:''}</div><div class="rq">${Object.entries(r.req).map(([id,n])=>`<span class="${invCount(id)>=n?'':'miss'}">${n} ${ITEMS[id].n.toLowerCase()}</span>`).join(', ')}${r.st?` · <span class="${okSt?'':'miss'}">${STATION_NAME[r.st]}</span>`:''}${open?'':` · <span class="miss">Taso ${r.lvl}</span>`}</div></div>`;
    const b=document.createElement('button');b.className='btn pri';b.textContent=open?'Valmista':'Lukittu';b.disabled=!(okSt&&okMat&&open);b.onclick=()=>craft(r);el.appendChild(b);cl.appendChild(el);}
}
function upgradeInfo(s){const d=ITEMS[s.id];if(!d.cat||d.cat==='hammer')return null;const q=s.q||1;if(q>=3)return null;const r=RECIPE_BY[s.id];if(!r)return null;
  const req={};for(const [id,n] of Object.entries(r.req))req[id]=Math.ceil(n/2)*q;const st=r.st||'tyopenkki';const near=nearStations()[st];
  const ok=near&&Object.entries(req).every(([id,n])=>invCount(id)>=n);return{req,ok,why:near?'':`Tarvitset: ${STATION_NAME[st]}`};}
function craft(r){if(!recipeOpen(r))return;for(const [id,n] of Object.entries(r.req))invRemove(id,n);bump('crafted');xpFirst('c_'+r.id,6,'uusi esine');const left=invAdd(r.id,r.n||1);if(left)spawnDrop(r.id,left,P.pos.x,P.pos.y+1,P.pos.z);sfx('craft');msg(`Valmistit: ${ITEMS[r.id].n}`,'loot');
  if(ITEMS[r.id].cat&&!equipped(ITEMS[r.id].cat==='bow'||ITEMS[r.id].cat==='hammer'?'weapon':ITEMS[r.id].cat)){const s=inv.find(s=>s&&s.id===r.id&&!s.eq);if(s)toggleEquip(s);}
  invDirty=true;renderInv();}
let buildTab='alku';
const costChips=req=>Object.entries(req).map(([id,n])=>{const h=invCount(id);return `<span class="mat ${h>=n?'ok':'bad'}">${ITEMS[id].n} ${Math.min(h,999)}/${n}</span>`;}).join('');
function renderBuild(){const c=$('#buildCards');c.innerHTML='';const hasBench=!!nearPiece('tyopenkki',P.pos.x,P.pos.z,20);
  const tabs=$('#buildTabs');tabs.innerHTML='';
  for(const [id,nm] of BUILD_CATS){const b=document.createElement('button');b.className='tab'+(id===buildTab?' on':'');b.textContent=nm;b.onclick=()=>{buildTab=id;renderBuild();};tabs.appendChild(b);}
  for(const [t,d] of Object.entries(PIECES)){if(buildTab==='alku'?!d.alku:d.cat!==buildTab)continue;
    const okMat=Object.entries(d.req).every(([id,n])=>invCount(id)>=n);const okB=d.noBench||hasBench;
    const b=document.createElement('button');b.className='card'+(okMat&&okB?'':' na');b.innerHTML=`<div class="nm">${d.n}</div><div class="rq">${costChips(d.req)}</div>${okB?'':'<div class="rq"><span class="mat bad">tarvitsee työpenkin</span></div>'}`;
    // Oikealla napilla avattu valikko ei saa valita korttia heti (hiiri on vielä alhaalla).
    b.onclick=()=>{if(performance.now()-panelOpenedAt<400)return;setBuildSel(t);closePanels();};c.appendChild(b);}}
// Päivityspainike: näyttää hinnan (punainen = puuttuu) ja tekee päivityksen napsautuksesta.
function upBtn(el,cost,label,fn){if(!cost){el.innerHTML=`<div class="note">${label} on korkeimmalla tasollaan.</div>`;return;}
  el.innerHTML=`<button class="btn pri">${label}</button> <span class="rq">${costChips(cost)}</span>`;
  const ok=Object.entries(cost).every(([id,n])=>invCount(id)>=n);el.firstChild.disabled=!ok;el.firstChild.onclick=()=>{if(!Object.entries(cost).every(([id,n])=>invCount(id)>=n))return;for(const [id,n] of Object.entries(cost))invRemove(id,n);fn();sfx('craft');invDirty=true;};}
function openChest(p){togglePanel('chest');curChest=p;renderChest();}
function renderChest(){if(!curChest)return;const items=curChest.data.items;$('#chestTitle').textContent=PIECES[curChest.t].n+(curChest.data.lv?` (taso ${curChest.data.lv+1})`:'');
  upBtn($('#chestUp'),STORE_UP[(curChest.data.lv||0)+1],'Laajenna (+8 paikkaa)',()=>{curChest.data.lv=(curChest.data.lv||0)+1;while(items.length<storeSlots(curChest))items.push(null);msg('Säilytystila kasvoi.','loot');});
  $('#chestGrid').innerHTML=items.map(s=>slotHTML(s)).join('');$('#chestInv').innerHTML=inv.map(s=>slotHTML(s)).join('');
  [...$('#chestGrid').children].forEach((el,i)=>el.onclick=()=>{const s=items[i];if(!s)return;const left=invAdd(s.id,s.n,s.q||1);if(left===0)items[i]=null;else s.n=left;invDirty=true;renderChest();});
  [...$('#chestInv').children].forEach((el,i)=>el.onclick=()=>{const s=inv[i];if(!s)return;if(s.eq){s.eq=false;updateGear();}const j=items.findIndex(x=>!x);if(j<0)return;items[j]={id:s.id,n:s.n,q:s.q};inv[i]=null;invDirty=true;renderChest();});}

/* ---------------- MAP ---------------- */
const MAPW=HALF*2,MAPC=document.createElement('canvas');MAPC.width=MAPC.height=MAPW;
(function(){const g=MAPC.getContext('2d'),img=g.createImageData(MAPW,MAPW);
  for(let y=0;y<MAPW;y++)for(let x=0;x<MAPW;x++){const wx=x-HALF,wz=y-HALF,h=terrainH(wx,wz);let r,gg,b;
    if(h<0){const k=clamp(-h/14,0,1);r=lerp(70,28,k);gg=lerp(120,62,k);b=lerp(130,88,k);}
    else{const gx=Math.min(GN,Math.round((wx+HALF)/GS)),gz=Math.min(GN,Math.round((wz+HALF)/GS)),i=(gz*HN+gx)*3;r=terrainColors[i]*255;gg=terrainColors[i+1]*255;b=terrainColors[i+2]*255;const sh=clamp((terrainH(wx-1,wz-1)-h)*.12,-.25,.25);r*=1-sh;gg*=1-sh;b*=1-sh;}
    const o=(y*MAPW+x)*4;img.data[o]=r;img.data[o+1]=gg;img.data[o+2]=b;img.data[o+3]=255;}
  g.putImageData(img,0,0);})();
const FOGC=document.createElement('canvas');FOGC.width=FOGC.height=EXN;const fogG=FOGC.getContext('2d');
// Tuntematon alue on pilviverhon peitossa (läpinäkymätön), joten maastoa ei erota.
const FOGIMG=(function(){const im=fogG.createImageData(EXN,EXN);for(let y=0;y<EXN;y++)for(let x=0;x<EXN;x++){const v=18+fbm(x*.09+3,y*.09-7,4)*40,o=(y*EXN+x)*4;im.data[o]=v;im.data[o+1]=v*.97;im.data[o+2]=v*.93;im.data[o+3]=255;}return im;})();
function resetFog(){fogG.putImageData(FOGIMG,0,0);for(let i=0;i<explored.length;i++)if(explored[i])fogG.clearRect(i%EXN,(i/EXN)|0,1,1);}
function exploreTick(){if(P.inDun)return;const cx=Math.floor((P.pos.x+HALF)/4),cz=Math.floor((P.pos.z+HALF)/4);for(let z=cz-6;z<=cz+6;z++)for(let x=cx-6;x<=cx+6;x++){if(x<0||z<0||x>=EXN||z>=EXN)continue;if((x-cx)**2+(z-cz)**2>36)continue;const i=z*EXN+x;if(!explored[i]){explored[i]=1;fogG.clearRect(x,z,1,1);}}
  for(const k of ['ruinF','ruinM','ruinC','barrow','circle']){const L=LOC[k];if(!flags.disc[k]&&dist2(L.x,L.z,P.pos.x,P.pos.z)<30*30){flags.disc[k]=1;msg(`Löysit paikan: ${L.name}`,'loot');}}}
function mapMarkers(g,sx,ox,oz){
  const pt=(x,z)=>[(x+ox)*sx,(z+oz)*sx];
  for(const k in flags.disc){const L=LOC[k];if(!L)continue;const [x,y]=pt(L.x,L.z);g.fillStyle='#8fd8cf';g.save();g.translate(x,y);g.rotate(Math.PI/4);g.fillRect(-4,-4,8,8);g.restore();if(sx>1){g.fillStyle='#eee5d3';g.font='600 12px Alegreya Sans, sans-serif';g.fillText(L.name,x+8,y+4);}}
  for(const p of pieces)if(p.t==='tyopenkki'||p.t==='sanky'){const [x,y]=pt(p.x,p.z);g.fillStyle='#e8893b';g.fillRect(x-3,y-3,6,6);}
  // Pääkallo näkyy kunnes hautakasan tavarat on kerätty.
  for(const gr of graves){const [x,y]=pt(gr.x,gr.z),r=sx>1?8:6;g.save();g.translate(x,y);g.fillStyle='#f2ecdc';g.strokeStyle='#7a1a12';g.lineWidth=1.6;g.beginPath();g.arc(0,-r*.15,r*.8,0,TAU);g.fill();g.stroke();g.fillRect(-r*.45,r*.4,r*.9,r*.6);g.strokeRect(-r*.45,r*.4,r*.9,r*.6);g.fillStyle='#1a1410';g.beginPath();g.arc(-r*.33,-r*.2,r*.22,0,TAU);g.arc(r*.33,-r*.2,r*.22,0,TAU);g.fill();g.restore();}
}
function drawPlayerArrow(g,x,y,s){g.save();g.translate(x,y);g.rotate(-camYaw);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-s);g.lineTo(s*.7,s*.8);g.lineTo(0,s*.4);g.lineTo(-s*.7,s*.8);g.closePath();g.fill();g.stroke();g.restore();}
function drawBigMap(){const c=$('#bigmap'),g=c.getContext('2d'),S=c.width/MAPW;g.imageSmoothingEnabled=true;g.drawImage(MAPC,0,0,c.width,c.height);g.drawImage(FOGC,0,0,c.width,c.height);mapMarkers(g,S,HALF,HALF);if(!P.inDun)drawPlayerArrow(g,(P.pos.x+HALF)*S,(P.pos.z+HALF)*S,9);}
function drawMinimap(){const c=$('#mini'),g=c.getContext('2d'),W=c.width,R=60,S=W/(R*2);g.save();g.clearRect(0,0,W,W);g.beginPath();g.arc(W/2,W/2,W/2,0,TAU);g.clip();g.fillStyle='#1d1a16';g.fillRect(0,0,W,W);
  if(!P.inDun){const sx=P.pos.x+HALF-R,sz=P.pos.z+HALF-R;g.drawImage(MAPC,sx,sz,R*2,R*2,0,0,W,W);g.imageSmoothingEnabled=true;g.drawImage(FOGC,sx/4,sz/4,R*2/4,R*2/4,0,0,W,W);mapMarkers(g,S,-(P.pos.x-R),-(P.pos.z-R));
    for(const m of mobs){if(m.dead||m.dun)continue;const x=(m.pos.x-P.pos.x+R)*S,y=(m.pos.z-P.pos.z+R)*S;if(m.state==='chase'||m===boss){g.fillStyle=m===boss?'#8fd8cf':'#c8463b';g.beginPath();g.arc(x,y,m===boss?5:2.5,0,TAU);g.fill();}}}
  else{g.fillStyle='#a99d89';g.font='700 12px Alegreya Sans, sans-serif';g.textAlign='center';g.fillText('Hautakumpu',W/2,W/2+30);}
  drawPlayerArrow(g,W/2,W/2,7);g.restore();
  g.fillStyle='#eee5d3';g.font='800 11px Alegreya Sans, sans-serif';g.textAlign='center';g.fillText('P',W/2,12);}
