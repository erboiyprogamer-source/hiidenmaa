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
function buildPoiRock(k){const L=LOC[k],y=terrainH(L.x,L.z),r=mulberry32(k.charCodeAt(4)*733+(L.z|0));
  const n=6+((r()*3)|0),big=[];
  for(let i=0;i<n;i++){const a=i/n*TAU+r()*.3,d=1.9+r()*1.2,w=1.8+r()*1.8,h=1.6+r()*2.4;if(i===0)continue;const x=L.x+Math.cos(a)*d,z=L.z+Math.sin(a)*d;
    const m=stoneBox(w,h,w*(.7+r()*.5),x,y+h/2-.2,z,r()*3,mat(rockC(0x6f6c66,r())));m.add(bx(w*.9,.25,w*.8,mossM,0,h/2,0,false));if(w>2.6)big.push(m);}
  stoneBox(2.4,1.2,2.4,L.x,y+.2,L.z,.4,mat(0x5b5853),false);
  const g=bx(.5,1.2,.04,MAT.glow,0,0,0,false);(big[0]||statics).add(g);if(big[0])g.position.set(0,0,big[0].geometry.parameters.depth/2+.03);
  const ch=bx(.9,.6,.6,MAT.wood,L.x,y+.7,L.z);ch.add(bx(.94,.1,.64,mat(0x4a4a4a),0,.16,0));statics.add(ch);
  chestUse(k,ch,L.x,y+.4,L.z,true);
  lightSources.push({x:L.x,y:y+2,z:L.z,c:0x7fd6cc,i:.8,on:()=>true});
}
function chestUse(k,mesh,x,y,z,noBox){
  interactables.push({x,y:y+.6,z,r:2.6,label:()=>fo('poi')[k]?'Tyhjä arkku':'Avaa arkku',use:()=>{if(fo('poi')[k])return;
    const guards=mobs.filter(m=>m.siteK===k&&!m.dead&&dist2(m.pos.x,m.pos.z,P.pos.x,P.pos.z)<14*14);
    fo('poi')[k]=1;mesh.children[0].position.x=.5;mesh.children[0].rotation.z=.3;
    for(const [id,n] of POI_LOOT[k]||[['kupari',3]])giveOrDrop(id,n,x,y+1,z);msg(guards.length?'Arkku aukesi – vartijat eivät ole tyytyväisiä!':'Arkku avattiin.','loot');sfx('pickup');addXp(25,'Löytö');burst(x,y+1,z,0x7fd6cc,12,3);}});
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
      const m=spawnMob(type,x,z);m.siteK=k;m.gi=i;m.guard={x,z,r:L.kind==='portal'?16:15};});}
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
