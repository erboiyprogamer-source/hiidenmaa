/* Hiidenmaa – save.js
   Tallennus ja lataus (localStorage + tallennuskoodi) */
'use strict';

/* ---------------- SAVE / LOAD ---------------- */
const SKEY='hiidenmaa_save_v1';
function serialize(){return{v:10,vdrops:drops.filter(d=>isValuable(d.id)).map(d=>({id:d.id,n:d.n,q:d.q})),mapId:MAP_ID,bossPending:!!(boss&&!boss.dead&&!flags.boss),playTime,dayT,dayN,weather,flags,P:{x:P.pos.x,y:P.pos.y,z:P.pos.z,hp:P.hp,stam:P.stam,hunger:P.hunger,buffs:P.buffs,spawn:P.spawn,deaths:P.deaths,kills:P.kills,inDun:P.inDun,realm:P.realm||null,packLv:P.packLv},cam:[camYaw,camPitch],inv,
  pieces:pieces.map(p=>({t:p.t,x:p.x,y:p.y,z:p.z,r:p.rot,f:p.f||0,hp:p.hp,d:PIECES[p.t].store?{items:p.data.items,lv:p.data.lv}:isFirePiece(p.t)?{fuel:p.data.fuel,burn:p.data.burn,cook:p.data.cook,full:p.data.full}:p.t==='soihtuteline'?{burn:p.data.burn,full:p.data.full}:p.t==='sulatin'?{ore:p.data.ore,iore:p.data.iore,wood:p.data.wood,done:p.data.done,idone:p.data.idone}:bt(p.t)==='ovi'?{open:p.data.open,dir:p.data.dir}:{}})),
  moved:nodes.filter(n=>n.x!==n.ox||n.z!==n.oz||n.s!==n.s0).map(n=>[n.id,+n.x.toFixed(2),+n.z.toFixed(2),+n.s.toFixed(2)]),
  terra:terraList(),mud:mudList(),
  planted:nodes.filter(n=>n.planted).map(n=>[n.type,+n.x.toFixed(2),+n.z.toFixed(2),+n.s.toFixed(2)]),
  nodes:nodes.filter(n=>!n.alive).map(n=>[n.id,Math.round(n.respawnAt-playTime)]),graves:graves.map(g=>({x:g.x,y:g.y,z:g.z,items:g.items,dim:g.dim})),dk:dunKilled,
  explored:btoa(String.fromCharCode.apply(null,packBits(explored)))};}
function packBits(a){const o=new Uint8Array(Math.ceil(a.length/8));for(let i=0;i<a.length;i++)if(a[i])o[i>>3]|=1<<(i&7);return Array.from(o);}
function saveGame(silent){try{localStorage.setItem(SKEY,JSON.stringify(serialize()));if(!silent)msg('Peli tallennettu.','loot');return true;}catch(e){if(!silent)msg('Tallennus selaimeen ei onnistunut. Käytä tallennuskoodia valikossa.','warn');return false;}}
function loadData(s){
  resetWorld();
  playTime=s.playTime||0;dayT=s.dayT??.3;dayN=s.dayN||1;weather=s.weather||weather;weather.until=Math.min(weather.until,playTime+300);
  flags=Object.assign({disc:{},runes:{},ruins:{},sarc:[0,0,0],boss:0,goal:0,won:0,seen:{},xp:0,cnt:{},ach:{},first:{}},s.flags||{});
  if(!flags.bio)flags.bio={meadow:1};zoneQuiet=true;  // v0.82: vanha tallennus – nykyinen alue merkitään löydetyksi ilman ilmoitusta
  // Versio < 3 on vanhasta, pienemmästä maailmasta: tavarat ja eteneminen säilyvät, rakennukset ja sijainti eivät.
  const oldWorld=(s.v||1)<3;
  const q=s.P;P.pos.set(q.x,q.y,q.z);P.hp=q.hp;P.stam=q.stam;P.hunger=q.hunger;P.buffs=q.buffs||{};P.spawn=q.spawn;P.deaths=q.deaths||0;P.kills=q.kills||0;P.inDun=false;
  if(q.inDun&&q.realm&&REALMS[q.realm]){P.inDun=false;P.realm=null;const F=portalFront(q.realm);P.pos.set(F.x,terrainH(F.x,F.z),F.z);}
  else if(q.inDun){P.inDun=false;const L=LOC.barrow;P.pos.set(L.x+12.5,terrainH(L.x+12.5,L.z),L.z);}
  if(oldWorld){P.pos.set(LOC.spawn.x,terrainH(LOC.spawn.x,LOC.spawn.z),LOC.spawn.z);P.spawn=null;}
  if(s.cam){camYaw=s.cam[0];camPitch=s.cam[1];}
  P.packLv=q.packLv||0;migrateProgress();inv=(s.inv||[]).slice(0,invN());while(inv.length<invN())inv.push(null);
  if(!oldWorld){
    applyTerra(s.terra||[]);applyMud(s.mud||[]);
    for(const p of s.pieces||[])addPiece(p.t,p.x,p.y,p.z,(s.v||1)<7?p.r*2:p.r,p.hp,p.d,p.f||0);
    for(const [t,x,z,sc] of s.planted||[])plantTree(t,x,z,sc);
    // v<5: maiseman solmujen numerointi muuttui (pensaat), joten kaadettujen lista ohitetaan.
    // v<9: biomit (v0.82) muuttivat maiseman solmujen numeroinnin → kaadettujen/siirrettyjen lista ohitetaan (puut ovat taas pystyssä).
    const nodesOk=(s.v||1)>=9;const byId=new Map(nodes.map(n=>[n.id,n]));for(const [id,x,z,sc] of nodesOk?s.moved||[]:[]){const n=byId.get(id);if(n)moveNode(n,x,z,sc);}
    for(const [id,left] of (nodesOk?s.nodes:null)||[]){const n=byId.get(id);if(n){killNode(n);n.respawnAt=playTime+left;}}
    for(const g of s.graves||[])makeGrave(g);}
  else{const all=[];for(const p of s.pieces||[])for(const [id,n] of Object.entries(PIECES[p.t]?PIECES[p.t].req:{}))all.push([id,n]);for(const g of s.graves||[])for(const it of g.items||[])if(it)all.push([it.id,it.n]);
    for(const [id,n] of all)invAdd(id,n);setTimeout(()=>msg('Maailma on kasvanut! Vanhat rakennuksesi palautettiin tarvikkeina reppuun.','warn'),600);}
  Object.assign(dunKilled,s.dk||{});
  if(s.explored&&!oldWorld){const b=atob(s.explored);for(let i=0;i<explored.length;i++)explored[i]=(b.charCodeAt(i>>3)>>(i&7))&1;}
  for(let i=0;i<3;i++)if(flags.sarc[i]){sarcs[i].lid.position.x=.7;sarcs[i].lid.rotation.z=.3;}
  if(s.bossPending)invAdd(s.v>=10?'kruunusirpale':'hiidenkivi',3);
  if(!flags.wl)planLoot(true);for(const d of s.vdrops||[])if(ITEMS[d.id])relocateValuable(d.id,d.n,d.q);   // v1.34: arvoesineiden suunnitelma ja maassa olleet arvoesineet arkkuun
  resetFog();invDirty=true;updateGear();goalShown=-1;syncAltar();ensureCamps();
}
function resetWorld(){
  for(const p of [...pieces])removePiece(p);for(const m of [...mobs])mobRemove(m);for(const d of [...drops])removeDrop(d);drops=[];for(const g of [...graves])removeGrave(g);graves=[];
  clearLogs();unplantAll();resetTerra();for(const n of nodes)restoreNode(n);for(const k in dunKilled)delete dunKilled[k];resetRealms();for(const m of [...mobs])mobRemove(m);explored.fill(0);
  for(const p of projs)scene.remove(p.m);projs.length=0;
  circleStones.forEach(r=>r.material=new THREE.MeshBasicMaterial({color:0x2a3a39}));sarcs.forEach(s=>{s.lid.position.x=0;s.lid.rotation.z=0;});
  $('#bossbar').hidden=true;
}
function newGame(){
  resetWorld();playTime=0;dayT=.28;dayN=1;weather={cur:'selkea',until:240};flags={disc:{},runes:{},ruins:{},sarc:[0,0,0],boss:0,goal:0,won:0,seen:{},xp:0,cnt:{},ach:{},first:{},gv:3,bio:{meadow:1}};zoneQuiet=true;
  P.packLv=0;recalcBon();inv=new Array(32).fill(null);P.pos.set(LOC.spawn.x,terrainH(LOC.spawn.x,LOC.spawn.z),LOC.spawn.z);P.hp=maxHp();P.stam=100;P.hunger=80;P.buffs={};P.spawn=null;P.deaths=0;P.kills=0;P.inDun=false;P.realm=null;P.spawnProt=0;P.dead=false;P.heal=0;P.wetT=0;
  camYaw=Math.PI*1.1;camPitch=.3;P.yaw=camYaw+Math.PI;fig.g.rotation.x=0;resetFog();invDirty=true;updateGear();goalShown=-1;planLoot(false);
  // start with a few mobs around
  ensureCamps();   // v0.99 hylätyt leirit
  for(let i=0;i<3;i++){const a=i*2.1,d=30+i*6;spawnMob('peura',LOC.spawn.x+Math.cos(a)*d,LOC.spawn.z+Math.sin(a)*d);}
  setTimeout(()=>{msg('Rannalla seisoo riimukivi. Lue se (E).');},800);
}

/* ---------------- TALLENNUSKOODI (pakattu) ---------------- */
// Muoto "HM2:" + base64(deflate-raw(JSON)) – tyypillisesti 5–10× lyhyempi kuin pelkkä base64. Vanha muoto (pelkkä base64-JSON) latautuu edelleen.
async function packSave(obj){const txt=JSON.stringify(obj);
  try{if(typeof CompressionStream==='function'){const cs=new Blob([txt]).stream().pipeThrough(new CompressionStream('deflate-raw'));const buf=new Uint8Array(await new Response(cs).arrayBuffer());let s='';for(let i=0;i<buf.length;i+=0x8000)s+=String.fromCharCode.apply(null,buf.subarray(i,i+0x8000));return 'HM2:'+btoa(s);}}catch(e){}
  return btoa(unescape(encodeURIComponent(txt)));}
async function unpackSave(code){code=code.trim().replace(/\s+/g,'');
  if(code.startsWith('HM2:')){const bin=atob(code.slice(4)),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    const ds=new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'));return JSON.parse(await new Response(ds).text());}
  return JSON.parse(decodeURIComponent(escape(atob(code))));}
function wireSaveIO(){const msgEl=$('#ioMsg'),say=t=>{msgEl.textContent=t;};
  const make=async()=>{const c=await packSave(serialize());$('#saveCode').value=c;return c;};
  $('#bExport').onclick=async()=>{if(!started){say('Aloita tai jatka peliä ensin.');return;}const c=await make();say(`Koodi luotu (${c.length} merkkiä).`);};
  $('#bCopy').onclick=async()=>{if(!started&&!$('#saveCode').value){say('Aloita tai jatka peliä ensin.');return;}const t=$('#saveCode');const c=t.value||await make();navigator.clipboard.writeText(c).then(()=>say('Kopioitu leikepöydälle.')).catch(()=>{t.select();say('Valittu – kopioi Ctrl+C:llä.');});};
  $('#bImport').onclick=async()=>{try{const s=await unpackSave($('#saveCode').value);playSave(s,'Peli ladattu koodista.');}catch(e){say('Koodi ei kelpaa.');}};
  $('#bDownload').onclick=async()=>{if(!started){say('Aloita tai jatka peliä ensin.');return;}const c=await make();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([c],{type:'text/plain'}));
    a.download=`hiidenmaa_paiva${dayN}_${new Date().toISOString().slice(0,10)}.txt`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);say('Tiedosto ladattu (tallennus: päivä '+dayN+').');};
  $('#fUpload').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const s=await unpackSave(await f.text());playSave(s,'Peli ladattu tiedostosta.');}catch(err){say('Tiedosto ei kelpaa tallenteeksi.');}e.target.value='';};}
