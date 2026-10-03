/* Hiidenmaa – resources.js
   Kerättävät resurssit: puut, kivet, malmit, poimittavat; sijoittelu ja uusiutuminen */
'use strict';

/* ---------------- SCENERY (resource nodes) ---------------- */
const rng=mulberry32(20261003);
const NODE={
  kuusi:{kind:'tree',hp:30,drops:[['puu',3,5],['pihka',0,1]],r:.38,respawn:1500},
  koivu:{kind:'tree',hp:24,drops:[['puu',3,4]],r:.3,respawn:1500},
  kelo:{kind:'tree',hp:18,drops:[['puu',2,3]],r:.32,respawn:1500},
  lohkare:{kind:'rock',hp:45,drops:[['kivi',5,8]],r:1.05,respawn:1800},
  kuparisuoni:{kind:'rock',hp:70,drops:[['malmi',3,5],['kivi',1,3]],r:1.1,respawn:2400},
  oksa:{kind:'pick',item:'puu',n:[1,1],respawn:300,label:'Oksa'},
  kivikasa:{kind:'pick',item:'kivi',n:[1,1],respawn:300,label:'Kivi'},
  piikivi:{kind:'pick',item:'piikivi',n:[1,2],respawn:420,label:'Piikivi'},
  marjat:{kind:'pick',item:'marjat',n:[2,3],respawn:480,label:'Puolukkamätäs'},
  sieni:{kind:'pick',item:'sieni',n:[1,1],respawn:480,label:'Herkkutatti'},
};
const NGEO={
  kuusi:mergeParts([part(new THREE.BoxGeometry(.4,2.2,.4),0x5a3a22,0,1.1,0),part(new THREE.ConeGeometry(1.7,2.5,7),0x2e5a2e,0,2.7,0),part(new THREE.ConeGeometry(1.3,2.1,7),0x356836,0,3.9,0),part(new THREE.ConeGeometry(.85,1.7,7),0x3b7440,0,5,0)]),
  koivu:mergeParts([part(new THREE.BoxGeometry(.32,4.6,.32),0xe9e6dc,0,2.3,0),part(new THREE.BoxGeometry(.34,.1,.2),0x222222,0,1.4,.02),part(new THREE.BoxGeometry(.34,.08,.2),0x222222,0,2.6,-.02),part(new THREE.IcosahedronGeometry(1.7,0),0x7aa641,0,4.7,0),part(new THREE.IcosahedronGeometry(1.2,0),0x8bb84c,.6,5.5,.3)]),
  kelo:mergeParts([part(new THREE.BoxGeometry(.36,4.2,.36),0x6d665c,0,2.1,0),part(new THREE.BoxGeometry(.16,1.4,.16),0x6d665c,.5,3,0,0,0,-.8),part(new THREE.BoxGeometry(.14,1.1,.14),0x6d665c,-.4,3.6,.1,0,0,.9)]),
  lohkare:mergeParts([part(new THREE.IcosahedronGeometry(1.2,0),0x85837d,0,.55,0,0,0,0,1,.75,1),part(new THREE.IcosahedronGeometry(.7,0),0x77756f,.7,.35,.3)]),
  kuparisuoni:mergeParts([part(new THREE.IcosahedronGeometry(1.25,0),0x66605a,0,.6,0,0,0,0,1,.8,1),part(new THREE.BoxGeometry(.3,.3,.3),0xd9874a,.6,.9,.6,.5,.5),part(new THREE.BoxGeometry(.28,.28,.28),0xd9874a,-.7,.6,.5,.3,.8),part(new THREE.BoxGeometry(.25,.25,.25),0xe39a5a,.1,1.3,-.5,.2,.4),part(new THREE.BoxGeometry(.3,.3,.3),0xd9874a,-.3,.8,-.8)]),
  oksa:mergeParts([part(new THREE.BoxGeometry(.08,.08,1),0x6b4527,0,.05,0),part(new THREE.BoxGeometry(.05,.05,.4),0x6b4527,.12,.05,.2,0,.8)]),
  kivikasa:mergeParts([part(new THREE.IcosahedronGeometry(.22,0),0x8f8d86,0,.12,0),part(new THREE.IcosahedronGeometry(.15,0),0x7a7872,.25,.08,.1)]),
  piikivi:mergeParts([part(new THREE.TetrahedronGeometry(.22,0),0x40464f,0,.12,0),part(new THREE.TetrahedronGeometry(.16,0),0x50565f,.22,.08,-.1)]),
  marjat:mergeParts([part(new THREE.IcosahedronGeometry(.5,0),0x3f6a2c,0,.35,0,0,0,0,1,.7,1),part(new THREE.BoxGeometry(.1,.1,.1),0xc8263a,.3,.5,.2),part(new THREE.BoxGeometry(.1,.1,.1),0xc8263a,-.25,.45,.25),part(new THREE.BoxGeometry(.1,.1,.1),0xc8263a,.05,.62,-.25),part(new THREE.BoxGeometry(.1,.1,.1),0xc8263a,-.3,.4,-.2)]),
  sieni:mergeParts([part(new THREE.BoxGeometry(.12,.25,.12),0xefe6d2,0,.12,0),part(new THREE.ConeGeometry(.24,.18,6),0x9b6a3a,0,.3,0)]),
};
const nodes=[]; const nodeIM={};
// Puiden latvat huojuvat tuulessa (vahvemmin tuulisella säällä ja myrskyssä).
const SWAY={uTime:{value:0},uWind:{value:.15}};
const treeMat=vcMat.clone();
treeMat.onBeforeCompile=sh=>{sh.uniforms.uTime=SWAY.uTime;sh.uniforms.uWind=SWAY.uWind;
  sh.vertexShader='uniform float uTime;uniform float uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  #ifdef USE_INSTANCING
  float swPh=instanceMatrix[3].x*.13+instanceMatrix[3].z*.11;
  #else
  float swPh=0.;
  #endif
  float swH=max(0.,position.y-1.5);
  transformed.x+=sin(uTime*1.7+swPh)*uWind*swH*.05;transformed.z+=cos(uTime*1.3+swPh)*uWind*swH*.035;`);};
(function placeNodes(){
  const tmp={};for(const k in NGEO)tmp[k]=[];
  const add=(type,x,z,s=1,rot)=>{const y=terrainH(x,z);tmp[type].push({type,x,z,y,s,rot:rot??rng()*TAU});};
  const clear=(x,z)=>{for(const k in LOC){const L=LOC[k];if(dist2(x,z,L.x,L.z)<(k==='spawn'?14*14:(k.startsWith('rune')?4*4:20*20)))return false;}return true;};
  for(let x=-196;x<196;x+=3.6)for(let z=-196;z<196;z+=3.6){
    const px=x+(rng()-.5)*3,pz=z+(rng()-.5)*3,h=terrainH(px,pz);if(h<.8)continue;if(!clear(px,pz))continue;
    const b=biomeAt(px,pz,h),r=rng();
    if(b==='forest'){if(r<.42)add(rng()<.82?'kuusi':'koivu',px,pz,.8+rng()*.55);}
    else if(b==='meadow'){if(r<.035)add('koivu',px,pz,.8+rng()*.4);}
    else if(b==='moor'){if(r<.05)add('kelo',px,pz,.8+rng()*.4);}
    else if(b==='mountain'){if(h<31&&r<.14)add('kuusi',px,pz,.7+rng()*.4);}
  }
  for(let i=0;i<2600;i++){
    const px=(rng()-.5)*380,pz=(rng()-.5)*380,h=terrainH(px,pz);if(h<-.2||!clear(px,pz)&&Math.hypot(px,pz)>16)continue;
    const b=biomeAt(px,pz,h),r=rng();
    if(h>.2&&h<2.4&&r<.5){add('piikivi',px,pz);continue;}
    if(h<1)continue;
    if(b==='meadow'){if(r<.22)add('oksa',px,pz);else if(r<.42)add('kivikasa',px,pz);else if(r<.56)add('marjat',px,pz);else if(r<.6)add('lohkare',px,pz,.8+rng()*.5);}
    else if(b==='forest'){if(r<.2)add('oksa',px,pz);else if(r<.3)add('kivikasa',px,pz);else if(r<.42)add('sieni',px,pz);else if(r<.5)add('marjat',px,pz);else if(r<.58)add('lohkare',px,pz,.8+rng()*.6);else if(r<.625)add('kuparisuoni',px,pz,.9+rng()*.3);}
    else if(b==='mountain'){if(r<.3)add('lohkare',px,pz,1+rng()*.8);else if(r<.38)add('kuparisuoni',px,pz,1);else if(r<.5)add('kivikasa',px,pz);}
    else if(b==='moor'){if(r<.15)add('kivikasa',px,pz);else if(r<.25)add('lohkare',px,pz,.8+rng()*.4);}
  }
  // varmistetaan aloitusalueelle tarvikkeet
  for(let i=0;i<14;i++){const a=rng()*TAU,d=7+rng()*14;add(i%2?'oksa':'kivikasa',Math.cos(a)*d,6+Math.sin(a)*d);}
  for(let i=0;i<4;i++){const a=rng()*TAU,d=12+rng()*12;add('marjat',Math.cos(a)*d,6+Math.sin(a)*d);}
  let id=0;
  for(const type in tmp){
    const list=tmp[type];if(!list.length)continue;
    const im=new THREE.InstancedMesh(NGEO[type],NODE[type].kind==='tree'?treeMat:vcMat,list.length);im.castShadow=NODE[type].kind!=='pick';im.receiveShadow=true;
    nodeIM[type]=im;scene.add(im);
    list.forEach((n,i)=>{n.id=id++;n.idx=i;n.def=NODE[type];n.hp=n.def.hp||1;n.alive=true;n.respawnAt=0;
      setNodeMatrix(n,true);
      if(n.def.kind==='tree')n.col=addCircle(n.x,n.z,n.def.r*n.s,n.y-1,n.y+6,n);
      else if(n.def.kind==='rock')n.col=addCircle(n.x,n.z,n.def.r*n.s,n.y-1,n.y+1.2*n.s,n);
      nodes.push(n);});
    im.instanceMatrix.needsUpdate=true;
  }
})();
function setNodeMatrix(n,vis){_q.setFromEuler(_e.set(0,n.rot,0));_s.setScalar(vis?n.s:0.0001);_p.set(n.x,n.y-(n.def.kind==='pick'?0:.05),n.z);_m4.compose(_p,_q,_s);nodeIM[n.type].setMatrixAt(n.idx,_m4);nodeIM[n.type].instanceMatrix.needsUpdate=true;}
const NGRID=new Map();
nodes.forEach(n=>{const k=ck(Math.floor(n.x/CELL),Math.floor(n.z/CELL));let a=NGRID.get(k);if(!a)NGRID.set(k,a=[]);a.push(n);});
function nodesNear(x,z,r,out){out.length=0;const x0=Math.floor((x-r)/CELL),x1=Math.floor((x+r)/CELL),z0=Math.floor((z-r)/CELL),z1=Math.floor((z+r)/CELL);for(let gx=x0;gx<=x1;gx++)for(let gz=z0;gz<=z1;gz++){const a=NGRID.get(ck(gx,gz));if(a)for(const n of a)if(n.alive&&dist2(x,z,n.x,n.z)<r*r)out.push(n);}return out;}
function killNode(n){n.alive=false;n.respawnAt=playTime+n.def.respawn;setNodeMatrix(n,false);if(n.col)n.col.off=true;}
function reviveNode(n){n.alive=true;n.hp=n.def.hp||1;setNodeMatrix(n,true);if(n.col)n.col.off=false;}
