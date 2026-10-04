/* Hiidenmaa – audio.js
   Proseduraaliset ääniefektit (WebAudio) */
'use strict';

/* ---------------- AUDIO ---------------- */
let actx=null, soundOn=true;
function audio(){if(!actx){try{actx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}return actx;}
function sfx(type){
  if(!soundOn)return;const a=audio();if(!a||a.state!=='running'){if(a)a.resume();if(!a||a.state!=='running')return;}
  const t=a.currentTime,o=a.createGain();o.connect(a.destination);
  const noise=(dur,f0,f1,vol,q=1)=>{const b=a.createBuffer(1,a.sampleRate*dur|0,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.Q.value=q;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);s.connect(f);f.connect(o);o.gain.setValueAtTime(vol,t);o.gain.exponentialRampToValueAtTime(.001,t+dur);s.start(t);};
  const tone=(f0,f1,dur,vol,type='sine')=>{const s=a.createOscillator();s.type=type;s.frequency.setValueAtTime(f0,t);s.frequency.exponentialRampToValueAtTime(f1,t+dur);s.connect(o);o.gain.setValueAtTime(vol,t);o.gain.exponentialRampToValueAtTime(.001,t+dur);s.start(t);s.stop(t+dur);};
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
  }
}
