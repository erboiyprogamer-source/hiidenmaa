/* Hiidenmaa – mobs.js
   Vihollis- ja eläinmäärittelyt (MOBDEF) ja spawnMob */
'use strict';

/* ---------------- MOBS ---------------- */
const MOBDEF={
  peura:{n:'Peura',hp:25,r:.5,ai:'flee',walk:1.6,run:8.5,drops:[['nahka',1,2],['liha',1,2]],fig:()=>makeQuad({s:1,body:0x8a6440,legs:0x6b4a2e,headC:0x7a5636,antlers:1,legH:.85,len:1.05,ears:1})},
  karju:{n:'Villikarju',hp:40,r:.55,ai:'neutral',walk:1.4,run:5.8,dmg:8,range:1.5,cd:1.5,wind:.35,drops:[['nahka',1,1],['liha',1,3]],fig:()=>makeQuad({s:.95,body:0x4a3a2e,legs:0x3a2c22,tusks:1,legH:.5,len:.9,ears:1,eyes:0x2a0a0a})},
  hiisi:{n:'Sammalhiisi',hp:34,r:.45,ai:'hostile',walk:1.5,run:5.2,aggro:17,dmg:9,range:1.7,cd:1.4,wind:.42,drops:[['pihka',0,2],['kivi',0,1]],fig:()=>{const f=makeBiped({s:.78,body:0x4b5e2c,skin:0x6a7a3a,legs:0x3d3226,eyes:0xffe36a,headS:1.25});const h=mat(0x5e3b1f);f.head.add(bx(.06,.35,.06,h,-.15,.7,0),bx(.06,.3,.06,h,.15,.68,0));return f;}},
  susi:{n:'Harmaasusi',hp:44,r:.5,ai:'hostile',walk:2,run:4.6,aggro:28,dmg:11,range:1.7,cd:1.15,wind:.3,drops:[['nahka',1,2]],fig:()=>makeQuad({s:.9,body:0x6e6e70,legs:0x58585a,headC:0x7c7c7e,legH:.6,len:1.05,ears:1,eyes:0xffcc55})},
  kalmo:{n:'Kalmo',hp:50,r:.45,ai:'hostile',walk:1.4,run:4.6,aggro:20,dmg:13,range:1.8,cd:1.5,wind:.5,weak:{blunt:1.6,pierce:.6,fire:1.3},drops:[['luu',1,3],['kivi',0,1]],fig:()=>{const f=makeBiped({s:1,body:0xd9d2bf,skin:0xe6e0cf,legs:0xcdc6b2,thin:1,eyes:0x7fffe8});f.torso.add(bx(.66,.06,.4,mat(0x3a352d),0,.1,0),bx(.66,.06,.4,mat(0x3a352d),0,-.12,0));const sw=bx(.05,.08,.8,mat(0x7a6a50),0,0,.4);f.hand.add(sw);return f;}},
  ylimys:{n:'Kalmon ylimys',hp:150,r:.6,ai:'hostile',walk:1.3,run:4.2,aggro:16,dmg:20,range:2.2,cd:1.8,wind:.65,weak:{blunt:1.5,pierce:.6,fire:1.3},drops:[['luu',3,5],['kupari',2,3]],fig:()=>{const f=makeBiped({s:1.3,body:0xcfc6ae,skin:0xe6e0cf,legs:0xbdb59f,thin:1,eyes:0xff7a3a,armMat:0xd9d2bf});f.head.add(bx(.66,.2,.66,mat(0x8f5326,{metalness:.5}),0,.66,0));f.hand.add(bx(.12,.12,1.3,mat(0x58606b),0,0,.6));return f;}},
  vartija:{n:'Kalmanvartija',hp:900,r:1.6,ai:'boss',walk:2.2,run:3.6,aggro:60,dmg:24,range:4.2,cd:2,wind:.8,weak:{blunt:1.3,pierce:.75,fire:1},drops:[['sydan',1,1],['kupari',6,8],['hiidenkivi',0,0]],fig:()=>{const f=makeBiped({s:3.1,body:0x5d5a54,skin:0x6f6b63,legs:0x4a4742,eyes:0x7ffff0,wide:1.15});const rm=MAT.glow;f.torso.add(bx(.06,.6,.05,rm,0,0,.6),bx(.5,.06,.05,rm,0,.15,.6));f.armL.add(bx(.8,.5,.8,mat(0x4a4742),0,.2,0));f.armR.add(bx(.8,.5,.8,mat(0x4a4742),0,.2,0));f.head.add(bx(.5,.35,.35,mat(0x6f6b63),-.95,1.6,0),bx(.5,.35,.35,mat(0x6f6b63),.95,1.6,0));return f;}},
};
let mobs=[], boss=null;
function spawnMob(type,x,z,opts={}){
  const def=MOBDEF[type],f=def.fig();const y=opts.y??terrainH(x,z);
  f.g.position.set(x,y,z);scene.add(f.g);
  const mats=[];f.g.traverse(m=>{if(m.isMesh&&m.material.isMeshStandardMaterial){m.material=m.material.clone();mats.push(m.material);}});
  const m={type,def,f,mats,pos:new V3(x,y,z),vel:new V3(),yaw:rng()*TAU,hp:def.hp,maxHp:def.hp,state:'idle',t:0,wander:null,atkCd:1,wind:0,angry:false,flash:0,walkPh:0,lastHit:-99,stuck:0,home:{x,z},dun:!!opts.dun,anim:0,dead:false,deadT:0,hurtT:-99};
  mobs.push(m);return m;
}
function mobRemove(m){scene.remove(m.f.g);mobs.splice(mobs.indexOf(m),1);if(m===boss)boss=null;}
