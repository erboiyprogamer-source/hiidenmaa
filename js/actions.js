/* Hiidenmaa – actions.js
   Pelaajan toiminnot: hyökkäys, vahinko, syöminen, vuorovaikutus (E), alttari, luolastoon siirtyminen */
'use strict';

/* ---------------- PLAYER ACTIONS ---------------- */
function curWeapon(){const w=equipped('weapon');return w?{...ITEMS[w.id],id:w.id,q:w.q||1}:{n:'Nyrkit',dmg:3,dt:'blunt',range:1.8,st:4,spd:.45,id:null,q:1};}
function onPrimary(){
  if(P.dead||P.stagger>0)return;
  const w=curWeapon();
  if(w.cat==='hammer'){placeBuild();return;}
  if(w.cat==='bow'){if(invCount('nuolet')<=0){msg('Ei nuolia.','warn');return;}P.drawing=true;P.bowDraw=0;return;}
  startAttack();
}
function onPrimaryUp(){if(P.drawing){P.drawing=false;if(P.bowDraw>.15&&invCount('nuolet')>0)fireBow();P.bowDraw=0;}}
function onSecondary(){const w=curWeapon();if(w.cat==='hammer'){togglePanel('build');}}
function startAttack(){
  if(P.atk||P.inWater&&P.swim)return;
  const w=curWeapon();
  if(P.stam<w.st){msg('Liian uupunut.','warn');return;}
  P.stam-=w.st;P.stamDelay=1;P.atk={t:0,dur:w.spd+.2,hitAt:w.spd*.55,done:false,w};
  P.yaw=camYaw+Math.PI;
}
function weaponDmg(w){return w.dmg*(1+.25*((w.q||1)-1))*(P.buffs.voima?1.15:1);}
const _nl=[];
function doMeleeHit(w){
  const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);let hitMob=false;const dmg=weaponDmg(w);
  for(const m of mobs){if(m.dead)continue;const dx=m.pos.x-P.pos.x,dz=m.pos.z-P.pos.z,d=Math.hypot(dx,dz);
    if(d>w.range+m.def.r)continue;if(Math.abs(m.pos.y-P.pos.y)>3+(m.type==='vartija'?3:0))continue;
    if(d>m.def.r+.4&&(dx*fx+dz*fz)/d<.45)continue;
    damageMob(m,dmg,w.dt,dx,dz);hitMob=true;}
  if(hitMob&&!w.chop&&!w.pick)return;
  const list=nodesNear(P.pos.x+fx*1.2,P.pos.z+fz*1.2,w.range+1.4,_nl);let best=null,bd=1e9;
  for(const n of list){if(n.def.kind==='pick')continue;const dx=n.x-P.pos.x,dz=n.z-P.pos.z,d=Math.hypot(dx,dz)-n.def.r*n.s;if(d>w.range+.2)continue;if((dx*fx+dz*fz)/Math.max(.01,Math.hypot(dx,dz))<.3)continue;if(d<bd){bd=d;best=n;}}
  if(!best)return;
  const n=best;
  if(n.def.kind==='tree'){if(!w.chop){if(!hitMob){msg('Tarvitset kirveen kaataaksesi puun.','warn');sfx('hit');}return;}
    n.hp-=(5+w.chop*4)*(1+.25*((w.q||1)-1));sfx('chop');burst(n.x,n.y+1.2,n.z,0x8a5a32,5,3);shake(.08);
    if(n.hp<=0){killNode(n);fallTree(n);}}
  else if(n.def.kind==='rock'){if(!w.pick){if(!hitMob){msg('Tarvitset hakun louhiaksesi kiveä.','warn');sfx('hit');}return;}
    n.hp-=(9+w.pick*3)*(1+.25*((w.q||1)-1));sfx('pick');burst(n.x,n.y+.8,n.z,n.type==='kuparisuoni'?0xd9874a:0x8f8d86,6,4);shake(.08);
    if(n.hp<=0){killNode(n);burst(n.x,n.y+.6,n.z,0x8f8d86,16,6);for(const [id,lo,hi] of n.def.drops){const c=rint(rng,lo,hi);for(let j=0;j<c;j++)spawnDrop(id,1,n.x,n.y+.8,n.z);}}}
}
function damageMob(m,dmg,dt,kx,kz){
  if(m.dead)return;
  const mult=(m.def.weak&&m.def.weak[dt])||1;dmg*=mult;
  m.hp-=dmg;m.flash=.15;m.lastHit=playTime;m.angry=true;m.hurtT=playTime;
  if(m.def.ai!=='boss'){const l=Math.hypot(kx,kz)||1;m.vel.x+=kx/l*4;m.vel.z+=kz/l*4;m.wind=0;}
  floatText(Math.round(dmg)+'',m.pos.x,m.pos.y+(m.type==='vartija'?6:1.8),mult>1.2?'#ffd36a':mult<.9?'#a99d89':'#eee5d3');
  sfx('hit');burst(m.pos.x,m.pos.y+1,m.pos.z,m.type==='kalmo'||m.type==='ylimys'?0xe6e0cf:m.type==='vartija'?0x5d5a54:0x9a2a22,6,3);
  if(m.hp<=0)killMob(m);
}
function killMob(m){m.dead=true;m.deadT=0;sfx('die');P.kills++;
  for(const [id,lo,hi] of m.def.drops){const c=rint(rng,lo,hi);if(c>0)spawnDrop(id,c,m.pos.x,m.pos.y+1,m.pos.z);}
  if(m.type==='vartija'){flags.boss=1;$('#bossbar').hidden=true;bossDefeated();}
  if(m.dunIdx!==undefined)dunKilled[m.dunIdx]=1;
}
function fireBow(){
  const w=curWeapon();const k=Math.min(1,P.bowDraw);invRemove('nuolet',1);
  const from=new V3(P.pos.x,P.pos.y+1.5,P.pos.z);
  const tgt=camRayPoint(70);const dir=tgt.sub(from).normalize();
  from.addScaledVector(dir,.6);
  shootArrow(from,dir,18+30*k,weaponDmg(w)*(.35+.65*k),'player');sfx('bow');P.yaw=camYaw+Math.PI;
}
function hurtPlayer(dmg,fx,fz){
  if(P.dead||P.invul>0)return;
  let d=dmg;const dx=fx-P.pos.x,dz=fz-P.pos.z,l=Math.hypot(dx,dz)||1;
  if(P.blocking){const facing=(Math.sin(P.yaw)*dx+Math.cos(P.yaw)*dz)/l;const sh=equipped('shield');const blk=sh?ITEMS[sh.id].block*(1+.1*((sh.q||1)-1)):.3;
    if(facing>.2){const cost=d*.9;if(P.stam>=cost){P.stam-=cost;P.stamDelay=1;d*=1-Math.min(.95,blk);sfx('block');burst(P.pos.x+dx/l*.7,P.pos.y+1.2,P.pos.z+dz/l*.7,0xffe08a,6,3);}else{P.stam=0;P.stagger=1.2;msg('Torjunta murtui!','warn');}}}
  const a=equipped('armor');if(a)d*=20/(20+ITEMS[a.id].arm*(1+.2*((a.q||1)-1)));
  if(d>=1){P.hp-=d;P.hurtFlash=.6;sfx('hurt');shake(.25);floatText('-'+Math.round(d),P.pos.x,P.pos.y+2.2,'#e0614f');P.vel.x-=dx/l*5;P.vel.z-=dz/l*5;}
  P.invul=.25;
  if(P.hp<=0)playerDie();
}
P.vel=new V3();
function eat(s){const f=ITEMS[s.id].food;if(P.hunger>=96&&!f.buff){msg('Olet kylläinen.','warn');return;}
  P.hunger=Math.min(100,P.hunger+f.h);if(f.hp)P.heal+=f.hp;if(f.st)P.stam=Math.min(maxStam(),P.stam+f.st);
  if(f.raw&&Math.random()<.45){P.buffs.pahoinvointi=40;msg('Raaka liha kääntää vatsaa.','warn');}
  if(f.buff)P.buffs[f.buff]=300;if(!f.raw)flags.ate=1;
  s.n--;if(s.n<=0)inv[inv.indexOf(s)]=null;invDirty=true;sfx('eat');msg(`Söit: ${ITEMS[s.id].n}`);
}
function maxHp(){return 60+(P.buffs.voima?15:0);}
function maxStam(){return 100+(P.buffs.voima?25:0);}

/* ---------------- INTERACTION ---------------- */
let lookTarget=null;
function findInteract(){
  const ray=camRay();let best=null,bs=1e9;
  const consider=(x,y,z,obj,maxD=3.2)=>{const pd=dist2(x,z,P.pos.x,P.pos.z);if(pd>maxD*maxD)return;if(Math.abs(y-P.pos.y)>3)return;
    _tmpV.set(x-ray.o.x,y-ray.o.y,z-ray.o.z);const t=_tmpV.dot(ray.d);if(t<0)return;const perp=_tmpV.lengthSq()-t*t;const sc=perp+pd*.08;if(sc<bs&&perp<2.2){bs=sc;best=obj;}};
  for(const n of nodesNear(P.pos.x,P.pos.z,3.4,_nl))if(n.def.kind==='pick')consider(n.x,n.y+.3,n.z,{kind:'node',n,label:'Poimi '+n.def.label});
  for(const it of interactables)if(dist2(it.x,it.z,P.pos.x,P.pos.z)<it.r*it.r*1.6)consider(it.x,it.y,it.z,{kind:'it',it},it.r);
  for(const p of pieces){const l=pieceLabel(p);if(l&&dist2(p.x,p.z,P.pos.x,P.pos.z)<12)consider(p.x,p.y+.7,p.z,{kind:'piece',p,label:l},3);}
  for(const g of graves)consider(g.x,g.y+.5,g.z,{kind:'grave',g,label:'Kerää tavarasi hautakasasta'});
  return best;
}
function pieceLabel(p){switch(p.t){
  case 'ovi':return p.data.open?'Sulje ovi':'Avaa ovi';
  case 'nuotio':return invCount('liha')>0&&p.data.fuel>0?'Paista lihaa':`Lisää puuta (${p.data.fuel}/10)`;
  case 'sanky':return isNight()?'Nuku':'Aseta herätyspaikka';
  case 'arkku':return 'Avaa arkku';
  case 'sulatin':return p.data.done>0?`Ota kupariharkot (${p.data.done})`:invCount('malmi')>0||invCount('puu')>0?`Lisää malmia ja puuta (malmi ${p.data.ore}, puu ${p.data.wood})`:`Sulatusuuni (malmi ${p.data.ore}, puu ${p.data.wood})`;
  case 'tyopenkki':return 'Käytä työpenkkiä';
  case 'ahjo':return 'Käytä ahjoa';
  default:return null;}}
function interact(){
  if(P.dead)return;const t=lookTarget;if(!t)return;
  if(t.kind==='node'){const n=t.n,d=n.def;const c=rint(rng,d.n[0],d.n[1]);const left=invAdd(d.item,c);if(left>=c){msg('Reppu on täynnä.','warn');return;}msg(`+${c-left} ${ITEMS[d.item].n}`,'loot');sfx('pickup');killNode(n);return;}
  if(t.kind==='it'){t.it.use();return;}
  if(t.kind==='grave'){const g=t.g;for(let i=0;i<g.items.length;i++){const s=g.items[i];if(!s)continue;const left=invAdd(s.id,s.n,s.q||1);if(left===0)g.items[i]=null;else s.n=left;}
    if(g.items.every(s=>!s)){scene.remove(g.mesh);graves.splice(graves.indexOf(g),1);msg('Sait tavarasi takaisin.','loot');}else msg('Reppu täyttyi – osa jäi kasaan.','warn');sfx('pickup');return;}
  if(t.kind==='piece'){const p=t.p;switch(p.t){
    case 'ovi':setDoor(p,!p.data.open);sfx('build');break;
    case 'nuotio':if(invCount('liha')>0&&p.data.fuel>0){if(p.data.cook.length>=3){msg('Nuotiolla on jo täyttä.','warn');break;}invRemove('liha',1);p.data.cook.push(10);msg('Liha paistuu…');sfx('craft');}
      else{if(p.data.fuel>=10){msg('Nuotiossa on tarpeeksi puuta.');break;}if(invCount('puu')<1){msg('Tarvitset puuta.','warn');break;}invRemove('puu',1);p.data.fuel++;sfx('build');}break;
    case 'sanky':sleepAt(p);break;
    case 'arkku':openChest(p);break;
    case 'sulatin':if(p.data.done>0){giveOrDrop('kupari',p.data.done,p.x,p.y+1,p.z);p.data.done=0;sfx('pickup');break;}
      {const o=Math.min(invCount('malmi'),10-p.data.ore),w=Math.min(invCount('puu'),20-p.data.wood);if(o<=0&&w<=0){msg('Tarvitset kuparimalmia ja puuta.','warn');break;}if(o>0){invRemove('malmi',o);p.data.ore+=o;}if(w>0){invRemove('puu',w);p.data.wood+=w;}msg(`Uuniin: ${o} malmia, ${w} puuta.`);sfx('build');}break;
    case 'tyopenkki':case 'ahjo':togglePanel('inv');break;
  }}
}
function useAltar(){
  if(flags.boss){msg('Kehä on hiljainen. Vartija on poissa.');return;}
  if(boss)return;
  if(invCount('hiidenkivi')<3){msg('Alttarin kolme koloa ovat tyhjiä. Tarvitset kolme hiidenkiveä.','warn');return;}
  invRemove('hiidenkivi',3);msg('Kivet hehkuvat… maa vapisee!','warn');sfx('roar');shake(.6);
  circleStones.forEach(r=>r.material=MAT.glow);
  const L=LOC.circle;setTimeout(()=>{boss=spawnMob('vartija',L.x,L.z-4);boss.state='intro';boss.t=0;$('#bossbar').hidden=false;shockwave(L.x,6,L.z-4,10);},1600);
}
function openSarc(i){
  if(flags.sarc[i]){msg('Kirstu on tyhjä.');return;}
  flags.sarc[i]=1;const s=sarcs[i];s.lid.position.x=.7;s.lid.rotation.z=.3;
  giveOrDrop('hiidenkivi',1,s.p.x,DUN.y+1.2,s.p.z);
  const extra=[['kupari',2],['nuolet',12],['luu',3]][i];giveOrDrop(extra[0],extra[1],s.p.x,DUN.y+1.2,s.p.z);
  sfx('pickup');burst(s.p.x,DUN.y+1,s.p.z,0x7fd6cc,14,3);
}
function showLore(t,txt){const el=$('#msgs');const d=document.createElement('div');d.innerHTML=`<b style="color:var(--frost)">${t}</b><br><span style="font-weight:500">${txt}</span>`;d.style.maxWidth='440px';d.style.whiteSpace='normal';el.appendChild(d);d._life=14;msgEls.push(d);}

/* ---------------- DUNGEON TRAVEL ---------------- */
const dunKilled={};
function fadeTo(cb){const f=$('#fade');f.style.opacity=1;setTimeout(()=>{cb();setTimeout(()=>f.style.opacity=0,120);},380);}
function enterDungeon(){fadeTo(()=>{P.inDun=true;P.pos.set(dunEntry.x+.6,DUN.y+.05,dunEntry.z);P.vy=0;camYaw=-Math.PI/2;P.yaw=Math.PI/2;
  dunSpawns.forEach((s,i)=>{if(dunKilled[i])return;if(mobs.some(m=>m.dunIdx===i))return;const m=spawnMob(s.type,s.x,s.z,{y:DUN.y,dun:true});m.dunIdx=i;});
  msg('Hautakumpu. Ilma on kylmää ja seisovaa.');});}
function exitDungeon(){fadeTo(()=>{P.inDun=false;const L=LOC.barrow;P.pos.set(L.x+12.5,terrainH(L.x+12.5,L.z),L.z);P.vy=0;camYaw=-Math.PI/2;for(const m of [...mobs])if(m.dun)mobRemove(m);});}
