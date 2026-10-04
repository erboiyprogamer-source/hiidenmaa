/* Hiidenmaa – progress.js
   Kokemuspisteet ja taso, laskurit, saavutukset (pysyvät bonukset), tavoitteet ja edistymispaneeli (J) */
'use strict';

/* ---------------- LASKURIT, XP JA TASO ---------------- */
// flags.cnt = laskurit (trees, rocks, kills, k_<laji>, built, crafted, cooked, picked, slept, shots), flags.xp = kokemuspisteet,
// flags.ach = avatut saavutukset, flags.first = ensimmäiset kerrat (XP vain kerran).
const LVL_MAX=20,needXp=n=>50+30*n; // XP tasolta n tasolle n+1
function fixFlags(){flags.xp=flags.xp||0;flags.cnt=flags.cnt||{};flags.ach=flags.ach||{};flags.first=flags.first||{};}
const cnt=k=>(flags.cnt&&flags.cnt[k])||0;
function bump(k,n=1){fixFlags();flags.cnt[k]=(flags.cnt[k]||0)+n;}
function lvlInfo(){let xp=flags.xp||0,L=1;while(L<LVL_MAX&&xp>=needXp(L)){xp-=needXp(L);L++;}return{L,xp,need:L>=LVL_MAX?0:needXp(L)};}
const playerLevel=()=>lvlInfo().L;
function addXp(n,why){if(!n||P.dead)return;fixFlags();const b=playerLevel();flags.xp+=n;const a=playerLevel();
  if(n>=10&&why)msg(`+${n} XP · ${why}`,'xp');
  if(a>b){sfx('craft');msg(`Taso ${a}!`,'loot');const un=RECIPES.filter(r=>r.lvl>b&&r.lvl<=a).map(r=>ITEMS[r.id].n);if(un.length)msg(`Uusia ohjeita: ${un.join(', ')}`,'loot');}}
function xpFirst(key,n,why){fixFlags();if(flags.first[key])return;flags.first[key]=1;addXp(n,why);}
const recipeOpen=r=>!r.lvl||playerLevel()>=r.lvl;

/* ---------------- SAAVUTUKSET ---------------- */
// b = pysyvä bonus: hp (enimmäisterveys), stam (enimmäiskestävyys), w (kantokyky), spd (nopeus, %-yksikköä)
const ACH=[
  {id:'puuk',n:'Puunkaataja',d:'Kaada 25 puuta.',pr:()=>[cnt('trees'),25],b:{w:10}},
  {id:'louhija',n:'Kivenlouhija',d:'Louhi 20 lohkaretta.',pr:()=>[cnt('rocks'),20],b:{w:10}},
  {id:'metsastaja',n:'Metsästäjä',d:'Kaada 20 vihollista tai eläintä.',pr:()=>[cnt('kills'),20],b:{hp:3}},
  {id:'susi',n:'Susienkaataja',d:'Kaada 5 susta.',pr:()=>[cnt('k_susi'),5],b:{stam:5}},
  {id:'kalmo',n:'Kalmojen kauhu',d:'Kaada 10 kalmoa.',pr:()=>[cnt('k_kalmo'),10],b:{hp:3}},
  {id:'rakentaja',n:'Rakentaja',d:'Rakenna 50 osaa.',pr:()=>[cnt('built'),50],b:{spd:1}},
  {id:'kokki',n:'Kokki',d:'Kypsennä 10 ruokaa tulella.',pr:()=>[cnt('cooked'),10],b:{hp:3}},
  {id:'keraaja',n:'Marjastaja',d:'Poimi 15 kasvia.',pr:()=>[cnt('picked'),15],b:{stam:5}},
  {id:'kuparikausi',n:'Kuparikausi',d:'Omista kupariharkko.',pr:()=>[flags.seen&&flags.seen.kupari?1:0,1],b:{w:5}},
  {id:'rautamies',n:'Rautamies',d:'Omista rautaharkko.',pr:()=>[flags.seen&&flags.seen.rauta?1:0,1],b:{w:10}},
  {id:'selviytyja',n:'Selviytyjä',d:'Selviä 5 päivää.',pr:()=>[Math.min(5,dayN-1),5],b:{hp:3}},
  {id:'tutkija',n:'Tutkimusmatkailija',d:'Löydä 6 paikkaa.',pr:()=>[Object.keys(flags.disc||{}).length,6],b:{spd:1}},
  {id:'nuolimestari',n:'Nuolimestari',d:'Ammu 30 nuolta.',pr:()=>[cnt('shots'),30],b:{stam:5}},
  {id:'unet',n:'Hyvät yöunet',d:'Nuku sängyssä.',pr:()=>[cnt('slept'),1],b:{stam:5}},
  {id:'vartija',n:'Kalmanvartijan voittaja',d:'Voita Kalmanvartija.',pr:()=>[flags.boss?1:0,1],b:{hp:5,stam:5}},
];
const BON={hp:0,stam:0,w:0,spd:0};
function recalcMaxW(){MAXW=160+40*P.packLv+BON.w;}
function recalcBon(){fixFlags();BON.hp=BON.stam=BON.w=BON.spd=0;for(const a of ACH)if(flags.ach[a.id])for(const k in a.b)BON[k]+=a.b[k];recalcMaxW();}
const bonText=b=>Object.entries(b).map(([k,v])=>({hp:`+${v} enimmäisterveys`,stam:`+${v} enimmäiskestävyys`,w:`+${v} kantokyky`,spd:`+${v} % nopeus`}[k])).join(', ');
function checkAch(){fixFlags();let any=false;
  for(const a of ACH){if(flags.ach[a.id])continue;const [c,m]=a.pr();if(c>=m){flags.ach[a.id]=1;any=true;msg(`Saavutus: ${a.n} (${bonText(a.b)})`,'loot');addXp(50,'saavutus');sfx('craft');}}
  if(any)recalcBon();}

/* ---------------- TAVOITTEET ---------------- */
const anyP=f=>pieces.some(f),isStone=p=>PIECES[p.t].stone||p.t==='kiviseina';
const GOALS=[
  {id:'poimi',t:'Poimi oksia ja kiviä',d:'Kävele niiden luo ja paina E. Tarvitset 3 puuta ja 2 kiveä.',xp:10,ok:()=>invCount('puu')>=3&&invCount('kivi')>=2||invCount('kirves')||cnt('crafted')>0},
  {id:'kirves',t:'Valmista kivikirves',d:'Avaa reppu Tab-näppäimellä ja valmista kirves.',xp:10,ok:()=>invCount('kirves')||invCount('kuparikirves')},
  {id:'puu1',t:'Kaada ensimmäinen puu',d:'Lyö puuta kirveellä (hiiren vasen) kunnes se kaatuu.',xp:10,ok:()=>cnt('trees')>=1},
  {id:'puu10',t:'Kaada kymmenen puuta',d:'Puuta tarvitaan kaikkeen. Tukit voi poimia maasta.',xp:15,ok:()=>cnt('trees')>=10},
  {id:'vasara',t:'Valmista vasara',d:'Vasara on rakennustyökalu. Valmista se repun valmistusvalikosta.',xp:10,ok:()=>invCount('vasara')||anyP(p=>p.t==='tyopenkki')||cnt('built')>0},
  {id:'penkki',t:'Rakenna työpenkki',d:'Ota vasara käteen, avaa rakennusvalikko (B tai hiiren oikea) ja rakenna työpenkki (10 puuta).',xp:15,ok:()=>anyP(p=>p.t==='tyopenkki')},
  {id:'lattia',t:'Rakenna lattia',d:'Rakenna työpenkin alueella puulattia.',xp:10,ok:()=>anyP(p=>bt(p.t)==='lattia')},
  {id:'seinat',t:'Pystytä neljä seinää',d:'Seinät, ikkunaseinät ja ovet lasketaan. R kääntää, G vaihtaa kohdistusta.',xp:10,ok:()=>pieces.filter(p=>PIECES[p.t].snap==='wall').length>=4},
  {id:'ovi',t:'Lisää ovi',d:'Ovi aukeaa sinusta poispäin. E avaa ja sulkee.',xp:10,ok:()=>anyP(p=>bt(p.t)==='ovi')},
  {id:'katto',t:'Laita katto',d:'Olkikatto pitää sateen ja lumen pois. Katon alla voit levätä.',xp:10,ok:()=>anyP(p=>PIECES[p.t].roof)},
  {id:'nuotio',t:'Sytytä nuotio',d:'Rakenna nuotio (kiveä ja puuta) ja lisää siihen puuta E:llä.',xp:10,ok:()=>anyP(p=>isFirePiece(p.t)&&p.data.fuel>0)},
  {id:'lepo',t:'Lepää tulen ääressä',d:'Seiso nuotion ja katon alla noin 12 sekuntia, niin saat Levännyt-tilan.',xp:15,ok:()=>flags.rested||P.buffs.levannyt},
  {id:'marjat',t:'Poimi kolme kasvia',d:'Marjat ja sienet kasvavat metsissä. Paina E niiden luona.',xp:10,ok:()=>cnt('picked')>=3},
  {id:'paista',t:'Metsästä ja paista lihaa',d:'Peurat pakenevat – hiivi lähelle tai käytä keihästä tai jousta. Paista liha nuotiolla (E) ja ota se ajoissa.',xp:20,ok:()=>invCount('paisti')||invCount('varras')||flags.ate||cnt('cooked')>0},
  {id:'sanky',t:'Rakenna sänky',d:'Sänky (puuta ja nahkaa) asettaa herätyspaikan ja antaa nukkua yöllä.',xp:15,ok:()=>anyP(p=>p.t==='sanky')},
  {id:'arkku',t:'Rakenna arkku',d:'Arkku säilyttää tavaroita. Sitä voi laajentaa kehitysnapista.',xp:10,ok:()=>anyP(p=>PIECES[p.t].store)},
  {id:'kupari',t:'Etsi kuparia',d:'Valmista piikivihakku työpenkillä (piikiveä löytyy rannoilta) ja louhi oransseja kupariesiintymiä metsissä ja vuorten juurella.',xp:20,ok:()=>invCount('malmi')||invCount('kupari')||anyP(p=>p.t==='ahjo')},
  {id:'sulata',t:'Sulata ja takoa',d:'Rakenna sulatusuuni, sulata malmi kupariksi ja rakenna ahjo.',xp:30,ok:()=>anyP(p=>p.t==='ahjo')},
  {id:'varusta',t:'Varustaudu',d:'Takoa kuparimiekka tai kuparipanssari ahjolla. Nuija on hyvä kalmoja vastaan.',xp:30,ok:()=>invCount('miekka')||invCount('kuparipanssari')||invCount('kuparikilpi')},
  {id:'vihut',t:'Kaada kymmenen vihollista',d:'Kaikki kaadetut eläimet ja viholliset lasketaan.',xp:20,ok:()=>cnt('kills')>=10},
  {id:'jousi',t:'Ammu jousella',d:'Valmista jousi ja nuolia. Pidä hiiren vasenta pohjassa ja päästä irti.',xp:15,ok:()=>cnt('shots')>=5},
  {id:'laajenna',t:'Laajenna reppua',d:'Repun vieressä on päivityspainike (nahkaa ja puuta).',xp:20,ok:()=>P.packLv>=1},
  {id:'kivirak',t:'Rakenna kivestä',d:'Kiviseinät, kivilattiat ja kivikatot kestävät paljon. Kivikatot ovat omassa välilehdessään.',xp:15,ok:()=>anyP(isStone)},
  {id:'grilli',t:'Rakenna grillinuotio',d:'Grillitelineessä on neljä paikkaa ruoalle. Ota ruoka ajoissa – ylipaistettu muuttuu hiileksi.',xp:20,ok:()=>anyP(p=>p.t==='grilli')},
  {id:'rauta',t:'Löydä rautaa',d:'Rautasuonet ovat vuoristossa. Tarvitset kuparihakun.',xp:30,ok:()=>flags.seen&&(flags.seen.rautamalmi||flags.seen.rauta)},
  {id:'kivet',t:'Hae kolme hiidenkiveä',d:'Hautakumpu on lounaassa kalmanummella. Ota soihtu mukaan.',xp:40,ok:()=>invCount('hiidenkivi')>=3||boss||flags.boss},
  {id:'vartija',t:'Herätä Kalmanvartija',d:'Kalmankehä on nummen eteläreunalla. Aseta kivet alttarille ja voita vartija.',xp:100,ok:()=>flags.boss},
  {id:'vapaa',t:'Hiidenmaa on vapaa',d:'Jatka rakentamista ja tutkimista omaan tahtiisi.',xp:0,ok:()=>false},
];
// Vanhat tallennukset (flags.gv puuttuu) käyttivät 11 tavoitteen listaa: muunnetaan indeksi ja annetaan jo ansaittu XP.
const OLD_GOALS=['poimi','kirves','vasara','lattia','paista','kupari','sulata','varusta','kivet','vartija','vapaa'];
function migrateProgress(){fixFlags();
  if(!flags.gv){const id=OLD_GOALS[Math.min(flags.goal||0,OLD_GOALS.length-1)],ni=Math.max(0,GOALS.findIndex(g=>g.id===id));
    if(!flags.xp)for(let i=0;i<ni;i++)flags.xp+=GOALS[i].xp;flags.goal=ni;flags.gv=2;if(flags.boss)flags.xp+=60;}
  recalcBon();}
let goalShown=-1;
function updateGoals(){fixFlags();
  while(flags.goal<GOALS.length-1&&GOALS[flags.goal].ok()){const g=GOALS[flags.goal];flags.goal++;msg('Tavoite saavutettu!','loot');sfx('craft');addXp(g.xp,g.t);}
  checkAch();
  if(goalShown!==flags.goal){goalShown=flags.goal;const g=GOALS[flags.goal];$('#goalT').textContent=g.t;$('#goalD').textContent=g.d;if(g.id==='kivet')flags.disc.barrow=1;if(g.id==='vartija')flags.disc.circle=1;}}

/* ---------------- EDISTYMISPANEELI (J) ---------------- */
function renderProg(){const li=lvlInfo(),el=$('#progP');
  const done=ACH.filter(a=>flags.ach[a.id]).length;
  el.querySelector('#progBody').innerHTML=`<div class="lv"><b>Taso ${li.L}</b><span class="num note">${li.need?`${li.xp} / ${li.need} XP`:'huipputaso'}</span><div class="track"><i style="width:${li.need?li.xp/li.need*100:100}%"></i></div></div>
  <div class="cols"><div><h3>Saavutukset ${done}/${ACH.length}</h3>${ACH.map(a=>{const ok=!!flags.ach[a.id],[c,m]=a.pr();return `<div class="ach ${ok?'ok':''}"><b>${ok?'✔ ':''}${a.n}</b><span>${a.d} ${ok?'':`(${Math.min(c,m)}/${m})`}</span><em>${bonText(a.b)}</em></div>`;}).join('')}</div>
  <div><h3>Tavoitteet</h3>${GOALS.map((g,i)=>`<div class="ach ${i<flags.goal?'ok':i===flags.goal?'cur':'fut'}"><b>${i<flags.goal?'✔ ':i===flags.goal?'▶ ':''}${g.t}</b>${i===flags.goal?`<span>${g.d}</span>`:''}</div>`).join('')}
  <h3 style="margin-top:12px">Taso avaa</h3>${RECIPES.filter(r=>r.lvl).map(r=>`<div class="ach ${playerLevel()>=r.lvl?'ok':'fut'}"><b>Taso ${r.lvl}: ${ITEMS[r.id].n}${ITEMS[r.id].rare?' ★':''}</b></div>`).join('')}</div></div>`;}
