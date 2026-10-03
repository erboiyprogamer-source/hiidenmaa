/* Hiidenmaa – player.js
   Pelaajan liike, fysiikka, animaatio, kuolema, uudelleensyntyminen, nukkuminen */
'use strict';

/* ---------------- PLAYER UPDATE ---------------- */
function updatePlayer(dt){
  if(P.dead)return;
  P.invul=Math.max(0,P.invul-dt);P.stagger=Math.max(0,P.stagger-dt);P.hurtFlash=Math.max(0,P.hurtFlash-dt);
  const w=curWeapon();const wt=invWeight(),over=wt>MAXW;
  const fwd=_tmpV.set(-Math.sin(camYaw),0,-Math.cos(camYaw)),right=_tmpV2.set(Math.cos(camYaw),0,-Math.sin(camYaw));
  let mx=0,mz=0;if(state==='play'&&P.stagger<=0){if(keys.KeyW)mx+=1;if(keys.KeyS)mx-=1;if(keys.KeyD)mz+=1;if(keys.KeyA)mz-=1;}
  let dx=fwd.x*mx+right.x*mz,dz=fwd.z*mx+right.z*mz;const dl=Math.hypot(dx,dz);if(dl>0){dx/=dl;dz/=dl;}
  P.blocking=state==='play'&&mouseR&&w.cat!=='hammer'&&w.cat!=='bow'&&P.stam>0&&!P.atk;
  const armor=equipped('armor');
  let speed=4.6;const wantRun=keys.ShiftLeft||keys.ShiftRight;
  P.running=false;
  if(wantRun&&dl>0&&!over&&P.stam>0&&!P.blocking&&!P.drawing){speed=8;P.running=true;P.stam-=13*dt;P.stamDelay=.8;}
  if(P.blocking||P.drawing)speed=2.4;if(over)speed*=.55;if(armor&&ITEMS[armor.id].slow)speed*=1-ITEMS[armor.id].slow;if(P.atk)speed*=.45;
  P.inWater=P.pos.y<-.9&&!P.inDun;P.swim=P.pos.y<-1.3&&!P.inDun;
  if(P.swim){speed=2.6;P.stam-=(dl>0?6:2)*dt;P.stamDelay=.6;if(P.stam<=0){P.hp-=4*dt;if(P.hp<=0)playerDie();}}
  // stamina regen
  P.stamDelay-=dt;if(P.stamDelay<=0&&!P.swim){let r=22;if(P.cold)r*=.6;if(P.buffs.levannyt)r*=1.45;if(P.hunger<=0)r*=.5;if(P.buffs.pahoinvointi)r*=.5;P.stam=Math.min(maxStam(),P.stam+r*dt);}
  if(P.blocking&&P.stam<=0)P.blocking=false;
  P.stam=Math.max(0,P.stam);
  // velocity
  P.vel.x=lerp(P.vel.x,dx*speed,Math.min(1,dt*(P.onGround?12:3)));P.vel.z=lerp(P.vel.z,dz*speed,Math.min(1,dt*(P.onGround?12:3)));
  if(state==='play'&&keys.Space&&P.onGround&&!P.swim&&P.stam>=8&&!over){P.vy=7.2;P.onGround=false;P.stam-=8;P.stamDelay=.8;}
  if(P.swim){P.vy=lerp(P.vy,(-1.25-P.pos.y)*3,dt*4);}else P.vy-=22*dt;
  const feet=P.pos.y;
  P.pos.x+=P.vel.x*dt;P.pos.z+=P.vel.z*dt;
  collideXZ(P.pos,.38,1.8,feet);
  P.pos.y+=P.vy*dt;
  const ceil=ceilingAt(P.pos.x,P.pos.z,.38,feet+1.8);if(P.vy>0&&P.pos.y+1.8>ceil){P.pos.y=ceil-1.8;P.vy=0;}
  const g=groundAt(P.pos.x,P.pos.z,.38,feet);
  if(P.pos.y<=g+.02&&P.vy<=0){if(!P.onGround&&P.vy<-15){const fd=(-P.vy-15)*3;P.hp-=fd;floatText('-'+Math.round(fd),P.pos.x,P.pos.y+2,'#e0614f');if(P.hp<=0)playerDie();}P.pos.y=g;P.vy=0;P.onGround=true;}
  else if(P.pos.y>g+.3)P.onGround=false;
  if(P.pos.y<g&&P.vy<=0)P.pos.y=g;
  // world bounds
  const R=Math.hypot(P.pos.x,P.pos.z);if(!P.inDun&&R>215){P.pos.x*=215/R;P.pos.z*=215/R;}
  // facing
  if(P.atk||P.blocking||P.drawing){P.yaw=lerpAngle(P.yaw,camYaw+Math.PI,Math.min(1,dt*18));}
  else if(dl>0)P.yaw=lerpAngle(P.yaw,Math.atan2(P.vel.x,P.vel.z),Math.min(1,dt*10));
  // attack
  if(P.atk){P.atk.t+=dt;if(!P.atk.done&&P.atk.t>=P.atk.hitAt){P.atk.done=true;doMeleeHit(P.atk.w);}if(P.atk.t>=P.atk.dur)P.atk=null;}
  if(!P.atk&&mouseL&&state==='play'&&w.cat==='weapon'&&locked)startAttack();
  if(P.drawing){P.bowDraw=Math.min(1.2,P.bowDraw+dt*1.2);P.stam-=6*dt;P.stamDelay=.5;if(P.stam<=0){P.drawing=false;fireBow();}}
  // animate figure
  const hv=Math.hypot(P.vel.x,P.vel.z);P.walkPh+=hv*dt*1.9;
  const sw=Math.sin(P.walkPh)*Math.min(1,hv/4)*.75;
  fig.g.position.copy(P.pos);if(P.swim)fig.g.position.y=P.pos.y-.2;fig.g.rotation.y=P.yaw;
  fig.legL.rotation.x=sw;fig.legR.rotation.x=-sw;fig.armL.rotation.x=-sw*.7;fig.armR.rotation.x=sw*.7;fig.armR.rotation.z=0;fig.armL.rotation.z=0;
  if(!P.onGround&&!P.swim){fig.legL.rotation.x=-.5;fig.legR.rotation.x=.3;}
  if(P.atk){const k=P.atk.t/P.atk.dur,hk=P.atk.hitAt/P.atk.dur;
    if(P.atk.w.chop){
      let ax,az;if(k<hk){const t=sstep(0,1,k/hk);ax=lerp(-.2,-2.4,t);az=lerp(.85,-.5,t);}else{const t=Math.min(1,(k-hk)/.25);ax=lerp(-2.4,-.3,t);az=lerp(-.5,-.15,t);}
      fig.armR.rotation.x=ax;fig.armR.rotation.z=az;fig.armL.rotation.x=ax;fig.armL.rotation.z=az;
    }else{let a;if(k<hk)a=lerp(0,-2.7,sstep(0,1,k/hk));else a=lerp(-2.7,-.3,Math.min(1,(k-hk)/.25));fig.armR.rotation.x=a;fig.armR.rotation.z=-.15;}}
  if(P.blocking){fig.armL.rotation.x=-1.35;fig.armL.rotation.z=-.5;}
  if(P.drawing){fig.armL.rotation.x=-1.5;fig.armR.rotation.x=-1.5;fig.armR.rotation.z=.5;}
  if(heldMesh&&ITEMS[heldId].cat==='bow'){heldMesh.rotation.set(0,0,0);if(P.drawing){fig.armL.rotation.z=-.1;}}
  fig.g.visible=camDist>1.8;
  // torch light
  const torch=heldId==='soihtu';torchLight.intensity=torch?2.1+Math.sin(playTime*17)*.25:0;if(torch){fig.hand.getWorldPosition(torchLight.position);torchLight.position.y+=.6;}
}
function lerpAngle(a,b,t){let d=((b-a+Math.PI)%TAU+TAU)%TAU-Math.PI;return a+d*t;}
function playerDie(){
  if(P.dead)return;P.dead=true;P.deaths++;P.hp=0;sfx('die');
  const items=inv.filter(Boolean).map(s=>({id:s.id,n:s.n,q:s.q}));inv=new Array(32).fill(null);invDirty=true;updateGear();setBuildSel(null);
  if(items.length){const y=P.inDun?DUN.y:terrainH(P.pos.x,P.pos.z);makeGrave({x:P.pos.x,y,z:P.pos.z,items});}
  fig.g.rotation.x=-Math.PI/2;fig.g.position.y+=.3;
  setTimeout(()=>{state='dead';releaseLock();$('#deadS').hidden=false;$('#hud').hidden=true;},1400);
}
function makeGrave(g){const m=new THREE.Group();m.add(bx(1,.5,1,mat(0x6a6862),0,.25,0),bx(.5,1.2,.2,mat(0x8f8d86),0,.9,-.3));m.position.set(g.x,g.y,g.z);scene.add(m);g.mesh=m;graves.push(g);}
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
  if(!sheltered(p.x,p.y,p.z)){msg('Sänky tarvitsee katon yläpuolelleen.','warn');return;}
  if(mobs.some(m=>!m.dead&&m.def.ai==='hostile'&&dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z)<20*20)){msg('Et voi nukkua, vihollisia on lähellä.','warn');return;}
  fadeTo(()=>{dayT=.23;dayN++;P.buffs.levannyt=420;P.hunger=Math.max(20,P.hunger-15);P.hp=maxHp();for(const m of [...mobs])if(m.def.ai==='hostile'&&!m.dun)mobRemove(m);saveGame(true);msg(`Päivä ${dayN} alkaa.`);});
}
