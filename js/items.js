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
  hiidenkivi:{n:'Hiidenkivi',w:2,s:10,c:'#7fd6cc',d:'Kylmä, sisältä hehkuva kivi. Kalmankehän alttari kaipaa kolmea.'},
  sydan:{n:'Vartijan sydän',w:3,s:1,c:'#5fe6d9',d:'Kivinen sydän, joka sykkii vielä hiljaa. Voittosi merkki.'},
  liha:{n:'Raaka liha',w:1,s:20,c:'#c9554e',food:{h:6,raw:true},d:'Paista nuotiolla. Raakana vatsa voi kääntyä.'},
  paisti:{n:'Paistettu liha',w:1,s:20,c:'#8d4b2b',food:{h:30,hp:22},d:'Täyttävää ja lämmintä.'},
  marjat:{n:'Puolukat',w:.2,s:50,c:'#c82a3c',food:{h:8,st:20},d:'Hapanta virkistystä.'},
  sieni:{n:'Herkkutatti',w:.3,s:30,c:'#c8a26b',food:{h:10,hp:6},d:'Metsän pohjalta.'},
  varras:{n:'Metsästäjän varras',w:1,s:10,c:'#b06c3a',food:{h:45,hp:35,buff:'voima'},d:'Lihaa, sieniä ja marjoja. Antaa voimaa viideksi minuutiksi.'},
  nuolet:{n:'Piikivinuolet',w:.1,s:100,c:'#6d6a60',d:'Ammuksia jouselle.'},
  kirves:{n:'Kivikirves',w:2,s:1,c:'#9a8a70',cat:'weapon',dmg:8,dt:'slash',chop:1,range:2.3,st:6,spd:.5,d:'Kaataa puita. Kelpaa hätätilassa aseeksi.'},
  kuparikirves:{n:'Kuparikirves',w:2.5,s:1,c:'#d98a4e',cat:'weapon',dmg:13,dt:'slash',chop:2,range:2.4,st:6,spd:.48,d:'Kaataa puut puolet nopeammin.'},
  nuija:{n:'Puunuija',w:3,s:1,c:'#7b5434',cat:'weapon',dmg:12,dt:'blunt',range:2.3,st:9,spd:.62,d:'Murskaava ase. Puree hyvin luuhun ja kiveen.'},
  hakku:{n:'Piikivihakku',w:3,s:1,c:'#58606b',cat:'weapon',dmg:6,dt:'pierce',pick:1,range:2.4,st:7,spd:.6,d:'Louhii lohkareita ja kupariesiintymiä.'},
  keihas:{n:'Piikivikeihäs',w:2,s:1,c:'#66707a',cat:'weapon',dmg:15,dt:'pierce',range:3.1,st:8,spd:.55,d:'Pitkä ulottuvuus.'},
  miekka:{n:'Kuparimiekka',w:2,s:1,c:'#e0904f',cat:'weapon',dmg:24,dt:'slash',range:2.6,st:8,spd:.44,d:'Nopea ja terävä.'},
  soihtu:{n:'Soihtu',w:1,s:1,c:'#ff9a3a',cat:'offhand',light:true,d:'Valaisee pimeässä. Pidä toisessa kädessä aseen tai työkalun rinnalla.'},
  jousi:{n:'Metsästysjousi',w:2,s:1,c:'#8a5a32',cat:'bow',dmg:16,dt:'pierce',st:4,d:'Pidä hiiren vasenta pohjassa jännittääksesi. Tarvitsee nuolia.'},
  vasara:{n:'Vasara',w:2,s:1,c:'#7c6a52',cat:'hammer',d:'Rakennustyökalu. B avaa rakennusvalikon.'},
  kilpi:{n:'Puukilpi',w:4,s:1,c:'#8a5a32',cat:'shield',block:.6,d:'Torju hiiren oikealla. Torjunta kuluttaa kestävyyttä.'},
  kuparikilpi:{n:'Kuparikilpi',w:5,s:1,c:'#d98a4e',cat:'shield',block:.8,d:'Raskas, mutta pitää.'},
  nahkavaatteet:{n:'Nahkavaatteet',w:4,s:1,c:'#9a6a44',cat:'armor',arm:5,warm:1,d:'Suojaa yön kylmältä.'},
  kuparipanssari:{n:'Kuparipanssari',w:8,s:1,c:'#d98a4e',cat:'armor',arm:14,warm:1,slow:.06,d:'Vahva suoja, hieman raskas.'},
};
const RECIPES=[
  {id:'kirves',req:{puu:3,kivi:2}},
  {id:'vasara',req:{puu:3,kivi:1}},
  {id:'nuija',req:{puu:6}},
  {id:'soihtu',req:{puu:1,pihka:1}},
  {id:'kilpi',st:'tyopenkki',req:{puu:10,nahka:2}},
  {id:'hakku',st:'tyopenkki',req:{puu:4,piikivi:5,nahka:2}},
  {id:'keihas',st:'tyopenkki',req:{puu:5,piikivi:4,nahka:1}},
  {id:'jousi',st:'tyopenkki',req:{puu:8,nahka:3}},
  {id:'nuolet',st:'tyopenkki',req:{puu:2,piikivi:2},n:15},
  {id:'nahkavaatteet',st:'tyopenkki',req:{nahka:8}},
  {id:'varras',st:'nuotio',req:{paisti:1,sieni:2,marjat:3}},
  {id:'miekka',st:'ahjo',req:{kupari:6,puu:2,nahka:2}},
  {id:'kuparikirves',st:'ahjo',req:{kupari:4,puu:3}},
  {id:'kuparikilpi',st:'ahjo',req:{kupari:6,puu:6}},
  {id:'kuparipanssari',st:'ahjo',req:{kupari:12,nahka:6}},
];
const RECIPE_BY={};RECIPES.forEach(r=>RECIPE_BY[r.id]=r);
const STATION_NAME={tyopenkki:'Työpenkki',nuotio:'Nuotio',ahjo:'Ahjo'};

/* ---------------- ICONS ---------------- */
const ICON={};
function icon(id){
  if(ICON[id])return ICON[id];
  const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d');const d=ITEMS[id];g.lineCap='round';g.lineJoin='round';
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
    case 'kupari':poly([[8,32],[14,20],[40,20],[44,32]],'#e0904f','#8f5326');poly([[14,20],[18,14],[36,14],[40,20]],'#f2b07a');break;
    case 'hiidenkivi':poly([[24,6],[34,20],[30,40],[18,40],[14,20]],'#7fd6cc','#2f8f86');poly([[24,10],[28,20],[24,34],[20,20]],'#c9fff8');break;
    case 'sydan':circ(18,20,9,'#5fe6d9');circ(30,20,9,'#5fe6d9');poly([[10,24],[38,24],[24,40]],'#5fe6d9');circ(20,18,3,'#d8fffb');break;
    case 'liha':case 'paisti':circ(28,22,12,d.c,'#4a2216');line(18,32,9,41,5,'#e7e1cf');circ(8,42,3.5,'#e7e1cf');if(id==='paisti')line(22,18,34,24,2,'#c47a4a');break;
    case 'marjat':[[18,20],[28,18],[22,29],[32,28],[15,31]].forEach(p=>circ(p[0],p[1],6,'#c82a3c','#6a1220'));line(22,8,24,16,2,'#5a7a2a');break;
    case 'sieni':g.fillStyle='#efe6d2';g.fillRect(20,24,8,16);poly([[8,26],[14,12],[24,8],[34,12],[40,26]],'#9b6a3a','#5e3b1f');break;
    case 'varras':line(8,40,40,8,2.5,'#c9b48a');[[16,32,'#8d4b2b'],[24,24,'#c8a26b'],[32,16,'#8d4b2b']].forEach(p=>circ(p[0],p[1],5.5,p[2]));circ(20,28,3,'#c82a3c');break;
    case 'nuolet':for(let i=0;i<3;i++){line(10+i*5,40,32+i*5,10,2,'#c9b48a');poly([[32+i*5,10],[36+i*5,6],[34+i*5,14]],'#4d535c');}break;
    case 'kilpi':case 'kuparikilpi':circ(24,24,17,id==='kilpi'?'#8a5a32':'#c87a3e',id==='kilpi'?'#4a2f18':'#e9b07a');line(24,8,24,40,2,'#00000044');circ(24,24,5,'#b8b0a0');break;
    case 'nahkavaatteet':case 'kuparipanssari':poly([[14,10],[20,8],[24,12],[28,8],[34,10],[42,18],[36,22],[34,40],[14,40],[12,22],[6,18]],d.c,'#3b2a1a');if(id==='kuparipanssari')for(let y=16;y<38;y+=6)line(16,y,32,y,1.5,'#8f5326');break;
    case 'jousi':g.strokeStyle=W;g.lineWidth=4;g.beginPath();g.arc(36,24,20,Math.PI*.65,Math.PI*1.35);g.stroke();line(20,10,20,38,1.2,'#e7e1cf');break;
    default:{
      line(12,40,32,14,4.5,id==='miekka'?'#4a2f18':W);
      if(id==='kirves'||id==='kuparikirves')poly([[28,10],[40,6],[42,22],[32,20]],id==='kirves'?'#8f8d86':'#e0904f','#3b2a1a');
      if(id==='nuija')poly([[26,6],[40,12],[36,26],[24,20]],'#6b4527','#3b2a1a');
      if(id==='hakku'){g.strokeStyle='#58606b';g.lineWidth=5;g.beginPath();g.arc(32,30,18,-Math.PI*.95,-Math.PI*.35);g.stroke();}
      if(id==='keihas')poly([[30,16],[42,4],[36,18]],'#66707a','#2b2f35');
      if(id==='miekka'){line(18,32,40,8,6,'#e9a46a');line(14,28,24,38,3,'#8f5326');}
      if(id==='soihtu'){circ(34,12,7,'#ff9a3a');circ(34,11,3.5,'#ffe08a');}
      if(id==='vasara')poly([[24,8],[38,14],[34,22],[20,16]],'#7c6a52','#3b2a1a');
    }
  }
  return ICON[id]=c.toDataURL();
}
