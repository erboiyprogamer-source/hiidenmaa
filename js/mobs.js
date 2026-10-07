/* Hiidenmaa – mobs.js
   Vihollis- ja eläinmäärittelyt (MOBDEF) ja spawnMob */
'use strict';

/* ---------------- MOBS ---------------- */
/* ---------------- ULOTTUVUUKSIEN POMOT: yksityiskohtaiset mallit ---------------- */
const prt=(par,w,h,d,m,x,y,z,rx=0,ry=0,rz=0,sh=false)=>{const b=bx(w,h,d,m,x,y,z,sh);b.rotation.set(rx,ry,rz);par.add(b);return b;};
const glowM=c=>new THREE.MeshBasicMaterial({color:c});
// Heilahtavat osat (viitat, ketjut, liekit): realmBossAI kallistaa niitä ajan funktiona
const swayAdd=(f,m,a,fr)=>{(f.sway||(f.sway=[])).push({m,bz:m.rotation.z,bxr:m.rotation.x,a,f:fr,p:Math.random()*6});return m;};
/* ---------------- POMOT JA HUMANOIDIT (v0.71): pelaajahahmon tyyli, makeHumanoid + yksityiskohdat ---------------- */
// Apurit: ico = särmikäs kivi/lohkare, cone = piikki, gl = hehkuva materiaali. Koordinaatit kerrotaan hahmon koolla s.
const ico=(par,r,x,y,z,m,sx=1,sy=1,sz=1,d=0)=>{const me=new THREE.Mesh(new THREE.IcosahedronGeometry(r,d),m);me.position.set(x,y,z);me.scale.set(sx,sy,sz);me.castShadow=true;par.add(me);return me;};
const cone=(par,r,h,x,y,z,m,rx=0,ry=0,rz=0,seg=6)=>{const me=new THREE.Mesh(new THREE.ConeGeometry(r,h,seg),m);me.position.set(x,y,z);me.rotation.set(rx,ry,rz);me.castShadow=true;par.add(me);return me;};
const SM=(c,o)=>smat(c,Object.assign({flatShading:true},o||{}));
// Kivijätti (Kalmanvartija s=3.1, kivivartija s=1.3): lohkareista koottu runko, hehkuvat riimuhalkeamat, sammal, kivikruunu.
function figGolem(s,big){
  const f=makeHumanoid({s,body:0x5d5a54,skin:0x6f6b63,legs:0x4a4742,boot:0x3d3a35,joint:0x55524b,belt:0x34312c,eyes:0x7ffff0,wide:1.22,flat:1,shoulder:0x4f4c46,handMat:0x5b5853});
  const T=f.torso,H=f.head,st=SM(0x67635b),dk=SM(0x4a4742),lt=SM(0x7e796f),moss=SM(0x4d7a3a),gm=MAT.glow;
  // rintalevyt ja selkälohkareet
  ico(T,.2*s,-.11*s,.12*s,.13*s,lt,1.1,.9,.5);ico(T,.19*s,.12*s,.1*s,.13*s,st,1.1,.95,.5);ico(T,.16*s,0,-.18*s,.12*s,dk,1.3,.7,.5);
  ico(T,.26*s,0,.18*s,-.14*s,dk,1.4,.9,.7);ico(T,.13*s,-.16*s,-.12*s,-.15*s,st,1,1,.6);ico(T,.13*s,.17*s,-.14*s,-.13*s,lt,1,1,.6);
  // hehkuvat riimuhalkeamat rinnassa (pysty + vaaka + vinot)
  prt(T,.035*s,.42*s,.02*s,gm,0,.02*s,.2*s);prt(T,.26*s,.035*s,.02*s,gm,0,.12*s,.2*s);prt(T,.03*s,.18*s,.02*s,gm,-.09*s,-.12*s,.19*s,0,0,.6);prt(T,.03*s,.18*s,.02*s,gm,.09*s,-.12*s,.19*s,0,0,-.6);
  // olkalohkareet sammaleineen
  for(const a of [f.armL,f.armR]){ico(a,.17*s,0,.06*s,0,st,1.25,.85,1.1);ico(a,.1*s,0,.16*s,.02*s,moss,1.3,.35,1.1);prt(a,.03*s,.2*s,.02*s,gm,0,-.18*s,.08*s);}
  // kyynärvarren lohkareet ja nyrkit
  for(const e of [f.elbowL,f.elbowR]){ico(e,.1*s,0,-.12*s,.02*s,dk,1,1.3,1);ico(e,.07*s,.04*s,-.25*s,-.03*s,st);}
  for(const h of [f.hand,f.handL]){ico(h,.11*s,0,-.02*s,.01*s,lt,1.1,1,1);for(let i=0;i<3;i++)ico(h,.035*s,(i-1)*.05*s,-.08*s,.07*s,dk);}
  // polvet ja jalat
  for(const k of [f.kneeL,f.kneeR]){ico(k,.09*s,0,0,.05*s,st);ico(k,.1*s,0,-.33*s,.07*s,dk,1.1,.6,1.5);}
  // lannevaate kivilaatoista
  for(let i=0;i<5;i++)prt(T,.09*s,.2*s,.05*s,i%2?dk:st,(i-2)*.1*s,-.46*s,.15*s,.12,0,(i-2)*.06);
  // pää: kulmakaari, leuka ja hehkuva suu, kivikruunu ja sammaltupsu
  ico(H,.21*s,0,.28*s,0,st,.95,1.05,1);prt(H,.32*s,.07*s,.1*s,dk,0,.36*s,.15*s,.2);ico(H,.13*s,0,.12*s,.12*s,dk,1.3,.7,.9);
  prt(H,.16*s,.025*s,.02*s,gm,0,.17*s,.21*s);
  for(let i=0;i<7;i++){const a=i/7*TAU,r=.17*s;cone(H,.045*s,(.16+(i%2)*.1)*s,Math.sin(a)*r,.5*s,Math.cos(a)*r,i%3?st:lt,Math.cos(a)*.35,0,-Math.sin(a)*.35);}
  ico(H,.09*s,-.12*s,.44*s,-.06*s,moss,1.3,.4,1.1);
  if(big){// Kalmanvartija: selässä riimukivimonoliitti ja olkapiikit
    const mono=prt(T,.3*s,.55*s,.12*s,dk,0,.45*s,-.28*s,-.12);prt(mono,.04*s,.36*s,.02*s,gm,0,0,.07*s);prt(mono,.18*s,.035*s,.02*s,gm,0,.08*s,.07*s);
    for(const a of [f.armL,f.armR])for(let i=0;i<3;i++)cone(a,.04*s,.22*s,(i-1)*.08*s,.2*s,-.02*s,lt,-.2,0,(i-1)*.3);}
  return f;}
// Kalmon ylimys: luurankoaatelinen – kallo silmäkuopissa hehkuvat liekit, leuka ja hampaat, ruostunut pronssikruunu,
// olkapanssari, repaleinen tummanpunainen viitta ja tabardi, vyö kallosoljella, pitkä ruostunut miekka.
function figYlimys(){
  const s=1.3,f=makeHumanoid({s,skel:1,body:0xd9d2bf,skin:0xe6e0cf,legs:0xcdc6b2,joint:0xc9c1ab,thin:1,handMat:0xd9d2bf}),T=f.torso,H=f.head;
  const bone=SM(0xe2dccb),dk=new THREE.MeshBasicMaterial({color:0x0b0806}),fire=glowM(0xff7a3a),bronze=SM(0x8f5326,{metalness:.5,roughness:.6}),rust=SM(0x6b4a33,{metalness:.4}),red=SM(0x5a1a22),red2=SM(0x40141a),steel=SM(0x58606b,{metalness:.55,roughness:.5});
  // kallo: silmäkuopat, liekkisilmät, nenäaukko, poskiluut, leuka ja hampaat
  for(const x of [-.075,.075]){rnd(H,x*s,.3*s,.15*s,.05*s,dk,1,.9,.6,6);rnd(H,x*s,.3*s,.18*s,.022*s,fire,1,1,.6,6);}
  cone(H,.025*s,.05*s,0,.22*s,.19*s,dk,Math.PI,0,0,3);rnd(H,0,.12*s,.08*s,.12*s,bone,1,.55,1,8);
  for(let i=0;i<6;i++)prt(H,.022*s,.035*s,.02*s,bone,(-.06+i*.024)*s,.17*s,.18*s);
  // kruunu: rengas + piikit + punaiset kivet
  const cr=new THREE.Mesh(new THREE.TorusGeometry(.17*s,.025*s,5,14),bronze);cr.rotation.x=Math.PI/2;cr.position.y=.42*s;H.add(cr);
  for(let i=0;i<7;i++){const a=i/7*TAU;cone(H,.025*s,(.1+(i%2)*.06)*s,Math.sin(a)*.17*s,.5*s,Math.cos(a)*.17*s,bronze);if(i%2===0)rnd(H,Math.sin(a)*.175*s,.43*s,Math.cos(a)*.175*s,.018*s,glowM(0xc0302a),1,1,1,5);}
  // olkapanssari (vasen) ja rintakehän tabardi
  ico(f.armL,.13*s,.02*s,.04*s,0,rust,1.2,.7,1.1);for(let i=0;i<3;i++)prt(f.armL,.2*s,.03*s,.18*s,bronze,.03*s,(-.04-i*.06)*s,0,0,0,-.25);
  prt(T,.16*s,.42*s,.02*s,red,0,-.42*s,.16*s,-.08);prt(T,.04*s,.42*s,.025*s,bronze,0,-.42*s,.17*s,-.08);
  // vyö ja kallosolki
  tube(T,.2*s,.2*s,.06*s,rust,0,-.3*s,0,1.15,.7,8);rnd(T,0,-.3*s,.15*s,.05*s,bone,1,1,.7,6);
  // repaleinen viitta (heiluu) ja ketjut
  [[-.17,1.05],[0,1.2],[.17,1.0]].forEach(([x,h],i)=>swayAdd(f,prt(T,.2*s,h*s,.02*s,i%2?red2:red,x*s,(.33-h/2)*s,-.16*s,.1,0,(i-1)*.05),.06,1.2+i*.25));
  // miekka
  const sw=f.hand;prt(sw,.05*s,.025*s,.95*s,steel,0,-.02*s,.55*s);prt(sw,.24*s,.04*s,.05*s,bronze,0,-.02*s,.07*s);prt(sw,.035*s,.035*s,.16*s,SM(0x3a2a1c),0,-.02*s,-.02*s);rnd(sw,0,-.02*s,-.11*s,.03*s,bronze,1,1,1,6);
  return f;}
// Kalmo: luurankosoturi – hehkuvat syaanit silmät, repaleinen lannevaate, ruostunut olkalevy ja kirves
function figKalmo(){
  const s=1,f=makeHumanoid({s,skel:1,body:0xd9d2bf,skin:0xe6e0cf,legs:0xcdc6b2,joint:0xc9c1ab,thin:1,handMat:0xd9d2bf}),T=f.torso,H=f.head;
  const bone=SM(0xe2dccb),dk=new THREE.MeshBasicMaterial({color:0x0b0806}),eye=glowM(0x7fffe8),rag=SM(0x3a352d),rust=SM(0x6b4a33,{metalness:.4}),wood=SM(0x5a3d22);
  for(const x of [-.075,.075]){rnd(H,x*s,.3*s,.15*s,.048*s,dk,1,.9,.6,6);rnd(H,x*s,.3*s,.18*s,.02*s,eye,1,1,.6,6);}
  rnd(H,0,.12*s,.08*s,.11*s,bone,1,.5,1,8);for(let i=0;i<5;i++)prt(H,.02*s,.03*s,.02*s,bone,(-.05+i*.025)*s,.16*s,.18*s);
  for(let i=0;i<4;i++)swayAdd(f,prt(T,.11*s,(.28+(i%2)*.1)*s,.02*s,rag,(-.16+i*.11)*s,-.5*s,.12*s,.1,0,(i-1.5)*.08),.08,1.5+i*.3);
  ico(f.armR,.11*s,-.02*s,.04*s,0,rust,1.2,.6,1.1);
  const ax=f.hand;prt(ax,.035*s,.035*s,.75*s,wood,0,-.02*s,.3*s);prt(ax,.03*s,.22*s,.16*s,rust,0,-.08*s,.6*s);
  return f;}
// Sammalhiisi: iso pää, pitkät suippokorvat, kyömynenä, leveä suu kulmahampain, kaarnaiho, sammaltupsut, oksasarvet, lehtihame ja nuija
function figHiisi(){
  const s=.78,f=makeHumanoid({s,body:0x4b5e2c,skin:0x6a7a3a,legs:0x3d3226,boot:0x2f2618,eyes:0xffe36a,headS:1.3,belt:0x5e3b1f}),T=f.torso,H=f.head,hs=1.3*s;
  const sk=SM(0x6a7a3a),moss=SM(0x4d7a2a),bark=SM(0x5e3b1f),leaf=SM(0x5f8a3a),dk=new THREE.MeshBasicMaterial({color:0x140c06}),tooth=SM(0xeee6c8);
  for(const sd of [-1,1]){cone(H,.06*hs,.32*hs,sd*.24*hs,.34*hs,-.02*hs,sk,0,0,-sd*1.25);}
  rnd(H,0,.24*hs,.21*hs,.055*hs,sk,.9,1,1.5,8);prt(H,.17*hs,.025*hs,.02*hs,dk,0,.14*hs,.18*hs);
  for(const sd of [-1,1])cone(H,.015*hs,.05*hs,sd*.06*hs,.15*hs,.18*hs,tooth,Math.PI);
  prt(H,.22*hs,.04*hs,.07*hs,SM(0x55652e),0,.37*hs,.15*hs,.25);
  for(const sd of [-1,1]){const b=tube(H,.015*hs,.022*hs,.3*hs,bark,sd*.1*hs,.55*hs,-.02*hs);b.rotation.z=-sd*.4;tube(H,.012*hs,.015*hs,.14*hs,bark,sd*.18*hs,.66*hs,0).rotation.z=-sd*1.1;}
  for(const [x,y,z,r] of [[0,.2,-.13,.13],[-.12,.28,-.08,.09],[.13,.25,-.1,.1],[0,-.05,-.13,.1]])rnd(T,x*s,y*s,z*s,r*s,moss,1.2,.7,.8,7);
  for(const a of [f.armL,f.armR])rnd(a,0,.07*s,0,.08*s,moss,1.3,.6,1.2,7);
  for(let i=0;i<7;i++){const a=i/7*TAU;cone(T,.07*s,.26*s,Math.sin(a)*.2*s,-.42*s,Math.cos(a)*.13*s,leaf,Math.PI+Math.cos(a)*.25,0,-Math.sin(a)*.25,4);}
  const cl=f.hand;tube(cl,.03*s,.045*s,.6*s,bark,0,-.02*s,.28*s).rotation.x=Math.PI/2;rnd(cl,0,-.02*s,.6*s,.1*s,bark,1,1,1.3,7);for(let i=0;i<3;i++)cone(cl,.02*s,.07*s,(i-1)*.07*s,.06*s,.62*s,tooth);
  return f;}
// v0.88 Suonäkki: suon sammaloitunut, pitkäkätinen olento: roikkuva sammal ja kaislat heiluvat, hehkuvat keltaiset silmät, kynnet.
function figSuonakki(){
  const s=1.25,f=makeHumanoid({s,body:0x2e3a22,skin:0x3e4a2a,legs:0x2a2a1c,boot:0x1e1e14,eyes:0xffe36a,headS:1.15,thin:1}),T=f.torso,H=f.head,hs=1.15*s;
  const moss=SM(0x4a6a2a),dark=SM(0x22301a),reed=SM(0x8a8a4a),claw=SM(0xd8d0b0),mud=SM(0x3a2e20);
  const gm=new THREE.MeshBasicMaterial({color:0xffe36a,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  for(const sd of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.05*hs,8,6),gm);e.position.set(sd*.08*hs,.22*hs,.2*hs);H.add(e);}
  for(let i=0;i<9;i++){const a=i/9*TAU;swayAdd(f,prt(H,.05*hs,.35*hs,.03*hs,i%2?moss:dark,Math.sin(a)*.16*hs,.05*hs,Math.cos(a)*.14*hs),.15,1.1+i*.13);}   // sammalhiukset
  for(let i=0;i<10;i++){const a=i/10*TAU;swayAdd(f,prt(T,.07*s,.5*s,.04*s,i%3?moss:mud,Math.sin(a)*.22*s,-.25*s,Math.cos(a)*.14*s),.12,.9+i*.1);}   // roikkuva sammal
  for(let i=0;i<5;i++)cone(T,.012*s,.6*s,(i-2)*.07*s,.45*s,-.15*s,reed,-.3,0,(i-2)*.15,4);   // kaislat selässä
  for(const a of [f.armL,f.armR])for(let i=0;i<3;i++)swayAdd(f,prt(a,.06*s,.5,.05*s,moss,(i-1)*.06*s,-.45*s-i*.08,.08*s),.15,1.3+i*.2);
  for(const h of [f.hand,f.handL])for(let i=0;i<3;i++)cone(h,.02*s,.2*s,(i-1)*.05*s,-.12*s,.06*s,claw,Math.PI,0,0,4);
  return f;}
// Jäätär: köyristynyt jääakka, pitkät jääpiikkihiukset, jääkruunu, repaleinen huurrevaippa ja kynnet
function figJaatar(){
  const f=makeHumanoid({s:1.85,body:0x9ab8d0,skin:0xcfe4f2,legs:0x7f9db5,eyes:0xbff4ff,wide:1.15,armMat:0xa9c6dc,headS:1.05}),T=f.torso,H=f.head,hip=.8*1.85;
  const ice=mat(0xdff2ff,{emissive:0x2a5a80,emissiveIntensity:.6}),dk=mat(0x4a6a88),cl=mat(0x587a9c),gl=glowM(0xaee8ff),bone=mat(0xf2f8ff);
  for(let i=0;i<9;i++){const x=(i-4)*.13,len=1.1+((i*37)%5)*.22,rx=-.75-(i%3)*.12,dy=Math.cos(rx),dz=Math.sin(rx);prt(H,.12,len,.12,ice,x*1.6,.55+dy*len/2,-.25+dz*len/2,rx,0,(i-4)*.1);}
  for(let i=0;i<5;i++)prt(H,.1,.5+((i*3)%3)*.2,.1,ice,(i-2)*.16,.98,.05,0,0,(i-2)*.2);
  prt(H,.5,.12,.4,dk,0,.04,.1);for(const x of [-.14,.14])prt(H,.07,.24,.07,bone,x,-.08,.42);
  for(const [x,h,rz,z] of [[-.4,1.3,.35,-.2],[.4,1.1,-.35,-.2],[-.18,.8,.2,-.35]])prt(H,.1,h,.1,ice,x,.5+h/2,z,-.2,0,rz);
  [[-.55,2.2],[-.18,1.7],[.2,2.4],[.58,1.9]].forEach(([x,h],i)=>swayAdd(f,prt(T,.5,h,.06,cl,x,.7-h/2,-.4,.12,0,(i-1.5)*.05),.07,1.3+i*.2));
  for(const sd of [-1,1]){prt(T,.3,1.1,.3,ice,sd*.85,.85,0,0,0,-sd*.5);prt(T,.2,.7,.2,ice,sd*1.05,.55,.1,0,0,-sd*.9);prt(T,.2,.6,.2,ice,sd*.7,1.05,-.1,-.3,0,-sd*.2);}
  prt(T,.34,.34,.06,gl,0,.15,.37);for(const x of [-.3,0,.3])prt(T,.1,.1,.45,ice,x,-.15-(x?0:.1),.5,.25);
  for(const h of [f.hand,f.handL])for(let i=0;i<3;i++)prt(h,.06,.06,.75,ice,(i-1)*.12,-.18,.45,.45,0,0);
  for(const L of [f.legL,f.legR]){prt(L,.46,.4,.62,dk,0,-hip+.2,.08);prt(L,.12,.45,.12,ice,0,-hip*.5,.2,.3);}
  prt(f.g,1.4,.3,.5,mat(0x587a9c),0,hip+.1,-.15);
  return f;}
// Kalmaherra: luurankokuningas – kylkiluut, sarvikypärä-kallo, kruunu, kalloolkapäät, viitta, ketjut ja uurrettu suurmiekka
function figKalmaherra(){
  const f=makeHumanoid({s:1.75,body:0x2a2230,skin:0xdcd5c2,legs:0x1d1824,eyes:0xff4a2a,thin:1,armMat:0xcfc6ae,headS:1.1}),T=f.torso,H=f.head,hip=.8*1.75;
  const bone=mat(0xe2dccb),dkc=mat(0x241f2e),gold=mat(0xb8893a,{metalness:.6}),steel=mat(0x7a8590,{metalness:.5}),red=mat(0x5a1a22),blk=glowM(0x050303);
  prt(f.g,1.25,1.3,.8,dkc,0,hip*.55,0);for(let i=0;i<7;i++)prt(f.g,.22,.3+((i*5)%4)*.2,.06,dkc,-.5+i*.17,.4,.4,(i%2)*.08);
  for(let i=0;i<5;i++)prt(T,1-i*.06,.07,.1,bone,0,.5-i*.2,.36);prt(T,.08,1.3,.08,bone,0,0,.34);
  prt(H,.6,.16,.48,bone,0,.03,.22);for(let i=0;i<5;i++)prt(H,.06,.1,.05,glowM(0xf2ecdc),-.18+i*.09,.12,.46);
  for(const x of [-.17,.17]){prt(H,.2,.17,.05,blk,x,.46,.45);prt(H,.1,.08,.06,glowM(0xff4a2a),x,.46,.47);}prt(H,.1,.14,.05,blk,0,.3,.46);
  for(const sd of [-1,1]){prt(H,.15,.6,.15,bone,sd*.4,.75,0,0,0,-sd*.45);prt(H,.12,.5,.12,bone,sd*.72,1.05,.05,.4,0,-sd*1.1);prt(H,.1,.35,.1,bone,sd*.86,1.3,.2,.8,0,-sd*1.2);}
  prt(H,.78,.13,.74,gold,0,.8,0);for(let i=0;i<5;i++)prt(H,.1,.3+(i%2)*.2,.1,gold,-.3+i*.15,1,.34);
  for(const sd of [-1,1]){const sk=prt(T,.42,.38,.42,bone,sd*.78,.7,0);for(let k=0;k<3;k++)prt(sk,.07,.5,.07,mat(0x3a352d),(k-1)*.12,.35,0,0,0,(k-1)*.3);prt(sk,.1,.1,.04,blk,-.1,.03,.22);prt(sk,.1,.1,.04,blk,.1,.03,.22);}
  swayAdd(f,prt(T,1.2,2.6,.07,red,0,-.65,-.4,.1),.05,1.1);swayAdd(f,prt(T,.4,2.0,.06,mat(0x401418),-.62,-.35,-.42,.1,0,.1),.08,1.6);swayAdd(f,prt(T,.4,1.8,.06,mat(0x401418),.62,-.25,-.42,.1,0,-.1),.08,1.4);
  for(let i=0;i<5;i++)swayAdd(f,prt(f.g,.05,.9+(i%2)*.3,.05,steel,-.5+i*.25,hip+.35-.45,.44,0),.12,1.8+i*.3);
  const sw=f.hand;prt(sw,.24,.08,2.7,steel,0,0,1.3);for(let i=0;i<5;i++)prt(sw,.08,.1,.22,steel,.14,0,.6+i*.4);prt(sw,.8,.12,.16,gold,0,0,.05);prt(sw,.14,.14,.25,gold,0,0,-.22);
  prt(f.handL,.3,.3,.3,glowM(0xc060ff),0,-.12,.22);prt(f.handL,.4,.4,.4,mat(0x6a2a8a,{transparent:true,opacity:.4}),0,-.12,.22);
  for(const L of [f.legL,f.legR])prt(L,.3,.3,.5,bone,0,-hip+.15,.1);
  return f;}
// Aarnihirviö: sammaloitunut puumainen peto – valtavat haarautuvat sarvet, torahampaat, neljä silmää, kaarnalevyt, köynnökset ja hohtavat sienet
function figAarni(){
  const f=makeHumanoid({s:1.7,body:0x3f5a2c,skin:0x5a7a3a,legs:0x2e3f20,eyes:0xffd23a,wide:1.3,armMat:0x4b6b30,headS:1.2}),T=f.torso,H=f.head,hip=.8*1.7;
  const wood=mat(0x4a3320),bark=mat(0x3a2a1c),moss=mat(0x5f8a3a),bone=mat(0xe7e1cf),tc=glowM(0x6ff0d8),vine=mat(0x3f7a2a);
  for(const sd of [-1,1]){prt(H,.14,1.6,.14,wood,sd*.36,1.4,-.05,0,0,-sd*.3);
    for(let k=0;k<4;k++){const y=.9+k*.38;prt(H,.1,.8-k*.07,.1,wood,sd*(.62+k*.2),y+.3,.02+(k%2)*.12,0,0,-sd*.75);prt(H,.07,.3,.07,bone,sd*(.9+k*.26),y+.62,.02+(k%2)*.12,0,0,-sd*.75);}
    prt(H,.09,.6,.09,wood,sd*.3,.9,.4,.9,0,-sd*.2);prt(H,.1,.5,.1,bone,sd*.3,-.1,.52,.2);prt(H,.12,.45,.12,bone,sd*.34,-.02,.5,.35,0,-sd*.15);}
  prt(H,.7,.14,.06,glowM(0x1a1208),0,.14,.58);for(const sd of [-1,1])prt(H,.08,.06,.03,glowM(0xffd23a),sd*.3,.82,.55);
  for(const sd of [-1,1]){prt(T,.7,.34,.8,moss,sd*.95,.75,0,0,0,-sd*.1);prt(T,.3,.3,.3,tc,sd*1.0,1.0,.1);}
  for(const [x,y,z,w,h] of [[-.3,.2,.38,.5,.4],[.35,-.15,.38,.45,.5],[-.35,-.3,.38,.4,.3],[0,.45,.38,.4,.25]])prt(T,w,h,.14,bark,x,y,z);
  prt(T,1.2,.7,.55,bark,0,.55,-.45);
  [[-.4,.95],[0,1.15],[.4,.9],[-.15,.7],[.25,.75]].forEach(([x,h],i)=>{prt(T,.08,h*.6,.08,bone,x,.9+h*.3,-.5);prt(T,.36,.16,.36,tc,x,.9+h*.6,-.5);});
  for(const a of [f.armL,f.armR])for(let i=0;i<3;i++)swayAdd(f,prt(a,.07,.9+i*.2,.07,vine,(i-1)*.18,-.5-i*.1,.15,0),.14,1.2+i*.3);
  for(const h of [f.hand,f.handL]){prt(h,.55,.5,.55,bark,0,-.08,.05);for(let i=0;i<3;i++)prt(h,.1,.1,.7,wood,(i-1)*.18,-.25,.45,.4);}
  for(const L of [f.legL,f.legR]){prt(L,.6,.32,.9,bark,0,-hip+.16,.18);prt(L,.5,.2,.5,moss,0,-hip*.55,.05);}
  return f;}
const MOBDEF={
  peura:{n:'Peura',hp:25,r:.5,ai:'flee',walk:1.6,run:8.5,drops:[['nahka',1,2],['liha',1,2]],fig:()=>makeAnimal({kind:'deer',s:1,body:0x8a6440,dark:0x6b4a2e,legs:0x7a5636,belly:0xcdb796,rump:0x8f6a46,headC:0x7a5636,hoof:0x2a2420,antlers:1,legH:.85,len:1.05})},
  karju:{n:'Villikarju',hp:40,r:.55,ai:'neutral',walk:1.4,run:5.8,dmg:8,range:1.5,cd:1.5,wind:.35,drops:[['nahka',1,1],['liha',1,3]],fig:()=>makeAnimal({kind:'boar',s:.95,body:0x4a3a2e,dark:0x2e241c,legs:0x3a2c22,belly:0x5a4a3c,headC:0x45362a,hoof:0x1e1814,legH:.5,len:.9,eyes:0x2a0a0a})},
  // v0.85 uudet eläimet. per = luonne: scare (säikähdysetäisyyden kerroin), freeze (s, jähmettyy ensin), zig (siksak-pako),
  // fly (lehahtaa lentoon), herd (lauma pakenee yhdessä), curious (jää katsomaan matkan päästä), safe (pakoetäisyys, jonka jälkeen rauhoittuu)
  janis:{n:'Metsäjänis',hp:8,r:.3,ai:'flee',walk:1.2,run:9.5,per:{scare:1.3,freeze:.6,zig:1,safe:30},drops:[['liha',1,1],['nahka',0,1]],fig:()=>makeAnimal({kind:'hare',s:.55,body:0x8c7b62,dark:0x5e5244,legs:0x7a6a54,belly:0xe6ddcc,headC:0x857358,earTip:0x1c1814,legH:.36,len:.85,eyes:0x2a1a0a})},
  kettu:{n:'Kettu',hp:16,r:.35,ai:'flee',walk:1.5,run:8,per:{scare:1.4,curious:1,safe:35},drops:[['nahka',1,1],['liha',0,1]],fig:()=>makeAnimal({kind:'wolf',fox:1,s:.62,body:0xc0642a,dark:0x2a1e18,legs:0x2e221a,belly:0xf0e6d8,headC:0xc86c30,chest:0xf2ead8,tailTip:0xf6f2ea,earTip:0x2a1e18,legH:.5,len:1.05,eyes:0xd8a030})},
  metso:{n:'Metso',hp:10,r:.3,ai:'flee',walk:.9,run:4.5,per:{scare:.55,fly:1,safe:22},drops:[['liha',1,1],['sulka',1,3]],fig:()=>makeBird({s:1.1})},
  poro:{n:'Poro',hp:35,r:.55,ai:'flee',walk:1.4,run:7.5,per:{scare:.75,herd:1,safe:32},drops:[['nahka',1,2],['liha',2,3]],fig:()=>makeAnimal({kind:'deer',rein:1,s:1,body:0x7a6e60,dark:0x4e443a,legs:0x5a5046,belly:0xd8d0c2,rump:0xb8ae9e,headC:0x6e6254,hoof:0x2a2420,mane:0xeee8dc,legH:.75,len:1.05})},
  // v0.86 joskus vihaiset (temper): hirvi suuttuu 35 %:lla alle 6 m:ssä (muuten pakenee), ilves hyökkää öisin haavoittuneen (< 50 % hp)
  // kimppuun ja muuten väistää, ahma suuttuu jos pelaajalla on raakaa lihaa, emakko puolustaa porsaitaan (alle 7 m porsaasta). kb = tönäisy m/s.
  hirvi:{n:'Hirvi',hp:70,r:.7,ai:'neutral',temper:'elk',walk:1.4,run:7,aggro:14,dmg:14,range:2.2,cd:1.6,wind:.45,kb:9,per:{safe:34},eye:2,fh:2.6,drops:[['nahka',2,3],['liha',3,4]],fig:()=>makeAnimal({kind:'deer',elk:1,antlers:1,s:1.35,body:0x4a3a2c,dark:0x2e241a,legs:0x9a8a74,belly:0x3a2e24,rump:0x3e3226,headC:0x4e3e2e,hoof:0x1e1a16,legH:1,len:1.1})},
  ilves:{n:'Ilves',hp:30,r:.45,ai:'neutral',temper:'lynx',walk:1.3,run:8.5,aggro:20,dmg:10,range:1.6,cd:.9,wind:.25,per:{safe:30},drops:[['nahka',1,2]],fig:()=>makeAnimal({kind:'wolf',lynx:1,s:.72,body:0xb09670,dark:0x5e4c38,legs:0xa48a66,belly:0xe6dccb,headC:0xb89e78,ruff:0xe6dccb,spots:0x5a4630,legH:.62,len:.95,eyes:0xd8b040})},
  ahma:{n:'Ahma',hp:28,r:.4,ai:'neutral',temper:'ahma',walk:1.3,run:6,aggro:13,dmg:9,range:1.4,cd:1,wind:.25,drops:[['nahka',1,2]],fig:()=>makeAnimal({kind:'wolf',ahma:1,s:.66,body:0x3a2a20,dark:0x22180f,legs:0x22180f,belly:0x2e2219,headC:0x34261c,band:0xb08a5a,legH:.38,len:1.15,eyes:0x1a0a05})},
  emakko:{n:'Villikarjuemakko',hp:45,r:.55,ai:'neutral',temper:'sow',walk:1.3,run:6,aggro:10,dmg:10,range:1.5,cd:1.3,wind:.35,kb:5,drops:[['nahka',1,2],['liha',2,3]],fig:()=>makeAnimal({kind:'boar',sow:1,s:1,body:0x54443a,dark:0x30261e,legs:0x40322a,belly:0x6a5a4c,headC:0x4e3f34,hoof:0x1e1814,legH:.5,len:.95,eyes:0x2a0a0a})},
  porsas:{n:'Porsas',hp:8,r:.3,ai:'flee',walk:1.6,run:6.5,per:{scare:.9,safe:14},drops:[['liha',1,1]],fig:()=>makeAnimal({kind:'boar',sow:1,s:.45,body:0x8a6a48,dark:0x4a3424,legs:0x6a4e36,belly:0xa88a6a,headC:0x80634a,stripes:0xd8c49a,hoof:0x2a2018,legH:.5,len:.9})},
  // v0.87 Karhu: neutraali (murisee 14 m:ssä, hyökkää alle 8 m:ssä tai lyötynä), lyö liikkeestä ilman pysähdystä (mobile), tönäisee kauas (kb 16),
  // kaataa jahdatessaan edessään olevat puut tukeiksi (fells), paranee 5 %/s jos ei lyöty 60 s (regen). Enintään yksi kerrallaan.
  karhu:{n:'Karhu',hp:120,r:.9,ai:'neutral',temper:'bear',walk:1.5,run:7.2,aggro:16,dmg:18,range:2.6,cd:.65,wind:.18,kb:16,mobile:1,fells:1,regen:{after:60,rate:.05},eye:1.6,fh:2.6,drops:[['karhuntalja',1,1],['liha',4,6]],fig:()=>makeAnimal({kind:'bear',s:1.5,body:0x4a3424,dark:0x2a1c12,legs:0x3e2c1e,belly:0x3a2a1c,headC:0x4e3828,legH:.5,len:1,eyes:0x120a04})},
  // v0.88 harvinaiset pelottavat (ai hostile + stalk): huomatessaan pelaajan seuraavat 30–60 s, sitten poistuvat 5 s ja unohtavat (pitää nähdä
  // uudelleen suuttuakseen). Vain öisin, enintään yksi kerrallaan (spawner SCARY). hello = viesti kun huomaa pelaajan.
  hiidenkarhu:{n:'Hiidenkarhu',hp:260,r:1.2,ai:'hostile',stalk:1,walk:1.5,run:7.5,aggro:32,dmg:26,range:3.2,cd:.8,wind:.22,kb:18,mobile:1,fells:1,eye:2.2,fh:3.4,hello:'Pimeydestä nousee Hiidenkarhu – sen silmät hehkuvat punaisina!',drops:[['karhuntalja',1,2],['liha',5,7],['luu',2,4]],fig:()=>makeAnimal({kind:'bear',s:2.1,body:0x1c1612,dark:0x0e0a08,legs:0x16110d,belly:0x1a140f,headC:0x201914,legH:.5,len:1.05,eyes:0xff3a1a,glow:0xff4a1a,spikes:0xd8d0b8})},
  hiidenhirvi:{n:'Hiidenhirvi',hp:220,r:1,ai:'hostile',stalk:1,walk:1.6,run:9,aggro:34,dmg:22,range:2.8,cd:1.2,wind:.4,kb:14,mist:1,eye:2.8,fh:3.6,hello:'Usvasta astuu esiin Hiiden hirvi – kalman sarvet kantavat sumua.',drops:[['nahka',3,4],['liha',4,6],['hiidenkivi',0,1]],fig:()=>makeAnimal({kind:'deer',elk:1,antlers:1,s:1.9,body:0x1a1612,dark:0x0c0a08,legs:0x2a2420,belly:0x16120e,rump:0x1c1814,headC:0x221c16,hoof:0x0a0806,legH:1.05,len:1.1,eyes:0x9affd0,glow:0x7affc0})},
  kalmasusi:{n:'Kalmasusi',hp:140,r:.7,ai:'hostile',stalk:1,walk:2,run:9.5,aggro:30,dmg:18,range:2.1,cd:.9,wind:.28,howl:1,eye:1.6,fh:2.4,hello:'Kalmasusi on vainunnut sinut!',drops:[['nahka',2,3],['luu',2,4]],fig:()=>makeAnimal({kind:'wolf',s:1.4,body:0xc8c4b8,dark:0x6e6a62,legs:0xa8a49a,belly:0xd8d4ca,ruff:0xe0dcd2,headC:0xbcb8ae,tailTip:0x5a5650,legH:.72,len:1.15,eyes:0x7ad8ff,glow:0x5ac8ff,ribs:0xeeeadc})},
  suonakki:{n:'Suonäkki',hp:160,r:.6,ai:'hostile',stalk:1,walk:1.3,run:5.5,aggro:26,dmg:20,range:2.4,cd:1.3,wind:.5,rise:1,eye:2.6,fh:3.2,weak:{fire:1.5},hello:'Lätäkkö kuplii – Suonäkki nousee suosta!',drops:[['pihka',2,4],['luu',1,3]],fig:figSuonakki},
  hiisi:{n:'Sammalhiisi',hp:34,r:.45,ai:'hostile',walk:1.5,run:5.2,aggro:12,dmg:9,range:1.7,cd:1.4,wind:.42,drops:[['pihka',0,2],['kivi',0,1]],fig:figHiisi},
  susi:{n:'Harmaasusi',hp:44,r:.5,ai:'hostile',walk:2,run:4.6,aggro:18,dmg:11,range:1.7,cd:1.15,wind:.3,drops:[['nahka',1,2]],fig:()=>makeAnimal({kind:'wolf',s:.9,body:0x6e6e70,dark:0x3e3e40,legs:0x5e5e60,belly:0xa9a49a,ruff:0x8a8a88,headC:0x7c7c7e,tailTip:0x2a2a2c,legH:.6,len:1.05,eyes:0xffcc55})},
  kalmo:{n:'Kalmo',hp:50,r:.45,ai:'hostile',walk:1.4,run:4.6,aggro:14,dmg:13,range:1.8,cd:1.5,wind:.5,weak:{blunt:1.6,pierce:.6,fire:1.3},drops:[['luu',1,3],['kivi',0,1]],fig:figKalmo},
  ylimys:{n:'Kalmon ylimys',hp:150,r:.6,ai:'hostile',walk:1.3,run:4.2,aggro:12,dmg:20,range:2.2,cd:1.8,wind:.65,weak:{blunt:1.5,pierce:.6,fire:1.3},drops:[['luu',3,5],['kupari',2,3]],fig:figYlimys},
  vartija:{n:'Kalmanvartija',hp:900,r:1.6,ai:'boss',walk:2.2,run:3.6,aggro:60,dmg:24,range:4.2,cd:2,wind:.8,weak:{blunt:1.3,pierce:.75,fire:1},drops:[['sydan',1,1],['kupari',6,8],['hiidenkivi',0,0]],fig:()=>figGolem(3.1,true)},
  kivivartija:{n:'Kivivartija',hp:220,r:.6,ai:'hostile',walk:1.2,run:3.8,aggro:13,dmg:17,range:2.55,   /* v1.31: × stride 1,1 = 2,8 m */cd:1.9,wind:.7,weak:{blunt:1.7,pierce:.5,fire:.8},drops:[['kivi',2,4],['piikivi',1,3],['kupari',0,2]],fig:()=>figGolem(1.3,false)},
  routasusi:{n:'Routasusi',hp:68,r:.5,ai:'hostile',walk:2,run:5,aggro:18,dmg:14,range:1.7,cd:1.1,wind:.28,weak:{fire:1.4},drops:[['nahka',1,2],['luu',0,1]],fig:()=>makeAnimal({kind:'wolf',ice:1,s:.95,body:0xc9dce8,dark:0x8aa6ba,legs:0xa8bfce,belly:0xeef6fb,ruff:0xe4f0f7,headC:0xd8e8f2,tailTip:0x7f9db5,legH:.62,len:1.1,eyes:0x7fe0ff})},
  jaajattari:{n:'Jäätär',hp:560,r:1.2,ai:'rboss',walk:2,run:3.6,aggro:17,dmg:22,range:3.6,cd:1.8,wind:.8,fh:4.6,eye:3.2,weak:{blunt:1.2,pierce:.8,fire:1.5},kit:['swipe','slam','throw','nova'],sum:[],drops:[['rauta',3,5],['hiidenkivi',1,1],['kupari',4,6]],fig:figJaatar},
  kalmaherra:{n:'Kalmaherra',hp:640,r:.9,ai:'rboss',walk:2.1,run:4,aggro:17,dmg:24,range:3.2,cd:1.7,wind:.75,fh:4.4,eye:3,weak:{blunt:1.4,pierce:.6,fire:1.3},kit:['swipe','charge','summon','nova'],sum:[2,3],drops:[['rauta',3,5],['hiidenkivi',1,1],['kupari',4,6]],fig:figKalmaherra},
  aarnihirvio:{n:'Aarnihirviö',hp:720,r:1.1,ai:'rboss',walk:2.2,run:4,aggro:18,dmg:26,range:3.8,cd:1.7,wind:.8,fh:5,eye:3.2,weak:{blunt:1.2,pierce:.8,fire:1.6},kit:['swipe','charge','slam','summon'],sum:[3],drops:[['rauta',4,6],['hiidenkivi',1,1],['kupari',5,7],['pihka',3,5]],fig:figAarni},
};
// v0.92 (kohta 9): kaksijalkaiset hirviöt harppovat – askel ~40 % pidempi ja tahti hitaampi, 10 % nopeampi (moveMob), keinuva vartalo
// (animMob), lyöntiulottuma +10 %. Koskee myös ulottuvuusversioita; pomot ja eläimet ennallaan.
for(const k of ['hiisi','kalmo','ylimys','kivivartija','suonakki']){MOBDEF[k].stride=1;MOBDEF[k].range=+(MOBDEF[k].range*1.1).toFixed(2);}
// v1.33 (lista 3, kohdat 5, 6, 11, 14): vaikeampi taistelu.
//  - Kaikki eläimet ja hirviöt: terveys ja vahinko +25 %.
//  - Pomot pelin vaiheen mukaan: Jäätär ×1,5 (840), Kalmaherra ×2 (1280), Aarnihirviö ×2,6 (1872), Kalmanvartija ×2,5 (2250, viimeinen).
//  - Tavallisten vihollisten lyöntiulottuma noin 20 % pelaajan omaa lyhyempi (enint. 1,9 m). Karhu, kivivartija, pelottavat ja pomot ennallaan.
const MOB_HARD=1.25,BOSS_HP_K={jaajattari:1.5,kalmaherra:2,aarnihirvio:2.6,vartija:2.5},MOB_RANGE_MAX=1.9,MOB_RANGE_KEEP=['karhu','kivivartija','hiidenkarhu','hiidenhirvi','kalmasusi','suonakki'];
for(const [k,d] of Object.entries(MOBDEF)){const bk=BOSS_HP_K[k];d.hp=Math.round(d.hp*(bk||MOB_HARD));if(d.dmg)d.dmg=Math.round(d.dmg*(bk?1.15:MOB_HARD));
  if(!bk&&d.range&&!MOB_RANGE_KEEP.includes(k)&&d.ai!=='flee')d.range=Math.min(d.range,MOB_RANGE_MAX);}
// Vaikeustaso pääkalloina terveyspalkin alla (≥3 = vaikea: palkki näkyy jo kaukaa katsottaessa, parantuu 30 s iskuttomuuden jälkeen).
const MOB_SKULL={hiidenkarhu:4,hiidenhirvi:4,kalmasusi:3,suonakki:3,karhu:3,hirvi:2,ilves:1,ahma:1,emakko:1,porsas:0,janis:0,kettu:0,metso:0,poro:0,peura:0,karju:1,hiisi:1,susi:2,kalmo:2,ylimys:3,vartija:5,kivivartija:3,routasusi:2,jaajattari:5,kalmaherra:5,aarnihirvio:5};
let mobs=[], boss=null;
function mobEyeY(m){return m.pos.y+(m.type==='vartija'?4:(m.def.eye||1.2));}
function spawnMob(type,x,z,opts={}){
  const def=MOBDEF[type],f=def.fig();const y=opts.y??terrainH(x,z);
  f.g.position.set(x,y,z);scene.add(f.g);
  const mats=[],cl=new Map();f.g.traverse(m=>{if(m.isMesh&&m.material.isMeshStandardMaterial){let c=cl.get(m.material);if(!c){c=m.material.clone();cl.set(m.material,c);mats.push(c);}m.material=c;}});
  const m={type,def,f,mats,pos:new V3(x,y,z),vel:new V3(),yaw:rng()*TAU,hp:def.hp,maxHp:def.hp,state:'idle',t:0,wander:null,atkCd:1,wind:0,angry:false,flash:0,walkPh:0,lastHit:-99,stuck:0,home:{x,z},dun:!!opts.dun,anim:0,dead:false,deadT:0,hurtT:-99};
  mobs.push(m);return m;
}
function mobRemove(m){scene.remove(m.f.g);if(m.da){if(m.da.flames)scene.remove(m.da.flames);if(m.da.pile)scene.remove(m.da.pile);}mobs.splice(mobs.indexOf(m),1);if(m===boss)boss=null;}
