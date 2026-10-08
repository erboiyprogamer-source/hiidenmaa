/* Hiidenmaa – bossmodels.js (v1.93)
   Pomojen korkealaatuiset mallit: ei palikoita vaan pyöristettyjä muotoja (kohinalla muotoillut möhkäleet, kapselit), kapenevia kaarevia
   putkia (sarvet, piikit, jääpuikot, kylkiluut, juuret, hehkuvat halkeamat), kaarevia repaleisia kankaita (viitat, helmat), kuusikulmaisia
   kristalleja ja muotoiltuja teriä. Rakenne on sama kuin ennen (makeHumanoid + lisäosat), joten animaatiot, silmien leimahdus (f.eyes),
   herätys, ryntäys ja kuoleman repeäminen (f.g:n lapset irtoavat osiksi) toimivat sellaisinaan.
   ULTRA (bossUltra): f.fx(dt,m) joka ruutu (ai.js) – silmissä liekit ja pomon ympärillä leijuu sen teeman palasia:
   Kalmanvartija riimukiviä, Jäätär jääkristalleja, Kalmaherra aavekalloja ja sieluliekki, Aarnihirviö lehtiä ja tulikärpäsiä.
   Leijuvat palat ovat f.g:n suoria lapsia → kuollessa ne irtoavat ja putoavat muiden osien mukana. Ladataan ennen mobs.js:ää. */
'use strict';
// ---------------- apurit ----------------
function bqMesh(par,geo,m,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);me.rotation.set(rx,ry,rz);me.scale.set(sx,sy,sz);me.castShadow=true;par.add(me);return me;}
function bqMat(c,o){return new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.75,metalness:0},o||{}));}
function bqGlow(c){return new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:1});}
function bqAdd(c,op){return new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op??.6,blending:THREE.AdditiveBlending,depthWrite:false});}
const bqN3=(x,y,z)=>Math.sin(x*1.7+y*3.1+1.3)*Math.sin(y*2.3+z*1.9+.7)*Math.sin(z*2.9+x*1.1+2.1);
// pyöreä möhkäle: pallo, jonka pintaa muotoillaan kohinalla (kivi, kaarna, sammal) – sileät normaalit, ei särmiä
function bqLump(r,seed=0,amp=.18,seg=12){const g=new THREE.SphereGeometry(r,seg,Math.max(6,seg*3>>2)),p=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=v.clone().normalize(),k=1+amp*(bqN3(n.x*2.3+seed,n.y*2.3,n.z*2.3)+.5*bqN3(n.x*5+seed*2,n.y*5,n.z*5));v.multiplyScalar(k);p.setXYZ(i,v.x,v.y,v.z);}
  g.computeVertexNormals();return g;}
// kapeneva putki pisteiden kautta (Catmull-Rom); r1 ≈ 0 = terävä kärki
function bqTaper(pts,r0,r1,ts=14,rs=8){const cu=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),fr=cu.computeFrenetFrames(ts,false),pos=[],idx=[],P=new THREE.Vector3();
  for(let i=0;i<=ts;i++){const t=i/ts;cu.getPointAt(t,P);const r=r0+(r1-r0)*Math.pow(t,.9),N=fr.normals[i],B=fr.binormals[i];
    for(let j=0;j<=rs;j++){const a=j/rs*TAU,c=Math.cos(a),s=Math.sin(a);pos.push(P.x+r*(c*N.x+s*B.x),P.y+r*(c*N.y+s*B.y),P.z+r*(c*N.z+s*B.z));}}
  for(let i=0;i<ts;i++)for(let j=0;j<rs;j++){const a=i*(rs+1)+j,b=a+rs+1;idx.push(a,a+1,b,b,a+1,b+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;}
const bqTube=(par,pts,r0,r1,m,ts,rs)=>bqMesh(par,bqTaper(pts,r0,r1,ts,rs),m);
// kapseli (pyöristetyt päät), pituus = lieriöosan pituus
function bqCapsule(r,len,seg=12){const p=[],h=len/2;for(let i=0;i<=6;i++){const a=-Math.PI/2+i/6*Math.PI/2;p.push(new THREE.Vector2(Math.cos(a)*r,-h+Math.sin(a)*r));}
  for(let i=0;i<=6;i++){const a=i/6*Math.PI/2;p.push(new THREE.Vector2(Math.max(1e-4,Math.cos(a)*r),h+Math.sin(a)*r));}return new THREE.LatheGeometry(p,seg);}
// kuusikulmainen kristalli (jää): kanta y=0, kärki y=h; särmät näkyvät flatShading-materiaalilla
function bqCrystal(r,h){return new THREE.LatheGeometry([new THREE.Vector2(1e-4,0),new THREE.Vector2(r*.85,h*.08),new THREE.Vector2(r,h*.2),new THREE.Vector2(r*.9,h*.74),new THREE.Vector2(1e-4,h)],6);}
// kaareva, repaleinen kangas: yläreuna y=0 (kiinnityskohta), roikkuu alas; bend kaartaa vartalon ympäri, rag = repaleinen helma
function bqCloth(w,h,bend=.15,rag=.12,seed=1){const g=new THREE.PlaneGeometry(w,h,10,14);g.translate(0,-h/2,0);const p=g.attributes.position,r=mulberry32(seed);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),u=x/(w/2),d=-y/h;let z=-bend*u*u*w*.5+Math.sin(u*3+d*4+seed)*.03*d;let yy=y;
    if(d>.82)yy-=r()*rag*h*(d-.82)/.18*(.5+.5*Math.sin(u*9+seed));p.setXYZ(i,x,yy,z);}
  g.computeVertexNormals();return g;}
// helma (avoin kartio), hammastettu alareuna
function bqSkirt(rt,rb,h,teeth=12,depth=.18,seed=3){const g=new THREE.CylinderGeometry(rt,rb,h,teeth*2,4,true),p=g.attributes.position,r=mulberry32(seed);
  for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<-h/2+.001){const a=Math.atan2(p.getZ(i),p.getX(i));p.setY(i,y-depth*h*(.5+.5*Math.cos(a*teeth))*(.6+.4*r()));}}
  g.computeVertexNormals();return g;}
// liekki (pisaranmuoto, additiivinen)
function bqFlameGeo(r,h){return new THREE.LatheGeometry([new THREE.Vector2(1e-4,0),new THREE.Vector2(r*.8,h*.12),new THREE.Vector2(r,h*.3),new THREE.Vector2(r*.55,h*.65),new THREE.Vector2(1e-4,h)],10);}
// ketju: rengaslenkit vuorotellen 90°
function bqChain(par,n,lr,m,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);par.add(g);const geo=new THREE.TorusGeometry(lr,lr*.28,6,12);
  for(let i=0;i<n;i++){const l=new THREE.Mesh(geo,m);l.position.y=-i*lr*1.45;l.rotation.y=i%2?Math.PI/2:0;l.castShadow=true;g.add(l);}return g;}
// sieni (jalka + lakki)
function bqShroom(par,h,cr,stem,cap,x,y,z,tilt=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.z=tilt;par.add(g);
  bqMesh(g,new THREE.CylinderGeometry(cr*.22,cr*.3,h,8),stem,0,h/2,0);bqMesh(g,new THREE.SphereGeometry(cr,12,6,0,TAU,0,Math.PI/2),cap,0,h,0,0,0,0,1,.62,1);return g;}
// Ultra-tason tunnistus (Ultra-esiasetus tai Ultra-ruoho), välimuisti 1 s
let _bqU=false,_bqUT=-9;
function bossUltra(){if(typeof playTime!=='undefined'&&Math.abs(playTime-_bqUT)<1)return _bqU;_bqUT=typeof playTime!=='undefined'?playTime:0;
  _bqU=typeof SET!=='undefined'&&((typeof presetIdx==='function'&&presetIdx()===7)||+SET.grass>=3);return _bqU;}
// silmäliekit (Ultra): pisaraliekki kummankin silmän päällä, värisee
function bqEyeFlames(f,c,sc=1){const out=[];for(const e of f.eyes||[]){const g=new THREE.Group();g.position.copy(e.position);g.position.y+=.02;g.position.z+=.03;
  const o=bqMesh(g,bqFlameGeo(.05*sc,.32*sc),bqAdd(c,.85)),i=bqMesh(g,bqFlameGeo(.028*sc,.2*sc),bqAdd(0xffffff,.7));o.rotation.x=i.rotation.x=-.5;o.castShadow=i.castShadow=false;e.parent.add(g);g.visible=false;out.push(g);}return out;}
function bqFlick(fl,t){fl.forEach((g,i)=>{g.visible=true;const k=.85+.25*Math.sin(t*17+i*2.1)+.12*Math.sin(t*31+i);g.scale.set(1,k,1);});}
// leijuvat palat: f.g:n suoria lapsia (irtoavat kuollessa), kiertävät ja keinuvat
function bqOrbitTick(orbs,u,t,cy){for(const o of orbs){o.visible=u;if(!u)continue;const d=o.userData,a=d.a0+t*d.w;o.position.set(Math.cos(a)*d.R,cy+d.y+Math.sin(t*d.bw+d.a0)*d.bh,Math.sin(a)*d.R);o.rotation.x+=d.sp*.016;o.rotation.y+=d.sp*.02;}}

// ---------------- KALMANVARTIJA: kivijätti, hehkuvat riimuhalkeamat, sammal, kivikruunu, selässä riimumonoliitti ----------------
function figVartija(){const s=3.1,f=makeHumanoid({s,body:0x5d5a54,skin:0x6f6b63,legs:0x4a4742,boot:0x3d3a35,joint:0x55524b,belt:0x34312c,eyes:0x7ffff0,wide:1.22,shoulder:0x4f4c46,handMat:0x5b5853,rough:.95});
  const T=f.torso,H=f.head,st=bqMat(0x67635b,{roughness:.95}),dk=bqMat(0x4a4742,{roughness:1}),lt=bqMat(0x7e796f,{roughness:.9}),moss=bqMat(0x4d7a3a,{roughness:1}),gm=bqGlow(0x7ffff0),gh=bqAdd(0x7ffff0,.35);
  const rock=(par,r,x,y,z,m,sx=1,sy=1,sz=1,sd=0)=>bqMesh(par,bqLump(r,sd,.2),m,x,y,z,0,sd,0,sx,sy,sz);
  const crack=(par,pts,r)=>{bqTube(par,pts,r,r*.35,gm,16,6);bqTube(par,pts,r*2.6,r,gh,16,6).castShadow=false;};
  // rintalevyt ja selkälohkareet
  rock(T,.2*s,-.11*s,.12*s,.13*s,lt,1.1,.9,.5,1);rock(T,.19*s,.12*s,.1*s,.13*s,st,1.1,.95,.5,2);rock(T,.16*s,0,-.18*s,.12*s,dk,1.3,.7,.5,3);
  rock(T,.26*s,0,.18*s,-.14*s,dk,1.4,.9,.7,4);rock(T,.13*s,-.16*s,-.12*s,-.15*s,st,1,1,.6,5);rock(T,.13*s,.17*s,-.14*s,-.13*s,lt,1,1,.6,6);
  // hehkuvat riimuhalkeamat rinnassa (mutkittelevat)
  const z0=.235*s;crack(T,[[0,.26*s,z0],[.015*s,.12*s,z0+.01*s],[-.01*s,0,z0+.012*s],[.01*s,-.16*s,z0]],.016*s);
  crack(T,[[-.15*s,.13*s,z0-.02*s],[-.05*s,.115*s,z0+.01*s],[.06*s,.13*s,z0+.01*s],[.15*s,.11*s,z0-.02*s]],.013*s);
  for(const sd of [-1,1])crack(T,[[sd*.01*s,-.04*s,z0+.01*s],[sd*.07*s,-.12*s,z0],[sd*.12*s,-.22*s,z0-.03*s]],.011*s);
  // olkalohkareet sammaleineen + olkapiikit ja käsivarren halkeama
  for(const [a,sd] of [[f.armL,1],[f.armR,-1]]){rock(a,.17*s,0,.06*s,0,st,1.25,.85,1.1,7+sd);rock(a,.11*s,0,.15*s,.02*s,moss,1.35,.4,1.15,9+sd);
    crack(a,[[0,-.08*s,.09*s],[.01*s,-.17*s,.1*s],[-.01*s,-.27*s,.085*s]],.01*s);
    for(let i=0;i<3;i++)bqTube(a,[[(i-1)*.08*s,.14*s,-.02*s],[(i-1)*.12*s+sd*.02*s,.28*s,-.05*s],[(i-1)*.16*s+sd*.04*s,.4*s,-.1*s]],.04*s,.004*s,lt,10,7);}
  // kyynärvarret ja nyrkit (rystyset)
  for(const e of [f.elbowL,f.elbowR]){rock(e,.1*s,0,-.12*s,.02*s,dk,1,1.3,1,11);rock(e,.07*s,.04*s,-.25*s,-.03*s,st,1,1,1,12);}
  for(const h of [f.hand,f.handL]){rock(h,.11*s,0,-.02*s,.01*s,lt,1.1,1,1,13);for(let i=0;i<4;i++)bqMesh(h,bqCapsule(.032*s,.05*s,10),dk,(i-1.5)*.045*s,-.09*s,.07*s,.5);}
  // polvet ja jalat
  for(const k of [f.kneeL,f.kneeR]){rock(k,.09*s,0,0,.05*s,st,1,1,1,14);rock(k,.1*s,0,-.33*s,.07*s,dk,1.15,.6,1.5,15);}
  // lannevaate kivilaatoista
  for(let i=0;i<5;i++)rock(T,.08*s,(i-2)*.1*s,-.46*s,.15*s,i%2?dk:st,1.05,1.3,.45,16+i).rotation.z=(i-2)*.06;
  // pää: kallolohkare, kulmakaari, leuka, hehkuva suu, kivikruunu ja sammal
  rock(H,.21*s,0,.28*s,0,st,.95,1.05,1,20);bqTube(H,[[-.17*s,.35*s,.13*s],[0,.39*s,.19*s],[.17*s,.35*s,.13*s]],.045*s,.03*s,dk,12,8);rock(H,.13*s,0,.12*s,.12*s,dk,1.3,.7,.9,21);
  crack(H,[[-.08*s,.17*s,.205*s],[0,.16*s,.215*s],[.08*s,.17*s,.205*s]],.012*s);
  for(let i=0;i<7;i++){const a=i/7*TAU,r=.17*s,h=(.16+(i%2)*.1)*s;bqTube(H,[[Math.sin(a)*r,.46*s,Math.cos(a)*r],[Math.sin(a)*r*1.12,.46*s+h*.55,Math.cos(a)*r*1.12],[Math.sin(a)*r*1.3,.46*s+h,Math.cos(a)*r*1.3]],.045*s,.005*s,i%3?st:lt,10,7);}
  rock(H,.09*s,-.12*s,.44*s,-.06*s,moss,1.3,.4,1.1,22);
  // selässä riimukivimonoliitti
  const mono=rock(T,.24*s,0,.45*s,-.3*s,dk,1.15,2.1,.45,23);mono.rotation.x=-.12;
  crack(T,[[0,.66*s,-.2*s],[.01*s,.5*s,-.195*s],[-.01*s,.3*s,-.21*s]],.012*s);crack(T,[[-.08*s,.52*s,-.205*s],[.08*s,.52*s,-.205*s]],.01*s);
  // ULTRA: silmäliekit ja 6 leijuvaa riimukiveä
  const fl=bqEyeFlames(f,0x7ffff0,2.6),orbs=[];
  for(let i=0;i<6;i++){const o=new THREE.Group();o.userData={a0:i/6*TAU,w:.35,R:.85*s,y:(i%2?.15:-.05)*s,bw:.9+i*.13,bh:.06*s,sp:.6+i*.1};
    bqMesh(o,bqLump(.075*s,30+i,.25),i%2?lt:st);bqMesh(o,new THREE.TorusGeometry(.065*s,.011*s,6,24),gm,0,0,0,Math.PI/2*(i%2),i*.7,0).castShadow=false;bqMesh(o,new THREE.SphereGeometry(.1*s,10,8),gh).castShadow=false;o.visible=false;f.g.add(o);orbs.push(o);}
  const cy=.8*s+.45*s;f.fx=(dt,m)=>{const u=bossUltra(),t=playTime;gm.color.setRGB(.5+.25*Math.sin(t*2.2),1,.94);if(u)bqFlick(fl,t);else fl.forEach(g=>g.visible=false);bqOrbitTick(orbs,u,t,cy);};
  return f;}

// ---------------- JÄÄTÄR: jäinen noita – jääpuikkoharja, jääkruunu, naamio ja torahampaat, repaleinen viitta, kristalliolkapäät ----------------
function figJaatar(){const s=1.85,f=makeHumanoid({s,body:0x9ab8d0,skin:0xcfe4f2,legs:0x7f9db5,eyes:0xbff4ff,wide:1.15,armMat:0xa9c6dc,headS:1.05,rough:.5}),T=f.torso,H=f.head,hip=.8*s;
  const ice=bqMat(0xdff2ff,{emissive:0x2a5a80,emissiveIntensity:.6,roughness:.12,metalness:.15,transparent:true,opacity:.93}),iceF=bqMat(0xe8f6ff,{emissive:0x2a6a98,emissiveIntensity:.55,roughness:.1,metalness:.2,flatShading:true,transparent:true,opacity:.9});
  const dk=bqMat(0x34506c,{roughness:.6}),cl=bqMat(0x587a9c,{roughness:.8,side:THREE.DoubleSide}),cl2=bqMat(0x3e5c7c,{roughness:.85,side:THREE.DoubleSide}),bone=bqMat(0xf2f8ff,{roughness:.4}),gl=bqGlow(0xaee8ff),gh=bqAdd(0x9fe0ff,.4);
  // jääpuikkoharja: 11 kaarevaa puikkoa kallon takaa ylös ja taakse
  for(let i=0;i<11;i++){const u=(i-5)/5,x=u*.3,l=1+((i*37)%5)*.12;bqTube(H,[[x,.62,-.18],[x*1.35,.95+.1*(1-Math.abs(u)),-.5],[x*1.6,1.2*l,-.85*l],[x*1.75,1.3*l,-1.15*l]],.075,.006,ice,16,8);}
  // jääkruunu: rengas + 7 kristallia
  bqMesh(H,new THREE.TorusGeometry(.36,.035,8,32),ice,0,.8,0,Math.PI/2-.18);
  for(let i=0;i<7;i++){const a=(i-3)*.32,h=.3+.32*(1-Math.abs(i-3)/3);bqMesh(H,bqCrystal(.055,h),iceF,Math.sin(a)*.36,.82,Math.cos(a)*.36-.06,-.15,0,-a*.6);}
  // naamio (tumma alaosa), torahampaat ja sivupiikit
  bqMesh(H,new THREE.SphereGeometry(.4,20,12,Math.PI*.05,Math.PI*.9,Math.PI*.56,Math.PI*.26),dk,0,.52,.02);
  for(let i=0;i<12;i++){const a=i/12*TAU;bqMesh(H,bqCrystal(.035,.22+(i%2)*.1),iceF,Math.cos(a)*.24,.06,Math.sin(a)*.24,Math.sin(a)*.9,0,-Math.cos(a)*.9);}   // huurrekaulus
  for(const sd of [-1,1]){bqTube(H,[[sd*.13,.22,.33],[sd*.15,.06,.42],[sd*.12,-.12,.4]],.04,.004,bone,10,7);
    bqMesh(H,bqCrystal(.06,.75),iceF,sd*.38,.55,-.12,-.25,0,-sd*.55);}
  // repaleinen viitta selässä (keinuu) ja sivukaistaleet
  [[-.42,2.3,.12],[0,2.6,.08],[.42,2.2,.1]].forEach(([x,h,b],i)=>swayAdd(f,bqMesh(T,bqCloth(.62,h,b,.16,7+i),i===1?cl2:cl,x,.62,-.36,.1,0,0),.06,1.2+i*.2));
  for(const sd of [-1,1])swayAdd(f,bqMesh(T,bqCloth(.32,1.5,.05,.2,11+sd),cl,sd*.6,.55,-.2,.08,sd*.6,0),.08,1.6);
  // olkapäiden kristalliviuhkat
  for(const sd of [-1,1])for(let k=0;k<5;k++){const a=-.9+k*.4;bqMesh(T,bqCrystal(.09-.008*Math.abs(k-2),.65+.35*(1-Math.abs(k-2)/2)),iceF,sd*(.72+.06*k),.62,-.05+.06*Math.cos(a),-.1+a*.25,0,-sd*(.35+k*.18));}
  // rinnan jalokivi ja kehys, rintapiikit
  bqMesh(T,new THREE.OctahedronGeometry(.17,0),gl,0,.16,.42,0,0,0,1,1.25,.6).castShadow=false;bqMesh(T,new THREE.SphereGeometry(.26,14,10),gh,0,.16,.42).castShadow=false;
  bqMesh(T,new THREE.TorusGeometry(.2,.03,8,24),ice,0,.16,.4);
  for(const x of [-.26,0,.26])bqMesh(T,bqCrystal(.05,.42+(x?0:.12)),iceF,x,-.12,.42,1.35,0,-x*.8);
  for(const e of [f.elbowL,f.elbowR])for(let k=0;k<3;k++)bqMesh(e,bqCrystal(.04,.3+k*.06),iceF,0,-.1-k*.09,-.06,-1.1,0,(k-1)*.3);   // kyynärvarsien jääpiikit
  // jääkynnet
  for(const h of [f.hand,f.handL])for(let i=0;i<3;i++)bqTube(h,[[(i-1)*.08,-.12,.05],[(i-1)*.1,-.28,.22],[(i-1)*.11,-.32,.48],[(i-1)*.1,-.25,.66]],.035,.004,ice,12,7);
  // saappaat ja jääpuikkohelma
  for(const L of [f.legL,f.legR]){bqMesh(L,bqLump(.2,4,.12),dk,0,-hip+.15,.06,0,0,0,1.15,.75,1.5);bqMesh(L,bqCrystal(.05,.4),iceF,0,-hip*.5,.18,.35);}
  bqMesh(f.g,bqSkirt(.48,.78,.85,12,.28,5),cl2,0,hip+.05,-.02);
  for(let i=0;i<10;i++){const a=i/10*TAU;bqMesh(f.g,bqCrystal(.035,.3+(i%3)*.08),iceF,Math.cos(a)*.66,hip-.32,Math.sin(a)*.66,Math.PI,0,0);}
  // ULTRA: silmäliekit ja 8 leijuvaa jääkristallia
  const fl=bqEyeFlames(f,0x9fe8ff,1.9),orbs=[];
  for(let i=0;i<8;i++){const o=new THREE.Group();o.userData={a0:i/8*TAU,w:-.45,R:1.35+(i%2)*.25,y:-.6+(i%4)*.45,bw:1.1+i*.17,bh:.12,sp:1.2+i*.15};
    bqMesh(o,bqCrystal(.07,.38+(i%3)*.1),iceF,0,-.2,0);o.visible=false;f.g.add(o);orbs.push(o);}
  const cy=hip+.9;f.fx=(dt,m)=>{const u=bossUltra(),t=playTime;gh.opacity=.32+.12*Math.sin(t*3);if(u){bqFlick(fl,t);if(m&&!m.dead&&Math.random()<dt*3)burst(m.pos.x+(Math.random()-.5)*2,m.pos.y+.5+Math.random()*3,m.pos.z+(Math.random()-.5)*2,0xdff6ff,1,.6);}else fl.forEach(g=>g.visible=false);bqOrbitTick(orbs,u,t,cy);};
  return f;}

// ---------------- KALMAHERRA: luurankokuningas – kylkiluut, pässinsarvet, kultakruunu, kalloolkapäät, viitta, ketjut, suurmiekka, sieluorbi ----------------
function figKalmaherra(){const s=1.75,f=makeHumanoid({s,body:0x2a2230,skin:0xdcd5c2,legs:0x1d1824,eyes:0xff4a2a,thin:1,armMat:0xcfc6ae,headS:1.1,rough:.6}),T=f.torso,H=f.head,hip=.8*s;
  const bone=bqMat(0xe2dccb,{roughness:.55}),dkc=bqMat(0x241f2e,{roughness:.9,side:THREE.DoubleSide}),gold=bqMat(0xc0913c,{metalness:.75,roughness:.3}),steel=bqMat(0xb4bec8,{metalness:.45,roughness:.3}),dsteel=bqMat(0x4a5058,{metalness:.4,roughness:.45});
  const red=bqMat(0x5a1a22,{roughness:.85,side:THREE.DoubleSide}),red2=bqMat(0x401418,{roughness:.9,side:THREE.DoubleSide}),blk=bqMat(0x070505,{roughness:1}),eyeR=bqGlow(0xff4a2a),gemR=bqGlow(0xff3030);
  // kaapu (helma) ja repaleiset kaistaleet
  bqMesh(f.g,bqSkirt(.38,.72,1.25,10,.3,9),dkc,0,hip*.55,0);
  for(let i=0;i<7;i++){const a=-.9+i*.3;swayAdd(f,bqMesh(f.g,bqCloth(.24,.5+((i*5)%4)*.16,.02,.3,20+i),dkc,Math.sin(a)*.66,.2,Math.cos(a)*.66*.6+.05,0,a,0),.07,1.6+i*.2);}
  // rintakehä: kylkiluukaaret, rintalasta ja selkäranka
  for(let i=0;i<5;i++){const r=.46-i*.03;bqMesh(T,new THREE.TorusGeometry(r,.032,6,18,Math.PI*1.15),bone,0,.5-i*.19,.02,Math.PI/2,0,-Math.PI*.075,1,.75,1);}
  bqTube(T,[[0,.6,.36],[0,.3,.38],[0,-.1,.36]],.045,.035,bone,8,8);bqTube(T,[[0,.7,-.2],[0,.2,-.24],[0,-.4,-.2]],.06,.05,bone,10,8);
  // kallo: leuka, hampaat, silmäkuopat hehkuineen, nenäkuoppa
  bqMesh(H,new THREE.SphereGeometry(.3,16,10),bone,0,.1,.18,0,0,0,1,.55,.8);for(let i=0;i<7;i++)bqMesh(H,new THREE.ConeGeometry(.026,.08,6),bone,-.18+i*.06,.17,.42,Math.PI);
  for(const x of [-.17,.17]){bqMesh(H,new THREE.SphereGeometry(.11,12,8),blk,x,.46,.4,0,0,0,1,.85,.5);bqMesh(H,new THREE.SphereGeometry(.05,10,8),eyeR,x,.46,.47).castShadow=false;}
  bqMesh(H,new THREE.ConeGeometry(.05,.12,3),blk,0,.32,.47,Math.PI);
  // pässinsarvet: kiertyvät taakse ja alas
  for(const sd of [-1,1])bqTube(H,[[sd*.3,.72,0],[sd*.62,1.05,-.1],[sd*.9,.98,-.4],[sd*.88,.62,-.48],[sd*.7,.45,-.3]],.13,.02,bone,22,10);
  // kultakruunu: vanne, piikit ja punaiset kivet
  bqMesh(H,new THREE.CylinderGeometry(.4,.38,.14,28,1,true),gold,0,.8,0);
  for(let i=0;i<7;i++){const a=(i-3)*.42;bqMesh(H,new THREE.ConeGeometry(.055,.26+(i%2)*.16,8),gold,Math.sin(a)*.4,.98+(i%2)*.08,Math.cos(a)*.4);bqMesh(H,new THREE.SphereGeometry(.035,8,6),gemR,Math.sin(a)*.41,.81,Math.cos(a)*.41).castShadow=false;}
  // kalloolkapäät piikkeineen
  for(const sd of [-1,1]){const sk=new THREE.Group();sk.position.set(sd*.78,.72,0);T.add(sk);bqMesh(sk,new THREE.SphereGeometry(.23,16,12),bone,0,0,0,0,0,0,1,.9,1.05);
    bqMesh(sk,new THREE.SphereGeometry(.15,12,8),bone,0,-.1,.12,0,0,0,1,.5,.8);for(const x of [-.08,.08])bqMesh(sk,new THREE.SphereGeometry(.055,8,6),blk,x,.02,.19);
    for(let k=0;k<3;k++)bqTube(sk,[[(k-1)*.1,.12,-.02],[(k-1)*.16+sd*.04,.32,-.08],[(k-1)*.2+sd*.08,.5,-.16]],.045,.004,dsteel,10,7);}
  // viitta ja sivukaistaleet (keinuvat)
  swayAdd(f,bqMesh(T,bqCloth(1.25,2.7,.22,.14,31),red,0,.62,-.4,.1),.05,1.1);
  swayAdd(f,bqMesh(T,bqCloth(.42,2.1,.08,.22,32),red2,-.62,.5,-.42,.1,0,.1),.08,1.6);swayAdd(f,bqMesh(T,bqCloth(.42,1.9,.08,.22,33),red2,.62,.5,-.42,.1,0,-.1),.08,1.4);
  // ketjut vyöllä
  for(let i=0;i<5;i++)swayAdd(f,bqChain(f.g,6+(i%2)*2,.055,steel,-.5+i*.25,hip-.05,.42),.12,1.8+i*.3);
  // suurmiekka oikeassa kädessä: terä (uurre ja sahalaita), väistin, kahva ja ponsi
  {const sw=new THREE.Group();f.hand.add(sw);const sh=new THREE.Shape();sh.moveTo(-.12,0);sh.lineTo(-.13,2.3);sh.lineTo(0,2.75);sh.lineTo(.13,2.3);sh.lineTo(.12,0);sh.lineTo(-.12,0);
    const bg=new THREE.ExtrudeGeometry(sh,{depth:.035,bevelEnabled:true,bevelThickness:.018,bevelSize:.02,bevelSegments:2,curveSegments:4});bg.translate(0,0,-.0175);
    const bl=bqMesh(sw,bg,steel,0,0,.12,Math.PI/2,0,0);bqMesh(bl,new THREE.BoxGeometry(.05,1.9,.075),dsteel,0,1.1,0);   // uurre
    for(let i=0;i<6;i++)bqMesh(bl,new THREE.ConeGeometry(.045,.11,4),steel,.15,.45+i*.3,0,0,0,-Math.PI/2);
    bqTube(sw,[[-.42,0,.12],[-.2,0,.06],[0,0,.04],[.2,0,.06],[.42,0,.12]],.045,.03,gold,14,8);bqMesh(sw,new THREE.CylinderGeometry(.045,.05,.36,10),bqMat(0x2a1a14),0,0,-.12,Math.PI/2);
    bqMesh(sw,new THREE.SphereGeometry(.075,12,10),gold,0,0,-.33);bqMesh(sw,new THREE.SphereGeometry(.04,8,6),gemR,0,0,-.4).castShadow=false;}
  // sieluorbi vasemmassa kädessä
  const orbG=bqGlow(0xc060ff),orbS=bqAdd(0xb070ff,.35);bqMesh(f.handL,new THREE.SphereGeometry(.15,16,12),orbG,0,-.14,.22).castShadow=false;const shell=bqMesh(f.handL,new THREE.SphereGeometry(.24,16,12),orbS,0,-.14,.22);shell.castShadow=false;
  for(let i=0;i<4;i++)bqTube(f.handL,[[(i-1.5)*.06,-.05,.05],[(i-1.5)*.1,-.08,.16],[(i-1.5)*.08,-.16,.3]],.022,.006,bone,8,6);
  // luusaappaat
  for(const L of [f.legL,f.legR]){bqMesh(L,bqLump(.17,8,.1),bone,0,-hip+.13,.08,0,0,0,1,.7,1.6);bqTube(L,[[0,-hip*.55,.12],[0,-hip*.35,.16]],.05,.02,bone,6,7);}
  // ULTRA: punaiset silmäliekit, sieluliekki orbista ja 3 kiertävää aavekalloa
  const fl=bqEyeFlames(f,0xff3a1a,1.9),soul=new THREE.Group();soul.position.set(0,-.02,.22);f.handL.add(soul);bqMesh(soul,bqFlameGeo(.11,.55),bqAdd(0xb060ff,.8)).castShadow=false;bqMesh(soul,bqFlameGeo(.06,.35),bqAdd(0xffffff,.6)).castShadow=false;soul.visible=false;
  const ghost=bqAdd(0xd8c8ff,.42),orbs=[];
  for(let i=0;i<3;i++){const o=new THREE.Group();o.userData={a0:i/3*TAU,w:.7,R:1.25,y:.2+i*.25,bw:1.3+i*.3,bh:.18,sp:.4};
    bqMesh(o,new THREE.SphereGeometry(.17,14,10),ghost,0,0,0,0,0,0,1,1.05,1).castShadow=false;bqMesh(o,new THREE.SphereGeometry(.11,10,8),ghost,0,-.12,.06,0,0,0,1,.55,.9).castShadow=false;
    for(const x of [-.06,.06])bqMesh(o,new THREE.SphereGeometry(.035,8,6),bqGlow(0x2a0a3a),x,.02,.15).castShadow=false;o.visible=false;f.g.add(o);orbs.push(o);}
  const cy=hip+.9;f.fx=(dt,m)=>{const u=bossUltra(),t=playTime;orbS.opacity=.28+.12*Math.sin(t*4);soul.visible=u;
    if(u){bqFlick(fl,t);soul.scale.set(1,.85+.3*Math.sin(t*9)+.1*Math.sin(t*23),1);}else fl.forEach(g=>g.visible=false);
    bqOrbitTick(orbs,u,t,cy);if(u)for(const o of orbs)o.rotation.set(0,-(o.userData.a0+t*o.userData.w),0);};   // kallot katsovat kulkusuuntaan
  return f;}

// ---------------- AARNIHIRVIÖ: sammaloitunut puupeto – haarautuvat sarvet, torahampaat, neljä silmää, kaarna, köynnökset, hohtavat sienet ----------------
function figAarni(){const s=1.7,f=makeHumanoid({s,body:0x3f5a2c,skin:0x5a7a3a,legs:0x2e3f20,eyes:0xffd23a,wide:1.3,armMat:0x4b6b30,headS:1.2,rough:.95}),T=f.torso,H=f.head,hip=.8*s;
  const wood=bqMat(0x6b4a2c,{roughness:.9}),bark=bqMat(0x3a2a1c,{roughness:1}),moss=bqMat(0x5f8a3a,{roughness:1}),bone=bqMat(0xe7e1cf,{roughness:.5}),vine=bqMat(0x3f7a2a,{roughness:.9});
  const tc=bqGlow(0x6ff0d8),tcS=bqAdd(0x6ff0d8,.25),stem=bqMat(0xd8d2b8,{roughness:.8}),leafM=bqMat(0x5f9a3a,{roughness:.8,side:THREE.DoubleSide}),gold=bqGlow(0xffd23a);
  const lump=(par,r,x,y,z,m,sx=1,sy=1,sz=1,sd=0)=>bqMesh(par,bqLump(r,sd,.22),m,x,y,z,0,sd,0,sx,sy,sz);
  // haarautuvat sarvet: päärunko ylös ja ulos, 4 haaraa luukärkineen
  for(const sd of [-1,1]){const B=[[sd*.32,.72,-.05],[sd*.55,1.2,-.12],[sd*.8,1.7,-.1],[sd*1.02,2.15,-.02],[sd*1.15,2.55,.05]];bqTube(H,B,.15,.04,wood,22,10);
    const cu=new THREE.CatmullRomCurve3(B.map(p=>new THREE.Vector3(...p)));
    for(let k=0;k<4;k++){const p=cu.getPointAt(.28+k*.18),L=.55-k*.07,ox=sd*(.35+k*.05),oy=.35+k*.04,oz=(k%2?.18:-.14);
      const q=[[p.x,p.y,p.z],[p.x+ox*.5,p.y+oy*.55,p.z+oz*.5],[p.x+ox,p.y+oy+L*.3,p.z+oz]];bqTube(H,q,.085-k*.008,.02,wood,12,8);
      bqTube(H,[q[2],[q[2][0]+ox*.18,q[2][1]+.12,q[2][2]+oz*.15],[q[2][0]+ox*.32,q[2][1]+.26,q[2][2]+oz*.25]],.018,.002,bone,8,6);}
    bqTube(H,[[sd*.24,.7,.3],[sd*.32,.84,.5],[sd*.34,.9,.68]],.07,.008,wood,10,7);   // eteen sojottavat pikkusarvet
    bqTube(H,[[sd*.2,.22,.46],[sd*.3,.14,.6],[sd*.34,.3,.72],[sd*.3,.48,.74]],.07,.006,bone,14,8);}   // torahampaat ylös
  // kasvot: kaarnakuono, kulmakaari, sammallakki, hehkuva suu ja lisäsilmät
  lump(H,.22,0,.32,.3,bark,1.25,.75,.95,12);bqTube(H,[[-.32,.7,.33],[-.12,.75,.41],[.12,.75,.41],[.32,.7,.33]],.06,.045,bark,14,8);lump(H,.3,0,.86,-.06,moss,1.25,.42,1.15,13);
  bqTube(H,[[-.2,.26,.49],[0,.23,.52],[.2,.26,.49]],.03,.026,bqGlow(0xffb02a),12,6);for(const sd of [-1,1])bqMesh(H,new THREE.SphereGeometry(.045,10,8),gold,sd*.24,.83,.33).castShadow=false;
  // sammalolkapäät ja hohtavat sienet
  for(const sd of [-1,1]){lump(T,.42,sd*.92,.72,0,moss,1.2,.55,1.15,sd+3);for(let k=0;k<4;k++){const h=.14+k*.05,cr=.09+((k*7)%3)*.035;bqShroom(T,h,cr,stem,tc,sd*(.82+k*.08),.86+((k*5)%3)*.04,-.18+k*.12,-sd*(.2+k*.1));}
    bqMesh(T,new THREE.SphereGeometry(.2,12,10),tcS,sd*.98,.98,0).castShadow=false;}
  // kaarnalevyt rinnassa, selkäkyttyrä luupiikkeineen ja sienineen
  for(const [x,y,z,r,sd] of [[-.3,.2,.36,.27,1],[.35,-.15,.36,.28,2],[-.35,-.3,.36,.22,3],[0,.45,.36,.22,4]])lump(T,r,x,y,z,bark,1,.85,.35,sd);
  lump(T,.65,0,.55,-.45,bark,1,.6,.55,9);
  [[-.4,.95],[0,1.15],[.4,.9],[-.15,.7],[.25,.75]].forEach(([x,h],i)=>{bqTube(T,[[x,.75,-.62],[x*1.1,.75+h*.45,-.75],[x*1.15,.75+h*.8,-.82]],.07,.006,bone,10,7);bqShroom(T,.12,.1+((i*3)%3)*.03,stem,tc,x*.9+.1,.9+((i*7)%3)*.05,-.7,.3);});
  // köynnökset käsivarsista (keinuvat) lehtineen
  const leaf=new THREE.CircleGeometry(.09,8);leaf.scale(1,.55,1);
  for(const a of [f.armL,f.armR])for(let i=0;i<3;i++){const v=new THREE.Group();v.position.set((i-1)*.18,-.4-i*.1,.15);a.add(v);const L=.9+i*.2;bqTube(v,[[0,0,0],[.05,-L*.4,.04],[-.04,-L*.75,.02],[0,-L,0]],.035,.012,vine,14,6);
    for(let k=0;k<3;k++)bqMesh(v,leaf,leafM,(k%2?.06:-.06),-L*(.3+k*.25),.03,0,k*1.3,k%2?.6:-.6);swayAdd(f,v,.14,1.2+i*.3);}
  // kädet: kaarnarystyset ja puukynnet
  for(const h of [f.hand,f.handL]){lump(h,.3,0,-.08,.05,bark,1,.9,1,6);for(let i=0;i<3;i++)bqTube(h,[[(i-1)*.18,-.18,.15],[(i-1)*.2,-.3,.4],[(i-1)*.2,-.22,.65]],.06,.006,wood,12,7);}
  // jalat: kaarna ja sammal
  for(const L of [f.legL,f.legR]){lump(L,.32,0,-hip+.16,.18,bark,1,.55,1.4,7);lump(L,.27,0,-hip*.55,.05,moss,1,.6,1,8);}
  // ULTRA: kultaiset silmäliekit, 12 pyörivää lehteä ja 6 tulikärpästä
  const fl=bqEyeFlames(f,0xffc83a,2),orbs=[];
  for(let i=0;i<12;i++){const o=new THREE.Group();o.userData={a0:i/12*TAU,w:.55+(i%3)*.12,R:1.25+(i%4)*.18,y:-.5+(i%5)*.4,bw:1.4+i*.2,bh:.25,sp:2.5+i*.2};
    bqMesh(o,leaf,i%3?leafM:bqMat(0xb8962a,{roughness:.8,side:THREE.DoubleSide}),0,0,0,0,0,0,1.5,1.5,1).castShadow=false;o.visible=false;f.g.add(o);orbs.push(o);}
  for(let i=0;i<6;i++){const o=new THREE.Group();o.userData={a0:i/6*TAU,w:-.9-(i%2)*.4,R:.9+(i%3)*.35,y:-.2+(i%3)*.6,bw:2.3+i*.4,bh:.4,sp:0};
    bqMesh(o,new THREE.SphereGeometry(.035,8,6),bqGlow(0xfff07a)).castShadow=false;bqMesh(o,new THREE.SphereGeometry(.11,8,6),bqAdd(0xffe25a,.4)).castShadow=false;o.visible=false;f.g.add(o);orbs.push(o);}
  const cy=hip+.9;f.fx=(dt,m)=>{const u=bossUltra(),t=playTime;tcS.opacity=.28+.14*Math.sin(t*2.6);tc.color.setRGB(.44+.1*Math.sin(t*2.6),.94,.85);if(u)bqFlick(fl,t);else fl.forEach(g=>g.visible=false);bqOrbitTick(orbs,u,t,cy);};
  return f;}
