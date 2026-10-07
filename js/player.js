/* Hiidenmaa – player.js
   Pelaajan liike, fysiikka, animaatio, kuolema, uudelleensyntyminen, nukkuminen */
'use strict';

/* ---------------- PLAYER UPDATE ---------------- */
// Tikkaat: pelaaja kiipeää, kun hän on tikkaiden edessä (±.6 m sivusuunnassa, .9 m syvyyssuunnassa).
function ladderAt(pos){for(const p of pieces){if(bt(p.t)!=='tikkaat')continue;const dx=pos.x-p.x,dz=pos.z-p.z;if(dx*dx+dz*dz>5)continue;const a=p.rot*Math.PI/4,lx=dx*Math.cos(a)-dz*Math.sin(a),lz=dx*Math.sin(a)+dz*Math.cos(a),zc=-Math.max(0,pos.y-p.y)*Math.tan((p.f%3)*Math.PI/12);
  if(Math.abs(lx)<.65&&Math.abs(lz-zc)<.95&&pos.y>p.y-.3&&pos.y<p.y+WH-.05)return p;}return null;}
const _qh=new THREE.Quaternion(),_qf=new THREE.Quaternion(),_qd=new THREE.Quaternion(),_qt=new THREE.Quaternion(),_eb=new THREE.Euler();
let torchFl=null,torchBarT=0,torchIgn=0,shDark=0;const torchPh=[Math.random()*TAU,Math.random()*TAU];
function updatePlayer(dt){
  if(P.dead)return;updatePlayerBurn(dt);if(P.dead)return;
  P.invul=Math.max(0,P.invul-dt);P.stagger=Math.max(0,P.stagger-dt);P.hurtFlash=Math.max(0,P.hurtFlash-dt);
  const w=curWeapon();const wt=invWeight(),over=!devOn('weight')&&wt>MAXW;
  const fwd=_tmpV.set(-Math.sin(camYaw),0,-Math.cos(camYaw)),right=_tmpV2.set(Math.cos(camYaw),0,-Math.sin(camYaw));
  let mx=0,mz=0;if(state==='play'&&P.stagger<=0){if(kd('fwd'))mx+=1;if(kd('back'))mx-=1;if(kd('right'))mz+=1;if(kd('left'))mz-=1;}
  let dx=fwd.x*mx+right.x*mz,dz=fwd.z*mx+right.z*mz;const dl=Math.hypot(dx,dz);if(dl>0){dx/=dl;dz/=dl;}
  P.blocking=state==='play'&&mouseR&&w.cat!=='hammer'&&w.cat!=='bow'&&w.cat!=='shovel'&&P.stam>0&&!P.atk;
  // v1.39 (lista 4, kohta 18): rikkinäisellä kilvellä ei voi torjua (kilpi on selässä kunnes ehjä)
  {const sh0=equipped('shield');if(P.blocking&&sh0&&sh0.shBrk!=null&&!shieldOk(sh0)){P.blocking=false;if(playTime-(P.shMsgT||-9)>1.5){P.shMsgT=playTime;const r=Math.max(0,SHIELD_FIX-(playTime-sh0.shBrk));msg(`Kilpi on rikki (${Math.floor(r/60)}:${String(Math.floor(r%60)).padStart(2,'0')})`,'warn');}}}
  const armor=equipped('armor');
  {const c0=P.crouch;P.crouch=state==='play'&&kd('crouch')&&P.onGround&&!P.swim;if(c0&&!P.crouch)P.uncrouchT=playTime;}   // v1.39: kyykystä nousun hetki (eläimet säikähtävät 0,1 s viiveellä)
  let speed=4.6;const wantRun=kd('run')&&!P.crouch;
  P.running=false;
  // v1.39 (lista 4, kohta 3): ylämäkeen juoksu ja hyppy kuluttavat kestävyyttä +30 % (rinne > ~6°, jyrkemmässä enintään +60 %)
  let upK=1;if(dl>0&&!P.inDun){const sl=(terrainH(P.pos.x+dx*.6,P.pos.z+dz*.6)-terrainH(P.pos.x,P.pos.z))/.6;if(sl>.1)upK=1.3+clamp((sl-.35)*.6,0,.3);}P.upK=upK;
  if(wantRun&&dl>0&&!over&&P.stam>0&&!P.blocking&&!P.drawing){speed=8;P.running=true;P.stam-=13*dt*upK;P.stamDelay=.8;}
  if(P.blocking||P.drawing)speed=2.4;if(over)speed*=.55;if(armor&&ITEMS[armor.id].slow)speed*=1-ITEMS[armor.id].slow;if(P.atk)speed*=.45;if(P.crouch)speed=Math.min(speed,2.3);if(P.zone==='suo'&&!P.inDun&&!P.swim)speed*=.85;speed*=P.fx.speed;if(DEV&&keys.KeyV)speed*=10;// DEV: V pohjassa 10× nopeampi
  P.inWater=P.pos.y<-.9&&!P.inDun;P.swim=P.pos.y<-1.3&&!P.inDun;
  if(P.swim){speed=2.6;P.stam-=(dl>0?6:2)*dt;P.stamDelay=.6;if(P.stam<=0){P.hp-=4*dt;if(P.hp<=0)playerDie();}}
  // stamina regen
  P.stamDelay-=dt;if(P.stamDelay<=0&&!P.swim){let r=22*P.fx.stamRegen;P.stam=Math.min(maxStam(),P.stam+r*dt);}
  if(P.blocking&&P.stam<=0)P.blocking=false;
  P.stam=Math.max(0,P.stam);if(devOn('stam'))P.stam=maxStam();// DEV: kestävyys ei kulu
  // velocity
  P.vel.x=lerp(P.vel.x,dx*speed,Math.min(1,dt*(P.onGround?12:3)));P.vel.z=lerp(P.vel.z,dz*speed,Math.min(1,dt*(P.onGround?12:3)));
  // v1.37 (lista 3, kohta 33): DEV-lento. Kun "Lento" on päällä, tuplahyppy (2 painallusta 0,35 s sisällä) aloittaa tai lopettaa lennon.
  // Lennossa välilyönti nousee, Shift laskee, Ctrl nopeampi; ei painovoimaa eikä putoamisvahinkoa.
  {const jd=state==='play'&&kd('jump');if(jd&&!P.jumpHeld){if(devOn('fly')&&playTime-(P.jumpTap||-9)<.35){P.flying=!P.flying;P.vy=0;msg(P.flying?'Lento päällä (välilyönti ylös, Shift alas).':'Lento pois.');P.jumpTap=-9;}else P.jumpTap=playTime;}P.jumpHeld=jd;if(!devOn('fly'))P.flying=false;}
  if(P.flying){const fs=keys.ControlLeft||keys.ControlRight?32:16;P.vel.x=lerp(P.vel.x,dx*fs,Math.min(1,dt*6));P.vel.z=lerp(P.vel.z,dz*fs,Math.min(1,dt*6));}
  if(state==='play'&&kd('jump')&&P.onGround&&!P.swim&&P.stam>=8&&!over&&!P.flying){P.vy=7.2;P.onGround=false;P.stam-=8*(P.upK||1);P.stamDelay=.8;}
  const lad=!P.swim&&!P.dead&&ladderAt(P.pos);P.onLadder=!!lad;
  if(P.flying){P.vy=lerp(P.vy,(kd('jump')?9:0)-(keys.ShiftLeft||keys.ShiftRight?9:0),Math.min(1,dt*6));P.onGround=false;}
  else if(P.swim){P.vy=lerp(P.vy,(-1.25-P.pos.y)*3,dt*4);}
  else if(lad&&(kd('fwd')||kd('jump')||kd('back'))){P.vy=kd('back')&&!kd('fwd')&&!kd('jump')?-2.6:2.6;P.onGround=false;}
  else if(lad&&!P.onGround){P.vy=Math.max(P.vy,-1);}
  else P.vy-=22*dt;
  const feet=P.pos.y;
  P.pos.x+=P.vel.x*dt;P.pos.z+=P.vel.z*dt;
  // v0.86 erillinen tönäisy (hirvi, karhu: def.kb): ei muuta tavallista liikefysiikkaa, vaimenee e^(−4,5 t) → matka ≈ kb / 4,5 m
  if(P.kbx||P.kbz){P.pos.x+=P.kbx*dt;P.pos.z+=P.kbz*dt;const kk=Math.exp(-dt*4.5);P.kbx*=kk;P.kbz*=kk;if(Math.abs(P.kbx)+Math.abs(P.kbz)<.05)P.kbx=P.kbz=0;}
  collideXZ(P.pos,.38,1.8,feet);
  P.pos.y+=P.vy*dt;
  const ceil=ceilingAt(P.pos.x,P.pos.z,.38,feet+1.8);if(P.vy>0&&P.pos.y+1.8>ceil){P.pos.y=ceil-1.8;P.vy=0;}
  const g=groundAt(P.pos.x,P.pos.z,.38,feet);
  if(P.pos.y<=g+.02&&P.vy<=0){if(!P.onGround&&P.vy<-4)P.landT=.25;if(!P.onGround&&P.vy<-15&&!P.flying){const fd=(-P.vy-15)*6;P.hp-=fd;floatText('-'+Math.round(fd),P.pos.x,P.pos.y+2,P.pos.z,'#e0614f');if(P.hp<=0)playerDie();}P.pos.y=g;P.vy=0;P.onGround=true;}
  else if(P.pos.y>g+.3)P.onGround=false;
  if(P.pos.y<g&&P.vy<=0)P.pos.y=g;
  // world bounds
  const R=Math.hypot(P.pos.x,P.pos.z),RM=HALF+15;if(!P.inDun&&R>RM){P.pos.x*=RM/R;P.pos.z*=RM/R;}
  // facing
  if(P.atk||P.blocking||P.drawing){P.yaw=lerpAngle(P.yaw,camYaw+Math.PI,Math.min(1,dt*((P.turnWait||0)>0?9:18)));}
  else if(dl>0)P.yaw=lerpAngle(P.yaw,Math.atan2(P.vel.x,P.vel.z),Math.min(1,dt*10));
  // attack
  if(P.atk&&(P.turnWait||0)>0){P.turnWait-=dt;if(P.turnWait<=0)P.yaw=camYaw+Math.PI;}
  else if(P.atk){P.atk.t+=dt;if(!P.atk.done&&P.atk.t>=P.atk.hitAt){P.atk.done=true;doMeleeHit(P.atk.w);}if(P.atk.t>=P.atk.dur)P.atk=null;}
  if(!P.atk&&mouseL&&state==='play'&&w.cat==='weapon'&&locked)startAttack();
  else if(mouseL&&state==='play'&&w.cat==='shovel'&&locked)useTool(false);
  else if(mouseR&&state==='play'&&w.cat==='shovel'&&locked)useTool(true);   // v0.96 oikea pohjassa: toissijainen (polku / värin palautus)
  if(P.drawing){P.bowDraw=Math.min(1,P.bowDraw+dt/bowDrawTime());P.stam-=6*dt;P.stamDelay=.5;if(P.stam<=0){P.drawing=false;fireBow();}}
  // animate figure
  // v0.93 harppova juoksu: juoksukerroin runK 0 (kävely 4,6) → 1 (juoksu 8); askel pitenee ja tahti harvenee juostessa, kävelyssäkin hieman
  // v1.12 (välilisäys 3): runK pehmennetään (nousu 6/s, lasku 2,2/s), jotta juoksusta kävelyyn etukeno, askel ja kädet palautuvat rauhallisesti
  const hv=Math.hypot(P.vel.x,P.vel.z),runK0=clamp((hv-4.8)/2.8,0,1)*(P.crouch||P.swim?0:1);P.runKs=lerp(P.runKs||0,runK0,Math.min(1,dt*(runK0>(P.runKs||0)?6:2.2)));
  const runK=P.runKs<.002?0:P.runKs;P.walkPh+=hv*dt*1.8*(1-.28*runK);
  const sw=Math.sin(P.walkPh)*Math.min(1,hv/4)*(.82+.2*runK);
  fig.g.position.copy(P.pos);if(P.swim)fig.g.position.y=P.pos.y-.2;fig.g.rotation.y=P.yaw;
  P.crouchK=lerp(P.crouchK,P.crouch?1:0,Math.min(1,dt*9));
  // Jalat: lonkka + polvi. Kävely, ilma (hyppy), laskeutumisen joustaminen, iskun askel ja kyykky (polvet syvälle koukkuun, vartalo etukenoon).
  {let bobC=0;const K=P.crouchK;P.landT=Math.max(0,(P.landT||0)-dt);const land=Math.min(1,P.landT/.25);
   let thL=sw,thR=-sw,knL=.08+Math.max(0,-sw)*.9,knR=.08+Math.max(0,sw)*.9,lunge=0;
   // perinteinen juoksu: takajalka ojentuu taakse (kantapää ylhäällä), etureisi nousee korkealle, polvi koukistuu jalan heilahtaessa eteen
   if(runK>0&&P.onGround){const leg=ph=>{const s=Math.sin(ph),c=Math.cos(ph);return[-.22-.92*s,.2+Math.max(0,c)*(s<0?1.5:.5)+Math.max(0,s)*.35];};
     const [a1,b1]=leg(P.walkPh+Math.PI),[a2,b2]=leg(P.walkPh);thL=lerp(thL,a1,runK);knL=lerp(knL,b1,runK);thR=lerp(thR,a2,runK);knR=lerp(knR,b2,runK);}
   if(!P.onGround&&!P.swim){thL=-.5;thR=.25;knL=.75;knR=.5;}
   if(land>0){thL=lerp(thL,-.55,land);thR=lerp(thR,-.55,land);knL=lerp(knL,1.0,land);knR=lerp(knR,1.0,land);}
   if(P.atk&&!(P.turnWait>0)){lunge=Math.sin(Math.PI*clamp(P.atk.t/P.atk.dur,0,1));thL-=.3*lunge;thR+=.2*lunge;knL+=.3*lunge;knR+=.15*lunge;}
   // Kyykkykävely: isot, hitaat askeleet (reiden heilahdus ±.6, takajalka koukussa kun jalka nousee eteen), runko hieman keinuu
   if(K>0){const mv=Math.min(1,hv/1.4),ph=P.walkPh*.75,cw=Math.sin(ph)*mv*.6,liftL=Math.max(0,-Math.cos(ph))*.55*mv,liftR=Math.max(0,Math.cos(ph))*.55*mv;
     thL=lerp(thL,-1.0+cw,K);thR=lerp(thR,-1.0-cw,K);knL=lerp(knL,1.8-cw*.8+liftL,K);knR=lerp(knR,1.8+cw*.8+liftR,K);bobC=Math.abs(Math.sin(ph))*.035*mv*K;}
   fig.legL.rotation.x=thL;fig.legR.rotation.x=thR;fig.kneeL.rotation.x=knL;fig.kneeR.rotation.x=knR;
   const drop=.3*K+.09*land+.05*lunge-bobC-Math.abs(Math.cos(P.walkPh))*.05*runK;fig.rig.position.y=-drop;fig.rig.rotation.x=.1*K+.07*lunge+.05*land+.13*runK;fig.head.rotation.x=-.12*K-.04*lunge;
   // v1.12 (välilisäys 3): sivukeinunta – runko kallistuu sen jalan puolelle, joka on edessä (oikea edessä kun sin(walkPh) > 0, +z = oikealle);
   // kävely ±2°, juoksu ±5°; voimakkuus seuraa nopeutta ja pehmennettyä runK:ta, joten paluu suoraan on pehmeä
   // v1.53: kävelyssä ei sivukeinuntaa, juoksussa ±2,6° (ennen ±4,4°); osa juoksun kallistuksesta eteenpäin askeltahdissa (|sin| · 2°)
   {const on=P.onGround&&!P.swim?Math.min(1,hv/4)*(1-K):0,tz=Math.sin(P.walkPh)*on*.045*runK;fig.rig.rotation.z=tz;fig.rig.rotation.x+=Math.abs(Math.sin(P.walkPh))*on*.035*runK;}}
  // Kädet: lasketaan tavoitekulmat ja siirrytään niihin pehmeästi (ei äkillisiä hyppyjä).
  let tRx=sw*(.63+.315*runK),tRz=0,tLx=-sw*(.63+.315*runK),tLz=0,tSh=.35,rate=14,grip=false,eRo=null,eLo=null;
  if(runK>.3&&!P.atk&&!P.blocking&&!P.drawing){eRo=-1.15*runK;eLo=-1.15*runK;}   // juostessa kyynärpäät koukussa
  const hold=mouseL&&state==='play';
  if(P.atk){const k=P.atk.t/P.atk.dur,hk=P.atk.hitAt/P.atk.dur,two=(P.atk.w.chop||P.atk.w.pick)&&!P.atk.offBusy,sd=P.atk.side||1;
    if(P.atk.w.id==='keihas'){// työntö: nostokulma = kohteen suunta; käsi vedetään taakse ja ojennetaan
      const p=P.atk.aimP||0,tw=P.turnWait>0?0:1;let a;if(k<hk*.8)a=lerp(-.1,.5,sstep(0,1,k/(hk*.8)));else if(k<hk)a=lerp(.5,-p,sstep(0,1,(k-hk*.8)/(hk*.2)));else a=lerp(-p,0,Math.min(1,(k-hk)/.3));
      tRx=a;tRz=-.12;eRo=k<hk?Math.min(0,-p-a):Math.min(0,-p-a)*Math.max(0,1-(k-hk)/.3);}
    else{// viistoisku (v0.72): avainasennot [olka rx, olka rz, kyynärpää] – nosto olan yli (kyynärpää koukussa, ase pään takana),
      // isku viistosti alas vartalon eteen, loppuliike vartalon edessä. Vuorotellen oikean olan yli (sd<0) ja vasemman olan yli (sd>0).
      // armR: rz > 0 = kohti keskilinjaa/vasenta, rz < 0 = ulospäin oikealle; rx < 0 = eteen/ylös.
      // v1.37 (lista 3, kohdat 23 ja 31): kahden käden kirves- ja hakkuisku (CHOP): nostossa kädet koukistuvat ja ase nousee olan yli
      // viistoon (vuorotellen vasen/oikea olka) eikä pään yli; käsi ja varsi ohjataan IK:lla (chopIK), vasen käsi pysyy varressa.
      const W=two?(sd>0?CHOP.WL:CHOP.WR):(sd>0?[-2.3,.45,-1.35]:[-2.5,-.3,-1.2]);
      const H=two?(sd>0?CHOP.HL:CHOP.HR):(sd>0?[-1.0,-.38,-.25]:[-.95,.42,-.25]);
      const E=two?(sd>0?CHOP.EL:CHOP.ER):(sd>0?[-.72,-.22,-.35]:[-.7,.45,-.35]);// loppuliike laskeutuu vartalon eteen (ei käsivartta sivulle)
      let el;[tRx,tRz,el]=swingPose(k,hk,W,H,E,hold);eRo=el;}
    rate=k<hk+.12?30:13;if(two&&(k<hk+.3||hold)){grip=true;tSh=.31;}}
  if(P.crouchK>.4&&!P.atk&&!P.blocking&&!P.drawing){const K=P.crouchK;tLx=lerp(tLx,-.5,K);tLz=lerp(tLz,.85,K);tRx=lerp(tRx,-.25,K);tRz=lerp(tRz,-.75,K);eLo=-.95*K;}// kyykky: vasen käsi koukussa sivulla ja alhaalla, oikea sivulla

  if(P.blocking){tLx=-.65+Math.sin(playTime*3)*.03;tLz=-.8;eLo=-1.2;}// torjunta: vasen käsi koukussa oikealle ruumiin eteen, kilpi eteenpäin
  // Jousen veto: jousikäsi suoraan eteen hieman sisäänpäin (jänne vedetään leuan kohdalle), vetokäsi IK:lla jänteelle
  if(P.drawing){tLx=-1.58;tRx=-1.5;tRz=.5;}
  if(heldMesh&&ITEMS[heldId].cat==='bow'){if(P.drawing)tLz=-.3;}
  if(P.atk)P.recT=.55;else P.recT=Math.max(0,(P.recT||0)-dt);if(!P.atk&&P.recT>0&&!P.drawing&&!P.blocking)rate=Math.min(rate,5);// iskun jälkeen kädet palaavat lepoon pehmeästi
  const e=Math.min(1,dt*rate);
  armSh+=(tSh-armSh)*e;fig.armL.position.x=armSh;fig.armR.position.x=-armSh;
  fig.armR.rotation.y=lerpAngle(fig.armR.rotation.y,0,e);fig.armL.rotation.y=lerpAngle(fig.armL.rotation.y,0,e);fig.armR.rotation.x=lerpAngle(fig.armR.rotation.x,tRx,e);fig.armR.rotation.z=lerpAngle(fig.armR.rotation.z,tRz,e);
  fig.armL.rotation.x=lerpAngle(fig.armL.rotation.x,tLx,e);fig.armL.rotation.z=lerpAngle(fig.armL.rotation.z,tLz,e);
  // Kyynärpäät taipuvat sitä enemmän mitä korkeammalle käsivarsi nousee (jousella vetokäsi taipuu, jousikäsi suorana)
  {const bendR=-(.14+clamp(-fig.armR.rotation.x,0,2.8)*.28),bendL=-(.14+clamp(-fig.armL.rotation.x,0,2.8)*.28);
   let tR=eRo!==null?eRo:bendR,tL=eLo!==null?eLo:bendL;if(P.drawing){tL=-.05;tR=-(.5+P.bowDraw*.9);}
   fig.elbowR.rotation.x=lerp(fig.elbowR.rotation.x,tR,Math.min(1,dt*(P.atk?20:8)));fig.elbowL.rotation.x=lerp(fig.elbowL.rotation.x,tL,Math.min(1,dt*(P.atk?20:8)));}
  // Jousi pysyy pystyssä (kämmenen kierto kumotaan käsivarren kulmalla); jänne ja nuoli seuraavat vetoa.
  // v1.22 (lista 2, kohta 14): levossa jousi heiluu käden mukana kuten muutkin esineet (ennen käden kierto kumottiin → jousi jäykkänä);
  // vedossa asento lasketaan alempana (bowAim).
  if(heldMesh&&ITEMS[heldId].cat==='bow'){heldMesh.rotation.set(-.15,0,0);heldMesh.position.set(0,0,-.12).applyQuaternion(heldMesh.quaternion);/* v1.57: ote rungon kahvasta (kaaren huippu z=.12 käteen; ennen käsi 12 cm rungon takana) */updateBowMesh(heldMesh,P.drawing?P.bowDraw:0);}
  // Kahden käden ote kirveestä: vasen käsi tarttuu varteen (IK, gripK pehmentää otteeseen menon ja irrotuksen).
  P.gripK=lerp(P.gripK||0,grip&&heldMesh?1:0,Math.min(1,dt*(grip?22:10)));
  if(!(P.drawK>.5))armClear(fig.armR,fig.elbowR,fig.hand);
  chopIK(dt);   // v1.37: kirves/hakku IK:lla (armClearin jälkeen, jotta varren suunta pysyy)
  if(P.gripK>.01&&heldMesh&&(ITEMS[heldId].chop||ITEMS[heldId].pick)){fig.g.updateMatrixWorld(true);
    // Otekohta varrella: lähin piste vasempaan olkaan varren välillä 0,11–0,42 m oikeasta kädestä (kädet eivät mene päällekkäin)
    // Oikea käsi tuodaan tarvittaessa keskilinjaa kohti, jotta vasen ylettyy (kädet ≤ 0,58 m vasemmasta olasta)
    fig.armL.getWorldPosition(_ikS);fig.hand.getWorldPosition(_ikH);const ex=_ikH.distanceTo(_ikS)-.58;
    if(ex>0&&!(P.chopW>.3)){_ikH.addScaledVector(_ikT.copy(_ikS).sub(_ikH).normalize(),ex*P.gripK);armIK(fig.armR,fig.elbowR,_ikH,1,_poleR);if(armClear(fig.armR,fig.elbowR,fig.hand))fig.g.updateMatrixWorld(true);fig.armL.getWorldPosition(_ikS);}
    heldMesh.worldToLocal(_ikS);_gp.set(0,0,clamp(_ikS.z,.17,.42));heldMesh.localToWorld(_gp);armIK(fig.armL,fig.elbowL,_gp,P.gripK);}   // v1.37: kädet ≥ 0,17 m erillään

  armClear(fig.armL,fig.elbowL,fig.handL);
  // Jousen veto: oikea käsi jänteellä nuolen kannan kohdalla.
  P.drawK=lerp(P.drawK||0,P.drawing&&heldMesh&&ITEMS[heldId].cat==='bow'?1:0,Math.min(1,dt*14));
  {const bk=P.drawK>.01&&heldMesh&&heldMesh.userData.bow?P.drawK:0;fig.rig.rotation.y=-.55*bk;fig.head.rotation.y=.55*bk;if(bk)bowAim(heldMesh,bk);}   // v1.22 ampuja-asento: vartalo sivuttain, pää eteen
  // Kilpi torjunnassa: käännetään (pehmeästi, blockK) osoittamaan eteenpäin – kämmenen kierto kumotaan niin että kilven normaali (x) on hahmon +z
  if(offMesh&&offId&&ITEMS[offId].cat==='shield'){P.blockK=lerp(P.blockK||0,P.blocking?1:0,Math.min(1,dt*10));
    if(P.blockK>.01){fig.g.updateMatrixWorld(true);fig.handL.getWorldQuaternion(_qh);fig.g.getWorldQuaternion(_qf);_qd.copy(_qf).multiply(_qt.setFromEuler(_eb.set(0,-Math.PI/2,0)));
      _qh.invert().multiply(_qd);offMesh.quaternion.identity().slerp(_qh,P.blockK);offMesh.position.set(0,0,P.blockK*.0);}
    else offMesh.quaternion.identity();}
  // vyöllä roikkuva vasara heiluu askelten tahdissa ja kallistuu hieman taakse juostessa
  if(backHang){const hv2=Math.hypot(P.vel.x,P.vel.z);backHang.rotation.x=.05+Math.min(.22,hv2*.022)+Math.sin(P.walkPh*2)*.05*Math.min(1,hv2/4);/* > 0 = varren alapää taaksepäin, ei vartalon sisään */backHang.rotation.z=Math.sin(P.walkPh)*.06*Math.min(1,hv2/4);}
  fig.g.visible=camDist>1.8;
  // torch light
  const ts=torchSlot();let torch=false;
  if(ts){if(ts.fuel===undefined)ts.fuel=torchMax(ts);if(ts.lit===undefined)ts.lit=true;
    if(ts.lit&&ts.fuel>0){ts.fuel-=dt*(P.running?1.2:1);
      if(wRain>.5&&!shelterCache&&!P.inDun){ts.lit=false;msg('Sade sammutti soihtusi! Sytytä se uudelleen viemällä se kiinni toiseen liekkiin ja odota hetki.','warn');sfx('hit');}
      else if(P.inWater&&!P.inDun){ts.lit=false;msg('Vesi sammutti soihtusi! Sytytä se uudelleen viemällä se kiinni toiseen liekkiin ja odota hetki.','warn');sfx('hit');}
      else if(ts.fuel<=0){ts.fuel=0;ts.lit=false;msg('Soihtusi paloi loppuun! Avaa reppu (Tab) ja napsauta soihtua – sieltä voit lisätä siihen pihkaa. Sen jälkeen sytytä se toisen liekin avulla.','warn');invDirty=true;}}
    else if(ts.fuel>0){// v1.41 (lista 4, kohdat 21–22): uudelleensytytys alle 2,5 m nuotiosta, soihtutelineestä, seinäsoihdusta tai
      // ulottuvuuden/Hautakummun soihdusta; heti viesti "Pysy paikallasi hetki…", 1–1,5 s paikallaan → syttyy (liike nollaa).
      let near=false;const R2=2.5*2.5;for(const p of pieces){if(isFirePiece(p.t)?p.data.fuel>0:(p.t==='soihtuteline'||p.t==='seinasoihtu')&&p.data.burn>0){if(dist2(p.x,p.z,P.pos.x,P.pos.z)<R2&&Math.abs((p.y||0)-P.pos.y)<3){near=true;break;}}}
      if(!near&&P.inDun){const dim=curDim();for(const f of FLAMES)if(f.dim===dim&&dist2(f.x,f.z,P.pos.x,P.pos.z)<R2&&Math.abs(f.y-P.pos.y-1.5)<2.5){near=true;break;}}
      const still=Math.hypot(P.vel.x,P.vel.z)<.6;
      if(near&&!P.inWater&&!(wRain>.5&&!shelterCache&&!P.inDun)){if(torchIgn<=0){msg('Pysy paikallasi hetki – soihtu syttyy…');P.ignNeed=1+Math.random()*.5;}if(still)torchIgn+=dt;else torchIgn=Math.max(.001,torchIgn-dt);if(torchIgn>=(P.ignNeed||1.2)){ts.lit=true;torchIgn=0;msg('Sytytit soihdun!','loot');sfx('pickup');}}else torchIgn=0;}
    // Käsisoihdun varjo vain pimeässä (yö, sisällä, luolasto, synkkä sää, Aarnimetsä); päivänvalossa varjokameran kantama kutistuu nollaan (liukuu pois), pimeässä 2.4 m
    {const dk=P.inDun?1:Math.max(1-lightK,indoorK,aarniK*.9,wDark>.55?.7:0);shDark+=(dk-shDark)*Math.min(1,dt*2.5);const far=.3+Math.max(0,shDark-.25)/.75*2.1;if(Math.abs(torchLight.shadow.camera.far-far)>.02){torchLight.shadow.camera.far=far;torchLight.shadow.camera.updateProjectionMatrix();}}
    torch=!!torchSlot()&&ts.lit&&ts.fuel>0;torchBarT-=dt;if(torchBarT<=0){torchBarT=1;invDirty=true;}
    const fl0=offMesh&&offMesh.userData.flame;if(fl0)for(const f of fl0)f.visible=torch;}
  if(torch){const u=torchFl||(torchFl={cur:1,target:1,t:0}),s=1+(flick(u,dt)-1)*.52+(Math.sin(playTime*1.7+torchPh[0])+Math.sin(playTime*3.1+torchPh[1]))*.02;{const kf=QUAL.pointShadow?.45:0;torchLight.intensity=2.6*s*(1-kf);torchFill.intensity=2.6*s*kf;}fig.handL.getWorldPosition(torchLight.position);torchLight.position.y+=.6;torchFill.position.copy(torchLight.position);
    // Liekit elävät, kipinöitä ja savua lähtee satunnaisesti kärjestä
    const fl=offMesh&&offMesh.userData.flame;if(fl){fl[0].scale.set(.95+s*.05,.9+s*.2,.95+s*.05);fl[1].scale.set(1,.9+s*.15,1);fl[2].scale.set(1,.85+s*.2,1);fl[3].material.opacity=.2+s*.06;fl[3].scale.setScalar(.92+s*.12);offMesh.rotation.z=Math.sin(playTime*3.1)*.04;}
    if(fig.g.visible){_tmpV.set(0,.4,.62);if(offMesh)offMesh.localToWorld(_tmpV);if(Math.random()<dt*7)emitEmber(_tmpV.x+(Math.random()-.5)*.08,_tmpV.y,_tmpV.z+(Math.random()-.5)*.08,'spark');if(Math.random()<dt*1.6)emitEmber(_tmpV.x,_tmpV.y+.1,_tmpV.z,'smoke');}}
  else{torchLight.intensity=0;torchFill.intensity=0;}
}
// Isku: nosto ylävasemmalle, isku alaoikealle (osuma iskun lopussa). Palautus lepoon, tai jos
// lyöntinappi on pohjassa, suoraan seuraavan iskun nostoasentoon (käsi pysyy aseessa).
let armSh=.35;
// Avainasennot W (nosto), H (osuma), E (loppuliike), lepo REST. Nosto 55 % osumaan asti, isku nopeasti, loppuliike ja palautus pehmeästi.
const CHOP={WL:[-1.0,.35,-.7],WR:[-1.0,-.3,-.7],HL:[-1.0,-.25,-.25],HR:[-.95,.25,-.25],EL:[-.78,-.15,-.4],ER:[-.75,.28,-.4]};
const REST=[-.2,0,-.3],L3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
function swingPose(k,hk,W,H,E,hold){const wk=hk*.55;
  if(k<wk)return L3(REST,W,sstep(0,1,k/wk));
  if(k<hk)return L3(W,H,sstep(0,1,(k-wk)/(hk-wk)));
  const kf=Math.min(1,(k-hk)/.16);if(kf<1)return L3(H,E,sstep(0,1,kf));
  return L3(E,REST,sstep(0,1,Math.min(1,(k-hk-.16)/Math.max(.05,1-hk-.16))));}
// Kädet eivät mene vartalon läpi: vartalo = ellipsi rig-koordinaateissa (x 0,27, z 0,16, korkeus 0,78–1,55 m). Jos kämmen tai
// kyynärpää on sisällä, olkaa nostetaan ensin eteenpäin (rx, vartalon eteen) ja vasta vaakatasossa ulospäin (rz), kunnes ulkona. Palauttaa käytettyjen askelten määrän.
const _bp=new V3();
function bodyPen(o,r){o.getWorldPosition(_bp);fig.rig.worldToLocal(_bp);if(_bp.y<.78||_bp.y>1.55)return 0;const e=(_bp.x/(.27+r))**2+(_bp.z/(.16+r))**2;return e<1?1-e:0;}
/* v1.37 (lista 3, kohdat 23 ja 31): kirves- ja hakkuisku käänteisellä kinematiikalla. Avainasennot rig-koordinaateissa (oikea = −x, eteen +z):
   h = oikean käden paikka, d = varren suunta (kädestä terään). Nosto: kädet rinnan edessä, varsi nousee olan yli viistosti taakse
   (vuorotellen oikea/vasen olka) → terä kulkee pään sivulta ja takaa (≥ 0,4 m pään keskeltä). Isku: kädet alas eteen, varsi eteen-alas.
   Terän suunta (−y) johtaa liikettä (b = d kierrettynä +90° sivuakselin ympäri). Paino w nousee iskun alussa ja laskee lopussa
   (paluu tavalliseen asentoon). Vasen käsi tarttuu varteen kuten ennen (≥ 0,17 m oikeasta kädestä). */
const CHOP_K={WR:{h:[-.24,1.30,.36],d:[-.25,.75,-.6]},WL:{h:[.10,1.30,.40],d:[.25,.75,-.6]},HR:{h:[.0,1.05,.5],d:[.3,-.3,1]},HL:{h:[-.08,1.05,.5],d:[-.3,-.3,1]},
  ER:{h:[.08,.95,.46],d:[.55,-.4,.72]},EL:{h:[-.16,.95,.46],d:[-.55,-.4,.72]}};
const _chH=new V3(),_chD=new V3(),_chB=new V3(),_chX=new V3(),_chY=new V3(),_chM=new THREE.Matrix4(),_chQ=new THREE.Quaternion(),_chQh=new THREE.Quaternion(),_chA=new V3(),_chC=new V3(),_poleChop=new V3(-.8,-1,.15),_poleChopX=new V3(-.4,-1,.5);
function chopLerp(A,B,t){_chA.fromArray(A.h).lerp(_chC.fromArray(B.h),t);_chH.copy(_chA);_chA.fromArray(A.d).normalize();_chC.fromArray(B.d).normalize();_chD.copy(_chA).lerp(_chC,t).normalize();}
function chopIK(dt){const w0=heldMesh&&ITEMS[heldId]&&(ITEMS[heldId].chop||ITEMS[heldId].pick)&&!(P.atk&&P.atk.offBusy);
  if(heldMesh&&!heldMesh.userData.q0)heldMesh.userData.q0=heldMesh.quaternion.clone();
  // v1.57: iskun loputtua ei hypätä lepoasentoon (ennen kirves pyörähti) – viimeinen asento häivytetään pehmeästi (paino −5/s)
  if(!w0||!P.atk){if(!w0||!P._chH||!(P.chopW>.001)){P.chopW=0;if(heldMesh&&heldMesh.userData.q0)heldMesh.quaternion.copy(heldMesh.userData.q0);return;}
    P.chopW=Math.max(0,P.chopW-dt*5);_chH.copy(P._chH);_chD.copy(P._chD);chopApply(P.chopW);return;}
  const k=P.atk.t/P.atk.dur,hk=P.atk.hitAt/P.atk.dur,sd=P.atk.side||1,wk=hk*.55,W=sd>0?CHOP_K.WL:CHOP_K.WR,H=sd>0?CHOP_K.HL:CHOP_K.HR,E=sd>0?CHOP_K.EL:CHOP_K.ER,hold=mouseL&&state==='play';
  // v1.57: jatkuvassa hakkuussa paino pysyy ja nosto alkaa edellisen iskun loppuasennosta (siirtymä koko nostovaiheen ajan,
  // ennen 82–87° hyppy yhdessä ruudussa)
  if(P._chAtk!==P.atk){P._chAtk=P.atk;P._chS=(P.chopW||0)>.5&&P._chH?{h:P._chH.clone(),d:P._chD.clone(),q:heldMesh.quaternion.clone()}:null;}
  let w;if(k<wk){chopLerp(W,W,0);if(P._chS){const t=sstep(0,1,k/wk);_chH.lerpVectors(P._chS.h,_chH,t);P._chBl=t;w=1;}else w=sstep(0,1,k/(wk*.45));}
  else if(k<hk){chopLerp(W,H,sstep(0,1,(k-wk)/(hk-wk)));w=1;}
  else{const kf=Math.min(1,(k-hk)/.16);chopLerp(H,E,sstep(0,1,kf));w=hold?1:1-sstep(0,1,Math.min(1,(k-hk-.16)/Math.max(.05,1-hk-.16)));}
  _chH.y+=.05;_chH.z+=.06;   // v1.57: kädet hieman ylempänä ja edempänä koko iskun ajan
  // v1.57: kohde ja paino pehmennetään (14/s) → ei nykäisyä iskujen välissä eikä lopussa
  {const a=Math.min(1,dt*14);if(!P._chH||!(P.chopW>.001)){P._chH=_chH.clone();P._chD=_chD.clone();}else{P._chH.lerp(_chH,a);P._chD.lerp(_chD,a).normalize();}
   P.chopW=(P.chopW||0)+(w-(P.chopW||0))*a;w=P.chopW;_chH.copy(P._chH);_chD.copy(P._chD);}
  if(w<=.001){heldMesh.quaternion.copy(heldMesh.userData.q0);return;}chopApply(w);
  if(P._chS&&k<wk){_chQ.copy(heldMesh.quaternion);heldMesh.quaternion.copy(P._chS.q).slerp(_chQ,P._chBl);}}   // kirveen kierto kiertona (slerp), ei pyörähdystä
function chopApply(w){
  fig.g.updateMatrixWorld(true);const T=fig.rig.localToWorld(_chA.copy(_chH));armIK(fig.armR,fig.elbowR,T,w,_chH.x>-.05?_poleChopX:_poleChop);
  // varren suunta maailmaan (rig → maailma kiertona) ja käden paikalliseksi kierroksi
  fig.g.updateMatrixWorld(true);fig.rig.getWorldQuaternion(_chQ);_chD.applyQuaternion(_chQ).normalize();
  {const dr=_chC.copy(_chD).applyQuaternion(_chQh.copy(_chQ).invert());_chB.set(0,-dr.z,dr.y).applyQuaternion(_chQ);}   // terä (−y) johtaa: d kierrettynä +90° rigin x-akselin ympäri
  _chB.addScaledVector(_chD,-_chB.dot(_chD));if(_chB.lengthSq()<1e-6)_chB.set(0,1,0);_chB.normalize();
  _chY.copy(_chB).negate();_chX.crossVectors(_chY,_chD).normalize();_chY.crossVectors(_chD,_chX).normalize();_chM.makeBasis(_chX,_chY,_chD);_chQ.setFromRotationMatrix(_chM);
  fig.hand.getWorldQuaternion(_chQh);_chQh.invert().multiply(_chQ);heldMesh.quaternion.copy(heldMesh.userData.q0).slerp(_chQh,w);}
function armClear(arm,elbow,hand){let i=0;const sx=Math.sign(arm.position.x)||1;for(;i<16;i++){fig.g.updateMatrixWorld(true);if(bodyPen(hand,.07)<=0&&bodyPen(elbow,.06)<=0)break;if(arm.rotation.x>-1.45)arm.rotation.x-=.06;else arm.rotation.z+=sx*.06;}return i;}
// Kahden nivelen IK napavektorilla (v0.72): kämmen osuu maailman pisteeseen T ja kyynärpää osoittaa luonnolliseen suuntaan (pole,
// vanhemman eli rigin koordinaateissa; oletus alas ja ulospäin). Olkavarsi a = 0,35 m, kyynärvarsi b = 0,33 m.
// Kyynärpää E = S + a·U, U = cosα·D + sinα·N (D = suunta kohteeseen, N = napavektorin D:tä vastaan kohtisuora osa, α kosinilauseesta).
// Olan asento kantavektoreista: paikallinen −y = U, +z = kyynärvarren taivutuspuoli (D:n U:ta vastaan kohtisuora osa), x = y × z.
// Kyynärpää taipuu paikallisen x:n ympäri: rotation.x = −f, f = π − kyynärpään sisäkulma. w = paino (slerp nykyisestä asennosta).
// Vanha versio (v0.68–0.71) käytti vain rx/rz-kulmia → taivutustaso kiinteä, kyynärpää saattoi jäädä rinnan sisään. Ks. KORJAUKSET.md.
const _gp=new V3(),IK_A=.35,IK_B=.33,_ikQ=new THREE.Quaternion(),_ikM=new THREE.Matrix4(),_ikX=new V3(),_ikY=new V3(),_ikZ=new V3(),_ikU=new V3(),_ikD=new V3(),_ikN=new V3();
function armIK(arm,elbow,T,w,pole){const V=arm.parent.worldToLocal(_ikV.copy(T)).sub(arm.position),L=V.length()||1e-4;
  const d=clamp(L,.12,IK_A+IK_B-.004);_ikD.copy(V).divideScalar(L);
  const sx=Math.sign(arm.position.x)||1,px=pole?pole.x:sx*.7,py=pole?pole.y:-1,pz=pole?pole.z:.3;
  _ikN.set(px,py,pz);_ikN.addScaledVector(_ikD,-_ikN.dot(_ikD));if(_ikN.lengthSq()<1e-6)_ikN.set(0,-1,0).addScaledVector(_ikD,_ikD.y);_ikN.normalize();
  const cA=clamp((IK_A*IK_A+d*d-IK_B*IK_B)/(2*IK_A*d),-1,1),sA=Math.sqrt(1-cA*cA);
  _ikU.copy(_ikD).multiplyScalar(cA).addScaledVector(_ikN,sA);
  const f=Math.PI-Math.acos(clamp((IK_A*IK_A+IK_B*IK_B-d*d)/(2*IK_A*IK_B),-1,1));
  _ikY.copy(_ikU).negate();_ikZ.copy(_ikD).addScaledVector(_ikU,-_ikD.dot(_ikU));if(_ikZ.lengthSq()<1e-6)_ikZ.copy(_ikN).negate();_ikZ.normalize();
  _ikX.crossVectors(_ikY,_ikZ).normalize();_ikM.makeBasis(_ikX,_ikY,_ikZ);_ikQ.setFromRotationMatrix(_ikM);
  arm.quaternion.slerp(_ikQ,w);elbow.rotation.x=lerp(elbow.rotation.x,-f,w);}
// v1.57: vetokäden kyynärpää kuten ennen, mutta olkapäästä hieman enemmän sivulle (napavektorin x −1 → −1,55)
const _ikV=new V3(),_ikS=new V3(),_ikH=new V3(),_ikT=new V3(),_poleR=new V3(-.7,-1,.3),_poleBow=new V3(-1.85,-.95,.15),_poleBowL=new V3(.9,-.6,0);
/* v1.22 (lista 2, kohta 14) jousen veto: jousi tuodaan keskelle eteen (vasen käsi IK:lla), jänne vedetään taakse pään oikealle puolelle
   (oikea käsi IK:lla). Ennen jänne ja oikea käsi menivät hahmon vasemmalle puolelle (jousen asento seurasi vasemman käden kiertoa).
   Pisteet hahmon suunnassa: F = eteen, Lv = vasemmalle (+x), y = posken korkeus. Jousen paikallinen +z = tähtäyssuunta (jänteeltä kahvaan). */
const _bwN=new V3(),_bwG=new V3(),_bwH=new V3(),_bwX=new V3(),_bwY=new V3(),_bwZ=new V3(),_bwM=new THREE.Matrix4(),_bwQ=new THREE.Quaternion(),_bwP=new THREE.Quaternion(),_bwO=new V3();
function bowAim(hm,k){const b=hm.userData.bow;fig.g.updateMatrixWorld(true);fig.head.getWorldPosition(_bwH);
  const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),lx=Math.cos(P.yaw),lz=-Math.sin(P.yaw),o=fig.g.position,y=_bwH.y+.22,full=.12-(b.tipZ-(.1+.32));
  _bwN.set(o.x+fx*.04-lx*.2,y-.09,o.z+fz*.04-lz*.2);   // v1.37 (lista 3, kohta 15): jänne vedetään enemmän oikealle (posken oikealle puolelle, olan suuntaan)
  _bwG.set(_bwN.x+fx*full+lx*.08,y-.02,_bwN.z+fz*full+lz*.08);   // kahva keskellä edessä (n. 4 cm vasemmalla keskilinjasta)
  armIK(fig.armL,fig.elbowL,_bwG,k,_poleBowL);fig.g.updateMatrixWorld(true);
  _bwZ.subVectors(_bwG,_bwN).normalize();_bwY.set(0,1,0).addScaledVector(_bwZ,-_bwZ.y).normalize();_bwX.crossVectors(_bwY,_bwZ);_bwM.makeBasis(_bwX,_bwY,_bwZ);
  _bwQ.setFromRotationMatrix(_bwM);hm.parent.getWorldQuaternion(_bwP);_bwQ.premultiply(_bwP.invert());hm.quaternion.slerp(_bwQ,k);
  _bwO.set(0,0,.12).applyQuaternion(hm.quaternion).negate();hm.position.lerp(_bwO,k);hm.updateMatrixWorld(true);
  _gp.set(0,0,b.ar.position.z+.02);hm.localToWorld(_gp);armIK(fig.armR,fig.elbowR,_gp,k,_poleBow);}
function lerpAngle(a,b,t){let d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*t;}
function playerDie(){if(state==='paused'||state==='intro'){P.hp=Math.max(P.hp,1);return;}
  if(devOn('god')){P.hp=Math.max(1,P.hp);return;}   // DEV: kuolemattomuus
  if(P.dead)return;P.dead=true;P.deaths++;P.hp=0;sfx('die');
  const items=inv.filter(Boolean).map(s=>({id:s.id,n:s.n,q:s.q}));inv=new Array(invN()).fill(null);invDirty=true;updateGear();setBuildSel(null);
  if(items.length){const y=P.inDun?DUN.y:terrainH(P.pos.x,P.pos.z);makeGrave({x:P.pos.x,y,z:P.pos.z,items});}
  startPlayerDeath();   // v1.37: kaatumis-/tuhka-animaatio (effects.js)
  closeAllForDeath();setTimeout(()=>{closeAllForDeath();state='dead';releaseLock();$('#deadS').hidden=false;$('#hud').hidden=true;},1400);
}
// Hautakasa: kivet + pieni valomajakka (läpikuultava pylväs + himmeä pistevalo), joka näkyy lähellä (updateStations).
function makeGrave(g){const m=new THREE.Group();m.add(bx(1,.5,1,mat(0x6a6862),0,.25,0),bx(.5,1.2,.2,mat(0x8f8d86),0,.9,-.3));
  const bm=new THREE.MeshBasicMaterial({color:0x8fffee,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.06,.3,8,8,1,true),bm);beam.position.y=4.4;m.add(beam);g.beam=beam;
  g.dim=g.dim||curDim();m.position.set(g.x,g.y,g.z);scene.add(m);g.mesh=m;g.light={x:g.x,y:g.y+1.4,z:g.z,c:0x8fffee,i:1.1,dun:g.dim!=='world',on:()=>(g.dim||'world')===curDim()};lightSources.push(g.light);graves.push(g);}
function graveVanish(g){const m=g.mesh;removeGrave(g,true);let t=0;burst(g.x,g.y+.4,g.z,0x6a5a44,18,4);sfx('crumble',.8,.6);
  fx.push({obj:m,t:0,update:(f,dt)=>{t+=dt;m.position.y=g.y-t*.9;m.rotation.z=Math.sin(t*9)*.05*(1-t/1.6);if(Math.random()<dt*14)burst(g.x+(Math.random()-.5),g.y+.1,g.z+(Math.random()-.5),0x5a4a36,2,2);return t>1.6;}});}
function removeGrave(g,keepMesh){if(!keepMesh)scene.remove(g.mesh);const i=graves.indexOf(g);if(i>=0)graves.splice(i,1);const j=lightSources.indexOf(g.light);if(j>=0)lightSources.splice(j,1);}
// v0.80: kuollessa kaikki valikot (reppu, kartta, arkku, DEV, päävalikko, asetukset, näppäinikkuna) suljetaan – vain kuoleman ruutu jää.
function closeAllForDeath(){if(openPanel)closePanels(false,true);if(state==='paused'||state==='ui')state='play';for(const id of ['#menu','#settings','#keyDlg'])if($(id))$(id).hidden=true;mouseL=mouseR=false;P.drawing=false;}
function respawn(){if(!P.dead||state!=='dead')return;endPlayerDeath();
  $('#deadS').hidden=true;$('#hud').hidden=false;P.dead=false;P.kbx=P.kbz=0;P.hp=maxHp()*.6;P.stam=maxStam();P.hunger=Math.max(P.hunger,40);P.buffs={};P.wetT=0;
  if(P.inDun){P.inDun=false;P.realm=null;for(const m of [...mobs])if(m.dun)mobRemove(m);}
  const bed=pieces.find(p=>p.t==='sanky'&&P.spawn&&p.x===P.spawn.x&&p.z===P.spawn.z);
  if(bed)P.pos.set(bed.x+1.3,groundAt(bed.x+1.3,bed.z,.3,bed.y+2),bed.z);else P.pos.set(LOC.spawn.x,terrainH(LOC.spawn.x,LOC.spawn.z),LOC.spawn.z);
  fig.g.rotation.x=0;P.vy=0;state='play';requestLock();msg('Heräät uudelleen. Hae tavarasi hautakasasta.');
}
function sleepAt(p){
  P.spawn={x:p.x,z:p.z};msg('Herätyspaikka asetettu.','loot');
  if(!isNight())return;
  bump('slept');
  if(!sheltered(p.x,p.y,p.z)){msg('Sänky tarvitsee katon yläpuolelleen.','warn');return;}
  if(mobs.some(m=>!m.dead&&m.def.ai==='hostile'&&dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z)<20*20)){msg('Et voi nukkua, vihollisia on lähellä.','warn');return;}
  fadeTo(()=>{flags.sleptN=nightId();dayT=.23;dayN++;P.buffs.levannyt=420;P.hunger=Math.max(20,P.hunger-15);P.hp=maxHp();for(const m of [...mobs])if(m.def.ai==='hostile'&&!m.dun)mobRemove(m);const gr=regrowForest();saveGame(true);msg(`Päivä ${dayN} alkaa.`+(gr.planted+gr.revived?' Metsä on kasvanut yön aikana.':''));});
}
