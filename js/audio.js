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
