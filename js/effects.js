/* Hiidenmaa – effects.js
   Veri ja haavat, kuolema-animaatiot (lössähtäminen, palokuolema → tuhkakasa), savupilvet ja pelaajan palaminen (v1.37, lista 3) */
'use strict';

/* ---------------- VERI (kohta 24) ---------------- */
// Jokainen osuma: pisaroita (määrä vahingon ja koon mukaan) ja läntti maahan, joka häipyy 10 s:ssa. Asetus SET.blood: 1 / .5 / 0.
// Kivihahmot pölisevät kivisiruja, kalmot luupölyä, Jäätär jääsiruja, Suonäkki usvaa, hiidet ja Aarnihirviö vihreää mahlaa.
const BLEED={kivivartija:'stone',vartija:'stone',kalmo:'bone',ylimys:'bone',kalmaherra:'bone',jaajattari:'ice',suonakki:'mist',hiisi:'sap',aarnihirvio:'sap'};
const BLEED_C={blood:[0x5a0808,0x7e0e0e],stone:[0x6a6660,0x8d887f],bone:[0xd8d0bc,0xb8ae98],ice:[0xbfe6ff,0x8fd0ff],mist:[0x9aa8a0,0xc8d0c8],sap:[0x34501a,0x56722a]};
const bleedKind=t=>BLEED[t]||'blood';
const splats=[],_spGeo=new THREE.CircleGeometry(1,16);
/* v1.56: läikkä mukailee maaston kaltevuutta (maastonormaali, kun läikkä on maanpinnalla eikä rakennuksella/luolastossa).
   Lammikon valuminen (Medium ja yli): jos rinne > 45°, lammikosta valuu 10 s ajan noro alarinteeseen (pienet pitkulaiset läikät). */
const _zAx=new THREE.Vector3(0,0,1);
function slopeN(x,z,y){const h=terrainH(x,z);if(Math.abs(y-h)>.12)return null;const e=.35,hx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),hz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e);
  if(Math.abs(hx)+Math.abs(hz)<.02)return null;return new THREE.Vector3(-hx,1,-hz).normalize();}
function fxHiQ(){const pi=presetIdx();return pi<0?SET.shadow==='high':pi>=3;}
function bloodUltra(){const pi=presetIdx();return pi===7||(pi<0&&!!SET.bloodFx&&(+SET.renderDist||0)>=520);}
function poolFlow(sp,x,z,c){if(!sp||!fxHiQ())return;const e=.35,hx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),hz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e);if(Math.hypot(hx,hz)<1)return;   // tan 45° = 1
  sp.flow={t:0,x,z,acc:0,c};}
function updateFlow(s,dt){const f=s.flow;f.t+=dt;if(f.t>10){s.flow=null;return;}const e=.35,hx=(terrainH(f.x+e,f.z)-terrainH(f.x-e,f.z))/(2*e),hz=(terrainH(f.x,f.z+e)-terrainH(f.x,f.z-e))/(2*e),g=Math.hypot(hx,hz);
  if(g<.15){s.flow=null;return;}const sp=.35*(1-f.t/12);f.x-=hx/g*sp*dt;f.z-=hz/g*sp*dt;f.acc+=dt;
  if(f.acc>.12){f.acc=0;const r=splat(f.x,terrainH(f.x,f.z),f.z,.06+Math.random()*.03,f.c,40,.88);if(r){r.m.scale.y*=2.2;r.r1=r.m.scale.y;r.grow=.2;}}}
function splat(x,y,z,r,color,life,op=.85,nx,nz){if(!(r>0))return null;
  const mt=new THREE.MeshBasicMaterial({color,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  const m=new THREE.Mesh(_spGeo,mt);if(nx||nz){m.rotation.set(0,Math.atan2(nx,nz),Math.random()*TAU);m.position.set(x+nx*.03,y,z+nz*.03);}else{const n=slopeN(x,z,y);if(n){m.quaternion.setFromUnitVectors(_zAx,n);m.rotateZ(Math.random()*TAU);m.position.set(x+n.x*.03,y+n.y*.03,z+n.z*.03);}else{m.rotation.x=-Math.PI/2;m.rotation.z=Math.random()*TAU;m.position.set(x,y+.025,z);}}m.scale.set(r*(.8+Math.random()*.5),r*(.6+Math.random()*.5),1);m.renderOrder=1;scene.add(m);
  const s={m,t:0,life,op,r0:m.scale.x,r1:m.scale.y,grow:.35};splats.push(s);while(splats.length>140){const o=splats.shift();scene.remove(o.m);o.m.material.dispose();}return s;}
function updateSplats(dt){for(let i=splats.length-1;i>=0;i--){const s=splats[i];s.t+=dt;if(s.flow)updateFlow(s,dt);const g=Math.min(1,s.t/s.grow);s.m.scale.set(s.r0*(.4+.6*g),s.r1*(.4+.6*g),1);
  s.m.material.opacity=s.op*Math.min(1,s.t*6)*Math.min(1,(s.life-s.t)/2.5);if(s.t>=s.life){scene.remove(s.m);s.m.material.dispose();splats.splice(i,1);}}}
const groundY=(x,z,y,dun)=>dun?DUN.y:Math.max(-1,groundAt(x,z,.2,(y??terrainH(x,z))+.6));
// size ≈ olennon koko (säde), dmg = vahinko
// v1.39 (lista 4, extra 1): veren fysiikka (SET.bloodFx, High+ ja Ultra): pisarat lentävät lyönnin suuntaan (hx,hz), putoavat ja jäävät
// maahan pieniksi läikiksi (10 s). Kuoleman lammikko kasvaa hitaasti (kasvuaika 4 s).
const drips=[],_drGeo=new THREE.SphereGeometry(.035,5,4),_drMat={};
function dripMat(c){return _drMat[c]||(_drMat[c]=new THREE.MeshBasicMaterial({color:c}));}
function updateDrips(dt){for(let i=drips.length-1;i>=0;i--){const d=drips[i];d.vy-=14*dt;d.m.position.x+=d.vx*dt;d.m.position.y+=d.vy*dt;d.m.position.z+=d.vz*dt;
  const q=d.m.position,g=d.dun?Math.max(DUN.y,groundAt(q.x,q.z,.05,q.y+.3)):groundAt(q.x,q.z,.05,q.y+.3);
  if(q.y<=g+.02){scene.remove(d.m);drips.splice(i,1);splat(q.x,g,q.z,.05+Math.random()*.07,d.c,10,.9);}
  else if(pointBlocked(q.x,q.y,q.z,false,true)){scene.remove(d.m);drips.splice(i,1);const l=Math.hypot(d.vx,d.vz)||1;splat(q.x-d.vx/l*.05,q.y,q.z-d.vz/l*.05,.04+Math.random()*.05,d.c,10,.9,-d.vx/l,-d.vz/l);}   // seinään tai esineen kylkeen
  else if((d.t=(d.t||0)+dt)>3){scene.remove(d.m);drips.splice(i,1);}}}
function bleed(x,y,z,kind,size,dmg,dun,hx,hz,kb){const k=+(SET.blood??1);const C=BLEED_C[kind]||BLEED_C.blood;
  const U=SET.bloodFx&&bloodUltra()?2:1;   // v1.56: Ultra – veri lentää tuplasti rajummin ja hiukkasia 2×
  if(k&&SET.bloodFx&&(kind==='blood'||kind==='sap')&&(hx||hz)){const l=Math.hypot(hx,hz)||1,ux=hx/l,uz=hz/l,n=Math.round(clamp((4+dmg*.25)*(.6+size)*k*U,3,22*U));
    for(let i=0;i<n&&drips.length<120*U;i++){const m=new THREE.Mesh(_drGeo,dripMat(C[i%2]));m.position.set(x,y,z);scene.add(m);const sp=(1.7+clamp((kb||8)/25,0,1)*6.6)*(.55+Math.random()*.45)*(U>1?1.45:1);   /* lentomatka ~1–5 m tönäisyn mukaan */
      drips.push({m,c:C[0],dun,vx:ux*sp+(Math.random()-.5)*1.4*U,vz:uz*sp+(Math.random()-.5)*1.4*U,vy:(1+Math.random()*2.5)*(U>1?1.3:1)});}}
  if(kind!=='blood'&&kind!=='sap'){burst(x,y,z,C[0],Math.round(4+size*4),3);return;}   // ei verta: sirut/pöly
  if(!k)return;const n=Math.round(clamp((3+dmg*.18)*(.6+size)*k*U,2,26*U));burst(x,y,z,C[Math.random()<.5?0:1],n,2.2+size*1.5);
  const gy=groundY(x,z,y,dun);for(let i=0,m=1+(size>.9?2:size>.6?1:0);i<m;i++)splat(x+(Math.random()-.5)*size*1.4,gy,z+(Math.random()-.5)*size*1.4,(.18+Math.min(.5,dmg*.012))*(.7+size*.6)*Math.sqrt(k),C[0],10);}
// Haava: tummanpunainen läikkä mobin pintaan (enint. 6), häviää ruumiin mukana.
const _wGeo=new THREE.BoxGeometry(1,1,1),_wMat=new THREE.MeshStandardMaterial({color:0x5a0808,roughness:.5,metalness:.1}),_wSap=new THREE.MeshStandardMaterial({color:0x34501a,roughness:.5});
function addWound(m,force){if(!(+(SET.blood??1))||(m.wounds|0)>=(force?11:6))return null;const kind=bleedKind(m.type);if(kind!=='blood'&&kind!=='sap')return null;
  const ms=[];m.f.g.traverse(o=>{if(o.isMesh&&o.geometry&&!o.userData.wound&&!(m.fireFx&&isChildOf(o,m.fireFx))&&o.material&&o.material.isMeshStandardMaterial)ms.push(o);});if(!ms.length)return null;
  const o=ms[Math.random()*ms.length|0];if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox,ax=Math.random()*3|0,sg=Math.random()<.5?-1:1;
  const p=new THREE.Vector3(lerp(b.min.x,b.max.x,.2+Math.random()*.6),lerp(b.min.y,b.max.y,.2+Math.random()*.6),lerp(b.min.z,b.max.z,.2+Math.random()*.6));p.setComponent(ax,sg>0?b.max.getComponent(ax):b.min.getComponent(ax));
  const ws=o.getWorldScale(new THREE.Vector3()),sz=(.05+Math.random()*.06)*(m.def.r>.9?1.6:1);const w=new THREE.Mesh(_wGeo,kind==='sap'?_wSap:_wMat);w.userData.wound=1;
  w.scale.set(sz/ws.x,sz/ws.y,sz/ws.z);w.scale.setComponent(ax,.012/ws.getComponent(ax));w.position.copy(p);w.userData.ax=ax;o.add(w);m.wounds=(m.wounds|0)+1;return w;}
function isChildOf(o,p){for(let a=o;a;a=a.parent)if(a===p)return true;return false;}

/* ---------------- SAVU (kohta 36) ---------------- */
// Isot pehmeät savupilvet (palava mob, palokuolema): nousevat, laajenevat ja haalistuvat. Määrää rajoittaa hiukkasasetus PF.
const puffs=[],_pfGeo=new THREE.IcosahedronGeometry(1,2);
function smokePuff(x,y,z,size=1,dark=.25){if(puffs.length>48*PF||Math.random()>PF)return;const c=new THREE.Color().setScalar(dark+Math.random()*.12);
  const m=new THREE.Mesh(_pfGeo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.0,depthWrite:false}));m.position.set(x,y,z);m.scale.setScalar(.2*size);scene.add(m);
  puffs.push({m,t:0,life:2.2+Math.random()*1.4,size,vx:(Math.random()-.5)*.4+WIND.x*WIND.spd*.04,vz:(Math.random()-.5)*.4+WIND.z*WIND.spd*.04,vy:.9+Math.random()*.6});}
function updatePuffs(dt){for(let i=puffs.length-1;i>=0;i--){const p=puffs[i];p.t+=dt;const k=p.t/p.life;
  p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.m.scale.setScalar(p.size*.6*(.25+k*.9));p.m.material.opacity=.3*Math.min(1,p.t*4)*(1-k)*(1-k*.3);p.m.rotation.y+=dt*.4;
  if(k>=1){scene.remove(p.m);p.m.material.dispose();puffs.splice(i,1);}}}

/* ---------------- KUOLEMA (kohta 23b) ---------------- */
// Tavallinen: ruumis kaatuu kyljelleen (0,6 s), raajat valahtavat, veriläntti alle; makaa ~7 s, vajoaa ja häipyy 2 s (yht. < 10 s).
// Palokuolema (palaa kuollessa tai lyöty soihdulla / tulinuolella / kuoli nuotiossa): mustuu 1,5 s liekeissä → tuhkakasa, joka vajoaa 8 s.
const DEATH_END=9.4;
/* ===================== POMOT: HERÄTYS, RYNTÄYS JA KUOLEMA (v1.89–v1.90) =====================
   Yhteiset: silmien kirkastus bossEyes (makeHumanoid → f.eyes, omat materiaalit), etusijavalot bossLight (pri → aina valopaikka,
   environment.js updateLights), koko huoneen kirkastus BOSS_GLOW (environment.js lisää sen hemi/amb-valoon).
   Kaikki efektit siivotaan (bossRiseFxEnd, bossDeathEnd), myös jos pomo poistetaan kesken (mobRemove). */
let BOSS_GLOW=0;
const _whC=new THREE.Color(0xffffff),_soilC=new THREE.Color(0x3b2e22),_bb=new THREE.Box3(),_bv=new V3(),_bv2=new V3(),_bUp=new V3(0,1,0);
function bossCol(m){return m.realm&&typeof REALMS!=='undefined'&&REALMS[m.realm]?REALMS[m.realm].glow:0x7ffff0;}
function bossLight(m,c,i,pri){const L={x:m.pos.x,y:m.pos.y+1,z:m.pos.z,c,i:Math.max(.05,i),on:()=>true,move:true,dun:!!m.dun,pri:pri||3};lightSources.push(L);updateLights();return L;}
function dropLightSrc(L){if(!L)return;const i=lightSources.indexOf(L);if(i>=0)lightSources.splice(i,1);}
// silmät: k 0…1,3 kirkastaa (kohti valkoista), suurentaa ja lisää hehkupallon jokaisen silmän ympärille
function bossEyes(m,k){const E=m.f.eyes;if(!E||!E.length)return;
  if(!m.eyeB)m.eyeB=E.map(e=>({c:e.material.color.clone(),s:e.scale.clone()}));
  for(let i=0;i<E.length;i++){const e=E[i],b=m.eyeB[i];e.material.color.copy(b.c).lerp(_whC,Math.min(1,k*.7));e.scale.copy(b.s).multiplyScalar(1+.7*Math.min(1.5,k));}
  if(k>.02&&!m.eyeH)m.eyeH=E.map(e=>{const h=new THREE.Mesh(new THREE.SphereGeometry(.06*(m.f.s||1),8,6),new THREE.MeshBasicMaterial({color:m.eyeB[0].c.clone().lerp(_whC,.25),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
    h.position.copy(e.position);e.parent.add(h);return h;});
  if(m.eyeH)for(const h of m.eyeH){h.visible=k>.02;h.material.opacity=Math.min(.8,.6*k);h.scale.setScalar(1+.9*k);}}

/* POMON HERÄTYS (8 s, v1.90). Nukkuva pomo odottaa NÄKYMÄTTÖMÄNÄ MAAN ALLA (bossHide) – ei vilahda näkyviin huoneeseen tultaessa.
   Herää kun pelaaja astuu huoneeseen (etäisyys + näköyhteys, dungeons.js). Haavoittumaton koko ajan (m.sinking), terveyspalkki näkyy heti.
   0–1,2 s   lattia halkeaa: hehkuva rengas ja säröt pomon värissä, halkeamasta nousee oikeaa valoa, maa tärisee
   1,2–5,6 s pomo nousee hitaasti maan alta pää alhaalla ja kädet sivuilla (nukkuu yhä); multaa varisee maasta ja vartalosta
   5,6–6,6 s pää nousee – 5,9 s pomo HUOMAA pelaajan: silmät leimahtavat, suuttumisääni, halkeama välähtää, kääntyy pelaajaan
   6,6–7,6 s suoristuu ja levittää kätensä; 7,5 s paineaalto, pöly ja jysähdys; halkeamat sammuvat → 8 s jahti alkaa */
const BOSS_RISE=8;
function bossHide(m,H){m.riseY=m.riseY??m.pos.y;m.pos.y=m.riseY-H;m.f.g.position.copy(m.pos);m.f.g.visible=false;m.sinking=1;}
function bossRiseFx(m,gy){const col=bossCol(m),r=Math.max(.9,m.def.r),g=new THREE.Group();g.position.set(m.pos.x,gy+.04,m.pos.z);
  const mk=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
  const rm=mk(col),cm=mk(new THREE.Color(col).lerp(_whC,.35));
  const ring=new THREE.Mesh(new THREE.RingGeometry(r*.5,r*1.6,40),rm);ring.rotation.x=-Math.PI/2;g.add(ring);
  for(let i=0;i<9;i++){const a=i/9*TAU+Math.random()*.5,L=r*(1.3+Math.random()*1.7),cg=new THREE.Group();cg.rotation.y=a;
    const c=new THREE.Mesh(new THREE.PlaneGeometry(.08+Math.random()*.09,L),cm);c.rotation.x=-Math.PI/2;c.position.z=r*.45+L/2;cg.add(c);g.add(cg);}
  scene.add(g);const L=bossLight(m,col,.05,2);L.x=m.pos.x;L.y=gy+.6;L.z=m.pos.z;m.rz={g,rm,cm,ring,L,sw:0};}
function bossRiseFxEnd(m){const R=m.rz;if(!R)return;scene.remove(R.g);R.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});R.rm.dispose();R.cm.dispose();dropLightSrc(R.L);updateLights();m.rz=null;}
function bossRisePose(m,dt,gy,H){const f=m.f,t=m.t,r=Math.max(.9,m.def.r);
  if(!m.rz){bossRiseFx(m,gy);m.riseY=gy;}
  f.g.visible=true;
  const k=sstep(1.2,5.6,t),w=sstep(5.6,6.6,t),st=Math.sin(sstep(6.6,7.6,t)*Math.PI);
  m.pos.y=gy-(1-k)*H;
  if(f.head){f.head.rotation.x=.85*(1-w);f.head.rotation.y=0;}
  if(f.armL){f.armL.rotation.set(-.3*st,0,.14*(1-w)+.75*st);f.armR.rotation.set(-.3*st,0,-.14*(1-w)-.75*st);}
  if(f.elbowL){const e=-.15*(1-w)-.6*st;f.elbowL.rotation.x=e;f.elbowR.rotation.x=e;}
  if(f.legL){f.legL.rotation.set(0,0,0);f.legR.rotation.set(0,0,0);if(f.kneeL){f.kneeL.rotation.x=0;f.kneeR.rotation.x=0;}}
  f.g.position.copy(m.pos);f.g.rotation.y=m.yaw;
  const R=m.rz,crack=sstep(0,1.2,t)*(1-sstep(7.3,8,t)),pulse=.82+.18*Math.sin(t*7),notice=sstep(5.8,6.05,t)*(1-sstep(6.2,7.4,t));
  R.rm.opacity=.55*crack*pulse;R.cm.opacity=.85*crack*pulse;R.ring.scale.setScalar(.6+.4*sstep(0,1.2,t)+.25*k);
  R.L.i=.05+3.4*crack*pulse+5*notice;
  if(t<1.2&&Math.random()<dt*10)shake(.08);
  if(t>1.2&&t<5.6&&Math.random()<dt*3)shake(.12);
  if(t<5.8&&Math.random()<dt*(t<1.2?14:26))burst(m.pos.x+(Math.random()-.5)*r*3.2,gy+.15,m.pos.z+(Math.random()-.5)*r*3.2,Math.random()<.5?0x5d5a54:0x6a5a44,3,4);   // multaa ja kiviä
  if(k>.05&&k<.99&&Math.random()<dt*10)burst(m.pos.x+(Math.random()-.5)*r,gy+Math.random()*H*k*.9,m.pos.z+(Math.random()-.5)*r,0x4a3e30,3,1.5);   // vartalosta varisee multaa
  if(t>=5.9&&!m.woke)bossWakeRoar(m);   // pää nousee → huomaa pelaajan
  bossEyes(m,t<5.8?0:1.3*sstep(5.8,6.05,t)*(1-sstep(6.4,7.8,t)));
  if(t>=7.5&&!R.sw){R.sw=1;const col=bossCol(m);shockwave(m.pos.x,gy,m.pos.z,9,col);burst(m.pos.x,gy+.3,m.pos.z,col,22,7);smokePuff(m.pos.x,gy+.4,m.pos.z,2+r,.4);shake(.5);sfx('slam',.7,.8);}
  if(t>=BOSS_RISE){bossRiseFxEnd(m);bossEyes(m,0);return false;}
  return true;}
// pomo huomaa pelaajan (pään noustessa): oma suuttumisääni (tai tehty karjaisu), viesti. Estää creTickiä soittamasta samaa uudestaan.
function bossWakeRoar(m){if(m.woke)return;m.woke=1;if(!creSnd(m,'aggro'))sfx('roar');m.angerDone=1;m.angerTry=99;m.inChase=1;m.chT=2.5+Math.random()*2;shake(.5);msg(`${m.def.n} herää!`,'warn');}

/* POMON RYNTÄYS (v1.90): kierrosjärjestys YXZ → kallistus hahmon OMAAN eteen (ennen XYZ kallisti maailman X-akselin ympäri = sivulle).
   0–0,6 s valmistautuu: kyyristyy, kädet taakse, SILMÄT KIRKASTUVAT · 0,6–1,45 s etukeno 0,45 rad, polvet koukussa, jalat juoksevat ·
   loppu palautuu. bossChargeReset nollaa asennon myös, jos ryntäys keskeytyy (vaihe vaihtuu, pomo kuolee). */
function bossChargePose(m,a){const f=m.f;if(f.g.rotation.order!=='YXZ')f.g.rotation.order='YXZ';m.chPose=1;
  const wk=sstep(0,.5,a.t),run=sstep(.55,.75,a.t)*(1-sstep(1.4,1.6,a.t)),ph=a.t*15,cr=wk*(1-run);
  f.g.rotation.x=.16*cr+.45*run;
  if(f.head)f.head.rotation.x=-.18*cr-.38*run;
  if(f.armL){const ax=.55*cr+(.95+Math.sin(ph)*.25)*run;f.armL.rotation.set(ax,0,.18);f.armR.rotation.set(ax,0,-.18);}   // kädet taakse
  if(f.legL){const s=Math.sin(ph)*.85*run;f.legL.rotation.set(-.45*cr+s-.25*run,0,0);f.legR.rotation.set(-.45*cr-s-.25*run,0,0);}
  if(f.kneeL){f.kneeL.rotation.x=.8*cr+(.45+.45*Math.max(0,Math.sin(ph)))*run;f.kneeR.rotation.x=.8*cr+(.45+.45*Math.max(0,-Math.sin(ph)))*run;}
  if(f.elbowL){f.elbowL.rotation.x=-.5*run;f.elbowR.rotation.x=-.5*run;}
  bossEyes(m,a.t<.6?1.3*sstep(0,.35,a.t):1.3*(1-sstep(.6,1.1,a.t)));}
function bossChargeReset(m){if(!m.chPose)return;m.chPose=0;const f=m.f;f.g.rotation.x=0;if(f.head)f.head.rotation.x=0;
  if(f.armL){f.armL.rotation.set(0,0,0);f.armR.rotation.set(0,0,0);}if(f.legL){f.legL.rotation.set(0,0,0);f.legR.rotation.set(0,0,0);}
  if(f.kneeL){f.kneeL.rotation.x=0;f.kneeR.rotation.x=0;}if(f.elbowL){f.elbowL.rotation.x=0;f.elbowR.rotation.x=0;}bossEyes(m,0);}

/* POMON KUOLEMA (v1.90: ~12 s + maatuminen ~10 s, kaikki pomot – muut olennot lössähtävät kuten ennen):
   0–3,2 s    kohoaa irti maasta ja KALPENEE HETI; todelliset pistevalot syttyvät ja PINOUTUVAT (0,4 / 1,6 / 2,8 s, etusija valopaikkoihin,
              kiertävät hitaasti pomon ympäri) → huone kirkastuu pehmeästi (+ BOSS_GLOW hemi/amb-valoon); valopölyä nousee
   2,6–5,2 s  levittää kätensä, pää taakse
   5,6 s      kuolinääni kaiulla (+ jälkikaiku 0,45 s) – RUUMIS REPEÄÄ: vartalo jää keskelle, muut osat liukuvat hitaasti omiin suuntiinsa
              hieman irti kehosta, valosäikeet vartalon ja osien välissä; saalis ilmestyy leijumaan
   8,4–9,1 s  valo, hehku ja vaaleus katoavat (pehmeä nopea häivytys)
   8,9 s →    osat putoavat yksitellen painovoimalla (vartalo viimeisenä), pieni pomppu ja pöly; saalis leijuu vielä ja putoaa nätisti 12,6 s
   maassa     MAATUMINEN ~10 s: osat tummuvat mullaksi, painuvat kokoon ja vajoavat; alle kasvaa multakumpu, jolle nousee pomon värissä
              hehkuvia sieniä ja itiöitä leijuu. Tulikuolemassa tuhkakasa ja hiillosta. Lopuksi kaikki häipyy. */
const BD={brk:5.6,dim:8.4,dimLen:.7,drop0:8.9,loot:12.6,decay:10};
function bossDeathAnim(m,dt){const f=m.f,g=f.g,t=m.deadT,r=Math.max(.9,m.def.r),col=bossCol(m);
  if(!m.da){bossChargeReset(m);bossEyes(m,0);if(m.rz)bossRiseFxEnd(m);
    g.position.copy(m.pos);g.visible=true;
    const basic=[];g.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshBasicMaterial&&!basic.includes(o.material))basic.push(o.material);});   // v1.93: hehkut (silmät, riimut, sienet)
    for(const b of basic){b.transparent=true;b.userData.op0=b.opacity;}
    m.da={boss:1,y0:m.pos.y,ash:!!m.ashDeath,basic,col:m.mats.map(mt=>mt.color.clone()),emi:m.mats.map(mt=>mt.emissive.clone()),
      lights:[],lightsOff:0,parts:null,beams:null,loot:m.bossLoot||null,lootDone:!m.bossLoot,firstLand:0,lastLand:0,landed:0,mounds:[]};
    const gl=new THREE.Mesh(new THREE.SphereGeometry(r*1.5,14,10),new THREE.MeshBasicMaterial({color:0xfff6e0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
    gl.position.set(m.pos.x,m.pos.y+r*1.6,m.pos.z);scene.add(gl);m.da.glow=gl;}
  const D=m.da,out=1-sstep(BD.dim,BD.dim+BD.dimLen,t),pale=sstep(0,4.2,t)*out;
  // 1) kohoaa ja levittää kädet (ennen repeämistä)
  if(!D.parts){const lift=sstep(0,3.2,t)*(1.3+r*.5),sp=sstep(2.6,5.2,t),lk=Math.min(1,dt*2.5);
    g.position.set(m.pos.x,D.y0+lift+Math.sin(t*1.7)*.06*sstep(2,3.2,t),m.pos.z);g.rotation.y+=dt*.22;
    if(f.head)f.head.rotation.x=lerp(f.head.rotation.x,.45*(1-sp)-.6*sp,lk);
    if(f.armL){const ax=lerp(f.armL.rotation.x,.15*(1-sp)-.15*sp,lk),az=lerp(f.armL.rotation.z,.35*(1-sp)+1.45*sp,lk);f.armL.rotation.set(ax,0,az);f.armR.rotation.set(ax,0,-az);}
    if(f.elbowL){const e=lerp(f.elbowL.rotation.x,-.25*(1-sp),lk);f.elbowL.rotation.x=e;f.elbowR.rotation.x=e;}
    if(f.legL){f.legL.rotation.set(lerp(f.legL.rotation.x,.15,lk),0,lerp(f.legL.rotation.z,.18*sp,lk));f.legR.rotation.set(lerp(f.legR.rotation.x,.05,lk),0,lerp(f.legR.rotation.z,-.18*sp,lk));}
    if(f.kneeL){f.kneeL.rotation.x=lerp(f.kneeL.rotation.x,.3*(1-sp),lk);f.kneeR.rotation.x=lerp(f.kneeR.rotation.x,.2*(1-sp),lk);}
    if(t<1.5&&Math.random()<dt*6)burst(m.pos.x+(Math.random()-.5)*r*2,D.y0+.2,m.pos.z+(Math.random()-.5)*r*2,0x6a5a44,3,3);}
  const cy=D.cy??(g.position.y+r*1.4);
  // 2) vaaleus ja väri: kalpenee heti, tulikuolemassa tuhka, maassa multa
  const ac=D.ash?sstep(BD.dim,BD.dim+1.5,t):0,dkc=D.firstLand?sstep(D.firstLand+.5,D.firstLand+5,t):0;
  if(D.basic){const bo=(1-sstep(BD.dim,BD.dim+1.2,t))*(D.landed>=(D.parts?D.parts.length:1e9)?1-sstep(D.lastLand+BD.decay-2,D.lastLand+BD.decay,t):1);for(const b of D.basic)b.opacity=(b.userData.op0??1)*Math.max(.0,bo);}
  for(let i=0;i<m.mats.length;i++){const mt=m.mats[i];mt.color.copy(D.col[i]).lerp(_ashC,ac).lerp(D.ash?_ashC:_soilC,dkc*.85).lerp(_whC,pale);mt.emissive.copy(D.emi[i]).multiplyScalar(1-dkc).lerp(_whC,pale*.9);}
  // 3) pinoutuvat todelliset valot + huoneen kirkastus; katoavat himmennyksessä
  if(!D.lightsOff){
    for(let j=0;j<3;j++)if(!D.lights[j]&&t>=.4+j*1.2)D.lights[j]=bossLight(m,j===0?0xfff2d8:j===1?0xffffff:new THREE.Color(col).lerp(_whC,.6).getHex(),.05,4);
    for(let j=0;j<D.lights.length;j++){const L=D.lights[j];if(!L)continue;const a=j/3*TAU+t*.5;L.x=m.pos.x+Math.cos(a)*r*1.3;L.z=m.pos.z+Math.sin(a)*r*1.3;L.y=cy-.3+j*.4;L.i=.05+9*sstep(.4+j*1.2,2.2+j*1.2,t)*out;}
    BOSS_GLOW=sstep(.8,4.6,t)*out;
    if(D.glow){D.glow.material.opacity=.26*pale*(.9+.1*Math.sin(t*5));D.glow.scale.setScalar(.7+.5*pale);D.glow.position.set(m.pos.x,cy,m.pos.z);}
    if(out>.5&&Math.random()<dt*(6+18*pale))burst(m.pos.x+(Math.random()-.5)*r*2.4,cy-1+Math.random()*2,m.pos.z+(Math.random()-.5)*r*2.4,0xffffff,1,1);   // valopölyä
    if(t>BD.dim+BD.dimLen+.05){D.lightsOff=1;for(const L of D.lights)dropLightSrc(L);D.lights=[];BOSS_GLOW=0;updateLights();
      if(D.glow){scene.remove(D.glow);D.glow.material.dispose();D.glow=null;}}}
  // 4) repeäminen: vartalo jää keskelle, muut osat liukuvat omiin suuntiinsa; kuolinääni; saalis leijumaan
  if(!D.parts&&t>=BD.brk){g.updateMatrixWorld(true);D.cx=m.pos.x;D.cz=m.pos.z;let ty=g.position.y+r*1.4;if(f.torso){_bb.setFromObject(f.torso);_bb.getCenter(_bv);ty=_bv.y;}D.cy=ty;
    if(!creSnd(m,'death',{rev:1.9}))sfx('die',.7,1);
    for(const o of g.children.slice())if(!o.visible)g.remove(o);   // v1.93: piilotetut (esim. Ultra-palat muulla tasolla) eivät ole osia
    D.parts=g.children.slice().map(o=>{_bb.setFromObject(o);const c=_bb.getCenter(new V3()),sz=_bb.getSize(new V3()),tor=o===f.torso;scene.attach(o);
      let dx=c.x-D.cx,dy=c.y-ty,dz=c.z-D.cz,l=Math.hypot(dx,dy,dz);if(l<.15){const a=Math.random()*TAU;dx=Math.cos(a);dz=Math.sin(a);dy=.2;l=Math.hypot(dx,dy,dz);}
      const dd=tor?0:.45+Math.random()*.45+Math.max(sz.x,sz.y,sz.z)*.15;
      return {o,tor,c,p0:o.position.clone(),r0:o.rotation.clone(),s0:o.scale.clone(),off:new V3(dx/l*dd,dy/l*dd*.6,dz/l*dd),
        w:new V3((Math.random()-.5)*.7,(Math.random()-.5)*.7,(Math.random()-.5)*.7),size:Math.max(sz.x,sz.y,sz.z),fall:0,rest:0,v:new V3(),spin:new V3()};});
    const ord=D.parts.filter(q=>!q.tor).sort(()=>Math.random()-.5),gap=Math.min(.22,1.5/Math.max(1,ord.length));
    ord.forEach((q,i)=>q.dropT=BD.drop0+i*gap);for(const q of D.parts)if(q.tor)q.dropT=BD.drop0+ord.length*gap+.3;
    D.bm=new THREE.MeshBasicMaterial({color:0xfffaf0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
    D.beams=ord.slice().sort((a,b)=>b.size-a.size).slice(0,10).map(q=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1,6,1,true),D.bm);scene.add(b);return {b,q};});
    if(D.loot&&!D.lootDone){D.lootDone=1;D.loot.forEach(([id,c],i)=>{const a=i/D.loot.length*TAU+Math.random()*.4,d=spawnDrop(id,c,D.cx,ty,D.cz);
      d.hold=BD.loot-t+i*.12;d.hy=ty+.1+Math.random()*.5;d.vx=Math.cos(a)*.9;d.vz=Math.sin(a)*.9;d.vy=0;d.ph=Math.random()*TAU;beaconAdd(d,new THREE.Color(col).lerp(_whC,.35).getHex());});}   // v1.93 majakkasäde
    burst(D.cx,ty,D.cz,0xffffff,30,8);shake(.55);}
  if(t>=BD.brk+.45&&!D.ech&&D.parts){D.ech=1;creSnd(m,'death',{rev:2.6,v:.4,p:.9,pri:1.4,add:1,key:'kaiku'});}   // jälkikaiku
  // valosäikeet vartalon ja irtoavien osien välissä
  if(D.beams){const bo=sstep(BD.brk,BD.brk+.6,t)*out;D.bm.opacity=.7*bo*(.8+.2*Math.sin(t*11));
    for(const B of D.beams){const q=B.q;B.b.visible=bo>.01&&!q.fall;if(!B.b.visible)continue;
      _bv.set(q.c.x+q.o.position.x-q.p0.x,q.c.y+q.o.position.y-q.p0.y,q.c.z+q.o.position.z-q.p0.z).sub(_bv2.set(D.cx,D.cy,D.cz));
      const L=_bv.length()||.01;B.b.position.set(D.cx+_bv.x/2,D.cy+_bv.y/2,D.cz+_bv.z/2);B.b.scale.set(1,L,1);B.b.quaternion.setFromUnitVectors(_bUp,_bv.multiplyScalar(1/L));}
    if(t>BD.dim+BD.dimLen+.05){for(const B of D.beams){scene.remove(B.b);B.b.geometry.dispose();}D.beams=null;D.bm.dispose();D.bm=null;}}
  // 5) osat: leijuvat irti → putoavat yksitellen → maatuvat
  if(D.parts){const e=sstep(BD.brk,BD.brk+1.8,t);
    for(const q of D.parts){const o=q.o;
      if(!q.fall){o.position.copy(q.p0).addScaledVector(q.off,e);o.position.y+=Math.sin(t*1.6+q.p0.x)*.05*e;
        o.rotation.set(q.r0.x+q.w.x*e,q.r0.y+q.w.y*e,q.r0.z+q.w.z*e);
        if(t>=q.dropT){q.fall=1;q.v.set(q.off.x*.6,0,q.off.z*.6);q.spin.set((Math.random()-.5)*4,(Math.random()-.5)*3,(Math.random()-.5)*4);}}
      else if(!q.rest){q.v.y-=15*dt;o.position.addScaledVector(q.v,dt);o.rotation.x+=q.spin.x*dt;o.rotation.y+=q.spin.y*dt;o.rotation.z+=q.spin.z*dt;
        _bb.setFromObject(o);const gy=groundY(o.position.x,o.position.z,_bb.min.y+.5,m.dun);
        if(_bb.min.y<=gy){o.position.y+=gy-_bb.min.y;
          if(q.v.y<-3&&!q.bounced){q.bounced=1;q.v.y*=-.22;q.v.x*=.5;q.v.z*=.5;q.spin.multiplyScalar(.4);}
          else{q.rest=1;q.landT=t;q.gy=gy;q.y0=o.position.y;_bb.setFromObject(o);q.lc=_bb.getCenter(new V3());D.landed++;if(!D.firstLand)D.firstLand=t;D.lastLand=t;bossMound(m,q);}
          burst(o.position.x,gy+.15,o.position.z,D.ash?0x3a3633:0x6a5a44,q.tor?14:6,q.tor?4:2);if(q.tor){shake(.3);sfx('slam',.5,.5);}}}
      else{const a=t-q.landT,k=sstep(1,8,a);o.scale.set(q.s0.x*(1+.15*k),q.s0.y*(1-.6*k),q.s0.z*(1+.15*k));o.position.y=q.y0-k*(.25+q.size*.3);}}
    bossDecay(m,dt,t);}
  // 6) loppuhäivytys ja siivous, kun kaikki osat ovat maatuneet
  if(D.parts&&D.landed>=D.parts.length){const fe=1-sstep(D.lastLand+BD.decay-2,D.lastLand+BD.decay,t);
    for(const mt of m.mats){if(!mt.transparent){mt.transparent=true;mt.needsUpdate=true;}mt.opacity=fe;}
    if(t>=D.lastLand+BD.decay){bossDeathEnd(m);return true;}}
  if(t>40){bossDeathEnd(m);return true;}   // varmistus: osa ei koskaan laskeutunut
  return false;}
// maatuminen: multakumpu (tai tuhkakasa) kasvaa osan alle, hehkuvat sienet nousevat, itiöitä leijuu; lopuksi häipyy
function bossMound(m,q){const D=m.da;if(D.mounds.length>=8||q.size<.3)return;
  if(!D.mm)D.mm={soil:new THREE.MeshStandardMaterial({color:D.ash?0x2a2725:0x3b2e22,roughness:1,transparent:true,opacity:1}),
    stem:new THREE.MeshStandardMaterial({color:0xd8cfb8,roughness:.9,transparent:true,opacity:1}),
    cap:new THREE.MeshBasicMaterial({color:bossCol(m),transparent:true,opacity:.95}),ember:new THREE.MeshBasicMaterial({color:0xff6a1a,transparent:true,opacity:.9})};
  const M=D.mm,gr=new THREE.Group(),sz=Math.min(1.3,.35+q.size*.4);
  const mound=new THREE.Mesh(new THREE.SphereGeometry(sz,12,6,0,TAU,0,Math.PI/2),M.soil);mound.scale.set(1,.01,1);gr.add(mound);
  const sh=[];
  if(!D.ash){const n=2+(Math.random()*2|0);for(let i=0;i<n;i++){const s=new THREE.Group(),h=.12+Math.random()*.22;
      const st=new THREE.Mesh(new THREE.CylinderGeometry(.022,.032,h,6),M.stem);st.position.y=h/2;s.add(st);
      const cp=new THREE.Mesh(new THREE.SphereGeometry(.06+Math.random()*.06,8,5,0,TAU,0,Math.PI/2),M.cap);cp.position.y=h;s.add(cp);
      const a=Math.random()*TAU,d=sz*(.1+Math.random()*.5);s.position.set(Math.cos(a)*d,sz*.5*Math.sqrt(Math.max(0,1-(d/sz)**2)),Math.sin(a)*d);s.scale.setScalar(.001);s.userData.t0=3.5+Math.random()*2.5;gr.add(s);sh.push(s);}}
  else for(let i=0;i<6;i++){const e=new THREE.Mesh(new THREE.SphereGeometry(.03+Math.random()*.03,5,4),M.ember);const a=Math.random()*TAU,d=Math.random()*sz*.7;e.position.set(Math.cos(a)*d,sz*.12+Math.random()*sz*.15,Math.sin(a)*d);gr.add(e);}
  gr.position.set(q.lc.x,q.gy,q.lc.z);scene.add(gr);D.mounds.push({gr,mound,sh,q,sz});}
function bossDecay(m,dt,t){const D=m.da;if(!D.mounds.length)return;
  const fe=D.landed>=D.parts.length?1-sstep(D.lastLand+BD.decay-2,D.lastLand+BD.decay,t):1;
  if(D.mm){D.mm.soil.opacity=fe;D.mm.stem.opacity=fe;D.mm.cap.opacity=.95*fe*(.75+.25*Math.sin(t*3));D.mm.ember.opacity=.9*fe*(.6+.4*Math.sin(t*9));}
  for(const M of D.mounds){const a=t-M.q.landT;M.mound.scale.y=.55*sstep(0,3,a)*(.4+.6*fe);
    for(const s of M.sh){const u=a-s.userData.t0;s.scale.setScalar(u<=0?.001:sstep(0,.45,u)*(1+.25*Math.sin(Math.min(1,u/.6)*Math.PI))*(.3+.7*fe));}
    if(fe>.2&&Math.random()<dt*(D.ash?3:1.4)){const p=M.gr.position;if(D.ash)smokePuff(p.x+(Math.random()-.5)*M.sz,p.y+.3,p.z+(Math.random()-.5)*M.sz,.6+M.sz*.4,.25);
      else burst(p.x+(Math.random()-.5)*M.sz,p.y+M.sz*.5,p.z+(Math.random()-.5)*M.sz,bossCol(m),1,.6);}}}   // itiöitä / savua
function bossDeathEnd(m){const D=m.da;if(!D||!D.boss)return;
  if(D.parts){for(const q of D.parts)scene.remove(q.o);D.parts=null;}
  if(D.beams){for(const B of D.beams){scene.remove(B.b);B.b.geometry.dispose();}D.beams=null;}if(D.bm){D.bm.dispose();D.bm=null;}
  if(D.glow){scene.remove(D.glow);D.glow.material.dispose();D.glow=null;}
  for(const L of D.lights||[])dropLightSrc(L);D.lights=[];D.lightsOff=1;
  for(const M of D.mounds){scene.remove(M.gr);M.gr.traverse(o=>{if(o.geometry)o.geometry.dispose();});}D.mounds=[];
  if(D.mm){for(const k in D.mm)D.mm[k].dispose();D.mm=null;}
  if(D.loot&&!D.lootDone){D.lootDone=1;for(const [id,c] of D.loot)beaconAdd(spawnDrop(id,c,P.pos.x,P.pos.y+1,P.pos.z),bossCol(m));}   // pomo poistui ennen repeämistä → saalis pelaajan luo
  BOSS_GLOW=0;updateLights();}
function mobDeathAnim(m,dt){const f=m.f,g=f.g,t=m.deadT;
  if((m.def.ai==='boss'||m.def.ai==='rboss')&&!m.sunKill)return bossDeathAnim(m,dt);   // v1.89: pomoilla oma kuolema-animaatio
  if(!m.da){m.da={dir:Math.random()<.5?-1:1,ash:!!m.ashDeath,pool:false,y0:m.pos.y,legs:(f.legs||[]).map(()=>(Math.random()-.5)*.8)};if(m.da.ash)m.da.flames=ashFlames(m);}
  const D=m.da,big=m.def.r>1;
  if(D.ash)return ashAnim(m,dt);
  const k=sstep(0,.6,t);g.rotation.z=D.dir*Math.PI/2*k*(f.quad||f.animal?.92:1);g.position.y=D.y0+Math.sin(k*Math.PI)*.15-(t>7?(t-7)*.35:0);
  // raajat veltoiksi
  const lk=Math.min(1,t/.8);
  if(f.armL){f.armL.rotation.x=lerp(f.armL.rotation.x,-.35,lk*.2);f.armR.rotation.x=lerp(f.armR.rotation.x,.25,lk*.2);f.armL.rotation.z=lerp(f.armL.rotation.z,.5*D.dir,lk*.2);f.armR.rotation.z=lerp(f.armR.rotation.z,.4*D.dir,lk*.2);}
  if(f.legL){f.legL.rotation.x=lerp(f.legL.rotation.x,.3,lk*.2);f.legR.rotation.x=lerp(f.legR.rotation.x,-.2,lk*.2);if(f.kneeL){f.kneeL.rotation.x=lerp(f.kneeL.rotation.x,.6,lk*.2);f.kneeR.rotation.x=lerp(f.kneeR.rotation.x,.25,lk*.2);}}
  if(f.legs)f.legs.forEach((l,i)=>{l.rotation.x=lerp(l.rotation.x,D.legs[i],lk*.2);if(l.userData.knee)l.userData.knee.rotation.x=lerp(l.userData.knee.rotation.x,.2,lk*.2);});
  if(f.head)f.head.rotation.x=lerp(f.head.rotation.x,.45,lk*.15);if(f.tail)f.tail.rotation.x=lerp(f.tail.rotation.x,.6,lk*.1);
  if(!D.pool&&t>.45){D.pool=true;const kind=bleedKind(m.type),C=BLEED_C[kind],gy=groundY(m.pos.x,m.pos.z,m.pos.y,m.dun),bk=+(SET.blood??1);
    if((kind==='blood'||kind==='sap')&&bk){D.sp=splat(m.pos.x+D.dir*m.def.r*.6,gy,m.pos.z,m.def.r*(1.3+Math.random()*.4)*Math.sqrt(bk)*(SET.bloodFx?1.25:1),C[0],DEATH_END-.4,.9);if(D.sp&&SET.bloodFx)D.sp.grow=4;poolFlow(D.sp,m.pos.x+D.dir*m.def.r*.6,m.pos.z,C[0]);}
    else burst(m.pos.x,m.pos.y+.4,m.pos.z,C[0],big?22:12,big?5:3);}
  if(t>7.4){const o=Math.max(0,1-(t-7.4)/2);for(const mt of m.mats){if(!mt.transparent){mt.transparent=true;mt.needsUpdate=true;}mt.opacity=o;}}
  return t>DEATH_END;}
function ashFlames(m){const g=new THREE.Group(),r=Math.max(.3,m.def.r*.8),h=(m.barH||m.def.r*2.8)*.4;
  for(let i=0;i<9;i++){const a=i/9*TAU,c=new THREE.Mesh(new THREE.ConeGeometry(.14*r*2,(.5+Math.random()*.4)*r*2,6),i%2?MAT.flame2:MAT.flame);c.position.set(Math.cos(a)*r*.6,h,Math.sin(a)*r*.6);g.add(c);}
  g.position.copy(m.pos);scene.add(g);return g;}
function ashAnim(m,dt){const D=m.da,f=m.f,g=f.g,t=m.deadT,r=Math.max(.35,m.def.r);
  if(t<1.6){const k=sstep(0,1.5,t);for(const mt of m.mats){mt.color.lerp(_ashC,Math.min(1,dt*2.2));mt.emissive.setRGB(.35*(1-k)*Math.random(),.08*(1-k),0);}
    g.rotation.z=D.dir*Math.PI/2*sstep(.3,1.3,t)*.9;g.scale.y=1-.25*sstep(.6,1.5,t);
    if(D.flames){D.flames.position.set(m.pos.x,m.pos.y,m.pos.z);D.flames.children.forEach((c,i)=>{c.scale.set(1,(.6+.5*Math.abs(Math.sin(playTime*10+i)))*(1-k*.4),1);});}
    if(Math.random()<dt*22)emitEmber(m.pos.x+(Math.random()-.5)*r,m.pos.y+Math.random()*r*1.6,m.pos.z+(Math.random()-.5)*r,'spark');
    if(Math.random()<dt*7)smokePuff(m.pos.x+(Math.random()-.5)*r,m.pos.y+r,m.pos.z+(Math.random()-.5)*r,1.2+r,.12);return false;}
  if(!D.pile){g.visible=false;if(D.flames){scene.remove(D.flames);D.flames=null;}const gy=groundY(m.pos.x,m.pos.z,m.pos.y,m.dun);
    const p=new THREE.Group(),am=new THREE.MeshStandardMaterial({color:0x3a3633,roughness:1,transparent:true,opacity:1}),em=new THREE.MeshBasicMaterial({color:0xff6a1a,transparent:true,opacity:.9});
    p.add(new THREE.Mesh(new THREE.ConeGeometry(r*1.1,r*.7,9),am));for(let i=0;i<5;i++){const c=new THREE.Mesh(new THREE.ConeGeometry(r*.35,r*.35,6),am);const a=Math.random()*TAU;c.position.set(Math.cos(a)*r*.7,-r*.15,Math.sin(a)*r*.7);p.add(c);}
    for(let i=0;i<6;i++){const e=new THREE.Mesh(new THREE.SphereGeometry(.04+Math.random()*.04,5,4),em);const a=Math.random()*TAU,d=Math.random()*r*.8;e.position.set(Math.cos(a)*d,-r*.2+Math.random()*r*.3,Math.sin(a)*d);p.add(e);}
    p.position.set(m.pos.x,gy+r*.3,m.pos.z);scene.add(p);D.pile=p;D.pileMat=[am,em];D.gy=gy;burst(m.pos.x,gy+.3,m.pos.z,0x3a3633,14,3);}
  const s=(t-1.6)/(DEATH_END-1.6);D.pile.position.y=D.gy+r*.3-s*r*1.1;D.pileMat[1].opacity=.9*(1-s)*(.6+.4*Math.sin(playTime*6));if(s>.7)D.pileMat[0].opacity=1-(s-.7)/.3;
  if(Math.random()<dt*2.5*(1-s))smokePuff(m.pos.x,D.gy+.3,m.pos.z,.8+r*.6,.3);
  if(t>DEATH_END){scene.remove(D.pile);for(const mt of D.pileMat)mt.dispose();return true;}return false;}
const _ashC=new THREE.Color(0x0e0c0b);

/* ---------------- PELAAJA: PALAMINEN JA KUOLEMA ---------------- */
// Palavan nuotion päällä seisova pelaaja syttyy (4 s, 4 hp/s, sade/vesi sammuttaa). Kuolema: kaatuminen ja raajojen valahtaminen,
// veriläntti jää 60 s; palokuolemassa hahmo mustuu ja muuttuu tuhkakasaksi (näkyy taas herätessä).
function updatePlayerBurn(dt){if(P.dead)return;
  if(!P.inDun&&!(P.burnT>0)){for(const p of pieces){if(!isFirePiece(p.t)||!(p.data.fuel>0))continue;if(dist2(p.x,p.z,P.pos.x,P.pos.z)<.8*.8&&Math.abs(P.pos.y-(p.y||0))<1.2){P.burnT=4;msg('Syttyit tuleen! Pois tulesta – vesi tai sade sammuttaa.','warn');sfx('build',1.4,.6);break;}}}
  if(!(P.burnT>0)){if(P.fireFx){fig.g.remove(P.fireFx);P.fireFx=null;}return;}
  if((wRain>.5&&!P.inDun)||P.inWater){P.burnT=0;burst(P.pos.x,P.pos.y+1,P.pos.z,0x9a9a9a,6,2);return;}
  P.burnT-=dt;if(!devOn('god')){P.hp-=4*dt;P.hurtFlash=Math.max(P.hurtFlash,.2);}P.lastFire=playTime;
  if(!P.fireFx){const g=new THREE.Group();for(let i=0;i<7;i++){const a=i/7*TAU,c=new THREE.Mesh(new THREE.ConeGeometry(.12,.45+Math.random()*.25,6),i%2?MAT.flame2:MAT.flame);c.position.set(Math.cos(a)*.22,.5+Math.random()*.9,Math.sin(a)*.18);g.add(c);}fig.g.add(g);P.fireFx=g;}
  P.fireFx.children.forEach((c,i)=>{c.scale.y=.7+.5*Math.abs(Math.sin(playTime*11+i*1.3));});
  if(Math.random()<dt*12)emitEmber(P.pos.x+(Math.random()-.5)*.5,P.pos.y+.4+Math.random()*1.4,P.pos.z+(Math.random()-.5)*.5,'spark');if(Math.random()<dt*3)smokePuff(P.pos.x,P.pos.y+1.6,P.pos.z,1,.2);
  if(P.hp<=0){P.ashDeath=true;playerDie();}}
let pDeath=null;
function startPlayerDeath(){const ash=!!P.ashDeath||(playTime-(P.lastFire||-99)<1.2);P.ashDeath=false;if(P.fireFx){fig.g.remove(P.fireFx);P.fireFx=null;}P.burnT=0;
  pDeath={t:0,ash,dir:Math.random()<.5?-1:1,y0:fig.g.position.y,pool:false,saved:null};}
function updatePlayerDeath(dt){const D=pDeath;if(!D)return;D.t+=dt;const t=D.t,f=fig;
  const k=sstep(0,.7,t);f.g.rotation.x=-Math.PI/2*k;f.g.rotation.z=D.dir*.25*k;f.g.position.y=D.y0+.15*k;
  const lk=Math.min(1,dt*5);f.armL.rotation.x=lerp(f.armL.rotation.x,-.6,lk);f.armR.rotation.x=lerp(f.armR.rotation.x,.2,lk);f.armL.rotation.z=lerp(f.armL.rotation.z,.6,lk);f.armR.rotation.z=lerp(f.armR.rotation.z,-.5,lk);
  f.legL.rotation.x=lerp(f.legL.rotation.x,.25,lk);f.legR.rotation.x=lerp(f.legR.rotation.x,-.1,lk);if(f.kneeL){f.kneeL.rotation.x=lerp(f.kneeL.rotation.x,.5,lk);f.kneeR.rotation.x=lerp(f.kneeR.rotation.x,.15,lk);}f.head.rotation.x=lerp(f.head.rotation.x,-.3,lk);
  if(D.ash){if(!D.saved){D.saved=[];f.g.traverse(o=>{if(o.isMesh){D.saved.push([o,o.material]);o.material=_pAshMat;}});}
    _pAshMat.emissive.setRGB(.3*Math.max(0,1-t/1.5)*Math.random(),.06*Math.max(0,1-t/1.5),0);
    if(t<1.5&&Math.random()<dt*20)emitEmber(P.pos.x+(Math.random()-.5)*.8,P.pos.y+Math.random()*.6,P.pos.z+(Math.random()-.5)*.8,'spark');
    if(t<2.5&&Math.random()<dt*6)smokePuff(P.pos.x,P.pos.y+.6,P.pos.z,1.4,.15);
    if(t>1.5&&!D.pile){f.g.visible=false;const gy=groundY(P.pos.x,P.pos.z,P.pos.y,P.inDun);const am=new THREE.MeshStandardMaterial({color:0x3a3633,roughness:1});const p=new THREE.Mesh(new THREE.ConeGeometry(.55,.4,9),am);p.position.set(P.pos.x,gy+.15,P.pos.z);scene.add(p);D.pile=p;D.gy=gy;burst(P.pos.x,gy+.3,P.pos.z,0x3a3633,14,3);}
    if(D.pile){const s=Math.min(1,(t-1.5)/8);D.pile.position.y=D.gy+.15-s*.55;}}
  else if(!D.pool&&t>.5){D.pool=true;const bk=+(SET.blood??1);if(bk){const sp=splat(P.pos.x,groundY(P.pos.x,P.pos.z,P.pos.y,P.inDun),P.pos.z,.95*Math.sqrt(bk)*(SET.bloodFx?1.3:1),BLEED_C.blood[0],60,.9);if(sp&&SET.bloodFx)sp.grow=5;poolFlow(sp,P.pos.x,P.pos.z,BLEED_C.blood[0]);}}}
const _pAshMat=new THREE.MeshStandardMaterial({color:0x111010,roughness:1,emissive:0x000000});
function endPlayerDeath(){const D=pDeath;pDeath=null;if(!D)return;if(D.saved)for(const [o,mt] of D.saved)o.material=mt;if(D.pile){scene.remove(D.pile);}fig.g.visible=true;fig.g.rotation.z=0;}
// Viiltävä isku (SET.bloodFx): pitkä punainen viilto mobin pintaan, ja mobista tippuu pisaroita 5 s.
function addSlash(m){if(!SET.bloodFx||!(+(SET.blood??1))||(m.slashes|0)>=5)return;const kind=bleedKind(m.type);if(kind!=='blood'&&kind!=='sap')return;
  const last=addWound(m,true);m.slashes=(m.slashes|0)+1;if(last){const ax=last.userData.ax,e=(ax+1)%3,o2=(ax+2)%3;last.scale.setComponent(e,last.scale.getComponent(e)*3.2);last.scale.setComponent(o2,last.scale.getComponent(o2)*.45);last.rotation[['x','y','z'][ax]]=(Math.random()-.5)*1.2;}
  m.bleedT=5;}
function updateBleeders(dt){if(!SET.bloodFx)return;for(const m of mobs){if(!(m.bleedT>0)||m.dead)continue;m.bleedT-=dt;if(Math.random()<dt*5&&drips.length<120){const C=BLEED_C[bleedKind(m.type)]||BLEED_C.blood,h=(m.barH||m.def.r*2)*.5;
  const d=new THREE.Mesh(_drGeo,dripMat(C[0]));d.position.set(m.pos.x+(Math.random()-.5)*m.def.r,m.pos.y+h,m.pos.z+(Math.random()-.5)*m.def.r);scene.add(d);drips.push({m:d,c:C[0],dun:m.dun,vx:0,vz:0,vy:-.5});}}}
function updateEffects(dt){updateSplats(dt);if(drips.length)updateDrips(dt);updateBleeders(dt);updatePuffs(dt);updatePlayerDeath(dt);}
