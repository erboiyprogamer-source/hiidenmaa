/* Hiidenmaa – state.js
   Pelin tila (P, inv, flags), pelaajahahmo, reppu, maahan pudonneet esineet, partikkelit, ammukset */
'use strict';

/* ---------------- GAME STATE ---------------- */
const P={pos:new V3(LOC.spawn.x,terrainH(LOC.spawn.x,LOC.spawn.z),LOC.spawn.z),vy:0,yaw:Math.PI,onGround:true,hp:60,stam:100,hunger:80,stamDelay:0,atk:null,blocking:false,bowDraw:0,drawing:false,heal:0,buffs:{},wetT:0,restT:0,inWater:false,dead:false,invul:0,stagger:0,walkPh:0,spawn:null,deaths:0,kills:0,hurtFlash:0,inDun:false,crouch:false,crouchK:0,packLv:0,fx:{speed:1,dmg:1,stamRegen:1,hpRegen:1},crampT:0};
let inv=new Array(32).fill(null);
// Käsisoihtu: palaa yhteensä 60 s (juostessa 20 % nopeammin), sammuu sateessa, syttyy toisen liekin vieressä. Tila tallentuu esineeseen (fuel, lit).
const TORCH_T=120; // käsisoihdun paloaika (s) tasolla ★1; pihka lisää 60 s
// Soihdun täysi paloaika ★-tason mukaan: +50 % per taso (★1 120 s, ★2 180 s, ★3 240 s).
const torchMax=s=>TORCH_T*(1+.5*(((s&&s.q)||1)-1));
function torchSlot(){const s=equipped('offhand');return s&&s.id==='soihtu'?s:null;}
function torchLit(){const s=torchSlot();return !!s&&s.lit!==false&&(s.fuel??torchMax(s))>0;}
let zoneQuiet=true; // v0.82: true = seuraava alue merkitään löydetyksi ilman ilmoitusta (uusi peli / lataus)
let playTime=0, dayT=.3, dayN=1, weather={cur:'selkea',until:200}, flags={disc:{},runes:{},ruins:{},sarc:[0,0,0],boss:0,goal:0,won:0,seen:{},xp:0,cnt:{},ach:{},first:{},gv:2,bio:{meadow:1}}, graves=[], drops=[];
let camYaw=Math.PI, camPitch=.35, camDist=6;
const EXN=Math.ceil(HALF/2); // tutkimusruudukko 4 m ruuduin
const explored=new Uint8Array(EXN*EXN);
let state='menu';

const fig=makePlayer();
scene.add(fig.g);let heldMesh=null,heldId=null,offMesh=null,offId=null,armorId=null;
// Repussa olevat mutta käyttämättömät aseet, kilvet ja työkalut näkyvät pelaajan selässä (kilpi keskellä, jousi vinossa, työkalut varret ylöspäin).
const backG=new THREE.Group();fig.rig.add(backG);let backKey='',backHang=null;
const ARMOR_BACK={nahkavaatteet:{ch:.045,bt:.02},karhuhaarniska:{ch:.15,bt:.1},kuparipanssari:{ch:.055,bt:.025},rautapanssari:{ch:.05,bt:.025},hiidenpanssari:{ch:.065,bt:.025}};
function hasArrows(){return typeof AMMO!=='undefined'&&AMMO.some(id=>invCount(id)>0);}
function updateBack(){const items=inv.filter(s=>s&&(!s.eq||(ITEMS[s.id].cat==='shield'&&s.shBrk!=null))&&['weapon','bow','shield','shovel','hammer'].includes(ITEMS[s.id].cat));   // v1.39: rikki oleva kilpi selässä
  const sh=items.find(s=>ITEMS[s.id].cat==='shield'),hm=items.find(s=>s.id==='vasara'),bo=items.find(s=>ITEMS[s.id].cat==='bow'),one=items.find(s=>ITEMS[s.id].cat!=='shield'&&s.id!=='vasara'&&ITEMS[s.id].cat!=='bow'),tl=one?[one]:[];
  // v0.90: haarniska paksuntaa selkää → selkätavarat ja kilpi siirretään haarniskan pinnalle (mitattu selän ulkonema + 2 cm),
  // ilman haarniskaa ne palaavat entiselle paikalleen. ch = rinnan korkeus (kilpi, jousi, työkalut), bt = vyö (vasara).
  const ar=equipped('armor'),AB=ARMOR_BACK[ar?ar.id:'']||{ch:0,bt:0};
  const key=[sh,bo,hm,...tl].map(s=>s?s.id:'-').join()+'|'+(ar?ar.id:'')+'|'+(bo&&hasArrows()?'a':'');if(key===backKey)return;backKey=key;while(backG.children.length)backG.remove(backG.children[0]);backHang=null;
  // Vasara roikkuu vyöllä takana (v0.72): pää vyön päällä selän suuntaisesti (pää 90° pystyakselin ympäri aiemmasta), varsi alas.
  // Ripustuspiste = vyön yläreuna selän puolella (y 0,94, z −0,24); heiluu kävellessä (player.js, backHang).
  if(hm){const m=makeHeld(hm.id),o=new THREE.Group();m.rotation.x=-Math.PI/2;m.position.set(0,-.47,0);o.add(m);o.position.set(.13,.94,-.24-AB.bt);o.rotation.y=.18;backG.add(o);backHang=o;}
  if(sh){const m=makeShield(sh.id);const o=new THREE.Group();m.rotation.y=Math.PI/2;m.position.set(0,0,0);o.add(m);o.position.set(0,1.2,-.1-AB.ch);o.scale.setScalar(.85);backG.add(o);}
  const z0=(sh?-.29:-.19)-AB.ch;
  // v1.37 (lista 3, kohta 37): selkäesineet viistoon, pitkä osa sivulle (hakun piikit, kirveen terä) eikä selkää vasten:
  //  kirves/nuija/hakku: varsi vasemmalta lantiolta oikean olan taakse, pää/terä ylhäällä; miekka ja lapio/kuokka: kahva oikean olan
  //  takana, terä alaspäin vasemmalle lantiolle; jousi vasemmalta olalta oikealle lantiolle ja keihäs ristiin (kärki ylös).
  //  BACK_POSE: p = kahvan pään paikka, d = varren suunta (kahvasta päähän), y = esineen paikallinen +y (terä/piikit selän tasossa).
  // v1.56: jousi litteänä selkää vasten (kaari sivulle, ei kehoon eikä ulos); jos repussa on nuolia, 3 nuolta jousen keskellä sen
  //  suuntaisesti, kärjet alaviistoon (ryhmän kallistus −0,55 rad)
  if(bo){const m=makeHeld(bo.id),o=new THREE.Group();m.rotation.y=Math.PI/2;o.add(m);
    if(hasArrows()){for(let i=0;i<3;i++){const a=new THREE.Group(),sh=mat(0xc9b48a);a.add(bx(.02,.72,.02,sh,0,0,0,false));a.add(bx(.045,.09,.045,mat(0x4d535c),0,-.4,0,false));
      for(const sx of[-1,1])a.add(bx(.004,.12,.05,mat(0xe8e2d2),sx*.012,.3,0,false));a.position.set((i-1)*.035,-.02+i*.02,.03);a.rotation.z=(i-1)*.04;o.add(a);}}
    o.position.set(.02,1.15,z0+.01);o.rotation.set(0,0,-.55);o.scale.setScalar(.95);backG.add(o);}
  tl.forEach(s=>{const m=makeHeld(s.id),o=new THREE.Group(),P0=backPose(s.id);o.add(m);
    _bkD.fromArray(P0.d).normalize();_bkY.fromArray(P0.y);_bkY.addScaledVector(_bkD,-_bkY.dot(_bkD)).normalize();_bkX.crossVectors(_bkY,_bkD).normalize();_bkM.makeBasis(_bkX,_bkY,_bkD);
    o.quaternion.setFromRotationMatrix(_bkM);o.position.set(P0.p[0],P0.p[1],z0+(P0.dz||0));o.scale.setScalar(.85);backG.add(o);});}
const _bkD=new V3(),_bkY=new V3(),_bkX=new V3(),_bkM=new THREE.Matrix4();
function backPose(id){const d=ITEMS[id];
  if(d.chop||id==='nuija')return{p:[.2,.82],d:[-.55,.85,0],y:[.85,.55,0]};          // terä −y → alas oikealle (sivulle)
  if(d.pick)return{p:[.2,.82],d:[-.55,.85,0],y:[.85,.55,0]};                         // piikit ±y selän tasossa
  if(id==='keihas')return{p:[-.2,.86],d:[.5,.86,0],y:[-.86,.5,0],dz:-.03};
  if(/miekka/.test(id))return{p:[-.2,1.42],d:[.45,-.9,0],y:[0,0,1]};   // v1.39 (lista 4, kohta 5): lappeellaan selkää vasten               // terä litteänä selkää vasten, alaspäin
  if(d.cat==='shovel')return{p:[-.22,1.48],d:[.42,-.9,0],y:[0,0,1]};
  return{p:[.15,.85],d:[-.4,.9,0],y:[.9,.4,0]};}
function updateGear(){updateBack();
  {const w0=equipped('weapon');if(!w0||w0.id!=='vasara')setBuildSel(null);}
  const w=equipped('weapon'),wid=w?w.id:null;
  if(wid!==heldId){if(heldMesh)heldMesh.parent.remove(heldMesh);heldMesh=null;heldId=wid;if(wid){heldMesh=makeHeld(wid);(ITEMS[wid].cat==='bow'?fig.handL:fig.hand).add(heldMesh);}}
  const o=equipped('offhand'),oid=o&&!(ITEMS[o.id].cat==='shield'&&o.shBrk!=null)?o.id:null;   // v1.39 (kohta 18): rikki oleva kilpi ei ole kädessä
  if(oid!==offId){if(offMesh)fig.handL.remove(offMesh);offMesh=null;offId=oid;if(oid){offMesh=ITEMS[oid].cat==='shield'?makeShield(oid):makeHeld(oid);fig.handL.add(offMesh);}}
  const a=equipped('armor'),aid=a?a.id:null;
  if(aid!==armorId){armorId=aid;const c=aid==='rautapanssari'?0x6c747c:aid==='kuparipanssari'?0x8a5228:aid==='nahkavaatteet'||aid==='karhuhaarniska'?0x6a4a30:aid==='hiidenpanssari'?0x2a3036:0x8a6a46;const cm=smat(c);for(const m of fig.cloth)m.material=cm;buildArmor(fig,aid);}
}

/* ---------------- INVENTORY ---------------- */
function invCount(id){let n=0;for(const s of inv)if(s&&s.id===id)n+=s.n;return n;}
function invAdd(id,n,q=1){const d=ITEMS[id];if(!d)return n;
  if(d.s>1)for(const s of inv){if(n<=0)break;if(s&&s.id===id&&s.n<d.s){const k=Math.min(n,d.s-s.n);s.n+=k;n-=k;}}
  for(let i=0;i<inv.length&&n>0;i++){if(!inv[i]){const k=Math.min(n,d.s);inv[i]={id,n:k,q};n-=k;}}
  if(!flags.seen[id])flags.seen[id]=1;
  invDirty=true;return n;}
function invRemove(id,n){for(let i=inv.length-1;i>=0&&n>0;i--){const s=inv[i];if(s&&s.id===id){const k=Math.min(n,s.n);s.n-=k;n-=k;if(s.n<=0)inv[i]=null;}}invDirty=true;}
// Mahtuvatko kaikki esineet reppuun (yhdistäminen pinoihin + vapaat paikat)? Ei muuta reppua.
function fitsAll(list){const sim=inv.map(s=>s?{id:s.id,n:s.n}:null);
  for(const it of list){if(!it)continue;let n=it.n;const d=ITEMS[it.id];if(d.s>1)for(const s of sim){if(n<=0)break;if(s&&s.id===it.id&&s.n<d.s){const k=Math.min(n,d.s-s.n);s.n+=k;n-=k;}}
    for(let i=0;i<sim.length&&n>0;i++)if(!sim[i]){const k=Math.min(n,d.s);sim[i]={id:it.id,n:k};n-=k;}if(n>0)return false;}return true;}
function invWeight(){let w=0;for(const s of inv)if(s)w+=ITEMS[s.id].w*s.n;return w;}
let MAXW=160;
const PACK_UP=[null,{nahka:6,puu:4},{nahka:12,kupari:4}];
const invN=()=>32+8*P.packLv;
// Repun päivitys: lisää paikkoja (+8) ja kantokykyä (+40 painoa) tasoa kohti.
function setPack(lv){P.packLv=lv;recalcMaxW();while(inv.length<invN())inv.push(null);invDirty=true;}
function equipGroup(cat){return ['weapon','bow','hammer','shovel'].includes(cat)?'weapon':['shield','offhand'].includes(cat)?'offhand':cat;}
function equipped(cat){const grouped=cat==='weapon'||cat==='offhand';
  for(const s of inv){if(!s||!s.eq)continue;const c=ITEMS[s.id].cat;if(grouped?equipGroup(c)===cat:c===cat)return s;}
  return null;}
function toggleEquip(s){const cat=ITEMS[s.id].cat;if(!cat)return;
  if(s.eq){s.eq=false;}else{const g=equipGroup(cat);for(const o of inv)if(o&&o.eq&&equipGroup(ITEMS[o.id].cat)===g)o.eq=false;s.eq=true;}
  if(cat==='bow'&&s.eq){for(const o of inv)if(o&&o.eq&&equipGroup(ITEMS[o.id].cat)==='offhand')o.eq=false;}
  if(equipGroup(cat)==='offhand'&&s.eq){const w=equipped('weapon');if(w&&ITEMS[w.id].cat==='bow')w.eq=false;}
  invDirty=true;updateGear();if(cat!=='hammer'||!s.eq)setBuildSel(null);sfx('pickup');}
// v1.32 (lista 3, kohdat 3 ja 29): pikapaikan numero syö ruoan (ainoa tapa syödä), ottaa nuolet käyttöön (pysyvät valittuina) tai varustaa.
function useSlot(i){const s=inv[i];if(!s)return;const d=ITEMS[s.id];if(d.food)eat(s);else if(AMMO.includes(s.id)){if(flags.ammo!==s.id){flags.ammo=s.id;msg(`Ammus: ${d.n}`);sfx('pickup',1.2,.4);}invDirty=true;}else if(d.cat)toggleEquip(s);}
function giveOrDrop(id,n,x,y,z,q=1){const left=invAdd(id,n,q);if(left>0){spawnDrop(id,left,x,y,z,q);msg('Reppu on täynnä.','warn');}if(n-left>0){msg(`+${n-left} ${ITEMS[id].n}`,'loot');}}
let invDirty=true;

/* ---------------- DROPS ---------------- */
const dropGeo=new THREE.BoxGeometry(.32,.32,.32);
// v1.34 (lista 3, kohdat 9, 25, 39): maassa oleva esine. Arvoesine (isValuable) ei koskaan katoa, hehkuu (valo + kipinät) ja siirtyy
// satunnaiseen maailman arkkuun, jos se on ollut maassa 2 min pelaajan ollessa yli 10 m päässä tai toisessa tilassa, tai putoaa kartalta.
// Grafiikka: SET.drop3d → kuvake syvyydellä (kerrostetut tasot), muuten entinen värikuutio.
const VALUABLE=['jaaavain','luuavain','aarniavain','sydan','kruunusirpale','hiidenkivi'];
const isValuable=id=>VALUABLE.includes(id)||!!(ITEMS[id]&&ITEMS[id].rare);
const VAL_LOST=120,VAL_FAR=10;
const _icoMat={},_icoGeo=new THREE.PlaneGeometry(.5,.5);
function dropMesh(id){if(!(typeof SET!=='undefined'&&SET.drop3d!==false)||typeof THREE.CanvasTexture!=='function'){const me=new THREE.Mesh(dropGeo,mat(new THREE.Color(ITEMS[id].c).getHex()));me.castShadow=true;return me;}
  icon(id);let M=_icoMat[id];if(!M){const tx=new THREE.CanvasTexture(ICONC[id]);tx.anisotropy=2;
    M=_icoMat[id]=[new THREE.MeshStandardMaterial({map:tx,alphaTest:.45,side:THREE.DoubleSide,roughness:.7}),new THREE.MeshStandardMaterial({map:tx,alphaTest:.45,side:THREE.DoubleSide,color:0x5a5248,roughness:.9})];}
  const g=new THREE.Group();for(let k=-3;k<=3;k++){const pl=new THREE.Mesh(_icoGeo,Math.abs(k)===3?M[0]:M[1]);pl.position.z=k*.011;g.add(pl);}
  g.userData.ico=1;return g;}
function spawnDrop(id,n,x,y,z,q=1,silent,byPlayer){const me=dropMesh(id);me.position.set(x,y,z);scene.add(me);
  const d={id,n,q,mesh:me,vx:(Math.random()-.5)*3,vy:3+Math.random()*2,vz:(Math.random()-.5)*3,t:0,rest:false,dim:curDim(),noPick:!!byPlayer};drops.push(d);
  if(isValuable(id))valGlow(d);return d;}
function valGlow(d){const c=new THREE.Color(ITEMS[d.id].c||'#ffd36a');
  const h=new THREE.Mesh(new THREE.SphereGeometry(.42,12,8),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false}));d.mesh.add(h);d.halo=h;
  d.light={x:d.mesh.position.x,y:d.mesh.position.y+.4,z:d.mesh.position.z,c:c.getHex(),i:.9,move:true,dun:d.dim!=='world',on:()=>drops.includes(d)&&(d.dim||'world')===curDim()};lightSources.push(d.light);}
// v1.39 (lista 4, kohta 6): esine lepää korkeimman maakohdan päällä (keskusta + 4 pistettä 0,28 m säteellä), jottei uppoa rinteeseen
function dropGround(x,z,y){let g=-1e9;for(const [ox,oz] of [[0,0],[.28,0],[-.28,0],[0,.28],[0,-.28]])g=Math.max(g,groundAt(x+ox,z+oz,.2,y+.5));return g;}
function removeDrop(d){scene.remove(d.mesh);const i=drops.indexOf(d);if(i>=0)drops.splice(i,1);if(d.light){const j=lightSources.indexOf(d.light);if(j>=0)lightSources.splice(j,1);d.light=null;}}
// v1.32 (lista 3, kohta 26): pelaajan pudottama esine lentää aina kameran suuntaan eteenpäin, noin kaksi kertaa entistä kauemmas (~2,5–3 m).
function playerDrop(id,n,q){const fx=-Math.sin(camYaw),fz=-Math.cos(camYaw);spawnDrop(id,n,P.pos.x+fx*.6,P.pos.y+1.1,P.pos.z+fz*.6,q,false,true);
  const d=drops[drops.length-1],j=(Math.random()-.5)*.6;d.vx=fx*4.2-fz*j;d.vz=fz*4.2+fx*j;d.vy=3.4+Math.random()*.6;}
// v1.17: ulottuvuus, jossa pelaaja on ('world', 'barrow' = Hautakumpu tai ulottuvuuden id). Maassa olevan esineen katoamisajastin käy vain samassa ulottuvuudessa.
function curDim(){return P.inDun?(P.realm||'barrow'):'world';}
let dropFullT=0;
const DROP_LIFE=300; // maassa olevat esineet katoavat 5 min jälkeen
function updateDrops(dt){
  const dim=curDim();dropFullT-=dt;
  for(let i=drops.length-1;i>=0;i--){const d=drops[i],m=d.mesh,val=isValuable(d.id);
    if(val){const away=(d.dim||'world')!==dim||P.dead||Math.hypot(m.position.x-P.pos.x,m.position.z-P.pos.z)>VAL_FAR;d.lost=away?(d.lost||0)+dt:0;
      if(d.lost>VAL_LOST||m.position.y<-20){removeDrop(d);relocateValuable(d.id,d.n,d.q);continue;}}
    if((d.dim||'world')!==dim)continue;d.t+=dt;
    if(!val){if(d.t>DROP_LIFE){removeDrop(d);continue;}m.visible=d.t<DROP_LIFE-15||((d.t*5)|0)%2===0;}
    if(!d.rest){d.vy-=18*dt;m.position.x+=d.vx*dt;m.position.y+=d.vy*dt;m.position.z+=d.vz*dt;const g=dropGround(m.position.x,m.position.z,m.position.y)+(m.userData.ico?.38:.25);if(m.position.y<g){m.position.y=g;d.rest=true;d.baseY=g;}}
    else{m.position.y=d.baseY+.12+Math.sin(d.t*3)*.06;m.rotation.y+=dt*1.5;}
    if(d.light){d.light.x=m.position.x;d.light.y=m.position.y+.4;d.light.z=m.position.z;d.light.i=.75+Math.sin(d.t*3.2)*.25;}
    if(d.halo){d.halo.material.opacity=.2+Math.sin(d.t*3.2)*.1;if(Math.random()<dt*5&&typeof emitEmber==='function')emitEmber(m.position.x+(Math.random()-.5)*.5,m.position.y+.1,m.position.z+(Math.random()-.5)*.5,'spark');}
    if(d.noPick&&m.position.distanceToSquared(_tmpV.set(P.pos.x,P.pos.y+.6,P.pos.z))>2.5*2.5)d.noPick=false;   // v1.31: itse pudotettu poimitaan vasta, kun on käyty kauempana
    if(d.t>.5&&!d.noPick&&!P.dead&&m.position.distanceToSquared(_tmpV.set(P.pos.x,P.pos.y+.6,P.pos.z))<2.2){const left=invAdd(d.id,d.n,d.q);if(left<d.n){msg(`+${d.n-left} ${ITEMS[d.id].n}`,'loot');sfx('pickup');}else if(dropFullT<=0){dropFullT=4;msg('Reppu on täynnä – et voi poimia.','warn');}d.n=left;if(left<=0){removeDrop(d);continue;}}
    if(m.position.y<-20)removeDrop(d);
  }
}
const _tmpV=new V3(),_tmpV2=new V3();

/* ---------------- PARTICLES & FX ---------------- */
const parts=[];const pGeo=new THREE.BoxGeometry(.12,.12,.12);
function burst(x,y,z,color,n=8,sp=3){n=Math.round(n*PF);for(let i=0;i<n;i++){if(parts.length>90){const o=parts.shift();scene.remove(o.m);}const m=new THREE.Mesh(pGeo,mat(color));m.position.set(x,y,z);scene.add(m);parts.push({m,vx:(Math.random()-.5)*sp,vy:Math.random()*sp,vz:(Math.random()-.5)*sp,t:.6+Math.random()*.4});}}
// Kipinät ja savu: kevyet, nousevat hiukkaset tulille ja soihduille (ei painovoimaa). kind: 'spark' | 'smoke'.
const embers=[],emPool=[],emGeo=new THREE.SphereGeometry(1,5,4);
function emitEmber(x,y,z,kind){if(embers.length>70*PF||Math.random()>PF)return;const sp=kind==='spark',c=sp?(Math.random()<.5?0xffb43a:0xff7a1a):0x6a6560;
  let mt=emPool.pop();if(!mt)mt=new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,fog:false});mt.color.setHex(c);mt.opacity=sp?1:.35;const m=new THREE.Mesh(emGeo,mt);m.position.set(x,y,z);m.scale.setScalar(.001);scene.add(m);
  embers.push({m,sp,t:0,life:sp?.5+Math.random()*.8:1.1+Math.random()*.9,vx:(Math.random()-.5)*(sp?.8:.3),vy:sp?.9+Math.random()*1.3:.5+Math.random()*.4,vz:(Math.random()-.5)*(sp?.8:.3),r:sp?.018+Math.random()*.014:.07});}
function updateEmbers(dt){for(let i=embers.length-1;i>=0;i--){const e=embers[i];e.t+=dt;const k=e.t/e.life;if(k>=1){scene.remove(e.m);emPool.push(e.m.material);embers.splice(i,1);continue;}
  const wk=(e.sp?.18:.32)*WIND.spd*Math.min(1,e.t*1.5); // v0.84: savu ja kipinät ajautuvat tuulen mukana (savu enemmän)
  e.m.position.x+=(e.vx+Math.sin(e.t*7+i)*.25+WIND.x*wk)*dt;e.m.position.y+=e.vy*dt;e.m.position.z+=(e.vz+WIND.z*wk)*dt;
  e.m.scale.setScalar(e.sp?e.r*(1-k*.6):e.r*(1+k*2.6));e.m.material.opacity=e.sp?1-k:.35*(1-k);}}
// Satunnaistettu välke: arvo hakeutuu satunnaisesti vaihtuvaan tavoitteeseen, joskus pieni "vajaus". Palauttaa kertoimen ~.82–1.04 (vain vähän eloa).
function flick(u,dt){u.t-=dt;if(u.t<=0){u.t=.04+Math.random()*.16;u.target=.82+Math.random()*.28;if(Math.random()<.04)u.target=.55+Math.random()*.15;}u.cur+=(u.target-u.cur)*Math.min(1,dt*14);return 1+(u.cur-1)*.4;}
const fx=[];
function updateFx(dt){updateEmbers(dt);
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t-=dt;p.vy-=12*dt;p.m.position.x+=p.vx*dt;p.m.position.y+=p.vy*dt;p.m.position.z+=p.vz*dt;p.m.scale.setScalar(Math.max(.01,p.t));if(p.t<=0){scene.remove(p.m);parts.splice(i,1);}}
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;if(f.update(f,dt)){scene.remove(f.obj);fx.splice(i,1);}}
}
// Kaatuva puu: isompi puu kaatuu hitaammin ja alku on hidas (k^2.6). Rungon sivuilla on oksia (kuusi: neulasoksat, koivu: tummat
// lehvästöiset oksat, aarnipuu: isot), jotka irtoavat jo kaatumisen aikana (kukin omalla hetkellään 30–90 % kaatumisesta) ja loput
// maahan osuessa; irronneet oksat putoavat ja vajoavat hitaasti maan alle. Pieni puu (koko < SMALL_TREE) ei jätä tukkeja, vaan
// muuttuu suoraan tavaroiksi (puu ym.) maahan osuessaan. Lähellä kaatuva puu tärähdyttää ruutua.
const SMALL_TREE=.8,BRANCH_C={koivu:0x4f4237};
function fallTree(n,dir,crush,src){const g=new THREE.Group();const m=new THREE.Mesh(NGEO_FALL[n.type]||NGEO[n.type],vcMat);m.scale.setScalar(n.s);m.rotation.y=n.rot||0;g.add(m);g.position.set(n.x,n.y,n.z);scene.add(g);
  const a=dir??Math.atan2(n.x-P.pos.x,n.z-P.pos.z),H=(TREE_H[n.type]||5)*n.s,dur=(1+.3*n.s)*(n.type==='aarnipuu'?2:1),brs=[],big=n.type==='aarnipuu',small=!big&&n.s<SMALL_TREE;
  const bm=mat(BRANCH_C[n.type]||TRUNK_C[n.type]||0x5a3a22),lc=LEAF_C[n.type],lm=lc?mat(lc):null,nb=big?7:n.type==='koivu'?6:5;
  const lay=TREE_BR[n.type];
  for(let i=0;i<(lay?lay.length:nb);i++){let phi=i/nb*TAU+rng()*.8,h=H*(.28+.55*i/nb),L=(.6+rng()*.5)*n.s*(big?2.5:1),th=.07*n.s*(big?2:1),tilt=.35+rng()*.3;
    // koivu: täsmälleen pystypuun oksat (sama asettelu, puun kierto ja koko)
    if(lay){const q=lay[i];h=q[0]*n.s;phi=q[1]+(n.rot||0);L=q[2]*n.s;tilt=q[3];}
    const b=new THREE.Group();b.add(bx(L,lay?.09*n.s:th,lay?.09*n.s:th,bm,L/2,0,0));
    if(lm){if(n.type==='kuusi'){for(let k=0;k<3;k++){const nd=new THREE.Mesh(new THREE.ConeGeometry(L*.16,L*.42,5),lm);nd.position.x=L*(.35+k*.27);nd.rotation.z=-Math.PI/2;nd.castShadow=true;b.add(nd);}}
      else{const lf=new THREE.Mesh(new THREE.IcosahedronGeometry(L*.3,0),lm);lf.position.x=L*.85;lf.castShadow=true;b.add(lf);
}}
    b.position.set(Math.cos(phi)*.12*n.s,h,-Math.sin(phi)*.12*n.s);b.rotation.set(0,phi,tilt);g.add(b);brs.push(b);b.userData.det=.3+rng()*.6;}
  fx.push({obj:g,t:0,update:(f,dt)=>{const k=Math.min(1,f.t/dur);g.rotation.set(0,0,0);g.rotateOnWorldAxis(_tmpV.set(Math.cos(a),0,-Math.sin(a)),Math.pow(k,2.6)*Math.PI/2);
    for(const b of brs)if(!b.userData.off&&k>=b.userData.det&&k<1){b.userData.off=1;g.updateMatrixWorld(true);dropBranch(b,Math.sin(a)*k*4,Math.cos(a)*k*4);}
    if(f.t>dur&&!f.dropped){f.dropped=1;{const dd=Math.hypot(P.pos.x-n.x,P.pos.z-n.z);sfx('thud',1/clamp(n.s,.7,1.6),clamp(1.15-dd/90,.12,1));}if(crush)crushPlayer(n,a,src);
      const mx=n.x+Math.sin(a)*H*.5,mz=n.z+Math.cos(a)*H*.5,dd=Math.hypot(P.pos.x-mx,P.pos.z-mz);if(!P.inDun&&dd<H+8)shake(Math.min(.5,.12+.35*(1-dd/(H+8))*Math.min(1.5,n.s)));
      burst(n.x+Math.sin(a)*3,n.y+.5,n.z+Math.cos(a)*3,0x6b4527,10,4);
      for(const [id,lo,hi] of n.def.drops){if(id==='puu'&&!small)continue;const c=Math.max(id==='puu'?1:0,Math.round(rint(rng,lo,hi)*n.s));for(let j=0;j<c;j++){const t=.8+j*H/(c+1);spawnDrop(id,1,n.x+Math.sin(a)*t,n.y+1,n.z+Math.cos(a)*t);}}
      g.updateMatrixWorld(true);for(const b of brs)if(!b.userData.off)dropBranch(b);
      if(small){m.visible=false;for(let j=0;j<5;j++)burst(n.x+Math.sin(a)*H*j/5,n.y+.4,n.z+Math.cos(a)*H*j/5,WOOD_IN,5,3);}
      else spawnLogs(n,a);}
    return f.t>dur+.4;}});}
// Irronnut oksa: putoaa maahan, jää hetkeksi ja vajoaa ~6 s:ssa hitaasti maan alle.
function dropBranch(b,ivx=0,ivz=0){scene.attach(b);const vx=(Math.random()-.5)*1.5+ivx,vz=(Math.random()-.5)*1.5+ivz;let vy=ivx||ivz?1:0;
  fx.push({obj:b,t:0,update:(f,dt)=>{const gy=terrainH(b.position.x,b.position.z);
    if(f.t<2.2){vy-=14*dt;const air=b.position.y>gy+.1;if(air){b.position.x+=vx*dt;b.position.z+=vz*dt;b.rotation.x+=vx*dt*.6;}b.position.y=Math.max(gy+.05,b.position.y+vy*dt);b.rotation.z*=.97;}
    else if(f.t>4){b.position.y-=.12*dt;}
    if(f.t>10){b.traverse(o=>{if(o.geometry)o.geometry.dispose();});return true;}return false;}});}
/* v1.19 (lista 2, kohta 9): kaatuva puu (myrsky, pelaajan kaatama, karhun kaatama) osuu kaikkeen rungon alla: pelaaja ja mobit
   menettävät 80 % suurimmasta terveydestään; haarniska ja kilpi eivät suojaa. Puun kaatanut mob (karhu, src) ei vahingoitu. */
function treeHit(n,a,x,z,y){const H=(TREE_H[n.type]||5)*n.s,dx=x-n.x,dz=z-n.z,along=dx*Math.sin(a)+dz*Math.cos(a),lat=Math.abs(dx*Math.cos(a)-dz*Math.sin(a));
  return along>0&&along<H&&lat<1.4*Math.max(1,n.s)&&y-terrainH(x,z)<3;}   // kohde lähellä maata (ei esim. katolla)
function crushPlayer(n,a,src){
  for(const m of mobs)if(m!==src&&!m.dead&&!m.dun&&treeHit(n,a,m.pos.x,m.pos.z,m.pos.y)){damageMob(m,m.maxHp*.8,null,Math.sin(a),Math.cos(a),3);}
  if(P.dead||P.inDun||devOn('god'))return;
  if(treeHit(n,a,P.pos.x,P.pos.z,P.pos.y)){const d=maxHp()*.8;P.hp-=d;P.hurtFlash=.8;shake(.6);sfx('hurt');floatText('-'+Math.round(d),P.pos.x,P.pos.y+2.2,P.pos.z,'#e0614f');msg('Kaatuva puu osui sinuun!','warn');if(P.hp<=0)playerDie();}}
function shockwave(x,y,z,r,color=0x8ffff0){const m=new THREE.Mesh(new THREE.RingGeometry(.8,1,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.8,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,y+.15,z);scene.add(m);fx.push({obj:m,t:0,update:(f)=>{const k=f.t/.5;m.scale.setScalar(.5+k*r);m.material.opacity=.8*(1-k);return k>=1;}});}

/* ---------------- PROJECTILES ---------------- */
const projs=[];
function shootArrow(from,dir,speed,dmg,owner,grav,fire){if(owner!=='player')dmg*=HURT_K;const m=new THREE.Group();m.add(bx(.04,.04,.8,mat(0xc9b48a),0,0,0,false),bx(.07,.07,.12,mat(0x4d535c),0,0,.42,false));
  if(fire){const fl=new THREE.Mesh(new THREE.ConeGeometry(.06,.2,6),MAT.flame);fl.rotation.x=-Math.PI/2;fl.position.z=.36;m.add(fl);m.add(bx(.08,.08,.06,mat(0x3a2a1c),0,0,.34,false));}m.position.copy(from);scene.add(m);const pr={m,v:dir.clone().multiplyScalar(speed),dmg,owner,t:0,g:grav||7,kind:'arrow',fire:!!fire};projs.push(pr);
  if(fire&&SET.arrowLight){pr.light={x:from.x,y:from.y,z:from.z,c:0xff8a3a,i:1.5,on:()=>true,move:true};lightSources.push(pr.light);updateLights();}}   // v1.23 asetus: tulinuolen valo
function throwRock(from,target,dmg){dmg*=HURT_K;const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.6,0),mat(0x5d5a54));m.castShadow=true;m.position.copy(from);scene.add(m);const d=_tmpV.subVectors(target,from);const T=1.1/.7;   // v0.89: kivi lentää 30 % hitaammin (ennen 1,1 s)
  const v=new V3(d.x/T,(d.y+.5*14*T*T)/T,d.z/T);projs.push({m,v,dmg,owner:'boss',t:0,g:14,kind:'rock'});}
const arrowFade=[];
function updateProjs(dt){updateHitMarks(dt);
  const dropLight=p=>{if(p.light){const j=lightSources.indexOf(p.light);if(j>=0)lightSources.splice(j,1);p.light=null;updateLights();}};
  // v1.33 (lista 3, kohta 34): tulinuolen valo hiipuu lennossa (sateessa 2× nopeammin) ja sammuu 2 s:ssa osumasta (sateessa 1 s).
  const rainK=!P.inDun&&wRain>.3?2:1;
  for(let i=arrowFade.length-1;i>=0;i--){const f=arrowFade[i];f.t+=dt*rainK;f.L.i=1.5*Math.max(0,1-f.t/2);if(f.t>=2){const j=lightSources.indexOf(f.L);if(j>=0)lightSources.splice(j,1);arrowFade.splice(i,1);updateLights();}}
  for(let i=projs.length-1;i>=0;i--){const p=projs[i];p.t+=dt;if(p.light){p.light.x=p.m.position.x;p.light.y=p.m.position.y;p.light.z=p.m.position.z;
      if(p.stuck){arrowFade.push({L:p.light,t:0});p.light=null;}else p.light.i=1.5*Math.max(.25,1-p.t*.12*rainK);}
    if(p.stuck){if(p.t>6){dropLight(p);scene.remove(p.m);projs.splice(i,1);}continue;}
    p.v.y-=p.g*dt;if(p.kind==='arrow'&&!P.inDun){const wa=WIND.spd*.08*dt*(p.steady?.5:1);p.v.x+=WIND.x*wa;p.v.z+=WIND.z*wa;} // v0.84: tuuli kallistaa nuolen rataa (13 m/s ≈ 0,5 m / 30 m)
    p.m.position.addScaledVector(p.v,dt);if(p.kind==='arrow')p.m.lookAt(_tmpV.copy(p.m.position).add(p.v));else{p.m.rotation.x+=dt*5;}
    const pos=p.m.position;let hit=false;
    if(p.owner==='player'){for(const m of mobs){if(m.dead)continue;const r=m.def.r+.35,cy=m.pos.y+m.def.r*1.6*(m.type==='vartija'?2.4:1);if(dist2(pos.x,pos.z,m.pos.x,m.pos.z)<r*r&&pos.y>m.pos.y-.2&&pos.y<cy+1.2){m.fireHit=!!p.fire;damageMob(m,p.dmg,'pierce',p.v.x,p.v.z);hitMarker(pos.x,pos.y,pos.z);m.fireHit=false;if(p.fire)igniteMob(m);hit=true;break;}}}
    else{if(!P.dead&&dist2(pos.x,pos.z,P.pos.x,P.pos.z)<(p.kind==='rock'?2.2*2.2:.6)&&pos.y<P.pos.y+2.2&&pos.y>P.pos.y-.5){hurtPlayer(p.dmg,pos.x-p.v.x,pos.z-p.v.z);hit=true;}}
    const g=P.inDun?DUN.y:terrainH(pos.x,pos.z);
    if(!hit&&(pos.y<g||pointBlocked(pos.x,pos.y,pos.z,false,true))){if(p.kind==='rock'){shockwave(pos.x,g,pos.z,3);burst(pos.x,g+.3,pos.z,0x5d5a54,10,5);sfx('slam');if(!P.dead&&dist2(pos.x,pos.z,P.pos.x,P.pos.z)<9)hurtPlayer(p.dmg,pos.x,pos.z);scene.remove(p.m);projs.splice(i,1);continue;}p.stuck=true;p.t=0;continue;}
    if(hit||p.t>8){if(p.kind==='rock'){shockwave(pos.x,pos.y-.5,pos.z,3);sfx('slam');}if(hit&&p.light){arrowFade.push({L:p.light,t:0});p.light.move=false;p.light=null;}dropLight(p);scene.remove(p.m);projs.splice(i,1);}
  }
}

/* v1.57: jousen osumamerkki – valkoinen X osumakohdassa, näkyy kaikkien esineiden läpi (depthTest pois), 0,28 s, ei animaatiota */
let _hmTex=null;const hitMarks=[];
function hitMarker(x,y,z){if(!_hmTex){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.lineCap='round';
    for(const [w,col] of [[11,'rgba(0,0,0,.55)'],[6,'#ffffff']]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();for(const [a,b,c2,d] of [[12,12,26,26],[52,12,38,26],[12,52,26,38],[52,52,38,38]]){g.moveTo(a,b);g.lineTo(c2,d);}g.stroke();}
    _hmTex=new THREE.CanvasTexture(c);}
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:_hmTex,depthTest:false,depthWrite:false,transparent:true,fog:false}));s.renderOrder=1000;s.position.set(x,y,z);
  const d=camera.position.distanceTo(s.position);s.scale.setScalar(.045*d);scene.add(s);hitMarks.push({s,t:.28});}
function updateHitMarks(dt){for(let i=hitMarks.length-1;i>=0;i--){const h=hitMarks[i];h.t-=dt;if(h.t<=0){scene.remove(h.s);h.s.material.dispose();hitMarks.splice(i,1);}}}
