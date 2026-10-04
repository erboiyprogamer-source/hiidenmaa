/* Hiidenmaa – player.js
   Pelaajan liike, fysiikka, animaatio, kuolema, uudelleensyntyminen, nukkuminen */
'use strict';

/* ---------------- PLAYER UPDATE ---------------- */
// Tikkaat: pelaaja kiipeää, kun hän on tikkaiden edessä (±.6 m sivusuunnassa, .9 m syvyyssuunnassa).
function ladderAt(pos){for(const p of pieces){if(bt(p.t)!=='tikkaat')continue;const dx=pos.x-p.x,dz=pos.z-p.z;if(dx*dx+dz*dz>5)continue;const a=p.rot*Math.PI/4,lx=dx*Math.cos(a)-dz*Math.sin(a),lz=dx*Math.sin(a)+dz*Math.cos(a),zc=-Math.max(0,pos.y-p.y)*Math.tan((p.f%3)*Math.PI/12);
  if(Math.abs(lx)<.65&&Math.abs(lz-zc)<.95&&pos.y>p.y-.3&&pos.y<p.y+WH-.05)return p;}return null;}
let torchFl=null,torchBarT=0,torchIgn=0,shDark=0;const torchPh=[Math.random()*TAU,Math.random()*TAU];
function updatePlayer(dt){
  if(P.dead)return;
  P.invul=Math.max(0,P.invul-dt);P.stagger=Math.max(0,P.stagger-dt);P.hurtFlash=Math.max(0,P.hurtFlash-dt);
  const w=curWeapon();const wt=invWeight(),over=wt>MAXW;
  const fwd=_tmpV.set(-Math.sin(camYaw),0,-Math.cos(camYaw)),right=_tmpV2.set(Math.cos(camYaw),0,-Math.sin(camYaw));
  let mx=0,mz=0;if(state==='play'&&P.stagger<=0){if(keys.KeyW)mx+=1;if(keys.KeyS)mx-=1;if(keys.KeyD)mz+=1;if(keys.KeyA)mz-=1;}
  let dx=fwd.x*mx+right.x*mz,dz=fwd.z*mx+right.z*mz;const dl=Math.hypot(dx,dz);if(dl>0){dx/=dl;dz/=dl;}
  P.blocking=state==='play'&&mouseR&&w.cat!=='hammer'&&w.cat!=='bow'&&P.stam>0&&!P.atk;
  const armor=equipped('armor');
  P.crouch=state==='play'&&!!keys.KeyC&&P.onGround&&!P.swim;
  let speed=4.6;const wantRun=(keys.ShiftLeft||keys.ShiftRight)&&!P.crouch;
  P.running=false;
  if(wantRun&&dl>0&&!over&&P.stam>0&&!P.blocking&&!P.drawing){speed=8;P.running=true;P.stam-=13*dt;P.stamDelay=.8;}
  if(P.blocking||P.drawing)speed=2.4;if(over)speed*=.55;if(armor&&ITEMS[armor.id].slow)speed*=1-ITEMS[armor.id].slow;if(P.atk)speed*=.45;if(P.crouch)speed=Math.min(speed,2.3);speed*=P.fx.speed;
  P.inWater=P.pos.y<-.9&&!P.inDun;P.swim=P.pos.y<-1.3&&!P.inDun;
  if(P.swim){speed=2.6;P.stam-=(dl>0?6:2)*dt;P.stamDelay=.6;if(P.stam<=0){P.hp-=4*dt;if(P.hp<=0)playerDie();}}
  // stamina regen
  P.stamDelay-=dt;if(P.stamDelay<=0&&!P.swim){let r=22*P.fx.stamRegen;P.stam=Math.min(maxStam(),P.stam+r*dt);}
  if(P.blocking&&P.stam<=0)P.blocking=false;
  P.stam=Math.max(0,P.stam);
  // velocity
  P.vel.x=lerp(P.vel.x,dx*speed,Math.min(1,dt*(P.onGround?12:3)));P.vel.z=lerp(P.vel.z,dz*speed,Math.min(1,dt*(P.onGround?12:3)));
  if(state==='play'&&keys.Space&&P.onGround&&!P.swim&&P.stam>=8&&!over){P.vy=7.2;P.onGround=false;P.stam-=8;P.stamDelay=.8;}
  const lad=!P.swim&&!P.dead&&ladderAt(P.pos);P.onLadder=!!lad;
  if(P.swim){P.vy=lerp(P.vy,(-1.25-P.pos.y)*3,dt*4);}
  else if(lad&&(keys.KeyW||keys.Space||keys.KeyS)){P.vy=keys.KeyS&&!keys.KeyW&&!keys.Space?-2.6:2.6;P.onGround=false;}
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
    else{// viistoisku: vuorotellen vasen-ylhäältä → oikea-alas ja oikea-ylhäältä → vasen-alas
      const hz=sd>0?.62:-.7,lz=sd>0?-.55:.5;
      [tRx,tRz]=two?swingPose(k,hk,-2.6,hz,-.7,lz,hold):swingPose(k,hk,-2.4,hz*.9,-.9,lz*.9,hold);}
    rate=k<hk+.12?30:6;if(two&&(k<hk+.3||hold)){grip=true;tSh=.31;}}
  if(P.crouchK>.4&&!P.atk&&!P.blocking&&!P.drawing){const K=P.crouchK;tLx=lerp(tLx,-.5,K);tLz=lerp(tLz,.85,K);tRx=lerp(tRx,-.25,K);tRz=lerp(tRz,-.75,K);eLo=-.95*K;}// kyykky: vasen käsi koukussa sivulla ja alhaalla, oikea sivulla

  if(P.blocking){tLx=-1.3+Math.sin(playTime*3)*.04;tLz=-.3;}
  if(P.drawing){tLx=-1.5;tRx=-1.5;tRz=.5;}
  if(heldMesh&&ITEMS[heldId].cat==='bow'){if(P.drawing)tLz=-.1;}
  if(P.atk)P.recT=.55;else P.recT=Math.max(0,(P.recT||0)-dt);if(!P.atk&&P.recT>0&&!P.drawing&&!P.blocking)rate=Math.min(rate,5);// iskun jälkeen kädet palaavat lepoon pehmeästi
  const e=Math.min(1,dt*rate);
  armSh+=(tSh-armSh)*e;fig.armL.position.x=armSh;fig.armR.position.x=-armSh;
  fig.armR.rotation.x=lerpAngle(fig.armR.rotation.x,tRx,e);fig.armR.rotation.z=lerpAngle(fig.armR.rotation.z,tRz,e);
  if(grip&&heldMesh){const g=gripAngles();tLx=g[0];tLz=g[1];}
  fig.armL.rotation.x=lerpAngle(fig.armL.rotation.x,tLx,e);fig.armL.rotation.z=lerpAngle(fig.armL.rotation.z,tLz,e);
  // Kyynärpäät taipuvat sitä enemmän mitä korkeammalle käsivarsi nousee (jousella vetokäsi taipuu, jousikäsi suorana)
  {const bendR=-(.14+clamp(-fig.armR.rotation.x,0,2.8)*.28),bendL=-(.14+clamp(-fig.armL.rotation.x,0,2.8)*.28);
   let tR=eRo!==null?eRo:bendR,tL=eLo!==null?eLo:bendL;if(P.drawing){tL=-.05;tR=-(.5+P.bowDraw*.9);}
   fig.elbowR.rotation.x=lerp(fig.elbowR.rotation.x,tR,Math.min(1,dt*(P.atk?20:8)));fig.elbowL.rotation.x=lerp(fig.elbowL.rotation.x,tL,Math.min(1,dt*(P.atk?20:8)));}
  // Jousi pysyy pystyssä (kämmenen kierto kumotaan käsivarren kulmalla); jänne ja nuoli seuraavat vetoa.
  if(heldMesh&&ITEMS[heldId].cat==='bow'){heldMesh.rotation.set(-fig.armL.rotation.x,0,0);updateBowMesh(heldMesh,P.drawing?P.bowDraw:0);}
  fig.g.visible=camDist>1.8;
  // torch light
  const ts=torchSlot();let torch=false;
  if(ts){if(ts.fuel===undefined)ts.fuel=TORCH_T;if(ts.lit===undefined)ts.lit=true;
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
  if(torch){const u=torchFl||(torchFl={cur:1,target:1,t:0}),s=1+(flick(u,dt)-1)*.52+(Math.sin(playTime*1.7+torchPh[0])+Math.sin(playTime*3.1+torchPh[1]))*.02;torchLight.intensity=2.6*s;fig.handL.getWorldPosition(torchLight.position);torchLight.position.y+=.6;
    // Liekit elävät, kipinöitä ja savua lähtee satunnaisesti kärjestä
    const fl=offMesh&&offMesh.userData.flame;if(fl){fl[0].scale.set(.95+s*.05,.9+s*.2,.95+s*.05);fl[1].scale.set(1,.9+s*.15,1);fl[2].scale.set(1,.85+s*.2,1);fl[3].material.opacity=.2+s*.06;fl[3].scale.setScalar(.92+s*.12);offMesh.rotation.z=Math.sin(playTime*3.1)*.04;}
    if(fig.g.visible){_tmpV.set(0,.4,.62);if(offMesh)offMesh.localToWorld(_tmpV);if(Math.random()<dt*7)emitEmber(_tmpV.x+(Math.random()-.5)*.08,_tmpV.y,_tmpV.z+(Math.random()-.5)*.08,'spark');if(Math.random()<dt*1.6)emitEmber(_tmpV.x,_tmpV.y+.1,_tmpV.z,'smoke');}}
  else torchLight.intensity=0;
}
// Isku: nosto ylävasemmalle, isku alaoikealle (osuma iskun lopussa). Palautus lepoon, tai jos
// lyöntinappi on pohjassa, suoraan seuraavan iskun nostoasentoon (käsi pysyy aseessa).
let armSh=.35;
function swingPose(k,hk,hx,hz,lx,lz,hold){const wk=hk*.55;let t;
  if(k<wk){t=sstep(0,1,k/wk);return[lerp(-.2,hx,t),lerp(0,hz,t)];}
  if(k<hk){t=sstep(0,1,(k-wk)/(hk-wk));return[lerp(hx,lx,t),lerp(hz,lz,t)];}
  if(hold){t=sstep(0,1,(k-hk)/(1-hk));return[lerp(lx,-.2,t),lerp(lz,0,t)];}
  t=Math.min(1,(k-hk)/.3);return[lerp(lx,0,t),lerp(lz,0,t)];}
// Vasemman käsivarren kulmat niin, että se osoittaa kirveen varteen.
const _gp=new V3();
function gripAngles(){fig.g.updateMatrixWorld(true);
  _gp.set(0,0,.35);heldMesh.localToWorld(_gp);fig.g.worldToLocal(_gp);
  _gp.x-=fig.armL.position.x;_gp.y-=fig.armL.position.y;_gp.z-=fig.armL.position.z;_gp.normalize();
  return[Math.atan2(-_gp.z,-_gp.y),Math.asin(clamp(_gp.x,-1,1))];}
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
  if(P.inDun){P.inDun=false;for(const m of [...mobs])if(m.dun)mobRemove(m);}
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
