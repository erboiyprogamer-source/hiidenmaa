/* Hiidenmaa – building.js
   Rakentamisen haamu, kohdistus ruudukkoon, sijoituksen tarkistus, purku */
'use strict';

/* ---------------- BUILDING ---------------- */
let buildSel=null,buildRot=0,ghost=null,ghostOk=false,ghostPos=null;
const raycaster=new THREE.Raycaster();
function setBuildSel(t){buildSel=t;if(ghost){scene.remove(ghost);ghost=null;}if(t){ghost=buildPieceMesh(t);ghost.traverse(m=>{if(m.isMesh){m.material=MAT.ghostOk;m.castShadow=false;m.receiveShadow=false;}});scene.add(ghost);}}
function camRay(){const o=camera.position.clone(),d=new V3();camera.getWorldDirection(d);return{o,d};}
function marchTerrain(o,d,max){if(P.inDun)return null;let prev=0;for(let t=0;t<max;t+=.25){const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t;if(y<terrainH(x,z)){let a=prev,b=t;for(let i=0;i<8;i++){const m=(a+b)/2;if(o.y+d.y*m<terrainH(o.x+d.x*m,o.z+d.z*m))b=m;else a=m;}return b;}prev=t;}return null;}
function camRayPoint(max){const {o,d}=camRay();let t=marchTerrain(o,d,max);raycaster.set(o,d);raycaster.far=max;const hits=raycaster.intersectObjects(pieceRoots.concat(statics.children),true);if(hits.length&&(t===null||hits[0].distance<t))t=hits[0].distance;if(t===null)t=max;return o.addScaledVector(d,t);}
function buildRaycast(){
  const {o,d}=camRay();const max=camDist+8;
  raycaster.set(o,d);raycaster.far=max;const hits=raycaster.intersectObjects(pieceRoots,true);
  const tt=marchTerrain(o,d,max);let res=null;
  if(hits.length&&(tt===null||hits[0].distance<tt)){const h=hits[0];const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);let p=h.object;while(p&&!p.userData.piece)p=p.parent;res={pt:h.point,n,piece:h.object.userData.piece};}
  else if(tt!==null){res={pt:o.clone().addScaledVector(d,tt),n:new V3(0,1,0),piece:null};}
  return res;
}
function updateGhost(){
  if(!ghost)return;const hit=buildRaycast();
  if(!hit||dist2(hit.pt.x,hit.pt.z,P.pos.x,P.pos.z)>9*9){ghost.visible=false;ghostPos=null;return;}
  ghost.visible=true;const t=buildSel,def=PIECES[t];let x,y,z;const hx=hit.pt.x,hz=hit.pt.z;
  let baseY=hit.n.y>.6?hit.pt.y:(hit.piece?hit.piece.y:hit.pt.y);
  const cell=v=>Math.floor(v/G)*G+G/2, edge=v=>Math.round(v/G)*G;
  if(def.snap==='floor'){x=cell(hx);z=cell(hz);y=hit.piece?baseY:Math.round(baseY*4)/4+.1;}
  else if(def.snap==='wall'){if(buildRot%2===0){x=cell(hx);z=edge(hz);}else{x=edge(hx);z=cell(hz);}
    y=hit.piece?baseY:Math.min(terrainH(x-G/2,z),terrainH(x+G/2,z),terrainH(x,z-G/2),terrainH(x,z+G/2))-.05;
    // Seinä ja ovi asettuvat viereisen lattian pintaan, ettei aukko jää lattiaa matalammaksi.
    const fl=floorAtEdge(x,z,y);if(fl!==null)y=fl;}
  else if(def.snap==='cell'){x=cell(hx);z=cell(hz);y=baseY;}
  else{x=Math.round(hx*4)/4;z=Math.round(hz*4)/4;y=hit.piece?baseY:terrainH(x,z);}
  ghost.position.set(x,y,z);ghost.rotation.y=buildRot*Math.PI/2;ghostPos={x,y,z};
  ghostOk=validPlace(t,x,y,z,buildRot);
  const m=ghostOk?MAT.ghostOk:MAT.ghostBad;ghost.traverse(o=>{if(o.isMesh)o.material=m;});
}
function floorAtEdge(x,z,y){let best=null;for(const p of pieces){if(p.t!=='lattia')continue;if(Math.abs(p.y-y)>1.3)continue;if(dist2(p.x,p.z,x,z)<=(G/2+.05)**2&&(best===null||p.y>best))best=p.y;}return best;}
let lastInvalid='';
function validPlace(t,x,y,z,rot){
  const def=PIECES[t];lastInvalid='';
  if(P.inDun){lastInvalid='Täällä ei voi rakentaa.';return false;}
  for(const [id,n] of Object.entries(def.req))if(invCount(id)<n){lastInvalid=`Tarvitset: ${reqText(def.req)}`;return false;}
  if(!def.noBench&&!nearPiece('tyopenkki',x,z,BENCH_R)){lastInvalid=pieces.some(p=>p.t==='tyopenkki')?'Rakenna työpenkin alueelle (oranssi raja).':'Rakenna ensin työpenkki.';return false;}
  if(y<-.4&&t!=='lattia'&&t!=='pylvas'){lastInvalid='Liian syvällä vedessä.';return false;}
  if(t==='katto'){for(const p of pieces)if(p.t==='katto'&&Math.abs(p.x-x)<.1&&Math.abs(p.z-z)<.1&&Math.abs(p.y-y)<.5){lastInvalid='Paikalla on jo katto.';return false;}
    for(const b of worldBoxes(t,x,y,z,rot)){const px=clamp(P.pos.x,b.minX,b.maxX),pz=clamp(P.pos.z,b.minZ,b.maxZ);if(dist2(px,pz,P.pos.x,P.pos.z)<.16&&b.maxY>P.pos.y+.3&&b.minY<P.pos.y+1.8){lastInvalid='Seisot tiellä.';return false;}}
    return true;}
  for(const b of worldBoxes(t,x,y,z,rot)){const s=.2;gridQuery((b.minX+b.maxX)/2,(b.minZ+b.maxZ)/2,Math.max(b.maxX-b.minX,b.maxZ-b.minZ),_cl);
    for(const c of _cl){if(c.maxY<=b.minY+s||c.minY>=b.maxY-s)continue;
      if(c.t==='c'){const cx=clamp(c.x,b.minX,b.maxX),cz=clamp(c.z,b.minZ,b.maxZ);if(dist2(cx,cz,c.x,c.z)<(c.r-.05)**2){lastInvalid='Tiellä on jotain.';return false;}}
      else if(c.minX<b.maxX-s&&c.maxX>b.minX+s&&c.minZ<b.maxZ-s&&c.maxZ>b.minZ+s){lastInvalid='Päällekkäin toisen rakenteen kanssa.';return false;}}
    const px=clamp(P.pos.x,b.minX,b.maxX),pz=clamp(P.pos.z,b.minZ,b.maxZ);if(dist2(px,pz,P.pos.x,P.pos.z)<.16&&b.maxY>P.pos.y+.3&&b.minY<P.pos.y+1.8){lastInvalid='Seisot tiellä.';return false;}}
  return true;
}
function placeBuild(){
  if(!buildSel){togglePanel('build');return;}
  if(!ghostPos||!ghost.visible)return;
  if(!ghostOk){msg(lastInvalid||'Ei voi rakentaa tähän.','warn');return;}
  const def=PIECES[buildSel];for(const [id,n] of Object.entries(def.req))invRemove(id,n);
  addPiece(buildSel,ghostPos.x,ghostPos.y,ghostPos.z,buildRot);sfx('build');burst(ghostPos.x,ghostPos.y+.5,ghostPos.z,0x8a5a32,6,2);
}
function removeLooked(){
  const w=curWeapon();if(w.cat!=='hammer'){return;}
  const {o,d}=camRay();raycaster.set(o,d);raycaster.far=camDist+7;const hits=raycaster.intersectObjects(pieceRoots,true);if(!hits.length)return;
  const p=hits[0].object.userData.piece;if(!p)return;
  if(p.t==='arkku'&&p.data.items.some(Boolean)){msg('Tyhjennä arkku ensin.','warn');return;}
  for(const [id,n] of Object.entries(PIECES[p.t].req))giveOrDrop(id,n,p.x,p.y+1,p.z);
  if(p.t==='sulatin'){if(p.data.ore)giveOrDrop('malmi',p.data.ore,p.x,p.y+1,p.z);if(p.data.done)giveOrDrop('kupari',p.data.done,p.x,p.y+1,p.z);}
  removePiece(p);sfx('build');burst(p.x,p.y+.5,p.z,0x8a5a32,8,3);
}
function damagePiece(p,d,src){if(src==='mob'&&PIECES[p.t].mobProof)return;p.hp-=d;burst(p.x,p.y+1,p.z,0x8a5a32,4,2);if(p.hp>0)setPieceDamage(p);if(p.hp<=0){removePiece(p);msg(`${PIECES[p.t].n} tuhoutui!`,'warn');if(p.t==='arkku')p.data.items.forEach(s=>s&&spawnDrop(s.id,s.n,p.x,p.y+.5,p.z,s.q));}}
function reqText(req){return Object.entries(req).map(([id,n])=>`${n} ${ITEMS[id].n.toLowerCase()}`).join(', ');}
