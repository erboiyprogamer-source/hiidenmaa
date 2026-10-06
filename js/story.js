/* Hiidenmaa – story.js
   Löytöpaikat (rauniotalot, arkkukivet), vartijamobit, lisäriimukivet ja tarinatehtävät */
'use strict';

const SITE_KEYS=Object.keys(LOC).filter(k=>LOC[k].kind==='ruin'||LOC[k].kind==='rock'||LOC[k].kind==='portal');
const POI_LOOT={poiR1:[['jaaavain',1],['rauta',2],['nuolet',15]],poiR2:[['rautamalmi',5],['nuolet',20],['pihka',3]],poiR3:[['hiidenkivi',1],['kupari',4]],poiR4:[['rauta',4],['nahka',4],['hiili',5]],
  poiK1:[['rauta',3],['pihka',4],['nuolet',15]],poiK2:[['kupari',6],['luu',4],['hiili',5]],poiK3:[['hiidenkivi',1],['rautamalmi',3]]};
const GUARDS={portal1:['kivivartija','kivivartija'],portal2:['kivivartija','kalmo','kalmo'],portal3:['kivivartija','hiisi','hiisi'],
  poiR1:['kivivartija','kalmo'],poiR2:['kalmo','kalmo'],poiR3:['kivivartija'],poiR4:['kivivartija','hiisi'],poiK1:['kalmo','kalmo'],poiK2:['hiisi','hiisi','hiisi'],poiK3:['kivivartija','kalmo']};
const stoneM=()=>mat(rockC(0x77746d,Math.random())),mossM=mat(0x4d6a3a);

/* ---------------- LÖYTÖPAIKKOJEN RAKENTEET ---------------- */
function buildPoiRuin(k){const L=LOC[k],y=terrainH(L.x,L.z),r=mulberry32(k.charCodeAt(4)*977+(L.x|0));
  const W=9,D=7,sx=r()<.5?1:-1;
  const wall=(x,z,len,ry)=>{if(r()<.22)return;const h=.7+r()*2.7;stoneBox(len,h,.7,x,y+h/2-.1,z,ry,stoneM());if(h>1.6&&r()<.5)stoneBox(len*.6,.4,.8,x,y+h+.1,z,ry+r()*.1,mossM,false);};
  for(let i=0;i<5;i++){const x=L.x-W/2+.9+i*1.8;wall(x,L.z-D/2,1.8,0);if(!(i===2))wall(x,L.z+D/2,1.8,0);}
  for(let i=0;i<4;i++){const z=L.z-D/2+.9+i*1.75;wall(L.x-W/2,z,1.75,Math.PI/2);wall(L.x+W/2,z,1.75,Math.PI/2);}
  for(const [cx,cz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const h=3+r()*1.2;stoneBox(1.1,h,1.1,L.x+cx*W/2,y+h/2-.1,L.z+cz*D/2,0,stoneM());}
  statics.add(bx(W-1,.2,D-1,mat(0x55524c),L.x,y+.05,L.z,false));
  for(let i=0;i<4;i++)stoneBox(.7+r(),.5,.7,L.x+(r()-.5)*5,y+.2,L.z+(r()-.5)*3.5,r()*3,stoneM());
  const cx=L.x+sx*2.6,cz=L.z-1.2,ch=bx(1,.7,.65,MAT.wood,cx,y+.35,cz);ch.add(bx(1.04,.1,.7,mat(0x4a4a4a),0,.2,0));statics.add(ch);addBox(cx-.5,y,cz-.33,cx+.5,y+.7,cz+.33,'static');
  chestUse(k,ch,cx,y,cz);
}
// v1.01 (käyttäjän pyyntö): arkkukivi on suljettu kivilinnake – 3,5 m korkea umpinainen muuri (säde 5,5 m, paksuus 0,8 m), ulkopuolella
// 5 kivipilaria hyppyreittinä muurin harjalle (nousu 0,7 m, välit 1,6–1,9 m = vaikea, pelaajan hyppy ~1,18 m korkea / kävellen ~2,5 m),
// sisäpuolella kiviportaat (0,5 m < askelnousu) alas arkulle ja takaisin ylös. Reitin tiedot FORT[k] (tarkistus).
const FORT={};
function buildPoiRock(k){const L=LOC[k],y=terrainH(L.x,L.z),r=mulberry32(k.charCodeAt(4)*733+(L.z|0)),WR=5.5,WH=3.5,WT=.8,a0=r()*TAU,f=FORT[k]={pillars:[],steps:[],a0};
  const stoneM=()=>mat(rockC(0x6f6c66,r())),P2=(rr,a)=>[L.x+Math.cos(a)*rr,L.z+Math.sin(a)*rr];
  // muuri: 18 lohkoa renkaana (alaosa maan alle rinteen varalta), sammalta harjalla
  for(let i=0;i<18;i++){const a=i/18*TAU,[x,z]=P2(WR,a),gy=Math.min(y,terrainH(x,z)),h=WH+(y-gy)+1,len=WR*TAU/18+.35;
    const m=stoneBox(WT,h,len,x,gy-1+h/2,z,-a,stoneM());m.add(bx(WT*1.02,.15,len*.95,mossM,0,h/2,0,false));}
  // hyppypilarit: kiertävät muuria 8,1 m säteellä, korkeudet 0,7…3,5 m, viimeinen 1,6 m muurin ulkoreunasta
  const PH=[.7,1.4,2.1,2.8,3.5];let a=a0;
  PH.forEach((ph,i)=>{const rr=i<4?8.4:8.1,[x,z]=P2(rr,a),gy=terrainH(x,z),top=y+ph,h=top-gy+1,w=.95+r()*.15;stoneBox(w,h,w,x,top-h/2,z,r()*3,stoneM()).add(bx(w*1.01,.12,w*1.01,mossM,0,h/2,0,false));
    f.pillars.push({x,z,top,w});a-=(1.0+1.6+r()*.3)/rr;});
  // sisäportaat muurin harjalta (3,5) alas 0,5 m askelin pilareiden puolelta (kulma a0)
  for(let s=1;s<=7;s++){const top=y+WH-s*.5;if(top<=y+.05)break;const rr=WR-WT/2-.3-s*.62+.31,[x,z]=P2(rr,a0+.15);const h=top-y+1;stoneBox(.62,h,1.3,x,top-h/2,z,-a0-.15,stoneM());f.steps.push({x,z,top});}
  stoneBox(2.2,.5,2.2,L.x,y,L.z,.4,mat(0x5b5853),false);
  const g=bx(.5,1.2,.04,MAT.glow,0,0,0,false);{const [gx,gz]=P2(WR-WT/2-.03,a0+Math.PI);g.position.set(gx,y+2.2,gz);g.rotation.y=-(a0+Math.PI)+Math.PI/2;statics.add(g);}   // hehkuva riimu muurin sisäpinnalla
  const ch=bx(.9,.6,.6,MAT.wood,L.x,y+.55,L.z);ch.add(bx(.94,.1,.64,mat(0x4a4a4a),0,.16,0));statics.add(ch);
  chestUse(k,ch,L.x,y+.4,L.z,true);
  lightSources.push({x:L.x,y:y+2,z:L.z,c:0x7fd6cc,i:.8,on:()=>true});
}
function chestUse(k,mesh,x,y,z,noBox){
  const fk='poi:'+k;
  interactables.push({x,y:y+.6,z,r:2.6,label:()=>foundEmpty(fk)?'Arkku (tyhjä)':'Avaa arkku',use:()=>{const first=!fo('poi')[k];
    openFound(fk,LOC[k].name||'Arkku',first?POI_LOOT[k]||[['kupari',3]]:null);if(!first)return;
    const guards=mobs.filter(m=>m.siteK===k&&!m.dead&&dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z)<14*14);
    fo('poi')[k]=1;mesh.children[0].position.x=.5;mesh.children[0].rotation.z=.3;
    msg(guards.length?'Arkku aukesi – vartijat eivät ole tyytyväisiä!':'Arkku avattiin.','loot');addXp(25,'Löytö');burst(x,y+1,z,0x7fd6cc,12,3);}});
}
for(const k of SITE_KEYS){if(LOC[k].kind==='ruin')buildPoiRuin(k);else if(LOC[k].kind==='rock')buildPoiRock(k);}

/* ---------------- VARTIJAT JA LÖYDÖT ---------------- */
let siteT=0;
function updateSites(dt){
  siteT-=dt;if(siteT>0)return;siteT=1;if(P.inDun)return;
  for(const k of SITE_KEYS){const L=LOC[k],d2=dist2(L.x,L.z,P.pos.x,P.pos.z);
    if(d2<30*30&&!flags.disc[k]){flags.disc[k]=1;msg(`Löysit paikan: ${L.name}`,'loot');}
    if(d2>75*75)continue;
    (GUARDS[k]||[]).forEach((type,i)=>{if(fo('gk')[k+':'+i]||mobs.some(m=>m.siteK===k&&m.gi===i))return;
      const a=i/(GUARDS[k].length)*TAU+k.charCodeAt(k.length-1),R=L.kind==='portal'?8:7,x=L.x+Math.cos(a)*R,z=L.z+Math.sin(a)*R;
      const m=spawnMob(type,x,z);m.siteK=k;m.gi=i;m.guard={x,z,r:(L.kind==='portal'?16:15)*2};/* v0.97: alue ×2 */});}
}

/* ---------------- LISÄRIIMUKIVET ---------------- */
const DIRS=['pohjoiseen','koilliseen','itään','kaakkoon','etelään','lounaaseen','länteen','luoteeseen'];
function dirText(from,k){const L=LOC[k],dx=L.x-from.x,dz=L.z-from.z,a=Math.atan2(dx,-dz),i=((Math.round(a/(Math.PI/4))%8)+8)%8;return `${DIRS[i]}, noin ${Math.round(Math.hypot(dx,dz)/10)*10} m`;}
const XRUNES={
  runeA:{t:'Riimukivi – Tunturin huurre',reveal:['portal1'],txt:f=>`”Tunturin kylmyydessä seisoo Routaportti, ${dirText(f,'portal1')}. Sen takana on Routaluola, ja siellä Jäätär vartioi talvea. Portti on lukittu – sen avain on kätketty tänne, meidän maailmaamme.”`},
  runeB:{t:'Riimukivi – Avaimen kätkijä',reveal:['poiR1','portal1'],txt:f=>`”Jääavain lepää rauniotalon arkussa, ${dirText(f,'poiR1')}. Kivinen vartija vahtii sitä. Avain aukaisee Routaportin, ${dirText(f,'portal1')}.”`},
  runeC:{t:'Riimukivi – Kivien kirstut',reveal:['poiK1'],txt:f=>`”Vanhat kansat kätkivät aarteensa suuriin kiviin. Yksi arkkukivi on ${dirText(f,'poiK1')}. Muista: vartijat ovat sidottuja paikkaansa – juokse karkuun, jos hupenet.”`},
  runeD:{t:'Riimukivi – Kolme sisarta',reveal:['portal2'],txt:f=>`”Kolme sisarta vartioivat jäätä, kuolemaa ja metsää, ja kukin kantaa seuraavan avainta. Jäätär kantaa luuavainta, joka aukaisee Kalmankammion portin, ${dirText(f,'portal2')}. Kun kaikki kaatuvat, Hiidenmaan vartija jää yksin.”`},
  runeE:{t:'Riimukivi – Vihreä avain',reveal:['portal3'],txt:f=>`”Kun Kalmaherra kaatuu, hänen vyöltään putoaa vihreä aarniavain. Se aukaisee Aarnihaudan portin, ${dirText(f,'portal3')}, metsän pimeimmässä kohdassa.”`},
  runeF:{t:'Riimukivi – Vanha varoitus',reveal:['circle'],txt:f=>`”Portit eivät ole vain pakoreittejä. Niiden takana lepää voima, jota Kalmankehän alttari kaipaa: ${dirText(f,'circle')}. Hiidenkivet ovat kylmiä mutta rehellisiä.”`},
};
for(const k in XRUNES){const R=XRUNES[k],L=LOC[k],y=terrainH(L.x,L.z),v=k.charCodeAt(4)%4,r=mulberry32(k.charCodeAt(4)*131);
  let me;
  if(v===0)me=stoneBox(.9,2.8,.5,L.x,y+1.2,L.z,r()*3,mat(0x6a6c70));
  else if(v===1){me=stoneBox(1.1,2.2,.55,L.x,y+1,L.z,r()*3,mat(0x706a62));me.rotation.z=.12;stoneBox(.5,.7,.5,L.x+1.2,y+.3,L.z+.4,1,mat(0x5b5853));}
  else if(v===2){me=stoneBox(.7,3.2,.5,L.x,y+1.5,L.z,r()*3,mat(0x5f6a66));stoneBox(.5,2,.4,L.x+.9,y+.9,L.z-.3,r()*3,mat(0x66706c));}
  else{me=stoneBox(1.3,1.9,.6,L.x,y+.8,L.z,r()*3,mat(0x78726a));me.add(bx(1.0,.3,.64,mossM,0,.9,0,false));}
  const gl=bx(.4,.9+v*.2,.04,MAT.glow,0,0,.26,false);me.add(gl);
  interactables.push({x:L.x,y:y+1,z:L.z,r:2.6,label:()=>'Lue riimukivi',use:()=>{showLore(R.t,R.txt(L));flags.runes[k]=1;
    for(const t of R.reveal)if(!flags.disc[t]){flags.disc[t]=1;msg(`${LOC[t].name} merkittiin karttaan.`,'loot');}}});}

/* ---------------- TEHTÄVÄT ---------------- */
// Jokainen tehtävä on kuvaus + ehto; näytetään ensimmäinen suorittamaton. at = kartalle merkitty kohde, jonka suunta ja etäisyys näytetään.
const QUESTS=[
  {t:'Lue rannan riimukivi',d:'Rannalla seisoo kivi, joka kertoo saaresta.',done:()=>!!flags.runes.rune1},
  {t:'Löydä Hautakumpu',get d(){return `Kalmanummella ${dirIn('barrow')} lepäävät vanhat päälliköt.`;},at:'barrow',done:()=>!!flags.disc.barrow},
  {t:'Avaa Hautakummun kolme kirstua',d:'Kumpu on pimeä – ota tuli mukaan.',at:'barrow',done:()=>flags.sarc.every(Boolean)},
  {t:'Etsi Routaportti',d:'Riimukivet tietävät sen sijainnin. Se on tuntureiden kylmyydessä.',at:'portal1',done:()=>!!flags.disc.portal1},
  {t:'Löydä Jääavain',d:'Rauniotalon arkku, kivivartijan vahtimana.',at:'poiR1',done:()=>invCount('jaaavain')>0||!!fo('poi').poiR1||!portalLocked('portal1')},
  {t:'Avaa Routaportti',d:'Jääavain sopii Routaportin lukkoon.',at:'portal1',done:()=>!portalLocked('portal1')},
  {t:'Kukista Jäätär Routaluolassa',d:'Sokkelon perimmäisessä kammiossa. Hän kantaa luuavainta.',at:'portal1',done:()=>!!fo('rb').portal1},
  {t:'Avaa Kalmankammion portti',d:'Lukko aukeaa Jäättären luuavaimella.',at:'portal2',done:()=>!portalLocked('portal2')},
  {t:'Kukista Kalmaherra',d:'Hän pitää vihreää aarniavainta vyöllään.',at:'portal2',done:()=>!!fo('rb').portal2},
  {t:'Avaa Aarnihaudan portti',d:'Aarniavain sopii metsän portin lukkoon.',at:'portal3',done:()=>!portalLocked('portal3')},
  {t:'Kukista Aarnihirviö',d:'Luolan pimeimmässä sopessa.',at:'portal3',done:()=>!!fo('rb').portal3},
  {t:'Herätä Kalmanvartija',d:'Aseta kolme hiidenkiveä Kalmankehän alttarille.',at:'circle',done:()=>!!(flags.boss||boss)},
  {t:'Kukista Kalmanvartija',d:'Saari vapautuu otteesta.',at:'circle',done:()=>!!flags.boss},
];
let questKey='',questT=0;
function updateStory(dt){
  updateSites(dt);
  questT-=dt;if(questT>0)return;questT=1;
  const quiet=flags.qi===undefined;let qi=flags.qi|0;
  while(qi<QUESTS.length&&QUESTS[qi].done()){if(!quiet){msg(`Tehtävä suoritettu: ${QUESTS[qi].t}`,'loot');addXp(60,'Tehtävä');sfx('craft');}qi++;}
  flags.qi=qi;
  const q=QUESTS[qi],el=$('#quest');
  if(!q){const key='end';if(key!==questKey){questKey=key;el.innerHTML='<div class="eyebrow">Tarina</div><div class="qt">Kaikki tehtävät suoritettu</div><div class="qd">Hiidenmaa on vapaa.</div>';}return;}
  let h='';if(q.at&&flags.disc[q.at]){const L=LOC[q.at],dx=L.x-P.pos.x,dz=L.z-P.pos.z;h=P.inDun?'':`${DIRS[((Math.round(Math.atan2(dx,-dz)/(Math.PI/4))%8)+8)%8]}, ${Math.round(Math.hypot(dx,dz)/10)*10} m`;}
  const key=qi+'|'+h;if(key===questKey)return;questKey=key;
  el.innerHTML=`<div class="eyebrow">Tehtävä ${qi+1}/${QUESTS.length}</div><div class="qt">${q.t}</div><div class="qd">${q.d}</div>${h?`<div class="qh">${LOC[q.at].name}: ${h}</div>`:''}`;
}

/* ---------------- HYLÄTYT LEIRIT (v0.99, kohta 14) ---------------- */
// 1–2 leiriä per kartta (siemen kartan mukaan): sammunut nuotio (sytytetään puulla kuten oma nuotio), teltta (A-runko, suojaa: nukkuminen
// onnistuu) ja sänky sisällä, istuintukki ja säkki (löydetty säiliö). Paikka valitaan kasvillisuuden sijoittelun JÄLKEEN puista ja kivistä
// vapaalta tasaiselta maalta (≥ 60 m muista paikoista), joten maiseman numerointi ja vanhat tallennukset eivät muutu. Rakennelmat ovat
// tavallisia rakennusosia (tallentuvat, `flags.camps` = luotu); vanhaan tallennukseen ne luodaan latauksessa.
const CAMPS=(function(){const r=mulberry32(97531+MAP_ID*7919),out=[],n=1+(r()<.5?1:0),tmp=[];
  // ensin tiukat ehdot (niitty/koivikko/metsä/kangas, tasainen, 60 m muista paikoista), jos ei löydy, väljemmät (vuoriset kartat)
  for(let t=0;t<8000&&out.length<n;t++){const loose=t>=4000,x=(r()-.5)*HALF*1.6,z=(r()-.5)*HALF*1.6,h=terrainH(x,z);if(h<2||h>(loose?30:18))continue;
    const b=biomeAt(x,z,h);if(!(loose?['meadow','koivu','forest','kangas','tunturi','suo','aarni','mountain']:['meadow','koivu','forest','kangas']).includes(b))continue;
    let flat=true;for(const [ox,oz] of [[4,0],[-4,0],[0,4],[0,-4]])if(Math.abs(terrainH(x+ox,z+oz)-h)>(loose?1.1:.7))flat=false;if(!flat)continue;
    let far=true;for(const k in LOC){const L=LOC[k];if(dist2(x,z,L.x,L.z)<(loose?35:60)**2){far=false;break;}}for(const c of out)if(dist2(x,z,c.x,c.z)<(loose?80:120)**2)far=false;if(!far)continue;
    nodesNear(x,z,7,tmp);if(tmp.some(o=>o.def.kind==='tree'||o.def.kind==='rock'))continue;
    const k='camp'+(out.length+1);LOC[k]={x,z,name:'Hylätty leiri',kind:'camp'};out.push({k,x,z,y:h,rot:(r()*8)|0});}
  for(const c of out){const sx=c.x+2.2,sz=c.z-1.6,sy=terrainH(sx,sz),key='camp:'+c.k,sk=new THREE.Group();sk.position.set(sx,sy,sz);
    sk.add(bx(.55,.5,.42,mat(0x8a7454),0,.25,0),bx(.2,.12,.2,mat(0x6a5434),0,.55,0));statics.add(sk);   // säkki
    interactables.push({x:sx,y:sy+.5,z:sz,r:2.4,label:()=>foundEmpty(key)?'Säkki (tyhjä)':'Tutki hylätty säkki',use:()=>{const first=!fo('fc')[key];openFound(key,'Hylätty säkki',[['liha',2],['nahka',2],['soihtu',1],['puu',6],['nuolet',8]]);if(first)addXp(15,'Hylätty leiri tutkittu');}});}
  return out;})();
function ensureCamps(){if(flags.camps)return;flags.camps=1;
  for(const c of CAMPS){const a=c.rot*Math.PI/4,fw=(d,s)=>[c.x+Math.sin(a)*d+Math.cos(a)*s,c.z+Math.cos(a)*d-Math.sin(a)*s];
    const [tx,tz]=fw(-3.2,0);addPiece('teltta',tx,terrainH(tx,tz),tz,c.rot);addPiece('sanky',tx,terrainH(tx,tz),tz-0,c.rot);
    addPiece('nuotio',c.x,terrainH(c.x,c.z),c.z,0,undefined,{fuel:0,burn:0});
    const [lx,lz]=fw(1.6,1.4);addPiece('palkki',lx,terrainH(lx,lz)+.2,lz,(c.rot+2)%8);}}
