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
