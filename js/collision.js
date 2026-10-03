/* Hiidenmaa – collision.js
   Törmäysruudukko: laatikot ja ympyrät, maan korkeus, kattojen tarkistus */
'use strict';

/* ---------------- COLLISION GRID ---------------- */
const CELL=8, CG=new Map();
const ck=(cx,cz)=>(cx+600)*2000+(cz+600);
function gridAdd(c){const x0=Math.floor(c.minX/CELL),x1=Math.floor(c.maxX/CELL),z0=Math.floor(c.minZ/CELL),z1=Math.floor(c.maxZ/CELL);c.cells=[];for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const k=ck(x,z);let a=CG.get(k);if(!a){a=[];CG.set(k,a);}a.push(c);c.cells.push(k);}}
function gridRemove(c){for(const k of c.cells||[]){const a=CG.get(k);if(a){const i=a.indexOf(c);if(i>=0)a.splice(i,1);}}c.cells=[];}
let qid=0;
function gridQuery(x,z,r,out){out.length=0;qid++;const x0=Math.floor((x-r)/CELL),x1=Math.floor((x+r)/CELL),z0=Math.floor((z-r)/CELL),z1=Math.floor((z+r)/CELL);for(let gx=x0;gx<=x1;gx++)for(let gz=z0;gz<=z1;gz++){const a=CG.get(ck(gx,gz));if(a)for(const c of a){if(c.q!==qid&&!c.off){c.q=qid;out.push(c);}}}return out;}
function addCircle(x,z,r,y0,y1,owner){const c={t:'c',x,z,r,minX:x-r,maxX:x+r,minZ:z-r,maxZ:z+r,minY:y0,maxY:y1,owner};gridAdd(c);return c;}
function addBox(minX,minY,minZ,maxX,maxY,maxZ,owner){const c={t:'b',minX,minY,minZ,maxX,maxY,maxZ,owner};gridAdd(c);return c;}
const STEPUP=.55, _cl=[];
function groundAt(x,z,r,feet){
  let g=terrainH(x,z);
  gridQuery(x,z,r+.1,_cl);
  for(const c of _cl){if(c.t!=='b'||c.noGround)continue;if(c.maxY>feet+STEPUP+.01)continue;
    const cx=clamp(x,c.minX,c.maxX),cz=clamp(z,c.minZ,c.maxZ);if(dist2(x,z,cx,cz)<(r*.7)**2&&c.maxY>g)g=c.maxY;}
  return g;
}
function collideXZ(p,r,h,feet,hitList){
  gridQuery(p.x,p.z,r+1.5,_cl);
  for(const c of _cl){
    if(c.maxY<=feet+STEPUP||c.minY>=feet+h)continue;
    if(c.t==='c'){const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz),m=r+c.r;if(d<m&&d>1e-5){p.x+=dx/d*(m-d);p.z+=dz/d*(m-d);if(hitList)hitList.push(c);}}
    else{const cx=clamp(p.x,c.minX,c.maxX),cz=clamp(p.z,c.minZ,c.maxZ),dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
      if(d2<r*r){if(hitList)hitList.push(c);
        if(d2>1e-8){const d=Math.sqrt(d2);p.x+=dx/d*(r-d);p.z+=dz/d*(r-d);}
        else{const l=p.x-c.minX,rr=c.maxX-p.x,b=p.z-c.minZ,f=c.maxZ-p.z,mn=Math.min(l,rr,b,f);if(mn===l)p.x=c.minX-r;else if(mn===rr)p.x=c.maxX+r;else if(mn===b)p.z=c.minZ-r;else p.z=c.maxZ+r;}}}
  }
}
function ceilingAt(x,z,r,head){let m=Infinity;gridQuery(x,z,r,_cl);for(const c of _cl){if(c.t!=='b')continue;if(c.minY>=head-.3&&c.minY<m){const cx=clamp(x,c.minX,c.maxX),cz=clamp(z,c.minZ,c.maxZ);if(dist2(x,z,cx,cz)<r*r*.5)m=c.minY;}}return m;}
function pointBlocked(x,y,z){gridQuery(x,z,.2,_cl);for(const c of _cl){if(c.t!=='b')continue;if(x>c.minX-.15&&x<c.maxX+.15&&z>c.minZ-.15&&z<c.maxZ+.15&&y>c.minY-.15&&y<c.maxY+.15)return true;}return false;}
