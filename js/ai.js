/* Hiidenmaa – ai.js
   Vihollisten tekoäly, pomon hyökkäykset, spawneri, asemien päivitys */
'use strict';

/* ---------------- MOB UPDATE ---------------- */
const _hitl=[];
// Tulenarat viholliset: palava nuotio/grilli (7 m), seisova soihtu (5 m) ja pelaajan kädessä oleva soihtu (6 m; ei luolastossa). Lista päivittyy 0,4 s välein.
let fireSrc=[],fireT=0;
function refreshFire(dt){fireT-=dt;if(fireT>0)return;fireT=.4;fireSrc.length=0;
  for(const p of pieces){if(isFirePiece(p.t)&&p.data.fuel>0)fireSrc.push({x:p.x,z:p.z,r:7});else if(p.t==='soihtuteline'&&p.data.burn>0)fireSrc.push({x:p.x,z:p.z,r:5});}
  if(torchLit()&&!P.inDun)fireSrc.push({x:P.pos.x,z:P.pos.z,r:6,torch:1});}
// Lähin avaus (ovi tai ikkuna), jonka mobi voi hajottaa päästäkseen pelaajan luo.
function nearestOpening(m){let best=null,bd=1e9;for(const p of pieces){const b=bt(p.t);if((b!=='ovi'&&b!=='ikkunaseina')||PIECES[p.t].mobProof||(b==='ovi'&&p.data.open))continue;
  const d=dist2(p.x,p.z,m.pos.x,m.pos.z);if(d<bd&&d<35*35&&dist2(p.x,p.z,P.pos.x,P.pos.z)<28*28){bd=d;best=p;}}return best;}
function updateMobs(dt){
  refreshFire(dt);
  for(let i=mobs.length-1;i>=0;i--){const m=mobs[i];
    if(m.dead){m.deadT+=dt;m.f.g.rotation.z=Math.min(Math.PI/2,m.deadT*4);m.f.g.position.y=m.pos.y-m.deadT*.3;if(m.deadT>2.2)mobRemove(m);continue;}
    const d=m.def,dx=P.pos.x-m.pos.x,dz=P.pos.z-m.pos.z,dist=Math.hypot(dx,dz);
    if(!m.dun&&m!==boss&&dist>120){mobRemove(m);continue;}
    // Piirtoetäisyyden ulkopuolella (sumun takana) mobia ei piirretä eikä animoida
    if(m!==boss&&!m.dun){const far=dist>scene.fog.far+8;if(far!==!m.f.g.visible){m.f.g.visible=!far;}if(far){m.f.g.position.copy(m.pos);}}
    if(m.dun!==P.inDun){continue;}
    m.flash=Math.max(0,m.flash-dt);for(const mt of m.mats)mt.emissive.setHex(m.flash>0?0x661111:0x000000);
    m.atkCd-=dt;
    let tx=0,tz=0,spd=0;
    if(d.ai==='boss'){bossAI(m,dt,dx,dz,dist);continue;}
    if(d.ai==='rboss'){realmBossAI(m,dt,dx,dz,dist);continue;}
    const night=isNight()&&!P.inDun;
    const hostile=d.ai==='hostile'||(d.ai==='neutral'&&m.angry);
    const aggroR=(d.aggro||12)*(night?1.35:1)*(P.crouch?.5:1);
    // Näköyhteys (välimuistissa, tarkistus ~5 kertaa sekunnissa): ilman sitä ei aloiteta eikä jatketa jahtia.
    m.losT=(m.losT||0)-dt;if(m.losT<=0){m.losT=.2+Math.random()*.1;m.los=dist<45&&losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z);}
    m.noLos=m.state==='chase'&&!m.los?(m.noLos||0)+dt:0;
    // Pelko: tuli ja soihtu ajavat kaikki viholliset ja eläimet pois päin (myös vihaiset). Vartija ja ylimys eivät pelkää.
    if(m.type!=='ylimys'){let fs=null,fd=1e9;for(const s of fireSrc){if(s.torch&&m.dun)continue;const dd=dist2(s.x,s.z,m.pos.x,m.pos.z);if(dd<s.r*s.r&&dd<fd){fd=dd;fs=s;}}
      if(fs){m.fearT=1;m.siege=null;}}
    if(m.fearT>0){m.fearT-=dt;m.wind=0;m.state='flee';let fx=m.pos.x,fz=m.pos.z,fd=1e9;for(const s of fireSrc){const dd=dist2(s.x,s.z,m.pos.x,m.pos.z);if(dd<fd){fd=dd;fx=s.x;fz=s.z;}}
      moveMob(m,m.pos.x-fx,m.pos.z-fz,d.run,dt);animMob(m,dt);if(m.fearT<=0)m.state='idle';continue;}
    // Vartijat pysyvät paikallaan: jos ne ajautuvat liian kauas (säde guard.r), ne palaavat takaisin ja paranevat.
    if(m.guard){const gx=m.guard.x-m.pos.x,gz=m.guard.z-m.pos.z,gd=Math.hypot(gx,gz);if(gd>m.guard.r)m.ret=true;
      if(m.ret){m.state='idle';m.wind=0;if(gd<3)m.ret=false;else{moveMob(m,gx,gz,d.run,dt);animMob(m,dt);m.hp=Math.min(m.maxHp,m.hp+m.maxHp*.05*dt);continue;}}}
    const hurt=playTime-m.lastHit<10;
    // Paikallaan oleville vaikeille vihollisille: iskuttomana 30 s → parantuvat hitaasti (1 %/s).
    if((MOB_SKULL[m.type]||0)>=3&&playTime-m.lastHit>30&&m.hp<m.maxHp)m.hp=Math.min(m.maxHp,m.hp+m.maxHp*.01*dt);
    if(d.ai==='flee'){// säikähdysetäisyys: kävely 7 m, juoksu 16 m, ase kädessä ×1.4, kyykyssä 3.5 m. Vahingoitettu pelkää 10 s.
      const w=curWeapon(),armed=(w.cat==='weapon'||w.cat==='bow')&&!P.crouch;let sr=P.crouch?3.5:P.running?16:7;if(armed)sr*=1.4;
      if(hurt||(!P.dead&&dist<sr&&(m.los||dist<4))){if(m.state!=='flee'){m.state='flee';m.fleeT=0;}}else if(m.state==='flee'&&dist>28)m.state='idle';}
    else if(hostile&&!P.dead&&!(P.spawnProt>0)&&((m.los&&dist<aggroR)||hurt)&&Math.abs(P.pos.y-m.pos.y)<6)m.state='chase';
    else if(m.state==='chase'&&!hurt&&(dist>aggroR*1.6||P.dead||m.noLos>3)){m.state='idle';if(m.noLos>3){m.angry=false;m.lastHit=-99;}m.noLos=0;}
    if(m.state==='flee'){// pakosuunta pois pelaajasta satunnaisella poikkeamalla, vaihtuu 1.2–3 s välein
      m.fleeT=(m.fleeT||0)-dt;if(m.fleeT<=0){m.fleeT=1.2+Math.random()*1.8;m.fleeA=Math.atan2(-dx,-dz)+(Math.random()-.5)*(hurt?1.6:.8);}
      tx=Math.sin(m.fleeA);tz=Math.cos(m.fleeA);spd=d.run;}
    else if(m.state==='chase'){
      if(m.wind>0){m.wind-=dt;if(m.wind<=0){if(mobReach(m,dist)<d.range+.25&&!P.dead&&losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z,true)){const f=(Math.sin(m.yaw)*dx+Math.cos(m.yaw)*dz)/(dist||1);if(f>.5)hurtPlayer(d.dmg,m.pos.x,m.pos.z);}m.atkCd=d.cd;}}
      else if(mobReach(m,dist)<d.range+.2&&m.atkCd<=0&&losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z,true)){m.wind=d.wind;}
      else if(!m.siege&&m.atkCd<=0&&mobReach(m,dist)<d.range+1&&!losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z,true))m.siege=nearestOpening(m);
      else if(dist>d.range*.8){tx=dx;tz=dz;spd=d.run;}
      // Piiritys: jos seinät estävät tien, mobi menee lähimmälle ovelle tai ikkunalle ja hajottaa sen (2× vahinko).
      if(m.siege&&!pieces.includes(m.siege))m.siege=null;
      if(!m.siege&&m.stuck>.5&&m.wind<=0)m.siege=nearestOpening(m);
      if(m.siege&&m.wind<=0){const sx=m.siege.x-m.pos.x,sz=m.siege.z-m.pos.z,sd=Math.hypot(sx,sz);
        if(sd<1.9){tx=sx;tz=sz;spd=0;if(m.atkCd<=0){damagePiece(m.siege,d.dmg*2,'mob');m.atkCd=d.cd;m.anim=.4;m.wind=0;}}else{tx=sx;tz=sz;spd=d.run;}}
      if(m.wind>0){spd=0;tx=dx;tz=dz;}
    }else{
      m.siege=null;m.t-=dt;if(m.t<=0||!m.wander){m.t=3+Math.random()*5;if(Math.random()<.45){const a=Math.random()*TAU;m.wander={x:m.pos.x+Math.cos(a)*10,z:m.pos.z+Math.sin(a)*10};}else m.wander=null;}
      if(m.wander){tx=m.wander.x-m.pos.x;tz=m.wander.z-m.pos.z;if(Math.hypot(tx,tz)<1)m.wander=null;spd=d.walk;}
    }
    moveMob(m,tx,tz,spd,dt);
    animMob(m,dt);
  }
  // separation
  for(let i=0;i<mobs.length;i++)for(let j=i+1;j<mobs.length;j++){const a=mobs[i],b=mobs[j];if(a.dead||b.dead)continue;const dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z,d=Math.hypot(dx,dz),r=a.def.r+b.def.r;if(d<r&&d>.001){const k=(r-d)/2/d;a.pos.x-=dx*k;a.pos.z-=dz*k;b.pos.x+=dx*k;b.pos.z+=dz*k;}}
}
// Iskun ulottuvuus 3D:ssä: vaakaetäisyys + pystyväli mobin iskukohdasta pelaajan vartaloon (0–1,8 m).
function mobReach(m,dist){const sy=m.pos.y+(m.f.biped?1:.6)*(m.f.s||1),gap=Math.max(0,sy-(P.pos.y+1.8),P.pos.y-sy);return Math.hypot(dist,gap);}
function moveMob(m,tx,tz,spd,dt){
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
  m.walkPh+=(m.speedNow||0)*dt*2.2;const sw=Math.sin(m.walkPh)*Math.min(1,(m.speedNow||0)/3)*.7;
  if(f.biped){f.legL.rotation.x=sw;f.legR.rotation.x=-sw;f.armL.rotation.x=-sw*.6;f.armR.rotation.x=sw*.6;
    if(m.wind>0){f.armR.rotation.x=-2.6;f.armL.rotation.x=-2.2;}else if(m.wind<=0&&m.atkCd>m.def.cd-.25){f.armR.rotation.x=-.3;}}
  else{f.legs[0].rotation.x=sw;f.legs[3].rotation.x=sw;f.legs[1].rotation.x=-sw;f.legs[2].rotation.x=-sw;f.head.rotation.x=m.wind>0?-.5:(m.atkCd>m.def.cd-.2?.4:0);}
  if(m.anim>0)m.anim-=dt;
}
function bossAI(m,dt,dx,dz,dist){
  const L=LOC.circle;
  if(m.state==='intro'){m.t+=dt;m.yaw=Math.atan2(dx,dz);m.f.g.position.copy(m.pos);m.f.g.rotation.y=m.yaw;m.f.armL.rotation.x=m.f.armR.rotation.x=-2.8*Math.min(1,m.t);if(m.t>2.2){m.state='chase';sfx('roar');shake(.5);}return;}
  if(!m.phase2&&m.hp<m.maxHp*.5){m.phase2=true;sfx('roar');msg('Vartija kutsuu kalmoja maasta!','warn');for(let i=0;i<3;i++){const a=i/3*TAU;spawnMob('kalmo',m.pos.x+Math.cos(a)*5,m.pos.z+Math.sin(a)*5);}shockwave(m.pos.x,m.pos.y,m.pos.z,8);}
  const spd=(m.phase2?1.2:1);
  if(m.act){m.act.t+=dt;const a=m.act;const f=m.f;
    if(a.k==='swipe'){f.armR.rotation.x=a.t<.8?-2.6*a.t/.8:lerp(-2.6,-.2,Math.min(1,(a.t-.8)/.2));if(a.t>=.8&&!a.hit){a.hit=1;sfx('swing');if(dist<4.8+.4){const fc=(Math.sin(m.yaw)*dx+Math.cos(m.yaw)*dz)/(dist||1);if(fc>.1)hurtPlayer(22,m.pos.x,m.pos.z);}}if(a.t>1.4)m.act=null;}
    else if(a.k==='slam'){const up=a.t<1.1;f.armR.rotation.x=f.armL.rotation.x=up?-3*a.t/1.1:lerp(-3,-.6,Math.min(1,(a.t-1.1)/.15));if(a.t>=1.1&&!a.hit){a.hit=1;sfx('slam');shake(.6);const fx=m.pos.x+Math.sin(m.yaw)*2.5,fz=m.pos.z+Math.cos(m.yaw)*2.5;shockwave(fx,m.pos.y,fz,7);burst(fx,m.pos.y+.3,fz,0x5d5a54,16,7);if(dist2(fx,fz,P.pos.x,P.pos.z)<7*7&&P.pos.y-m.pos.y<1.5)hurtPlayer(28,fx,fz);}if(a.t>1.9)m.act=null;}
    else if(a.k==='charge'){if(a.t<.6){m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),dt*6);f.g.rotation.x=-.2;}else{moveMob(m,Math.sin(m.yaw),Math.cos(m.yaw),15*spd,dt);if(!a.hit&&dist<2.8){a.hit=1;hurtPlayer(26,m.pos.x,m.pos.z);P.vel.x+=Math.sin(m.yaw)*10;P.vel.z+=Math.cos(m.yaw)*10;}}if(a.t>1.6){m.act=null;f.g.rotation.x=0;}}
    else if(a.k==='throw'){f.armR.rotation.x=-2.8*Math.min(1,a.t/.8);if(a.t>=.8&&!a.hit){a.hit=1;const hp=new V3();f.hand.getWorldPosition(hp);throwRock(hp,new V3(P.pos.x+P.vel.x*.6,P.pos.y,P.pos.z+P.vel.z*.6),20);}if(a.t>1.3)m.act=null;}
    m.f.g.position.copy(m.pos);m.f.g.rotation.y=m.yaw;return;}
  if(dist2(P.pos.x,P.pos.z,L.x,L.z)>90*90||P.inDun){mobRemove(m);for(let i=0;i<3;i++)spawnDrop('hiidenkivi',1,L.x,7.5,L.z);circleStones.forEach(r=>r.material=new THREE.MeshBasicMaterial({color:0x2a3a39}));$('#bossbar').hidden=true;msg('Vartija vajosi takaisin maahan. Hiidenkivet jäivät alttarille.','warn');return;}
  if(P.dead){moveMob(m,L.x-m.pos.x,L.z-m.pos.z,m.def.walk,dt);m.hp=Math.min(m.maxHp,m.hp+30*dt);animMob(m,dt);return;}
  if(m.atkCd<=0){
    if(dist<5){m.act={k:Math.random()<.55?'swipe':'slam',t:0};m.atkCd=(m.phase2?1.1:1.6);}
    else if(dist>9&&dist<30){m.act={k:Math.random()<.5?'charge':'throw',t:0};m.atkCd=m.phase2?1.6:2.4;}
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
  meadow:{day:[['peura',.6],['karju',.4]],night:[['susi',.45],['hiisi',.25],['peura',.3]]},
  forest:{day:[['hiisi',.45],['peura',.3],['karju',.25]],night:[['hiisi',.5],['susi',.45],['peura',.05]]},
  moor:{day:[['kalmo',.9],['karju',.1]],night:[['kalmo',.7],['susi',.3]]},
  mountain:{day:[['susi',.5],['peura',.5]],night:[['susi',1]]},
  beach:{day:[['karju',.5],['peura',.5]],night:[['susi',.6],['hiisi',.4]]},
  aarni:{day:[['hiisi',.5],['susi',.3],['peura',.2]],night:[['susi',.5],['hiisi',.5]]},
};
function spawner(dt){
  spawnT-=dt;if(spawnT>0||P.inDun||P.dead)return;spawnT=2.5;
  const night=isNight();const alive=mobs.filter(m=>!m.dun&&!m.dead&&m!==boss&&!m.guard);const cap=night?14:10;
  if(alive.length>=cap)return;
  for(let tries=0;tries<6;tries++){const a=Math.random()*TAU,d=38+Math.random()*30,x=P.pos.x+Math.cos(a)*d,z=P.pos.z+Math.sin(a)*d;const h=terrainH(x,z);if(h<.5)continue;
    const b=biomeAt(x,z,h);const tbl=SPAWN[b];if(!tbl)continue;const list=night?tbl.night:tbl.day;let r=Math.random(),type=list[0][0];for(const [t,p] of list){if(r<p){type=t;break;}r-=p;}
    if(nearBase(x,z)||nearSite(x,z,50))continue;
    if(dist2(x,z,LOC.spawn.x,LOC.spawn.z)<30*30&&MOBDEF[type].ai==='hostile'&&!night)continue;
    const pack=type==='susi'&&night?2:1;for(let k=0;k<pack;k++)spawnMob(type,x+k*1.5,z+k);return;}
}
function respawnNodes(){for(const n of nodes)if(!n.alive&&n.def.kind!=='tree'&&n.respawnAt<=playTime&&dist2(n.x,n.z,P.pos.x,P.pos.z)>40*40&&!nearBase(n.x,n.z))respawnNode(n);}
const LIGHT_CAP=3.0;let shFrame=0,shNearPrev=false;const ALL_LIGHTS=[...LIGHTS,torchLight,torchFill];
function updateStations(dt){
  for(const p of pieces){
    // piirtoetäisyys: kaukana (sumun takana) olevia rakennuksia ei piirretä
    {const far=dist2(p.x,p.z,P.pos.x,P.pos.z)>(scene.fog.far+25)**2;if(far===p.mesh.visible)p.mesh.visible=!far;}
    if(isFirePiece(p.t)){const f=p.mesh.userData.flame,d=p.data;const lit=d.fuel>0;f[0].visible=f[1].visible=lit;
      if(lit){const u=p.fl||(p.fl={cur:1,target:1,t:Math.random()*.2}),s=flick(u,dt);f[0].scale.set(.9+s*.12,.7+s*.45,.9+s*.12);f[1].scale.set(1,.8+s*.35,1);d.burn+=dt;
        if(dist2(p.x,p.z,P.pos.x,P.pos.z)<35*35){if(Math.random()<dt*3.2)emitEmber(p.x+(Math.random()-.5)*.4,p.y+.7,p.z+(Math.random()-.5)*.4,'spark');if(Math.random()<dt*.9)emitEmber(p.x+(Math.random()-.5)*.2,p.y+1.1,p.z+(Math.random()-.5)*.2,'smoke');}if(d.burn>=90){d.burn=0;d.fuel--;}for(const c of d.cook)c.t+=dt;}
      const fm=p.mesh.userData.food;if(fm)for(let i=0;i<4;i++){const c=d.cook[i],m=fm[i];m.visible=!!c;if(c){const r=c.t/c.need;m.material.color.setHex(r<1?(r<.6?0xc9554e:0xb06a42):r<2?0x7a4524:0x15110f);}}}
    if(p.t==='soihtuteline'){const f=p.mesh.userData.flame,on=p.data.burn>0;f[0].visible=f[1].visible=on;if(on){p.data.burn=Math.max(0,p.data.burn-dt);const u=p.fl||(p.fl={cur:1,target:1,t:Math.random()*.2}),s=flick(u,dt);f[0].scale.set(.9+s*.15,.7+s*.5,.9+s*.15);f[1].scale.set(1,.8+s*.4,1);
        if(dist2(p.x,p.z,P.pos.x,P.pos.z)<30*30){if(Math.random()<dt*1.8)emitEmber(p.x+(Math.random()-.5)*.15,p.y+1.9,p.z+(Math.random()-.5)*.15,'spark');if(Math.random()<dt*.4)emitEmber(p.x,p.y+2,p.z,'smoke');}}}
    if(p.t==='sulatin'){const run=(p.data.ore>0||p.data.iore>0)&&p.data.wood>0;p.mesh.userData.glow.visible=run;if(run){p.data.t+=dt;const iron=p.data.ore<=0;if(p.data.t>=(iron?10:7)){p.data.t=0;p.data.wood--;if(iron){p.data.iore--;p.data.idone++;}else{p.data.ore--;p.data.done++;}}}}
  }
  for(const g of graves){const near=dist2(g.x,g.z,P.pos.x,P.pos.z)<50*50&&!P.inDun;g.beam.visible=near;if(near)g.beam.material.opacity=.28+Math.sin(playTime*3)*.1;}
  for(let i=0;i<LIGHTS.length;i++){const l=LIGHTS[i];const u=l.userData.fl||(l.userData.fl={cur:1,target:1,t:Math.random()*.2});l.intensity=!l.userData.base?0:l.userData.base*flick(u,dt)*(.95+Math.sin(playTime*(7+i*1.7)+i*3)*.05);}
  // Pistevalojen varjokartat päivitetään harvemmin (autoUpdate pois, needsUpdate nostetaan itse): pimeällä joka 2. (soihtu) / 3. (tuli) kehys,
  // päivällä harvemmin; vain jos valo palaa. Kun lähin tuli vaihtuu (updateLights), kartta päivitetään heti. Laatutaso (`QUAL`) voi harventaa lisää.
  {shFrame++;const dark=P.inDun||isNight()||indoorK>.5||wDark>.55,q=QUAL.lvl,rate=SET.shRate==='fast'?.5:SET.shRate==='slow'?2.5:1,fT=SET.shRate==='slow'?2:1;
   // Pelaaja (ja hänen varjonsa) on lähimmän tulen varjokameran kantamalla (15 m + marginaali) → tiheä päivitys. Kun pelaaja poistuu kantamalta,
   // kartta päivitetään vielä kerran, jottei pelaajan vanha varjo jää maahan (aiemmin säde oli 9 m ja varjo jäi näkyviin harvan päivityksen ajaksi).
   const nearL=dist2(LIGHTS[0].position.x,LIGHTS[0].position.z,P.pos.x,P.pos.z)<17*17,left=shNearPrev&&!nearL;shNearPrev=nearL;
   const fF=Math.max(1,Math.round((nearL?(dark?2:4):(dark?60:120))*(q>=1?2:1)*rate));
   if(SET.shRate==='slow'&&shFrame%3===0)sun.shadow.needsUpdate=true;
   if(QUAL.pointShadow){if(torchLight.intensity>0&&shFrame%fT===0)torchLight.shadow.needsUpdate=true;if(LIGHTS[0].intensity>0){if(shFrame%fF===0||shDirty||left)LIGHTS[0].shadow.needsUpdate=true;shDirty=false;}}}
  // Valokatto: pelaajan kohdalle osuva yhteisvalo (summa etäisyyden mukaan vaimennettuna) ei ylitä LIGHT_CAP:ia – päällekkäiset valot eivät kirkastu loputtomiin.
  {let W=0;const ls=ALL_LIGHTS;for(const l of ls)if(l.intensity>0){const d=Math.hypot(l.position.x-P.pos.x,l.position.y-(P.pos.y+1),l.position.z-P.pos.z);W+=l.intensity*Math.pow(Math.max(0,1-d/l.distance),1.5);}
   if(W>LIGHT_CAP){const k=LIGHT_CAP/W;for(const l of ls)l.intensity*=k;}}
}
