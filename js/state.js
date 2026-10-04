/* Hiidenmaa – state.js
   Pelin tila (P, inv, flags), pelaajahahmo, reppu, maahan pudonneet esineet, partikkelit, ammukset */
'use strict';

/* ---------------- GAME STATE ---------------- */
const P={pos:new V3(LOC.spawn.x,terrainH(LOC.spawn.x,LOC.spawn.z),LOC.spawn.z),vy:0,yaw:Math.PI,onGround:true,hp:60,stam:100,hunger:80,stamDelay:0,atk:null,blocking:false,bowDraw:0,drawing:false,heal:0,buffs:{},wetT:0,restT:0,inWater:false,dead:false,invul:0,stagger:0,walkPh:0,spawn:null,deaths:0,kills:0,hurtFlash:0,inDun:false,crouch:false,crouchK:0,packLv:0,fx:{speed:1,dmg:1,stamRegen:1,hpRegen:1},crampT:0};
let inv=new Array(32).fill(null);
// Käsisoihtu: palaa yhteensä 60 s (juostessa 20 % nopeammin), sammuu sateessa, syttyy toisen liekin vieressä. Tila tallentuu esineeseen (fuel, lit).
const TORCH_T=60;
function torchSlot(){const s=equipped('offhand');return s&&s.id==='soihtu'?s:null;}
function torchLit(){const s=torchSlot();return !!s&&s.lit!==false&&(s.fuel??TORCH_T)>0;}
let playTime=0, dayT=.3, dayN=1, weather={cur:'selkea',until:200}, flags={disc:{},runes:{},ruins:{},sarc:[0,0,0],boss:0,goal:0,won:0,seen:{},xp:0,cnt:{},ach:{},first:{},gv:2}, graves=[], drops=[];
let camYaw=Math.PI, camPitch=.35, camDist=6;
const EXN=Math.ceil(HALF/2); // tutkimusruudukko 4 m ruuduin
const explored=new Uint8Array(EXN*EXN);
let state='menu';

const fig=makePlayer();
scene.add(fig.g);let heldMesh=null,heldId=null,offMesh=null,offId=null,armorId=null;
// Repussa olevat mutta käyttämättömät aseet, kilvet ja työkalut näkyvät pelaajan selässä (kilpi keskellä, jousi vinossa, työkalut varret ylöspäin).
const backG=new THREE.Group();fig.g.add(backG);let backKey='';
function updateBack(){const items=inv.filter(s=>s&&!s.eq&&['weapon','bow','shield','shovel','hammer'].includes(ITEMS[s.id].cat));
  const sh=items.find(s=>ITEMS[s.id].cat==='shield'),one=items.find(s=>ITEMS[s.id].cat!=='shield'),bo=one&&ITEMS[one.id].cat==='bow'?one:null,tl=one&&!bo?[one]:[];
  const key=[sh,bo,...tl].map(s=>s?s.id:'-').join();if(key===backKey)return;backKey=key;while(backG.children.length)backG.remove(backG.children[0]);
  if(sh){const m=makeShield(sh.id);const o=new THREE.Group();m.rotation.y=Math.PI/2;m.position.set(0,0,0);o.add(m);o.position.set(0,1.2,-.25);o.scale.setScalar(.85);backG.add(o);}
  if(bo){const m=makeHeld(bo.id),o=new THREE.Group();o.add(m);o.position.set(.08,1.2,-.33);o.rotation.set(0,0,.5);o.scale.setScalar(.95);backG.add(o);}
  tl.forEach((s,i)=>{const m=makeHeld(s.id),i2=new THREE.Group(),o=new THREE.Group();m.rotation.z=Math.PI/2;/* terät/piikit sivusuuntaan = selänmyötäisesti, ei selkää vasten */i2.rotation.x=-Math.PI/2;i2.add(m);o.add(i2);o.position.set(.12,.78,-.3-(sh?.06:0));o.rotation.z=-.12;o.scale.setScalar(.85);backG.add(o);});}
function updateGear(){updateBack();
  {const w0=equipped('weapon');if(!w0||w0.id!=='vasara')setBuildSel(null);}
  const w=equipped('weapon'),wid=w?w.id:null;
  if(wid!==heldId){if(heldMesh)heldMesh.parent.remove(heldMesh);heldMesh=null;heldId=wid;if(wid){heldMesh=makeHeld(wid);(ITEMS[wid].cat==='bow'?fig.handL:fig.hand).add(heldMesh);}}
  const o=equipped('offhand'),oid=o?o.id:null;
  if(oid!==offId){if(offMesh)fig.handL.remove(offMesh);offMesh=null;offId=oid;if(oid){offMesh=ITEMS[oid].cat==='shield'?makeShield(oid):makeHeld(oid);fig.handL.add(offMesh);}}
  const a=equipped('armor'),aid=a?a.id:null;
  if(aid!==armorId){armorId=aid;const c=aid==='rautapanssari'?0x7d8894:aid==='kuparipanssari'?0xc07a40:aid==='nahkavaatteet'?0x8a6040:aid==='hiidenpanssari'?0x5fe6d9:0x8a6a46;const cm=smat(c);for(const m of fig.cloth)m.material=cm;}
}

/* ---------------- INVENTORY ---------------- */
function invCount(id){let n=0;for(const s of inv)if(s&&s.id===id)n+=s.n;return n;}
function invAdd(id,n,q=1){const d=ITEMS[id];if(!d)return n;
  if(d.s>1)for(const s of inv){if(n<=0)break;if(s&&s.id===id&&s.n<d.s){const k=Math.min(n,d.s-s.n);s.n+=k;n-=k;}}
  for(let i=0;i<inv.length&&n>0;i++){if(!inv[i]){const k=Math.min(n,d.s);inv[i]={id,n:k,q};n-=k;}}
  if(!flags.seen[id])flags.seen[id]=1;
  invDirty=true;return n;}
function invRemove(id,n){for(let i=inv.length-1;i>=0&&n>0;i--){const s=inv[i];if(s&&s.id===id){const k=Math.min(n,s.n);s.n-=k;n-=k;if(s.n<=0)inv[i]=null;}}invDirty=true;}
// Mahtuvatko kaikki esineet reppuun (yhdistäminen pinoihin + vapaat paikat)? Ei muuta reppua.
function fitsAll(list){const sim=inv.map(s=>s?{id:s.id,n:s.n}:null);
  for(const it of list){if(!it)continue;let n=it.n;const d=ITEMS[it.id];if(d.s>1)for(const s of sim){if(n<=0)break;if(s&&s.id===it.id&&s.n<d.s){const k=Math.min(n,d.s-s.n);s.n+=k;n-=k;}}
    for(let i=0;i<sim.length&&n>0;i++)if(!sim[i]){const k=Math.min(n,d.s);sim[i]={id:it.id,n:k};n-=k;}if(n>0)return false;}return true;}
function invWeight(){let w=0;for(const s of inv)if(s)w+=ITEMS[s.id].w*s.n;return w;}
let MAXW=160;
const PACK_UP=[null,{nahka:6,puu:4},{nahka:12,kupari:4}];
const invN=()=>32+8*P.packLv;
// Repun päivitys: lisää paikkoja (+8) ja kantokykyä (+40 painoa) tasoa kohti.
function setPack(lv){P.packLv=lv;recalcMaxW();while(inv.length<invN())inv.push(null);invDirty=true;}
function equipGroup(cat){return ['weapon','bow','hammer','shovel'].includes(cat)?'weapon':['shield','offhand'].includes(cat)?'offhand':cat;}
function equipped(cat){const grouped=cat==='weapon'||cat==='offhand';
  for(const s of inv){if(!s||!s.eq)continue;const c=ITEMS[s.id].cat;if(grouped?equipGroup(c)===cat:c===cat)return s;}
  return null;}
function toggleEquip(s){const cat=ITEMS[s.id].cat;if(!cat)return;
  if(s.eq){s.eq=false;}else{const g=equipGroup(cat);for(const o of inv)if(o&&o.eq&&equipGroup(ITEMS[o.id].cat)===g)o.eq=false;s.eq=true;}
  if(cat==='bow'&&s.eq){for(const o of inv)if(o&&o.eq&&equipGroup(ITEMS[o.id].cat)==='offhand')o.eq=false;}
  if(equipGroup(cat)==='offhand'&&s.eq){const w=equipped('weapon');if(w&&ITEMS[w.id].cat==='bow')w.eq=false;}
  invDirty=true;updateGear();if(cat!=='hammer'||!s.eq)setBuildSel(null);sfx('pickup');}
function useSlot(i){const s=inv[i];if(!s)return;const d=ITEMS[s.id];if(d.food)eat(s);else if(d.cat)toggleEquip(s);}
function giveOrDrop(id,n,x,y,z,q=1){const left=invAdd(id,n,q);if(left>0){spawnDrop(id,left,x,y,z,q);msg('Reppu on täynnä.','warn');}if(n-left>0){msg(`+${n-left} ${ITEMS[id].n}`,'loot');}}
let invDirty=true;

/* ---------------- DROPS ---------------- */
const dropGeo=new THREE.BoxGeometry(.32,.32,.32);
function spawnDrop(id,n,x,y,z,q=1,silent){const me=new THREE.Mesh(dropGeo,mat(new THREE.Color(ITEMS[id].c).getHex()));me.castShadow=true;me.position.set(x,y,z);scene.add(me);drops.push({id,n,q,mesh:me,vx:(Math.random()-.5)*3,vy:3+Math.random()*2,vz:(Math.random()-.5)*3,t:0,rest:false});}
const DROP_LIFE=300; // maassa olevat esineet katoavat 5 min jälkeen
function updateDrops(dt){
  for(let i=drops.length-1;i>=0;i--){const d=drops[i],m=d.mesh;d.t+=dt;
    if(d.t>DROP_LIFE){scene.remove(m);drops.splice(i,1);continue;}m.visible=d.t<DROP_LIFE-15||((d.t*5)|0)%2===0;
    if(!d.rest){d.vy-=18*dt;m.position.x+=d.vx*dt;m.position.y+=d.vy*dt;m.position.z+=d.vz*dt;const g=groundAt(m.position.x,m.position.z,.2,m.position.y+.5)+.18;if(m.position.y<g){m.position.y=g;d.rest=true;d.baseY=g;}}
    else{m.position.y=d.baseY+.12+Math.sin(d.t*3)*.06;m.rotation.y+=dt*1.5;}
    if(d.t>.5&&!P.dead&&m.position.distanceToSquared(_tmpV.set(P.pos.x,P.pos.y+.6,P.pos.z))<2.2){const left=invAdd(d.id,d.n,d.q);if(left<d.n){msg(`+${d.n-left} ${ITEMS[d.id].n}`,'loot');sfx('pickup');}d.n=left;if(left<=0){scene.remove(m);drops.splice(i,1);}}
    if(m.position.y<-20){scene.remove(m);drops.splice(i,1);}
  }
}
const _tmpV=new V3(),_tmpV2=new V3();

/* ---------------- PARTICLES & FX ---------------- */
const parts=[];const pGeo=new THREE.BoxGeometry(.12,.12,.12);
function burst(x,y,z,color,n=8,sp=3){for(let i=0;i<n;i++){if(parts.length>90){const o=parts.shift();scene.remove(o.m);}const m=new THREE.Mesh(pGeo,mat(color));m.position.set(x,y,z);scene.add(m);parts.push({m,vx:(Math.random()-.5)*sp,vy:Math.random()*sp,vz:(Math.random()-.5)*sp,t:.6+Math.random()*.4});}}
// Kipinät ja savu: kevyet, nousevat hiukkaset tulille ja soihduille (ei painovoimaa). kind: 'spark' | 'smoke'.
const embers=[],emGeo=new THREE.SphereGeometry(1,5,4);
function emitEmber(x,y,z,kind){if(embers.length>70)return;const sp=kind==='spark',c=sp?(Math.random()<.5?0xffb43a:0xff7a1a):0x6a6560;
  const m=new THREE.Mesh(emGeo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:sp?1:.35,depthWrite:false,fog:false}));m.position.set(x,y,z);m.scale.setScalar(.001);scene.add(m);
  embers.push({m,sp,t:0,life:sp?.5+Math.random()*.8:1.1+Math.random()*.9,vx:(Math.random()-.5)*(sp?.8:.3),vy:sp?.9+Math.random()*1.3:.5+Math.random()*.4,vz:(Math.random()-.5)*(sp?.8:.3),r:sp?.018+Math.random()*.014:.07});}
function updateEmbers(dt){for(let i=embers.length-1;i>=0;i--){const e=embers[i];e.t+=dt;const k=e.t/e.life;if(k>=1){scene.remove(e.m);e.m.material.dispose();embers.splice(i,1);continue;}
  e.m.position.x+=(e.vx+Math.sin(e.t*7+i)*.25)*dt;e.m.position.y+=e.vy*dt;e.m.position.z+=e.vz*dt;
  e.m.scale.setScalar(e.sp?e.r*(1-k*.6):e.r*(1+k*2.6));e.m.material.opacity=e.sp?1-k:.35*(1-k);}}
// Satunnaistettu välke: arvo hakeutuu satunnaisesti vaihtuvaan tavoitteeseen, joskus pieni "vajaus". Palauttaa kertoimen ~.82–1.04 (vain vähän eloa).
function flick(u,dt){u.t-=dt;if(u.t<=0){u.t=.04+Math.random()*.16;u.target=.82+Math.random()*.28;if(Math.random()<.04)u.target=.55+Math.random()*.15;}u.cur+=(u.target-u.cur)*Math.min(1,dt*14);return 1+(u.cur-1)*.4;}
const fx=[];
function updateFx(dt){updateEmbers(dt);
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t-=dt;p.vy-=12*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.m.scale.setScalar(Math.max(.01,p.t));if(p.t<=0){scene.remove(p.m);parts.splice(i,1);}}
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;if(f.update(f,dt)){scene.remove(f.obj);fx.splice(i,1);}}
}
// Kaatuva puu: isompi puu kaatuu hitaammin ja alku on hidas (k^2.6). Rungon sivuilla on oksia, jotka irtoavat maahan osuessa ja
// vajoavat hitaasti maan alle. Lähellä kaatuva puu tärähdyttää ruutua.
function fallTree(n,dir,crush){const g=new THREE.Group();const m=new THREE.Mesh(NGEO[n.type],vcMat);m.scale.setScalar(n.s);g.add(m);g.position.set(n.x,n.y,n.z);scene.add(g);
  const a=dir??Math.atan2(n.x-P.pos.x,n.z-P.pos.z),H=(TREE_H[n.type]||5)*n.s,dur=(1+.3*n.s)*(n.type==='aarnipuu'?2:1),brs=[];
  const bm=mat(TRUNK_C[n.type]||0x5a3a22),lc=LEAF_C[n.type],lm=lc?mat(lc):null,nb=n.type==='aarnipuu'?7:4;
  for(let i=0;i<nb;i++){const phi=i/nb*TAU+rng()*.8,h=H*(.3+.5*i/nb),L=(.6+rng()*.5)*n.s*(n.type==='aarnipuu'?2.5:1),th=.07*n.s*(n.type==='aarnipuu'?2:1);
    const b=new THREE.Group();b.add(bx(L,th,th,bm,L/2,0,0));if(lm){const lf=new THREE.Mesh(new THREE.IcosahedronGeometry(L*.3,0),lm);lf.position.x=L*.9;lf.castShadow=true;b.add(lf);}
    b.position.set(Math.cos(phi)*.12*n.s,h,-Math.sin(phi)*.12*n.s);b.rotation.set(0,phi,.35+rng()*.3);g.add(b);brs.push(b);}
  fx.push({obj:g,t:0,update:(f,dt)=>{const k=Math.min(1,f.t/dur);g.rotation.set(0,0,0);g.rotateOnWorldAxis(_tmpV.set(Math.cos(a),0,-Math.sin(a)),Math.pow(k,2.6)*Math.PI/2);
    if(f.t>dur&&!f.dropped){f.dropped=1;sfx('chop');if(crush)crushPlayer(n,a);
      const mx=n.x+Math.sin(a)*H*.5,mz=n.z+Math.cos(a)*H*.5,dd=Math.hypot(P.pos.x-mx,P.pos.z-mz);if(!P.inDun&&dd<H+8)shake(Math.min(.5,.12+.35*(1-dd/(H+8))*Math.min(1.5,n.s)));
      burst(n.x+Math.sin(a)*3,n.y+.5,n.z+Math.cos(a)*3,0x6b4527,10,4);
      for(const [id,lo,hi] of n.def.drops){if(id==='puu')continue;const c=Math.round(rint(rng,lo,hi)*n.s);for(let j=0;j<c;j++){const t=1+j*1.2;spawnDrop(id,1,n.x+Math.sin(a)*t,n.y+1,n.z+Math.cos(a)*t);}}
      g.updateMatrixWorld(true);for(const b of brs)dropBranch(b);
      spawnLogs(n,a);}
    return f.t>dur+.4;}});}
// Irronnut oksa: putoaa maahan, jää hetkeksi ja vajoaa ~6 s:ssa hitaasti maan alle.
function dropBranch(b){scene.attach(b);const vx=(Math.random()-.5)*1.5,vz=(Math.random()-.5)*1.5;let vy=0;
  fx.push({obj:b,t:0,update:(f,dt)=>{const gy=terrainH(b.position.x,b.position.z);
    if(f.t<1.2){vy-=14*dt;b.position.x+=vx*dt;b.position.z+=vz*dt;b.position.y=Math.max(gy+.05,b.position.y+vy*dt);b.rotation.z*=.97;}
    else if(f.t>3){b.position.y-=.12*dt;}
    if(f.t>9){b.traverse(o=>{if(o.geometry)o.geometry.dispose();});return true;}return false;}});}
function crushPlayer(n,a){if(P.dead||P.inDun)return;const H=(TREE_H[n.type]||5)*n.s,dx=P.pos.x-n.x,dz=P.pos.z-n.z,along=dx*Math.sin(a)+dz*Math.cos(a),lat=Math.abs(dx*Math.cos(a)-dz*Math.sin(a));
  if(along>0&&along<H&&lat<1.4*Math.max(1,n.s)&&Math.abs(P.pos.y-n.y)<3){const d=maxHp()*.8;P.hp-=d;P.hurtFlash=.8;shake(.6);sfx('hurt');floatText('-'+Math.round(d),P.pos.x,P.pos.y+2.2,P.pos.z,'#e0614f');msg('Kaatuva puu osui sinuun!','warn');if(P.hp<=0)playerDie();}}
function shockwave(x,y,z,r,color=0x8ffff0){const m=new THREE.Mesh(new THREE.RingGeometry(.8,1,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,y+.15,z);scene.add(m);fx.push({obj:m,t:0,update:(f)=>{const k=f.t/.5;m.scale.setScalar(.5+k*r);m.material.opacity=.8*(1-k);return k>=1;}});}

/* ---------------- PROJECTILES ---------------- */
const projs=[];
function shootArrow(from,dir,speed,dmg,owner,grav){const m=new THREE.Group();m.add(bx(.04,.04,.8,mat(0xc9b48a),0,0,0,false),bx(.07,.07,.12,mat(0x4d535c),0,0,.42,false));m.position.copy(from);scene.add(m);projs.push({m,v:dir.clone().multiplyScalar(speed),dmg,owner,t:0,g:grav||7,kind:'arrow'});}
function throwRock(from,target,dmg){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.6,0),mat(0x5d5a54));m.castShadow=true;m.position.copy(from);scene.add(m);const d=_tmpV.subVectors(target,from);const T=1.1;const v=new V3(d.x/T,(d.y+.5*14*T*T)/T,d.z/T);projs.push({m,v,dmg,owner:'boss',t:0,g:14,kind:'rock'});}
function updateProjs(dt){
  for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.t+=dt;if(p.stuck){if(p.t>6){scene.remove(p.m);projs.splice(i,1);}continue;}
    p.v.y-=p.g*dt;p.m.position.addScaledVector(p.v,dt);if(p.kind==='arrow')p.m.lookAt(_tmpV.copy(p.m.position).add(p.v));else{p.m.rotation.x+=dt*5;}
    const pos=p.m.position;let hit=false;
    if(p.owner==='player'){for(const m of mobs){if(m.dead)continue;const r=m.def.r+.35,cy=m.pos.y+m.def.r*1.6*(m.type==='vartija'?2.4:1);if(dist2(pos.x,pos.z,m.pos.x,m.pos.z)<r*r&&pos.y>m.pos.y-.2&&pos.y<cy+1.2){damageMob(m,p.dmg,'pierce',p.v.x,p.v.z);hit=true;break;}}}
    else{if(!P.dead&&dist2(pos.x,pos.z,P.pos.x,P.pos.z)<(p.kind==='rock'?2.2*2.2:.6)&&pos.y<P.pos.y+2.2&&pos.y>P.pos.y-.5){hurtPlayer(p.dmg,pos.x-p.v.x,pos.z-p.v.z);hit=true;}}
    const g=P.inDun?DUN.y:terrainH(pos.x,pos.z);
    if(!hit&&(pos.y<g||pointBlocked(pos.x,pos.y,pos.z))){if(p.kind==='rock'){shockwave(pos.x,g,pos.z,3);burst(pos.x,g+.3,pos.z,0x5d5a54,10,5);sfx('slam');if(!P.dead&&dist2(pos.x,pos.z,P.pos.x,P.pos.z)<9)hurtPlayer(p.dmg,pos.x,pos.z);scene.remove(p.m);projs.splice(i,1);continue;}p.stuck=true;p.t=0;continue;}
    if(hit||p.t>8){if(p.kind==='rock'){shockwave(pos.x,pos.y-.5,pos.z,3);sfx('slam');}scene.remove(p.m);projs.splice(i,1);}
  }
}
