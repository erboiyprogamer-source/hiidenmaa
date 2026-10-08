/* Hiidenmaa – core.js
   Apuvälineet: matematiikka, kohina, satunnaisluvut */
'use strict';
window.__JSV='1.91';   // v1.58: versiotarkistus (index.html vertaa window.HV:hen; eroaa → välimuisti antoi vanhoja tiedostoja)
// KEHITYSTILA (v0.74; v1.82: oletus POIS, päälle Asetukset › Ohjaus ja ääni › alin rivi, localStorage hiidenmaa_devon, ?dev=1): DEV → kestävyys ei kulu, korkein taso (kaikki ohjeet auki), ei painorajaa,
// V pohjassa liikkuu 10× nopeammin (v0.77; ennen Alt/Ö), Ä avaa DEV-valikon (sää, aika, terveys, kylläisyys), vasemmassa alakulmassa merkki "DEV-tila". Poista käytöstä: DEV=false.
const DEV=(()=>{try{if(/[?&]dev=1/.test(location.search))localStorage.setItem('hiidenmaa_devon','1');return localStorage.getItem('hiidenmaa_devon')==='1';}catch(e){return false;}})();
// v0.93 DEV-täpät (DEV-valikko Ä, muistetaan selaimessa): god = ei voi kuolla eikä ota vahinkoa, food = ei nälkää, stam = rajaton kestävyys,
// lvl = korkein taso, weight = ei painorajaa. Oletus: aiemmat DEV-edut päällä, uudet pois.
// v1.91: bossLine = pomohuoneen ääriviiva ulottuvuudessa (Ö-valikko)
const DEVF=(()=>{const d={god:0,food:0,stam:1,lvl:1,weight:1,fly:0,bossLine:0};if(!DEV)return d;try{Object.assign(d,JSON.parse(localStorage.getItem('hiidenmaa_dev')||'{}'));}catch(e){}return d;})();
function devOn(k){return DEV&&!!DEVF[k];}
function saveDevF(){try{localStorage.setItem('hiidenmaa_dev',JSON.stringify(DEVF));}catch(e){}}

/* =========================================================
   HIIDENMAA – pieni viikinkihenkinen selviytymispeli
   ========================================================= */
const $=s=>document.querySelector(s);
const TAU=Math.PI*2;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
function sstep(e0,e1,x){const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function hash2(x,z){let h=Math.imul(x|0,374761393)+Math.imul(z|0,668265263)+9371;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296;}
function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf);const a=hash2(xi,zi),b=hash2(xi+1,zi),c=hash2(xi,zi+1),d=hash2(xi+1,zi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function fbm(x,z,o=4){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=vnoise(x*f+i*17.3,z*f-i*9.1)*a;n+=a;a*=.5;f*=2.03;}return s/n;}
function ridge(x,z){let s=0,a=.5,f=1,n=0;for(let i=0;i<4;i++){s+=(1-Math.abs(vnoise(x*f+i*5.7,z*f+i*3.1)*2-1))*a;n+=a;a*=.5;f*=2.1;}return s/n;}
const rint=(r,a,b)=>a+Math.floor(r()*(b-a+1));
const dist2=(ax,az,bx,bz)=>{const dx=ax-bx,dz=az-bz;return dx*dx+dz*dz;};
const V3=THREE.Vector3;
