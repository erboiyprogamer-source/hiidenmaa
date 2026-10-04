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
// Pelaajahahmo: laiha, litteäpintainen low-poly. Nivelet: olka–kyynärpää (elbowL/R) ja lonkka–polvi (kneeL/R) taipuvat; koko keho on `rig`-ryhmässä,
// jota voi laskea (polvet koukussa) ja kallistaa. Rajapinta kuten makeBiped:ssä (legL, legR, armL, armR, head, torso, hand, handL). cloth = panssarin mukaan värjättävät osat.
const softMats={};
function smat(c,o){const k=c+JSON.stringify(o||{});return softMats[k]||(softMats[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.9,metalness:0,flatShading:false},o||{})));}
function rnd(g,x,y,z,r,m,sx=1,sy=1,sz=1,seg=10){const me=new THREE.Mesh(new THREE.SphereGeometry(r,seg,Math.max(6,seg-2)),m);me.position.set(x,y,z);me.scale.set(sx,sy,sz);me.castShadow=true;g.add(me);return me;}
function tube(g,rt,rb,h,m,x,y,z,sx=1,sz=1,seg=12){const me=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),m);me.position.set(x,y,z);me.scale.set(sx,1,sz);me.castShadow=true;g.add(me);return me;}
function makePlayer(){
  const g=new THREE.Group(),rig=new THREE.Group(),hip=.8,F=(c,o)=>smat(c,Object.assign({flatShading:true},o||{}));g.add(rig);
  const skin=F(0xe2b48c),hairM=smat(0x4a2e1a),leather=F(0x5e4026),fur=F(0xa18a68),cloth=F(0x8a6a46),pant=F(0x5a4632),boot=F(0x3f2d1c);
  const mkLeg=x=>{const p=new THREE.Group();p.position.set(x,hip,0);tube(p,.092,.078,.4,pant,0,-.2,0,1,1,8);rnd(p,0,-.4,0,.072,pant,1,1,1,8);
    const k=new THREE.Group();k.position.set(0,-.4,0);p.add(k);tube(k,.072,.06,.4,pant,0,-.2,0,1,1,8);tube(k,.07,.07,.2,boot,0,-.3,0,1,1,8);tube(k,.083,.083,.06,fur,0,-.2,0,1,1,8);rnd(k,0,-.37,.07,.075,boot,1,.7,1.8,8);rig.add(p);return[p,k];};
  const [legL,kneeL]=mkLeg(-.12),[legR,kneeR]=mkLeg(.12);
  const torso=tube(rig,.2,.22,.76,cloth,0,hip+.38,0,1.18,.62,8);
  tube(rig,.235,.235,.07,leather,0,hip+.1,0,1.18,.65,8);rnd(rig,.22,hip+.08,.1,.06,leather,1,1.2,.8,6);rnd(rig,-.16,hip+.06,-.15,.055,fur,1,1.1,.8,6);
  tube(rig,.27,.23,.12,fur,0,hip+.7,0,1.2,.7,8);
  const cloths=[torso];
  const mkArm=x=>{const p=new THREE.Group();p.position.set(x,hip+.68,0);rnd(p,0,0,0,.085,fur,1,1,1,8);
    const up=tube(p,.063,.056,.33,cloth,0,-.18,0,1,1,8);cloths.push(up);
    const e=new THREE.Group();e.position.set(0,-.35,0);p.add(e);rnd(e,0,0,0,.052,skin,1,1,1,8);tube(e,.053,.045,.3,skin,0,-.17,0,1,1,8);tube(e,.058,.058,.08,leather,0,-.26,0,1,1,8);rig.add(p);return[p,e];};
  const [armL,elbowL]=mkArm(.35),[armR,elbowR]=mkArm(-.35); // hahmo katsoo +z:aan, joten +x on vasen
  const hand=new THREE.Group();hand.position.set(0,-.33,.02);rnd(hand,0,0,0,.062,skin,1,1,1,8);elbowR.add(hand);
  const handL=new THREE.Group();handL.position.set(0,-.33,.02);rnd(handL,0,0,0,.062,skin,1,1,1,8);elbowL.add(handL);
  tube(rig,.06,.07,.12,skin,0,hip+.8,0,1,1,8);
  const head=new THREE.Group();head.position.set(0,hip+.76,0);head.scale.setScalar(.93);rig.add(head);
  rnd(head,0,.28,0,.2,skin,.9,1.12,1,12);
  rnd(head,0,.25,.19,.038,skin,.9,1.1,1.2,8);
  rnd(head,-.19,.27,0,.042,skin,.6,1,.9,8);rnd(head,.19,.27,0,.042,skin,.6,1,.9,8);
  const em=new THREE.MeshBasicMaterial({color:0x1a1a1a});rnd(head,-.07,.31,.18,.025,em,1,1.2,.6,6);rnd(head,.07,.31,.18,.025,em,1,1.2,.6,6);
  for(let i=0;i<22;i++){const th=i/22*TAU,ring=i%2,y=.38+ring*.07,r=.18-ring*.03,sx=Math.sin(th),cz=Math.cos(th);if(cz>.55&&!ring)continue;rnd(head,sx*r*.92,y+(i%3)*.012,cz*r*.95-.02,.07,hairM,1,1,1,8);}
  for(const [x,z] of [[0,.0],[.09,.06],[-.09,.06],[.1,-.07],[-.1,-.07],[0,-.14],[0,.1]])rnd(head,x,.49,z,.07,hairM,1,.9,1,8);
  for(const [x,y] of [[-.15,.2],[.15,.2],[-.19,.28],[.19,.28],[-.13,.34],[.13,.34]])rnd(head,x,y,-.06,.065,hairM,1,1,1,8);
  for(const [x,y,z,r] of [[-.12,.2,.12,.055],[-.075,.14,.16,.06],[0,.12,.18,.065],[.075,.14,.16,.06],[.12,.2,.12,.055],[-.05,.2,.19,.038],[.05,.2,.19,.038],[0,.07,.14,.055]])rnd(head,x,y,z,r,hairM,1,1,1,8);
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  return{g,rig,legL,legR,kneeL,kneeR,armL,armR,elbowL,elbowR,head,torso,hand,handL,s:1,biped:true,cloth:cloths};
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
    case 'kuokka':{shaft(g,.95,W);g.add(bx(.06,.34,.16,mat(0x8a96a3,{metalness:.2,roughness:.55}),0,-.15,.86));g.add(bx(.08,.08,.12,mat(0x3a3a3a),0,0,.86));break;}
    case 'soihtu':{shaft(g,.6,W,.034);const wrap=new THREE.Mesh(new THREE.CylinderGeometry(.052,.04,.14,8),smat(0x3a2a1c));wrap.rotation.x=Math.PI/2;wrap.position.z=.56;g.add(wrap);
      const fa=new THREE.Mesh(new THREE.ConeGeometry(.095,.3,7),MAT.flame),fb=new THREE.Mesh(new THREE.ConeGeometry(.06,.22,7),MAT.flame2),fc=new THREE.Mesh(new THREE.ConeGeometry(.032,.14,6),new THREE.MeshBasicMaterial({color:0xfffbe0}));
      const glow=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),new THREE.MeshBasicMaterial({color:0xff9a3a,transparent:true,opacity:.22,depthWrite:false,fog:false}));
      // Liekit osoittavat aina ylös (kämmenen koordinaatistossa +y), sauva kärjestä eteen
      for(const [m,y] of[[fa,.2],[fb,.16],[fc,.12]]){m.position.set(0,y,.62);g.add(m);}glow.position.set(0,.18,.62);g.add(glow);g.userData.flame=[fa,fb,fc,glow];break;}
    case 'vasara':{shaft(g,.6,W);g.add(bx(.34,.14,.16,mat(0x7c6a52),0,0,.54));for(const sx of[-1,1])g.add(bx(.04,.16,.18,mat(0x4b4338),sx*.15,0,.54));g.add(bx(.07,.16,.07,mat(0x4b4338),0,0,.4));break;}
    // Jousi: runko kaareva (vatsa +z eli ampumasuuntaan, kärjet jännittäjää kohti), jänne kärkien välillä ja nuoli, joka vedetään taakse (updateBowMesh).
    case 'jousi':case 'hiidenjousi':{const R=.62,arc=1.9,geo=new THREE.TorusGeometry(R,.032,6,16,arc);geo.rotateZ(-arc/2);geo.rotateY(-Math.PI/2);geo.translate(0,0,.12-R);
      const bm=new THREE.Mesh(geo,smat(id==='jousi'?0x8a5a32:0x5fe6d9));bm.castShadow=true;g.add(bm);
      const tipY=R*Math.sin(arc/2),tipZ=.12-R+R*Math.cos(arc/2),sm=mat(0xe7e1cf),s1=bx(.012,1,.012,sm,0,0,0,false),s2=bx(.012,1,.012,sm,0,0,0,false);g.add(s1,s2);
      const ar=new THREE.Group();ar.add(bx(.025,.025,.8,mat(0xc9b48a),0,0,.4,false),bx(.05,.05,.1,mat(0x4d535c),0,0,.82,false));ar.visible=false;g.add(ar);
      g.userData.bow={s1,s2,ar,tipY,tipZ};updateBowMesh(g,0);
      // Käännetään koko jousi 180° pystyakselin ympäri: vatsa osoittaa pelaajaan päin ja jänne venyy ampumasuuntaan nähden oikein.
      const inner=new THREE.Group();while(g.children.length)inner.add(g.children[0]);inner.rotation.y=Math.PI;g.add(inner);break;}
  }
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});if(g.userData.flame)for(const f of g.userData.flame)f.castShadow=false;
  return g;
}
// Jousen jänne ja nuoli: k = vedon määrä 0–1 (0 = ei vedossa, jänne suorana).
function updateBowMesh(g,k,nocked){const b=g.userData.bow;if(!b)return;const nz=b.tipZ-(k>0?.1+k*.42:0);
  for(const [s,sy] of [[b.s1,1],[b.s2,-1]]){const dy=-sy*b.tipY,dz=nz-b.tipZ,L=Math.hypot(dy,dz);s.scale.y=L;s.position.set(0,sy*b.tipY+dy/2,b.tipZ+dz/2);s.rotation.x=-Math.atan2(dz,dy);}
  b.ar.visible=k>0||!!nocked;b.ar.position.z=nz-.02;}
function makeShield(id){const g=new THREE.Group(),wood=id==='kilpi',R=.4,
    base=wood?smat(0x8a5a32):smat(id==='rautakilpi'?0x8c97a4:0xc87a3e,{metalness:.35,roughness:.5}),
    rim=smat(wood?0x6e7680:id==='rautakilpi'?0xd0d8e2:0xe9b07a,{metalness:.5,roughness:.4}),dark=smat(0x2a2622),gold=smat(0xd9b24a,{metalness:.5,roughness:.4});
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(R,R,.07,20),base);disc.rotation.z=Math.PI/2;disc.position.set(.08,0,.1);g.add(disc);
  const tg=new THREE.TorusGeometry(R,.035,6,24);tg.rotateY(Math.PI/2);const ring=new THREE.Mesh(tg,rim);ring.position.set(.115,0,.1);g.add(ring);
  if(wood){for(const z of[-.22,-.07,.07,.22]){const pl=bx(.01,.8,.012,dark,.118,0,.1+z,false);g.add(pl);}for(const y of[-.17,.17])g.add(bx(.02,.05,.78,rim,.12,y,.1));}
  else{g.add(bx(.02,.8,.1,rim,.12,0,.1),bx(.02,.1,.8,rim,.12,0,.1));const rg=new THREE.Mesh((()=>{const t=new THREE.TorusGeometry(R*.62,.02,5,20);t.rotateY(Math.PI/2);return t;})(),gold);rg.position.set(.12,0,.1);g.add(rg);}
  for(let i=0;i<12;i++){const a=i/12*TAU;rnd(g,.125,Math.cos(a)*(R-.03),.1+Math.sin(a)*(R-.03),.018,gold,1,1,1,6);}
  const boss=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8,0,TAU,0,Math.PI/2),gold);boss.rotation.z=-Math.PI/2;boss.position.set(.115,0,.1);g.add(boss);
  const sp=new THREE.Mesh(new THREE.ConeGeometry(.035,.12,6),rim);sp.rotation.z=-Math.PI/2;sp.position.set(.25,0,.1);g.add(sp);
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});return g;}
