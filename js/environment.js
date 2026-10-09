/* Hiidenmaa – environment.js
   Päivä/yö, sää, valot, selviytymismekaniikat (nälkä, kylmä, lepo) */
'use strict';

/* ---------------- SURVIVAL / ENV ---------------- */
const DAY_LEN=720;
function isNight(){return dayT<.21||dayT>.79;}
function sheltered(x,y,z){if(P.inDun)return true;raycaster.set(_tmpV.set(x,y+1.7,z),_tmpV2.set(0,1,0));raycaster.far=14;return raycaster.intersectObjects(pieceRoots,true).length>0;}
function nearFire(x,z,r=5.5){for(const p of pieces)if(isFirePiece(p.t)&&p.data.fuel>0&&dist2(p.x,p.z,x,z)<r*r)return true;return false;}
let shelterCache=false,fireCache=false,envTick=0,indoorT=0,indoorK=0;
const cIndoor=new THREE.Color(0x6a5a48);
// Yksinkertainen valofysiikka: suojassa ja seinien ympäröimänä taivaanvalo himmenee ja sininen sävy poistuu.
const _dirs=[];for(let i=0;i<8;i++){const a=i/8*TAU;_dirs.push(new THREE.Vector3(Math.cos(a),0,Math.sin(a)));}
function indoorScore(){if(P.inDun||!shelterCache)return 0;let h=0;const o=new THREE.Vector3(P.pos.x,P.pos.y+1.1,P.pos.z);for(const d of _dirs){raycaster.set(o,d);raycaster.far=6;if(raycaster.intersectObjects(pieceRoots,true).length)h++;}return h>=5?1:h>=3?.5:0;}
const WEATHERS={
  selkea:{n:'Selkeää',fog:1,dark:0,rain:0,cloud:.2},
  pilvi:{n:'Pilvistä',fog:.85,dark:.25,rain:0,cloud:.8},
  tuuli:{n:'Tuulista',fog:.9,dark:.12,rain:0,wind:1,cloud:.5},
  tihku:{n:'Tihkusadetta',fog:.72,dark:.3,rain:.35,cloud:.92},
  sade:{n:'Sadetta',fog:.6,dark:.45,rain:1,cloud:1},
  myrsky:{n:'Myrsky',fog:.45,dark:.65,rain:1.4,wind:1.6,storm:1,cloud:1},
  lumi:{n:'Lumisadetta',fog:.5,dark:.35,rain:0,snow:1,cloud:.92},
  sumu:{n:'Sumua',fog:.3,dark:.2,rain:0,cloud:.55},
};
const WMSG={sade:'Alkaa sataa.',tihku:'Alkaa tihuttaa.',myrsky:'Myrsky nousee!',lumi:'Alkaa sataa lunta.',sumu:'Sumu nousee.',tuuli:'Tuuli yltyy.'};
function highGround(){return !P.inDun&&(P.pos.y>20||biomeHere(P.pos.x,P.pos.z)==='mountain');}
function updateWeather(){if(playTime<weather.until)return;const r=Math.random(),prev=weather.cur;
  let w=r<.34?'selkea':r<.54?'pilvi':r<.64?'tuuli':r<.74?'tihku':r<.86?'sade':r<.92?'myrsky':'sumu';
  if(highGround()&&(w==='sade'||w==='tihku'||w==='myrsky'))w='lumi';
  weather.cur=w;weather.until=playTime+(w==='myrsky'?90+Math.random()*90:150+Math.random()*180);
  if(w!==prev&&!P.inDun&&WMSG[w])msg(WMSG[w]);}
const cSkyDay=new THREE.Color(0x87a9c2),cSkyDusk=new THREE.Color(0xc98a64),cSkyNight=new THREE.Color(0x070b14),cGrey=new THREE.Color(0x7d858c),cFlash=new THREE.Color(0xe8f0ff),cTmp=new THREE.Color(),cSun=new THREE.Color(),cSunLow=new THREE.Color(0xffa060);
let lightK=1,wCloud=.2,wDark=0,wFog=1,wRain=0,wSnow=0,wWind=0,flash=0,nextBolt=0,aarniK=0,stormT=5,stormMsgT=0;
const cAarni=new THREE.Color(0x26302a);
// Kuun kirkkaus vaihtelee 8 päivän kierrossa (uusikuu .2 … täysikuu 1).
function moonPhase(){return .2+.8*(.5-.5*Math.cos((dayN%8)/8*TAU));}
const cCloudDay=new THREE.Color(0xffffff),cCloudNight=new THREE.Color(0x232a3a),cCloudGrey=new THREE.Color(0x4b5058),_cc=new THREE.Color();
// Pilvien liike, peitto, väri (valo, sää, ilta) ja salamoiden välke. cover 0–1.
function updateClouds(dt,cover,light,el){const vis=!P.inDun;let cx=camera.position.x,cz=camera.position.z;
  _cc.copy(cCloudNight).lerp(cCloudDay,light).lerp(cCloudGrey,Math.min(1,wDark/.6)*.85);
  const dusk=sstep(.5,.0,el)*sstep(-.3,0,el);_cc.lerp(cSunLow,dusk*.45);
  const drift=dt*(1.2+WIND.spd*.55),R=CLOUD_R,grow=.75+.55*cover,hor=scene.background;
  const nC=CLOUDS.length*(SET.clouds??1);
  for(let ci=0;ci<CLOUDS.length;ci++){const c=CLOUDS[ci],u=c.userData;if(!vis||ci>=nC){c.visible=false;continue;}
    u.ox+=drift*u.sp*WIND.x;u.oz+=drift*u.sp*WIND.z;const mod=(v)=>((v%(2*R))+2*R)%(2*R);
    const dx=mod(u.ox-cx+R)-R,dz=mod(u.oz-cz+R)-R,d=Math.hypot(dx,dz);
    c.position.set(cx+dx,u.h,cz+dz);
    // ilmestyminen peiton mukaan; kaukana häipyy (opasiteetti + väri kohti horisonttia) eikä piirry R:n takana
    const k=sstep(u.th,u.th+.12,cover),far=sstep(R*.5,R*.97,d),op=.95*k*(1-far);c.visible=op>.03;if(!c.visible)continue;
    c.scale.set(u.sc*grow,u.sc*(.8+.4*cover),u.sc*grow);
    const m=c.material;m.opacity=op;m.color.copy(_cc).lerp(hor,far*.75);m.emissive.copy(m.color).multiplyScalar(.55*light+.12);
    if(flash>0){const near=sstep(240,60,d);m.emissive.lerp(cFlash,Math.min(1,flash*(.5+.5*near)));}}
  // pilvikansi rankassa säässä
  const deck=sstep(.82,1,cover)*Math.min(1,wDark/.4);cloudDeck.visible=vis&&deck>.02;if(cloudDeck.visible){cloudDeck.position.set(cx,128,cz);cloudDeck.material.opacity=deck*.92;cloudDeck.material.color.copy(_cc);if(flash>0)cloudDeck.material.color.lerp(cFlash,flash*.6);
    cloudDeck.material.map.offset.x+=drift*.0004;}
  if(boltGrp){boltT-=dt;boltGrp.visible=boltT>0&&((boltT*40|0)%3!==0);if(boltT<=0){scene.remove(boltGrp);boltGrp=null;}}}
// Taivaskupoli ja auringonsäteet (vain selkeällä/puolipilvisellä säällä päivällä, ei sisällä).
const _sky=new THREE.Color(),_skyS=new THREE.Vector3(),_up=new THREE.Vector3(0,1,0),_camD=new THREE.Vector3();
function updateSky(light,sd0,el,sunK){const sd=_skyS.copy(sd0);skyDome.position.copy(camera.position);skyDome.visible=!P.inDun;
  SKY_U.uHor.value.copy(scene.background);_sky.copy(scene.background).multiplyScalar(.62);_sky.b=Math.min(1,_sky.b*1.25+.03*light);SKY_U.uTop.value.copy(_sky);
  SKY_U.uSun.value.set(sd.x,sd.y,sd.z);SKY_U.uSunC.value.copy(cSun);SKY_U.uGlow.value=sunK*(1-Math.min(1,wDark*1.4))*(1-aarniK*.7);
  const clear=(1-sstep(.35,.7,wCloud))*(1-Math.min(1,wDark*3))*sstep(.05,.25,el)*sstep(.85,.45,el)*sunK*(1-indoorK)*(1-aarniK);
  sunShafts.visible=!P.inDun&&clear>.02&&SET.shafts!==false;if(sunShafts.visible){const hx=sd.x,hz=sd.z,hl=Math.hypot(hx,hz)||1;
    sunShafts.position.set(camera.position.x+hx/hl*70,Math.max(0,camera.position.y-25),camera.position.z+hz/hl*70);
    sunShafts.rotation.set(0,0,0);sunShafts.quaternion.setFromUnitVectors(_up,sd.normalize());
    camera.getWorldDirection(_camD);const look=Math.max(0,_camD.dot(sd));sunShafts.userData.mat.opacity=.07*clear*(.85+.15*Math.sin(playTime*.3))*(1-sstep(.45,.85,look));}
  sunGlow.visible=!P.inDun&&el>-.08;if(sunGlow.visible){sunGlow.position.copy(sunDisc.position);sunGlow.material.opacity=(.55+.25*sstep(.3,0,el))*sunK*(1-Math.min(1,wDark*1.6))*(1-sstep(.4,.9,wCloud)*.6);}}
// v0.84 TUULI (päivityslista kohta 4). WIND.a = suunta johon tuuli puhaltaa (rad, atan2(x,z)), WIND.x/z = yksikkövektori, WIND.spd m/s.
// Suunta pysyy 2–6 min, sitten kääntyy 40–90 s:ssa uuteen arvottuun suuntaan (enintään ±120°), lisäksi ±8° hidas huojunta.
// Nopeus säätyypin mukaan (WIND_RANGE) hitaasti vaihtuvalla tavoitteella + puuskat. Tila tallentuu (flags.wind).
// Käyttäjät: pilvet (maailma + kartta), puiden kallistus (SWAY.uWDir/uLean), sade, savu ja kipinät, nuolet, kartta ja minikartta.
const WIND_RANGE={selkea:[1,4],pilvi:[3,7],tihku:[3,7],sade:[4,8],sumu:[1,3],lumi:[3,7],tuuli:[8,13],myrsky:[15,22]};
const WIND={a:0,x:0,z:1,spd:3,gust:0};
function windState(){let w=flags.wind;if(!w||typeof w.a!=='number'){const a=Math.random()*TAU;w=flags.wind={a,a0:a,ta:a,hold:120+Math.random()*240,turn:0,dur:1,spd:3,st:3,sT:0};}return w;}
function updateWind(dt){const w=windState();
  if(w.turn>0){w.turn=Math.max(0,w.turn-dt);const k=sstep(0,1,1-w.turn/w.dur);w.a=w.a0+(w.ta-w.a0)*k;if(w.turn<=0){w.a=w.ta;w.hold=120+Math.random()*240;}}
  else{w.hold-=dt;if(w.hold<=0){w.a0=w.a;w.ta=w.a+(Math.random()*2-1)*Math.PI*2/3;w.dur=w.turn=40+Math.random()*50;}}
  const R=WIND_RANGE[weather.cur]||[2,5];w.sT-=dt;if(w.sT<=0||w.st<R[0]||w.st>R[1]){w.sT=20+Math.random()*25;w.st=R[0]+Math.random()*(R[1]-R[0]);}
  w.spd=lerp(w.spd,w.st,Math.min(1,dt*.08));
  const t=playTime;WIND.gust=Math.max(0,Math.sin(t*.37)*.5+Math.sin(t*1.13+1.7)*.35+Math.sin(t*2.9)*.15)*.25;
  WIND.spd=w.spd*(1+WIND.gust);WIND.a=w.a+Math.sin(t*.05)*.1+Math.sin(t*.13+2)*.04;WIND.x=Math.sin(WIND.a);WIND.z=Math.cos(WIND.a);
  // puiden (ja tulevan ruohon) kallistus tuulen suuntaan: voimakkuus 0–1 (22 m/s = 1)
  SWAY.uWDir.value.set(WIND.x,0,WIND.z);SWAY.uLean.value=SET.sway?3.4*Math.pow(Math.min(1.1,WIND.spd/22),1.6):0;}   /* v1.19: myrskyssä latva n. 12–17° (puuskat), 8 m/s n. 2–3° */
const WIND_DIRS=['pohjoisesta','koillisesta','idästä','kaakosta','etelästä','lounaasta','lännestä','luoteesta'];
// Mistä tuuli tulee (vastakkainen puhallussuunnalle). Kartan pohjoinen = −z (kuten minikartta "P").
function windFromText(){const from=Math.atan2(-WIND.x,WIND.z);return WIND_DIRS[((Math.round(from/(Math.PI/4))%8)+8)%8];}
function updateEnvironment(dt){
  updateWind(dt);
  const W=WEATHERS[weather.cur]||WEATHERS.selkea,k=Math.min(1,dt*.3);
  // Pilvet tummuvat ensin (hitaasti), sade alkaa vasta kun taivas on tarpeeksi tumma.
  wDark=lerp(wDark,W.dark,Math.min(1,dt*.12));wFog=lerp(wFog,W.fog,k);wCloud=lerp(wCloud,W.cloud||0,Math.min(1,dt*.15));
  wRain=lerp(wRain,W.rain*(W.dark>.4?sstep(.6,.92,wDark/W.dark):1),Math.min(1,dt*.4));wSnow=lerp(wSnow,W.snow||0,Math.min(1,dt*.4));wWind=lerp(wWind,W.wind||0,k);
  if(W.storm&&!P.inDun&&playTime>nextBolt){nextBolt=playTime+4+Math.random()*10;flash=.45;if(Math.random()<.35)strikeBolt();}
  // Myrskyssä tuuli kaataa puun noin 5 s välein jossain 100 m säteellä (ei pelaajan rakennusten lähellä)
  if(W.storm&&!P.inDun){stormT-=dt;if(stormT<=0){stormT=4+Math.random()*2;stormFellTree();}}
  flash=Math.max(0,flash-dt*5);
  SWAY.uTime.value=playTime;SWAY.uWind.value=SET.sway?.15+wWind*.85:0;
  const ang=(dayT-.5)*TAU,el=Math.cos(ang)+.3;
  // Taivaan valo vaihtuu pehmeästi (hämärä ~1,5 min). Aurinko sammuu horisontissa ennen kuun syttymistä,
  // joten valon suunta vaihtuu vasta kun voimakkuus on nolla.
  const light=sstep(-.4,.45,el);lightK=light;const sunK=sstep(-.12,.08,el),moonK=sstep(-.12,-.32,el);
  const sd=_tmpV.set(Math.sin(ang)*.9,el,.35).normalize();
  if(P.inDun){const rf=P.realm?REALMS[P.realm].fog:0x050403;scene.background.setHex(rf);scene.fog.color.setHex(rf);scene.fog.near=3;scene.fog.far=28;hemi.intensity=.06+BOSS_GLOW*1.2;sun.intensity=0;amb.intensity=.05+BOSS_GLOW*.5;stars.visible=false;sunDisc.visible=false;moon.visible=false;rain.visible=false;snow.visible=false;water.visible=false;return;}
  water.visible=true;stars.visible=true;
  // Aarnimetsässä tiheä sumu ja hämärä valo.
  aarniK=lerp(aarniK,biomeHere(P.pos.x,P.pos.z)==='aarni'?1:0,Math.min(1,dt*.8));
  if(light>.5)cTmp.copy(cSkyDusk).lerp(cSkyDay,(light-.5)*2);else cTmp.copy(cSkyNight).lerp(cSkyDusk,light*2);
  cTmp.lerp(cGrey,wDark*light*.8);cTmp.multiplyScalar(1-wDark*.35);cTmp.lerp(cFlash,flash*.35);
  cTmp.lerp(cAarni,aarniK*.75*Math.max(.3,light));
  scene.background.copy(cTmp);scene.fog.color.copy(cTmp);
  // Usvainen ja hämärä maailma; Aarnimetsässä sumu on sakeaa.
  scene.fog.near=lerp(lerp(6,40,wFog)*lerp(.4,1,light)*RDK,3,aarniK);scene.fog.far=lerp(lerp(45,165,wFog)*lerp(.5,1,light)*RDK,38,aarniK);
  const ph=moonPhase();
  if(sunK>0){cSun.setHex(0xfff1d6).lerp(cSunLow,1-sstep(.1,.6,el));sun.color.copy(cSun);sun.intensity=1.4*sunK*sstep(-.12,.45,el)*(1-wDark*.7);sun.position.set(P.pos.x+sd.x*120,P.pos.y+sd.y*120,P.pos.z+sd.z*120);}
  else{sun.color.setHex(0x8aa2d8);sun.intensity=.2*moonK*ph*(1-wDark*.6);sun.position.set(P.pos.x-sd.x*120,P.pos.y+Math.abs(sd.y)*120+40,P.pos.z-sd.z*120);}
  indoorK=lerp(indoorK,indoorT,Math.min(1,dt*2));
  sun.intensity=sun.intensity*(1-.45*aarniK)*(1-.7*indoorK)+flash*.45*(1-indoorK);
  sun.target.position.copy(P.pos);
  if(SET.shUltra==='wide'){const o=160*.45,fx=-Math.sin(camYaw)*o,fz=-Math.cos(camYaw)*o;sun.target.position.x+=fx;sun.target.position.z+=fz;sun.position.x+=fx;sun.position.z+=fz;}   // v1.76: laaja alue sovitetaan näkymän suuntaan
  hemi.intensity=((.07+.2*light*(1-wDark*.4))*(1-.45*aarniK)+flash*.55)*(1-.6*indoorK)+BOSS_GLOW*.8;amb.intensity=(.03+.025*light+flash*.22)*(1-.5*indoorK)+BOSS_GLOW*.3;
  hemi.color.setHex(light>.3?0xcfe4ff:0x6a7fa8);hemi.color.lerp(cIndoor,indoorK);
  stars.material.opacity=(1-light)*(1-wDark);stars.position.copy(camera.position);
  sunDisc.position.set(camera.position.x+sd.x*380,camera.position.y+sd.y*380,camera.position.z+sd.z*380);sunDisc.visible=el>-.1&&wDark<.3;
  moon.position.set(camera.position.x-sd.x*370,camera.position.y-sd.y*370,camera.position.z-sd.z*370);moon.visible=-sd.y>-.08&&wDark<.5;moon.material.color.setScalar(.35+.65*ph);
  updateClouds(dt,wCloud,light,el);updateSky(light,sd,el,sunK);
  rain.visible=wRain>.15;if(rain.visible){rain.material.opacity=.45*Math.min(1,wRain);updateRain(dt);}
  snow.visible=wSnow>.1&&P.pos.y>10;if(snow.visible){snow.material.opacity=.9*Math.min(1,wSnow);updateSnow(dt);}
  water.position.y=Math.sin(playTime*.6)*.04;
}
// Myrsky kaataa harvoin puun pelaajan lähellä (3–40 m). Puun alle jäävä menettää 80 % terveydestä.
const _sl=[];
// v1.19: myrsky voi kaataa myös pelaajan vieressä olevan puun (ennen > 9 m); 70 % kaatuu tuulen suuntaan (±25°), 30 % satunnaisesti.
function stormFellTree(){const list=nodesNear(P.pos.x,P.pos.z,100,_sl).filter(n=>n.def.kind==='tree'&&n.type!=='aarnipuu'&&dist2(n.x,n.z,P.pos.x,P.pos.z)>2*2&&!nearBase(n.x,n.z));
  if(!list.length)return null;const n=list[Math.random()*list.length|0];killNode(n);const wa=Math.atan2(WIND.x,WIND.z);fallTree(n,Math.random()<.7?wa+(Math.random()-.5)*.87:Math.random()*TAU,true);
  if(dist2(n.x,n.z,P.pos.x,P.pos.z)<40*40&&playTime>stormMsgT){stormMsgT=playTime+30;msg('Myrsky kaataa puita!','warn');}return n;}
// Sadepisarat elävät maailmakoordinaateissa ja pysähtyvät maahan tai rakennuksen katon yläpintaan (ei sadetta katon läpi).
const RAIN_STOP=new Float32Array(900);let rainInit=false;
/* v1.41 (lista 4, kohta 2): lumi maailman koordinaateissa. Hiutaleet kiertävät silmukkana pelaajan ympärillä (50 m alue, kääre reunoilla →
   alue ei näkyvästi seuraa kameraa), putoavat ja liikkuvat tuulen mukana; maahan osuttuaan palaavat ylös. Väri: pimeässä tummempi,
   Medium+ -tasolla lähellä olevat valot (myös pelaajan soihtu) värjäävät hiutaleet ja pisarat lämpimiksi (precipTint). */
let snowInit=false;
function updateSnow(dt){const g=snow.geometry,a=g.attributes.position.array,cx=camera.position.x,cy=camera.position.y,cz=camera.position.z,wv=WIND.spd*.32,wx=WIND.x*wv,wz=WIND.z*wv;
  if(snow.position.lengthSq()>0)snow.position.set(0,0,0);
  for(let i=0;i<a.length;i+=3){if(!snowInit){a[i]=cx+(Math.random()-.5)*50;a[i+1]=cy-6+Math.random()*26;a[i+2]=cz+(Math.random()-.5)*50;continue;}
    a[i+1]-=2.2*dt;a[i]+=(wx+Math.sin(playTime*.8+i)*.4)*dt;a[i+2]+=(wz+Math.cos(playTime*.7+i)*.25)*dt;
    // kääre: x/z pysyvät 50 m ruudussa pelaajan ympärillä (silmukka), y: maahan tai alueen alle → takaisin ylös
    let dx=a[i]-cx;if(dx>25)a[i]-=50;else if(dx<-25)a[i]+=50;let dz=a[i+2]-cz;if(dz>25)a[i+2]-=50;else if(dz<-25)a[i+2]+=50;
    if(a[i+1]<cy-8||(a[i+1]<cy+2&&a[i+1]<terrainH(a[i],a[i+2]))){a[i+1]=cy+14+Math.random()*6;}}
  snowInit=true;g.attributes.position.needsUpdate=true;precipTint(g,a,3,.95,.97,1);}
function precipTint(g,a,stride,r0,g0,b0){const c=g.attributes.color.array,day=P.inDun?.15:Math.max(.12,lightK*(1-.35*wDark)),hi=(+SET.lights||6)>=4&&(+SET.particles)>=.5;   // Medium ja ylöspäin
  const L=hi?LIGHTS.filter(l=>l.intensity>.05):[];const lp=L.map(l=>[l.position.x,l.position.y,l.position.z,l.color.r,l.color.g,l.color.b,l.intensity]);
  const per=stride===6?2:1;
  for(let i=0,v=0;i<a.length;i+=stride,v++){let r=r0*day,gg=g0*day,b=b0*day;
    for(const q of lp){const d2=(a[i]-q[0])**2+(a[i+1]-q[1])**2+(a[i+2]-q[2])**2;if(d2<64){const k=(1-d2/64)*.7*Math.min(1.5,q[6]);r+=q[3]*k;gg+=q[4]*k*.85;b+=q[5]*k*.55;}}
    for(let j=0;j<per;j++){const o=(v*per+j)*3;c[o]=Math.min(1,r);c[o+1]=Math.min(1,gg);c[o+2]=Math.min(1,b);}}
  g.attributes.color.needsUpdate=true;}
function roofTopAt(x,z){let h=terrainH(x,z);gridQuery(x,z,.15,_cl);for(const c of _cl)if(c.t==='b'&&c.owner&&c.owner.t&&c.maxY>h&&x>=c.minX&&x<=c.maxX&&z>=c.minZ&&z<=c.maxZ)h=c.maxY;return h;}
function updateRain(dt){const a=rain.geometry.attributes.position.array,sp=26*(wRain>1.1?1.35:1),cx=camera.position.x,cy=camera.position.y,cz=camera.position.z;
  if(rain.position.lengthSq()>0)rain.position.set(0,0,0);
  for(let i=0,k=0;i<a.length;i+=6,k++){
    if(rainInit){const dx=WIND.x*WIND.spd*.45*dt,dz=WIND.z*WIND.spd*.45*dt;a[i+1]-=sp*dt;a[i+4]-=sp*dt;a[i]+=dx;a[i+2]+=dz;a[i+3]+=dx;a[i+5]+=dz;}
    const out=Math.abs(a[i]-cx)>26||Math.abs(a[i+2]-cz)>26;
    if(!rainInit||out||a[i+1]<RAIN_STOP[k]){const x=cx+(Math.random()-.5)*50,z=cz+(Math.random()-.5)*50,stop=roofTopAt(x,z),y=Math.max(cy+(rainInit&&!out?14+Math.random()*8:Math.random()*22-2),stop+.5+Math.random()*3);
      const sl=.03+WIND.spd*.03;a[i]=x;a[i+1]=y;a[i+2]=z;a[i+3]=x-WIND.x*sl;a[i+4]=y+.7;a[i+5]=z-WIND.z*sl;RAIN_STOP[k]=stop;}}
  precipTint(rain.geometry,a,6,.67,.77,.85);   // v1.41: sade yöllä hyvin tumma, valot värjäävät
  rainInit=true;rain.geometry.attributes.position.needsUpdate=true;}
function updateLights(){
  const src=lightSources.filter(s=>s.on()&&(!!s.dun===P.inDun)).sort((a,b)=>((b.pri||0)-(a.pri||0))||dist2(a.x,a.z,P.pos.x,P.pos.z)-dist2(b.x,b.z,P.pos.x,P.pos.z));   // v1.90: etusija (pri) ensin – pomon valot saavat aina valopaikan
  const nL=Math.min(LIGHTS.length,+SET.lights||6);
  for(let i=0;i<LIGHTS.length;i++){const l=LIGHTS[i],s=i<nL?src[i]:null;if(s&&dist2(s.x,s.z,P.pos.x,P.pos.z)<(+SET.lightDist||60)**2){   /* v2.03: näkyvyysetäisyys asetuksesta */if(i===0&&(l.position.x!==s.x||l.position.z!==s.z))l.shadow.needsUpdate=true;l.position.set(s.x,s.y,s.z);l.color.setHex(s.c);l.userData.base=s.i*1.15;l.userData.src=s;}else{l.intensity=0;l.userData.base=0;l.userData.src=null;}}
}
// Tilat: jokaisella on vaikutus pelaajan kykyihin (P.fx), kuvaus ja halutessa ajastin (s). effects() kerää aktiiviset, calcFx() laskee kertoimet.
function effects(){const e=[],wt=invWeight(),b=P.buffs,add=(key,name,kind,desc,t)=>e.push({key,name,kind,desc,t});
  if(P.wetT>0)add('marka','Märkä','bad','Kylmettää: ilman tulta tai suojaa tulee kylmä. Kuivuu nuotion lähellä viisi kertaa nopeammin.',P.wetT);
  if(P.cold)add('kylma','Kylmä','bad','Nälkä kuluu 30 % nopeammin, kestävyys palautuu 40 % hitaammin, kävely −7 %, isku −10 %. Lämpene tulella tai suojassa.');
  if(P.hunger<=0)add('nalka','Nälkä','bad','Menetät terveyttä, kävely −15 %, isku −20 %, kestävyys palautuu puolet hitaammin. Syö!');
  else if(P.hunger<25)add('nalkainen','Nälkäinen','bad','Isku −10 %, kestävyys palautuu 15 % ja terveys 50 % hitaammin. Syö pian.');
  if(b.pahoinvointi)add('pahoinvointi','Pahoinvointi','bad','Raa\'asta lihasta: terveys ei palaudu itsestään, kestävyys palautuu puolet hitaammin.',b.pahoinvointi);
  if(b.vatsakipu)add('vatsakipu','Vatsakipu','bad','Liiasta syömisestä: kävely −10 %, kestävyys palautuu 30 % hitaammin ja kramppi vie välillä kestävyyttä.',b.vatsakipu);
  if(!devOn('weight')&&wt>MAXW)add('kuorma','Ylikuormitus','bad','Kävely −45 %, et voi juosta etkä hypätä. Pudota tavaroita tai päivitä reppu.');
  if(b.levannyt)add('levannyt','Levännyt','good','Kestävyys palautuu 45 % nopeammin ja terveys palautuu nopeammin.',b.levannyt);
  if(b.elpyminen)add('elpyminen','Elpyminen','good','Elpymisjuoma: terveys palautuu 1 sekunnissa.',b.elpyminen);
  if(b.kylla)add('kylla','Kylläinen','good','Sisujuoma: kylläisyys pysyy täynnä.',b.kylla);
  if(b.sisu)add('sisu','Sisu','good','Sisujuoma: kestävyys pysyy täynnä.',b.sisu);
  if(b.voima)add('voima','Voimistunut','good','Isku +15 %, enimmäisterveys +15, enimmäiskestävyys +25.',b.voima);
  if(fireCache)add('lampo','Lämmin','good','Tulen lähellä et kylmety ja kuivut nopeasti.');
  if(shelterCache&&!P.inDun)add('suoja','Suojassa','neu','Katon alla sade ja lumi eivät kastele.');
  if(P.crouch)add('hiipii','Hiipii','neu','Hitaampi liike; viholliset huomaavat vasta lähempää, eläimet eivät säiky.');
  if(P.restT>0&&!b.levannyt)add('lepaa','Lepää…','neu','Pysy tulen ja katon alla, niin tunnet olosi levänneeksi.',12-P.restT);
  return e;}
function calcFx(){const f=P.fx,b=P.buffs;f.speed=1;f.dmg=1;f.stamRegen=1;f.hpRegen=1;
  if(P.cold){f.speed*=.93;f.dmg*=.9;f.stamRegen*=.6;}
  if(P.hunger<=0){f.speed*=.85;f.dmg*=.8;f.stamRegen*=.5;f.hpRegen=0;}else if(P.hunger<25){f.dmg*=.9;f.stamRegen*=.85;f.hpRegen*=.5;}
  if(b.pahoinvointi){f.stamRegen*=.5;f.hpRegen=0;}
  if(b.vatsakipu){f.speed*=.9;f.stamRegen*=.7;}
  if(b.levannyt)f.stamRegen*=1.45;f.speed*=1+BON.spd/100;}
function fmtT(t){return t>=60?`${Math.ceil(t/60)} min`:`${Math.ceil(t)} s`;}
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
  if(fireCache&&shelterCache){P.restT+=dt;if(P.restT>12&&!P.buffs.levannyt){P.buffs.levannyt=360;flags.rested=1;msg('Olet levännyt. Kestävyys palautuu nopeammin.','loot');}}else P.restT=0;
  for(const k in P.buffs){P.buffs[k]-=dt;if(P.buffs[k]<=0)delete P.buffs[k];}
  calcFx();
  P.crampT-=dt;if(P.buffs.vatsakipu&&P.crampT<=0){P.crampT=8+Math.random()*6;P.stam=Math.max(0,P.stam-12);P.stamDelay=Math.max(P.stamDelay,1);floatText('Auts!',P.pos.x,P.pos.y+2,P.pos.z,'#c9a66b');}
  if(P.buffs.kylla){P.hunger=100;P.buffs.taysi=60;}   // v2.00 sisujuoma: kylläisyys täynnä 5 min
  if(!P.buffs.taysi)P.hunger=Math.max(0,P.hunger-dt*(100/1000)*(cold?1.3:1)*(P.atk||kd('run')?1.15:1));if(devOn('food'))P.hunger=100;   // DEV: ei nälkää; v2.00: täyteen syötyä 60 s ei kulu
  if(P.buffs.elpyminen)P.hp=Math.min(maxHp(),P.hp+dt);   // v2.00 elpymisjuoma: +1 terveys / s
  // regen
  let reg=P.hunger>35?.35:P.hunger>0?.15:0;if(P.buffs.levannyt)reg+=.6;reg*=P.fx.hpRegen;
  if(P.heal>0){const h=Math.min(P.heal,3*dt);P.heal-=h;P.hp+=h;}
  P.hp=Math.min(maxHp(),P.hp+reg*dt);
  if(P.hunger<=0){P.hp-=.5*dt;if(P.hp<=0)playerDie();}
}
