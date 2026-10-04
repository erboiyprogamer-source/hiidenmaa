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
  ['inv','Reppu ja valmistus','Valikot ja paneelit','Tab'],['map','Kartta','Valikot ja paneelit','KeyM'],['prog','Taso, saavutukset, tavoitteet','Valikot ja paneelit','KeyJ'],['log','Viimeiset ilmoitukset','Valikot ja paneelit','KeyT'],
  ['full','Koko näyttö','Näkymä','KeyK'],['minizoom','Minikartan zoom','Näkymä','KeyN'],
];
const BIND_DEF={};for(const a of ACTIONS)BIND_DEF[a[0]]=a[3];
const BIND=Object.assign({},BIND_DEF);
try{const k=JSON.parse(localStorage.getItem('hiidenmaa_keys')||'{}');for(const a in k)if(a in BIND_DEF&&typeof k[a]==='string')BIND[a]=k[a];}catch(e){}
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
const SET_DEF={shadow:'high',autoQ:true,sway:true,particles:1,detail:'high',bldDetail:true,renderDist:165,wheelHotbar:false,zoom:5.5,sound:true,invY:false};
const SET=Object.assign({},SET_DEF);
try{Object.assign(SET,JSON.parse(localStorage.getItem('hiidenmaa_set')||'{}'));}catch(e){}
function saveSet(){try{localStorage.setItem('hiidenmaa_set',JSON.stringify(SET));}catch(e){}}
let RDK=1,DETK=1,PF=1,hotSel=0,lastShadowOn=null;
// Ottaa asetukset käyttöön (kutsutaan käynnistyksessä ja kun asetusta muutetaan)
function applyGfx(){
  const on=SET.shadow!=='off';renderer.shadowMap.enabled=on;
  if(lastShadowOn!==on){lastShadowOn=on;scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true);});}
  if(typeof setQuality==='function')setQuality(QUAL.lvl);
  soundOn=!!SET.sound;invertY=!!SET.invY;
  RDK=SET.renderDist/165;DETK=SET.detail==='low'?.6:1;PF=SET.particles;
  rain.geometry.setDrawRange(0,Math.floor(900*PF)*2);snow.geometry.setDrawRange(0,Math.floor(700*PF));
  for(const p of pieces)applyPieceDetail(p.mesh);
  if(SET.wheelHotbar)camDist=clamp(SET.zoom,2.2,10);
}
function applyPieceDetail(mesh){const v=!!SET.bldDetail;mesh.traverse(o=>{if(o.userData&&o.userData.detail)o.visible=v;});}

/* ---------------- ASETUSVALIKKO ---------------- */
let setTab='keys',capture=null;
const SET_TABS=[['keys','Näppäimet'],['gfx','Grafiikka'],['ctl','Ohjaus ja ääni'],['save','Tallennus']];
const row=(l,c,n='')=>`<div class="setRow"><label>${l}</label>${c}<span class="note">${n}</span></div>`;
const optSel=(id,opts,cur)=>`<select id="${id}">${opts.map(([v,t])=>`<option value="${v}"${String(v)===String(cur)?' selected':''}>${t}</option>`).join('')}</select>`;
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
    body.innerHTML=`<div class="setGrid">${
      row('Varjot',optSel('sShadow',[['high','Hyvät'],['low','Kevyet'],['off','Pois']],SET.shadow))+
      row('Automaattinen laatu',`<input type="checkbox" id="sAutoQ"${SET.autoQ?' checked':''}>`,'laskee varjojen laatua jos peli nykii')+
      row('Puiden heiluminen',`<input type="checkbox" id="sSway"${SET.sway?' checked':''}>`)+
      row('Hiukkaset (kipinät, sade, lumi)',optSel('sPart',[[1,'Kaikki'],[.5,'Puolet'],[.25,'Vähän'],[0,'Pois']],SET.particles))+
      row('Yksityiskohdat (kasvit, pienet esineet)',optSel('sDet',[['high','Paljon'],['low','Vähän']],SET.detail))+
      row('Rakennusten yksityiskohdat',`<input type="checkbox" id="sBld"${SET.bldDetail?' checked':''}>`)+
      row('Piirtoetäisyys',optSel('sRD',[[90,'Lähellä (90 m)'],[165,'Normaali (165 m)'],[260,'Kaukana (260 m)'],[400,'Äärimmäinen (400 m)']],SET.renderDist))
    }</div><p class="note">Kaukana oleva maailma häipyy sumuun piirtoetäisyyden reunalla. Asetukset tallentuvat selaimeen.</p>`;
    const bind=(id,key,conv)=>{const el=$('#'+id);el.onchange=()=>{SET[key]=el.type==='checkbox'?el.checked:conv?conv(el.value):el.value;saveSet();applyGfx();};};
    bind('sShadow','shadow');bind('sAutoQ','autoQ');bind('sSway','sway');bind('sPart','particles',parseFloat);bind('sDet','detail');bind('sBld','bldDetail');bind('sRD','renderDist',v=>+v);
  }else if(setTab==='ctl'){
    body.innerHTML=`<div class="setGrid">${
      row('Hiiren rulla vaihtaa pikapaikkaa',`<input type="checkbox" id="sWheel"${SET.wheelHotbar?' checked':''}>`,'kuten Minecraftissa; zoom säädetään alta')+
      row('Kameran etäisyys',`<input type="range" id="sZoom" min="2.2" max="10" step=".1" value="${SET.zoom}">`,`<span id="sZoomV">${(+SET.zoom).toFixed(1)} m</span>`)+
      row('Äänet',`<input type="checkbox" id="sSound"${SET.sound?' checked':''}>`)+
      row('Käännä pystyhiiri',`<input type="checkbox" id="sInvY"${SET.invY?' checked':''}>`)
    }</div>`;
    $('#sWheel').onchange=e=>{SET.wheelHotbar=e.target.checked;saveSet();applyGfx();};
    $('#sZoom').oninput=e=>{SET.zoom=+e.target.value;$('#sZoomV').textContent=SET.zoom.toFixed(1)+' m';camDist=SET.zoom;saveSet();};
    $('#sSound').onchange=e=>{SET.sound=e.target.checked;saveSet();applyGfx();};$('#sInvY').onchange=e=>{SET.invY=e.target.checked;saveSet();applyGfx();};
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
