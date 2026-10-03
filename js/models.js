/* Hiidenmaa – models.js
   Hahmomallit laatikoista: kaksijalkaiset, nelijalkaiset, aseet, kilvet */
'use strict';

/* ---------------- FIGURES ---------------- */
function makeBiped(o){
  const s=o.s||1,g=new THREE.Group(),th=o.thin?.6:1;
  const mB=mat(o.body),mS=mat(o.skin),mL=mat(o.legs||o.body);
  const hip=.8*s*(o.legLen||1);
  const mk=(x)=>{const p=new THREE.Group();p.position.set(x,hip,0);p.add(bx(.26*s*th,hip,.28*s*th,mL,0,-hip/2,0));g.add(p);return p;};
  const legL=mk(-.17*s),legR=mk(.17*s);
  const torso=bx(.64*s*(o.wide||1),.76*s,.38*s,mB,0,hip+.38*s,0);g.add(torso);
  const head=new THREE.Group();head.position.set(0,hip+.76*s,0);const hb=bx(.46*s*(o.headS||1),.46*s*(o.headS||1),.46*s*(o.headS||1),mS,0,.23*s*(o.headS||1),0);head.add(hb);g.add(head);
  const arm=(x)=>{const p=new THREE.Group();p.position.set(x,hip+.7*s,0);p.add(bx(.22*s*th,.72*s,.24*s*th,o.armMat?mat(o.armMat):mB,0,-.33*s,0));g.add(p);return p;};
  const armL=arm(.44*s*(o.wide||1)),armR=arm(-.44*s*(o.wide||1)); // hahmo katsoo +z:aan, joten +x on vasen
  const hand=new THREE.Group();hand.position.set(0,-.66*s,.02);armR.add(hand);
  const handL=new THREE.Group();handL.position.set(0,-.62*s,.02);armL.add(handL);
  if(o.eyes){const em=new THREE.MeshBasicMaterial({color:o.eyes});const hs=(o.headS||1)*s;head.add(bx(.09*hs,.07*hs,.02,em,-.11*hs,.27*hs,.235*hs,false));head.add(bx(.09*hs,.07*hs,.02,em,.11*hs,.27*hs,.235*hs,false));}
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  return{g,legL,legR,armL,armR,head,torso,hand,handL,s,biped:true};
}
function makeQuad(o){
  const s=o.s||1,g=new THREE.Group(),L=o.len||1,lh=o.legH||.7;
  const mB=mat(o.body),mL=mat(o.legs||o.body),mH=mat(o.headC||o.body);
  const body=bx(.62*s,.6*s,1.3*s*L,mB,0,(lh+.3)*s,0);g.add(body);
  const head=new THREE.Group();head.position.set(0,(lh+.5)*s,.62*s*L);head.add(bx(.42*s,.42*s,.55*s,mH,0,.08*s,.25*s));g.add(head);
  const legs=[];for(const [x,z] of [[-.2,.48],[.2,.48],[-.2,-.48],[.2,-.48]]){const p=new THREE.Group();p.position.set(x*s,lh*s,z*s*L);p.add(bx(.17*s,lh*s,.17*s,mL,0,-lh*s/2,0));g.add(p);legs.push(p);}
  if(o.antlers){const am=mat(0xd8c7a0);head.add(bx(.06*s,.5*s,.06*s,am,-.14*s,.45*s,.15*s));head.add(bx(.06*s,.5*s,.06*s,am,.14*s,.45*s,.15*s));head.add(bx(.3*s,.06*s,.06*s,am,-.24*s,.6*s,.15*s));head.add(bx(.3*s,.06*s,.06*s,am,.24*s,.6*s,.15*s));}
  if(o.tusks){const tm=mat(0xeeeadd);head.add(bx(.06*s,.16*s,.06*s,tm,-.16*s,0,.5*s));head.add(bx(.06*s,.16*s,.06*s,tm,.16*s,0,.5*s));}
  if(o.ears){head.add(bx(.1*s,.18*s,.06*s,mH,-.13*s,.34*s,.12*s));head.add(bx(.1*s,.18*s,.06*s,mH,.13*s,.34*s,.12*s));}
  if(o.eyes){const em=new THREE.MeshBasicMaterial({color:o.eyes});head.add(bx(.07*s,.05*s,.02,em,-.12*s,.16*s,.53*s,false));head.add(bx(.07*s,.05*s,.02,em,.12*s,.16*s,.53*s,false));}
  const tail=bx(.1*s,.1*s,.35*s,mB,0,(lh+.4)*s,-.75*s*L);tail.rotation.x=.6;g.add(tail);
  return{g,legs,head,body,s,quad:true};
}
function makeHeld(id){
  const g=new THREE.Group(),W=mat(0x7b4f2b);
  const h=(len)=>{g.add(bx(.07,.07,len,W,0,0,len/2-.1,true));};
  switch(id){
    case 'kirves':case 'kuparikirves':h(.85);g.add(bx(.06,.32,.2,mat(id==='kirves'?0x8f8d86:0xd98a4e,{metalness:id==='kirves'?0:.5,roughness:.5}),0,-.1,.68));break;
    case 'nuija':h(.6);g.add(bx(.2,.2,.42,mat(0x6b4527),0,0,.62));break;
    case 'hakku':h(.85);{const p=bx(.06,.07,.7,mat(0x58606b),0,0,.7);p.rotation.x=Math.PI/2;g.add(p);}break;
    case 'keihas':h(1.7);g.add(bx(.05,.1,.25,mat(0x66707a),0,0,1.65));g.position.z=-.3;break;
    case 'miekka':g.add(bx(.06,.06,.25,mat(0x4a2f18),0,0,.02));g.add(bx(.28,.05,.06,mat(0x8f5326),0,0,.16));g.add(bx(.04,.09,.85,mat(0xe9a46a,{metalness:.6,roughness:.4}),0,0,.6));break;
    case 'soihtu':h(.6);g.add(bx(.12,.12,.16,MAT.flame,0,0,.56,false));g.add(bx(.07,.07,.1,MAT.flame2,0,.06,.6,false));break;
    case 'vasara':h(.6);g.add(bx(.14,.14,.3,mat(0x7c6a52),0,0,.52));g.children[1].rotation.x=Math.PI/2;break;
    case 'jousi':{const m=mat(0x8a5a32);const a=bx(.06,.6,.06,m,0,.27,0),b=bx(.06,.6,.06,m,0,-.27,0);a.rotation.x=.35;b.rotation.x=-.35;a.position.z=.1;b.position.z=.1;g.add(a,b,bx(.01,1.05,.01,mat(0xe7e1cf),0,0,-.02,false));g.rotation.x=0;break;}
  }
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  return g;
}
function makeShield(id){const g=new THREE.Group();g.add(bx(.08,.75,.62,id==='kilpi'?MAT.wood:mat(0xc87a3e,{metalness:.5,roughness:.45}),.08,0,.1));g.add(bx(.1,.16,.16,mat(0xb8b0a0),.12,0,.1));return g;}
