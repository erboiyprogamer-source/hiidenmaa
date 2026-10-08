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
/* v1.89 POMON HERÄTYS (5 s): pomo nousee maasta pää alhaalla ja kädet sivuilla (nukkuu yhä), haavoittumaton (m.sinking=1).
   Terveyspalkki näkyy heti animaation alkaessa (tila ei ole enää 'sleep'). Suuttumisääni soi vasta kun pomo on pystyssä
   ja on huomannut pelaajan (bossWakeRoar). Palauttaa true niin kauan kuin nousu on kesken. */
const BOSS_RISE=5;
function bossRisePose(m,dt,gy,H){const f=m.f,k=Math.min(1,m.t/BOSS_RISE),w=sstep(.8,1,k);   // w = viimeinen viidennes: pää nousee ja hahmo suoristuu
  m.pos.y=gy-(1-k)*(1-k)*H;
  if(f.head)f.head.rotation.x=.85*(1-w);
  if(f.armL){f.armL.rotation.set(0,0,.14*(1-w));f.armR.rotation.set(0,0,-.14*(1-w));}
  if(f.elbowL){f.elbowL.rotation.x=-.15*(1-w);f.elbowR.rotation.x=-.15*(1-w);}
  if(f.legL){f.legL.rotation.x=0;f.legR.rotation.x=0;if(f.kneeL){f.kneeL.rotation.x=0;f.kneeR.rotation.x=0;}}
  f.g.position.copy(m.pos);f.g.rotation.y=m.yaw;
  const r=Math.max(.6,m.def.r);
  if(Math.random()<dt*30)burst(m.pos.x+(Math.random()-.5)*r*3,gy+.2,m.pos.z+(Math.random()-.5)*r*3,Math.random()<.5?0x5d5a54:0x6a5a44,4,5);
  if(Math.random()<dt*5)shake(.15);
  return k<1;}
// pomo on pystyssä ja huomannut pelaajan: oma suuttumisääni (tai tehty karjaisu). Estää creTickiä soittamasta samaa uudestaan.
function bossWakeRoar(m){if(!creSnd(m,'aggro'))sfx('roar');m.angerDone=1;m.angerTry=99;m.inChase=1;m.chT=1.5+Math.random()*2;shake(.5);}

/* v1.89 POMON KUOLEMA (9,4 s, kaikki pomot – tavallinen lössähdys on muilla olennoilla):
   0–3 s      irtoaa maasta ja kohoaa hitaasti, raajat retkahtavat
   3–4,9 s    kalpenee valkoiseksi (väri ja hehku) ja valo kirkastuu
   4,9–6,2 s  sokaiseva valo valaisee huoneen (lightSources + hehkupallo)
   5,3 s      kuolinääni kaiulla + jälkikaiku 0,45 s myöhemmin; ruumis hajoaa osiin ilmassa
   5,3–6,8 s  osat sinkoavat ja putoavat painovoimalla (tulikuolemassa tuhkan väriset, kipinöitä)
   6,2–6,55 s valo ja vaaleus katoavat nopeasti, ennen kuin osat osuvat maahan
   7,4–9,4 s  osat maatuvat maassa (läpinäkyvyys häivyttää, kuten muillakin ruumiilla) */
const BD={up:3,pale:4.9,brk:5.3,dim:6.2},_whC=new THREE.Color(0xffffff);
function bossDeathAnim(m,dt){const f=m.f,g=f.g,t=m.deadT,r=Math.max(.8,m.def.r);
  if(!m.da){m.da={y0:g.position.y,ash:!!m.ashDeath,parts:null,col:m.mats.map(mt=>mt.color.clone()),emi:m.mats.map(mt=>mt.emissive.clone()),
      light:{x:m.pos.x,y:m.pos.y+r*2,z:m.pos.z,c:0xfff0cf,i:.05,on:()=>true,move:true,dun:!!m.dun}};
    lightSources.push(m.da.light);updateLights();
    const gl=new THREE.Mesh(new THREE.SphereGeometry(r*1.6,12,10),new THREE.MeshBasicMaterial({color:0xfff6e0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
    gl.position.set(m.pos.x,m.pos.y+r*1.6,m.pos.z);scene.add(gl);m.da.glow=gl;}
  const D=m.da;
  // kohoaa irti maasta ja retkahtaa veltoksi
  if(t<BD.brk){const k=sstep(0,BD.up,t),lk=Math.min(1,dt*2.2);g.position.set(m.pos.x,D.y0+k*(1.2+r*.6),m.pos.z);g.rotation.y+=dt*.3;
    if(f.head)f.head.rotation.x=lerp(f.head.rotation.x,.5,lk);
    if(f.armL){f.armL.rotation.x=lerp(f.armL.rotation.x,.2,lk);f.armR.rotation.x=lerp(f.armR.rotation.x,.2,lk);f.armL.rotation.z=lerp(f.armL.rotation.z,.65,lk);f.armR.rotation.z=lerp(f.armR.rotation.z,-.65,lk);}
    if(f.legL){f.legL.rotation.x=lerp(f.legL.rotation.x,.25,lk);f.legR.rotation.x=lerp(f.legR.rotation.x,-.2,lk);if(f.kneeL){f.kneeL.rotation.x=lerp(f.kneeL.rotation.x,.3,lk);f.kneeR.rotation.x=lerp(f.kneeR.rotation.x,.2,lk);}}
    if(Math.random()<dt*7)burst(m.pos.x+(Math.random()-.5)*r*2,D.y0+.2,m.pos.z+(Math.random()-.5)*r*2,0x6a5a44,3,3);}
  // vaaleus ja valo: nousee kalpenemisesta, katoaa nopeasti kohdassa BD.dim (ennen kuin osat osuvat maahan)
  const pk=sstep(BD.up,BD.pale,t),fk=t<BD.dim?pk:Math.max(0,1-(t-BD.dim)/.35),ac=D.ash?clamp((t-BD.dim)/1.2,0,1):0;
  for(let i=0;i<m.mats.length;i++){const mt=m.mats[i];mt.color.copy(D.col[i]).lerp(_ashC,ac).lerp(_whC,fk);mt.emissive.copy(D.emi[i]).lerp(_whC,fk*.9);}
  const cy=(D.parts?D.cy:g.position.y)+r*1.4;
  D.light.i=.05+26*fk*fk;D.light.x=m.pos.x;D.light.y=cy;D.light.z=m.pos.z;
  if(D.glow){D.glow.material.opacity=.85*fk*fk;D.glow.scale.setScalar(1+2.2*fk);D.glow.position.set(m.pos.x,cy,m.pos.z);}
  // hajoaminen osiin ilmassa: raajat irtoavat omiksi kappaleikseen ja putoavat painovoimalla
  if(!D.parts&&t>=BD.brk){D.cy=g.position.y;g.updateMatrixWorld(true);
    if(!creSnd(m,'death',{rev:1.8}))sfx('die',.7,1);
    D.parts=g.children.slice().map(o=>{const c=new V3();o.getWorldPosition(c);scene.attach(o);
      const dx=c.x-m.pos.x,dz=c.z-m.pos.z,l=Math.hypot(dx,dz)||1;
      return {o,v:new V3(dx/l*(1.2+Math.random()*2.4),2.2+Math.random()*3.4,dz/l*(1.2+Math.random()*2.4)),
        w:new V3((Math.random()-.5)*7,(Math.random()-.5)*7,(Math.random()-.5)*7),rest:0};});
    burst(m.pos.x,D.cy+r,m.pos.z,0xffffff,26,9);shake(.5);}
  if(t>=BD.brk+.45&&!D.ech){D.ech=1;creSnd(m,'death',{rev:2.4,v:.4,p:.92,pri:1.4,add:1,key:'kaiku'});}   // jälkikaiku
  if(D.parts){for(const q of D.parts){if(q.rest)continue;
      q.v.y-=15*dt;q.o.position.addScaledVector(q.v,dt);q.o.rotation.x+=q.w.x*dt;q.o.rotation.y+=q.w.y*dt;q.o.rotation.z+=q.w.z*dt;
      const gy=groundY(q.o.position.x,q.o.position.z,q.o.position.y,m.dun);
      if(q.o.position.y<=gy+.12){q.o.position.y=gy+.12;q.rest=1;burst(q.o.position.x,gy+.15,q.o.position.z,D.ash?0x3a3633:0x6a5a44,5,2);}}
    if(D.ash&&Math.random()<dt*14){const q=D.parts[Math.random()*D.parts.length|0];emitEmber(q.o.position.x,q.o.position.y+.2,q.o.position.z,'spark');}}
  if(t>7.4){const o=Math.max(0,1-(t-7.4)/2);for(const mt of m.mats){if(!mt.transparent){mt.transparent=true;mt.needsUpdate=true;}mt.opacity=o;}}
  if(t>DEATH_END){bossDeathEnd(m);return true;}
  return false;}
function bossDeathEnd(m){const D=m.da;if(!D)return;
  if(D.parts){for(const q of D.parts)scene.remove(q.o);D.parts=null;}
  if(D.glow){scene.remove(D.glow);D.glow.material.dispose();D.glow=null;}
  if(D.light){const i=lightSources.indexOf(D.light);if(i>=0)lightSources.splice(i,1);D.light=null;updateLights();}}
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
