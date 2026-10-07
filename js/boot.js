'use strict';
/* v1.60: käynnistysjärjestys. Ensin aloitusjakso (studio → HIIDENMAA → varoitus) ja suorituskykytesti omassa kevyessä 3D-näkymässään,
   vasta sitten latausnäyttö ja pelin skriptit. Ennen jakso pyöri pelin latauksen päällä, jolloin häivytykset pätkivät. Pelin skriptit
   esiladataan taustalla (<link rel=preload>) ja ajetaan yksi kerrallaan pienellä tauolla, jotta riimut ehtivät syttyä näkyvästi.
   Välilyönti, Enter tai napsautus ohittaa koko jakson (ja testin) ja vie suoraan latausnäyttöön. */
window.__BJV='1.60';
(function(){
  var Q=location.search,wd=!!navigator.webdriver;
  function ls(k){try{return localStorage.getItem(k);}catch(e){return null;}}
  function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
  var pend=false;try{pend=!!sessionStorage.getItem('hiidenmaa_pending');}catch(e){}
  var needSplash=/[?&]splash=1/.test(Q)||(!wd&&!pend&&!ls('hiidenmaa_intro'));
  var needPerf=/[?&]perf=1/.test(Q)||(!wd&&!ls('hiidenmaa_perf')&&!ls('hiidenmaa_set'));
  var JS=window.__GJS||[],PERF_T=5,RES_T=9,LV=['Low','Low+','Medium-','Medium'];
  window.__ldT=JS.length;

  /* ---------- pelin skriptit ---------- */
  var three=null;   // three.min.js ladataan heti (testi tarvitsee sen); muut vasta latausnäytössä
  function addScript(u,cb){var s=document.createElement('script');s.src=u;if(/^https?:/.test(u))s.crossOrigin='anonymous';
    s.onload=function(){cb(true);};s.onerror=function(){if(window.__bootBox)window.__bootBox('Tiedoston lataus epäonnistui: '+u.split('/').pop());cb(false);};document.body.appendChild(s);}
  function loadThree(cb){if(three==='ok'||three==='fail'){cb();return;}if(three){three.push(cb);return;}three=[cb];
    addScript(JS[0],function(){var l=three;three=window.THREE?'ok':'fail';l.forEach(function(f){f();});});}
  JS.forEach(function(u,i){if(!i)return;var l=document.createElement('link');l.rel='preload';l.as='script';l.href=u;document.head.appendChild(l);});
  var loading=false;
  function startGame(){if(loading)return;if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',startGame);return;}loading=true;if(window.__bootWatch)window.__bootWatch();
    var i=1;loadThree(function(){if(window.__ldSet)window.__ldSet(1/JS.length);nx();});
    function nx(){if(i>=JS.length){if(window.__verCheck)window.__verCheck();return;}addScript(JS[i++],function(){setTimeout(nx,16);});}}   // tauko = riimu ehtii piirtyä

  var S=document.getElementById('splash');
  if(!needSplash&&!needPerf){startGame();window.__boot={needSplash:false,needPerf:false,PERF_T:PERF_T};return;}
  loadThree(function(){});
  window.__splashOn=true;S.hidden=false;S.classList.toggle('noIntro',!needSplash);
  var spV=function(){var e=document.getElementById('spVer');if(e)e.textContent='Versio '+(window.HV||'');};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',spV);else spV();

  /* ---------- HIIDENMAA-logo: kivi, satunnaiset halkeamat, viistovalo ---------- */
  if(needSplash){var L=document.getElementById('spLogo'),TX='<text x="500" y="176" text-anchor="middle" font-family="\'Cinzel Decorative\',\'Uncial Antiqua\',serif" font-weight="900" font-size="172" textLength="968" lengthAdjust="spacingAndGlyphs">HIIDENMAA</text>',ck='';
    for(var c=0;c<16;c++){var x=40+Math.random()*920,y=Math.random()<.5?30:200,d='M'+x.toFixed(0)+','+y;for(var k=0;k<8;k++){x+=(Math.random()-.5)*34;y+=(y<120?1:-1)*(10+Math.random()*14);d+=' L'+x.toFixed(0)+','+y.toFixed(0);}
      ck+='<path d="'+d+'" transform="translate(1.4,1.6)" stroke="rgba(255,235,200,.3)" stroke-width="1.5" fill="none"/><path d="'+d+'" stroke="#0e0804" stroke-width="'+(1.8+Math.random()*1.6).toFixed(1)+'" fill="none"/>';}
    L.innerHTML='<defs><linearGradient id="spSt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8c2b6"/><stop offset=".5" stop-color="#8e887d"/><stop offset="1" stop-color="#4a463f"/></linearGradient><clipPath id="spClip">'+TX+'</clipPath>'+
      '<filter id="spGr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .17  0 0 0 0 .14  0 0 0 -1.6 1.15"/></filter>'+
      '<filter id="spCv" x="-3%" y="-8%" width="106%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.8" result="b"/><feSpecularLighting in="b" surfaceScale="3.5" specularConstant=".9" specularExponent="20" lighting-color="#fff1d8" result="s"><feDistantLight azimuth="235" elevation="42"/></feSpecularLighting><feComposite in="s" in2="d" operator="in" result="s2"/><feComposite in="d" in2="s2" operator="arithmetic" k2="1" k3=".6"/></filter></defs>'+
      '<g filter="url(#spCv)"><g clip-path="url(#spClip)"><rect width="1000" height="230" fill="url(#spSt)"/><rect width="1000" height="230" filter="url(#spGr)"/>'+ck+'</g></g>';}

  /* ---------- suorituskykytesti: oma pieni metsänäkymä (puita, kiviä, ruohoa, varjot, sumu), kuormaltaan pelin Medium-tason luokkaa.
     0,8 s lämmittely (varjostimien käännös), sitten 5 s mittaus. ≥ 50 FPS → Medium, 35–50 → Medium-, 22–35 → Low+, < 22 → Low.
     Tulos: localStorage hiidenmaa_perf {fps, preset, idx, pend:1}; main.js ottaa esiasetuksen käyttöön ladattuaan (pend → 0). ---------- */
  var pf=null;
  function perfLevel(f){return f>=50?3:f>=35?2:f>=22?1:0;}
  function perfStore(fps){var i=perfLevel(fps);lsSet('hiidenmaa_perf',JSON.stringify({fps:Math.round(fps),preset:LV[i],idx:i,pend:1,at:Date.now()}));return i;}
  function perfScene(cv){var T=window.THREE,W=innerWidth,H=innerHeight,r;
    try{r=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});}catch(e){return null;}if(!r.getContext())return null;
    r.setPixelRatio(Math.min(devicePixelRatio||1,1.5));r.setSize(W,H,false);r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
    var sc=new T.Scene(),fogC=new T.Color(0x2a2a30);sc.background=fogC;sc.fog=new T.Fog(fogC,30,150);
    var cam=new T.PerspectiveCamera(62,W/H,.1,400);
    sc.add(new T.HemisphereLight(0x8fa0b8,0x2a2418,.55));
    var sun=new T.DirectionalLight(0xffd6a0,1.1);sun.position.set(40,60,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
    var sh=sun.shadow.camera;sh.left=sh.bottom=-60;sh.right=sh.top=60;sh.far=200;sc.add(sun);
    for(var k=0;k<4;k++){var pl=new T.PointLight(0xff9a40,.7,22);pl.position.set(Math.cos(k*1.6)*30,3,Math.sin(k*1.6)*30);sc.add(pl);}
    function hgt(x,z){return Math.sin(x*.06)*2.2+Math.cos(z*.05)*2.6+Math.sin((x+z)*.13)*.8;}
    var g=new T.PlaneGeometry(240,240,200,200);g.rotateX(-Math.PI/2);var p=g.attributes.position;
    for(var i=0;i<p.count;i++)p.setY(i,hgt(p.getX(i),p.getZ(i)));g.computeVertexNormals();
    var gr=new T.Mesh(g,new T.MeshStandardMaterial({color:0x3d5228,roughness:.95}));gr.receiveShadow=true;sc.add(gr);
    var trunkM=new T.MeshStandardMaterial({color:0x4a3524,roughness:.9}),leafM=[0x2c4a24,0x35562a,0x284020].map(function(c){return new T.MeshStandardMaterial({color:c,roughness:.85});}),
      rockM=new T.MeshStandardMaterial({color:0x6a665e,roughness:.9}),tg=new T.CylinderGeometry(.25,.4,4,8),cg=new T.ConeGeometry(2,5.5,10),rg=new T.DodecahedronGeometry(1.2,1);
    var rnd=function(){return Math.random();};
    for(i=0;i<230;i++){var a=rnd()*6.283,d=8+rnd()*100,x=Math.cos(a)*d,z=Math.sin(a)*d,y=hgt(x,z),s=.7+rnd()*.7;
      var t=new T.Mesh(tg,trunkM);t.position.set(x,y+2*s,z);t.scale.setScalar(s);t.castShadow=t.receiveShadow=true;sc.add(t);
      var cr=new T.Mesh(cg,leafM[i%3]);cr.position.set(x,y+(4+2.4)*s,z);cr.scale.setScalar(s);cr.castShadow=cr.receiveShadow=true;sc.add(cr);}
    for(i=0;i<60;i++){a=rnd()*6.283;d=6+rnd()*90;x=Math.cos(a)*d;z=Math.sin(a)*d;var rk=new T.Mesh(rg,rockM);rk.position.set(x,hgt(x,z)+.3,z);rk.scale.set(.6+rnd(),.4+rnd()*.6,.6+rnd());rk.rotation.y=rnd()*6;rk.castShadow=rk.receiveShadow=true;sc.add(rk);}
    var bl=new T.PlaneGeometry(.12,.7,1,2);bl.translate(0,.35,0);var gm=new T.InstancedMesh(bl,new T.MeshLambertMaterial({color:0x5f7a34,side:T.DoubleSide}),24000),o=new T.Object3D();
    for(i=0;i<24000;i++){a=rnd()*6.283;d=rnd()*70;x=Math.cos(a)*d;z=Math.sin(a)*d;o.position.set(x,hgt(x,z),z);o.rotation.set(0,rnd()*6.28,0);o.scale.setScalar(.6+rnd()*.8);o.updateMatrix();gm.setMatrixAt(i,o.matrix);}
    sc.add(gm);
    return {r:r,frame:function(t){var a=t*.09;cam.position.set(Math.cos(a)*34,hgt(Math.cos(a)*34,Math.sin(a)*34)+7,Math.sin(a)*34);cam.lookAt(Math.cos(a+1.1)*6,3,Math.sin(a+1.1)*6);r.render(sc,cam);},
      kill:function(){cv.style.display='none';sc.traverse(function(m){if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();});r.dispose();try{r.forceContextLoss();}catch(e){}}};}
  function perfRun(done){var el=S.querySelector('.spPerf'),P=el.querySelector('.ppPanel'),cv=el.querySelector('canvas');
    P.innerHTML='<b>Suorituskykytesti</b><p>Mitataan, kuinka sujuvasti Hiidenmaa pyörii koneellasi, jotta grafiikka voidaan säätää sopivaksi. Testi kestää '+PERF_T+' sekuntia.</p>'+
      '<div class="pBar"><i id="ppB"></i></div><div class="pRow"><span id="ppT">Valmistellaan…</span><span id="ppF"></span></div>';
    loadThree(function(){if(over)return;var G=window.THREE?perfScene(cv):null;
      if(!G){P.innerHTML='<b>Suorituskykytesti ohitettiin</b><p>3D-grafiikkaa ei voitu käynnistää testiä varten. Peli käyttää oletusasetuksia.</p>';pf={end:true};done(null);return;}
      var t0=performance.now(),last=t0,n=0,mt=0,warm=.8,b=document.getElementById('ppB'),tt=document.getElementById('ppT'),ff=document.getElementById('ppF'),sh=0;
      pf={g:G,stop:function(){if(pf&&pf.raf)cancelAnimationFrame(pf.raf);}};
      (function loop(){var now=performance.now(),dt=Math.min(.5,(now-last)/1000),t=(now-t0)/1000;last=now;
        try{G.frame(t);}catch(e){pf.err=1;}
        if(t>warm){n++;mt+=dt;}var k=Math.max(0,Math.min(1,(t-warm)/PERF_T));b.style.width=(k*100)+'%';
        if(t>warm){tt.textContent='Mitataan… '+Math.max(0,Math.ceil(PERF_T-(t-warm)))+' s';if(now-sh>250&&mt>0){sh=now;ff.textContent=Math.round(n/mt)+' FPS';}}
        if(t-warm>=PERF_T||pf.err){perfFinish();return;}pf.raf=requestAnimationFrame(loop);})();
      pf.partial=function(){return mt>=1.5?n/mt:-1;};
      function perfFinish(){var fps=pf.err?0:n/Math.max(.001,mt);pf.stop();pf.end=true;var i=perfStore(fps),f=Math.round(fps),lvl=f>=50?'Sujuva':f>=35?'Hyvä':f>=22?'Kohtalainen':'Raskas';
        el.classList.add('res');
        P.innerHTML='<small class="pHead">Suorituskykytesti valmis</small><b>Tulos: '+f+' FPS <small>('+lvl+')</small></b><p>Grafiikaksi valittiin <em>'+LV[i]+'</em>.</p>'+
          '<p class="pTip">Voit muuttaa grafiikkaa milloin tahansa itse: <em>Asetukset › Grafiikka</em> (esiasetus-liukusäädin tai yksittäiset asetukset).</p><div class="pBar t"><i></i></div>';
        setTimeout(function(){G.kill();},400);pf.tm=setTimeout(function(){done(i);},RES_T*1000);}
      pf.finish=perfFinish;});}

  /* ---------- jakson ohjaus ---------- */
  var ST=[];if(needSplash)ST.push(['spStudio',6500],['spTitle',7200],['spWarn',11000]);if(needPerf)ST.push(['spPerf',0]);ST.push(['spTrans',1300]);
  var i=-1,tm=0,st=performance.now(),over=false;
  function show(n){var all=S.querySelectorAll('.spStage');for(var j=0;j<all.length;j++)all[j].classList.remove('on');var el=S.querySelector('.'+n);void el.offsetWidth;el.classList.add('on');S.classList.toggle('trans',n==='spTrans');}
  function next(){clearTimeout(tm);if(over)return;i++;if(i>=ST.length){end();return;}var n=ST[i][0];show(n);
    if(n==='spPerf')setTimeout(function(){if(!over)perfRun(function(){next();});},700);else tm=setTimeout(next,ST[i][1]);}
  function end(){if(over)return;over=true;clearTimeout(tm);S.classList.add('out');if(needSplash)lsSet('hiidenmaa_intro','1');
    removeEventListener('keydown',skip,true);removeEventListener('mousedown',skip,true);removeEventListener('touchstart',skip,true);
    if(pf&&pf.tm)clearTimeout(pf.tm);
    var ld=document.getElementById('loadScr');if(ld)ld.classList.add('enter');
    setTimeout(function(){window.__splashOn=false;if(S.parentNode)S.parentNode.removeChild(S);},750);
    setTimeout(startGame,needSplash||needPerf?1250:0);}   // latausnäytön sisääntulo ehtii valmiiksi ennen raskasta latausta
  /* Ohitus: välilyönti, Enter tai napsautus → suoraan latausnäyttöön. Kesken jäänyt testi: tulos, jos mitattu ≥ 1,5 s, muuten testi tulee
     uudelleen seuraavalla kerralla (oletusasetukset). */
  function skip(e){if(e.type==='keydown'&&e.code!=='Space'&&e.code!=='Enter'&&e.code!=='NumpadEnter')return;e.stopPropagation();if(e.cancelable)e.preventDefault();
    if(performance.now()-st<500)return;
    if(pf&&!pf.end){pf.stop();var f=pf.partial?pf.partial():-1;if(f>=0)perfStore(f);if(pf.g)pf.g.kill();pf.end=true;}
    else if(pf&&pf.g&&pf.end){/* tulos jo tallennettu */}
    end();}
  addEventListener('keydown',skip,true);addEventListener('mousedown',skip,true);addEventListener('touchstart',skip,{capture:true,passive:false});
  setTimeout(next,700);
  window.__boot={needSplash:needSplash,needPerf:needPerf,PERF_T:PERF_T,RES_T:RES_T,perfLevel:perfLevel,perfRun:perfRun,skip:function(){skip({type:'mousedown',stopPropagation:function(){}});}};
})();
