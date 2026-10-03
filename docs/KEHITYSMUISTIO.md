# Hiidenmaa – kehitysmuistio

Tämä on projektin muisti. Päivitä se jokaisen muutoserän jälkeen: versioloki, muuttuneet arvot,
uudet päätökset ja ideajono. Lyhyesti ja asiallisesti, ei keskustelulokia.

## Peli lyhyesti

- Pelaaja haaksirikkoutuu Hiidenmaan saarelle. Saarta hallitsee kivinen **Kalmanvartija**.
- Pelattavaa noin 30–60 min: keräily → kivikirves → työpenkki → suoja ja nuotio → metsästys →
  piikivihakku ja kupari → sulatusuuni ja ahjo → kuparivarusteet → kolme hiidenkiveä
  Hautakummusta → pomotaistelu Kalmankehässä.
- Biomit: niitty, metsä, vuori (lumihuiput), kalmanummi, ranta, järvi, meri.
- Paikat (`LOC`): aloitusranta, kolme raunioita aarrearkkuineen, kolme riimukiveä (kertovat
  tarinan ja merkitsevät paikkoja karttaan), Hautakumpu (luolasto), Kalmankehä (pomo).

## Pysyvät päätökset

- Oma alkuperäinen teos, ei Valheimin nimiä, hahmoja tai grafiikkaa. Nimistö on suomalaisesta
  kansanperinteestä (hiisi, kalmo, hiidenkivi).
- Yksi HTML-sivu + tavalliset skriptit, ei build-vaihetta. three.js r128 cdnjs:stä.
- Grafiikka on laatikoista ja kaavoilla tehdystä maastosta, väliaikaiset assetit ovat ok.
- Ulkoasu: tumma "veistetyt laudat" -tyyli, otsikot Uncial Antiqua, teksti Alegreya Sans,
  korostusväri hiillos-oranssi `--ember`, hiidenkivien hehku `--frost`.
- Kuolemassa koko reppu jää hautakasaan kuolinpaikalle (näkyy kartalla).
- Sänky asettaa herätyspaikan. Nukkuminen vaatii yön, katon ja ettei vihollisia ole lähellä.
- Pomo palaa maahan ja hiidenkivet jäävät alttarille, jos pelaaja poistuu yli 90 m päähän.

## Tasapainoarvot (päivitä kun muutat)

| Asia | Arvo |
| --- | --- |
| Pelaajan kävely / juoksu | 4,6 / 8 m/s |
| Terveys / kestävyys / max paino | 60 / 100 / 160 |
| Vuorokauden pituus `DAY_LEN` | 720 s (12 min) |
| Rakennusruudukko `G` / seinän korkeus `WH` | 2,5 m / 2,6 m |
| Oviaukko | 1,7 × 2,3 m |
| Portaat | 6 askelmaa (0,43 m) |

| Olento | HP | Juoksu m/s | Vahinko | Huom. |
| --- | --- | --- | --- | --- |
| Peura | 25 | 8,5 | – | pakenee |
| Villikarju | 40 | 5,8 | 8 | hyökkää vain jos lyöty |
| Sammalhiisi | 34 | 5,2 | 9 | |
| Harmaasusi | 44 | 4,6 | 11 | öisin pareittain, sama kuin pelaajan kävely |
| Kalmo | 50 | 4,6 | 13 | heikko murskaavalle |
| Kalmon ylimys | 150 | 4,2 | 20 | luolaston miniboss |
| Kalmanvartija | 900 | 3,6 | 22–28 | 4 hyökkäystä, kutsuu kalmoja 50 %:ssa |

## Versioloki

### v0.13 (erä 13)
- **Kolme karttaa** (`MAPS` world.js): Hiidenmaa (alkuperäinen, maasto ennallaan), Kalmansaaret
  (saaristo, saaret yhdistetty matalilla hiekkasärkillä, vuori pohjoissaarella) ja Tunturinniemi
  (iso vuoristo pohjoispuoliskolla). Esiasetus: kohinan siirtymä, vuoret (`mtn` tai `peak`), nummi,
  järvet, Aarnimetsät, saaret/särkät ja `LOC`-paikat. Hautakumpu on aina lounaassa ja vuoret
  pohjoisessa, jotta riimukivien tekstit pitävät.
- **Valinta:** maailma rakennetaan skriptien latautuessa, joten `MAP_ID` luetaan
  `localStorage['hiidenmaa_map']`ista. Uusi peli arpoo kartan; jos se on eri kuin nykyinen →
  `switchMap()` tallentaa valinnan, asettaa `sessionStorage['hiidenmaa_pending']` ('new'/'load',
  ladattava peli `hiidenmaa_data`) ja lataa sivun; `main.js` jatkaa automaattisesti.
  `beforeunload`-varmistus ohitetaan kartanvaihdossa (`reloading`).
- **Tallennusversio 4:** `mapId`. Jatka/tuo koodista vaihtaa tarvittaessa kartan ennen latausta.
  Valikko näyttää kartan nimen (`#mapName`) ja tallennuksen kartan.
- Testit (jokainen kartta): kaikki paikat maalla (h>1,1), kaikki saavutettavissa kävellen
  aloituspaikasta (3 m ruudukko, ei uintia), luolastoon meno ja paluu, alttarin teksti, tallennus
  sisältää `mapId`:n, kartanvaihto latauksen kautta käynnistää pelin oikealla kartalla. Ei virheitä.


### v0.12 (erä 12)
- **Työkalutasot:** `pick`/`chop`-arvo on taso. Hakut: piikivi 1, kupari 2 (uusi, ahjo: kupari 6, puu 3),
  rauta 3. Kirveet: kivi 1, kupari 2, rauta 3. `NODE.tier`: lohkare 1, kuparisuoni 1, rautasuoni 2,
  puut 1, aarnipuu 3. Liian heikko → "Tarvitset paremman hakun." / "Tarvitset vahvemman kirveen."
- **Rautasuoni:** 25 kpl vuorilla (h>22), hp 120, tier 2, antaa rautamalmia 2–4 + kiveä.
- **Sulatusuuni** sulattaa myös rautamalmin (oma jono `iore`/`idone`, 10 s/harkko, kupari ensin, 7 s).
  Uunin teksti näyttää molemmat; tallennus ja purku käsittelevät uudet kentät.
- **Rautavarusteet ahjoon:** rautakirves (chop 3, dmg 18; rauta 4, puu 3), rautahakku (pick 3, dmg 12;
  rauta 5, puu 3), rautamiekka (dmg 34; rauta 6, puu 2, nahka 2), rautapanssari (arm 22, slow .08;
  rauta 12, nahka 6). Kuvakkeet ja kädessä pidettävät mallit.
- **Aarnipuu** (hp 220·s²) vaatii rautakirveen; tukit antavat **tervaspuuta**. Uudet osat
  **tervaslattia** (hp 240) ja **tervasseinä** (hp 300), kumpikin tervaspuu 2, tumma `MAT.tarwood`,
  vauriotekstuurit toimivat (vauriomateriaali säilyttää sävyn).
- Testi: piikivihakku ei pure rautaan, kuparihakku louhii (8 iskua), uuni tuottaa 2 harkkoa,
  rautakirves kaataa aarnipuun → 2 tukkia → tervaspuuta, tervasseinä hp 300, tallennus/lataus ok.


### v0.11 (erä 11)
- **Kartta 3×:** `WS=1.75`, `HALF` 200→350, `GN` 350 (`GS`=2). Isot muodot lasketaan yksikkökoordinaateissa
  (x/WS), pienet yksityiskohdat metreinä; `LOC` kerrotaan WS:llä, reunan meri alkaa ~297 m. Luolasto
  `DUN` siirretty (900, 60, 900). Kartta `MAPC` 700 px, tutkimusruudukko `EXN`=175 (4 m ruudut),
  maailman raja `HALF+15`.
- **Tiheämpi metsä:** metsän puutiheys .42→.6, niityt pienemmiksi (spawnin niitty r 46→40, niittykohina
  <.4 → <.33). Biomit näytteistettynä: metsä 1626, vuori 579, nummi 293, niitty 245, aarni 155 (/4900).
- **Puiden koko:** `s` .6–2.0 (pienet yleisimpiä), hp ∝ s², törmäyssäde ∝ s, saaliit ∝ s.
- **Aarnimetsä** (`AARNI`, 2 aluetta, `biomeAt`→'aarni'): `aarnipuu` runko 1–1,5 m, korkeus 17–23 m, havusto
  ~10 m:stä ylöspäin, tumma sammalmaa. Biomissa sumu near 6 / far 60, valo ×.6 (`aarniK`). Aarnipuu
  vaatii kirveen tason 3 (`NODE.tier`) → "Tarvitset vahvemman kirveen." Spawnitaulukko `SPAWN.aarni`.
- **Tukit:** kaatunut puu jättää 1–2 tukkia (`spawnLogs`, iso puu s>1.3 tai aarnipuu = 2). Tukki on
  hakattava (hp 20·s), antaa puuta (aarnipuu: tervaspuuta) ∝ s. Puu itse antaa vain sivusaaliit
  (pihka). Tukit eivät tallennu (katoavat latauksessa).
- **Metsä kasvaa öisin:** nukkuessa `regrowForest()` herättää kaadetut puut, joiden 25 m:n säteellä ei
  ole rakennusta, ja istuttaa ≤40 uutta (instanssipooli `POOL`). Istutetut tallentuvat (`planted`).
- **Suorituskyky:** maisemainstanssit jaettu 10×10 ruutuun (`CHN`), joilla oma rajauspallo, ja
  lajikohtainen näkyvyys (`VIS_R` puut 150 m, kivet 120, poimittavat 60). Aiemmin instanssit piirrettiin
  karsimatta. Mittaus (headless swiftshader, ei vastaa oikeaa GPU:ta): ennen 236 k kolmiota, 63 kutsua,
  2566 solmua; jälkeen 515 k kolmiota, 157–168 kutsua, 10 945 solmua; päivitys 0,2–0,5 ms/kehys.
- **Tallennusversio 3.** Versio <3 (vanha pieni maailma): tavarat, tila ja eteneminen säilyvät, rakennukset
  ja hautakasat palautetaan tarvikkeina reppuun, pelaaja aloituspaikkaan.


### v0.10 (erä 10)
- **Pehmeä valon vaihto:** taivaan valo `light=sstep(-.4,.45,el)` (hämärä/aamunkoitto ~1,5 min),
  aurinko `sunK=sstep(-.12,.08,el)`, kuu `moonK=sstep(-.12,-.32,el)`. Valon suunta vaihtuu kuuhun
  vasta kun voimakkuus on 0 (testi: vaihto dayT .819, intensiteetti 0; suurin hyppy .043/askel).
- **Kuu:** `moon` (render.js) auringon vastapuolella, läikkäinen canvas-tekstuuri, `fog:false`.
  Kirkkaus ja kuunvalo `moonPhase()` = 8 päivän kierto (.2 uusikuu … 1 täysikuu).
- **Uudet säät** (`WEATHERS`): tuulinen (`tuuli`), tihku, myrsky (rankkasade, salama = taivas ja valot
  välähtävät, jyrinä `sfx('thunder')` .5–2 s viiveellä), lumisade (`lumi`, valitaan sateen sijaan kun
  pelaaja on vuorella tai y>20; hiutaleet näkyvät y>10, lumisade kylmettää ilman suojaa).
  Todennäköisyydet: selkeä 34 %, pilvi 20, tuuli 10, tihku 10, sade 12, myrsky 6, sumu 8. Tihku ei kastele.
- **Puut huojuvat:** puiden instanssimateriaali `treeMat` (vertex-shader, `SWAY.uWind`): kevyt huojunta
  aina, voimakas tuulella ja myrskyssä. Varjot eivät huoju.


### v0.9 (erä 8)
- **Kiinteä olkikatto:** `pieceBoxes('katto')` = 8 porrasviipaletta (viipaleen yläpinta G/8·(i+1), pohja
  max(0, yläpinta−.3), askel .31 m < `STEPUP`). Katolla voi kävellä (testi: nousu 2,5 m = G), katto
  ei läpäistä eikä estä liikettä talon sisällä (viipaleet ovat seinän yläreunan yläpuolella).
  `validPlace`: katto tarkistaa vain päällekkäisen katon ja ettei pelaaja ole viipaleen sisällä.
- **Olkikaton karhea reuna:** `TEX.thatchFringe` / `MAT.thatchFringe` (läpinäkyvä tausta, `alphaTest`),
  kaistale katon matalaan ja korkeaan päähän (poikittaiset päät) osittain katon päällä.
- **Paaluaita kestää mobit:** `PIECES.aita.mobProof=1`; `damagePiece(p,d,src)` ohittaa vahingon kun
  `src==='mob'` (ai.js jumittumiskohta antaa 'mob'). Piikkien vahinko mobille (6) säilyy, pelaajan
  tuhoamat/purku toimivat kuten ennen.
- **Vauriotekstuurit:** 3 kuntotasoa (hp > 66 %, 33–66 %, < 33 %). `damageMat(base,lv)` piirtää
  halkeamia (taso 2 myös reikiä, `alphaTest`) puu/kivi/olki-tekstuurin päälle ja välimuistittaa
  materiaalit; `setPieceDamage(p)` kutsutaan `damagePiece`ssa ja `addPiece`ssä (ladattu hp → oikea
  taso). Vain tekstuurilliset materiaalit (`MAT.wood/stone/thatch`) vaurioituvat; yksivärisissä
  osissa (aidan paalut, pylväs) ei näy vauriota.
- **Uudet osat:** `vinoseina` (G×WH) ja `kolmio` (G×G), snap 'wall', R peilaa (rot 2), malli
  `triMesh(h)` = Shape + ExtrudeGeometry (paksuus .2), törmäys 6 pystyviipaletta. Kolmio asettuu
  seinän päälle kun tähtää seinän yläpintaa.
- **Työpenkin alue:** `BENCH_R=20` (pieces.js). `makeBenchRing` luo maastoa seuraavan oranssin
  nauhan (128 segm.), `updateBenchRings()` näyttää sen vain vasara kädessä. Virheviesti
  "Rakenna työpenkin alueelle (oranssi raja)." (jos penkkiä ei ole: "Rakenna ensin työpenkki.").
- Testit (Playwright): katto 8 laatikkoa ja nousu 2,5 m, kolmiot 6 laatikkoa, aita ei vaurioidu
  mobilta mutta pelaajalta kyllä, seinä mobilta vaurioituu, tasot 0/1/2 ja materiaalin vaihto,
  ladattu hp=20 → taso 2, rengas piilossa/näkyvissä, alueen sisä/ulkopuoli, ei konsolivirheitä.


### v0.8 (erä 9)
- **Näköyhteys:** `losClear(ax,ay,az,bx,by,bz)` (collision.js): askel .3 m, `pointBlocked`, päiden .4 m
  ohitetaan. Silmäkorkeudet: mob `mobEyeY(m)` = y+1.2 (pomo +4), pelaaja y+1.3.
- **Jahti vaatii näköyhteyden:** `updateMobs` laskee `m.los` ~5 kertaa sekunnissa (välimuisti, ei
  joka kehyksellä). Jahti alkaa vain näköyhteydellä; ilman sitä jahti päättyy 3 s kuluttua (`m.noLos`)
  ja viha nollataan (`angry=false`, `lastHit=-99`) vaikka mobia olisi lyöty. Seurauksena mobit
  eivät enää jää hakkaamaan seinää loputtomiin. Pomo (`bossAI`) ennallaan.
- **Mobin isku:** osuu vain jos `losClear` JA keskipisteiden etäisyys < `range+.25` (ennen
  `range+r+.4`) JA katse f > .5 (ennen .3). Ei koskaan seinän läpi.
- **Pelaajan isku** (`doMeleeHit`): mobit sekä puut/kivet ohitetaan ilman näköyhteyttä.
- **Eläimet:** kyykyssä (`P.crouch`) peura ei säiky lainkaan (säikkyy vain lyönnistä, pystyssä < 9 m).
- **Hiiviskelyisku:** kyykyssä lähitaistelu mobiin, joka ei ole chase/flee-tilassa (ei pomo) = vahinko
  ×2 ja keltainen "Hiiviskelyisku!". Koskee vain lähitaistelua, ei jousta.
- Testi (Playwright): seinä katkaisee näköyhteyden, mob seinän takana ei jahtaa, isku seinän läpi
  ei osu (kumpaankaan suuntaan), jahti katkeaa 3 s jälkeen ja viha nollautuu, sneak 16 vs 8
  vahinkoa, peura ei säiky kyykyssä, ei konsolivirheitä.


### v0.7 (erä 7)
- **Kyykky (C, pidä pohjassa):** nopeus max 2,3 m/s, ei juoksua, hahmo madaltuu (`fig.g.scale.y`) ja
  kamera laskee (`P.crouchK`), HUDissa "Hiipii". Törmäyskorkeus pysyy ennallaan. Hiipiessä
  vihollisten huomaamisetäisyys (`aggroR`) puolittuu ja peura/eläimet säikkyvät vain alle 3 m:n
  päästä (muuten 9 m). TULKINTA: käyttäjän viesti sanoi "kasvaa tuplasti", mutta tarkoitus oli
  selvästi hiipimisen hyöty, joten huomaamisalue PIENENEE puoleen.
- **Huomaamisalueet pienemmiksi** (viholliset juoksivat liian kaukaa): `aggro` hiisi 17→12,
  susi 28→18, kalmo 20→14, ylimys 16→12; peuran pakenemisraja 11→9 m. Pomo ennallaan (60).
- **`beforeunload`:** selain kysyy vahvistuksen ennen sivun sulkemista/päivitystä (Ctrl+W jne.),
  kun peli on aloitettu (ei voiton jälkeen).
- **Koko näyttö: F → K.**
- **Kädet eivät enää teleporttaa:** käsien tavoitekulmat lasketaan joka kierroksella ja `armR`/`armL`
  seuraavat niitä pehmeästi (`lerpAngle`, nopeus 14, iskun aikana 32). Harteiden siirtymä (`armSh`)
  on myös pehmeä. Jos lyöntinappi on pohjassa, palautus menee suoraan seuraavan iskun
  nostoasentoon (`swingPose(...,hold)`) eikä lepoon, ja vasen käsi pysyy kirveen varressa.
  Selaintesti: suurin kulmamuutos 0,37 rad/kehys (60 fps), lepoasennossa vain 1 kehys / 240.


### v0.6 (erä 6, korjauserä)
- **Välimuisti:** `index.html`:n kaikki `<script src>`- ja `css`-linkit saavat `?v=0.6`. Nosta
  numero joka erässä (sääntö CLAUDE.md:ssä), muuten raw.githack/selain näyttää vanhat JS-tiedostot.
- **Kädet peilikuvana korjattu:** hahmo katsoo +z:aan, joten +x on vasen. `makeBiped`: `armL` on nyt
  +x, `armR` -x. Ase on oikeassa kädessä, kilpi/soihtu vasemmassa. Kilpimalli peilattu (ulkopinta
  +x), torjunta-asennon `rotation.z` -.5 → -.3. Koskee myös vihollisia.
- **Iskukaari:** `swingPose()` (player.js): nosto ylävasemmalle (0–55 % `hitAt`:sta), isku alaoikealle
  niin että osuma (`doMeleeHit`) tulee iskun LOPUSSA, palautus lepoon. Aiemmin osuma tuli käden
  ollessa ylhäällä.
- **Kirves kahdella kädellä:** `gripWithLeft()` osoittaa vasemman käsivarren varren kohtaan
  (`heldMesh` z=.35), harteet vedetään iskun ajaksi lähemmäs (±.2), sivukaari ±.35. Testattu
  selaimessa: kädet pysyvät .33–.39 m päässä toisistaan koko iskun. Jos vasemmassa kädessä on
  kilpi/soihtu, isku on yhden käden isku (`offBusy`).
- **ESC:** paneelin sulku Escillä ei enää pyydä hiiren lukitusta (`closePanels(keep,skipLock)`),
  `pauseGame` ohitetaan 600 ms paneelin sulkemisen jälkeen (`panelClosedAt`). Taukovalikossa Esc
  sulkee `#opts`-paneelin tai palaa peliin (400 ms viive `pausedAt`). Uusi **F**: koko näyttö +
  `navigator.keyboard.lock(['Escape'])`, jolloin Esc ei poistu koko näytöstä; lukitun hiiren
  aikana Esc pausettaa pelin itse.
- Testaus: three.js r128 haetaan npm:stä (`npm install three@0.128.0`) ja Playwright ohjaa
  cdnjs-pyynnön siihen (`page.route`), koska cdnjs on pilviympäristössä estetty.


### v0.5 (erä 5)
- Toisen käden varustepaikka: kilpi ja soihtu ovat nyt omaa `offhand`-ryhmäänsä (ei enää
  `weapon`-ryhmässä). Oikea käsi pitää yhden aseen/työkalun (`weapon`/`bow`/`hammer`-ryhmä,
  ennallaan), vasen käsi voi samaan aikaan pitää kilpeä TAI soihtua (`equipGroup()`,
  `equipped('offhand')` state.js:ssä). Jousi vaatii edelleen molemmat kädet, syrjäyttää
  automaattisesti kilven/soihdun ja päinvastoin.
- Soihtu ei enää ole käytettävä lähiaseena (menetti `dmg`/`dt`/`range`-kentät) – se on puhtaasti
  valoa antava toisen käden tarvike, jota voi pitää yhdessä oikean käden aseen kanssa.
- Kirveen kaksin käsin -hakkausanimaatio käytössä vain kun vasen käsi on vapaa. Jos vasemmassa
  kädessä on kilpi tai soihtu, kirves iskee yksin käsin (`P.atk.offBusy`).
- Yleistä lyöntianimaatiota parannettu: myös muut kuin kirves-iskut (miekka, nuija, keihäs,
  nyrkit) tekevät nyt pienen viistoliikkeen suoran pystyiskun sijaan.
- Puolustusanimaatio pehmeämmäksi: käsi liukuu torjunta-asentoon (`lerpAngle`) eikä hypähdä
  suoraan paikalleen, ja asennossa on pieni jatkuva huojunta.
- ESC ei enää voi vahingossa avata tauko/alkuvalikkoa kun jokin paneeli (reppu, rakennus,
  kartta, arkku) on auki – Escape-näppäimen käsittelijä asettaa `suppressPause`-lipun ja
  `pauseGame()` tarkistaa myös `openPanel`-tilan.
- Päävalikko: "Palaa peliin" / "Jatka matkaa" on nyt ylimpänä, "Uusi peli" sen alla.
- "Tallenna nyt" -painike näyttää nyt hetkeksi "Tallennettu ✓" -tekstin itsessään, ei vain
  piilotetussa asetuspaneelissa.

### v0.4 (erä 3)
- Kirveen puunhakkausanimaatio muutettu viistoksi iskuksi (ylävasen → alaoikea) suoran
  pystyiskun sijaan. Molemmat kädet liikkuvat yhdessä (kaksin käsin kiinni kirveessä).
  Koskee vain kirvestä/kuparikirvestä (`w.chop`), muut aseet iskevät kuten ennen.
- "Liian uupunut" -viesti tulvi näytölle 30 kertaa sekunnissa, kun hyökkäysnappia pidettiin
  pohjassa kestävyyden ollessa lopussa. Viestille 1,2 s cooldown (`lastStamMsgT`), ei enää
  tulvi.
- Kirveen terä osoitti kädessä ylöspäin; mallin pään tarjoaminen käännetty (`makeHeld()`:n
  kirveen pään y-siirtymä .1 → -.1), terä roikkuu nyt alaspäin kuten oikealla kirveellä.

### v0.3 (erä 2)
- Yläkulman/isoman kartan pelaajanuoli osoitti 180 astetta väärään suuntaan (suunta oli käännetty
  ylimääräisellä puolikierroksella). `drawPlayerArrow()`:n kierto korjattu `-camYaw+Math.PI` →
  `-camYaw`, nuoli osoittaa nyt oikeasti sinne minne katsoo.
- Jokaisella lyöntiyrityksellä kuului terävä "swing"-ääni riippumatta siitä osuiko mihinkään.
  Poistettu `startAttack()`:sta – ääni kuuluu edelleen kun oikeasti osuu puuhun, kiveen tai
  olentoon (`chop`/`pick`/`hit`-äänet pysyvät).
- Harmaasuden juoksunopeus 5,4 → 4,6 m/s, sama kuin pelaajan kävelynopeus.

### v0.2 (erä 1)
- Peli jaettu tiedostoihin `css/` ja `js/`, lisätty `CLAUDE.md` ja tämä muistio.
- Ovesta ei päässyt läpi: yläpalkki alkoi 1,7 m:ssä ja pelaaja on 1,8 m. Oviaukko nyt 1,7 × 2,3 m.
- Rakennusosat isommiksi: ruudukko 2 → 2,5 m, seinät 2 → 2,6 m.
- Seinä ja ovi asettuvat viereisen lattian pintaan.
- Portaat 4 → 6 askelmaa, nousevat täyden kerroksen.
- Harmaasuden juoksu 8 → 5,4 m/s (vähän kävelyä nopeampi, juosten pääsee karkuun).
- Tallennusversio 2. Version 1 rakennukset latautuvat vanhoille paikoilleen, eivät osu uuteen ruudukkoon.

### v0.1
- Ensimmäinen pelattava versio yhtenä HTML-tiedostona.

## Ideajono

Lisää käyttäjän ehdotukset tähän ja merkitse tehdyt versiolokiin.

### Erä 7 – ohjaus ja animaatio – tehty (ks. versioloki v0.7)
- C = kyykky/hiipiminen, vihollisten huomaamisetäisyys pienemmäksi, eläimet eivät säiky.
- `beforeunload`-vahvistus. Koko näyttö F → K. Käsien pehmeä siirtyminen, ketjuiskut.

### Erä 6 – korjauserä – tehty (ks. versioloki v0.6)
- Välimuistin ohitus, kädet oikein päin, kirveen kahden käden ote, iskun suunta ja ajoitus, ESC,
  koko näyttö (F). Tallennusilmoitus oli jo koodissa (näkyi vasta kun välimuisti päivittyi).

### Erä 8 – rakentaminen – TEHTY (ks. versioloki v0.9)
1. Kiinteä olkikatto: pieceBoxes('katto') = 8 porrasviipaletta rinteen suuntaan (paikallinen +z
   matala pää, -z korkea), viipaleen i yläpinta G/8*(i+1), pohja max(0, yläpinta-.3). Tällöin
   pelaaja ei kävele läpi, kamera pysähtyy (camera.js käyttää pointBlocked) ja katolla voi kävellä.
   Tarkista validPlace-poikkeus katolle ja ettei katto estä liikettä talon sisällä.
2. Paaluaita kestää mobit: PIECES.aita.mobProof=1. damagePiece(p,d,src) saa lähteen; ai.js:n
   jumittumiskohdassa (n. rivi 50) kutsu src='mob' ja ohita vahinko, jos PIECES[p.t].mobProof.
   Piikkien vahinko mobille (damageMob 6) säilyy. Pelaaja purkaa vasaralla (X) kuten ennen.
3. Vauriotekstuurit: 3 kuntotasoa hp/maxHp (>66 %, 33–66 %, <33 %). Tee canvas-tekstuureihin
   halkeamat ja reiät (puu, kivi, olki), välimuistita materiaalit tasoittain. Funktio
   setPieceDamage(p) pieces.js:ään, kutsu damagePiecessa ja addPiecessa (latauksen jälkeen oikea taso).
4. Uudet osat (PIECES, pieceBoxes, buildPieceMesh, snap 'wall', R kääntää/peilaa):
   - 'vinoseina' Vinoseinä: suorakulmainen kolmio G leveä, WH korkea (ylänurkasta vastakkaiseen
     alanurkkaan), puu 1.
   - 'kolmio' Päätykolmio: suorakulmainen kolmio G × G, sopii 45° katon päätyyn, puu 1.
   Malli THREE.Shape + ExtrudeGeometry (paksuus .2). Törmäys 6 pystyviipaleena kolmion muodon mukaan.
5. Työpenkin alue näkyviin (vanha suunnitelma): BENCH_R=20, oranssi maastoa seuraava rengas
   näkyy vain vasara kädessä, virheviesti "Rakenna työpenkin alueelle (oranssi raja)."
   - Toteutus: vakio `BENCH_R=20` (pieces.js). `addPiece('tyopenkki')` luo maaston mukaan kulkevan
     rengasnauhan (128 segm., y = `terrainH`+.05…+.45, läpikuultava oranssi `MeshBasicMaterial`,
     `depthWrite:false`), `removePiece` poistaa sen. `validPlace` käyttää samaa 20 m:n sääntöä.
   - Olkikaton karhea reuna (`thatchFringe`): canvas-tekstuuri (läpinäkyvä tausta, eripituisia
     olkia), `alphaTest:.5`, `DoubleSide`. Kaistale katon matalaan ja korkeaan reunaan
     (poikittaiset päät), ulottuu ~.3 m reunan yli.

### Erä 9 – taistelu, näköyhteys ja hiipiminen – TEHTY (ks. versioloki v0.8)
1. collision.js: losClear(ax,ay,az,bx,by,bz) – askel .3 m, pointBlocked, ohita päiden .4 m.
   Silmäkorkeudet: mob y+1.2 (pomo +4), pelaaja y+1.3.
2. ai.js aggro: chase vaatii näköyhteyden. Ilman näköyhteyttä 3 s (m.noLos) → idle, viha
   lähtee, myös vaikka mobia olisi lyöty.
3. Mobin isku (ai.js n. rivi 25): osuu vain jos losClear JA dist < d.range+.25 (keskipisteiden
   etäisyys, nyt range+r+.4 = liian pitkä) JA katse f > .5. Isku ei koskaan mene seinän läpi.
4. Pelaajan isku (actions.js doMeleeHit): ohita mobit ja puut/kivet ilman losClear-yhteyttä.
5. Eläimet: kun P.crouch, flee-eläimet eivät säiky lainkaan (ai.js rivi 20: säikkyvät vain
   lyönnistä). Hiiviskelyisku: P.crouch ja mob ei ole chase/flee-tilassa → vahinko ×2, keltainen
   "Hiiviskelyisku!"-teksti.

### Erä 10 – taivas ja sää – TEHTY (ks. versioloki v0.10)
1. Pehmeä valon vaihto (environment.js n. rivi 26): nyt aurinko vaihtuu kuuksi hetkessä. Tee
   sunK=sstep(-.12,.08,el) ja moonK yöllä. Valon voimakkuus laskee nollaan horisontissa ja suunta
   vaihtuu vasta nollassa. Hämärä ja aamunkoitto noin 1,5 min peliaikaa. Laajenna light-käyrää
   pehmeämmäksi.
2. Kuu: pallo auringon vastapuolella (fog:false), vaalea canvas-tekstuuri läikillä, heikko
   sinertävä kuunvalo varjoineen, vaihe vaihtelee dayN:n mukaan (kirkkaus).
3. Uudet säät WEATHERS-taulukkoon: myrsky (rankkasade, salamat = hetkellinen valon välähdys +
   jyrinä audio.js:ään 0,5–2 s viiveellä), lumisade (vain vuorilla tai korkealla, hitaat valkoiset
   hiutaleet), tihku, tuulinen (puiden latvat huojuvat). Todennäköisyydet updateWeatheriin, viestit
   suomeksi, säätila näkyy kellossa.

### Erä 11 – isompi maailma ja metsät – TEHTY (ks. versioloki v0.11)
1. Kartta noin 3× pinta-alaltaan: world.js HALF 200→350, GN 200→350 (GS pysyy 2). Skaalaa
   LOC-paikat ×1.75, reunan meri (sstep(170,198,d)) ja biomien kohinat. Kartat: MAPC 400→700 px,
   explored-ruudukko 100→175. Mittaa FPS ennen ja jälkeen ja kirjaa se.
2. Tiheämpi metsä: niittyalueet selvästi pienemmiksi biomeAtissa, metsän puutiheys .42→.6.
3. Puiden koko vaihtelee: s .6–2.0, hp ∝ s², saaliit ∝ s.
4. Uusi biomi "Aarnimetsä" (1–2 isoa aluetta): 'aarnipuu', runko 1–1,6 m paksu, 14–22 m korkea,
   havusto vasta 10 m:n yläpuolella. Tumma sammalmaa. Kun pelaaja on biomissa: tiheä sumu (near
   6, far 60), valo ×.6, synkkä tunnelma. Aarnipuuta ei voi kaataa ennen erää 12 (viesti
   "Tarvitset vahvemman kirveen").
5. Kaatuneesta puusta jää tukki (state.js fallTree): uusi node kind 'log' vaakatasossa
   rungon suuntaan, pituus ~ puun korkeus, hp 20*s, hakkaamalla saa puut. Isot puut = 2 tukkia.
6. Metsä kasvaa öisin: sleepAtin fadeTo-callbackissa herätä kaadetut puut, joiden 25 m:n
   säteellä ei ole rakennusta, ja istuta enintään 40 uutta puuta metsäbiomeihin (varaa
   instanssipooli, esim. 400 paikkaa per puulaji).

### Erä 12 – malmit, työkalut ja aarnipuu – TEHTY (ks. versioloki v0.12)
1. Työkalutasot: ITEMS-aseille pick/chop-taso (piikivihakku 1, UUSI kuparihakku 2 ahjosta:
   kupari 6, puu 3, rautahakku 3; kivikirves 1, kuparikirves 2, rautakirves 3). NODE:lle `tier`.
   Liian heikko työkalu → "Tarvitset paremman hakun/kirveen".
2. Rautasuoni: harvinainen (~25 kpl) vuorilla h>22, hp 120, tier 2, antaa rautamalmia 2–4.
   Sulatusuuni sulattaa myös rautamalmin rautaharkoksi (erillinen jono).
3. Rautavarusteet ahjoon: rautakirves (chop 3), rautahakku, rautamiekka (dmg 34),
   rautapanssari (arm 22). Kuvakkeet icon()-switchiin.
4. Aarnipuu vaatii chop-tason 3 ja antaa tervaspuuta (uusi tumma puu). Uudet rakennusosat
   tervasseinä ja tervaslattia: tumma väri, hp ×2.

### Erä 13 – kolme karttaa – TEHTY (ks. versioloki v0.13)
1. world.js: MAPS = 3 esiasetusta (nimi, siemen, kohinan siirtymät, vuorten suunta, järvet,
   LOC-paikat). Esim. Hiidenmaa (nykyinen), Kalmansaaret (saaristo), Tunturinniemi (iso vuoristo).
2. Maailma rakennetaan skriptien latautuessa, joten Uusi peli arpoo kartan → localStorage
   'hiidenmaa_map' → location.reload(). world.js lukee sen latautuessaan. Tallennukseen mapId;
   jos ladattavan pelin mapId on eri → aseta ja lataa sivu uudelleen. Nosta tallennusversio.
3. Valikko näyttää kartan nimen. Testaa jokainen kartta: aloitus maalla, kaikki paikat
   saavutettavissa (ei vedessä), luolasto ja kehä toimivat.

### Erä 5 – tehty osittain (ks. versioloki v0.5 ja erä 6)
- Toisen käden varustepaikka (kilpi/soihtu) oikean käden aseen/työkalun rinnalle.
- Kirves vaatii oikeasti kaksi kättä (yksin käsin jos toinen käsi on varattu).
- Oikea käsi on päätyökäsi, vasen käsi on toisen käden varustepaikka.
- Parempi lyönti- ja puolustusanimaatio.
- ESC ei enää hypi vahingossa valikkoon paneelin ollessa auki.
- Päävalikon järjestys ja "Tallenna nyt" -ilmoitus.

### Erä 3 – tehty (ks. versioloki v0.4)
- Kirveen hakkausanimaatio viistoksi, kaksin käsin.
- "Liian uupunut" -viestitulva korjattu cooldownilla.
- Kirveen terän suunta kädessä käännetty.

### Erä 2 – tehty (ks. versioloki v0.3)
- Kartan pelaajanuolen suuntavirhe (180°) korjattu.
- Jatkuva lyönnin "swing"-ääni poistettu, osumaäänet jäljellä.
- Harmaasuden juoksunopeus 4,6 m/s.

- (ideajono muuten tyhjä – odottaa käyttäjän listaa)

## Tunnetut puutteet

- Katossa ei ole törmäystä, ja katon reunat eivät liity siististi toisiinsa.
- Huonekalut (työpenkki, sänky, arkku) eivät kohdistu ruudukkoon.
- Hiiren lukitus voi olla estetty joissain upotetuissa näkymissä. Silloin kamera käännetään vetämällä.
