/* Hiidenmaa – ui.js
   HUD, viestit, paneelit (reppu, valmistus, rakennus, arkku), kartta, tavoitteet */
'use strict';

/* ---------------- UI ---------------- */
const msgEls=[];
function msg(t,cls=''){const el=$('#msgs');const d=document.createElement('div');d.textContent=t;if(cls)d.className=cls;el.appendChild(d);d._life=4.5;msgEls.push(d);while(msgEls.length>7){const o=msgEls.shift();o.remove();}}
function updateMsgs(dt){for(let i=msgEls.length-1;i>=0;i--){const d=msgEls[i];d._life-=dt;if(d._life<1)d.style.opacity=Math.max(0,d._life);if(d._life<=0){d.remove();msgEls.splice(i,1);}}}
const floaters=[];
function floatText(t,x,y,z,color){const el=document.createElement('div');el.className='floater';el.textContent=t;el.style.color=color||'#eee';$('#floaters').appendChild(el);floaters.push({el,p:new V3(x,y,z),t:0});if(floaters.length>24){const o=floaters.shift();o.el.remove();}}
function updateFloaters(dt){for(let i=floaters.length-1;i>=0;i--){const f=floaters[i];f.t+=dt;f.p.y+=dt*1.2;_tmpV.copy(f.p).project(camera);if(_tmpV.z>1||f.t>1){f.el.remove();floaters.splice(i,1);continue;}f.el.style.left=((_tmpV.x+1)/2*innerWidth)+'px';f.el.style.top=((1-_tmpV.y)/2*innerHeight)+'px';f.el.style.opacity=1-f.t;}}
const mobBars=[];for(let i=0;i<8;i++){const d=document.createElement('div');d.className='mobbar';d.innerHTML='<i></i><span></span>';d.hidden=true;$('#floaters').appendChild(d);mobBars.push(d);}
function updateMobBars(){let k=0;for(const m of mobs){if(k>=mobBars.length)break;if(m.dead||m===boss||m.dun!==P.inDun)continue;const recent=playTime-m.hurtT<6;const near=dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z)<14*14&&(m.state==='chase');if(!recent&&!near)continue;_tmpV.set(m.pos.x,m.pos.y+(m.def.r*2.8+.8),m.pos.z).project(camera);if(_tmpV.z>1||Math.abs(_tmpV.x)>1.1||Math.abs(_tmpV.y)>1.1)continue;const b=mobBars[k++];b.hidden=false;b.style.left=((_tmpV.x+1)/2*innerWidth)+'px';b.style.top=((1-_tmpV.y)/2*innerHeight)+'px';b.firstChild.style.width=(m.hp/m.maxHp*100)+'%';b.lastChild.textContent=m.def.n;}for(;k<mobBars.length;k++)mobBars[k].hidden=true;}
function slotHTML(s,key){if(!s)return `<div class="slot">${key?`<span class="k">${key}</span>`:''}</div>`;const d=ITEMS[s.id];return `<div class="slot${s.eq?' eq':''}" style="background-image:url(${icon(s.id)})" title="${d.n}">${key?`<span class="k">${key}</span>`:''}${(s.q||1)>1?`<span class="q">★${s.q}</span>`:''}${s.n>1?`<span class="n">${s.n}</span>`:''}</div>`;}
let hudT=0;
function updateHUD(dt){
  hudT-=dt;updateMsgs(dt);updateFloaters(dt);updateMobBars();
  $('#hurt').style.opacity=Math.min(1,P.hurtFlash*1.5+(P.hp<maxHp()*.25&&!P.dead?.35:0));
  // prompt
  $('#cross').className=P.drawing?'aim':'';
  if(hudT>0)return;hudT=.1;
  const w=curWeapon();
  if(w.cat==='hammer'){const bh=$('#buildhint');bh.hidden=false;const h=buildSel?`<b>${PIECES[buildSel].n}</b> · ${reqText(PIECES[buildSel].req)} · <span class="kb">Hiiri V</span>rakenna <span class="kb">R</span>käännä 45° <span class="kb">G</span>kohdistus: ${SNAP_NAMES[snapMode]} <span class="kb">X</span>pura <span class="kb">F</span>korjaa <span class="kb">B</span>valikko`+(ghost&&ghost.visible&&!ghostOk&&lastInvalid?` · <span style="color:var(--bad)">${lastInvalid}</span>`:''):`<span class="kb">B</span> tai hiiren oikea: valitse rakennus`;if(bh._h!==h){bh._h=h;bh.innerHTML=h;}}else $('#buildhint').hidden=true;
  $('#lockhint').hidden=!(state==='play'&&!locked&&!lockFailed&&!P.dead);
  const hp=$('.bar.hp'),st=$('.bar.st'),hu=$('.bar.hu');
  hp.firstChild.style.width=(P.hp/maxHp()*100)+'%';hp.lastChild.textContent=`TERVEYS ${Math.ceil(P.hp)}/${maxHp()}`;hp.classList.toggle('low',P.hp<maxHp()*.25);
  st.firstChild.style.width=(P.stam/maxStam()*100)+'%';st.lastChild.textContent=`KESTÄVYYS ${Math.floor(P.stam)}`;
  hu.firstChild.style.width=P.hunger+'%';hu.lastChild.textContent=`KYLLÄISYYS ${Math.floor(P.hunger)}`;hu.classList.toggle('low',P.hunger<15);
  const wt=invWeight();const we=$('#weight');we.textContent=`Paino ${wt.toFixed(0)}/${MAXW}`;we.classList.toggle('over',wt>MAXW);
  const t=lookTarget,pr=$('#prompt');
  if(t&&!P.dead){const l=t.kind==='it'?t.it.label():t.label;pr.innerHTML=`<kbd>E</kbd>${l}`;}else pr.innerHTML='';
  // status chips
  const ch=[];
  if(P.crouch)ch.push(['Hiipii','neu']);if(shelterCache&&!P.inDun)ch.push(['Suojassa','neu']);if(fireCache)ch.push(['Lämmin','good']);
  if(P.buffs.levannyt)ch.push([`Levännyt ${Math.ceil(P.buffs.levannyt/60)} min`,'good']);
  if(P.buffs.voima)ch.push([`Voimistunut ${Math.ceil(P.buffs.voima/60)} min`,'good']);
  if(P.wetT>0)ch.push(['Märkä','bad']);if(P.cold)ch.push(['Kylmä','bad']);if(P.hunger<=0)ch.push(['Nälkä','bad']);
  if(P.buffs.pahoinvointi)ch.push(['Pahoinvointi','bad']);if(wt>MAXW)ch.push(['Ylikuormitus','bad']);if(P.restT>0&&!P.buffs.levannyt)ch.push([`Lepää… ${Math.ceil(12-P.restT)} s`,'neu']);
  $('#status').innerHTML=ch.map(([t,c])=>`<div class="chip ${c}"><b></b>${t}</div>`).join('');
  // clock
  const hh=Math.floor(dayT*24),mm=Math.floor((dayT*24-hh)*60/10)*10;$('#clock').innerHTML=`Päivä ${dayN} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} <span>· ${P.inDun?'Hautakumpu':WEATHERS[weather.cur].n}</span>`;
  if(invDirty){invDirty=false;$('#hotbar').innerHTML=inv.slice(0,8).map((s,i)=>slotHTML(s,i+1)).join('');if(openPanel==='inv')renderInv();if(openPanel==='chest')renderChest();if(openPanel==='build')renderBuild();}
  if(boss&&!boss.dead){$('#bossbar i').style.width=(boss.hp/boss.maxHp*100)+'%';}
  drawMinimap();
}
let openPanel=null,selSlot=-1,curChest=null;
function togglePanel(name){if(openPanel===name){closePanels();return;}closePanels(true);openPanel=name;state='ui';releaseLock();mouseL=false;mouseR=false;P.drawing=false;
  if(name==='inv'){$('#inv').hidden=false;renderInv();}if(name==='build'){$('#build').hidden=false;renderBuild();}if(name==='map'){$('#mapP').hidden=false;drawBigMap();}if(name==='chest')$('#chest').hidden=false;}
function closePanels(keep,skipLock){if(openPanel)panelClosedAt=performance.now();for(const id of ['#inv','#build','#mapP','#chest'])$(id).hidden=true;openPanel=null;curChest=null;selSlot=-1;if(!keep){state='play';if(!skipLock)requestLock();}}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closePanels()));
function nearStations(){const s={};for(const p of pieces){if(['tyopenkki','nuotio','ahjo'].includes(p.t)&&dist2(p.x,p.z,P.pos.x,P.pos.z)<(p.t==='nuotio'?4:8)**2&&!P.inDun){if(p.t==='nuotio'&&p.data.fuel<=0)continue;s[p.t]=1;}}return s;}
function renderInv(){
  const g=$('#invGrid');g.innerHTML=inv.map((s,i)=>slotHTML(s,i<8?i+1:'')).join('');
  [...g.children].forEach((el,i)=>{el.classList.toggle('sel',i===selSlot);el.onclick=e=>{if(selSlot>=0&&selSlot!==i&&e.shiftKey===false&&inv[selSlot]&&!inv[i]){inv[i]=inv[selSlot];inv[selSlot]=null;selSlot=i;invDirty=true;renderInv();return;}selSlot=i;renderInv();};el.ondblclick=()=>{useSlot(i);renderInv();};el.oncontextmenu=e=>{e.preventDefault();if(inv[i]){useSlot(i);renderInv();}};});
  $('#invW').textContent=`Paino ${invWeight().toFixed(0)} / ${MAXW}`;
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
    const dr=document.createElement('button');dr.className='btn';dr.textContent='Pudota';dr.onclick=()=>{inv[selSlot]=null;if(s.eq){s.eq=false;}spawnDrop(s.id,s.n,P.pos.x+Math.sin(P.yaw),P.pos.y+1,P.pos.z+Math.cos(P.yaw),s.q);invDirty=true;updateGear();selSlot=-1;renderInv();};b.appendChild(dr);}
  // crafting
  const st=nearStations();
  $('#stationLine').textContent='Lähellä: '+(Object.keys(st).map(k=>STATION_NAME[k]).join(', ')||'ei työpisteitä')+'. Uusia ohjeita aukeaa, kun löydät uusia aineita.';
  const cl=$('#craftList');cl.innerHTML='';
  for(const r of RECIPES){const known=Object.keys(r.req).some(id=>flags.seen[id])||!r.st;if(!known)continue;
    const okSt=!r.st||st[r.st];const okMat=Object.entries(r.req).every(([id,n])=>invCount(id)>=n);
    const el=document.createElement('div');el.className='rec'+(okSt&&okMat?'':' na');
    el.innerHTML=`<div class="ic" style="background-image:url(${icon(r.id)})"></div><div><div class="nm">${ITEMS[r.id].n}${r.n?` ×${r.n}`:''}</div><div class="rq">${Object.entries(r.req).map(([id,n])=>`<span class="${invCount(id)>=n?'':'miss'}">${n} ${ITEMS[id].n.toLowerCase()}</span>`).join(', ')}${r.st?` · <span class="${okSt?'':'miss'}">${STATION_NAME[r.st]}</span>`:''}</div></div>`;
    const b=document.createElement('button');b.className='btn pri';b.textContent='Valmista';b.disabled=!(okSt&&okMat);b.onclick=()=>craft(r);el.appendChild(b);cl.appendChild(el);}
}
function upgradeInfo(s){const d=ITEMS[s.id];if(!d.cat||d.cat==='hammer')return null;const q=s.q||1;if(q>=3)return null;const r=RECIPE_BY[s.id];if(!r)return null;
  const req={};for(const [id,n] of Object.entries(r.req))req[id]=Math.ceil(n/2)*q;const st=r.st||'tyopenkki';const near=nearStations()[st];
  const ok=near&&Object.entries(req).every(([id,n])=>invCount(id)>=n);return{req,ok,why:near?'':`Tarvitset: ${STATION_NAME[st]}`};}
function craft(r){for(const [id,n] of Object.entries(r.req))invRemove(id,n);const left=invAdd(r.id,r.n||1);if(left)spawnDrop(r.id,left,P.pos.x,P.pos.y+1,P.pos.z);sfx('craft');msg(`Valmistit: ${ITEMS[r.id].n}`,'loot');
  if(ITEMS[r.id].cat&&!equipped(ITEMS[r.id].cat==='bow'||ITEMS[r.id].cat==='hammer'?'weapon':ITEMS[r.id].cat)){const s=inv.find(s=>s&&s.id===r.id&&!s.eq);if(s)toggleEquip(s);}
  invDirty=true;renderInv();}
function renderBuild(){const c=$('#buildCards');c.innerHTML='';const hasBench=!!nearPiece('tyopenkki',P.pos.x,P.pos.z,20);
  for(const [t,d] of Object.entries(PIECES)){const okMat=Object.entries(d.req).every(([id,n])=>invCount(id)>=n);const okB=d.noBench||hasBench;
    const b=document.createElement('button');b.className='card'+(okMat&&okB?'':' na');b.innerHTML=`<div class="tag">${d.tag}</div><div class="nm">${d.n}</div><div class="rq">${reqText(d.req)}${okB?'':' · tarvitsee työpenkin'}</div>`;
    b.onclick=()=>{setBuildSel(t);closePanels();};c.appendChild(b);}}
function openChest(p){togglePanel('chest');curChest=p;renderChest();}
function renderChest(){if(!curChest)return;const items=curChest.data.items;
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
  for(const gr of graves){const [x,y]=pt(gr.x,gr.z);g.strokeStyle='#c8463b';g.lineWidth=2.5;g.beginPath();g.moveTo(x-5,y);g.lineTo(x+5,y);g.moveTo(x,y-5);g.lineTo(x,y+5);g.stroke();}
}
function drawPlayerArrow(g,x,y,s){g.save();g.translate(x,y);g.rotate(-camYaw);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-s);g.lineTo(s*.7,s*.8);g.lineTo(0,s*.4);g.lineTo(-s*.7,s*.8);g.closePath();g.fill();g.stroke();g.restore();}
function drawBigMap(){const c=$('#bigmap'),g=c.getContext('2d'),S=c.width/MAPW;g.imageSmoothingEnabled=true;g.drawImage(MAPC,0,0,c.width,c.height);g.drawImage(FOGC,0,0,c.width,c.height);mapMarkers(g,S,HALF,HALF);if(!P.inDun)drawPlayerArrow(g,(P.pos.x+HALF)*S,(P.pos.z+HALF)*S,9);}
function drawMinimap(){const c=$('#mini'),g=c.getContext('2d'),W=c.width,R=60,S=W/(R*2);g.save();g.clearRect(0,0,W,W);g.beginPath();g.arc(W/2,W/2,W/2,0,TAU);g.clip();g.fillStyle='#1d1a16';g.fillRect(0,0,W,W);
  if(!P.inDun){const sx=P.pos.x+HALF-R,sz=P.pos.z+HALF-R;g.drawImage(MAPC,sx,sz,R*2,R*2,0,0,W,W);g.imageSmoothingEnabled=true;g.drawImage(FOGC,sx/4,sz/4,R*2/4,R*2/4,0,0,W,W);mapMarkers(g,S,-(P.pos.x-R),-(P.pos.z-R));
    for(const m of mobs){if(m.dead||m.dun)continue;const x=(m.pos.x-P.pos.x+R)*S,y=(m.pos.z-P.pos.z+R)*S;if(m.state==='chase'||m===boss){g.fillStyle=m===boss?'#8fd8cf':'#c8463b';g.beginPath();g.arc(x,y,m===boss?5:2.5,0,TAU);g.fill();}}}
  else{g.fillStyle='#a99d89';g.font='700 12px Alegreya Sans, sans-serif';g.textAlign='center';g.fillText('Hautakumpu',W/2,W/2+30);}
  drawPlayerArrow(g,W/2,W/2,7);g.restore();
  g.fillStyle='#eee5d3';g.font='800 11px Alegreya Sans, sans-serif';g.textAlign='center';g.fillText('P',W/2,12);}

/* ---------------- GOALS ---------------- */
const GOALS=[
  {t:'Poimi oksia ja kiviä',d:'Kävele niiden luo ja paina E. Tarvitset 3 puuta ja 2 kiveä.',ok:()=>invCount('puu')>=3&&invCount('kivi')>=2||invCount('kirves')},
  {t:'Valmista kivikirves',d:'Avaa reppu Tab-näppäimellä ja valmista kirves.',ok:()=>invCount('kirves')||invCount('kuparikirves')},
  {t:'Kaada puita ja tee vasara',d:'Kaada puita kirveellä. Valmista vasara ja rakenna työpenkki (10 puuta).',ok:()=>pieces.some(p=>p.t==='tyopenkki')},
  {t:'Rakenna suoja ja nuotio',d:'Seinät, katto ja nuotio sisälle. Lepää tulen ääressä katon alla saadaksesi Levännyt-tilan.',ok:()=>pieces.some(p=>p.t==='nuotio')&&pieces.some(p=>p.t==='katto')},
  {t:'Metsästä ja paista lihaa',d:'Peurat pakenevat – hiivi lähelle tai käytä keihästä tai jousta. Paista liha nuotiolla.',ok:()=>invCount('paisti')||invCount('varras')||flags.ate},
  {t:'Etsi kuparia',d:'Valmista piikivihakku työpenkillä (piikiveä löytyy rannoilta) ja louhi oransseja kupariesiintymiä metsissä ja vuorten juurella.',ok:()=>invCount('malmi')||invCount('kupari')||pieces.some(p=>p.t==='ahjo')},
  {t:'Sulata ja takoa',d:'Rakenna sulatusuuni, sulata malmi kupariksi ja rakenna ahjo.',ok:()=>pieces.some(p=>p.t==='ahjo')},
  {t:'Varustaudu',d:'Takoa kuparimiekka tai kuparipanssari ahjolla. Nuija on hyvä kalmoja vastaan.',ok:()=>invCount('miekka')||invCount('kuparipanssari')||invCount('kuparikilpi')},
  {t:'Hae kolme hiidenkiveä',d:'Hautakumpu on lounaassa kalmanummella. Ota soihtu mukaan.',ok:()=>invCount('hiidenkivi')>=3||boss||flags.boss},
  {t:'Herätä Kalmanvartija',d:'Kalmankehä on nummen eteläreunalla. Aseta kivet alttarille ja voita vartija.',ok:()=>flags.boss},
  {t:'Hiidenmaa on vapaa',d:'Jatka rakentamista ja tutkimista omaan tahtiisi.',ok:()=>false},
];
let goalShown=-1;
function updateGoals(){while(flags.goal<GOALS.length-1&&GOALS[flags.goal].ok()){flags.goal++;if(flags.goal>0){msg('Tavoite saavutettu!','loot');sfx('craft');}}
  if(goalShown!==flags.goal){goalShown=flags.goal;const g=GOALS[flags.goal];$('#goalT').textContent=g.t;$('#goalD').textContent=g.d;if(flags.goal===8){flags.disc.barrow=1;}if(flags.goal===9)flags.disc.circle=1;}}
