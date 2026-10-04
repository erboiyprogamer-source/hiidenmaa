/* Hiidenmaa – environment.js
   Päivä/yö, sää, valot, selviytymismekaniikat (nälkä, kylmä, lepo) */
'use strict';

/* ---------------- SURVIVAL / ENV ---------------- */
const DAY_LEN=720;
function isNight(){return dayT<.21||dayT>.79;}
function sheltered(x,y,z){if(P.inDun)return true;raycaster.set(_tmpV.set(x,y+1.7,z),_tmpV2.set(0,1,0));raycaster.far=14;return raycaster.intersectObjects(pieceRoots,true).length>0;}
function nearFire(x,z,r=5.5){for(const p of pieces)if(p.t==='nuotio'&&p.data.fuel>0&&dist2(p.x,p.z,x,z)<r*r)return true;return false;}
let shelterCache=false,fireCache=false,envTick=0,indoorT=0,indoorK=0;
const cIndoor=new THREE.Color(0x6a5a48);
// Yksinkertainen valofysiikka: suojassa ja seinien ympäröimänä taivaanvalo himmenee ja sininen sävy poistuu.
const _dirs=[];for(let i=0;i<8;i++){const a=i/8*TAU;_dirs.push(new THREE.Vector3(Math.cos(a),0,Math.sin(a)));}
function indoorScore(){if(P.inDun||!shelterCache)return 0;let h=0;const o=new THREE.Vector3(P.pos.x,P.pos.y+1.1,P.pos.z);for(const d of _dirs){raycaster.set(o,d);raycaster.far=6;if(raycaster.intersectObjects(pieceRoots,true).length)h++;}return h>=5?1:h>=3?.5:0;}
const WEATHERS={
  selkea:{n:'Selkeää',fog:1,dark:0,rain:0},
  pilvi:{n:'Pilvistä',fog:.85,dark:.25,rain:0},
  tuuli:{n:'Tuulista',fog:.9,dark:.12,rain:0,wind:1},
  tihku:{n:'Tihkusadetta',fog:.72,dark:.3,rain:.35},
  sade:{n:'Sadetta',fog:.6,dark:.45,rain:1},
  myrsky:{n:'Myrsky',fog:.45,dark:.65,rain:1.4,wind:1.6,storm:1},
  lumi:{n:'Lumisadetta',fog:.5,dark:.35,rain:0,snow:1},
  sumu:{n:'Sumua',fog:.3,dark:.2,rain:0},
};
const WMSG={sade:'Alkaa sataa.',tihku:'Alkaa tihuttaa.',myrsky:'Myrsky nousee!',lumi:'Alkaa sataa lunta.',sumu:'Sumu nousee.',tuuli:'Tuuli yltyy.'};
function highGround(){return !P.inDun&&(P.pos.y>20||biomeHere(P.pos.x,P.pos.z)==='mountain');}
function updateWeather(){if(playTime<weather.until)return;const r=Math.random(),prev=weather.cur;
  let w=r<.34?'selkea':r<.54?'pilvi':r<.64?'tuuli':r<.74?'tihku':r<.86?'sade':r<.92?'myrsky':'sumu';
  if(highGround()&&(w==='sade'||w==='tihku'||w==='myrsky'))w='lumi';
  weather.cur=w;weather.until=playTime+(w==='myrsky'?90+Math.random()*90:150+Math.random()*180);
  if(w!==prev&&!P.inDun&&WMSG[w])msg(WMSG[w]);}
const cSkyDay=new THREE.Color(0x87a9c2),cSkyDusk=new THREE.Color(0xc98a64),cSkyNight=new THREE.Color(0x070b14),cGrey=new THREE.Color(0x7d858c),cFlash=new THREE.Color(0xe8f0ff),cTmp=new THREE.Color(),cSun=new THREE.Color(),cSunLow=new THREE.Color(0xffa060);
let wDark=0,wFog=1,wRain=0,wSnow=0,wWind=0,flash=0,nextBolt=0,aarniK=0;
const cAarni=new THREE.Color(0x26302a);
// Kuun kirkkaus vaihtelee 8 päivän kierrossa (uusikuu .2 … täysikuu 1).
function moonPhase(){return .2+.8*(.5-.5*Math.cos((dayN%8)/8*TAU));}
function updateEnvironment(dt){
  const W=WEATHERS[weather.cur]||WEATHERS.selkea,k=Math.min(1,dt*.3);
  wDark=lerp(wDark,W.dark,k);wFog=lerp(wFog,W.fog,k);wRain=lerp(wRain,W.rain,Math.min(1,dt*.4));wSnow=lerp(wSnow,W.snow||0,Math.min(1,dt*.4));wWind=lerp(wWind,W.wind||0,k);
  if(W.storm&&!P.inDun&&playTime>nextBolt){nextBolt=playTime+4+Math.random()*10;flash=1;if(Math.random()<.12)stormFellTree();}
  flash=Math.max(0,flash-dt*4);
  SWAY.uTime.value=playTime;SWAY.uWind.value=.15+wWind*.85;
  const ang=(dayT-.5)*TAU,el=Math.cos(ang)+.3;
  // Taivaan valo vaihtuu pehmeästi (hämärä ~1,5 min). Aurinko sammuu horisontissa ennen kuun syttymistä,
  // joten valon suunta vaihtuu vasta kun voimakkuus on nolla.
  const light=sstep(-.4,.45,el),sunK=sstep(-.12,.08,el),moonK=sstep(-.12,-.32,el);
  const sd=_tmpV.set(Math.sin(ang)*.9,el,.35).normalize();
  if(P.inDun){scene.background.setHex(0x050403);scene.fog.color.setHex(0x050403);scene.fog.near=3;scene.fog.far=28;hemi.intensity=.06;sun.intensity=0;amb.intensity=.05;stars.visible=false;sunDisc.visible=false;moon.visible=false;rain.visible=false;snow.visible=false;water.visible=false;return;}
  water.visible=true;stars.visible=true;
  // Aarnimetsässä tiheä sumu ja hämärä valo.
  aarniK=lerp(aarniK,biomeHere(P.pos.x,P.pos.z)==='aarni'?1:0,Math.min(1,dt*.8));
  if(light>.5)cTmp.copy(cSkyDusk).lerp(cSkyDay,(light-.5)*2);else cTmp.copy(cSkyNight).lerp(cSkyDusk,light*2);
  cTmp.lerp(cGrey,wDark*light*.8);cTmp.multiplyScalar(1-wDark*.35);cTmp.lerp(cFlash,flash*.55);
  cTmp.lerp(cAarni,aarniK*.75*Math.max(.3,light));
  scene.background.copy(cTmp);scene.fog.color.copy(cTmp);
  // Usvainen ja hämärä maailma; Aarnimetsässä sumu on sakeaa.
  scene.fog.near=lerp(lerp(6,40,wFog)*lerp(.4,1,light),3,aarniK);scene.fog.far=lerp(lerp(45,165,wFog)*lerp(.5,1,light),38,aarniK);
  const ph=moonPhase();
  if(sunK>0){cSun.setHex(0xfff1d6).lerp(cSunLow,1-sstep(.1,.6,el));sun.color.copy(cSun);sun.intensity=.85*sunK*sstep(-.12,.45,el)*(1-wDark*.7);sun.position.set(P.pos.x+sd.x*120,P.pos.y+sd.y*120,P.pos.z+sd.z*120);}
  else{sun.color.setHex(0x8aa2d8);sun.intensity=.2*moonK*ph*(1-wDark*.6);sun.position.set(P.pos.x-sd.x*120,P.pos.y+Math.abs(sd.y)*120+40,P.pos.z-sd.z*120);}
  indoorK=lerp(indoorK,indoorT,Math.min(1,dt*2));
  sun.intensity=sun.intensity*(1-.45*aarniK)*(1-.7*indoorK)+flash*.9*(1-indoorK);
  sun.target.position.copy(P.pos);
  hemi.intensity=((.12+.4*light*(1-wDark*.4))*(1-.45*aarniK)+flash*1.1)*(1-.6*indoorK);amb.intensity=(.06+.05*light+flash*.5)*(1-.5*indoorK);
  hemi.color.setHex(light>.3?0xcfe4ff:0x6a7fa8);hemi.color.lerp(cIndoor,indoorK);
  stars.material.opacity=(1-light)*(1-wDark);stars.position.copy(camera.position);
  sunDisc.position.set(camera.position.x+sd.x*380,camera.position.y+sd.y*380,camera.position.z+sd.z*380);sunDisc.visible=el>-.1&&wDark<.3;
  moon.position.set(camera.position.x-sd.x*370,camera.position.y-sd.y*370,camera.position.z-sd.z*370);moon.visible=-sd.y>-.08&&wDark<.5;moon.material.color.setScalar(.35+.65*ph);
  rain.visible=wRain>.15;if(rain.visible){rain.material.opacity=.45*Math.min(1,wRain);updateRain(dt);}
  snow.visible=wSnow>.1&&P.pos.y>10;if(snow.visible){snow.material.opacity=.9*Math.min(1,wSnow);const a=snow.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i+1]-=2.2*dt;a[i]+=Math.sin(playTime*.8+i)*.4*dt;if(a[i+1]<-4){a[i]=(Math.random()-.5)*50;a[i+1]=20+Math.random()*6;a[i+2]=(Math.random()-.5)*50;}}snow.geometry.attributes.position.needsUpdate=true;snow.position.set(camera.position.x,camera.position.y-8,camera.position.z);}
  water.position.y=Math.sin(playTime*.6)*.04;
}
// Myrsky kaataa harvoin puun pelaajan lähellä (3–40 m). Puun alle jäävä menettää 80 % terveydestä.
const _sl=[];
function stormFellTree(){const list=nodesNear(P.pos.x,P.pos.z,40,_sl).filter(n=>n.def.kind==='tree'&&dist2(n.x,n.z,P.pos.x,P.pos.z)>9);
  if(!list.length)return;const n=list[Math.random()*list.length|0];killNode(n);fallTree(n,Math.random()*TAU,true);msg('Myrsky kaatoi puun!','warn');}
// Sadepisarat elävät maailmakoordinaateissa ja pysähtyvät maahan tai rakennuksen katon yläpintaan (ei sadetta katon läpi).
const RAIN_STOP=new Float32Array(900);let rainInit=false;
function roofTopAt(x,z){let h=terrainH(x,z);gridQuery(x,z,.15,_cl);for(const c of _cl)if(c.t==='b'&&c.owner&&c.owner.t&&c.maxY>h&&x>=c.minX&&x<=c.maxX&&z>=c.minZ&&z<=c.maxZ)h=c.maxY;return h;}
function updateRain(dt){const a=rain.geometry.attributes.position.array,sp=26*(wRain>1.1?1.35:1),cx=camera.position.x,cy=camera.position.y,cz=camera.position.z;
  if(rain.position.lengthSq()>0)rain.position.set(0,0,0);
  for(let i=0,k=0;i<a.length;i+=6,k++){
    if(rainInit){a[i+1]-=sp*dt;a[i+4]-=sp*dt;}
    const out=Math.abs(a[i]-cx)>26||Math.abs(a[i+2]-cz)>26;
    if(!rainInit||out||a[i+1]<RAIN_STOP[k]){const x=cx+(Math.random()-.5)*50,z=cz+(Math.random()-.5)*50,stop=roofTopAt(x,z),y=Math.max(cy+(rainInit&&!out?14+Math.random()*8:Math.random()*22-2),stop+.5+Math.random()*3);
      a[i]=x;a[i+1]=y;a[i+2]=z;a[i+3]=x+.05+wWind*.25;a[i+4]=y+.7;a[i+5]=z;RAIN_STOP[k]=stop;}}
  rainInit=true;rain.geometry.attributes.position.needsUpdate=true;}
function updateLights(){
  const src=lightSources.filter(s=>s.on()&&(!!s.dun===P.inDun)).sort((a,b)=>dist2(a.x,a.z,P.pos.x,P.pos.z)-dist2(b.x,b.z,P.pos.x,P.pos.z));
  for(let i=0;i<LIGHTS.length;i++){const l=LIGHTS[i],s=src[i];if(s&&dist2(s.x,s.z,P.pos.x,P.pos.z)<60*60){l.position.set(s.x,s.y,s.z);l.color.setHex(s.c);l.userData.base=s.i;l.intensity=s.i;}else{l.intensity=0;l.userData.base=0;}}
}
function survival(dt){
  // statuses
  envTick-=dt;if(envTick<=0){envTick=.5;shelterCache=sheltered(P.pos.x,P.pos.y,P.pos.z);fireCache=nearFire(P.pos.x,P.pos.z);indoorT=indoorScore();}
  const raining=wRain>.5&&!P.inDun;
  if(raining&&!shelterCache)P.wetT=60;if(P.inWater)P.wetT=60;
  if(P.wetT>0)P.wetT-=dt*(fireCache?5:1);
  const armor=equipped('armor');
  const snowing=wSnow>.5&&P.pos.y>10&&!P.inDun&&!shelterCache;
  const cold=!fireCache&&((P.wetT>0)||snowing||(isNight()&&!P.inDun&&!(armor&&ITEMS[armor.id].warm)&&!shelterCache));
  P.cold=cold;
  if(fireCache&&shelterCache){P.restT+=dt;if(P.restT>12&&!P.buffs.levannyt){P.buffs.levannyt=360;msg('Olet levännyt. Kestävyys palautuu nopeammin.','loot');}}else P.restT=0;
  for(const k in P.buffs){P.buffs[k]-=dt;if(P.buffs[k]<=0)delete P.buffs[k];}
  P.hunger=Math.max(0,P.hunger-dt*(100/1000)*(cold?1.3:1)*(P.atk||keys.ShiftLeft?1.15:1));
  // regen
  let reg=P.hunger>35?.35:P.hunger>0?.15:0;if(P.buffs.levannyt)reg+=.6;if(P.buffs.pahoinvointi)reg=0;
  if(P.heal>0){const h=Math.min(P.heal,3*dt);P.heal-=h;P.hp+=h;}
  P.hp=Math.min(maxHp(),P.hp+reg*dt);
  if(P.hunger<=0){P.hp-=.5*dt;if(P.hp<=0)playerDie();}
}
