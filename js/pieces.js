/* Hiidenmaa – pieces.js
   Rakennusosat (PIECES): mitat, törmäyslaatikot, mallit, lisäys ja poisto */
'use strict';

/* ---------------- BUILD PIECES ---------------- */
// Rakennusmitat. Pelaaja on 1,8 m pitkä, joten oviaukon on oltava selvästi korkeampi.
const G=2.5;      // rakennusruudukon koko (m): lattia G×G, seinän leveys G
const WH=2.6;     // seinän ja pylvään korkeus (m)
const DOOR_W=1.7, DOOR_H=2.3; // oviaukon leveys ja korkeus (m)
const STEP_N=6;   // portaiden askelmat: WH/STEP_N pitää olla selvästi alle STEPUP (0,55 m)
const PIECES={
  lattia:{n:'Puulattia',req:{puu:2},hp:120,snap:'floor',tag:'Rakenne'},
  seina:{n:'Puuseinä',req:{puu:2},hp:150,snap:'wall',tag:'Rakenne'},
  ovi:{n:'Puuovi',req:{puu:4},hp:130,snap:'wall',tag:'Rakenne'},
  katto:{n:'Olkikatto',req:{puu:2},hp:100,snap:'cell',tag:'Rakenne'},
  pylvas:{n:'Pylväs',req:{puu:1},hp:120,snap:'free',tag:'Rakenne'},
  portaat:{n:'Portaat',req:{puu:3},hp:120,snap:'cell',tag:'Rakenne'},
  kiviseina:{n:'Kiviseinä',req:{kivi:5},hp:500,snap:'wall',tag:'Puolustus'},
  aita:{n:'Paaluaita',req:{puu:4},hp:260,snap:'wall',tag:'Puolustus'},
  soihtuteline:{n:'Seisova soihtu',req:{puu:1,pihka:1},hp:50,snap:'free',tag:'Valo'},
  tyopenkki:{n:'Työpenkki',req:{puu:10},hp:200,snap:'free',noBench:1,tag:'Työpiste'},
  nuotio:{n:'Nuotio',req:{kivi:5,puu:2},hp:80,snap:'free',noBench:1,tag:'Työpiste'},
  sulatin:{n:'Sulatusuuni',req:{kivi:20,puu:4},hp:300,snap:'free',tag:'Työpiste'},
  ahjo:{n:'Ahjo',req:{kivi:10,kupari:6,puu:4},hp:300,snap:'free',tag:'Työpiste'},
  sanky:{n:'Sänky',req:{puu:8,nahka:4},hp:100,snap:'free',tag:'Kalusto'},
  arkku:{n:'Arkku',req:{puu:10},hp:120,snap:'free',tag:'Kalusto'},
};
// local AABBs: [cx,cy,cz,w,h,d]
function pieceBoxes(t){switch(t){
  case 'lattia':return[[0,-.1,0,G,.2,G]];
  case 'seina':return[[0,WH/2,0,G,WH,.2]];
  case 'kiviseina':return[[0,WH/2,0,G,WH,.36]];
  case 'aita':return[[0,.8,0,G,1.6,.4]];
  case 'ovi':{const pw=(G-DOOR_W)/2,px=DOOR_W/2+pw/2;return[[-px,WH/2,0,pw,WH,.22],[px,WH/2,0,pw,WH,.22],[0,(DOOR_H+WH)/2,0,G,WH-DOOR_H,.22],[0,(DOOR_H-.05)/2,0,DOOR_W,DOOR_H-.05,.12,'door']];}
  case 'pylvas':return[[0,WH/2,0,.3,WH,.3]];
  case 'portaat':{const d=G/STEP_N,h=WH/STEP_N,out=[];for(let i=0;i<STEP_N;i++)out.push([0,h*(i+1)/2,G/2-d/2-i*d,G,h*(i+1),d]);return out;}
  case 'tyopenkki':return[[0,.5,0,1.8,1,.9]];
  case 'nuotio':return[[0,.15,0,1.1,.3,1.1]];
  case 'sulatin':return[[0,1.3,0,1.4,2.6,1.4]];
  case 'ahjo':return[[0,.55,0,1.7,1.1,1]];
  case 'sanky':return[[0,.25,0,1.1,.5,2.1]];
  case 'arkku':return[[0,.35,0,1,.7,.65]];
  case 'soihtuteline':return[[0,.9,0,.2,1.8,.2]];
  default:return[];}}
function buildPieceMesh(t){
  const g=new THREE.Group();
  switch(t){
    case 'lattia':g.add(bx(G,.2,G,MAT.wood,0,-.1,0));break;
    case 'seina':g.add(bx(G,WH,.2,MAT.wood,0,WH/2,0));g.add(bx(.22,WH,.24,mat(0x5e3b1f),-G/2+.11,WH/2,0));break;
    case 'kiviseina':g.add(bx(G,WH,.36,MAT.stone,0,WH/2,0));break;
    case 'aita':{const n=9;for(let i=0;i<n;i++){const x=-G/2+.12+i*(G-.24)/(n-1);g.add(bx(.18,1.5,.18,mat(0x7b5434),x,.75,0));const tip=new THREE.Mesh(new THREE.ConeGeometry(.12,.35,4),mat(0x9a7450));tip.position.set(x,1.65,0);tip.castShadow=true;g.add(tip);}g.add(bx(G,.14,.24,mat(0x5e3b1f),0,.7,.08));break;}
    case 'ovi':{const pw=(G-DOOR_W)/2,px=DOOR_W/2+pw/2,fm=mat(0x5e3b1f);g.add(bx(pw,WH,.22,fm,-px,WH/2,0),bx(pw,WH,.22,fm,px,WH/2,0),bx(G,WH-DOOR_H,.22,fm,0,(DOOR_H+WH)/2,0));const piv=new THREE.Group();piv.position.set(-DOOR_W/2,0,0);piv.add(bx(DOOR_W,DOOR_H-.05,.1,MAT.wood,DOOR_W/2,(DOOR_H-.05)/2,0));piv.add(bx(.12,.12,.16,mat(0x3a3a3a),DOOR_W-.22,1.05,.04));g.add(piv);g.userData.leaf=piv;break;}
    case 'katto':{const r=bx(G+.1,.14,G*Math.SQRT2+.15,MAT.thatch,0,G/2,0);r.rotation.x=Math.PI/4;g.add(r);break;}
    case 'pylvas':g.add(bx(.3,WH,.3,mat(0x6b4527),0,WH/2,0));break;
    case 'portaat':{const d=G/STEP_N,h=WH/STEP_N;for(let i=0;i<STEP_N;i++)g.add(bx(G,h*(i+1),d,MAT.wood,0,h*(i+1)/2,G/2-d/2-i*d));break;}
    case 'tyopenkki':g.add(bx(1.8,.14,.9,MAT.wood,0,.86,0));for(const [x,z] of [[-.8,-.35],[.8,-.35],[-.8,.35],[.8,.35]])g.add(bx(.14,.8,.14,mat(0x5e3b1f),x,.4,z));g.add(bx(.5,.08,.2,mat(0x8f8d86),.3,.98,0));g.add(bx(.08,.06,.6,mat(0x6b4527),-.4,.96,.1));break;
    case 'nuotio':for(let i=0;i<8;i++){const a=i/8*TAU;g.add(bx(.26,.2,.26,mat(0x6a6862),Math.cos(a)*.48,.1,Math.sin(a)*.48));}{const l1=bx(.14,.14,.8,mat(0x4a2f18),0,.12,0);l1.rotation.y=.6;const l2=bx(.14,.14,.8,mat(0x4a2f18),0,.16,0);l2.rotation.y=-.6;g.add(l1,l2);const f=new THREE.Mesh(new THREE.ConeGeometry(.28,.7,5),MAT.flame);f.position.y=.5;g.add(f);const f2=new THREE.Mesh(new THREE.ConeGeometry(.15,.45,5),MAT.flame2);f2.position.y=.45;g.add(f2);g.userData.flame=[f,f2];}break;
    case 'sulatin':g.add(bx(1.4,1.1,1.4,MAT.stone,0,.55,0),bx(1.1,1,1.1,MAT.stone,0,1.6,0),bx(.6,.6,.6,MAT.stone,0,2.4,0));{const glow=bx(.5,.4,.05,MAT.flame,0,.5,.71,false);g.add(glow);g.userData.glow=glow;}break;
    case 'ahjo':g.add(bx(1,.8,.7,MAT.stone,-.3,.4,0),bx(.7,.25,.35,mat(0x3a3a3a,{metalness:.6,roughness:.4}),.45,.95,0),bx(.3,.6,.3,mat(0x3a3a3a),.45,.5,0));{const coal=bx(.6,.06,.4,MAT.flame,-.3,.82,0,false);g.add(coal);}break;
    case 'sanky':g.add(bx(1.1,.3,2.1,MAT.wood,0,.15,0),bx(1,.12,1.6,mat(0x8a6a4a),0,.36,.2),bx(.8,.14,.35,mat(0xd9cbb0),0,.38,-.8),bx(1.1,.6,.12,mat(0x5e3b1f),0,.3,-1.05));break;
    case 'arkku':g.add(bx(1,.6,.65,MAT.wood,0,.3,0),bx(1.04,.14,.69,mat(0x6b4527),0,.66,0),bx(1.06,.06,.7,mat(0x444444),0,.45,0));break;
    case 'soihtuteline':g.add(bx(.12,1.6,.12,mat(0x5e3b1f),0,.8,0),bx(.2,.25,.2,MAT.flame,0,1.7,0,false),bx(.1,.12,.1,MAT.flame2,0,1.84,0,false));break;
  }
  g.traverse(m=>{if(m.isMesh){m.castShadow=m.castShadow!==false;m.receiveShadow=true;}});
  return g;
}
let pieces=[]; const pieceRoots=[];
function rotLocal(b,rot){const r=((rot%4)+4)%4;let [x,y,z,w,h,d]=b;for(let i=0;i<r;i++){const nx=z,nz=-x;x=nx;z=nz;const t=w;w=d;d=t;}return[x,y,z,w,h,d];}
function worldBoxes(t,x,y,z,rot){return pieceBoxes(t).map(b=>{const[cx,cy,cz,w,h,d]=rotLocal(b,rot);return{minX:x+cx-w/2,maxX:x+cx+w/2,minY:y+cy-h/2,maxY:y+cy+h/2,minZ:z+cz-d/2,maxZ:z+cz+d/2,door:b[6]==='door'};});}
function addPiece(t,x,y,z,rot,hp,data){
  const def=PIECES[t],mesh=buildPieceMesh(t);mesh.position.set(x,y,z);mesh.rotation.y=rot*Math.PI/2;scene.add(mesh);
  const p={t,x,y,z,rot,hp:hp??def.hp,mesh,data:data||{},cols:[]};
  mesh.userData.piece=p;mesh.traverse(m=>{m.userData.piece=p;});
  for(const b of worldBoxes(t,x,y,z,rot)){const c=addBox(b.minX,b.minY,b.minZ,b.maxX,b.maxY,b.maxZ,p);c.door=b.door;p.cols.push(c);}
  if(t==='nuotio'){p.data.fuel=p.data.fuel??4;p.data.burn=p.data.burn??0;p.data.cook=p.data.cook||[];lightSources.push(p.light={x,y:y+.8,z,c:0xff8c3a,i:2,on:()=>p.data.fuel>0,piece:p});}
  if(t==='soihtuteline')lightSources.push(p.light={x,y:y+1.8,z,c:0xffa04a,i:1.5,on:()=>true,piece:p});
  if(t==='sulatin'){p.data.ore=p.data.ore||0;p.data.wood=p.data.wood||0;p.data.done=p.data.done||0;p.data.t=0;lightSources.push(p.light={x,y:y+.6,z,c:0xff7a2a,i:1.2,on:()=>p.data.ore>0&&p.data.wood>0,piece:p});}
  if(t==='arkku')p.data.items=p.data.items||new Array(16).fill(null);
  if(t==='ovi'){p.data.open=!!p.data.open;setDoor(p,p.data.open);}
  pieces.push(p);pieceRoots.push(mesh);return p;
}
function removePiece(p){scene.remove(p.mesh);for(const c of p.cols)gridRemove(c);pieces.splice(pieces.indexOf(p),1);pieceRoots.splice(pieceRoots.indexOf(p.mesh),1);if(p.light){const i=lightSources.indexOf(p.light);if(i>=0)lightSources.splice(i,1);}}
function setDoor(p,open){p.data.open=open;p.mesh.userData.leaf.rotation.y=open?-Math.PI/2*.95:0;for(const c of p.cols)if(c.door)c.off=open;}
function nearPiece(t,x,z,r){for(const p of pieces)if(p.t===t&&dist2(p.x,p.z,x,z)<r*r)return p;return null;}
