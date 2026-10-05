/* Hiidenmaa – landmarks.js
   Kiinteät paikat: riimukivet, rauniot, Hautakumpu, Kalmankehä, luolasto (DMAP) */
'use strict';

/* ---------------- STATIC STRUCTURES (rune stones, ruins, barrow, circle, dungeon) ---------------- */
const interactables=[]; // {x,y,z,r,label(),use(),...}
const lightSources=[];  // {x,y,z,color,int,on()}
const statics=new THREE.Group();scene.add(statics);
function stoneBox(w,h,d,x,y,z,ry=0,m=MAT.stone,col=true){const me=bx(w,h,d,m,x,y,z);me.rotation.y=ry;statics.add(me);if(col){const hw=(Math.abs(Math.cos(ry))*w+Math.abs(Math.sin(ry))*d)/2,hd=(Math.abs(Math.sin(ry))*w+Math.abs(Math.cos(ry))*d)/2;addBox(x-hw,y-h/2,z-hd,x+hw,y+h/2,z+hd,'static');}return me;}
// Kiven sävy: kerrotaan värin kanavat luvulla 0,85–1,15 (ei lisätä lukua, ettei kanavat vuoda toisiinsa)
const rockC=(c,t)=>{const k=.85+t*.3,f=v=>Math.min(255,v*k|0);return(f(c>>16&255)<<16)|(f(c>>8&255)<<8)|f(c&255);};
const RUNES=[
  {k:'rune1',t:'Riimukivi – Rannan kivi',txt:'”Merien yli tullut, kuule: tämä on Hiidenmaa. Kalmanvartija on pitänyt saarta otteessaan yhdeksän talvea. Kerää oksia ja kiviä, rakenna suoja ennen ensimmäistä yötä. Yöllä sudet laskeutuvat niityille.”',reveal:null},
  {k:'rune2',t:'Riimukivi – Nummen laita',txt:()=>`”Kalmanummella, ${dirText(LOC.rune2,'barrow')}, nukkuvat vanhat päälliköt Hautakummussa. Heidän kirstuissaan lepää kolme hiidenkiveä. Ota tuli mukaasi, sillä kumpu on pimeä.”`,reveal:'barrow'},
  {k:'rune3',t:'Riimukivi – Tunturin juuri',txt:()=>`”Kalmankehä on ${dirText(LOC.rune3,'circle')}. Kun kolme hiidenkiveä kohtaa sen alttarin, vartija herää. Kivinen iho kestää terän, mutta nuija murskaa sen. Kupari kasvaa metsän vanhoissa lohkareissa.”`,reveal:'circle'},
];
for(const R of RUNES){const L=LOC[R.k],y=terrainH(L.x,L.z);const me=stoneBox(.9,2.6,.5,L.x,y+1.1,L.z,.3,mat(0x6f6c66));
  const glyph=bx(.5,1.6,.04,MAT.glow,0,0,.26,false);me.add(glyph);
  interactables.push({x:L.x,y:y+1,z:L.z,r:2.6,label:()=>'Lue riimukivi',use:()=>readRune(R)});}
function readRune(R){showLore(R.t,typeof R.txt==='function'?R.txt():R.txt);if(R.reveal&&!flags.disc[R.reveal]){flags.disc[R.reveal]=1;msg(`${LOC[R.reveal].name} merkittiin karttaan.`,'loot');}flags.runes[R.k]=1;}
function buildRuin(L,seed){const r=mulberry32(seed),y=terrainH(L.x,L.z);
  for(let i=0;i<9;i++){const a=i/9*TAU,d=4.5+r()*.6,h=.6+r()*2.4;if(r()<.2)continue;stoneBox(2.2,h,.8,L.x+Math.cos(a)*d,y+h/2-.2,L.z+Math.sin(a)*d,-a+Math.PI/2);}
  stoneBox(1.4,.4,1.4,L.x+1.5,y+.1,L.z-1,0.4);
  const chest=bx(1,.7,.65,MAT.wood,L.x,y+.35,L.z);chest.add(bx(1.04,.1,.7,mat(0x4a4a4a),0,.2,0));statics.add(chest);addBox(L.x-.5,y,L.z-.33,L.x+.5,y+.7,L.z+.33,'static');
  return{chest,y};}
const RUIN_LOOT={ruinF:{piikivi:6,nahka:3,nuolet:15},ruinM:{kupari:5,malmi:3,pihka:3},ruinC:{piikivi:8,pihka:4,kupari:3}};
for(const k of ['ruinF','ruinM','ruinC']){const L=LOC[k],{chest,y}=buildRuin(L,k.length*31+L.x|0);
  interactables.push({x:L.x,y:y+.5,z:L.z,r:2.4,label:()=>foundEmpty('ruin:'+k)?'Aarrearkku (tyhjä)':'Avaa aarrearkku',use:()=>{const first=!flags.ruins[k];
    openFound('ruin:'+k,'Aarrearkku',first?Object.entries(RUIN_LOOT[k]):null);if(first){flags.ruins[k]=1;msg('Arkussa on tarvikkeita!','loot');}}});}
// Barrow entrance: luolamainen kivinen portti kummun kyljessä, ympärillä rosoisia lohkareita, soihtuja, kalloja ja riimulaattoja
(function(){const L=LOC.barrow,dx=10.5,ex=L.x+dx,ez=L.z,y=terrainH(ex,ez),r=mulberry32(4242),dk=mat(0x6a665e),mos=mat(0x4d6a3a);
  stoneBox(1.2,4.4,1.2,ex,y+2,ez-2.2,0,dk);stoneBox(1.2,4.4,1.2,ex,y+2,ez+2.2,0,dk);stoneBox(1.6,.9,6.2,ex,y+4.6,ez,0,dk);
  for(let i=0;i<16;i++){const side=i%2?1:-1,k=(i>>1),zz=ez+side*(3.2+k*.55+r()*.8),h=1.6+r()*2.8+(k<3?1.5:0),w=1.4+r()*1.6,xx=ex-.2-k*.5-r()*.8;
    const m=stoneBox(w,h,w*(.8+r()*.4),xx,y+h/2-.3,zz,r()*3,mat(rockC(0x6a675f,r())));if(r()<.6)m.add(bx(w*.9,.25,w*.8,mos,0,h/2,0,false));}
  for(let i=0;i<5;i++){const w=1.5+r()*1.2,h=1.2+r()*1.4;stoneBox(w,h,w,ex-.5-r()*1.2,y+5.4+h/2-.3+r()*.4,ez+(r()-.5)*5,r()*3,mat(0x56534e));}
  statics.add(bx(.2,3.4,2.6,new THREE.MeshBasicMaterial({color:0x050404}),ex-.3,y+1.7,ez,false));
  for(let i=1;i<=3;i++)statics.add(bx(.1,3.4-i*.25,2.6-i*.3,new THREE.MeshBasicMaterial({color:0x0a0807-i*0x020201}),ex-.3-i*.6,y+1.7,ez,false));
  addBox(ex-.5,y,ez-1.3,ex-.2,y+3.6,ez+1.3,'static');
  for(let i=0;i<3;i++)stoneBox(1.4,.3*(3-i)+.15,5.2-i*.5,ex+1.2+i*1.1,y+(.3*(3-i)+.15)/2-.1,ez,0,mat(0x6a675f));
  interactables.push({x:ex+.4,y:y+1,z:ez,r:3.2,label:()=>'Astu Hautakumpuun',use:()=>enterDungeon()});
  for(const s of [-1,1]){const bz=ez+s*3.4;stoneBox(.7,1.1,.7,ex+3.2,y+.5,bz,0,dk);statics.add(bx(.3,.45,.3,MAT.flame,ex+3.2,y+1.3,bz,false));
    lightSources.push({x:ex+3.2,y:y+1.8,z:bz,c:0xff9a40,i:1.5,on:()=>true});
    const sl=stoneBox(.35,2.6,1.1,ex+2,y+1.2,ez+s*5,s*.35,mat(0x6a6c70));sl.add(bx(.04,1.5,.5,MAT.glow,.2,0,0,false));
    for(let k=0;k<4;k++){const kx=ex+4+r()*1.2,kz=ez+s*(1.2+r()*.8),sk=bx(.22,.2,.24,mat(0xe7e1cf),kx,terrainH(kx,kz)+.1,kz,false);sk.rotation.y=r()*3;statics.add(sk);}}
  for(let i=0;i<6;i++){const a=i/6*TAU+.3,rx=L.x+Math.cos(a)*6.4,rz=L.z+Math.sin(a)*6.4,h=2+r()*1.4;if(Math.hypot(rx-ex,rz-ez)<5)continue;stoneBox(.9,h,.6,rx,terrainH(rx,rz)+h/2-.2,rz,-a+Math.PI/2,mat(0x5f5c57));}
  stoneBox(1.6,1.1,1.6,L.x,terrainH(L.x,L.z)+.4,L.z,.5,dk);statics.add(bx(.35,.55,.35,MAT.glow,L.x,terrainH(L.x,L.z)+1.2,L.z,false));
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
// Seinäsoihtu telineessä: rautalevy seinässä, varsi, rengas ja vino soihtu. dir = [dx,dz] kohti seinää, back = levyn etäisyys ruudun keskeltä.
// Palauttaa liekin kohdan (valolle). Ei törmäystä.
const FLAME_CORE=new THREE.MeshBasicMaterial({color:0xffe9a0}),IRON_M=mat(0x2e2c2a,{metalness:.6});
function wallTorch(par,x,y,z,dir,back=DC/2-.04){const [dx,dz]=dir,fx=x+dx*back,fz=z+dz*back,h=y+2.3,ir=IRON_M;
  par.add(bx(dx?.06:.34,.44,dz?.06:.34,ir,fx,h,fz,false));par.add(bx(dx?.42:.07,.07,dz?.42:.07,ir,fx-dx*.21,h-.12,fz-dz*.21,false));
  par.add(bx(.2,.06,.2,ir,fx-dx*.42,h-.06,fz-dz*.42,false));
  const st=bx(.1,.8,.1,mat(0x4a2f18),fx-dx*.47,h+.18,fz-dz*.47,false);st.rotation.z=dx*.28;st.rotation.x=-dz*.28;par.add(st);
  const tx=fx-dx*.58,tz=fz-dz*.58,ty=h+.58;par.add(bx(.2,.16,.2,mat(0x2a1a10),tx,ty,tz,false),bx(.22,.32,.22,MAT.flame,tx,ty+.22,tz,false),bx(.11,.2,.11,FLAME_CORE,tx,ty+.2,tz,false));
  return{x:tx-dx*.15,y:ty+.4,z:tz-dz*.15};}
// Seisova tulimalja (kolmijalka) avoimille paikoille, joissa ei ole seinää vieressä.
function brazier(par,x,y,z){const ir=IRON_M;for(let k=0;k<3;k++){const a=k/3*TAU,l=bx(.07,1.3,.07,ir,x+Math.cos(a)*.22,y+.62,z+Math.sin(a)*.22,false);l.rotation.z=Math.cos(a)*.18;l.rotation.x=-Math.sin(a)*.18;par.add(l);}
  par.add(bx(.7,.22,.7,ir,x,y+1.3,z,false),bx(.5,.12,.5,mat(0x3a1a0c),x,y+1.42,z,false),bx(.42,.45,.42,MAT.flame,x,y+1.65,z,false),bx(.22,.3,.22,FLAME_CORE,x,y+1.6,z,false));
  return{x,y:y+2,z};}
const dunSpawns=[], sarcs=[]; let dunEntry=null;
const dunCell=(ix,iz)=>({x:DUN.x+(ix-DW/2+.5)*DC,z:DUN.z+(iz-DH/2+.5)*DC});
(function(){
  const wallGeo=new THREE.BoxGeometry(DC,4.2,DC);let cnt=0;DMAP.forEach(r=>{for(const c of r)if(c==='#')cnt++;});
  const im=new THREE.InstancedMesh(wallGeo,new THREE.MeshStandardMaterial({map:TEX.stone,roughness:1,color:0x9a948a}),cnt);im.frustumCulled=false;let i=0;im.receiveShadow=true;
  DMAP.forEach((row,iz)=>[...row].forEach((ch,ix)=>{const p=dunCell(ix,iz);
    if(ch==='#'){_m4.makeTranslation(p.x,DUN.y+2.1,p.z);im.setMatrixAt(i++,_m4);addBox(p.x-DC/2,DUN.y,p.z-DC/2,p.x+DC/2,DUN.y+4.2,p.z+DC/2,'static');}
    if(ch==='E')dunEntry=p;
    if(ch==='k'||ch==='B')dunSpawns.push({x:p.x,z:p.z,type:ch==='B'?'ylimys':'kalmo'});
    if(ch==='t'){const dirs=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>(DMAP[iz+b]||'')[ix+a]==='#'),L=dirs.length?wallTorch(statics,p.x,DUN.y,p.z,dirs[0]):brazier(statics,p.x,DUN.y,p.z);lightSources.push({x:L.x,y:L.y,z:L.z,c:0xff8a36,i:1.8,on:()=>true,dun:true});}
    if(ch==='C'){const idx=sarcs.length;const base=bx(1.1,.8,2.2,MAT.stone,p.x,DUN.y+.4,p.z);const lid=bx(1.2,.18,2.3,mat(0x6f6a62),0,.5,0);base.add(lid);statics.add(base);addBox(p.x-.55,DUN.y,p.z-1.1,p.x+.55,DUN.y+.8,p.z+1.1,'static');sarcs.push({lid,p});
      interactables.push({x:p.x,y:DUN.y+.8,z:p.z,r:2.6,label:()=>foundEmpty('sarc:'+idx)?'Hautakirstu (tyhjä)':'Avaa hautakirstu',use:()=>openSarc(idx)});}
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
