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
// Yksityiskohtainen kaksijalkainen (v0.71, pelaajahahmon tyyli): pyöristetyt raajat (tube/rnd), nivelpallot, kyynärpää- ja polvinivel
// (elbowL/R, kneeL/R), kämmenet ja jalkaterät, kaula ja pallopää. Rajapinta kuten makeBiped (g, legL/R, armL/R, head, torso, hand, handL, biped),
// joten tekoälyn animaatiot toimivat sellaisenaan. torso ja head ovat skaalaamattomia ryhmiä (lisäosat eivät litisty).
// o: s koko, body/skin/legs/boot värit, eyes (hehkuva), wide, thin (luiseva), headS, flat (särmikäs kivi), skel (luuranko), noHead.
function makeHumanoid(o){
  const s=o.s||1,g=new THREE.Group(),th=o.thin?.62:1,wd=o.wide||1,F=c=>smat(c,{flatShading:!!o.flat||!!o.skel,roughness:o.rough||.9});
  const mB=F(o.body),mS=F(o.skin),mL=F(o.legs||o.body),mBo=F(o.boot||o.legs||o.body),mJ=o.joint?F(o.joint):mS,hip=.8*s,seg=o.flat?6:8;
  // jalat: reisi, polvi, sääri, jalkaterä
  const mkLeg=x=>{const p=new THREE.Group();p.position.set(x,hip,0);tube(p,.1*s*th,.085*s*th,.4*s,mL,0,-.2*s,0,1,1,seg);rnd(p,0,-.4*s,0,.08*s*th,mJ,1,1,1,seg);
    const k=new THREE.Group();k.position.set(0,-.4*s,0);p.add(k);tube(k,.08*s*th,.065*s*th,.36*s,o.skel?mL:mBo,0,-.18*s,0,1,1,seg);
    rnd(k,0,-.37*s,.06*s,.08*s*th,mBo,1,.65,1.9,seg);g.add(p);return[p,k];};
  const [legL,kneeL]=mkLeg(-.13*s*wd),[legR,kneeR]=mkLeg(.13*s*wd);
  // vartalo: lantio, rinta, hartiat
  const torso=new THREE.Group();torso.position.set(0,hip+.38*s,0);g.add(torso);
  if(!o.skel){tube(torso,.22*s*wd,.2*s*wd,.76*s,mB,0,0,0,1.15,.66,seg);rnd(torso,0,.3*s,0,.24*s*wd,mB,1.2,.55,.7,seg);tube(torso,.235*s*wd,.235*s*wd,.08*s,F(o.belt||0x3a2a1c),0,-.3*s,0,1.15,.7,seg);}
  else{// luuranko: selkäranka, kylkiluut, lantio, solisluut
    for(let i=0;i<7;i++)rnd(torso,0,-.32*s+i*.11*s,-.06*s,.045*s,mB,1,.8,1,6);
    for(let i=0;i<5;i++){const y=.25*s-i*.11*s,r=(.2-i*.012)*s*wd,rib=new THREE.Mesh(new THREE.TorusGeometry(r,.022*s,4,10,Math.PI*1.25),mB);rib.rotation.set(Math.PI/2,0,Math.PI*1.12);rib.position.set(0,y,-.02*s);rib.scale.set(1,.75,1);torso.add(rib);}
    rnd(torso,0,-.38*s,0,.17*s*wd,mB,1.3,.45,.7,6);tube(torso,.02*s,.02*s,.5*s*wd,mB,0,.36*s,.02*s).rotation.z=Math.PI/2;}
  // käsivarret: olka, olkavarsi, kyynärpää, kyynärvarsi, kämmen + peukalo
  const mkArm=x=>{const p=new THREE.Group();p.position.set(x,hip+.68*s,0);rnd(p,0,0,0,.1*s*(o.skel?.7:1),o.shoulder?F(o.shoulder):mJ,1,1,1,seg);
    tube(p,.07*s*th,.062*s*th,.33*s,o.armMat?F(o.armMat):(o.skel?mB:mS),0,-.18*s,0,1,1,seg);
    const e=new THREE.Group();e.position.set(0,-.35*s,0);p.add(e);rnd(e,0,0,0,.06*s*th,mJ,1,1,1,seg);tube(e,.058*s*th,.048*s*th,.3*s,o.armMat?F(o.armMat):(o.skel?mB:mS),0,-.17*s,0,1,1,seg);g.add(p);return[p,e];};
  const [armL,elbowL]=mkArm(.36*s*wd),[armR,elbowR]=mkArm(-.36*s*wd);
  const mkHand=(e,sx)=>{const h=new THREE.Group();h.position.set(0,-.33*s,.02*s);rnd(h,0,0,0,.07*s,o.handMat?F(o.handMat):mS,1,1.15,.8,seg);rnd(h,sx*.05*s,.01*s,.04*s,.03*s,o.handMat?F(o.handMat):mS,1,1.4,1,6);e.add(h);return h;};
  const hand=mkHand(elbowR,-1),handL=mkHand(elbowL,1);
  // kaula ja pää
  const head=new THREE.Group();head.position.set(0,hip+.76*s,0);g.add(head);const hs=(o.headS||1)*s;
  if(!o.noHead){tube(head,.06*s,.07*s,.14*s,o.skel?mB:mS,0,.02*s,0,1,1,seg);rnd(head,0,.28*hs,0,.2*hs,mS,.92,1.08,1,o.flat?6:12);
    if(o.eyes){const em=new THREE.MeshBasicMaterial({color:o.eyes});for(const x of [-.075,.075])rnd(head,x*hs,.3*hs,.17*hs,.032*hs,em,1,.8,.6,6);}}
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  return{g,legL,legR,kneeL,kneeR,armL,armR,elbowL,elbowR,head,torso,hand,handL,s,biped:true,human:true};
}
// Yksityiskohtaiset eläimet (v0.72, pelaajahahmon tyyli): pyöreä runko (rinta, keskivartalo, lantio, vaaleampi vatsa), kaula, pää
// kuono-osineen, silmät, korvat, nivelletyt jalat (reisi, polvi, sääri, kavio/tassu) ja häntä. Rajapinta kuten makeQuad
// (g, legs[4], head, body, s, quad) – tekoälyn animaatio toimii; jalan polvi on legs[i].userData.knee (animMob koukistaa).
// kind: 'deer' (peura), 'boar' (villikarju), 'wolf' (susi); ice: routasusi (jääpiikit). Mitat kuten makeQuad (legH, len).
function makeAnimal(o){
  const s=o.s||1,L=o.len||1,lh=o.legH||.7,g=new THREE.Group(),k=o.kind,F=c=>smat(c,{flatShading:true});
  const mB=F(o.body),mD=F(o.dark||o.legs||o.body),mL=F(o.legs||o.body),mBel=F(o.belly||o.body),mH=F(o.headC||o.body),mHoof=F(o.hoof||0x2a2420);
  const by=(lh+.3)*s,bz=.62*s*L;
  // runko: rinta, keskivartalo, lantio, vatsa
  const body=new THREE.Group();g.add(body);
  const chestR=(k==='boar'?.36:k==='bear'?.4:.3)*s,hipR=(k==='boar'?.3:k==='deer'?.27:k==='bear'?.36:.26)*s;
  rnd(body,0,by+(k==='boar'?.06*s:.02*s),.34*s*L,chestR,mB,1,1.05,1.15,10);
  rnd(body,0,by,0,(k==='bear'?.36:.27)*s,mB,1,.95,1.9*L,10);
  rnd(body,0,by+.02*s,-.36*s*L,hipR,o.rump?F(o.rump):mB,1,1,1.1,10);
  rnd(body,0,by-.12*s,.02*s*L,.22*s,mBel,1.05,.6,2*L,8);
  // kaula ja pää (pää-ryhmä samassa kohdassa kuin makeQuad:ssa, jotta animaation pään kallistus toimii)
  const head=new THREE.Group();head.position.set(0,(lh+.5)*s,bz);g.add(head);
  const neckUp=k==='deer'?(o.rein?.24:.32):k==='boar'?.02:k==='hare'?.04:k==='bear'?-.05:.12;
  head.position.y+=neckUp*s;
  // v0.81: kaula lasketaan rinnasta (A) pään tyveen (B) → pää ei leiju irti (ennen kiinteä 0,42 m putki jäi peuralla 0,2 m vajaaksi).
  {const ay=by+.1*s,az=bz-.16*s,byH=head.position.y+.02*s,bzH=head.position.z,dy=byH-ay,dz=bzH-az,len=Math.hypot(dy,dz)+.12*s,nr=k==='boar'?1.4:1;
   tube(g,.12*s*nr*(k==='bear'?1.7:1),.17*s*nr*(k==='bear'?1.6:1),len,mB,0,(ay+byH)/2,(az+bzH)/2,1,1,8).rotation.x=Math.atan2(dz,dy);}
  rnd(head,0,.08*s,.06*s,(k==='bear'?.22:.17)*s,mH,1,1,1.15,10);                        // kallo
  const sn=k==='wolf'?(o.fox?[.06,.05,.26]:o.lynx?[.08,.08,.12]:o.ahma?[.08,.075,.17]:[.09,.08,.28]):k==='boar'?[.11,.1,.3]:k==='hare'?[.075,.07,.1]:k==='bear'?[.1,.12,.2]:o.elk?[.1,.11,.36]:[.08,.08,.24];
  tube(head,sn[0]*s,sn[1]*s*1.5,sn[2]*s,mH,0,.01*s,.22*s+sn[2]*s/2,1,1,8).rotation.x=Math.PI/2; // kuono
  const tip=.22*s+sn[2]*s,nm=new THREE.MeshBasicMaterial({color:0x151110});
  if(k==='boar'){const disc=tube(head,.085*s,.085*s,.04*s,F(0x8a6a5a),0,.01*s,tip+.02*s,1,1,10);disc.rotation.x=Math.PI/2;for(const x of [-.03,.03])rnd(disc,x*s,.022*s,0,.015*s,nm,1,1,1,5);
    const tk=F(0xeeeadd);if(!o.sow)for(const sd of [-1,1]){const t=new THREE.Mesh(new THREE.ConeGeometry(.022*s,.14*s,6),tk);t.position.set(sd*.08*s,.02*s,tip-.08*s);t.rotation.set(-.5,0,-sd*.5);head.add(t);}}
  else rnd(head,0,.03*s,tip,.035*s,nm,1.2,.9,.9,6);                    // nenä
  prt(head,.1*s,.012*s,.02*s,nm,0,-.04*s,tip-.04*s);                    // suu
  const em=new THREE.MeshBasicMaterial({color:o.eyes||0x120c08});for(const sd of [-1,1])rnd(head,sd*.11*s,.13*s,.17*s,.026*s,em,1,1,.7,6);
  // korvat
  if(k==='bear')for(const sd of [-1,1]){rnd(head,sd*.15*s,.28*s,-.02*s,.07*s,mH,1,1,.55,7);rnd(head,sd*.15*s,.28*s,.01*s,.04*s,mD,1,1,.4,6);}   // pyöreät korvat
  else if(k==='hare')for(const sd of [-1,1]){const e=new THREE.Group();e.position.set(sd*.06*s,.2*s,-.03*s);e.rotation.set(-.35,0,-sd*.16);head.add(e);   // jäniksen pitkät litteät korvat
    rnd(e,0,.24*s,0,.075*s,mH,.75,3.3,.38,7);rnd(e,0,.24*s,.016*s,.055*s,F(0xd8b8a8),.6,2.9,.2,6);rnd(e,0,.46*s,0,.045*s,F(o.earTip||0x1c1814),.85,1.3,.42,6);}
  else for(const sd of [-1,1]){const er=k==='deer'?(o.elk?[.07,.22]:[.06,.2]):k==='wolf'?(o.fox?[.07,.22]:o.lynx?[.06,.2]:o.ahma?[.05,.07]:[.055,.17]):[.05,.11];const e=new THREE.Mesh(new THREE.ConeGeometry(er[0]*s,er[1]*s,5),mH);
    e.position.set(sd*.1*s,.26*s,0);e.rotation.set(-.2,0,-sd*(k==='deer'?.9:.25));e.scale.set(1,1,.45);e.castShadow=true;head.add(e);
    if(o.earTip){const t=new THREE.Mesh(new THREE.ConeGeometry(er[0]*s*.55,er[1]*s*.3,5),F(o.earTip));t.position.y=er[1]*s*.36;e.add(t);}
    if(o.lynx){const t=new THREE.Mesh(new THREE.ConeGeometry(.012*s,.12*s,4),F(0x151210));t.position.y=er[1]*s*.62;e.add(t);}}   // ilveksen tupsut
  if(o.lynx)for(const sd of [-1,1])rnd(head,sd*.12*s,-.02*s,.04*s,.09*s,F(o.ruff||0xe6dccb),.7,1.1,.8,7);   // poskiparta
  if(o.elk){rnd(head,0,-.02*s,.5*s,.075*s,mH,1.1,.9,1,7);const bl=tube(g,.03*s,.05*s,.26*s,mD,0,by-.02*s,bz+.05*s,1,1,6);bl.rotation.x=.2;   // roikkuva kuono + kaulaparta
    rnd(g,0,by+.24*s,.32*s*L,.2*s,mD,.9,.8,1.3,8);}   // lapojen kyttyrä
  // v0.86 hirven lapiosarvet: leveä litteä lapa sivulle ja piikit reunalla
  if(k==='deer'&&o.elk&&o.antlers){const am=F(0xc8b48a);for(const sd of [-1,1]){const b=new THREE.Group();b.position.set(sd*.1*s,.2*s,-.02*s);b.rotation.set(-.15,0,-sd*1.15);head.add(b);
    tube(b,.025*s,.03*s,.16*s,am,0,.08*s,0,1,1,6);const pl=rnd(b,0,.21*s,-.02*s,.17*s,am,1,.16,1.15,8);pl.rotation.x=.15;
    for(let i=0;i<5;i++){const t=tube(b,.011*s,.016*s,.12*s,am,(-.12+i*.06)*s,.27*s,.15*s-Math.abs(i-2)*.04*s,1,1,5);t.rotation.x=.35;}}}
  // v0.85 poron sarvet: pitkät taaksepäin kaartuvat päärungot, lapiomainen kulmahaara eteen ja piikit ylös
  if(k==='deer'&&o.rein){const am=F(0xcdbd98);for(const sd of [-1,1]){const b=new THREE.Group();b.position.set(sd*.07*s,.24*s,-.02*s);b.rotation.set(-.7,0,-sd*.3);head.add(b);
    // päärunko kaartuu ensin taakse ja ylös, sitten kärki eteen; piikit osoittavat eteen-ylös
    let y=0,zz=0;for(let i=0;i<5;i++){const l=.17*s,a=-.45+.38*i,t=tube(b,.015*s,.021*s,l*1.08,am,0,y+Math.cos(a)*l/2,zz+Math.sin(a)*l/2,1,1,6);t.rotation.x=a;y+=Math.cos(a)*l;zz+=Math.sin(a)*l;
      if(i>=2){const tn=tube(b,.009*s,.013*s,.12*s,am,sd*.02*s,y-.03*s,zz+.04*s,1,1,5);tn.rotation.set(1.1,0,-sd*.25);}}
    const br=new THREE.Mesh(new THREE.BoxGeometry(.025*s,.08*s,.12*s),am);br.position.set(-sd*.02*s,.06*s,.08*s);br.rotation.x=-.6;br.castShadow=true;b.add(br);}
    rnd(g,0,by+.02*s,bz-.06*s,.2*s,F(o.mane||0xeee8dc),1.1,1,.9,8);}  // vaalea kaulaharja
  if(k==='deer'&&o.antlers&&!o.elk){const am=F(0xd8c7a0);for(const sd of [-1,1]){const b=new THREE.Group();b.position.set(sd*.07*s,.25*s,.02*s);b.rotation.z=-sd*.35;head.add(b);
    tube(b,.018*s,.026*s,.42*s,am,0,.21*s,0,1,1,6).rotation.x=-.25;
    for(const [y,a,l] of [[.12,.9,.16],[.26,.7,.18],[.38,.5,.14]]){const t=tube(b,.012*s,.016*s,l*s,am,sd*.04*s,y*s+l*s*.3,-.04*s+y*.1*s,1,1,5);t.rotation.set(-.5,0,-sd*a);}}}
  // harja ja turkki
  if(k==='boar')for(let i=0;i<9;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.04*s,(.12+(i%3)*.04)*s,4),mD);c.position.set(0,by+.27*s-Math.abs(i-3)*.012*s,(.45-i*.11)*s*L);c.rotation.x=-.4;c.castShadow=true;g.add(c);}
  if(k==='wolf'){for(const [x,y,z,r] of [[0,.1,.42,.2],[-.15,.02,.38,.15],[.15,.02,.38,.15],[0,-.05,.5,.16]])rnd(g,x*s,by+y*s,z*s*L,r*s,o.ruff?F(o.ruff):mB,1,1,.9,8);}
  if(o.ice){const ic=smat(0xdff6ff,{flatShading:true,emissive:0x2a6080,emissiveIntensity:.5});for(let i=0;i<6;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.04*s,(.16+(i%2)*.08)*s,4),ic);c.position.set((i%2?.05:-.05)*s,by+.28*s,(.38-i*.14)*s*L);c.rotation.set(-.3,0,(i%2?-.25:.25));c.castShadow=true;g.add(c);}}
  if(k==='deer'&&!o.rein&&!o.elk){rnd(g,0,by+.08*s,-.6*s*L,.12*s,F(0xf1ebe0),1,1.1,.6,8);for(let i=0;i<7;i++)rnd(g,((i%2)?.17:-.17)*s,by+.12*s-(i%3)*.04*s,(.25-i*.08)*s*L,.022*s,F(0xe6dccb),1,1,1,5);}
  // jalat: lapa/reisi, polvi, sääri, kavio/tassu (polvi koukistuu animaatiossa)
  // v0.81: nivel on rungon sisällä (by − 0,1) ja yläpäässä lihaksikas lapa/reisi, joka sulautuu kylkeen → jalka ei irtoa rungosta
  // (ennen nivel oli rungon alapuolella y = lh, jolloin peuralla jäi näkyvä rako). Polven korkeus maasta on ennallaan (lh/2).
  const legs=[],pivY=by-.1*s,up=pivY-lh*.5*s;for(const [x,z,fr] of [[-.17,.44,1],[.17,.44,1],[-.17,-.44,0],[.17,-.44,0]]){
    const p=new THREE.Group();p.position.set(x*s,pivY,z*s*L);g.add(p);const th=(k==='deer'?.06:k==='boar'?.09:k==='hare'?.06:k==='bear'?.13:.07)*(o.rein?1.25:o.fox?.8:1);
    rnd(p,0,-.05*s,0,(th+.075)*s,fr?mB:(o.rump?F(o.rump):mB),.8,1.75,1.3,8);   // lapa (edessä) / reisi (takana)
    tube(p,(th+.045)*s,th*s,up+.04*s,fr?mL:mB,0,-up/2,0,1,1,7);
    const kn=new THREE.Group();kn.position.set(0,-up,0);p.add(kn);rnd(kn,0,0,0,th*.9*s,mL,1,1,1,6);
    tube(kn,th*.8*s,th*.65*s,lh*.48*s,mL,0,-lh*.24*s,0,1,1,6);
    if(k==='wolf'||k==='hare'||k==='bear')rnd(kn,0,-lh*.49*s,.03*s,th*1.15*s,mD,1,.6,k==='hare'&&!fr?2.6:1.4,6);else tube(kn,th*.75*s,th*.9*s,.06*s,mHoof,0,-lh*.48*s,.01*s,1,1,6);
    p.userData.knee=kn;p.userData.front=fr;legs.push(p);}
  // häntä
  const tl=new THREE.Group();tl.position.set(0,by+.12*s,-.62*s*L);g.add(tl);
  if(k==='wolf'&&o.lynx){rnd(tl,0,-.02*s,-.06*s,.06*s,mB,1,1,1.5,6);rnd(tl,0,-.03*s,-.14*s,.045*s,F(0x151210),1,1,1,6);tl.rotation.x=.3;}   // töpöhäntä
  else if(k==='wolf'&&o.ahma){rnd(tl,0,-.04*s,-.12*s,.1*s,mD,1,1,1.8,7);tl.rotation.x=.6;}
  else if(k==='wolf'&&o.fox){for(let i=0;i<4;i++)rnd(tl,0,-i*.05*s,-.12*s-i*.13*s,(.1+(i===1?.03:i===2?.025:0))*s,i===3?F(o.tailTip||0xf4efe6):mB,1,1,1.7,7);tl.rotation.x=.75;}  // tuuhea ketunhäntä
  else if(k==='wolf'){for(let i=0;i<3;i++)rnd(tl,0,-i*.09*s,-.1*s-i*.1*s,(.09-i*.012)*s,i===2?F(o.tailTip||0x2a2a2c):mB,1,1,1.6,7);tl.rotation.x=.5;}
  else if(k==='hare'){rnd(tl,0,-.02*s,-.02*s,.09*s,F(0xf7f4ee),1,1,.9,7);}
  else if(k==='bear'){rnd(tl,0,-.04*s,0,.07*s,mB,1,1,1,6);rnd(g,0,by+.3*s,.3*s*L,.26*s,mB,1,.8,1.4,9);}   // töpöhäntä + lapojen kyttyrä
  else if(k==='boar'){tube(tl,.015*s,.02*s,.25*s,mD,0,-.12*s,-.03*s,1,1,5).rotation.x=.3;rnd(tl,0,-.25*s,-.07*s,.035*s,mD,1,1.4,1,5);}
  else{rnd(tl,0,0,-.04*s,.06*s,o.elk||o.rein?mD:F(0xf4efe6),1,1.3,.7,6);}
  if(o.chest)rnd(g,0,by+.04*s,bz+.02*s,.12*s,F(o.chest),.9,1.25,.7,8);
  // v0.88 pelottavat: hehkuvat silmät (additiivinen hehku), selkäpiikit/sammal, kalmasuden kylkiluut
  if(o.glow){const gm=new THREE.MeshBasicMaterial({color:o.glow,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
    for(const sd of [-1,1]){const hx=new THREE.Mesh(new THREE.SphereGeometry(.06*s,8,6),gm);hx.position.set(sd*.11*s,.13*s,.18*s);head.add(hx);}}
  if(o.spikes){const sp=F(o.spikes),ms=F(0x3e5a2a);for(let i=0;i<8;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(.05*s,(.18+(i%3)*.08)*s,5),sp);c.position.set((i%2?.06:-.06)*s,by+.38*s-Math.abs(i-3)*.02*s,(.45-i*.13)*s*L);c.rotation.set(-.35,0,i%2?-.3:.3);c.castShadow=true;g.add(c);}
    for(const [x,z,r] of [[-.25,.1,.14],[.22,-.2,.12],[0,-.4,.13],[.2,.35,.1]])rnd(g,x*s,by+.22*s,z*s*L,r*s,ms,1.2,.5,1.2,6);}
  if(o.ribs){const rm=F(o.ribs);for(const sd of [-1,1])for(let i=0;i<5;i++){const r=rnd(g,sd*.255*s,by+.02*s,(.28-i*.1)*s*L,.03*s,rm,.4,3.2,.5,5);r.rotation.x=.15;}}
  if(o.spots){const sm=F(o.spots);const r=mulberry32(77);for(let i=0;i<16;i++){const a=r()*Math.PI-Math.PI/2,sd=r()<.5?-1:1,z=(r()-.5)*1.1*s*L;rnd(g,sd*.26*s*Math.cos(a*.6),by+.12*s*Math.sin(a),z,.028*s,sm,.4,1,1,5);}}   // ilveksen täplät
  if(o.stripes){const sm=F(o.stripes);for(const sd of [-1,0,1])rnd(g,sd*.12*s,by+.2*s-Math.abs(sd)*.06*s,0,.05*s,sm,.4,.4,5.5*L,6);}   // porsaan raidat
  if(o.band){const bm=F(o.band);for(const sd of [-1,1])rnd(g,sd*.245*s,by-.02*s,-.05*s*L,.075*s,bm,.35,.55,4*L,6);}   // ahman vaalea kylkijuova   // vaalea rinta (kettu)
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  return{g,legs,head,body,tail:tl,s,quad:true,animal:true,hop:k==='hare'};
}
// v0.85 Metso (maassa kävelevä kanalintu): tumma runko, vihreähohtoinen rinta, punainen kulmanaru, vaalea nokka, viuhkapyrstö,
// siivet (ryhmät räpyttelyä varten) ja kaksi nivelletöntä jalkaa. Rajapinta: g, legs[2], head, body, wings[2], tail, bird:true.
function makeBird(o){const s=o.s||1,g=new THREE.Group(),F=c=>smat(c,{flatShading:true});
  const mB=F(o.body||0x2e3036),mC=F(o.chestC||0x1f4a3c),mW=F(o.wing||0x4a3e30),mL=F(0x6a5d4c),hy=.42*s;
  const body=new THREE.Group();g.add(body);
  rnd(body,0,hy,0,.22*s,mB,1,.85,1.45,10);rnd(body,0,hy-.02*s,.16*s,.16*s,mC,1,1.05,.9,8);rnd(body,0,hy-.09*s,-.05*s,.15*s,F(0x22252a),1.05,.6,1.2,8);
  const head=new THREE.Group();head.position.set(0,hy+.27*s,.3*s);g.add(head);
  tube(g,.06*s,.09*s,.26*s,mB,0,hy+.15*s,.24*s,1,1,7).rotation.x=.45;
  rnd(head,0,0,0,.085*s,mB,1,1,1.1,8);const bk=new THREE.Mesh(new THREE.ConeGeometry(.032*s,.1*s,5),F(0xe8dfc4));bk.rotation.x=Math.PI/2;bk.position.set(0,-.015*s,.11*s);head.add(bk);
  const em=new THREE.MeshBasicMaterial({color:0x0c0a08}),rd=F(0xd23a2a);for(const sd of [-1,1]){rnd(head,sd*.06*s,.02*s,.03*s,.016*s,em,1,1,1,5);rnd(head,sd*.055*s,.045*s,.02*s,.028*s,rd,.6,.45,1.2,6);}
  rnd(head,0,-.06*s,.04*s,.04*s,F(0x15161a),1,1.3,1,6);  // parta
  const wings=[];for(const sd of [-1,1]){const w=new THREE.Group();w.position.set(sd*.17*s,hy+.06*s,.04*s);g.add(w);const wm=rnd(w,sd*.04*s,-.03*s,-.06*s,.15*s,mW,.35,.7,1.6,7);wm.rotation.z=sd*.15;wings.push(w);}
  const tail=new THREE.Group();tail.position.set(0,hy+.04*s,-.28*s);g.add(tail);for(let i=0;i<7;i++){const a=(i-3)*.22,f=prt(tail,.07*s,.015*s,.3*s,i%2?mB:F(0x24262c),Math.sin(a)*.12*s,.0,-.14*s);f.rotation.y=a;}
  tail.rotation.x=.35;
  const legs=[];for(const sd of [-1,1]){const p=new THREE.Group();p.position.set(sd*.08*s,hy-.12*s,0);g.add(p);tube(p,.018*s,.014*s,.24*s,mL,0,-.12*s,0,1,1,5);
    for(const a of [-.5,0,.5]){const t=prt(p,.012*s,.012*s,.09*s,mL,Math.sin(a)*.03*s,-.24*s,.035*s);t.rotation.y=a;}legs.push(p);}
  g.traverse(m=>{if(m.isMesh)m.castShadow=true;});
  return{g,legs,head,body,wings,tail,s,bird:true};}
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
    // Jousi: runko kaareva (selkä +z eli ampumasuuntaan, kärjet ampujaa kohti), jänne kärkien välillä ja nuoli, joka vedetään taakse ampujaa kohti (updateBowMesh).
    // v0.68: poistettu aiempi 180° kääntö, joka käänsi kaaren ampujaan päin ja jänteen venymään eteenpäin.
    case 'jousi':case 'hiidenjousi':{const R=.62,arc=1.9,geo=new THREE.TorusGeometry(R,.032,6,16,arc);geo.rotateZ(-arc/2);geo.rotateY(-Math.PI/2);geo.translate(0,0,.12-R);
      const bm=new THREE.Mesh(geo,smat(id==='jousi'?0x8a5a32:0x5fe6d9));bm.castShadow=true;g.add(bm);
      const tipY=R*Math.sin(arc/2),tipZ=.12-R+R*Math.cos(arc/2),sm=mat(0xe7e1cf),s1=bx(.012,1,.012,sm,0,0,0,false),s2=bx(.012,1,.012,sm,0,0,0,false);g.add(s1,s2);
      const ar=new THREE.Group();ar.add(bx(.025,.025,.8,mat(0xc9b48a),0,0,.4,false),bx(.05,.05,.1,mat(0x4d535c),0,0,.82,false));ar.visible=false;g.add(ar);
      g.userData.bow={s1,s2,ar,tipY,tipZ};updateBowMesh(g,0);break;}
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
