/* Hiidenmaa – menubg.js
   v1.24: valikon animoitu taustakuva (v1.51: 21 kuvaa). Alun perin 10 proseduraalisesti piirrettyä 2D-kuvaa (low poly -muodot + maalaukselliset taivaat ja sumut).
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
    g.strokeStyle='rgba(180,195,215,.35)';g.lineWidth=1*u;g.beginPath();for(let i=0;i<160;i++){const x=((i*97+t*500*u*.6)%(W+100))-50,y=((i*61+t*700*u)%(H+40))-20;g.moveTo(x,y);g.lineTo(x+10*u,y+22*u);}g.stroke();}},   // v1.51: sade viistää tuulen (puiden kallistuksen) suuntaan
 {n:'Lumisade',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#5a6a80'],[.6,'#a8b4c4'],[1,'#dfe6ee']],W);mbgSoft(g,()=>mbgHills(g,W,H,H*.6,H*.08,'#c6d0dc',r,false));
    for(let i=0;i<16;i++){const x=r()*W,y=H*(.68+r()*.12),h=(80+r()*90)*u;mbgSpruce(g,x,y,h,'#2a3e36','#34483e');for(let k=0;k<3;k++)mbgPoly(g,[[x,y-h*(.4+k*.22)-h*.18],[x-h*.3*(1-k*.22),y-h*(k*.2)-h*.05],[x,y-h*(k*.2)-h*.12]],'#eef3f8');}
    mbgPoly(g,[[0,H*.84],[W,H*.82],[W,H],[0,H]],'#e8eef4');const hx=W*.7,hy=H*.84;g.fillStyle='#5a3e28';g.fillRect(hx-60*u,hy-60*u,120*u,60*u);mbgPoly(g,[[hx-75*u,hy-58*u],[hx,hy-110*u],[hx+75*u,hy-58*u]],'#f0f4f8');g.fillStyle='#1a120a';g.fillRect(hx+20*u,hy-40*u,22*u,24*u);},
  fx(g,W,H,t,dt,s,u){const hx=W*.7,hy=H*.84,fl=.85+.15*Math.sin(t*9)+.05*Math.sin(t*23);g.fillStyle=`rgba(255,${170+Math.round(fl*40)},80,${.9*fl})`;g.fillRect(hx+21*u,hy-39*u,20*u,22*u);
    g.save();g.globalCompositeOperation='lighter';mbgRadial(g,hx+31*u,hy-28*u,70*u,[[0,`rgba(255,170,80,${.3*fl})`],[1,'rgba(0,0,0,0)']]);g.restore();
    mbgParts(g,s,dt,P=>{while(P.length<180)P.push({x:Math.random()*W,y:-10-Math.random()*H,vx:0,vy:(20+Math.random()*30)*u,l:99,ph:Math.random()*6,z:.5+Math.random()});},
      q=>{q.x+=Math.sin(t+q.ph)*10*u*dt;if(q.y>H)q.y=-5;g.fillStyle=`rgba(255,255,255,${.5+q.z*.4})`;g.fillRect(q.x,q.y,2*u*q.z,2*u*q.z);});}},
 {n:'Portaalin hehku',bg(g,W,H,r,u){mbgPortalBg(g,W,H,r,u);},fx(g,W,H,t,dt,s,u){mbgPortalFx(g,W,H,t,dt,s,u,false);}},
 {n:'Portaalin vartija',bg(g,W,H,r,u){mbgPortalBg(g,W,H,r,u);},fx(g,W,H,t,dt,s,u){mbgPortalFx(g,W,H,t,dt,s,u,true);}}
];

/* ---------- v1.51 (lista 5, kohta 1): siluettiapurit ---------- */
function mbgPath(g,pts,c){g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fill();}
// karhu: rear 0 = neljällä jalalla, 1 = takajaloillaan; mouth 0..1 (karjaisu); dir ±1
function mbgBear(g,x,y,u,rear,mouth,dir,c){g.save();g.translate(x,y);g.scale(dir*u,u);g.rotate(-rear*1.05);
  g.fillStyle=c;g.beginPath();g.ellipse(0,-34,52,30,0,0,TAU);g.fill();                       // vartalo
  g.beginPath();g.ellipse(22,-58,22,16,-.3,0,TAU);g.fill();                                    // lapa (kyttyrä)
  for(const [lx,ph] of [[-34,0],[-14,1],[18,2],[36,3]]){g.fillRect(lx-7,-14,15,16+rear*2);}     // jalat
  g.translate(56,-46);g.rotate(rear*.9-mouth*.25);g.beginPath();g.ellipse(0,0,20,15,0,0,TAU);g.fill();
  g.beginPath();g.ellipse(-6,-13,6,6,0,0,TAU);g.fill();                                        // korva
  mbgPath(g,[[12,-6],[34,-2-mouth*4],[34,3],[12,6]],c);mbgPath(g,[[12,4],[32,6+mouth*9],[30,11+mouth*11],[10,10]],c);   // kuono ja leuka
  if(mouth>.2){g.fillStyle='#3a0c08';mbgPath(g,[[14,4],[33,2],[31,7+mouth*9]],'#4a1008');}g.restore();}
function mbgWolf(g,x,y,u,howl,dir,c){g.save();g.translate(x,y);g.scale(dir*u,u);g.fillStyle=c;
  g.beginPath();g.ellipse(0,-20,24,10,0,0,TAU);g.fill();mbgPath(g,[[-22,-24],[-46,-30+Math.sin(howl*3)*2],[-40,-22],[-20,-16]],c);   // vartalo, häntä
  for(const lx of [-16,-8,10,17])g.fillRect(lx-2.5,-14,5,15);
  g.translate(20,-26);g.rotate(-howl*1.1);mbgPath(g,[[-6,4],[0,-10],[6,-12],[24,-6],[24,-2],[6,6]],c);mbgPath(g,[[0,-9],[3,-20],[7,-10]],c);g.restore();}
function mbgElk(g,x,y,u,drink,dir,c){g.save();g.translate(x,y);g.scale(dir*u,u);g.fillStyle=c;
  g.beginPath();g.ellipse(0,-62,40,20,0,0,TAU);g.fill();g.beginPath();g.ellipse(22,-72,16,14,0,0,TAU);g.fill();
  for(const lx of [-28,-16,18,30])g.fillRect(lx-3.5,-48,7,48);
  g.translate(34,-74);g.rotate(drink*1.25);mbgPath(g,[[-6,-8],[24,-14],[30,-6],[26,8],[-6,10]],c);g.translate(26,-6);mbgPath(g,[[0,0],[22,6],[24,14],[6,10]],c);   // kaula ja pää
  g.translate(-6,-4);for(const sx of [-1,1]){mbgPath(g,[[0,0],[-8,-22*sx*.0-18],[-2,-30],[6,-22],[12,-34],[16,-20],[8,-6]],c);}g.restore();}
function mbgFigure(g,x,y,u,t,c){g.save();g.translate(x,y);g.scale(u,u);g.fillStyle=c;const w=Math.sin(t*2.2)*4+Math.sin(t*5.1)*1.5;
  mbgPath(g,[[-9,-50],[9,-50],[14+w*.3,-6],[22+w,0],[-14,0],[-12,-10]],c);                     // viitta tuulessa
  g.beginPath();g.ellipse(0,-56,7,8,0,0,TAU);g.fill();mbgPath(g,[[-8,-58],[0,-70],[8,-58]],c);  // huppu
  g.fillRect(12,-62,2.5,62);mbgPath(g,[[13,-62],[9,-70],[17,-70]],c);g.restore();}              // sauva
function mbgFlash(s,dt,rate){s.fl=(s.fl||0)-dt;if(s.fl<=0&&Math.random()<dt*rate){s.fl=.45;s.bx=Math.random();}return Math.max(0,s.fl)*(s.fl>.3?1:s.fl/.3);}
function mbgBolt(g,W,H,u,s,k){if(k<=0)return;g.fillStyle=`rgba(220,230,255,${k*.55})`;g.fillRect(0,0,W,H);g.strokeStyle=`rgba(240,245,255,${k})`;g.lineWidth=2.5*u;g.beginPath();
  let x=W*(.35+s.bx*.6),y=0;g.moveTo(x,y);const rr=mulberry32((s.bx*1e6)|0);while(y<H*.55){x+=(rr()-.5)*44*u;y+=18*u;g.lineTo(x,y);}g.stroke();}
function mbgRain(g,W,H,t,u,n,a,lean){g.strokeStyle=`rgba(180,195,215,${a})`;g.lineWidth=1*u;g.beginPath();for(let i=0;i<n;i++){const x=((i*97+t*500*u*lean)%(W+100))-50,y=((i*61+t*700*u)%(H+40))-20;g.moveTo(x,y);g.lineTo(x+14*u*lean,y+22*u);}g.stroke();}
/* Portaali (eeppinen): riimuin kaiverrettu kivikaari lohkoista, raunioituneet pylväät, portaat, hehkuvat maan halkeamat,
   leijuvat kivenpalat, energiavirrat ja pyörteinen hehku; versio 2: viittapäinen hahmo sauvoineen portaiden juurella. */
function mbgPortalBg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#06040c'],[.55,'#141026'],[1,'#0c0a10']],W);mbgStars(g,W,H,200,r,.6);
  mbgSoft(g,()=>{for(let i=0;i<6;i++){g.fillStyle=`rgba(60,40,110,${.12+r()*.1})`;g.beginPath();g.ellipse(r()*W,H*(.1+r()*.3),(160+r()*160)*u,(30+r()*30)*u,0,0,TAU);g.fill();}});
  mbgHills(g,W,H,H*.7,H*.08,'#120f1e',r,true);mbgPoly(g,[[0,H*.83],[W,H*.81],[W,H],[0,H]],'#0e0c14');
  const cx=W*.7,base=H*.82;
  for(let k=0;k<4;k++){const w=(210-k*30)*u;mbgPoly(g,[[cx-w,base-k*9*u],[cx+w,base-k*9*u],[cx+w-6*u,base-(k+1)*9*u],[cx-w+6*u,base-(k+1)*9*u]],k%2?'#2c2a36':'#34323e');}   // portaat
  for(const [px,ph,br] of [[-235,150,1],[230,95,1],[-300,60,1],[300,130,0]]){const x=cx+px*u,top=base-ph*u;mbgPoly(g,[[x-17*u,base],[x+17*u,base],[x+15*u,top+(br?10*u:0)],[x+4*u,top],[x-6*u,top+12*u],[x-15*u,top+4*u]],'#2a2834');g.fillStyle='#1e1c26';g.fillRect(x,top+12*u,15*u,ph*u-12*u);}
  // kivikaari lohkoista
  const R0=150*u,R1=190*u,ay=base-36*u,N=15;for(let i=0;i<N;i++){const a0=Math.PI+i/N*Math.PI,a1=Math.PI+(i+1)/N*Math.PI,c=i%2?'#3e3c48':'#4a4856';
    mbgPoly(g,[[cx+Math.cos(a0)*R0,ay+Math.sin(a0)*R0*1.15],[cx+Math.cos(a0)*R1,ay+Math.sin(a0)*R1*1.15],[cx+Math.cos(a1)*R1,ay+Math.sin(a1)*R1*1.15],[cx+Math.cos(a1)*R0,ay+Math.sin(a1)*R0*1.15]],c);}
  for(const sx of [-1,1]){g.fillStyle='#3a3844';g.fillRect(cx+sx*170*u-20*u,ay,40*u,base-ay-36*u+36*u);g.fillStyle='#2c2a34';g.fillRect(cx+sx*170*u+(sx>0?0:-20*u),ay,20*u,base-ay);}
  mbgPoly(g,[[cx-22*u,ay-R1*1.15-6*u],[cx+22*u,ay-R1*1.15-6*u],[cx+14*u,ay-R0*1.15+4*u],[cx-14*u,ay-R0*1.15+4*u]],'#56546a');   // lakikivi
  for(let i=0;i<14;i++)mbgSpruce(g,r()*W*.42,H*(.8+r()*.06),(60+r()*90)*u,'#08060e','#0c0a14');}
function mbgPortalFx(g,W,H,t,dt,s,u,fig){const cx=W*.7,base=H*.82,ay=base-36*u,R0=150*u,p=.75+.25*Math.sin(t*1.7);
  g.save();g.globalCompositeOperation='lighter';
  mbgRadial(g,cx,ay-40*u,260*u*p,[[0,`rgba(120,255,240,${.35*p})`],[.45,`rgba(90,120,255,${.14*p})`],[1,'rgba(0,0,0,0)']]);
  // portin pinta: kerroksellinen pyörre
  g.save();g.beginPath();g.ellipse(cx,ay,R0*.97,R0*1.12,0,Math.PI,TAU);g.lineTo(cx+R0*.97,base-36*u);g.lineTo(cx-R0*.97,base-36*u);g.closePath();g.clip();   // aukko: kaari + pylväiden väli portaisiin asti
  mbgRadial(g,cx,ay-20*u,R0*1.2,[[0,'rgba(220,255,255,.85)'],[.3,'rgba(120,240,240,.55)'],[.7,'rgba(70,90,220,.4)'],[1,'rgba(30,20,90,.2)']]);
  for(let k=0;k<5;k++){g.strokeStyle=`rgba(200,255,250,${.28-k*.04})`;g.lineWidth=(3-k*.4)*u;g.beginPath();for(let a=0;a<TAU*1.6;a+=.15){const rr=(10+a*22+k*6)*u,aa=a+t*(1.2+k*.25)+k;g.lineTo(cx+Math.cos(aa)*rr,ay-10*u+Math.sin(aa)*rr*1.2);}g.stroke();}g.fillStyle='rgba(120,240,240,.25)';g.fillRect(cx-R0,ay,R0*2,base-36*u-ay);g.restore();
  // riimut kaaressa hehkuvat aallossa
  g.font=`${16*u}px serif`;g.textAlign='center';const N=13;for(let i=0;i<N;i++){const a=Math.PI+(i+.5)/N*Math.PI,rr=170*u,x=cx+Math.cos(a)*rr,y=ay+Math.sin(a)*rr*1.15+5*u,k=.35+.65*Math.max(0,Math.sin(t*2-i*.55));
    g.fillStyle=`rgba(140,255,240,${k})`;g.fillText('ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇ'[i],x,y);}
  // maan halkeamat
  g.strokeStyle=`rgba(120,240,255,${.35+.25*Math.sin(t*2.3)})`;g.lineWidth=2*u;g.beginPath();for(const [x0,dx] of [[-40,-120],[30,140],[-10,-60],[60,90]]){g.moveTo(cx+x0*u,base+4*u);g.lineTo(cx+(x0+dx*.4)*u,base+16*u);g.lineTo(cx+(x0+dx)*u,base+30*u);}g.stroke();
  // energiavirrat ja kipinät portista ylös
  mbgParts(g,s,dt,P=>{if(Math.random()<dt*36){const a=Math.random()*TAU;P.push({x:cx+Math.cos(a)*R0*.9,y:ay-10*u-Math.abs(Math.sin(a))*R0*1.05,vx:Math.cos(a+1.6)*40*u,vy:-30*u-Math.random()*40*u,l:1.2+Math.random()*1.4});}},
    q=>{q.vx*=.98;g.fillStyle=`rgba(170,255,250,${Math.min(1,q.l)})`;g.fillRect(q.x,q.y,2.4*u,2.4*u);});
  g.restore();
  // leijuvat kivet (varjopuoli + hehkureuna)
  for(let i=0;i<7;i++){const ang=i/7*TAU+t*.12,rx=(230+(i%3)*30)*u,x=cx+Math.cos(ang)*rx,y=ay-30*u+Math.sin(ang)*60*u-Math.sin(t*1.3+i)*8*u,sz=(8+(i*5)%10)*u;
    mbgPoly(g,[[x-sz,y],[x-sz*.3,y-sz*.8],[x+sz,y-sz*.3],[x+sz*.6,y+sz*.6],[x-sz*.4,y+sz*.7]],'#2e2c3a');g.fillStyle='rgba(140,255,240,.5)';g.fillRect(x-sz*.3,y-sz*.85,sz*.9,1.5*u);}
  if(fig)mbgFigure(g,cx-14*u,base-36*u+2*u,u*1.25,t,'#050409');}
/* ---------- v1.51: kymmenen uutta kuvaa ---------- */
MBG_SCENES.push(
 {n:'Myrskytuuli',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#151a1e'],[.55,'#2a3234'],[1,'#121610']],W);
    mbgSoft(g,()=>{for(let i=0;i<10;i++){g.fillStyle=`rgba(${34+r()*25},${40+r()*25},${44+r()*25},.92)`;g.beginPath();g.ellipse(r()*W,H*(.04+r()*.26),(140+r()*140)*u,(30+r()*24)*u,0,0,TAU);g.fill();}});
    mbgHills(g,W,H,H*.7,H*.05,'#1a2618',r,true);mbgPoly(g,[[0,H*.82],[W,H*.8],[W,H],[0,H]],'#141e14');},
  fx(g,W,H,t,dt,s,u){const gust=.22+.14*Math.sin(t*1.3)+.08*Math.sin(t*3.7);
    for(let i=0;i<12;i++){if(i===7)continue;const x=W*(.32+i*.055),y=H*(.82+(i%3)*.008),h=(120+(i*41)%70)*u;g.save();g.translate(x,y);g.transform(1,0,-gust*(1+.25*Math.sin(t*3+i)),1,0,0);mbgSpruce(g,0,0,h,'#0d170f','#122014');g.restore();}
    // kaatuva puu: 9 s sykli, kaatuu 1,4 s (kiihtyen), makaa, häipyy
    const T=t%9,fx=W*.32+7*W*.055,fy=H*.82,h=175*u;let ang=Math.min(1,Math.max(0,(T-1)/1.4));ang=ang*ang*1.5;const fade=T>7.5?1-(T-7.5)/1.5:1;
    if(T<1)ang=Math.sin(T*9)*.04+gust*.25;g.save();g.globalAlpha=fade;g.translate(fx,fy);g.rotate(Math.min(1.5,ang));mbgSpruce(g,0,0,h,'#101a10','#16241a');g.restore();g.globalAlpha=1;
    if(T>2.4&&!s.hit){s.hit=1;s.dust=1;}if(T<2.4)s.hit=0;if(s.dust>0){s.dust-=dt*.6;g.fillStyle=`rgba(90,90,80,${s.dust*.5})`;for(let k=0;k<8;k++){g.beginPath();g.ellipse(fx+(40+k*20)*u,fy-5*u-k%3*6*u,(30+k*4)*u*(1.4-s.dust),10*u,0,0,TAU);g.fill();}}
    const k=mbgFlash(s,dt,.3);mbgBolt(g,W,H,u,s,k);mbgRain(g,W,H,t,u,200,.38,.9);
    mbgParts(g,s,dt,P=>{if(Math.random()<dt*10)P.push({x:-10,y:Math.random()*H*.8,vx:(260+Math.random()*200)*u,vy:(Math.random()-.3)*60*u,l:4,rot:Math.random()*6});},q=>{q.rot+=.2;g.save();g.translate(q.x,q.y);g.rotate(q.rot);g.fillStyle='#3a4a22';g.fillRect(-4*u,-1.5*u,8*u,3*u);g.restore();});}},
 {n:'Karhun raivo',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#2a2418'],[.55,'#4a3a22'],[1,'#1a1a10']],W);
    mbgSoft(g,()=>{mbgRadial(g,W*.75,H*.35,320*u,[[0,'rgba(255,170,90,.35)'],[1,'rgba(0,0,0,0)']]);mbgHills(g,W,H,H*.66,H*.05,'#2a2a18',r,false);});
    for(let i=0;i<18;i++)mbgSpruce(g,r()*W,H*(.72+r()*.06),(90+r()*100)*u,'#141a0e','#1a2212');mbgPoly(g,[[0,H*.8],[W,H*.79],[W,H],[0,H]],'#1e1e12');},
  fx(g,W,H,t,dt,s,u){const T=t%7;let rear=0,mouth=0,bx=W*(.62+.05*Math.sin(t*.4));if(T<2.2){rear=Math.min(1,T/.6);mouth=T>.5&&T<2?1:0;}else if(T<2.6){rear=1-(T-2.2)/.4;}
    const shake=T>2.5&&T<4?Math.sin(t*28)*.12:0;g.save();g.translate(W*.8,H*.8);g.rotate(shake);mbgBirch(g,0,0,210*u,'#cfc8b8','#3a4a1e','#4a5a22',mulberry32(7));g.restore();
    mbgBear(g,bx,H*.8,u*1.6,rear,mouth*(.7+.3*Math.sin(t*20)),1,'#100c08');
    if(T>2.5&&T<3.2&&!s.slam){s.slam=1;for(let k=0;k<6;k++)(s.b||(s.b=[])).push({x:W*.78,y:H*.4,vx:(-60-Math.random()*90)*u,vy:(-40-Math.random()*50)*u,l:4});}if(T<2.5)s.slam=0;
    if(s.b)for(let i=s.b.length-1;i>=0;i--){const q=s.b[i];q.l-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.l<=0){s.b.splice(i,1);continue;}const f=Math.sin(t*14+i)*4*u;g.strokeStyle='#120e08';g.lineWidth=2*u;g.beginPath();g.moveTo(q.x-8*u,q.y-f);g.lineTo(q.x,q.y);g.lineTo(q.x+8*u,q.y-f);g.stroke();}
    mbgParts(g,s,dt,P=>{if(Math.random()<dt*(T>2.5&&T<4.5?20:3))P.push({x:W*(.72+Math.random()*.14),y:H*.35,vx:(Math.random()-.5)*30*u,vy:(30+Math.random()*30)*u,l:4});},q=>{g.fillStyle='#6a7a2a';g.fillRect(q.x,q.y,4*u,2*u);});}},
 {n:'Routaluolan suu',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#0c1622'],[.6,'#22384a'],[1,'#c8d6e2']],W);mbgStars(g,W,H,90,r,.35);
    mbgHills(g,W,H,H*.45,H*.18,'#2a3a4a',r,true,.12);mbgHills(g,W,H,H*.62,H*.1,'#3a4e60',r,true,.09);
    const cx=W*.68,cy=H*.72;mbgPoly(g,[[cx-170*u,H],[cx-150*u,cy-90*u],[cx-60*u,cy-170*u],[cx+80*u,cy-160*u],[cx+170*u,cy-80*u],[cx+200*u,H]],'#4a5e72');
    g.fillStyle='#04080e';g.beginPath();g.ellipse(cx,cy+10*u,95*u,110*u,0,Math.PI,TAU);g.fillRect(cx-95*u,cy+10*u,190*u,H);g.fill();
    for(let i=0;i<11;i++){const x=cx-85*u+i*17*u,l=(18+r()*30)*u,y=cy+10*u-Math.sqrt(Math.max(0,1-((x-cx)/(95*u))**2))*110*u;mbgPoly(g,[[x-5*u,y],[x+5*u,y],[x,y+l]],'#cfe8f8');}
    mbgPoly(g,[[0,H*.88],[W,H*.86],[W,H],[0,H]],'#dfe8f0');},
  fx(g,W,H,t,dt,s,u){const cx=W*.68,cy=H*.72,p=.6+.4*Math.sin(t*.9);g.save();g.globalCompositeOperation='lighter';mbgRadial(g,cx,cy+40*u,120*u,[[0,`rgba(120,200,255,${.28*p})`],[1,'rgba(0,0,0,0)']]);g.restore();
    mbgParts(g,s,dt,P=>{if(Math.random()<dt*5)P.push({x:cx+(Math.random()-.5)*80*u,y:cy+30*u,vx:(Math.random()-.3)*40*u,vy:-8*u,l:5,r:20*u});},q=>{q.r+=12*u*dt;mbgRadial(g,q.x,q.y,q.r,[[0,`rgba(190,225,255,${.18*Math.min(1,q.l/2)})`],[1,'rgba(190,225,255,0)']]);});
    for(let i=0;i<120;i++){const x=((i*131+t*14*u)%W),y=((i*71+t*30*u)%H);g.fillStyle='rgba(255,255,255,.7)';g.fillRect(x,y,1.6*u,1.6*u);}}},
 {n:'Kalmankammion käytävä',bg(g,W,H,r,u){g.fillStyle='#0a0806';g.fillRect(0,0,W,H);const vx=W*.68,vy=H*.5,ow=60*u,oh=80*u;
    mbgPoly(g,[[W*.3,0],[vx-ow,vy-oh],[vx-ow,vy+oh],[W*.3,H]],'#2a2420');mbgPoly(g,[[W,0],[vx+ow,vy-oh],[vx+ow,vy+oh],[W,H]],'#221c18');
    mbgPoly(g,[[W*.3,H],[vx-ow,vy+oh],[vx+ow,vy+oh],[W,H]],'#1a1612');mbgPoly(g,[[W*.3,0],[vx-ow,vy-oh],[vx+ow,vy-oh],[W,0]],'#14100c');
    g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1.5*u;for(let k=1;k<9;k++){const f=k/9,lx=lerp(W*.3,vx-ow,f),rx=lerp(W,vx+ow,f);g.beginPath();g.moveTo(lx,lerp(0,vy-oh,f));g.lineTo(lx,lerp(H,vy+oh,f));g.moveTo(rx,lerp(0,vy-oh,f));g.lineTo(rx,lerp(H,vy+oh,f));g.stroke();}
    g.fillStyle='#030202';g.fillRect(vx-ow,vy-oh,ow*2,oh*2);
    for(let k=0;k<5;k++){const f=.15+k*.17,lx=lerp(W*.3,vx-ow,f),ly=lerp(H*.75,vy+oh*.4,f);for(let j=0;j<3;j++){g.fillStyle='#d8d0bc';g.fillRect(lx+j*5*u*(1-f),ly-(10+j*4)*u*(1-f*.6),3*u*(1-f*.5),(10+j*4)*u*(1-f*.6));}}
    for(let k=0;k<6;k++){const f=.1+k*.15,x=lerp(W*.86,vx+ow*.5,f),y=lerp(H*.86,vy+oh*.7,f);g.fillStyle='#cfc4ae';g.beginPath();g.ellipse(x,y,8*u*(1-f*.7),4*u*(1-f*.7),0,0,TAU);g.fill();}},
  fx(g,W,H,t,dt,s,u){const vx=W*.68,vy=H*.5;g.save();g.globalCompositeOperation='lighter';
    for(let k=0;k<5;k++){const f=.15+k*.17,lx=lerp(W*.3,vx-60*u,f),ly=lerp(H*.75,vy+32*u,f),fl=.8+.2*Math.sin(t*(11+k)+k*3);for(let j=0;j<3;j++){const x=lx+j*5*u*(1-f)+1.5*u,y=ly-(10+j*4)*u*(1-f*.6);
      mbgRadial(g,x,y-4*u,40*u*(1-f*.6)*fl,[[0,`rgba(255,170,80,${.35*fl})`],[1,'rgba(0,0,0,0)']]);g.fillStyle=`rgba(255,210,120,${fl})`;g.beginPath();g.ellipse(x,y-4*u*(1-f*.5),1.8*u,4*u*(1-f*.5),0,0,TAU);g.fill();}}g.restore();
    const T=t%11;if(T>6&&T<8.5){const k=(T-6)/2.5,x=vx-70*u+k*140*u,a=Math.sin(k*Math.PI);g.globalAlpha=a*.85;mbgFigure(g,x,vy+80*u,u*1.4,t,'#000');g.globalAlpha=1;
      g.save();g.globalCompositeOperation='lighter';for(const sx of [-3,3]){g.fillStyle=`rgba(120,255,232,${a})`;g.fillRect(x+sx*u-1*u,vy-6*u,2*u,2*u);}g.restore();}
    for(let i=0;i<40;i++){const x=W*.3+((i*97+t*6*u)%(W*.7)),y=((i*53+Math.sin(t*.5+i)*20*u)%H);g.fillStyle='rgba(255,220,170,.25)';g.fillRect(x,y,1.5*u,1.5*u);}}},
 {n:'Aarnihaudan juurakko',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#050a06'],[.6,'#0e1a10'],[1,'#0a120a']],W);for(let i=0;i<20;i++)mbgSpruce(g,r()*W,H*(.62+r()*.1),(120+r()*120)*u,'#060c06','#081008');
    mbgPoly(g,[[0,H*.8],[W,H*.78],[W,H],[0,H]],'#0e180e');const cx=W*.68,cy=H*.8;g.fillStyle='#000';g.beginPath();g.ellipse(cx,cy,110*u,30*u,0,0,TAU);g.fill();
    // jättiläispuun runko nousee kuvan yläreunaan, juuret kaartuvat kuopan yli maahan (kapenevat, mutkittelevat)
    const ty=cy-170*u;mbgPoly(g,[[cx-46*u,ty+10*u],[cx-34*u,0],[cx+40*u,0],[cx+52*u,ty+10*u]],'#1a120a');mbgPoly(g,[[cx+6*u,ty],[cx+14*u,0],[cx+40*u,0],[cx+52*u,ty+10*u]],'#120c06');
    g.lineCap='round';for(let i=0;i<10;i++){const sd=i<5?-1:1,j=i%5,ex=cx+sd*(80+j*45+r()*20)*u,ey=cy+(8+r()*14)*u,sx=cx+sd*(10+j*8)*u,sy=ty+12*u;
      for(let k=0;k<3;k++){g.strokeStyle=k===0?'#1e160c':k===1?'#2a1e12':'#3a2a18';g.lineWidth=(22-j*3-k*6)*u;g.beginPath();g.moveTo(sx,sy);
        g.bezierCurveTo(sx+sd*(60+j*30)*u,sy-(20+r()*30)*u,ex+sd*(10)*u-(r()-.5)*30*u,ey-(90+j*10)*u,ex,ey);g.stroke();}}
    g.fillStyle='#2a3a1a';for(let i=0;i<22;i++){g.beginPath();g.ellipse(cx+(r()-.5)*360*u,cy-r()*170*u,(4+r()*7)*u,(2+r()*3)*u,0,0,TAU);g.fill();}},
  fx(g,W,H,t,dt,s,u){const cx=W*.68,cy=H*.8,p=.55+.45*Math.sin(t*1.1)+.1*Math.sin(t*4.3);g.save();g.globalCompositeOperation='lighter';
    mbgRadial(g,cx,cy,230*u*p,[[0,`rgba(120,255,150,${.65*p})`],[.5,`rgba(60,180,90,${.12*p})`],[1,'rgba(0,0,0,0)']]);
    mbgParts(g,s,dt,P=>{if(Math.random()<dt*14)P.push({x:cx+(Math.random()-.5)*160*u,y:cy,vx:(Math.random()-.5)*14*u,vy:-(20+Math.random()*30)*u,l:4+Math.random()*3,ph:Math.random()*6});},q=>{q.x+=Math.sin(t*2+q.ph)*8*u*dt;g.fillStyle=`rgba(150,255,170,${Math.min(1,q.l/2)*.8})`;g.beginPath();g.arc(q.x,q.y,1.8*u,0,TAU);g.fill();});g.restore();}},
 {n:'Susilauma kuutamossa',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#04060e'],[.6,'#121a2a'],[1,'#0a0c10']],W);mbgStars(g,W,H,260,r,.6);
    mbgRadial(g,W*.82,H*.22,180*u,[[0,'rgba(230,235,220,.25)'],[1,'rgba(0,0,0,0)']]);g.fillStyle='#ecefe0';g.beginPath();g.arc(W*.82,H*.22,58*u,0,TAU);g.fill();g.fillStyle='rgba(180,185,170,.35)';for(const [dx,dy,rr] of [[-14,-10,12],[12,8,9],[-4,18,6]]){g.beginPath();g.arc(W*.82+dx*u,H*.22+dy*u,rr*u,0,TAU);g.fill();}
    mbgHills(g,W,H,H*.74,H*.05,'#0c1018',r,false);mbgPoly(g,[[W*.5,H],[W*.56,H*.66],[W*.66,H*.6],[W*.8,H*.62],[W*.92,H*.7],[W,H]],'#06080c');},
  fx(g,W,H,t,dt,s,u){const ws=[[.6,.645,1,0],[.72,.6,1,1.7],[.84,.62,-1,3.1]];for(const [x,y,d,ph] of ws){const T=(t+ph)%8,h=T<3?Math.min(1,T/.5)*Math.min(1,(3-T)/.5):0;mbgWolf(g,W*x,H*y,u*1.6,h,d,'#020306');}
    for(let k=0;k<3;k++){const y=H*(.8+k*.05);g.fillStyle=`rgba(150,165,190,${.08+k*.03})`;g.beginPath();g.ellipse(((t*8*u*(k+1))%(W*1.4))-W*.2,y,W*.5,22*u,0,0,TAU);g.fill();}}},
 {n:'Hirvi aamujärvellä',bg(g,W,H,r,u){mbgGrad(g,0,H*.6,[[0,'#3a4a6a'],[.6,'#e8a888'],[1,'#ffd8a8']],W);mbgRadial(g,W*.72,H*.56,220*u,[[0,'rgba(255,230,180,.6)'],[1,'rgba(0,0,0,0)']]);
    for(let i=0;i<30;i++){const x=r()*W,h=(40+r()*60)*u;mbgSpruce(g,x,H*.6,h,'#2a2a3a','#323244');}
    mbgGrad(g,H*.6,H,[[0,'#d8a890'],[.4,'#6a6a80'],[1,'#2a3040']],W);for(let i=0;i<30;i++){const x=r()*W,h=(30+r()*45)*u;g.save();g.globalAlpha=.25;g.translate(x,H*.6);g.scale(1,-1);mbgSpruce(g,0,0,h,'#2a2a3a');g.restore();}},
  fx(g,W,H,t,dt,s,u){const T=t%9,d=T<2?0:T<3?(T-2):T<6?1:T<7?1-(T-6):0;const ex=W*.68,ey=H*.66;
    g.save();g.globalAlpha=.3;g.translate(ex,ey+4*u);g.scale(1,-1);mbgElk(g,0,0,u*1.2,d,1,'#1a1a24');g.restore();mbgElk(g,ex,ey,u*1.2,d,1,'#14141c');
    if(T>3&&T<6&&Math.random()<dt*2)(s.rip||(s.rip=[])).push({r:2,a:.6});if(s.rip)for(let i=s.rip.length-1;i>=0;i--){const q=s.rip[i];q.r+=30*u*dt;q.a-=dt*.25;if(q.a<=0){s.rip.splice(i,1);continue;}g.strokeStyle=`rgba(255,235,210,${q.a})`;g.lineWidth=1.2*u;g.beginPath();g.ellipse(ex+72*u,ey+6*u,q.r,q.r*.25,0,0,TAU);g.stroke();}
    for(let k=0;k<4;k++){g.fillStyle=`rgba(255,240,230,${.08+k*.02})`;g.beginPath();g.ellipse(((t*(6+k*3)*u+k*W*.3)%(W*1.4))-W*.2,H*(.6+k*.03),W*.35,14*u,0,0,TAU);g.fill();}}},
 {n:'Kalmanvartijan varjo',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#06080c'],[.6,'#141a22'],[1,'#080a0a']],W);
    mbgSoft(g,()=>{for(let i=0;i<10;i++){g.fillStyle=`rgba(${24+r()*20},${28+r()*20},${36+r()*20},.95)`;g.beginPath();g.ellipse(r()*W,H*(.05+r()*.3),(150+r()*150)*u,(30+r()*20)*u,0,0,TAU);g.fill();}});
    mbgPoly(g,[[W*.38,H],[W*.52,H*.7],[W*.7,H*.62],[W*.9,H*.7],[W,H*.76],[W,H]],'#0a0c0c');for(let i=0;i<7;i++){const x=W*(.55+i*.05),y=H*(.66-Math.sin(i/6*Math.PI)*.03);g.fillStyle='#14161a';g.fillRect(x,y-30*u,12*u,30*u);}},
  fx(g,W,H,t,dt,s,u){const k=mbgFlash(s,dt,.35),gx=W*.72,gy=H*.64;g.save();g.globalAlpha=Math.min(1,.16+k*1.6);g.fillStyle='#0a0a0e';
    mbgPoly(g,[[gx-90*u,gy],[gx-110*u,gy-150*u],[gx-150*u,gy-260*u],[gx-80*u,gy-330*u],[gx-40*u,gy-400*u],[gx+40*u,gy-400*u],[gx+80*u,gy-330*u],[gx+150*u,gy-260*u],[gx+110*u,gy-150*u],[gx+90*u,gy]],'#0a0a0e');g.restore();
    g.save();g.globalCompositeOperation='lighter';for(const sx of [-1,1]){const a=.25+.2*Math.sin(t*1.3)+k;mbgRadial(g,gx+sx*16*u,gy-370*u,14*u,[[0,`rgba(255,120,60,${Math.min(1,a)})`],[1,'rgba(0,0,0,0)']]);}g.restore();
    mbgBolt(g,W,H,u,s,k);mbgRain(g,W,H,t,u,160,.3,.5);}},
 {n:'Hautakummun usva',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#06080a'],[.6,'#1a2420'],[1,'#0c100e']],W);mbgStars(g,W,H,120,r,.4);mbgSoft(g,()=>mbgRadial(g,W*.3,H*.2,200*u,[[0,'rgba(200,210,200,.15)'],[1,'rgba(0,0,0,0)']]));
    for(let i=0;i<5;i++){const x=W*(.45+i*.12),y=H*(.8+(i%2)*.03);g.fillStyle='#141c16';g.beginPath();g.ellipse(x,y,70*u,26*u,0,Math.PI,TAU);g.fill();g.fillStyle='#262a26';g.fillRect(x-6*u,y-60*u,12*u,40*u);g.fillRect(x-16*u,y-50*u,32*u,8*u);}
    mbgPoly(g,[[0,H*.82],[W,H*.8],[W,H],[0,H]],'#0e1410');},
  fx(g,W,H,t,dt,s,u){for(let i=0;i<4;i++){const x=W*(.5+i*.12),y=H*(.82+(i%2)*.02),T=(t*.7+i*1.7)%6,rise=T<3?T/3:T<4.5?1:1-(T-4.5)/1.5;
      g.save();g.beginPath();g.rect(x-40*u,0,80*u,y);g.clip();g.translate(x,y+70*u*(1-rise));g.fillStyle='#b8b0a0';
      g.beginPath();g.ellipse(0,-62*u,9*u,10*u,0,0,TAU);g.fill();g.fillRect(-7*u,-52*u,14*u,30*u);for(const sx of [-1,1]){g.save();g.translate(sx*8*u,-48*u);g.rotate(sx*(-.4-rise*.8));g.fillRect(-2*u,0,4*u,28*u);g.restore();}
      g.globalCompositeOperation='lighter';for(const sx of [-1,1]){g.fillStyle=`rgba(120,255,232,${.8*rise})`;g.fillRect(sx*3.5*u-1.2*u,-64*u,2.4*u,2.4*u);}g.restore();}
    for(let k=0;k<5;k++){g.fillStyle=`rgba(190,205,195,${.07+k*.02})`;g.beginPath();g.ellipse(((t*(5+k*2)*u+k*W*.25)%(W*1.4))-W*.2,H*(.76+k*.04),W*.4,24*u,0,0,TAU);g.fill();}}},
 {n:'Ahjo yöllä',bg(g,W,H,r,u){mbgGrad(g,0,H,[[0,'#06060a'],[.6,'#141218'],[1,'#0c0a08']],W);mbgStars(g,W,H,140,r,.45);
    for(let i=0;i<10;i++)mbgSpruce(g,r()*W*.45,H*(.76+r()*.05),(70+r()*90)*u,'#08080a','#0c0c0e');mbgPoly(g,[[0,H*.84],[W,H*.83],[W,H],[0,H]],'#141008');
    const fx=W*.78,fy=H*.84;g.fillStyle='#2a2420';g.fillRect(fx-60*u,fy-80*u,120*u,80*u);g.fillStyle='#1e1a16';g.fillRect(fx-20*u,fy-210*u,40*u,140*u);mbgPoly(g,[[fx-90*u,fy-80*u],[fx+90*u,fy-80*u],[fx+70*u,fy-100*u],[fx-70*u,fy-100*u]],'#3a2e24');
    const ax=W*.6,ay=H*.84;mbgPoly(g,[[ax-34*u,ay-34*u],[ax+40*u,ay-34*u],[ax+26*u,ay-24*u],[ax+12*u,ay-24*u],[ax+16*u,ay],[ax-14*u,ay],[ax-10*u,ay-24*u],[ax-24*u,ay-24*u]],'#2a2c30');},
  fx(g,W,H,t,dt,s,u){const fx=W*.78,fy=H*.84,fl=.8+.2*Math.sin(t*8)+.1*Math.sin(t*19);g.save();g.globalCompositeOperation='lighter';
    mbgRadial(g,fx,fy-40*u,260*u*fl,[[0,`rgba(255,120,40,${.45*fl})`],[1,'rgba(0,0,0,0)']]);g.fillStyle=`rgba(255,${150+fl*60|0},60,${fl})`;g.fillRect(fx-44*u,fy-60*u,88*u,26*u);g.restore();
    const ax=W*.6,ay=H*.84,T=t%1.6,arm=T<1.1?-1.9*Math.min(1,T/1.1):-1.9+1.9*Math.min(1,(T-1.1)/.15);
    g.save();g.translate(ax-70*u,ay);g.fillStyle='#050405';g.fillRect(-12*u,-90*u,24*u,60*u);g.fillRect(-10*u,-32*u,8*u,32*u);g.fillRect(2*u,-32*u,8*u,32*u);g.beginPath();g.arc(0,-100*u,11*u,0,TAU);g.fill();
    g.translate(8*u,-82*u);g.rotate(arm+1.4);g.fillRect(0,-3*u,46*u,6*u);g.fillRect(40*u,-11*u,14*u,22*u);g.restore();
    if(T>1.24&&!s.hit){s.hit=1;s.fl2=.25;for(let k=0;k<26;k++)(s.sp||(s.sp=[])).push({x:ax-10*u,y:ay-36*u,vx:(Math.random()-.4)*260*u,vy:(-80-Math.random()*200)*u,l:.6+Math.random()*.6});}if(T<1.2)s.hit=0;
    s.fl2=Math.max(0,(s.fl2||0)-dt);g.save();g.globalCompositeOperation='lighter';if(s.fl2>0)mbgRadial(g,ax-10*u,ay-36*u,120*u,[[0,`rgba(255,220,150,${s.fl2*2})`],[1,'rgba(0,0,0,0)']]);
    if(s.sp)for(let i=s.sp.length-1;i>=0;i--){const q=s.sp[i];q.l-=dt;q.vy+=400*u*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.l<=0){s.sp.splice(i,1);continue;}g.fillStyle=`rgba(255,${180+q.l*60|0},80,${Math.min(1,q.l*2)})`;g.fillRect(q.x,q.y,2.4*u,2.4*u);}g.restore();
    mbgParts(g,s,dt,P=>{if(Math.random()<dt*3)P.push({x:fx+(Math.random()-.5)*20*u,y:fy-210*u,vx:12*u,vy:-16*u,l:6,r:10*u});},q=>{q.r+=6*u*dt;g.fillStyle=`rgba(120,110,110,${.16*Math.min(1,q.l/3)})`;g.beginPath();g.arc(q.x,q.y,q.r,0,TAU);g.fill();});}}
);
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
const MFX_KIND=['embers','motes','snowlite','fireflies','wisps','dust','runes','storm','snow','magic','magic',
  'storm','dust','frost','dust','spores','motes','motes','storm','wisps','embers'];   // v1.51: + portaalin vartija ja 10 uutta
const MFX_N={frost:70,spores:60,embers:70,motes:60,snowlite:90,fireflies:45,wisps:30,dust:55,runes:34,storm:160,snow:170,magic:80};
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
      else{p.t='rain';p.vy=700+r()*300;if(!init&&r()<.35){p.x=-50;p.y=r()*H;}else{p.y=init?r()*H:-20;p.x=r()*(W+50)-50;}p.vx=p.vy*.45;p.s=12+r()*14;p.max=3;}break;   // v1.61: pisarat tuulen suuntaan (oikealle, kuten taustan sade, puut ja lehdet)
    case 'frost':p.vx=(r()-.5)*10;p.vy=8+r()*14;p.s=1.4+r()*2;p.c='rgba(180,225,255,1)';p.max=8+r()*6;break;
    case 'spores':p.y=init?r()*H:H+10;p.vy=-(10+r()*20);p.vx=(r()-.5)*8;p.s=1.4+r()*2;p.c='rgba(140,255,160,1)';p.max=8+r()*6;break;
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
    else if(p.t==='embers'||p.t==='magic'||p.t==='spores'||p.t==='frost'){p.vx+=Math.sin(T*1.7+p.ph)*(p.t==='magic'?40:18)*dt;}
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

/* ---------------- v1.47–v1.48 HIIDENMAA-LOGO (SVG), 7 TEEMAA ----------------
   Kirjaimet (Cinzel Decorative 900, textLength 968) toimivat leikkausmaskina; sisään piirretään teeman mukaiset kerrokset.
   Teema arvotaan aina valikkoon tultaessa (sivun lataus ja tauko), ei samaa kahdesti peräkkäin (`logoRandom`).
   crack = halkeillut kivikaiverrus, hiisi = hehkuva hiidenkivi, moss = sammaloitunut kivi, iron = taottu rauta, ore = malmikallio,
   rune = riimukivi, all = kaikki yhdessä (v1.47). Kirjainten paikat getExtentOfChar:lla, joten piirteet osuvat kirjaimiin. */
const LOGO_T={
  crack:{n:'Halkeillut kivi',fill:['#c4beb2','#99938a','#857f74','#55514a'],blotch:1,grain:1,cracks:[2,3],crW:[2.2,3.4],chips:5,rim:['#5a564f','#2e2b27','#1c1a17'],rimW:7,spec:'#fff1d8'},
  hiisi:{n:'Hiidenkivi',fill:['#7affb0','#1f8a4a','#0e4a26','#06200f'],grain:1,veins:['#b8ffd0',5],cry:'all',cryN:[2,4],glow:'#5aff9a',rim:['#1a3a24','#0a1a10','#04100a'],rimW:8,spec:'#d8ffe8',pulse:1},
  moss:{n:'Sammalkivi',fill:['#a8a596','#7d7a6c','#6a6758','#403e34'],blotch:1,grain:1,cracks:[0,1],crW:[1.6,2.2],moss:[26,38],mossDeep:1,lichen:10,rim:['#3e4a2c','#26301a','#141a0c'],rimW:7,spec:'#f0f4d8'},
  iron:{n:'Taottu rauta',fill:['#d8dee6','#7c848e','#3e444c','#22262c'],hammer:1,rivets:1,rim:['#2a2d32','#141618','#0a0b0c'],rimW:6,spec:'#f2f6ff',heat:1},
  ore:{n:'Malmikallio',fill:['#a07a5a','#6e5038','#5a3e2a','#2e2016'],blotch:1,grain:1,cracks:[0,1],crW:[1.4,2],ore:[16,26],veins:['#e8c35a',3],sparkle:1,rim:['#4a3624','#241a10','#140e08'],rimW:7,spec:'#ffe8c8'},
  rune:{n:'Riimukivi',fill:['#b09a88','#8a7462','#6e5a4a','#3e3028'],blotch:1,grain:1,runes:[3,4],runeRed:1,cracks:[0,1],crW:[1.4,2],band:1,rim:['#4a3a2e','#261c14','#120c08'],rimW:8,spec:'#fff0e0'},
  all:{n:'Kaikki',fill:['#b8b2a6','#8d877c','#7a7468','#4e4a43'],blotch:1,grain:1,cracks:[0,1],crW:[1.8,2.8],moss:[5,10],ore:[6,11],veins:['#c9a24a',1],runes:[1,2],cry:[1,4,7],cryN:[3,3],rim:['#9aa0a8','#2a2d32','#22252a'],rimW:11,spec:'#fff1d8'}};
let logoTheme='',logoBuiltFont='';
function logoRandom(){const ks=Object.keys(LOGO_T).filter(k=>k!==logoTheme);buildLogo(ks[Math.random()*ks.length|0]);}
function buildLogo(theme){theme=theme||logoTheme||'all';const T=LOGO_T[theme]||LOGO_T.all;logoTheme=theme;
  const h=document.querySelector('#menu .mTitle');if(!h)return;let sv=h.querySelector('svg.tLogo');if(sv)sv.remove();
  const NS='http://www.w3.org/2000/svg',W=1000,HH=230,FF="'Cinzel Decorative','Uncial Antiqua',serif",r=mulberry32((Math.random()*1e9)|0);
  const TXT=`<text x="500" y="176" text-anchor="middle" font-family="${FF}" font-weight="900" font-size="172" textLength="968" lengthAdjust="spacingAndGlyphs">Hiidenmaa</text>`;
  sv=document.createElementNS(NS,'svg');sv.setAttribute('class','tLogo lg-'+theme);sv.setAttribute('viewBox',`0 0 ${W} ${HH}`);sv.setAttribute('role','img');sv.setAttribute('aria-label','Hiidenmaa');sv.dataset.theme=theme;
  sv.innerHTML=`<g id="lgMeas" opacity="0">${TXT}</g>`;h.insertBefore(sv,h.querySelector('.tRunes'));
  const te=sv.querySelector('#lgMeas text');let B=[];try{for(let i=0;i<9;i++){const e=te.getExtentOfChar(i);B.push({x:e.x,y:e.y+e.height*.2,w:e.width,h:e.height*.62});}}catch(e){B=[];}
  if(B.length<9||!B[0].w){B=[];for(let i=0;i<9;i++)B.push({x:16+i*107.5,y:60,w:100,h:118});}
  const R=(a,b)=>a+r()*(b-a),RI=a=>Math.round(R(a[0],a[1])),pick=a=>a[r()*a.length|0],f1=v=>v.toFixed(1),poly=(cx,cy,rad,n)=>{let s='';for(let k=0;k<n;k++){const a=k/n*TAU+R(-.3,.3),d=rad*R(.6,1.1);s+=`${f1(cx+Math.cos(a)*d)},${f1(cy+Math.sin(a)*d)} `;}return s;};
  const L={vein:'',ore:'',crk:'',moss:'',lich:'',rune:'',cry:'',ham:'',riv:'',spk:''};const RU='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  const crack=(b,w)=>{let x=b.x+R(.15,.85)*b.w,y=r()<.5?b.y-10:b.y+b.h+30,dy=y<b.y?1:-1,d=`M${f1(x)},${f1(y)}`,pts=[];for(let k=0;k<8;k++){x+=R(-15,15);y+=dy*R(10,20);d+=` L${f1(x)},${f1(y)}`;pts.push([x,y]);}
    for(let q=0;q<(r()<.6?2:1);q++){const P=pick(pts);let bx=P[0],by=P[1],d2=`M${f1(bx)},${f1(by)}`;for(let k=0;k<4;k++){bx+=R(-18,18);by+=dy*R(6,14);d2+=` L${f1(bx)},${f1(by)}`;}d+=' '+d2;}
    L.crk+=`<path d="${d}" transform="translate(1.3,1.5)" stroke="rgba(255,235,200,.3)" stroke-width="1.5" fill="none"/><path d="${d}" stroke="#120a05" stroke-width="${f1(w)}" fill="none" stroke-linejoin="bevel"/>`;};
  B.forEach((b,i)=>{
    if(T.veins){for(let k=0;k<T.veins[1];k++)if(r()<.7){const y=b.y+R(.1,.95)*b.h;L.vein+=`<path d="M${f1(b.x-6)},${f1(y)} Q${f1(b.x+b.w*R(.3,.7))},${f1(y+R(-24,24))} ${f1(b.x+b.w+6)},${f1(y+R(-14,14))}" stroke="${T.veins[0]}" stroke-width="${f1(R(1.2,3.2))}" fill="none" opacity="${theme==='hiisi'?.85:.6}"/>`;}}
    if(T.ore)for(let k=0;k<RI(T.ore)/1;k++){const c=pick([['#f0cc5a','#fff3c0'],['#d47a3a','#ffd0a0'],['#9fb6cc','#f0f8ff'],['#c9a24a','#fff0c0'],['#6fc0a0','#e0fff0']]),x=b.x+R(.03,.97)*b.w,y=b.y-10+R(0,1.15)*b.h,sz=R(2.2,theme==='ore'?7:5.5);
      L.ore+=`<polygon points="${poly(x,y,sz,5)}" fill="${c[0]}"/><circle cx="${f1(x-sz*.3)}" cy="${f1(y-sz*.3)}" r="${f1(sz*.28)}" fill="${c[1]}"/>`;if(T.sparkle&&r()<.25)L.spk+=`<circle class="lgSpk" cx="${f1(x)}" cy="${f1(y)}" r="${f1(sz*.5)}" fill="#fff6d0" style="animation-delay:${f1(R(0,4))}s"/>`;}
    if(T.cracks){const n=RI(T.cracks);for(let k=0;k<n;k++)if(r()<.85)crack(b,R(T.crW[0],T.crW[1]));}
    if(T.chips)for(let k=0;k<R(1,3);k++){const x=b.x+R(0,1)*b.w,y=b.y-12+R(0,1.1)*b.h;L.crk+=`<polygon points="${poly(x,y,R(4,9),5)}" fill="#3a3530" opacity=".75"/>`;}
    if(T.moss){const n=RI(T.moss);for(let k=0;k<n;k++){const deep=T.mossDeep&&r()<.45,x=b.x+R(-.05,1.05)*b.w,y=deep?b.y+R(-.1,1)*b.h:b.y-R(14,30)+R(0,.25)*b.h;
      L.moss+=`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(R(6,deep?20:15))}" ry="${f1(R(3,deep?11:8))}" fill="${pick(['#4f7a2e','#5f8f34','#3c5e24','#7aa040','#6a9a38'])}"/>`;}
      if(T.mossDeep)for(let k=0;k<2;k++){const x=b.x+R(.1,.9)*b.w,y=b.y-8;L.moss+=`<path d="M${f1(x-4)},${f1(y)} q4,${f1(R(30,70))} 8,0 z" fill="#3c5e24"/>`;}}
    if(T.lichen)for(let k=0;k<R(0,T.lichen/2);k++){const x=b.x+R(0,1)*b.w,y=b.y+R(0,1)*b.h;L.lich+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R(2,5))}" fill="${pick(['#d8b43a','#c8782a','#e8e0b0'])}" opacity=".8"/>`;}
    if(T.runes){const n=RI(T.runes);for(let k=0;k<n;k++){const x=b.x+R(.15,.85)*b.w,y=b.y+R(.15,.95)*b.h,sz=R(T.runeRed?16:20,T.runeRed?26:30),g=pick([...RU]);
      L.rune+=`<text x="${f1(x+1)}" y="${f1(y+1.2)}" font-size="${sz.toFixed(0)}" fill="rgba(255,230,190,.25)" text-anchor="middle" font-family="serif">${g}</text><text x="${f1(x)}" y="${f1(y)}" font-size="${sz.toFixed(0)}" fill="${T.runeRed?'#a8281a':'#1e140c'}" text-anchor="middle" font-family="serif" class="lgRune">${g}</text>`;}}
    if(T.cry&&(T.cry==='all'||T.cry.includes(i))){const x=b.x+R(.25,.75)*b.w,y=b.y+R(.35,.85)*b.h;const n=RI(T.cryN);for(let k=0;k<n;k++){const a=R(-.7,.7),Ln=R(12,24),w=R(4,8),cx=x+R(-10,10),cy=y+R(-8,8);
      L.cry+=`<polygon transform="rotate(${(a*57).toFixed(0)} ${f1(cx)} ${f1(cy)})" points="${f1(cx)},${f1(cy-Ln)} ${f1(cx+w)},${f1(cy-Ln*.35)} ${f1(cx+w*.7)},${f1(cy+Ln*.4)} ${f1(cx)},${f1(cy+Ln*.55)} ${f1(cx-w*.7)},${f1(cy+Ln*.4)} ${f1(cx-w)},${f1(cy-Ln*.35)}" fill="url(#lgCry)" stroke="#e8ffe0" stroke-width=".8"/>`;}}
    if(T.hammer)for(let k=0;k<14;k++){const x=b.x+R(0,1)*b.w,y=b.y-10+R(0,1.15)*b.h,rr=R(3,7);L.ham+=`<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rr)}" ry="${f1(rr*.7)}" fill="rgba(0,0,0,.22)"/><ellipse cx="${f1(x-1)}" cy="${f1(y-1)}" rx="${f1(rr*.6)}" ry="${f1(rr*.35)}" fill="rgba(255,255,255,.14)"/>`;}
    if(T.rivets)for(const yy of [.05,.95]){const x=b.x+b.w*.5,y=b.y-6+yy*(b.h+16);L.riv+=`<circle cx="${f1(x)}" cy="${f1(y)}" r="4.5" fill="url(#lgRiv)"/>`;}});
  const fill=T.fill,glow=T.glow||'#ff8a2a';
  sv.innerHTML=`<defs>
    <linearGradient id="lgStone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${fill[0]}"/><stop offset=".45" stop-color="${fill[1]}"/><stop offset=".55" stop-color="${fill[2]}"/><stop offset="1" stop-color="${fill[3]}"/></linearGradient>
    <linearGradient id="lgIron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.rim[0]}"/><stop offset=".5" stop-color="${T.rim[1]}"/><stop offset="1" stop-color="${T.rim[2]}"/></linearGradient>
    <linearGradient id="lgCry" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaffe4"/><stop offset=".4" stop-color="#7aff9a"/><stop offset="1" stop-color="#1f7a3a"/></linearGradient>
    <radialGradient id="lgRiv" cx=".35" cy=".35"><stop offset="0" stop-color="#f4f6fa"/><stop offset=".5" stop-color="#7c848e"/><stop offset="1" stop-color="#1a1c20"/></radialGradient>
    <linearGradient id="lgHeat" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#ff5a10" stop-opacity="0"/><stop offset=".85" stop-color="#ff6a10" stop-opacity=".55"/><stop offset="1" stop-color="#ffd060" stop-opacity=".9"/></linearGradient>
    <linearGradient id="lgSheenG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff6e0" stop-opacity="${theme==='iron'?.8:.5}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="lgClip">${TXT}</clipPath>
    <filter id="lgGrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${theme==='iron'?'.9 .15':'.75'}" numOctaves="3" seed="${RI([1,99])}"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .17  0 0 0 0 .14  0 0 0 -1.6 ${theme==='iron'?.9:1.15}"/></filter>
    <filter id="lgBlotch" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".018 .05" numOctaves="2" seed="${RI([1,99])}"/><feColorMatrix values="0 0 0 0 .32  0 0 0 0 .26  0 0 0 0 .2  0 0 0 -2.2 1.1"/></filter>
    <filter id="lgMoss" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".22" numOctaves="2" seed="5" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="9"/><feGaussianBlur stdDeviation=".4"/></filter>
    <filter id="lgCarve" x="-3%" y="-8%" width="106%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="${RI([1,99])}" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="${theme==='iron'?1.5:theme==='crack'||theme==='ore'?7:5}" xChannelSelector="R" yChannelSelector="G" result="d"/>
      <feGaussianBlur in="d" stdDeviation="${theme==='iron'?1.3:1.8}" result="b"/><feSpecularLighting in="b" surfaceScale="${theme==='iron'?4.5:3.5}" specularConstant="${theme==='iron'?1.3:.9}" specularExponent="${theme==='iron'?34:20}" lighting-color="${T.spec}" result="s"><feDistantLight azimuth="235" elevation="42"/></feSpecularLighting>
      <feComposite in="s" in2="d" operator="in" result="s2"/><feComposite in="d" in2="s2" operator="arithmetic" k2="1" k3="${theme==='iron'?.9:.6}"/></filter>
    <filter id="lgIronF" x="-3%" y="-8%" width="106%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3" result="d"/>
      <feGaussianBlur in="d" stdDeviation="1.2" result="b"/><feSpecularLighting in="b" surfaceScale="2.5" specularConstant="1.1" specularExponent="28" lighting-color="#dfe8f2" result="s"><feDistantLight azimuth="235" elevation="50"/></feSpecularLighting>
      <feComposite in="s" in2="d" operator="in" result="s2"/><feComposite in="d" in2="s2" operator="arithmetic" k2="1" k3=".8"/></filter>
    <filter id="lgGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="lgOuter" x="-10%" y="-20%" width="120%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="9" result="b"/><feFlood flood-color="${glow}"/><feComposite in2="b" operator="in"/></filter>
  </defs>
  ${T.glow||T.heat||T.runeRed?`<g class="lgAura" filter="url(#lgOuter)" opacity="${T.glow?.75:.4}">${TXT}</g>`:''}
  <g filter="url(#lgIronF)"><text x="500" y="176" text-anchor="middle" font-family="${FF}" font-weight="900" font-size="172" textLength="968" lengthAdjust="spacingAndGlyphs" fill="none" stroke="url(#lgIron)" stroke-width="${T.rimW}" stroke-linejoin="round">Hiidenmaa</text></g>
  <g filter="url(#lgCarve)"><g clip-path="url(#lgClip)">
    <rect width="${W}" height="${HH}" fill="url(#lgStone)"/>${T.blotch?`<rect width="${W}" height="${HH}" filter="url(#lgBlotch)"/>`:''}${T.grain?`<rect width="${W}" height="${HH}" filter="url(#lgGrain)"/>`:''}${theme==='iron'?`<rect width="${W}" height="${HH}" filter="url(#lgGrain)" opacity=".6"/>`:''}
    <g>${L.ham}</g>${T.heat?`<rect width="${W}" height="${HH}" fill="url(#lgHeat)" class="lgHeat"/>`:''}<g>${L.vein}</g><g>${L.ore}</g><g>${L.lich}</g><g>${L.rune}</g><g>${L.crk}</g><g filter="url(#lgMoss)" opacity=".93">${L.moss}</g><g>${L.riv}</g>
  </g></g>
  <g clip-path="url(#lgClip)">${theme==='hiisi'?`<g class="lgVeinGlow" filter="url(#lgGlow)">${L.vein}</g>`:''}<g class="lgCry" filter="url(#lgGlow)">${L.cry}</g><g class="lgSpks" filter="url(#lgGlow)">${L.spk}</g>
    ${T.runeRed?`<g class="lgRuneGlow" filter="url(#lgGlow)" opacity="0">${L.rune.replace(/#a8281a/g,'#ff7a3a')}</g>`:''}<rect class="lgSheen" x="-260" y="0" width="200" height="${HH}" fill="url(#lgSheenG)" transform="skewX(-18)"/></g>
  <g id="lgMeas" opacity="0">${TXT}</g>`;
  if(T.band){const rr=h.querySelector('.tRunes');if(rr)rr.classList.add('band');}else{const rr=h.querySelector('.tRunes');if(rr)rr.classList.remove('band');}
  h.classList.add('hasLogo');h.dataset.logo=theme;}
(function(){logoRandom();if(document.fonts){const re=()=>{try{const f=document.fonts.check("900 40px 'Cinzel Decorative'")?'c':'f';if(f!==logoBuiltFont){logoBuiltFont=f;buildLogo(logoTheme);}}catch(e){}};document.fonts.ready.then(re);document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',re);}})();
