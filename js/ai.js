/* Hiidenmaa – ai.js
   Vihollisten tekoäly, pomon hyökkäykset, spawneri, asemien päivitys */
'use strict';

/* ---------------- MOB UPDATE ---------------- */
const _hitl=[];
function updateMobs(dt){
  for(let i=mobs.length-1;i>=0;i--){const m=mobs[i];
    if(m.dead){m.deadT+=dt;m.f.g.rotation.z=Math.min(Math.PI/2,m.deadT*4);m.f.g.position.y=m.pos.y-m.deadT*.3;if(m.deadT>2.2)mobRemove(m);continue;}
    const d=m.def,dx=P.pos.x-m.pos.x,dz=P.pos.z-m.pos.z,dist=Math.hypot(dx,dz);
    if(!m.dun&&m!==boss&&dist>120){mobRemove(m);continue;}
    if(m.dun!==P.inDun){continue;}
    m.flash=Math.max(0,m.flash-dt);for(const mt of m.mats)mt.emissive.setHex(m.flash>0?0x661111:0x000000);
    m.atkCd-=dt;
    let tx=0,tz=0,spd=0;
    if(d.ai==='boss'){bossAI(m,dt,dx,dz,dist);continue;}
    const night=isNight()&&!P.inDun;
    const hostile=d.ai==='hostile'||(d.ai==='neutral'&&m.angry);
    const aggroR=(d.aggro||12)*(night?1.35:1)*(P.crouch?.5:1);
    // Näköyhteys (välimuistissa, tarkistus ~5 kertaa sekunnissa): ilman sitä ei aloiteta eikä jatketa jahtia.
    m.losT=(m.losT||0)-dt;if(m.losT<=0){m.losT=.2+Math.random()*.1;m.los=d.ai!=='flee'&&dist<45&&losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z);}
    m.noLos=m.state==='chase'&&!m.los?(m.noLos||0)+dt:0;
    if(d.ai==='flee'){if((!P.crouch&&dist<9&&!P.dead)||playTime-m.lastHit<6){m.state='flee';}else if(m.state==='flee'&&dist>22)m.state='idle';}
    else if(hostile&&!P.dead&&m.los&&(dist<aggroR||playTime-m.lastHit<10)&&Math.abs(P.pos.y-m.pos.y)<6)m.state='chase';
    else if(m.state==='chase'&&(dist>aggroR*1.6||P.dead||m.noLos>3)){m.state='idle';if(m.noLos>3){m.angry=false;m.lastHit=-99;}m.noLos=0;}
    if(m.state==='flee'){tx=-dx;tz=-dz;spd=d.run;}
    else if(m.state==='chase'){
      if(m.wind>0){m.wind-=dt;if(m.wind<=0){if(mobReach(m,dist)<d.range+.25&&!P.dead&&losClear(m.pos.x,mobEyeY(m),m.pos.z,P.pos.x,P.pos.y+1.3,P.pos.z)){const f=(Math.sin(m.yaw)*dx+Math.cos(m.yaw)*dz)/(dist||1);if(f>.5)hurtPlayer(d.dmg,m.pos.x,m.pos.z);}m.atkCd=d.cd;}}
      else if(mobReach(m,dist)<d.range+.2&&m.atkCd<=0){m.wind=d.wind;}
      else if(dist>d.range*.8){tx=dx;tz=dz;spd=d.run;}
      if(m.wind>0){spd=0;tx=dx;tz=dz;}
    }else{
      m.t-=dt;if(m.t<=0||!m.wander){m.t=3+Math.random()*5;if(Math.random()<.45){const a=Math.random()*TAU;m.wander={x:m.pos.x+Math.cos(a)*10,z:m.pos.z+Math.sin(a)*10};}else m.wander=null;}
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
  const night=isNight();const alive=mobs.filter(m=>!m.dun&&!m.dead&&m!==boss);const cap=night?14:10;
  if(alive.length>=cap)return;
  for(let tries=0;tries<6;tries++){const a=Math.random()*TAU,d=38+Math.random()*30,x=P.pos.x+Math.cos(a)*d,z=P.pos.z+Math.sin(a)*d;const h=terrainH(x,z);if(h<.5)continue;
    const b=biomeAt(x,z,h);const tbl=SPAWN[b];if(!tbl)continue;const list=night?tbl.night:tbl.day;let r=Math.random(),type=list[0][0];for(const [t,p] of list){if(r<p){type=t;break;}r-=p;}
    if(nearBase(x,z))continue;
    if(dist2(x,z,LOC.spawn.x,LOC.spawn.z)<30*30&&MOBDEF[type].ai==='hostile'&&!night)continue;
    const pack=type==='susi'&&night?2:1;for(let k=0;k<pack;k++)spawnMob(type,x+k*1.5,z+k);return;}
}
function respawnNodes(){for(const n of nodes)if(!n.alive&&n.respawnAt<=playTime&&dist2(n.x,n.z,P.pos.x,P.pos.z)>40*40&&!nearBase(n.x,n.z))reviveNode(n);}
function updateStations(dt){
  for(const p of pieces){
    if(p.t==='nuotio'){const f=p.mesh.userData.flame;const lit=p.data.fuel>0;f[0].visible=f[1].visible=lit;if(lit){f[0].scale.y=1+Math.sin(playTime*12+p.x)*.15;p.data.burn+=dt;if(p.data.burn>=90){p.data.burn=0;p.data.fuel--;}
      for(let i=p.data.cook.length-1;i>=0;i--){p.data.cook[i]-=dt;if(p.data.cook[i]<=0){p.data.cook.splice(i,1);if(dist2(p.x,p.z,P.pos.x,P.pos.z)<36){giveOrDrop('paisti',1,p.x,p.y+.8,p.z);}else spawnDrop('paisti',1,p.x,p.y+.8,p.z);sfx('pickup');}}}}
    if(p.t==='sulatin'){const run=(p.data.ore>0||p.data.iore>0)&&p.data.wood>0;p.mesh.userData.glow.visible=run;if(run){p.data.t+=dt;const iron=p.data.ore<=0;if(p.data.t>=(iron?10:7)){p.data.t=0;p.data.wood--;if(iron){p.data.iore--;p.data.idone++;}else{p.data.ore--;p.data.done++;}}}}
  }
  for(let i=0;i<LIGHTS.length;i++){const l=LIGHTS[i];if(l.userData.base)l.intensity=l.userData.base*(.85+Math.sin(playTime*(9+i)+i*3)*.08+Math.sin(playTime*23+i)*.05);}
}
