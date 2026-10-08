# Hiidenmaa – korjausmuistio

Tähän kirjataan **toistuvat ongelmat ja korjaukset**: mikä meni rikki, miksi, miten se korjattiin (koodinpätkä) ja miten
estetään toistuminen. Lue tämä ennen muutoksia herkkiin kohtiin. Lisää uusi kohta aina, kun jokin ominaisuus katoaa,
rikkoutuu tai käyttäjä huomaa virheen.

## Pakolliset tarkistukset jokaisen erän jälkeen

1. **Ominaisuustarkistus:** `tools/tarkistus.mjs` (ohje tiedoston alussa). Tulostaa `KAIKKI OK` tai virheiden määrän.
   Kun teet uuden ominaisuuden, lisää sille rivi `t('nimi',()=>ehto)` tähän skriptiin, jotta sen katoaminen huomataan.
2. **Konsolivirheet latauksessa:** tarkista aina sivun lataus ilman virheitä (`pageerror`). Ylimmän tason koodi ei saa käyttää
   myöhemmin ladattuja muuttujia (ks. kohta 1 alla).
3. **Haaran tila ennen työtä:** tarkista onko edellinen PR yhdistetty. Jos on, aloita haara `origin/main`:sta. Jos ei, jatka
   samassa haarassa – **älä koskaan** aja `git checkout -B … origin/main` tarkistamatta, ettei haarassa ole yhdistämättömiä committeja
   (näin v0.61:n muutokset melkein katosivat).
4. **Vertaa vanhaan:** kun käyttäjä sanoo, että jokin "katosi", etsi ensin historiasta: `git log -S"tunniste" -- js/` ja
   `git show <commit>:js/tiedosto.js`. Usein ominaisuus on olemassa mutta ei näy/toimi (esim. 3D-hila v0.69).

## Tunnetut ongelmat ja korjaukset

### 1. Latauksessa `X is not defined` (TDZ) – v0.55, v0.58, v0.69
**Oire:** peli ei käynnisty tai osa maailmasta puuttuu; konsolissa `flags is not defined`.
**Syy:** tiedoston ylimmän tason koodi (tai sen kutsuma funktio) käyttää `let`/`const`-muuttujaa tiedostosta, joka ladataan myöhemmin
(`flags` on `state.js`:ssä, `BENCH_R` `pieces.js`:ssä). Esim. Hautakummun tynnyrit rakennetaan `dungeons.js`:n latauksessa.
**Korjaus:** lue tila laiskasti (vasta kun pelaaja on paikalla):
```js
// dungeons.js buildBarrel – kansi avataan label-kutsussa, ei rakennettaessa
let lidOpen=false;const open=()=>{lidOpen=true;lid.position.set(.35,.6,0);lid.rotation.z=1.3;};
const it={…,label:()=>{if(!lidOpen&&fo('rc')[key])open();return …;}};
```

### 2. Varjot "jähmettyvät" välillä – v0.70
**Oire:** tulen/soihdun varjot jäävät paikoilleen hetkeksi tai kokonaan.
**Syy:** pistevalojen varjokartat päivitetään käsin (`shadow.autoUpdate=false`, `needsUpdate` ai.js:n `updateStations`).
Kun automaattinen laatu nousi tasolle 3 (`QUAL.pointShadow=false`), päivitys loppui mutta valo heitti yhä varjoa vanhasta kartasta.
Lisäksi kaukana tulesta päivitysväli oli 60–120 kehystä (× 2 laadulla ≥ 1).
**Korjaus:**
```js
// render.js setQuality: castShadow seuraa pointShadow-tilaa
if(ps!==QUAL.pointShadow||LIGHTS[0].castShadow!==ps){for(const L of [LIGHTS[0],torchLight]){L.castShadow=ps;if(ps)L.shadow.needsUpdate=true;}}
// ai.js: kaukana tulesta pimeällä 12, päivällä 30 kehyksen välein
const fF=Math.max(1,Math.round((nearL?(dark?2:4):(dark?12:30))*(q>=1?2:1)*rate));
```
**Muista:** jos lisäät valon, jonka `autoUpdate=false`, sen `castShadow` on kytkettävä pois aina kun päivitys lopetetaan.
Aiempi samankaltainen vika: soihdun varjo jäi maahan (v0.43, v0.58: `shNearPrev` päivittää kartan kerran poistuttaessa).

### 3. Eläimet säikähtävät kyykyssä – v0.70
**Syy:** kyykyssä säikähdysetäisyys oli 3,5 m ja alle 4 m eläin huomasi aina; aseen ulottuma ~2,3 m → hiipien ei ylettynyt.
**Korjaus (ai.js, `d.ai==='flee'`):** kyykyssä paikallaan 0 m, hiipiessä 1,5 m (eläin katsoo kohti) / 0,9 m (selin).
```js
let sr=P.crouch?(mv?(face?1.5:.9):0):P.running?16:7;if(armed)sr*=1.4;
```

### 4. 3D-ruudukko "puuttuu" – v0.69
**Syy:** 3D-tila (`SNAP_NAMES` ' 3D', `gridV`) oli koodissa, mutta pystyruudukko oli opasiteetilla 0,28 yksi kameraa kohti käännetty taso
→ käytännössä näkymätön. **Korjaus:** `gridV` on 3D-hila (pystytolpat kulmissa + vaakaruudukot WH/2 välein), opasiteetti 0,5.
Tarkistus: `tools/tarkistus.mjs` → "3D-hila näkyy 3D-tilassa".

### 5. Hakukenttään ei voi kirjoittaa – v0.69
**Syy:** `body{user-select:none}` periytyy myös `<input>`-kenttiin (esim. Safari estää kirjoittamisen).
**Korjaus (style.css):** `.search,input[type=search],input[type=text]{user-select:text;-webkit-user-select:text}`.
Pelin näppäinkäsittelijä (`input.js`) ohittaa näppäimet, kun kohde on INPUT/TEXTAREA/SELECT – älä poista tätä ehtoa.

### 6. Jousi väärin päin – v0.68
**Syy:** `makeHeld('jousi')` käänsi koko jousen 180° (kaari ampujaa kohti, jänne venyi eteen).
**Korjaus:** kääntö poistettu; malli: selkä +z (eteen), jänne ja nuoli vedetään −z:aan. Vetokäsi `armIK`:lla jänteelle.

### 7. Kirveen vasen käsi irti varresta – v0.68
**Syy:** vanha `gripAngles` suuntasi käsivarren varteen huomioimatta kyynärpään taivutusta, ja nostossa varsi oli > 0,68 m olasta.
**Korjaus:** `armIK(arm,elbow,T,w)` (player.js, kaava kommentissa). Otekohta = varren piste lähinnä vasenta olkaa; oikea käsi tuodaan
keskilinjaa kohti, jos se on yli 0,58 m vasemmasta olasta.

### 8. Haamupuut latauksen jälkeen – v0.62
**Syy:** `moveNode` ei päivittänyt instanssimatriisia. **Korjaus:** `if(n.alive)setNodeMatrix(n,true)` siirron jälkeen.

### 9. Löydetyt arkut antoivat tavarat suoraan – v0.69
**Muutos:** kaikki löydetyt arkut/kirstut/tynnyrit avautuvat arkkuikkunaan (`openFound(avain,otsikko,saalis)`, ui.js), sisältö
`flags.fc[avain]`. Uudessa löydettävässä säiliössä käytä aina `openFound` – älä `giveOrDrop`-silmukkaa.

### 10. Puun äänet: käyttäjän määrittelemä malli – v0.71
Älä keksi omia ääniä puulle: **sama kirveenisku joka lyönnillä** (`chop`, sävel vaihtelee), viimeinen isku vain hieman eri
(`chopFinal` = chop + hiljainen ritinä; `logBreak` = chop + pehmeä tumma tömähdys), kaatuneen puun maahan osuminen tumma `thud`.
v0.68:n "kimeämpi/läpsähtävä" viimeinen isku ja erillinen `chopLog` eivät käyttäjän mielestä toimineet.

### 11. Koivun täplät eivät heilu – v0.71
**Syy:** huojunta (`treeMat`, resources.js) siirtää kärkeä `max(0,y−1,5)`:n mukaan; yksiosainen runko taipuu lineaarisesti päätypisteidensä
välillä, mutta erilliset täplät käyrän mukaan → täplät "irtoavat" rungosta. **Korjaus:** runko `BoxGeometry(.32,4.6,.32,1,12,1)`.
Sama periaate kaikkiin huojuviin osiin: pitkät osat jaetaan korkeussegmentteihin.

### 12. Uudet mobimallit – v0.71
Käytä `makeHumanoid`:ia (ei `makeBiped`), jotta tyyli ja nivelet ovat samat. Lisäosat kiinnitetään `torso`/`head`/`hand`-ryhmiin
(ei skaalattuihin mesheihin). Heiluvat osat `swayAdd(f,mesh,amp,taajuus)` – `animMob` liikuttaa niitä. Tarkista kuvakaappauksella.

### 13. Käsi menee vartalon läpi lyönnissä – v0.72
**Syy:** iskun asennot (olkakulmat) toivat kämmenen vatsan kohdalle; kahden käden otteen IK (rx/rz) jätti kyynärpään rinnan sisään.
**Korjaus:** `armClear(arm,elbow,hand)` jokaisen kehyksen lopussa + IK napavektorilla. Tarkistus: `tools/tarkistus.mjs` → "lyönti ei mene
vartalon läpi". Jos muutat iskujen avainasentoja (`swingPose` W/H/E), aja tarkistus ja katso kuvat (ks. swing-testi: kämmenen polku edessä).
```js
function armClear(arm,elbow,hand){…if(arm.rotation.x>-1.45)arm.rotation.x-=.06;else arm.rotation.z+=sx*.06;…}
```
**Huom:** `armIK` asettaa olan kvaterniona (voi jättää y-kierron) → tavallisessa asennossa `rotation.y` palautetaan nollaan.

### 14. Vasaran paikka selässä – v0.72
Käyttäjän toive: vasara roikkuu **vyöllä takana**, pää selän suuntaisesti (ei sojota taakse). `updateBack` (state.js) + heilunta `backHang`
(player.js). Älä palauta vasaraa selän työkalupaikalle.

### 15. Väliaikainen kehitystila DEV – v0.74
`const DEV=true` (core.js) on käyttäjän pyytämä testitila (ääretön kestävyys, max taso, ei painorajaa, V = 10× nopeus (v0.77; ennen Alt/Ö), Ä = DEV-valikko: sää, aika, terveys, kylläisyys, kartan + kohteiden paljastus v0.78, jumalvoimatäpät `DEVF` v0.93, esinehaku + määrä `devGive` v1.05). Älä poista
koukkuja; kun käyttäjä pyytää pois, aseta `DEV=false`. Tarkistus- ja tasapainotestit kannattaa ajaa myös DEV=false-tilassa.

### 16. Rakennusnäppäimet ilmoittivat rakentamatta – v0.79
**Oire:** Shift+R (ja G/H) näytti ilmoituksen ("Asento vaihtuu…", "Kohdistus: …"), vaikka pelaaja ei rakentanut.
**Korjaus (input.js):** jokainen rakennusnäppäin tarkistaa `isBuilding()` (vasara + `buildSel`). Uudet rakennusnäppäimet samalla ehdolla.
```js
else if(c===BIND.rot){if(isBuilding()){if(e.shiftKey)cyclePose();else buildRot=(buildRot+1)%8;}}
```

### 17. Valikot jäivät auki kuollessa – v0.80
**Oire:** jos reppu, kartta, DEV tai päävalikko oli auki kuollessa, se jäi kuoleman ruudun päälle/alle.
**Korjaus:** `closeAllForDeath()` (player.js) kutsutaan `playerDie`:ssä heti ja kuoleman ruudun avautuessa. Uusi valikko/ikkuna → lisää se
tähän listaan. Kuollessa `togglePanel` ja `pauseGame` eivät toimi; Enter herättää (`input.js`, tila `dead`).
```js
function closeAllForDeath(){if(openPanel)closePanels(false,true);if(state==='paused'||state==='ui')state='play';for(const id of ['#menu','#settings','#keyDlg'])if($(id))$(id).hidden=true;…}
```

### 18. Lisätty `//`-kommentti nieli rivin loppuosan – v0.85, v0.92
**Oire:** `ReferenceError: l is not defined` (moveMob) / spawnerin silmukka puuttui: rivin perään lisätty `// kommentti` kommentoi pois
samalla rivillä jatkuneen koodin (minimoidussa tyylissä monta lausetta yhdellä rivillä).
**Korjaus:** lisää kommentti omalle rivilleen tai käytä `/* … */`, kun rivillä voi olla jatkoa. Tarkista muutoksen jälkeen syntaksi
(`node -e "new Function(fs.readFileSync(f,'utf8'))"`) JA aja testi, joka kutsuu muutettua funktiota.

### 19. Peli ei käynnisty: `Identifier '_gp' has already been declared` – v1.00
**Syy:** uusi ylimmän tason `const _gp` oli jo olemassa toisessa tiedostossa (kaikki skriptit jakavat saman globaalin näkyvyyden).
**Korjaus:** nimeä apumuuttujat yksilöllisesti (ruoho: `_grM, _grQ, _grS, _grP, _grC`). Tarkista ennen uutta nimeä:
`grep -n "const _xx\b\|,_xx=" js/*.js`. Pelkkä `new Function`-syntaksitarkistus ei huomaa tätä – aja aina latausesti (`window.__game`).

### 20. Jousi ei laukaissut: `onPrimaryUp is not defined` – v1.05
**Oire:** hiiren vasemman vapautus heitti virheen (input.js `mouseup`), joten jousi laukesi vain kestävyyden loputtua.
**Syy:** v0.96:ssa `onSecondary`-rivin korvaus vei mukanaan edellisen rivin `onPrimaryUp`-funktion.
**Korjaus:** palautettu actions.js:ään. Kun korvaat rivin, tarkista ettei vieressä oleva funktio katoa (`git diff` → poistetut `function`-rivit).
Tarkistuksessa rivi "Jousi laukeaa hiiren vapautuksesta".
```js
function onPrimaryUp(){if(P.drawing){P.drawing=false;if(P.bowDraw>.15&&ammoId())fireBow();P.bowDraw=0;}}
```

### 21. Nuija oli väärin päin kädessä – v1.06
**Oire:** paksu pää oli kädessä ja ohut pää kärjessä (vanteet törröttivät ohuen varren ympärillä).
**Syy:** `CylinderGeometry(radiusTop, radiusBottom)` + `rotation.x=+π/2` vie **yläsäteen +z:aan** (kärkeen). Säteet olivat väärässä järjestyksessä.
**Korjaus:** `CylinderGeometry(.095,.034,…)` (paksu = top = kärki). Kartioiville osille: top-säde menee +z:aan, kun rotation.x = +π/2.
Tarkistuksessa rivi "v1.06 nuija".

### 22. Peli ei käynnisty "Uusi peli" -napin jälkeen, ruutu musta – v1.24
**Oire:** "Uusi peli" arpoo toisen kartan → sivu latautuu uudelleen → musta ruutu, valikko ei toimi, peliin ei pääse.
**Syy:** karttavaihdon jälkeinen automaattinen aloitus (`sessionStorage 'hiidenmaa_pending'`) kutsuu `startPlay()`:tä jo `main.js`:n alussa.
v1.15:ssä `startPlay` alkoi kutsua `menuClear()`:ia, joka käyttää `let menuDeco` -muuttujaa – se esiteltiin vasta myöhemmin tiedostossa
(TDZ) → `ReferenceError: Cannot access 'menuDeco' before initialization` → koko `main.js` kaatui, pääsilmukka ei käynnistynyt.
Testit eivät kulkeneet uudelleenlatauspolun kautta (ne kutsuivat `newGame()` suoraan).
**Korjaus:** valikkokameran tila esitellään `main.js`:n alussa. Uusi tarkistusrivi avaa sivun `hiidenmaa_pending='new'` -tilassa ja varmistaa,
että peli käynnistyy. **Sääntö:** kaikki ylimmän tason `let/const`, joita `startPlay`/`newGame`/`loadData` käyttävät, ennen tiedoston
alun automaattista aloitusta. Ks. myös 19.

### 23. "Painan pelaa, mitään ei tapahdu, uudet kuvat eivät näy" – v1.26
**Tilanne:** käyttäjän ruudulla valikossa luki "versio 1.23" (rikkinäinen versio, ks. 22), vaikka haarassa oli jo 1.25.
**Syy (todennäköisin):** raw.githackin haaralinkki ja selaimen välimuisti voivat näyttää vanhaa `index.html`:ää minuutteja push-jälkeen.
Paikallinen toisto vanhan version tallennuksella ja asetuksilla (`real.mjs`-tyyppinen testi: v1.07 → pelaa, tallenna, muuta asetuksia →
avaa uusi versio samalla localStoragella): "Jatka matkaa" ja "Uusi peli" toimivat, kuvat näkyvät, ei virheitä. Pilvisessiosta ei pääse
raw.githackiin eikä GitHub Pagesiin, joten käyttäjän näkymää ei voi tarkistaa suoraan.
**Korjaus / suoja:** `index.html`:n käynnistysvahti (`window.HV`, `#bootErr`): kaikki käsittelemättömät virheet ja pelisilmukan virheet
näkyvät ruudulla versionumeron kanssa; jos `window.__game` ei synny 20 s:ssa → "Peli ei käynnistynyt. Päivitä sivu (Ctrl+F5)".
**Ohje käyttäjälle:** testaa commit-linkillä (ei välimuistiviivettä), tarkista valikon versionumero, Ctrl+F5. `window.HV` = versio, päivitä
samalla kuin `?v=`.

### 24. Selain ei anna WebGL:ää → kaikki kaatuu ("Script error", "Cannot access '_e' before initialization") – v1.28
**Oire (käyttäjän käynnistysvahdin laatikko, v1.27):** "Script error." + "Cannot access '_e' before initialization (render.js:74)" +
"scene is not defined (landmarks.js:8)" + "Peli ei käynnistynyt". Valikko musta, napit eivät tee mitään. Käyttäjä vahvisti: selain ei saa
WebGL:ää päälle.
**Syy:** `render.js`:n ensimmäinen rivi `new THREE.WebGLRenderer()` heittää virheen (three.js-tiedosto on toiselta palvelimelta → "Script error.").
render.js keskeytyy ennen `const _e/scene…` -rivejä, ja kaikki myöhemmät skriptit kaatuvat niihin (TDZ). Koodi oli sama kuin toimivassa
v1.07:ssä → syy selaimessa: Chrome estää WebGL:n sivulta näytönohjaimen kaatumisen/jumin jälkeen (esim. v1.23:n kaatumiset ja toistuvat
lataukset), laitteistokiihdytys pois tai liikaa 3D-välilehtiä. Esto poistuu, kun koko selain käynnistetään uudelleen.
**Korjaus:** piirturi luodaan kolmella yrityksellä (antialias + high-performance → ilman antialiasia → low-power/mediump); jos mikään ei onnistu,
`webglFail()` näyttää koko ruudun suomenkielisen ohjeen (sulje koko selain, grafiikkakiihdytys, chrome://gpu, "Yritä uudelleen"). Myös
`webglcontextlost` kesken pelin näyttää ohjeen. Testattu Chromiumilla `--disable-webgl`: ohje näkyy; normaali käynnistys ennallaan.

## 25. Vanhat tarkistusrivit rikkoutuivat, kun pomojen/mobien arvot ja asetussivut muuttuivat (v1.33, v1.35)
**Oire:** `tools/tarkistus.mjs` näytti XX rivillä "karhu" (hp 2×60), "v1.31 … kivivartija 220", "asetussivut" ja "v1.10 usva".
**Syy:** rivit vertasivat kiinteisiin lukuihin (hp, `SET_PAGES.shadow`, `SET_DEF.mist===1`), joita lista 3 muutti tarkoituksella.
**Korjaus:** rivit laskevat arvon kertoimesta (`Math.round(220*MOB_HARD)`) ja tarkistavat uuden rakenteen (`SET_PAGES.gfx.includes('shadow')`,
`SET_DEF.mist===.6`). Kun muutat tasapainoarvoa tarkoituksella, päivitä vanha rivi kertoimen kautta äläkä poista sitä.

## 26. Kirves meni pään läpi nostossa (vanha avainasento + vasemman käden ote, ennen v1.37)
**Oire:** kirves/hakku nousi pään yli ja varsi kulki pään läpi (mitattu: varren piste 3–4 cm pään keskeltä), kädet melkein päällekkäin.
**Syy:** nosto tehtiin olan kulmilla (rx −2,1, kyynärpää −1,45) → kyynärvarsi ja varsi osoittivat pään yli; lisäksi vasemman käden ote veti
oikean käden kohti vasenta olkaa (keskilinjaan). Pelkkä olan kääntäminen jälkikäteen (headClear) ei auttanut, koska ote veti takaisin.
**Korjaus:** `chopIK` (player.js): käsi ja varren suunta avainasennoista rig-koordinaateissa (`CHOP_K`), IK + varren kierto käteen; oikean
käden vetäminen otetta kohti ohitetaan kun `P.chopW > .3`; kädet ≥ 0,17 m. Mitattu: varsi ≥ 0,22 m pään keskeltä koko iskun ajan.
Tarkistus: `sw137.mjs` (scratchpad) mittaa minHead/pen/hands. **Älä palauta nostoa olan kulmilla.**

## 27. Virtuaalinen osoitin: paneelien hiiritapahtumat ovat keinotekoisia (v1.36)
Kun hiiri on lukittu ja paneeli auki, `input.js` pysäyttää oikeat hiiritapahtumat ikkunan kaappausvaiheessa ja lähettää osoittimen (#vcur)
kohtaan keinotekoiset (`isTrusted=false`). Uudet paneelien hiirikäsittelijät toimivat sellaisenaan (mousedown/up/click/dblclick/contextmenu/
mousemove/wheel), mutta **CSS :hover ei toimi** – lisää vastaava `.vh`-luokan tyyli. Natiivi vieritys ja `<select>`-avaus eivät toimi
keinotekoisilla tapahtumilla (rulla vierittää lähintä vieritettävää käsin); asetusvalikko on taukotilassa (lukitus vapaana), joten se toimii.

## 28. "Virhe: Script error." vuorilla porttien lähellä (v1.38)
**Oire:** kivisillä vuorilla (Kivivuori) ja porttien lähellä ruutuun tuli "Virhe: Script error." (toistui, kartat 0, 3, 4, 5).
**Syy:** ruoho rakennetaan uudelleen 6 m välein. Alueella, jossa ruohoa ei ole (kivinen vuori, kohteiden suoja-alue), `rebuildGrass` loi
InstancedMeshin ilman yhtään `setColorAt`-kutsua → `instanceColor = null`. Sama `GRASS_MAT` oli jo käännetty instanssiväreillä, ja three.js
r128 käyttää samaa ohjelmaa → `bindingStates.setup` → `attributes.get(null)` → `Cannot read properties of null (reading
'isInterleavedBufferAttribute')`. Virhe tuli `renderer.render`ista, joka oli pelisilmukan try-lohkon ulkopuolella, ja koska three.js ladataan
toiselta sivustolta (cdnjs), selain näytti vain "Script error.".
**Korjaus:** tyhjää ruohoa ei lisätä näkymään (`if(!n){im.dispose();return;}`); ulottuvuuksien `instM` asettaa instanssivärin aina (valkoinen
oletus); `renderer.render` on try/catchissa (virhe näkyy tarkkana); three.js-tagissa `crossorigin="anonymous"` (tarkat virheviestit);
"Script error." ilman tiedostoa (selainlaajennus) ei näy pelaajalle. **Sääntö: jos InstancedMesh käyttää instanssivärejä, KAIKKI saman
materiaalin InstancedMeshit tarvitsevat ne (tai oman materiaalin).** Testi: `gate.mjs` (scratchpad) kävelee kaikkien karttojen porteille.
Testeissä three.js-reitille tarvitaan nyt otsake `Access-Control-Allow-Origin: *` (crossorigin).

## 29. Ylimmän tason muuttujat käytössä ennen esittelyä (v1.41, v1.43)
- **Oire:** peli ei käynnisty (`flags is not defined`, `Cannot access 'intro' before initialization`), tai syntaksivirhe kesken tiedoston.
- **Syy:** v1.41 landmarks.js luki `flags`-olion ylimmällä tasolla (state.js latautuu myöhemmin); v1.43 main.js:n karttavaihdon jatko
  (IIFE) kutsui `startIntro()`a ennen `let intro` -riviä (TDZ). Lisäksi rivikommentti `// …` ennen samalla rivillä olevaa koodia nieli koodin.
- **Korjaus:** tila palautetaan latauksessa funktiolla (`syncChests()` loadData/newGame), `let`-muuttujat tiedoston alkuun ennen IIFE:itä,
  rivikommentin jälkeen aina rivinvaihto. Testaa aina myös karttavaihdon jatko (tarkistus: "Karttavaihto + automaattinen aloitus").

## 30. Jousen naru "väärin päin" (v1.57)
- **Oire:** vedossa naru näytti venyvän eteenpäin; narun päät eivät olleet jousen kärjissä.
- **Syy:** `updateBowMesh` asetti pätkän kulman `rotation.x = -atan2(dz,dy)`. Laatikko on pitkin +y:tä; kierto x:n ympäri vie (0,1,0) →
  (0,cos,sin), joten oikea kulma on `+atan2(dz,dy)`. Väärä etumerkki peilasi molemmat pätkät keskipisteensä ympäri. Mittaukset, jotka
  katsoivat vain pätkien keskipisteitä tai nuolen paikkaa, eivät paljastaneet vikaa → mittaa aina pätkän PÄÄTEPISTEET (tai katso kuva sivulta).
- **Myös:** repun kuvakkeessa kaari ja naru olivat väärin päin (v1.56).

## 31. "Cannot set properties of null (setting 'onclick') (main.js:39)", valikko ilman tyylejä (v1.58)
- **Oire:** Ctrl+Shift+R:n jälkeen haaralinkissä (raw.githack) uusi index.html (versio näkyy oikein), mutta logo, riimut ja Takaisin-nappi
  muotoilemattomina ja virhe main.js:39.
- **Syy:** välityspalvelimen välimuisti antoi vanhan main.js:n ja style.css:n (~v1.25, rivi 39 = `$('#bNew').onclick`, nappia ei enää ole)
  `?v=`-numerosta huolimatta. Toistettu testissä ohjaamalla vanhat tiedostot uuden index.html:n kanssa → täsmälleen sama virhe.
- **Korjaus:** versiotarkistus: `window.__JSV` (core.js), `window.__JSV2` (main.js) ja `--css-v` (style.css) verrataan `window.HV`:hen;
  ero → ilmoitus "Välimuisti antoi vanhentuneita tiedostoja … avaa commit-linkillä". `bump.sh` päivittää kaikki merkit.
  Suosittele käyttäjälle aina commit-SHA-linkkiä heti päivityksen jälkeen (kaikki tiedostot samasta versiosta).

## 32. Aloitusjakso ja latausnäytön animaatiot pätkivät (v1.60)
- **Oire:** studio-/logo-/varoitusruudun häivytykset ja latausnäytön leimahdus nykivät; suorituskykytesti tehtiin latauksen sekaan.
- **Syy:** aloitusjakso pyöri pelin skriptien latauksen ja maailman rakennuksen päällä (pääsäie varattu sekunteja). Lisäksi latausnäytön
  riimuissa oli ikuinen opacity-animaatio ja leimahdus animoi SVG-tekstien `filter: drop-shadow`-ketjua → koko SVG piirrettiin joka ruudussa.
- **Korjaus:** `js/boot.js`: jakso + testi (oma kevyt three.js-näkymä) ENSIN, pelin skriptit vasta niiden jälkeen (`window.__GJS`,
  yksi kerrallaan 16 ms tauoin, esiladattu `<link rel=preload>`). Latauksen aikana `#loadScr.loading` (koristeet levossa, vain riimujen
  täyttyminen), valmis → kaksi rAF:ia → `.done`: vaalea hehku `.lsGlow` pelkillä opacity/transform-animaatioilla. Älä animoi suotimia
  (filter) latausnäytössä äläkä aja raskasta työtä animaatioiden aikana. Käynnistysvahdin 20 s ajastin alkaa vasta latauksen alkaessa.

## 33. Kädet tärisevät (AFK/hengitys, v1.68)
- **Oire:** seistessä kädet nytkyvät edestakaisin.
- **Syy:** kohdekulma vei kättä vartaloon/reiteen päin (vasemman käsivarren z-kierto väärällä merkillä); `armClear` työntää käden ulos
  joka ruudussa ja lerp vetää takaisin → värinä. Mittaa: nivelkulmien suunnanvaihdot ruutujen välillä (> 0,003 rad).
- **Korjaus:** vasen käsi ulospäin = +z, oikea = −z; seisoessa kädet hieman irti reisistä. Älä aseta käsien lepokohdetta vartalon sisään.

## 34. ConvolverNode heittää virheen kaiun luonnissa (v1.86)
- **Oire:** `NotSupportedError: The buffer sample rate of 22050 does not match the context rate of 44100 Hz` ensimmäisellä ulottuvuuden äänellä.
- **Syy:** ConvolverNodeen asetettavan AudioBufferin näytetaajuuden pitää olla sama kuin AudioContextin.
- **Korjaus:** `a.createBuffer(2, len, a.sampleRate)`. Älä yritä "halpaa" matalaa näytetaajuutta; pidä vastaus lyhyt (1,2 s) ja irrota kaiku kun ei käytössä.
- Kaiku irrotetaan 3 s kuluttua – mutta EI niin kauan kuin jokin kaiullinen ääni (`v.sd`) vielä soi (muuten kuolema- ja jahtiäänet katkeavat kuivaksi).

## Herkät kohdat (lue ennen muokkausta)

- **Rakennuskohdistus** (`building.js`): `SNAP_NAMES` (6 tilaa), `VNAMES` (H), `smartSnap`, `updateGrid`. Testit: `tools/tarkistus.mjs`
  ja kohdistusskenaariot (kehitysmuistio v0.65).
- **Varjot** (`ai.js` updateStations, `render.js` setQuality, `settings.js` applyGfx): autoUpdate=false-valot.
- **Latausjärjestys** (CLAUDE.md): ylimmän tason koodi vain aiemmin ladattuihin muuttujiin.
- **Tallennus** (`save.js`): uudet liput `flags`-olioon (tallentuvat automaattisesti); muotomuutoksessa nosta `v`.
