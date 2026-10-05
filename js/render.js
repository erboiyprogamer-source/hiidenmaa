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
const LIGHTS=[]; for(let i=0;i<6;i++){const l=new THREE.PointLight(0xff9a40,0,17,1.5);scene.add(l);LIGHTS.push(l);}
const torchLight=new THREE.PointLight(0xffa04a,0,18,1.4); scene.add(torchLight);
// Käsisoihdun täytevalo: ei varjoa, samassa paikassa → soihdun varjot jäävät himmeiksi (varjoalueet saavat täytevalon osuuden)
const torchFill=new THREE.PointLight(0xffa04a,0,18,1.4); scene.add(torchFill);
// Pimeällä lähin tuli ja käsisoihtu heittävät varjoja (pistevalon varjokartta 512 px). Varjokartta päivitetään vain pimeällä (`updateLightShadows`).
for(const l of [LIGHTS[0],torchLight]){l.castShadow=true;l.shadow.mapSize.set(384,384);l.shadow.radius=2;l.shadow.camera.near=.3;l.shadow.camera.far=15;l.shadow.bias=-.006;l.shadow.autoUpdate=false;l.shadow.needsUpdate=true;}
// Mukautuva laatu: jos kehysaika on pitkään liian korkea, laatua lasketaan (1: harvemmat pistevalovarjot, 2: aurinkovarjokartta 1024 px, 3: pistevalovarjot pois). Palautuu kun peli sujuu.
// Käsisoihdun varjo: pieni (kantama 3.2 m), matalaresoluutioinen (64 px) ja pehmeä läntti, päivittyy joka kehys (halpa, koska kamera näkee vain lähimmät esineet).
torchLight.shadow.mapSize.set(40,40);torchLight.shadow.camera.far=3.2;torchLight.shadow.camera.near=.25;torchLight.shadow.radius=3;torchLight.shadow.bias=-.01;
// Kiinteiden valojen varjokartta päivitetään harvoin; ympäristön muuttuessa (rakennus lisätty/purettu/rikottu, ovi liikkuu, puu kaatuu) lippu nostetaan ja päivitys tehdään heti.
let shDirty=true,bldDirty=true;const markShadowDirty=()=>{shDirty=true;bldDirty=true;};
const QUAL={lvl:0,pointShadow:true,sunSize:2048,max:3};
function setQuality(l){QUAL.lvl=l;QUAL.pointShadow=l<3&&SET.shadow==='high'&&SET.ptShadow!==false;const base=+SET.sunRes||2048,ss=(l>=2||SET.shadow==='low')?Math.max(512,base/2):base;if(ss!==QUAL.sunSize){QUAL.sunSize=ss;sun.shadow.mapSize.set(ss,ss);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}}

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
  doorwood:new THREE.MeshStandardMaterial({map:TEX.plank,color:0xa58468,roughness:.9}),
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
/* ---------------- TAIVAS, PILVET JA SALAMAT ---------------- */
// Taivaskupoli: liukuväri horisontista (= sumun väri) zeniittiin + auringon hehku. Seuraa kameraa, piirretään ensimmäisenä.
const SKY_U={uTop:{value:new THREE.Color(0x3d6fa8)},uHor:{value:new THREE.Color(0x8fbfe0)},uSun:{value:new THREE.Vector3(0,1,0)},uSunC:{value:new THREE.Color(0xfff1d6)},uGlow:{value:1}};
const skyDome=new THREE.Mesh(new THREE.SphereGeometry(470,24,14),new THREE.ShaderMaterial({uniforms:SKY_U,side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 uTop,uHor,uSunC,uSun;uniform float uGlow;varying vec3 vD;void main(){float h=max(vD.y,0.);vec3 c=mix(uHor,uTop,pow(smoothstep(0.,1.,h),.55));float s=max(dot(vD,normalize(uSun)),0.);c+=uSunC*(pow(s,90.)*.55+pow(s,10.)*.16+pow(s,3.)*.05)*uGlow;gl_FragColor=vec4(c,1.);}'}));
skyDome.renderOrder=-10;skyDome.frustumCulled=false;scene.add(skyDome);
// Pilvet: isoja, leveitä ja litteäpohjaisia pilvilauttoja (70–170 m), jotka levittäytyvät taivaalle. Peitto (cover) riippuu säästä: pilvet
// ilmestyvät järjestyksessä (kynnys th) ja kasvavat peiton mukana. Kaukana pilvet häipyvät horisontin väriin ja katoavat (ei piirretä R:n takana).
// Pilvet ovat aurinkoa ja kuuta lähempänä, joten ne peittävät ne luonnollisesti.
const CLOUD_R=420,CLOUDS=[];
(function(){const r=mulberry32(77),sg=new THREE.SphereGeometry(1,10,7);
  for(let i=0;i<26;i++){const parts=[],w=70+r()*100,dpt=w*(.4+r()*.3),n=26+(r()*14|0);
    for(let k=0;k<n;k++){const a=r()*TAU,rr=Math.sqrt(r()),px=Math.cos(a)*rr*w*.5,pz=Math.sin(a)*rr*dpt*.5,core=1-rr*.6,pr=w*(.055+r()*.05)*core;
      parts.push(part(sg,0xf4f6fa,px,pr*.35+core*w*.05*r(),pz,0,0,0,pr*1.5,pr*.75*(.8+core*.7),pr*1.3));
      parts.push(part(sg,0xb9bfc9,px*.95,-pr*.05,pz*.95,0,0,0,pr*1.45,pr*.22,pr*1.25));}
    const m=new THREE.Mesh(mergeParts(parts),new THREE.MeshLambertMaterial({vertexColors:true,fog:false,transparent:true,opacity:.95,depthWrite:false}));
    m.frustumCulled=false;m.renderOrder=-5;m.userData={th:i/26,ox:(r()*2-1)*CLOUD_R,oz:(r()*2-1)*CLOUD_R,h:96+r()*30,sp:.7+r()*.6,sc:.85+r()*.4};scene.add(m);CLOUDS.push(m);}
})();
// Pilvikansi: tasainen harmaa kerros koko taivaalla rankassa sateessa ja myrskyssä (läpikuultava, reunat häivytetty).
const cloudDeck=(function(){const t=canvasTex((g,s)=>{const r=mulberry32(91);const im=g.createImageData(s,s);for(let y=0;y<s;y++)for(let x=0;x<s;x++){const dx=x/s-.5,dy=y/s-.5,d=Math.hypot(dx,dy)*2;
    const n=.55+.45*Math.sin(x*.21+Math.sin(y*.13)*2)*Math.cos(y*.17+Math.sin(x*.09)*2)+(r()-.5)*.25,al=Math.max(0,1-d*d)*clamp(n,0,1);const i=(y*s+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=225;im.data[i+3]=al*255|0;}g.putImageData(im,0,0);},128);
  t.magFilter=THREE.LinearFilter;const m=new THREE.Mesh(new THREE.PlaneGeometry(1100,1100),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  m.rotation.x=-Math.PI/2;m.renderOrder=-6;m.frustumCulled=false;m.visible=false;scene.add(m);return m;})();
// Auringonsäteet: selkeällä säällä kapeita läpikuultavia valokeiloja auringon suunnasta (additiivinen, häivytetyt päät).
const sunShafts=(function(){const t=canvasTex((g,s)=>{const gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,'rgba(255,240,200,0)');gr.addColorStop(.35,'rgba(255,240,200,1)');gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.fillRect(0,0,s,s);
    const gx=g.createLinearGradient(0,0,s,0);gx.addColorStop(0,'rgba(0,0,0,1)');gx.addColorStop(.5,'rgba(0,0,0,0)');gx.addColorStop(1,'rgba(0,0,0,1)');g.globalCompositeOperation='destination-out';g.fillStyle=gx;g.fillRect(0,0,s,s);},64);
  t.magFilter=THREE.LinearFilter;const grp=new THREE.Group(),mt=new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
  const r=mulberry32(55);for(let i=0;i<7;i++){const w=6+r()*12,L=260,off=(r()-.5)*90;for(const ry of[0,Math.PI/2]){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,L),mt);p.position.set(off*Math.cos(ry),L/2,off*Math.sin(ry)+(r()-.5)*40);p.rotation.y=ry;grp.add(p);}}
  grp.visible=false;grp.frustumCulled=false;grp.renderOrder=-4;scene.add(grp);grp.userData.mat=mt;return grp;})();
// Auringon pehmeä pyöreä hehku: säteittäinen liukuväri (additiivinen sprite) auringon ympärillä. Säteet häivytetään, kun katse
// osoittaa kohti aurinkoa, koska pitkien tasojen päät näkyisivät silloin neliönä.
const sunGlow=(function(){const t=canvasTex((g,s)=>{const gr=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);gr.addColorStop(0,'rgba(255,246,220,1)');gr.addColorStop(.12,'rgba(255,238,200,.55)');gr.addColorStop(.35,'rgba(255,225,170,.16)');gr.addColorStop(1,'rgba(255,215,160,0)');g.fillStyle=gr;g.fillRect(0,0,s,s);},128);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.0}));sp.scale.setScalar(150);sp.renderOrder=-5;scene.add(sp);return sp;})();
// Salama: sahalaitainen valkoinen jono pilvestä maahan, näkyy lyhyen hetken (strikeBolt()).
let boltGrp=null,boltT=0;
function strikeBolt(){if(boltGrp){scene.remove(boltGrp);boltGrp=null;}
  const d=new V3();camera.getWorldDirection(d);const a0=Math.atan2(d.x,d.z)+(Math.random()-.5)*1.7,dist=110+Math.random()*150,bx0=camera.position.x+Math.sin(a0)*dist,bz0=camera.position.z+Math.cos(a0)*dist;
  const top=CLOUDS[0].userData.h+10,bot=Math.max(0,terrainH(bx0,bz0)),g=new THREE.Group(),bm=new THREE.MeshBasicMaterial({color:0xeaf2ff,fog:false});
  const chain=(x0,y0,z0,x1,y1,z1,w,n)=>{let px=x0,py=y0,pz=z0;for(let i=1;i<=n;i++){const t=i/n,nx=x0+(x1-x0)*t+(i<n?(Math.random()-.5)*dist*.07:0),ny=y0+(y1-y0)*t,nz=z0+(z1-z0)*t+(i<n?(Math.random()-.5)*dist*.07:0);
      const L=Math.hypot(nx-px,ny-py,nz-pz),seg=new THREE.Mesh(new THREE.BoxGeometry(w,L,w),bm);seg.position.set((px+nx)/2,(py+ny)/2,(pz+nz)/2);seg.lookAt(nx,ny,nz);seg.rotateX(Math.PI/2);g.add(seg);px=nx;py=ny;pz=nz;}return[px,py,pz];};
  chain(bx0,top,bz0,bx0+(Math.random()-.5)*20,bot,bz0+(Math.random()-.5)*20,1.1,14);
  for(let b=0;b<2;b++){const sy=top-(.2+Math.random()*.5)*(top-bot);chain(bx0,sy,bz0,bx0+(Math.random()-.5)*60,sy-30-Math.random()*30,bz0+(Math.random()-.5)*60,.6,5);}
  scene.add(g);boltGrp=g;boltT=.28;return{x:bx0,z:bz0};}
const rain=(function(){const N=900,g=new THREE.BufferGeometry(),p=new Float32Array(N*6);g.setAttribute('position',new THREE.BufferAttribute(p,3));const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xaac4d8,transparent:true,opacity:.45}));l.frustumCulled=false;l.visible=false;scene.add(l);const r=mulberry32(9);for(let i=0;i<N;i++){const x=(r()-.5)*50,y=r()*30,z=(r()-.5)*50;p.set([x,y,z,x+.05,y+.7,z],i*6);}return l;})();
