/* Hiidenmaa – building.js
   Rakentamisen haamu, kohdistus ruudukkoon, sijoituksen tarkistus, purku */
'use strict';

/* ---------------- BUILDING ---------------- */
let buildSel=null,buildRot=0,ghost=null,ghostOk=false,ghostPos=null;
const raycaster=new THREE.Raycaster();
function setBuildSel(t){buildSel=t;if(ghost){scene.remove(ghost);ghost=null;}if(typeof gridHelper!=='undefined'&&gridHelper)gridHelper.visible=false;if(t){ghost=buildPieceMesh(t);ghost.traverse(m=>{if(m.isMesh){m.material=MAT.ghostOk;m.castShadow=false;m.receiveShadow=false;}});scene.add(ghost);}}
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
// Kohdistustilat (vaihto G): ruudukko, puoliruudukko, vapaa, reunajatko.
const SNAP_NAMES=['ruudukko','puoli','vapaa','reuna'];
let snapMode=0,ghostRot=0,gridHelper=null,gridDiv=0;
function cycleSnap(){snapMode=(snapMode+1)%SNAP_NAMES.length;msg(`Kohdistus: ${SNAP_NAMES[snapMode]}`);}
// Läpinäkyvä ruudukko haamun ympärillä (ruudukko- ja puolitilassa).
function updateGrid(on,cx,y,cz){const div=snapMode===1?20:10;
  if(on&&(!gridHelper||gridDiv!==div)){if(gridHelper){scene.remove(gridHelper);gridHelper.geometry.dispose();}
    gridHelper=new THREE.GridHelper(10*G,div,0xffffff,0xffffff);gridHelper.material=new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.42,depthWrite:false});gridDiv=div;scene.add(gridHelper);}
  if(gridHelper){gridHelper.visible=on;if(on)gridHelper.position.set(cx,y+.04,cz);}}
const isFloor=p=>p.t==='lattia'||p.t==='tervaslattia';
const sgn=v=>v<0?-1:1;
// Reunajatko: katsottavan osan reunaan jatkoksi (seinän jatke, viereinen lattia, päälle pinoaminen).
function edgeSnap(def,hit){const p=hit.piece,n=hit.n,pt=hit.pt,top=n.y>.6,fl=isFloor(p),wall=!fl&&PIECES[p.t].snap==='wall',dx=pt.x-p.x,dz=pt.z-p.z;
  if(def.snap==='wall'){
    if(wall&&!top){const a=p.rot*Math.PI/4,ax=Math.cos(a),az=-Math.sin(a),s=sgn(dx*ax+dz*az);return{x:p.x+ax*s*G,z:p.z+az*s*G,y:p.y,rot:p.rot};}
    if(wall&&top)return{x:p.x,z:p.z,y:pt.y,rot:p.rot};
    if(fl&&top){if(Math.abs(dx)>Math.abs(dz))return{x:p.x+sgn(dx)*G/2,z:p.z,y:p.y,rot:2};return{x:p.x,z:p.z+sgn(dz)*G/2,y:p.y,rot:0};}
    return null;}
  if(def.snap==='floor'||(def.snap==='cell'&&!def.roof)){
    if(fl&&top){if(Math.abs(dx)>Math.abs(dz))return{x:p.x+sgn(dx)*G,z:p.z,y:p.y};return{x:p.x,z:p.z+sgn(dz)*G,y:p.y};}
    if(wall&&!top){const nx=Math.abs(n.x)>Math.abs(n.z)?sgn(n.x):0,nz=nx?0:sgn(n.z);return{x:p.x+nx*G/2,z:p.z+nz*G/2,y:p.y};}}
  return null;}
function updateGhost(){
  if(!ghost){updateGrid(false);return;}const hit=buildRaycast();
  if(!hit||dist2(hit.pt.x,hit.pt.z,P.pos.x,P.pos.z)>9*9){ghost.visible=false;ghostPos=null;updateGrid(false);return;}
  ghost.visible=true;const t=buildSel,def=PIECES[t],hx=hit.pt.x,hz=hit.pt.z,mode=SNAP_NAMES[snapMode],hf=mode==='puoli';let x,y,z,rot=buildRot,ox=0,oz=0,yAlign=null;
  // Maahan tähdätessä viereinen lattia määrää ruudukon paikan ja korkeuden.
  if(!hit.piece){let best=null,bd=(1.6*G)**2;for(const p of pieces){if(!isFloor(p))continue;const d=dist2(p.x,p.z,hx,hz);if(d<bd&&Math.abs(terrainH(hx,hz)-p.y)<1.6){bd=d;best=p;}}if(best){ox=best.x-G/2;oz=best.z-G/2;yAlign=best.y;}}
  else if(isFloor(hit.piece)){ox=hit.piece.x-G/2;oz=hit.piece.z-G/2;}
  const cell=(v,o)=>Math.floor((v-o)/G)*G+G/2+o,edge=(v,o)=>Math.round((v-o)/G)*G+o,half=(v,o)=>Math.round((v-o)/(G/2))*(G/2)+o,fr=v=>Math.round(v*4)/4;
  const baseY=hit.n.y>.6?hit.pt.y:(hit.piece?hit.piece.y:hit.pt.y);
  const es=mode==='reuna'&&hit.piece?edgeSnap(def,hit):null;
  if(es){x=es.x;z=es.z;y=es.y;if(es.rot!==undefined)rot=es.rot;}
  else if(mode==='vapaa'){x=fr(hx);z=fr(hz);y=hit.piece?baseY:def.snap==='floor'?Math.round(baseY*4)/4+.1:def.snap==='cell'?baseY:terrainH(x,z);}
  else if(def.snap==='floor'||def.snap==='cell'){x=hf?half(hx,ox):cell(hx,ox);z=hf?half(hz,oz):cell(hz,oz);
    y=hit.piece?baseY:def.snap==='floor'?(yAlign!==null?yAlign:Math.round(baseY*4)/4+.1):baseY;}
  else if(def.snap==='wall'){const diag=rot%2===1,alongX=!diag&&((rot>>1)&1)===0;
    if(hf){x=half(hx,ox);z=half(hz,oz);}
    else if(diag){x=cell(hx,ox);z=cell(hz,oz);}
    else if(alongX){x=def.span2?edge(hx,ox):cell(hx,ox);z=edge(hz,oz);}
    else{x=edge(hx,ox);z=def.span2?edge(hz,oz):cell(hz,oz);}
    y=hit.piece?baseY:yAlign!==null?yAlign:Math.min(terrainH(x-G/2,z),terrainH(x+G/2,z),terrainH(x,z-G/2),terrainH(x,z+G/2))-.05;
    // Seinä ja ovi asettuvat viereisen lattian pintaan, ettei aukko jää lattiaa matalammaksi.
    const fl=floorAtEdge(x,z,y);if(fl!==null)y=fl;}
  else{x=hf?half(hx,ox):cell(hx,ox);z=hf?half(hz,oz):cell(hz,oz);if(def.snap==='free'&&!hf){x=fr(hx);z=fr(hz);}y=hit.piece?baseY:terrainH(x,z);}
  ghost.position.set(x,y,z);ghost.rotation.y=rot*Math.PI/4;ghostPos={x,y,z};ghostRot=rot;
  ghostOk=validPlace(t,x,y,z,rot);
  const m=ghostOk?MAT.ghostOk:MAT.ghostBad;ghost.traverse(o=>{if(o.isMesh)o.material=m;});
  const step=hf?G/2:G;updateGrid(mode==='ruudukko'||hf,ox+Math.round((x-ox)/step)*step,y,oz+Math.round((z-oz)/step)*step);
}
function floorAtEdge(x,z,y){let best=null;for(const p of pieces){if(p.t!=='lattia'&&p.t!=='tervaslattia')continue;if(Math.abs(p.y-y)>1.3)continue;if(dist2(p.x,p.z,x,z)<=(G/2+.05)**2&&(best===null||p.y>best))best=p.y;}return best;}
let lastInvalid='';
function validPlace(t,x,y,z,rot){
  const def=PIECES[t];lastInvalid='';
  if(P.inDun){lastInvalid='Täällä ei voi rakentaa.';return false;}
  for(const [id,n] of Object.entries(def.req))if(invCount(id)<n){lastInvalid=`Tarvitset: ${reqText(def.req)}`;return false;}
  if(!def.noBench&&!nearPiece('tyopenkki',x,z,BENCH_R)){lastInvalid=pieces.some(p=>p.t==='tyopenkki')?'Rakenna työpenkin alueelle (oranssi raja).':'Rakenna ensin työpenkki.';return false;}
  if(y<-.4&&t!=='lattia'&&t!=='tervaslattia'&&t!=='pylvas'){lastInvalid='Liian syvällä vedessä.';return false;}
  if(t==='katto'){for(const p of pieces)if(p.t==='katto'&&Math.abs(p.x-x)<.1&&Math.abs(p.z-z)<.1&&Math.abs(p.y-y)<.5){lastInvalid='Paikalla on jo katto.';return false;}
    for(const b of worldBoxes(t,x,y,z,rot)){const px=clamp(P.pos.x,b.minX,b.maxX),pz=clamp(P.pos.z,b.minZ,b.maxZ);if(dist2(px,pz,P.pos.x,P.pos.z)<.16&&b.maxY>P.pos.y+.3&&b.minY<P.pos.y+1.8){lastInvalid='Seisot tiellä.';return false;}}
    return true;}
  // Sama osa samaan paikkaan (myös kääntämällä) on kielletty.
  for(const p of pieces)if(p.t===t&&Math.abs(p.x-x)<.3&&Math.abs(p.z-z)<.3&&Math.abs(p.y-y)<.3&&(def.snap==='floor'||def.snap==='cell'||(p.rot-rot)%4===0)){lastInvalid='Paikalla on jo sama rakennus.';return false;}
  for(const b of worldBoxes(t,x,y,z,rot)){const s=.2;gridQuery((b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2,Math.max(b.maxX-b.minX,b.maxZ-b.minZ),_cl);
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
  addPiece(buildSel,ghostPos.x,ghostPos.y,ghostPos.z,ghostRot);sfx('build');burst(ghostPos.x,ghostPos.y+.5,ghostPos.z,0x8a5a32,6,2);
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
  if(p.t==='arkku'&&p.data.items.some(Boolean)){msg('Tyhjennä arkku ensin.','warn');return;}
  for(const [id,n] of Object.entries(PIECES[p.t].req))giveOrDrop(id,n,p.x,p.y+1,p.z);
  if(p.t==='sulatin'){if(p.data.ore)giveOrDrop('malmi',p.data.ore,p.x,p.y+1,p.z);if(p.data.iore)giveOrDrop('rautamalmi',p.data.iore,p.x,p.y+1,p.z);if(p.data.done)giveOrDrop('kupari',p.data.done,p.x,p.y+1,p.z);if(p.data.idone)giveOrDrop('rauta',p.data.idone,p.x,p.y+1,p.z);}
  removePiece(p);sfx('build');burst(p.x,p.y+.5,p.z,0x8a5a32,8,3);
}
function damagePiece(p,d,src){if(src==='mob'&&PIECES[p.t].mobProof)return;p.hp-=d;burst(p.x,p.y+1,p.z,0x8a5a32,4,2);if(p.hp>0)setPieceDamage(p);if(p.hp<=0){removePiece(p);msg(`${PIECES[p.t].n} tuhoutui!`,'warn');if(p.t==='arkku')p.data.items.forEach(s=>s&&spawnDrop(s.id,s.n,p.x,p.y+.5,p.z,s.q));}}
function reqText(req){return Object.entries(req).map(([id,n])=>`${n} ${ITEMS[id].n.toLowerCase()}`).join(', ');}
