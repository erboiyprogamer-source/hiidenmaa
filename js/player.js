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
  if(P.dead)return;
  P.invul=Math.max(0,P.invul-dt);P.stagger=Math.max(0,P.stagger-dt);P.hurtFlash=Math.max(0,P.hurtFlash-dt);
  const w=curWeapon();const wt=invWeight(),over=!DEV&&wt>MAXW;
  const fwd=_tmpV.set(-Math.sin(camYaw),0,-Math.cos(camYaw)),right=_tmpV2.set(Math.cos(camYaw),0,-Math.sin(camYaw));
  let mx=0,mz=0;if(state==='play'&&P.stagger<=0){if(kd('fwd'))mx+=1;if(kd('back'))mx-=1;if(kd('right'))mz+=1;if(kd('left'))mz-=1;}
  let dx=fwd.x*mx+right.x*mz,dz=fwd.z*mx+right.z*mz;const dl=Math.hypot(dx,dz);if(dl>0){dx/=dl;dz/=dl;}
  P.blocking=state==='play'&&mouseR&&w.cat!=='hammer'&&w.cat!=='bow'&&P.stam>0&&!P.atk;
  const armor=equipped('armor');
  P.crouch=state==='play'&&kd('crouch')&&P.onGround&&!P.swim;
  let speed=4.6;const wantRun=kd('run')&&!P.crouch;
  P.running=false;
  if(wantRun&&dl>0&&!over&&P.stam>0&&!P.blocking&&!P.drawing){speed=8;P.running=true;P.stam-=13*dt;P.stamDelay=.8;}
  if(P.blocking||P.drawing)speed=2.4;if(over)speed*=.55;if(armor&&ITEMS[armor.id].slow)speed*=1-ITEMS[armor.id].slow;if(P.atk)speed*=.45;if(P.crouch)speed=Math.min(speed,2.3);speed*=P.fx.speed;if(DEV&&keys.Semicolon)speed*=10;// DEV: Ö pohjassa 10× nopeampi
  P.inWater=P.pos.y<-.9&&!P.inDun;P.swim=P.pos.y<-1.3&&!P.inDun;
  if(P.swim){speed=2.6;P.stam-=(dl>0?6:2)*dt;P.stamDelay=.6;if(P.stam<=0){P.hp-=4*dt;if(P.hp<=0)playerDie();}}
  // stamina regen
  P.stamDelay-=dt;if(P.stamDelay<=0&&!P.swim){let r=22*P.fx.stamRegen;P.stam=Math.min(maxStam(),P.stam+r*dt);}
  if(P.blocking&&P.stam<=0)P.blocking=false;
  P.stam=Math.max(0,P.stam);if(DEV)P.stam=maxStam();// DEV: kestävyys ei kulu
  // velocity
  P.vel.x=lerp(P.vel.x,dx*speed,Math.min(1,dt*(P.onGround?12:3)));P.vel.z=lerp(P.vel.z,dz*speed,Math.min(1,dt*(P.onGround?12:3)));
  if(state==='play'&&kd('jump')&&P.onGround&&!P.swim&&P.stam>=8&&!over){P.vy=7.2;P.onGround=false;P.stam-=8;P.stamDelay=.8;}
  const lad=!P.swim&&!P.dead&&ladderAt(P.pos);P.onLadder=!!lad;
  if(P.swim){P.vy=lerp(P.vy,(-1.25-P.pos.y)*3,dt*4);}
  else if(lad&&(kd('fwd')||kd('jump')||kd('back'))){P.vy=kd('back')&&!kd('fwd')&&!kd('jump')?-2.6:2.6;P.onGround=false;}
  else if(lad&&!P.onGround){P.vy=Math.max(P.vy,-1);}
  else P.vy-=22*dt;
  const feet=P.pos.y;
  P.pos.x+=P.vel.x*dt;P.pos.z+=P.vel.z*dt;
  collideXZ(P.pos,.38,1.8,feet);
  P.pos.y+=P.vy*dt;
  const ceil=ceilingAt(P.pos.x,P.pos.z,.38,feet+1.8);if(P.vy>0&&P.pos.y+1.8>ceil){P.pos.y=ceil-1.8;P.vy=0;}
  const g=groundAt(P.pos.x,P.pos.z,.38,feet);
  if(P.pos.y<=g+.02&&P.vy<=0){if(!P.onGround&&P.vy<-4)P.landT=.25;if(!P.onGround&&P.vy<-15){const fd=(-P.vy-15)*6;P.hp-=fd;floatText('-'+Math.round(fd),P.pos.x,P.pos.y+2,P.pos.z,'#e0614f');if(P.hp<=0)playerDie();}P.pos.y=g;P.vy=0;P.onGround=true;}
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
  else if(mouseL&&state==='play'&&w.cat==='shovel'&&locked)useShovel();
  if(P.drawing){P.bowDraw=Math.min(1,P.bowDraw+dt/bowDrawTime());P.stam-=6*dt;P.stamDelay=.5;if(P.stam<=0){P.drawing=false;fireBow();}}
  // animate figure
  const hv=Math.hypot(P.vel.x,P.vel.z);P.walkPh+=hv*dt*1.9;
  const sw=Math.sin(P.walkPh)*Math.min(1,hv/4)*.75;
  fig.g.position.copy(P.pos);if(P.swim)fig.g.position.y=P.pos.y-.2;fig.g.rotation.y=P.yaw;
  P.crouchK=lerp(P.crouchK,P.crouch?1:0,Math.min(1,dt*9));
  // Jalat: lonkka + polvi. Kävely, ilma (hyppy), laskeutumisen joustaminen, iskun askel ja kyykky (polvet syvälle koukkuun, vartalo etukenoon).
  {let bobC=0;const K=P.crouchK;P.landT=Math.max(0,(P.landT||0)-dt);const land=Math.min(1,P.landT/.25);
   let thL=sw,thR=-sw,knL=.08+Math.max(0,-sw)*.9,knR=.08+Math.max(0,sw)*.9,lunge=0;
   if(!P.onGround&&!P.swim){thL=-.5;thR=.25;knL=.75;knR=.5;}
   if(land>0){thL=lerp(thL,-.55,land);thR=lerp(thR,-.55,land);knL=lerp(knL,1.0,land);knR=lerp(knR,1.0,land);}
   if(P.atk&&!(P.turnWait>0)){lunge=Math.sin(Math.PI*clamp(P.atk.t/P.atk.dur,0,1));thL-=.3*lunge;thR+=.2*lunge;knL+=.3*lunge;knR+=.15*lunge;}
   // Kyykkykävely: isot, hitaat askeleet (reiden heilahdus ±.6, takajalka koukussa kun jalka nousee eteen), runko hieman keinuu
   if(K>0){const mv=Math.min(1,hv/1.4),ph=P.walkPh*.75,cw=Math.sin(ph)*mv*.6,liftL=Math.max(0,-Math.cos(ph))*.55*mv,liftR=Math.max(0,Math.cos(ph))*.55*mv;
     thL=lerp(thL,-1.0+cw,K);thR=lerp(thR,-1.0-cw,K);knL=lerp(knL,1.8-cw*.8+liftL,K);knR=lerp(knR,1.8+cw*.8+liftR,K);bobC=Math.abs(Math.sin(ph))*.035*mv*K;}
   fig.legL.rotation.x=thL;fig.legR.rotation.x=thR;fig.kneeL.rotation.x=knL;fig.kneeR.rotation.x=knR;
   const drop=.3*K+.09*land+.05*lunge-bobC;fig.rig.position.y=-drop;fig.rig.rotation.x=.1*K+.07*lunge+.05*land;fig.head.rotation.x=-.12*K-.04*lunge;}
  // Kädet: lasketaan tavoitekulmat ja siirrytään niihin pehmeästi (ei äkillisiä hyppyjä).
  let tRx=sw*.7,tRz=0,tLx=-sw*.7,tLz=0,tSh=.35,rate=14,grip=false,eRo=null,eLo=null;
  const hold=mouseL&&state==='play';
  if(P.atk){const k=P.atk.t/P.atk.dur,hk=P.atk.hitAt/P.atk.dur,two=P.atk.w.chop&&!P.atk.offBusy,sd=P.atk.side||1;
    if(P.atk.w.id==='keihas'){// työntö: nostokulma = kohteen suunta; käsi vedetään taakse ja ojennetaan
      const p=P.atk.aimP||0,tw=P.turnWait>0?0:1;let a;if(k<hk*.8)a=lerp(-.1,.5,sstep(0,1,k/(hk*.8)));else if(k<hk)a=lerp(.5,-p,sstep(0,1,(k-hk*.8)/(hk*.2)));else a=lerp(-p,0,Math.min(1,(k-hk)/.3));
      tRx=a;tRz=-.12;eRo=k<hk?Math.min(0,-p-a):Math.min(0,-p-a)*Math.max(0,1-(k-hk)/.3);}
    else{// viistoisku (v0.72): avainasennot [olka rx, olka rz, kyynärpää] – nosto olan yli (kyynärpää koukussa, ase pään takana),
      // isku viistosti alas vartalon eteen, loppuliike vartalon edessä. Vuorotellen oikean olan yli (sd<0) ja vasemman olan yli (sd>0).
      // armR: rz > 0 = kohti keskilinjaa/vasenta, rz < 0 = ulospäin oikealle; rx < 0 = eteen/ylös.
      const W=two?(sd>0?[-2.05,.22,-1.45]:[-2.15,-.08,-1.4]):(sd>0?[-2.3,.45,-1.35]:[-2.5,-.3,-1.2]);
      const H=two?(sd>0?[-1.0,-.25,-.25]:[-.95,.25,-.25]):(sd>0?[-1.0,-.38,-.25]:[-.95,.42,-.25]);
      const E=two?(sd>0?[-.78,-.15,-.4]:[-.75,.28,-.4]):(sd>0?[-.72,-.22,-.35]:[-.7,.45,-.35]);// loppuliike laskeutuu vartalon eteen (ei käsivartta sivulle)
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
  if(heldMesh&&ITEMS[heldId].cat==='bow'){heldMesh.rotation.set(-fig.armL.rotation.x-fig.elbowL.rotation.x,0,0);updateBowMesh(heldMesh,P.drawing?P.bowDraw:0);}
  // Kahden käden ote kirveestä: vasen käsi tarttuu varteen (IK, gripK pehmentää otteeseen menon ja irrotuksen).
  P.gripK=lerp(P.gripK||0,grip&&heldMesh?1:0,Math.min(1,dt*(grip?22:10)));
  if(!(P.drawK>.5))armClear(fig.armR,fig.elbowR,fig.hand);
  if(P.gripK>.01&&heldMesh&&ITEMS[heldId].chop){fig.g.updateMatrixWorld(true);
    // Otekohta varrella: lähin piste vasempaan olkaan varren välillä 0,11–0,42 m oikeasta kädestä (kädet eivät mene päällekkäin)
    // Oikea käsi tuodaan tarvittaessa keskilinjaa kohti, jotta vasen ylettyy (kädet ≤ 0,58 m vasemmasta olasta)
    fig.armL.getWorldPosition(_ikS);fig.hand.getWorldPosition(_ikH);const ex=_ikH.distanceTo(_ikS)-.58;
    if(ex>0){_ikH.addScaledVector(_ikT.copy(_ikS).sub(_ikH).normalize(),ex*P.gripK);armIK(fig.armR,fig.elbowR,_ikH,1,_poleR);if(armClear(fig.armR,fig.elbowR,fig.hand))fig.g.updateMatrixWorld(true);fig.armL.getWorldPosition(_ikS);}
    heldMesh.worldToLocal(_ikS);_gp.set(0,0,clamp(_ikS.z,.11,.42));heldMesh.localToWorld(_gp);armIK(fig.armL,fig.elbowL,_gp,P.gripK);}
  armClear(fig.armL,fig.elbowL,fig.handL);
  // Jousen veto: oikea käsi jänteellä nuolen kannan kohdalla.
  P.drawK=lerp(P.drawK||0,P.drawing&&heldMesh&&ITEMS[heldId].cat==='bow'?1:0,Math.min(1,dt*14));
  if(P.drawK>.01&&heldMesh&&heldMesh.userData.bow){fig.g.updateMatrixWorld(true);const b=heldMesh.userData.bow;_gp.set(0,0,b.ar.position.z+.02);heldMesh.localToWorld(_gp);armIK(fig.armR,fig.elbowR,_gp,P.drawK,_poleBow);}
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
    else if(ts.fuel>0){// uudelleensytytys: soihtu kiinni toisessa liekissä (< 1.1 m) ja odotus 2.5 s
      let near=false;for(const p of pieces){if(isFirePiece(p.t)?p.data.fuel>0:p.t==='soihtuteline'&&p.data.burn>0){if(dist2(p.x,p.z,P.pos.x,P.pos.z)<1.15*1.15){near=true;break;}}}
      if(near&&!P.inWater&&!(wRain>.5&&!shelterCache&&!P.inDun)){if(torchIgn<=0)msg('Soihtu syttyy… pysy liekin vieressä.');torchIgn+=dt;if(torchIgn>=2.5){ts.lit=true;torchIgn=0;msg('Sytytit soihdun!','loot');sfx('pickup');}}else torchIgn=0;}
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
const _ikV=new V3(),_ikS=new V3(),_ikH=new V3(),_ikT=new V3(),_poleR=new V3(-.7,-1,.3),_poleBow=new V3(-.7,0,-1);
function lerpAngle(a,b,t){let d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*t;}
function playerDie(){
  if(P.dead)return;P.dead=true;P.deaths++;P.hp=0;sfx('die');
  const items=inv.filter(Boolean).map(s=>({id:s.id,n:s.n,q:s.q}));inv=new Array(invN()).fill(null);invDirty=true;updateGear();setBuildSel(null);
  if(items.length){const y=P.inDun?DUN.y:terrainH(P.pos.x,P.pos.z);makeGrave({x:P.pos.x,y,z:P.pos.z,items});}
  fig.g.rotation.x=-Math.PI/2;fig.g.position.y+=.3;
  setTimeout(()=>{state='dead';releaseLock();$('#deadS').hidden=false;$('#hud').hidden=true;},1400);
}
// Hautakasa: kivet + pieni valomajakka (läpikuultava pylväs + himmeä pistevalo), joka näkyy lähellä (updateStations).
function makeGrave(g){const m=new THREE.Group();m.add(bx(1,.5,1,mat(0x6a6862),0,.25,0),bx(.5,1.2,.2,mat(0x8f8d86),0,.9,-.3));
  const bm=new THREE.MeshBasicMaterial({color:0x8fffee,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(.06,.3,8,8,1,true),bm);beam.position.y=4.4;m.add(beam);g.beam=beam;
  m.position.set(g.x,g.y,g.z);scene.add(m);g.mesh=m;g.light={x:g.x,y:g.y+1.4,z:g.z,c:0x8fffee,i:1.1,on:()=>true};lightSources.push(g.light);graves.push(g);}
function removeGrave(g){scene.remove(g.mesh);const i=graves.indexOf(g);if(i>=0)graves.splice(i,1);const j=lightSources.indexOf(g.light);if(j>=0)lightSources.splice(j,1);}
function respawn(){
  $('#deadS').hidden=true;$('#hud').hidden=false;P.dead=false;P.hp=maxHp()*.6;P.stam=maxStam();P.hunger=Math.max(P.hunger,40);P.buffs={};P.wetT=0;
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
  fadeTo(()=>{dayT=.23;dayN++;P.buffs.levannyt=420;P.hunger=Math.max(20,P.hunger-15);P.hp=maxHp();for(const m of [...mobs])if(m.def.ai==='hostile'&&!m.dun)mobRemove(m);const gr=regrowForest();saveGame(true);msg(`Päivä ${dayN} alkaa.`+(gr.planted+gr.revived?' Metsä on kasvanut yön aikana.':''));});
}
