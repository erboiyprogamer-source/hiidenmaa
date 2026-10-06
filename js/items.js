/* Hiidenmaa – items.js
   Esineet (ITEMS), reseptit (RECIPES) ja esinekuvakkeet */
'use strict';

/* ---------------- ITEMS ---------------- */
const ITEMS={
  puu:{n:'Puu',w:2,s:50,c:'#9a6234',d:'Rakennusten, työkalujen ja polttopuun perusaine.'},
  kivi:{n:'Kivi',w:2,s:50,c:'#8f8d86',d:'Tukevaa rakennuskiveä.'},
  piikivi:{n:'Piikivi',w:1,s:50,c:'#4d535c',d:'Teräväsärmäistä kiveä rantojen ja järvien reunoilta.'},
  pihka:{n:'Pihka',w:.5,s:50,c:'#dc9d2c',d:'Tahmeaa ja palavaa. Kuusista ja sammalhiisiltä.'},
  nahka:{n:'Nahka',w:1,s:50,c:'#a06d45',d:'Eläinten vuota. Vaatteisiin ja jänteisiin.'},
  luu:{n:'Luunsiru',w:.5,s:50,c:'#e7e1cf',d:'Kalmojen jäänteitä.'},
  malmi:{n:'Kuparimalmi',w:5,s:30,c:'#b96c3d',d:'Sulata sulatusuunissa kupariksi.'},
  kupari:{n:'Kupariharkko',w:3,s:30,c:'#e0904f',d:'Ahjon tärkein aine.'},
  rautamalmi:{n:'Rautamalmi',w:6,s:30,c:'#7a5a50',d:'Vuorten syvistä suonista. Sulata sulatusuunissa raudaksi.'},
  rauta:{n:'Rautaharkko',w:4,s:30,c:'#8a96a3',d:'Kovaa ja raskasta. Parhaat työkalut ja aseet taotaan raudasta.'},
  tervaspuu:{n:'Tervaspuu',w:2.5,s:50,c:'#4a3424',d:'Aarnipuun tummaa, pihkaista puuta. Kestää kaksi kertaa tavallista puuta.'},
  jaaavain:{n:'Jääavain',w:.3,s:1,c:'#9fd8ff',d:'Kylmä, huurteinen avain rauniotalon arkusta. Aukaisee Routaportin lukon.'},
  luuavain:{n:'Luuavain',w:.3,s:1,c:'#e6e0cf',d:'Luusta veistetty avain, jonka Jäätär kantoi. Aukaisee Kalmankammion portin lukon.'},
  aarniavain:{n:'Aarniavain',w:.3,s:1,c:'#7aff9a',d:'Sammaleen peittämä vihreä avain. Aukaisee Aarnihaudan portin lukon.'},
  hiidenkivi:{n:'Hiidenkivi',w:2,s:10,c:'#7fd6cc',d:'Kylmä, sisältä hehkuva kivi. Kalmankehän alttari kaipaa kolmea.'},
  sydan:{n:'Vartijan sydän',w:3,s:1,c:'#5fe6d9',d:'Kivinen sydän, joka sykkii vielä hiljaa. Voittosi merkki.'},
  liha:{n:'Raaka liha',w:1,s:20,c:'#c9554e',food:{h:6,raw:true},d:'Paista nuotiolla. Raakana vatsa voi kääntyä.'},
  paisti:{n:'Paistettu liha',w:1,s:20,c:'#8d4b2b',food:{h:30,hp:22},d:'Täyttävää ja lämmintä.'},
  marjat:{n:'Puolukat',w:.2,s:50,c:'#c82a3c',food:{h:8,st:20},d:'Hapanta virkistystä.'},
  sieni:{n:'Herkkutatti',w:.3,s:30,c:'#c8a26b',food:{h:10,hp:6},d:'Metsän pohjalta.'},
  varras:{n:'Metsästäjän varras',w:1,s:10,c:'#b06c3a',food:{h:45,hp:35,buff:'voima'},d:'Lihaa, sieniä ja marjoja. Antaa voimaa viideksi minuutiksi.'},
  sienipaisti:{n:'Paistettu sieni',w:.3,s:30,c:'#9b6a3a',food:{h:18,hp:10},d:'Nuotiolla kypsennetty herkkutatti.'},
  hiili:{n:'Puuhiili',w:.5,s:50,c:'#2a2623',fuel:10,d:'Palaa kymmenen kertaa pidempään kuin puu. Nuotioon, sulatusuuniin ja seisoviin soihtuihin. Syntyy ylipaistetusta ruoasta tai nuotiolla puusta.'},
  nuolet:{n:'Piikivinuolet',w:.1,s:100,c:'#6d6a60',d:'Ammuksia jouselle.'},
  sulka:{n:'Metson sulka',w:.05,s:50,c:'#3a3a40',d:'Metson pyrstösulka. Sulitetut nuolet lentävät suorempaan.'},
  sulkanuolet:{n:'Sulitetut nuolet',w:.1,s:100,c:'#4a4f58',d:'Metson sulilla sulitetut nuolet: 12 % nopeampi lento, 15 % enemmän vahinkoa ja tuuli kallistaa rataa vain puolet.'},
  tulinuolet:{n:'Tulinuolet',w:.12,s:100,c:'#e8893b',d:'Pihkaan kastetut nuolet syttyvät lennossa: osuma sytyttää kohteen tuleen 5–10 sekunniksi (5 terveyttä sekunnissa). Sade ja vesi sammuttavat.'},
  kirves:{n:'Kivikirves',w:2,s:1,c:'#9a8a70',cat:'weapon',dmg:8,dt:'slash',chop:1,range:2.3,st:6,spd:.5,d:'Kaataa puita. Kelpaa hätätilassa aseeksi.'},
  kuparikirves:{n:'Kuparikirves',w:2.5,s:1,c:'#d98a4e',cat:'weapon',dmg:13,dt:'slash',chop:2,range:2.4,st:6,spd:.48,d:'Kaataa puut puolet nopeammin.'},
  nuija:{n:'Puunuija',w:3,s:1,c:'#7b5434',cat:'weapon',dmg:12,dt:'blunt',range:2.3,st:9,spd:.62,d:'Murskaava ase. Puree hyvin luuhun ja kiveen.'},
  hakku:{n:'Piikivihakku',w:3,s:1,c:'#58606b',cat:'weapon',dmg:6,dt:'pierce',pick:1,range:2.4,st:7,spd:.6,d:'Louhii lohkareita ja kupariesiintymiä.'},
  kuparihakku:{n:'Kuparihakku',w:3.5,s:1,c:'#d98a4e',cat:'weapon',dmg:9,dt:'pierce',pick:2,range:2.4,st:7,spd:.56,d:'Louhii myös rautasuonia.'},
  rautahakku:{n:'Rautahakku',w:4,s:1,c:'#8a96a3',cat:'weapon',dmg:12,dt:'pierce',pick:3,range:2.5,st:7,spd:.52,d:'Paras hakku. Louhii kaiken nopeasti.'},
  rautakirves:{n:'Rautakirves',w:3,s:1,c:'#8a96a3',cat:'weapon',dmg:18,dt:'slash',chop:3,range:2.5,st:6,spd:.46,d:'Kaataa myös aarnipuut.'},
  rautamiekka:{n:'Rautamiekka',w:2.5,s:1,c:'#b8c2cc',cat:'weapon',dmg:34,dt:'slash',range:2.7,st:8,spd:.42,d:'Pitkä ja terävä rautaterä.'},
  keihas:{n:'Piikivikeihäs',w:2,s:1,c:'#66707a',cat:'weapon',dmg:15,dt:'pierce',range:3.1,st:8,spd:.55,d:'Pitkä ulottuvuus.'},
  miekka:{n:'Kuparimiekka',w:2,s:1,c:'#e0904f',cat:'weapon',dmg:24,dt:'slash',range:2.6,st:8,spd:.44,d:'Nopea ja terävä.'},
  soihtu:{n:'Soihtu',w:1,s:1,c:'#ff9a3a',cat:'offhand',light:true,d:'Valaisee pimeässä. Pidä toisessa kädessä aseen tai työkalun rinnalla.'},
  jousi:{n:'Metsästysjousi',w:2,s:1,c:'#8a5a32',cat:'bow',dmg:16,dt:'pierce',st:4,d:'Pidä hiiren vasenta pohjassa jännittääksesi. Tarvitsee nuolia.'},
  kuokka:{n:'Kuokka',w:2.5,s:1,c:'#7a6a50',cat:'shovel',d:'Hiiren vasen nostaa maata ja poistaa multaa (palauttaa maan alkuperäiseksi). Ei rakennusten lähellä.'},
  lapio:{n:'Lapio',w:2.5,s:1,c:'#8a7a60',cat:'shovel',d:'Hiiren vasen tasoittaa maata kohti jalkojesi korkeutta ja tekee siitä multaisen ja tummemman – sillä teet polkuja (kestävyys −6). Ei rakennusten lähellä.'},
  hiidenjousi:{n:'Hiidenjousi',w:2,s:1,c:'#5fe6d9',cat:'bow',dmg:30,dt:'pierce',st:4,rare:1,d:'Hiidenkivellä vahvistettu jousi. Hyvin voimakas. (Harvinainen)'},
  hiidenmiekka:{n:'Hiidenmiekka',w:3,s:1,c:'#7fe9dd',cat:'weapon',dmg:52,dt:'slash',range:2.8,st:8,spd:.4,rare:1,d:'Vartijan sydämen ja hiidenkivien voimalla taottu terä. (Harvinainen)'},
  vasara:{n:'Vasara',w:2,s:1,c:'#7c6a52',cat:'hammer',d:'Rakennustyökalu. B avaa rakennusvalikon.'},
  kilpi:{n:'Puukilpi',w:4,s:1,c:'#8a5a32',cat:'shield',block:.6,d:'Torju hiiren oikealla. Torjunta kuluttaa kestävyyttä.'},
  kuparikilpi:{n:'Kuparikilpi',w:5,s:1,c:'#d98a4e',cat:'shield',block:.8,d:'Raskas, mutta pitää.'},
  rautakilpi:{n:'Rautakilpi',w:6,s:1,c:'#8a96a3',cat:'shield',block:.9,d:'Raskas ja luja.'},
  hiidenpanssari:{n:'Hiidenpanssari',w:9,s:1,c:'#5fe6d9',cat:'armor',arm:32,warm:1,slow:.05,rare:1,d:'Kylmästi hehkuva panssari. Paras suoja. (Harvinainen)'},
  nahkavaatteet:{n:'Nahkavaatteet',w:4,s:1,c:'#9a6a44',cat:'armor',arm:5,warm:1,d:'Suojaa yön kylmältä.'},
  kuparipanssari:{n:'Kuparipanssari',w:8,s:1,c:'#d98a4e',cat:'armor',arm:14,warm:1,slow:.06,d:'Vahva suoja, hieman raskas.'},
  rautapanssari:{n:'Rautapanssari',w:11,s:1,c:'#8a96a3',cat:'armor',arm:22,warm:1,slow:.08,d:'Paras suoja. Raskas.'},
};
// lvl = pelaajan taso, jolla ohje aukeaa (ei kenttää = alusta asti). alku:1 = Alkupeli-välilehti.
const RECIPES=[
  {id:'kirves',req:{puu:3,kivi:2},alku:1},
  {id:'vasara',req:{puu:3,kivi:1},alku:1},
  {id:'lapio',req:{puu:4,kivi:2},alku:1},
  {id:'kuokka',req:{puu:4,kivi:3},alku:1},
  {id:'nuija',req:{puu:6},alku:1},
  {id:'soihtu',req:{puu:1,pihka:1},alku:1},
  {id:'hiili',st:'nuotio',req:{puu:5},n:2,alku:1},
  {id:'kilpi',st:'tyopenkki',req:{puu:10,nahka:2},lvl:2},
  {id:'hakku',st:'tyopenkki',req:{puu:4,piikivi:5,nahka:2},lvl:2},
  {id:'keihas',st:'tyopenkki',req:{puu:5,piikivi:4,nahka:1},lvl:2},
  {id:'jousi',st:'tyopenkki',req:{puu:8,nahka:3},lvl:3},
  {id:'nuolet',st:'tyopenkki',req:{puu:2,piikivi:2},n:15,lvl:3},
  {id:'sulkanuolet',st:'tyopenkki',req:{puu:2,piikivi:2,sulka:1},n:15,lvl:4},
  {id:'tulinuolet',st:'tyopenkki',req:{puu:2,piikivi:2,pihka:1},n:15,lvl:3},
  {id:'nahkavaatteet',st:'tyopenkki',req:{nahka:8},lvl:2},
  {id:'varras',st:'nuotio',req:{paisti:1,sieni:2,marjat:3},lvl:2},
  {id:'miekka',st:'ahjo',req:{kupari:6,puu:2,nahka:2},lvl:4},
  {id:'kuparikirves',st:'ahjo',req:{kupari:4,puu:3},lvl:4},
  {id:'kuparikilpi',st:'ahjo',req:{kupari:6,puu:6},lvl:4},
  {id:'kuparipanssari',st:'ahjo',req:{kupari:12,nahka:6},lvl:5},
  {id:'kuparihakku',st:'ahjo',req:{kupari:6,puu:3},lvl:4},
  {id:'rautakirves',st:'ahjo',req:{rauta:4,puu:3},lvl:6},
  {id:'rautahakku',st:'ahjo',req:{rauta:5,puu:3},lvl:6},
  {id:'rautamiekka',st:'ahjo',req:{rauta:6,puu:2,nahka:2},lvl:7},
  {id:'rautakilpi',st:'ahjo',req:{rauta:8,puu:4},lvl:7},
  {id:'rautapanssari',st:'ahjo',req:{rauta:12,nahka:6},lvl:8},
  // Harvinaiset: aukeavat korkeilla tasoilla ja vaativat hiidenkiviä
  {id:'hiidenjousi',st:'ahjo',req:{rauta:4,hiidenkivi:2,nahka:4},lvl:10},
  {id:'hiidenmiekka',st:'ahjo',req:{rauta:10,hiidenkivi:3,sydan:1},lvl:12},
  {id:'hiidenpanssari',st:'ahjo',req:{rauta:14,hiidenkivi:4,nahka:8},lvl:14},
];
const RECIPE_BY={};RECIPES.forEach(r=>RECIPE_BY[r.id]=r);
const STATION_NAME={tyopenkki:'Työpenkki',nuotio:'Nuotio',ahjo:'Ahjo'};
// Valmistusvälilehdet: Alkupeli (alku:1) on oletus, muut ryhmitellään esineen tyypin mukaan.
const CRAFT_CATS=[['alku','Alkupeli'],['tyokalut','Työkalut'],['aseet','Aseet'],['varusteet','Varusteet'],['ruoka','Ruoka'],['muut','Muut']];
function recipeCat(r){const d=ITEMS[r.id];if(d.food)return 'ruoka';if(d.cat==='armor'||d.cat==='shield')return 'varusteet';if(d.cat==='weapon'&&(d.chop||d.pick))return 'tyokalut';if(d.cat==='shovel'||d.cat==='hammer')return 'tyokalut';if(d.cat==='weapon'||d.cat==='bow'||r.id==='nuolet'||r.id==='tulinuolet')return 'aseet';return 'muut';}

/* ---------------- ICONS ---------------- */
const ICON={};
function icon(id){
  if(ICON[id])return ICON[id];
  const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.scale(64/48,64/48);const d=ITEMS[id];g.lineCap='round';g.lineJoin='round';
  const line=(x1,y1,x2,y2,w,col)=>{g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();};
  const poly=(pts,col,out)=>{g.fillStyle=col;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();if(out){g.strokeStyle=out;g.lineWidth=1.5;g.stroke();}};
  const circ=(x,y,r,col,out)=>{g.fillStyle=col;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();if(out){g.strokeStyle=out;g.lineWidth=1.5;g.stroke();}};
  const W='#8a5a32';
  switch(id){
    case 'puu':g.save();g.translate(24,24);g.rotate(-.5);g.fillStyle='#8a5a32';g.fillRect(-16,-7,30,14);g.restore();circ(33,17,7,'#d2a46c','#5e3b1f');circ(33,17,3,'#a87a46');break;
    case 'kivi':poly([[10,32],[16,16],[30,12],[40,22],[36,36],[18,38]],'#8f8d86','#55534e');poly([[18,18],[28,15],[24,22]],'#a8a69e');break;
    case 'piikivi':poly([[12,38],[20,12],[28,20],[36,10],[34,36]],'#4d535c','#2b2f35');line(20,14,24,34,1.5,'#7a8592');break;
    case 'pihka':poly([[24,8],[34,26],[30,38],[18,38],[14,26]],'#dc9d2c','#8a5a18');circ(21,26,3,'#f6cf72');break;
    case 'nahka':poly([[10,14],[20,10],[28,13],[38,10],[40,22],[36,38],[24,34],[12,38],[8,26]],'#a06d45','#5e3b1f');break;
    case 'luu':line(14,34,34,14,6,'#e7e1cf');circ(12,34,4,'#e7e1cf');circ(16,38,4,'#e7e1cf');circ(34,10,4,'#e7e1cf');circ(38,14,4,'#e7e1cf');break;
    case 'malmi':poly([[8,32],[14,14],[30,10],[42,22],[38,38],[16,40]],'#6e6862','#3f3b37');[[18,22],[30,18],[26,30],[34,28]].forEach(p=>circ(p[0],p[1],3,'#d9874a'));break;
    case 'rautamalmi':poly([[8,32],[14,14],[30,10],[42,22],[38,38],[16,40]],'#5f5a56','#34302d');[[18,22],[30,18],[26,30],[34,28]].forEach(p=>circ(p[0],p[1],3,'#a8644e'));break;
    case 'rauta':poly([[8,32],[14,20],[40,20],[44,32]],'#8a96a3','#4a525c');poly([[14,20],[18,14],[36,14],[40,20]],'#b8c2cc');break;
    case 'tervaspuu':g.save();g.translate(24,24);g.rotate(-.5);g.fillStyle='#4a3424';g.fillRect(-16,-7,30,14);g.restore();circ(33,17,7,'#7a5638','#2a1c12');circ(33,17,3,'#5a3e28');break;
    case 'kupari':poly([[8,32],[14,20],[40,20],[44,32]],'#e0904f','#8f5326');poly([[14,20],[18,14],[36,14],[40,20]],'#f2b07a');break;
    case 'hiidenkivi':poly([[24,6],[34,20],[30,40],[18,40],[14,20]],'#7fd6cc','#2f8f86');poly([[24,10],[28,20],[24,34],[20,20]],'#c9fff8');break;
    case 'jaaavain':case 'aarniavain':case 'luuavain':{const c1=id==='jaaavain'?'#9fd8ff':id==='luuavain'?'#e6e0cf':'#7aff9a',c2=id==='jaaavain'?'#3d7fa8':id==='luuavain'?'#8a8070':'#2f8f4a';circ(15,15,9,c1,c2);circ(15,15,4,'#13110e');line(21,21,40,40,5,c1);line(33,33,38,28,4,c1);line(38,38,42,34,4,c1);line(21,21,40,40,1.5,c2);break;}
    case 'sydan':circ(18,20,9,'#5fe6d9');circ(30,20,9,'#5fe6d9');poly([[10,24],[38,24],[24,40]],'#5fe6d9');circ(20,18,3,'#d8fffb');break;
    case 'liha':case 'paisti':circ(28,22,12,d.c,'#4a2216');line(18,32,9,41,5,'#e7e1cf');circ(8,42,3.5,'#e7e1cf');if(id==='paisti')line(22,18,34,24,2,'#c47a4a');break;
    case 'marjat':[[18,20],[28,18],[22,29],[32,28],[15,31]].forEach(p=>circ(p[0],p[1],6,'#c82a3c','#6a1220'));line(22,8,24,16,2,'#5a7a2a');break;
    case 'sieni':g.fillStyle='#efe6d2';g.fillRect(20,24,8,16);poly([[8,26],[14,12],[24,8],[34,12],[40,26]],'#9b6a3a','#5e3b1f');break;
    case 'varras':line(8,40,40,8,2.5,'#c9b48a');[[16,32,'#8d4b2b'],[24,24,'#c8a26b'],[32,16,'#8d4b2b']].forEach(p=>circ(p[0],p[1],5.5,p[2]));circ(20,28,3,'#c82a3c');break;
    case 'nuolet':for(let i=0;i<3;i++){line(10+i*5,40,32+i*5,10,2,'#c9b48a');poly([[32+i*5,10],[36+i*5,6],[34+i*5,14]],'#4d535c');}break;
    case 'sulka':line(12,40,34,8,2.5,'#2a2a2e');poly([[34,8],[22,20],[16,32],[20,30],[30,18]],'#3a3a40','#1d1d22');poly([[34,8],[28,24],[22,32],[26,26],[33,16]],'#55555e');break;
    case 'sulkanuolet':for(let i=0;i<3;i++){line(10+i*5,40,32+i*5,10,2,'#c9b48a');poly([[32+i*5,10],[36+i*5,6],[34+i*5,14]],'#4d535c');poly([[10+i*5,40],[8+i*5,34],[13+i*5,36]],'#2a2a2e');}break;
    case 'tulinuolet':for(let i=0;i<3;i++){line(10+i*5,40,30+i*5,13,2,'#c9b48a');circ(33+i*5,9,4,'#ff7a1a');circ(34+i*5,8,2.2,'#ffd36a');}break;
    case 'hiili':poly([[10,34],[16,18],[28,14],[38,24],[34,38],[16,40]],'#2a2623','#0f0d0c');poly([[18,22],[26,18],[24,26]],'#4a4540');circ(30,30,2.5,'#ff7a2a');break;
    case 'sienipaisti':g.fillStyle='#e4d4b2';g.fillRect(20,24,8,16);poly([[8,26],[14,12],[24,8],[34,12],[40,26]],'#7a4a22','#3a2210');break;
    case 'kilpi':case 'kuparikilpi':case 'rautakilpi':{const T={kilpi:['#8a5a32','#b88652','#6e7680','#3a3f45'],kuparikilpi:['#c87a3e','#f0a868','#e9b07a','#7a4318'],rautakilpi:['#8c97a4','#c3cdd8','#d6dee8','#454d58']}[id];
      circ(24,24,19.5,T[3]);circ(24,24,17.5,T[0]);
      g.save();g.beginPath();g.arc(24,24,17,0,TAU);g.clip();
      if(id==='kilpi'){for(let x=8;x<42;x+=6){g.fillStyle=(x/6|0)%2?'#7a4d28':'#97663a';g.fillRect(x,4,6,40);}for(let y of[16,32])line(4,y,44,y,2.5,T[2]);}
      else{const gr=g.createRadialGradient(18,16,2,24,24,20);gr.addColorStop(0,T[1]);gr.addColorStop(1,T[0]);g.fillStyle=gr;g.fillRect(0,0,48,48);
        line(24,5,24,43,5,T[2]);line(5,24,43,24,5,T[2]);for(let a=0;a<8;a++){const x=24+Math.cos(a*.785+.39)*12,y=24+Math.sin(a*.785+.39)*12;circ(x,y,1.5,T[3]);}}
      g.restore();g.strokeStyle=T[2];g.lineWidth=3;g.beginPath();g.arc(24,24,17.5,0,TAU);g.stroke();
      circ(24,24,7,T[3]);circ(24,24,5.5,T[2]);circ(22.5,22.5,2,'#fff8');for(let a=0;a<12;a++)circ(24+Math.cos(a*.5236)*17.5,24+Math.sin(a*.5236)*17.5,1.1,T[3]);break;}
    case 'nahkavaatteet':case 'kuparipanssari':case 'rautapanssari':case 'hiidenpanssari':poly([[14,10],[20,8],[24,12],[28,8],[34,10],[42,18],[36,22],[34,40],[14,40],[12,22],[6,18]],d.c,'#3b2a1a');if(id==='kuparipanssari'||id==='rautapanssari'||id==='hiidenpanssari')for(let y=16;y<38;y+=6)line(16,y,32,y,1.5,id==='rautapanssari'?'#4a525c':'#8f5326');break;
    case 'jousi':case 'hiidenjousi':{const col=id==='jousi'?'#8a5a32':'#5fe6d9';g.strokeStyle='#3b2a1a';g.lineWidth=6;g.beginPath();g.arc(38,24,22,Math.PI*.62,Math.PI*1.38);g.stroke();g.strokeStyle=col;g.lineWidth=4;g.beginPath();g.arc(38,24,22,Math.PI*.62,Math.PI*1.38);g.stroke();
      line(25,6,25,42,1.2,'#f1ecdc');line(15,24,38,24,1.6,'#c9b48a');poly([[38,24],[33,21],[33,27]],'#8f8d86');for(const y of[17,31])line(17,y,19,y,2,'#3b2a1a');if(id!=='jousi'){circ(16,24,3,'#c9fff8');}break;}
    default:{
      // Työkalut piirretään vinoon: origo kahvan alapäässä, +x kahvaa pitkin ylös oikealle, +y kohtisuoraan (alas oikealle).
      const tier=/rauta/.test(id)?['#aab6c4','#e4ecf5','#4a525c']:/kupari|^miekka$/.test(id)?['#e0904f','#ffc58f','#8f5326']:/hiiden/.test(id)?['#5fe6d9','#d2fffb','#1f7f78']:['#8f8d86','#c7c5bd','#4e4c48'];
      const wd=(len,w)=>{const gr=g.createLinearGradient(0,-w/2,0,w/2);gr.addColorStop(0,'#b07a46');gr.addColorStop(1,'#5a3a1c');g.fillStyle=gr;g.fillRect(0,-w/2,len,w);g.strokeStyle='#2e1d0e';g.lineWidth=1;g.strokeRect(0,-w/2,len,w);};
      const metal=(pts)=>{const gr=g.createLinearGradient(0,-8,0,10);gr.addColorStop(0,tier[1]);gr.addColorStop(.5,tier[0]);gr.addColorStop(1,tier[2]);g.fillStyle=gr;g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fill();g.strokeStyle='#1f1a16';g.lineWidth=1.3;g.stroke();};
      g.save();g.translate(6,43);g.rotate(-Math.PI/4);
      if(/kirves/.test(id)){wd(46,4.4);metal([[29,-3],[44,-4],[46,2],[43,13],[35,9],[29,3]]);line(44,-3,45,12,1.4,'#fff');for(const x of[30,32])line(x,-3,x,3,1.5,'#2e1d0e');}
      else if(/hakku/.test(id)){wd(46,4.4);g.lineCap='butt';for(const [w,c] of[[8,'#1f1a16'],[5.5,tier[0]]]){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(35,-17);g.quadraticCurveTo(49,0,35,17);g.stroke();}
        poly([[33,-19],[38,-17],[36,-13]],tier[1]);poly([[33,19],[38,17],[36,13]],tier[1]);g.fillStyle='#3a3a3a';g.fillRect(38,-3.5,6,7);}
      else if(id==='lapio'){wd(37,4);g.fillStyle='#6b4527';g.fillRect(-1,-7,5,14);g.strokeStyle='#2e1d0e';g.strokeRect(-1,-7,5,14);metal([[33,-8],[43,-9],[50,0],[43,9],[33,8]]);line(36,0,47,0,1.5,'#fff9');}
      else if(id==='kuokka'){wd(42,4);metal([[34,0],[38,-1],[40,14],[34,16],[32,3]]);line(36,2,37,14,1.2,'#fff8');}
      else if(id==='keihas'){wd(40,3.2);metal([[38,0],[41,-5],[52,0],[41,5]]);line(38,0,51,0,1,'#fff9');for(let k=0;k<3;k++)line(33+k*2,-3,35+k*2,3,1.5,'#7a2a22');}
      else if(id==='nuija'){wd(30,5);g.fillStyle='#7a5230';g.strokeStyle='#2e1d0e';g.lineWidth=1.3;g.beginPath();g.moveTo(26,-2.5);g.lineTo(34,-5);g.quadraticCurveTo(48,-10,48,0);g.quadraticCurveTo(48,10,34,5);g.lineTo(26,2.5);g.closePath();g.fill();g.stroke();for(const [x,y] of[[38,-5],[42,0],[38,5],[34,0]])circ(x,y,1.6,'#9a9a92');}
      else if(id==='vasara'){wd(40,4.4);g.fillStyle='#7c6a52';g.strokeStyle='#1f1a16';g.lineWidth=1.3;g.fillRect(36,-10,9,20);g.strokeRect(36,-10,9,20);g.fillStyle='#4b4338';g.fillRect(36,-10,2.5,20);g.fillRect(42.5,-10,2.5,20);line(39,-8,39,8,1.2,'#fff6');}
      else if(/miekka/.test(id)){const gr=g.createLinearGradient(0,-3,0,3);gr.addColorStop(0,tier[1]);gr.addColorStop(1,tier[2]);g.fillStyle=gr;g.beginPath();g.moveTo(13,-3);g.lineTo(40,-3);g.lineTo(49,0);g.lineTo(40,3);g.lineTo(13,3);g.closePath();g.fill();g.strokeStyle='#1f1a16';g.lineWidth=1.2;g.stroke();line(14,0,40,0,1,'#fff8');
        g.fillStyle='#8f5326';g.fillRect(10,-8,4,16);g.strokeRect(10,-8,4,16);g.fillStyle='#4a2f18';g.fillRect(1,-2,9,4);circ(0,0,3.2,'#c9a24a','#3b2a1a');for(const x of[3,5.5,8])line(x,-2,x,2,1,'#1f1a16');}
      else if(id==='soihtu'){wd(38,4.6);circ(42,0,8,'#ff7a1a');circ(44,0,5.5,'#ffb43a');circ(46,0,3,'#fff0a8');}
      else if(id==='vasara_'){}
      else{wd(44,4);metal([[30,-4],[44,-4],[44,4],[30,4]]);}
      g.restore();
    }
  }
  return ICON[id]=c.toDataURL();
}
