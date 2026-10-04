/* Hiidenmaa – world.js
   Maailman muoto: korkeusfunktio, biomit, paikkojen sijainnit (LOC) */
'use strict';

/* ---------------- WORLD LAYOUT ---------------- */
// Maailma on suunniteltu "yksikkökoordinaatteihin" (vanha ±200 m kartta) ja skaalataan kertoimella WS.
// Isot muodot (vuoret, nummi, järvi, biomit) skaalautuvat, pienet yksityiskohdat pysyvät metreinä.
const WS=1.75;
const HALF=350, GN=350, GS=HALF*2/GN, HN=GN+1;
const DUN={x:900,y:60,z:900}; // hautakummun sisätila (erillinen tila, kartan ulkopuolella)
// Kuusi karttaa. Kaikki mitat yksikkökoordinaateissa (kerrotaan WS:llä). Paikat voivat olla missä suunnassa tahansa:
// tarinatekstit laskevat ilmansuunnat (dirIn / dirText). Biomiparametrit (valinnaiset): moorR = nummen säde (68),
// mtnH = vuoribiomin alaraja metreinä (23), meadowT = niittyjen osuus metsän seassa (0,33). Kartalla on oltava vuoria
// (mtn tai peak, yli 23 m), jotta rautaa löytyy, ja nummi Hautakummun ympärillä.
const MAPS=[
  {name:'Hiidenmaa',ox:0,oz:0,
    loc:{spawn:[0,6],barrow:[-118,92],circle:[-92,138],ruinF:[52,-40],ruinM:[-34,-122],ruinC:[150,24],rune1:[5,0],rune2:[-64,48],rune3:[22,-92]},
    center:[0,0],mtn:{dx:0,dz:-1,a:55,b:125,h:36},moor:[-108,112],lakes:[[58,48,42,13]],east:1,aarni:[[95,-22,46],[-78,-12,40]]},
  {name:'Kalmansaaret',ox:57,oz:-23,
    loc:{spawn:[4,10],barrow:[-112,98],circle:[-86,140],ruinF:[88,-52],ruinM:[-40,-118],ruinC:[150,28],rune1:[9,4],rune2:[-80,92],rune3:[-34,-92]},
    mtn:null,peak:[-40,-128,48,34],moor:[-104,114],lakes:[],east:0,aarni:[[88,-52,40]],
    islands:[[0,8,74],[-100,112,72],[88,-52,64],[-40,-118,64],[150,28,42],[40,110,50]],
    bars:[[0,8,-100,112],[0,8,88,-52],[0,8,-40,-118],[88,-52,150,28],[0,8,40,110]]},
  {name:'Tunturinniemi',ox:-41,oz:88,
    loc:{spawn:[6,40],barrow:[-116,118],circle:[-88,150],ruinF:[78,52],ruinM:[-30,-62],ruinC:[152,74],rune1:[11,34],rune2:[-62,92],rune3:[18,-22]},
    mtn:{dx:0,dz:-1,a:-5,b:70,h:52},moor:[-104,128],lakes:[[64,104,30,10]],east:1,aarni:[[95,40,42],[-80,40,38]]},
  // Routasaari: vuoristo idässä, pitkät tunturirinteet (matala vuoriraja), nummi ja kumpu luoteessa, vähän niittyjä
  {name:'Routasaari',ox:-73,oz:41,
    loc:{spawn:[-70,30],barrow:[-102,-100],circle:[-62,-128],ruinF:[-10,92],ruinM:[92,-24],ruinC:[-138,58],rune1:[-64,24],rune2:[-92,-56],rune3:[34,8]},
    center:[-70,30],mtn:{dx:1,dz:0,a:15,b:100,h:46},moor:[-100,-104],moorR:58,mtnH:18,meadowT:.24,lakes:[[-12,-40,30,10],[40,112,24,9]],east:0,aarni:[[-24,124,36]]},
  // Aarnikorpi: synkkiä aarnimetsiä joka puolella, keskellä pohjoisessa yksinäinen tunturi, kumpu idän nummella, niittyjä vähän
  {name:'Aarnikorpi',ox:119,oz:-67,
    loc:{spawn:[0,118],barrow:[112,46],circle:[142,8],ruinF:[-62,22],ruinM:[8,-96],ruinC:[-118,104],rune1:[6,112],rune2:[76,72],rune3:[2,-34]},
    center:[0,118],mtn:null,peak:[10,-66,58,52],moor:[112,42],meadowT:.14,lakes:[[64,104,26,10]],east:0,aarni:[[-92,0,62],[64,-108,46],[-34,64,40],[110,-50,30]]},
  // Nummiluodot: iso keskijärvi, laaja nummi pohjoisessa kummun ympärillä, tunturi kaakossa, paljon niittyjä lännessä
  {name:'Nummiluodot',ox:-29,oz:-131,
    loc:{spawn:[-112,4],barrow:[6,-118],circle:[52,-128],ruinF:[-82,-82],ruinM:[88,96],ruinC:[134,-24],rune1:[-106,8],rune2:[-48,-90],rune3:[58,62]},
    center:[-112,4],peak:[92,92,58,52],mtn:null,moor:[8,-112],moorR:88,meadowT:.46,lakes:[[0,0,66,14]],east:0,aarni:[[-92,92,40]]},
];
const MAP_ID=(()=>{try{const v=+localStorage.getItem('hiidenmaa_map');return v>=0&&v<MAPS.length?v|0:0;}catch(e){return 0;}})();
const MAP=MAPS[MAP_ID];
const LOC={};
for(const k in MAP.loc){const [u,v]=MAP.loc[k];LOC[k]={x:u*WS,z:v*WS};}
// Ilmansuunta paikkaan k (oletuksena aloituspaikasta) olosijassa, esim. "lounaassa". Pohjoinen = −z.
const DIRS_IN=['pohjoisessa','koillisessa','idässä','kaakossa','etelässä','lounaassa','lännessä','luoteessa'];
function dirIn(k,from){const f=from||LOC.spawn,L=LOC[k],a=Math.atan2(L.x-f.x,-(L.z-f.z));return DIRS_IN[((Math.round(a/(Math.PI/4))%8)+8)%8];}
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
  if(Math.hypot(u-MAP.moor[0],v-MAP.moor[1])<(MAP.moorR||68)+(fbm(u*.05,v*.05,2)-.5)*24)return 'moor';
  if(h>(MAP.mtnH||23))return 'mountain';
  if(h>1.6&&h<Math.min(20,(MAP.mtnH||23)-1)&&inAarni(x,z))return 'aarni';
  const C=MAP.center||MAP.loc.spawn,d=Math.hypot(u-C[0],v-C[1]);
  if(d<40+(fbm(u*.04+9,v*.04,2)-.5)*26)return 'meadow';
  if(fbm(u*.02-40,v*.02+12,3)<(MAP.meadowT??.33))return 'meadow';
  return 'forest';
}
const HGT=new Float32Array(HN*HN);
for(let iz=0;iz<HN;iz++)for(let ix=0;ix<HN;ix++)HGT[iz*HN+ix]=heightFn(-HALF+ix*GS,-HALF+iz*GS);
const HGT0=HGT.slice(),TERRA={}; // alkuperäinen korkeuskartta ja lapiolla muokatut kärjet (indeksi → korkeus)
function terrainH(x,z){
  const gx=(x+HALF)/GS,gz=(z+HALF)/GS;
  if(gx<0||gz<0||gx>=GN||gz>=GN)return -14;
  const ix=gx|0,iz=gz|0,fx=gx-ix,fz=gz-iz,i=iz*HN+ix;
  const h00=HGT[i],h10=HGT[i+1],h01=HGT[i+HN],h11=HGT[i+HN+1];
  if(fx+fz<1)return h00+(h10-h00)*fx+(h01-h00)*fz;
  return h11+(h01-h11)*(1-fx)+(h10-h11)*(1-fz);
}
function biomeHere(x,z){return biomeAt(x,z,terrainH(x,z));}

/* ---------------- LÖYTÖPAIKAT: portaalit, rauniot, arkkukivet, lisäriimukivet ---------------- */
// Sijainnit arvotaan kartan mukaan (sama joka kerta samalla kartalla), maasto tasoitetaan ja paikat lisätään LOC:iin,
// jolloin metsä ja kivet väistävät niitä (resources.js) ja kartta osaa näyttää ne löydettyään.
const SITE_DEFS=[
  {k:'portal1',kind:'portal',name:'Routaportti',pref:'mountain'},
  {k:'portal2',kind:'portal',name:'Kalmankammion portti',pref:'moor'},
  {k:'portal3',kind:'portal',name:'Aarnihaudan portti',pref:'aarni'},
  {k:'poiR1',kind:'ruin',name:'Sortunut talo'},{k:'poiR2',kind:'ruin',name:'Raunioitunut tupa'},
  {k:'poiR3',kind:'ruin',name:'Hylätty talonpohja'},{k:'poiR4',kind:'ruin',name:'Murtunut linnake'},
  {k:'poiK1',kind:'rock',name:'Arkkukivi'},{k:'poiK2',kind:'rock',name:'Hohtava arkkukivi'},{k:'poiK3',kind:'rock',name:'Sammaltunut arkkukivi'},
  {k:'runeA',kind:'rune',name:'Riimukivi'},{k:'runeB',kind:'rune',name:'Riimukivi'},{k:'runeC',kind:'rune',name:'Riimukivi'},
  {k:'runeD',kind:'rune',name:'Riimukivi'},{k:'runeE',kind:'rune',name:'Riimukivi'},{k:'runeF',kind:'rune',name:'Riimukivi'},
];
(function(){
  const rg=mulberry32(9001+MAP_ID*77),S0=LOC.spawn;
  const flatten=(x,z,r,h)=>{const R=r+10;for(let iz=Math.max(0,Math.floor((z-R+HALF)/GS));iz<=Math.min(GN,Math.ceil((z+R+HALF)/GS));iz++)for(let ix=Math.max(0,Math.floor((x-R+HALF)/GS));ix<=Math.min(GN,Math.ceil((x+R+HALF)/GS));ix++){
    const d=Math.hypot(-HALF+ix*GS-x,-HALF+iz*GS-z),t=sstep(R,r,d);if(t>0){const i=iz*HN+ix;HGT[i]=lerp(HGT[i],h,t);HGT0[i]=HGT[i];}}};
  for(const D of SITE_DEFS){
    const rune=D.kind==='rune',minOther=rune?42:68,minSpawn=rune?(D.k==='runeA'?32:60):75;let best=null;
    for(let t=0;t<6000&&!best;t++){
      const x=(rg()*2-1)*HALF*.78,z=(rg()*2-1)*HALF*.78,h=terrainH(x,z);
      if(h<2.2||h>(D.pref==='mountain'&&t<2500?60:22))continue;
      if(Math.hypot(x-S0.x,z-S0.z)<minSpawn||(D.k==='runeA'&&Math.hypot(x-S0.x,z-S0.z)>110))continue;
      let bad=false;for(const k in LOC){const L=LOC[k],m=(k==='spawn'||k==='barrow'||k==='circle')?Math.max(minOther,k==='spawn'?minSpawn:75):minOther;const mm=D.pref==='mountain'&&!L.kind&&/^(ruin|rune)/.test(k)?30:(L.kind==='rune'&&!rune?55:m);if(Math.hypot(x-L.x,z-L.z)<mm){bad=true;break;}}
      if(bad)continue;
      let lo=h,hi=h;for(let a=0;a<8;a++){const hh=terrainH(x+Math.cos(a*.785)*8,z+Math.sin(a*.785)*8);lo=Math.min(lo,hh);hi=Math.max(hi,hh);}
      if(lo<1.3||hi-lo>(D.pref==="mountain"&&t<2500?10:(t<4000?4.5:7)))continue;
      if(D.pref&&t<2500){const b=biomeAt(x,z,h);if(b!==D.pref)continue;}
      best={x,z};
    }
    if(!best){const a=rg()*TAU;best={x:S0.x+Math.cos(a)*150,z:S0.z+Math.sin(a)*150};}
    const h=Math.max(2.2,terrainH(best.x,best.z));
    if(!rune)flatten(best.x,best.z,D.kind==='portal'?9:8,h);
    LOC[D.k]={x:best.x,z:best.z,name:D.name,kind:D.kind,ax:rg()<.5?'x':'z'};
  }
})();
