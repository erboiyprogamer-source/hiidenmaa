/* Hiidenmaa – save.js
   Tallennus ja lataus (localStorage + tallennuskoodi) */
'use strict';

/* ---------------- SAVE / LOAD ---------------- */
const SKEY='hiidenmaa_save_v1';
function serialize(){return{v:8,mapId:MAP_ID,bossPending:!!(boss&&!boss.dead&&!flags.boss),playTime,dayT,dayN,weather,flags,P:{x:P.pos.x,y:P.pos.y,z:P.pos.z,hp:P.hp,stam:P.stam,hunger:P.hunger,buffs:P.buffs,spawn:P.spawn,deaths:P.deaths,kills:P.kills,inDun:P.inDun,packLv:P.packLv},cam:[camYaw,camPitch],inv,
  pieces:pieces.map(p=>({t:p.t,x:p.x,y:p.y,z:p.z,r:p.rot,f:p.f||0,hp:p.hp,d:PIECES[p.t].store?{items:p.data.items,lv:p.data.lv}:p.t==='nuotio'?{fuel:p.data.fuel}:p.t==='sulatin'?{ore:p.data.ore,iore:p.data.iore,wood:p.data.wood,done:p.data.done,idone:p.data.idone}:bt(p.t)==='ovi'?{open:p.data.open,dir:p.data.dir}:{}})),
  moved:nodes.filter(n=>n.x!==n.ox||n.z!==n.oz||n.s!==n.s0).map(n=>[n.id,+n.x.toFixed(2),+n.z.toFixed(2),+n.s.toFixed(2)]),
  terra:terraList(),
  planted:nodes.filter(n=>n.planted).map(n=>[n.type,+n.x.toFixed(2),+n.z.toFixed(2),+n.s.toFixed(2)]),
  nodes:nodes.filter(n=>!n.alive).map(n=>[n.id,Math.round(n.respawnAt-playTime)]),graves:graves.map(g=>({x:g.x,y:g.y,z:g.z,items:g.items})),dk:dunKilled,
  explored:btoa(String.fromCharCode.apply(null,packBits(explored)))};}
function packBits(a){const o=new Uint8Array(Math.ceil(a.length/8));for(let i=0;i<a.length;i++)if(a[i])o[i>>3]|=1<<(i&7);return Array.from(o);}
function saveGame(silent){try{localStorage.setItem(SKEY,JSON.stringify(serialize()));if(!silent)msg('Peli tallennettu.','loot');return true;}catch(e){if(!silent)msg('Tallennus selaimeen ei onnistunut. Käytä tallennuskoodia valikossa.','warn');return false;}}
function loadData(s){
  resetWorld();
  playTime=s.playTime||0;dayT=s.dayT??.3;dayN=s.dayN||1;weather=s.weather||weather;weather.until=Math.min(weather.until,playTime+300);
  flags=Object.assign({disc:{},runes:{},ruins:{},sarc:[0,0,0],boss:0,goal:0,won:0,seen:{}},s.flags||{});
  // Versio < 3 on vanhasta, pienemmästä maailmasta: tavarat ja eteneminen säilyvät, rakennukset ja sijainti eivät.
  const oldWorld=(s.v||1)<3;
  const q=s.P;P.pos.set(q.x,q.y,q.z);P.hp=q.hp;P.stam=q.stam;P.hunger=q.hunger;P.buffs=q.buffs||{};P.spawn=q.spawn;P.deaths=q.deaths||0;P.kills=q.kills||0;P.inDun=false;
  if(q.inDun){P.inDun=false;const L=LOC.barrow;P.pos.set(L.x+12.5,terrainH(L.x+12.5,L.z),L.z);}
  if(oldWorld){P.pos.set(LOC.spawn.x,terrainH(LOC.spawn.x,LOC.spawn.z),LOC.spawn.z);P.spawn=null;}
  if(s.cam){camYaw=s.cam[0];camPitch=s.cam[1];}
  P.packLv=q.packLv||0;MAXW=160+40*P.packLv;inv=(s.inv||[]).slice(0,invN());while(inv.length<invN())inv.push(null);
  if(!oldWorld){
    applyTerra(s.terra||[]);
    for(const p of s.pieces||[])addPiece(p.t,p.x,p.y,p.z,(s.v||1)<7?p.r*2:p.r,p.hp,p.d,p.f||0);
    for(const [t,x,z,sc] of s.planted||[])plantTree(t,x,z,sc);
    // v<5: maiseman solmujen numerointi muuttui (pensaat), joten kaadettujen lista ohitetaan.
    const byId=new Map(nodes.map(n=>[n.id,n]));for(const [id,x,z,sc] of s.moved||[]){const n=byId.get(id);if(n)moveNode(n,x,z,sc);}
    for(const [id,left] of (s.v>=5?s.nodes:null)||[]){const n=byId.get(id);if(n){killNode(n);n.respawnAt=playTime+left;}}
    for(const g of s.graves||[])makeGrave(g);}
  else{const all=[];for(const p of s.pieces||[])for(const [id,n] of Object.entries(PIECES[p.t]?PIECES[p.t].req:{}))all.push([id,n]);for(const g of s.graves||[])for(const it of g.items||[])if(it)all.push([it.id,it.n]);
    for(const [id,n] of all)invAdd(id,n);setTimeout(()=>msg('Maailma on kasvanut! Vanhat rakennuksesi palautettiin tarvikkeina reppuun.','warn'),600);}
  Object.assign(dunKilled,s.dk||{});
  if(s.explored&&!oldWorld){const b=atob(s.explored);for(let i=0;i<explored.length;i++)explored[i]=(b.charCodeAt(i>>3)>>(i&7))&1;}
  for(let i=0;i<3;i++)if(flags.sarc[i]){sarcs[i].lid.position.x=.7;sarcs[i].lid.rotation.z=.3;}
  if(s.bossPending)invAdd('hiidenkivi',3);
  resetFog();invDirty=true;updateGear();goalShown=-1;
}
function resetWorld(){
  for(const p of [...pieces])removePiece(p);for(const m of [...mobs])mobRemove(m);for(const d of drops)scene.remove(d.mesh);drops=[];for(const g of graves)scene.remove(g.mesh);graves=[];
  clearLogs();unplantAll();resetTerra();for(const n of nodes)restoreNode(n);for(const k in dunKilled)delete dunKilled[k];explored.fill(0);
  for(const p of projs)scene.remove(p.m);projs.length=0;
  circleStones.forEach(r=>r.material=new THREE.MeshBasicMaterial({color:0x2a3a39}));sarcs.forEach(s=>{s.lid.position.x=0;s.lid.rotation.z=0;});
  $('#bossbar').hidden=true;
}
function newGame(){
  resetWorld();playTime=0;dayT=.28;dayN=1;weather={cur:'selkea',until:240};flags={disc:{},runes:{},ruins:{},sarc:[0,0,0],boss:0,goal:0,won:0,seen:{}};
  P.packLv=0;MAXW=160;inv=new Array(32).fill(null);P.pos.set(LOC.spawn.x,terrainH(LOC.spawn.x,LOC.spawn.z),LOC.spawn.z);P.hp=60;P.stam=100;P.hunger=80;P.buffs={};P.spawn=null;P.deaths=0;P.kills=0;P.inDun=false;P.dead=false;P.heal=0;P.wetT=0;
  camYaw=Math.PI*1.1;camPitch=.3;P.yaw=camYaw+Math.PI;fig.g.rotation.x=0;resetFog();invDirty=true;updateGear();goalShown=-1;
  // start with a few mobs around
  for(let i=0;i<3;i++){const a=i*2.1,d=30+i*6;spawnMob('peura',LOC.spawn.x+Math.cos(a)*d,LOC.spawn.z+Math.sin(a)*d);}
  setTimeout(()=>{msg('Rannalla seisoo riimukivi. Lue se (E).');},800);
}
