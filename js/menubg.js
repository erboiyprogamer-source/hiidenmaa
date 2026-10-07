/* Hiidenmaa – menubg.js
   v1.24: valikon animoitu taustakuva. 10 proseduraalisesti piirrettyä 2D-kuvaa (low poly -muodot + maalaukselliset taivaat ja sumut).
   Kevyt: kiinteä osa piirretään kerran välikankaalle, joka kehyksellä vain animoidut osat (enint. 30 kuvaa/s, pienennetty tarkkuus).
   Sivun avauksessa aina "Öinen leiri", sen jälkeen arvottu kuva 20 s välein mustan kautta. Valikossa ei piirretä 3D-maailmaa,
   ellei asetus "Valikon tausta" = 3D-kamera. */
'use strict';

const MBG={cv:null,g:null,st:null,sg:null,W:0,H:0,i:-1,t:0,fade:1,last:0,acc:0,s:null,shown:false,first:true};
const MBG_T=20,MBG_FPS=30,MBG_RES=.6;

/* ---------- apufunktiot ---------- */
function mbgGrad(g,y0,y1,stops,W){const gr=g.createLinearGradient(0,y0,0,y1);stops.forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,y0,W,y1-y0);}
function mbgRadial(g,x,y,r,stops){const gr=g.createRadialGradient(x,y,0,x,y,r);stops.forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
function mbgPoly(g,pts,c){g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))g.lineTo(p[0],p[1]);g.closePath();g.fill();}
// low poly -kuusi: päällekkäiset kolmiot, varjopuoli tummempi
function mbgSpruce(g,x,y,h,c,c2){const w=h*.42;for(let k=0;k<4;k++){const ty=y-h*(.25+k*.22),by=y-h*(k*.2),ww=w*(1-k*.22);
  mbgPoly(g,[[x,ty-h*.18],[x-ww,by],[x,by-h*.04]],c);mbgPoly(g,[[x,ty-h*.18],[x+ww,by],[x,by-h*.04]],c2||c);}g.fillStyle=c2||c;g.fillRect(x-h*.03,y-h*.05,h*.06,h*.07);}
// lehtipuu (koivu): runko + monikulmiolatvus
function mbgBirch(g,x,y,h,trunk,leaf,leaf2,r){g.fillStyle=trunk;g.fillRect(x-h*.025,y-h*.75,h*.05,h*.75);
  for(let k=0;k<3;k++){const cx=x+(r()-.5)*h*.25,cy=y-h*(.7+r()*.25),rr=h*(.18+r()*.1),n=6,pts=[];for(let j=0;j<n;j++){const a=j/n*TAU+r()*.4;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.85]);}
    mbgPoly(g,pts,k%2?leaf2:leaf);}}
// mäkijono: satunnainen monikulmio (fac = kulmikas low poly, muuten pehmeä)
function mbgHills(g,W,H,y,amp,c,r,fac=true,step=.08){g.fillStyle=c;g.beginPath();g.moveTo(0,H);let x=0;g.lineTo(0,y);
  while(x<W){const nx=x+W*step*(.6+r()*.8),ny=y-r()*amp;if(fac)g.lineTo(nx,ny);else g.quadraticCurveTo(x+(nx-x)/2,ny-amp*.3,nx,ny);x=nx;}g.lineTo(W,H);g.closePath();g.fill();}
function mbgStars(g,W,H,n,r,maxY){for(let i=0;i<n;i++){const s=r()*1.6+.3;g.fillStyle=`rgba(255,255,240,${.3+r()*.7})`;g.fillRect(r()*W,r()*H*maxY,s,s);}}
function mbgSoft(g,f){g.save();g.filter='blur(3px)';f();g.restore();}   // maalauksellinen pehmennys (kiinteä osa piirretään kerran)
// kipinät / hiukkaset: {x,y,vx,vy,l,m,c,s}
function mbgParts(g,s,dt,spawn,draw){const P=s.p||(s.p=[]);spawn(P);for(let i=P.length-1;i>=0;i--){const q=P[i];q.l-=dt;if(q.l<=0){P.splice(i,1);continue;}q.x+=q.vx*dt;q.y+=q.vy*dt;draw(q);}}
// nuotio: liekit (kolmiot), hehku ja valon lepatus maassa
function mbgFire(g,x,y,u,t,s){const fl=.85+.15*Math.sin(t*13)+.08*Math.sin(t*31+1)+.05*Math.sin(t*7.3);
  g.save();g.globalCompositeOperation='lighter';mbgRadial(g,x,y-8*u,260*u*fl,[[0,`rgba(255,140,50,${.32*fl})`],[.4,`rgba(255,100,30,${.12*fl})`],[1,'rgba(0,0,0,0)']]);g.restore();
  for(let k=0;k<5;k++){const hh=(26+k*6)*u*(.8+.3*Math.sin(t*(9+k*2.3)+k)),ww=(14-k*2)*u,ox=Math.sin(t*6+k*2)*3*u;
    mbgPoly(g,[[x-ww+ox*.3,y],[x+ox,y-hh],[x+ww+ox*.3,y]],k<2?'#ff7a1a':k<4?'#ffb13a':'#fff2b0');}
  g.fillStyle='#3a2414';g.fillRect(x-20*u,y-3*u,40*u,6*u);g.fillStyle='#4a3020';g.save();g.translate(x,y);g.rotate(.4);g.fillRect(-18*u,-3*u,36*u,5*u);g.restore();
  return fl;}
// vilkkuvat silmät puskassa
function mbgEyes(g,s,dt,list,u){for(const e of list){e.t=(e.t??Math.random()*4)-dt;if(e.t<=0){e.st=(e.st+1||1)%4;e.t=e.st===0?2+Math.random()*4:e.st===1?.12:e.st===2?1.5+Math.random()*3:.12;}
    const open=e.st===0||e.st===2?1:.1;if(e.hide&&e.st===2)continue;
    g.save();g.globalCompositeOperation='lighter';for(const sx of [-1,1]){mbgRadial(g,e.x+sx*e.d*u,e.y,7*u,[[0,e.c],[1,'rgba(0,0,0,0)']]);
      g.fillStyle=e.c;g.beginPath();g.ellipse(e.x+sx*e.d*u,e.y,2.6*u,2.2*u*open,0,0,TAU);g.fill();}g.restore();}}

/* ---------- kuvat ---------- */
// Jokaisella: bg(g,W,H,r,u) kiinteä osa (kerran), fx(g,W,H,t,dt,s,u) animoitu osa. Pääkohde oikealla (valikon tekstit vasemmalla).
const MBG_SCENES=[
 {n:'Öinen leiri',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#060912'],[.55,'#101a2a'],[1,'#0b1210']],W);mbgStars(g,W,H,220,r,.55);
    g.fillStyle='rgba(230,235,220,.9)';g.beginPath();g.arc(W*.82,H*.16,22*u,0,TAU);g.fill();
    mbgSoft(g,()=>mbgHills(g,W,H,H*.62,H*.08,'#0d1a1c',r,false));
    for(let i=0;i<26;i++){const x=r()*W,h=(120+r()*120)*u;mbgSpruce(g,x,H*.66+r()*H*.05,h,'#0a1512','#0d1b16');}
    mbgPoly(g,[[0,H*.78],[W,H*.74],[W,H],[0,H]],'#0e1810');
    const tx=W*.56,ty=H*.8;mbgPoly(g,[[tx,ty-95*u],[tx-90*u,ty],[tx,ty]],'#5c4430');mbgPoly(g,[[tx,ty-95*u],[tx+90*u,ty],[tx,ty]],'#3d2c1f');mbgPoly(g,[[tx,ty-55*u],[tx-22*u,ty],[tx+22*u,ty]],'#120c08');
    for(const [x,y,w,hh] of [[.88,.86,90,40],[.97,.84,70,34],[.42,.88,80,30]]){const pts=[];for(let j=0;j<7;j++){const a=Math.PI+j/6*Math.PI;pts.push([W*x+Math.cos(a)*w*u,H*y+Math.sin(a)*hh*u]);}mbgPoly(g,pts,'#08110c');}
    for(let i=0;i<5;i++){g.fillStyle='#4a4a46';g.beginPath();const a=i/5*TAU;g.ellipse(W*.7+Math.cos(a)*30*u,H*.86+Math.sin(a)*8*u,8*u,5*u,0,0,TAU);g.fill();}
    g.fillStyle='#4e3624';g.fillRect(W*.78,H*.86,70*u,9*u);g.fillRect(W*.79,H*.855,60*u,8*u);},
  fx(g,W,H,t,dt,s,u){const fx=W*.7,fy=H*.86,fl=mbgFire(g,fx,fy,u,t,s);
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=`rgba(255,140,60,${.05*fl})`;g.fillRect(0,0,W,H);g.restore();
    mbgParts(g,s,dt,P=>{if(Math.random()<dt*28)P.push({x:fx+(Math.random()-.5)*16*u,y:fy-20*u,vx:(Math.random()-.4)*20*u,vy:-(50+Math.random()*60)*u,l:1+Math.random()*1.6,m:2.6});},
      q=>{const a=Math.min(1,q.l);q.vx+=Math.sin(t*3+q.y*.05)*6*u*dt;g.fillStyle=`rgba(255,${150+Math.round(a*80)},60,${a})`;g.fillRect(q.x,q.y,2.2*u,2.2*u);});
    mbgEyes(g,s,dt,s.eyes||(s.eyes=[{x:W*.9,y:H*.83,d:6,c:'rgba(200,255,120,.95)'},{x:W*.43,y:H*.865,d:5,c:'rgba(255,220,90,.9)',hide:1},{x:W*.985,y:H*.815,d:5,c:'rgba(200,255,120,.9)',hide:1}]),u);}},
 {n:'Iltarusko järvellä',bg(g,W,H,r,u){mbgGrad(g,0,H*.6,[[0,'#2a2350'],[.45,'#c4566a'],[.8,'#f0a35a'],[1,'#ffd28a']],W);
    mbgSoft(g,()=>{g.fillStyle='rgba(255,220,160,.5)';g.beginPath();g.arc(W*.72,H*.56,40*u,0,TAU);g.fill();});
    mbgHills(g,W,H,H*.58,H*.1,'#3b2a46',r,true,.1);mbgHills(g,W,H,H*.6,H*.05,'#2a1e33',r,true,.06);
    mbgGrad(g,H*.6,H,[[0,'#d98a62'],[.3,'#7a4a5a'],[1,'#1e1a2a']],W);
    for(let i=0;i<14;i++)mbgSpruce(g,r()*W*.35,H*.62,(70+r()*60)*u,'#1a1420','#221a2a');for(let i=0;i<8;i++)mbgSpruce(g,W*.85+r()*W*.15,H*.62,(70+r()*60)*u,'#1a1420','#221a2a');},
  fx(g,W,H,t,dt,s,u){for(let i=0;i<60;i++){const y=H*(.61+((i*37)%100)/100*.37),x=((i*173)%1000)/1000*W,w=(10+((i*29)%30))*u,a=.25+.25*Math.sin(t*1.6+i);
      g.fillStyle=`rgba(255,${200+(i%40)},150,${a*(1-(y/H-.6)*1.8)})`;g.fillRect(x+Math.sin(t*.7+i)*8*u,y,w,1.5*u);}
    for(let k=0;k<3;k++){const bx=(t*25*u+k*90*u)%(W+200*u)-100*u,by=H*(.25+k*.04)+Math.sin(t+k)*6*u,f=Math.sin(t*8+k)*5*u;g.strokeStyle='#2a1e2a';g.lineWidth=1.6*u;
      g.beginPath();g.moveTo(bx-8*u,by-f);g.lineTo(bx,by);g.lineTo(bx+8*u,by-f);g.stroke();}}},
 {n:'Revontulet tunturilla',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#020610'],[.6,'#0a1830'],[1,'#13243a']],W);mbgStars(g,W,H,260,r,.7);
    const pk=[[.35,.5],[.58,.36],[.8,.46],[1.05,.4]];for(const [x,y] of pk){mbgPoly(g,[[W*(x-.25),H*.78],[W*x,H*y],[W*(x+.25),H*.78]],'#2e3d55');mbgPoly(g,[[W*x,H*y],[W*(x+.25),H*.78],[W*x,H*.78]],'#22304a');
      mbgPoly(g,[[W*x,H*y],[W*(x-.06),H*(y+.08)],[W*(x+.02),H*(y+.06)],[W*(x+.07),H*(y+.09)]],'#dfe8f2');}
    mbgPoly(g,[[0,H*.8],[W,H*.76],[W,H],[0,H]],'#1a2638');for(let i=0;i<18;i++)mbgSpruce(g,r()*W,H*(.8+r()*.12),(50+r()*70)*u,'#0c141e','#101a26');},
  fx(g,W,H,t,dt,s,u){g.save();g.globalCompositeOperation='lighter';for(let b=0;b<3;b++){g.beginPath();for(let x=0;x<=W;x+=W/60){const y=H*(.18+b*.07)+Math.sin(x/W*6+t*.4+b)*H*.05+Math.sin(x/W*13-t*.7)*H*.015;x?g.lineTo(x,y):g.moveTo(x,y);}
      for(let x=W;x>=0;x-=W/60){const y=H*(.32+b*.07)+Math.sin(x/W*5+t*.35+b*2)*H*.04;g.lineTo(x,y);}g.closePath();
      const gr=g.createLinearGradient(0,H*.1,0,H*.45);gr.addColorStop(0,`rgba(${b===1?160:60},255,${b===2?220:150},0)`);gr.addColorStop(.5,`rgba(${b===1?140:60},255,${b===2?200:140},${.16+.06*Math.sin(t*.8+b)})`);gr.addColorStop(1,'rgba(40,120,160,0)');g.fillStyle=gr;g.fill();}g.restore();}},
 {n:'Sumuinen aarnimetsä',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#1d2a22'],[.5,'#2c3a2c'],[1,'#121a12']],W);
    mbgSoft(g,()=>{for(let i=0;i<10;i++){const x=r()*W,w=(30+r()*30)*u;g.fillStyle='rgba(40,56,40,.8)';g.fillRect(x,0,w,H*.85);}});
    for(let i=0;i<7;i++){const x=W*(.3+r()*.7),w=(40+r()*40)*u;g.fillStyle='#1a1410';g.fillRect(x,0,w,H*.9);g.fillStyle='#241c14';g.fillRect(x,0,w*.35,H*.9);
      for(let k=0;k<3;k++){const pts=[],cx=x+w/2+(r()-.5)*120*u,cy=H*(.05+r()*.2),rr=(80+r()*60)*u;for(let j=0;j<7;j++){const a=j/7*TAU;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.6]);}mbgPoly(g,pts,k%2?'#1e2e1c':'#24361f');}}
    mbgPoly(g,[[0,H*.85],[W,H*.82],[W,H],[0,H]],'#141d12');for(let i=0;i<30;i++){g.fillStyle=`rgba(${60+r()*40},${90+r()*40},50,.8)`;g.beginPath();g.ellipse(r()*W,H*(.86+r()*.12),(8+r()*14)*u,(4+r()*5)*u,0,0,TAU);g.fill();}},
  fx(g,W,H,t,dt,s,u){for(let i=0;i<6;i++){const x=((t*(8+i*3)*u+i*W*.3)%(W*1.6))-W*.3,y=H*(.55+i*.06);mbgRadial(g,x,y,W*.28,[[0,'rgba(200,215,200,.16)'],[1,'rgba(200,215,200,0)']]);}
    g.save();g.globalCompositeOperation='lighter';for(let i=0;i<18;i++){const x=W*(.25+((i*61)%75)/100)+Math.sin(t*.6+i)*30*u,y=H*(.4+((i*37)%50)/100)+Math.cos(t*.5+i*2)*20*u,a=.5+.5*Math.sin(t*2.2+i*1.7);
      mbgRadial(g,x,y,7*u,[[0,`rgba(220,255,140,${a*.9})`],[1,'rgba(0,0,0,0)']]);}g.restore();}},
 {n:'Kalmankehä kuutamossa',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#0a0c18'],[.6,'#1a1f30'],[1,'#121510']],W);mbgStars(g,W,H,120,r,.5);
    mbgSoft(g,()=>{mbgRadial(g,W*.3,H*.2,120*u,[[0,'rgba(220,230,255,.35)'],[1,'rgba(0,0,0,0)']]);g.fillStyle='#e8ecf4';g.beginPath();g.arc(W*.3,H*.2,36*u,0,TAU);g.fill();});
    mbgHills(g,W,H,H*.7,H*.06,'#1a2018',r,false);mbgPoly(g,[[0,H*.78],[W,H*.76],[W,H],[0,H]],'#141a12');
    s0:{const cx=W*.7,cy=H*.78;for(let i=0;i<9;i++){const a=i/9*TAU,x=cx+Math.cos(a)*150*u,y=cy+Math.sin(a)*35*u,h=(70+((i*13)%5)*10)*u;g.fillStyle=Math.sin(a)>0?'#5a5c62':'#3e4046';g.fillRect(x-12*u,y-h,24*u,h);g.fillStyle='#2c2e34';g.fillRect(x+4*u,y-h,8*u,h);}
      g.fillStyle='#4a4c52';g.fillRect(cx-30*u,cy-26*u,60*u,26*u);}},
  fx(g,W,H,t,dt,s,u){const cx=W*.7,cy=H*.78;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const a=i/9*TAU,x=cx+Math.cos(a)*150*u,y=cy+Math.sin(a)*35*u,p=.5+.5*Math.sin(t*1.5+i*.9);
      mbgRadial(g,x,y-40*u,22*u,[[0,`rgba(140,255,240,${.5*p})`],[1,'rgba(0,0,0,0)']]);g.fillStyle=`rgba(160,255,245,${.6*p})`;g.fillRect(x-3*u,y-50*u,6*u,14*u);}
    mbgRadial(g,cx,cy-30*u,60*u,[[0,`rgba(140,255,240,${.25+.1*Math.sin(t*2)})`],[1,'rgba(0,0,0,0)']]);g.restore();
    for(let i=0;i<4;i++){const x=((t*10*u+i*W*.4)%(W*1.5))-W*.25;mbgRadial(g,x,H*(.8+i*.03),W*.3,[[0,'rgba(180,190,200,.12)'],[1,'rgba(0,0,0,0)']]);}}},
 {n:'Kivilinnake aamulla',bg(g,W,H,r,u){mbgGrad(g,0,H*.7,[[0,'#7fa6c8'],[.6,'#e8c9a0'],[1,'#f4dcb0']],W);
    mbgSoft(g,()=>{for(let i=0;i<5;i++){g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(r()*W,H*(.1+r()*.2),(80+r()*80)*u,(14+r()*10)*u,0,0,TAU);g.fill();}});
    mbgHills(g,W,H,H*.6,H*.08,'#8aa07a',r,true,.12);mbgHills(g,W,H,H*.7,H*.06,'#5f8a4a',r,true,.08);
    const cx=W*.7,cy=H*.66;mbgPoly(g,[[cx-200*u,H*.82],[cx-150*u,cy],[cx+150*u,cy],[cx+200*u,H*.82]],'#6c8a52');
    for(let i=0;i<12;i++){const x=cx-130*u+i*22*u,h=(56+(i%3)*8)*u;g.fillStyle=i%2?'#8e8c86':'#a3a19a';g.fillRect(x,cy-h,22*u,h);g.fillStyle='#6e6c66';g.fillRect(x,cy-h,22*u,5*u);}
    for(let i=0;i<10;i++)mbgSpruce(g,r()*W*.4,H*(.72+r()*.08),(60+r()*60)*u,'#2f5a32','#3a6a3a');mbgPoly(g,[[0,H*.86],[W,H*.84],[W,H],[0,H]],'#4e7a3e');},
  fx(g,W,H,t,dt,s,u){g.save();g.globalCompositeOperation='lighter';for(let k=0;k<4;k++){g.fillStyle=`rgba(255,230,170,${.05+.03*Math.sin(t*.5+k)})`;g.beginPath();const x=W*(.85-k*.07);g.moveTo(x,0);g.lineTo(x+30*u,0);g.lineTo(x-140*u,H);g.lineTo(x-200*u,H);g.closePath();g.fill();}g.restore();
    for(let k=0;k<3;k++){const bx=(t*30*u+k*120*u)%(W+200*u)-100*u,by=H*(.18+k*.05)+Math.sin(t*1.3+k)*8*u,f=Math.sin(t*9+k)*5*u;g.strokeStyle='#3a3a42';g.lineWidth=1.6*u;g.beginPath();g.moveTo(bx-8*u,by-f);g.lineTo(bx,by);g.lineTo(bx+8*u,by-f);g.stroke();}}},
 {n:'Riimukivi rannalla',bg(g,W,H,r,u){mbgGrad(g,0,H*.55,[[0,'#8ec2e0'],[1,'#d8eef2']],W);mbgGrad(g,H*.55,H*.75,[[0,'#3f8aa0'],[1,'#2a6a80']],W);
    mbgSoft(g,()=>{for(let i=0;i<4;i++){g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(r()*W,H*(.1+r()*.25),(70+r()*90)*u,(16+r()*10)*u,0,0,TAU);g.fill();}});
    mbgPoly(g,[[0,H*.75],[W*.4,H*.7],[W,H*.73],[W,H],[0,H]],'#e6d29e');mbgPoly(g,[[0,H*.85],[W,H*.83],[W,H],[0,H]],'#d4bc84');
    const x=W*.72,y=H*.82;mbgPoly(g,[[x-28*u,y],[x-22*u,y-120*u],[x+4*u,y-138*u],[x+26*u,y-112*u],[x+30*u,y]],'#7e7c76');mbgPoly(g,[[x+4*u,y-138*u],[x+26*u,y-112*u],[x+30*u,y],[x+6*u,y]],'#66645e');
    for(let i=0;i<6;i++)mbgBirch(g,W*(.85+r()*.15),H*.73,(110+r()*50)*u,'#e8e4da','#7aa84a','#5f8e3a',r);},
  fx(g,W,H,t,dt,s,u){for(let k=0;k<5;k++){const y=H*(.7+k*.012)+Math.sin(t*.9+k)*4*u;g.fillStyle=`rgba(255,255,255,${.35-k*.05})`;for(let x=0;x<W;x+=60*u)g.fillRect(x+Math.sin(t*1.3+x*.01+k)*14*u,y,30*u,2*u);}
    const x=W*.72,y=H*.82;g.save();g.globalCompositeOperation='lighter';for(let j=0;j<4;j++){const p=.5+.5*Math.sin(t*1.8+j);g.fillStyle=`rgba(120,240,230,${.5*p})`;g.fillRect(x-8*u+(j%2)*10*u,y-110*u+j*18*u,8*u,3*u);}g.restore();
    for(let k=0;k<2;k++){const bx=W-((t*40*u+k*300*u)%(W+200*u))+100*u,by=H*(.2+k*.06)+Math.sin(t*2+k)*10*u,f=Math.sin(t*7+k)*6*u;g.strokeStyle='#f4f4f0';g.lineWidth=2*u;g.beginPath();g.moveTo(bx-10*u,by-f);g.lineTo(bx,by);g.lineTo(bx+10*u,by-f);g.stroke();}}},
 {n:'Myrsky',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#1a1e26'],[.5,'#2a3038'],[1,'#141812']],W);
    mbgSoft(g,()=>{for(let i=0;i<9;i++){g.fillStyle=`rgba(${40+r()*30},${46+r()*30},${56+r()*30},.9)`;g.beginPath();g.ellipse(r()*W,H*(.05+r()*.25),(120+r()*120)*u,(30+r()*20)*u,0,0,TAU);g.fill();}});
    mbgHills(g,W,H,H*.68,H*.06,'#1e2a1c',r,true);mbgPoly(g,[[0,H*.8],[W,H*.78],[W,H],[0,H]],'#18221a');},
  fx(g,W,H,t,dt,s,u){const lean=.18+.08*Math.sin(t*1.7);for(let i=0;i<9;i++){const x=W*(.4+i*.07),y=H*(.8+(i%3)*.01),h=(130+(i*37)%60)*u;g.save();g.translate(x,y);g.transform(1,0,-lean*(1+.2*Math.sin(t*3+i)),1,0,0);mbgSpruce(g,0,0,h,'#0f1a12','#132016');g.restore();}
    s.fl=(s.fl||0)-dt;if(s.fl<=0&&Math.random()<dt*.25){s.fl=.35;s.bx=W*(.5+Math.random()*.4);}if(s.fl>0){g.fillStyle=`rgba(220,230,255,${s.fl*1.2})`;g.fillRect(0,0,W,H);g.strokeStyle='rgba(240,245,255,.9)';g.lineWidth=2.5*u;g.beginPath();let x=s.bx,y=0;g.moveTo(x,y);while(y<H*.6){x+=(Math.random()-.5)*40*u;y+=20*u;g.lineTo(x,y);}g.stroke();}
    g.strokeStyle='rgba(180,195,215,.35)';g.lineWidth=1*u;g.beginPath();for(let i=0;i<160;i++){const x=((i*97+t*500*u*.6)%(W+100))-50,y=((i*61+t*700*u)%(H+40))-20;g.moveTo(x,y);g.lineTo(x-10*u,y+22*u);}g.stroke();}},
 {n:'Lumisade',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#5a6a80'],[.6,'#a8b4c4'],[1,'#dfe6ee']],W);mbgSoft(g,()=>mbgHills(g,W,H,H*.6,H*.08,'#c6d0dc',r,false));
    for(let i=0;i<16;i++){const x=r()*W,y=H*(.68+r()*.12),h=(80+r()*90)*u;mbgSpruce(g,x,y,h,'#2a3e36','#34483e');for(let k=0;k<3;k++)mbgPoly(g,[[x,y-h*(.4+k*.22)-h*.18],[x-h*.3*(1-k*.22),y-h*(k*.2)-h*.05],[x,y-h*(k*.2)-h*.12]],'#eef3f8');}
    mbgPoly(g,[[0,H*.84],[W,H*.82],[W,H],[0,H]],'#e8eef4');const hx=W*.7,hy=H*.84;g.fillStyle='#5a3e28';g.fillRect(hx-60*u,hy-60*u,120*u,60*u);mbgPoly(g,[[hx-75*u,hy-58*u],[hx,hy-110*u],[hx+75*u,hy-58*u]],'#f0f4f8');g.fillStyle='#1a120a';g.fillRect(hx+20*u,hy-40*u,22*u,24*u);},
  fx(g,W,H,t,dt,s,u){const hx=W*.7,hy=H*.84,fl=.85+.15*Math.sin(t*9)+.05*Math.sin(t*23);g.fillStyle=`rgba(255,${170+Math.round(fl*40)},80,${.9*fl})`;g.fillRect(hx+21*u,hy-39*u,20*u,22*u);
    g.save();g.globalCompositeOperation='lighter';mbgRadial(g,hx+31*u,hy-28*u,70*u,[[0,`rgba(255,170,80,${.3*fl})`],[1,'rgba(0,0,0,0)']]);g.restore();
    mbgParts(g,s,dt,P=>{while(P.length<180)P.push({x:Math.random()*W,y:-10-Math.random()*H,vx:0,vy:(20+Math.random()*30)*u,l:99,ph:Math.random()*6,z:.5+Math.random()});},
      q=>{q.x+=Math.sin(t+q.ph)*10*u*dt;if(q.y>H)q.y=-5;g.fillStyle=`rgba(255,255,255,${.5+q.z*.4})`;g.fillRect(q.x,q.y,2*u*q.z,2*u*q.z);});}},
 {n:'Portaalin hehku',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#08060e'],[.6,'#161226'],[1,'#0e0c10']],W);mbgStars(g,W,H,160,r,.6);
    mbgHills(g,W,H,H*.72,H*.06,'#141220',r,true);mbgPoly(g,[[0,H*.82],[W,H*.8],[W,H],[0,H]],'#100e14');
    const cx=W*.7,cy=H*.66;for(const sx of [-1,1]){g.fillStyle='#3a3842';g.fillRect(cx+sx*90*u-16*u,cy-120*u,32*u,200*u);g.fillStyle='#2a2832';g.fillRect(cx+sx*90*u,cy-120*u,16*u,200*u);}
    g.fillStyle='#46444e';g.fillRect(cx-120*u,cy-140*u,240*u,26*u);for(let i=0;i<10;i++)mbgSpruce(g,r()*W*.45,H*(.8+r()*.06),(60+r()*80)*u,'#0a0810','#0e0c16');},
  fx(g,W,H,t,dt,s,u){const cx=W*.7,cy=H*.68,p=.75+.25*Math.sin(t*1.7);g.save();g.globalCompositeOperation='lighter';
    mbgRadial(g,cx,cy,170*u*p,[[0,`rgba(120,255,240,${.4*p})`],[.5,`rgba(80,180,255,${.15*p})`],[1,'rgba(0,0,0,0)']]);
    g.fillStyle=`rgba(150,255,245,${.35+.15*Math.sin(t*3)})`;g.beginPath();g.ellipse(cx,cy,66*u,96*u,0,0,TAU);g.fill();
    mbgParts(g,s,dt,P=>{if(Math.random()<dt*30){const a=Math.random()*TAU;P.push({x:cx+Math.cos(a)*90*u,y:cy+Math.sin(a)*120*u,vx:-Math.cos(a)*30*u,vy:-Math.sin(a)*40*u-10*u,l:1.5+Math.random()});}},
      q=>{g.fillStyle=`rgba(170,255,250,${Math.min(1,q.l)})`;g.fillRect(q.x,q.y,2.4*u,2.4*u);});g.restore();}}
];

/* ---------- ohjaus ---------- */
function mbgInit(){if(MBG.cv)return;const c=document.createElement('canvas');c.id='menuBg';c.setAttribute('aria-hidden','true');
  const f=$('#menuFade');(f&&f.parentNode?f.parentNode:document.body).insertBefore(c,f||null);MBG.cv=c;MBG.g=c.getContext('2d');MBG.st=document.createElement('canvas');MBG.sg=MBG.st.getContext('2d');
  addEventListener('resize',()=>{if(MBG.i>=0)mbgSet(MBG.i,true);});}
function mbgSize(){const W=Math.max(320,Math.round(innerWidth*MBG_RES)),H=Math.max(200,Math.round(innerHeight*MBG_RES));
  if(MBG.W!==W||MBG.H!==H){MBG.W=W;MBG.H=H;MBG.cv.width=MBG.st.width=W;MBG.cv.height=MBG.st.height=H;return true;}return false;}
function mbgSet(i,keepT){mbgSize();MBG.i=i;const S=MBG_SCENES[i],u=Math.min(MBG.W/1000,MBG.H/560);MBG.u=u;MBG.sg.clearRect(0,0,MBG.W,MBG.H);
  S.bg(MBG.sg,MBG.W,MBG.H,mulberry32(1000+i*77),u);if(!keepT){MBG.t=0;MBG.s={};}}
// v1.31: aina arvottu kuva (myös sivun avauksessa), ei sama kahdesti peräkkäin.
function mbgNext(){let j=MBG.i;while(j===MBG.i)j=(Math.random()*MBG_SCENES.length)|0;return j;}
function mbgShow(on){mbgInit();if(on===MBG.shown)return;MBG.shown=on;MBG.cv.style.display=on?'block':'none';if(on&&MBG.i<0)mbgSet((Math.random()*MBG_SCENES.length)|0);   /* v1.31: aina arvottu (ennen avauksessa Öinen leiri) */MBG.last=performance.now();}
function mbgFrame(now){mbgShow(true);const raw=Math.min(.25,(now-MBG.last)/1000);MBG.acc+=raw;MBG.last=now;if(MBG.acc<1/MBG_FPS)return;const dt=MBG.acc;MBG.acc=0;
  MBG.t+=dt;if(MBG.t>MBG_T)mbgSet(mbgNext());
  const g=MBG.g,W=MBG.W,H=MBG.H,S=MBG_SCENES[MBG.i];g.globalAlpha=1;g.globalCompositeOperation='source-over';g.drawImage(MBG.st,0,0);
  try{S.fx(g,W,H,MBG.t,dt,MBG.s,MBG.u);}catch(e){console.error(e);}
  // häivytys mustan kautta: 0,8 s alussa ja lopussa
  const k=Math.min(1,MBG.t/.8,(MBG_T-MBG.t)/.8);if(k<1){g.globalAlpha=1-Math.max(0,k);g.fillStyle='#000';g.fillRect(0,0,W,H);g.globalAlpha=1;}
  // reunojen tummennus valikon tekstin luettavuuteen (vasen reuna)
  if(!MBG.vig){const v=document.createElement('canvas');v.width=W;v.height=1;const vg=v.getContext('2d'),gr=vg.createLinearGradient(0,0,W,0);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(.45,'rgba(0,0,0,.15)');gr.addColorStop(1,'rgba(0,0,0,0)');vg.fillStyle=gr;vg.fillRect(0,0,W,1);MBG.vig=v;}
  g.drawImage(MBG.vig,0,0,W,H);}

/* ---------------- v1.46 VALIKON PARTIKKELIT ----------------
   Oma läpinäkyvä canvas (#menuFx) valikon päällä. Laji vaihtuu taustakuvan mukaan (MBG_SCENES-järjestys):
   leiri = hiillos, järvi = kultainen pöly, tunturi = kevyt lumi + tuikkeet, aarnimetsä = tulikärpäset, Kalmankehä = virvatulet + tuhka,
   linnake = valopöly + lehdet, riimukivi = nousevat riimut, myrsky = vino sade + lehdet, lumisade = lumi, portaali = taikakipinät.
   3D-taustalla ja tauolla: hiillos. Painikkeet: hiiren alla kipinöitä, painettaessa ryöppy; sankaripainike kipinöi jatkuvasti.
   Määrä seuraa Hiukkaset-asetusta (0 = pois). Enintään 45 kuvaa/s. */
const MFX={cv:null,g:null,P:[],last:0,acc:0,W:0,H:0,dpr:1,kind:'',mx:-999,my:-999,spr:{},hero:null};
const MFX_KIND=['embers','motes','snowlite','fireflies','wisps','dust','runes','storm','snow','magic'];
const MFX_N={embers:70,motes:60,snowlite:90,fireflies:45,wisps:30,dust:55,runes:34,storm:160,snow:170,magic:80};
function mfxSprite(c){if(MFX.spr[c])return MFX.spr[c];const v=document.createElement('canvas');v.width=v.height=32;const g=v.getContext('2d'),gr=g.createRadialGradient(16,16,0,16,16,16);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.18,c);gr.addColorStop(.5,c.replace(/[\d.]+\)$/,'.25)'));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);return MFX.spr[c]=v;}
function mfxInit(){if(MFX.cv)return;MFX.cv=$('#menuFx');if(!MFX.cv)return;MFX.g=MFX.cv.getContext('2d');mfxSize();addEventListener('resize',mfxSize);
  const M=$('#menu');M.addEventListener('mousemove',e=>{MFX.mx=e.clientX;MFX.my=e.clientY;});M.addEventListener('mouseleave',()=>{MFX.mx=MFX.my=-999;});
  M.addEventListener('mouseover',e=>{const b=e.target.closest&&e.target.closest('.mbtn,.btn,.mBack,.world');if(!b||b.contains(e.relatedTarget))return;const r=b.getBoundingClientRect();
    for(let i=0;i<7;i++)mfxPush(mfxSpark(r.right-6-Math.random()*20,r.top+Math.random()*r.height,'rgba(255,170,80,1)',60));});
  M.addEventListener('mousedown',e=>{const b=e.target.closest&&e.target.closest('.mbtn,.btn,.mBack,.world');if(!b)return;const hero=b.classList.contains('mHero');
    for(let i=0;i<(hero?40:18);i++)mfxPush(mfxSpark(e.clientX,e.clientY,hero?'rgba(255,215,140,1)':'rgba(255,160,70,1)',hero?220:140));});}
function mfxSize(){if(!MFX.cv)return;const d=Math.min(devicePixelRatio||1,1.5);MFX.dpr=d;MFX.W=innerWidth;MFX.H=innerHeight;MFX.cv.width=Math.round(innerWidth*d);MFX.cv.height=Math.round(innerHeight*d);}
function mfxPush(p){if(MFX.P.length<420)MFX.P.push(p);}
function mfxSpark(x,y,c,sp){const a=Math.random()*TAU,v=sp*(.3+Math.random()*.7);return {t:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sp*.35,s:2+Math.random()*2.5,life:0,max:.5+Math.random()*.6,c};}
function mfxNew(k,W,H,init){const r=Math.random,p={t:k,x:r()*W,y:init?r()*H:0,vx:0,vy:0,s:1,life:0,max:6+r()*6,ph:r()*TAU,c:'rgba(255,150,60,1)'};
  switch(k){
    case 'embers':p.y=init?r()*H:H+10;p.vy=-(30+r()*60);p.vx=(r()-.5)*14;p.s=1.6+r()*2.4;p.c=r()<.7?'rgba(255,140,50,1)':'rgba(255,200,110,1)';break;
    case 'motes':p.vx=(r()-.5)*8;p.vy=(r()-.5)*6;p.s=1.2+r()*2;p.c='rgba(255,215,140,1)';p.max=8+r()*8;break;
    case 'snowlite':case 'snow':{const hv=k==='snow';p.y=init?r()*H:-10;p.vy=hv?45+r()*70:18+r()*28;p.vx=hv?18+r()*20:(r()-.5)*10;p.s=hv?1.6+r()*3:1.2+r()*2;p.c='rgba(240,248,255,1)';p.max=30;p.flat=1;break;}
    case 'fireflies':p.y=H*(.35+r()*.6);p.s=2+r()*2;p.c='rgba(210,255,120,1)';p.max=10+r()*10;break;
    case 'wisps':p.y=init?r()*H:H*(.6+r()*.4);p.vy=-(6+r()*12);p.s=r()<.35?8+r()*8:1.2+r()*1.5;p.c=p.s>5?'rgba(150,210,255,1)':'rgba(190,190,200,1)';p.max=10+r()*8;break;
    case 'dust':if(r()<.3){p.t='leaf';p.y=init?r()*H:-10;p.vy=20+r()*25;p.vx=8+r()*20;p.s=4+r()*3;p.rot=r()*TAU;p.vr=(r()-.5)*4;p.c=['#c8862e','#d9a63a','#a8521e'][r()*3|0];p.max=30;}
      else{p.vx=(r()-.5)*5;p.vy=-(2+r()*4);p.s=1+r()*1.6;p.c='rgba(255,235,190,1)';p.max=8+r()*8;}break;
    case 'runes':if(r()<.45){p.t='glyph';p.y=init?r()*H:H+20;p.vy=-(14+r()*18);p.g='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'[r()*24|0];p.s=12+r()*12;p.c=r()<.6?'#ffb35a':'#7ff0e0';p.max=9+r()*6;}
      else{p.t='motes';p.vx=(r()-.5)*8;p.vy=-(4+r()*8);p.s=1.2+r()*1.8;p.c='rgba(255,190,110,1)';}break;
    case 'storm':if(r()<.12){p.t='leaf';p.y=r()*H;p.x=init?r()*W:-10;p.vx=160+r()*160;p.vy=(r()-.3)*60;p.s=4+r()*3;p.rot=r()*TAU;p.vr=(r()-.5)*10;p.c=['#6a7a2a','#8a6a2a','#5a4a1e'][r()*3|0];p.max=10;}
      else{p.t='rain';p.y=init?r()*H:-20;p.x=r()*W*1.2-W*.1;p.vy=700+r()*300;p.vx=-220;p.s=12+r()*14;p.max=3;}break;
    case 'magic':p.y=init?r()*H:H+10;p.x=W*(.45+r()*.5);p.vy=-(25+r()*45);p.s=1.5+r()*2.5;p.c=r()<.5?'rgba(190,120,255,1)':'rgba(110,240,230,1)';p.max=6+r()*6;break;}
  return p;}
function mfxFrame(now){mfxInit();if(!MFX.cv)return;const raw=Math.min(.1,(now-(MFX.last||now))/1000);MFX.last=now;MFX.acc+=raw;if(MFX.acc<1/45)return;const dt=MFX.acc;MFX.acc=0;
  const W=MFX.W,H=MFX.H,g=MFX.g,k=(MBG.shown&&MBG.i>=0)?MFX_KIND[MBG.i]:'embers',q=+SET.particles||0;
  if(k!==MFX.kind){MFX.kind=k;MFX.P=MFX.P.filter(p=>p.t==='spark');}
  const want=Math.round((MFX_N[k]||50)*q);let amb=0;for(const p of MFX.P)if(p.t!=='spark')amb++;
  for(let i=0;amb<want&&i<6;i++,amb++)MFX.P.push(mfxNew(k,W,H,amb<want*.6&&MFX.P.length<want*.6));
  // sankaripainike kipinöi reunoiltaan
  const hb=document.querySelector('#menu[data-view="main"] .mHero:not([hidden])');if(hb&&q>0&&Math.random()<.55){const r=hb.getBoundingClientRect();if(r.width){const e=Math.random()*(r.width+r.height)*2;let x,y;
    if(e<r.width){x=r.left+e;y=r.top;}else if(e<r.width*2){x=r.left+e-r.width;y=r.bottom;}else if(e<r.width*2+r.height){x=r.left;y=r.top+e-r.width*2;}else{x=r.right;y=r.top+e-r.width*2-r.height;}
    mfxPush({t:'spark',x,y,vx:(Math.random()-.5)*30,vy:-(20+Math.random()*50),s:1.6+Math.random()*2,life:0,max:.7+Math.random()*.8,c:'rgba(255,190,100,1)'});}}
  const d=MFX.dpr;g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);const T=performance.now()/1000;
  for(let i=MFX.P.length-1;i>=0;i--){const p=MFX.P[i];p.life+=dt;
    // hiiri työntää kevyitä hiukkasia
    if(p.t!=='rain'&&MFX.mx>-900){const dx=p.x-MFX.mx,dy=p.y-MFX.my,d2=dx*dx+dy*dy;if(d2<90*90&&d2>1){const f=(1-Math.sqrt(d2)/90)*160*dt;const l=Math.sqrt(d2);p.x+=dx/l*f;p.y+=dy/l*f;}}
    if(p.t==='fireflies'){p.ph+=dt;p.vx+=Math.cos(p.ph*.9+i)*14*dt;p.vy+=Math.sin(p.ph*1.3+i*2)*14*dt;p.vx*=.98;p.vy*=.98;}
    else if(p.t==='embers'||p.t==='magic'){p.vx+=Math.sin(T*1.7+p.ph)*(p.t==='magic'?40:18)*dt;}
    else if(p.t==='spark'){p.vy+=120*dt;p.vx*=.97;}
    else if(p.t==='snowlite'||p.t==='snow'){p.vx+=Math.sin(T*.8+p.ph)*6*dt;}
    p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.rot!==undefined)p.rot+=p.vr*dt;
    const out=p.y<-40||p.y>H+40||p.x<-60||p.x>W+60;if(p.life>p.max||out){MFX.P.splice(i,1);continue;}
    const fa=Math.min(1,p.life/.6,(p.max-p.life)/.8);
    if(p.t==='rain'){g.globalCompositeOperation='source-over';g.strokeStyle=`rgba(190,205,225,${.35*fa})`;g.lineWidth=1.2;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+p.vx*.02,p.y+p.vy*.02*(p.s/14));g.stroke();continue;}
    if(p.t==='leaf'){g.globalCompositeOperation='source-over';g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.globalAlpha=.85*fa;g.fillStyle=p.c;g.beginPath();g.ellipse(0,0,p.s,p.s*.45,0,0,TAU);g.fill();g.restore();g.globalAlpha=1;continue;}
    if(p.t==='glyph'){g.globalCompositeOperation='lighter';g.globalAlpha=.55*fa*(.7+.3*Math.sin(T*3+p.ph));g.fillStyle=p.c;g.shadowColor=p.c;g.shadowBlur=10;g.font=`${p.s}px serif`;g.fillText(p.g,p.x,p.y);g.shadowBlur=0;g.globalAlpha=1;continue;}
    if(p.flat){g.globalCompositeOperation='source-over';g.globalAlpha=.8*fa;g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.s*.6,0,TAU);g.fill();g.globalAlpha=1;continue;}
    let a=fa;if(p.t==='fireflies')a*=.35+.65*Math.max(0,Math.sin(T*2.2+p.ph*3));else if(p.t==='motes'||p.t==='dust')a*=.45+.4*Math.sin(T*1.5+p.ph);else if(p.t==='wisps'&&p.s>5)a*=.35;
    g.globalCompositeOperation='lighter';g.globalAlpha=Math.max(0,a);const sz=p.s*(p.t==='spark'?3:4);g.drawImage(mfxSprite(p.c),p.x-sz/2,p.y-sz/2,sz,sz);}
  g.globalAlpha=1;g.globalCompositeOperation='source-over';}

/* ---------------- v1.47 HIIDENMAA-LOGO (SVG) ----------------
   Kirjaimet (Cinzel Decorative 900) toimivat leikkausmaskina; sisään piirretään: kivipinta + rae, malmisuonet ja -kokkareet
   (kulta, kupari, rauta), halkeamat (tumma ura + vaalea reuna), sammal kirjainten yläreunoilla, kaiverretut riimut ja hehkuvat
   hiidenkivikristallit. Ympärillä taottu rautareunus vasarajäljin, koko kirjain viistetään valolla (feSpecularLighting) ja reunat
   rosoistetaan (feDisplacementMap). Kirjainten paikat mitataan getExtentOfChar:lla, joten piirteet osuvat kirjaimiin.
   Rakennetaan uudelleen kun fontti latautuu. Siemen kiinteä → sama logo joka kerta. */
function buildLogo(){const h=document.querySelector('#menu .mTitle');if(!h)return;let sv=h.querySelector('svg.tLogo');if(sv)sv.remove();
  const NS='http://www.w3.org/2000/svg',W=1000,HH=230,FF="'Cinzel Decorative','Uncial Antiqua',serif",r=mulberry32(4711);
  const TXT=`<text x="500" y="176" text-anchor="middle" font-family="${FF}" font-weight="900" font-size="172" textLength="968" lengthAdjust="spacingAndGlyphs">Hiidenmaa</text>`;
  sv=document.createElementNS(NS,'svg');sv.setAttribute('class','tLogo');sv.setAttribute('viewBox',`0 0 ${W} ${HH}`);sv.setAttribute('role','img');sv.setAttribute('aria-label','Hiidenmaa');
  sv.innerHTML=`<g id="lgMeas" opacity="0">${TXT}</g>`;h.insertBefore(sv,h.querySelector('.tRunes'));
  const te=sv.querySelector('#lgMeas text');let B=[];try{for(let i=0;i<9;i++){const e=te.getExtentOfChar(i);B.push({x:e.x,y:e.y+e.height*.2,w:e.width,h:e.height*.62});}}catch(e){B=[];}
  if(B.length<9||!B[0].w){for(let i=0;i<9;i++)B.push({x:16+i*107.5,y:60,w:100,h:118});B=B.slice(-9);}
  const R=(a,b)=>a+r()*(b-a),pick=a=>a[r()*a.length|0],poly=(cx,cy,rad,n,sx=1,sy=1)=>{let s='';for(let k=0;k<n;k++){const a=k/n*TAU+R(-.3,.3),d=rad*R(.6,1.1);s+=`${(cx+Math.cos(a)*d*sx).toFixed(1)},${(cy+Math.sin(a)*d*sy).toFixed(1)} `;}return s;};
  let ore='',crk='',moss='',rune='',cry='',vein='';
  const RU='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  B.forEach((b,i)=>{
    // malmisuoni (kaareva vaalea juova) ja kokkareet
    if(r()<.6){const y=b.y+R(.3,.8)*b.h;vein+=`<path d="M${b.x-4},${y.toFixed(1)} Q${(b.x+b.w/2).toFixed(1)},${(y+R(-18,18)).toFixed(1)} ${(b.x+b.w+4).toFixed(1)},${(y+R(-10,10)).toFixed(1)}" stroke="${pick(['#c9a24a','#b8682e','#8fa6bd'])}" stroke-width="${R(1.5,3).toFixed(1)}" fill="none" opacity=".55"/>`;}
    for(let k=0;k<R(6,11);k++){const c=pick([['#f0cc5a','#fff3c0'],['#d47a3a','#ffd0a0'],['#9fb6cc','#f0f8ff'],['#c9a24a','#fff0c0']]),x=b.x+R(.05,.95)*b.w,y=b.y+R(0,1)*b.h,s=R(2.2,5.5);
      ore+=`<polygon points="${poly(x,y,s,5)}" fill="${c[0]}"/><circle cx="${(x-s*.3).toFixed(1)}" cy="${(y-s*.3).toFixed(1)}" r="${(s*.28).toFixed(1)}" fill="${c[1]}"/>`;}
    // halkeama: siksak ylhäältä tai alhaalta, joskus haara
    if(r()<.75){let x=b.x+R(.2,.8)*b.w,y=r()<.5?b.y-8:b.y+b.h+30,dy=y<b.y?1:-1,d=`M${x.toFixed(1)},${y.toFixed(1)}`,pts=[];for(let k=0;k<7;k++){x+=R(-14,14);y+=dy*R(10,20);d+=` L${x.toFixed(1)},${y.toFixed(1)}`;pts.push([x,y]);}
      if(r()<.6){const q=pick(pts);let bx2=q[0],by2=q[1],d2=`M${bx2.toFixed(1)},${by2.toFixed(1)}`;for(let k=0;k<3;k++){bx2+=R(-16,16);by2+=dy*R(6,13);d2+=` L${bx2.toFixed(1)},${by2.toFixed(1)}`;}d+=' '+d2;}
      crk+=`<path d="${d}" transform="translate(1.2,1.4)" stroke="rgba(255,235,200,.28)" stroke-width="1.4" fill="none"/><path d="${d}" stroke="#140c06" stroke-width="${R(1.8,2.8).toFixed(1)}" fill="none" stroke-linejoin="bevel"/>`;}
    // sammal yläreunalle ja vähän alas
    for(let k=0;k<R(5,10);k++){const x=b.x+R(-.05,1.05)*b.w,y=b.y-R(14,30)+R(0,.25)*b.h*(r()<.8?1:3);moss+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${R(6,15).toFixed(1)}" ry="${R(3,8).toFixed(1)}" fill="${pick(['#4f7a2e','#5f8f34','#3c5e24','#7aa040'])}"/>`;}
    // kaiverretut riimut
    for(let k=0;k<(r()<.5?2:1);k++){const x=b.x+R(.2,.8)*b.w,y=b.y+R(.35,.9)*b.h,s=R(20,30),g=pick([...RU]);
      rune+=`<text x="${(x+1).toFixed(1)}" y="${(y+1.2).toFixed(1)}" font-size="${s.toFixed(0)}" fill="rgba(255,230,190,.25)" text-anchor="middle" font-family="serif">${g}</text><text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${s.toFixed(0)}" fill="#1e140c" text-anchor="middle" font-family="serif" class="lgRune">${g}</text>`;}
    // hiidenkivikristallit (kolme kirjainta)
    if(i===1||i===4||i===7){const x=b.x+R(.3,.7)*b.w,y=b.y+R(.45,.8)*b.h;for(let k=0;k<3;k++){const a=R(-.6,.6),L=R(12,22),w=R(4,7),cx=x+R(-6,6),cy=y+R(-4,4);
      cry+=`<polygon transform="rotate(${(a*57).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" points="${cx},${cy-L} ${cx+w},${cy-L*.35} ${cx+w*.7},${cy+L*.4} ${cx},${cy+L*.55} ${cx-w*.7},${cy+L*.4} ${cx-w},${cy-L*.35}" fill="url(#lgCry)" stroke="#e8ffe0" stroke-width=".8"/>`;}}});
  sv.innerHTML=`<defs>
    <linearGradient id="lgStone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8b2a6"/><stop offset=".45" stop-color="#8d877c"/><stop offset=".55" stop-color="#7a7468"/><stop offset="1" stop-color="#4e4a43"/></linearGradient>
    <linearGradient id="lgIron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa0a8"/><stop offset=".4" stop-color="#4a4e55"/><stop offset=".55" stop-color="#2a2d32"/><stop offset=".8" stop-color="#5e646c"/><stop offset="1" stop-color="#22252a"/></linearGradient>
    <linearGradient id="lgCry" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaffe4"/><stop offset=".4" stop-color="#7aff9a"/><stop offset="1" stop-color="#1f7a3a"/></linearGradient>
    <linearGradient id="lgSheenG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff6e0" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="lgClip">${TXT}</clipPath>
    <filter id="lgGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .17  0 0 0 0 .14  0 0 0 -1.6 1.15"/></filter>
    <filter id="lgBlotch" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".018 .05" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .32  0 0 0 0 .26  0 0 0 0 .2  0 0 0 -2.2 1.1"/></filter>
    <filter id="lgMoss" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".22" numOctaves="2" seed="5" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="9"/><feGaussianBlur stdDeviation=".4"/></filter>
    <filter id="lgCarve" x="-3%" y="-8%" width="106%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="11" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="1.8" result="b"/><feSpecularLighting in="b" surfaceScale="3.5" specularConstant=".9" specularExponent="20" lighting-color="#fff1d8" result="s"><feDistantLight azimuth="235" elevation="42"/></feSpecularLighting>
      <feComposite in="s" in2="d" operator="in" result="s2"/><feComposite in="d" in2="s2" operator="arithmetic" k2="1" k3=".6"/></filter>
    <filter id="lgIronF" x="-3%" y="-8%" width="106%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3" result="d"/>
      <feGaussianBlur in="d" stdDeviation="1.2" result="b"/><feSpecularLighting in="b" surfaceScale="2.5" specularConstant="1.1" specularExponent="28" lighting-color="#dfe8f2" result="s"><feDistantLight azimuth="235" elevation="50"/></feSpecularLighting>
      <feComposite in="s" in2="d" operator="in" result="s2"/><feComposite in="d" in2="s2" operator="arithmetic" k2="1" k3=".8"/></filter>
    <filter id="lgGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <g filter="url(#lgIronF)"><text x="500" y="176" text-anchor="middle" font-family="${FF}" font-weight="900" font-size="172" textLength="968" lengthAdjust="spacingAndGlyphs" fill="none" stroke="url(#lgIron)" stroke-width="11" stroke-linejoin="round">Hiidenmaa</text></g>
  <g filter="url(#lgCarve)"><g clip-path="url(#lgClip)">
    <rect width="${W}" height="${HH}" fill="url(#lgStone)"/><rect width="${W}" height="${HH}" filter="url(#lgBlotch)"/><rect width="${W}" height="${HH}" filter="url(#lgGrain)"/>
    <g>${vein}</g><g>${ore}</g><g>${rune}</g><g>${crk}</g><g filter="url(#lgMoss)" opacity=".92">${moss}</g>
  </g></g>
  <g clip-path="url(#lgClip)"><g class="lgCry" filter="url(#lgGlow)">${cry}</g><rect class="lgSheen" x="-260" y="0" width="200" height="${HH}" fill="url(#lgSheenG)" transform="skewX(-18)"/></g>
  <g id="lgMeas" opacity="0">${TXT}</g>`;
  h.classList.add('hasLogo');}
(function(){const go=()=>{try{buildLogo();}catch(e){console.error(e);}};go();if(document.fonts){document.fonts.ready.then(go);document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',go);}})();
