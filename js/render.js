/* Hiidenmaa – render.js
   three.js-perusta: renderöijä, valot, tekstuurit, materiaalit, maastoverkko, vesi, taivas, sade */
'use strict';

/* ---------------- THREE SETUP ---------------- */
/* v1.28 (KORJAUKSET 24): 3D-piirturin luonti varmistettuna. Jos selain ei anna WebGL-yhteyttä (esim. Chrome on estänyt WebGL:n sivulta
   näytönohjaimen kaatumisen jälkeen, laitteistokiihdytys pois, liikaa 3D-välilehtiä), yritetään kevyemmillä asetuksilla; jos mikään ei
   onnistu, näytetään ohje (ennen kaikki skriptit kaatuivat → "Cannot access '_e' before initialization", musta valikko). */
const renderer=(function(){const tries=[{antialias:true,powerPreference:'high-performance'},{antialias:false,powerPreference:'default'},
    {antialias:false,powerPreference:'low-power',failIfMajorPerformanceCaveat:false,precision:'mediump'}];
  for(const o of tries){try{const r=new THREE.WebGLRenderer(o);if(r.getContext())return r;}catch(e){console.warn('WebGL-yritys epäonnistui',o,e&&e.message);}}
  webglFail();throw new Error('WebGL ei käytettävissä');})();
function webglFail(lost){const d=document.createElement('div');d.id='webglErr';d.style.cssText='position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(10,8,6,.94);color:#eee5d3;font:16px/1.5 sans-serif;padding:20px';
  d.innerHTML=`<div style="max-width:620px"><h2 style="margin:0 0 10px;color:#e8a44a">${lost?'3D-grafiikka katkesi':'Selain ei salli 3D-grafiikkaa (WebGL)'}</h2>
  <p>${lost?'Selaimen näytönohjainyhteys katkesi kesken pelin.':'Hiidenmaa tarvitsee WebGL-yhteyden, mutta selain kieltäytyi antamasta sitä tälle sivulle.'} Kokeile järjestyksessä:</p>
  <ol><li><b>Sulje koko selain</b> (kaikki ikkunat) ja avaa uudelleen – Chrome estää WebGL:n sivulta näytönohjaimen kaatumisen jälkeen, ja esto poistuu vasta uudelleenkäynnistyksellä.</li>
  <li>Sulje muut 3D-pelejä tai -videoita sisältävät välilehdet.</li>
  <li>Chromen asetukset → Järjestelmä → <b>Käytä grafiikkakiihdytystä, kun se on mahdollista</b> päälle, ja käynnistä selain uudelleen.</li>
  <li>Tarkista osoitteesta <b>chrome://gpu</b>, että WebGL on "Hardware accelerated".</li></ol>
  <p style="opacity:.7;font-size:13px">Tallennuksesi ovat tallessa selaimen muistissa. (Hiidenmaa versio ${window.HV||'?'})</p><button onclick="location.reload()" style="margin-top:8px;padding:8px 16px;font:inherit;cursor:pointer">Yritä uudelleen</button></div>`;
  (document.body||document.documentElement).appendChild(d);}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
/* v2.42 VARJON VAALENNUS VARJOSTIMESSA (low poly -sävytys säilyy): auringon valoa ei enää siirretä tasaiseksi yleisvaloksi (se latisti
   kolmioiden kirkkauserot, joista esim. illalla vuorten muodot erottuvat). Sen sijaan varjoa vaalennetaan suoraan: varjon arvo s → mix(s, 1, L).
   Valaistut pinnat saavat täyden kolmiokohtaisen sävytyksen kuten ennen, ja varjossakin muodot erottuvat (1 − L) × aurinko. Kolmessa r128 ei ole
   varjon voimakkuutta, joten L koodataan auringon varjon säteeseen: radius = perussäde + 1000 · round(L · 100) (environment.js SUN_SH_BASE).
   Purku: hmRad = perussäde (pehmeä PCF-tila käyttää sitä), hmLift = L. Koskee vain suuntavaloa (aurinko/kuu). */
THREE.ShaderChunk.shadowmap_pars_fragment=THREE.ShaderChunk.shadowmap_pars_fragment.replace('#ifdef USE_SHADOWMAP','#ifdef USE_SHADOWMAP\n\tfloat hmRad( float r ) { return r - floor( r / 1000.0 ) * 1000.0; }\n\tfloat hmLift( float s, float r ) { return mix( s, 1.0, floor( r / 1000.0 ) / 100.0 ); }');
THREE.ShaderChunk.lights_fragment_begin=THREE.ShaderChunk.lights_fragment_begin.replace('? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;','? hmLift( getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, hmRad( directionalLightShadow.shadowRadius ), vDirectionalShadowCoord[ i ] ), directionalLightShadow.shadowRadius ) : 1.0;');
THREE.ShaderChunk.shadowmask_pars_fragment=THREE.ShaderChunk.shadowmask_pars_fragment.replace('? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;','? hmLift( getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, hmRad( directionalLight.shadowRadius ), vDirectionalShadowCoord[ i ] ), directionalLight.shadowRadius ) : 1.0;');
let SUN_SH_BASE=1;   // auringon varjon perussäde (settings.js applyGfx; pehmeä tila 3,5)
const HM_OK=/hmLift\( getShadow/.test(THREE.ShaderChunk.lights_fragment_begin)&&/hmLift\( getShadow/.test(THREE.ShaderChunk.shadowmask_pars_fragment)&&/float hmLift/.test(THREE.ShaderChunk.shadowmap_pars_fragment);   // tarkistus
$('#game').appendChild(renderer.domElement);
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();if(!document.getElementById('webglErr'))webglFail(true);});   // v1.28
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8fbfe0);
scene.fog=new THREE.Fog(0x8fbfe0,60,220);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1000);
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
const hemi=new THREE.HemisphereLight(0xcfe4ff,0x4a3f2a,.55); scene.add(hemi);
const amb=new THREE.AmbientLight(0xffffff,.1); scene.add(amb);
const shAmb=new THREE.AmbientLight(0xffffff,0); scene.add(shAmb);   // v2.33: avoimissa biomeissa osa auringosta tasaisena valona → vaaleammat varjot (environment.js OPEN_SH)
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
let shDirty=true,bldDirty=true,bmDirty=true;const markShadowDirty=()=>{shDirty=true;bldDirty=true;bmDirty=true;};   // v2.41 bmDirty: kaukaisten rakennusten yhdistäminen tarkistetaan
const QUAL={lvl:0,pointShadow:true,sunSize:2048,max:3};
// Kun tulien/soihdun varjot kytketään pois (laatutaso 3 tai asetus), myös valojen castShadow pois: muuten vanha varjokartta jää
// käyttöön eikä enää päivity (varjot "jähmettyivät"). Takaisin kytkettäessä kartta päivitetään heti. Ks. docs/KORJAUKSET.md.
function setQuality(l){QUAL.lvl=l;const ps=l<3&&SET.shadow==='high'&&SET.ptShadow!==false;
  if(ps!==QUAL.pointShadow||LIGHTS[0].castShadow!==ps){for(const L of [LIGHTS[0],torchLight]){L.castShadow=ps;if(ps)L.shadow.needsUpdate=true;}}
  QUAL.pointShadow=ps;const uh=SET.shUltra&&SET.shUltra!=='off',base=uh?Math.min(8192,renderer.capabilities.maxTextureSize||4096):(+SET.sunRes||2048),ss=!uh&&(l>=2||SET.shadow==='low')?Math.max(512,base/2):base;/* v1.76 shUltra: aina 8192 (tai suurin tuettu) */if(ss!==QUAL.sunSize){QUAL.sunSize=ss;sun.shadow.mapSize.set(ss,ss);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}}

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
// v1.00 maaston kärkien biomi ruohoa varten (indeksi GRASS_BIOMES-listaan, 255 = ei biomia)
const GRASS_BIOMES=['meadow','koivu','forest','suo','kangas','aarni','moor','tunturi','rakka','mountain','beach'],TBIOME=new Uint8Array(HN*HN).fill(255);
const terrainMesh=(function buildTerrain(){
  const pos=new Float32Array(HN*HN*3);
  for(let iz=0;iz<HN;iz++)for(let ix=0;ix<HN;ix++){
    const i=iz*HN+ix,x=-HALF+ix*GS,z=-HALF+iz*GS,h=HGT[i];
    pos[i*3]=x;pos[i*3+1]=h;pos[i*3+2]=z;
    const hx=HGT[iz*HN+Math.min(ix+1,GN)]-HGT[iz*HN+Math.max(ix-1,0)],hz=HGT[Math.min(iz+1,GN)*HN+ix]-HGT[Math.max(iz-1,0)*HN+ix];
    const slope=Math.hypot(hx,hz)/(GS*2);
    const b=biomeAt(x,z,h); let c;{const bi=GRASS_BIOMES.indexOf(b);if(bi>=0&&!(b==='mountain'&&h>33))TBIOME[i]=bi;}
    const n=(vnoise(x*.35,z*.35)-.5)*.1+(vnoise(x*.05,z*.05)-.5)*.08;
    if(b==='sea')c=[.42,.38,.28];
    else if(b==='beach')c=[.78,.7,.5];
    else if(b==='meadow')c=[.43+n,.6+n,.24];
    else if(b==='forest')c=[.25+n,.42+n,.17];
    else if(b==='aarni')c=[.15+n*.6,.25+n*.6,.12];
    else if(b==='moor')c=[.36+n,.32+n,.3+n*.5];
    else if(b==='koivu')c=[.4+n,.58+n,.25];                                            // v0.82 uudet biomit
    else if(b==='suo'){const w=vnoise(x*.22+5,z*.22-3);c=w>.6?[.17+n*.5,.2+n*.5,.13]:[.29+n,.33+n,.16];}  // mättäät + märät painanteet
    else if(b==='kangas')c=[.5+n,.53+n,.41+n*.5];                                        // vaalea jäkälä
    else if(b==='tunturi')c=[.44+n,.42+n,.27+n*.5];                                     // ruskehtava varvikko
    else if(b==='rakka')c=[.44+n,.44+n,.43+n];
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
/* ---------------- VESI (v2.18) ----------------
   Vedenpinta on oma varjostin: syvyys luetaan maaston korkeuskartasta (WATER_DEP, 1 tekseli / maaston kärki), joten vesi on matalassa
   läpinäkyvä ja sinertävä, tummuu yli 2 m syvyydessä ja häipyy rantaviivalla (ei välkkyvää leikkausviivaa maaston kanssa). Pinta heijastaa
   taivaan (Fresnel) ja auringon. Aallot: 3 siniaaltoa (WV), korkeus tuulen mukaan (tyyni ~7 cm, myrsky ~1,3 m), vaimenevat matalassa ja
   kaukana. Samat aallot JS:ssä (waveAt) pelaajan kellumiseen. Verkko seuraa kameraa (tiheä keskellä, harva reunoilla). Vaahto: rantamaininki
   ja myrskyn vaahtopäät vain asetuksella SET.waterFx (Medium+). */
const WATER_DEP=(function(){const d=new Uint8Array(HN*HN*4);const t=new THREE.DataTexture(d,HN,HN,THREE.RGBAFormat,THREE.UnsignedByteType);
  t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.flipY=false;return t;})();
function waterDepSet(i){const dep=clamp(-HGT[i]+1,0,64);WATER_DEP.image.data[i*4]=Math.round(Math.sqrt(dep/64)*255);}
for(let i=0;i<HN*HN;i++)waterDepSet(i);WATER_DEP.needsUpdate=true;
const WV={a:.07,K:[.2856,.4833,.8976],S:[1.674,2.177,2.967],D:[[.8,.6],[-.45,.89],[.96,-.28]],W:[.62,.38,0],ph:[0,0,0]};
// Aallon korkeus pisteessä (m, suhteessa vedenpintaan). Vaimenee rannan matalikossa kuten varjostimessa.
function waveAt(x,z){const dep=water.position.y-terrainH(x,z),a=WV.a*sstep(.2,7,dep);if(a<.001)return 0;let h=0;
  for(let i=0;i<3;i++){const D=WV.D[i];h+=WV.W[i]*Math.sin((D[0]*x+D[1]*z)*WV.K[i]+WV.ph[i]);}return a*h;}
const WATER_U=Object.assign(THREE.UniformsUtils.clone(THREE.UniformsLib.fog),{uDep:{value:WATER_DEP},uPh:{value:new THREE.Vector3()},uAmp:{value:.07},uFar:{value:260},
  uSun:{value:new THREE.Vector3(0,1,0)},uSunC:{value:new THREE.Color(1,1,1)},uAmbC:{value:new THREE.Color(.5,.5,.5)},uSkyTop:{value:new THREE.Color(0x3d6fa8)},uSkyHor:{value:new THREE.Color(0x8fbfe0)},
  uShal:{value:new THREE.Color(0x2f8f8c)},uDeep:{value:new THREE.Color(0x06222e)},uFoam:{value:0},uCap:{value:0},uT:{value:0},uW:{value:new THREE.Vector3(.62,.38,0)}});
const WATER_GLSL=`uniform sampler2D uDep;uniform vec3 uPh,uW;uniform float uAmp;
  const float WH=${HALF.toFixed(1)},WGS=${GS.toFixed(4)},WHN=${HN.toFixed(1)};
  float wDep(vec2 p){vec2 uv=((p+WH)/WGS+.5)/WHN;float e=texture2D(uDep,uv).r;return e*e*64.-1.;}
  vec3 wWave(vec2 p,float a){vec2 D1=vec2(.8,.6),D2=vec2(-.45,.89),D3=vec2(.96,-.28);
    float f1=dot(D1,p)*${WV.K[0]}+uPh.x,f2=dot(D2,p)*${WV.K[1]}+uPh.y,f3=dot(D3,p)*${WV.K[2]}+uPh.z;
    float h=a*(uW.x*sin(f1)+uW.y*sin(f2)+uW.z*sin(f3));vec2 g=a*(uW.x*${WV.K[0]}*cos(f1)*D1+uW.y*${WV.K[1]}*cos(f2)*D2+uW.z*${WV.K[2]}*cos(f3)*D3);return vec3(h,g);}`;
/* Kameraa seuraava ruudukko (±1300 m), tiheä keskellä ja harva reunoilla. Tilat (v2.20): 'low' = low poly -vesi (oletus, 64×64, solu 2,8 m,
   ~4 200 kärkeä), 'hq' = realistinen vesi (96×96, 1,25 m, ~9 400), 'mega' = Mega-aallot (160×160, 1,125 m, ~26 000). Realistinen vesi ja Mega
   ovat Extra-grafiikassa (eivät kuulu esiasetuksiin). Askel userData.st = keskisolun koko (kameran seuranta). */
function waterGeo(mode){const mega=mode==='mega',N=mega?160:mode==='hq'?96:64,A=mega||mode==='low'?90:60,R=1300,v=[],idx=[],f=u=>Math.sign(u)*(A*Math.abs(u)+(R-A)*Math.abs(u)**4);
  for(let j=0;j<=N;j++)for(let i=0;i<=N;i++)v.push(f(i/N*2-1),0,f(j/N*2-1));
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;idx.push(a,b,a+1,a+1,b,b+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(idx);g.userData.st=2*A/N;g.userData.mode=mode;g.userData.mega=mega;return g;}
function waterMat(low){return new THREE.ShaderMaterial({uniforms:WATER_U,transparent:true,fog:true,side:THREE.DoubleSide,defines:low?{LOWPOLY:1}:{},extensions:{derivatives:true},
    vertexShader:WATER_GLSL+`uniform float uFar;varying vec3 vW;varying vec2 vG;varying float vH;
      #include <fog_pars_vertex>
      void main(){vec4 w=modelMatrix*vec4(position,1.);float d=wDep(w.xz);float dist=length(w.xz-cameraPosition.xz);
        float a=uAmp*smoothstep(.2,7.,d)*(1.-smoothstep(uFar*.45,uFar,dist));vec3 wv=wWave(w.xz,a);w.y+=wv.x;vW=w.xyz;vG=wv.yz;vH=wv.x/max(uAmp,.02);
        vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader:WATER_GLSL+`uniform vec3 uSun,uSunC,uAmbC,uSkyTop,uSkyHor,uShal,uDeep;uniform float uFoam,uCap,uT;varying vec3 vW;varying vec2 vG;varying float vH;
      #include <fog_pars_fragment>
      float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}
      void main(){float d=wDep(vW.xz);vec3 V=normalize(cameraPosition-vW);float cd=length(cameraPosition-vW);
        vec2 g=vG;
        #ifndef LOWPOLY
        float rk=(1.-smoothstep(25.,120.,cd))*(.05+uAmp*.08);
        vec2 rp=vW.xz*.55+vec2(uT*.35,uT*.22),rq=vW.xz*.9-vec2(uT*.28,-uT*.31);
        vec2 rg=vec2(vn(rp+vec2(.5,0.))-vn(rp-vec2(.5,0.)),vn(rp+vec2(0.,.5))-vn(rp-vec2(0.,.5)))+.6*vec2(vn(rq+vec2(.5,0.))-vn(rq-vec2(.5,0.)),vn(rq+vec2(0.,.5))-vn(rq-vec2(0.,.5)));
        g+=rg*rk;
        #endif
        vec3 N=normalize(vec3(-g.x,1.,-g.y));
        #ifdef LOWPOLY
        N=normalize(cross(dFdx(vW),dFdy(vW)));if(N.y<0.)N=-N;   /* tasaiset tahkot */
        #endif
        float shore=smoothstep(0.,.35,d);
        if(!gl_FrontFacing){vec3 up=mix(uShal*1.7,uSkyHor,.25)*(uAmbC+uSunC*.35);gl_FragColor=vec4(up,1.);
          #include <fog_fragment>
          return;}
        float nv=max(dot(N,V),0.),fres=.02+.98*pow(1.-nv,5.);
        float vy=max(V.y,.1),path=max(d,0.)/vy;
        float alpha=1.-exp(-path*.5);
        float dk=smoothstep(2.,22.,d);
        #ifdef LOWPOLY
        dk=floor(dk*5.+.5)/5.;   /* väri portaittain */
        #endif
        vec3 lit=uAmbC+uSunC*max(uSun.y,0.)*.55;
        vec3 body=mix(uShal,uDeep,clamp(dk+(1.-exp(-path*.08))*.35,0.,1.))*lit;
        alpha=clamp(mix(alpha,.985,dk),0.,.985);
        vec3 R=reflect(-V,N);R.y=abs(R.y);vec3 sky=mix(uSkyHor,uSkyTop,pow(clamp(R.y,0.,1.),.55));
        float sr=max(dot(R,normalize(uSun)),0.);vec3 spec=uSunC*(pow(sr,260.)*2.5+pow(sr,40.)*.18)*step(0.,uSun.y);
        #ifdef LOWPOLY
        body*=.82+.3*max(dot(N,normalize(uSun)),0.)*step(0.,uSun.y);spec*=.35;fres*=.6;
        #endif
        vec3 col=mix(body,sky,fres*.85)+spec;
        alpha=max(alpha,fres*.8);
        float n1=vn(vW.xz*.12);
        float foam=0.;
        float edge=(1.-smoothstep(.04,.3,d))*smoothstep(-.02,.06,d);
        foam+=edge*(.25+.25*sin(uT*1.3+n1*9.))*(.4+uFoam*.6);
        if(uFoam>0.){float sh=1.-smoothstep(.15,1.6,d);float come=smoothstep(.35,.75,sin(uT*.42+n1*5.)*.5+.5);
          float ln=smoothstep(.72,.97,sin(d*4.2-uT*1.7+n1*6.)*.5+.5)*sh*smoothstep(.03,.2,d)*come;
          foam+=ln*.65*uFoam;
          if(uCap>0.)foam+=uCap*smoothstep(.45,.9,vH)*smoothstep(.45,.85,vn(vW.xz*.35+uT*.15))*smoothstep(3.,8.,d);}
        foam=clamp(foam,0.,1.);col=mix(col,vec3(.92,.95,.96)*(lit*.8+.2),foam);alpha=max(alpha,foam*.9);
        alpha*=shore;
        gl_FragColor=vec4(col,alpha);
        #include <fog_fragment>
      }`});}
const WATER_MATS={low:null,hq:null};
const water=(function(){WATER_MATS.low=waterMat(true);const w=new THREE.Mesh(waterGeo('low'),WATER_MATS.low);w.frustumCulled=false;w.renderOrder=-1;scene.add(w);return w;})();
/* v2.20: veden tila asetuksista (applyGfx): low poly (oletus) / realistinen (SET.waterHQ) ja Mega-verkko (SET.waterMega). Low poly -tilassa
   lyhyin aalto (λ 7 m) pois, koska harva verkko ei toista sitä (WV.W ja uW samat → waveAt vastaa pintaa). */
function waterApply(){const hq=!!SET.waterHQ,mode=SET.waterMega?'mega':hq?'hq':'low';
  if(water.geometry.userData.mode!==mode){const og=water.geometry;water.geometry=waterGeo(mode);og.dispose();}
  const k=hq?'hq':'low';if(!WATER_MATS[k])WATER_MATS[k]=waterMat(!hq);if(water.material!==WATER_MATS[k])water.material=WATER_MATS[k];
  WV.W=hq?[.55,.3,.15]:[.62,.38,0];WATER_U.uW.value.set(WV.W[0],WV.W[1],WV.W[2]);}
/* Merenpohja maastoverkon ulkopuolella (maailman raja on nyt kauempana kuin maasto ±HALF). */
const seaFloor=new THREE.Mesh(new THREE.PlaneGeometry(2800,2800).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x4a5048}));seaFloor.position.y=SEA_FLOOR-2;scene.add(seaFloor);
const stars=(function(){const g=new THREE.BufferGeometry(),p=[];const r=mulberry32(5);for(let i=0;i<700;i++){const u=r()*TAU,v=r()*.9+.05;p.push(Math.cos(u)*Math.sin(Math.acos(1-v))*400,(1-v)*400,Math.sin(u)*Math.sin(Math.acos(1-v))*400);}g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));const m=new THREE.Points(g,new THREE.PointsMaterial({color:0xdde8ff,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false}));scene.add(m);return m;})();
const moonTex=canvasTex((g,s)=>{g.fillStyle='#dfe3ea';g.fillRect(0,0,s,s);const r=mulberry32(31);for(let i=0;i<14;i++){g.fillStyle=`rgba(120,128,145,${.25+r()*.3})`;g.beginPath();g.arc(r()*s,r()*s,2+r()*8,0,TAU);g.fill();}});
const moon=new THREE.Mesh(new THREE.SphereGeometry(12,16,12),new THREE.MeshBasicMaterial({map:moonTex,fog:false}));scene.add(moon);
const snow=(function(){const N=700,g=new THREE.BufferGeometry(),p=new Float32Array(N*3),r=mulberry32(13);for(let i=0;i<N;i++)p.set([(r()-.5)*50,r()*26,(r()-.5)*50],i*3);g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(N*3).fill(1),3));
  const m=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:.14,transparent:true,opacity:.9,vertexColors:true}));m.frustumCulled=false;m.visible=false;scene.add(m);return m;})();
const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(9,12,8),new THREE.MeshBasicMaterial({color:0xfff2c8,fog:false}));scene.add(sunDisc);
/* ---------------- TAIVAS, PILVET JA SALAMAT ---------------- */
// Taivaskupoli: liukuväri horisontista (= sumun väri) zeniittiin + auringon hehku. Seuraa kameraa, piirretään ensimmäisenä.
const SKY_U={uTop:{value:new THREE.Color(0x3d6fa8)},uHor:{value:new THREE.Color(0x8fbfe0)},uSun:{value:new THREE.Vector3(0,1,0)},uSunC:{value:new THREE.Color(0xfff1d6)},uGlow:{value:1}};
const skyDome=new THREE.Mesh(new THREE.SphereGeometry(470,24,14),new THREE.ShaderMaterial({uniforms:SKY_U,side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 uTop,uHor,uSunC,uSun;uniform float uGlow;varying vec3 vD;void main(){vec3 d=normalize(vD);float h=max(d.y,0.);vec3 c=mix(uHor,uTop,pow(smoothstep(0.,1.,h),.55));float s=max(dot(d,normalize(uSun)),0.);c+=uSunC*(pow(s,160.)*.3+pow(s,24.)*.07+pow(s,4.)*.03)*uGlow;gl_FragColor=vec4(c,1.);}'}));
/* v2.38: suunta normalisoidaan pikselissä – interpoloitu vD on kolmion sisällä lyhyempi, jolloin jyrkkä hehku (pow 90) seurasi kupolin
   nelikulmioita ja auringon ympärille piirtyi suorakulmio (KORJAUKSET 54) */
skyDome.renderOrder=-10;skyDome.frustumCulled=false;scene.add(skyDome);
// Pilvet: isoja, leveitä ja litteäpohjaisia pilvilauttoja (70–170 m), jotka levittäytyvät taivaalle. Peitto (cover) riippuu säästä: pilvet
// ilmestyvät järjestyksessä (kynnys th) ja kasvavat peiton mukana. Kaukana pilvet häipyvät horisontin väriin ja katoavat (ei piirretä R:n takana).
// Pilvet ovat aurinkoa ja kuuta lähempänä, joten ne peittävät ne luonnollisesti.
const CLOUD_R=420,CLOUDS=[];
/* v2.38: pilviin syvyyttä – kärkivärit tummuvat alaspäin (pohja ×0,72, yläosa ×1) ja sisäänpäin kääntyvät pinnat hieman (varjoisa sisus) */
function cloudShade(geo){const p=geo.attributes.position.array,c=geo.attributes.color.array,n=geo.attributes.normal.array;let lo=1e9,hi=-1e9;
  for(let i=1;i<p.length;i+=3){lo=Math.min(lo,p[i]);hi=Math.max(hi,p[i]);}const H=Math.max(1,hi-lo);
  for(let i=0;i<p.length;i+=3){const t=(p[i+1]-lo)/H,up=n[i+1],k=(.72+.28*Math.pow(t,.7))*(.92+.08*Math.max(0,up));c[i]*=k;c[i+1]*=k;c[i+2]*=k*1.02;}
  geo.attributes.color.needsUpdate=true;}
(function(){const r=mulberry32(77),sg=new THREE.SphereGeometry(1,10,7);
  for(let i=0;i<26;i++){const parts=[],w=70+r()*100,dpt=w*(.4+r()*.3),n=26+(r()*14|0);
    for(let k=0;k<n;k++){const a=r()*TAU,rr=Math.sqrt(r()),px=Math.cos(a)*rr*w*.5,pz=Math.sin(a)*rr*dpt*.5,core=1-rr*.6,pr=w*(.055+r()*.05)*core;
      const tn=.93+r()*.07;parts.push(part(sg,new THREE.Color(0xeef1f5).multiplyScalar(tn),px,pr*.35+core*w*.05*r(),pz,0,0,0,pr*1.5,pr*.75*(.8+core*.7),pr*1.3));
      parts.push(part(sg,0xb6bcc6,px*.95,-pr*.05,pz*.95,0,0,0,pr*1.45,pr*.22,pr*1.25));}
    const geo=mergeParts(parts);cloudShade(geo);
    const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,fog:false,transparent:true,opacity:.95,depthWrite:false}));
    m.frustumCulled=false;m.renderOrder=-5;m.userData={th:i/26,ox:(r()*2-1)*CLOUD_R,oz:(r()*2-1)*CLOUD_R,h:96+r()*30,sp:.7+r()*.6,sc:.85+r()*.4};scene.add(m);CLOUDS.push(m);}
})();
// Pilvikansi: tasainen harmaa kerros koko taivaalla rankassa sateessa ja myrskyssä (läpikuultava, reunat häivytetty).
const cloudDeck=(function(){const t=canvasTex((g,s)=>{const r=mulberry32(91);const im=g.createImageData(s,s);for(let y=0;y<s;y++)for(let x=0;x<s;x++){const dx=x/s-.5,dy=y/s-.5,d=Math.hypot(dx,dy)*2;
    const n=.55+.45*Math.sin(x*.21+Math.sin(y*.13)*2)*Math.cos(y*.17+Math.sin(x*.09)*2)+(r()-.5)*.25,al=Math.max(0,1-d*d)*clamp(n,0,1);const i=(y*s+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=225;im.data[i+3]=al*255|0;}g.putImageData(im,0,0);},128);
  t.magFilter=THREE.LinearFilter;const m=new THREE.Mesh(new THREE.PlaneGeometry(1100,1100),new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  m.rotation.x=-Math.PI/2;m.renderOrder=-6;m.frustumCulled=false;m.visible=false;scene.add(m);return m;})();
/* v2.37: yksittäinen säde näkyy hieman harvemmin kuin v2.35 (kynnys .42–.85; v2.35 .25–.75, v2.36 .55–.92 oli liian harva) */
/* v2.35 AURINGONSÄTEET näytöllä (korvaa 3D-tasot, joiden päät näkyivät neliönä auringon ympärillä). Puolikkaan resoluution 2D-kangas
   pelinäkymän päällä (mix-blend-mode: screen). Kiilat lähtevät auringon kohdasta; kukin kääntyy kameran käännöksen mukana omalla
   nopeudellaan ja osa häipyy/ilmestyy katsesuunnan mukaan. Maasto auringon edessä peittää. SET.flare: yksinkertainen linssiheijastus
   (renkaat auringon ja ruudun keskipisteen kautta kulkevalla linjalla, näkyy kun katsoo aurinkoa kohti). Piirto main.js drawRays(). */
const RAYS=(function(){const c=document.createElement('canvas');c.id='raysC';$('#game').appendChild(c);const g=c.getContext('2d');
  /* v2.40: 18 sädettä, jokaisella omat satunnaiset rytmit: paksuus (ws), suunnan huojunta (as, aa), pituus (ls), kirkkauden vaihtelu (fs),
     epäsymmetrinen kiila (w1/w2) */
  const r=mulberry32(55),list=[];for(let i=0;i<18;i++)list.push({a:r()*TAU,k:(r()<.5?-1:1)*(.25+r()*.9),j:(r()-.5)*1.6,w:.012+r()*.04,L:.45+r()*.85,
    f:1.4+r()*2.6,fp:(r()-.5)*3,ph:r()*TAU,s:.4+r()*.8,v:0,ws:.12+r()*.45,as:.05+r()*.2,aa:.03+r()*.07,ls:.08+r()*.3,fs:.2+r()*.7,
    p2:r()*TAU,p3:r()*TAU,p4:r()*TAU,w1:.6+r()*.8,w2:.6+r()*.8,d:1});
  return{c,g,list,k:0,occ:1,occP:1,pix:1,pixN:0,dir:new Float32Array(8).fill(1),on:false,W:0,H:0,clr:false};})();
/* v2.37: päiväkohtainen vahvuus (päivän numerosta, sama koko päivän): 0,3–1, ei tyhjiä päiviä (v2.36:ssa 35 % päivistä oli ilman). */
const RAYS_MIN=.3,RAYS_A=.136;   /* v2.40: säteen voimakkuus (v2.39 .16 → 15 % läpinäkyvämpi) */let raysDayN=-1,raysDayK=1;
function raysDay(){const n=typeof dayN==='number'?dayN:0;if(n!==raysDayN){raysDayN=n;const r=mulberry32(Math.imul(n+977,2654435761)^0x5bd1e995);r();raysDayK=RAYS_MIN+(1-RAYS_MIN)*r();}return raysDayK;}
/* v2.36 (v2.40: 9 pistettä, suunnittain): peitto – piirron jälkeen luetaan auringon kiekon kohdalta pikseleitä (keskus + 4 puolivälissä reunaa). Jos kiekko ei näy (puu, rakennus,
   hahmo, pilvi edessä), RAYS.pix → 0 ja säteet + linssiheijastus häipyvät. Luku vain kun säteitä piirretään, joka 3. ruutu. */
const _rp=new THREE.Vector3(),_rpx=new Uint8Array(4),_rsc=new THREE.Color();
/* v2.41: pikseliluku ei enää pysäytä peliä. WebGL2: yksi pieni suorakulmio (kiekon kohta) luetaan puskuriin (PIXEL_PACK_BUFFER) ja
   aidan (fenceSync) valmistuttua tulos haetaan seuraavissa ruuduissa – näytönohjainta ei jäädä odottamaan. WebGL1: yksi suorakulmioluku
   joka 4. ruutu (ennen 9 erillistä lukua joka 2. ruutu). Näytteet ja säännöt ennallaan (keskus + 8 suuntaa 0,65 × kiekon säde). */
const RPK={pbo:null,sync:null,buf:null,cap:0,w:0,h:0,x0:0,y0:0,px:0,py:0,oo:0,on:false};
function raysEval(R,buf,w,h,x0,y0,px,py,oo){const off=(x,y)=>{x=Math.round(x)-x0;y=Math.round(y)-y0;return x<0||y<0||x>=w||y>=h?-1:(y*w+x)*4;};
  let hit=0,zero=0,n=0;const rd=(x,y)=>{const o=off(x,y);if(o<0)return -1;n++;const r=buf[o],g=buf[o+1],b=buf[o+2],a=buf[o+3];if(!r&&!g&&!b&&!a)zero++;
    const v=r>=_rsc.r*255*.82&&g>=_rsc.g*255*.82&&b>=_rsc.b*255*.7&&b<r*.95?1:0;hit+=v;return v;};   /* lämmin sävy: valkoinen pilvi ei käy auringosta */
  const c0=rd(px,py),dv=[];for(let b=0;b<8;b++){const an=b*Math.PI/4;dv.push(rd(px+Math.cos(an)*oo,py-Math.sin(an)*oo));}
  if(n&&zero===n){R.pix=1;R.dir.fill(1);return;}   /* tyhjä luku (puskuri jo tyhjennetty) = ei tietoa → ei piiloteta */
  for(let b=0;b<8;b++){const v=dv[b]<0?(c0<0?1:c0):dv[b];R.dir[b]=v;}   /* kokonaan peitettynä kaikki suunnat 0 → kaikki säteet pois; osittain vain peitetyn puolen säteet */
  R.pix=n?hit/n:1;}
function raysPeek(){const R=RAYS,gl=renderer.getContext(),gl2=typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext;
  /* valmistunut taustaluku → arvioi */
  if(RPK.sync){if(gl.getSyncParameter(RPK.sync,gl.SYNC_STATUS)!==gl.SIGNALED)return;gl.deleteSync(RPK.sync);RPK.sync=null;
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER,RPK.pbo);gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,RPK.buf,0,RPK.w*RPK.h*4);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);
    if(RPK.on)raysEval(R,RPK.buf,RPK.w,RPK.h,RPK.x0,RPK.y0,RPK.px,RPK.py,RPK.oo);}
  if(!(R.k>.01)||!sunDisc.visible||P.inDun||(SET.shafts===false&&SET.flare!==true)){R.pix=1;R.dir.fill(1);RPK.on=false;return;}
  if((R.pixN=(R.pixN+1)%(gl2?2:4))!==0)return;_rp.copy(sunDisc.position).project(camera);if(_rp.z>1||Math.abs(_rp.x)>.98||Math.abs(_rp.y)>.98){R.pix=1;R.dir.fill(1);RPK.on=false;return;}
  const bw=gl.drawingBufferWidth,bh=gl.drawingBufferHeight,px=(_rp.x*.5+.5)*bw,py=(_rp.y*.5+.5)*bh;
  const rad=Math.atan(9/380)/Math.tan(camera.fov*Math.PI/360)*bh/2,oo=Math.max(1,rad*.65);_rsc.copy(sunDisc.material.color);
  const e=Math.ceil(oo)+2,x0=Math.max(0,Math.round(px)-e),y0=Math.max(0,Math.round(py)-e),x1=Math.min(bw,Math.round(px)+e+1),y1=Math.min(bh,Math.round(py)+e+1),w=x1-x0,h=y1-y0;if(w<=0||h<=0)return;
  if(!RPK.buf||RPK.cap<w*h*4){RPK.cap=w*h*4;RPK.buf=new Uint8Array(RPK.cap);if(gl2){if(!RPK.pbo)RPK.pbo=gl.createBuffer();gl.bindBuffer(gl.PIXEL_PACK_BUFFER,RPK.pbo);gl.bufferData(gl.PIXEL_PACK_BUFFER,RPK.cap,gl.STREAM_READ);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);}}
  Object.assign(RPK,{w,h,x0,y0,px,py,oo,on:true});
  if(gl2){gl.bindBuffer(gl.PIXEL_PACK_BUFFER,RPK.pbo);gl.readPixels(x0,y0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,0);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);RPK.sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();}
  else{gl.readPixels(x0,y0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,RPK.buf);raysEval(R,RPK.buf,w,h,x0,y0,px,py,oo);}}
/* v2.40: säteen oman suunnan peitto: kulma a (näytöllä) → lähin 8 suunnasta → q.d liukuu kohti R.dir (alas 22/s ≈ lähes heti, ylös 6/s) */
function rayOcc(q,a,ddt){const an=((a%TAU)+TAU)%TAU,bi=Math.round(an/(Math.PI/4))%8,dd=RAYS.dir[bi];q.d=lerp(q.d,dd,Math.min(1,ddt*(dd<q.d?22:6)));return q.d;}
function raysResize(){const R=RAYS,W=Math.max(2,innerWidth>>1),H=Math.max(2,innerHeight>>1);if(R.W!==W||R.H!==H){R.W=R.c.width=W;R.H=R.c.height=H;}}
const _rv=new THREE.Vector3();
function drawRays(dt){const R=RAYS,want=(SET.shafts!==false||SET.flare===true)&&R.k>.01&&!P.inDun&&!(typeof CAM_UW==='number'&&CAM_UW>0)&&sunDisc.visible;
  if(!want){if(R.clr){R.g.clearRect(0,0,R.W,R.H);R.clr=false;}return;}
  raysResize();const g=R.g,W=R.W,H=R.H;g.clearRect(0,0,W,H);R.clr=true;
  _rv.copy(sunDisc.position).project(camera);if(_rv.z>1)return;   /* aurinko kameran takana */
  const sx=(_rv.x*.5+.5)*W,sy=(-_rv.y*.5+.5)*H,edge=Math.max(Math.abs(_rv.x),Math.abs(_rv.y)),vis=sstep(1.9,1.0,edge);if(vis<=0)return;
  /* v2.40: R.occ = maaston peitto (rauhallinen), R.occP = kiekon peitto (heijastus), q.d = säteen oman suunnan peitto (R.dir, nopea: alas 22/s) */
  const K=R.k*R.occ*vis;if(K<.005)return;const M=Math.min(W,H),t=playTime,ddt=Math.min(.1,dt||0);g.globalCompositeOperation='lighter';
  if(SET.shafts!==false)for(const q of R.list){
    const tv=sstep(.5,.9,.5+.5*Math.sin(camYaw*q.f+camPitch*q.fp*2+q.ph+t*.05*q.s));q.v=lerp(q.v,tv,Math.min(1,ddt*3));   /* osa säteistä piiloutuu kääntyessä (v2.40 harvemmin) */
    const a=q.a+camYaw*q.k+camPitch*q.j+Math.sin(t*q.as+q.p2)*q.aa+Math.sin(t*q.as*2.3+q.p3)*q.aa*.4;   /* suunta huojuu epäsäännöllisesti */
    rayOcc(q,a,ddt);
    const fl=.65+.35*(.5+.5*Math.sin(t*q.fs+q.p4))*(.7+.3*Math.sin(t*q.fs*1.7+q.p2));   /* kirkkaus elää */
    const al=RAYS_A*K*q.v*q.d*fl;if(al<.004)continue;
    const L=M*q.L*(.72+.4*(.5+.5*Math.sin(t*q.ls+q.ph))),wt=q.w*(.5+.85*(.5+.5*Math.sin(t*q.ws+q.p3))*(.75+.25*Math.sin(t*q.ws*2.7+q.p4)));   /* pituus ja paksuus elävät */
    const gr=g.createRadialGradient(sx,sy,0,sx,sy,L);gr.addColorStop(0,'rgba(255,244,214,1)');gr.addColorStop(.25,'rgba(255,236,196,.55)');gr.addColorStop(1,'rgba(255,230,190,0)');g.fillStyle=gr;
    for(const m of [1,.55,.25]){const w1=wt*m*q.w1,w2=wt*m*q.w2;g.globalAlpha=al*.4;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+Math.cos(a-w1)*L,sy+Math.sin(a-w1)*L);g.lineTo(sx+Math.cos(a+w2)*L*(.85+.15*m),sy+Math.sin(a+w2)*L*(.85+.15*m));g.closePath();g.fill();}}
  if(SET.flare===true){const cx=W/2,cy=H/2,dx=cx-sx,dy=cy-sy,fk=K*R.occP*sstep(1.15,.05,Math.hypot(_rv.x,_rv.y));
    if(fk>.01)for(const [tt,rr,col,al] of RAYS_FL){const x=sx+dx*tt,y=sy+dy*tt,rad=M*rr,gr=g.createRadialGradient(x,y,0,x,y,rad);
      gr.addColorStop(0,`rgba(${col},${al})`);gr.addColorStop(.7,`rgba(${col},${al*.55})`);gr.addColorStop(1,`rgba(${col},0)`);g.globalAlpha=fk;g.fillStyle=gr;g.beginPath();g.arc(x,y,rad,0,TAU);g.fill();}}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';}
/* linssiheijastuksen osat: [paikka linjalla (0 = aurinko, 1 = keskipiste, 2 = vastapuoli), säde × ruudun lyhyempi sivu, väri, voimakkuus] */
const RAYS_FL=[[.32,.035,'255,226,170',.34],[.62,.018,'200,255,220',.32],[1.18,.06,'170,200,255',.2],[1.45,.028,'255,190,230',.26],[1.85,.1,'190,220,255',.13],[2.25,.045,'255,235,190',.2]];
// Auringon pehmeä pyöreä hehku: säteittäinen liukuväri (additiivinen sprite) auringon ympärillä. Säteet häivytetään, kun katse
// osoittaa kohti aurinkoa, koska pitkien tasojen päät näkyisivät silloin neliönä.
/* v2.39: hehku pienempi ja läpinäkyvämpi (koko 150 → 90, voimakkuus × SUN_GLOW_K; taivaan hehku kapeampi ja himmeämpi) */
const SUN_GLOW_S=90,SUN_GLOW_K=.45;
const sunGlow=(function(){const t=canvasTex((g,s)=>{const gr=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);gr.addColorStop(0,'rgba(255,246,220,1)');gr.addColorStop(.12,'rgba(255,238,200,.55)');gr.addColorStop(.35,'rgba(255,225,170,.16)');gr.addColorStop(1,'rgba(255,215,160,0)');g.fillStyle=gr;g.fillRect(0,0,s,s);},128);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,opacity:.0}));sp.scale.setScalar(SUN_GLOW_S);sp.renderOrder=-5;scene.add(sp);return sp;})();
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
const rain=(function(){const N=900,g=new THREE.BufferGeometry(),p=new Float32Array(N*6);g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(N*6).fill(1),3));const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.45,vertexColors:true}));l.frustumCulled=false;l.visible=false;scene.add(l);const r=mulberry32(9);for(let i=0;i<N;i++){const x=(r()-.5)*50,y=r()*30,z=(r()-.5)*50;p.set([x,y,z,x+.05,y+.7,z],i*6);}return l;})();
