/* Hiidenmaa – camera.js
   Kolmannen persoonan kamera */
'use strict';

/* ---------------- CAMERA ---------------- */
let shakeAmt=0;function shake(a){shakeAmt=Math.max(shakeAmt,a);}
let camD=null,camTY=null; // pehmennetty kameraetäisyys ja kohteen korkeus
function updateCamera(dt){
  /* v2.18: kun pelaaja on kokonaan veden alla (P.subm), kamera liukuu pehmeästi lähimpään zoomiin (2,2 m) ja palaa, kun pää nousee pinnalle */
  P.uwZoomK=lerp(P.uwZoomK||0,P.subm&&!P.inDun?1:0,Math.min(1,dt*2.2));
  const aim=P.drawing;const dist=lerp(aim?2.4:camDist,2.2,P.uwZoomK);
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
  // v2.18: kamera menee pinnan läpi; veden alla sumu tihenee ja tummuu syvemmällä (ja yöllä), CAM_UW = syvyys (effects.js updateWaterFx)
  {const cy=camera.position.y,s=P.inDun?-1e9:water.position.y+waveAt(camera.position.x,camera.position.z);CAM_UW=cy<s?s-cy:0;
   if(CAM_UW>0){const k=sstep(0,28,CAM_UW),l=.25+.75*(typeof lightK==='number'?lightK:1);scene.fog.color.setRGB(lerp(.11,.01,k)*l,lerp(.33,.04,k)*l,lerp(.37,.06,k)*l);
     scene.fog.near=0;scene.fog.far=lerp(30,9,k);scene.background.copy(scene.fog.color);
     for(const o of [skyDome,stars,moon,sunDisc,sunGlow,sunShafts,cloudDeck,rain,snow])o.visible=false;for(const c of CLOUDS)c.visible=false;}}   // taivas ei näy pinnan läpi (environment palauttaa joka ruutu)
}
