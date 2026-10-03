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

### Erä 6 – korjauserä – tehty (ks. versioloki v0.6)
- Välimuistin ohitus, kädet oikein päin, kirveen kahden käden ote, iskun suunta ja ajoitus, ESC,
  koko näyttö (F). Tallennusilmoitus oli jo koodissa (näkyi vasta kun välimuisti päivittyi).

### Erä 7 – rakentaminen
- **Työpenkin alue näkyviin:** sääntö on jo olemassa (`validPlace`: 20 m). Tee vakio `BENCH_R=20`
  (pieces.js). `addPiece('tyopenkki')` luo maaston mukaan kulkevan rengasnauhan (128 segm.,
  y = `terrainH`+.05…+.45, läpikuultava oranssi `MeshBasicMaterial`, `depthWrite:false`),
  `removePiece` poistaa sen. Renkaat näkyvät vain kun vasara on kädessä. Virheviesti:
  "Rakenna työpenkin alueelle (oranssi raja)."
- **Olkikaton päällä voi kävellä:** `pieceBoxes('katto')` = 8 ohutta porrasviipaletta rinteen
  suuntaan (paikallinen +z on matala pää, -z korkea): viipaleen i yläpinta `G/8*(i+1)`, pohja
  `max(0, yläpinta-.3)`. Askel .31 m < `STEPUP`, joten rinnettä voi kävellä; talon sisällä viipaleet
  ovat seinän yläpuolella eivätkä estä liikettä. Tarkista `validPlace`-poikkeus katolle.
- **Olkikaton karhea reuna:** canvas-tekstuuri `thatchFringe` (läpinäkyvä tausta, eripituisia
  olkia), `alphaTest:.5`, `DoubleSide`. Kaistale katon matalaan ja korkeaan reunaan (poikittaiset
  päät), ulottuu ~.3 m reunan yli.

### Erä 8 – maailman sisältö
- Lisää puita niin että pellot/niittyaukeamat ovat pienempiä (tiheämpi metsä, kutistaa avoimia
  niittyalueita).
- Uusi biomi: hyvin korkeita ja tuuheita puita, lehvästö/havusto korkealla latvoissa, pelaaja
  kävelee runkojen alla. Biomi on tunnelmaltaan sumuinen, pimeä ja pelottava.

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
