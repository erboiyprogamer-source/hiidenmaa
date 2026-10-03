/* Hiidenmaa – world.js
   Maailman muoto: korkeusfunktio, biomit, paikkojen sijainnit (LOC) */
'use strict';

/* ---------------- WORLD LAYOUT ---------------- */
const HALF=200, GN=200, GS=HALF*2/GN, HN=GN+1;
const DUN={x:700,y:60,z:700}; // hautakummun sisätila (erillinen tila)
const LOC={
  spawn:{x:0,z:6},
  barrow:{x:-118,z:92,name:'Hautakumpu'},
  circle:{x:-92,z:138,name:'Kalmankehä'},
  ruinF:{x:52,z:-40,name:'Metsäraunio'},
  ruinM:{x:-34,z:-122,name:'Vuoriraunio'},
  ruinC:{x:150,z:24,name:'Rantaraunio'},
  rune1:{x:5,z:0}, rune2:{x:-64,z:48}, rune3:{x:22,z:-92},
};
const FLATS=[
  {x:LOC.barrow.x,z:LOC.barrow.z,r:18,h:4},
  {x:LOC.circle.x,z:LOC.circle.z,r:15,h:6},
];
function baseHeight(x,z){
  const d=Math.hypot(x,z);
  let h=3.5+(fbm(x*.011+31,z*.011-17,5)-.5)*24;
  h+=(fbm(x*.045,z*.045,2)-.5)*2.5;
  const m=sstep(-55,-125,z);
  if(m>0)h+=m*(12+ridge(x*.018+3,z*.018)*36);
  const md=Math.hypot(x+108,z-112);
  h=lerp(h,2.8+(fbm(x*.03,z*.03,3)-.5)*7,sstep(85,40,md)*.85);
  const ld=Math.hypot(x-58,z-48); h-=sstep(42,12,ld)*13;
  h=lerp(h,5+(fbm(x*.03,z*.03,2)-.5)*3,sstep(46,14,d));
  h-=sstep(110,175,x)*7;
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
function biomeAt(x,z,h){
  if(h<1.1)return h<-.4?'sea':'beach';
  if(Math.hypot(x+108,z-112)<68+(fbm(x*.05,z*.05,2)-.5)*24)return 'moor';
  if(h>23)return 'mountain';
  const d=Math.hypot(x,z);
  if(d<46+(fbm(x*.04+9,z*.04,2)-.5)*30)return 'meadow';
  if(fbm(x*.02-40,z*.02+12,3)<.4)return 'meadow';
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
