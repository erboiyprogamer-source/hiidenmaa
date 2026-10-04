/* Hiidenmaa – pieces.js
   Rakennusosat (PIECES): mitat, törmäyslaatikot, mallit, lisäys ja poisto */
'use strict';

/* ---------------- BUILD PIECES ---------------- */
// Rakennusmitat. Pelaaja on 1,8 m pitkä, joten oviaukon on oltava selvästi korkeampi.
const G=2.5;      // rakennusruudukon koko (m): lattia G×G, seinän leveys G
const WH=2.6;     // seinän ja pylvään korkeus (m)
const DOOR_W=1.7, DOOR_H=2.3; // oviaukon leveys ja korkeus (m)
const BENCH_R=20; // työpenkin rakennusalueen säde (m)
const STEP_N=6;   // portaiden askelmat: WH/STEP_N pitää olla selvästi alle STEPUP (0,55 m)
// cat = valikkovälilehti, alku:1 = näkyy myös Alkupeli-välilehdellä. base = muoto otetaan toisesta osasta, stone:1 = kivimateriaali.
const PIECES={
  lattia:{n:'Puulattia',req:{puu:2},hp:120,snap:'floor',cat:'seinat',alku:1},
  seina:{n:'Puuseinä',req:{puu:2},hp:150,snap:'wall',cat:'seinat',alku:1},
  ikkunaseina:{n:'Ikkunaseinä',req:{puu:2},hp:130,snap:'wall',cat:'seinat'},
  seina_k2:{n:'Puoliseinä pysty',req:{puu:1},hp:80,snap:'wall',cat:'seinat',dim:[G/2,WH]},
  seina_k4:{n:'Neljäsosaseinä pysty',req:{puu:1},hp:50,snap:'wall',cat:'seinat',dim:[G/4,WH]},
  seina_m2:{n:'Puoliseinä vaaka',req:{puu:1},hp:80,snap:'wall',cat:'seinat',dim:[G,WH/2]},
  seina_m4:{n:'Neljäsosaseinä vaaka',req:{puu:1},hp:50,snap:'wall',cat:'seinat',dim:[G,WH/4]},
  tervaslattia:{n:'Tervaslattia',req:{tervaspuu:2},hp:240,snap:'floor',cat:'seinat'},
  tervasseina:{n:'Tervasseinä',req:{tervaspuu:2},hp:300,snap:'wall',cat:'seinat'},
  ovi:{n:'Puuovi',req:{puu:4},hp:130,snap:'wall',cat:'seinat',alku:1},
  vinoseina:{n:'Vinoseinä',req:{puu:1},hp:90,snap:'wall',cat:'seinat',flip:1},
  kolmio:{n:'Päätykolmio',req:{puu:1},hp:90,snap:'wall',cat:'seinat',flip:1},
  katto:{n:'Olkikatto',req:{puu:2},hp:100,snap:'cell',cat:'katot',alku:1,roof:1},
  katto_loiva:{n:'Loiva olkikatto',req:{puu:2},hp:100,snap:'cell',cat:'katot',roof:1},
  harjakatto:{n:'Harjakatto',req:{puu:3},hp:130,snap:'cell',cat:'katot',roof:1},
  palkki:{n:'Palkki',req:{puu:1},hp:70,snap:'wall',cat:'palkit',poses:5},
  palkki2:{n:'Iso palkki',req:{puu:2},hp:130,snap:'wall',cat:'palkit',span2:1,poses:5},
  pylvas:{n:'Pylväs',req:{puu:1},hp:120,snap:'free',cat:'palkit',col:[.3,WH]},
  pylvas_ohut:{n:'Ohut pylväs',req:{puu:1},hp:70,snap:'free',cat:'palkit',col:[.16,WH]},
  pylvas_lyhyt:{n:'Lyhyt pylväs',req:{puu:1},hp:80,snap:'free',cat:'palkit',col:[.3,WH/2]},
  pylvas_pitka:{n:'Pitkä pylväs',req:{puu:2},hp:160,snap:'free',cat:'palkit',col:[.3,2*WH]},
  portaat:{n:'Raput',req:{puu:3},hp:120,snap:'cell',cat:'portaat'},
  portaat_ontelo:{n:'Portaat',req:{puu:4},hp:110,snap:'cell',cat:'portaat',poses:3},
  tikkaat:{n:'Tikkaat',req:{puu:2},hp:60,snap:'wall',cat:'portaat',poses:3},
  aita:{n:'Paaluaita',req:{puu:4},hp:260,snap:'wall',cat:'puolustus',mobProof:1},
  soihtuteline:{n:'Seisova soihtu',req:{puu:1,pihka:1},hp:50,snap:'free',cat:'valo',alku:1},
  tyopenkki:{n:'Työpenkki',req:{puu:10},hp:200,snap:'free',noBench:1,cat:'tyopisteet',alku:1},
  nuotio:{n:'Nuotio',req:{kivi:5,puu:2},hp:80,snap:'free',noBench:1,cat:'tyopisteet',alku:1},
  grilli:{n:'Grillinuotio',req:{kivi:6,puu:4,kupari:2},hp:100,snap:'free',noBench:1,cat:'tyopisteet'},
  sulatin:{n:'Sulatusuuni',req:{kivi:20,puu:4},hp:300,snap:'free',cat:'tyopisteet'},
  ahjo:{n:'Ahjo',req:{kivi:10,kupari:6,puu:4},hp:300,snap:'free',cat:'tyopisteet'},
  sanky:{n:'Sänky',req:{puu:8,nahka:4},hp:100,snap:'free',cat:'kalusto',alku:1},
  arkku:{n:'Arkku',req:{puu:10},hp:120,snap:'free',cat:'kalusto',alku:1,store:16},
  tynnyri:{n:'Tynnyri',req:{puu:6},hp:90,snap:'free',cat:'kalusto',store:12},
  kiviseina:{n:'Kiviseinä',req:{kivi:5},hp:500,snap:'wall',cat:'kivi',alku:1},
  kivilattia:{n:'Kivilattia',req:{kivi:3},hp:400,snap:'floor',cat:'kivi',base:'lattia',stone:1},
  kiviikkuna:{n:'Kiviikkuna',req:{kivi:5},hp:420,snap:'wall',cat:'kivi',base:'ikkunaseina',stone:1},
  kiviovi:{n:'Kiviovi',req:{kivi:6,puu:2},hp:350,snap:'wall',cat:'kivi',base:'ovi',stone:1},
  kivipylvas:{n:'Kivipylväs',req:{kivi:2},hp:300,snap:'free',cat:'kivi',base:'pylvas',stone:1},
  kivipalkki:{n:'Kivipalkki',req:{kivi:2},hp:250,snap:'wall',cat:'kivi',base:'palkki',stone:1},
  kiviraput:{n:'Kiviraput',req:{kivi:6},hp:350,snap:'cell',cat:'kivi',base:'portaat',stone:1},
  kiviportaat_ontelo:{n:'Kivinen portaikko',req:{kivi:5},hp:300,snap:'cell',cat:'kivi',base:'portaat_ontelo',stone:1},
  kivitikkaat:{n:'Kivitikkaat',req:{kivi:3},hp:200,snap:'wall',cat:'kivi',base:'tikkaat',stone:1},
  kivi_k2:{n:'Kivipuoliseinä pysty',req:{kivi:3},hp:250,snap:'wall',cat:'kivi',base:'seina_k2',stone:1},
  kivi_k4:{n:'Kivineljäsosaseinä pysty',req:{kivi:2},hp:150,snap:'wall',cat:'kivi',base:'seina_k4',stone:1},
  kivi_m2:{n:'Kivipuoliseinä vaaka',req:{kivi:3},hp:250,snap:'wall',cat:'kivi',base:'seina_m2',stone:1},
  kivi_m4:{n:'Kivineljäsosaseinä vaaka',req:{kivi:2},hp:150,snap:'wall',cat:'kivi',base:'seina_m4',stone:1},
  kivipalkki2:{n:'Iso kivipalkki',req:{kivi:4},hp:400,snap:'wall',cat:'kivi',base:'palkki2',stone:1},
  kivipylvas_ohut:{n:'Ohut kivipylväs',req:{kivi:1},hp:150,snap:'free',cat:'kivi',base:'pylvas_ohut',stone:1},
  kivipylvas_lyhyt:{n:'Lyhyt kivipylväs',req:{kivi:1},hp:200,snap:'free',cat:'kivi',base:'pylvas_lyhyt',stone:1},
  kivipylvas_pitka:{n:'Pitkä kivipylväs',req:{kivi:4},hp:400,snap:'free',cat:'kivi',base:'pylvas_pitka',stone:1},
  kivivinoseina:{n:'Kivivinoseinä',req:{kivi:2},hp:250,snap:'wall',cat:'kivi',base:'vinoseina',stone:1,flip:1},
  kivikolmio:{n:'Kivinen päätykolmio',req:{kivi:2},hp:250,snap:'wall',cat:'kivi',base:'kolmio',stone:1,flip:1},
  kiviarkku:{n:'Kiviarkku',req:{kivi:8},hp:300,snap:'free',cat:'kivi',base:'arkku',stone:1},
  kivitynnyri:{n:'Kivitynnyri',req:{kivi:5},hp:250,snap:'free',cat:'kivi',base:'tynnyri',stone:1},
  kivikatto:{n:'Kivikatto',req:{kivi:4},hp:300,snap:'cell',cat:'kivikatot',roof:1,base:'katto',stone:1},
  kivikatto_loiva:{n:'Loiva kivikatto',req:{kivi:4},hp:300,snap:'cell',cat:'kivikatot',roof:1,base:'katto_loiva',stone:1},
  kiviharjakatto:{n:'Kiviharjakatto',req:{kivi:5},hp:340,snap:'cell',cat:'kivikatot',roof:1,base:'harjakatto',stone:1},
};
const bt=t=>PIECES[t]&&PIECES[t].base||t;
const isFirePiece=t=>t==='nuotio'||t==='grilli';
// Tulen jäljellä oleva palamisaika prosentteina täydestä (FUEL_MAX yksikköä × 90 s); yli 50 % ei voi lisätä.
// 100 % = palamisaika heti viimeisen polttoaineen lisäyksen jälkeen (p.data.full, s). fireRem/torchRem = jäljellä olevat sekunnit.
const fireRem=p=>Math.max(0,p.data.fuel*90-p.data.burn),torchRem=p=>Math.max(0,p.data.burn);
const pctOf=(rem,p)=>Math.max(0,Math.min(100,Math.round(rem/Math.max(1,p.data.full||rem||1)*100)));
const firePct=p=>pctOf(fireRem(p),p),torchPct=p=>pctOf(torchRem(p),p);
const fuelText=(rem,pct)=>`${pct}/100 · ${(rem/60).toFixed(1).replace('.',',')} min`;
function markFull(p){p.data.full=p.t==='soihtuteline'?torchRem(p):fireRem(p);}
const FUEL_MAX=40,COOKABLE={liha:'paisti',sieni:'sienipaisti'};
for(const d of Object.values(PIECES))if(d.base){const b=PIECES[d.base];for(const k of ['poses','flip','span2','noBench','store','col','dim'])if(d[k]===undefined&&b[k]!==undefined)d[k]=b[k];}
const BUILD_CATS=[['alku','Alkupeli'],['seinat','Seinät ja lattiat'],['katot','Katot'],['palkit','Palkit ja pylväät'],['portaat','Portaat ja tikkaat'],['kalusto','Kalusto'],['tyopisteet','Työpisteet'],['valo','Valo'],['puolustus','Puolustus'],['kivi','Kivirakennus'],['kivikatot','Kivikatot']];
// Portaiden geometria asennon mukaan: 0 tavallinen, 1 jyrkkä (puolet syvyydestä), 2 loiva (puolet korkeudesta).
function stairGeom(f){return f===1?{run:G/2,rise:WH}:f===2?{run:G,rise:WH/2}:{run:G,rise:WH};}
const BEAM_TH=t=>t==='palkki'?.22:.3,BEAM_L=t=>t==='palkki'?G:2*G;
// local AABBs: [cx,cy,cz,w,h,d]
function pieceBoxes(t,f=0){const def=PIECES[t];t=bt(t);if(def.dim)return[[0,def.dim[1]/2,0,def.dim[0],def.dim[1],.2]];if(def.col)return[[0,def.col[1]/2,0,def.col[0],def.col[1],def.col[0]]];switch(t){
  case 'lattia':case 'tervaslattia':return[[0,-.1,0,G,.2,G]];
  case 'seina':case 'tervasseina':return[[0,WH/2,0,G,WH,.2]];
  case 'kiviseina':return[[0,WH/2,0,G,WH,.36]];
  case 'aita':return[[0,.8,0,G,1.6,.4]];
  case 'ovi':{const pw=(G-DOOR_W)/2,px=DOOR_W/2+pw/2;return[[-px,WH/2,0,pw,WH,.22],[px,WH/2,0,pw,WH,.22],[0,(DOOR_H+WH)/2,0,G,WH-DOOR_H,.22],[0,(DOOR_H-.05)/2,0,DOOR_W,DOOR_H-.05,.12,'door']];}
  case 'katto':case 'katto_loiva':{const n=8,d=G/n,rise=t==='katto'?G:G/2,out=[];for(let i=0;i<n;i++){const top=rise/n*(i+1),bot=Math.max(0,top-.3);out.push([0,(top+bot)/2,G/2-d*(i+.5),G,top-bot,d]);}return out;}
  case 'harjakatto':{const n=4,d=G/8,out=[];for(let i=0;i<n;i++){const top=d*(i+1),bot=Math.max(0,top-.3),zc=G/2-d*(i+.5);out.push([0,(top+bot)/2,zc,G,top-bot,d]);out.push([0,(top+bot)/2,-zc,G,top-bot,d]);}return out;}
  // Vinoseinä: suorakulmainen kolmio G × WH. Päätykolmio: tasakylkinen G × G/2. f: bitti0 = peilaus, bitti1 = ylösalaisin.
  case 'vinoseina':case 'kolmio':{const tri=t==='kolmio',h=tri?G/2:WH,n=6,w=G/n,out=[];for(let j=0;j<n;j++){const u=(j+.5)/n,jj=(f&1)?n-1-j:j,hj=tri?h*(1-Math.abs(2*u-1)):h*(1-(jj+.5)/n),cy=(f&2)?h-hj/2:hj/2;out.push([-G/2+w*(j+.5),cy,0,w,hj,.2]);}return out;}
  case 'ikkunaseina':{const ww=1.1,y0=.95,y1=2.05,pw=(G-ww)/2,px=ww/2+pw/2;return[[-px,WH/2,0,pw,WH,.2],[px,WH/2,0,pw,WH,.2],[0,y0/2,0,ww,y0,.2],[0,(y1+WH)/2,0,ww,WH-y1,.2]];}
  // Palkki: asento f 0–4 = kallistus 0, 22,5, 45, 67,5, 90° (nousee +x-suuntaan). Kallistettu palkki jaetaan paloihin.
  case 'palkki':case 'palkki2':{const L=BEAM_L(t),th=BEAM_TH(t),a=(f%5)*Math.PI/8;if(!a)return[[0,th/2,0,L,th,th]];
    const n=Math.max(1,Math.ceil(L/.4)),l=L/n,c=Math.cos(a),sn=Math.sin(a),y0=L/2*sn+th/2*c,out=[];
    for(let k=0;k<n;k++){const sp=-L/2+l*(k+.5);out.push([sp*c,y0+sp*sn,0,l*c+th*sn,l*sn+th*c,th]);}return out;}
  // Tikkaat: asento f 0–2 = pysty, nojaa 15°, nojaa 30° (yläpää kallistuu taaksepäin -z). Pituus säädetään niin, että yläpää on aina WH:n korkeudella.
  case 'tikkaat':{const a=(f%3)*Math.PI/12;if(!a)return[[0,WH/2,0,.8,WH,.1]];const L=WH/Math.cos(a),n=Math.ceil(L/.4),l=L/n,c=Math.cos(a),sn=Math.sin(a),out=[];
    for(let k=0;k<n;k++){const s=l*(k+.5);out.push([0,s*c,-s*sn,.8,l*c+.1*sn,l*sn+.1*c]);}return out;}
  case 'portaat_ontelo':{const gm=stairGeom(f%3),d=gm.run/STEP_N,h=gm.rise/STEP_N,out=[];for(let i=0;i<STEP_N;i++)out.push([0,h*(i+1)-.05,G/2-d/2-i*d,G,.1,d]);return out;}
  case 'tynnyri':return[[0,.5,0,.9,1,.9]];
  case 'portaat':{const d=G/STEP_N,h=WH/STEP_N,out=[];for(let i=0;i<STEP_N;i++)out.push([0,h*(i+1)/2,G/2-d/2-i*d,G,h*(i+1),d]);return out;}
  case 'tyopenkki':return[[0,.5,0,1.8,1,.9]];
  case 'nuotio':return[[0,.15,0,1.1,.3,1.1]];
  case 'grilli':return[[0,.15,0,1.1,.3,1.1],[-.6,.55,0,.12,1.1,.12],[.6,.55,0,.12,1.1,.12]];
  case 'sulatin':return[[0,1.3,0,1.4,2.6,1.4]];
  case 'ahjo':return[[0,.55,0,1.7,1.1,1]];
  case 'sanky':return[[0,.25,0,1.1,.5,2.1]];
  case 'arkku':return[[0,.35,0,1,.7,.65]];
  case 'soihtuteline':return[[0,.9,0,.2,1.8,.2]];
  default:return[];}}
// Suorakulmainen kolmio (leveys G, korkeus h), suora kulma vasemmassa alanurkassa. R-kierto peilaa.
// Vinoseinä (suorakulmio-kolmio) ja päätykolmio (tasakylkinen). Tekstuuri-UV normalisoidaan seinän mittakaavaan
// (u = x/G, v = y/WH), jotta lankkukuvio on yhtä harva kuin seinässä.
function triMesh(t,f=0,W=MAT.wood){const kolmio=t==='kolmio',h=kolmio?G/2:WH,s=new THREE.Shape();
  if(kolmio){s.moveTo(-G/2,0);s.lineTo(G/2,0);s.lineTo(0,h);}else{s.moveTo(-G/2,0);s.lineTo(G/2,0);s.lineTo(-G/2,h);}s.closePath();
  const geo=new THREE.ExtrudeGeometry(s,{depth:.2,bevelEnabled:false});geo.translate(0,0,-.1);
  const pa=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pa.count;i++)uv.setXY(i,(pa.getX(i)+G/2)/G,pa.getY(i)/WH);
  const m=new THREE.Mesh(geo,W);m.castShadow=true;m.receiveShadow=true;
  const grp=new THREE.Group();grp.add(m);grp.scale.set((f&1)?-1:1,(f&2)?-1:1,1);grp.position.y=(f&2)?h:0;return grp;}
// Kattolappeen mesh: kaltevuus run → rise, reunus matalassa päässä (ja halutessa korkeassa). Kivikatto ilman olkireunusta.
function roofSlope(run,rise,fringeHigh,stone){const L=Math.hypot(run,rise)+.15,rg=new THREE.Group();rg.position.y=rise/2;rg.rotation.x=Math.atan2(rise,run);rg.add(bx(G+.1,.14,L,stone?MAT.stone:MAT.thatch));
  if(!stone)for(const s of fringeHigh?[-1,1]:[1]){const gm=new THREE.PlaneGeometry(G+.1,.5);gm.rotateX(-Math.PI/2);if(s>0)gm.rotateY(Math.PI);const f=new THREE.Mesh(gm,MAT.thatchFringe);f.position.set(0,.08,s*L/2);rg.add(f);}
  return rg;}
function buildPieceMesh(t,f=0){
  const g=new THREE.Group(),def=PIECES[t],W=def.stone?MAT.stone:MAT.wood;t=bt(t);
  if(def.dim){g.add(bxw(def.dim[0]+.02,def.dim[1],.2,W,0,def.dim[1]/2,0));}
  else if(def.col){g.add(bxw(def.col[0],def.col[1],def.col[0],W,0,def.col[1]/2,0));}
  else switch(t){
    case 'lattia':g.add(bxw(G,.2,G,W,0,-.1,0));break;
    case 'tervaslattia':g.add(bxw(G,.2,G,MAT.tarwood,0,-.1,0));break;
    case 'tervasseina':g.add(bxw(G+.02,WH,.2,MAT.tarwood,0,WH/2,0));break;
    case 'seina':g.add(bxw(G+.02,WH,.2,W,0,WH/2,0));break;
    case 'ikkunaseina':{const ww=1.1,y0=.95,y1=2.05,pw=(G-ww)/2,px=ww/2+pw/2;
      g.add(bxw(pw+.01,WH,.2,W,-px,WH/2,0),bxw(pw+.01,WH,.2,W,px,WH/2,0),bxw(ww,y0,.2,W,0,y0/2,0),bxw(ww,WH-y1,.2,W,0,(y1+WH)/2,0));
      g.add(bxw(ww+.12,.07,.3,W,0,y0+.035,0));break;}
    case 'kiviseina':g.add(bxw(G+.02,WH,.36,MAT.stone,0,WH/2,0));break;
    case 'aita':{const n=9;for(let i=0;i<n;i++){const x=-G/2+.12+i*(G-.24)/(n-1);g.add(bxw(.18,1.5,.18,MAT.wood,x,.75,0));const tip=new THREE.Mesh(new THREE.ConeGeometry(.12,.35,4),MAT.wood);tip.position.set(x,1.65,0);tip.castShadow=true;g.add(tip);}g.add(bxw(G,.14,.24,MAT.wood,0,.7,.08));break;}
    case 'ovi':{const pw=(G-DOOR_W)/2,px=DOOR_W/2+pw/2,DW=def.stone?W:MAT.doorwood;g.add(bxw(pw,WH,.22,DW,-px,WH/2,0),bxw(pw,WH,.22,DW,px,WH/2,0),bxw(G,WH-DOOR_H,.22,DW,0,(DOOR_H+WH)/2,0));
      const piv=new THREE.Group();piv.position.set(-DOOR_W/2,0,0);piv.add(bxw(DOOR_W,DOOR_H-.05,.1,MAT.doorwood,DOOR_W/2,(DOOR_H-.05)/2,0));
      const hm=mat(0x3a3a3a);for(const sd of[-1,1]){piv.add(bx(.05,.05,.1,hm,DOOR_W-.2,1.05,sd*.08),bx(.2,.045,.045,hm,DOOR_W-.28,1.05,sd*.125));}
      g.add(piv);g.userData.leaf=piv;break;}
    case 'katto':g.add(roofSlope(G,G,true,def.stone));break;
    case 'katto_loiva':g.add(roofSlope(G,G/2,true,def.stone));break;
    case 'harjakatto':{const a=roofSlope(G/2,G/2,false,def.stone),b2=new THREE.Group();b2.add(roofSlope(G/2,G/2,false,def.stone));a.position.z=G/4;b2.position.z=-G/4;b2.rotation.y=Math.PI;g.add(a,b2);break;}
    case 'vinoseina':case 'kolmio':g.add(triMesh(t,f,W));break;
    case 'palkki':case 'palkki2':{const L=BEAM_L(t),th=BEAM_TH(t),a=(f%5)*Math.PI/8,b=bxw(L,th,th,W,0,0,0);const grp=new THREE.Group();grp.add(b);grp.rotation.z=a;grp.position.y=L/2*Math.sin(a)+th/2*Math.cos(a);g.add(grp);break;}
    case 'tikkaat':{const a=(f%3)*Math.PI/12,L=WH/Math.cos(a),lg=new THREE.Group();for(const x of[-.35,.35])lg.add(bxw(.08,L,.08,W,x,L/2,0));for(let y=.3;y<L-.1;y+=.36)lg.add(bxw(.7,.06,.06,W,0,y,.02));lg.rotation.x=-a;g.add(lg);break;}
    case 'portaat':{const d=G/STEP_N,h=WH/STEP_N;for(let i=0;i<STEP_N;i++)g.add(bxw(G,h*(i+1),d,W,0,h*(i+1)/2,G/2-d/2-i*d));break;}
    case 'portaat_ontelo':{const gm=stairGeom(f%3),d=gm.run/STEP_N,h=gm.rise/STEP_N,L=Math.hypot(gm.run,gm.rise),al=Math.atan2(gm.rise,gm.run);
      for(let i=0;i<STEP_N;i++)g.add(bxw(G,.1,d+.02,W,0,h*(i+1)-.05,G/2-d/2-i*d));
      for(const x of[-(G/2-.07),G/2-.07]){const sb=bxw(.12,.26,L,W,x,0,0);const gr=new THREE.Group();gr.add(sb);gr.rotation.x=al;gr.position.set(0,gm.rise/2-.22,G/2-gm.run/2);g.add(gr);}break;}
    case 'tyopenkki':g.add(bxw(1.8,.14,.9,MAT.wood,0,.86,0));for(const [x,z] of [[-.8,-.35],[.8,-.35],[-.8,.35],[.8,.35]])g.add(bxw(.14,.8,.14,MAT.wood,x,.4,z));g.add(bx(.5,.08,.2,mat(0x8f8d86),.3,.98,0));g.add(bxw(.08,.06,.6,MAT.wood,-.4,.96,.1));break;
    case 'nuotio':for(let i=0;i<8;i++){const a=i/8*TAU;g.add(bx(.26,.2,.26,mat(0x6a6862),Math.cos(a)*.48,.1,Math.sin(a)*.48));}{const l1=bxw(.14,.14,.8,MAT.wood,0,.12,0);l1.rotation.y=.6;const l2=bxw(.14,.14,.8,MAT.wood,0,.16,0);l2.rotation.y=-.6;g.add(l1,l2);const f=new THREE.Mesh(new THREE.ConeGeometry(.28,.7,5),MAT.flame);f.position.y=.5;g.add(f);const f2=new THREE.Mesh(new THREE.ConeGeometry(.15,.45,5),MAT.flame2);f2.position.y=.45;g.add(f2);g.userData.flame=[f,f2];}break;
    case 'grilli':{for(let i=0;i<8;i++){const a=i/8*TAU;g.add(bx(.26,.2,.26,mat(0x6a6862),Math.cos(a)*.48,.1,Math.sin(a)*.48));}
      const l1=bxw(.14,.14,.8,MAT.wood,0,.12,0);l1.rotation.y=.6;const l2=bxw(.14,.14,.8,MAT.wood,0,.16,0);l2.rotation.y=-.6;g.add(l1,l2);
      const f=new THREE.Mesh(new THREE.ConeGeometry(.28,.7,5),MAT.flame);f.position.y=.5;g.add(f);const f2=new THREE.Mesh(new THREE.ConeGeometry(.15,.45,5),MAT.flame2);f2.position.y=.45;g.add(f2);g.userData.flame=[f,f2];
      const im=mat(0x3a3a3a,{metalness:.5,roughness:.5});g.add(bx(.1,1.1,.1,im,-.6,.55,0),bx(.1,1.1,.1,im,.6,.55,0),bx(1.3,.07,.07,im,0,1.05,0));
      const food=[];for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),new THREE.MeshStandardMaterial({color:0xc9554e,roughness:.8}));m.position.set(-.45+i*.3,.88,0);m.scale.set(1,1.3,1);m.visible=false;m.castShadow=true;g.add(m);food.push(m);g.add(bx(.015,.1,.015,im,-.45+i*.3,.98,0,false));}g.userData.food=food;break;}
    case 'sulatin':g.add(bx(1.4,1.1,1.4,MAT.stone,0,.55,0),bx(1.1,1,1.1,MAT.stone,0,1.6,0),bx(.6,.6,.6,MAT.stone,0,2.4,0));{const glow=bx(.5,.4,.05,MAT.flame,0,.5,.71,false);g.add(glow);g.userData.glow=glow;}break;
    case 'ahjo':g.add(bx(1,.8,.7,MAT.stone,-.3,.4,0),bx(.7,.25,.35,mat(0x3a3a3a,{metalness:.6,roughness:.4}),.45,.95,0),bx(.3,.6,.3,mat(0x3a3a3a),.45,.5,0));{const coal=bx(.6,.06,.4,MAT.flame,-.3,.82,0,false);g.add(coal);}break;
    case 'sanky':g.add(bxw(1.1,.3,2.1,MAT.wood,0,.15,0),bx(1,.12,1.6,mat(0x8a6a4a),0,.36,.2),bx(.8,.14,.35,mat(0xd9cbb0),0,.38,-.8),bxw(1.1,.6,.12,MAT.wood,0,.3,-1.05));break;
    case 'arkku':g.add(bxw(1,.6,.65,W,0,.3,0),bxw(1.04,.14,.69,W,0,.66,0),bx(1.06,.06,.7,mat(0x444444),0,.45,0));break;
    case 'tynnyri':{const b=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,1,12),W);b.position.y=.5;g.add(b);const mid=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.9,12),W);mid.position.y=.5;g.add(mid);
      for(const y of[.18,.82]){const r=new THREE.Mesh(new THREE.CylinderGeometry(.47,.47,.07,12),mat(0x3a3a3a));r.position.y=y;g.add(r);}break;}
    case 'soihtuteline':{g.add(bxw(.12,1.6,.12,MAT.wood,0,.8,0));const fa=bx(.2,.25,.2,MAT.flame,0,1.7,0,false),fb=bx(.1,.12,.1,MAT.flame2,0,1.84,0,false);g.add(fa,fb);g.userData.flame=[fa,fb];break;}
  }
  g.traverse(m=>{if(m.isMesh){m.castShadow=m.castShadow!==false;m.receiveShadow=true;}});
  return g;
}
let pieces=[]; const pieceRoots=[];
// Vauriotekstuurit: 3 kuntotasoa (hp > 66 %, 33–66 %, < 33 %), materiaalit välimuistissa tasoittain.
const DMGMAT=new Map();
function damageMat(base,lv){const k=base.uuid+lv;let m=DMGMAT.get(k);if(m)return m;
  const src=base.map.image,s=src.width,c=document.createElement('canvas');c.width=c.height=s;const g=c.getContext('2d');g.drawImage(src,0,0);
  const r=mulberry32(base.id*7+lv);g.fillStyle=`rgba(0,0,0,${lv===1?.12:.25})`;g.fillRect(0,0,s,s);
  g.strokeStyle='rgba(18,10,4,.85)';g.lineWidth=1.5;
  for(let i=0;i<(lv===1?3:7);i++){let x=r()*s,y=r()*s;g.beginPath();g.moveTo(x,y);for(let j=0;j<6;j++){x+=(r()-.5)*14;y+=(r()-.3)*12;g.lineTo(x,y);}g.stroke();}
  if(lv===2){g.globalCompositeOperation='destination-out';for(let i=0;i<4;i++)g.fillRect(r()*(s-8)|0,r()*(s-8)|0,4+r()*4|0,4+r()*4|0);}
  const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;
  m=new THREE.MeshStandardMaterial({map:t,color:base.color,roughness:base.roughness,alphaTest:lv===2?.5:0});DMGMAT.set(k,m);return m;}
function setPieceDamage(p){const r=p.hp/PIECES[p.t].hp,lv=r>.66?0:r>.33?1:2;if(p.dmgLv===lv)return;p.dmgLv=lv;
  p.mesh.traverse(o=>{if(!o.isMesh)return;const b=o.userData.baseMat||(o.userData.baseMat=o.material);if(b!==MAT.wood&&b!==MAT.doorwood&&b!==MAT.stone&&b!==MAT.thatch&&b!==MAT.tarwood)return;o.material=lv?damageMat(b,lv):b;});}
// Työpenkin alueen raja: maastoa seuraava oranssi nauha, näkyy vain kun vasara on kädessä.
const RING_MAT=new THREE.MeshBasicMaterial({color:0xff9a3a,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false});
function makeBenchRing(x,z){const n=128,pos=new Float32Array((n+1)*6),idx=[];
  for(let i=0;i<=n;i++){const a=i/n*TAU,px=x+Math.cos(a)*BENCH_R,pz=z+Math.sin(a)*BENCH_R,h=terrainH(px,pz);pos.set([px,h+.05,pz,px,h+.45,pz],i*6);if(i<n){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setIndex(idx);
  const m=new THREE.Mesh(geo,RING_MAT);m.visible=false;m.frustumCulled=false;scene.add(m);return m;}
function updateBenchRings(){const on=state==='play'&&!P.inDun&&curWeapon().cat==='hammer';for(const p of pieces)if(p.ring)p.ring.visible=on;}
function rotLocal(b,rot){const r=((rot%4)+4)%4;let [x,y,z,w,h,d]=b;for(let i=0;i<r;i++){const nx=z,nz=-x;x=nx;z=nz;const t=w;w=d;d=t;}return[x,y,z,w,h,d];}
// rot = kahdeksasosakierroksia (45°). Parilliset kierrot ovat suoria AABB-kiertoja; parittomat jaetaan ~.4 m paloihin.
function worldBoxes(t,x,y,z,rot,f=0){const R8=((rot%8)+8)%8,boxes=pieceBoxes(t,f);
  if(R8%2===0)return boxes.map(b=>{const[cx,cy,cz,w,h,d]=rotLocal(b,R8/2);return{minX:x+cx-w/2,maxX:x+cx+w/2,minY:y+cy-h/2,maxY:y+cy+h/2,minZ:z+cz-d/2,maxZ:z+cz+d/2,door:b[6]==='door'};});
  const ang=R8*Math.PI/4,c=Math.cos(ang),s=Math.sin(ang),out=[];
  for(const b of boxes){const[cx,cy,cz,w,h,d]=b,ax=w>=d,L=ax?w:d,n=Math.max(1,Math.ceil(L/.4)),l=L/n;
    for(let k=0;k<n;k++){const off=-L/2+l*(k+.5),lx=ax?cx+off:cx,lz=ax?cz:cz+off,sw=ax?l:w,sd=ax?d:l,wx=lx*c+lz*s,wz=-lx*s+lz*c,hw=sw*Math.abs(c)+sd*Math.abs(s),hd=sw*Math.abs(s)+sd*Math.abs(c);
      out.push({minX:x+wx-hw/2,maxX:x+wx+hw/2,minY:y+cy-h/2,maxY:y+cy+h/2,minZ:z+wz-hd/2,maxZ:z+wz+hd/2,door:b[6]==='door'});}}
  return out;}
function addPiece(t,x,y,z,rot,hp,data,f=0){
  const def=PIECES[t],mesh=buildPieceMesh(t,f);mesh.position.set(x,y,z);mesh.rotation.y=rot*Math.PI/4;
  // Päällekkäisten pintojen välkkyminen (z-fighting) estetään antamalla jokaiselle osalle hieman erilainen mittakaava.
  {let h=(Math.imul(Math.round(x*8),374761393)+Math.imul(Math.round(y*8),668265263)+Math.imul(Math.round(z*8),2147483629))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;const hs=h>>>0;mesh.scale.set(1+(hs%8)*.0006,1+((hs>>>3)%8)*.0006,1+((hs>>>6)%8)*.0006);}
  scene.add(mesh);
  const p={t,x,y,z,rot,f,hp:hp??def.hp,mesh,data:data||{},cols:[],dmgLv:0};
  mesh.userData.piece=p;mesh.traverse(m=>{m.userData.piece=p;});
  for(const b of worldBoxes(t,x,y,z,rot,f)){const c=addBox(b.minX,b.minY,b.minZ,b.maxX,b.maxY,b.maxZ,p);c.door=b.door;p.cols.push(c);}
  if(isFirePiece(t)){p.data.fuel=p.data.fuel??4;p.data.burn=p.data.burn??0;if(!p.data.full)p.data.full=Math.max(90,fireRem(p));p.data.cook=(p.data.cook||[]).map(c=>typeof c==='number'?{id:'liha',t:0,need:10}:c);lightSources.push(p.light={x,y:y+.8,z,c:0xff8c3a,i:2,on:()=>p.data.fuel>0,piece:p});}
  // Seisova soihtu palaa p.data.burn sekuntia (5 min aluksi; puu nollaa 10 min, hiili 30 min).
  if(t==='soihtuteline'){p.data.burn=p.data.burn??300;if(!p.data.full)p.data.full=Math.max(60,p.data.burn);lightSources.push(p.light={x,y:y+1.8,z,c:0xffa04a,i:1.5,on:()=>p.data.burn>0,piece:p});}
  if(t==='sulatin'){p.data.ore=p.data.ore||0;p.data.iore=p.data.iore||0;p.data.wood=p.data.wood||0;p.data.done=p.data.done||0;p.data.idone=p.data.idone||0;p.data.t=0;lightSources.push(p.light={x,y:y+.6,z,c:0xff7a2a,i:1.2,on:()=>(p.data.ore>0||p.data.iore>0)&&p.data.wood>0,piece:p});}
  if(t==='tyopenkki')p.ring=makeBenchRing(x,z);
  if(def.store){p.data.lv=p.data.lv||0;p.data.items=p.data.items||[];while(p.data.items.length<storeSlots(p))p.data.items.push(null);}
  if(bt(t)==='ovi'){p.data.open=!!p.data.open;setDoor(p,p.data.open,p.data.dir||1);}
  pieces.push(p);pieceRoots.push(mesh);setPieceDamage(p);return p;
}
function removePiece(p){scene.remove(p.mesh);if(p.ring){scene.remove(p.ring);p.ring.geometry.dispose();}for(const c of p.cols)gridRemove(c);pieces.splice(pieces.indexOf(p),1);pieceRoots.splice(pieceRoots.indexOf(p.mesh),1);if(p.light){const i=lightSources.indexOf(p.light);if(i>=0)lightSources.splice(i,1);}}
// Ovi aukeaa pelaajasta poispäin (dir ±1 = kummalle puolelle lehti kääntyy), sarana pysyy samassa kohdassa.
const STORE_UP=[null,{tervaspuu:6},{kupari:6,nahka:4}];
function storeSlots(p){return PIECES[p.t].store+8*(p.data.lv||0);}
function setDoor(p,open,dir){if(dir)p.data.dir=dir;p.data.open=open;p.mesh.userData.leaf.rotation.y=open?(p.data.dir||1)*Math.PI/2*.95:0;for(const c of p.cols)if(c.door)c.off=open;}
function nearPiece(t,x,z,r){for(const p of pieces)if(p.t===t&&dist2(p.x,p.z,x,z)<r*r)return p;return null;}
