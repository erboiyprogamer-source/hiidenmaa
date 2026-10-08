/* Hiidenmaa – audio.js
   Proseduraaliset ääniefektit (WebAudio) */
'use strict';

/* ---------------- AUDIO ---------------- */
let actx=null, soundOn=true;
function audio(){if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}return actx;}
// sfx(nimi, sävelkerroin = 1, voimakkuus = 1). Jokaisella soitolla sävelkorkeus vaihtelee satunnaisesti ±3,5 % (elävämpi toisto:
// jokainen kirveen- tai hakunisku kuulostaa hieman erilaiselta). Viimeinen isku ja tuhoutuminen omilla äänillään (chopFinal, logBreak, rockBreak, crumble),
// kaatuneen puun tömähdys matala (thud, sävel puun koon mukaan, voimakkuus etäisyyden mukaan).
function sfx(type,pitch=1,vol=1){
  if(!soundOn)return;const a=audio();if(!a||a.state!=='running'){if(a)a.resume();if(!a||a.state!=='running')return;}
  const t=a.currentTime,o=a.createGain();o.connect(a.destination);const R=pitch*(1+(Math.random()*2-1)*.035);
  const noise=(dur,f0,f1,vol0,q=1,at=0)=>{const g=a.createGain();g.connect(o);const b=a.createBuffer(1,a.sampleRate*dur|0,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;s.playbackRate.value=Math.min(4,R);const f=a.createBiquadFilter();f.type='bandpass';f.Q.value=q;f.frequency.setValueAtTime(f0*R,t+at);f.frequency.exponentialRampToValueAtTime(Math.max(20,f1*R),t+at+dur);s.connect(f);f.connect(g);g.gain.setValueAtTime(vol0*vol,t+at);g.gain.exponentialRampToValueAtTime(.001,t+at+dur);s.start(t+at);};
  const tone=(f0,f1,dur,vol0,type='sine',at=0)=>{const g=a.createGain();g.connect(o);const s=a.createOscillator();s.type=type;s.frequency.setValueAtTime(f0*R,t+at);s.frequency.exponentialRampToValueAtTime(Math.max(20,f1*R),t+at+dur);s.connect(g);g.gain.setValueAtTime(vol0*vol,t+at);g.gain.exponentialRampToValueAtTime(.001,t+at+dur);s.start(t+at);s.stop(t+at+dur);};
  switch(type){
    case 'swing':noise(.18,2200,500,.12,.8);break;
    case 'hit':noise(.12,900,200,.35,2);break;
    case 'chop':noise(.1,500,180,.4,3);tone(180,90,.1,.2,'triangle');break;
    case 'pick':noise(.08,3000,1500,.3,5);tone(900,600,.06,.08,'square');break;
    case 'pickup':tone(660,990,.09,.1,'triangle');break;
    case 'hurt':tone(220,90,.25,.25,'sawtooth');break;
    case 'block':noise(.1,1800,900,.3,4);tone(400,300,.08,.12,'square');break;
    case 'build':noise(.09,400,150,.45,2);break;
    case 'eat':noise(.15,1200,700,.15,1.5);break;
    case 'craft':tone(440,660,.12,.1,'triangle');break;
    case 'howl':tone(280,520,1.4,.09,'sine');tone(520,240,1.8,.08,'sine',1.3);tone(140,260,1.6,.03,'triangle',.2);break; // v0.88 kalmasuden ulvonta
    case 'flap':for(let i=0;i<6;i++)noise(.07,1400,500,.16-i*.018,1.2,i*.075);break; // v0.85 metson lehahdus
    case 'discover':tone(392,392,1.1,.06,'sine');tone(587,587,1.3,.05,'sine',.18);tone(784,784,1.6,.035,'sine',.36);break; // v0.82 uusi alue: hiljainen kolmisointu
    case 'bow':tone(300,120,.15,.18,'triangle');break;
    case 'roar':tone(110,45,1.2,.4,'sawtooth');break;
    case 'slam':noise(.5,300,60,.6,1);tone(80,30,.5,.4,'sine');break;
    case 'die':tone(300,80,.4,.2,'triangle');break;
    // Puun ja tukin äänet (v0.71, käyttäjän toive): jokainen isku on sama kirveenisku (sävel vaihtelee joka lyönnillä). Viimeinen isku
    // pystypuuhun on lähes sama, vain hiljainen ritinä perään. Tukin viimeinen isku = sama isku + pehmeä tumma tömähdys.
    case 'chopFinal':noise(.1,500,180,.4,3);tone(180,90,.1,.2,'triangle');noise(.3,700,250,.05,1.5,.06);break;
    case 'chopLog':noise(.1,500,180,.4,3);tone(180,90,.1,.2,'triangle');break;
    case 'logBreak':noise(.1,500,180,.4,3);tone(180,90,.1,.2,'triangle');noise(.38,170,45,.38,.9,.05);tone(72,32,.32,.26,'sine',.05);break;
    // kaatuneen puun tömähdys maahan: tumma matala jytinä
    case 'thud':noise(.7,170,38,.65,.9);tone(66,26,.7,.5,'sine');noise(.4,380,110,.1,1,.05);break;
    // kiven viimeinen isku = sama hakkuääni + pehmeä tumma murtuminen
    case 'rockBreak':noise(.08,3000,1500,.3,5);tone(900,600,.06,.08,'square');noise(.45,300,70,.35,1,.05);tone(90,38,.3,.2,'sine',.05);break;
    case 'crumble':noise(.6,500,70,.55,1);noise(.4,1800,500,.2,1.5,.08);tone(80,32,.5,.35,'sine');break;
    case 'woodBreak':noise(.25,800,200,.45,2);noise(.35,350,80,.3,1,.05);break;
  }
}

/* ---------------- OLENTOJEN ÄÄNET (v1.84, äänierä A – ks. KEHITYSMUISTIO "Äänisuunnitelma", sounds/AANILISTA.md) ----------------
   Tiedostoäänet sounds/<id>_<laji>_<n>.mp3 (käsitelty tools/process_sounds.py:llä; peli lukee vain manifest.json:ssa olevat).
   Lajit: idle (1–2), hurt, death, aggro (hyökkäävät). Laiska lataus kun olento ilmestyy, 3D-ääni (PannerNode), sävel ±6 %.
   VARAANI: väliaikainen varaääniketju, jos olennolla ei ole omaa ääntä (to = mistä, p = sävelkerroin). Ketju seurataan useampi
   askel (kerroin kertautuu). Jos idle_2 puuttuu → idle_1. Jos mitään ei löydy → tehty ääni (sfx) tai hiljaisuus.
   Lohko VARAANI-ALKU…LOPPU on tiukkaa JSONia: tools/process_sounds.py lukee sen taulukkoa varten – pidä muoto. */
const VARAANI=/*VARAANI-ALKU*/{
  "kalmasusi":{"to":"susi","p":0.88},"routasusi":{"to":"susi","p":1.06},"kettu":{"to":"susi","p":1.35},"janis":{"to":"kettu","p":1.2},
  "ilves":{"to":"susi","p":1.15},"ahma":{"to":"ilves","p":1.1},
  "emakko":{"to":"karju","p":1.08},"porsas":{"to":"karju","p":1.5},
  "hiidenkarhu":{"to":"karhu","p":0.85},
  "hiidenhirvi":{"to":"hirvi","p":0.82},"poro":{"to":"peura","p":0.9},"peura":{"to":"hirvi","p":1.3},
  "ylimys":{"to":"kalmo","p":0.85},"vartija":{"to":"kalmo","p":0.6},"kivivartija":{"to":"vartija","p":1.15},
  "jaajattari":{"to":"aarnihirvio","p":1.2},"kalmaherra":{"to":"aarnihirvio","p":0.85},"suonakki":{"to":"hiisi","p":0.7}
}/*VARAANI-LOPPU*/;
const CRE_AGGRO=['neutral','hostile','boss','rboss'];   // niillä on suuttumisääni (aggro)
const CRE_CHASE=['hostile','boss','rboss'];             // niillä on lisäksi toistuva jahtiääni (chase) ja suuttumisääni vain kerran
const CRE_KINDS=['idle','hurt','death','aggro','chase'];  // jokaisella lajilla 1–3 versiota (_1.._3), arvonta niistä jotka ovat olemassa
const CRE={man:null,ok:false,buf:{},load:{},want:{},gain:null,voices:[],max:10,last:{},lastAmb:-9,rev:null};
// manifest kerran (tiiviste osoitteessa → välimuisti ei anna vanhaa ääntä). Ilman palvelinta (file://) epäonnistuu hiljaa.
function creInit(){if(CRE.man)return;CRE.man={};
  try{fetch('sounds/manifest.json?v='+(window.HV||'')).then(r=>r.ok?r.json():null).then(j=>{CRE.man=(j&&j.sounds)||{};CRE.ok=true;for(const t in CRE.want)creLoad(t);}).catch(()=>{});}catch(e){}}
// ratkaisee lajin äänet: omat versiot (_1.._3, vain olemassa olevat) → muuten varaääniketju. Palauttaa {names:[…], p} tai null.
function creRes(id,kind){const M=CRE.man;if(!M)return null;let cur=id,p=1;
  for(let d=0;d<6&&cur;d++){const L=[1,2,3].map(n=>`${cur}_${kind}_${n}`).filter(a=>M[a]);if(L.length)return{names:L,p};const v=VARAANI[cur];if(!v)break;p*=v.p;cur=v.to;}
  return null;}
function creBuf(name){if(CRE.buf[name]||CRE.load[name])return;const a=audio(),e=CRE.man&&CRE.man[name];if(!a||!e)return;
  CRE.load[name]=fetch(`sounds/${name}.mp3?h=${e.h}`).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer();}).then(b=>a.decodeAudioData(b)).then(B=>{CRE.buf[name]=B;}).catch(()=>{});}
// laiska lataus: olennon kaikki äänet (myös varaäänet) haetaan kun se ilmestyy ensimmäisen kerran
function creLoad(type){creInit();CRE.want[type]=1;if(!CRE.ok)return;const ai=typeof MOBDEF!=='undefined'&&MOBDEF[type]&&MOBDEF[type].ai;
  for(const k of CRE_KINDS){if(k==='aggro'&&!CRE_AGGRO.includes(ai))continue;if(k==='chase'&&!CRE_CHASE.includes(ai))continue;const r=creRes(type,k);if(r)for(const n of r.names)creBuf(n);}}
function crePos(pn,x,y,z){if(pn.positionX){pn.positionX.value=x;pn.positionY.value=y;pn.positionZ.value=z;}else pn.setPosition(x,y,z);}
// ---- toistosäännöt (v1.86) ----
// Tärkeys: kuolema 5 > osuma 4 > suuttuminen 3 > jahti 2 > rauhallinen 1. Yhdellä olennolla soi kerrallaan vain yksi ääni
// (tärkeämpi katkaisee heikomman nopealla häivytyksellä, heikompi ei katkaise vahvempaa). Kuolema vaientaa olennon muut äänet.
// Kaikkiaan enintään CRE.max ääntä: täyden ollessa uusi syrjäyttää heikoimman (tasatilanteessa kaukaisimman), tai jää pois jos on heikompi kuin kaikki.
// Rauhallisia ja jahtiääniä saa samaa lajia soida enintään 3, ja uusi alkaa aikaisintaan 0,3 s edellisen jälkeen (ei kuoroa).
// Sama versio ei toistu heti perään (jos versioita on useita).
const CRE_PRI={idle:1,chase:2,aggro:3,hurt:4,death:5},CRE_G={idle:.75,chase:.9,aggro:1,hurt:1,death:1};
// Kaiku (vain ulottuvuuksien ja luolaston olennoille m.dun): yksi yhteinen ConvolverNode + proseduraalinen vastaus (1,2 s; ConvolverNode vaatii saman näytetaajuuden kuin ääni-AudioContext),
// pimeä (alipäästö 3,2 kHz). Kytkeytyy vain kun jokin kaiullinen ääni soi ja irtoaa 3 s sen jälkeen → ei kuormaa maailmassa.
function creRevMake(a){if(CRE.rev)return CRE.rev;const sr=a.sampleRate,len=Math.floor(sr*1.2),buf=a.createBuffer(2,len,sr);
  for(let c=0;c<2;c++){const d=buf.getChannelData(c);let lp=0,seed=1234+c*777;for(let i=0;i<len;i++){seed=(seed*1664525+1013904223)>>>0;const n=seed/2147483648-1,t=i/len;
    lp+=(n-lp)*(.85-.6*t);d[i]=lp*Math.pow(1-t,2.6)*(i<sr*.012?i/(sr*.012):1);}}
  const cv=a.createConvolver();cv.normalize=true;cv.buffer=buf;const inp=a.createGain(),lp=a.createBiquadFilter(),out=a.createGain();lp.type='lowpass';lp.frequency.value=3200;out.gain.value=.9;
  inp.connect(lp);lp.connect(cv);cv.connect(out);CRE.rev={inp,cv,out,on:false,t:0};return CRE.rev;}
function creRevOn(a){const R=creRevMake(a);R.t=3;if(!R.on){R.out.connect(CRE.gain);R.on=true;}return R;}
function creRevTick(dt){const R=CRE.rev;if(!R||!R.on)return;if(CRE.voices.some(v=>v.sd)){R.t=3;return;}R.t-=dt;if(R.t<=0){try{R.out.disconnect();}catch(e){}R.on=false;}}
function creStop(v,t){try{v.g.gain.setTargetAtTime(0,actx.currentTime,.03);v.src.stop(actx.currentTime+(t||.12));}catch(e){}}
// o (valinnainen): {p: sävelkerroin, v: voimakkuuskerroin, pri: tärkeys, key: oma laskuriavain} – esim. palavan pomon kipuääni.
// soittaa olennon äänen 3D:nä (arpoo ladatuista versioista). Palauttaa äänen keston sekunteina, jos olennolla on tiedostoääni
// (silloin tehtyä ääntä ei soiteta), muuten false (ei ääntä tai vielä latautumassa).
function creSnd(m,kind,o){if(!m)return false;const r=creRes(m.type,kind);if(!r)return false;
  const L=r.names.filter(n=>CRE.buf[n]);if(!L.length){for(const n of r.names)creBuf(n);return false;}
  const key=m.type+'_'+(o&&o.key||kind);let pick=L;if(L.length>1&&CRE.last[key])pick=L.filter(n=>n!==CRE.last[key]);
  const name=pick[Math.random()*pick.length|0],B=CRE.buf[name],rate=r.p*(o&&o.p||1)*(1+(Math.random()*2-1)*.06),dur=B.duration/rate;
  const a=actx;if(!a||a.state!=='running'||!soundOn)return dur;const vol=typeof SET!=='undefined'?+SET.creVol:1;if(!(vol>0))return dur;
  const pri=o&&o.pri||CRE_PRI[kind]||1,now=a.currentTime,amb=pri<=2,boss=m.def.ai==='boss'||m.def.ai==='rboss';
  if(!CRE.gain){CRE.gain=a.createGain();CRE.gain.connect(a.destination);}CRE.gain.gain.value=vol;
  // olennon oma ääni: heikompi ei katkaise, samanarvoinen vasta kun edellinen on soinut hetken
  for(const v of CRE.voices)if(v.m===m){if(v.pri>pri||(v.pri===pri&&now-v.t0<.35))return dur;}
  if(amb){if(now-CRE.lastAmb<.3)return dur;let n=0;for(const v of CRE.voices)if(v.key===key)n++;if(n>=3)return dur;}
  for(const v of CRE.voices.slice())if(v.m===m){creStop(v);CRE.voices.splice(CRE.voices.indexOf(v),1);}
  if(CRE.voices.length>=CRE.max){let w=null,wd=-1;for(const v of CRE.voices){const d=dist2(v.m.pos.x,v.m.pos.z,P.pos.x,P.pos.z);if(!w||v.pri<w.pri||(v.pri===w.pri&&d>wd)){w=v;wd=d;}}
    if(!w||w.pri>pri)return dur;creStop(w,.08);CRE.voices.splice(CRE.voices.indexOf(w),1);}
  if(amb)CRE.lastAmb=now;CRE.last[key]=name;
  const src=a.createBufferSource(),g=a.createGain(),pn=a.createPanner();src.buffer=B;src.playbackRate.value=rate;
  pn.panningModel='equalpower';pn.distanceModel='inverse';pn.refDistance=boss?8:3;pn.maxDistance=90;pn.rolloffFactor=1.1;
  g.gain.value=(CRE_G[kind]||1)*(o&&o.v||1);src.connect(g);g.connect(pn);pn.connect(CRE.gain);crePos(pn,m.pos.x,m.pos.y+(m.def.r||.5)*1.6,m.pos.z);
  let sd=null;if(m.dun){const R=creRevOn(a);sd=a.createGain();sd.gain.value=m.def.ai==='rboss'?.75:boss?.6:.45;pn.connect(sd);sd.connect(R.inp);}
  const v={src,pn,g,sd,m,pri,t0:now,key};CRE.voices.push(v);src.onended=()=>{const i=CRE.voices.indexOf(v);if(i>=0)CRE.voices.splice(i,1);try{pn.disconnect();}catch(e){}if(sd)try{sd.disconnect();}catch(e){}};src.start();return dur;}
// joka ruutu: kuuntelija = kamera, soivat äänet seuraavat olentoa; idle 6–15 s välein alle 25 m päässä, aggro kerran jahdin alkaessa
const _creF=new THREE.Vector3();
function creTick(dt){const a=actx;if(!a||a.state!=='running'||typeof camera==='undefined')return;const L=a.listener,c=camera.position;camera.getWorldDirection(_creF);
  if(L.positionX){L.positionX.value=c.x;L.positionY.value=c.y;L.positionZ.value=c.z;L.forwardX.value=_creF.x;L.forwardY.value=_creF.y;L.forwardZ.value=_creF.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0;}
  else{L.setPosition(c.x,c.y,c.z);L.setOrientation(_creF.x,_creF.y,_creF.z,0,1,0);}
  creRevTick(dt);
  for(const v of CRE.voices)if(!v.m.dead)crePos(v.pn,v.m.pos.x,v.m.pos.y+(v.m.def.r||.5)*1.6,v.m.pos.z);
  if(state!=='play'||!soundOn)return;
  for(const m of mobs){if(m.dead)continue;const d2=dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z),ai=m.def.ai,hs=CRE_CHASE.includes(ai),chasing=m.state==='chase',hasChase=hs&&chasing&&creRes(m.type,'chase');
    // rauhallinen ääntely 6–15 s välein alle 25 m päässä (ei jahdin aikana, jos olennolla on jahtiääni)
    if(m.sndT===undefined)m.sndT=2+Math.random()*13;m.sndT-=dt;if(m.sndT<=0){m.sndT=6+Math.random()*9;if(d2<25*25&&m.state!=='sleep'&&!hasChase)creSnd(m,'idle');}
    if(hs){
      // vihamielinen / pomo: suuttumisääni VAIN KERRAN olennon elinaikana (kun huomaa sinut ensimmäistä kertaa); jos sitä ei ole, ei erillistä ääntä
      // vaan jahtiääni alkaa heti. Sen jälkeen jahtiääni toistuu 4–9 s välein kun olento jahtaa sinua.
      if(chasing||m.state==='intro'){
        if(!m.angerDone){m.angerTry=(m.angerTry||0)+dt;const has=creRes(m.type,'aggro');
          if(!has||m.angerTry>3){m.angerDone=1;m.chT=0;}
          else{const dur=d2<70*70?creSnd(m,'aggro'):0;if(dur){m.angerDone=1;m.chT=dur+1+Math.random()*2;}else if(d2>=70*70){m.angerDone=1;m.chT=0;}}}
        else if(!m.inChase)m.chT=1+Math.random()*2;
        m.inChase=1;
        if(chasing&&m.angerDone){m.chT-=dt;if(m.chT<=0){m.chT=4+Math.random()*5;if(d2<55*55)creSnd(m,'chase');}}
      }else m.inChase=0;
    }else if(ai==='neutral'){
      // neutraali: suuttumisääni aina kun suuttuu (uusi vasta 5 s jahdin päättymisen jälkeen), ei jahtiääntä
      if(chasing){m.sndOff=0;if(!m.sndAg){m.sndAg=1;if(d2<70*70)creSnd(m,'aggro');}}else if(m.sndAg){m.sndOff=(m.sndOff||0)+dt;if(m.sndOff>5)m.sndAg=0;}
    }}}
