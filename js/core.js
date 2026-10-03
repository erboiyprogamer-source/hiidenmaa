/* Hiidenmaa – core.js
   Apuvälineet: matematiikka, kohina, satunnaisluvut */
'use strict';

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
