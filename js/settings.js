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
  ['up','Nosta haamua (rakentaessa) / pudota pikapaikasta (Shift = koko pino)','Rakentaminen','KeyQ'],['down','Laske haamua','Rakentaminen','KeyZ'],['remove','Pura','Rakentaminen','KeyX'],['repair','Korjaa','Rakentaminen','KeyF'],
  ['menu','Päävalikko / sulje valikot','Valikot ja paneelit','KeyP'],['inv','Reppu ja valmistus','Valikot ja paneelit','Tab'],['map','Kartta','Valikot ja paneelit','KeyM'],['prog','Taso, saavutukset, tavoitteet','Valikot ja paneelit','KeyJ'],['log','Viimeiset ilmoitukset','Valikot ja paneelit','KeyL'],['hud','Tehtävä ja tavoite näkyviin / piiloon','Valikot ja paneelit','KeyT'],
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
  renderDist:165,lights:6,mist:.6,clouds:1,drop3d:true,blood:1,bloodFx:true,keyHints:true,shafts:true,wheelHotbar:false,zoom:5.5,sound:true,invY:false,
  autoAll:true,autoRes:true,autoFx:true,autoDist:true,fps:'off',terrLod:false,mergeSt:true,shFar:false,sens:1,curSens:1,hudMode:0,creVol:.8,arrowLight:false,menuBg:'img',shUltra:'off',menuAnimKeep:false};   // hudMode v1.18: 0 molemmat, 1 vain tehtävä, 2 vain tavoite, 3 piilossa   // v1.12 yleinen automaattisäätö (+ osa-alueet) ja FPS-näyttö
// Asetussivujen avaimet (sivun "Palauta oletukset" palauttaa vain nämä)
// v1.35 (lista 3, kohta 16): varjot ovat Grafiikka-sivun väliotsikko (ei omaa sivua).
const SET_PAGES={gfx:['menuBg','res','autoAll','autoRes','renderDist','autoDist','fps','detail','grass','sway','clouds','lights','shafts','arrowLight','particles','mist','autoFx','bldDetail','drop3d','blood','bloodFx','shadow','sunRes','shDist','shRate','autoQ','ptShadow','ptRes','terrLod','mergeSt','shFar','shUltra'],ctl:['wheelHotbar','zoom','sens','curSens','sound','invY','keyHints','menuAnimKeep','creVol']};
/* v1.35 (lista 3, kohta 17): esiasetukset Low … Ultra (8 tasoa, oletus Medium = SET_DEF:n grafiikka). Esiasetus muuttaa kaikki alla
   luetellut asetukset; Low–Medium kytkee automaattisäädön päälle, High–Ultra pois. Ultra ylittää aiemmat maksimit (piirtoetäisyys 520 m,
   ruoho Ultra, varjoalue 140 m, tulien varjot 1024). Jos jotain säädetään käsin, nimi on "Custom".
   v1.76: tulinuolten valo päällä High+ ja Ultra; automaattisäädöt pois High-tasosta ylöspäin. Erittäin tarkat varjot (shUltra) eivät kuulu esiasetuksiin. */
const PRESET_N=['Low','Low+','Medium-','Medium','Medium+','High','High+','Ultra'];
const PRESETS=[
  {res:.55,renderDist:60,detail:'low',grass:0,sway:false,clouds:.3,lights:2,shafts:false,particles:.25,mist:0,bldDetail:false,drop3d:false,shadow:'off',sunRes:1024,shDist:35,shRate:'slow',ptShadow:false,ptRes:256,bloodFx:false,terrLod:true,mergeSt:true,shFar:true,autoAll:true,autoRes:true,autoFx:true,autoDist:true,autoQ:true,arrowLight:false},
  {res:.7,renderDist:90,detail:'low',grass:0,sway:true,clouds:.3,lights:2,shafts:false,particles:.5,mist:.3,bldDetail:false,drop3d:false,shadow:'low',sunRes:1024,shDist:35,shRate:'slow',ptShadow:false,ptRes:256,bloodFx:false,terrLod:true,mergeSt:true,shFar:true,autoAll:true,autoRes:true,autoFx:true,autoDist:true,autoQ:true,arrowLight:false},
  {res:.85,renderDist:120,detail:'high',grass:1,sway:true,clouds:.6,lights:4,shafts:false,particles:.5,mist:.3,bldDetail:true,drop3d:false,shadow:'low',sunRes:1024,shDist:55,shRate:'normal',ptShadow:false,ptRes:256,bloodFx:false,terrLod:true,mergeSt:true,shFar:true,autoAll:true,autoRes:true,autoFx:true,autoDist:true,autoQ:true,arrowLight:false},
  {res:1,renderDist:165,detail:'high',grass:1,sway:true,clouds:1,lights:6,shafts:true,particles:1,mist:.6,bldDetail:true,drop3d:true,shadow:'high',sunRes:2048,shDist:55,shRate:'normal',ptShadow:true,ptRes:384,bloodFx:true,terrLod:false,mergeSt:true,shFar:false,autoAll:true,autoRes:true,autoFx:true,autoDist:true,autoQ:true,arrowLight:false},
  {res:1,renderDist:210,detail:'high',grass:1,sway:true,clouds:1,lights:6,shafts:true,particles:1,mist:1,bldDetail:true,drop3d:true,shadow:'high',sunRes:2048,shDist:80,shRate:'normal',ptShadow:true,ptRes:384,bloodFx:true,terrLod:false,mergeSt:true,shFar:false,autoAll:true,autoRes:true,autoFx:true,autoDist:true,autoQ:true,arrowLight:false},
  {res:'native',renderDist:260,detail:'high',grass:2,sway:true,clouds:1,lights:6,shafts:true,particles:1,mist:1,bldDetail:true,drop3d:true,shadow:'high',sunRes:4096,shDist:80,shRate:'normal',ptShadow:true,ptRes:768,bloodFx:true,terrLod:false,mergeSt:true,shFar:false,autoAll:false,autoRes:false,autoFx:false,autoDist:false,autoQ:false,arrowLight:false},
  {res:'native',renderDist:400,detail:'high',grass:2,sway:true,clouds:1,lights:6,shafts:true,particles:1,mist:2,bldDetail:true,drop3d:true,shadow:'high',sunRes:4096,shDist:110,shRate:'fast',ptShadow:true,ptRes:768,bloodFx:true,terrLod:false,mergeSt:true,shFar:false,autoAll:false,autoRes:false,autoFx:false,autoDist:false,autoQ:false,arrowLight:true},
  {res:'native',renderDist:520,detail:'high',grass:3,sway:true,clouds:1,lights:6,shafts:true,particles:1,mist:2,bldDetail:true,drop3d:true,shadow:'high',sunRes:4096,shDist:140,shRate:'fast',ptShadow:true,ptRes:1024,bloodFx:true,terrLod:false,mergeSt:true,shFar:false,autoAll:false,autoRes:false,autoFx:false,autoDist:false,autoQ:false,arrowLight:true}];
function presetIdx(){return PRESETS.findIndex(p=>Object.keys(p).every(k=>String(SET[k])===String(p[k])));}
function applyPreset(i){Object.assign(SET,PRESETS[i]);saveSet();applyGfx();}
const SET=Object.assign({},SET_DEF);
try{const sv=JSON.parse(localStorage.getItem('hiidenmaa_set')||'{}');Object.assign(SET,sv);
  // v1.44: uudet esiasetusavaimet (terrLod, mergeSt, shFar) vanhaan tallenteeseen sen esiasetuksen mukaan, jottei nimi muutu Customiksi
  const nk=['terrLod','mergeSt','shFar'].filter(k=>!(k in sv));if(nk.length&&Object.keys(sv).length){const i=PRESETS.findIndex(p=>Object.keys(p).every(k=>nk.includes(k)||String(SET[k])===String(p[k])));if(i>=0)for(const k of nk)SET[k]=PRESETS[i][k];}}catch(e){}
// v1.35 (kohta 35): usvatasot siirtyivät (Ultra 2 = vanha Korkea, Korkea 1 = vanha Normaali, Normaali .6 = uusi oletus, Matala .3).
if(!(SET._v>=2)){if(+SET.mist===1)SET.mist=.6;else if(+SET.mist===.5)SET.mist=.3;SET._v=2;}
/* v1.79: esiasetukset asettavat myös automaattisäädön alavalinnat (High–Ultra pois, muut päällä) ja tulinuolten valon. Kertasiirto:
   jos tallenne vastaa jotain esiasetusta näitä avaimia lukuun ottamatta, ne asetetaan siitä (muuten nimi muuttuisi Customiksi). */
if(!(SET._v>=3)){const MK=['autoRes','autoFx','autoDist','autoQ','arrowLight'],i=PRESETS.findIndex(p=>Object.keys(p).every(k=>MK.includes(k)||String(SET[k])===String(p[k])));if(i>=0)for(const k of MK)SET[k]=PRESETS[i][k];SET._v=3;}
/* v1.83: veren fysiikka (bloodFx) päällä Mediumista ylöspäin; kertasiirto kuten v1.79 */
if(!(SET._v>=4)){const i=PRESETS.findIndex(p=>Object.keys(p).every(k=>k==='bloodFx'||String(SET[k])===String(p[k])));if(i>=0)SET.bloodFx=PRESETS[i].bloodFx;SET._v=4;}
function saveSet(){try{localStorage.setItem('hiidenmaa_set',JSON.stringify(SET));}catch(e){}}
let RDK=1,DETK=1,PF=1,hotSel=0,lastShadowOn=null;
/* v1.12 automaattisäätö: tasot nousevat kun peli nykii (main.js autoQuality), kertoimet otetaan käyttöön applyGfx:ssä.
   res = 3D-resoluutio, fx = hiukkaset/usva/ruoho, dist = piirtoetäisyys. Varjojen taso on QUAL.lvl (render.js). */
const AUTO={res:0,fx:0,dist:0},AUTO_K={res:[1,.85,.7,.55],fx:[1,.5,.25],dist:[1,.8,.6]};
/* v1.80: erittäin tarkat varjot ohittavat tavalliset varjoasetukset: oma etäisyys, 8192 kartta, päivitys joka ruutu, varjot aina päällä */
const SHU={sharp:{d:90,n:'8192 px · 90 m · päivitys joka ruutu'},soft:{d:110,n:'8192 px · 110 m · pehmeät reunat · joka ruutu'},wide:{d:160,n:'8192 px · 160 m näkymän suuntaan · joka ruutu'}};
const SHU_OVR=['shadow','sunRes','shDist','shRate','autoQ','shFar'];
function shUltraOn(){return !!SHU[SET.shUltra];}
function autoOn(k){if(k==='q'&&shUltraOn())return false;return !!SET.autoAll&&!!SET[{res:'autoRes',fx:'autoFx',dist:'autoDist',q:'autoQ'}[k]];}
// Ottaa asetukset käyttöön (kutsutaan käynnistyksessä ja kun asetusta muutetaan)
function applyGfx(){
  if(typeof grassDirty!=='undefined')grassDirty=true;   // v1.00 ruohon tiheys vaihtui
  for(const k of ['res','fx','dist'])if(!autoOn(k))AUTO[k]=0;if(!autoOn('q')&&typeof QUAL!=='undefined')QUAL.lvl=0;
  const dpr=devicePixelRatio||1,pr=(SET.res==='native'?Math.min(dpr,2):Math.min(dpr,1.5)*(+SET.res||1))*AUTO_K.res[AUTO.res];
  if(Math.abs(renderer.getPixelRatio()-pr)>.001){renderer.setPixelRatio(pr);renderer.setSize(innerWidth,innerHeight);}
  {const ps=+SET.ptRes||384,l=LIGHTS[0];if(l.shadow.mapSize.x!==ps){l.shadow.mapSize.set(ps,ps);if(l.shadow.map){l.shadow.map.dispose();l.shadow.map=null;}l.shadow.needsUpdate=true;}}
  sun.shadow.autoUpdate=shUltraOn()||SET.shRate!=='slow'&&!SET.shFar;   // v1.44 shFar: ai.js päivittää itse; v1.80 shUltra: joka ruutu
  /* v1.76: erittäin tarkat varjot (shUltra, ei esiasetuksissa): sharp = 8192 kartta, soft = 8192 + pehmeät reunat (PCF, säde 3,5),
     wide = 8192 + 1,6× alue näkymän suuntaan sovitettuna + päivitys joka ruutu (raskain, punainen). Kartan koko render.js setQuality. */
  {const u=SET.shUltra||'off',want=u==='soft'?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;if(renderer.shadowMap.type!==want){renderer.shadowMap.type=want;lastShadowOn=null;}
   sun.shadow.radius=u==='soft'?3.5:1;const d=SHU[u]?SHU[u].d:(+SET.shDist||55),sc=sun.shadow.camera;if(sc.right!==d){sc.left=-d;sc.right=d;sc.top=d;sc.bottom=-d;sc.updateProjectionMatrix();}
   sun.shadow.bias=SHU[u]?-.00035:-.0006;sc.far=SHU[u]?420:260;sc.updateProjectionMatrix();}
  const on=SET.shadow!=='off'||shUltraOn();renderer.shadowMap.enabled=on;
  if(lastShadowOn!==on){lastShadowOn=on;scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);});}
  if(typeof setQuality==='function')setQuality(QUAL.lvl);
  soundOn=!!SET.sound;invertY=!!SET.invY;
  RDK=SET.renderDist/165*AUTO_K.dist[AUTO.dist];DETK=SET.detail==='low'?.6:1;PF=SET.particles*AUTO_K.fx[AUTO.fx];
  {const f=$('#fps');if(f){f.hidden=SET.fps==='off';f.className='num fps_'+SET.fps;}}if(typeof refreshKeyHints==='function')refreshKeyHints();
  rain.geometry.setDrawRange(0,Math.floor(900*PF)*2);snow.geometry.setDrawRange(0,Math.floor(700*PF));
  for(const p of pieces)applyPieceDetail(p.mesh);
  if(SET.wheelHotbar)camDist=clamp(SET.zoom,2.2,10);
}
function applyPieceDetail(mesh){const v=!!SET.bldDetail;mesh.traverse(o=>{if(o.userData&&o.userData.detail)o.visible=v;});}

/* ---------------- OMAT SÄÄTIMET (v1.40, lista 4 kohta 4) ---------------- */
// Selaimen omat valintaruudut ja liukusäätimet korvattu omilla: eivät jää fokukseen (sininen kehys), toimivat myös pelin omalla
// osoittimella (keinotekoiset hiiritapahtumat). Liukusäädin: sldHTML + bindSld(id, syötteessä, muutoksen lopussa).
const sldHTML=(id,min,max,step,v)=>`<div class="sld" id="${id}" data-min="${min}" data-max="${max}" data-step="${step}" data-v="${v}"><i class="sldT"><b style="width:${(v-min)/(max-min)*100}%"></b></i><s style="left:${(v-min)/(max-min)*100}%"></s></div>`;
let sldDrag=null;
function sldSet(el,v){const mn=+el.dataset.min,mx=+el.dataset.max,st=+el.dataset.step||1;v=clamp(Math.round((v-mn)/st)*st+mn,mn,mx);el.dataset.v=v;const k=(v-mn)/(mx-mn)*100;el.querySelector('b').style.width=k+'%';el.querySelector('s').style.left=k+'%';return v;}
function sldFromX(el,x){const r=el.getBoundingClientRect(),mn=+el.dataset.min,mx=+el.dataset.max;return sldSet(el,mn+clamp((x-r.left)/r.width,0,1)*(mx-mn));}
function bindSld(id,onInput,onChange){const el=document.getElementById(id);if(!el)return;el.onmousedown=e=>{e.preventDefault();e.stopPropagation();sldDrag={el,onInput,onChange};onInput&&onInput(sldFromX(el,e.clientX));};}
addEventListener('mousemove',e=>{if(sldDrag){const v=sldFromX(sldDrag.el,e.clientX);sldDrag.onInput&&sldDrag.onInput(v);}});
addEventListener('mouseup',()=>{if(sldDrag){const d=sldDrag;sldDrag=null;d.onChange&&d.onChange(+d.el.dataset.v);}});
const tglHTML=(id,on,extra='')=>`<button type="button" class="tgl${on?' on':''}" id="${id}" ${extra}><i></i><span>${on?'Päällä':'Pois'}</span></button>`;
// Napsautuksen jälkeen nappi tai valikko ei jää fokukseen (näppäimet menevät peliin); tekstikenttään palatessa vanha teksti valitaan.
addEventListener('click',e=>{const b=e.target&&e.target.closest&&e.target.closest('button,.tgl');if(b)setTimeout(()=>b.blur(),0);});
addEventListener('change',e=>{if(e.target&&e.target.tagName==='SELECT')setTimeout(()=>e.target.blur(),0);});
addEventListener('focusin',e=>{const t=e.target;if(t&&t.tagName==='INPUT'&&/^(text|search|number)$/.test(t.type))setTimeout(()=>{try{t.select();}catch(err){}},0);});

/* ---------------- ASETUSVALIKKO ---------------- */
let setTab='keys',capture=null;
const SET_TABS=[['keys','Näppäimet'],['gfx','Grafiikka'],['ctl','Ohjaus ja ääni'],['prof','Profiilit'],['save','Tallennus']];
const row=(l,c,n='')=>`<div class="setRow"><label>${l}</label>${c}<span class="note">${n}</span></div>`;
const optSel=(id,opts,cur,def)=>`<select id="${id}"${String(cur)===String(def)?' class="isdef"':''}>${opts.map(([v,t])=>{const d=def!==undefined&&String(v)===String(def);return `<option value="${v}"${d?' class="def"':''}${String(v)===String(cur)?' selected':''}>${t}${d?' · oletus':''}</option>`;}).join('')}</select>`;
// Asetusrivi asetusavaimelle: valikko (opts) tai valintaruutu. Oletusarvo näkyy vaaleana ja merkinnällä "oletus".
const isDef=k=>String(SET[k])===String(SET_DEF[k]);
const setRow=(label,key,opts,note='')=>row(label+(isDef(key)?' <span class="defTag">oletus</span>':''),opts?optSel('s_'+key,opts,SET[key],SET_DEF[key]):tglHTML('s_'+key,!!SET[key]),note);
function bindSet(keys){for(const k of keys){const el=$('#s_'+k);if(!el||el.type==='range')continue;if(el.classList.contains('tgl')){el.onclick=()=>{SET[k]=!SET[k];saveSet();applyGfx();renderSettings();};continue;}el.onchange=()=>{const d=SET_DEF[k];SET[k]=el.type==='checkbox'?el.checked:typeof d==='boolean'?el.value==='true':(typeof d==='number'&&el.value!=='native'?+el.value:el.value);saveSet();applyGfx();renderSettings();};}}
function resetPage(page){keyDialog('Palautetaanko tämän sivun asetukset oletuksiin?',[['Palauta',()=>{for(const k of SET_PAGES[page])SET[k]=SET_DEF[k];saveSet();applyGfx();renderSettings();}],['Peruuta',null]]);}
const resetBtn=`<div class="row" style="margin-top:10px"><button class="btn" id="bPageReset">Palauta sivun oletusasetukset</button></div>`;
// v1.35 (kohta 19): asetusprofiilit localStorage-avaimessa hiidenmaa_profiles = {nimi: {set, bind, at}}.
function loadProfiles(){try{return JSON.parse(localStorage.getItem('hiidenmaa_profiles')||'{}')||{};}catch(e){return {};}}
function saveProfiles(p){try{localStorage.setItem('hiidenmaa_profiles',JSON.stringify(p));}catch(e){}}
function presetOf(set){const i=PRESETS.findIndex(p=>Object.keys(p).every(k=>String(set[k])===String(p[k])));return i<0?'':PRESET_N[i];}
function openSettings(tab){if(tab==='shadow')tab='gfx';if(tab)setTab=tab;$('#settings').hidden=false;renderSettings();}
function renderSettings(){const t=$('#setTabs');t.innerHTML='';
  for(const [id,nm] of SET_TABS){const b=document.createElement('button');b.className='tab'+(id===setTab?' on':'');b.textContent=nm;b.onclick=()=>{setTab=id;renderSettings();};t.appendChild(b);}
  const body=$('#setBody');
  if(setTab==='keys'){
    const cats=[...new Set(ACTIONS.map(a=>a[2]))];
    body.innerHTML='<p class="note">Napsauta näppäintä vaihtaaksesi sen. Vaihto kysyy vahvistuksen, eikä varattua tai jo käytössä olevaa näppäintä voi valita.</p><div class="keysGrid">'+
      cats.map(c=>`<div class="keyCat"><h3>${c}</h3>${ACTIONS.filter(a=>a[2]===c).map(a=>`<div class="keyRow"><span class="kn">${a[1]}</span><button class="kb kbtn${BIND[a[0]]!==BIND_DEF[a[0]]?' chg':''}" data-a="${a[0]}">${keyLabel(BIND[a[0]])}</button></div>`).join('')}</div>`).join('')+
      `<div class="keyCat"><h3>Kiinteät</h3>${[['Hiiren vasen','isku / jännitä ja ammu jousella / rakenna / lapio: kaiva, kuokka: nosta maata'],['Hiiren oikea','torju kilvellä / rakennusvalikko (vasara) / lapio: polku, kuokka: palauta maasto'],['1–8','valitse pikapaikka (ruoka syödään)'],['Hiiren rulla','zoom tai pikapaikat (Ohjaus)'],
        ['Shift + R','rakennuksen asento / kaltevuus'],['Q / Shift + Q (repussa)','pudota hiiren alla oleva tai valittu esine / koko pino'],['I','reppu (myös '+keyLabel(BIND.inv)+')'],
        ['Enter','herää uudelleen kaaduttua / lopeta kirjoitus hakukentässä'],['Mikä tahansa','ohita maailman alkulento ja avausotsikko'],['Esc','vapauttaa hiiren (selain); valikko: P'],...(DEV?[['V (DEV)','10× nopeus pohjassa'],['Ä (DEV)','DEV-valikko']]:[])].map(([k,d])=>`<div class="keyRow"><span class="kb fixed">${k}</span><span>${d}</span></div>`).join('')}</div></div>
      <div class="row" style="margin-top:10px"><button class="btn pri" id="bAllKeys">Näytä kaikki toiminnot</button><button class="btn" id="bKeysReset">Palauta oletusnäppäimet</button></div>`;
    body.querySelectorAll('.kbtn').forEach(b=>b.onclick=()=>startCapture(b.dataset.a));
    $('#bAllKeys').onclick=showAllKeys;
    $('#bKeysReset').onclick=()=>keyDialog('Palautetaanko kaikki näppäimet oletuksiin?',[['Palauta',()=>{Object.assign(BIND,BIND_DEF);saveBinds();renderSettings();}],['Peruuta',null]]);
  }else if(setTab==='gfx'){
    const sub=t=>`<h4 class="setSub">${t}</h4>`,autoN=k=>SET.autoAll?'':' (vaatii yleisen automaattisäädön)',pi=presetIdx();   // v1.12 väliotsikot
    body.innerHTML=`<div class="presetBox pv${pi<0?'c':pi}" id="presetBox"><canvas class="pvFx"></canvas><div class="presetHead"><b>Esiasetus</b><span id="presetName" class="${pi<0?'custom':''}">${pi<0?'Custom':PRESET_N[pi]}</span></div>
      ${sldHTML('sPreset',0,7,1,pi<0?3:pi)}<div class="presetTicks">${PRESET_N.map((n,i)=>`<span class="${i===pi?'on':''}${i===3?' def':''}">${n}</span>`).join('')}</div>
      <div class="note">Muuttaa kaikki grafiikka- ja varjoasetukset kerralla. Low–Medium: automaattinen säätö päällä, High–Ultra: pois. Muutokset näkyvät heti.</div></div>
    <div class="setGrid">${
      sub('Yleiset')+
      (typeof MENU_V2_OFF!=='undefined'&&MENU_V2_OFF?'':setRow('Valikon tausta','menuBg',[['img','Animoidut kuvat (kevyt)'],['3d','3D-kamera (raskas)']],'kuvat eivät kuormita konetta valikossa'))+
      setRow('3D-resoluutio','res',[['native','Terävä (näytön tarkkuus)'],[1,'Normaali'],[.85,'85 %'],[.7,'70 %'],[.55,'55 %'],[.4,'40 %']],'pienempi = kevyempi, käyttöliittymä pysyy terävänä')+
      setRow('Automaattinen säätö','autoAll',null,'laskee grafiikkaa jos peli nykii ja palauttaa kun sujuu (alla olevat osa-alueet)')+
      setRow('– Resoluutio automaattisesti','autoRes',null,'enintään 55 %'+autoN())+
      setRow('Piirtoetäisyys','renderDist',[[60,'Hyvin lähellä (60 m)'],[90,'Lähellä (90 m)'],[120,'Lyhyt (120 m)'],[165,'Normaali (165 m)'],[210,'Pitkä (210 m)'],[260,'Kaukana (260 m)'],[400,'Äärimmäinen (400 m)'],[520,'Ultra (520 m)']],'kauempana olevaa ei piirretä eikä animoida')+
      setRow('– Piirtoetäisyys automaattisesti','autoDist',null,'enintään −40 %'+autoN())+
      setRow('FPS-näyttö','fps',[['off','Pois'],['tr','Oikea yläkulma'],['tl','Vasen yläkulma'],['br','Oikea alakulma'],['bl','Vasen alakulma']],'kuvia sekunnissa')+
      sub('Luonto')+
      setRow('Yksityiskohdat (kasvit, pienet esineet)','detail',[['high','Paljon'],['low','Vähän']])+
      setRow('Ruoho','grass',[[3,'Ultra (hyvin tiheä, kauas)'],[2,'Täysi (tiheä)'],[1,'Normaali'],[0,'Pois']],'pystyheinä maassa, heiluu tuulessa')+
      setRow('Puiden heiluminen','sway')+
      setRow('Pilvet','clouds',[[1,'Kaikki'],[.6,'Vähemmän'],[.3,'Vähän'],[0,'Pois']])+
      sub('Valo')+
      setRow('Valonlähteitä yhtä aikaa','lights',[[6,'Paljon (6)'],[4,'Normaali (4)'],[2,'Vähän (2)']],'tulet, soihdut, portaalit')+
      setRow('Auringon valonsäteet','shafts')+
      setRow('Tulinuolten valo','arrowLight',null,'tulinuoli valaisee ympäristöä lentäessään (käyttää valonlähteen)')+
      sub('Partikkelit')+
      setRow('Hiukkaset (kipinät, sade, lumi)','particles',[[1,'Kaikki'],[.5,'Puolet'],[.25,'Vähän'],[0,'Pois']])+
      setRow('Usva ja höyry','mist',[[2,'Ultra'],[1,'Korkea'],[.6,'Normaali'],[.3,'Matala'],[0,'Pois']])+
      setRow('Veri','blood',[[1,'Normaali'],[.5,'Vähän'],[0,'Pois']],'veripisarat, läntit ja haavat')+
      setRow('Veren fysiikka','bloodFx',[['true','Pisarat lentävät ja jäävät maahan'],['false','Kevyt']],'lyönnin suuntaan, lammikko kasvaa (Medium ja ylemmät)')+
      setRow('– Hiukkaset, usva ja ruoho automaattisesti','autoFx',null,'puolittaa / neljännes, ruoho pois raskaimmillaan'+autoN())+
      sub('Esineet ja rakennukset')+
      setRow('Maassa olevat esineet','drop3d',[['true','3D-kuvake (syvyys)'],['false','Kevyt (kuutio)']],'koskee uusia pudotuksia')+
      setRow('Rakennusten yksityiskohdat','bldDetail')+
      sub('Varjot')+
      setRow('Varjot','shadow',[['high','Hyvät'],['low','Kevyet'],['off','Pois']])+ultraShRow()+
      setRow('Auringon varjojen tarkkuus','sunRes',[[1024,'Matala (1024)'],[2048,'Normaali (2048)'],[4096,'Korkea (4096)']])+
      setRow('Auringon varjojen etäisyys','shDist',[[35,'Lähellä (35 m)'],[55,'Normaali (55 m)'],[80,'Kaukana (80 m)'],[110,'Hyvin kaukana (110 m)'],[140,'Ultra (140 m)']],'kauempana varjot ovat epätarkempia')+
      setRow('Varjojen päivitystiheys','shRate',[['fast','Nopea'],['normal','Normaali'],['slow','Hidas']],'hidas = kevyempi, varjot liikkuvat nykien')+
      setRow('Automaattinen varjojen laatu','autoQ',null,'laskee varjojen laatua jos peli nykii'+autoN())+
      setRow('Tulien ja soihtujen varjot','ptShadow',null,'pimeällä')+
      setRow('Tulien varjojen tarkkuus','ptRes',[[256,'Matala (256)'],[384,'Normaali (384)'],[768,'Korkea (768)'],[1024,'Ultra (1024)']])+
      sub('Suorituskyky')+
      setRow('Kaukainen maasto kevennetty','terrLod',null,'yli 100 m päässä maasto piirretään 8 m lohkoina (sumu peittää eron)')+
      setRow('Staattisten kohteiden yhdistäminen','mergeSt',null,'kivet, rauniot ja linnakkeet yhdistetään – vähemmän piirtokutsuja, ulkoasu sama')+
      setRow('Auringon varjot harvemmin paikallaan','shFar',null,'kun et liiku, auringon varjot päivittyvät joka 4. kuva (liikkeessä joka kuva)')
    }</div><p class="note">Vaaleana näkyvä valinta on oletus. Asetukset tulevat voimaan heti ja tallentuvat selaimeen.</p>`+resetBtn;
    bindSet(SET_PAGES.gfx);$('#bPageReset').onclick=()=>resetPage('gfx');
    body.querySelectorAll('[data-ush]').forEach(b=>b.onclick=()=>{SET.shUltra=b.dataset.ush;saveSet();applyGfx();renderSettings();});
    if(shUltraOn())for(const k of SHU_OVR){const el=$('#s_'+k),r=el&&el.closest('.setRow');if(!r)continue;r.classList.add('ovr');if(el.tagName==='SELECT')el.disabled=true;const n=r.querySelector('.note');if(n)n.textContent='ohitettu: erittäin tarkat varjot päällä';}   // v1.80
    bindSld('sPreset',i=>{$('#presetName').textContent=PRESET_N[i];$('#presetName').className='';pvTheme(i);},i=>{applyPreset(i);renderSettings();});pvFxStart();
  }else if(setTab==='prof'){
    const P0=loadProfiles(),names=Object.keys(P0);
    body.innerHTML=`<p class="note">Profiili tallentaa kaikki asetukset: grafiikan, varjot, ohjauksen, äänet ja näppäimet. Valitse nimi ja tallenna – profiiliin voi palata myöhemmin.</p>
      <div class="row"><input id="profName" class="search" style="max-width:260px" maxlength="32" placeholder="Profiilin nimi (esim. Kannettava)"><button class="btn pri" id="bProfSave">Tallenna nykyiset asetukset</button></div>
      <div id="profList">${names.length?names.map(n=>`<div class="profRow"><b>${esc(n)}</b><span class="note">${esc(P0[n].at||'')}${P0[n].set&&presetOf(P0[n].set)?' · '+presetOf(P0[n].set):''}</span><button class="btn pri" data-use="${esc(n)}">Ota käyttöön</button><button class="btn" data-del="${esc(n)}">Poista</button></div>`).join(''):'<div class="note" style="margin-top:10px">Ei tallennettuja profiileja.</div>'}</div>`;
    $('#bProfSave').onclick=()=>{const n=$('#profName').value.trim();if(!n){$('#profName').focus();return;}const doIt=()=>{const pr=loadProfiles();pr[n]={set:Object.assign({},SET),bind:Object.assign({},BIND),at:new Date().toLocaleString('fi-FI',{dateStyle:'short',timeStyle:'short'})};saveProfiles(pr);renderSettings();};
      if(P0[n])keyDialog(`Korvataanko profiili «${n}»?`,[['Vahvista',doIt],['Peruuta',null]]);else doIt();};
    body.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{const pr=loadProfiles()[b.dataset.use];if(!pr)return;Object.assign(SET,pr.set);if(pr.bind)Object.assign(BIND,pr.bind);saveSet();saveBinds();applyGfx();renderSettings();});
    body.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>keyDialog(`Poistetaanko profiili «${b.dataset.del}»?`,[['Vahvista',()=>{const pr=loadProfiles();delete pr[b.dataset.del];saveProfiles(pr);renderSettings();}],['Peruuta',null]]));
  }else if(setTab==='ctl'){
    body.innerHTML=`<div class="setGrid">${
      setRow('Hiiren rulla vaihtaa pikapaikkaa','wheelHotbar',null,'rulla vaihtaa pikapaikkaa zoomin sijaan; zoom säädetään alta')+
      row('Kameran etäisyys'+(isDef('zoom')?' <span class="defTag">oletus</span>':''),sldHTML('sZoom',2.2,10,.1,SET.zoom),`<span id="sZoomV">${(+SET.zoom).toFixed(1)} m</span>`)+
      row('Kääntymisen herkkyys'+(isDef('sens')?' <span class="defTag">oletus</span>':''),sldHTML('sSens',.2,3,.05,SET.sens),`<span id="sSensV">${(+SET.sens).toFixed(2)}×</span>`)+
      row('Osoittimen herkkyys (pelin paneelit)'+(isDef('curSens')?' <span class="defTag">oletus</span>':''),sldHTML('sCur',.3,3,.05,SET.curSens),`<span id="sCurV">${(+SET.curSens).toFixed(2)}×</span>`)+
      `<div class="note" style="grid-column:1/-1;margin:-4px 0 4px">Osoittimen herkkyys koskee pelin sisäisiä paneeleja (reppu, rakentaminen, kartta…). Päävalikossa käytetään tietokoneen omaa osoitinta, jonka nopeuden selain ei anna muuttaa.</div>`+
      setRow('Äänet','sound')+
      row('Olentojen äänet'+(isDef('creVol')?' <span class="defTag">oletus</span>':''),sldHTML('sCreVol',0,1,.05,+SET.creVol),`<span id="sCreVolV">${Math.round(SET.creVol*100)} %</span>`)+   /* v1.84 */
      setRow('Käännä pystyhiiri','invY')+
      setRow('Näppäinopasteet','keyHints',null,'pienet vihjeet paneeleissa ja ruudun nurkassa (esim. Päävalikko: P)')+
      setRow('Älä pysäytä valikon animaatioita pelin aikana','menuAnimKeep',null,'oletus: valikon partikkelit ja animaatiot pysähtyvät pelissä ja häivyttyvät esiin valikkoon palatessa (kevyempi)')
    }</div>`+resetBtn+
      `<h4 class="setSub" style="margin-top:22px">Kehittäjä</h4><div class="setGrid">${row('Kehittäjätyökalut (DEV)',tglHTML('s_devOn',DEV),DEV?'DEV-valikko (Ä), 10× nopeus (V), jumalvoimat, kaikki ohjeet auki – vaihto lataa sivun uudelleen (peli tallennetaan)':'kehittäjien testityökalut – oletus pois; vaihto lataa sivun uudelleen (peli tallennetaan)')}</div>`;   /* v1.82 */
    bindSet(SET_PAGES.ctl);$('#bPageReset').onclick=()=>resetPage('ctl');
    $('#s_devOn').onclick=()=>keyDialog(DEV?'Poistetaanko kehittäjätyökalut käytöstä?':'Otetaanko kehittäjätyökalut käyttöön?',[[DEV?'Poista käytöstä':'Ota käyttöön',()=>{try{if(started&&!P.dead)saveGame(true);localStorage.setItem('hiidenmaa_devon',DEV?'0':'1');}catch(e){}location.reload();}],['Peruuta',null]],'Sivu ladataan uudelleen.');
    bindSld('sCreVol',v=>{SET.creVol=+v;$('#sCreVolV').textContent=Math.round(SET.creVol*100)+' %';},()=>saveSet());
    bindSld('sZoom',v=>{SET.zoom=+v;$('#sZoomV').textContent=SET.zoom.toFixed(1)+' m';camDist=SET.zoom;},()=>saveSet());
    bindSld('sSens',v=>{SET.sens=+v;$('#sSensV').textContent=SET.sens.toFixed(2)+'×';},()=>saveSet());bindSld('sCur',v=>{SET.curSens=+v;$('#sCurV').textContent=SET.curSens.toFixed(2)+'×';},()=>saveSet());
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
/* v1.75: "Näytä kaikki toiminnot" – ponnahdusikkuna, jossa kaikki näppäimiin ja hiireen liitetyt toiminnot tilanteittain. Näytetään
   oletusnäppäimet; jos pelaaja on vaihtanut näppäimen, perässä "nyt: X". Rivi: [toiminnon id tai null, oletusnäppäin, kuvaus]. */
const ALL_KEYS=[
  ['Pelatessa',[['fwd',0,'liiku eteen'],['back',0,'liiku taakse'],['left',0,'liiku vasemmalle'],['right',0,'liiku oikealle'],['run',0,'juokse (pohjassa)'],['jump',0,'hyppää / kiipeä ylös'],
    ['crouch',0,'kyykky / hiipiminen (jousella kyykyssä tarkka tähtäin)'],['interact',0,'poimi, avaa, puhu, nuku, käytä'],[null,'Hiiren vasen','isku; jousella pidä pohjassa = jännitä, päästä = ammu'],
    [null,'Hiiren oikea','torju kilvellä (pohjassa)'],[null,'1–8','valitse pikapaikka; ruoka syödään, varuste otetaan käteen'],[null,'Hiiren rulla','kameran zoom (tai pikapaikat, Asetukset › Ohjaus)'],
    ['up',0,'pudota valitusta pikapaikasta 1 (Shift = koko pino)'],['remove',0,'pura katsottu rakennusosa'],['repair',0,'korjaa katsottu rakennusosa'],
    ['hud',0,'tehtävä ja tavoite näkyviin / piiloon'],['minizoom',0,'minikartan zoom'],['full',0,'koko näyttö'],[null,'Esc','vapauttaa hiiren (selain) – käytä mieluummin P:tä']]],
  ['Rakentaessa (vasara kädessä)',[['build',0,'rakennusvalikko'],[null,'Hiiren vasen','aseta rakennusosa'],[null,'Hiiren oikea','rakennusvalikko'],['rot',0,'käännä osaa'],[null,'Shift + R','osan asento / kaltevuus'],
    ['snap',0,'sivuttaiskohdistus (tilat)'],['vsnap',0,'pystykohdistus'],['up',0,'nosta haamua'],['down',0,'laske haamua'],['remove',0,'pura'],['repair',0,'korjaa']]],
  ['Lapio ja kuokka',[[null,'Hiiren vasen','lapio: kaiva · kuokka: nosta maata'],[null,'Hiiren oikea','lapio: tee polku · kuokka: palauta maasto']]],
  ['Valikot ja paneelit',[['menu',0,'päävalikko / sulje avoin paneeli'],['inv',0,'reppu ja valmistus'],[null,'I','reppu (vaihtoehto)'],['map',0,'kartta'],['prog',0,'taso, saavutukset, tavoitteet'],['log',0,'viimeiset ilmoitukset'],
    ['interact',0,'sulje avoin paneeli']]],
  ['Repussa ja arkussa',[[null,'Hiiren vasen','valitse / siirrä esine toiseen ruutuun, raahaa'],[null,'Hiiren oikea','ota puolet pinosta'],[null,'Q / Shift + Q','pudota hiiren alla oleva tai valittu esine (Shift = koko pino)'],
    [null,'Kirjoita','haku (valmistus- ja rakennusvalikko)'],[null,'Enter (haussa)','valmista ensimmäinen osuma / lopeta kirjoitus'],[null,'Esc (haussa)','tyhjennä haku'],[null,'Shift (pohjassa)','esineen lisätiedot vihjeessä']]],
  ['Päävalikossa',[[null,'P / Esc','takaisin päänäkymään'],[null,'Enter','vahvista maailman nimi']]],
  ['Erikoistilanteet',[[null,'Enter','herää uudelleen kaaduttua'],[null,'Mikä tahansa','ohita uuden maailman alkulento / avausotsikko (ei ensikäynnin esittelyä)']]],
];
function showAllKeys(){let d=$('#allKeys');if(!d){d=document.createElement('div');d.id='allKeys';d.className='dlg';document.body.appendChild(d);d.onclick=e=>{if(e.target===d)d.hidden=true;};}
  const row=([a,k,t])=>{const def=a?keyLabel(BIND_DEF[a]):k,now=a&&BIND[a]!==BIND_DEF[a]?`<small class="now">nyt: ${keyLabel(BIND[a])}</small>`:'';return `<div class="akRow"><span class="kb fixed">${def}</span><span>${t}${now}</span></div>`;};
  d.innerHTML=`<div class="dlgBox akBox"><div class="akHead"><b>Kaikki toiminnot</b><button class="btn" id="akClose">Sulje</button></div><p class="note">Oletusnäppäimet. Jos olet vaihtanut näppäimen, nykyinen näkyy perässä.</p>
    <div class="akGrid">${ALL_KEYS.map(([h,R])=>`<div class="akCat"><h3>${h}</h3>${R.map(row).join('')}</div>`).join('')}${DEV?`<div class="akCat"><h3>DEV-tila</h3>${[[null,'V (pohjassa)','10× nopeus'],[null,'Ä','DEV-valikko'],[null,'Ö','olennot (luo 3 m eteen) ja pomot (pomohuone, portin eteen, ääriviiva)'],[null,'Välilyönti ×2','lento (jos päällä DEV-valikossa): välilyönti ylös, Shift alas, Ctrl nopeammin']].map(row).join('')}</div>`:''}</div></div>`;
  d.hidden=false;$('#akClose').onclick=()=>{d.hidden=true;};}
function ultraShRow(){const v=SET.shUltra||'off',on=v!=='off',O=[['off','Pois'],['sharp','Terävä 8192'],['soft','Terävä + pehmeät reunat'],['wide','Terävä + laaja alue']];
  return `<div class="setRow ultraRow${on?' on':''}"><label>Erittäin tarkat varjot${on?' <span class="ultraBang" title="Erittäin raskas asetus päällä">!</span>':' <span class="defTag">oletus</span>'}</label><div class="ultraOpts">${O.map(([k,t])=>`<button class="uo${k===v?' sel':''}${k==='wide'?' red':''}" data-ush="${k}">${t}</button>`).join('')}</div><span class="note">${on?SHU[v].n+' – ohittaa alla harmaana näkyvät varjoasetukset':'ei kuulu esiasetuksiin – vain hyvin tehokkaille koneille; punainen on raskain'}</span></div>`;}
function keyDialog(text,btns,note){const d=$('#keyDlg');d.hidden=false;$('#keyDlgT').textContent=text;$('#keyDlgN').textContent=note||'';
  const b=$('#keyDlgB');b.innerHTML='';for(const [t,fn] of btns){const x=document.createElement('button');x.className='btn'+(t==='Vahvista'||t==='Palauta'?' pri':'');x.textContent=t;x.onclick=()=>{d.hidden=true;capture=null;if(fn)fn();};b.appendChild(x);}}
function startCapture(a){const nm=ACTIONS.find(x=>x[0]===a)[1];capture={a,code:null};keyDialog(`Paina uutta näppäintä: ${nm}`,[['Peruuta',null]],'Esc peruu. Varatut ja jo käytössä olevat näppäimet hylätään.');}
addEventListener('keydown',e=>{if(!capture||capture.code)return;e.preventDefault();e.stopImmediatePropagation();
  if(e.code==='Escape'){$('#keyDlg').hidden=true;capture=null;return;}
  const a=capture.a,v=validateKey(a,e.code),nm=ACTIONS.find(x=>x[0]===a)[1];
  if(!v.ok){$('#keyDlgN').textContent=v.msg;return;}
  capture.code=e.code;keyDialog(`Vaihdetaanko «${nm}»: ${keyLabel(BIND[a])} → ${keyLabel(e.code)}?`,[['Vahvista',()=>{BIND[a]=e.code;saveBinds();renderSettings();}],['Peruuta',null]]);},true);

/* v1.47: esiasetusliukusäätimen teema tason mukaan (pv0…pv7, pvc = Custom). Medium = alkuperäinen ulkoasu.
   Low kivi + pöly, Low+ vaskipatina + itiöt, Medium- metsä + tulikärpäset, Medium+ kulta + kimallus, High routa + jääkiteet,
   High+ palava punainen + liekit ja kipinät, Ultra violetti taika + kiertävät ja nousevat hiukkaset. Partikkelit omalla canvasilla. */
function pvTheme(i){const b=document.getElementById('presetBox');if(!b)return;b.className='presetBox pv'+i;b.querySelectorAll('.presetTicks span').forEach((e,j)=>e.classList.toggle('on',j===i));}
const PV_FX={0:{c:'rgba(170,165,155,1)',n:.25,up:-1},1:{c:'rgba(120,220,170,1)',n:.35,up:.35},2:{c:'rgba(200,255,120,1)',n:.45,ff:1},3:null,
  4:{c:'rgba(255,220,120,1)',n:.7,up:.5},5:{c:'rgba(190,240,255,1)',n:.8,up:-.4,ice:1},6:{c:'rgba(255,120,40,1)',n:1.6,up:1.6,fire:1},7:{c:'rgba(200,120,255,1)',n:1.8,up:1.1,arc:1}};
let pvRun=false;
function pvFxStart(){if(pvRun)return;pvRun=true;const P=[];let last=performance.now();const spr={};
  const sp=c=>spr[c]||(spr[c]=(()=>{const v=document.createElement('canvas');v.width=v.height=24;const g=v.getContext('2d'),gr=g.createRadialGradient(12,12,0,12,12,12);gr.addColorStop(0,'#fff');gr.addColorStop(.25,c);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,24,24);return v;})());
  const loop=now=>{const box=document.getElementById('presetBox'),cv=box&&box.querySelector('.pvFx');if(!cv||!document.body.contains(cv)||box.offsetParent===null){pvRun=false;return;}
    requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;
    const W=box.clientWidth,H=box.clientHeight;if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
    const lv=(box.className.match(/pv(\d)/)||[])[1],F=PV_FX[lv],sl=document.getElementById('sPreset');const g=cv.getContext('2d');g.clearRect(0,0,W,H);
    if(F&&sl&&(+SET.particles||0)>0){const br=box.getBoundingClientRect(),r=sl.getBoundingClientRect(),x0=r.left-br.left,fw=r.width*(+sl.dataset.v)/7,ty=r.top-br.top+11;
      let n=F.n*dt*60;while(n>0){if(Math.random()<n){const x=x0+Math.random()*Math.max(8,fw);
        const p={x,y:ty+(Math.random()-.5)*4,vx:(Math.random()-.5)*18,vy:-(F.up||0)*(20+Math.random()*30),life:0,max:.8+Math.random()*1.2,s:2+Math.random()*2.5,ph:Math.random()*6};
        if(F.up<0){p.y=ty-14-Math.random()*16;p.vy=10+Math.random()*12;}if(F.ff){p.y=ty-6-Math.random()*22;p.vy=(Math.random()-.5)*8;p.max=1.5+Math.random();}
        if(F.arc&&Math.random()<.35){p.orb=1;p.a=Math.random()*6.28;p.R=10+Math.random()*10;p.max=1.2;}
        if(F.ice){p.s=1.5+Math.random()*2;}P.push(p);}n-=1;}
      for(let i=P.length-1;i>=0;i--){const p=P[i];p.life+=dt;if(p.life>p.max){P.splice(i,1);continue;}
        if(p.orb){p.a+=dt*5;const tx=x0+fw;p.x=tx+Math.cos(p.a)*p.R;p.y=ty+Math.sin(p.a)*p.R*.6;}else{p.x+=p.vx*dt;p.y+=p.vy*dt;if(F.fire)p.vx+=Math.sin(now/200+p.ph)*30*dt;}
        const a=Math.min(1,p.life/.15,(p.max-p.life)/.4)*(F.ff?.4+.6*Math.abs(Math.sin(now/180+p.ph)):1);g.globalCompositeOperation=F.up<0&&!F.ice?'source-over':'lighter';g.globalAlpha=Math.max(0,a);
        if(F.up<0&&!F.ice){g.fillStyle=F.c;g.fillRect(p.x,p.y,1.5,1.5);}else{const z=p.s*4;g.drawImage(sp(F.c),p.x-z/2,p.y-z/2,z,z);}}
      g.globalAlpha=1;g.globalCompositeOperation='source-over';}else P.length=0;};
  requestAnimationFrame(loop);}
