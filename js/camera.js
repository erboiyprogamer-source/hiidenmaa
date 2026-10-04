/* Hiidenmaa – camera.js
   Kolmannen persoonan kamera */
'use strict';

/* ---------------- CAMERA ---------------- */
let shakeAmt=0;function shake(a){shakeAmt=Math.max(shakeAmt,a);}
let camD=null,camTY=null; // pehmennetty kameraetäisyys ja kohteen korkeus
function updateCamera(dt){
  const aim=P.drawing;const dist=aim?2.4:camDist;
  const ty=P.pos.y+1.65-.45*P.crouchK;camTY=camTY===null||Math.abs(ty-camTY)>3?ty:lerp(camTY,ty,Math.min(1,dt*14));
  const tgt=_tmpV.set(P.pos.x,camTY,P.pos.z);
  const right=_tmpV2.set(Math.cos(camYaw),0,-Math.sin(camYaw));
  tgt.addScaledVector(right,aim?.75:.55);
  const dir=new V3(Math.sin(camYaw)*Math.cos(camPitch),Math.sin(camPitch),Math.cos(camYaw)*Math.cos(camPitch));
  // Esteen etäisyys tiheällä näytteistyksellä; kamera tulee lähemmäs nopeasti ja palaa hitaasti (ei nykimistä seinien vieressä).
  let dh=dist;for(let i=1;i<=30;i++){const t=dist*i/30;const x=tgt.x+dir.x*t,y=tgt.y+dir.y*t,z=tgt.z+dir.z*t;if(pointBlocked(x,y,z)||(!P.inDun&&y<terrainH(x,z)+.3)){dh=Math.max(.6,t-dist/30-.1);break;}}
  camD=camD===null?dh:lerp(camD,dh,Math.min(1,dt*(dh<camD?22:3.5)));const d=camD;
  camera.position.copy(tgt).addScaledVector(dir,d);
  if(!P.inDun){const th=terrainH(camera.position.x,camera.position.z)+.35;if(camera.position.y<th)camera.position.y=th;}
  camera.lookAt(tgt.x-dir.x,tgt.y-dir.y,tgt.z-dir.z);
  if(shakeAmt>0){camera.position.x+=(Math.random()-.5)*shakeAmt;camera.position.y+=(Math.random()-.5)*shakeAmt;shakeAmt=Math.max(0,shakeAmt-dt*1.5);}
  camera.fov=lerp(camera.fov,aim?52:65,dt*8);camera.updateProjectionMatrix();
  fig.g.visible=d>1.2;
  // underwater tint
  if(camera.position.y<water.position.y&&!P.inDun){scene.fog.color.setHex(0x1d4a56);scene.fog.near=0;scene.fog.far=18;}
}
