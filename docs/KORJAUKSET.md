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
`const DEV=true` (core.js) on käyttäjän pyytämä testitila (ääretön kestävyys, max taso, ei painorajaa, V = 10× nopeus (v0.77; ennen Alt/Ö), Ä = DEV-valikko: sää, aika, terveys, kylläisyys, kartan + kohteiden paljastus v0.78). Älä poista
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

## Herkät kohdat (lue ennen muokkausta)

- **Rakennuskohdistus** (`building.js`): `SNAP_NAMES` (6 tilaa), `VNAMES` (H), `smartSnap`, `updateGrid`. Testit: `tools/tarkistus.mjs`
  ja kohdistusskenaariot (kehitysmuistio v0.65).
- **Varjot** (`ai.js` updateStations, `render.js` setQuality, `settings.js` applyGfx): autoUpdate=false-valot.
- **Latausjärjestys** (CLAUDE.md): ylimmän tason koodi vain aiemmin ladattuihin muuttujiin.
- **Tallennus** (`save.js`): uudet liput `flags`-olioon (tallentuvat automaattisesti); muotomuutoksessa nosta `v`.
