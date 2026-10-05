/* Hiidenmaa – building.js
   Rakentamisen haamu, kohdistus ruudukkoon, sijoituksen tarkistus, purku */
'use strict';

/* ---------------- BUILDING ---------------- */
let buildSel=null,buildRot=0,buildPose=0,ghost=null,ghostOk=false,ghostPos=null;
const poseOf=t=>{const d=PIECES[t];return d&&(d.flip||d.poses)?buildPose%(d.poses||4):0;};
// Shift+R: kolmion/vinoseinän asento (normaali, peilattu, ylösalaisin, ylösalaisin peilattu).
function cyclePose(){const d=buildSel&&PIECES[buildSel];if(!d||!(d.flip||d.poses)){msg('Asento vaihtuu kolmiolla, vinoseinällä, palkilla ja portailla.');return;}const n=d.poses||4;buildPose=(buildPose+1)%n;setBuildSel(buildSel);msg(`Asento ${buildPose%n+1}/${n}`);}
const raycaster=new THREE.Raycaster();
function setBuildSel(t){buildSel=t;if(ghost){scene.remove(ghost);ghost=null;}if(typeof gridHelper!=='undefined'&&gridHelper)gridHelper.visible=false;if(t){ghost=buildPieceMesh(t,poseOf(t));ghost.traverse(m=>{if(m.isMesh){m.material=MAT.ghostOk;m.castShadow=false;m.receiveShadow=false;}});scene.add(ghost);}}
function camRay(){const o=camera.position.clone(),d=new V3();camera.getWorldDirection(d);return{o,d};}
function marchTerrain(o,d,max){if(P.inDun)return null;let prev=0;for(let t=0;t<max;t+=.25){const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t;if(y<terrainH(x,z)){let a=prev,b=t;for(let i=0;i<8;i++){const m=(a+b)/2;if(o.y+d.y*m<terrainH(o.x+d.x*m,o.z+d.z*m))b=m;else a=m;}return b;}prev=t;}return null;}
function camRayPoint(max){const {o,d}=camRay();let t=marchTerrain(o,d,max);raycaster.set(o,d);raycaster.far=max;const hits=raycaster.intersectObjects(pieceRoots.concat(statics.children),true);if(hits.length&&(t===null||hits[0].distance<t))t=hits[0].distance;if(t===null)t=max;return o.addScaledVector(d,t);}
function buildRaycast(){
  const {o,d}=camRay();const max=camDist+8;
  raycaster.set(o,d);raycaster.far=max;const hits=raycaster.intersectObjects(pieceRoots,true);
  const tt=marchTerrain(o,d,max);let res=null;
  if(hits.length&&(tt===null||hits[0].distance<tt+1)){const h=hits[0];const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);let p=h.object;while(p&&!p.userData.piece)p=p.parent;res={pt:h.point,n,piece:h.object.userData.piece};}
  else if(tt!==null){res={pt:o.clone().addScaledVector(d,tt),n:new V3(0,1,0),piece:null};}
  return res;
}
// Kohdistustilat (vaihto G): ruudukko (G = 2,5 m), 1 m ruudukko, puoliruudukko, 3D (vaaka- ja pystyruudukko), vapaa, reunajatko.
// Ruudukkotiloissa kaikki osat kohdistuvat: lattiat ruutujen keskelle, seinät reunoille, pylväät kulmiin, muut ruudun keskelle.
const SNAP_NAMES=['ruudukko','1 m','puoli','3D','vapaa','reuna'];
let snapMode=0,ghostRot=0,gridHelper=null,gridDiv=0,gridHelper2=null,gridV=null;
// Pystykohdistus (H): auto, pysty (korkeus .65 m:n portain, Q/Z nostaa/laskee) ja 3D (myös seuraava kerros näkyy ruudukkona).
const VNAMES=['auto','pysty','3D'],VSTEP=WH/4;let vMode=0,buildLift=0;
function cycleVMode(){vMode=(vMode+1)%3;buildLift=0;msg(`Pystykohdistus: ${VNAMES[vMode]}${vMode?' (Q nostaa, Z laskee)':''}`);}
function liftBuild(d){if(!vMode&&SNAP_NAMES[snapMode]!=='3D')return;buildLift=clamp(buildLift+d,-8,12);}
function cycleSnap(){snapMode=(snapMode+1)%SNAP_NAMES.length;msg(`Kohdistus: ${SNAP_NAMES[snapMode]}`);}
// Läpinäkyvä ruudukko haamun ympärillä (ruudukko- ja puolitilassa).
function updateGrid(on,cx,y,cz){const mode=SNAP_NAMES[snapMode],m1=mode==='1 m',m3=mode==='3D',div=m1?25:mode==='puoli'?20:10;
  // 3D-tilassa pystyruudukko (G välein pystyviivat, kerroskorkeuden puolikkaan välein vaakaviivat) haamun kohdalla, kameraa kohti käännettynä
  if(on&&m3&&!gridV){const pts=[];for(let i=-5;i<=5;i++)pts.push(i*G,0,0,i*G,3*WH,0);for(let j=0;j<=6;j++)pts.push(-5*G,j*WH/2,0,5*G,j*WH/2,0);
    const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));gridV=new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:0xbfe6ff,transparent:true,opacity:.28,depthWrite:false}));scene.add(gridV);}
  if(gridV){gridV.visible=on&&m3;if(gridV.visible){const d=new V3();camera.getWorldDirection(d);gridV.rotation.y=Math.abs(d.x)>Math.abs(d.z)?Math.PI/2:0;gridV.position.set(cx,y,cz);}}
  if(on&&(vMode===2||m3)&&!gridHelper2){gridHelper2=new THREE.GridHelper(10*G,10,0xbfe6ff,0xbfe6ff);gridHelper2.material=new THREE.LineBasicMaterial({color:0xbfe6ff,transparent:true,opacity:.3,depthWrite:false});scene.add(gridHelper2);}
  if(gridHelper2){gridHelper2.visible=on&&(vMode===2||m3);if(gridHelper2.visible)gridHelper2.position.set(cx,y+WH+.04,cz);}
  if(on&&(!gridHelper||gridDiv!==div)){if(gridHelper){scene.remove(gridHelper);gridHelper.geometry.dispose();}
    gridHelper=new THREE.GridHelper(m1?25:10*G,div,0xffffff,0xffffff);gridHelper.material=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.42,depthWrite:false});gridDiv=div;scene.add(gridHelper);}
  if(gridHelper){gridHelper.visible=on;if(on)gridHelper.position.set(cx,y+.04,cz);}}
const isFloor=p=>{const b=bt(p.t);return b==='lattia'||b==='tervaslattia';};
// Yleinen reunakohdistus kaikille osille ja kaikissa G-tiloissa. Kohteen muoto = sen törmäyslaatikoiden yhteinen rajaus.
// Osumakohdasta päätellään alue:
//  • YLÄOSA (yläpinta tai sivun ylin kaista, 30 % korkeudesta, 0,12–0,5 m): uusi osa kohteen päälle. Suunta (dx,dz) = keskelle,
//    reunalle tai kulmaan: yläpinnalla osumakohdasta, sivulta katsottaessa katsottu sivu + vasen/oikea yläkulma.
//  • PÄÄTY (pitkän ohuen osan pääty tai sivun uloin 15 %): seinä/palkki jatkuu samaan linjaan.
//  • SIVU (vain reuna-tilassa): viereen ulospäin.
// Sijoitus akseleittain kokoeron mukaan: molemmat ohuita (alle 0,4 m) → keskitetty; ohut kohde isomman alla → kohteen
// keskilinja osan reunalle; ohut osa isomman päällä → osa kohteen reunalle/kulmaan; muuten reunat tasan.
// Lattia/katto ohuen kohteen päällä seuraa ruudukkoa: ruudukkoviivalla oleva pylväs/seinä → lattia katsotulle puolelle.
// Ruudukkotiloissa lattian yläpinta jätetään tavalliselle ruudukolle (reuna-tilassa myös lattiat kohdistuvat).
const THIN=.4,isFloorT=t=>{const b=bt(t);return b==='lattia'||b==='tervaslattia';};
function unionBox(bs){const u={minX:1e9,maxX:-1e9,minY:1e9,maxY:-1e9,minZ:1e9,maxZ:-1e9};for(const b of bs){u.minX=Math.min(u.minX,b.minX);u.maxX=Math.max(u.maxX,b.maxX);u.minY=Math.min(u.minY,b.minY);u.maxY=Math.max(u.maxY,b.maxY);u.minZ=Math.min(u.minZ,b.minZ);u.maxZ=Math.max(u.maxZ,b.maxZ);}return u;}
// Lähimmän lattian ruudukko (ox,oz) kohteen ympäriltä, jotta lattiat asettuvat samaan ruudukkoon kuin muu rakennus.
function gridOrigin(x,z){let best=null,bd=(3*G)**2;for(const p of pieces){if(!isFloor(p)||p.rot%2)continue;const d=dist2(p.x,p.z,x,z);if(d<bd){bd=d;best=p;}}return best?[best.x-G/2,best.z-G/2]:[0,0];}
function smartSnap(t,rot,pose,hit,strict,gcell){
  const T=hit.piece,TD=PIECES[T.t],tb=bt(T.t),def=PIECES[t];
  if(T.rot%2||TD.roof||/^portaat|tikkaat/.test(tb))return null;
  const tFloor=isFloorT(T.t),nFloor=isFloorT(t);if(!strict&&tFloor)return null;
  const tWall=TD.snap==='wall',nWall=def.snap==='wall',gridN=def.snap==='floor'||def.snap==='cell';
  const B=unionBox(worldBoxes(T.t,T.x,T.y,T.z,T.rot,T.f||0)),cx=(B.minX+B.maxX)/2,cz=(B.minZ+B.maxZ)/2,hx=(B.maxX-B.minX)/2,hz=(B.maxZ-B.minZ)/2,H=B.maxY-B.minY;
  const pt=hit.pt,n=hit.n,band=clamp(H*.3,.12,.5),u=(pt.x-cx)/Math.max(hx,.05),v=(pt.z-cz)/Math.max(hz,.05),dz0=h=>Math.max(.35,.12/Math.max(h,.05));
  const elong=Math.max(hx,hz)>=THIN&&Math.min(hx,hz)<THIN;
  let region=null,dx=0,dz=0,ax=null,s=0,ea=null,eg=0;
  if(n.y>.6){region='top';dx=Math.abs(u)>dz0(hx)?Math.sign(u):0;dz=Math.abs(v)>dz0(hz)?Math.sign(v):0;
    if(nWall&&tFloor&&!dx&&!dz){if(Math.abs(u)>Math.abs(v))dx=Math.sign(u)||1;else dz=Math.sign(v)||1;}}
  else if(Math.abs(n.y)<.5){ax=Math.abs(n.x)>Math.abs(n.z)?'x':'z';s=Math.sign(ax==='x'?n.x:n.z)||1;
    const a=ax==='x'?v:u,th=ax==='x'?hz:hx,hT=ax==='x'?hx:hz;
    if(H>=.35&&pt.y>B.maxY-band){region='top';const dt=Math.abs(a)>.4?Math.sign(a):0;if(ax==='x'){dx=s;dz=dt;}else{dz=s;dx=dt;}}
    else if(elong&&th<THIN&&hT>=THIN){region='end';ea=ax;eg=s;}
    else if(elong&&th>=THIN&&Math.abs(a)>.7){region='end';ea=ax==='x'?'z':'x';eg=Math.sign(a);}
    else if(strict)region='side';}
  if(!region||(region==='end'&&!nWall&&!strict))return null;
  // Seinät ja palkit: seinän päälle/jatkoksi samaan suuntaan, muuten katsotun reunan suuntaisesti.
  if(nWall){if(tWall)rot=T.rot;else if(region==='top'){if(ax)rot=ax==='x'?2:0;else if(dx&&!dz)rot=2;else if(dz&&!dx)rot=0;else if(dx&&dz)rot=Math.abs(u)>Math.abs(v)?2:0;}
    else if(region==='side')rot=ax==='x'?2:0;}
  if(rot%2)return null;
  if(nWall&&tWall&&region==='side')return null;
  const NB=unionBox(worldBoxes(t,0,0,0,rot,pose)),nhx=(NB.maxX-NB.minX)/2,nhz=(NB.maxZ-NB.minZ)/2,ncx=(NB.minX+NB.maxX)/2,ncz=(NB.minZ+NB.maxZ)/2,nb=nFloor||def.roof?0:NB.minY;
  const [ox,oz]=gridOrigin(cx,cz),frac=(c,o)=>(((c-o)/G)%1+1)%1;
  // Siirtymä kohteen keskeltä yhdellä akselilla (hT kohteen ja nh uuden osan puolikas, d suunta, po osuman puoli).
  const off=(hT,nh,d,c,o,po,axis)=>{
    if(gridN&&hT<THIN&&nh>=THIN){const f=frac(c,o);if(f<.12||f>.88)return(d||Math.sign(po)||1)*nh;if(Math.abs(f-.5)<.12)return 0;return d*nh;}
    if(hT<THIN&&nh<THIN)return 0;if(hT<THIN)return d*nh;if(nh<THIN)return d*hT;
    if(gridN&&!strict&&Math.abs(hT-nh)>.05)return gcell(axis)-c;return d*(hT-nh);};
  let x,y,z;
  if(region==='top'){
    if(nFloor&&tFloor&&n.y>.6&&(dx||dz)){if(dx&&dz){if(Math.abs(u)>Math.abs(v))dz=0;else dx=0;}x=cx+dx*(hx+nhx);z=cz+dz*(hz+nhz);y=T.y;}
    else{x=cx+off(hx,nhx,dx,cx,ox,pt.x-cx,'x');z=cz+off(hz,nhz,dz,cz,oz,pt.z-cz,'z');y=B.maxY-nb;}}
  else{const yb=tFloor?B.maxY:B.minY;y=yb-nb;
    if(region==='end'){const h=ea==='x'?hx:hz,nh=ea==='x'?nhx:nhz,o=nWall||nh>=THIN?eg*(h+nh):eg*h;
      if(ea==='x'){x=cx+o;z=cz+off(hz,nhz,0,cz,oz,pt.z-cz,'z');}else{z=cz+o;x=cx+off(hx,nhx,0,cx,ox,pt.x-cx,'x');}}
    else{const hT=ax==='x'?hx:hz,nh=ax==='x'?nhx:nhz,o=gridN&&hT<THIN&&nh>=THIN?s*nh:nh<THIN&&hT>=THIN?s*hT:s*(hT+nh);
      if(ax==='x'){x=cx+o;z=cz+off(hz,nhz,0,cz,oz,pt.z-cz,'z');}else{z=cz+o;x=cx+off(hx,nhx,0,cx,ox,pt.x-cx,'x');}}}
  return{x:x-ncx,y,z:z-ncz,rot};}
function updateGhost(){
  if(!ghost){updateGrid(false);return;}const hit=buildRaycast();
  if(!hit||dist2(hit.pt.x,hit.pt.z,P.pos.x,P.pos.z)>9*9){ghost.visible=false;ghostPos=null;updateGrid(false);return;}
  ghost.visible=true;const t=buildSel,def=PIECES[t],hx=hit.pt.x,hz=hit.pt.z,mode=SNAP_NAMES[snapMode],hf=mode==='puoli',m1=mode==='1 m',m3=mode==='3D',r1=v=>Math.round(v);let x,y,z,rot=buildRot,ox=0,oz=0,yAlign=null;
  // Maahan tähdätessä viereinen lattia määrää ruudukon paikan ja korkeuden.
  if(!hit.piece){let best=null,bd=(1.6*G)**2;for(const p of pieces){if(!isFloor(p))continue;const d=dist2(p.x,p.z,hx,hz);if(d<bd&&Math.abs(terrainH(hx,hz)-p.y)<1.6){bd=d;best=p;}}if(best){ox=best.x-G/2;oz=best.z-G/2;yAlign=best.y;}}
  else if(isFloor(hit.piece)){ox=hit.piece.x-G/2;oz=hit.piece.z-G/2;}
  const cell=(v,o)=>Math.floor((v-o)/G)*G+G/2+o,edge=(v,o)=>Math.round((v-o)/G)*G+o,half=(v,o)=>Math.round((v-o)/(G/2))*(G/2)+o,fr=v=>Math.round(v*4)/4;
  const baseY=hit.n.y>.6?hit.pt.y:(hit.piece?hit.piece.y:hit.pt.y);
  const gcell=a=>{const v=a==='x'?hx:hz,o=a==='x'?ox:oz;return m1?r1(v):hf?half(v,o):cell(v,o);};
  const es=hit.piece&&mode!=='vapaa'?smartSnap(t,rot,poseOf(t),hit,mode==='reuna',gcell):null;
  if(es){x=es.x;z=es.z;y=es.y;if(es.rot!==undefined)rot=es.rot;}
  else if(mode==='vapaa'){x=fr(hx);z=fr(hz);y=hit.piece?baseY:def.snap==='floor'?Math.round(baseY*4)/4+.1:def.snap==='cell'?baseY:terrainH(x,z);}
  else if(def.snap==='floor'||def.snap==='cell'){x=m1?r1(hx):hf?half(hx,ox):cell(hx,ox);z=m1?r1(hz):hf?half(hz,oz):cell(hz,oz);
    y=hit.piece?baseY:def.snap==='floor'?(yAlign!==null?yAlign:Math.round(baseY*4)/4+.1):baseY;}
  else if(def.snap==='wall'){const diag=rot%2===1,alongX=!diag&&((rot>>1)&1)===0;
    if(m1){x=r1(hx);z=r1(hz);}
    else if(hf){x=half(hx,ox);z=half(hz,oz);}
    else if(diag){x=cell(hx,ox);z=cell(hz,oz);}
    else if(alongX){x=def.span2?edge(hx,ox):cell(hx,ox);z=edge(hz,oz);}
    else{x=edge(hx,ox);z=def.span2?edge(hz,oz):cell(hz,oz);}
    y=hit.piece?baseY:yAlign!==null?yAlign:Math.min(terrainH(x-G/2,z),terrainH(x+G/2,z),terrainH(x,z-G/2),terrainH(x,z+G/2))-.05;
    // Seinä ja ovi asettuvat viereisen lattian pintaan, ettei aukko jää lattiaa matalammaksi.
    const fl=floorAtEdge(x,z,y);if(fl!==null)y=fl;}
  else{if(m1){x=r1(hx);z=r1(hz);}else if(hf){x=half(hx,ox);z=half(hz,oz);}else if(def.col){x=edge(hx,ox);z=edge(hz,oz);}else{x=cell(hx,ox);z=cell(hz,oz);}y=hit.piece?baseY:terrainH(x,z);}
  if(vMode||m3){const ref=hit.piece?hit.piece.y:0;y=es?y+buildLift*VSTEP:ref+Math.round((y-ref)/VSTEP)*VSTEP+buildLift*VSTEP;}
  ghost.position.set(x,y,z);ghost.rotation.y=rot*Math.PI/4;ghostPos={x,y,z};ghostRot=rot;
  ghostOk=validPlace(t,x,y,z,rot,poseOf(t));
  const m=ghostOk?MAT.ghostOk:MAT.ghostBad;ghost.traverse(o=>{if(o.isMesh)o.material=m;});
  const step=m1?1:hf?G/2:G,go=m1?0:1;updateGrid(mode==='ruudukko'||hf||m1||m3,go*ox+Math.round((x-go*ox)/step)*step,y,go*oz+Math.round((z-go*oz)/step)*step);
}
function floorAtEdge(x,z,y){let best=null;for(const p of pieces){if(!isFloor(p))continue;if(Math.abs(p.y-y)>1.3)continue;if(dist2(p.x,p.z,x,z)<=(G/2+.05)**2&&(best===null||p.y>best))best=p.y;}return best;}
let lastInvalid='';
function validPlace(t,x,y,z,rot,f=0){
  const def=PIECES[t];lastInvalid='';
  if(P.inDun){lastInvalid='Täällä ei voi rakentaa.';return false;}
  for(const [id,n] of Object.entries(def.req))if(invCount(id)<n){lastInvalid=`Tarvitset: ${reqText(def.req)}`;return false;}
  if(!def.noBench&&!nearPiece('tyopenkki',x,z,BENCH_R)){lastInvalid=pieces.some(p=>p.t==='tyopenkki')?'Rakenna työpenkin alueelle (oranssi raja).':'Rakenna ensin työpenkki.';return false;}
  if(y<-.4&&bt(t)!=='lattia'&&bt(t)!=='tervaslattia'&&!def.col){lastInvalid='Liian syvällä vedessä.';return false;}
  if(def.roof){for(const p of pieces)if(PIECES[p.t].roof&&Math.abs(p.x-x)<.1&&Math.abs(p.z-z)<.1&&Math.abs(p.y-y)<.5){lastInvalid='Paikalla on jo katto.';return false;}
    for(const b of worldBoxes(t,x,y,z,rot,f)){const px=clamp(P.pos.x,b.minX,b.maxX),pz=clamp(P.pos.z,b.minZ,b.maxZ);if(dist2(px,pz,P.pos.x,P.pos.z)<.16&&b.maxY>P.pos.y+.3&&b.minY<P.pos.y+1.8){lastInvalid='Seisot tiellä.';return false;}}
    return true;}
  // Sama osa samaan paikkaan (myös kääntämällä) on kielletty.
  for(const p of pieces)if(p.t===t&&Math.abs(p.x-x)<.3&&Math.abs(p.z-z)<.3&&Math.abs(p.y-y)<.3&&(def.snap==='floor'||def.snap==='cell'||(p.rot-rot)%4===0)){lastInvalid='Paikalla on jo sama rakennus.';return false;}
  for(const b of worldBoxes(t,x,y,z,rot,f)){const s=.2;gridQuery((b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2,Math.max(b.maxX-b.minX,b.maxZ-b.minZ),_cl);
    for(const c of _cl){const sy=Math.min(s,(b.maxY-b.minY)*.3,(c.maxY-c.minY)*.3);if(c.maxY<=b.minY+sy||c.minY>=b.maxY-sy)continue;
      if(c.t==='c'){const cx=clamp(c.x,b.minX,b.maxX),cz=clamp(c.z,b.minZ,b.maxZ);if(dist2(cx,cz,c.x,c.z)<(c.r-.05)**2){lastInvalid='Tiellä on jotain.';return false;}}
      else if(c.minX<b.maxX-s&&c.maxX>b.minX+s&&c.minZ<b.maxZ-s&&c.maxZ>b.minZ+s){lastInvalid='Päällekkäin toisen rakenteen kanssa.';return false;}}
    const px=clamp(P.pos.x,b.minX,b.maxX),pz=clamp(P.pos.z,b.minZ,b.maxZ);if(dist2(px,pz,P.pos.x,P.pos.z)<.16&&b.maxY>P.pos.y+.3&&b.minY<P.pos.y+1.8){lastInvalid='Seisot tiellä.';return false;}}
  return true;
}
function placeBuild(){
  if(!buildSel){togglePanel('build');return;}
  if(!ghostPos||!ghost||!ghost.visible)return;
  if(!ghostOk){msg(lastInvalid||'Ei voi rakentaa tähän.','warn');return;}
  const def=PIECES[buildSel];for(const [id,n] of Object.entries(def.req))invRemove(id,n);
  addPiece(buildSel,ghostPos.x,ghostPos.y,ghostPos.z,ghostRot,undefined,undefined,poseOf(buildSel));bump('built');xpFirst('b_'+buildSel,4);sfx('build');burst(ghostPos.x,ghostPos.y+.5,ghostPos.z,0x8a5a32,6,2);
}
// Vasaralla korjaus: kuluma pois, maksaa vauriota vastaavan osuuden rakennusaineista (vähintään 1).
function lookedPiece(){const {o,d}=camRay();raycaster.set(o,d);raycaster.far=camDist+7;const hits=raycaster.intersectObjects(pieceRoots,true);return hits.length?hits[0].object.userData.piece:null;}
function repairLooked(){
  const w=curWeapon();if(w.cat!=='hammer')return;const p=lookedPiece();if(!p)return;
  const max=PIECES[p.t].hp;if(p.hp>=max-.5){msg(`${PIECES[p.t].n} on ehjä.`);return;}
  const frac=1-p.hp/max,cost={};for(const [id,n] of Object.entries(PIECES[p.t].req))cost[id]=Math.max(1,Math.ceil(n*frac));
  for(const [id,n] of Object.entries(cost))if(invCount(id)<n){msg(`Korjaukseen tarvitaan: ${reqText(cost)}`,'warn');return;}
  for(const [id,n] of Object.entries(cost))invRemove(id,n);p.hp=max;setPieceDamage(p);sfx('build');burst(p.x,p.y+1,p.z,0xe8c070,8,3);msg(`${PIECES[p.t].n} korjattu.`,'loot');}
function removeLooked(){
  const w=curWeapon();if(w.cat!=='hammer'){return;}
  const {o,d}=camRay();raycaster.set(o,d);raycaster.far=camDist+7;const hits=raycaster.intersectObjects(pieceRoots,true);if(!hits.length)return;
  const p=hits[0].object.userData.piece;if(!p)return;
  if(PIECES[p.t].store&&p.data.items.some(Boolean)){msg('Tyhjennä säiliö ensin.','warn');return;}
  for(const [id,n] of Object.entries(PIECES[p.t].req))giveOrDrop(id,n,p.x,p.y+1,p.z);
  if(p.data.lv)for(let i=1;i<=p.data.lv;i++)for(const [id,n] of Object.entries(STORE_UP[i]))giveOrDrop(id,n,p.x,p.y+1,p.z);
  if(p.t==='sulatin'){if(p.data.ore)giveOrDrop('malmi',p.data.ore,p.x,p.y+1,p.z);if(p.data.iore)giveOrDrop('rautamalmi',p.data.iore,p.x,p.y+1,p.z);if(p.data.done)giveOrDrop('kupari',p.data.done,p.x,p.y+1,p.z);if(p.data.idone)giveOrDrop('rauta',p.data.idone,p.x,p.y+1,p.z);}
  removePiece(p);sfx('build');burst(p.x,p.y+.5,p.z,0x8a5a32,8,3);
}
function damagePiece(p,d,src){if(src==='mob'&&PIECES[p.t].mobProof)return;p.hp-=d;burst(p.x,p.y+1,p.z,0x8a5a32,4,2);if(p.hp>0)setPieceDamage(p);if(p.hp<=0){removePiece(p);msg(`${PIECES[p.t].n} tuhoutui!`,'warn');if(PIECES[p.t].store)p.data.items.forEach(s=>s&&spawnDrop(s.id,s.n,p.x,p.y+.5,p.z,s.q));}}
function reqText(req){return Object.entries(req).map(([id,n])=>`${n} ${ITEMS[id].n.toLowerCase()}`).join(', ');}
