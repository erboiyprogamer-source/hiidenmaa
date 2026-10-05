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
    case 'bow':tone(300,120,.15,.18,'triangle');break;
    case 'roar':tone(110,45,1.2,.4,'sawtooth');break;
    case 'slam':noise(.5,300,60,.6,1);tone(80,30,.5,.4,'sine');break;
    case 'die':tone(300,80,.4,.2,'triangle');break;
    // viimeinen kirveenisku ennen kuin runko katkeaa: hieman kimeämpi ja terävämpi, perään ritinä
    case 'chopFinal':noise(.1,620,230,.42,3);tone(215,105,.1,.2,'triangle');noise(.22,1500,500,.16,2,.06);break;
    // tukin hakkuu: ontompi ja hieman matalampi kuin pystypuu
    case 'chopLog':noise(.11,420,150,.4,3);tone(150,80,.12,.2,'triangle');break;
    case 'logBreak':noise(.16,700,200,.42,2.5);noise(.3,1200,300,.18,1.5,.05);tone(130,60,.2,.22,'triangle');break;
    // kaatuneen puun tömähdys maahan: matala jytinä ja maan rapina
    case 'thud':noise(.7,180,40,.65,.9);tone(70,28,.65,.5,'sine');noise(.35,900,250,.12,1,.05);break;
    case 'rockBreak':noise(.35,2200,400,.38,2);noise(.5,400,90,.4,1,.04);tone(110,45,.3,.22,'sine');break;
    case 'crumble':noise(.6,500,70,.55,1);noise(.4,1800,500,.2,1.5,.08);tone(80,32,.5,.35,'sine');break;
    case 'woodBreak':noise(.25,800,200,.45,2);noise(.35,350,80,.3,1,.05);break;
  }
}
