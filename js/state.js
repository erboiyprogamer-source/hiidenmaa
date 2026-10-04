/* Hiidenmaa – state.js
   Pelin tila (P, inv, flags), pelaajahahmo, reppu, maahan pudonneet esineet, partikkelit, ammukset */
'use strict';

/* ---------------- GAME STATE ---------------- */
const P={pos:new V3(LOC.spawn.x,terrainH(LOC.spawn.x,LOC.spawn.z),LOC.spawn.z),vy:0,yaw:Math.PI,onGround:true,hp:60,stam:100,hunger:80,stamDelay:0,atk:null,blocking:false,bowDraw:0,drawing:false,heal:0,buffs:{},wetT:0,restT:0,inWater:false,dead:false,invul:0,stagger:0,walkPh:0,spawn:null,deaths:0,kills:0,hurtFlash:0,inDun:false,crouch:false,crouchK:0};
let inv=new Array(32).fill(null);
let playTime=0, dayT=.3, dayN=1, weather={cur:'selkea',until:200}, flags={disc:{},runes:{},ruins:{},sarc:[0,0,0],boss:0,goal:0,won:0,seen:{}}, graves=[], drops=[];
let camYaw=Math.PI, camPitch=.35, camDist=6;
const EXN=Math.ceil(HALF/2); // tutkimusruudukko 4 m ruuduin
const explored=new Uint8Array(EXN*EXN);
let state='menu';

const fig=makeBiped({s:1,body:0x5a6e7a,skin:0xe2b48c,legs:0x4a3b2c,eyes:0x1a1a1a});
fig.head.add(bx(.48,.16,.1,mat(0xc98a3a),0,.06,.23));fig.head.add(bx(.5,.18,.5,mat(0x6b6b6b,{metalness:.4,roughness:.5}),0,.5,0));fig.head.add(bx(.08,.14,.08,mat(0x8a8a8a),0,.42,.25));
scene.add(fig.g);let heldMesh=null,heldId=null,offMesh=null,offId=null,armorId=null;
function updateGear(){
  {const w0=equipped('weapon');if(!w0||w0.id!=='vasara')setBuildSel(null);}
  const w=equipped('weapon'),wid=w?w.id:null;
  if(wid!==heldId){if(heldMesh)heldMesh.parent.remove(heldMesh);heldMesh=null;heldId=wid;if(wid){heldMesh=makeHeld(wid);(ITEMS[wid].cat==='bow'?fig.handL:fig.hand).add(heldMesh);}}
  const o=equipped('offhand'),oid=o?o.id:null;
  if(oid!==offId){if(offMesh)fig.handL.remove(offMesh);offMesh=null;offId=oid;if(oid){offMesh=ITEMS[oid].cat==='shield'?makeShield(oid):makeHeld(oid);fig.handL.add(offMesh);}}
  const a=equipped('armor'),aid=a?a.id:null;
  if(aid!==armorId){armorId=aid;const c=aid==='rautapanssari'?0x7d8894:aid==='kuparipanssari'?0xc07a40:aid==='nahkavaatteet'?0x8a6040:0x5a6e7a;fig.torso.material=mat(c);fig.armL.children[0].material=mat(c);fig.armR.children[0].material=mat(c);}
}

/* ---------------- INVENTORY ---------------- */
function invCount(id){let n=0;for(const s of inv)if(s&&s.id===id)n+=s.n;return n;}
function invAdd(id,n,q=1){const d=ITEMS[id];if(!d)return n;
  if(d.s>1)for(const s of inv){if(n<=0)break;if(s&&s.id===id&&s.n<d.s){const k=Math.min(n,d.s-s.n);s.n+=k;n-=k;}}
  for(let i=0;i<inv.length&&n>0;i++){if(!inv[i]){const k=Math.min(n,d.s);inv[i]={id,n:k,q};n-=k;}}
  if(!flags.seen[id])flags.seen[id]=1;
  invDirty=true;return n;}
function invRemove(id,n){for(let i=inv.length-1;i>=0&&n>0;i--){const s=inv[i];if(s&&s.id===id){const k=Math.min(n,s.n);s.n-=k;n-=k;if(s.n<=0)inv[i]=null;}}invDirty=true;}
function invWeight(){let w=0;for(const s of inv)if(s)w+=ITEMS[s.id].w*s.n;return w;}
const MAXW=160;
function equipGroup(cat){return ['weapon','bow','hammer'].includes(cat)?'weapon':['shield','offhand'].includes(cat)?'offhand':cat;}
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
const fx=[];
function updateFx(dt){
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t-=dt;p.vy-=12*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.m.scale.setScalar(Math.max(.01,p.t));if(p.t<=0){scene.remove(p.m);parts.splice(i,1);}}
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;if(f.update(f,dt)){scene.remove(f.obj);fx.splice(i,1);}}
}
function fallTree(n,dir,crush){const g=new THREE.Group();const m=new THREE.Mesh(NGEO[n.type],vcMat);m.scale.setScalar(n.s);g.add(m);g.position.set(n.x,n.y,n.z);scene.add(g);
  const a=dir??Math.atan2(n.x-P.pos.x,n.z-P.pos.z);
  fx.push({obj:g,t:0,update:(f,dt)=>{const k=Math.min(1,f.t/1.2);g.rotation.set(0,0,0);g.rotateOnWorldAxis(_tmpV.set(Math.cos(a),0,-Math.sin(a)),k*k*Math.PI/2);if(f.t>1.2&&!f.dropped){f.dropped=1;sfx('chop');if(crush)crushPlayer(n,a);burst(n.x+Math.sin(a)*3,n.y+.5,n.z+Math.cos(a)*3,0x6b4527,10,4);for(const [id,lo,hi] of n.def.drops){if(id==='puu')continue;const c=Math.round(rint(rng,lo,hi)*n.s);for(let j=0;j<c;j++){const t=1+j*1.2;spawnDrop(id,1,n.x+Math.sin(a)*t,n.y+1,n.z+Math.cos(a)*t);}}spawnLogs(n,a);}return f.t>1.6;}});}
function crushPlayer(n,a){if(P.dead||P.inDun)return;const H=(TREE_H[n.type]||5)*n.s,dx=P.pos.x-n.x,dz=P.pos.z-n.z,along=dx*Math.sin(a)+dz*Math.cos(a),lat=Math.abs(dx*Math.cos(a)-dz*Math.sin(a));
  if(along>0&&along<H&&lat<1.4*Math.max(1,n.s)&&Math.abs(P.pos.y-n.y)<3){const d=maxHp()*.8;P.hp-=d;P.hurtFlash=.8;shake(.6);sfx('hurt');floatText('-'+Math.round(d),P.pos.x,P.pos.y+2.2,P.pos.z,'#e0614f');msg('Kaatuva puu osui sinuun!','warn');if(P.hp<=0)playerDie();}}
function shockwave(x,y,z,r,color=0x8ffff0){const m=new THREE.Mesh(new THREE.RingGeometry(.8,1,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,y+.15,z);scene.add(m);fx.push({obj:m,t:0,update:(f)=>{const k=f.t/.5;m.scale.setScalar(.5+k*r);m.material.opacity=.8*(1-k);return k>=1;}});}

/* ---------------- PROJECTILES ---------------- */
const projs=[];
function shootArrow(from,dir,speed,dmg,owner){const m=new THREE.Group();m.add(bx(.04,.04,.8,mat(0xc9b48a),0,0,0,false),bx(.07,.07,.12,mat(0x4d535c),0,0,.42,false));m.position.copy(from);scene.add(m);projs.push({m,v:dir.clone().multiplyScalar(speed),dmg,owner,t:0,g:7,kind:'arrow'});}
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
