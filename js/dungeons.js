/* Hiidenmaa – dungeons.js
   Ulottuvuudet: portaalit, arvotut sisätilat (sokkelo, kammiot, luola), lukitut portit, vaiheittaiset pomot ja portaalisuoja */
'use strict';

const fo=k=>flags[k]||(flags[k]={});
const REALMS={
  portal1:{n:'Routaluola',gen:'maze',W:31,H:31,wall:0x9fb4c6,floor:0x6a7c8c,tc:0x8fd0ff,fog:0x08121a,glow:0x7fd0ff,mist:0xb8d8f0,boss:'jaajattari',mobs:['routasusi','routasusi','kalmo'],dens:.04,lock:null},
  portal2:{n:'Kalmankammio',gen:'rooms',W:43,H:35,wall:0x9a8f7e,floor:0x5c554a,tc:0xff8a36,fog:0x0d0806,glow:0xe6e0cf,mist:0xcfc4b0,boss:'kalmaherra',mobs:['kalmo','kalmo','kalmo','ylimys'],dens:.035,lock:'jaaavain'},
  portal3:{n:'Aarnihauta',gen:'cave',W:47,H:47,wall:0x6f8a5a,floor:0x4a5a3a,tc:0x9aff7a,fog:0x050c06,glow:0x7aff9a,mist:0x9fd8a0,boss:'aarnihirvio',mobs:['hiisi','hiisi','susi','kivivartija'],dens:.03,lock:'aarniavain'},
};
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
// Yhteinen viimeistely: sisäänkäynti vasempaan reunaan, pomo kauimmaiseen kohtaan (avarrettu areena), vihollisten, soihtujen ja arkkujen paikat.
function finishRealm(g,r,D){
  const H=g.length,W=g[0].length;let ent=null;
  for(let x=1;x<W-1&&!ent;x++){const zs=[];for(let z=1;z<H-1;z++)if(g[z][x]==='.')zs.push(z);if(zs.length){const z=zs[(r()*zs.length)|0];g[z][x+1]='.';ent={ix:x,iz:z};}}
  let d=bfsGrid(g,ent.ix,ent.iz),far=0,bs={ix:ent.ix,iz:ent.iz};
  for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++)if(d[z*W+x]>far){far=d[z*W+x];bs={ix:x,iz:z};}
  carve(g,bs.ix-3,bs.iz-3,bs.ix+3,bs.iz+3);d=bfsGrid(g,ent.ix,ent.iz);
  const floors=[];for(let z=1;z<H-1;z++)for(let x=1;x<W-1;x++)if(g[z][x]==='.')floors.push([x,z]);
  const wallN=(x,z)=>(g[z][x-1]==='#')+(g[z][x+1]==='#')+(g[z-1][x]==='#')+(g[z+1][x]==='#');
  const mobs=[];let mi=0;
  for(const [x,z] of floors){if(mobs.length>=34)break;if(d[z*W+x]<10||Math.max(Math.abs(x-bs.ix),Math.abs(z-bs.iz))<5)continue;if(r()<D.dens){mobs.push({ix:x,iz:z,type:D.mobs[mi++%D.mobs.length]});}}
  const torches=[],near=(a,b,k)=>Math.hypot(a[0]-b[0],a[1]-b[1])<k;
  for(const [x,z] of floors){if(torches.length>=44)break;if(wallN(x,z)>0&&r()<.22&&!torches.some(t=>near(t,[x,z],5)))torches.push([x,z]);}
  for(const [dx,dz] of [[-3,-3],[3,-3],[-3,3],[3,3]])torches.push([bs.ix+dx,bs.iz+dz]);
  const chests=[],dead=floors.filter(([x,z])=>wallN(x,z)>=3&&d[z*W+x]>10&&Math.max(Math.abs(x-bs.ix),Math.abs(z-bs.iz))>4);
  for(const c of dead){if(chests.length>=4)break;if(r()<.6&&!chests.some(t=>near(t,c,6)))chests.push(c);}
  if(chests.length<2){for(const c of floors){if(chests.length>=3)break;if(wallN(c[0],c[1])>=1&&d[c[1]*W+c[0]]>14&&r()<.05)chests.push(c);}}
  const vents=[];for(const [x,z] of floors){if(vents.length>=8)break;if(wallN(x,z)>=1&&d[z*W+x]>6&&r()<.03&&!vents.some(t=>near(t,[x,z],6)))vents.push([x,z]);}
  return{ent,boss:bs,mobs,torches,vents,chests:chests.map(([ix,iz])=>({ix,iz}))};
}

/* ---------------- SISÄTILAN RAKENTAMINEN (laiska: vasta ensimmäisellä käynnillä) ---------------- */
function disposeRealm(id){const R=BUILT[id];if(!R)return;
  for(const o of R.objs){statics.remove(o);if(o.geometry)o.geometry.dispose();}
  for(const c of R.cols)gridRemove(c);
  for(const it of R.its){const i=interactables.indexOf(it);if(i>=0)interactables.splice(i,1);}
  for(const v of R.vl||[]){const i=VENTS.indexOf(v);if(i>=0)VENTS.splice(i,1);}
  for(const l of R.ls){const i=lightSources.indexOf(l);if(i>=0)lightSources.splice(i,1);}
  delete BUILT[id];}
function resetRealms(){for(const id of Object.keys(BUILT))disposeRealm(id);}
function ensureRealm(id){
  const seeds=fo('rs');if(!seeds[id])seeds[id]=1+((Math.random()*1e9)|0);
  if(BUILT[id]&&BUILT[id].seed!==seeds[id])disposeRealm(id);
  if(BUILT[id])return BUILT[id];
  const D=REALMS[id],seed=seeds[id],r=mulberry32(seed),gen=D.gen==='maze'?genMaze:D.gen==='rooms'?genRooms:genCave;
  const g=gen(D.W,D.H,r),L=finishRealm(g,r,D),W=D.W,H=D.H,y0=DUN.y;
  const R=BUILT[id]={seed,objs:[],cols:[],its:[],ls:[],mobs:[],boss:null,entry:null};
  const cell=(ix,iz)=>({x:D.cx+(ix-W/2+.5)*DC,z:D.cz+(iz-H/2+.5)*DC});
  const add=o=>{statics.add(o);R.objs.push(o);return o;};
  const box=(a,b,c,d,e,f)=>{const o=addBox(a,b,c,d,e,f,'static');R.cols.push(o);return o;};
  const lit=(x,y,z,c,i)=>{const l={x,y,z,c,i,on:()=>true,dun:true};lightSources.push(l);R.ls.push(l);};
  const isW=(x,z)=>x<0||z<0||x>=W||z>=H||g[z][x]==='#';
  const vis=(x,z)=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(!isW(x+b,z+a))return true;return false;};
  const wallsV=[];for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(g[z][x]==='#'&&vis(x,z))wallsV.push([x,z]);
  const im=new THREE.InstancedMesh(new THREE.BoxGeometry(DC,RCH,DC),new THREE.MeshStandardMaterial({map:TEX.stone,roughness:1,color:D.wall}),wallsV.length);im.frustumCulled=false;im.receiveShadow=true;
  wallsV.forEach(([x,z],i)=>{const p=cell(x,z);_m4.makeTranslation(p.x,y0+RCH/2,p.z);im.setMatrixAt(i,_m4);});
  im.instanceMatrix.needsUpdate=true;add(im);
  for(let z=0;z<H;z++){let x=0;while(x<W){if(g[z][x]==='#'&&vis(x,z)){let e=x;while(e+1<W&&g[z][e+1]==='#'&&vis(e+1,z))e++;const a=cell(x,z),b=cell(e,z);box(a.x-DC/2,y0,a.z-DC/2,b.x+DC/2,y0+RCH,b.z+DC/2);x=e+1;}else x++;}}
  const fw=W*DC,fh=H*DC;
  const fl=bx(fw,.4,fh,new THREE.MeshStandardMaterial({map:TEX.stone.clone(),color:D.floor}),D.cx,y0-.2,D.cz,false);fl.material.map.repeat.set(W,H);fl.material.map.needsUpdate=true;add(fl);
  box(D.cx-fw/2,y0-1,D.cz-fh/2,D.cx+fw/2,y0,D.cz+fh/2);
  add(bx(fw,.4,fh,mat(0x1d1a17),D.cx,y0+RCH+.2,D.cz,false));
  box(D.cx-fw/2,y0+RCH,D.cz-fh/2,D.cx+fw/2,y0+RCH+.8,D.cz+fh/2).noGround=true;
  for(const [ix,iz] of L.torches){const p=cell(ix,iz);add(bx(.12,.6,.12,mat(0x4a2f18),p.x,y0+2.2,p.z));add(bx(.2,.25,.2,MAT.flame,p.x,y0+2.6,p.z,false));lit(p.x,y0+2.6,p.z,D.tc,1.8);}
  R.vl=[];for(const [ix,iz] of L.vents){const p=cell(ix,iz);add(bx(.9,.08,.9,mat(0x1a1714),p.x,y0+.04,p.z,false));const v={x:p.x,y:y0+.1,z:p.z,col:D.mist,rate:3.5,dun:true,acc:0};VENTS.push(v);R.vl.push(v);}
  R.entry=cell(L.ent.ix,L.ent.iz);R.boss=cell(L.boss.ix,L.boss.iz);
  R.mobs=L.mobs.map(m=>({...cell(m.ix,m.iz),type:m.type}));
  L.chests.forEach((c,i)=>{const p=cell(c.ix,c.iz),key=id+':'+i,sarc=D.gen==='rooms';
    const b=bx(sarc?1.1:1,sarc?.8:.7,sarc?2.2:.65,sarc?MAT.stone:MAT.wood,p.x,y0+(sarc?.4:.35),p.z);b.add(bx(sarc?1.2:1.04,.18,sarc?2.3:.7,sarc?mat(0x6f6a62):mat(0x4a4a4a),0,sarc?.5:.38,0));add(b);
    R.cols.push(addBox(p.x-.5,y0,p.z-(sarc?1.1:.33),p.x+.5,y0+.7,p.z+(sarc?1.1:.33),'static'));
    const it={x:p.x,y:y0+.8,z:p.z,r:2.6,label:()=>fo('rc')[key]?'Tyhjä arkku':(sarc?'Avaa hautakirstu':'Avaa arkku'),use:()=>{if(fo('rc')[key])return;fo('rc')[key]=1;b.children[0].position.x=.5;b.children[0].rotation.z=.3;
      for(const [it2,n] of CHEST_LOOT[(i+(seed&7))%CHEST_LOOT.length])giveOrDrop(it2,n,p.x,y0+1.2,p.z);sfx('pickup');burst(p.x,y0+1,p.z,D.glow,12,3);}};
    interactables.push(it);R.its.push(it);});
  const ex=R.entry.x-DC/2+.15;
  const pm=new THREE.MeshBasicMaterial({color:D.glow,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false});
  add(bx(.1,2.8,1.9,pm,ex,y0+1.4,R.entry.z,false));lit(ex+1,y0+2,R.entry.z,D.glow,1.6);
  const xit={x:ex+.3,y:y0+1,z:R.entry.z,r:2.4,label:()=>'Palaa ulos',use:()=>exitRealm()};interactables.push(xit);R.its.push(xit);
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
const portalLocked=id=>!!REALMS[id].lock&&!fo('rl')[id];
function setPortalLook(id){const p=PORTALS.find(q=>q.id===id);if(!p)return;const lk=portalLocked(id);p.lock.visible=lk;p.plane.material.color.setHex(lk?0x7a1a14:REALMS[id].glow);}
function portalUse(id){
  const D=REALMS[id];
  if(!portalLocked(id)){enterRealm(id);return;}
  if(invCount(D.lock)>0){invRemove(D.lock,1);fo('rl')[id]=1;setPortalLook(id);msg(`${ITEMS[D.lock].n} sopii lukkoon – portti aukeaa!`,'loot');sfx('craft');shake(.15);return;}
  msg(`Portti on lukittu. Tarvitset: ${ITEMS[D.lock].n}.`,'warn');sfx('hit');
}
for(const id of REALM_IDS)buildPortal(id);

/* ---------------- MATKUSTUS ---------------- */
function enterRealm(id){fadeTo(()=>{
  const R=ensureRealm(id);P.inDun=true;P.realm=id;P.pos.set(R.entry.x+.6,DUN.y+.05,R.entry.z);P.vy=0;P.vel.set(0,0,0);camYaw=-Math.PI/2;P.yaw=Math.PI/2;P.spawnProt=3.2;
  for(const m of [...mobs])if(m.dun)mobRemove(m);
  spawnRealmMobs(id);msg(`${REALMS[id].n}. Portin suoja: et ole haavoittuva 3 sekuntiin.`);});}
function exitRealm(){fadeTo(()=>{
  const id=P.realm,F=portalFront(id);P.inDun=false;P.realm=null;P.pos.set(F.x,terrainH(F.x,F.z),F.z);P.vy=0;P.vel.set(0,0,0);camYaw=Math.atan2(-F.fx,-F.fz);P.spawnProt=3.2;
  for(const m of [...mobs])if(m.dun)mobRemove(m);});}
function spawnRealmMobs(id){const R=BUILT[id],dk=fo('rm')[id]||(fo('rm')[id]={});
  R.mobs.forEach((s,i)=>{if(dk[i])return;const m=spawnMob(s.type,s.x,s.z,{y:DUN.y,dun:true});m.realm=id;m.rmIdx=i;});
  if(!fo('rb')[id]){const b=spawnMob(REALMS[id].boss,R.boss.x,R.boss.z,{y:DUN.y,dun:true});b.realm=id;b.rmIdx='B';b.state='sleep';}}
// Kutsutaan, kun mobi kuolee: tallentaa vartijoiden, sisätilojen vihollisten ja pomojen kaatumisen.
function onMobKilled(m){
  if(m.siteK)fo('gk')[m.siteK+':'+m.gi]=1;
  if(m.realm&&m.rmIdx!==undefined){if(m.rmIdx==='B'){fo('rb')[m.realm]=1;msg(`${m.def.n} on kaatunut!`,'loot');sfx('roar');shake(.4);}else(fo('rm')[m.realm]||(fo('rm')[m.realm]={}))[m.rmIdx]=1;}
}

/* ---------------- VAIHEITTAINEN POMO ---------------- */
function summonMinions(m,n){const R=REALMS[m.realm],cnt=mobs.filter(o=>o.boss===m&&!o.dead).length;
  for(let i=0;i<n&&cnt+i<4;i++){const a=i/n*TAU+Math.random(),k=spawnMob(R.mobs[0],m.pos.x+Math.cos(a)*4.5,m.pos.z+Math.sin(a)*4.5,{y:DUN.y,dun:true});k.realm=m.realm;k.boss=m;k.state='chase';}
  shockwave(m.pos.x,m.pos.y,m.pos.z,6,REALMS[m.realm].glow);}
function realmBossAI(m,dt,dx,dz,dist){
  const d=m.def,f=m.f;
  if(f.sway)for(const w of f.sway){w.m.rotation.z=w.bz+Math.sin(playTime*w.f+w.p)*w.a;w.m.rotation.x=w.bxr+Math.cos(playTime*w.f*.8+w.p)*w.a*.6;}
  if(m.state==='sleep'){if(!P.dead&&dist<d.aggro&&(P.spawnProt||0)<=0){m.state='intro';m.t=0;sfx('roar');}f.g.position.copy(m.pos);return;}
  if(m.state==='intro'){m.t+=dt;m.yaw=Math.atan2(dx,dz);f.g.position.copy(m.pos);f.g.rotation.y=m.yaw;f.armL.rotation.x=f.armR.rotation.x=-2.8*Math.min(1,m.t);
    if(m.t>2){m.state='chase';m.phase=1;sfx('roar');shake(.5);msg(`${d.n} herää!`,'warn');}return;}
  const ph=m.hp>m.maxHp*.66?1:m.hp>m.maxHp*.33?2:3;
  if(ph>(m.phase||1)){m.phase=ph;m.act=null;sfx('roar');shake(.6);shockwave(m.pos.x,m.pos.y,m.pos.z,10,REALMS[m.realm].glow);msg(`${d.n} raivostuu!`,'warn');if(d.sum.includes(ph))summonMinions(m,ph===2?2:3);}
  if(P.dead){moveMob(m,m.home.x-m.pos.x,m.home.z-m.pos.z,d.walk,dt);m.hp=Math.min(m.maxHp,m.hp+40*dt);m.state='sleep';animMob(m,dt);return;}
  const sp=ph===3?1.25:ph===2?1.1:1,pr=P.spawnProt>0;
  if(m.act){const a=m.act;a.t+=dt;
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
    if(!pool.length)pool=kit;m.act={k:pool[(Math.random()*pool.length)|0],t:0};m.atkCd=ph===1?1.9:ph===2?1.4:1;
  }
  if(!m.act){moveMob(m,dx,dz,dist>d.range*.9?d.run*sp:0,dt);if(dist<=d.range+1)m.yaw=lerpAngle(m.yaw,Math.atan2(dx,dz),dt*4);animMob(m,dt);}
  else{f.g.position.copy(m.pos);f.g.rotation.y=m.yaw;}
}

/* ---------------- PÄIVITYS ---------------- */
let bbOwn=false;
function updateDungeons(dt){
  if(P.spawnProt>0)P.spawnProt-=dt;
  updateMist(dt);
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
const MIST=Array.from({length:44},mkSprite), STEAM=Array.from({length:44},mkSprite);
// Ulkona höyryävät paikat: kummun portti, arkkukivet ja portaalien juuret
for(const k in LOC){const L=LOC[k];if(L.kind==='rock')VENTS.push({x:L.x+1.5,y:terrainH(L.x,L.z)+.1,z:L.z+2.5,col:0xdfe8ea,rate:1.2,acc:0});if(L.kind==='portal'){const y=terrainH(L.x,L.z);for(const s of [-1,1])VENTS.push({x:L.x+(L.ax==='x'?s*4.4:.6),y:y+.1,z:L.z+(L.ax==='x'?.6:s*4.4),col:0xdfe8ea,rate:1.4,acc:0});}}
VENTS.push({x:LOC.barrow.x+9.6,y:terrainH(LOC.barrow.x+10.5,LOC.barrow.z)+.1,z:LOC.barrow.z-1,col:0xcfd4d0,rate:2.5,acc:0},{x:LOC.barrow.x+9.6,y:terrainH(LOC.barrow.x+10.5,LOC.barrow.z)+.1,z:LOC.barrow.z+1,col:0xcfd4d0,rate:2.5,acc:0});
[[5,6],[12,10],[16,2],[8,10],[17,5]].forEach(([ix,iz])=>{const p=dunCell(ix,iz);VENTS.push({x:p.x,y:DUN.y+.1,z:p.z,col:0xb8b2a6,rate:3,dun:true,acc:0});});
function updateMist(dt){
  const dun=P.inDun,D=dun&&P.realm?REALMS[P.realm]:null,q=QUAL.lvl>=2?.4:1;
  let ax=P.pos.x,az=P.pos.z,on=dun,col=D?D.mist:0xa8a49a;
  if(!dun){let bd=60*60;for(const k in LOC){const L=LOC[k];if(L.kind!=='portal'&&L.kind!=='rock'&&L.kind!=='ruin'&&k!=='barrow')continue;const d2=dist2(L.x,L.z,P.pos.x,P.pos.z);if(d2<bd){bd=d2;ax=L.x;az=L.z;on=true;}}col=0xc9d6da;}
  const n=MIST.length*q;
  MIST.forEach((s,i)=>{
    if(i>=n||(!on&&s.life<=0)){s.m.visible=false;return;}
    if(s.life<=0){if(!on)return;const a=Math.random()*TAU,rr=Math.random()*(dun?15:10);s.x=ax+Math.cos(a)*rr;s.z=az+Math.sin(a)*rr;s.y=(dun?DUN.y:terrainH(s.x,s.z))+.3+Math.random()*1.1;s.vx=(Math.random()-.5)*.5;s.vz=(Math.random()-.5)*.5;s.max=s.life=6+Math.random()*6;s.size=dun?4.5+Math.random()*3:5+Math.random()*4;s.op=dun?.15:.1;}
    s.life-=dt;const k=s.life/s.max,f=Math.sin(Math.PI*(1-k));s.x+=s.vx*dt;s.z+=s.vz*dt;
    s.m.position.set(s.x,s.y,s.z);s.m.scale.setScalar(s.size*(1+.25*(1-k)));s.m.material.opacity=s.op*f;s.m.material.color.setHex(col);s.m.visible=true;});
  for(const v of VENTS){if(!!v.dun!==dun||dist2(v.x,v.z,P.pos.x,P.pos.z)>30*30)continue;v.acc+=dt*v.rate*q;
    while(v.acc>=1){v.acc--;const s=STEAM.find(o=>o.life<=0);if(!s)break;s.x=v.x+(Math.random()-.5)*.5;s.y=v.y;s.z=v.z+(Math.random()-.5)*.5;s.vx=(Math.random()-.5)*.3;s.vz=(Math.random()-.5)*.3;s.vy=.9+Math.random()*.7;s.max=s.life=2.4+Math.random()*1.2;s.col=v.col;}}
  for(const s of STEAM){if(s.life<=0){s.m.visible=false;continue;}
    s.life-=dt;const k=s.life/s.max;s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;
    s.m.position.set(s.x,s.y,s.z);s.m.scale.setScalar(.7+(1-k)*2.8);s.m.material.opacity=.3*Math.sin(Math.PI*(1-k));s.m.material.color.setHex(s.col);s.m.visible=true;}
}
