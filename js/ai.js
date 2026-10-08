/* Hiidenmaa – ai.js
   Vihollisten tekoäly, pomon hyökkäykset, spawneri, asemien päivitys */
'use strict';

/* ---------------- MOB UPDATE ---------------- */
// v1.33 (lista 3, kohta 14): lyönti lähtee 0,1 s viiveellä (ennen d.wind 0,4–0,8 s paikallaan seisten); lyöntien välissä jäähy d.cd.
const MOB_WIND=.1;
const _hitl=[];
// Tulenarat viholliset: palava nuotio/grilli (7 m), seisova soihtu (5 m) ja pelaajan kädessä oleva soihtu (6 m; ei luolastossa). Lista päivittyy 0,4 s välein.
let fireSrc=[],fireT=0;
function refreshFire(dt){fireT-=dt;if(fireT>0)return;fireT=.4;fireSrc.length=0;
  for(const p of pieces){if(isFirePiece(p.t)&&p.data.fuel>0)fireSrc.push({x:p.x,z:p.z,r:7});else if((p.t==='soihtuteline'||p.t==='seinasoihtu')&&p.data.burn>0)fireSrc.push({x:p.x,z:p.z,r:5});}
  if(torchLit()&&!P.inDun)fireSrc.push({x:P.pos.x,z:P.pos.z,r:6,torch:1});}
// Lähin avaus (ovi tai ikkuna), jonka mobi voi hajottaa päästäkseen pelaajan luo.
function nearestOpening(m){let best=null,bd=1e9;for(const p of pieces){const b=bt(p.t);if((b!=='ovi'&&b!=='ikkunaseina')||PIECES[p.t].mobProof||(b==='ovi'&&p.data.open))continue;
  const d=dist2(p.x,p.z,m.pos.x,m.pos.z);if(d<bd&&d<35*35&&dist2(p.x,p.z,P.pos.x,P.pos.z)<28*28){bd=d;best=p;}}return best;}
function updateMobs(dt){
  refreshFire(dt);
  for(let i=mobs.length-1;i>=0;i--){const m=mobs[i];HURT_K=m.def.ai==='boss'||m.def.ai==='rboss'?1.2:m.guard?1.8:1;
    if(m.dead){if(m.fireFx)stopBurn(m);m.deadT+=dt;if(mobDeathAnim(m,dt))mobRemove(m);continue;}   // v1.37 (kohta 23b): lössähtäminen / tuhka, < 10 s
    const d=m.def,dx=P.pos.x-m.pos.x,dz=P.pos.z-m.pos.z,dist=Math.hypot(dx,dz);
    if(!m.dun&&m!==boss&&dist>120){mobRemove(m);continue;}
    // Piirtoetäisyyden ulkopuolella (sumun takana) mobia ei piirretä eikä animoida
    if(m!==boss&&!m.dun){const far=dist>scene.fog.far+8;if(far!==!m.f.g.visible){m.f.g.visible=!far;}if(far){m.f.g.position.copy(m.pos);}}
    if(m.dun!==P.inDun){continue;}
    m.flash=Math.max(0,m.flash-dt);for(const mt of m.mats)mt.emissive.setHex(m.flash>0?0x661111:0x000000);
    if(m.burnT>0&&updateBurn(m,dt))continue;
    if(!m.dun&&!m.dead&&sunBurnAI(m,dt))continue;   // v1.50 yöolennot palavat auringossa
    if(!(m.burnT>0)&&!m.dun)for(const s of fireSrc)if(!s.torch&&s.r===7&&dist2(s.x,s.z,m.pos.x,m.pos.z)<.8*.8){igniteMob(m);break;}   // v1.37: nuotioon astuva syttyy
    m.atkCd-=dt;
    // v1.31: tönäisty vihollinen on kyvytön lennon ajan (ei kävele eikä lyö; isku keskeytyy)
    if(d.ai!=='boss'&&d.ai!=='rboss'&&Math.hypot(m.vel.x,m.vel.z)>.5){m.wind=0;moveMob(m,0,0,0,dt);animMob(m,dt);continue;}
    let tx=0,tz=0,spd=0;
    // v1.33 (lista 3, kohta 7): pomo, johon ei ole osuttu minuuttiin, paranee täyteen noin 10 sekunnissa.
    // v1.39 (lista 4, kohta 19): Aarnihirviö 1,7 min jälkeen hitaasti (1 %/s)
    if((d.ai==='boss'||d.ai==='rboss')&&m.hp<m.maxHp&&!bossTired(m.type)){   // v1.81: 3 kuolemaa samalle pomolle → ei enää parane
     const ar=m.type==='aarnihirvio';if(playTime-m.lastHit>(ar?102:60))m.hp=Math.min(m.maxHp,m.hp+m.maxHp*(ar?.01:.1)*dt);}
    if(m.f.fx)m.f.fx(dt,m);   // v1.93: pomomallin elävät osat (Ultralla silmäliekit ja leijuvat palat, bossmodels.js)
    if(d.ai==='boss'){bossAI(m,dt,dx,dz,dist);continue;}
    if(d.ai==='rboss'){realmBossAI(m,dt,dx,dz,dist);continue;}
    const night=isNight()&&!P.inDun;
    const hostile=d.ai==='hostile'||(d.ai==='neutral'&&m.angry);
    const aggroR=(d.aggro||12)*(night?1.35:1)*(P.crouch?.5:1);
    // Näköyhteys (välimuistissa, tarkistus ~5 kertaa sekunnissa): ilman sitä ei aloiteta eikä jatketa jahtia.
    m.losT=(m.losT||0)-dt;if(m.losT<=0){m.losT=.2+Math.random()*.1;m.los=dist<45&&losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z);}
    m.noLos=m.state==='chase'&&!m.los?(m.noLos||0)+dt:0;
    // Pelko: tuli ja soihtu ajavat kaikki viholliset ja eläimet pois päin (myös vihaiset). Vartija ja ylimys eivät pelkää.
    if(m.type!=='ylimys'&&!m.guard){let fs=null,fd=1e9;   // v1.39: vartijat eivät pelkää tulta (pomot käsitellään ennen tätä)
     for(const s of fireSrc){if(s.torch&&m.dun)continue;const dd=dist2(s.x,s.z,m.pos.x,m.pos.z);if(dd<s.r*s.r&&dd<fd){fd=dd;fs=s;}}
      if(fs){m.fearT=1;m.siege=null;}}
    if(m.fearT>0){m.fearT-=dt;m.wind=0;m.state='flee';let fx=m.pos.x,fz=m.pos.z,fd=1e9;for(const s of fireSrc){const dd=dist2(s.x,s.z,m.pos.x,m.pos.z);if(dd<fd){fd=dd;fx=s.x;fz=s.z;}}
      moveMob(m,m.pos.x-fx,m.pos.z-fz,d.run,dt);animMob(m,dt);if(m.fearT<=0)m.state='idle';continue;}
    // Vartijat pysyvät paikallaan: jos ne ajautuvat liian kauas (säde guard.r), ne palaavat takaisin ja paranevat.
    // v0.97 (kohta 12): alue ×2. Alueen rajalla vartija ei seuraa pidemmälle vaan jää rajalle seisomaan ja taistelemaan; 1–10 s (arvottu)
    // kuluttua se alkaa palata alueelleen (ja paranee kuten ennen), kunnes huomaa pelaajan taas alueen sisällä.
    let atBorder=false;
    if(m.guard){const gx=m.guard.x-m.pos.x,gz=m.guard.z-m.pos.z,gd=Math.hypot(gx,gz),pIn=dist2(P.pos.x,P.pos.z,m.guard.x,m.guard.z)<m.guard.r*m.guard.r;
      // v1.09 (lista 2, kohta 2): paluu kävellen (d.walk, esim. 20 m ≈ 10 s), paranee vain 1 %/s. Paluu keskeytyy, jos pelaaja tulee
      // alle 8 m päähän (myös alueen ulkopuolella) tai näkyy alueen sisällä. Keskeytyksen jälkeen (m.intr) vartija taistelee alueen
      // ulkopuolellakin niin kauan kuin pelaaja on alle 8 m päässä; kun pelaaja on kauempana, arvotaan uusi 1–10 s paluuajastin.
      if(m.ret&&!P.dead&&(dist<8||pIn&&m.los&&dist<(d.aggro||12)*1.35)){m.ret=false;m.retT=0;m.intr=gd>m.guard.r;m.state='chase';}
      const engaged=m.intr&&dist<8&&!P.dead;
      if(!m.ret&&gd>m.guard.r&&!engaged){atBorder=true;if(!(m.retT>0))m.retT=1+Math.random()*9;m.retT-=dt;if(m.retT<=0||P.dead){m.ret=true;m.retT=0;m.intr=false;}}
      else if(engaged)m.retT=0;
      else if(!m.ret&&gd<m.guard.r*.9){m.retT=0;m.intr=false;}
      if(m.ret){m.state='idle';m.wind=0;if(gd<3)m.ret=false;else{moveMob(m,gx,gz,d.walk||d.run*.5,dt);animMob(m,dt);m.hp=Math.min(m.maxHp,m.hp+m.maxHp*.01*dt);continue;}}}
    const hurt=playTime-m.lastHit<10;
    // Paikallaan oleville vaikeille vihollisille: iskuttomana 30 s → parantuvat hitaasti (1 %/s).
    if(d.regen){if(playTime-m.lastHit>d.regen.after&&m.hp<m.maxHp)m.hp=Math.min(m.maxHp,m.hp+m.maxHp*d.regen.rate*dt);}
    else if((MOB_SKULL[m.type]||0)>=3&&playTime-m.lastHit>30&&m.hp<m.maxHp)m.hp=Math.min(m.maxHp,m.hp+m.maxHp*.01*dt);
    if(d.stalk){if(stalkAI(m,dt,dx,dz,dist,hurt))continue;}
    if(d.temper){if(temperAI(m,dt,dx,dz,dist,hurt,night))continue;}
    else if(m.mom&&!m.mom.dead&&m.state!=='flee'&&dist2(m.pos.x,m.pos.z,m.mom.pos.x,m.mom.pos.z)>16){m.wander={x:m.mom.pos.x+(Math.random()-.5)*3,z:m.mom.pos.z+(Math.random()-.5)*3};m.t=1.5;}  // porsas seuraa emoa
    if(d.ai==='flee'){// säikähdysetäisyys: kävely 7 m, juoksu 16 m, ase kädessä ×1.4. Vahingoitettu pelkää 10 s.
      // Kyykyssä (v0.70): paikallaan ei huomata lainkaan; hiipiessä vain 1,5 m (eläin katsoo pelaajaa kohti) tai 0,9 m (selin), jotta
      // hiiviskelyisku ylettyy (aseen ulottuma ~2,3 m). Ennen kyykky = 3,5 m ja alle 4 m aina → eläin pakeni ennen kuin ylettyi lyömään.
      const w=curWeapon(),armed=(w.cat==='weapon'||w.cat==='bow')&&!P.crouch,mv=Math.hypot(P.vel.x,P.vel.z)>.3,face=(Math.sin(m.yaw)*dx+Math.cos(m.yaw)*dz)/(dist||1)>0;
      const pr=d.per||{};const hid=P.crouch||playTime-(P.uncrouchT||-9)<.1;let sr=hid?0:P.running?16:7;   /* v1.39 (lista 4, kohta 1): kyykyssä ei huomata lainkaan; noustessa 0,1 s viive */if(armed)sr*=1.4;sr*=pr.scare||1;
      // v0.85 luonteet: jänis jähmettyy ensin (ellei pelaaja ole aivan vieressä), kettu jää katsomaan matkan päästä, poro-lauma pakenee yhdessä
      const scared=hurt||(!P.dead&&dist<sr&&(m.los||P.crouch||dist<4));
      if(scared){if(m.state!=='flee'&&m.state!=='freeze'){if(pr.freeze&&!hurt&&dist>sr*.45){m.state='freeze';m.frzT=pr.freeze*(.7+Math.random()*.6);}else startFlee(m,dx,dz);}
        else if(m.state==='freeze'&&(hurt||dist<sr*.45))startFlee(m,dx,dz);}
      else if(m.state==='flee'&&dist>(pr.safe||28)&&!m.fly)m.state='idle';
      else if(pr.curious&&m.state!=='flee'&&!P.dead&&!hid&&dist<26&&m.los)m.state='watch';
      else if(m.state==='watch')m.state='idle';
      if(m.state==='freeze'){m.frzT-=dt;m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),Math.min(1,dt*3));if(m.frzT<=0)startFlee(m,dx,dz);moveMob(m,0,0,0,dt);animMob(m,dt);continue;}
      if(m.state==='watch'){m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),Math.min(1,dt*2.5));moveMob(m,0,0,0,dt);animMob(m,dt);continue;}
      if(m.fly){flyMob(m,dt);animMob(m,dt);continue;}}
    else if(hostile&&!P.dead&&!(P.spawnProt>0)&&!(m.forgetT>0)&&((m.los&&dist<aggroR)||hurt)&&Math.abs(P.pos.y-m.pos.y)<6)m.state='chase';
    else if(m.state==='chase'&&!hurt&&(P.dead||(!d.stalk&&(dist>aggroR*1.6||m.noLos>3)))){m.state='idle';if(m.noLos>3){m.angry=false;m.lastHit=-99;}m.noLos=0;}
    if(m.state==='flee'){// pakosuunta pois pelaajasta satunnaisella poikkeamalla, vaihtuu 1.2–3 s välein
      const zig=d.per&&d.per.zig;m.fleeT=(m.fleeT||0)-dt;if(m.fleeT<=0){m.fleeT=zig?.35+Math.random()*.35:1.2+Math.random()*1.8;m.fleeA=(m.herdA??Math.atan2(-dx,-dz))+(Math.random()-.5)*(zig?2.2:hurt?1.6:.8);m.herdA=null;}
      tx=Math.sin(m.fleeA);tz=Math.cos(m.fleeA);spd=d.run;}
    else if(m.state==='chase'){
      // v1.90: pelaaja tulee ihan lähelle (alle 3,2 m) → jousikalmo keskeyttää vedon heti ja hakkaa miekalla (tavallinen lähihyökkäys)
      if(m.archer&&dist<=3.2&&m.aimT>0){m.aimT=0;m.atkCd=Math.min(m.atkCd,.25);}
      const ar=m.archer&&dist>3.2&&dist<22&&m.wind<=0?archerAI(m,dt,dx,dz,dist):null;   // v1.42 jousikalmo
      if(ar){if(ar.aim){tx=0;tz=0;}else{tx=dx;tz=dz;}spd=ar.spd;}else{
      if(m.wind>0){m.wind-=dt;if(m.wind<=0){if(mobReach(m,dist)<d.range+.25&&!P.dead&&losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z,true)){const f=(Math.sin(m.yaw)*dx+Math.cos(m.yaw)*dz)/(dist||1);if(f>.5){hurtPlayer(d.dmg,m.pos.x,m.pos.z);if(d.kb&&!P.dead){P.kbx=dx/(dist||1)*d.kb;P.kbz=dz/(dist||1)*d.kb;P.vy=Math.max(P.vy,d.kb*.25);}}}m.atkCd=d.cd;}}
      else if(mobReach(m,dist)<d.range+.2&&m.atkCd<=0&&losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z,true)){m.wind=MOB_WIND;}
      else if(!m.siege&&m.atkCd<=0&&mobReach(m,dist)<d.range+1&&!losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z,true))m.siege=nearestOpening(m);
      else if(dist>d.range*.8){tx=dx;tz=dz;spd=d.run;}
      // Piiritys: jos seinät estävät tien, mobi menee lähimmälle ovelle tai ikkunalle ja hajottaa sen (2× vahinko).
      if(m.siege&&!pieces.includes(m.siege))m.siege=null;
      if(!m.siege&&m.stuck>.5&&m.wind<=0)m.siege=nearestOpening(m);
      if(m.siege&&m.wind<=0){const sx=m.siege.x-m.pos.x,sz=m.siege.z-m.pos.z,sd=Math.hypot(sx,sz);
        if(sd<1.9){tx=sx;tz=sz;spd=0;if(m.atkCd<=0){damagePiece(m.siege,d.dmg*2,'mob');m.atkCd=d.cd;m.anim=.4;m.wind=0;}}else{tx=sx;tz=sz;spd=d.run;}}
      if(m.wind>0){spd=dist>d.range*.8?d.run:0;tx=dx;tz=dz;}   // v1.33 (kohta 14): kaikki lyövät liikkeestä, ei pysähtymistä
      if(d.fells&&spd>0)fellAhead(m,dt);}
    }else{
      m.siege=null;m.t-=dt;if(m.t<=0||!m.wander){m.t=3+Math.random()*5;if(Math.random()<.45){const a=Math.random()*TAU;m.wander={x:m.pos.x+Math.cos(a)*10,z:m.pos.z+Math.sin(a)*10};}else m.wander=null;}
      if(m.wander){tx=m.wander.x-m.pos.x;tz=m.wander.z-m.pos.z;if(Math.hypot(tx,tz)<1)m.wander=null;spd=d.walk;}
    }
    if(atBorder&&spd>0){const ox=m.pos.x-m.guard.x,oz=m.pos.z-m.guard.z;if(tx*ox+tz*oz>0){spd=0;m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),Math.min(1,dt*6));}}   // rajalla: ei ulospäin
    moveMob(m,tx,tz,spd,dt);
    animMob(m,dt);
    if(m.archer)archerPose(m,dt);   // v1.88: jousen asento kuten pelaajalla
  }
  HURT_K=1;
  // separation
  for(let i=0;i<mobs.length;i++)for(let j=i+1;j<mobs.length;j++){const a=mobs[i],b=mobs[j];if(a.dead||b.dead)continue;const dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z,d=Math.hypot(dx,dz),r=a.def.r+b.def.r;if(d<r&&d>.001){const k=(r-d)/2/d;a.pos.x-=dx*k;a.pos.z-=dz*k;b.pos.x+=dx*k;b.pos.z+=dz*k;}}
}
// v0.86 joskus vihaiset eläimet. Palauttaa true, jos tämä kehys on käsitelty (esim. pako). Rauhoittuu, kun pelaaja on kaukana
// eikä ole lyönyt 12 s:iin (m.angry=false). Vihaisena tavallinen hostile-jahti (aggro, isku, tönäisy kb).
function temperAI(m,dt,dx,dz,dist,hurt,night){const d=m.def,t=d.temper;
  if(m.angry&&!hurt&&playTime-m.lastHit>12&&dist>(d.aggro||12)*1.3){m.angry=false;m.rolled=0;if(m.state==='chase')m.state='idle';}
  if(m.state==='flee'){if(dist>(d.per&&d.per.safe||28)&&!hurt)m.state='idle';else if(!m.angry)return false;}
  if(m.angry||P.dead||P.inDun!==!!m.dun)return false;
  if(P.crouch||playTime-(P.uncrouchT||-9)<.1)return false;   // v1.39: kyykyssä eläin ei huomaa
  const see=m.los&&dist<(d.aggro||12);
  const anger=(txt)=>{m.angry=true;m.lastHit=playTime-6;m.state='chase';sfx('roar',t==='elk'?.7:t==='sow'?1.1:1.6,.5);if(txt&&playTime-(m.growlT||-99)>20){m.growlT=playTime;msg(txt,'warn');}};
  if(t==='elk'){if(dist>15)m.rolled=0;if(dist<6&&!m.rolled&&m.los){m.rolled=1;if(Math.random()<.35)anger('Hirvi suuttuu ja ryntää päin!');else startFlee(m,dx,dz);}}
  else if(t==='lynx'){if(night&&P.hp<maxHp()*.5&&see)anger('Ilves vaanii heikentynyttä saalista!');else if(dist<10&&m.los&&m.state!=='flee')startFlee(m,dx,dz);}
  else if(t==='ahma'){if(see&&invCount('liha')>0)anger('Ahma haistaa lihan ja hyökkää!');}
  else if(t==='bear'){if(see&&dist<8)anger('Karhu hyökkää!');else if(m.los&&dist<14&&playTime-(m.growlT||-99)>12){m.growlT=playTime;sfx('roar',.55,.7);msg('Karhu murisee varoittavasti – pysy kaukana!','warn');m.state='idle';m.wander=null;m.yaw=Math.atan2(dx,dz);}}
  else if(t==='sow'){if(mobs.some(k=>k.mom===m&&!k.dead&&dist2(k.pos.x,k.pos.z,P.pos.x,P.pos.z)<49))anger('Emakko puolustaa porsaitaan!');}
  return false;}
// v0.88 harvinaiset pelottavat (def.stalk): huomatessaan pelaajan seuraavat 30–60 s (eivät luovu jahdista näköyhteyden katketessa),
// sitten poistuvat 5 s poispäin ja unohtavat (2 s jonka aikana eivät huomaa). Lyönti poistumisen aikana suututtaa uudelleen.
// Suonäkki nousee maasta 2 s:ssa (rise), Hiidenhirven sarvista nousee usvaa (mist). Palauttaa true, jos kehys käsiteltiin.
function stalkAI(m,dt,dx,dz,dist,hurt){const d=m.def;
  if(m.riseT!==undefined&&m.riseT<2){m.riseT+=dt;const g=terrainH(m.pos.x,m.pos.z);m.pos.y=g-2.4*(1-Math.min(1,m.riseT/2));if(Math.random()<dt*12)burst(m.pos.x,g+.2,m.pos.z,0x3a3020,3,2);m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),dt*2);m.f.g.position.copy(m.pos);m.f.g.rotation.y=m.yaw;return true;}
  if(d.mist&&m.f.g.visible&&Math.random()<dt*8){const h=m.f.head;h.getWorldPosition(_tmpV);emitEmber(_tmpV.x+(Math.random()-.5)*1.4,_tmpV.y+.8+Math.random()*.6,_tmpV.z+(Math.random()-.5)*1.4,'smoke');}
  if(m.forgetT>0)m.forgetT-=dt;
  if(!isNight()&&m.state!=='chase'&&dist>45&&!m.dun){mobRemove(m);return true;}   // aamun tullen katoaa (kun ei jahtaa ja on kaukana)
  if(m.leaveT>0){if(hurt&&playTime-m.lastHit<.2){m.leaveT=0;m.stalkT=30+Math.random()*30;m.state='chase';return false;}
    m.leaveT-=dt;m.state='flee';moveMob(m,-dx,-dz,d.run*.8,dt);animMob(m,dt);if(m.leaveT<=0){m.state='idle';m.forgetT=2;m.wander=null;}return true;}
  if(m.state==='chase'){if(!(m.stalkT>0)){m.stalkT=30+Math.random()*30;if(!m.helloed&&d.hello){m.helloed=1;msg(d.hello,'warn');sfx('roar',.5,.8);shake(.2);}}
    m.stalkT-=dt;if(m.stalkT<=0){m.leaveT=5;m.stalkT=0;m.state='flee';}}
  return false;}
const SCARY={aarni:['hiidenkarhu','hiidenhirvi'],forest:['hiidenkarhu','kalmasusi'],moor:['hiidenhirvi','kalmasusi'],tunturi:['kalmasusi'],rakka:['kalmasusi'],suo:['suonakki']};
// Yöllä pieni todennäköisyys (0,8 % / 2,5 s yritys ≈ kerran 5 minuutissa) spawnata pelottava 40–60 m päähän, enintään yksi kerrallaan.
// v1.33 (lista 3, kohta 12): yön pelottava. Kerran yössä (satunnaisena hetkenä) arvotaan: vuorilla 20 %, muualla 10 %. Jos pelaaja ei
// nukkunut edellistä yötä, tulee varmasti. Syntyy 20–30 m päähän ja hyökkää heti, nopeus (4,6 + 8) / 2 × 1,05 ≈ 6,6 m/s.
// Nukkuessa yö ohitetaan, joten silloin ei synny. Yön tunniste nightId(): ilta kuuluu päivään dayN, aamuyö edelliseen.
const SCARY_SPD=6.6,MOUNT_ZONES={mountain:1,tunturi:1,rakka:1};
function nightId(){return dayT>.5?dayN:dayN-1;}
function nightRoll(){if(!isNight()){if(flags.nCur!=null){flags.missN=flags.sleptN===flags.nCur?0:1;flags.nCur=null;}return;}
  const n=nightId();if(flags.nCur!==n){flags.nCur=n;flags.nRollAt=.15+Math.random()*.6;flags.nRolled=0;}
  if(flags.nRolled||P.dead||P.inDun)return;const into=dayT>.5?(dayT-.79)/.42:(dayT+.21)/.42;if(into<flags.nRollAt)return;
  flags.nRolled=1;const ch=flags.missN?1:MOUNT_ZONES[P.zone]?.2:.1;if(Math.random()>=ch)return;
  if(spawnScary(true))flags.missN=0;}
function spawnScary(hunt){if(mobs.some(o=>o.def.stalk&&!o.dead))return false;
  for(let t=0;t<8;t++){const a=Math.random()*TAU,dd=hunt?20+Math.random()*10:40+Math.random()*20;let x=P.pos.x+Math.sin(a)*dd,z=P.pos.z+Math.cos(a)*dd;const h=terrainH(x,z);if(h<.5)continue;
    const L=SCARY[biomeAt(x,z,h)]||(hunt?['kalmasusi','hiidenhirvi']:null);if(!L||(!hunt||t<4)&&(nearBase(x,z)||nearSite(x,z,40)))continue;const type=L[Math.random()*L.length|0];
    if(type==='suonakki'){nodesNear(x,z,12,_fellN);const pd=_fellN.find(n=>n.type==='lampare');if(pd){x=pd.x;z=pd.z;}}
    const m=spawnMob(type,x,z);if(MOBDEF[type].rise)m.riseT=0;if(MOBDEF[type].howl){sfx('howl',1,.9);msg('Kaukaa kuuluu kalmea ulvonta…','warn');}
    if(hunt){m.def=Object.assign({},m.def,{run:SCARY_SPD});m.state='chase';m.angry=true;m.lastHit=playTime-5;msg('Jokin lähestyy pimeässä…','warn');}return m;}
  return false;}
// v0.87 karhu kaataa jahdatessaan edessään (1,6 m) olevat puut (ei aarnipuita) sivulle tukeiksi, 0,25 s välein.
const _fellN=[];
function fellAhead(m,dt){m.fellT=(m.fellT||0)-dt;if(m.fellT>0)return;m.fellT=.25;for(const dd of [.9,1.8]){const ax=m.pos.x+Math.sin(m.yaw)*dd,az=m.pos.z+Math.cos(m.yaw)*dd;
  nodesNear(ax,az,1.3,_fellN);for(const n of _fellN){if(!n.alive||n.def.kind!=='tree'||n.type==='aarnipuu')continue;killNode(n);const side=Math.random()<.5?1:-1;
    fallTree(n,m.yaw+side*(Math.PI/2)*(.6+Math.random()*.4),true,m);sfx('woodBreak',.8,clamp(1.1-Math.hypot(n.x-P.pos.x,n.z-P.pos.z)/50,.15,1));shake(.15);}}}
// v0.85: pakoon lähtö luonteen mukaan. Metso lehahtaa 14–24 m päähän (kaari 2,5–4 m korkealla), lauma (poro) pakenee yhdessä samaan suuntaan.
function startFlee(m,dx,dz){m.state='flee';m.fleeT=0;const pr=m.def.per||{};
  if(pr.fly&&!m.dun&&!m.fly){const a=Math.atan2(-dx,-dz)+(Math.random()-.5)*1.2,d=14+Math.random()*10,x1=m.pos.x+Math.sin(a)*d,z1=m.pos.z+Math.cos(a)*d;
    if(terrainH(x1,z1)>0){m.fly={t:0,dur:d/9,x0:m.pos.x,z0:m.pos.z,y0:m.pos.y,x1,z1,h:2.5+Math.random()*1.5};m.yaw=a;sfx('flap',1,clamp(1.2-Math.hypot(dx,dz)/40,.15,1));}}
  if(pr.herd){const a=Math.atan2(-dx,-dz);for(const o of mobs)if(o!==m&&o.type===m.type&&!o.dead&&o.state!=='flee'&&dist2(o.pos.x,o.pos.z,m.pos.x,m.pos.z)<25*25){o.state='flee';o.fleeT=0;o.herdA=a;}}}
function flyMob(m,dt){const F=m.fly;F.t+=dt;const k=Math.min(1,F.t/F.dur);m.pos.x=lerp(F.x0,F.x1,k);m.pos.z=lerp(F.z0,F.z1,k);
  m.pos.y=lerp(F.y0,terrainH(F.x1,F.z1),k)+Math.sin(k*Math.PI)*F.h;m.speedNow=0;if(k>=1){m.fly=null;m.state='idle';m.t=2+Math.random()*3;}}
// Iskun ulottuvuus 3D:ssä: vaakaetäisyys + pystyväli mobin iskukohdasta pelaajan vartaloon (0–1,8 m).
function mobReach(m,dist){const sy=m.pos.y+(m.f.biped?1:.6)*(m.f.s||1),gap=Math.max(0,sy-(P.pos.y+1.8),P.pos.y-sy);return Math.hypot(dist,gap);}
// Kaikkien vihollisten ja eläinten liikenopeus × MOB_SPD (−15 %, v0.63)
const MOB_SPD=.85;
// v1.42 (lista 4, kohta 16): jousikalmo ampuu 3–20 m päästä 1 nuolen / 2,5 s (0,6 s tähtäys), vahinko kuin lähi-iskussa; pitää 6–14 m
// etäisyyden (peruuttaa kasvot pelaajaan päin), lähestyy jos ei näe. Alle 2,4 m lyö tavalliseen tapaan.
/* v1.88: jousikalmo ampuu kuten pelaaja. Veto kestää ARCH_DRAW s; sen aikana tähtäys seuraa pelaajan paikkaa VIIVEELLÄ (aikavakio ~0,25 s) ja
   kalmo kääntyy hitaasti (ARCH_TURN rad/s, ylös/alas ARCH_PITCH rad/s). Nuoli lähtee täsmälleen siihen suuntaan, johon jousi osoittaa vapautushetkellä
   (+ pieni hajonta), ei ennakoi liikettä → sivulle väistävä/häilyvä pelaaja jää nuolen ohi. Nuolen fysiikka sama kuin pelaajalla (shootArrow, painovoima
   ARCH_G, tuuli). v1.89: veto 1,9 s (sekunti lisää) ja jousi vasemmassa kädessä, miekka oikeassa – alle 2,4 m kalmo lyö miekalla. Jousen asento (kahva edessä, jänne poskella, nuoli) tulee pelaajan bowAimFig-funktiosta (player.js), ks. archerPose. */
const _arF=new V3(),_arD=new V3(),_arX=new V3(),ARCH_DRAW=1.9,ARCH_SPD=32,ARCH_G=7,ARCH_TURN=1.0,ARCH_PITCH=.9;
function archerAI(m,dt,dx,dz,dist){const d=m.def,los=losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z,true);
  if(m.aimT>0){
    const k=Math.min(1,dt*4);m.aimX+=(P.pos.x-m.aimX)*k;m.aimY+=(P.pos.y+1.15-m.aimY)*k;m.aimZ+=(P.pos.z-m.aimZ)*k;   // viive: tähtäyspiste seuraa pelaajaa hitaasti
    const ax=m.aimX-m.pos.x,az=m.aimZ-m.pos.z,hd=Math.hypot(ax,az)||1e-4,t=hd/ARCH_SPD,ty=m.aimY-(m.pos.y+1.35)+.5*ARCH_G*t*t;   // painovoimakorjaus nuolen lentoajalle
    const wy=Math.atan2(ax,az),wp=Math.atan2(ty,hd),dy=((wy-m.yaw+Math.PI)%TAU+TAU)%TAU-Math.PI;
    m.yaw+=clamp(dy,-ARCH_TURN*dt,ARCH_TURN*dt);m.aimPitch+=clamp(wp-m.aimPitch,-ARCH_PITCH*dt,ARCH_PITCH*dt);
    m.aimT-=dt;
    if(m.aimT<=0){m.atkCd=1.9;
      if(!P.dead&&los){const cp=Math.cos(m.aimPitch),fx=Math.sin(m.yaw)*cp,fz=Math.cos(m.yaw)*cp;
        _arF.set(m.pos.x+Math.sin(m.yaw)*.55,m.pos.y+1.35,m.pos.z+Math.cos(m.yaw)*.55);_arD.set(fx,Math.sin(m.aimPitch),fz);
        {const sp=2*Math.PI/180,r=Math.sqrt(Math.random())*Math.tan(sp),ph=Math.random()*TAU,ux=_arX.set(-_arD.z,0,_arD.x).normalize(),vy=_tmpV2.crossVectors(_arD,ux);
          _arD.addScaledVector(ux,Math.cos(ph)*r).addScaledVector(vy,Math.sin(ph)*r).normalize();}   // pieni hajonta kuten pelaajan jousessa
        shootArrow(_arF,_arD,ARCH_SPD,d.dmg,'mob',ARCH_G);sfx('bow');}}
    return {spd:0,aim:1};}
  if(!P.dead&&los&&dist>=3.6&&dist<=20&&m.atkCd<=0){m.aimT=ARCH_DRAW;m.aimX=P.pos.x;m.aimY=P.pos.y+1.15;m.aimZ=P.pos.z;m.aimPitch=0;return {spd:0,aim:1};}
  if(!los||dist>14)return {spd:d.run};
  if(dist<6){m.vel.x-=dx/dist*10*dt;m.vel.z-=dz/dist*10*dt;}
  return {spd:0};}
// jousikalmon asento joka ruutu (animMobin jälkeen): sama kuin pelaajalla – kahva edessä, jänne posken luona, nuoli jänteellä; sulava sisään/ulos
function archerPose(m,dt){const f=m.f,b=m.bow;if(!b)return;if(m.aimT>0&&m.state!=='chase')m.aimT=0;
  const aiming=m.aimT>0;m.aimK=clamp((m.aimK||0)+(aiming?dt/.2:-dt/.3),0,1);
  if(m.aimK>.001){f.armL.rotation.set(0,0,0);f.armR.rotation.set(0,0,0);f.elbowL.rotation.x=0;f.elbowR.rotation.x=0;b.rotation.set(-.15,0,0);b.position.set(0,0,0);
    bowAimFig(f,b,m.aimK,m.yaw,f.g.position);updateBowMesh(b,aiming?1-Math.max(0,m.aimT)/ARCH_DRAW:0,aiming);m.bowPosed=1;}
  else if(m.bowPosed){f.armL.rotation.set(0,0,0);f.armR.rotation.set(0,0,0);f.elbowL.rotation.x=f.elbowR.rotation.x=0;b.rotation.set(-.15,0,0);b.position.set(0,0,0);updateBowMesh(b,0,false);m.bowPosed=0;}}
/* v1.50 (lista 5, kohta 2): kalmot ja pelottavat yöolennot (SCARY-tyypit, stalk) palavat auringossa avoimella alueella.
   Suojaa: katos (rakennus yläpuolella), sää (pilvisyys wDark > .35 tai sade), metsäbiomit (korpi, koivikko, aarnimetsä), yö (lightK < .55).
   Kulku ~6 s: 0–3 s paniikkiryntäily (suunta vaihtuu 0,35–0,6 s välein, 1,3× juoksu), 3–5,2 s hidastuu ja horjuu, sitten kaatuu tuhkaksi
   (killMob → tuhkakuolema, ei saalista). Ryntäilevä sytyttää pelaajan 1 m päästä (P.burnT 4 s). Tarkistus 0,5 s välein. */
const SUN_BURN=new Set(['kalmo','ylimys','hiidenkarhu','hiidenhirvi','kalmasusi','suonakki']),SUN_SHADE={forest:1,koivu:1,aarni:1};
function sunExposed(m){if(lightK<.55||wDark>.35||wRain>.25)return false;const b=biomeHere(m.pos.x,m.pos.z);if(SUN_SHADE[b]||b==='sea')return false;
  return roofTopAt(m.pos.x,m.pos.z)<m.pos.y+1;}
function sunBurnAI(m,dt){const d=m.def;
  if(!m.sunBurn){if(m.boss||m.guard||d.ai==='boss'||d.ai==='rboss'||!(SUN_BURN.has(m.type)||d.stalk))return false;
    m.sunChk=(m.sunChk||Math.random()*.5)-dt;if(m.sunChk>0)return false;m.sunChk=.5;if(!sunExposed(m))return false;
    m.sunBurn=1;m.sunT=0;m.wind=0;m.act=null;igniteMob(m);m.burnT=99;sfx('roar',1.3,.6);burst(m.pos.x,m.pos.y+1,m.pos.z,0xff9a3a,14,4);}
  m.sunT+=dt;m.burnT=Math.max(m.burnT,1);const t=m.sunT;
  if(t<3){m.panT=(m.panT||0)-dt;if(m.panT<=0){m.panT=.35+Math.random()*.25;m.panA=Math.random()*TAU;}moveMob(m,Math.sin(m.panA),Math.cos(m.panA),(d.run||4)*1.3,dt);}
  else{const k=clamp(1-(t-3)/2.2,0,1);m.panT=(m.panT||0)-dt;if(m.panT<=0){m.panT=.6;m.panA+=(Math.random()-.5)*2;}moveMob(m,Math.sin(m.panA),Math.cos(m.panA),(d.run||4)*.6*k,dt);
    m.f.g.rotation.z=Math.sin(playTime*7)*.12*(1-k);}
  if(!P.dead&&!(P.burnT>0)&&dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z)<1&&Math.abs(P.pos.y-m.pos.y)<1.5){P.burnT=4;msg('Palava olento sytytti sinut!','warn');}
  animMob(m,dt);
  if(t>=5.2){m.f.g.rotation.z=0;m.sunKill=1;m.hp=0;stopBurn(m);m.burnT=1;killMob(m);m.burnT=0;}
  return true;}
function moveMob(m,tx,tz,spd,dt){
  spd*=MOB_SPD;
  // v0.83: Aarnimetsässä hirviöt ovat vihaisia ja liikkuvat 20 % nopeammin (biomi tarkistetaan sekunnin välein)
  if(!m.dun&&(m.bioT=(m.bioT||0)-dt)<=0){m.bioT=1;m.aarni=biomeHere(m.pos.x,m.pos.z)==='aarni';}
  if(m.aarni&&(m.def.ai==='hostile'||m.angry))spd*=1.2;
  if(m.def.stride)spd*=1.1;   // v0.92 harppovat hirviöt 10 % nopeampia
  const l=Math.hypot(tx,tz);
  if(l>.01){const ty=Math.atan2(tx,tz);m.yaw=lerpAngle(m.yaw,ty,Math.min(1,dt*8));}
  let vx=0,vz=0;if(l>.01&&spd>0){vx=Math.sin(m.yaw)*spd;vz=Math.cos(m.yaw)*spd;}
  m.vel.x*=Math.max(0,1-dt*6);m.vel.z*=Math.max(0,1-dt*6);
  const nx=m.pos.x+(vx+m.vel.x)*dt,nz=m.pos.z+(vz+m.vel.z)*dt;
  if(!m.dun&&terrainH(nx,nz)<-.7&&terrainH(m.pos.x,m.pos.z)>=-.7){m.wander=null;if(m.state!=='chase')m.yaw+=Math.PI*.5;return;}
  const ox=m.pos.x,oz=m.pos.z;m.pos.x=nx;m.pos.z=nz;
  _hitl.length=0;collideXZ(m.pos,m.def.r,m.type==='vartija'?6:1.6,m.pos.y,_hitl);
  const moved=Math.hypot(m.pos.x-ox,m.pos.z-oz);
  // stuck at player's buildings -> attack them
  if(m.state==='chase'&&spd>0&&moved<spd*dt*.3){m.stuck+=dt;if(m.stuck>.8&&m.atkCd<=0){const c=_hitl.find(c=>c.owner&&c.owner.t&&PIECES[c.owner.t]);if(c){damagePiece(c.owner,m.def.dmg,'mob');m.atkCd=m.def.cd;m.anim=.4;if(c.owner.t==='aita'){damageMob(m,6,'pierce',-(c.owner.x-m.pos.x),-(c.owner.z-m.pos.z));}}}}else m.stuck=0;
  const g=groundAt(m.pos.x,m.pos.z,m.def.r,m.pos.y);m.pos.y=lerp(m.pos.y,Math.max(g,m.dun?DUN.y:-1.4),Math.min(1,dt*10));
  m.speedNow=moved/dt;
}
function animMob(m,dt){
  if(!m.f.g.visible)return;
  const f=m.f;f.g.position.copy(m.pos);f.g.rotation.y=m.yaw;
  const st=m.def.stride,spn=m.speedNow||0;m.walkPh+=spn*dt*(st?1.55:2.2);const sw=Math.sin(m.walkPh)*Math.min(1,spn/3)*(st?.98:.7);
  if(st&&f.biped&&m.def.ai!=='boss'){const k=Math.min(1,spn/3);if(f.g.rotation.order!=='YXZ')f.g.rotation.order='YXZ';   // paikallinen kallistus
    f.g.rotation.z=Math.sin(m.walkPh)*.07*k;f.g.rotation.x=(m.state==='chase'?.12:.04)*k;f.g.position.y+=Math.abs(Math.cos(m.walkPh))*.08*k*(f.s||1);}   // keinunta, kumarrus, pomppu
  if(f.biped){f.legL.rotation.x=sw;f.legR.rotation.x=-sw;f.armL.rotation.x=-sw*.6;f.armR.rotation.x=sw*.6;
    // yksityiskohtaiset mallit (makeHumanoid): polvi koukistuu taakse jäävässä jalassa, kyynärpäät hieman koukussa; viitat ja rievut heiluvat
    if(f.kneeL){const kb2=st?1.3:.9;f.kneeL.rotation.x=.08+Math.max(0,-sw)*kb2;f.kneeR.rotation.x=.08+Math.max(0,sw)*kb2;f.elbowL.rotation.x=f.elbowR.rotation.x=-.25-(m.wind>0?.5:0);}
    if(f.sway&&m.def.ai!=='rboss')for(const w of f.sway){w.m.rotation.z=w.bz+Math.sin(playTime*w.f+w.p)*w.a;w.m.rotation.x=w.bxr+Math.cos(playTime*w.f*.8+w.p)*w.a*.6+Math.min(.5,(m.speedNow||0)*.08);}
    if(m.wind>0){f.armR.rotation.x=-2.6;f.armL.rotation.x=-2.2;}else if(m.wind<=0&&m.atkCd>m.def.cd-.25){f.armR.rotation.x=-.3;}}
  else if(f.bird){// v0.85 metso: jalat vuorotellen, pää nyökkää kävellessä, siivet räpyttävät lennossa, pyrstö nousee säikähtäessä
    const fl=!!m.fly;f.legs[0].rotation.x=fl?-.9:sw*1.2;f.legs[1].rotation.x=fl?-.9:-sw*1.2;f.head.position.z=.3*f.s+(fl?0:Math.sin(m.walkPh*2)*.04*Math.min(1,(m.speedNow||0)/1.5));
    const fa=fl?Math.sin(playTime*28)*1.1:0;f.wings[0].rotation.z=-fa-(fl?.3:0);f.wings[1].rotation.z=fa+(fl?.3:0);f.tail.rotation.x=m.state==='flee'||m.state==='freeze'?-.2:.35;
    f.body.rotation.x=fl?-.25:0;}
  else{f.legs[0].rotation.x=sw;f.legs[3].rotation.x=sw;f.legs[1].rotation.x=-sw;f.legs[2].rotation.x=-sw;
    if(m.def.mobile&&m.wind>0){const k=1-m.wind/MOB_WIND;f.legs[1].rotation.x=-1.5*Math.sin(Math.min(1,k)*Math.PI);f.legs[1].userData.knee.rotation.x=.9;}   // karhun käpälänisku
    if(f.hop){// v0.85 jänis loikkii: etu- ja takajalat pareittain, runko pomppaa
      const hs=Math.sin(m.walkPh*.8),mvk=Math.min(1,(m.speedNow||0)/2.5);f.legs[0].rotation.x=f.legs[1].rotation.x=hs*.9*mvk;f.legs[2].rotation.x=f.legs[3].rotation.x=-hs*1.1*mvk;f.g.position.y+=Math.abs(Math.sin(m.walkPh*.8))*.22*mvk;}
    // nivelletyt jalat (makeAnimal): polvi koukistuu jalan noustessa (etujalat taaksepäin, takajalat eteenpäin), häntä heiluu
    if(f.animal){for(const l of f.legs){const a=l.rotation.x,kn=l.userData.knee;kn.rotation.x=l.userData.front?.05+Math.max(0,a)*1.1:-.05-Math.max(0,-a)*1.1;}if(f.tail)f.tail.rotation.y=Math.sin(playTime*(m.state==='chase'?9:3)+m.walkPh)*.25;}f.head.rotation.x=m.wind>0?-.5:(m.atkCd>m.def.cd-.2?.4:0);}
  if(m.eyeFx)animEyes(m,dt);
  if(m.anim>0)m.anim-=dt;
}
const BOSS_SLOW=1.1;
// v1.17 (välilisäys 7): maahanisku – kädet nousevat ylös, pysyvät ylhäällä latautumassa 0,8 s (tärisevät), sitten isku (osuma hitT:ssä).
function slamArms(f,t,hitT){const rise=Math.max(.15,hitT-.94),hold=hitT-.14;
  f.armR.rotation.x=f.armL.rotation.x=t<rise?-3*t/rise:t<hold?-3+Math.sin(t*38)*.06:t<hitT?lerp(-3,-3.3,(t-hold)/.14):lerp(-3.3,-.6,Math.min(1,(t-hitT)/.15));}
// v1.17 (välilisäys 6): pomojen ryntäys enintään kerran 10 s:ssa
const BOSS_CHARGE_GAP=10;   // v0.89: kiviä heittävien pomojen hyökkäysviive +10 % (Kalmanvartija, Jäätär)
function bossAI(m,dt,dx,dz,dist){
  const L=LOC.circle;if(m.chPose&&!(m.act&&m.act.k==='charge'))bossChargeReset(m);
  if(m.state==='intro'){m.t+=dt;m.yaw=Math.atan2(dx,dz);m.f.g.position.copy(m.pos);m.f.g.rotation.y=m.yaw;m.f.armL.rotation.x=m.f.armR.rotation.x=-2.8*Math.min(1,m.t);if(m.t>2.2){m.state='chase';sfx('roar');shake(.5);}return;}
  if(!m.phase2&&m.hp<m.maxHp*.5){m.phase2=true;sfx('roar');msg('Vartija kutsuu kalmoja maasta!','warn');for(let i=0;i<3;i++){const a=i/3*TAU;spawnMob('kalmo',m.pos.x+Math.cos(a)*5,m.pos.z+Math.sin(a)*5);}shockwave(m.pos.x,m.pos.y,m.pos.z,8);}
  const spd=(m.phase2?1.2:1);
  // v0.89 (kohta 6): kaikkien hyökkäysten ajoitus +10 % (kiviä heittävä pomo: a.t etenee dt/1,1), huitaisun ja maahaniskun ennakko +40 %
  // (0,8 → 1,12 s ja 1,1 → 1,54 s), iskujen väli +20 %, ryntäys puolet harvemmin (25 %, vähintään 8 s välein).
  if(m.act){m.act.t+=dt/BOSS_SLOW;const a=m.act;const f=m.f;
    if(a.k==='swipe'){f.armR.rotation.x=a.t<1.12?-2.6*a.t/1.12:lerp(-2.6,-.2,Math.min(1,(a.t-1.12)/.2));if(a.t>=1.12&&!a.hit){a.hit=1;sfx('swing');if(dist<4.8+.4){const fc=(Math.sin(m.yaw)*dx+Math.cos(m.yaw)*dz)/(dist||1);if(fc>.1)hurtPlayer(22,m.pos.x,m.pos.z);}}if(a.t>1.75)m.act=null;}
    else if(a.k==='slam'){slamArms(f,a.t,1.54);if(a.t>=1.54&&!a.hit){a.hit=1;sfx('slam');shake(.6);const fx=m.pos.x+Math.sin(m.yaw)*2.5,fz=m.pos.z+Math.cos(m.yaw)*2.5;shockwave(fx,m.pos.y,fz,7);burst(fx,m.pos.y+.3,fz,0x5d5a54,16,7);if(dist2(fx,fz,P.pos.x,P.pos.z)<7*7&&P.pos.y-m.pos.y<1.5)hurtPlayer(28,fx,fz);}if(a.t>2.35)m.act=null;}
    else if(a.k==='charge'){bossChargePose(m,a);if(a.t<.6){m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),dt*6);}else{moveMob(m,Math.sin(m.yaw),Math.cos(m.yaw),15*spd,dt);if(!a.hit&&dist<2.8){a.hit=1;hurtPlayer(26,m.pos.x,m.pos.z);P.vel.x+=Math.sin(m.yaw)*10;P.vel.z+=Math.cos(m.yaw)*10;}}if(a.t>1.6){m.act=null;bossChargeReset(m);}}   // v1.90: etukeno + silmät
    else if(a.k==='throw'){f.armR.rotation.x=-2.8*Math.min(1,a.t/.8);if(a.t>=.8&&!a.hit){a.hit=1;const hp=new V3();f.hand.getWorldPosition(hp);throwRock(hp,new V3(P.pos.x+P.vel.x*.6,P.pos.y,P.pos.z+P.vel.z*.6),20);}if(a.t>1.3)m.act=null;}
    m.f.g.position.copy(m.pos);m.f.g.rotation.y=m.yaw;return;}
  // v0.95 (kohta 10): yli 90 m:n päässä vartija pysähtyy ja vajoaa 3 s:ssa maahan (multaa, jyrinä), vajoamisen ajan haavoittumaton.
  if(m.state!=='sink'&&!m.devSpawn&&(dist2(P.pos.x,P.pos.z,L.x,L.z)>90*90||P.inDun)){   /* v1.91: DEV-luotu vartija ei vajoa */m.state='sink';m.t=0;m.act=null;m.sinking=1;m.y0=m.pos.y;sfx('slam',.5,.6);sfx('roar',.6,.5);
    msg('Vartija vajoaa takaisin maahan. Hiidenkivet jäävät alttarille – herätä se uudelleen alttarilta (terveys säilyy).','warn');}
  if(m.state==='sink'){m.t+=dt;const k=Math.min(1,m.t/3);m.pos.y=m.y0-k*k*7.5;m.f.armL.rotation.x=m.f.armR.rotation.x=-2.6*Math.min(1,m.t*1.5);
    if(Math.random()<dt*30)burst(m.pos.x+(Math.random()-.5)*4,m.y0+.2,m.pos.z+(Math.random()-.5)*4,Math.random()<.5?0x5d5a54:0x6a5a44,4,5);
    if(dist2(P.pos.x,P.pos.z,m.pos.x,m.pos.z)<40*40&&Math.random()<dt*4)shake(.12);m.f.g.position.copy(m.pos);m.f.g.rotation.y=m.yaw;
    if(m.t>=3){mobRemove(m);flags.altarSt=1;flags.bossHp=m.hp;syncAltar();/* v0.75: kivet jäävät alttarille pysyvästi (ei maahan katoavina esineinä), hp säilyy */circleStones.forEach(r=>r.material=new THREE.MeshBasicMaterial({color:0x2a3a39}));$('#bossbar').hidden=true;}return;}
  // v0.95: herätettäessä vartija nousee maasta 2,5 s:ssa (haavoittumaton), sitten nykyinen karjaisu (intro)
  // v1.89: nousu kestää 5 s (ennen 2,5 s + karjaisu): pää alhaalla ja kädet sivuilla, haavoittumaton; karjaisu vasta pystyssä
  if(m.state==='rise'){m.t+=dt;const g=terrainH(m.pos.x,m.pos.z);if(m.t>5.9)m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),Math.min(1,dt*3));   // v1.90: 8 s, kääntyy vasta huomatessaan
    if(bossRisePose(m,dt,g,7.5))return;
    m.pos.y=g;m.sinking=0;m.state='chase';m.t=0;bossWakeRoar(m);return;}
  if(P.dead){moveMob(m,L.x-m.pos.x,L.z-m.pos.z,m.def.walk,dt);animMob(m,dt);return;}// v0.75: iso pomo ei parane
  if(m.atkCd<=0){
    if(dist<5){m.act={k:Math.random()<.55?'swipe':'slam',t:0};m.atkCd=(m.phase2?1.1:1.6)*1.2*BOSS_SLOW;}
    else if(dist>9&&dist<30){const ch=Math.random()<.25&&playTime-(m.chargeT||-99)>BOSS_CHARGE_GAP;if(ch)m.chargeT=playTime;m.act={k:ch?'charge':'throw',t:0};m.atkCd=(m.phase2?1.6:2.4)*1.2*BOSS_SLOW;}
  }
  if(!m.act){moveMob(m,dx,dz,dist>4?m.def.run*spd:0,dt);if(dist<=4)m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),dt*4);animMob(m,dt);}
  else{m.f.g.position.copy(m.pos);m.f.g.rotation.y=m.yaw;}
}
function bossDefeated(){
  circleStones.forEach(r=>r.material=new THREE.MeshBasicMaterial({color:0x2a3a39}));
  msg('Kalmanvartija on kaatunut!','loot');sfx('roar');
  setTimeout(()=>{if(flags.won)return;flags.won=1;state='win';releaseLock();$('#hud').hidden=true;const mm=Math.round(playTime/60);$('#winStats').textContent=`Selvisit ${dayN} päivää (${mm} min). Kaatoit ${P.kills} vihollista ja kaaduit itse ${P.deaths} kertaa. Saari on nyt sinun – jatka rakentamista ja tutkimista.`;$('#winS').hidden=false;saveGame(true);},3500);
}

/* ---------------- SPAWNER ---------------- */
let spawnT=0;
const SPAWN={
  meadow:{day:[['peura',.4],['karju',.25],['janis',.22],['emakko',.13]],night:[['susi',.4],['hiisi',.22],['peura',.2],['kettu',.18]]},
  forest:{day:[['hiisi',.34],['peura',.16],['karju',.14],['metso',.12],['hirvi',.08],['ilves',.06],['emakko',.08],['karhu',.04]],night:[['hiisi',.4],['susi',.34],['kettu',.1],['ilves',.08],['peura',.04],['karhu',.04]]},
  moor:{day:[['kalmo',.9],['karju',.1]],night:[['kalmo',.7],['susi',.3]]},
  mountain:{day:[['susi',.4],['peura',.3],['poro',.3]],night:[['susi',1]]},
  beach:{day:[['karju',.5],['peura',.5]],night:[['susi',.6],['hiisi',.4]]},
  aarni:{day:[['hiisi',.46],['susi',.28],['peura',.18],['karhu',.08]],night:[['susi',.5],['hiisi',.5]]},
  // v0.82 uudet biomit (kohta 2 säätää päivä/yö-jakauman)
  koivu:{day:[['peura',.38],['janis',.26],['karju',.12],['metso',.1],['hirvi',.14]],night:[['susi',.35],['hiisi',.2],['peura',.25],['kettu',.2]]},
  suo:{day:[['karju',.3],['hiisi',.4],['hirvi',.3]],night:[['hiisi',.5],['susi',.4],['hirvi',.1]]},
  kangas:{day:[['metso',.32],['peura',.22],['poro',.18],['karju',.16],['ilves',.12]],night:[['susi',.55],['hiisi',.22],['kettu',.13],['ilves',.1]]},
  tunturi:{day:[['poro',.46],['janis',.12],['susi',.18],['ahma',.16],['karhu',.08]],night:[['susi',.75],['kettu',.1],['ahma',.15]]},
  rakka:{day:[['poro',.4],['susi',.25],['janis',.15],['ahma',.1],['ilves',.1]],night:[['susi',.8],['ilves',.2]]},
};
// v0.83 spawnaus (päivityslista kohta 2):
// - YÖ: suurin osa (90 %) syntyy 55–85 m päähän ja vaeltaa omia reittejään (huomaa pelaajan tavallisesti); 10 % syntyy 20–30 m päähän,
//   mieluiten puun tai kiven taakse (pelaajasta katsottuna), muuten avoimelle paikalle. Aarnimetsä vetää vihollisia: muualla ehdokas
//   hyväksytään 55 %:n todennäköisyydellä, aarnimetsässä aina; pelaajan ollessa aarnimetsässä tahti 1,5 s ja raja 18.
// - PÄIVÄ: eläimet kuten ennen; vihollisia enintään 2 (aarnimetsässä 3) ja vain tiheässä metsässä, suolla, kankaalla, nummella ja aarnimetsässä.
const DAY_FOE_BIOMES={forest:1,suo:1,kangas:1,moor:1,aarni:1};
const _spN=[];
function spawnSpot(night){
  if(night&&Math.random()<.1){// lähelle: puun/kiven taakse
    for(let t=0;t<8;t++){const a=Math.random()*TAU,d=20+Math.random()*10,x=P.pos.x+Math.cos(a)*d,z=P.pos.z+Math.sin(a)*d;
      nodesNear(x,z,5,_spN);const cov=_spN.find(n=>n.alive&&(n.def.kind==='tree'||n.def.kind==='rock'));
      if(cov){const ux=cov.x-P.pos.x,uz=cov.z-P.pos.z,l=Math.hypot(ux,uz)||1,o=cov.def.r*cov.s+1.3,bx=cov.x+ux/l*o,bz=cov.z+uz/l*o;
        if(!pointBlocked(bx,terrainH(bx,bz)+.5,bz))return {x:bx,z:bz,near:1,cover:1};}}
    const a=Math.random()*TAU,d=20+Math.random()*10;return {x:P.pos.x+Math.cos(a)*d,z:P.pos.z+Math.sin(a)*d,near:1};}
  const a=Math.random()*TAU,d=night?55+Math.random()*30:38+Math.random()*30;return {x:P.pos.x+Math.cos(a)*d,z:P.pos.z+Math.sin(a)*d};}
function spawner(dt){
  nightRoll();spawnT-=dt;if(spawnT>0||P.inDun||P.dead)return;
  const night=isNight(),inA=P.zone==='aarni';spawnT=night?(inA?1.2:1.9):2.5;   // v1.33: yöllä enemmän (tahti 2,5 → 1,9 s, raja 14 → 18)
  const alive=mobs.filter(m=>!m.dun&&!m.dead&&m!==boss&&!m.guard);const cap=night?(inA?22:18):10;
  if(alive.length>=cap)return;
  const dayFoes=alive.filter(m=>m.def.ai==='hostile').length;
  for(let tries=0;tries<6;tries++){const sp=spawnSpot(night),x=sp.x,z=sp.z;const h=terrainH(x,z);if(h<.5)continue;
    const b=biomeAt(x,z,h);const tbl=SPAWN[b];if(!tbl)continue;
    if(night&&b!=='aarni'&&!sp.near&&Math.random()>.55)continue;
    let list=night?tbl.night:tbl.day;
    if(!night){const foeOk=DAY_FOE_BIOMES[b]&&dayFoes<(b==='aarni'?3:2);if(!foeOk)list=list.filter(([t])=>MOBDEF[t].ai!=='hostile');
      else if(b==='aarni'||b==='forest'||b==='suo')list=list.map(([t,p])=>[t,MOBDEF[t].ai==='hostile'?p*1.4:p]);}
    if(!list.length)continue;const tot=list.reduce((a,[,p])=>a+p,0);
    let r=Math.random()*tot,type=list[0][0];for(const [t,p] of list){if(r<p){type=t;break;}r-=p;}
    if(nearBase(x,z)||nearSite(x,z,50))continue;
    if(type==='karhu'&&mobs.some(o=>o.type==='karhu'&&!o.dead))continue;   // enintään yksi karhu
    if(dist2(x,z,LOC.spawn.x,LOC.spawn.z)<30*30&&(MOBDEF[type].ai==='hostile'||type==='karhu')&&!night)continue;
    const pack=type==='susi'&&night&&!sp.near?2:type==='poro'?3+(Math.random()*3|0):1;/* porot laumoina 3–5 */for(let k=0;k<pack;k++){const m=spawnMob(type,x+(k%3)*1.8,z+(k/3|0)*1.8+k*.3);if(m&&sp.near)m.state='idle';
      if(type==='emakko')for(let j=0,n=2+(Math.random()*3|0);j<n;j++){const pg=spawnMob('porsas',x+1.2+j*.8,z-1+j*.6);pg.mom=m;}}return;}  // emakko + 2–4 porsasta
}
function respawnNodes(){for(const n of nodes)if(!n.alive&&n.def.kind!=='tree'&&n.respawnAt<=playTime&&dist2(n.x,n.z,P.pos.x,P.pos.z)>40*40&&!nearBase(n.x,n.z))respawnNode(n);}
const LIGHT_CAP=3.0;let shFrame=0,shNearPrev=false;const ALL_LIGHTS=[...LIGHTS,torchLight,torchFill];
let shYaw0=null;
function updateStations(dt){
  for(const p of pieces){
    // piirtoetäisyys: kaukana (sumun takana) olevia rakennuksia ei piirretä
    {const far=dist2(p.x,p.z,P.pos.x,P.pos.z)>(scene.fog.far+25)**2;if(far===p.mesh.visible)p.mesh.visible=!far;}
    if(isFirePiece(p.t)){const f=p.mesh.userData.flame,d=p.data;const lit=d.fuel>0;f[0].visible=f[1].visible=lit;
      if(lit){const u=p.fl||(p.fl={cur:1,target:1,t:Math.random()*.2}),s=flick(u,dt);f[0].scale.set(.9+s*.12,.7+s*.45,.9+s*.12);f[1].scale.set(1,.8+s*.35,1);d.burn+=dt;
        if(dist2(p.x,p.z,P.pos.x,P.pos.z)<35*35){if(Math.random()<dt*3.2)emitEmber(p.x+(Math.random()-.5)*.4,p.y+.7,p.z+(Math.random()-.5)*.4,'spark');if(Math.random()<dt*.9)emitEmber(p.x+(Math.random()-.5)*.2,p.y+1.1,p.z+(Math.random()-.5)*.2,'smoke');}if(d.burn>=90){d.burn=0;d.fuel--;}for(const c of d.cook)c.t+=dt;}
      const fm=p.mesh.userData.food;if(fm)for(let i=0;i<4;i++){const c=d.cook[i],m=fm[i];m.visible=!!c;if(c){const r=c.t/c.need;m.material.color.setHex(r<1?(r<.6?0xc9554e:0xb06a42):r<2?0x7a4524:0x15110f);}}}
    if(p.t==='soihtuteline'||p.t==='seinasoihtu'){const f=p.mesh.userData.flame,on=p.data.burn>0;f[0].visible=f[1].visible=on;if(on){p.data.burn=Math.max(0,p.data.burn-dt);const u=p.fl||(p.fl={cur:1,target:1,t:Math.random()*.2}),s=flick(u,dt);f[0].scale.set(.9+s*.15,.7+s*.5,.9+s*.15);f[1].scale.set(1,.8+s*.4,1);
        if(dist2(p.x,p.z,P.pos.x,P.pos.z)<30*30){if(Math.random()<dt*1.8)emitEmber(p.x+(Math.random()-.5)*.15,p.y+1.9,p.z+(Math.random()-.5)*.15,'spark');if(Math.random()<dt*.4)emitEmber(p.x,p.y+2,p.z,'smoke');}}}
    if(p.t==='sulatin'){const run=(p.data.ore>0||p.data.iore>0)&&p.data.wood>0;p.mesh.userData.glow.visible=run;if(run){p.data.t+=dt;const iron=p.data.ore<=0;if(p.data.t>=(iron?10:7)){p.data.t=0;p.data.wood--;if(iron){p.data.iore--;p.data.idone++;}else{p.data.ore--;p.data.done++;}}}}
  }
  for(const g of graves){const same=(g.dim||'world')===curDim(),near=same&&dist2(g.x,g.z,P.pos.x,P.pos.z)<50*50;g.mesh.visible=same;g.beam.visible=near;   // v1.33 (kohta 13): majakka myös ulottuvuuksissa, hauta näkyy vain omassa tilassaan
    if(near)g.beam.material.opacity=.28+Math.sin(playTime*3)*.1;}
  for(let i=0;i<LIGHTS.length;i++){const l=LIGHTS[i];{const s=l.userData.src;if(s&&s.move)l.position.set(s.x,s.y,s.z);}   /* v1.23 liikkuvat valot (tulinuoli, palava mob) */
    const u=l.userData.fl||(l.userData.fl={cur:1,target:1,t:Math.random()*.2});{const s=l.userData.src;if(s&&s.fade!==false&&l.userData.base)l.userData.base=s.i*1.15;}l.intensity=!l.userData.base?0:l.userData.base*flick(u,dt)*(.95+Math.sin(playTime*(7+i*1.7)+i*3)*.05);}
  // Pistevalojen varjokartat päivitetään harvemmin (autoUpdate pois, needsUpdate nostetaan itse): pimeällä joka 2. (soihtu) / 3. (tuli) kehys,
  // päivällä harvemmin; vain jos valo palaa. Kun lähin tuli vaihtuu (updateLights), kartta päivitetään heti. Laatutaso (`QUAL`) voi harventaa lisää.
  {shFrame++;const dark=P.inDun||isNight()||indoorK>.5||wDark>.55,q=QUAL.lvl,rate=SET.shRate==='fast'?.5:SET.shRate==='slow'?2.5:1,fT=SET.shRate==='slow'?2:1;
   // Pelaaja (ja hänen varjonsa) on lähimmän tulen varjokameran kantamalla (15 m + marginaali) → tiheä päivitys. Kun pelaaja poistuu kantamalta,
   // kartta päivitetään vielä kerran, jottei pelaajan vanha varjo jää maahan (aiemmin säde oli 9 m ja varjo jäi näkyviin harvan päivityksen ajaksi).
   const nearL=dist2(LIGHTS[0].position.x,LIGHTS[0].position.z,P.pos.x,P.pos.z)<17*17,left=shNearPrev&&!nearL;shNearPrev=nearL;
   // kaukana tulesta: pimeällä 12, päivällä 30 kehyksen välein (ennen 60/120 → tulen lähellä liikkuvien varjot näyttivät jähmettyvän)
   const fF=Math.max(1,Math.round((nearL?(dark?2:4):(dark?12:30)*(SET.shFar?2:1))*(q>=1?2:1)*rate));
   if(SET.shRate==='slow'&&shFrame%3===0)sun.shadow.needsUpdate=true;
   // v1.44 (lista 4, kohta 30) shFar: paikallaan (ei liikettä, hyökkäystä eikä kameran kääntöä) auringon varjot joka 4. kuva, muuten joka kuva
   else if(SET.shFar&&SET.shRate!=='slow'){const mv=Math.hypot(P.vel.x,P.vel.z)>.2||P.atk||Math.abs(camYaw-(shYaw0??camYaw))>.002;shYaw0=camYaw;if(mv||shFrame%4===0)sun.shadow.needsUpdate=true;}
   if(QUAL.pointShadow){if(torchLight.intensity>0&&shFrame%fT===0)torchLight.shadow.needsUpdate=true;if(LIGHTS[0].intensity>0){if(shFrame%fF===0||shDirty||left)LIGHTS[0].shadow.needsUpdate=true;shDirty=false;}}}
  // Valokatto: pelaajan kohdalle osuva yhteisvalo (summa etäisyyden mukaan vaimennettuna) ei ylitä LIGHT_CAP:ia – päällekkäiset valot eivät kirkastu loputtomiin.
  {let W=0;const ls=ALL_LIGHTS;for(const l of ls)if(l.intensity>0){const d=Math.hypot(l.position.x-P.pos.x,l.position.y-(P.pos.y+1),l.position.z-P.pos.z);W+=l.intensity*Math.pow(Math.max(0,1-d/l.distance),1.5);}
   if(W>LIGHT_CAP){const k=LIGHT_CAP/W;for(const l of ls)l.intensity*=k;}}
}
