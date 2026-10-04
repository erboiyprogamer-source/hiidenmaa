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
// Pelaajahahmo: pehmeä low-poly. Pyöreät raajat, kiharat hiukset ja parta, alkukantaiset vaatteet (nahkatunika, turkisharteet, saappaat).
// Rajapinta sama kuin makeBiped:ssä (legL, legR, armL, armR, head, torso, hand, handL). cloth = panssarin mukaan värjättävät osat.
const softMats={};
function smat(c,o){const k=c+JSON.stringify(o||{});return softMats[k]||(softMats[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.9,metalness:0,flatShading:false},o||{})));}
function rnd(g,x,y,z,r,m,sx=1,sy=1,sz=1,seg=10){const me=new THREE.Mesh(new THREE.SphereGeometry(r,seg,Math.max(6,seg-2)),m);me.position.set(x,y,z);me.scale.set(sx,sy,sz);me.castShadow=true;g.add(me);return me;}
function tube(g,rt,rb,h,m,x,y,z,sx=1,sz=1,seg=12){const me=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m);me.position.set(x,y,z);me.scale.set(sx,1,sz);me.castShadow=true;g.add(me);return me;}
function makePlayer(){
  const g=new THREE.Group(),hip=.8,skin=smat(0xe2b48c),hairM=smat(0x4a2e1a),leather=smat(0x5e4026),fur=smat(0xa18a68),cloth=smat(0x8a6a46),pant=smat(0x5a4632),boot=smat(0x3f2d1c);
  const mkLeg=x=>{const p=new THREE.Group();p.position.set(x,hip,0);tube(p,.125,.095,hip-.14,pant,0,-(hip-.14)/2-.0,0);tube(p,.115,.115,.3,boot,0,-hip+.17,0);tube(p,.13,.13,.07,fur,0,-hip+.34,0);rnd(p,0,-hip+.07,.07,.1,boot,1,.7,1.55);g.add(p);return p;};
  const legL=mkLeg(-.15),legR=mkLeg(.15);
  const torso=tube(g,.27,.3,.76,cloth,0,hip+.38,0,1.05,.68);
  tube(g,.31,.31,.08,leather,0,hip+.1,0,1.05,.7);rnd(g,.24,hip+.08,.12,.07,leather,1,1.2,.8);rnd(g,-.18,hip+.06,-.17,.06,fur,1,1.1,.8);
  tube(g,.34,.3,.14,fur,0,hip+.68,0,1.1,.78);rnd(g,0,hip+.74,-.02,.2,fur,1.55,.45,1.0);
  const cloths=[torso];
  const mkArm=x=>{const p=new THREE.Group();p.position.set(x,hip+.68,0);rnd(p,0,0,0,.115,fur);
    const up=tube(p,.09,.08,.36,cloth,0,-.2,0);cloths.push(up);tube(p,.07,.062,.34,skin,0,-.52,0);tube(p,.078,.078,.09,leather,0,-.6,0);g.add(p);return p;};
  const armL=mkArm(.4),armR=mkArm(-.4); // hahmo katsoo +z:aan, joten +x on vasen
  const hand=new THREE.Group();hand.position.set(0,-.66,.02);rnd(hand,0,0,0,.075,skin);armR.add(hand);
  const handL=new THREE.Group();handL.position.set(0,-.62,.02);rnd(handL,0,0,0,.075,skin);armL.add(handL);
  tube(g,.075,.085,.12,skin,0,hip+.8,0);
  const head=new THREE.Group();head.position.set(0,hip+.76,0);g.add(head);
  rnd(head,0,.28,0,.205,skin,1,1.1,1.02,14);
  rnd(head,0,.25,.2,.04,skin,.9,1.1,1.2,8);                                         // nenä
  rnd(head,-.2,.27,0,.045,skin,.6,1,.9,8);rnd(head,.2,.27,0,.045,skin,.6,1,.9,8);     // korvat
  const em=new THREE.MeshBasicMaterial({color:0x1a1a1a});rnd(head,-.075,.31,.185,.026,em,1,1.2,.6,6);rnd(head,.075,.31,.185,.026,em,1,1.2,.6,6);
  // Kiharat: pieniä palloja pään päälle, taakse ja sivuille (kiinteä siemen, ei satunnaisuutta)
  for(let i=0;i<22;i++){const th=i/22*TAU,ring=i%2,y=.38+ring*.07,r=.19-ring*.03,sx=Math.sin(th),cz=Math.cos(th);if(cz>.55&&!ring)continue;rnd(head,sx*r,y+(i%3)*.012,cz*r*.95-.02,.075,hairM,1,1,1,8);}
  for(const [x,z] of [[0,.0],[.09,.06],[-.09,.06],[.1,-.07],[-.1,-.07],[0,-.14],[0,.1]])rnd(head,x,.49,z,.075,hairM,1,.9,1,8);
  for(const [x,y] of [[-.16,.2],[.16,.2],[-.2,.28],[.2,.28],[-.14,.34],[.14,.34]])rnd(head,x,y,-.06,.07,hairM,1,1,1,8);
  // Parta ja viikset
  for(const [x,y,z,r] of [[-.13,.2,.13,.06],[-.08,.14,.17,.065],[0,.12,.19,.07],[.08,.14,.17,.065],[.13,.2,.13,.06],[-.05,.2,.2,.04],[.05,.2,.2,.04],[0,.07,.15,.06]])rnd(head,x,y,z,r,hairM,1,1,1,8);
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  return{g,legL,legR,armL,armR,head,torso,hand,handL,s:1,biped:true,cloth:cloths};
}
// Aseen osat pyöristetyillä varsilla ja muotoilluilla terillä. poly = sivuprofiili (z,y) pistetaulukko, paksuus x-suunnassa.
function poly(pts,thick,m){const sh=new THREE.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(const q of pts.slice(1))sh.lineTo(q[0],q[1]);sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:thick,bevelEnabled:false});geo.translate(0,0,-thick/2);geo.rotateY(-Math.PI/2);const me=new THREE.Mesh(geo,m);me.castShadow=true;return me;}
function shaft(g,len,m,r=.032,z0=-.1){const me=new THREE.Mesh(new THREE.CylinderGeometry(r,r*1.1,len,8),m);me.rotation.x=Math.PI/2;me.position.z=z0+len/2;me.castShadow=true;g.add(me);return me;}
function makeHeld(id){
  const g=new THREE.Group(),W=smat(0x7b4f2b),metalOf=(c,o)=>mat(c,Object.assign({metalness:.2,roughness:.55},o||{}));
  switch(id){
    case 'kirves':case 'kuparikirves':case 'rautakirves':{shaft(g,.85,W);const mm=id==='kirves'?mat(0x8f8d86):metalOf(id==='rautakirves'?0x9aa6b3:0xd98a4e);
      g.add(poly([[.56,.05],[.57,-.04],[.6,-.27],[.82,-.3],[.9,-.14],[.9,.02],[.8,.06]],.05,mm));
      const bind=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.06,8),mat(0x4a2f18));bind.rotation.x=Math.PI/2;bind.position.z=.58;g.add(bind);break;}
    case 'nuija':{shaft(g,.6,W);const h=new THREE.Mesh(new THREE.SphereGeometry(.17,9,7),smat(0x6b4527));h.scale.set(1,1,1.5);h.position.z=.6;h.castShadow=true;g.add(h);
      for(const [x,y] of[[.12,0],[-.12,0],[0,.12],[0,-.12]]){const sp=new THREE.Mesh(new THREE.ConeGeometry(.03,.07,5),mat(0x9a9a92));sp.position.set(x,y,.6);sp.rotation.z=x?(x>0?-Math.PI/2:Math.PI/2):(y>0?0:Math.PI);g.add(sp);}break;}
    case 'hakku':case 'kuparihakku':case 'rautahakku':{shaft(g,.85,W);const c=id==='hakku'?0x58606b:id==='kuparihakku'?0xd98a4e:0x9aa6b3,R=.45,arc=1.7;
      const geo=new THREE.TorusGeometry(R,.04,6,14,arc);geo.rotateZ(-arc/2);geo.rotateY(-Math.PI/2);geo.translate(0,0,.72-R);const me=new THREE.Mesh(geo,metalOf(c));me.castShadow=true;g.add(me);
      const hub=new THREE.Mesh(new THREE.BoxGeometry(.09,.09,.1),mat(0x3a3a3a));hub.position.z=.72;g.add(hub);break;}
    case 'keihas':{shaft(g,1.7,W,.026);g.add(poly([[1.6,.035],[1.78,0],[1.6,-.035]],.03,metalOf(0x66707a)));g.position.z=-.3;break;}
    case 'miekka':case 'rautamiekka':case 'hiidenmiekka':{const L=id==='miekka'?.85:1,bm=metalOf(id==='miekka'?0xe9a46a:id==='hiidenmiekka'?0x7fe9dd:0xc8d2dc,{metalness:.6,roughness:.4});
      shaft(g,.2,smat(0x4a2f18),.03,-.02);const pom=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),metalOf(0x8f5326));pom.position.z=-.03;g.add(pom);
      g.add(bx(.3,.05,.06,metalOf(0x8f5326),0,0,.17));
      g.add(poly([[.18,.05],[.18+L-.14,.05],[.18+L,0],[.18+L-.14,-.05],[.18,-.05]],.03,bm));break;}
    case 'lapio':{shaft(g,.95,W);g.add(poly([[.82,.1],[1.0,.1],[1.12,.0],[1.0,-.1],[.82,-.1]],.03,metalOf(0x8a96a3,{roughness:.5})));const gr=new THREE.Mesh(new THREE.BoxGeometry(.2,.04,.06),W);gr.position.set(0,0,-.08);g.add(gr);break;}
    case 'soihtu':{shaft(g,.6,W,.034);const fl=new THREE.Mesh(new THREE.ConeGeometry(.08,.22,6),MAT.flame);fl.rotation.x=Math.PI/2;fl.position.z=.68;g.add(fl);const f2=new THREE.Mesh(new THREE.ConeGeometry(.045,.14,6),MAT.flame2);f2.rotation.x=Math.PI/2;f2.position.z=.66;g.add(f2);break;}
    case 'vasara':{shaft(g,.6,W);const hd=bx(.12,.13,.3,mat(0x7c6a52),0,0,.54);hd.rotation.z=0;g.add(hd);g.add(bx(.14,.15,.05,mat(0x4b4338),0,0,.38));break;}
    // Jousi: runko kaareva (vatsa +z eli ampumasuuntaan, kärjet jännittäjää kohti), jänne kärkien välillä ja nuoli, joka vedetään taakse (updateBowMesh).
    case 'jousi':case 'hiidenjousi':{const R=.62,arc=1.9,geo=new THREE.TorusGeometry(R,.032,6,16,arc);geo.rotateZ(-arc/2);geo.rotateY(-Math.PI/2);geo.translate(0,0,.12-R);
      const bm=new THREE.Mesh(geo,smat(id==='jousi'?0x8a5a32:0x5fe6d9));bm.castShadow=true;g.add(bm);
      const tipY=R*Math.sin(arc/2),tipZ=.12-R+R*Math.cos(arc/2),sm=mat(0xe7e1cf),s1=bx(.012,1,.012,sm,0,0,0,false),s2=bx(.012,1,.012,sm,0,0,0,false);g.add(s1,s2);
      const ar=new THREE.Group();ar.add(bx(.025,.025,.8,mat(0xc9b48a),0,0,.4,false),bx(.05,.05,.1,mat(0x4d535c),0,0,.82,false));ar.visible=false;g.add(ar);
      g.userData.bow={s1,s2,ar,tipY,tipZ};updateBowMesh(g,0);break;}
  }
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  return g;
}
// Jousen jänne ja nuoli: k = vedon määrä 0–1 (0 = ei vedossa, jänne suorana).
function updateBowMesh(g,k,nocked){const b=g.userData.bow;if(!b)return;const nz=b.tipZ-(k>0?.1+k*.42:0);
  for(const [s,sy] of [[b.s1,1],[b.s2,-1]]){const dy=-sy*b.tipY,dz=nz-b.tipZ,L=Math.hypot(dy,dz);s.scale.y=L;s.position.set(0,sy*b.tipY+dy/2,b.tipZ+dz/2);s.rotation.x=-Math.atan2(dz,dy);}
  b.ar.visible=k>0||!!nocked;b.ar.position.z=nz-.02;}
function makeShield(id){const g=new THREE.Group();g.add(bx(.08,.75,.62,id==='kilpi'?MAT.wood:mat(id==='rautakilpi'?0x8a96a3:0xc87a3e,{metalness:.35,roughness:.5}),.08,0,.1));g.add(bx(.1,.16,.16,mat(0xb8b0a0),.12,0,.1));return g;}
