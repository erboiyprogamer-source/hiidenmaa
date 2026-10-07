# Hiidenmaa – ohjeet Claudelle

Hiidenmaa on selaimessa toimiva 3D-selviytymispeli: viikinkihenkinen saari, keräily, valmistus,
rakentaminen, taistelu, luolasto ja yksi pomo. Valheim on inspiraatio, mutta peli on oma teos:
**älä käytä Valheimin nimiä, hahmoja, grafiikkaa tai muuta suojattua sisältöä. Pelin teksteissä ei mainita muita pelejä (esim. Minecraft).**

Lue tämän lisäksi aina `docs/KEHITYSMUISTIO.md`. Siinä ovat tehdyt päätökset, tasapainoarvot,
versiohistoria ja ideajono, jotta niitä ei tarvitse selvittää uudelleen. Pelin kaikki ominaisuudet, säännöt ja
fysiikan arvot ovat viiteoppaassa `docs/OMINAISUUDET.md`. Toistuvat viat ja niiden korjaukset koodinpätkineen ovat
`docs/KORJAUKSET.md`:ssä – lue se ennen muutoksia ja lisää sinne uusi kohta aina, kun jokin rikkoutuu tai katoaa.

## Käyttäjä ja työtapa

- Kommunikoi suomeksi. Pelin kaikki tekstit ovat suomeksi.
- Vie annettu tehtävä loppuun asti. Keksi ratkaisu itse, kysy vain jos eteenpäin ei pääse.
- Älä tilaa tai ota käyttöön mitään maksullista ilman lupaa.
- Muutokset tehdään erissä (3–6 toisiinsa liittyvää muutosta). Jokaisen erän jälkeen:
  1. testaa (ks. Testaus),
  2. päivitä `docs/KEHITYSMUISTIO.md` (versioloki, muuttuneet arvot, uudet päätökset, ideajono) ja
     `docs/OMINAISUUDET.md` (muuttuneet ominaisuudet, säännöt ja arvot),
  3. päivitä tämä tiedosto, jos rakenne tai säännöt muuttuivat,
  4. tee commit suomenkielisellä viestillä. Pushaa, kun käyttäjä pyytää.
- Pidä tämä tiedosto lyhyenä (alle 200 riviä). Yksityiskohdat kuuluvat kehitysmuistioon.

## Tekniikka

- Ei build-vaihetta eikä npm-riippuvuuksia. three.js **r128** ladataan cdnjs:stä `index.html`:ssä.
- Skriptit ovat tavallisia `<script src>`-tiedostoja (ei ES-moduuleja). Ne jakavat saman globaalin
  näkyvyysalueen, joten `index.html` aukeaa myös tuplaklikkaamalla ilman palvelinta.
- **Latausjärjestys on tärkeä.** Pelin skriptit luetellaan `index.html`:n `window.__GJS`-listassa (boot.js lataa ne järjestyksessä). Tiedoston ylimmän tason koodi saa käyttää vain aiemmin ladattujen
  tiedostojen muuttujia. Funktioiden sisällä saa viitata mihin tahansa. Uusi tiedosto lisätään
  `index.html`:n skriptilistaan oikeaan kohtaan.
- Jokainen JS-tiedosto alkaa `'use strict';`. Samaa ylimmän tason nimeä ei saa määritellä kahdesti.
- Tyylit ovat tiedostossa `css/style.css`. Fontit: Uncial Antiqua (otsikot), Alegreya Sans (teksti).

## Tiedostot (latausjärjestyksessä)

| Tiedosto | Sisältö |
| --- | --- |
| `js/boot.js` | (ladataan `index.html`:ssä ennen muita) aloitusjakso, suorituskykytesti omassa näkymässä (`__boot`), pelin skriptien lataus listasta `window.__GJS` (uusi tiedosto lisätään SINNE) |
| `js/core.js` | `$`, `clamp`, `lerp`, `sstep`, kohina (`fbm`, `ridge`), `mulberry32` |
| `js/world.js` | `WS` (skaala), `MAPS`/`MAP`/`MAP_ID` (6 karttaa), `dirIn`, `HALF`, `LOC` (+ arvotut `SITE_DEFS`-paikat), `AARNI`, `DUN`, `heightFn`, `biomeAt`, `zoneAt`, `BIOMES` (nimet + ominaisuudet), `terrainH` |
| `js/render.js` | renderer, scene, camera, valot, tekstuurit, `MAT`, `mat()`, `bx()`, maasto, vesi, taivas, sade |
| `js/collision.js` | törmäysruudukko: `addBox`, `addCircle`, `groundAt`, `collideXZ`, `pointBlocked`, `STEPUP` |
| `js/items.js` | `ITEMS`, `RECIPES`, `RECIPE_BY`, `icon(id)` (canvas-kuvakkeet) |
| `js/audio.js` | `sfx(nimi, sävel, voimakkuus)` – proseduraaliset äänet, satunnainen sävelvaihtelu |
| `js/models.js` | `makeHumanoid` (yksityiskohtaiset kaksijalkaiset), `makeAnimal` (eläimet), `makeBiped`, `makeQuad`, `makeHeld`, `makeShield`, `makeBird` (metso), pelaaja `makePlayer`, haarniskat `buildArmor` |
| `js/resources.js` | `NODE`, `NGEO`, sijoittelu ruutuihin (`CHN`, `VIS_R`), `nodes`, tukit (`logs`), `regrowForest`, kohteiden suoja `siteBlocked`, ruoho `rebuildGrass`, maaston LOD `terrLodTick`, staattisten yhdistäminen `mergeStatics`/`mergeTick` |
| `js/landmarks.js` | riimukivet, rauniot, Hautakumpu, Kalmankehä, luolasto (`DMAP`), `wallTorch`, `brazier`, `rockC`, liekkirekisteri `FLAMES`, arkut `makeChest`/`openLid`/`syncChests` |
| `js/pieces.js` | `G`, `WH`, `DOOR_W/H`, `PIECES`, `pieceBoxes`, `buildPieceMesh`, `addPiece`, `removePiece` |
| `js/mobs.js` | `MOBDEF`, mallit (`figGolem`, `figYlimys`, `figKalmo`, `figHiisi`, ulottuvuuksien pomot), `spawnMob`, `mobs`, `boss` |
| `js/dungeons.js` | `REALMS` (3 ulottuvuutta, avainketju `lock`/`key`/`alt`), generaattorit, `ensureRealm`, koristeet (`dressFloor`, tynnyrit, spawneri), portaalit, `realmBossAI`, Kalmanpesän murskaus `hitSpawner`, usva/höyry/pisarat, `P.spawnProt`, `fo(k)` |
| `js/story.js` | löytöpaikat (`SITE_KEYS`, rauniot, arkkukivilinnakkeet `FORT`), vartijat (`GUARDS`), lisäriimukivet (`XRUNES`), tehtävät (`QUESTS`), leirit `CAMPS`/`ensureCamps`, kiviröykkiöt `STASHES`, maailman saalis `planLoot`/`wlLoot`, arvoesineiden palautus `relocateValuable`/`valuableCensus`, kyltit `SIGNS` |
| `js/state.js` | `P` (pelaaja), `inv`, `flags`, pelaajahahmo, reppu, selkäesineet (`backPose`), maahan pudonneet esineet (arvoesineet `isValuable`, 3D-kuvakkeet `dropMesh`), partikkelit, ammukset; jousen osumamerkki `hitMarker`, selän nuolet `hasArrows` |
| `js/effects.js` | veri (`bleed`, `splat`, `addWound`, rinne `slopeN`, valuminen `poolFlow`, Ultra `bloodUltra`), savupilvet (`smokePuff`), kuolema-animaatiot (`mobDeathAnim`, tuhka), pelaajan palaminen ja kuolema |
| `js/settings.js` | `ACTIONS`/`BIND` (näppäinsidonnat, `kd()`), `SET`/`SET_DEF` (oletus = yleisin taso), `SET_PAGES`, `applyGfx()`, asetusvalikko (Grafiikka, Varjot, …); automaattisäätö `AUTO`/`autoOn`, väliotsikot; esiasetussäätimen teemat `pvTheme`/`PV_FX`. |
| `js/input.js` | näppäimet, hiiri, hiiren lukitus; virtuaalinen osoitin `VC`/`vcSync`/`vcFlush` (lukitus pysyy paneelien ajan; herkkyys `SET.sens`/`SET.curSens`) |
| `js/actions.js` | hyökkäys, vahinko, syöminen, `interact()`, alttari, luolastoon meno; jousi `bowSpread`/`bowShot`/`bowCrouch` |
| `js/building.js` | rakennushaamu, ruudukkoon kohdistus, reunakohdistus `smartSnap`, `validPlace`, purku |
| `js/environment.js` | päivä/yö (`DAY_LEN`), sää, tuuli (`WIND`, `updateWind`), valot, selviytyminen (nälkä, kylmä, lepo) |
| `js/player.js` | liike, fysiikka, animaatio (lyönnit `swingPose`, kirves/hakku `chopIK`/`CHOP_K`, käsien IK `armIK`, läpäisyn esto `armClear`), DEV-lento, kuolema, uudelleensyntyminen, nukkuminen |
| `js/ai.js` | vihollisten tekoäly (luonteet `per`, `temperAI`, `stalkAI`), pomon hyökkäykset, `SPAWN`-taulukot, `spawnScary`, jousikalmot `archerAI`, auringossa palaminen `sunBurnAI`, työpisteiden päivitys |
| `js/camera.js` | kolmannen persoonan kamera |
| `js/ui.js` | HUD, viestit, paneelit, kartta; esineiden siirto/raahaus (`slotUX`, `#ghostIt`), tehtävän/tavoitteen piilotus (`applyHudMode`), terveyspalkkirivit (`HP_ROW`); tiputusristikko `updDropRet`, pikapaikan pudotus `dropHot`, aluebannerien jono `zoneQ`. |
| `js/progress.js` | `bump`, XP ja taso (`lvlInfo`), saavutukset (`ACH`, `BON`), `GOALS`, edistymispaneeli (J) |
| `js/save.js` | `serialize`, `loadData`, `saveGame`, `SKEY`, tallennuspaikat (`SLOTS`, `slotKey`, `slotMeta`, `curSlot`) |
| `js/menubg.js` | valikon animoidut taustakuvat (`MBG_SCENES` 21 kpl, `mbgFrame`, `mbgShow`); valikossa ei piirretä 3D:tä; valikon partikkelit `MFX`/`mfxFrame` (laji taustan mukaan), SVG-logo `buildLogo`, 7 teemaa `LOGO_T`, arvonta `logoRandom` |
| `js/main.js` | valikko, pääsilmukka `frame()`, mukautuva laatu, testirajapinta `window.__game`; valikon taustakameran kierros (`menuCam`, `buildMenuSpots`), automaattisäätö (`autoQuality`), FPS (`updateFps`); valikon näkymät `setMenuView`/`menuBack` (`#menu[data-view]`), intro `startIntro`/`introCam` (uusi maailma `worldLoad`, pilvet `introCloudsMake`/`introVeil`), suorituskykytesti `perf*`, taukotila `pauseRun`. Latausnäyttö on `index.html`:ssä (`__ldSet`/`__ldDone`/`__ldShow`, `__ldAfter`), samoin ensikäynnin aloitusjakso `#splash` (`__splashOn`). |

## Mittayksiköt ja sopimukset

- Metrit ja sekunnit. Maailma on noin −350…350 m (`HALF`), suunniteltu yksikkökoordinaatteihin ja skaalattu
  `WS`=1,75. Luolasto on erillinen tila kohdassa `DUN` (pelaaja siellä kun `P.inDun`).
- Kartta valitaan ennen skriptien latausta (`localStorage['hiidenmaa_map']`); vaihto = sivun uudelleenlataus.
- Tarinateksteihin ei kirjoiteta kiinteitä ilmansuuntia: käytä `dirIn`/`dirText`, koska paikat ovat eri kartoilla eri suunnissa.
- Pelaaja: pituus 1,8 m, säde 0,38 m, kävely 4,6 m/s, juoksu 8 m/s, askelnousu `STEPUP` 0,55 m.
- Rakennusosien mitat tulevat vakioista `G`, `WH`, `DOOR_W`, `DOOR_H`, `STEP_N` (`js/pieces.js`).
  Älä kirjoita mittoja numeroina osien sisään.
- Oviaukon on oltava vähintään 0,3 m pelaajaa korkeampi, ja portaiden askelman alle `STEPUP`.

## Näin lisäät sisältöä

- **Esine:** `ITEMS` (+ `food` tai `cat`), kuvake `icon()`-switchiin, resepti `RECIPES`-listaan.
- **Rakennusosa:** `PIECES`, `pieceBoxes` (törmäys), `buildPieceMesh` (malli). Työpisteen
  toiminta `actions.js`:n `pieceLabel`/`interact` ja `ai.js`:n `updateStations`.
- **Vihollinen tai eläin:** `MOBDEF` (malli `fig`, `ai`: flee/neutral/hostile/boss) ja `ai.js`:n `SPAWN`.
- **Tavoite:** `GOALS` (`progress.js`, id + xp), järjestyksellä on väliä. Saavutus: `ACH`. Valmistusohjeen tasovaatimus: `lvl`.
- **Rakennusosan kategoria:** `cat` (+ `alku:1` = Alkupeli-välilehti) ja `BUILD_CATS` (`pieces.js`). Kiviversio: `base:'x',stone:1`.

## Grafiikka-asetukset

- Uusi asetus: lisää `SET_DEF`:iin (oletus = nykyinen ulkoasu), sivun avainlistaan `SET_PAGES` ja riviksi `setRow()`:lla
  (oletusmerkintä ja sivun palautus tulevat automaattisesti). Ota käyttöön `applyGfx()`:ssa.

## Etenemisketju

- Ulottuvuuksiin mennään järjestyksessä: avain maailmasta → 1. → 2. → 3. Jokaisella portilla on varmistus (`alt`), jottei
  kadonnut avain jumita peliä. Uutta lukkoa lisättäessä tarkista, että avaimen lähde on aina saavutettavissa ilman lukon takana olevaa.

## Tallennus

- Tallennus: 5 maailmaa. Paikka 0 = `hiidenmaa_save_v1`, paikat 1–4 = `hiidenmaa_save_v1_1`…`_4`, lista `hiidenmaa_slots` (`slotMeta`,
  `curSlot`). Lisäksi valikossa on tallennuskoodi. Automaattitallennus 2 min välein.
- Kun tallennusmuoto muuttuu, nosta `serialize()`:n `v`-numeroa ja käsittele vanha versio
  `loadData()`:ssa. Kirjaa muutos kehitysmuistioon.

## Testaus

- Nopein: avaa `index.html` selaimessa. Ei palvelinta tarvita.
- Automaattinen: `window.__game` antaa pääsyn tilaan ja funktioihin (esim. `newGame()`,
  `update(dt)`, `invAdd()`, `addPiece()`, `spawnMob()`, `serialize()`, `loadData()`, `keys`).
  Headless-testissä (Playwright) korvaa `requestPointerLock` ja aja `update(1/30)` silmukassa.
  Pilvisessiossa cdnjs on estetty: asenna `three@0.128.0` npm:stä testikansioon ja ohjaa
  `**/three.min.js`-pyyntö siihen `page.route`:lla (vain testiä varten, ei peliin).
- Tarkista aina, ettei konsoliin tule virheitä, ja että tallennus + lataus toimii.
- **Ominaisuustarkistus jokaisen erän jälkeen:** `tools/tarkistus.mjs` (pitää tulostaa `KAIKKI OK`). Lisää uudelle ominaisuudelle
  oma tarkistusrivi, jotta sen katoaminen huomataan. Ennen haaran nollausta tarkista, ettei yhdistämättömiä committeja katoa.

## Julkaisu

- Repo: `erboiyprogamer-source/hiidenmaa`, GitHub Pages haarasta `main` (juuri), `.nojekyll` käytössä.
- Peli: https://erboiyprogamer-source.github.io/hiidenmaa/ (päivittyy noin minuutissa, kun `main` muuttuu).
- Käyttäjä työskentelee yleensä pilvisessiossa. Kun erä on valmis ja testattu: commit, push ja
  pull request `main`-haaraan. Kerro käyttäjälle lyhyesti mitä muuttui ja muistuta yhdistämään PR
  (Merge), jos et voi tehdä sitä itse.
- Päivitä valikon versionumero (`index.html`, "Selviytymispeli · versio X"), `window.HV` (käynnistysvahti), versiotarkistuksen merkit
  (`window.__JSV` core.js, `window.__JSV2` main.js, `--css-v` style.css, `window.__BJV` boot.js; KORJAUKSET 31) ja versioloki samalla.
- **Välimuisti:** nosta samalla `index.html`:n kaikkien `<script src>`- ja `css`-linkkien `?v=X`, muuten
  raw.githack/selain voi näyttää vanhoja JS-tiedostoja. Anna testilinkki myös commit-SHA:lla.
- **Linkit:** haaralinkki näyttää aina haaran uusimman version (välimuistin takia voi viivästyä); commit-SHA-linkki näyttää täsmälleen
  sen version, ei muutu eikä viivästy – suositeltava heti päivityksen jälkeen. Varsinainen peli (Pages) päivittyy vasta Mergen jälkeen.
