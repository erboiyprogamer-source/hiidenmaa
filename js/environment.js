/* Hiidenmaa – environment.js
   Päivä/yö, sää, valot, selviytymismekaniikat (nälkä, kylmä, lepo) */
'use strict';

/* ---------------- SURVIVAL / ENV ---------------- */
const DAY_LEN=720;
function isNight(){return dayT<.21||dayT>.79;}
function sheltered(x,y,z){if(P.inDun)return true;raycaster.set(_tmpV.set(x,y+1.7,z),_tmpV2.set(0,1,0));raycaster.far=14;return raycaster.intersectObjects(pieceRoots,true).length>0;}
function nearFire(x,z,r=5.5){for(const p of pieces)if(p.t==='nuotio'&&p.data.fuel>0&&dist2(p.x,p.z,x,z)<r*r)return true;return false;}
let shelterCache=false,fireCache=false,envTick=0;
const WEATHERS={selkea:{n:'Selkeää',fog:1,dark:0,rain:0},pilvi:{n:'Pilvistä',fog:.85,dark:.25,rain:0},sade:{n:'Sadetta',fog:.6,dark:.45,rain:1},sumu:{n:'Sumua',fog:.3,dark:.2,rain:0}};
function updateWeather(){if(playTime<weather.until)return;const r=Math.random();const prev=weather.cur;weather.cur=r<.42?'selkea':r<.68?'pilvi':r<.88?'sade':'sumu';weather.until=playTime+150+Math.random()*180;if(weather.cur!==prev&&!P.inDun){if(weather.cur==='sade')msg('Alkaa sataa.');else if(weather.cur==='sumu')msg('Sumu nousee.');}}
const cSkyDay=new THREE.Color(0x8fbfe0),cSkyDusk=new THREE.Color(0xe39466),cSkyNight=new THREE.Color(0x0c1424),cGrey=new THREE.Color(0x7d858c),cTmp=new THREE.Color();
let wDark=0,wFog=1,wRain=0;
function updateEnvironment(dt){
  const W=WEATHERS[weather.cur];wDark=lerp(wDark,W.dark,dt*.3);wFog=lerp(wFog,W.fog,dt*.3);wRain=lerp(wRain,W.rain,dt*.4);
  const ang=(dayT-.5)*TAU,el=Math.cos(ang)+.3,light=sstep(-.05,.45,el);
  const sd=_tmpV.set(Math.sin(ang)*.9,el,.35).normalize();
  if(P.inDun){scene.background.setHex(0x050403);scene.fog.color.setHex(0x050403);scene.fog.near=3;scene.fog.far=28;hemi.intensity=.06;sun.intensity=0;amb.intensity=.05;stars.visible=false;sunDisc.visible=false;rain.visible=false;water.visible=false;return;}
  water.visible=true;stars.visible=true;sunDisc.visible=true;
  if(light>.5)cTmp.copy(cSkyDusk).lerp(cSkyDay,(light-.5)*2);else cTmp.copy(cSkyNight).lerp(cSkyDusk,light*2);
  cTmp.lerp(cGrey,wDark*light*.8);cTmp.multiplyScalar(1-wDark*.35);
  scene.background.copy(cTmp);scene.fog.color.copy(cTmp);
  scene.fog.near=lerp(8,60,wFog)*lerp(.4,1,light);scene.fog.far=lerp(55,230,wFog)*lerp(.55,1,light);
  const sunOn=light>.02;
  if(el>-.05){sun.color.setHex(0xfff1d6).lerp(new THREE.Color(0xffa060),1-sstep(.1,.6,el));sun.intensity=light*(1-wDark*.7);sun.position.set(P.pos.x+sd.x*120,P.pos.y+sd.y*120,P.pos.z+sd.z*120);}
  else{sun.color.setHex(0x8aa2d8);sun.intensity=.22*(1-wDark*.6);sun.position.set(P.pos.x-sd.x*120,P.pos.y+Math.abs(sd.y)*120+40,P.pos.z-sd.z*120);}
  sun.target.position.copy(P.pos);
  hemi.intensity=.16+.48*light*(1-wDark*.4);amb.intensity=.08+.06*light;
  hemi.color.setHex(0xcfe4ff);if(!sunOn)hemi.color.setHex(0x6a7fa8);
  stars.material.opacity=(1-light)*(1-wDark);stars.position.copy(camera.position);
  sunDisc.position.set(camera.position.x+sd.x*380,camera.position.y+sd.y*380,camera.position.z+sd.z*380);sunDisc.visible=el>-.1&&wDark<.3;
  rain.visible=wRain>.15;if(rain.visible){rain.material.opacity=.45*wRain;const a=rain.geometry.attributes.position.array;for(let i=0;i<a.length;i+=6){a[i+1]-=26*dt;a[i+4]-=26*dt;if(a[i+1]<-6){const x=(Math.random()-.5)*50,z=(Math.random()-.5)*50,y=24+Math.random()*6;a[i]=x;a[i+1]=y;a[i+2]=z;a[i+3]=x+.05;a[i+4]=y+.7;a[i+5]=z;}}rain.geometry.attributes.position.needsUpdate=true;rain.position.set(camera.position.x,camera.position.y-8,camera.position.z);}
  water.position.y=Math.sin(playTime*.6)*.04;
}
function updateLights(){
  const src=lightSources.filter(s=>s.on()&&(!!s.dun===P.inDun)).sort((a,b)=>dist2(a.x,a.z,P.pos.x,P.pos.z)-dist2(b.x,b.z,P.pos.x,P.pos.z));
  for(let i=0;i<LIGHTS.length;i++){const l=LIGHTS[i],s=src[i];if(s&&dist2(s.x,s.z,P.pos.x,P.pos.z)<60*60){l.position.set(s.x,s.y,s.z);l.color.setHex(s.c);l.userData.base=s.i;l.intensity=s.i;}else{l.intensity=0;l.userData.base=0;}}
}
function survival(dt){
  // statuses
  envTick-=dt;if(envTick<=0){envTick=.5;shelterCache=sheltered(P.pos.x,P.pos.y,P.pos.z);fireCache=nearFire(P.pos.x,P.pos.z);}
  const raining=wRain>.5&&!P.inDun;
  if(raining&&!shelterCache)P.wetT=60;if(P.inWater)P.wetT=60;
  if(P.wetT>0)P.wetT-=dt*(fireCache?5:1);
  const armor=equipped('armor');
  const cold=!fireCache&&((P.wetT>0)||(isNight()&&!P.inDun&&!(armor&&ITEMS[armor.id].warm)&&!shelterCache));
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
