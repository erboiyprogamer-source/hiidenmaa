/* Hiidenmaa – actions.js
   Pelaajan toiminnot: hyökkäys, vahinko, syöminen, vuorovaikutus (E), alttari, luolastoon siirtyminen */
'use strict';

/* ---------------- PLAYER ACTIONS ---------------- */
function curWeapon(){const w=equipped('weapon');return w?{...ITEMS[w.id],id:w.id,q:w.q||1}:{n:'Nyrkit',dmg:3,dt:'blunt',range:1.8,st:4,spd:.45,id:null,q:1};}
let lastStamMsgT=-99;
function onPrimary(){
  if(P.dead||P.stagger>0)return;
  const w=curWeapon();
  if(w.cat==='hammer'){placeBuild();return;}
  if(w.cat==='shovel'){useShovel();return;}
  if(w.cat==='bow'){if(invCount('nuolet')<=0){msg('Ei nuolia.','warn');return;}P.drawing=true;P.bowDraw=0;return;}
  startAttack();
}
// Lapio: tasoittaa maata pehmeästi kohti pelaajan jalkojen korkeutta (±.4 m / käyttö).
let shovelCd=0;const _sh=[];
function useShovel(){
  if(P.dead||P.inDun||state!=='play'||playTime<shovelCd)return;
  if(P.stam<6){if(playTime-lastStamMsgT>1.2){msg('Liian uupunut.','warn');lastStamMsgT=playTime;}return;}
  const c=camRayPoint(6);if(dist2(c.x,c.z,P.pos.x,P.pos.z)>7*7)return;
  const R=3.2;for(const p of pieces)if(dist2(p.x,p.z,c.x,c.z)<(R+G*.6)**2){msg('Rakennus on tiellä.','warn');shovelCd=playTime+.8;return;}
  P.stam-=6;P.stamDelay=1;shovelCd=playTime+.45;P.atk={t:0,dur:.45,hitAt:.2,done:true,w:{},offBusy:true};P.yaw=camYaw+Math.PI;
  const h0=P.pos.y,i0=Math.max(0,Math.floor((c.x-R+HALF)/GS)),i1=Math.min(GN,Math.ceil((c.x+R+HALF)/GS)),j0=Math.max(0,Math.floor((c.z-R+HALF)/GS)),j1=Math.min(GN,Math.ceil((c.z+R+HALF)/GS));
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=-HALF+i*GS,z=-HALF+j*GS,d=Math.hypot(x-c.x,z-c.z);if(d>=R)continue;
    const k=j*HN+i,w=sstep(R,R*.4,d),dh=clamp((h0-HGT[k])*w,-.4,.4);if(Math.abs(dh)>.002)terraSetVertex(k,HGT[k]+dh);}
  terraFlush();for(const n of nodesNear(c.x,c.z,R+3,_sh))syncNodeY(n);
  sfx('build');burst(c.x,terrainH(c.x,c.z)+.2,c.z,0x7a5a38,8,3);}
function onPrimaryUp(){if(P.drawing){P.drawing=false;if(P.bowDraw>.15&&invCount('nuolet')>0)fireBow();P.bowDraw=0;}}
function onSecondary(){const w=curWeapon();if(w.cat==='hammer'){togglePanel('build');}}
function startAttack(){
  if(P.atk||P.inWater&&P.swim)return;
  const w=curWeapon();
  if(P.stam<w.st){if(playTime-lastStamMsgT>1.2){msg('Liian uupunut.','warn');lastStamMsgT=playTime;}return;}
  P.stam-=w.st;P.stamDelay=1;P.atk={t:0,dur:w.spd+.2,hitAt:w.spd*.55,done:false,w,offBusy:!!equipped('offhand')};
  P.yaw=camYaw+Math.PI;
}
function weaponDmg(w){return w.dmg*(1+.25*((w.q||1)-1))*(P.buffs.voima?1.15:1)*P.fx.dmg;}
const _nl=[];
function doMeleeHit(w){
  const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);let hitMob=false;const dmg=weaponDmg(w);
  for(const m of mobs){if(m.dead)continue;const dx=m.pos.x-P.pos.x,dz=m.pos.z-P.pos.z,d=Math.hypot(dx,dz);
    if(d>w.range+m.def.r)continue;if(Math.abs(m.pos.y-P.pos.y)>3+(m.type==='vartija'?3:0))continue;
    if(d>m.def.r+.4&&(dx*fx+dz*fz)/d<.45)continue;
    if(!losClear(P.pos.x,P.pos.y+1.3,P.pos.z,m.pos.x,mobEyeY(m),m.pos.z))continue;
    const sneak=P.crouch&&m.def.ai!=='boss'&&m.state!=='chase'&&m.state!=='flee';
    if(sneak)floatText('Hiiviskelyisku!',m.pos.x,m.pos.y+2.6,m.pos.z,'#ffd36a');
    damageMob(m,sneak?dmg*2:dmg,w.dt,dx,dz);hitMob=true;}
  if(hitMob&&!w.chop&&!w.pick)return;
  const list=nodesNear(P.pos.x+fx*1.2,P.pos.z+fz*1.2,w.range+1.4,_nl);let best=null,bd=1e9;
  for(const n of list){if(n.def.kind==='pick'||n.def.kind==='deco')continue;
    // tukki: lähin kohta janalla; muut: keskipiste
    let tx=n.x,tz=n.z;if(n.isLog){const ddx=n.bx-n.ax,ddz=n.bz-n.az,t=clamp(((P.pos.x-n.ax)*ddx+(P.pos.z-n.az)*ddz)/(ddx*ddx+ddz*ddz),0,1);tx=n.ax+ddx*t;tz=n.az+ddz*t;}
    const dx=tx-P.pos.x,dz=tz-P.pos.z,d=Math.hypot(dx,dz)-(n.isLog?n.rad:n.def.r*n.s);if(d>w.range+.2)continue;if(Math.hypot(dx,dz)>.5&&(dx*fx+dz*fz)/Math.max(.01,Math.hypot(dx,dz))<.3)continue;
    if(d<bd&&losClear(P.pos.x,P.pos.y+1.3,P.pos.z,tx,n.y+(n.isLog?.3:1),tz)){bd=d;best=n;}}
  if(!best)return;
  const n=best;
  if(n.def.kind==='tree'||n.def.kind==='log'){if(!w.chop){if(!hitMob){msg('Tarvitset kirveen kaataaksesi puun.','warn');sfx('hit');}return;}
    const tier=n.isLog?n.tier:(n.def.tier||1);if(w.chop<tier){if(!hitMob){msg('Tarvitset vahvemman kirveen.','warn');sfx('hit');}return;}
    n.hp-=(5+w.chop*4)*(1+.25*((w.q||1)-1));sfx('chop');burst(n.x,n.y+(n.isLog?.4:1.2),n.z,0x8a5a32,5,3);shake(.08);
    if(n.hp<=0){if(n.isLog){removeLog(n);const c=Math.max(1,Math.round(rint(rng,3,4)*n.s));for(let j=0;j<c;j++){const t=(j+.5)/c;spawnDrop(n.dropId,1,n.ax+(n.bx-n.ax)*t,n.y+.8,n.az+(n.bz-n.az)*t);}burst(n.x,n.y+.4,n.z,0x6b4527,12,4);}
      else{killNode(n);fallTree(n);bump('trees');}}}
  else if(n.def.kind==='rock'){if(!w.pick){if(!hitMob){msg('Tarvitset hakun louhiaksesi kiveä.','warn');sfx('hit');}return;}
    if(w.pick<(n.def.tier||1)){if(!hitMob){msg('Tarvitset paremman hakun.','warn');sfx('hit');}return;}
    n.hp-=(9+w.pick*3)*(1+.25*((w.q||1)-1));sfx('pick');burst(n.x,n.y+.8,n.z,n.type==='kuparisuoni'?0xd9874a:n.type==='rautasuoni'?0x8a4f3c:0x8f8d86,6,4);shake(.08);
    if(n.hp<=0){killNode(n);bump('rocks');burst(n.x,n.y+.6,n.z,0x8f8d86,16,6);for(const [id,lo,hi] of n.def.drops){const c=rint(rng,lo,hi);for(let j=0;j<c;j++)spawnDrop(id,1,n.x,n.y+.8,n.z);}}}
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
function killMob(m){m.dead=true;m.deadT=0;sfx('die');P.kills++;bump('kills');bump('k_'+m.type);addXp(Math.round(m.def.hp/(m.type==='vartija'?2:5))+3,m.def.n);
  for(const [id,lo,hi] of m.def.drops){const c=rint(rng,lo,hi);if(c>0)spawnDrop(id,c,m.pos.x,m.pos.y+1,m.pos.z);}
  if(m.type==='vartija'){flags.boss=1;$('#bossbar').hidden=true;bossDefeated();}
  if(m.dunIdx!==undefined)dunKilled[m.dunIdx]=1;
}
// Jousi: täysi vetoaika 1,6 s (laatu 2: 1,3 s, laatu 3: 1,07 s). Vajaa veto = vähemmän vahinkoa, hitaampi nuoli ja jyrkempi kaari; laatu suoristaa ja pidentää lentoa.
function bowDrawTime(){const w=curWeapon();return 1.6/(1+.25*((w.q||1)-1));}
function fireBow(){
  const w=curWeapon();const k=Math.min(1,P.bowDraw);invRemove('nuolet',1);bump('shots');
  const from=new V3(P.pos.x,P.pos.y+1.5,P.pos.z);
  const tgt=camRayPoint(70);const dir=tgt.sub(from).normalize();
  from.addScaledVector(dir,.6);
  const q=w.q||1;shootArrow(from,dir,(14+36*k)*(1+.1*(q-1)),weaponDmg(w)*(.2+.8*k),'player',7/(1+.3*(q-1)));sfx('bow');P.yaw=camYaw+Math.PI;
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
  if(P.hunger>=85&&!f.raw){P.buffs.vatsakipu=75;msg('Söit liikaa – vatsaa kivistää.','warn');}
  P.hunger=Math.min(100,P.hunger+f.h);if(f.hp)P.heal+=f.hp;if(f.st)P.stam=Math.min(maxStam(),P.stam+f.st);
  if(f.raw&&Math.random()<.45){P.buffs.pahoinvointi=40;msg('Raaka liha kääntää vatsaa.','warn');}
  if(f.buff)P.buffs[f.buff]=300;if(!f.raw)flags.ate=1;
  s.n--;if(s.n<=0)inv[inv.indexOf(s)]=null;invDirty=true;sfx('eat');msg(`Söit: ${ITEMS[s.id].n}`);
}
function maxHp(){return 60+(P.buffs.voima?15:0)+BON.hp;}
function maxStam(){return 100+(P.buffs.voima?25:0)+BON.stam;}

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
function pieceLabel(p){if(PIECES[p.t].store)return 'Avaa '+PIECES[p.t].n.toLowerCase();if(bt(p.t)==='ovi')return p.data.open?'Sulje ovi':'Avaa ovi';switch(p.t){
  case 'tikkaat':case 'kivitikkaat':return 'Kiipeä: pidä W (alas S)';
  case 'ovi':return p.data.open?'Sulje ovi':'Avaa ovi';
  case 'nuotio':case 'grilli':{if(p.data.cook.some(c=>c.t>=c.need))return 'Ota ruoka tulelta';const raw=Object.keys(COOKABLE).some(id=>invCount(id)>0);return raw&&p.data.fuel>0&&p.data.cook.length<(p.t==='grilli'?4:3)?'Paista ruokaa':`Lisää polttoainetta (palaa vielä ${firePct(p)} %)`;}
  case 'soihtuteline':return `Lisää polttoainetta (palaa vielä ${torchPct(p)} % · ${Math.ceil(p.data.burn/60)} min)`;
  case 'sanky':return isNight()?'Nuku':'Aseta herätyspaikka';
  case 'arkku':return 'Avaa arkku';
  case 'tynnyri':return 'Avaa tynnyri';
  case 'sulatin':{const st=`kupari ${p.data.ore}, rauta ${p.data.iore}, puu ${p.data.wood}`;return p.data.done>0||p.data.idone>0?`Ota harkot (kupari ${p.data.done}, rauta ${p.data.idone})`:invCount('malmi')>0||invCount('rautamalmi')>0||invCount('puu')>0?`Lisää malmia ja puuta (${st})`:`Sulatusuuni (${st})`;}
  case 'tyopenkki':return 'Käytä työpenkkiä';
  case 'ahjo':return 'Käytä ahjoa';
  default:return null;}}
function interact(){
  if(P.dead)return;const t=lookTarget;if(!t)return;
  if(t.kind==='node'){const n=t.n,d=n.def;const c=rint(rng,d.n[0],d.n[1]);const left=invAdd(d.item,c);if(left>=c){msg('Reppu on täynnä.','warn');return;}bump('picked');msg(`+${c-left} ${ITEMS[d.item].n}`,'loot');sfx('pickup');killNode(n);return;}
  if(t.kind==='it'){t.it.use();return;}
  if(t.kind==='grave'){const g=t.g;for(let i=0;i<g.items.length;i++){const s=g.items[i];if(!s)continue;const left=invAdd(s.id,s.n,s.q||1);if(left===0)g.items[i]=null;else s.n=left;}
    if(g.items.every(s=>!s)){scene.remove(g.mesh);graves.splice(graves.indexOf(g),1);msg('Sait tavarasi takaisin.','loot');}else msg('Reppu täyttyi – osa jäi kasaan.','warn');sfx('pickup');return;}
  if(t.kind==='piece'){const p=t.p;if(bt(p.t)==='ovi'){const a=p.rot*Math.PI/4,lz=(P.pos.x-p.x)*Math.sin(a)+(P.pos.z-p.z)*Math.cos(a);setDoor(p,!p.data.open,p.data.open?p.data.dir:(lz>0?1:-1));sfx('build');return;}if(PIECES[p.t].store){openChest(p);return;}switch(p.t){
    case 'nuotio':case 'grilli':fireInteract(p);break;
    case 'soihtuteline':{const b=p.data.burn;if(torchPct(p)>50){msg(`Soihdussa on jo tarpeeksi polttoainetta (${torchPct(p)} %).`);break;}if(invCount('puu')>0&&b<600){invRemove('puu',1);p.data.burn=600;msg('Soihtu palaa 10 min.');sfx('build');}else if(invCount('hiili')>0&&b<1800){invRemove('hiili',1);p.data.burn=1800;msg('Hiili: soihtu palaa 30 min.');sfx('build');}else msg(invCount('puu')>0||invCount('hiili')>0?'Soihdussa on jo tarpeeksi polttoainetta.':'Tarvitset puuta tai hiiltä.','warn');break;}
    case 'sanky':sleepAt(p);break;
    case 'arkku':case 'tynnyri':openChest(p);break;
    case 'sulatin':if(p.data.done>0||p.data.idone>0){if(p.data.done>0)giveOrDrop('kupari',p.data.done,p.x,p.y+1,p.z);if(p.data.idone>0)giveOrDrop('rauta',p.data.idone,p.x,p.y+1,p.z);p.data.done=0;p.data.idone=0;sfx('pickup');break;}
      {const o=Math.min(invCount('malmi'),10-p.data.ore),io=Math.min(invCount('rautamalmi'),10-p.data.iore),w=Math.min(invCount('puu'),20-p.data.wood),hc=Math.min(invCount('hiili'),Math.floor((20-p.data.wood-w)/10));if(o<=0&&io<=0&&w<=0&&hc<=0){msg('Tarvitset malmia (kupari tai rauta) ja puuta tai hiiltä.','warn');break;}
       if(o>0){invRemove('malmi',o);p.data.ore+=o;}if(io>0){invRemove('rautamalmi',io);p.data.iore+=io;}if(w>0){invRemove('puu',w);p.data.wood+=w;}if(hc>0){invRemove('hiili',hc);p.data.wood+=hc*10;}msg(`Uuniin: ${o} kuparimalmia, ${io} rautamalmia, ${w} puuta${hc?`, ${hc} hiiltä`:''}.`);sfx('build');}break;
    case 'tyopenkki':case 'ahjo':togglePanel('inv');break;
  }}
}
// Nuotio ja grillinuotio: 1) kerää valmis ruoka, 2) ripusta raaka ruoka (jokaisella oma aika), 3) lisää polttoainetta (puu = 1 yksikkö, hiili = 10).
function fireInteract(p){const cap=p.t==='grilli'?4:3,d=p.data;
  const done=d.cook.filter(c=>c.t>=c.need);
  if(done.length){for(const c of done){const burnt=c.t>=c.need*2;giveOrDrop(burnt?'hiili':COOKABLE[c.id],1,p.x,p.y+.8,p.z);if(!burnt)bump('cooked');}d.cook=d.cook.filter(c=>c.t<c.need);sfx('pickup');return;}
  const raw=Object.keys(COOKABLE).find(id=>invCount(id)>0);
  if(raw&&d.fuel>0&&d.cook.length<cap){invRemove(raw,1);d.cook.push({id:raw,t:0,need:9+Math.random()*5});msg(`${ITEMS[raw].n} paistuu… (ota ajoissa, muuten palaa hiileksi)`);sfx('craft');return;}
  if(firePct(p)>50){msg(`Tulessa on jo tarpeeksi polttoainetta (${firePct(p)} %).`);return;}
  if(invCount('puu')>0){invRemove('puu',1);d.fuel++;sfx('build');return;}
  if(d.fuel<=FUEL_MAX-10&&invCount('hiili')>0){invRemove('hiili',1);d.fuel+=10;msg('Hiili palaa pitkään.');sfx('build');return;}
  msg(invCount('puu')>0||invCount('hiili')>0?'Tulessa on tarpeeksi polttoainetta.':'Tarvitset puuta tai hiiltä.','warn');}
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
