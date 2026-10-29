/* Hiidenmaa – audio.js
   Äänet: vain käyttäjän omat tiedostoäänet (olennot, toiminnot); sfx() on hiljainen koukku tuleville projekteille (v2.22) */
'use strict';

/* ---------------- AUDIO ---------------- */
let actx=null, soundOn=true;
function audio(){if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}return actx;}
/* v2.22 (käyttäjän päätös): KOODILLA GENEROIDUT ÄÄNET POISTETTU KOKONAAN. Peli soittaa vain käyttäjän omia ääniä (sounds/-projektit,
   manifest.json). sfx(nimi) on hiljainen koukku: kutsut jäävät paikoilleen, jotta tulevat ääniprojektit (pelaaja, maailma, käyttöliittymä)
   voidaan kytkeä samoihin kohtiin. Koukkujen nimet (KEHITYSMUISTIO "Äänikoukut"): pickup, build, craft, hit, slam, roar, crumble, die,
   swing, hurt, eat, bow, thud, pick, howl, flap, discover, block, chop, chopFinal, chopLog, logBreak, rockBreak, woodBreak. */
const SFX_HOOKS=new Set(['pickup','build','craft','hit','slam','roar','crumble','die','swing','hurt','eat','bow','thud','pick','howl','flap','discover','block',
  'chop','chopFinal','chopLog','logBreak','rockBreak','woodBreak']);
function sfx(type,pitch=1,vol=1){}   // hiljainen koukku (ei generoitua ääntä)

/* ---------------- OLENTOJEN ÄÄNET (v1.84, äänierä A – ks. KEHITYSMUISTIO "Äänisuunnitelma", sounds/AANILISTA.md) ----------------
   Tiedostoäänet sounds/<id>_<laji>_<n>.mp3 (käsitelty tools/process_sounds.py:llä; peli lukee vain manifest.json:ssa olevat).
   Lajit: idle (1–2), hurt, death, aggro (hyökkäävät). Laiska lataus kun olento ilmestyy, 3D-ääni (PannerNode), sävel ±6 %.
   VARAANI: väliaikainen varaääniketju, jos olennolla ei ole omaa ääntä (to = mistä, p = sävelkerroin). Ketju seurataan useampi
   askel (kerroin kertautuu). Jos idle_2 puuttuu → idle_1. Jos mitään ei löydy → hiljaisuus (v2.22: ei generoituja ääniä).
   Lohko VARAANI-ALKU…LOPPU on tiukkaa JSONia: tools/process_sounds.py lukee sen taulukkoa varten – pidä muoto. */
const VARAANI=/*VARAANI-ALKU*/{
  "kalmasusi":{"to":"susi","p":0.88},"routasusi":{"to":"susi","p":1.06},"kettu":{"to":"susi","p":1.35},"janis":{"to":"kettu","p":1.2},
  "ilves":{"to":"susi","p":1.15},"ahma":{"to":"ilves","p":1.1},
  "emakko":{"to":"karju","p":1.08},"porsas":{"to":"karju","p":1.5},
  "hiidenkarhu":{"to":"karhu","p":0.85},
  "hiidenhirvi":{"to":"hirvi","p":0.82},"poro":{"to":"peura","p":0.9},"peura":{"to":"hirvi","p":1.3},
  "ylimys":{"to":"kalmo","p":0.85},"vartija":{"to":"aarnihirvio","p":0.7},
  "jaajattari":{"to":"aarnihirvio","p":1.2},"kalmaherra":{"to":"aarnihirvio","p":0.85},"suonakki":{"to":"hiisi","p":0.7}
}/*VARAANI-LOPPU*/;
// v2.16: täysin hiljaiset kunnes omat tiedostoäänet (ei lainausta eikä pelin tekemää varaääntä)
const CRE_SILENT=new Set(['kivivartija']);
function mobBurning(m){return !m.dead&&(m.burnT>0||!!m.sunBurn);}   // v2.17
const CRE_AGGRO=['neutral','hostile','boss','rboss'];   // niillä on suuttumisääni (aggro)
const CRE_CHASE=['hostile','boss','rboss'];             // niillä on lisäksi toistuva jahtiääni (chase) ja suuttumisääni vain kerran
const CRE_ECHO=['rboss','boss'];                         // v1.88: pomoilla lisäksi kaikuääni (echo, 1–2 versiota): kuuluu kaukaa kunnes pelaaja kohtaa pomon (v1.95: myös Kalmanvartija maan alta)
const CRE_KINDS=['idle','hurt','death','aggro','chase','echo'];  // v2.11: versioita rajattomasti (_1, _2 … _9 …), arvonta niistä jotka ovat manifestissa
const CRE={man:null,idx:{},ok:false,buf:{},load:{},want:{},gain:null,voices:[],max:10,last:{},lastAmb:-9,rev:null};
// manifest kerran (tiiviste osoitteessa → välimuisti ei anna vanhaa ääntä). Ilman palvelinta (file://) epäonnistuu hiljaa.
function creInit(){if(CRE.man)return;CRE.man={};
  try{fetch('sounds/manifest.json?v='+(window.HV||'')).then(r=>r.ok?r.json():null).then(j=>{CRE.man=(j&&j.sounds)||{};creIndex();CRE.ok=true;for(const t in CRE.want)creLoad(t);}).catch(()=>{});}catch(e){}}
// v2.11: hakemisto '<id>_<laji>' → kaikki manifestin versiot numerojärjestyksessä (idle_4, idle_5 … toimivat ilman koodimuutosta)
function creIndex(){const I={};for(const n in CRE.man){const m=/^(.+)_(\d+)$/.exec(n);if(m)(I[m[1]]||(I[m[1]]=[])).push([+m[2],n]);}
  CRE.idx={};CRE.idxOf=CRE.man;for(const k in I)CRE.idx[k]=I[k].sort((a,b)=>a[0]-b[0]).map(x=>x[1]);}
// ratkaisee lajin äänet: omat versiot (kaikki olemassa olevat) → muuten varaääniketju. Palauttaa {names:[…], p} tai null.
function creRes(id,kind){const M=CRE.man;if(!M)return null;if(CRE.idxOf!==M)creIndex();let cur=id,p=1;
  for(let d=0;d<6&&cur;d++){const L=CRE.idx[`${cur}_${kind}`];if(L&&L.length)return{names:L,p};const v=VARAANI[cur];if(!v)break;p*=v.p;cur=v.to;}
  // v1.88: kaikuäänen pääääni on Aarnihirviö (💎): pomo ilman omaa kaikuääntä lainaa sen, vaikka VARAANI-ketju ei johtaisi sinne
  if(kind==='echo'&&id!=='aarnihirvio'&&MOBDEF[id]&&CRE_ECHO.includes(MOBDEF[id].ai)){const L=CRE.idx.aarnihirvio_echo;if(L&&L.length)return{names:L,p:1};}
  return null;}
function creBuf(name){if(CRE.buf[name]||CRE.load[name])return;const a=audio(),e=CRE.man&&CRE.man[name];if(!a||!e)return;
  CRE.load[name]=fetch(`sounds/${e.f||name+'.mp3'}?h=${e.h}`)   /* v2.16: projektikansiot (manifestin f-polku) */.then(r=>{if(!r.ok)throw 0;return r.arrayBuffer();}).then(b=>a.decodeAudioData(b)).then(B=>{CRE.buf[name]=B;}).catch(()=>{});}
// laiska lataus: olennon kaikki äänet (myös varaäänet) haetaan kun se ilmestyy ensimmäisen kerran
function creLoad(type){creInit();CRE.want[type]=1;if(!CRE.ok)return;const ai=typeof MOBDEF!=='undefined'&&MOBDEF[type]&&MOBDEF[type].ai;
  for(const k of CRE_KINDS){if(k==='aggro'&&!CRE_AGGRO.includes(ai))continue;if(k==='chase'&&!CRE_CHASE.includes(ai))continue;if(k==='echo'&&!CRE_ECHO.includes(ai))continue;const r=creRes(type,k);if(r)for(const n of r.names)creBuf(n);}tgLoad(type);}
function crePos(pn,x,y,z){if(pn.positionX){pn.positionX.value=x;pn.positionY.value=y;pn.positionZ.value=z;}else pn.setPosition(x,y,z);}
// ---- toistosäännöt (v1.86) ----
// Tärkeys: kuolema 5 > osuma 4 > suuttuminen 3 > jahti 2 > rauhallinen 1. Yhdellä olennolla soi kerrallaan vain yksi ääni
// (tärkeämpi katkaisee heikomman nopealla häivytyksellä, heikompi ei katkaise vahvempaa). Kuolema vaientaa olennon muut äänet.
// Kaikkiaan enintään CRE.max ääntä: täyden ollessa uusi syrjäyttää heikoimman (tasatilanteessa kaukaisimman), tai jää pois jos on heikompi kuin kaikki.
// Rauhallisia ja jahtiääniä saa samaa lajia soida enintään 3, ja uusi alkaa aikaisintaan 0,3 s edellisen jälkeen (ei kuoroa).
// Sama versio ei toistu heti perään (jos versioita on useita).
// v2.10: suuttumisäänen lupa (olento 15 s, laji 6 s); varaa vuoron heti, jotta samassa ruudussa suuttuvat eivät soi päällekkäin
const CRE_AGT={};
function creAngerOk(m){const t=playTime;if(t-(m.agT??-99)<15||t-(CRE_AGT[m.type]??-99)<6)return false;m.agT=t;CRE_AGT[m.type]=t;return true;}
// v2.12 etäisyys: kutsuäänet (manifestin far=1: ulvonta, soidin, mylvintä) kuuluvat kauas, muut lähemmäs hiljaisempina. Kaukana ääni tummenee
// (alipäästö) ja saa enemmän kaikua (sama ConvolverNode kuin luolissa) → "kaukana"-tuntu. creDistK: 0 lähellä … 1 kantaman reunalla.
// v2.14 (käyttäjä): kutsuäänet 220 → 150 m, muut 80 → 64 m (−20 %), rauhallinen ääntely 45 → 36 m; efekti selvästi vahvempi: suora ääni −30 %
// kantaman reunalla, alipäästö puolimatkassa alle 1,5 kHz (15 kHz·(1−k)^4 + 500 Hz), kaiku jopa ~1,9 × ja pieni sävelhuojunta (LFO ≤ 30 senttiä).
const CRE_FAR_R=150,CRE_NEAR_R=64,CRE_IDLE_R=36,CRE_WOLF=new Set(['susi','routasusi','kalmasusi']);
function creIsFar(name){const e=CRE.man&&CRE.man[name];return !!(e&&e.far);}
function creHasFar(type,kind){const r=creRes(type,kind);return !!(r&&r.names.some(creIsFar));}
function creAgR(m){return (creHasFar(m.type,'aggro')?CRE_FAR_R:CRE_NEAR_R)**2;}   // suuttumisäänen kantama (neliö)
function creDistK(d,far){return clamp((d-8)/((far?CRE_FAR_R:CRE_NEAR_R)-8),0,1);}
function creLpf(k){return 15000*Math.pow(1-k,4)+500;}
function creDistFx(v,d){const k=creDistK(d,v.far),now=actx.currentTime;if(v.df)v.df.frequency.setTargetAtTime(creLpf(k),now,.1);
  if(v.dg)v.dg.gain.setTargetAtTime(1-.3*k,now,.1);if(v.lg)v.lg.gain.setTargetAtTime(30*k,now,.2);if(v.sdo)v.sdo.gain.setTargetAtTime(.08+1.8*k,now,.1);}
const CRE_PRI={idle:1,chase:2,aggro:3,hurt:4,death:5},CRE_G={idle:.75,chase:.9,aggro:1,hurt:1,death:1};
// Kaiku (vain ulottuvuuksien ja luolaston olennoille m.dun): yksi yhteinen ConvolverNode + proseduraalinen vastaus (1,2 s; ConvolverNode vaatii saman näytetaajuuden kuin ääni-AudioContext),
// pimeä (alipäästö 3,2 kHz). Kytkeytyy vain kun jokin kaiullinen ääni soi ja irtoaa 3 s sen jälkeen → ei kuormaa maailmassa.
function creRevMake(a){if(CRE.rev)return CRE.rev;const sr=a.sampleRate,len=Math.floor(sr*1.2),buf=a.createBuffer(2,len,sr);
  for(let c=0;c<2;c++){const d=buf.getChannelData(c);let lp=0,seed=1234+c*777;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;const n=seed/2147483648-1,t=i/len;
    lp+=(n-lp)*(.85-.6*t);d[i]=lp*Math.pow(1-t,2.6)*(i<sr*.012?i/(sr*.012):1);}}
  const cv=a.createConvolver();cv.normalize=true;cv.buffer=buf;const inp=a.createGain(),lp=a.createBiquadFilter(),out=a.createGain();lp.type='lowpass';lp.frequency.value=3200;out.gain.value=.9;
  inp.connect(lp);lp.connect(cv);cv.connect(out);CRE.rev={inp,cv,out,on:false,t:0};return CRE.rev;}
function creRevOn(a){const R=creRevMake(a);R.t=3;if(!R.on){R.out.connect(CRE.gain);R.on=true;}return R;}
function creRevTick(dt){const R=CRE.rev;if(!R||!R.on)return;if(CRE.voices.some(v=>v.sd)||TGV.v.some(v=>v.sd)){R.t=3;return;}R.t-=dt;if(R.t<=0){try{R.out.disconnect();}catch(e){}R.on=false;}}
function creStop(v,t){try{v.g.gain.setTargetAtTime(0,actx.currentTime,.03);v.src.stop(actx.currentTime+(t||.12));}catch(e){}}
// v1.88 kaikuääni: pomon paikasta, mutta enintään 38 m pelaajasta (kaukainen pomo kuuluu vaimeana kaikuna luolastossa, ei hiljaisuutena)
function creEchoPos(m,pn){let x=m.pos.x,z=m.pos.z;const dx=x-P.pos.x,dz=z-P.pos.z,d=Math.hypot(dx,dz);if(d>38){x=P.pos.x+dx/d*38;z=P.pos.z+dz/d*38;}crePos(pn,x,P.pos.y+1.6,z);}
// o (valinnainen): {p: sävelkerroin, v: voimakkuuskerroin, pri: tärkeys, key: oma laskuriavain, echo: kaukainen kaikuääni,
//   rev: pakotettu kaiun määrä (pomon kuolema), add: lisä-ääni joka ei katkaise olennon muita ääniä eikä katkea niistä} 
// soittaa olennon äänen 3D:nä (arpoo ladatuista versioista). Palauttaa äänen keston sekunteina, jos olennolla on tiedostoääni
// (silloin tehtyä ääntä ei soiteta), muuten false (ei ääntä tai vielä latautumassa).
function creSnd(m,kind,o){if(!m)return false;const r=creRes(m.type,kind);if(!r)return false;
  let L=r.names.filter(n=>CRE.buf[n]);if(o&&o.farOnly)L=L.filter(creIsFar);if(!L.length){for(const n of r.names)creBuf(n);return false;}
  const key=m.type+'_'+(o&&o.key||kind);let pick=L;if(L.length>1&&CRE.last[key])pick=L.filter(n=>n!==CRE.last[key]);
  const name=pick[Math.random()*pick.length|0],B=CRE.buf[name],rate=r.p*(o&&o.p||1)*(1+(Math.random()*2-1)*.06),dur=B.duration/rate;
  const a=actx;if(!a||a.state!=='running'||!soundOn)return dur;const vol=typeof SET!=='undefined'?+SET.creVol:1;if(!(vol>0))return dur;
  const pri=o&&o.pri||CRE_PRI[kind]||1,now=a.currentTime,amb=pri<=2,boss=m.def.ai==='boss'||m.def.ai==='rboss';
  const ec=!!(o&&o.echo),rv=o&&o.rev,addv=!!(o&&o.add);
  if(!CRE.gain){CRE.gain=a.createGain();CRE.gain.connect(a.destination);}CRE.gain.gain.value=vol;
  // olennon oma ääni: heikompi ei katkaise, samanarvoinen vasta kun edellinen on soinut hetken
  if(!addv)for(const v of CRE.voices)if(v.m===m){if(v.pri>pri||(v.pri===pri&&now-v.t0<.35))return dur;}
  if(amb){if(now-CRE.lastAmb<.3)return dur;let n=0;for(const v of CRE.voices)if(v.key===key)n++;if(n>=3)return dur;}
  if(!addv)for(const v of CRE.voices.slice())if(v.m===m){creStop(v);CRE.voices.splice(CRE.voices.indexOf(v),1);}
  if(CRE.voices.length>=CRE.max){let w=null,wd=-1;for(const v of CRE.voices){const d=dist2(v.m.pos.x,v.m.pos.z,P.pos.x,P.pos.z);if(!w||v.pri<w.pri||(v.pri===w.pri&&d>wd)){w=v;wd=d;}}
    if(!w||w.pri>pri)return dur;creStop(w,.08);CRE.voices.splice(CRE.voices.indexOf(w),1);}
  if(amb)CRE.lastAmb=now;CRE.last[key]=name;
  const src=a.createBufferSource(),g=a.createGain(),pn=a.createPanner();src.buffer=B;src.playbackRate.value=rate;
  const far=!ec&&creIsFar(name),md=Math.sqrt(dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z));
  pn.panningModel='equalpower';pn.distanceModel='inverse';pn.refDistance=far?10:boss?6.4:2.4;pn.maxDistance=far?220:120;pn.rolloffFactor=ec?.7:far?.8:1.1;
  g.gain.value=(CRE_G[kind]||1)*(o&&o.v||1);src.connect(g);let df=null,dg=null,lfo=null,lg=null;
  if(ec){const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1500;g.connect(lp);lp.connect(pn);}   // kaikuääni: tumma, kaukainen
  else{const k0=creDistK(md,far);df=a.createBiquadFilter();df.type='lowpass';df.Q.value=.5;df.frequency.value=creLpf(k0);dg=a.createGain();dg.gain.value=1-.3*k0;g.connect(df);df.connect(dg);dg.connect(pn);   // v2.12/v2.14: etäisyys tummentaa ja hiljentää
    if(src.detune){lfo=a.createOscillator();lfo.frequency.value=.35+Math.random()*.3;lg=a.createGain();lg.gain.value=30*k0;lfo.connect(lg);lg.connect(src.detune);lfo.start();}}   // kaukana pieni huojunta (utuisuus)
  pn.connect(CRE.gain);if(ec)creEchoPos(m,pn);else crePos(pn,m.pos.x,m.pos.y+(m.def.r||.5)*1.6,m.pos.z);
  let sd=null,sdo=null;if(m.dun||rv){const R=creRevOn(a);sd=a.createGain();sd.gain.value=rv||(ec?1.3:m.def.ai==='rboss'?.75:boss?.6:.45);pn.connect(sd);sd.connect(R.inp);}
  else if(!ec&&md>8){const R=creRevOn(a);sd=sdo=a.createGain();sdo.gain.value=.08+1.8*creDistK(md,far);pn.connect(sdo);sdo.connect(R.inp);}   // v2.12: ulkona kaukana kaikuu
  const v={src,pn,g,sd,sdo,df,dg,lg,far,m,pri,t0:now,key,ec};CRE.voices.push(v);src.onended=()=>{const i=CRE.voices.indexOf(v);if(i>=0)CRE.voices.splice(i,1);try{pn.disconnect();}catch(e){}if(lfo)try{lfo.stop();lfo.disconnect();}catch(e){}if(sd)try{sd.disconnect();}catch(e){}};src.start();return dur;}
// v1.95: Kalmanvartijan kaikuääni maan alta: ennen ensimmäistä voittoa, kun vartija ei ole hereillä ja pelaaja on alle 80 m Kalmankehästä
// (maailmassa). Soi 24–48 s välein (ensimmäinen 4–10 s), tumma ja kaiullinen; jos ääni latautuu vielä, uusi yritys 3 s päästä.
// Ilman omaa kaikuääntä lainaa Aarnihirviön (💎) kaikuäänen; jos sitäkään ei ole, on hiljaa.
// v2.12: kaukainen ulvonta: yöllä ulkona (ei luolassa) susien kutsuääni kuuluu 100–145 m päästä (v2.14; ennen 150–230) satunnaisesta suunnasta 56–138 s välein
// (60 %:n todennäköisyydellä) – tumma ja kaikuinen etäisyysefektin ansiosta. Vain jos suden ulvontaääniä (far) on.
const FHW={t:20,m:null};
function farHowl(dt){if(P.inDun||P.dead||!isNight()){FHW.t=Math.max(FHW.t,15);return;}if((FHW.t-=dt)>0)return;FHW.t=(45+Math.random()*65)*1.25;   /* v2.14: 20 % harvemmin */
  if(Math.random()>.6||!creHasFar('susi','idle'))return;creLoad('susi');const a=Math.random()*TAU,d=100+Math.random()*45,x=P.pos.x+Math.cos(a)*d,z=P.pos.z+Math.sin(a)*d;
  FHW.m={type:'susi',def:MOBDEF.susi,pos:{x,y:Math.max(terrainH(x,z),0)+1,z},dead:false,dun:false};creSnd(FHW.m,'idle',{farOnly:1,key:'farhowl'});}
const VEC={t:-1,m:null};
function vartijaEcho(dt){const L=typeof LOC!=='undefined'&&LOC.circle;if(!L||P.inDun||P.dead||flags.boss||mobs.some(m=>m.type==='vartija'&&!m.dead)){VEC.t=-1;return;}
  if(dist2(L.x,L.z,P.pos.x,P.pos.z)>80*80){VEC.t=-1;return;}
  if(!VEC.m){VEC.m={type:'vartija',def:MOBDEF.vartija,pos:{x:L.x,y:terrainH(L.x,L.z)-3,z:L.z},dun:false};}
  if(VEC.t<0){VEC.t=4+Math.random()*6;creLoad('vartija');}VEC.t-=dt;if(VEC.t>0)return;
  VEC.t=creSnd(VEC.m,'echo',{echo:1,v:.6,pri:1,key:'echo',rev:.9})?24+Math.random()*24:creRes('vartija','echo')?3:10;}   // ei kaikuääntä vielä → tarkistus 10 s välein
// joka ruutu: kuuntelija = kamera, soivat äänet seuraavat olentoa; idle 6–15 s välein alle 25 m päässä, aggro kerran jahdin alkaessa
const _creF=new THREE.Vector3();
function creTick(dt){const a=actx;if(!a||a.state!=='running'||typeof camera==='undefined')return;const L=a.listener,c=camera.position;camera.getWorldDirection(_creF);
  if(L.positionX){L.positionX.value=c.x;L.positionY.value=c.y;L.positionZ.value=c.z;L.forwardX.value=_creF.x;L.forwardY.value=_creF.y;L.forwardZ.value=_creF.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0;}
  else{L.setPosition(c.x,c.y,c.z);L.setOrientation(_creF.x,_creF.y,_creF.z,0,1,0);}
  creRevTick(dt);tgTick(dt);
  for(const v of CRE.voices){if(v.ec)creEchoPos(v.m,v.pn);else if(!v.m.dead){crePos(v.pn,v.m.pos.x,v.m.pos.y+(v.m.def.r||.5)*1.6,v.m.pos.z);creDistFx(v,Math.sqrt(dist2(v.m.pos.x,v.m.pos.z,P.pos.x,P.pos.z)));}}
  if(state!=='play'||!soundOn)return;
  vartijaEcho(dt);farHowl(dt);
  for(const m of mobs){if(m.dead)continue;const d2=dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z),ai=m.def.ai,hs=CRE_CHASE.includes(ai),chasing=m.state==='chase',hasChase=hs&&chasing&&creRes(m.type,'chase');
    // rauhallinen ääntely 6–15 s välein alle 25 m päässä (ei jahdin aikana, jos olennolla on jahtiääni)
    // v2.12: tavallinen ääntely alle CRE_IDLE_R (36 m, v2.14), kutsuäänet (ulvonta ym.) alle CRE_FAR_R (150 m); pitkän äänen jälkeen tauko
    // vähintään äänen pituus + 2 s, kutsuäänen jälkeen 12–30 s lisää (ei jatkuvaa ulvontaa)
    // v2.17 PALAMINEN: liekeissä olennon ääntely (idle, suuttuminen, jahti) on tauolla – kesken soiva katkaistaan; kipuääni soi 1,7–2,1 s välein
    // kunnes palo sammuu tai olento kuolee (kuolinhuuto soi normaalisti). Sammuttua ääntely jatkuu tavalliseen tapaan.
    const burn=mobBurning(m);
    if(burn){if(!m.brS){m.brS=1;m.brT=.15;for(const v of CRE.voices.slice())if(v.m===m&&v.pri<=3){creStop(v);CRE.voices.splice(CRE.voices.indexOf(v),1);}}
      if((m.brT-=dt)<=0){m.brT=1.7+Math.random()*.4;const bo=m.def.ai==='boss'||m.def.ai==='rboss';if(d2<(bo?60:CRE_NEAR_R)**2)creSnd(m,'hurt',bo?{p:.78,v:.55,key:'burn'}:undefined);}m.sndT=Math.max(m.sndT||0,2);continue;}
    else if(m.brS){m.brS=0;m.sndT=2+Math.random()*4;}
    if(m.sndT===undefined)m.sndT=2+Math.random()*13;m.sndT-=dt;if(m.sndT<=0){m.sndT=6+Math.random()*9;const fr=creHasFar(m.type,'idle');
      if(d2<(fr?CRE_FAR_R:CRE_IDLE_R)**2&&m.state!=='sleep'&&m.state!=='rise'&&!hasChase){const du=creSnd(m,'idle');const ln=CRE.last[m.type+'_idle'];
        if(du){if(creIsFar(ln))m.sndT=(du+12+Math.random()*18)*(CRE_WOLF.has(m.type)?(isNight()?1.25:3):1);   /* v2.14: sudet ulvovat päivällä 3× harvemmin, yöllä 20 % harvemmin */
          else m.sndT=Math.max(m.sndT,du+2);}}}
    // v1.88: nukkuvan ulottuvuuspomon kaikuääni: kuuluu satunnaisesti (24–48 s välein, ensimmäinen 5–14 s sisääntulosta) vain tässä ulottuvuudessa kunnes pomo herää
    if(ai==='rboss'&&m.dun&&m.state==='sleep'&&P.inDun&&m.realm===P.realm&&!P.dead){m.echoT=(m.echoT??(5+Math.random()*9))-dt;if(m.echoT<=0){m.echoT=24+Math.random()*24;if(creRes(m.type,'echo'))creSnd(m,'echo',{echo:1,v:.6,pri:1,key:'echo'});}}
    if(hs){
      // vihamielinen / pomo: suuttumisääni VAIN KERRAN olennon elinaikana (kun huomaa sinut ensimmäistä kertaa); jos sitä ei ole, ei erillistä ääntä
      // vaan jahtiääni alkaa heti. Sen jälkeen jahtiääni toistuu 4–9 s välein kun olento jahtaa sinua.
      if(chasing||m.state==='intro'){
        if(!m.angerDone){m.angerTry=(m.angerTry||0)+dt;const has=creRes(m.type,'aggro');
          if(!has||m.angerTry>3){m.angerDone=1;m.chT=0;}
          else{const ar=creAgR(m),dur=d2<ar?creSnd(m,'aggro'):0;if(dur){m.angerDone=1;m.chT=dur+1+Math.random()*2;}else if(d2>=ar){m.angerDone=1;m.chT=0;}}}
        else if(!m.inChase)m.chT=1+Math.random()*2;
        m.inChase=1;
        if(chasing&&m.angerDone){m.chT-=dt;if(m.chT<=0){m.chT=4+Math.random()*5;if(d2<(creHasFar(m.type,'chase')?CRE_FAR_R:CRE_NEAR_R)**2){const du=creSnd(m,'chase');if(du)m.chT=Math.max(m.chT,du+1.5);}}}
      }else m.inChase=0;
    }else if(ai==='neutral'){
      // neutraali: suuttumisääni aina kun suuttuu (uusi vasta 5 s jahdin päättymisen jälkeen), ei jahtiääntä
      // v2.10: yksi ääni / suuttuminen: uusi vasta kun rauhoittunut (ei vihainen, 5 s ilman jahtia), olennolla vähintään 15 s väli ja
      // saman lajin suuttumisäänten välillä 6 s (lauma / emakot eivät kerrostu)
      if(chasing){m.sndOff=0;if(!m.sndAg){m.sndAg=1;if(d2<creAgR(m)&&creAngerOk(m))creSnd(m,'aggro');}}else if(m.sndAg&&!m.angry){m.sndOff=(m.sndOff||0)+dt;if(m.sndOff>5)m.sndAg=0;}
    }}}

/* ================================================================ v2.16 OLENTOJEN TOIMINNOT (äänierä B1)
   Projekti sounds/olennot_toiminnot/ (raw/<ryhmä>/, valmiit/<ryhmä>_valmis/, AANILISTA_TOIMINNOT.md); manifestin avaimet t/<ryhmä>/<ääni>_<n>.
   Ryhmät (TG, sama jako kuin tools/process_sounds.py:n TG_GROUPS) jakavat äänet; puuttuva ääni = hiljaisuus (pomot lainaavat pomot/-kansiosta,
   v2.21: kerrostuvat ryhmät TG_BASE soittavat pohjaryhmän äänet + omat päälle).
   Askeleet kuljetun matkan mukaan (TG_STRIDE, juostessa ×1,25) alustan mukaan (tgSurface), lähimmät 6 alle 20 m (isot 40 m);
   pomon askel alle 15 m tärisyttää kameraa. Muut: oksa (Aarnimetsä 15 %), kahina (juostessa metsässä), loiskahdus ja ravistus (vesi),
   palaminen (silmukka), kalina (luurangot, joka askeleella v2.21), tömistys (raskaat, kivivartija, pomot), lentoonlähtö, kaatuminen, törmäys, huitaisu, osuma, nousu, nuuhkiminen, syöminen. Oma budjetti TGV. */
const TG={hiisi:'kaksijalkaiset',suonakki:'kaksijalkaiset',kalmo:'luurangot',ylimys:'luurangot',peura:'nelijalkaiset',poro:'nelijalkaiset',hirvi:'nelijalkaiset',
  karju:'nelijalkaiset',emakko:'nelijalkaiset',susi:'nelijalkaiset',routasusi:'nelijalkaiset',kalmasusi:'nelijalkaiset',ilves:'nelijalkaiset',ahma:'nelijalkaiset',
  karhu:'raskaat_nelijalkaiset',hiidenkarhu:'raskaat_nelijalkaiset',hiidenhirvi:'raskaat_nelijalkaiset',janis:'kevyet_nelijalkaiset',kettu:'kevyet_nelijalkaiset',porsas:'kevyet_nelijalkaiset',
  metso:'kevyet_kaksijalkaiset',kivivartija:'kivivartija',vartija:'kalmanvartija',jaajattari:'jaatar',kalmaherra:'kalmaherra',aarnihirvio:'aarnihirvio'};
const TG_STRIDE={kaksijalkaiset:.75,luurangot:.75,nelijalkaiset:.9,raskaat_nelijalkaiset:1.15,kevyet_nelijalkaiset:.45,kevyet_kaksijalkaiset:.3,kivivartija:1,
  kalmanvartija:1.9,jaatar:1.6,kalmaherra:1.5,aarnihirvio:1.8};
const TG_BIG=new Set(['raskaat_nelijalkaiset','kivivartija','kalmanvartija','jaatar','kalmaherra','aarnihirvio']),TG_BOSS=new Set(['kalmanvartija','jaatar','kalmaherra','aarnihirvio']);
const TG_EAT={karju:'tonkiminen',emakko:'tonkiminen',porsas:'tonkiminen',susi:'rouskutus',routasusi:'rouskutus',kalmasusi:'rouskutus',karhu:'rouskutus',
  ahma:'rouskutus',peura:'laidun',poro:'laidun',hirvi:'laidun',janis:'nakerrus'};
const TG_SHAKE=new Set(['nelijalkaiset','raskaat_nelijalkaiset','kevyet_nelijalkaiset']),TG_RUSTLE={forest:1,koivu:1,aarni:1,suo:1};
const TGV={v:[],last:{},max:8,steps:6,loaded:{}};
// v2.17: pomot lainaavat yhteisestä pääkansiosta `pomot/` (sävel pomon mukaan), jos pomon omassa kansiossa ei ole samannimistä ääntä (oma voittaa).
// Raskaat nelijalkaiset (karhu, hiidenkarhu, hiidenhirvi) ovat oma ryhmänsä eivätkä liity pomoihin.
const TG_BORROW={kalmanvartija:'pomot',jaatar:'pomot',kalmaherra:'pomot',aarnihirvio:'pomot'},TG_BP={kalmanvartija:.85,jaatar:1.12,kalmaherra:.95,aarnihirvio:.9};
/* v2.21 KERROSTUS (käyttäjän päätös): raskaat ja kevyet eläimet, luurangot, kivivartija ja pomot soittavat pohjaryhmän äänen (TG_BASE, sävel ja
   voimakkuus TG_BASEP) ja oman samannimisen äänensä PÄÄLLE, jos sellainen on (pomoilla oma > pomot-kansio). Joka askeleella soi lisäksi
   ryhmän kerros TG_STEP_LAYER (tömistys / luurankojen kalina), ei uidessa (tömistys ei kahlatessa). Sama taulu tools/process_sounds.py:ssä. */
const TG_BASE={raskaat_nelijalkaiset:'nelijalkaiset',kevyet_nelijalkaiset:'nelijalkaiset',kevyet_kaksijalkaiset:'kaksijalkaiset',luurangot:'kaksijalkaiset',
  kivivartija:'kaksijalkaiset',kalmanvartija:'kaksijalkaiset',jaatar:'kaksijalkaiset',kalmaherra:'kaksijalkaiset',aarnihirvio:'kaksijalkaiset'};
const TG_BASEP={raskaat_nelijalkaiset:[.8,1],kevyet_nelijalkaiset:[1.3,.55],kevyet_kaksijalkaiset:[1.5,.45],luurangot:[1.05,.8],kivivartija:[.8,1],
  kalmanvartija:[.62,1],jaatar:[.75,1],kalmaherra:[.72,1],aarnihirvio:[.68,1]};
/* v2.22 OSUMAT JA TÖRMÄYKSET (käyttäjän päätös): osumaäänet omassa kansiossaan osumat/ kuuteen kategoriaan (TG_HIT: olento → kategoria;
   soi kun olento osuu pelaajaan, jousikalmon nuoli tai Jäätären kivi osuu, ja pelaajan nuoli osuu olentoon). Törmäykset tormaykset/-kansiossa:
   kevyt (tavalliset) ja raskas (raskaat, kivivartija, pomot) – kaikki lainaavat näistä kahdesta. */
const TG_HIT={hiisi:'isku',suonakki:'raapaisu',kalmo:'isku',ylimys:'isku',peura:'sarvet',poro:'sarvet',hirvi:'sarvet',hiidenhirvi:'sarvet',karju:'sarvet',
  emakko:'purema',porsas:'purema',susi:'purema',routasusi:'purema',kalmasusi:'purema',ahma:'purema',kettu:'purema',janis:'purema',ilves:'raapaisu',
  karhu:'raapaisu',hiidenkarhu:'raapaisu',metso:'isku',kivivartija:'murskaus',vartija:'murskaus',jaajattari:'murskaus',kalmaherra:'isku',aarnihirvio:'murskaus'};
function tgHit(cat,x,y,z,p){const q={x,y,z};return tgPlay({pos:q,dun:P.inDun,type:'_osuma'},'osuma_'+cat,'osumat',{pos:q,p:p||1},false);}
function tgHeavy(m){return TG_BIG.has(TG[m.type])||m.def.ai==='boss'||m.def.ai==='rboss';}
const TG_STEP_LAYER={raskaat_nelijalkaiset:'tomistys',kivivartija:'tomistys',luurangot:'kalina',kalmanvartija:'tomistys',jaatar:'tomistys',kalmaherra:'tomistys',aarnihirvio:'tomistys'};
function tgRes(g,ev){if(!CRE.man)return null;if(CRE.idxOf!==CRE.man)creIndex();return CRE.idx[`t/${g}/${ev}`]||null;}
function tgLoad(type){const g=TG[type];if(!CRE.ok||!g||TGV.loaded[g])return;TGV.loaded[g]=1;const b=TG_BORROW[g],ba=TG_BASE[g];for(const n in CRE.man)if(n.startsWith(`t/${g}/`)||n.startsWith('t/yhteiset/')||n.startsWith('t/osumat/')||n.startsWith('t/tormaykset/')||(b&&n.startsWith(`t/${b}/`))||(ba&&n.startsWith(`t/${ba}/`)))creBuf(n);}
function tgSize(m){return clamp(1.35-(m.def.r||.5)*.55,.6,1.4);}   // yhteisten äänten sävel koon mukaan
// soittaa ryhmän äänen 3D:nä olennon kohdalta (o: g ryhmä, v voimakkuus, p sävel, loop silmukka, pos kiinteä paikka). Palauttaa keston (silmukalla äänen), muuten false.
// v2.21: ilman o.g:tä kerrostuva ryhmä soittaa pohjaryhmän äänen + oman päälle (TG_BASE). Kerros (lay) ei kuluta äänibudjettia (yläraja 24 ääntä).
function tgSnd(m,ev,o){o=o||{};if(o.g)return tgPlay(m,ev,o.g,o,false);const g=TG[m.type];if(!g)return false;const b=TG_BASE[g];let r0=false;
  if(b){const q=TG_BASEP[g];r0=tgPlay(m,ev,b,Object.assign({},o,{p:(o.p||1)*q[0],v:(o.v??1)*q[1]}),false,g);}
  const r1=tgPlay(m,ev,g,o,!!r0);return r1||r0;}
function tgPlay(m,ev,g,o,lay,own){let L0=tgRes(g,ev),bp=1;if(!L0&&TG_BORROW[g]){L0=tgRes(TG_BORROW[g],ev);bp=TG_BP[g]||1;}if(!L0)return false;
  const L=L0.filter(n=>CRE.buf[n]);if(!L.length){for(const n of L0)creBuf(n);return false;}
  const a=actx;if(!a||a.state!=='running'||!soundOn)return false;const vol=typeof SET!=='undefined'?+SET.creVol:1;if(!(vol>0))return false;
  const step=ev.startsWith('askel_');let cnt=0;for(const v of TGV.v)if(v.step===step&&!v.lay)cnt++;if(lay?TGV.v.length>=24:cnt>=(step?TGV.steps:TGV.max))return false;
  const key=L0[0].replace(/_\d+$/,'');let pick=L;if(L.length>1&&TGV.last[key])pick=L.filter(x=>x!==TGV.last[key]);const name=pick[Math.random()*pick.length|0];TGV.last[key]=name;
  const B=CRE.buf[name],rate=(o.p||1)*bp*(1+(Math.random()*2-1)*.06),q=o.pos||m.pos,md=Math.sqrt(dist2(q.x,q.z,P.pos.x,P.pos.z)),k0=creDistK(md,false),big=TG_BIG.has(own||g);
  if(!CRE.gain){CRE.gain=a.createGain();CRE.gain.connect(a.destination);}CRE.gain.gain.value=vol;
  const src=a.createBufferSource();src.buffer=B;src.playbackRate.value=rate;if(o.loop){src.loop=true;const lp=tgLoopPts(B);src.loopStart=lp[0];src.loopEnd=lp[1];}
  const gn=a.createGain();gn.gain.value=o.v??1;const df=a.createBiquadFilter();df.type='lowpass';df.Q.value=.5;df.frequency.value=creLpf(k0);const dg=a.createGain();dg.gain.value=1-.3*k0;
  const pn=a.createPanner();pn.panningModel='equalpower';pn.distanceModel='inverse';pn.refDistance=big?5:step?1.6:2.4;pn.maxDistance=120;pn.rolloffFactor=step?1.4:1.1;
  src.connect(gn);gn.connect(df);df.connect(dg);dg.connect(pn);pn.connect(CRE.gain);crePos(pn,q.x,(q.y??m.pos.y)+.3,q.z);
  let sd=null,sdo=null;if(m.dun){const Rv=creRevOn(a);sd=a.createGain();sd.gain.value=big?.5:.35;pn.connect(sd);sd.connect(Rv.inp);}
  else if(!step&&md>8){const Rv=creRevOn(a);sd=sdo=a.createGain();sdo.gain.value=.08+1.8*k0;pn.connect(sdo);sdo.connect(Rv.inp);}
  const v={src,pn,g:gn,sd,sdo,df,dg,far:false,m,step,loop:!!o.loop,fixed:!!o.pos,ev,lay:!!lay};TGV.v.push(v);
  src.onended=()=>{const i=TGV.v.indexOf(v);if(i>=0)TGV.v.splice(i,1);try{pn.disconnect();}catch(e){}if(sd)try{sd.disconnect();}catch(e){}};src.start();return o.loop?v:B.duration/rate;}
// v2.22: silmukan sauma – mp3-pakkaus lisää alkuun ja loppuun täytehiljaisuutta; silmukka soi vain äänen kohdalta (ei hiljaista raoa)
function tgLoopPts(B){if(B._lp)return B._lp;const d=B.getChannelData(0),n=d.length,th=1e-4;let a=0,b=n-1;while(a<Math.min(n,8192)&&Math.abs(d[a])<th)a++;while(b>n-8192&&b>a&&Math.abs(d[b])<th)b--;
  return B._lp=[a/B.sampleRate,(b+1)/B.sampleRate];}
function tgStop(v){if(!v||!v.src)return;try{v.g.gain.setTargetAtTime(0,actx.currentTime,.08);v.src.stop(actx.currentTime+.35);}catch(e){}v.loop=false;}
// alusta olennon jalkojen alla (askeleet)
function tgSurface(m,g){if(m.dun)return m.realm==='portal1'?'jaa':m.realm==='portal3'?'ruoho':'kivi';
  const x=m.pos.x,z=m.pos.z,th=terrainH(x,z);
  if(m.pos.y>th+.15){gridQuery(x,z,.1,_cl);for(const c of _cl){if(c.t!=='b'||c.off)continue;if(x>=c.minX&&x<=c.maxX&&z>=c.minZ&&z<=c.maxZ&&Math.abs(c.maxY-m.pos.y)<.35){const o=c.owner;return o&&o.t&&PIECES[o.t]?(PIECES[o.t].stone?'kivi':'puu'):'kivi';}}}
  const dep=water.position.y-th;if(dep>.05)return dep>(TG_BIG.has(g)?1.1:g.startsWith('kevyet')?.3:.6)?'uinti':'kahlaus';
  const b=biomeAt(x,z,th);return b==='beach'?'hiekka':b==='mountain'||b==='rakka'?'kivi':b==='peak'?'lumi':b==='suo'?'suo':b==='aarni'?'pusikko':'ruoho';}
function tgStep(m,g,d,spd){const sf=tgSurface(m,g),run=spd>(m.def.walk||1.5)*1.4,sv=.55+.45*clamp(spd/(m.def.run||4),0,1);tgSnd(m,'askel_'+sf,{v:sv});
  {const ly=TG_STEP_LAYER[g];if(ly&&sf!=='uinti'&&!(ly==='tomistys'&&sf==='kahlaus'))tgPlay(m,ly,g,{v:ly==='kalina'?.7:sv},true);}   // v2.21: tömistys / kalina askeleen päälle
  if(sf==='pusikko'&&Math.random()<.15&&playTime-(m.okT??-9)>=2){m.okT=playTime;tgSnd(m,'oksa',{v:.45});}   // v2.21: hiljempaa (0,8 → 0,45), enintään 2 s välein
  if(run&&!m.dun&&TG_RUSTLE[biomeHere(m.pos.x,m.pos.z)]&&Math.random()<.35&&playTime-(m.khT??-9)>.7){m.khT=playTime;tgSnd(m,'kahina',{g:'yhteiset',p:tgSize(m),v:.8});}
  if(TG_BOSS.has(g)&&d<15)shake(.12*(1-d/15));}
function tgTick(dt){if(!CRE.ok||state!=='play')return;
  for(const v of TGV.v.slice()){const m=v.m;if(v.loop&&!mobs.includes(m)){tgStop(v);continue;}if(v.fixed)continue;crePos(v.pn,m.pos.x,m.pos.y+.3,m.pos.z);if(actx)creDistFx(v,Math.sqrt(dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z)));}
  const C=[];
  for(const m of mobs){const g=TG[m.type];if(!g||m.menu)continue;const d2=dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z);
    // palaminen: rätinä silmukkana niin kauan kuin olento palaa (myös tuhkaksi palaessa 2 s)
    const burning=(m.burnT>0||m.sunBurn||(m.dead&&m.ashDeath&&m.deadT<2))&&d2<45*45&&m.dun===P.inDun;
    if(burning&&!m.tgBurn){const v=tgSnd(m,'palaminen',{g:'yhteiset',loop:1,v:.8,p:tgSize(m)});if(v)m.tgBurn=v;}else if(!burning&&m.tgBurn){tgStop(m.tgBurn);m.tgBurn=null;}
    if(m.shakeT>0){m.shakeT-=dt;m.f.g.rotation.z=m.shakeT>0?Math.sin(m.shakeT*42)*.2*Math.min(1,m.shakeT/.25):0;}
    if(m.dead||m.dun!==P.inDun||m.born!==undefined)continue;
    const px=m.tgX??m.pos.x,pz=m.tgZ??m.pos.z,mv=Math.hypot(m.pos.x-px,m.pos.z-pz);m.tgX=m.pos.x;m.tgZ=m.pos.z;if(mv>3)continue;const spd=mv/Math.max(dt,1e-3);
    if(d2<40*40&&!m.dun&&!m.fly){const dep=water.position.y-terrainH(m.pos.x,m.pos.z),wet=dep>.2;
      if(wet&&!m.tgWet){m.tgWet=1;tgSnd(m,'loiskahdus',{g:'yhteiset',p:tgSize(m)});}
      else if(m.tgWet&&dep<0){m.tgWet=0;if(TG_SHAKE.has(g)){m.shakeT=.7;tgSnd(m,'ravistus');}}}
    m.tgAcc=(m.tgAcc||0)+mv;const st=TG_STRIDE[g]*(spd>(m.def.walk||1.5)*1.4?1.25:1);
    if(m.tgAcc>=st){m.tgAcc=Math.min(m.tgAcc-st,st);const R=TG_BIG.has(g)?40:20;if(d2<R*R&&!m.fly)C.push([d2,m,g,spd]);}}
  C.sort((a,b)=>a[0]-b[0]);for(let i=0;i<C.length&&i<TGV.steps;i++)tgStep(C[i][1],C[i][2],Math.sqrt(C[i][0]),C[i][3]);}
