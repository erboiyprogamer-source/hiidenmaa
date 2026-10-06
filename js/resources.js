/* Hiidenmaa – resources.js
   Kerättävät resurssit: puut, kivet, malmit, poimittavat; sijoittelu ja uusiutuminen */
'use strict';

/* ---------------- SCENERY (resource nodes) ---------------- */
const rng=mulberry32(20261003);
const NODE={
  kuusi:{kind:'tree',hp:30,drops:[['puu',3,5],['pihka',0,1]],r:.38,respawn:1500},
  koivu:{kind:'tree',hp:24,drops:[['puu',3,4]],r:.3,respawn:1500},
  kelo:{kind:'tree',hp:18,drops:[['puu',2,3]],r:.32,respawn:1500},
  manty:{kind:'tree',hp:28,drops:[['puu',4,6],['pihka',0,2]],r:.36,respawn:1500},
  aarnipuu:{kind:'tree',hp:220,drops:[['pihka',1,2]],r:.66,respawn:3000,tier:3},
  pensas:{kind:'deco',r:0},
  lampare:{kind:'deco',r:0},
  tukki:{kind:'log',hp:20,drops:[['puu',3,4]],r:0},
  lohkare:{kind:'rock',hp:45,drops:[['kivi',5,8]],r:1.05,respawn:1800,tier:1},
  kuparisuoni:{kind:'rock',hp:70,drops:[['malmi',3,5],['kivi',1,3]],r:1.1,respawn:2400,tier:1},
  rautasuoni:{kind:'rock',hp:120,drops:[['rautamalmi',2,4],['kivi',1,2]],r:1.15,respawn:3600,tier:2},
  oksa:{kind:'pick',item:'puu',n:[1,1],respawn:300,label:'Oksa'},
  kivikasa:{kind:'pick',item:'kivi',n:[1,1],respawn:300,label:'Kivi'},
  piikivi:{kind:'pick',item:'piikivi',n:[1,2],respawn:420,label:'Piikivi'},
  marjat:{kind:'pick',item:'marjat',n:[2,3],respawn:480,label:'Puolukkamätäs'},
  sieni:{kind:'pick',item:'sieni',n:[1,1],respawn:480,label:'Herkkutatti'},
};
// Aarnipuu: paksu runko ja kerroksittain leveät havuoksat, jotka roikkuvat alaspäin; alimmat
// oksat ulottuvat ~3 m korkeuteen, joten niiden alla voi kävellä.
function aarniGeo(){const P=[],r=mulberry32(4242);
  P.push(part(new THREE.BoxGeometry(1.3,21,1.3),0x4a3524,0,10.5,0));
  P.push(part(new THREE.BoxGeometry(2.2,1.4,.6),0x3e2c1e,0,.6,0,0,.4),part(new THREE.BoxGeometry(.6,1.4,2.2),0x3e2c1e,0,.6,0,0,.4));
  const tiers=[[5.8,6.2,8],[8,5.6,8],[10.2,4.8,7],[12.4,4,7],[14.6,3.2,6],[16.6,2.4,5],[18.4,1.6,4]];
  tiers.forEach(([y,len,n],ti)=>{for(let i=0;i<n;i++){const a=i/n*TAU+ti*.37+r()*.2,c=Math.cos(a),s=Math.sin(a),droop=.28+r()*.12,col=[0x1c3a22,0x22432a,0x1a3520,0x274b2e][(i+ti)%4];
    // oksa: kaltevasti alaspäin (paikallinen +x ulos), havukerros oksan päällä ja roikkuva kärki
    const bx0=Math.cos(droop)*len/2,by0=-Math.sin(droop)*len/2;
    P.push(part(new THREE.BoxGeometry(len*1.02,.35,len*.42),col,c*bx0,y+by0+.18,-s*bx0,0,a,-droop));
    const tx=Math.cos(droop)*len,ty=-Math.sin(droop)*len;P.push(part(new THREE.ConeGeometry(len*.2,len*.35,5),col,c*tx,y+ty-len*.1,-s*tx,Math.PI,0,0));}});
  P.push(part(new THREE.ConeGeometry(1.4,3.4,7),0x274b2e,0,21.5,0));
  return mergeParts(P);}
// Koivun oksat: sama asettelu pystyssä olevassa puussa ja kaatuvassa puussa (fallTree), joten kaatuessa irtoavat oksat ovat
// samat, jotka näkyivät pystypuussa. Rivi: [korkeus, kulma, pituus, kallistus ylöspäin] (koko s=1, ennen puun omaa kiertoa).
const TREE_BR={koivu:[[1.7,.3,1.45,.62],[2.15,2.4,1.6,.58],[2.6,4.3,1.5,.66],[3.0,1.3,1.35,.72],[3.4,3.4,1.25,.78],[3.8,5.4,1.1,.85],[2.35,5.9,1.0,.7]]},BR_COL={koivu:[0x4f4237,0x7aa641]};
function brParts(type){const P=[],[bc,lc]=BR_COL[type];for(const [h,phi,L,t] of TREE_BR[type]){const c=Math.cos(t),s=Math.sin(t),cp=Math.cos(phi),sp=Math.sin(phi),x0=.12*cp,z0=-.12*sp;
  P.push(part(new THREE.BoxGeometry(L,.09,.09),bc,x0+L/2*c*cp,h+L/2*s,z0-L/2*c*sp,0,phi,t));
  P.push(part(new THREE.IcosahedronGeometry(L*.3,0),lc,x0+L*.85*c*cp,h+L*.85*s,z0-L*.85*c*sp));}return P;}
// Runko jaettu 12 korkeussegmenttiin: huojunta (swH = max(0, y − 1,5)) ei ole lineaarinen, joten yksiosainen runko taipui eri tavalla
// kuin sen päällä olevat mustat täplät (täplät näyttivät pysyvän paikallaan). Segmentoitu runko seuraa samaa käyrää kuin täplät.
const koivuBase=()=>[part(new THREE.BoxGeometry(.32,4.6,.32,1,12,1),0xe9e6dc,0,2.3,0),part(new THREE.BoxGeometry(.34,.1,.2),0x222222,0,1.4,.02),part(new THREE.BoxGeometry(.34,.08,.2),0x222222,0,2.6,-.02),part(new THREE.IcosahedronGeometry(1.7,0),0x7aa641,0,4.7,0),part(new THREE.IcosahedronGeometry(1.2,0),0x8bb84c,.6,5.5,.3)];
const NGEO={
  kuusi:mergeParts([part(new THREE.BoxGeometry(.4,2.2,.4),0x5a3a22,0,1.1,0),part(new THREE.ConeGeometry(1.7,2.5,7),0x2e5a2e,0,2.7,0),part(new THREE.ConeGeometry(1.3,2.1,7),0x356836,0,3.9,0),part(new THREE.ConeGeometry(.85,1.7,7),0x3b7440,0,5,0)]),
  koivu:mergeParts([...koivuBase(),...brParts('koivu')]),
  kelo:mergeParts([part(new THREE.BoxGeometry(.36,4.2,.36),0x6d665c,0,2.1,0),part(new THREE.BoxGeometry(.16,1.4,.16),0x6d665c,.5,3,0,0,0,-.8),part(new THREE.BoxGeometry(.14,1.1,.14),0x6d665c,-.4,3.6,.1,0,0,.9)]),
  // v0.82 mänty (Jäkäläkangas): pitkä punaruskea runko (alaosa harmaampi), latvus vain ylhäällä litteinä havutupsuina
  manty:mergeParts([part(new THREE.BoxGeometry(.36,2.6,.36,1,4,1),0x6e5a4a,0,1.3,0),part(new THREE.BoxGeometry(.32,4.4,.32,1,10,1),0xa8643a,0,4.8,0),
    part(new THREE.BoxGeometry(.12,1.2,.12),0xa8643a,.45,6.2,0,0,0,-.9),part(new THREE.BoxGeometry(.12,1,.12),0xa8643a,-.4,6.7,.2,0,0,.9),
    part(new THREE.IcosahedronGeometry(1.25,0),0x2f5530,0,7.3,0,0,0,0,1.3,.55,1.2),part(new THREE.IcosahedronGeometry(.95,0),0x386236,.9,6.6,.2,0,0,0,1.2,.5,1),
    part(new THREE.IcosahedronGeometry(.9,0),0x2a4d2c,-.8,7,-.3,0,0,0,1.2,.5,1.1),part(new THREE.IcosahedronGeometry(.7,0),0x386236,.1,8,.1,0,0,0,1.1,.6,1)]),
  aarnipuu:aarniGeo(),
  lampare:mergeParts([part(new THREE.CylinderGeometry(1.1,1.1,.12,9),0x141b16,0,-.03,0,0,0,0,1,1,.7),part(new THREE.CylinderGeometry(.7,.7,.13,8),0x1b2620,.45,-.02,.25)]),  // suon lätäkkö (painuu maahan)
  pensas:mergeParts([part(new THREE.IcosahedronGeometry(.9,0),0x2a4a2a,0,.55,0,0,0,0,1.3,.75,1.2),part(new THREE.IcosahedronGeometry(.65,0),0x335a30,.7,.45,.3,0,0,0,1,.8,1),part(new THREE.IcosahedronGeometry(.6,0),0x24412a,-.6,.4,-.35,0,0,0,1.1,.7,1)]),
  lohkare:mergeParts([part(new THREE.IcosahedronGeometry(1.2,0),0x85837d,0,.55,0,0,0,0,1,.75,1),part(new THREE.IcosahedronGeometry(.7,0),0x77756f,.7,.35,.3)]),
  kuparisuoni:mergeParts([part(new THREE.IcosahedronGeometry(1.25,0),0x66605a,0,.6,0,0,0,0,1,.8,1),part(new THREE.BoxGeometry(.3,.3,.3),0xd9874a,.6,.9,.6,.5,.5),part(new THREE.BoxGeometry(.28,.28,.28),0xd9874a,-.7,.6,.5,.3,.8),part(new THREE.BoxGeometry(.25,.25,.25),0xe39a5a,.1,1.3,-.5,.2,.4),part(new THREE.BoxGeometry(.3,.3,.3),0xd9874a,-.3,.8,-.8)]),
  rautasuoni:mergeParts([part(new THREE.IcosahedronGeometry(1.3,0),0x4f4a47,0,.6,0,0,0,0,1,.8,1),part(new THREE.BoxGeometry(.32,.32,.32),0x8a4f3c,.6,.9,.6,.5,.5),part(new THREE.BoxGeometry(.3,.3,.3),0x9a5c46,-.7,.6,.5,.3,.8),part(new THREE.BoxGeometry(.26,.26,.26),0x7d4636,.1,1.3,-.5,.2,.4),part(new THREE.BoxGeometry(.3,.3,.3),0x8a4f3c,-.3,.8,-.8)]),
  oksa:mergeParts([part(new THREE.BoxGeometry(.08,.08,1),0x6b4527,0,.05,0),part(new THREE.BoxGeometry(.05,.05,.4),0x6b4527,.12,.05,.2,0,.8)]),
  kivikasa:mergeParts([part(new THREE.IcosahedronGeometry(.22,0),0x8f8d86,0,.12,0),part(new THREE.IcosahedronGeometry(.15,0),0x7a7872,.25,.08,.1)]),
  piikivi:mergeParts([part(new THREE.TetrahedronGeometry(.22,0),0x40464f,0,.12,0),part(new THREE.TetrahedronGeometry(.16,0),0x50565f,.22,.08,-.1)]),
  marjat:mergeParts([part(new THREE.IcosahedronGeometry(.5,0),0x3f6a2c,0,.35,0,0,0,0,1,.7,1),part(new THREE.BoxGeometry(.1,.1,.1),0xc8263a,.3,.5,.2),part(new THREE.BoxGeometry(.1,.1,.1),0xc8263a,-.25,.45,.25),part(new THREE.BoxGeometry(.1,.1,.1),0xc8263a,.05,.62,-.25),part(new THREE.BoxGeometry(.1,.1,.1),0xc8263a,-.3,.4,-.2)]),
  sieni:mergeParts([part(new THREE.BoxGeometry(.12,.25,.12),0xefe6d2,0,.12,0),part(new THREE.ConeGeometry(.24,.18,6),0x9b6a3a,0,.3,0)]),
};
// Kaatuvan puun runko ilman irtoavia oksia (oksat lisätään erikseen, jotta ne voivat irrota)
const NGEO_FALL={koivu:mergeParts(koivuBase())};
const nodes=[]; const nodeIM={};
// Puiden latvat huojuvat tuulessa (vahvemmin tuulisella säällä ja myrskyssä).
let grassDirty=true;   // v1.00 ruoho rakennetaan uudelleen (määritelty ennen mudFlushia, ks. KORJAUKSET 1)
const SWAY={uTime:{value:0},uWind:{value:.15},uWDir:{value:new V3(0,0,1)},uLean:{value:0}}; // uWDir/uLean: tuulen suunta ja kallistus (v0.84)
const treeMat=vcMat.clone();
treeMat.onBeforeCompile=sh=>{sh.uniforms.uTime=SWAY.uTime;sh.uniforms.uWind=SWAY.uWind;sh.uniforms.uWDir=SWAY.uWDir;sh.uniforms.uLean=SWAY.uLean;
  sh.vertexShader='uniform float uTime;uniform float uWind;uniform vec3 uWDir;uniform float uLean;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  #ifdef USE_INSTANCING
  float swPh=instanceMatrix[3].x*.13+instanceMatrix[3].z*.11;
  #else
  float swPh=0.;
  #endif
  float swH=max(0.,position.y-1.5);
  transformed.x+=sin(uTime*1.7+swPh)*uWind*swH*.05;transformed.z+=cos(uTime*1.3+swPh)*uWind*swH*.035;
  // v0.84: kallistus tuulen suuntaan (maailman suunta muunnetaan instanssin paikalliseen kiertoon) + sykkivä puuska tuulen suunnassa.
  #ifdef USE_INSTANCING
  mat3 swM=mat3(instanceMatrix);vec3 swL=vec3(dot(swM[0],uWDir),dot(swM[1],uWDir),dot(swM[2],uWDir));swL/=max(length(swL),1e-4);
  #else
  vec3 swL=uWDir;
  #endif
  float swLean=uLean*swH*min(swH,5.)*.016*(1.+.35*sin(uTime*1.9+swPh));transformed.x+=swL.x*swLean;transformed.z+=swL.z*swLean;`);};
// Puiden korkeus kertoimella s=1 (tukkien pituutta varten).
const TREE_H={kuusi:5.8,koivu:6.2,kelo:4.8,manty:8.4,aarnipuu:21};
const POOL={kuusi:400,koivu:400,manty:200,aarnipuu:60}; // varapaikat öisin kasvaville puille
const treeS=()=>.6+Math.pow(rng(),1.6)*1.4;   // puun koko .6–2.0, pienet yleisimpiä
let nodeIdN=0;
const CHN=10,CHS=HALF*2/CHN,CHUNK_IMS=[];
const VIS_R={tree:130,rock:110,pick:60,deco:55}; // näkyvyysetäisyys lajeittain (sumu peittää kauempana)
function chunkOf(x,z){return clamp(Math.floor((z+HALF)/CHS),0,CHN-1)*CHN+clamp(Math.floor((x+HALF)/CHS),0,CHN-1);}
(function placeNodes(){
  const tmp={};for(const k in NGEO)tmp[k]=[];
  const add=(type,x,z,s=1,rot)=>{const y=terrainH(x,z);tmp[type].push({type,x,z,y,s,rot:rot??rng()*TAU});};
  const clear=(x,z)=>{for(const k in LOC){const L=LOC[k];if(dist2(x,z,L.x,L.z)<(k==='spawn'?14*14:(k.startsWith('rune')?4*4:20*20)))return false;}return true;};
  const E=HALF-4;
  for(let x=-E;x<E;x+=3.6)for(let z=-E;z<E;z+=3.6){
    const px=x+(rng()-.5)*3,pz=z+(rng()-.5)*3,h=terrainH(px,pz);if(h<.8)continue;if(!clear(px,pz))continue;
    const b=biomeAt(px,pz,h),r=rng();
    if(b==='forest'){if(r<.6)add(rng()<.8?'kuusi':'koivu',px,pz,treeS());if(rng()<.04)add('pensas',px+(rng()-.5)*2.5,pz+(rng()-.5)*2.5,.6+rng()*.5);}
    else if(b==='aarni'){if(r<.085)add('aarnipuu',px,pz,.8+rng()*.35);else if(r<.14)add('kuusi',px,pz,.6+rng()*.4);if(rng()<.55)add('pensas',px+(rng()-.5)*2.5,pz+(rng()-.5)*2.5,.7+rng()*.7);}
    else if(b==='meadow'){if(r<.035)add('koivu',px,pz,treeS());}
    else if(b==='moor'){if(r<.05)add('kelo',px,pz,.8+rng()*.4);}
    else if(b==='mountain'){if(h<31&&r<.14)add('kuusi',px,pz,.6+rng()*.6);}
    // v0.82 uudet biomit
    else if(b==='koivu'){if(r<.3)add('koivu',px,pz,treeS());else if(r<.34)add('kuusi',px,pz,treeS());if(rng()<.06)add('pensas',px+(rng()-.5)*2.5,pz+(rng()-.5)*2.5,.5+rng()*.5);}
    else if(b==='suo'){if(r<.035)add('kelo',px,pz,.6+rng()*.4);else if(r<.09)add('koivu',px,pz,.45+rng()*.35);else if(r<.11)add('kuusi',px,pz,.5+rng()*.3);if(rng()<.22)add('lampare',px+(rng()-.5)*2,pz+(rng()-.5)*2,.6+rng()*.8);if(rng()<.14)add('pensas',px+(rng()-.5)*2.5,pz+(rng()-.5)*2.5,.4+rng()*.4);}
    else if(b==='kangas'){if(r<.2)add('manty',px,pz,.7+rng()*.6);else if(r<.23)add('kuusi',px,pz,.6+rng()*.4);}
    else if(b==='tunturi'){if(r<.05)add('koivu',px,pz,.32+rng()*.2);if(rng()<.1)add('pensas',px+(rng()-.5)*2.5,pz+(rng()-.5)*2.5,.3+rng()*.3);}
  }
  const AR=(HALF-10)*2;
  for(let i=0;i<2600*WS*WS;i++){
    const px=(rng()-.5)*AR,pz=(rng()-.5)*AR,h=terrainH(px,pz);if(h<-.2||!clear(px,pz)&&Math.hypot(px,pz)>16)continue;
    const b=biomeAt(px,pz,h),r=rng();
    if(h>.2&&h<2.4&&r<.5){add('piikivi',px,pz);continue;}
    if(h<1)continue;
    if(b==='meadow'){if(r<.22)add('oksa',px,pz);else if(r<.42)add('kivikasa',px,pz);else if(r<.56)add('marjat',px,pz);else if(r<.6)add('lohkare',px,pz,.8+rng()*.5);}
    else if(b==='forest'||b==='aarni'){if(r<.2)add('oksa',px,pz);else if(r<.3)add('kivikasa',px,pz);else if(r<.42)add('sieni',px,pz);else if(r<.5)add('marjat',px,pz);else if(r<.58)add('lohkare',px,pz,.8+rng()*.6);else if(r<.625)add('kuparisuoni',px,pz,.9+rng()*.3);}
    else if(b==='mountain'){if(r<.3)add('lohkare',px,pz,1+rng()*.8);else if(r<.38)add('kuparisuoni',px,pz,1);else if(r<.5)add('kivikasa',px,pz);}
    else if(b==='moor'){if(r<.15)add('kivikasa',px,pz);else if(r<.25)add('lohkare',px,pz,.8+rng()*.4);}
    else if(b==='koivu'){if(r<.2)add('oksa',px,pz);else if(r<.27)add('kivikasa',px,pz);else if(r<.4)add('marjat',px,pz);else if(r<.5)add('sieni',px,pz);}
    else if(b==='suo'){if(r<.1)add('oksa',px,pz);else if(r<.3)add('marjat',px,pz);else if(r<.38)add('sieni',px,pz);else if(r<.41)add('lohkare',px,pz,.6+rng()*.4);}
    else if(b==='kangas'){if(r<.14)add('oksa',px,pz);else if(r<.34)add('kivikasa',px,pz);else if(r<.44)add('piikivi',px,pz);else if(r<.52)add('lohkare',px,pz,.8+rng()*.5);else if(r<.55)add('kuparisuoni',px,pz,1);}
    else if(b==='tunturi'){if(r<.18)add('kivikasa',px,pz);else if(r<.3)add('marjat',px,pz);else if(r<.42)add('lohkare',px,pz,.8+rng()*.6);}
    else if(b==='rakka'){if(r<.38)add('lohkare',px,pz,.9+rng()*.9);else if(r<.5)add('kuparisuoni',px,pz,1);else if(r<.62)add('kivikasa',px,pz);}
  }
  // rautasuonet: harvinaisia (~25) korkealla vuorilla
  for(let i=0,c=0;i<40000&&c<25;i++){const px=(rng()-.5)*AR,pz=(rng()-.5)*AR,h=terrainH(px,pz);if(h<=22||biomeAt(px,pz,h)!=='mountain'||!clear(px,pz))continue;add('rautasuoni',px,pz,1+rng()*.25);c++;}
  // varmistetaan aloitusalueelle tarvikkeet
  const S0=LOC.spawn;
  for(let i=0;i<14;i++){const a=rng()*TAU,d=7+rng()*14;add(i%2?'oksa':'kivikasa',S0.x+Math.cos(a)*d,S0.z+Math.sin(a)*d);}
  for(let i=0;i<4;i++){const a=rng()*TAU,d=12+rng()*12;add('marjat',S0.x+Math.cos(a)*d,S0.z+Math.sin(a)*d);}
  // Instanssit jaetaan CHN×CHN ruutuun: jokaisella oma rajauspallo, joten näkymättömät ruudut karsitaan.
  for(const type in tmp){const per=new Map();for(const n of tmp[type]){const k=chunkOf(n.x,n.z);if(!per.has(k))per.set(k,[]);per.get(k).push(n);}
    const pool=POOL[type]||0;nodeIM[type]=[];
    for(let k=0;k<CHN*CHN;k++){const list=per.get(k)||[],extra=pool?Math.ceil(pool/(CHN*CHN))*2:0;if(!list.length&&!extra)continue;
      const im=makeChunkIM(type,k,list.length+extra);im.userData.used=list.length;im.userData.base=list.length;im.count=list.length;im.visible=list.length>0;
      list.forEach((n,i)=>{n.idx=i;n.im=im;initNode(n);});im.instanceMatrix.needsUpdate=true;}}
})();
function makeChunkIM(type,k,cap){const cx=k%CHN,cz=(k/CHN)|0,x0=-HALF+cx*CHS,z0=-HALF+cz*CHS;
  const geo=NGEO[type].clone();geo.boundingSphere=new THREE.Sphere(new V3(x0+CHS/2,10,z0+CHS/2),CHS*.71+30);
  const im=new THREE.InstancedMesh(geo,NODE[type].kind==='tree'?treeMat:vcMat,cap);im.castShadow=NODE[type].kind!=='pick'&&NODE[type].kind!=='deco';im.receiveShadow=true;
  im.userData.cx=x0+CHS/2;im.userData.cz=z0+CHS/2;im.userData.k=k;im.userData.vis=VIS_R[NODE[type].kind]||140;scene.add(im);nodeIM[type].push(im);CHUNK_IMS.push(im);return im;}
// Kaukaiset ruudut piiloon (sumu peittää ne joka tapauksessa).
// Staattiset kohteet (riimukivet, rauniot, portaalit, kumpu, löytöpaikat): piirtoetäisyyden (sumun) takana olevia ei piirretä.
// Keskipiste ja säde lasketaan kerran (userData.cs). Luolaston sisätilat näkyvät vain kun pelaaja on siellä.
let statT=0;const _sb=new THREE.Box3(),_sv=new THREE.Vector3();
function cullStatics(){const cx=camera.position.x,cz=camera.position.z,f=scene.fog.far+30;
  for(const o of statics.children){let c=o.userData.cs;if(!c){if(o.isInstancedMesh){_sb.makeEmpty();for(let i=0;i<o.count;i++){o.getMatrixAt(i,_m4);_sb.expandByPoint(_sv.setFromMatrixPosition(_m4));}}else _sb.setFromObject(o);if(_sb.isEmpty()){o.userData.cs=c={x:o.position.x,z:o.position.z,r:1,dun:false};}else{_sb.getCenter(_sv);c=o.userData.cs={x:_sv.x,z:_sv.z,r:Math.min(400,_sb.getSize(_sv).length()/2),dun:_sb.min.y>DUN.y-5&&_sb.max.y<DUN.y+20&&Math.abs(_sb.min.x)>HALF+50};}}
    const vis=c.dun?P.inDun:(!P.inDun&&dist2(cx,cz,c.x,c.z)<(f+c.r)*(f+c.r));if(o.visible!==vis)o.visible=vis;}}
function updateChunkVis(){statT-=1/30;if(statT<=0){statT=.5;cullStatics();}
  const cx=camera.position.x,cz=camera.position.z,f=scene.fog.far;
  for(const im of CHUNK_IMS){const R=Math.min(f,im.userData.vis*RDK*(im.userData.vis<80?DETK:1))+CHS*.72;im.visible=im.count>0&&!P.inDun&&dist2(cx,cz,im.userData.cx,im.userData.cz)<R*R;}}
function initNode(n){n.ox=n.x;n.oz=n.z;n.s0=n.s;n.id=nodeIdN++;n.def=NODE[n.type];n.maxHp=(n.def.hp||1)*(n.def.kind==='tree'?n.s*n.s*1.2:1);n.hp=n.maxHp;n.alive=true;n.respawnAt=0;
  setNodeMatrix(n,true);
  if(n.def.kind==='tree')n.col=addCircle(n.x,n.z,n.def.r*n.s,n.y-1,n.y+6*n.s,n);
  else if(n.def.kind==='rock')n.col=addCircle(n.x,n.z,n.def.r*n.s,n.y-1,n.y+1.2*n.s,n);
  nodes.push(n);}
function setNodeMatrix(n,vis){_q.setFromEuler(_e.set(0,n.rot,0));_s.setScalar(vis?n.s:0.0001);_p.set(n.x,n.y-(n.def.kind==='pick'||n.def.kind==='deco'?0:.05),n.z);_m4.compose(_p,_q,_s);n.im.setMatrixAt(n.idx,_m4);n.im.instanceMatrix.needsUpdate=true;}
const NGRID=new Map();
function ngridAdd(n){const k=ck(Math.floor(n.x/CELL),Math.floor(n.z/CELL));let a=NGRID.get(k);if(!a)NGRID.set(k,a=[]);a.push(n);n.gk=[k];}
function ngridRemove(n){for(const k of n.gk||[]){const a=NGRID.get(k);if(a){const i=a.indexOf(n);if(i>=0)a.splice(i,1);}}n.gk=[];}
nodes.forEach(ngridAdd);
// Etäisyys solmuun: tukeille janan lähin piste, muille keskipiste.
function nodeDist(n,x,z){if(!n.isLog)return Math.hypot(x-n.x,z-n.z);const dx=n.bx-n.ax,dz=n.bz-n.az,t=clamp(((x-n.ax)*dx+(z-n.az)*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(x-(n.ax+dx*t),z-(n.az+dz*t));}
function nodesNear(x,z,r,out){out.length=0;const x0=Math.floor((x-r)/CELL),x1=Math.floor((x+r)/CELL),z0=Math.floor((z-r)/CELL),z1=Math.floor((z+r)/CELL);for(let gx=x0;gx<=x1;gx++)for(let gz=z0;gz<=z1;gz++){const a=NGRID.get(ck(gx,gz));if(a)for(const n of a)if(n.alive&&!out.includes(n)&&nodeDist(n,x,z)<r)out.push(n);}return out;}
function killNode(n){markShadowDirty();n.alive=false;n.respawnAt=playTime+n.def.respawn;setNodeMatrix(n,false);if(n.col)n.col.off=true;}
function reviveNode(n){markShadowDirty();n.alive=true;n.hp=n.maxHp;setNodeMatrix(n,true);if(n.col)n.col.off=false;}
// Siirtää puun/kasvin uuteen paikkaan (törmäys, ruudukko, korkeus, koko).
function moveNode(n,x,z,s){n.x=x;n.z=z;n.s=s;n.y=terrainH(x,z);n.maxHp=(n.def.hp||1)*(n.def.kind==='tree'?s*s*1.2:1);
  if(n.col){gridRemove(n.col);const off=n.col.off;if(n.def.kind==='tree')n.col=addCircle(x,z,n.def.r*s,n.y-1,n.y+6*s,n);else n.col=addCircle(x,z,n.def.r*s,n.y-1,n.y+1.2*s,n);n.col.off=off;}
  ngridRemove(n);ngridAdd(n);
  // Kuva siirtyy törmäyksen ja hakkuukohteen mukana (ennen latauksessa siirretyn puun kuva jäi alkuperäiselle paikalle → haamupuu)
  if(n.alive)setNodeMatrix(n,true);}
function locMin(x,z){let m=1e9;for(const k in LOC)m=Math.min(m,Math.hypot(x-LOC[k].x,z-LOC[k].z));return m;}
// Kaadettu puu uusiutuu enintään 5 m (kasvi 3 m) alkuperäisestä paikastaan; muuten alkuperäiseen paikkaan.
function respawnNode(n){const kind=n.def.kind;
  if(kind==='tree'||kind==='pick'){const R=kind==='tree'?5:3,b0=biomeHere(n.ox,n.oz),lm=Math.min(20,locMin(n.ox,n.oz));let px=n.ox,pz=n.oz,ps=n.s0;
    const tmp=[];
    for(let t=0;t<10;t++){const a=rng()*TAU,d=Math.sqrt(rng())*R,x=n.ox+Math.cos(a)*d,z=n.oz+Math.sin(a)*d,h=terrainH(x,z);
      if(h<=1||biomeAt(x,z,h)!==b0||nearBase(x,z)||locMin(x,z)<lm)continue;if(nodesNear(x,z,kind==='tree'?2.5:1,tmp).length)continue;
      px=x;pz=z;ps=kind==='tree'?(n.type==='aarnipuu'?.8+rng()*.35:treeS()):1;break;}
    // Ei sopivaa paikkaa: alkuperäinenkään paikka ei kelpaa, jos se on rakennusalueella → yritetään myöhemmin uudelleen
    if(nearBase(px,pz)){n.respawnAt=playTime+60;return false;}
    moveNode(n,px,pz,ps);}
  syncNodeY(n);reviveNode(n);return true;}
// Palauttaa solmun alkuperäiseen paikkaan ja kokoon (uusi peli / lataus).
function syncNodeY(n){const y=terrainH(n.x,n.z);if(Math.abs(y-n.y)<.001)return;n.y=y;if(n.alive)setNodeMatrix(n,true);if(n.col){n.col.minY=y-1;n.col.maxY=n.def.kind==='tree'?y+6*n.s:y+1.2*n.s;}}
// Maanmuokkaus (lapio): korkeuskartta, maastoverkko, solmujen korkeudet. Muokatut kärjet tallentuvat (`TERRA`).
function terraSetVertex(i,h){if(Math.abs(h-HGT0[i])<.005){delete TERRA[i];h=HGT0[i];}else TERRA[i]=h;HGT[i]=h;terrainMesh.geometry.attributes.position.array[i*3+1]=h;}
function terraFlush(){terrainMesh.geometry.attributes.position.needsUpdate=true;terrainMesh.geometry.computeBoundingSphere();}
function terraList(){return Object.entries(TERRA).map(([i,h])=>[+i,+h.toFixed(2)]);}
function applyTerra(list){for(const [i,h] of list)terraSetVertex(i,h);terraFlush();for(const n of nodes)syncNodeY(n);}
function resetTerra(){for(const i in TERRA){HGT[i]=HGT0[i];terrainMesh.geometry.attributes.position.array[i*3+1]=HGT0[i];delete TERRA[i];}terraFlush();resetMud();}
// Multaisuus (0–1) maaston kärjissä: lapio lisää (tummat polut), kuokka vähentää. Väri sekoittuu alkuperäisestä kohti tummaa multaa.
const MUD=new Float32Array(HN*HN),TCOL0=terrainColors.slice(),MUDC=[.25,.18,.12];
function mudSet(i,v){v=clamp(v,0,1);if(v<.01)v=0;MUD[i]=v;const c=terrainMesh.geometry.attributes.color.array,j=((i*2654435761)>>>0)%100/100*.16+.92;for(let k=0;k<3;k++)c[i*3+k]=lerp(TCOL0[i*3+k],MUDC[k]*j,v);}
function mudFlush(){terrainMesh.geometry.attributes.color.needsUpdate=true;grassDirty=true;}
function mudList(){const o=[];for(let i=0;i<MUD.length;i++)if(MUD[i]>0)o.push([i,+MUD[i].toFixed(2)]);return o;}
function applyMud(list){for(const [i,v] of list)mudSet(i,v);mudFlush();}
function resetMud(){for(let i=0;i<MUD.length;i++)if(MUD[i]>0)mudSet(i,0);mudFlush();}
function restoreNode(n){if(n.x!==n.ox||n.z!==n.oz||n.s!==n.s0)moveNode(n,n.ox,n.oz,n.s0);syncNodeY(n);if(!n.alive)reviveNode(n);else setNodeMatrix(n,true);}

/* ---------------- TUKIT (kaatuneet puut) ---------------- */
const logs=[];
// Rungon kuoren väri puulajeittain (tukit ja oksat saavat alkuperäisen puun värin) ja kuoren sisäväri (lohkeamat ja kolot).
const TRUNK_C={kuusi:0x5a3a22,koivu:0xe9e6dc,kelo:0x6d665c,manty:0xa8643a,aarnipuu:0x4a3524},LEAF_C={kuusi:0x2e5a2e,koivu:0x7aa641,kelo:0,manty:0x2f5530,aarnipuu:0x1c3a22},WOOD_IN=0xc08a52;
const logMats={};const logMatOf=t=>logMats[t]||(logMats[t]=mat(TRUNK_C[t]||0x6b4a2e));
function spawnLogs(n,a){
  const H=(TREE_H[n.type]||5)*n.s,rad=(n.type==='aarnipuu'?.55:.2)*n.s,cnt=n.s>1.3||n.type==='aarnipuu'?2:1;
  const dx=Math.sin(a),dz=Math.cos(a),L0=.5,L1=H*.85,seg=(L1-L0)/cnt;
  for(let i=0;i<cnt;i++){const s0=L0+i*seg+.1,s1=L0+(i+1)*seg-.1,len=s1-s0;
    const ax=n.x+dx*s0,az=n.z+dz*s0,bx=n.x+dx*s1,bz=n.z+dz*s1,cx=(ax+bx)/2,cz=(az+bz)/2,y=terrainH(cx,cz);
    const geo=new THREE.CylinderGeometry(rad,rad*1.08,len,7);geo.rotateX(Math.PI/2);
    const mesh=new THREE.Mesh(geo,logMatOf(n.type));mesh.position.set(cx,y+rad*.9,cz);
    if(n.type==='koivu')for(let k=0;k<3;k++){const st=new THREE.Mesh(new THREE.CylinderGeometry(rad*1.01,rad*1.01,.06,7),mat(0x222222));st.rotation.x=Math.PI/2;st.position.z=(k-1)*len*.28;mesh.add(st);}mesh.rotation.y=a;mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh);
    const lg={type:'tukki',def:NODE.tukki,isLog:true,x:cx,z:cz,y,ax,az,bx,bz,rad,s:n.s,hp:24*n.s*n.s,maxHp:24*n.s*n.s,alive:true,mesh,cols:[],len,a,notches:[],tier:n.def.tier||1,dropId:n.type==='aarnipuu'?'tervaspuu':'puu',src:n.type};
    for(let t=0;t<=len;t+=.9){const px=ax+(bx-ax)*t/len,pz=az+(bz-az)*t/len;lg.cols.push(addCircle(px,pz,rad,y-1,y+rad*1.8,lg));}
    lg.gk=[];const ks=new Set();for(let t=0;t<=len;t+=2){ks.add(ck(Math.floor((ax+(bx-ax)*t/len)/CELL),Math.floor((az+(bz-az)*t/len)/CELL)));}ks.add(ck(Math.floor(bx/CELL),Math.floor(bz/CELL)));
    for(const k of ks){let arr=NGRID.get(k);if(!arr)NGRID.set(k,arr=[]);arr.push(lg);lg.gk.push(k);}
    logs.push(lg);}
}
function removeLog(lg){lg.alive=false;scene.remove(lg.mesh);lg.mesh.geometry.dispose();for(const c of lg.cols)gridRemove(c);ngridRemove(lg);const i=logs.indexOf(lg);if(i>=0)logs.splice(i,1);}
function clearLogs(){for(const lg of [...logs])removeLog(lg);}

/* ---------------- METSÄ KASVAA ---------------- */
function plantTree(type,x,z,s){const k=chunkOf(x,z),im=(nodeIM[type]||[]).find(m=>m.userData.k===k);if(!im||im.userData.used>=im.instanceMatrix.count)return null;
  const n={type,x,z,y:terrainH(x,z),s,rot:rng()*TAU,idx:im.userData.used++,im,planted:true};im.count=im.userData.used;initNode(n);ngridAdd(n);return n;}
function unplantAll(){for(let i=nodes.length-1;i>=0;i--){const n=nodes[i];if(!n.planted)continue;setNodeMatrix(n,false);if(n.col)gridRemove(n.col);ngridRemove(n);nodes.splice(i,1);}
  for(const k in nodeIM)for(const im of nodeIM[k]){im.userData.used=im.userData.base;im.count=im.userData.base;}nodeIdN=nodes.length?Math.max(...nodes.map(n=>n.id))+1:0;}
// Pelaajan rakentamien osien läheisyyteen ei uusiudu eikä kasva puita tai kasveja: 15 m jokaisesta rakennusosasta
// ja työpenkin rakennusalue + 30 % (BENCH_R × 1,3 = 26 m).
const BASE_PIECE_R=15;
function nearBase(x,z){for(const p of pieces){const r=p.t==='tyopenkki'?BENCH_R*1.3:BASE_PIECE_R;if(dist2(p.x,p.z,x,z)<r*r)return true;}return false;}
// Yöllä nukkuessa: kaadetut puut ja poimitut kasvit uusiutuvat (ei uusia), paitsi rakennusten lähellä.
function regrowForest(){let revived=nightRegrow();
  for(const n of nodes)if(!n.alive&&n.def.kind==='pick'&&!nearBase(n.x,n.z)){if(respawnNode(n))revived++;}
  return{revived,planted:0};}
// Kaadetut puut yrittävät kasvaa takaisin vain kerran yössä ja vain pelaajan 100 m säteellä (ei rakennusalueelle).
// Yön tunnus: illan tunnit kuuluvat kuluvaan päivään, aamuyö edelliseen (flags.rgN = viimeisin yö, jona yritettiin).
const REGROW_R=100;
function nightId(){return dayN-(dayT<.5?1:0);}
function nightRegrow(){const id=nightId();if(flags.rgN===id)return 0;flags.rgN=id;let c=0;
  for(const n of nodes)if(!n.alive&&n.def.kind==='tree'&&dist2(n.x,n.z,P.pos.x,P.pos.z)<REGROW_R*REGROW_R&&!nearBase(n.x,n.z)){if(respawnNode(n))c++;}
  return c;}

/* ---------------- RUOHO (v1.00, kohta 15) ---------------- */
// Pystyheinätupsut pelaajan ympärillä (instanssit): tiheys, pituus ja väri biomin mukaan (TBIOME, render.js), ei poluilla (multa), vedessä,
// jyrkänteillä eikä rakennusten alla. Paikat ovat 2D-ruudukossa hajautettuja (sama kohta → sama tupsu), joten ruoho ei vaihdu liikkuessa;
// lista rakennetaan uudelleen, kun pelaaja on liikkunut 6 m. Asetus SET.grass: 0 pois, 1 normaali (32 m, väli 1,15 m), 2 täysi (44 m, 0,72 m).
// Heilunta: sama tuuli kuin puilla (SWAY.uWind/uWDir/uLean): kallistus tuulen suuntaan (korren korkeuden neliönä) + edestakainen heilunta.
//                     tiheys pituus  väri (tyvi → kärki)
const GRASS_DEF=[[1,1,0x3d6a22,0x9ccf52],[.9,.95,0x3a6624,0x8cc04a],[.5,.8,0x2c4e1e,0x6e9a3a],[.75,1.35,0x40502a,0x9aa060],[.35,.55,0x5a6a3a,0xb8c08a],
  [.2,.9,0x1f3a1c,0x4f7a34],[.3,.75,0x4a4436,0x8a7f60],[.55,.55,0x5a5a30,0xa09a58],[.08,.5,0x5a5a3a,0x9a9a70],[.15,.6,0x50583a,0x8a9060],[.1,.8,0x8a8a5a,0xd0c890]];
let grassC={x:1e9,z:1e9},grassIM=null;
const GRASS_MAT=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,transparent:true,opacity:.62,depthWrite:false});   // v1.02 läpikuultava, kevyt
GRASS_MAT.onBeforeCompile=sh=>{sh.uniforms.uTime=SWAY.uTime;sh.uniforms.uWind=SWAY.uWind;sh.uniforms.uWDir=SWAY.uWDir;sh.uniforms.uLean=SWAY.uLean;
  sh.vertexShader='uniform float uTime;uniform float uWind;uniform vec3 uWDir;uniform float uLean;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  float gPh=instanceMatrix[3].x*.31+instanceMatrix[3].z*.27;float gh=max(0.,position.y);float gk=gh*gh;
  mat3 gM=mat3(instanceMatrix);vec3 gL=vec3(dot(gM[0],uWDir),dot(gM[1],uWDir),dot(gM[2],uWDir));gL/=max(length(gL),1e-4);
  float gs=(.1+uWind*.25)*sin(uTime*2.3+gPh)+uLean*(.35+.12*sin(uTime*1.7+gPh*1.3));
  transformed.x+=gL.x*gs*gk;transformed.z+=gL.z*gs*gk;transformed.y-=abs(gs)*gk*.25;
  transformed.x+=sin(uTime*3.1+gPh*2.)*.025*gh*(.3+uWind);`);};
// Tupsu: 7 kortta eri suuntiin ja pituuksiin (kolmio, tyvi tumma → kärki vaalea), kaarevuus pieni kallistus ulospäin.
const GRASS_GEO=(function(){const pos=[],col=[],r=mulberry32(4711);
  for(let i=0;i<5;i++){const a=r()*TAU,h=.22+r()*.36,w=.018+r()*.014,ox=(r()-.5)*.25,oz=(r()-.5)*.25,tx=Math.cos(a)*.12,tz=Math.sin(a)*.12,cx=Math.sin(a)*w,cz=-Math.cos(a)*w;
    pos.push(ox-cx,0,oz-cz, ox+cx,0,oz+cz, ox+tx,h,oz+tz);col.push(.7,.75,.62, .7,.75,.62, 1.15,1.15,1.1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(pos.map((v,i)=>i%3===1?1:0),3));   // normaalit ylös → valaistus kuin maastolla, ei mustaa kääntöpuolta
  g.boundingSphere=new THREE.Sphere(new V3(0,0,0),80);return g;})();
// Värit: kärjen väri = vertex 1, tyvi = 0 → sekoitetaan instanssiväreillä (instanceColor = tyvi, kärki shaderissa ei erikseen: käytetään kahta
// geometrian väriä kertoimena ja instanssiväriä sävynä).
const _grM=new THREE.Matrix4(),_grQ=new THREE.Quaternion(),_grS=new V3(),_grP=new V3(),_grC=new THREE.Color(),_grC2=new THREE.Color();
function grassHash(i,j){let h=Math.imul(i,374761393)+Math.imul(j,668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
function rebuildGrass(){const lv=+(SET.grass??1);grassDirty=false;
  if(grassIM){scene.remove(grassIM);grassIM.dispose();grassIM=null;}if(!lv||P.inDun)return;
  const R=lv>=2?40:30,sp=lv>=2?.6:.85,cx=P.pos.x,cz=P.pos.z,N=Math.ceil(Math.PI*R*R/(sp*sp))+10;
  const im=new THREE.InstancedMesh(GRASS_GEO,GRASS_MAT,N);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.castShadow=false;im.receiveShadow=true;im.frustumCulled=false;
  let n=0;const i0=Math.floor((cx-R)/sp),i1=Math.ceil((cx+R)/sp),j0=Math.floor((cz-R)/sp),j1=Math.ceil((cz+R)/sp);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const h1=grassHash(i,j),h2=grassHash(j+7919,i-104729);const x=(i+h1)*sp,z=(j+h2)*sp;if((x-cx)**2+(z-cz)**2>R*R)continue;
    const gi=Math.round((x+HALF)/GS),gj=Math.round((z+HALF)/GS);if(gi<0||gj<0||gi>=HN||gj>=HN)continue;const k=gj*HN+gi,bi=TBIOME[k];if(bi===255)continue;const D=GRASS_DEF[bi];
    // v1.02 laikuittain: kasvaa vain kohinan muodostamissa tupsuryhmissä (~30 % maasta), reunat harvenevat
    const pv=vnoise(x*.09+13,z*.09-7)*.7+vnoise(x*.31,z*.31)*.3,patch=sstep(.52,.68,pv);if(patch<=0||grassHash(i*3+1,j*5+2)>D[0]*patch||MUD[k]>.22)continue;const y=terrainH(x,z);if(y<.35)continue;
    if(Math.abs(terrainH(x+.8,z)-y)>.9||Math.abs(terrainH(x,z+.8)-y)>.9)continue;if(pointBlocked(x,y+.3,z))continue;
    const s=(.55+grassHash(i+31,j+17)*.9)*D[1];_grQ.setFromAxisAngle(_up,grassHash(i-5,j+9)*TAU);_grS.set(s*(.8+h1*.4),s,s*(.8+h2*.4));_grP.set(x,y-.03,z);_grM.compose(_grP,_grQ,_grS);im.setMatrixAt(n,_grM);
    _grC.setHex(D[3]).lerp(_grC2.setHex(D[2]),grassHash(i+77,j-3)*.5);im.setColorAt(n,_grC);n++;if(n>=N)break;}
  im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;scene.add(im);grassIM=im;grassC={x:cx,z:cz};}
function updateGrass(){if(P.inDun){if(grassIM)grassIM.visible=false;return;}if(grassIM)grassIM.visible=true;
  if(grassDirty||dist2(P.pos.x,P.pos.z,grassC.x,grassC.z)>36)rebuildGrass();}
