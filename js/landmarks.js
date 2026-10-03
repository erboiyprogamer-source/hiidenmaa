/* Hiidenmaa – landmarks.js
   Kiinteät paikat: riimukivet, rauniot, Hautakumpu, Kalmankehä, luolasto (DMAP) */
'use strict';

/* ---------------- STATIC STRUCTURES (rune stones, ruins, barrow, circle, dungeon) ---------------- */
const interactables=[]; // {x,y,z,r,label(),use(),...}
const lightSources=[];  // {x,y,z,color,int,on()}
const statics=new THREE.Group();scene.add(statics);
function stoneBox(w,h,d,x,y,z,ry=0,m=MAT.stone,col=true){const me=bx(w,h,d,m,x,y,z);me.rotation.y=ry;statics.add(me);if(col){const hw=(Math.abs(Math.cos(ry))*w+Math.abs(Math.sin(ry))*d)/2,hd=(Math.abs(Math.sin(ry))*w+Math.abs(Math.cos(ry))*d)/2;addBox(x-hw,y-h/2,z-hd,x+hw,y+h/2,z+hd,'static');}return me;}
const RUNES=[
  {k:'rune1',t:'Riimukivi – Rannan kivi',txt:'”Merien yli tullut, kuule: tämä on Hiidenmaa. Kalmanvartija on pitänyt saarta otteessaan yhdeksän talvea. Kerää oksia ja kiviä, rakenna suoja ennen ensimmäistä yötä. Yöllä sudet laskeutuvat niityille.”',reveal:null},
  {k:'rune2',t:'Riimukivi – Nummen laita',txt:'”Lounaan kalmanummella nukkuvat vanhat päälliköt Hautakummussa. Heidän kirstuissaan lepää kolme hiidenkiveä. Ota tuli mukaasi, sillä kumpu on pimeä.”',reveal:'barrow'},
  {k:'rune3',t:'Riimukivi – Tunturin juuri',txt:'”Kun kolme hiidenkiveä kohtaa Kalmankehän alttarin, vartija herää. Kivinen iho kestää terän, mutta nuija murskaa sen. Kupari kasvaa metsän vanhoissa lohkareissa.”',reveal:'circle'},
];
for(const R of RUNES){const L=LOC[R.k],y=terrainH(L.x,L.z);const me=stoneBox(.9,2.6,.5,L.x,y+1.1,L.z,.3,mat(0x6f6c66));
  const glyph=bx(.5,1.6,.04,MAT.glow,0,0,.26,false);me.add(glyph);
  interactables.push({x:L.x,y:y+1,z:L.z,r:2.6,label:()=>'Lue riimukivi',use:()=>readRune(R)});}
function readRune(R){showLore(R.t,R.txt);if(R.reveal&&!flags.disc[R.reveal]){flags.disc[R.reveal]=1;msg(`${LOC[R.reveal].name} merkittiin karttaan.`,'loot');}flags.runes[R.k]=1;}
function buildRuin(L,seed){const r=mulberry32(seed),y=terrainH(L.x,L.z);
  for(let i=0;i<9;i++){const a=i/9*TAU,d=4.5+r()*.6,h=.6+r()*2.4;if(r()<.2)continue;stoneBox(2.2,h,.8,L.x+Math.cos(a)*d,y+h/2-.2,L.z+Math.sin(a)*d,-a+Math.PI/2);}
  stoneBox(1.4,.4,1.4,L.x+1.5,y+.1,L.z-1,0.4);
  const chest=bx(1,.7,.65,MAT.wood,L.x,y+.35,L.z);chest.add(bx(1.04,.1,.7,mat(0x4a4a4a),0,.2,0));statics.add(chest);addBox(L.x-.5,y,L.z-.33,L.x+.5,y+.7,L.z+.33,'static');
  return{chest,y};}
const RUIN_LOOT={ruinF:{piikivi:6,nahka:3,nuolet:15},ruinM:{kupari:5,malmi:3,pihka:3},ruinC:{piikivi:8,pihka:4,kupari:3}};
for(const k of ['ruinF','ruinM','ruinC']){const L=LOC[k],{chest,y}=buildRuin(L,k.length*31+L.x|0);
  interactables.push({x:L.x,y:y+.5,z:L.z,r:2.4,label:()=>flags.ruins[k]?'Tyhjä aarrearkku':'Avaa aarrearkku',use:()=>{if(flags.ruins[k])return;flags.ruins[k]=1;for(const [id,n] of Object.entries(RUIN_LOOT[k]))giveOrDrop(id,n,L.x,y+1,L.z);msg('Arkussa oli tarvikkeita!','loot');sfx('pickup');}});}
// Barrow entrance
(function(){const L=LOC.barrow,dx=10.5,ex=L.x+dx,ez=L.z,y=terrainH(ex,ez);
  stoneBox(.8,3.4,.8,ex,y+1.5,ez-1.6);stoneBox(.8,3.4,.8,ex,y+1.5,ez+1.6);stoneBox(1,.7,4.2,ex,y+3.4,ez);
  statics.add(bx(.2,3,2.4,new THREE.MeshBasicMaterial({color:0x050404}),ex-.3,y+1.4,ez));
  addBox(ex-.5,y,ez-1.2,ex-.2,y+3,ez+1.2,'static');
  interactables.push({x:ex+.4,y:y+1,z:ez,r:2.8,label:()=>'Astu Hautakumpuun',use:()=>enterDungeon()});
  lightSources.push({x:ex+.8,y:y+2.6,z:ez-1.6,c:0xff9a40,i:1.4,on:()=>true});
  statics.add(bx(.1,.5,.1,MAT.flame,ex+.6,y+2.6,ez-1.6,false));
})();
// Stone circle + altar
const circleStones=[];
(function(){const L=LOC.circle,y=6;for(let i=0;i<8;i++){const a=i/8*TAU;const s=stoneBox(1.2,4.5+(i%3)*.7,.8,L.x+Math.cos(a)*10,y+2,L.z+Math.sin(a)*10,-a+Math.PI/2,mat(0x5b5853));const rune=bx(.4,1.6,.04,new THREE.MeshBasicMaterial({color:0x2a3a39}),0,.4,.42,false);s.add(rune);circleStones.push(rune);}
  stoneBox(2.6,1,1.6,L.x,y+.4,L.z,0,mat(0x4d4a45));
  interactables.push({x:L.x,y:y+1,z:L.z,r:3,label:()=>flags.boss?'Kehä on hiljainen':boss?'…':`Aseta hiidenkivet alttarille (${invCount('hiidenkivi')}/3)`,use:()=>useAltar()});})();
// Dungeon interior
const DMAP=[
"#####################",
"#E.t#.....t#....t..C#",
"#...#..k...+..k.....#",
"#...+......#........#",
"#...#......####+#####",
"##+###+#####......t.#",
"#t....#....+...k....#",
"#..k..#.k..#........#",
"#.....#....###+######",
"###+#####+##.......t#",
"#.......#..+..k.B...#",
"#.k..t..+..#........#",
"#C......#t.#.k.....C#",
"#####################",
];
const DC=3.2, DW=DMAP[0].length, DH=DMAP.length;
const dunSpawns=[], sarcs=[]; let dunEntry=null;
const dunCell=(ix,iz)=>({x:DUN.x+(ix-DW/2+.5)*DC,z:DUN.z+(iz-DH/2+.5)*DC});
(function(){
  const wallGeo=new THREE.BoxGeometry(DC,4.2,DC);let cnt=0;DMAP.forEach(r=>{for(const c of r)if(c==='#')cnt++;});
  const im=new THREE.InstancedMesh(wallGeo,new THREE.MeshStandardMaterial({map:TEX.stone,roughness:1,color:0x9a948a}),cnt);let i=0;im.receiveShadow=true;
  DMAP.forEach((row,iz)=>[...row].forEach((ch,ix)=>{const p=dunCell(ix,iz);
    if(ch==='#'){_m4.makeTranslation(p.x,DUN.y+2.1,p.z);im.setMatrixAt(i++,_m4);addBox(p.x-DC/2,DUN.y,p.z-DC/2,p.x+DC/2,DUN.y+4.2,p.z+DC/2,'static');}
    if(ch==='E')dunEntry=p;
    if(ch==='k'||ch==='B')dunSpawns.push({x:p.x,z:p.z,type:ch==='B'?'ylimys':'kalmo'});
    if(ch==='t'){lightSources.push({x:p.x,y:DUN.y+2.6,z:p.z,c:0xff8a36,i:1.8,on:()=>true,dun:true});statics.add(bx(.12,.6,.12,mat(0x4a2f18),p.x,DUN.y+2.2,p.z));statics.add(bx(.2,.25,.2,MAT.flame,p.x,DUN.y+2.6,p.z,false));}
    if(ch==='C'){const idx=sarcs.length;const base=bx(1.1,.8,2.2,MAT.stone,p.x,DUN.y+.4,p.z);const lid=bx(1.2,.18,2.3,mat(0x6f6a62),0,.5,0);base.add(lid);statics.add(base);addBox(p.x-.55,DUN.y,p.z-1.1,p.x+.55,DUN.y+.8,p.z+1.1,'static');sarcs.push({lid,p});
      interactables.push({x:p.x,y:DUN.y+.8,z:p.z,r:2.6,label:()=>flags.sarc[idx]?'Avattu hautakirstu':'Avaa hautakirstu',use:()=>openSarc(idx)});}
  }));
  im.instanceMatrix.needsUpdate=true;statics.add(im);
  const W=DW*DC,H=DH*DC;
  const floor=bx(W,.4,H,new THREE.MeshStandardMaterial({map:TEX.stone,color:0x6a655d}),DUN.x,DUN.y-.2,DUN.z,false);floor.material.map=TEX.stone.clone();floor.material.map.repeat.set(DW,DH);floor.material.map.needsUpdate=true;statics.add(floor);
  addBox(DUN.x-W/2,DUN.y-1,DUN.z-H/2,DUN.x+W/2,DUN.y,DUN.z+H/2,'static');
  statics.add(bx(W,.4,H,mat(0x2a2622),DUN.x,DUN.y+4.4,DUN.z,false));
  addBox(DUN.x-W/2,DUN.y+4.2,DUN.z-H/2,DUN.x+W/2,DUN.y+5,DUN.z+H/2,'static').noGround=true;
  // exit
  const ex=dunEntry.x-DC/2+.15;statics.add(bx(.1,2.6,1.8,new THREE.MeshBasicMaterial({color:0xcfe6ff}),ex,DUN.y+1.3,dunEntry.z,false));
  interactables.push({x:ex+.3,y:DUN.y+1,z:dunEntry.z,r:2.4,label:()=>'Palaa ulos',use:()=>exitDungeon()});
})();
