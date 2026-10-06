/* Hiidenmaa – dungeons.js
   Ulottuvuudet: portaalit, arvotut sisätilat (sokkelo, kammiot, luola), lukitut portit, vaiheittaiset pomot ja portaalisuoja */
'use strict';

const fo=k=>flags[k]||(flags[k]={});
const REALMS={
  portal1:{n:'Routaluola',gen:'maze',W:31,H:31,wall:0x9fb4c6,floor:0x6a7c8c,tc:0x8fd0ff,fog:0x08121a,glow:0x7fd0ff,mist:0xb8d8f0,boss:'jaajattari',mobs:['routasusi','routasusi','kalmo'],dens:.04,spw:'routasusi',lock:'jaaavain',key:'luuavain',alt:()=>!!fo('poi').poiR1,hint:()=>`Jääavain on kätketty rauniotaloon (${LOC.poiR1.name}).`,reveal:'poiR1'},
  portal2:{n:'Kalmankammio',gen:'rooms',W:43,H:35,wall:0x9a8f7e,floor:0x5c554a,tc:0xff8a36,fog:0x0d0806,glow:0xe6e0cf,mist:0xcfc4b0,boss:'kalmaherra',mobs:['kalmo','kalmo','kalmo','ylimys'],dens:.035,spw:'kalmo',lock:'luuavain',key:'aarniavain',alt:()=>!!fo('rb').portal1,hint:()=>'Luuavain on Jäättärellä Routaluolan perimmäisessä kammiossa.',reveal:'portal1'},
  portal3:{n:'Aarnihauta',gen:'cave',W:47,H:47,wall:0x6f8a5a,floor:0x4a5a3a,tc:0x9aff7a,fog:0x050c06,glow:0x7aff9a,mist:0x9fd8a0,boss:'aarnihirvio',mobs:['hiisi','hiisi','susi','kivivartija'],dens:.03,spw:'hiisi',lock:'aarniavain',key:null,alt:()=>!!fo('rb').portal2,hint:()=>'Aarniavain on Kalmaherralla Kalmankammiossa.',reveal:'portal2'},
};
const SPW_T=20; // spawnerin tauko (s) sen jälkeen, kun sen kaikki viholliset ovat kuolleet
const SPW_HP=240; // Kalmanpesän kestävyys: murskataan hakulla (louhintateho per isku), tuhottu pesä tallentuu (flags.sd[ulottuvuus])
const RCH=7.6; // sisätilan kattokorkeus (pomojen pää ei osu kattoon)
const REALM_IDS=Object.keys(REALMS);
REALM_IDS.forEach((id,k)=>{REALMS[id].cx=DUN.x+(k+1)*230;REALMS[id].cz=DUN.z;});
const BUILT={}, PORTALS=[], VENTS=[];
const CHEST_LOOT=[[['rauta',3],['kupari',3],['nuolet',12]],[['rautamalmi',4],['pihka',3],['nahka',3]],[['hiidenkivi',1],['luu',4]],[['kupari',5],['kivi',6],['nuolet',10]],[['rauta',2],['hiili',4],['liha',3]]];

/* ---------------- GENERAATTORIT: ruudukko, jossa '#' on seinä ja '.' lattia ---------------- */
function carve(g,x0,z0,x1,z1){for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)if(x>0&&z>0&&x<g[0].length-1&&z<g.length-1)g[z][x]='.';}
function genMaze(W,H,r){
  const g=Array.from({length:H},()=>Array(W).fill('#')),st=[[1,1]];g[1][1]='.';
  while(st.length){const [x,z]=st[st.length-1];
    const nb=[[2,0],[-2,0],[0,2],[0,-2]].map(([a,b])=>[x+a,z+b,a/2,b/2]).filter(([nx,nz])=>nx>0&&nz>0&&nx<W-1&&nz<H-1&&g[nz][nx]==='#');
    if(!nb.length){st.pop();continue;}
    const [nx,nz,hx,hz]=nb[(r()*nb.length)|0];g[z+hz][x+hx]='.';g[nz][nx]='.';st.push([nx,nz]);}
  for(let i=0;i<W*H/10;i++){const x=1+((r()*(W-2))|0),z=1+((r()*(H-2))|0);
    if(g[z][x]==='#'&&((g[z][x-1]==='.'&&g[z][x+1]==='.')!==(g[z-1][x]==='.'&&g[z+1][x]==='.')))g[z][x]='.';}
  for(let k=0;k<4;k++){const w=3+((r()*2)|0)*2,x=1+((r()*((W-w-2)/2))|0)*2,z=1+((r()*((H-w-2)/2))|0)*2;carve(g,x,z,x+w-1,z+w-1);}
  return g;
}
function genRooms(W,H,r){
  const g=Array.from({length:H},()=>Array(W).fill('#')),rooms=[];
  for(let t=0;t<300&&rooms.length<11;t++){const w=4+((r()*5)|0),h=4+((r()*4)|0),x=2+((r()*(W-w-4))|0),z=2+((r()*(H-h-4))|0);
    if(rooms.some(o=>x<o.x+o.w+2&&x+w+2>o.x&&z<o.z+o.h+2&&z+h+2>o.z))continue;rooms.push({x,z,w,h});carve(g,x,z,x+w-1,z+h-1);}
  rooms.sort((a,b)=>a.x-b.x);
  const link=(a,b)=>{const ax=a.x+(a.w>>1),az=a.z+(a.h>>1),cx=b.x+(b.w>>1),cz=b.z+(b.h>>1),wd=r()<.3?1:0;carve(g,Math.min(ax,cx),az,Math.max(ax,cx),az+wd);carve(g,cx,Math.min(az,cz),cx+wd,Math.max(az,cz));};
  for(let i=1;i<rooms.length;i++)link(rooms[i-1],rooms[i]);
  for(let k=0;k<3&&rooms.length>3;k++)link(rooms[(r()*rooms.length)|0],rooms[(r()*rooms.length)|0]);
  return g;
}
function bfsGrid(g,sx,sz){const H=g.length,W=g[0].length,d=new Int16Array(W*H).fill(-1),q=[[sx,sz]];d[sz*W+sx]=0;
  for(let i=0;i<q.length;i++){const [x,z]=q[i];for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,nz=z+b;if(nx<0||nz<0||nx>=W||nz>=H||g[nz][nx]==='#'||d[nz*W+nx]>=0)continue;d[nz*W+nx]=d[z*W+x]+1;q.push([nx,nz]);}}
  return d;}
function genCave(W,H,r){
  for(let tr=0;tr<8;tr++){
    let g=Array.from({length:H},(_,z)=>Array.from({length:W},(_,x)=>x<2||z<2||x>W-3||z>H-3?'#':(r()<.46?'#':'.')));
    for(let it=0;it<5;it++){const n=g.map(row=>row.slice());for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++){let c=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(g[z+a][x+b]==='#')c++;n[z][x]=c>=5?'#':'.';}g=n;}
    let best=null,seen=new Int16Array(W*H);
    for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++){if(g[z][x]!=='.'||seen[z*W+x])continue;const d=bfsGrid(g,x,z),cells=[];for(let i=0;i<d.length;i++)if(d[i]>=0){cells.push(i);seen[i]=1;}if(!best||cells.length>best.length)best=cells;}
    if(!best)continue;const keep=new Set(best);
    for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(g[z][x]==='.'&&!keep.has(z*W+x))g[z][x]='#';
    if(best.length>W*H*.28||tr===7)return g;
  }
}
// Yhteinen viimeistely: sisäänkäynti vasempaan reunaan, pomo kauimmaiseen kohtaan (avarrettu areena), spawnerihuone puoliväliin,
// vihollisten, soihtujen, arkkujen, tynnyrien ja höyrypuhurien paikat sekä koristeet. Luolassa lattia saa korkeuseroja (≤0,45 m, alle STEPUP).
function finishRealm(g,r,D){
  const H=g.length,W=g[0].length,cheb=(a,b,c,e)=>Math.max(Math.abs(a-c),Math.abs(b-e));let ent=null;
  for(let x=1;x<W-1&&!ent;x++){const zs=[];for(let z=1;z<H-1;z++)if(g[z][x]==='.')zs.push(z);if(zs.length){const z=zs[(r()*zs.length)|0];g[z][x+1]='.';ent={ix:x,iz:z};}}
  let d=bfsGrid(g,ent.ix,ent.iz),far=0,bs={ix:ent.ix,iz:ent.iz};
  for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++)if(d[z*W+x]>far){far=d[z*W+x];bs={ix:x,iz:z};}
  carve(g,bs.ix-3,bs.iz-3,bs.ix+3,bs.iz+3);d=bfsGrid(g,ent.ix,ent.iz);
  let spw=null;{let f2=0;for(const v of d)f2=Math.max(f2,v);const cand=[];
    for(let z=3;z<H-3;z++)for(let x=3;x<W-3;x++){const v=d[z*W+x];if(v>f2*.35&&v<f2*.72&&cheb(x,z,bs.ix,bs.iz)>8&&cheb(x,z,ent.ix,ent.iz)>6)cand.push([x,z]);}
    if(cand.length){const [x,z]=cand[(r()*cand.length)|0];carve(g,x-2,z-2,x+2,z+2);spw={ix:x,iz:z};d=bfsGrid(g,ent.ix,ent.iz);}}
  const floors=[];for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++)if(g[z][x]==='.')floors.push([x,z]);
  const shuf=floors.slice();for(let i=shuf.length-1;i>0;i--){const j=(r()*(i+1))|0;[shuf[i],shuf[j]]=[shuf[j],shuf[i]];}
  const wallN=(x,z)=>(g[z][x-1]==='#')+(g[z][x+1]==='#')+(g[z-1][x]==='#')+(g[z+1][x]==='#');
  const wallDir=(x,z)=>{const ds=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>g[z+b][x+a]==='#');return ds.length?ds[(r()*ds.length)|0]:null;};
  const nearSpw=(x,z,k)=>spw&&cheb(x,z,spw.ix,spw.iz)<k,nearBoss=(x,z,k)=>cheb(x,z,bs.ix,bs.iz)<k,near=(a,b,k)=>Math.hypot(a[0]-b[0],a[1]-b[1])<k;
  const mobs=[];let mi=0;
  for(const [x,z] of shuf){if(mobs.length>=34)break;if(d[z*W+x]<10||nearBoss(x,z,5)||nearSpw(x,z,4))continue;if(r()<D.dens)mobs.push({ix:x,iz:z,type:D.mobs[mi++%D.mobs.length]});}
  const torches=[];
  for(const [x,z] of shuf){if(torches.length>=48)break;if(wallN(x,z)>0&&r()<.25&&!torches.some(t=>near(t,[x,z],4.5)))torches.push([x,z,wallDir(x,z)]);}
  for(const [dx,dz] of [[-3,-3],[3,-3],[-3,3],[3,3]])torches.push([bs.ix+dx,bs.iz+dz,null]);
  const chests=[],dead=shuf.filter(([x,z])=>wallN(x,z)>=3&&d[z*W+x]>10&&!nearBoss(x,z,5));
  for(const c of dead){if(chests.length>=4)break;if(r()<.6&&!chests.some(t=>near(t,c,6)))chests.push(c);}
  if(chests.length<2){for(const c of shuf){if(chests.length>=3)break;if(wallN(c[0],c[1])>=1&&d[c[1]*W+c[0]]>14&&!nearBoss(c[0],c[1],5)&&r()<.05)chests.push(c);}}
  const used=new Set(chests.map(([x,z])=>x+','+z));
  const barrels=[];for(const [x,z] of shuf){if(barrels.length>=8)break;const wn=wallN(x,z);if(wn<1||wn>2||d[z*W+x]<4||nearBoss(x,z,5)||nearSpw(x,z,3)||used.has(x+','+z))continue;
    if(r()<.08&&!barrels.some(t=>near(t,[x,z],5))){barrels.push([x,z,wallDir(x,z),1+((r()*2)|0)]);used.add(x+','+z);}}
  const vents=[];for(const [x,z] of shuf){if(vents.length>=8)break;if(wallN(x,z)>=1&&d[z*W+x]>6&&!used.has(x+','+z)&&r()<.04&&!vents.some(t=>near(t,[x,z],6))){vents.push([x,z]);used.add(x+','+z);}}
  // Lattian korkeus (vain luola): kvantisoitu kohina 0 / 0,15 / 0,3 / 0,45 m; tasainen sisäänkäynnillä, areenalla, spawnerilla ja esineiden kohdalla
  const hgt=new Float32Array(W*H),so=(r()*100)|0;
  if(D.gen==='cave')for(const [x,z] of floors){if(cheb(x,z,ent.ix,ent.iz)<=1||nearBoss(x,z,4)||nearSpw(x,z,3)||used.has(x+','+z))continue;
    hgt[z*W+x]=clamp(Math.round((fbm(x*.21+so,z*.21-so,2)-.42)*7),0,3)*.15;}
  return{ent,boss:bs,spw,mobs,torches,vents,barrels,hgt,floors,wallN,chests:chests.map(([ix,iz])=>({ix,iz}))};
}

/* ---------------- KORISTEET: luut, kallot, tippukivet ja -pisarat, lätäköt ---------------- */
const BONE_M=mat(0xd9d2bf),PUDDLE_M=new THREE.MeshStandardMaterial({color:0x0e1418,roughness:.05,metalness:.7,transparent:true,opacity:.78}),DRIPS=[];
const _q4=new THREE.Quaternion(),_e4=new THREE.Euler(),_s4=new THREE.Vector3(),_p4=new THREE.Vector3(),_c4=new THREE.Color();
// Monta samaa kappaletta yhtenä InstancedMeshinä: rivi = [x,y,z, rx,ry,rz, sx,sy,sz, väri?]
function instM(geo,m,list,add,shadow){if(!list.length)return null;const im=new THREE.InstancedMesh(geo,m,list.length);im.frustumCulled=false;im.receiveShadow=true;im.castShadow=!!shadow;
  list.forEach((t,i)=>{_p4.set(t[0],t[1],t[2]);_e4.set(t[3],t[4],t[5]);_q4.setFromEuler(_e4);_s4.set(t[6],t[7],t[8]);_m4.compose(_p4,_q4,_s4);im.setMatrixAt(i,_m4);if(t[9]!==undefined)im.setColorAt(i,_c4.setHex(t[9]));});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;add(im);return im;}
// o: {r, add, cell(ix,iz), y0, ceil, cells:[[ix,iz,h,seiniä]], bones, stal, puddles, cave, rk, stalM}
function dressFloor(o){const {r,y0}=o,bones=[],skulls=[],jaws=[],stal=[],mites=[],pud=[];
  for(const [ix,iz,h,wn] of o.cells){const c=o.cell(ix,iz),fy=y0+h;
    if(r()<o.bones){const n=1+((r()*3)|0);for(let k=0;k<n;k++){const x=c.x+(r()-.5)*2.4,z=c.z+(r()-.5)*2.4,ry=r()*TAU;
      if(r()<.35){skulls.push([x,fy+.12,z,(r()-.5)*.4,ry,(r()-.5)*.5,.24,.22,.27]);jaws.push([x+Math.sin(ry)*.06,fy+.03,z+Math.cos(ry)*.06,0,ry,0,.2,.06,.17]);}
      else bones.push([x,fy+.04,z,0,ry,(r()-.5)*.3,.07,.07,.35+r()*.35]);}}
    if(r()<o.stal){const n=1+((r()*3)|0);for(let k=0;k<n;k++){const x=c.x+(r()-.5)*2.2,z=c.z+(r()-.5)*2.2,len=.5+r()*(o.cave?1.6:1),rad=.1+r()*(o.cave?.32:.2);
      stal.push([x,y0+o.ceil-len/2+.05,z,Math.PI,r()*3,0,rad,len,rad]);if(r()<.55)DRIPS.push({x,y:y0+o.ceil-len,z,fy,rk:o.rk});}}
    if(o.cave&&wn>0&&r()<.2){const len=.3+r()*.8,rad=.14+r()*.25;mites.push([c.x+(r()-.5)*2.2,fy+len/2,c.z+(r()-.5)*2.2,0,r()*3,0,rad,len,rad]);}
    if(r()<o.puddles)pud.push([c.x+(r()-.5)*1.4,fy+.025,c.z+(r()-.5)*1.4,-Math.PI/2,0,r()*3,.6+r()*.9,.4+r()*.6,1]);}
  const bg=new THREE.BoxGeometry(1,1,1),cg=new THREE.ConeGeometry(1,1,6);
  instM(bg,BONE_M,bones,o.add);instM(bg,BONE_M,skulls,o.add,true);instM(bg,BONE_M,jaws,o.add);
  instM(cg,o.stalM,stal,o.add);instM(cg,o.stalM,mites,o.add);instM(new THREE.CircleGeometry(1,12),PUDDLE_M,pud,o.add);}
// Tynnyri: puulieriö kahdella rautavanteella, kansi irtoaa avattaessa. Sisältö satunnainen, avaus tallentuu flags.rc[key].
const BARREL_LOOT=[[['liha',2]],[['nuolet',10]],[['pihka',3]],[['hiili',4]],[['marjat',4]],[['kupari',2]],[['rautamalmi',2]],[['nahka',2]],[['sieni',3]]];
function buildBarrel(add,cols,its,x,y,z,key,li){
  const g=new THREE.Group();g.position.set(x,y,z);const wd=mat(0x6b4527),ir=mat(0x3a3836,{metalness:.5});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.4,.36,1,10),wd);body.position.y=.5;body.castShadow=true;g.add(body);
  for(const yy of [.22,.78]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.415,.415,.06,10),ir);b.position.y=yy;g.add(b);}
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(.37,.37,.06,10),mat(0x5a3a20));lid.position.y=1.02;g.add(lid);add(g);
  cols.push(addCircle(x,z,.44,y,y+1.05,'static'));
  // Kansi avataan laiskasti (label-kutsussa): tynnyreitä rakennetaan myös latauksessa ennen kuin flags on olemassa.
  let lidOpen=false;const open=()=>{lidOpen=true;lid.position.set(.35,.6,0);lid.rotation.z=1.3;};
  const it={x,y:y+.8,z,r:2.2,label:()=>{if(!lidOpen&&fo('rc')[key])open();return foundEmpty(key)?'Tynnyri (tyhjä)':'Avaa tynnyri';},use:()=>{const first=!fo('rc')[key];
    openFound(key,'Tynnyri',first?BARREL_LOOT[li%BARREL_LOOT.length]:null);if(first){fo('rc')[key]=1;open();burst(x,y+1,z,0x8a5a32,8,2);}}};
  interactables.push(it);its.push(it);}

/* ---------------- SISÄTILAN RAKENTAMINEN (laiska: vasta ensimmäisellä käynnillä) ---------------- */
function disposeRealm(id){const R=BUILT[id];if(!R)return;
  scene.remove(R.g);R.g.traverse(o=>{if(o.geometry)o.geometry.dispose();});
  for(const c of R.cols)gridRemove(c);
  for(const it of R.its){const i=interactables.indexOf(it);if(i>=0)interactables.splice(i,1);}
  for(const v of R.vl||[]){const i=VENTS.indexOf(v);if(i>=0)VENTS.splice(i,1);}
  for(let i=DRIPS.length-1;i>=0;i--)if(DRIPS[i].rk===id)DRIPS.splice(i,1);
  for(const l of R.ls){const i=lightSources.indexOf(l);if(i>=0)lightSources.splice(i,1);}
  delete BUILT[id];}
function resetRealms(){for(const id of Object.keys(BUILT))disposeRealm(id);}
function ensureRealm(id){
  const seeds=fo('rs');if(!seeds[id])seeds[id]=1+((Math.random()*1e9)|0);
  if(BUILT[id]&&BUILT[id].seed!==seeds[id])disposeRealm(id);
  if(BUILT[id])return BUILT[id];
  const D=REALMS[id],seed=seeds[id],r=mulberry32(seed),gen=D.gen==='maze'?genMaze:D.gen==='rooms'?genRooms:genCave,cave=D.gen==='cave';
  const g=gen(D.W,D.H,r),L=finishRealm(g,r,D),W=D.W,H=D.H,y0=DUN.y,hg=(ix,iz)=>L.hgt[iz*W+ix];
  const R=BUILT[id]={seed,g:new THREE.Group(),objs:[],cols:[],its:[],ls:[],mobs:[],boss:null,entry:null,spw:null};scene.add(R.g);
  const cell=(ix,iz)=>({x:D.cx+(ix-W/2+.5)*DC,z:D.cz+(iz-H/2+.5)*DC});
  const add=o=>{R.g.add(o);return o;};
  const box=(a,b,c,d,e,f)=>{const o=addBox(a,b,c,d,e,f,'static');R.cols.push(o);return o;};
  const lit=(x,y,z,c,i)=>{const l={x,y,z,c,i,on:()=>true,dun:true};lightSources.push(l);R.ls.push(l);return l;};
  const isW=(x,z)=>x<0||z<0||x>=W||z>=H||g[z][x]==='#';
  const vis=(x,z)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(!isW(x+b,z+a))return true;return false;};
  const wallsV=[];for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(g[z][x]==='#'&&vis(x,z))wallsV.push([x,z]);
  const wallM=new THREE.MeshStandardMaterial({map:TEX.stone,roughness:cave?.5:.72,metalness:.05,color:D.wall,flatShading:cave});
  // Luolassa seinät ovat epäsäännöllisiä kivimöhkäleitä (törmäys silti ruutulaatikoina); sisäänkäynnin seinä on tasainen, jotta portti näkyy
  const nearEnt=(x,z)=>Math.max(Math.abs(x-(L.ent.ix-1)),Math.abs(z-L.ent.iz))<=1,boxW=cave?wallsV.filter(([x,z])=>nearEnt(x,z)):wallsV;
  instM(new THREE.BoxGeometry(DC,RCH,DC),wallM,boxW.map(([x,z])=>{const p=cell(x,z);return[p.x,y0+RCH/2,p.z,0,0,0,1,1,1];}),add);
  if(cave){const rocks=[],shade=t=>rockC(D.wall,t);
    for(const [x,z] of wallsV){if(nearEnt(x,z))continue;const p=cell(x,z);
      for(let k=0;k<3;k++){const sh=1.55+r()*.45;rocks.push([p.x+(r()-.5)*.3,y0+.9+k*2.6+r()*.6,p.z+(r()-.5)*.3,(r()-.5)*.3,r()*TAU,(r()-.5)*.3,sh,1.6+r()*.9,sh*(.85+r()*.2),shade(r())]);}}
    for(const [x,z] of L.floors){const p=cell(x,z);if(r()<.45){const s=1.2+r()*1.3;rocks.push([p.x+(r()-.5)*1.5,y0+RCH+.35,p.z+(r()-.5)*1.5,r(),r()*TAU,r(),s,.6+r()*.7,s,shade(r()*.6)]);}
      if(L.wallN(x,z)>0&&r()<.35){const s=.25+r()*.35;rocks.push([p.x+(r()-.5)*2.2,y0+hg(x,z)+s*.4,p.z+(r()-.5)*2.2,r(),r()*TAU,r(),s,s*.7,s,shade(r())]);}}
    instM(new THREE.IcosahedronGeometry(1,1),wallM,rocks,add);
    const fM=new THREE.MeshStandardMaterial({map:TEX.stone,color:0xffffff,roughness:.45,metalness:.08,flatShading:true});
    instM(new THREE.BoxGeometry(DC,1,DC),fM,L.floors.map(([x,z])=>{const p=cell(x,z),h=hg(x,z);return[p.x,y0-.2+h/2,p.z,(r()-.5)*.03,0,(r()-.5)*.03,1,.4+h,1,rockC(D.floor,r())];}),add);
    for(let z=0;z<H;z++){let x=0;while(x<W){const h=g[z][x]==='.'?hg(x,z):0;if(h>0){let e=x;while(e+1<W&&g[z][e+1]==='.'&&hg(e+1,z)===h)e++;const a=cell(x,z),b=cell(e,z);box(a.x-DC/2,y0,a.z-DC/2,b.x+DC/2,y0+h,b.z+DC/2);x=e+1;}else x++;}}}
  for(let z=0;z<H;z++){let x=0;while(x<W){if(g[z][x]==='#'&&vis(x,z)){let e=x;while(e+1<W&&g[z][e+1]==='#'&&vis(e+1,z))e++;const a=cell(x,z),b=cell(e,z);box(a.x-DC/2,y0,a.z-DC/2,b.x+DC/2,y0+RCH,b.z+DC/2);x=e+1;}else x++;}}
  const fw=W*DC,fh=H*DC;
  const fl=bx(fw,.4,fh,new THREE.MeshStandardMaterial({map:TEX.stone.clone(),color:D.floor,roughness:.6,metalness:.05}),D.cx,y0-.21,D.cz,false);fl.material.map.repeat.set(W,H);fl.material.map.needsUpdate=true;add(fl);
  box(D.cx-fw/2,y0-1,D.cz-fh/2,D.cx+fw/2,y0,D.cz+fh/2);
  add(bx(fw,.4,fh,mat(0x1d1a17),D.cx,y0+RCH+.2,D.cz,false));
  box(D.cx-fw/2,y0+RCH,D.cz-fh/2,D.cx+fw/2,y0+RCH+.8,D.cz+fh/2).noGround=true;
  for(const [ix,iz,dir] of L.torches){const p=cell(ix,iz),fy=y0+hg(ix,iz),T=dir?wallTorch(R.g,p.x,fy,p.z,dir,cave?DC/2-.55:DC/2-.04):brazier(R.g,p.x,fy,p.z);lit(T.x,T.y,T.z,D.tc,1.8);}
  R.vl=[];for(const [ix,iz] of L.vents){const p=cell(ix,iz);add(bx(.9,.08,.9,mat(0x1a1714),p.x,y0+.04,p.z,false));const v={x:p.x,y:y0+.1,z:p.z,col:D.mist,rate:3.5,dun:true,acc:0};VENTS.push(v);R.vl.push(v);}
  dressFloor({r,add,cell,y0,ceil:RCH,cells:L.floors.filter(([x,z])=>!(x===L.ent.ix&&z===L.ent.iz)).map(([x,z])=>[x,z,hg(x,z),L.wallN(x,z)]),
    bones:D.gen==='rooms'?.32:.2,stal:cave?.38:.14,puddles:cave?.09:.035,cave,rk:id,stalM:new THREE.MeshStandardMaterial({color:rockC(D.wall,.3),roughness:.35,metalness:.1,flatShading:true})});
  L.barrels.forEach(([ix,iz,dir,n],i)=>{const p=cell(ix,iz);for(let k=0;k<n;k++){const off=(k-(n-1)/2)*.95,ox=dir?dir[0]*1.05+(dir[1]?off:0):off,oz=dir?dir[1]*1.05+(dir[0]?off:0):0;
    buildBarrel(add,R.cols,R.its,p.x+ox,y0,p.z+oz,`${id}:b${i}:${k}`,i*3+k+(seed&15));}});
  if(L.spw){const p=cell(L.spw.ix,L.spw.iz);
    if(fo('sd')[id])spwRubble(R,p.x,y0,p.z);
    else{const gm=new THREE.MeshBasicMaterial({color:D.glow}),sg=add(new THREE.Group()),sc=[],sb=(a,b,c,d,e,f)=>{const o=addBox(a,b,c,d,e,f,'static');sc.push(o);R.cols.push(o);};
      sg.add(bx(1.8,.5,1.8,mat(0x3a3632),p.x,y0+.25,p.z));sg.add(bx(.7,1.5,.7,mat(0x2a2622),p.x,y0+1.2,p.z));sb(p.x-.9,y0,p.z-.9,p.x+.9,y0+.5,p.z+.9);sb(p.x-.35,y0,p.z-.35,p.x+.35,y0+1.95,p.z+.35);
      for(let k=0;k<8;k++){const a=k/8*TAU;sg.add(bx(.24,.22,.27,BONE_M,p.x+Math.cos(a)*1.3,y0+.62,p.z+Math.sin(a)*1.3,false));}
      const cr=new THREE.Mesh(new THREE.OctahedronGeometry(.45,0),gm);cr.position.set(p.x,y0+2.6,p.z);sg.add(cr);
      R.spw={x:p.x,z:p.z,y:y0+2.6,y0,cr,t:SPW_T-2,list:[],hp:SPW_HP,g:sg,cols:sc,light:lit(p.x,y0+2.8,p.z,D.glow,2)};}}
  R.entry=cell(L.ent.ix,L.ent.iz);R.boss=cell(L.boss.ix,L.boss.iz);
  R.mobs=L.mobs.map(m=>({...cell(m.ix,m.iz),type:m.type}));
  L.chests.forEach((c,i)=>{const p=cell(c.ix,c.iz),key=id+':'+i,sarc=D.gen==='rooms';
    const b=bx(sarc?1.1:1,sarc?.8:.7,sarc?2.2:.65,sarc?MAT.stone:MAT.wood,p.x,y0+(sarc?.4:.35),p.z);b.add(bx(sarc?1.2:1.04,.18,sarc?2.3:.7,sarc?mat(0x6f6a62):mat(0x4a4a4a),0,sarc?.5:.38,0));add(b);
    R.cols.push(addBox(p.x-.5,y0,p.z-(sarc?1.1:.33),p.x+.5,y0+.7,p.z+(sarc?1.1:.33),'static'));
    const open=()=>{b.children[0].position.x=.5;b.children[0].rotation.z=.3;};if(fo('rc')[key])open();
    const it={x:p.x,y:y0+.8,z:p.z,r:2.6,label:()=>(sarc?'Hautakirstu':'Arkku')+(foundEmpty(key)?' (tyhjä)':'')+' – avaa',use:()=>{const first=!fo('rc')[key];
      openFound(key,sarc?'Hautakirstu':'Arkku',first?CHEST_LOOT[(i+(seed&7))%CHEST_LOOT.length]:null);if(first){fo('rc')[key]=1;open();burst(p.x,y0+1,p.z,D.glow,12,3);}}};
    interactables.push(it);R.its.push(it);});
  const ex=R.entry.x-DC/2+.15;
  const pm=new THREE.MeshBasicMaterial({color:D.glow,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false});
  add(bx(.1,2.8,1.9,pm,ex,y0+1.4,R.entry.z,false));lit(ex+1,y0+2,R.entry.z,D.glow,1.6);
  const xit={x:ex+.3,y:y0+1,z:R.entry.z,r:2.4,label:()=>'Palaa ulos',use:()=>exitRealm()};interactables.push(xit);R.its.push(xit);
  R.hgt=L.hgt;R.W=W;R.cell=cell;R.floors=L.floors;
  R.g.visible=false;
  return R;
}

/* ---------------- PORTAALIT MAAILMASSA ---------------- */
function portalFront(id){const L=LOC[id],S=LOC.spawn,perp=L.ax==='x'?'z':'x',s=Math.sign(perp==='z'?S.z-L.z:S.x-L.x)||1;
  const fx=perp==='x'?s:0,fz=perp==='z'?s:0;return{x:L.x+fx*4.2,z:L.z+fz*4.2,fx,fz};}
function buildPortal(id){
  const L=LOC[id],D=REALMS[id],y=terrainH(L.x,L.z),ax=L.ax,along=ax==='x'?[1,0]:[0,1],perp=ax==='x'?[0,1]:[1,0];
  const P3=(u,v)=>[L.x+along[0]*u+perp[0]*v,L.z+along[1]*u+perp[1]*v],dims=(a,p)=>ax==='x'?[a,p]:[p,a];
  const part=(a,h,p,u,v,yy,m)=>{const [x,z]=P3(u,v),[w,d]=dims(a,p);return stoneBox(w,h,d,x,yy,z,0,m||MAT.stone);};
  const dark=mat(0x6a665e);
  part(1.1,4.6,1.1,-2.4,0,y+2.3,dark);part(1.1,4.6,1.1,2.4,0,y+2.3,dark);part(6.4,.95,1.4,0,0,y+5.1,dark);
  part(8,.3,3,0,0,y+.15,mat(0x5b5853));part(1.5,.5,1.5,-2.4,0,y+4.8,mat(0x6f6c66));part(1.5,.5,1.5,2.4,0,y+4.8,mat(0x6f6c66));
  for(const sgn of [-1,1]){part(.5,1.6,.5,sgn*4.4,sgn*.6,y+.8,mat(0x5b5853));const [bx0,bz0]=P3(sgn*4.4,sgn*.6);const f=bx(.2,.35,.2,MAT.flame,bx0,y+1.8,bz0,false);statics.add(f);}
  const [px,pz]=P3(0,0),gm=new THREE.MeshBasicMaterial({color:D.glow,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false});
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(3.7,4.3),gm);plane.position.set(px,y+2.4,pz);plane.rotation.y=ax==='x'?0:Math.PI/2;statics.add(plane);
  const [w2,d2]=dims(3.7,.5);addBox(px-w2/2,y,pz-d2/2,px+w2/2,y+4.4,pz+d2/2,'static');
  const lock=new THREE.Group();lock.position.set(px,y+2.4,pz);lock.rotation.y=ax==='x'?0:Math.PI/2;
  const iron=mat(0x3a3a3a,{metalness:.6});lock.add(bx(.8,1,.3,iron,0,0,0),bx(.5,.5,.3,iron,0,.7,0));
  for(const a of [-.55,.55]){const c=bx(4.2,.14,.14,iron,0,0,0,false);c.rotation.z=a;lock.add(c);}statics.add(lock);
  lightSources.push({x:px,y:y+3,z:pz,c:D.glow,i:1.7,on:()=>true});
  const o={id,plane,lock,ph:Math.random()*6};PORTALS.push(o);
  interactables.push({x:px,y:y+2,z:pz,r:3.2,label:()=>portalLocked(id)?`Lukittu portti – vaatii: ${ITEMS[D.lock].n}`:`Astu portaaliin: ${D.n}`,use:()=>portalUse(id)});
}
const portalLocked=id=>!!REALMS[id].lock&&!fo('rl')[id]&&!fo('rs')[id];
function setPortalLook(id){const p=PORTALS.find(q=>q.id===id);if(!p)return;const lk=portalLocked(id);p.lock.visible=lk;p.plane.material.color.setHex(lk?0x7a1a14:REALMS[id].glow);}
function portalUse(id){
  const D=REALMS[id];
  if(!portalLocked(id)){enterRealm(id);return;}
  if(invCount(D.lock)>0){invRemove(D.lock,1);fo('rl')[id]=1;setPortalLook(id);msg(`${ITEMS[D.lock].n} sopii lukkoon – portti aukeaa!`,'loot');sfx('craft');shake(.15);return;}
  // Varmistus jumittumista vastaan: jos avaimen lähde on jo käyty (arkku avattu / edellinen pomo kaadettu) tai ulottuvuudessa on jo käyty,
  // portti aukeaa ilman avainta (avain on voinut jäädä maahan, kadota latauksessa tai päätyä arkkuun).
  if(D.alt()||fo('rs')[id]){fo('rl')[id]=1;setPortalLook(id);msg('Portti tunnistaa tekosi ja aukeaa.','loot');sfx('craft');return;}
  if(D.reveal&&!flags.disc[D.reveal]){flags.disc[D.reveal]=1;msg(`${LOC[D.reveal].name} merkittiin karttaan.`,'loot');}
  msg(`Portti on lukittu. Tarvitset: ${ITEMS[D.lock].n}. ${D.hint()}`,'warn');sfx('hit');
}
for(const id of REALM_IDS)buildPortal(id);

/* ---------------- MATKUSTUS ---------------- */
function enterRealm(id){fadeTo(()=>{
  const R=ensureRealm(id);P.inDun=true;P.realm=id;P.pos.set(R.entry.x+.6,DUN.y+.05,R.entry.z);P.vy=0;P.vel.set(0,0,0);camYaw=-Math.PI/2;P.yaw=Math.PI/2;P.spawnProt=3.2;
  for(const m of [...mobs])if(m.dun)mobRemove(m);
  if(R.spw){R.spw.t=SPW_T-2;R.spw.list=[];}
  spawnRealmMobs(id);msg(`${REALMS[id].n}. Portin suoja: et ole haavoittuva 3 sekuntiin.`);});}
function exitRealm(){fadeTo(()=>{
  const id=P.realm,F=portalFront(id);P.inDun=false;P.realm=null;P.pos.set(F.x,terrainH(F.x,F.z),F.z);P.vy=0;P.vel.set(0,0,0);camYaw=Math.atan2(-F.fx,-F.fz);P.spawnProt=3.2;
  for(const m of [...mobs])if(m.dun){if(m.def.ai==='rboss'&&!m.dead)fo('rbHp')[m.realm]=m.hp;mobRemove(m);}});}// v0.75: pomon hp säilyy
function spawnRealmMobs(id){const R=BUILT[id],dk=fo('rm')[id]||(fo('rm')[id]={});
  R.mobs.forEach((s,i)=>{if(dk[i])return;const m=realmize(spawnMob(s.type,s.x,s.z,{y:DUN.y,dun:true}),id);m.rmIdx=i;});
  if(!fo('rb')[id]){const b=spawnMob(REALMS[id].boss,R.boss.x,R.boss.z,{y:DUN.y,dun:true});b.realm=id;b.rmIdx='B';b.state='sleep';const hp=fo('rbHp')[id];if(hp)b.hp=Math.min(b.maxHp,hp);}}
// Kutsutaan, kun mobi kuolee: tallentaa vartijoiden, sisätilojen vihollisten ja pomojen kaatumisen.
function onMobKilled(m){
  if(m.siteK)fo('gk')[m.siteK+':'+m.gi]=1;
  if(m.realm&&m.rmIdx!==undefined){if(m.rmIdx==='B'){fo('rb')[m.realm]=1;msg(`${m.def.n} on kaatunut!`,'loot');sfx('roar');shake(.4);const k=REALMS[m.realm].key;if(k){giveOrDrop(k,1,m.pos.x,m.pos.y+1.2,m.pos.z);msg(`${ITEMS[k].n} – se avaa seuraavan portin.`,'loot');}}else(fo('rm')[m.realm]||(fo('rm')[m.realm]={}))[m.rmIdx]=1;}
}

/* ---------------- ULOTTUVUUSVERSIOT (v0.91, kohta 8) ---------------- */
// Ulottuvuudessa syntyvä tavallinen mobi saa teeman mukaiset lisäosat, liekkimäisesti sykkivät silmät (ulottuvuuden väri, kirkastuvat
// jahdatessa) ja satunnaiset räpäytykset, +10 % terveyttä ja lisäsaaliin (REALM_LOOT). Ulkomaailman saman lajin mobit ennallaan.
const REALM_LOOT={portal1:[['luu',1,2],['rauta',0,1]],portal2:[['kupari',1,2],['luu',1,2]],portal3:[['pihka',1,2],['kupari',0,1]]};
const REALM_EYE={portal1:0x8fe6ff,portal2:0xff8a36,portal3:0x9aff7a};
function realmize(m,id){m.realm=id;if(m.def.ai==='rboss'||m.rv)return m;m.rv=1;m.maxHp=Math.round(m.maxHp*1.1);m.hp=m.maxHp;
  const f=m.f,base=f.biped?f.torso:f.body,H=f.head,s=f.s||1,col=REALM_EYE[id];
  const add=(par,me)=>{me.castShadow=true;par.add(me);return me;};
  const sph=(par,r,mt,x,y,z,sx=1,sy=1,sz=1)=>{const me=new THREE.Mesh(new THREE.SphereGeometry(r,7,5),mt);me.position.set(x,y,z);me.scale.set(sx,sy,sz);return add(par,me);};
  const cn=(par,r,h,mt,x,y,z,rx=0,rz=0)=>{const me=new THREE.Mesh(new THREE.ConeGeometry(r,h,5),mt);me.position.set(x,y,z);me.rotation.set(rx,0,rz);return add(par,me);};
  // vartalon pinnan apupisteet: kaksijalkaisilla torso-mesh (paikallinen), nelijalkaisilla body-ryhmä (rungon korkeus by)
  const by=f.biped?0:(f.body.children[0]?f.body.children[0].position.y:.7*s),R=f.biped?.2*s:.3*s;
  if(id==='portal1'){const ice=smat(0xdff6ff,{flatShading:true,emissive:0x2a6080,emissiveIntensity:.5}),fr=smat(0xeef8ff,{flatShading:true});
    for(let i=0;i<7;i++){const a=i/7*TAU;sph(base,.06*s,fr,Math.sin(a)*R*.9,by+(f.biped?.15:.1*s)+(i%3)*.06*s,Math.cos(a)*R*.7,1.4,.5,1.2);}   // huurrekuori
    for(let i=0;i<6;i++){const a=i/6*TAU;cn(base,.025*s,(.14+(i%2)*.08)*s,ice,Math.sin(a)*R*.85,by+(f.biped?-.3*s:-.2*s),Math.cos(a)*R*.6,Math.PI);}   // jääpuikot
    for(let i=0;i<3;i++)cn(H,.02*s,.1*s,ice,(i-1)*.08*s,.42*s,-.02*s,0,(i-1)*.3);}
  else if(id==='portal2'){const robe=smat(0x3a1e1a,{flatShading:true,side:THREE.DoubleSide}),robe2=smat(0x2a1612,{flatShading:true}),br=smat(0xb07a3a,{flatShading:true,metalness:.6,roughness:.35});
    if(f.biped){const sk=new THREE.Mesh(new THREE.CylinderGeometry(.2*s,.3*s,.55*s,9,1,true),robe);sk.position.set(0,-.42*s,0);add(base,sk);
      const tc=new THREE.Mesh(new THREE.TorusGeometry(.1*s,.018*s,5,10),br);tc.rotation.x=Math.PI/2;tc.position.set(0,.06*s,0);add(H,tc);   // kaulakoru
      for(const a of [f.armL,f.armR]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.06*s,.014*s,5,8),br);ring.rotation.x=Math.PI/2;ring.position.y=-.12*s;add(a,ring);}
      for(let i=0;i<3;i++)swayAdd(f,prt(base,.12*s,.5*s,.02*s,robe2,(i-1)*.13*s,-.15*s,-.17*s),.1,1.2+i*.3);   // selkäriepu
      if(m.type==='ylimys'){for(let i=0;i<6;i++){const a=i/6*TAU;cn(H,.03*s,.12*s,br,Math.sin(a)*.17*s,.5*s,Math.cos(a)*.17*s);}const cr=new THREE.Mesh(new THREE.TorusGeometry(.18*s,.025*s,5,12),br);cr.rotation.x=Math.PI/2;cr.position.y=.45*s;add(H,cr);
        swayAdd(f,prt(base,.5*s,.9*s,.03*s,robe,0,-.15*s,-.2*s),.06,.9);}}
    else for(let i=0;i<4;i++)sph(base,.05*s,br,(i-1.5)*.1*s,by+.25*s,.3*s,1,1,1);}
  else if(id==='portal3'){const moss=smat(0x3e6a2a,{flatShading:true}),vine=smat(0x2e5a22,{flatShading:true}),mush=smat(0x9aff7a,{flatShading:true,emissive:0x3a9a3a,emissiveIntensity:.8}),stem=smat(0xe8e0c8,{flatShading:true});
    for(let i=0;i<6;i++){const a=i/6*TAU;sph(base,.07*s,moss,Math.sin(a)*R*.85,by+(f.biped?.2*s:.18*s)+(i%2)*.05*s,Math.cos(a)*R*.6,1.3,.5,1.1);}
    for(let i=0;i<4;i++){const a=i/4*TAU+.4,x=Math.sin(a)*R*.7,z=Math.cos(a)*R*.5,y=by+(f.biped?.32*s:.28*s);cn(base,.012*s,.06*s,stem,x,y,z);const cp=sph(base,.04*s,mush,x,y+.04*s,z,1.2,.6,1.2);cp.castShadow=false;}   // hohtavat sienet
    for(let i=0;i<4;i++)swayAdd(f,prt(base,.025*s,.4*s,.025*s,vine,(i-1.5)*.1*s,by+(f.biped?-.25*s:-.1*s),(f.biped?.15:.25)*s),.15,1+i*.25);}
  // silmät: etsitään pään kirkkaat MeshBasic-pallot ja lisätään liekkimäinen hehku (halo + ylös venyvä kieli)
  const eyes=[];for(const c of H.children){if(c.isMesh&&c.material&&c.material.isMeshBasicMaterial){const cc=c.material.color;if(cc.r+cc.g+cc.b>.9&&c.position.z>0)eyes.push(c);}}
  m.eyeFx=[];const gm=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  for(const e of eyes){const g=new THREE.Group();g.position.copy(e.position);g.position.z+=.01*s;H.add(g);const r=Math.max(.03,(e.geometry.parameters.radius||.03)*Math.max(e.scale.x,1));
    const halo=new THREE.Mesh(new THREE.SphereGeometry(r*1.6,8,6),gm);g.add(halo);const tongue=new THREE.Mesh(new THREE.ConeGeometry(r*1.1,r*4,6),gm);tongue.position.y=r*2;g.add(tongue);
    m.eyeFx.push({g,base:g.scale.clone(),tongue,ph:Math.random()*6});}
  m.blinkT=2+Math.random()*5;m.living=!f.biped||m.type==='hiisi';
  return m;}
// Silmien liekkimäinen sykintä (nopea epäsäännöllinen välke + hidas sykkimiskaari, kirkkaampi jahdatessa) ja räpäytykset 3–8 s välein.
function animEyes(m,dt){const chase=m.state==='chase',t=playTime;m.blinkT-=dt;const blink=m.blinkT<0&&m.blinkT>-.13;if(m.blinkT<-.13)m.blinkT=3+Math.random()*5;
  for(const e of m.eyeFx){const fl=.75+.25*Math.sin(t*17+e.ph)*Math.sin(t*6.3+e.ph*2)+.15*Math.sin(t*2.1+e.ph),k=(chase?1.35:1)*fl;
    e.g.scale.set(k,blink?.08:k*(1+.25*Math.sin(t*11+e.ph)),k);e.tongue.scale.y=.6+.6*Math.abs(Math.sin(t*9+e.ph))*(chase?1.4:1);e.tongue.visible=!blink;}}
/* ---------------- VAIHEITTAINEN POMO ---------------- */
function summonMinions(m,n){const R=REALMS[m.realm],cnt=mobs.filter(o=>o.boss===m&&!o.dead).length;
  for(let i=0;i<n&&cnt+i<4;i++){const a=i/n*TAU+Math.random(),k=realmize(spawnMob(R.mobs[0],m.pos.x+Math.cos(a)*4.5,m.pos.z+Math.sin(a)*4.5,{y:DUN.y,dun:true}),m.realm);k.boss=m;k.state='chase';}
  shockwave(m.pos.x,m.pos.y,m.pos.z,6,REALMS[m.realm].glow);}
function realmBossAI(m,dt,dx,dz,dist){
  const d=m.def,f=m.f;
  if(f.sway)for(const w of f.sway){w.m.rotation.z=w.bz+Math.sin(playTime*w.f+w.p)*w.a;w.m.rotation.x=w.bxr+Math.cos(playTime*w.f*.8+w.p)*w.a*.6;}
  if(m.state==='sleep'){if(!P.dead&&dist<d.aggro&&(P.spawnProt||0)<=0){m.state='intro';m.t=0;sfx('roar');}f.g.position.copy(m.pos);return;}
  if(m.state==='intro'){m.t+=dt;m.yaw=Math.atan2(dx,dz);f.g.position.copy(m.pos);f.g.rotation.y=m.yaw;f.armL.rotation.x=f.armR.rotation.x=-2.8*Math.min(1,m.t);
    if(m.t>2){m.state='chase';m.phase=1;sfx('roar');shake(.5);msg(`${d.n} herää!`,'warn');}return;}
  const ph=m.hp>m.maxHp*.66?1:m.hp>m.maxHp*.33?2:3;
  if(ph>(m.phase||1)){m.phase=ph;m.act=null;sfx('roar');shake(.6);shockwave(m.pos.x,m.pos.y,m.pos.z,10,REALMS[m.realm].glow);msg(`${d.n} raivostuu!`,'warn');if(d.sum.includes(ph))summonMinions(m,ph===2?2:3);}
  if(P.dead){moveMob(m,m.home.x-m.pos.x,m.home.z-m.pos.z,d.walk,dt);m.state='sleep';animMob(m,dt);return;}// v0.75: ei parane
  const sp=ph===3?1.25:ph===2?1.1:1,pr=P.spawnProt>0;
  const slow=d.kit.includes('throw')?BOSS_SLOW:1;   // v0.89: kiviä heittävä ulottuvuuspomo +10 % viive
  if(m.act){const a=m.act;a.t+=dt/slow;
    if(a.k==='swipe'){f.armR.rotation.x=a.t<.8?-2.6*a.t/.8:lerp(-2.6,-.2,Math.min(1,(a.t-.8)/.2));if(a.t>=.8&&!a.hit){a.hit=1;sfx('swing');if(dist<d.range+.8&&(Math.sin(m.yaw)*dx+Math.cos(m.yaw)*dz)/(dist||1)>.1)hurtPlayer(d.dmg,m.pos.x,m.pos.z);}if(a.t>1.4)m.act=null;}
    else if(a.k==='slam'){f.armR.rotation.x=f.armL.rotation.x=a.t<1.1?-3*a.t/1.1:lerp(-3,-.6,Math.min(1,(a.t-1.1)/.15));if(a.t>=1.1&&!a.hit){a.hit=1;sfx('slam');shake(.6);const fx=m.pos.x+Math.sin(m.yaw)*2.5,fz=m.pos.z+Math.cos(m.yaw)*2.5;shockwave(fx,m.pos.y,fz,7,REALMS[m.realm].glow);burst(fx,m.pos.y+.3,fz,REALMS[m.realm].wall,16,7);if(dist2(fx,fz,P.pos.x,P.pos.z)<49&&P.pos.y-m.pos.y<1.5)hurtPlayer(d.dmg*1.2,fx,fz);}if(a.t>1.9)m.act=null;}
    else if(a.k==='charge'){if(a.t<.6){m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),dt*6);f.g.rotation.x=-.2;}else{moveMob(m,Math.sin(m.yaw),Math.cos(m.yaw),14*sp,dt);if(!a.hit&&dist<2.8){a.hit=1;hurtPlayer(d.dmg*1.1,m.pos.x,m.pos.z);P.vel.x+=Math.sin(m.yaw)*10;P.vel.z+=Math.cos(m.yaw)*10;}}if(a.t>1.6){m.act=null;f.g.rotation.x=0;}}
    else if(a.k==='throw'){f.armR.rotation.x=-2.8*Math.min(1,a.t/.8);if(a.t>=.8&&!a.hit){a.hit=1;const hp=new V3();f.hand.getWorldPosition(hp);throwRock(hp,new V3(P.pos.x+P.vel.x*.6,P.pos.y,P.pos.z+P.vel.z*.6),22);}if(a.t>1.3)m.act=null;}
    else if(a.k==='nova'){f.armR.rotation.x=f.armL.rotation.x=-2.9*Math.min(1,a.t/1.2);if(a.t>=1.2&&!a.hit){a.hit=1;sfx('slam');shake(.7);shockwave(m.pos.x,m.pos.y,m.pos.z,11,REALMS[m.realm].glow);burst(m.pos.x,m.pos.y+.4,m.pos.z,REALMS[m.realm].glow,22,8);if(dist<11&&P.pos.y-m.pos.y<.9)hurtPlayer(d.dmg*1.1,m.pos.x,m.pos.z);}if(a.t>1.8)m.act=null;}
    else if(a.k==='summon'){f.armR.rotation.x=f.armL.rotation.x=-2.6*Math.min(1,a.t/1);if(a.t>=1&&!a.hit){a.hit=1;sfx('roar');summonMinions(m,2);m.sumT=22;}if(a.t>1.6)m.act=null;}
    f.g.position.copy(m.pos);f.g.rotation.y=m.yaw;return;}
  m.sumT=(m.sumT||0)-dt;
  if(m.atkCd<=0&&!pr){
    const nm=mobs.filter(o=>o.boss===m&&!o.dead).length;
    const kit=d.kit.filter(k=>k!=='nova'||ph>=3).filter(k=>k!=='summon'||(ph>=2&&nm<3&&m.sumT<=0));
    const near=dist<6;let pool=kit.filter(k=>near?(k==='swipe'||k==='slam'||k==='nova'):(k==='charge'||k==='throw'||k==='summon'||k==='nova'));
    if(!pool.length)pool=kit;m.act={k:pool[(Math.random()*pool.length)|0],t:0};m.atkCd=(ph===1?1.9:ph===2?1.4:1)*slow;
  }
  if(!m.act){moveMob(m,dx,dz,dist>d.range*.9?d.run*sp:0,dt);if(dist<=d.range+1)m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),dt*4);animMob(m,dt);}
  else{f.g.position.copy(m.pos);f.g.rotation.y=m.yaw;}
}

/* ---------------- PÄIVITYS ---------------- */
// Kalmanpesän murskaus hakulla. Palauttaa true, jos isku osui pesään (muut aseet eivät tee vahinkoa).
let spwWarnT=0;
function hitSpawner(w){if(!P.inDun||!P.realm)return false;const R=BUILT[P.realm],S=R&&R.spw;if(!S)return false;
  const dx=S.x-P.pos.x,dz=S.z-P.pos.z,d=Math.hypot(dx,dz),fx=Math.sin(P.yaw),fz=Math.cos(P.yaw);
  if(d>w.range+1.1||(d>1.2&&(dx*fx+dz*fz)/d<.4))return false;
  // v0.93: pesän voi murskata millä tahansa (myös nyrkillä); muulla kuin hakulla isku tekee puolet kivihakun vahingosta (2× aika)
  S.hp-=w.pick?(9+w.pick*3)*(1+.25*((w.q||1)-1)):6;if(!w.pick&&playTime>spwWarnT){spwWarnT=playTime+8;msg('Hakulla Kalmanpesä murskautuu kaksi kertaa nopeammin.');}const D=REALMS[P.realm];shake(.1);burst(S.x,S.y0+1.4,S.z,0x6e665c,8,4);burst(S.x,S.y,S.z,D.glow,5,3);
  if(S.hp>0){sfx('pick');floatText(Math.ceil(S.hp/SPW_HP*100)+' %',S.x,S.y0+3.3,S.z,'#d9d2c3');return true;}
  // tuhoutui
  R.g.remove(S.g);for(const c of S.cols){gridRemove(c);const i=R.cols.indexOf(c);if(i>=0)R.cols.splice(i,1);}if(S.light)S.light.on=()=>false;
  spwRubble(R,S.x,S.y0,S.z);fo('sd')[P.realm]=1;R.spw=null;
  {const dk=fo('rm')[P.realm]||(fo('rm')[P.realm]={});R.mobs.forEach((q,i)=>{if(dist2(q.x,q.z,S.x,S.z)<12*12)dk[i]=1;});}   // v0.93: pesän ympärille ei enää synny huoneen mobejasfx('crumble');shake(.5);shockwave(S.x,S.y0+.2,S.z,4,D.glow);burst(S.x,S.y0+1,S.z,0x6e665c,24,7);
  for(const [id,n] of [['luu',4],['kivi',4],...(P.realm==='portal2'?[['kupari',3]]:P.realm==='portal3'?[['hiidenkivi',1]]:[])])if(ITEMS[id])for(let j=0;j<n;j++)spawnDrop(id,1,S.x+(Math.random()-.5)*1.6,S.y0+1,S.z+(Math.random()-.5)*1.6);
  addXp(40,'Kalmanpesä murskattu');msg('Murskasit Kalmanpesän – se ei enää nostata vihollisia.','loot');return true;}
// Murskatun pesän rauniot: matalia kiviä ja luita (ei törmäystä)
function spwRubble(R,x,y0,z){const r=mulberry32(((x*73)^(z*37))|0);for(let k=0;k<9;k++){const a=r()*TAU,d=r()*1.1,s=.25+r()*.35;const m=bx(s,.12+r()*.25,s*(.7+r()*.6),mat(k%3?0x3a3632:0x2a2622),x+Math.cos(a)*d,y0+.08,z+Math.sin(a)*d,false);m.rotation.y=r()*3;R.g.add(m);}
  for(let k=0;k<5;k++){const a=r()*TAU,d=.6+r()*.9;const m=bx(.22,.2,.25,BONE_M,x+Math.cos(a)*d,y0+.1,z+Math.sin(a)*d,false);m.rotation.set(r(),r()*3,r());R.g.add(m);}}
let bbOwn=false;
function updateDungeons(dt){
  if(P.spawnProt>0)P.spawnProt-=dt;
  updateMist(dt);updateDrips(dt);
  for(const id in BUILT)BUILT[id].g.visible=P.inDun&&P.realm===id;
  const RR=P.inDun&&P.realm?BUILT[P.realm]:null,S=RR&&RR.spw;
  if(S){S.cr.rotation.y+=dt*1.5;S.cr.position.y=S.y+Math.sin(playTime*2)*.15;S.list=S.list.filter(m=>!m.dead&&mobs.includes(m));S.cr.scale.setScalar(S.list.length?.8:1+S.t/SPW_T*.6);
    if(!S.list.length&&!P.dead&&!(P.spawnProt>0)&&dist2(S.x,S.z,P.pos.x,P.pos.z)<26*26){S.t+=dt;if(S.t>=SPW_T){S.t=0;const D=REALMS[P.realm];
      for(let i=0;i<3;i++){const a=i/3*TAU+Math.random(),m=realmize(spawnMob(D.spw,S.x+Math.cos(a)*3.2,S.z+Math.sin(a)*3.2,{y:DUN.y,dun:true}),P.realm);m.state='chase';S.list.push(m);}
      shockwave(S.x,DUN.y+.2,S.z,5,D.glow);burst(S.x,S.y,S.z,D.glow,16,5);sfx('roar');if(!S.seen){S.seen=1;msg('Kalmanpesä herää – se nostattaa vihollisia aina kun edelliset kaatuvat.','warn');}}}}
  for(const p of PORTALS){const lk=portalLocked(p.id);if(p.lk!==lk){p.lk=lk;setPortalLook(p.id);}p.plane.material.opacity=lk?.28:.5+.2*Math.sin(playTime*2.2+p.ph);}
  const rb=P.inDun?mobs.find(m=>m.def.ai==='rboss'&&m.dun&&!m.dead&&m.state!=='sleep'):null,bar=$('#bossbar');
  if(rb){bbOwn=true;bar.hidden=false;bar.querySelector('.name').textContent=rb.def.n+(rb.phase>1?` · vaihe ${rb.phase}`:'');bar.querySelector('i').style.width=(rb.hp/rb.maxHp*100)+'%';}
  else if(bbOwn){bbOwn=false;bar.querySelector('.name').textContent='Kalmanvartija';if(!(boss&&!boss.dead))bar.hidden=true;}
}
function nearSite(x,z,r){for(const k in LOC){const L=LOC[k];if((L.kind==='portal'||L.kind==='ruin'||L.kind==='rock')&&dist2(x,z,L.x,L.z)<r*r)return true;}return false;}

/* ---------------- USVA JA HÖYRY ---------------- */
// Matala usva leijuu pelaajan ympärillä ulottuvuuksissa, Hautakummussa ja löytöpaikkojen lähellä; höyrypuhurit (VENTS) työntävät höyryä ylös.
const MIST_TEX=(function(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,2,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.5,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
const mkSprite=()=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:MIST_TEX,transparent:true,depthWrite:false,opacity:0,fog:false}));m.visible=false;scene.add(m);return{m,life:0,max:1,x:0,y:0,z:0,vx:0,vy:0,vz:0,size:4,op:.1};};
const MIST=Array.from({length:72},mkSprite), STEAM=Array.from({length:48},mkSprite), WISP=Array.from({length:48},mkSprite);
// Ulkona höyryävät paikat: kummun portti, arkkukivet ja portaalien juuret
for(const k in LOC){const L=LOC[k];if(L.kind==='rock')VENTS.push({x:L.x+1.5,y:terrainH(L.x,L.z)+.1,z:L.z+2.5,col:0xdfe8ea,rate:1.2,acc:0});if(L.kind==='portal'){const y=terrainH(L.x,L.z);for(const s of [-1,1])VENTS.push({x:L.x+(L.ax==='x'?s*4.4:.6),y:y+.1,z:L.z+(L.ax==='x'?.6:s*4.4),col:0xdfe8ea,rate:1.4,acc:0});}}
VENTS.push({x:LOC.barrow.x+9.6,y:terrainH(LOC.barrow.x+10.5,LOC.barrow.z)+.1,z:LOC.barrow.z-1,col:0xcfd4d0,rate:2.5,acc:0},{x:LOC.barrow.x+9.6,y:terrainH(LOC.barrow.x+10.5,LOC.barrow.z)+.1,z:LOC.barrow.z+1,col:0xcfd4d0,rate:2.5,acc:0});
[[5,6],[12,10],[16,2],[8,10],[17,5]].forEach(([ix,iz])=>{const p=dunCell(ix,iz);VENTS.push({x:p.x,y:DUN.y+.1,z:p.z,col:0xb8b2a6,rate:3,dun:true,acc:0});});
function updateMist(dt){
  const dun=P.inDun,D=dun&&P.realm?REALMS[P.realm]:null,q=(QUAL.lvl>=2?.4:1)*(SET.mist??1);
  let ax=P.pos.x,az=P.pos.z,on=dun,col=D?D.mist:0xa8a49a;
  if(!dun){let bd=60*60;for(const k in LOC){const L=LOC[k];if(L.kind!=='portal'&&L.kind!=='rock'&&L.kind!=='ruin'&&k!=='barrow')continue;const d2=dist2(L.x,L.z,P.pos.x,P.pos.z);if(d2<bd){bd=d2;ax=L.x;az=L.z;on=true;}}col=0xc9d6da;}
  const n=MIST.length*q;
  MIST.forEach((s,i)=>{
    if(i>=n||(!on&&s.life<=0)){s.m.visible=false;return;}
    if(s.life<=0){if(!on)return;const a=Math.random()*TAU,rr=Math.random()*(dun?15:10);s.x=ax+Math.cos(a)*rr;s.z=az+Math.sin(a)*rr;s.y=(dun?DUN.y:terrainH(s.x,s.z))+.3+Math.random()*1.1;const sp=dun?.9:.5;s.vx=(Math.random()-.5)*sp;s.vz=(Math.random()-.5)*sp;s.max=s.life=6+Math.random()*6;s.size=dun?4+Math.random()*3.5:5+Math.random()*4;s.op=dun?.17:.11;s.ph=Math.random()*6;}
    s.life-=dt;const k=s.life/s.max,f=Math.sin(Math.PI*(1-k));s.x+=(s.vx+Math.sin(playTime*.7+s.ph)*.25)*dt;s.z+=(s.vz+Math.cos(playTime*.6+s.ph)*.25)*dt;s.y+=Math.sin(playTime*.9+s.ph)*.05*dt;
    s.m.position.set(s.x,s.y,s.z);s.m.scale.setScalar(s.size*(1+.25*(1-k)));s.m.material.opacity=s.op*f;s.m.material.color.setHex(col);s.m.visible=true;});
  for(const v of VENTS){if(!!v.dun!==dun||dist2(v.x,v.z,P.pos.x,P.pos.z)>30*30)continue;v.acc+=dt*v.rate*q;
    while(v.acc>=1){v.acc--;const s=STEAM.find(o=>o.life<=0);if(!s)break;s.x=v.x+(Math.random()-.5)*.5;s.y=v.y;s.z=v.z+(Math.random()-.5)*.5;s.vx=(Math.random()-.5)*.3;s.vz=(Math.random()-.5)*.3;s.vy=.9+Math.random()*.7;s.max=s.life=2.4+Math.random()*1.2;s.col=v.col;}}
  // Usvakiehkurat: pienet, nopeammin kiertelevät hattarat sisätiloissa (lattiasta noin 3,5 m korkeuteen)
  WISP.forEach((s,i)=>{if(!dun||i>=WISP.length*q){if(s.life>0)s.life-=dt*3;s.m.visible=s.life>0&&dun;return;}
    if(s.life<=0){const a=Math.random()*TAU,rr=2+Math.random()*12;s.x=P.pos.x+Math.cos(a)*rr;s.z=P.pos.z+Math.sin(a)*rr;s.y=DUN.y+.2+Math.random()*3.3;s.ang=Math.random()*TAU;s.spd=.5+Math.random()*.9;s.turn=(Math.random()-.5)*1.6;s.max=s.life=4+Math.random()*4;s.size=1+Math.random()*1.4;}
    s.life-=dt;s.ang+=s.turn*dt;const k=s.life/s.max;s.x+=Math.cos(s.ang)*s.spd*dt;s.z+=Math.sin(s.ang)*s.spd*dt;s.y+=Math.sin(playTime*1.3+s.ang)*.12*dt;
    s.m.position.set(s.x,s.y,s.z);s.m.scale.setScalar(s.size*(1+.4*(1-k)));s.m.material.opacity=.2*Math.sin(Math.PI*(1-k));s.m.material.color.setHex(col);s.m.visible=true;});
  for(const s of STEAM){if(s.life<=0){s.m.visible=false;continue;}
    s.life-=dt;const k=s.life/s.max;s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;
    s.m.position.set(s.x,s.y,s.z);s.m.scale.setScalar(.7+(1-k)*2.8);s.m.material.opacity=.3*Math.sin(Math.PI*(1-k));s.m.material.color.setHex(s.col);s.m.visible=true;}
}

/* ---------------- TIPPUVAT PISARAT ---------------- */
// Tippukivien kärjistä (DRIPS, rk = ulottuvuuden id tai 'barrow') putoaa pisaroita, jotka roiskahtavat lattiaan renkaana.
const DROPS=Array.from({length:28},()=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.035,.13,.035),new THREE.MeshBasicMaterial({color:0xbfe6ff,transparent:true,opacity:.8}));m.visible=false;scene.add(m);return{m,v:0,fy:0,on:false};});
const SPLASH=Array.from({length:18},()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.5,.7,12),new THREE.MeshBasicMaterial({color:0xcfefff,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.visible=false;scene.add(m);return{m,t:0};});
let dripAcc=0,dripT=0,dripNear=[];
function updateDrips(dt){const rk=P.inDun?(P.realm||'barrow'):null;
  dripT-=dt;if(dripT<=0){dripT=.5;dripNear=rk?DRIPS.filter(d=>d.rk===rk&&dist2(d.x,d.z,P.pos.x,P.pos.z)<20*20):[];}
  if(rk&&dripNear.length){dripAcc+=dt*Math.min(9,dripNear.length*.8);while(dripAcc>=1){dripAcc--;const src=dripNear[(Math.random()*dripNear.length)|0],d=DROPS.find(o=>!o.on);if(!d)break;d.on=true;d.v=0;d.fy=src.fy;d.m.position.set(src.x,src.y,src.z);d.m.visible=true;}}
  for(const d of DROPS){if(!d.on)continue;if(!rk){d.on=false;d.m.visible=false;continue;}d.v+=9.8*dt;d.m.position.y-=d.v*dt;
    if(d.m.position.y<=d.fy){d.on=false;d.m.visible=false;const s=SPLASH.find(o=>o.t<=0);if(s){s.t=.45;s.m.position.set(d.m.position.x,d.fy+.03,d.m.position.z);s.m.visible=true;}}}
  for(const s of SPLASH){if(s.t<=0)continue;s.t-=dt;const k=1-s.t/.45;s.m.scale.setScalar(.12+k*.45);s.m.material.opacity=.7*(1-k);if(s.t<=0)s.m.visible=false;}}

/* ---------------- HAUTAKUMMUN KORISTEET ---------------- */
// Luut, kallot, tippukivet, lätäköt ja kolme tynnyriä kiinteään DMAP-pohjaan (pysyvät aina samoina).
(function(){const r=mulberry32(4711),cells=[];
  DMAP.forEach((row,iz)=>[...row].forEach((ch,ix)=>{if(ch==='#'||ch==='E')return;const wn=['#'===DMAP[iz][ix-1],'#'===DMAP[iz][ix+1],'#'===(DMAP[iz-1]||'')[ix],'#'===(DMAP[iz+1]||'')[ix]].filter(Boolean).length;if(ch!=='C')cells.push([ix,iz,0,wn]);}));
  dressFloor({r,add:o=>statics.add(o),cell:dunCell,y0:DUN.y,ceil:4.2,cells,bones:.3,stal:.12,puddles:.05,cave:false,rk:'barrow',stalM:new THREE.MeshStandardMaterial({color:0x7a746a,roughness:.35,metalness:.1,flatShading:true})});
  const its=[],cols=[];[[7,6],[13,7],[1,11]].forEach(([ix,iz],i)=>{const p=dunCell(ix,iz),dirs=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>(DMAP[iz+b]||'')[ix+a]==='#'),dv=dirs[0]||[0,0];
    if(DMAP[iz][ix]==='#')return;buildBarrel(o=>statics.add(o),cols,its,p.x+dv[0]*1.05,DUN.y,p.z+dv[1]*1.05,'barrow:b'+i,i*5+2);});})();
