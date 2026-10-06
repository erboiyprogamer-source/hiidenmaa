/* Hiidenmaa – settings.js
   Näppäinsidonnat (BIND, vaihto vahvistuksella), grafiikka- ja ohjausasetukset (SET, applyGfx) ja asetusvalikon käyttöliittymä */
'use strict';

/* ---------------- NÄPPÄINSIDONNAT ---------------- */
// [id, nimi, kategoria, oletusnäppäin (KeyboardEvent.code)]
const ACTIONS=[
  ['fwd','Liiku eteen','Liikkuminen','KeyW'],['back','Liiku taakse','Liikkuminen','KeyS'],['left','Liiku vasemmalle','Liikkuminen','KeyA'],['right','Liiku oikealle','Liikkuminen','KeyD'],
  ['run','Juokse','Liikkuminen','ShiftLeft'],['jump','Hyppää / kiipeä ylös','Liikkuminen','Space'],['crouch','Kyykky / hiipiminen','Liikkuminen','KeyC'],
  ['interact','Poimi, avaa, käytä','Toiminnot','KeyE'],
  ['build','Rakennusvalikko (vasara)','Rakentaminen','KeyB'],['rot','Käännä rakennetta (Shift = asento)','Rakentaminen','KeyR'],['snap','Sivuttaiskohdistus','Rakentaminen','KeyG'],['vsnap','Pystykohdistus','Rakentaminen','KeyH'],
  ['up','Nosta haamua','Rakentaminen','KeyQ'],['down','Laske haamua','Rakentaminen','KeyZ'],['remove','Pura','Rakentaminen','KeyX'],['repair','Korjaa','Rakentaminen','KeyF'],
  ['inv','Reppu ja valmistus','Valikot ja paneelit','Tab'],['map','Kartta','Valikot ja paneelit','KeyM'],['prog','Taso, saavutukset, tavoitteet','Valikot ja paneelit','KeyJ'],['log','Viimeiset ilmoitukset','Valikot ja paneelit','KeyL'],['hud','Tehtävä ja tavoite näkyviin / piiloon','Valikot ja paneelit','KeyT'],
  ['full','Koko näyttö','Näkymä','KeyK'],['minizoom','Minikartan zoom','Näkymä','KeyN'],
];
const BIND_DEF={};for(const a of ACTIONS)BIND_DEF[a[0]]=a[3];
const BIND=Object.assign({},BIND_DEF);
try{const k=JSON.parse(localStorage.getItem('hiidenmaa_keys')||'{}');for(const a in k)if(a in BIND_DEF&&typeof k[a]==='string')BIND[a]=k[a];
  if(BIND.log===BIND.hud&&!k.hud)BIND.log='KeyL';   /* v1.18: loki siirtyi T → L, T = tehtävä/tavoite (vanha tallennettu T ei törmää) */}catch(e){}
function saveBinds(){try{localStorage.setItem('hiidenmaa_keys',JSON.stringify(BIND));}catch(e){}}
// Onko toiminnon näppäin pohjassa (juoksu toimii kummallakin Shiftillä kun oletus)
const kd=a=>!!keys[BIND[a]]||(a==='run'&&BIND.run==='ShiftLeft'&&!!keys.ShiftRight);
function keyLabel(c){if(!c)return '–';if(/^Key/.test(c))return c.slice(3);if(/^Digit/.test(c))return c.slice(5);
  const m={Space:'Välilyönti',ShiftLeft:'Vasen Shift',ShiftRight:'Oikea Shift',Tab:'Tab',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Backquote:'§',Minus:'+',Equal:'´',Comma:',',Period:'.',Slash:'-',Semicolon:'Ö',Quote:'Ä',BracketLeft:'Å',IntlBackslash:'<'};
  return m[c]||(/^Numpad/.test(c)?'Num '+c.slice(6):c);}
// Varatut: Esc, pikapaikat 1–8, F-näppäimet ja muut erikoisnäppäimet
const RESERVED=/^(Escape|F\d+|Digit[1-8]|Meta.*|Control.*|Alt.*|CapsLock|ContextMenu|NumLock|ScrollLock|Pause|PrintScreen|Insert|Delete|Home|End|PageUp|PageDown|Enter|Backspace|NumpadEnter)$/;
function validateKey(action,code){
  if(RESERVED.test(code))return{ok:false,msg:`Näppäin ${keyLabel(code)} on varattu (Esc, 1–8, F-näppäimet ja muut erikoisnäppäimet).`};
  if(/^Shift/.test(code)&&action!=='run')return{ok:false,msg:'Shift on varattu juoksulle ja Shift+R:lle.'};
  for(const a of ACTIONS)if(a[0]!==action&&BIND[a[0]]===code)return{ok:false,msg:`Näppäin ${keyLabel(code)} on jo käytössä: ${a[1]}.`};
  if(code==='KeyI'&&BIND.inv==='Tab'&&action!=='inv')return{ok:false,msg:'I on varattu repun toiseksi näppäimeksi.'};
  if(code==='ShiftRight'&&action==='run'&&false)return{ok:false,msg:''};
  return{ok:true};}

/* ---------------- ASETUKSET ---------------- */
// Oletukset = taso, jolla suurin osa pelaa. Varjot: sunRes = auringon varjokartta (px), shDist = auringon varjoalueen säde (m),
// shRate = varjojen päivitystiheys, ptRes = tulien/soihtujen varjokartta (px). res = 3D-resoluution kerroin ('native' = näytön tarkkuus).
const SET_DEF={res:1,shadow:'high',sunRes:2048,shDist:55,shRate:'normal',ptShadow:true,ptRes:384,autoQ:true,sway:true,grass:1,particles:1,detail:'high',bldDetail:true,
  renderDist:165,lights:6,mist:1,clouds:1,shafts:true,wheelHotbar:false,zoom:5.5,sound:true,invY:false,
  autoAll:true,autoRes:true,autoFx:true,autoDist:true,fps:'off',hudMode:0,arrowLight:false,menuBg:'img'};   // hudMode v1.18: 0 molemmat, 1 vain tehtävä, 2 vain tavoite, 3 piilossa   // v1.12 yleinen automaattisäätö (+ osa-alueet) ja FPS-näyttö
// Asetussivujen avaimet (sivun "Palauta oletukset" palauttaa vain nämä)
const SET_PAGES={gfx:['menuBg','res','autoAll','autoRes','renderDist','autoDist','fps','detail','grass','sway','clouds','lights','shafts','arrowLight','particles','mist','autoFx','bldDetail'],shadow:['shadow','sunRes','shDist','shRate','autoQ','ptShadow','ptRes'],ctl:['wheelHotbar','zoom','sound','invY']};
const SET=Object.assign({},SET_DEF);
try{Object.assign(SET,JSON.parse(localStorage.getItem('hiidenmaa_set')||'{}'));}catch(e){}
function saveSet(){try{localStorage.setItem('hiidenmaa_set',JSON.stringify(SET));}catch(e){}}
let RDK=1,DETK=1,PF=1,hotSel=0,lastShadowOn=null;
/* v1.12 automaattisäätö: tasot nousevat kun peli nykii (main.js autoQuality), kertoimet otetaan käyttöön applyGfx:ssä.
   res = 3D-resoluutio, fx = hiukkaset/usva/ruoho, dist = piirtoetäisyys. Varjojen taso on QUAL.lvl (render.js). */
const AUTO={res:0,fx:0,dist:0},AUTO_K={res:[1,.85,.7,.55],fx:[1,.5,.25],dist:[1,.8,.6]};
function autoOn(k){return !!SET.autoAll&&!!SET[{res:'autoRes',fx:'autoFx',dist:'autoDist',q:'autoQ'}[k]];}
// Ottaa asetukset käyttöön (kutsutaan käynnistyksessä ja kun asetusta muutetaan)
function applyGfx(){
  if(typeof grassDirty!=='undefined')grassDirty=true;   // v1.00 ruohon tiheys vaihtui
  for(const k of ['res','fx','dist'])if(!autoOn(k))AUTO[k]=0;if(!autoOn('q')&&typeof QUAL!=='undefined')QUAL.lvl=0;
  const dpr=devicePixelRatio||1,pr=(SET.res==='native'?Math.min(dpr,2):Math.min(dpr,1.5)*(+SET.res||1))*AUTO_K.res[AUTO.res];
  if(Math.abs(renderer.getPixelRatio()-pr)>.001){renderer.setPixelRatio(pr);renderer.setSize(innerWidth,innerHeight);}
  {const d=+SET.shDist||55,sc=sun.shadow.camera;if(sc.right!==d){sc.left=-d;sc.right=d;sc.top=d;sc.bottom=-d;sc.updateProjectionMatrix();}}
  {const ps=+SET.ptRes||384,l=LIGHTS[0];if(l.shadow.mapSize.x!==ps){l.shadow.mapSize.set(ps,ps);if(l.shadow.map){l.shadow.map.dispose();l.shadow.map=null;}l.shadow.needsUpdate=true;}}
  sun.shadow.autoUpdate=SET.shRate!=='slow';
  const on=SET.shadow!=='off';renderer.shadowMap.enabled=on;
  if(lastShadowOn!==on){lastShadowOn=on;scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);});}
  if(typeof setQuality==='function')setQuality(QUAL.lvl);
  soundOn=!!SET.sound;invertY=!!SET.invY;
  RDK=SET.renderDist/165*AUTO_K.dist[AUTO.dist];DETK=SET.detail==='low'?.6:1;PF=SET.particles*AUTO_K.fx[AUTO.fx];
  {const f=$('#fps');if(f){f.hidden=SET.fps==='off';f.className='num fps_'+SET.fps;}}
  rain.geometry.setDrawRange(0,Math.floor(900*PF)*2);snow.geometry.setDrawRange(0,Math.floor(700*PF));
  for(const p of pieces)applyPieceDetail(p.mesh);
  if(SET.wheelHotbar)camDist=clamp(SET.zoom,2.2,10);
}
function applyPieceDetail(mesh){const v=!!SET.bldDetail;mesh.traverse(o=>{if(o.userData&&o.userData.detail)o.visible=v;});}

/* ---------------- ASETUSVALIKKO ---------------- */
let setTab='keys',capture=null;
const SET_TABS=[['keys','Näppäimet'],['gfx','Grafiikka'],['shadow','Varjot'],['ctl','Ohjaus ja ääni'],['save','Tallennus']];
const row=(l,c,n='')=>`<div class="setRow"><label>${l}</label>${c}<span class="note">${n}</span></div>`;
const optSel=(id,opts,cur,def)=>`<select id="${id}"${String(cur)===String(def)?' class="isdef"':''}>${opts.map(([v,t])=>{const d=def!==undefined&&String(v)===String(def);return `<option value="${v}"${d?' class="def"':''}${String(v)===String(cur)?' selected':''}>${t}${d?' · oletus':''}</option>`;}).join('')}</select>`;
// Asetusrivi asetusavaimelle: valikko (opts) tai valintaruutu. Oletusarvo näkyy vaaleana ja merkinnällä "oletus".
const isDef=k=>String(SET[k])===String(SET_DEF[k]);
const setRow=(label,key,opts,note='')=>row(label+(isDef(key)?' <span class="defTag">oletus</span>':''),opts?optSel('s_'+key,opts,SET[key],SET_DEF[key]):`<input type="checkbox" id="s_${key}"${SET[key]?' checked':''}${isDef(key)?' class="isdef"':''}>`,note);
function bindSet(keys){for(const k of keys){const el=$('#s_'+k);if(!el||el.type==='range')continue;el.onchange=()=>{const d=SET_DEF[k];SET[k]=el.type==='checkbox'?el.checked:(typeof d==='number'&&el.value!=='native'?+el.value:el.value);saveSet();applyGfx();renderSettings();};}}
function resetPage(page){keyDialog('Palautetaanko tämän sivun asetukset oletuksiin?',[['Palauta',()=>{for(const k of SET_PAGES[page])SET[k]=SET_DEF[k];saveSet();applyGfx();renderSettings();}],['Peruuta',null]]);}
const resetBtn=`<div class="row" style="margin-top:10px"><button class="btn" id="bPageReset">Palauta sivun oletusasetukset</button></div>`;
function openSettings(tab){if(tab)setTab=tab;$('#settings').hidden=false;renderSettings();}
function renderSettings(){const t=$('#setTabs');t.innerHTML='';
  for(const [id,nm] of SET_TABS){const b=document.createElement('button');b.className='tab'+(id===setTab?' on':'');b.textContent=nm;b.onclick=()=>{setTab=id;renderSettings();};t.appendChild(b);}
  const body=$('#setBody');
  if(setTab==='keys'){
    const cats=[...new Set(ACTIONS.map(a=>a[2]))];
    body.innerHTML='<p class="note">Napsauta näppäintä vaihtaaksesi sen. Vaihto kysyy vahvistuksen, eikä varattua tai jo käytössä olevaa näppäintä voi valita.</p><div class="keysGrid">'+
      cats.map(c=>`<div class="keyCat"><h3>${c}</h3>${ACTIONS.filter(a=>a[2]===c).map(a=>`<div class="keyRow"><span class="kn">${a[1]}</span><button class="kb kbtn${BIND[a[0]]!==BIND_DEF[a[0]]?' chg':''}" data-a="${a[0]}">${keyLabel(BIND[a[0]])}</button></div>`).join('')}</div>`).join('')+
      `<div class="keyCat"><h3>Kiinteät</h3>${[['Hiiren vasen','isku / jousi / rakenna / työkalu'],['Hiiren oikea','torju kilvellä / rakennusvalikko'],['1–8','pikapaikat'],['Shift + R','rakennuksen asento / kaltevuus'],['Esc','sulje paneeli / pelitauko'],['Hiiren rulla','zoom tai pikapaikat (Ohjaus)']].map(([k,d])=>`<div class="keyRow"><span class="kb fixed">${k}</span><span>${d}</span></div>`).join('')}</div></div>
      <div class="row" style="margin-top:10px"><button class="btn" id="bKeysReset">Palauta oletusnäppäimet</button></div>`;
    body.querySelectorAll('.kbtn').forEach(b=>b.onclick=()=>startCapture(b.dataset.a));
    $('#bKeysReset').onclick=()=>keyDialog('Palautetaanko kaikki näppäimet oletuksiin?',[['Palauta',()=>{Object.assign(BIND,BIND_DEF);saveBinds();renderSettings();}],['Peruuta',null]]);
  }else if(setTab==='gfx'){
    const sub=t=>`<h4 class="setSub">${t}</h4>`,autoN=k=>SET.autoAll?'':' (vaatii yleisen automaattisäädön)';   // v1.12 väliotsikot
    body.innerHTML=`<div class="setGrid">${
      sub('Yleiset')+
      (typeof MENU_V2_OFF!=='undefined'&&MENU_V2_OFF?'':setRow('Valikon tausta','menuBg',[['img','Animoidut kuvat (kevyt)'],['3d','3D-kamera (raskas)']],'kuvat eivät kuormita konetta valikossa'))+
      setRow('3D-resoluutio','res',[['native','Terävä (näytön tarkkuus)'],[1,'Normaali'],[.85,'85 %'],[.7,'70 %'],[.55,'55 %'],[.4,'40 %']],'pienempi = kevyempi, käyttöliittymä pysyy terävänä')+
      setRow('Automaattinen säätö','autoAll',null,'laskee grafiikkaa jos peli nykii ja palauttaa kun sujuu (alla olevat osa-alueet)')+
      setRow('– Resoluutio automaattisesti','autoRes',null,'enintään 55 %'+autoN())+
      setRow('Piirtoetäisyys','renderDist',[[60,'Hyvin lähellä (60 m)'],[90,'Lähellä (90 m)'],[165,'Normaali (165 m)'],[260,'Kaukana (260 m)'],[400,'Äärimmäinen (400 m)']],'kauempana olevaa ei piirretä eikä animoida')+
      setRow('– Piirtoetäisyys automaattisesti','autoDist',null,'enintään −40 %'+autoN())+
      setRow('FPS-näyttö','fps',[['off','Pois'],['tr','Oikea yläkulma'],['tl','Vasen yläkulma'],['br','Oikea alakulma'],['bl','Vasen alakulma']],'kuvia sekunnissa')+
      sub('Luonto')+
      setRow('Yksityiskohdat (kasvit, pienet esineet)','detail',[['high','Paljon'],['low','Vähän']])+
      setRow('Ruoho','grass',[[2,'Täysi (tiheä)'],[1,'Normaali'],[0,'Pois']],'pystyheinä maassa, heiluu tuulessa')+
      setRow('Puiden heiluminen','sway')+
      setRow('Pilvet','clouds',[[1,'Kaikki'],[.6,'Vähemmän'],[.3,'Vähän'],[0,'Pois']])+
      sub('Valo')+
      setRow('Valonlähteitä yhtä aikaa','lights',[[6,'Paljon (6)'],[4,'Normaali (4)'],[2,'Vähän (2)']],'tulet, soihdut, portaalit')+
      setRow('Auringon valonsäteet','shafts')+
      setRow('Tulinuolten valo','arrowLight',null,'tulinuoli valaisee ympäristöä lentäessään (käyttää valonlähteen)')+
      sub('Partikkelit')+
      setRow('Hiukkaset (kipinät, sade, lumi)','particles',[[1,'Kaikki'],[.5,'Puolet'],[.25,'Vähän'],[0,'Pois']])+
      setRow('Usva ja höyry','mist',[[2,'Korkea'],[1,'Normaali'],[.5,'Matala'],[0,'Pois']])+
      setRow('– Hiukkaset, usva ja ruoho automaattisesti','autoFx',null,'puolittaa / neljännes, ruoho pois raskaimmillaan'+autoN())+
      sub('Rakennukset')+
      setRow('Rakennusten yksityiskohdat','bldDetail')
    }</div><p class="note">Vaaleana näkyvä valinta on oletus. Asetukset tallentuvat selaimeen.</p>`+resetBtn;
    bindSet(SET_PAGES.gfx);$('#bPageReset').onclick=()=>resetPage('gfx');
  }else if(setTab==='shadow'){
    body.innerHTML=`<div class="setGrid">${
      `<h4 class="setSub">Auringon varjot</h4>`+
      setRow('Varjot','shadow',[['high','Hyvät'],['low','Kevyet'],['off','Pois']])+
      setRow('Auringon varjojen tarkkuus','sunRes',[[1024,'Matala (1024)'],[2048,'Normaali (2048)'],[4096,'Korkea (4096)']])+
      setRow('Auringon varjojen etäisyys','shDist',[[35,'Lähellä (35 m)'],[55,'Normaali (55 m)'],[80,'Kaukana (80 m)'],[110,'Hyvin kaukana (110 m)']],'kauempana varjot ovat epätarkempia')+
      setRow('Varjojen päivitystiheys','shRate',[['fast','Nopea'],['normal','Normaali'],['slow','Hidas']],'hidas = kevyempi, varjot liikkuvat nykien')+
      setRow('Automaattinen varjojen laatu','autoQ',null,'laskee varjojen laatua jos peli nykii'+(SET.autoAll?'':' (vaatii yleisen automaattisäädön)'))+
      `<h4 class="setSub">Tulien ja soihtujen varjot</h4>`+
      setRow('Tulien ja soihtujen varjot','ptShadow',null,'pimeällä')+
      setRow('Tulien varjojen tarkkuus','ptRes',[[256,'Matala (256)'],[384,'Normaali (384)'],[768,'Korkea (768)']])
    }</div><p class="note">Vaaleana näkyvä valinta on oletus.</p>`+resetBtn;
    bindSet(SET_PAGES.shadow);$('#bPageReset').onclick=()=>resetPage('shadow');
  }else if(setTab==='ctl'){
    body.innerHTML=`<div class="setGrid">${
      setRow('Hiiren rulla vaihtaa pikapaikkaa','wheelHotbar',null,'rulla vaihtaa pikapaikkaa zoomin sijaan; zoom säädetään alta')+
      row('Kameran etäisyys'+(isDef('zoom')?' <span class="defTag">oletus</span>':''),`<input type="range" id="sZoom" min="2.2" max="10" step=".1" value="${SET.zoom}">`,`<span id="sZoomV">${(+SET.zoom).toFixed(1)} m</span>`)+
      setRow('Äänet','sound')+
      setRow('Käännä pystyhiiri','invY')
    }</div>`+resetBtn;
    bindSet(SET_PAGES.ctl);$('#bPageReset').onclick=()=>resetPage('ctl');
    $('#sZoom').oninput=e=>{SET.zoom=+e.target.value;$('#sZoomV').textContent=SET.zoom.toFixed(1)+' m';camDist=SET.zoom;saveSet();};
  }else{
    body.innerHTML=`<p class="note">Tallennuskoodi on pakattu: sen voi kopioida, tallentaa .txt-tiedostoksi ja ladata takaisin toisella koneella.</p>
      <textarea id="saveCode" spellcheck="false" placeholder="Tallennuskoodi tulee tähän"></textarea>
      <div class="row" style="margin-top:6px"><button class="btn" id="bExport">Näytä koodi</button><button class="btn" id="bCopy">Kopioi</button><button class="btn" id="bImport">Lataa koodista</button></div>
      <div class="row" style="margin-top:6px"><button class="btn pri" id="bDownload">Tallenna .txt-tiedostoon</button><label class="btn" for="fUpload" style="cursor:pointer">Lataa .txt-tiedostosta</label><input type="file" id="fUpload" accept=".txt,text/plain" hidden></div>
      <div class="note" id="ioMsg"></div>`;
    wireSaveIO();
  }
}
// Näppäimen vaihto: 1) paina uusi näppäin, 2) vahvista pienessä ikkunassa
function keyDialog(text,btns,note){const d=$('#keyDlg');d.hidden=false;$('#keyDlgT').textContent=text;$('#keyDlgN').textContent=note||'';
  const b=$('#keyDlgB');b.innerHTML='';for(const [t,fn] of btns){const x=document.createElement('button');x.className='btn'+(t==='Vahvista'||t==='Palauta'?' pri':'');x.textContent=t;x.onclick=()=>{d.hidden=true;capture=null;if(fn)fn();};b.appendChild(x);}}
function startCapture(a){const nm=ACTIONS.find(x=>x[0]===a)[1];capture={a,code:null};keyDialog(`Paina uutta näppäintä: ${nm}`,[['Peruuta',null]],'Esc peruu. Varatut ja jo käytössä olevat näppäimet hylätään.');}
addEventListener('keydown',e=>{if(!capture||capture.code)return;e.preventDefault();e.stopImmediatePropagation();
  if(e.code==='Escape'){$('#keyDlg').hidden=true;capture=null;return;}
  const a=capture.a,v=validateKey(a,e.code),nm=ACTIONS.find(x=>x[0]===a)[1];
  if(!v.ok){$('#keyDlgN').textContent=v.msg;return;}
  capture.code=e.code;keyDialog(`Vaihdetaanko «${nm}»: ${keyLabel(BIND[a])} → ${keyLabel(e.code)}?`,[['Vahvista',()=>{BIND[a]=e.code;saveBinds();renderSettings();}],['Peruuta',null]]);},true);
