/* Hiidenmaa – world.js
   Maailman muoto: korkeusfunktio, biomit, paikkojen sijainnit (LOC) */
'use strict';

/* ---------------- WORLD LAYOUT ---------------- */
// Maailma on suunniteltu "yksikkökoordinaatteihin" (vanha ±200 m kartta) ja skaalataan kertoimella WS.
// Isot muodot (vuoret, nummi, järvi, biomit) skaalautuvat, pienet yksityiskohdat pysyvät metreinä.
const WS=1.75;
const HALF=350, GN=350, GS=HALF*2/GN, HN=GN+1;
const DUN={x:900,y:60,z:900}; // hautakummun sisätila (erillinen tila, kartan ulkopuolella)
// Kolme karttaa. Kaikki mitat yksikkökoordinaateissa (kerrotaan WS:llä). Hautakumpu on aina lounaassa
// (−x, +z) ja vuoret pohjoisessa, jotta riimukivien tekstit pitävät paikkansa.
const MAPS=[
  {name:'Hiidenmaa',ox:0,oz:0,
    loc:{spawn:[0,6],barrow:[-118,92],circle:[-92,138],ruinF:[52,-40],ruinM:[-34,-122],ruinC:[150,24],rune1:[5,0],rune2:[-64,48],rune3:[22,-92]},
    center:[0,0],mtn:{dx:0,dz:-1,a:55,b:125,h:36},moor:[-108,112],lakes:[[58,48,42,13]],east:1,aarni:[[95,-22,30],[-78,-12,26]]},
  {name:'Kalmansaaret',ox:57,oz:-23,
    loc:{spawn:[4,10],barrow:[-112,98],circle:[-86,140],ruinF:[88,-52],ruinM:[-40,-118],ruinC:[150,28],rune1:[9,4],rune2:[-80,92],rune3:[-34,-92]},
    mtn:null,peak:[-40,-128,48,34],moor:[-104,114],lakes:[],east:0,aarni:[[92,-58,24]],
    islands:[[0,8,74],[-100,112,72],[88,-52,64],[-40,-118,64],[150,28,42],[40,110,50]],
    bars:[[0,8,-100,112],[0,8,88,-52],[0,8,-40,-118],[88,-52,150,28],[0,8,40,110]]},
  {name:'Tunturinniemi',ox:-41,oz:88,
    loc:{spawn:[6,40],barrow:[-116,118],circle:[-88,150],ruinF:[78,52],ruinM:[-30,-62],ruinC:[152,74],rune1:[11,34],rune2:[-62,92],rune3:[18,-22]},
    mtn:{dx:0,dz:-1,a:-5,b:70,h:52},moor:[-104,128],lakes:[[64,104,30,10]],east:1,aarni:[[95,40,26],[-80,40,24]]},
];
const MAP_ID=(()=>{try{const v=+localStorage.getItem('hiidenmaa_map');return v>=0&&v<MAPS.length?v|0:0;}catch(e){return 0;}})();
const MAP=MAPS[MAP_ID];
const LOC={};
for(const k in MAP.loc){const [u,v]=MAP.loc[k];LOC[k]={x:u*WS,z:v*WS};}
Object.assign(LOC.barrow,{name:'Hautakumpu'});Object.assign(LOC.circle,{name:'Kalmankehä'});
Object.assign(LOC.ruinF,{name:'Metsäraunio'});Object.assign(LOC.ruinM,{name:'Vuoriraunio'});Object.assign(LOC.ruinC,{name:'Rantaraunio'});
// Aarnimetsät (yksikkökoordinaatit): korkeat, tuuheat ja synkät metsät.
const AARNI=MAP.aarni.map(([x,z,r])=>({x,z,r}));
const FLATS=[
  {x:LOC.barrow.x,z:LOC.barrow.z,r:18,h:4},
  {x:LOC.circle.x,z:LOC.circle.z,r:15,h:6},
];
function segDist(u,v,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,t=clamp(((u-ax)*dx+(v-az)*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(u-(ax+dx*t),v-(az+dz*t));}
function baseHeight(x,z){
  const u=x/WS,v=z/WS,d=Math.hypot(u,v),M=MAP,ou=u+M.ox,ov=v+M.oz;
  let h=3.5+(fbm(ou*.011+31,ov*.011-17,5)-.5)*24;
  h+=(fbm(x*.045,z*.045,2)-.5)*2.5;
  if(M.mtn){const m=sstep(M.mtn.a,M.mtn.b,u*M.mtn.dx+v*M.mtn.dz);if(m>0)h+=m*(12+ridge(ou*.018+3,ov*.018)*M.mtn.h);}
  if(M.peak){const [px,pz,r,ph]=M.peak,m=sstep(r,r*.2,Math.hypot(u-px,v-pz));if(m>0)h+=m*(10+ridge(ou*.02+3,ov*.02)*ph);}
  const md=Math.hypot(u-M.moor[0],v-M.moor[1]);
  h=lerp(h,2.8+(fbm(ou*.03,ov*.03,3)-.5)*7,sstep(85,40,md)*.85);
  for(const [lx,lz,lr,dep] of M.lakes){const ld=Math.hypot(u-lx,v-lz);h-=sstep(lr,lr*.3,ld)*dep;}
  const C=M.center||M.loc.spawn,sd=Math.hypot(u-C[0],v-C[1]);
  h=lerp(h,5+(fbm(ou*.03,ov*.03,2)-.5)*3,sstep(46,14,sd));
  if(M.east)h-=sstep(110,175,u)*7;
  if(M.islands){
    // saaristo: maa vain saarilla, saaret yhdistetty matalilla hiekkasärkillä (kävellen kuljettavia)
    let land=0;const nz=(fbm(ou*.04+7,ov*.04,2)-.5)*28;
    for(const [ix,iz,ir] of M.islands)land=Math.max(land,sstep(ir,ir-28,Math.hypot(u-ix,v-iz)+nz));
    let bar=0;for(const [ax,az,bx,bz] of M.bars)bar=Math.max(bar,sstep(9,4,segDist(u,v,ax,az,bx,bz)));
    h=Math.max(lerp(-9,h,land),lerp(-9,.8,bar));
  }
  h=lerp(h,-14,sstep(170,198,d));
  return h;
}
for(const k of ['ruinF','ruinM','ruinC']){const L=LOC[k];FLATS.push({x:L.x,z:L.z,r:7,h:Math.max(2,baseHeight(L.x,L.z))});}
function heightFn(x,z){
  let h=baseHeight(x,z);
  for(const f of FLATS){const t=sstep(f.r+12,f.r,Math.hypot(x-f.x,z-f.z));if(t>0)h=lerp(h,f.h,t);}
  const bd=Math.hypot(x-LOC.barrow.x,z-LOC.barrow.z); if(bd<10)h+=6.5*(1-(bd/10)**2);
  return h;
}
function inAarni(x,z){const u=x/WS,v=z/WS;for(const A of AARNI)if(Math.hypot(u-A.x,v-A.z)<A.r+(fbm(u*.06+5,v*.06,2)-.5)*16)return true;return false;}
function biomeAt(x,z,h){
  if(h<1.1)return h<-.4?'sea':'beach';
  const u=x/WS,v=z/WS;
  if(Math.hypot(u-MAP.moor[0],v-MAP.moor[1])<68+(fbm(u*.05,v*.05,2)-.5)*24)return 'moor';
  if(h>23)return 'mountain';
  if(h>1.6&&h<20&&inAarni(x,z))return 'aarni';
  const C=MAP.center||MAP.loc.spawn,d=Math.hypot(u-C[0],v-C[1]);
  if(d<40+(fbm(u*.04+9,v*.04,2)-.5)*26)return 'meadow';
  if(fbm(u*.02-40,v*.02+12,3)<.33)return 'meadow';
  return 'forest';
}
const HGT=new Float32Array(HN*HN);
for(let iz=0;iz<HN;iz++)for(let ix=0;ix<HN;ix++)HGT[iz*HN+ix]=heightFn(-HALF+ix*GS,-HALF+iz*GS);
function terrainH(x,z){
  const gx=(x+HALF)/GS,gz=(z+HALF)/GS;
  if(gx<0||gz<0||gx>=GN||gz>=GN)return -14;
  const ix=gx|0,iz=gz|0,fx=gx-ix,fz=gz-iz,i=iz*HN+ix;
  const h00=HGT[i],h10=HGT[i+1],h01=HGT[i+HN],h11=HGT[i+HN+1];
  if(fx+fz<1)return h00+(h10-h00)*fx+(h01-h00)*fz;
  return h11+(h01-h11)*(1-fx)+(h10-h11)*(1-fz);
}
function biomeHere(x,z){return biomeAt(x,z,terrainH(x,z));}
