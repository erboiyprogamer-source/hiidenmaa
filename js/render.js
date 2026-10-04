/* Hiidenmaa – render.js
   three.js-perusta: renderöijä, valot, tekstuurit, materiaalit, maastoverkko, vesi, taivas, sade */
'use strict';

/* ---------------- THREE SETUP ---------------- */
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
$('#game').appendChild(renderer.domElement);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8fbfe0);
scene.fog=new THREE.Fog(0x8fbfe0,60,220);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1000);
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
const hemi=new THREE.HemisphereLight(0xcfe4ff,0x4a3f2a,.55); scene.add(hemi);
const amb=new THREE.AmbientLight(0xffffff,.1); scene.add(amb);
const sun=new THREE.DirectionalLight(0xfff1d6,1); sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048); const sc=sun.shadow.camera; sc.left=-55;sc.right=55;sc.top=55;sc.bottom=-55;sc.near=1;sc.far=260; sun.shadow.bias=-.0006; sun.shadow.normalBias=.04;
scene.add(sun); scene.add(sun.target);
const LIGHTS=[]; for(let i=0;i<6;i++){const l=new THREE.PointLight(0xff9a40,0,16,1.6);scene.add(l);LIGHTS.push(l);}
const torchLight=new THREE.PointLight(0xffa04a,0,18,1.5); scene.add(torchLight);

function canvasTex(fn,size=64){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');fn(g,size);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;}
const texR=mulberry32(77);
const TEX={
  plank:canvasTex((g,s)=>{g.fillStyle='#8a5a32';g.fillRect(0,0,s,s);for(let y=0;y<s;y+=16){g.fillStyle='#5e3b1f';g.fillRect(0,y,s,2);for(let i=0;i<40;i++){g.fillStyle=texR()<.5?'#97653b':'#7b4f2b';g.fillRect(texR()*s|0,y+2+(texR()*13|0),4+texR()*10|0,1);} g.fillStyle='#5e3b1f';g.fillRect(((y/16)%2)*30+10,y,2,16);}}),
  stone:canvasTex((g,s)=>{g.fillStyle='#4d4b47';g.fillRect(0,0,s,s);for(let y=0;y<s;y+=16){const off=(y/16)%2*16;for(let x=-16;x<s;x+=32){const v=110+texR()*30|0;g.fillStyle=`rgb(${v},${v-2},${v-6})`;g.fillRect(x+off+1,y+1,30,14);}}}),
  thatch:canvasTex((g,s)=>{g.fillStyle='#a8873f';g.fillRect(0,0,s,s);for(let i=0;i<260;i++){g.fillStyle=texR()<.5?'#c3a252':'#8a6b2c';g.fillRect(texR()*s|0,texR()*s|0,1,3+texR()*6|0);}}),
  // Olkikaton karhea reuna: alapuoli kiinteää olkea, yläpuolella eripituisia olkia (läpinäkyvä tausta).
  thatchFringe:canvasTex((g,s)=>{g.fillStyle='#a8873f';g.fillRect(0,s/2,s,s/2);for(let x=0;x<s;x+=2){const len=6+texR()*(s/2-6)|0;g.fillStyle=texR()<.5?'#c3a252':'#8a6b2c';g.fillRect(x,s/2-len,2,len+2);}for(let i=0;i<70;i++){g.fillStyle=texR()<.5?'#c3a252':'#8a6b2c';g.fillRect(texR()*s|0,s/2+texR()*s/2|0,1,3+texR()*6|0);}}),
};
TEX.thatchFringe.repeat.set(5,1);
const matCache={};
function mat(c,o){const k=c+JSON.stringify(o||{});if(!o&&matCache[k])return matCache[k];const m=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.92,metalness:0,flatShading:true},o||{}));if(!o)matCache[k]=m;return m;}
const MAT={
  wood:new THREE.MeshStandardMaterial({map:TEX.plank,roughness:.9}),
  stone:new THREE.MeshStandardMaterial({map:TEX.stone,roughness:1}),
  thatch:new THREE.MeshStandardMaterial({map:TEX.thatch,roughness:1}),
  tarwood:new THREE.MeshStandardMaterial({map:TEX.plank,color:0x6a5444,roughness:.85}),
  thatchFringe:new THREE.MeshStandardMaterial({map:TEX.thatchFringe,roughness:1,alphaTest:.5,side:THREE.DoubleSide}),
  flame:new THREE.MeshBasicMaterial({color:0xffa53a}),
  flame2:new THREE.MeshBasicMaterial({color:0xffe08a}),
  glow:new THREE.MeshBasicMaterial({color:0x8fffee}),
  ghostOk:new THREE.MeshBasicMaterial({color:0x7fe07a,transparent:true,opacity:.42,depthWrite:false}),
  ghostBad:new THREE.MeshBasicMaterial({color:0xe05a4a,transparent:true,opacity:.42,depthWrite:false}),
};
function bx(w,h,d,m,x=0,y=0,z=0,shadow=true){const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);me.position.set(x,y,z);me.castShadow=shadow;me.receiveShadow=true;return me;}

// Laatikko, jonka tekstuuri-UV skaalataan mittoihin: lankkukuvio on kaikissa puuosissa yhtä harva kuin seinässä
// (u = pituus / G, v = korkeus / WH). Sivut: px,nx (u=syvyys,v=korkeus), py,ny (u=leveys,v=syvyys), pz,nz (u=leveys,v=korkeus).
function bxw(w,h,d,m,x=0,y=0,z=0,shadow=true){const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv,dim=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*dim[f][0]/G,uv.getY(k)*dim[f][1]/(f===2||f===3?G:WH));}
  const me=new THREE.Mesh(geo,m);me.position.set(x,y,z);me.castShadow=shadow;me.receiveShadow=true;return me;}

/* merge helper for instanced scenery */
const _m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_s=new V3(),_p=new V3();
function part(g,color,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){_e.set(rx,ry,rz);_q.setFromEuler(_e);return{g,c:new THREE.Color(color),m:new THREE.Matrix4().compose(new V3(x,y,z),_q.clone(),new V3(sx,sy,sz))};}
function mergeParts(parts){
  const pos=[],nor=[],col=[];
  for(const p of parts){let g=p.g.index?p.g.toNonIndexed():p.g.clone();g.applyMatrix4(p.m);const pa=g.attributes.position.array,na=g.attributes.normal.array;
    for(let i=0;i<pa.length;i++){pos.push(pa[i]);nor.push(na[i]);}
    const n=pa.length/3;for(let i=0;i<n;i++){const j=hash2(i,pos.length)*.12-.06;col.push(clamp(p.c.r+j,0,1),clamp(p.c.g+j,0,1),clamp(p.c.b+j,0,1));}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeBoundingSphere();return g;
}
const vcMat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1});

/* ---------------- TERRAIN MESH ---------------- */
const terrainColors=new Float32Array(HN*HN*3);
const terrainMesh=(function buildTerrain(){
  const pos=new Float32Array(HN*HN*3);
  for(let iz=0;iz<HN;iz++)for(let ix=0;ix<HN;ix++){
    const i=iz*HN+ix,x=-HALF+ix*GS,z=-HALF+iz*GS,h=HGT[i];
    pos[i*3]=x;pos[i*3+1]=h;pos[i*3+2]=z;
    const hx=HGT[iz*HN+Math.min(ix+1,GN)]-HGT[iz*HN+Math.max(ix-1,0)],hz=HGT[Math.min(iz+1,GN)*HN+ix]-HGT[Math.max(iz-1,0)*HN+ix];
    const slope=Math.hypot(hx,hz)/(GS*2);
    const b=biomeAt(x,z,h); let c;
    const n=(vnoise(x*.35,z*.35)-.5)*.1+(vnoise(x*.05,z*.05)-.5)*.08;
    if(b==='sea')c=[.42,.38,.28];
    else if(b==='beach')c=[.78,.7,.5];
    else if(b==='meadow')c=[.43+n,.6+n,.24];
    else if(b==='forest')c=[.25+n,.42+n,.17];
    else if(b==='aarni')c=[.15+n*.6,.25+n*.6,.12];
    else if(b==='moor')c=[.36+n,.32+n,.3+n*.5];
    else c=[.48+n,.47+n,.44+n];
    if(h>33){const t=sstep(33,38,h);c=[lerp(c[0],.92,t),lerp(c[1],.94,t),lerp(c[2],.96,t)];}
    if(slope>.75&&b!=='sea'&&b!=='beach'){const t=sstep(.75,1.3,slope);c=[lerp(c[0],.45,t),lerp(c[1],.44,t),lerp(c[2],.41,t)];}
    if(Math.hypot(x-LOC.circle.x,z-LOC.circle.z)<13){c=[c[0]*.75,c[1]*.75,c[2]*.8];}
    if(Math.hypot(x-LOC.barrow.x,z-LOC.barrow.z)<10.5){c=[.33+n,.36+n,.22];}
    terrainColors[i*3]=c[0];terrainColors[i*3+1]=c[1];terrainColors[i*3+2]=c[2];
  }
  const idx=new Uint32Array(GN*GN*6);let k=0;
  for(let iz=0;iz<GN;iz++)for(let ix=0;ix<GN;ix++){const a=iz*HN+ix,b=a+HN,c=a+1,d=b+1;idx[k++]=a;idx[k++]=b;idx[k++]=c;idx[k++]=c;idx[k++]=b;idx[k++]=d;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(terrainColors,3));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1}));m.receiveShadow=true;scene.add(m);return m;
})();
const water=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.MeshStandardMaterial({color:0x2c6474,transparent:true,opacity:.8,roughness:.25,metalness:.1}));
water.rotation.x=-Math.PI/2;scene.add(water);
const stars=(function(){const g=new THREE.BufferGeometry(),p=[];const r=mulberry32(5);for(let i=0;i<700;i++){const u=r()*TAU,v=r()*.9+.05;p.push(Math.cos(u)*Math.sin(Math.acos(1-v))*400,(1-v)*400,Math.sin(u)*Math.sin(Math.acos(1-v))*400);}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));const m=new THREE.Points(g,new THREE.PointsMaterial({color:0xdde8ff,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false}));scene.add(m);return m;})();
const moonTex=canvasTex((g,s)=>{g.fillStyle='#dfe3ea';g.fillRect(0,0,s,s);const r=mulberry32(31);for(let i=0;i<14;i++){g.fillStyle=`rgba(120,128,145,${.25+r()*.3})`;g.beginPath();g.arc(r()*s,r()*s,2+r()*8,0,TAU);g.fill();}});
const moon=new THREE.Mesh(new THREE.SphereGeometry(12,16,12),new THREE.MeshBasicMaterial({map:moonTex,fog:false}));scene.add(moon);
const snow=(function(){const N=700,g=new THREE.BufferGeometry(),p=new Float32Array(N*3),r=mulberry32(13);for(let i=0;i<N;i++)p.set([(r()-.5)*50,r()*26,(r()-.5)*50],i*3);g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:.14,transparent:true,opacity:.9}));m.frustumCulled=false;m.visible=false;scene.add(m);return m;})();
const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(9,12,8),new THREE.MeshBasicMaterial({color:0xfff2c8,fog:false}));scene.add(sunDisc);
const rain=(function(){const N=900,g=new THREE.BufferGeometry(),p=new Float32Array(N*6);g.setAttribute('position',new THREE.BufferAttribute(p,3));const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xaac4d8,transparent:true,opacity:.45}));l.frustumCulled=false;l.visible=false;scene.add(l);const r=mulberry32(9);for(let i=0;i<N;i++){const x=(r()-.5)*50,y=r()*30,z=(r()-.5)*50;p.set([x,y,z,x+.05,y+.7,z],i*6);}return l;})();
