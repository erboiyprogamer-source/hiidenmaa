# Hiidenmaa – kehitysmuistio

Tämä on projektin muisti. Päivitä se jokaisen muutoserän jälkeen: versioloki, muuttuneet arvot,
uudet päätökset ja ideajono. Lyhyesti ja asiallisesti, ei keskustelulokia.

## Peli lyhyesti

- Pelaaja haaksirikkoutuu Hiidenmaan saarelle. Saarta hallitsee kivinen **Kalmanvartija**.
- Kulku: keräily → kivikirves → työpenkki → suoja ja nuotio → metsästys → piikivihakku ja kupari → sulatusuuni ja ahjo →
  kupari- ja rautavarusteet → Hautakummun hiidenkivet → ulottuvuudet avainketjussa (Routaluola, Kalmankammio, Aarnihauta) →
  pomotaistelu Kalmankehässä.
- 6 karttaa, biomit (v0.82): Rantaniitty, Koivulehto, Korpimetsä, Upposuo, Jäkäläkangas, Aarnimetsä, Kalmanummi, Tunturikangas, Rakka,
  Kivivuori, Routahuiput, Hietaranta, järvi, meri (`BIOMES`, world.js).
- **Kaikki ominaisuudet, säännöt ja fysiikan arvot: `docs/OMINAISUUDET.md`** (päivitä se, kun ominaisuus tai arvo muuttuu).

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
- **Ulottuvuuksien etenemisketju (ei jumiutumista):** Jääavain löytyy maailmasta (rauniotalo `poiR1`) → Routaportti → Jäätär antaa
  Luuavaimen → Kalmankammion portti → Kalmaherra antaa Aarniavaimen → Aarnihaudan portti. Ensimmäinen ulottuvuus ei vaadi mitään
  muista ulottuvuuksista. Avain annetaan suoraan reppuun (`REALMS[id].key`, `onMobKilled`). Varmistus: portti aukeaa ilman avainta,
  jos avaimen lähde on jo käyty (`REALMS[id].alt`: arkku avattu / edellinen pomo kaadettu) tai ulottuvuudessa on jo käyty (`flags.rs`).
  Maahan pudonneita esineitä ei tallenneta, joten tämä varmistus on pakollinen. Hiidenkiviä on tarjolla 8 (kumpu 3, pomot 3, arkut 2),
  alttari tarvitsee 3.

## Tasapainoarvot (päivitä kun muutat)

| Asia | Arvo |
| --- | --- |
| Pelaajan kävely / juoksu | 4,6 / 8 m/s |
| Käsisoihdun paloaika `TORCH_T` | 120 s (pihka +60 s) |
| Vihollisten nopeuskerroin `MOB_SPD` | 0,85 (aarnimetsässä viholliset ×1,2, v0.83) |
| Tuuli (m/s) | selkeä 1–4, pilvi 3–7, sade 4–8, tuulinen 8–13, myrsky 15–22; suunta 2–6 min, käännös 40–90 s |
| Vihollisten syntyetäisyys | yö 55–85 m (10 %: 20–30 m), päivä 38–68 m, päivällä max 2 vihollista |
| Puiden uusiutuminen | kerran yössä, 100 m säteellä |
| Rakennusalueen suoja (`nearBase`) | 15 m osasta, työpenkki 26 m |
| Terveys / kestävyys / max paino | 60 / 100 / 160 |
| Vuorokauden pituus `DAY_LEN` | 720 s (12 min) |
| Rakennusruudukko `G` / seinän korkeus `WH` | 2,5 m / 2,6 m |
| Oviaukko | 1,7 × 2,3 m |
| Portaat / Raput | 6 askelmaa (0,43 m) |
| Reppu | 32 paikkaa, päivitys +8 paikkaa +40 painoa (2 tasoa) |

| Olento | HP | Juoksu m/s | Vahinko | Huom. |
| --- | --- | --- | --- | --- |
| Peura | 25 | 8,5 | – | pakenee |
| Metsäjänis | 8 | 9,5 | – | jähmettyy, siksak |
| Kettu | 16 | 8 | – | utelias, katsoo |
| Metso | 10 | 4,5 | – | lehahtaa 14–24 m |
| Poro | 35 | 7,5 | – | lauma 3–5 |
| Hirvi | 70 | 7 | 14 (+tönäisy 9) | 35 % suuttuu alle 6 m |
| Ilves | 30 | 8,5 | 10 | yöllä haavoittuneen kimppuun |
| Ahma | 28 | 6 | 9 | suuttuu raa'asta lihasta |
| Emakko / porsas | 45 / 8 | 6 / 6,5 | 10 / – | puolustaa porsaita |
| Hiidenkarhu / Hiidenhirvi / Kalmasusi / Suonäkki | 260 / 220 / 140 / 160 | 7,5 / 9 / 9,5 / 5,5 | 26 / 22 / 18 / 20 | harvinaiset, vainoavat 30–60 s |
| Karhu | 120 | 7,2 | 18 (+tönäisy 16) | lyö liikkeestä, kaataa puita, palautuu 60 s jälkeen |
| Villikarju | 40 | 5,8 | 8 | hyökkää vain jos lyöty |
| Sammalhiisi | 34 | 5,2 | 9 | |
| Harmaasusi | 44 | 4,6 | 11 | öisin pareittain, sama kuin pelaajan kävely |
| Kalmo | 50 | 4,6 | 13 | heikko murskaavalle |
| Kalmon ylimys | 150 | 4,2 | 20 | luolaston miniboss |
| Kalmanvartija | 900 | 3,6 | 22–28 | 4 hyökkäystä, kutsuu kalmoja 50 %:ssa; v0.89 ryntäys 25 %/8 s, ennakko +40 %, kivi 30 % hitaampi |

## Versioloki

### v1.08 (lista 2, kohta 1: esineiden siirron selkeys ja raahaus)
- Käyttäjä hylkäsi "esine tarttuu hiireen" -mallin: nykyinen napsautus–napsautus säilyy, mutta valinta viestitään selvemmin.
- `ui.js`: `slotUX` (data-g/i, hover-vihje, raahauksen aloitus), `updGhost`/`#ghostIt` (haamukuvake hiiren vieressä; raahatessa isompi),
  `slotHint` (Siirrä / Pinoa / Vaihda), `moveHalf` (oikea napsautus valittuna), `splitIn` (puolitus myös arkussa), `curSel`, `uxArr`.
  Raahaus alkaa 6 px liikkeestä; pudotus ruutuun = `moveSlot`, pikapalkkiin = repun ruutu 0–7, paneelin ulkopuolelle = maahan
  (`spawnDrop`, varuste riisutaan). Raahauksen jälkeinen click syödään (`dragEat`). CSS: `selPulse`-animaatio, `.tgt` + `::after`-vihje.
- Arkun ohjeteksti `#chestHint` vaihtuu valinnan mukaan.

### v1.07 (tuulikompassi takaisin kartan päälle – ei peitä mitään)
- Käyttäjän toive: kompassi pysyy kartan päällä oikeassa yläkulmassa kuten ennen v1.06:ta, mutta se ei saa peittää karttaa eikä muuta.
  Ratkaisu (`drawBigMap`, ui.js): (1) taustat läpikuultavat (ympyrä 0,42, laatikko 0,5), (2) kompassi häipyy alfaan ~0,12, kun hiiri on
  sen kohdalla (`mapMouse`, `mapWindA`, pehmeä siirtymä), (3) kartan merkit (työpisteet, löydetyt paikat, hauta) ja pelaajan nuoli
  piirretään kompassin päälle. Erillinen `#mapWind`-kangas ja `.mapRow` poistettu; kartan leveys taas `min(78vh, 100vw − 60px)`.

### v1.06 (nuija, takaraivon hiukset, tuulikompassi kartan viereen)
- **Nuija toisin päin:** varren kartio oli väärin päin (paksu pää kädessä, ohut kärjessä). Nyt `CylinderGeometry(.095,.034)`: paksu pää
  kärjessä vanteineen, ohut kahva nupin kanssa kädessä (myös selässä, sama malli).
- **Pelaajan takaraivo:** 11 hiustupsua (r 0,075) takaraivoon ja niskaan (y 0,13–0,38, z −0,12…−0,2); kuuluvat `hairTop`-listaan, joten kypärä piilottaa ne.
- **Tuulikompassi isolla kartalla** (v1.07: palautettu kartan päälle, ks. v1.07) siirretty kartan päältä oikeasta yläkulmasta kartan vasemmalle puolelle omaan kankaaseen `#mapWind`
  (170×172, `.mapRow` flex). Kartan leveys `min(78vh, 100vw − 250px)`. Tuuliviirut jäävät kartan päälle.

### v1.05 (DEV-esinehaku + jousen laukaisun korjaus)
- **DEV-esinehaku** (DEV-valikko Ä, `renderDev`/`devGive`, ui.js): hakukenttä (nimi tai id, ääkköset ohitetaan kuten reseptihaussa),
  määräkenttä 1–999 hakunapin vieressä ja tulosten lista kuvakkeineen ("Anna N"). Täsmäosuma ja alkuosuma ensin, Enter antaa ensimmäisen.
  Jos reppu täyttyy, loput putoavat maahan pelaajan jalkoihin. Haku ja määrä muistetaan valikon sulkemisen yli. Poistuu `DEV=false`:lla.
- **Korjaus:** `onPrimaryUp` (actions.js) oli hävinnyt v0.96:n muutoksessa → hiiren vapautus heitti virheen eikä jousi laukaissut
  (laukesi vain, kun kestävyys loppui). Palautettu (KORJAUKSET 20).

### v1.04 (käyttäjän palaute: ruoho, kasvillisuuden esto, tuulinäyttö, leirit)
- **Ruoho kasoina** (`rebuildGrass`): harvaan sirottuneita pieniä kasoja (solu 2,6 m / täysi 1,8 m, todennäköisyys tiheys × laikku × 0,6),
  kasassa 3–6 tupsua 0,5 m säteellä; 4 ohutta kortta (0,012–0,022 m), opacity 0,5, vaaleampi. Normaalilla ~500 tupsua. Ei kohteiden päälle
  (`siteBlockedG` = 60 % suoja-alueesta).
- **Kasvillisuus ei uusiudu kohteiden päälle** (`SITE_CLEAR`/`siteBlocked`, resources.js; `respawnNode` sekä ehdokas- että lopputarkistus):
  leiri 8, kiviröykkiö 6,5, linnake (arkkukivi) 12, rauniot 10, portaali 9, riimukivi 3,5, Hautakumpu 13, Kalmankehä 15 m. Testattu 51 000
  uudelleenkasvatuksella: 0 kohteen päällä. **Leirin rakennelmat** suojaavat vain 7 m (`nearBase`; pelaajan rakennukset 15 m), joten metsä on lähempänä.
- **Tuulinäyttö isolla kartalla:** kompassi r 46 + asteikko, paksu nuoli, laatikko "Tuuli idästä / 18,7 m/s" ja voimakkuuspalkki (0–22 m/s,
  väri vihreä → oranssi → punainen), kartan yli liukuvat tuuliviirut (`drawWindStreaks`, nopeus ja pituus tuulen mukaan). Minikartassa "m/s".
- **Leirit:** puupino (sahatut päät), nahankuivausteline taljoineen, kaatunut ämpäri ja luita/oksia maassa.

### v1.03 (linnake vaikeammaksi + kierreportaat, kiviröykkiöt)
- **Arkkukivilinnake:** hyppypilarit kapeammat (0,75–0,85 m) ja siksakissa (säde vuorotellen 8,2 / 10,2 m), nousu 0,8 m (huippu 4,0 m),
  välit reunasta reunaan 2,0–2,4 m → vaatii juoksuhypyn; viimeiseltä pudotaan 0,5 m muurin harjalle. Sisäpuolella **kierreportaat** muurin
  sisäpintaa pitkin 0,3 m askelin (~11 askelmaa, ~300°) pilarireitin kohdalta alas. Testattu: juoksuhypyt kaikille pilareille ja muurille,
  portaat kävellen arkulle.
- **Kiviröykkiöt** (`STASHES`, story.js, käyttäjän pyyntö "perinteiset kivipaikat joissa arkku näkyvillä"): 2 per kartta, v0.98-tyylinen
  avoin kivirengas kahdella kulkuaukolla, matala laatta ja arkku keskellä; sijoitus kasvillisuuden jälkeen (ei muuta maisemaa/tallennuksia).
  Saalis: kupari 2, nuolet 10, liha 2 / pihka 3, kivi 8, luu 3; +20 XP. `LOC.kiviN` "Kiviröykkiö", löytyy 30 m:stä.

### v1.02 (ruoho kevyemmäksi, käyttäjän palaute)
- Ruoho oli "kauhea" (liian tiheä, tumma, paksu). Nyt: läpikuultava (opacity 0,62, depthWrite pois), 5 ohutta kortta (leveys 0,018–0,032,
  pituus 0,22–0,58), vaaleampi (tyvi 0,7 × väri, kärki 1,15 ×), **laikuittain**: kasvaa vain kohinan muodostamissa ryhmissä
  (`vnoise(0,09)·0,7 + vnoise(0,31)·0,3`, sstep 0,52–0,68 → ~30 % maasta, reunat harvenevat). Säde 30 m / 40 m (täysi), väli 0,85 / 0,6 m.
  Normaalilla ~1 000 tupsua.

### v1.01 (arkkukivi = suljettu kivilinnake, käyttäjän pyyntö)
- `buildPoiRock` (story.js) korvaa v0.98:n avoimen kivikasan: **umpinainen 3,5 m kivimuuri** (18 lohkoa, säde 5,5 m, paksuus 0,8 m, sammal
  harjalla), ulkopuolella **5 hyppypilaria** (nousu 0,7 m > askelnousu → hypättävä, välit reunasta reunaan 1,6–1,9 m = "vaikea"),
  viimeiseltä hypätään muurin harjalle; sisällä **kiviportaat** 0,5 m askelin alas arkulle ja takaisin ylös. Hehkuva riimu muurin sisäpinnalla.
- Testattu pelin fysiikalla (hyppy 7,2 m/s, painovoima 22 → huippu ~1,18 m): laskeutuu kaikille pilareille ja muurille, portaat arkulle asti,
  muurista ei pääse läpi. Reittitiedot `FORT[k]` (tarkistus: pilarien nousut ≤ 0,75 m, portaat ≤ 0,55 m).

### v1.00 (ruoho – kohta 15, päivityslistan kohdat 1–15 valmiit)
- Pystyheinätupsut (`GRASS_GEO` 7 korren tupsu, `rebuildGrass`/`updateGrass`, resources.js) instansseina pelaajan ympärillä: biomi tallennetaan
  maaston rakennuksessa (`TBIOME`, render.js), tiheys/pituus/väri `GRASS_DEF` (niitty tihein, koivikko, metsä, suo pitkä, kangas harva,
  tunturi lyhyt, nummi kuiva, ranta dyyniheinä…). Ei poluilla (multa > 0,22), vedessä, jyrkänteillä eikä rakennusten alla; paikat hajautettu
  ruudukkoon (sama kohta → sama tupsu), lista rakennetaan uudelleen 6 m:n liikkeen, polun tai rakennuksen jälkeen (`grassDirty`).
- Tuuli: sama `SWAY`-tuuli kuin puilla – kallistus tuulen suuntaan (korkeus²) + edestakainen heilunta + pieni värinä; "Puiden heiluminen"
  pois → kallistus pois. Normaalit ylös (ei mustaa kääntöpuolta).
- **Asetus Grafiikka → Ruoho:** Pois / Normaali (oletus: 32 m, väli 1,15 m, ~2 400 tupsua) / Täysi (44 m, 0,72 m, ~11 700).
- Korjattu latausvirhe: `_gp` oli jo määritelty → apumuuttujat `_grM…` (CLAUDE.md: sama ylimmän tason nimi vain kerran); `grassDirty` määritelty
  ennen `mudFlush`ia (TDZ, KORJAUKSET 1).

### v0.99 (hylätyt leirit – kohta 14)
- `CAMPS` + `ensureCamps` (story.js): 1–2 leiriä per kartta (siemen `MAP_ID`), paikka valitaan kasvillisuuden sijoittelun jälkeen tasaiselta
  maalta ilman puita/kiviä 7 m:n säteellä, ≥ 60 m muista paikoista (väljempi toinen haku vuorisille kartoille: 35 m, myös tunturi/suo/aarni/vuori)
  → maiseman numerointi ja vanhat tallennukset ennallaan. `LOC.campN` = "Hylätty leiri" (löytyy 30 m:stä, merkki kartalle).
- Rakennelmat tavallisina rakennusosina (tallentuvat; `flags.camps`, vanhaan tallennukseen luodaan latauksessa): **sammunut nuotio**
  (fuel 0 → sytytetään puulla kuten oma nuotio), uusi rakennusosa **Teltta** (Kalusto, nahka 6 + puu 4; A-runko, kangaslappeet, umpinainen
  takapääty, edestä avoin, salot ja kiilat; suojaa → nukkuminen onnistuu), **sänky** teltan sisällä, istuintukki (palkki) ja **hylätty säkki**
  (löydetty säiliö: liha 2, nahka 2, soihtu, puu 6, nuolet 8; +15 XP).
- Leirin rakennusosat tekevät siitä "tukikohdan" (`nearBase`): 15 m:n säteelle ei synny vihollisia.

### v0.98 (arkkukivien kivikasat – kohta 13)
- `buildPoiRock` (story.js): kivet kauempana (sisäreuna ≥ 2,4 m keskeltä, leveys 1,6–2,8 m, tangentiaalisesti), kaksi vastakkaista ~90°
  kulkuaukkoa (arvottu suunta), keskilaatta matala (yläpinta 0,25 m < askelnousu, ei törmäystä), arkku laatan päällä. Ennen kivet olivat
  1,9–3,1 m päässä ja jopa 3,6 m leveitä, ja laatta 0,8 m korkea → arkulle ei päässyt. Tarkistus: vähintään yksi esteetön suunta.

### v0.97 (aluevartijat – kohta 12)
- Löytöpaikkojen vartijoiden alue ×2 (portaalit 32 m, muut 30 m; `story.js` m.guard.r). Rajan ylittyessä vartija ei palaa heti: se jää
  rajalle (ei liiku ulospäin, kääntyy pelaajaan ja lyö, jos ulottuu) ja arpoo 1–10 s, jonka jälkeen palaa alueelleen paranen 5 %/s kuten
  ennen. Paluu keskeytyy, jos pelaaja on taas alueen sisällä näköyhteydessä aggro × 1,35 -etäisyydellä (jahti jatkuu).

### v0.96 (kuokka ja lapio – kohta 11)
- `terraTool(mode)` + `useTool(alt)` (actions.js; korvaa `useShovel`/`useHoe`). Vasen = ensisijainen, oikea = toissijainen; pohjassa pitäen
  toistuu 0,45 s välein, kestävyys −6, ei rakennusten lähellä. Lapion/kuokan kanssa oikea ei torju.
  - **Kuokka vasen** `raise`: +0,3 m (keskellä, reunoilla vähemmän), enint. +3 m alkuperäisestä, maa saa biomin perusvärin (multa pois).
  - **Kuokka oikea** `restore`: palauttaa vain alkuperäisen värin (ei korkeutta).
  - **Lapio vasen** `dig`: kuoppa −0,3 m, enint. −3 m, väri biomin perusväri. **Lapio oikea** `path`: entinen polku (tasoitus jalkojen
    korkeudelle ±0,4 m + ruskea multa). (Ennen v0.96 lapion vasen teki polun ja hiiren pito käytti aina lapion toimintoa myös kuokalla.)

### v0.95 (vartija vajoaa ja nousee – kohta 10)
- Yli 90 m:n päässä (tai luolastossa) Kalmanvartija ei katoa heti: tila `sink` – pysähtyy, nostaa kädet ja vajoaa 3 s:ssa 7,5 m maan alle
  (kiihtyvä k²), multa- ja kivihiukkasia, jyrinä (`slam` + matala `roar`), tärinä lähellä; ilmoitus heti alussa. Vasta lopuksi poisto,
  `flags.altarSt`/`bossHp` kuten ennen. Herätettäessä tila `rise`: nousee 2,5 s:ssa maasta multaa pöllyten, sitten nykyinen karjaisu (intro).
  Vajoamisen/nousun ajan `m.sinking` → `damageMob` ei tee vahinkoa eikä vartija hyökkää.

### v0.94 (Shift-tietoikkuna)
- Kun **Shift** on pohjassa, hiiren alla olevan esineen tiedot (nimi, kuvaus, `itemProps`-taulukko) näkyvät kursorin vieressä (`#itemTip`,
  `updateItemTip`, ui.js): repun ja pikapalkin paikat, arkut/hautakasa (`slotHTML` data-it/q/n) ja valmistuslistan rivit. Päivittyy hiirtä
  liikutettaessa ja Shiftin painalluksella, katoaa Shiftin noustessa. Ei vaikuta Shift+napsautussiirtoon.

### v0.93 (käyttäjän välilisäys)
- **Hautakasa** ei katoa koskaan itsestään (kuten ennenkin); pääkallo kartalla kunnes kasa on tyhjä. Jos kaikki mahtuu reppuun, tavarat
  otetaan kerralla; muuten kasa avautuu arkkuikkunaan (`curChest.grave`, ota mitä mahtuu, loput jäävät ja tallentuvat). Tyhjä kasa vajoaa
  1,6 s:ssa maahan multaa pöllyten (`graveVanish`).
- **Kalmanpesä** murskautuu millä tahansa (myös nyrkillä): muulla kuin hakulla 6 vahinkoa/isku = puolet kivihakun 12:sta (2× aika).
  Murskattaessa pesän 12 m:n sisällä olevat huoneen mobit merkitään kaatuneiksi (`fo('rm')`), joten pesän ympärille ei enää synny mobeja.
- **DEV-täpät** (`DEVF` core.js, `devOn(k)`, muistetaan `localStorage['hiidenmaa_dev']`): Ei voi kuolla (ei vahinkoa, `playerDie` estetty),
  Ei nälkää, Rajaton kestävyys, Korkein taso, Ei painorajaa + Kaikki päälle / pois. Oletus: aiemmat DEV-edut päällä, uudet pois.
- **Pelaajan juoksu** (player.js `runK` 0 → 1 välillä 4,8–7,6 m/s): perinteinen harppova juoksu – takajalka ojentuu taakse kantapää ylhäällä,
  etureisi nousee korkealle (−1,14 rad), polvi koukistuu heilahduksessa, vartalo kallistuu eteen (+0,13), pomppu, kädet koukussa
  (kyynärpää −1,15) ja heiluvat laajemmin. Tahti 1,8 (ennen 1,9) × (1 − 0,28·runK); kävelyn heilahdus 0,82 (ennen 0,75). Nopeudet ennallaan.
- **Nuija** tarkistettu kuvilla: kahva kädessä, paksu pää eteen (sama suunta kuin kirveellä).

### v0.92 (harppovat hirviöt ja aseiden tönäisy – kohta 9)
- Kaksijalkaiset hirviöt (sammalhiisi, kalmo, kalmon ylimys, kivivartija, Suonäkki; myös ulottuvuusversiot, `MOBDEF.stride`): liike +10 %
  (`moveMob`), lyöntiulottuma +10 % (`range × 1,1`), askel ~40 % pidempi ja tahti hitaampi (`walkPh × 1,55` vs 2,2, heilahdus 0,98 vs 0,7,
  polvi 1,3 vs 0,9), vartalo keinuu sivuttain (±0,07 rad), pomppaa ja kumartuu eteen (jahdatessa 0,12 rad; `f.g.rotation.order='YXZ'`).
- **Aseiden tönäisy** `ITEMS.kb` (m/s; mobin vaimennus 6/s → matka ≈ kb/7,5 m mitattuna): nuija 14 (≈1,9 m, vahvin), rautakirves 6,5,
  hiidenmiekka 7, keihäs 6, muut 4–5,5. `damageMob(...,kb)`; isot olennot vastustavat (säde > 0,8 × 0,4, > 0,6 × 0,7), pomot eivät liiku.
  Tavaran tiedoissa rivi "Tönäisy X m" (≥ 10: "vahva").
- **Nuija** uudelleen mallinnettu mailamaiseksi: nuppi, käämitty kahva, tasaisesti paksuneva varsi, pyöreä pää, kaksi rautavannetta. (Varren kartio oli väärin päin – korjattu v1.06.)

### v0.91 (ulottuvuuksien mobien yksityiskohdat – kohta 8)
- `realmize(m,id)` (dungeons.js) kaikkiin ulottuvuuksissa syntyviin tavallisiin mobeihin (huoneet, pomon kutsumat, Kalmanpesä); ulkomaailman
  saman lajin mobit ennallaan, pomot ennallaan. **+10 % terveys** ja **lisäsaalis** `REALM_LOOT` (Routaluola luu 1–2 + rauta 0–1,
  Kalmankammio kupari 1–2 + luu 1–2, Aarnihauta pihka 1–2 + kupari 0–1).
- Koristeet: **Routaluola** huurrekuori, jääpuikot, jääpiikit päässä; **Kalmankammio** hautakaapu, pronssinen kaulakoru ja käsirenkaat,
  heiluva selkäriepu, ylimyksellä pronssikruunu ja viitta; **Aarnihauta** sammaltyynyt, hohtavat sienet, heiluvat köynnökset.
- **Silmät** (`animEyes`, ai.js animMob): pään kirkkaiden MeshBasic-silmien päälle additiivinen halo + ylöspäin lepattava liekinkieli
  ulottuvuuden värillä (sininen / oranssi / vihreä); epäsäännöllinen sykintä, jahdatessa 35 % kirkkaampi ja liekki korkeampi;
  räpäytys 3–8 s välein (0,13 s).

### v0.90 (painavat haarniskamallit – kohta 7)
- `buildArmor(f,id)` (models.js): haarniskan osat kiinnitetään hahmon nivelryhmiin (rig, olkavarret, kyynärvarret, reidet, sääret, pää), joten
  ne liikkuvat animaation mukana; vanhat osat poistetaan aina ensin (`f.armorParts`). Kypärä piilottaa hiukset (`f.hairTop`), parta jää.
  Kypärät ja huput ovat edestä avoimia (`cap` kupoli otsaan, `openShell`/`openRing` aukko eteen: huom. sylinterin kulma 0 = +z, pallon π/2 = +z).
  - **Nahkavaatteet:** nahkatakki nyöreineen, turkiskaulus, vyö, rannesuojat, säärisuojat, helmalevyt, edestä avoin huppu.
  - **Karhuntaljahaarniska** (uusi, työpenkki: 2 karhuntaljaa + 4 nahkaa, taso 4; arm 10, lämmin, ei hidasta): nahkasuojat + taljaviitta
    selässä, turkis olkapäillä ja karhun pää huppuna (kuono, korvat, hampaat).
  - **Kuparipanssari:** 6 suomuriviä, vyö + kultasolki, kerroksiset olkasuojat, helmalevyt, säärisuojat polvisuojineen, kartiokypärä,
    nenäsuoja ja poskisuojat.
  - **Rautapanssari:** rengaspaita, rintalevy, kaulasuoja, isot olkalevyt, helmalevyt, sääri-/polvisuojat, rannesuojat ja rautahanskat,
    kupolikypärä silmäsuojarenkain ja edestä avoin rengasverho.
  - **Hiidenpanssari:** tummat kivilevyt, turkoosina hehkuvat riimusaumat, piikkiolkasuojat, suljettu kivikypärä hehkuvalla visiirillä ja kruunupiikeillä.
- Alusvaatteen väri haarniskan mukaan (tumma alusasu).
- **Selkätavarat haarniskan päällä** (käyttäjän välikommentti): `ARMOR_BACK` (state.js) = mitattu selän ulkonema + 2 cm; kilpi, jousi ja
  työkalut siirtyvät `ch` ja vyön vasara `bt` verran taaksepäin (karhuntalja 15/10 cm, metallit 5–6,5/2,5 cm), ilman haarniskaa ennallaan.

### v0.89 (pomojen nerffaus – kohta 6)
- **Kalmanvartija** (`bossAI`): ryntäys 9–30 m:ssä 25 % (ennen 50 %) ja vähintään 8 s välein (`m.chargeT`), muuten kiven heitto
  (mitattu osuus ~13 %). Huitaisun ennakko 0,8 → 1,12 s, maahaniskun 1,1 → 1,54 s (+40 %), iskujen väli × 1,2.
- **Kiviä heittävät pomot** (Kalmanvartija + `kit` sisältää 'throw' eli Jäätär): kaikki hyökkäykset +10 % hitaammin (`BOSS_SLOW` 1,1:
  `a.t += dt/1,1`, `atkCd × 1,1`). Kivi (`throwRock`) lentää 30 % hitaammin: lentoaika 1,1 → 1,57 s (kohdetta kohti).
  Kokonaisuus: vartijan huitaisu osuu ~1,23 s:n kohdalla.
- **Alttari:** kun vartija vajoaa maahan, käytetyt hiidenkivet eivät palaa reppuun; alttari pysyy aktiivisena (`flags.altarSt`), siinä näkyy
  kolme hehkuvaa kiveä (`altarGems`, `syncAltar`) ja teksti "Hiidenkivet valmiina (3/3) – herätä vartija". Herätys ei vaadi uusia kiviä.

### v0.88 (harvinaiset pelottavat – kohta 5d, kohta 5 valmis)
- `def.stalk` + `stalkAI` (ai.js): huomatessaan pelaajan (aggro × 1,35 yöllä) jahtaa 30–60 s **eikä luovu** etäisyyden tai näköyhteyden
  katketessa; sitten poistuu 5 s poispäin (80 % juoksusta) ja unohtaa (2 s `forgetT`, jona ei huomaa). Uusi huomaaminen vaatii näköyhteyden
  ja aggro-etäisyyden. Lyönti poistumisen aikana suututtaa heti uudelleen. Ensimmäisellä huomaamisella viesti (`hello`), murina ja tärähdys.
  Aamulla katoaa, jos ei jahtaa ja on yli 45 m päässä.
- `spawnScary`: vain yöllä, 0,8 % per spawn-yritys (≈ kerran 5 min), 40–60 m päähän, enintään yksi kerrallaan, biomin mukaan `SCARY`:
  aarni → Hiidenkarhu/Hiidenhirvi, metsä → Hiidenkarhu/Kalmasusi, nummi → Hiidenhirvi/Kalmasusi, tunturi/rakka → Kalmasusi, suo → Suonäkki.
  - **Hiidenkarhu** 260 hp, isku 26, kb 18, lyö liikkeestä ja kaataa puita (kuten karhu), musta, hehkuvat punaiset silmät, luupiikit + sammal.
  - **Hiidenhirvi** 220 hp, juoksu 9, isku 22, kb 14, musta jättihirvi, vihreänhehkuiset silmät, sarvista nousee usvaa (`mist`). Saalis voi sisältää hiidenkiven.
  - **Kalmasusi** 140 hp, juoksu 9,5, isku 18, kalpea jättisusi kylkiluineen, siniset silmät; ilmestyessä ulvonta `howl` + viesti.
  - **Suonäkki** 160 hp, isku 20, tuli ×1,5, sammaloitunut pitkäkätinen olento (`figSuonakki`), nousee lätäköstä 2 s:ssa (`rise`, multaa).

### v0.87 (karhu – kohta 5c)
- **Karhu** (`MOBDEF.karhu`, temper `bear`): 120 hp (= 2 × pelaajan 60), juoksu 7,2 (× MOB_SPD ≈ 6,1 < pelaajan juoksu 8), isku 18, ulottuma 2,6,
  cd 0,65, wind 0,18, tönäisy kb 16 (≈ 3,5 m). Neutraali: murisee varoittavasti 14 m:ssä (12 s välein), hyökkää alle 8 m:ssä tai lyötynä.
  **Lyö liikkeestä** (`mobile`: iskun aikana nopeus 75 % juoksusta, ei pysähdystä, käpälänisku-animaatio). **Kaataa puita** (`fells`,
  `fellAhead`): jahdatessa 0,9 ja 1,8 m edessä olevat puut (ei aarnipuita) kaatuvat sivulle ja jäävät tukeiksi. **Palautuu** 5 %/s, jos ei lyöty
  60 s (`def.regen`; ohittaa yleisen 30 s säännön). Enintään yksi kerrallaan, ei aloitusalueelle päivällä. Korpimetsä, aarnimetsä, tunturi.
  Malli `bear` (makeAnimal): iso pää, pyöreät korvat, paksut jalat ja käpälät, lapojen kyttyrä.
- Saalis **Karhuntalja** + liha 4–6. Uusi rakennusosa **Karhuntaljamatto** (Kalusto, 1 talja). Haarniska taljasta → kohta 7.

### v0.86 (joskus vihaiset eläimet – kohta 5b)
- `temperAI` (ai.js, `MOBDEF.temper`), ai `neutral`. Vihaisena tavallinen jahti; rauhoittuu, kun pelaaja > aggro × 1,3 eikä lyöty 12 s:iin.
  Suuttuessa murina (`roar`, sävel lajin mukaan) + viesti (enint. 20 s välein).
  - **Hirvi** (70 hp, juoksu 7, isku 14, tönäisy `kb` 9): alle 6 m:ssä kerran per lähestyminen 35 % suuttuu ja ryntää, muuten pakenee
    (nollautuu yli 15 m:ssä). Metsä, suo, koivulehto. Saalis nahka 2–3, liha 3–4. Malli `elk`: lapiosarvet, roikkuva kuono, kaulaparta, kyttyrä.
  - **Ilves** (30 hp, 8,5, isku 10, cd 0,9): yöllä hyökkää, jos pelaajalla < 50 % terveyttä; muuten väistää alle 10 m:ssä. Metsä, kangas, rakka.
    Malli `lynx`: korvatupsut, poskiparta, täplät, töpöhäntä.
  - **Ahma** (28 hp, 6, isku 9): suuttuu nähdessään pelaajan, jolla on raakaa lihaa (`liha`). Tunturi, rakka. Malli `ahma`: matala, vaalea kylkijuova.
  - **Villikarjuemakko** (45 hp, isku 10, kb 5) + 2–4 **porsasta** (8 hp, pakenevat, seuraavat emoa yli 4 m:n päästä): emakko suuttuu, jos
    pelaaja on alle 7 m porsaasta. Niitty, metsä. Malli boar `sow` (ei torahampaita), porsaalla vaaleat raidat.
- **Tönäisy** `P.kbx/kbz` (player.js): erillinen impulssi, vaimenee e^(−4,5 t), matka ≈ kb / 4,5 m (hirvi 2 m). Tavallinen liikefysiikka ennallaan.

### v0.85 (uudet eläimet ja luonteet – päivityslista kohta 5a)
- Kohta 5 jaettu eriin: **5a** jänis, kettu, metso, poro + luonteet (TEHTY), **5b** hirvi, ilves, ahma, emakko porsaineen (joskus vihaiset),
  **5c** karhu, **5d** harvinaiset pelottavat: Hiidenkarhu, Hiidenhirvi, Kalmasusi, Suonäkki (käyttäjä valitsi kaikki).
- **Luonteet** `MOBDEF[x].per` (ai.js flee-haara): `scare` säikähdysetäisyyden kerroin, `freeze` jähmettyy ensin (s), `zig` siksak-pako
  (suunta 0,35–0,7 s välein ±1,1 rad), `fly` lehahtaa 14–24 m (kaari 2,5–4 m, `startFlee`/`flyMob`, ääni `flap`), `herd` lauma (25 m)
  pakenee samaan suuntaan, `curious` jää katsomaan (tila `watch`, alle 26 m näköyhteydellä), `safe` rauhoittumisetäisyys.
- **Metsäjänis** (8 hp, juoksu 9,5, scare 1,3, freeze 0,6 s, siksak, loikka-animaatio `hop`): niitty, koivulehto, tunturi, rakka.
  **Kettu** (16 hp, 8, scare 1,4, utelias): öisin niityllä/koivikossa/metsässä/kankaalla. **Metso** (10 hp, scare 0,55 → antaa tulla lähelle,
  lehahtaa; `makeBird`): metsä, koivulehto, kangas; saalis liha + **Metson sulka** 1–3. **Poro** (35 hp, 7,5, scare 0,75, lauma 3–5):
  tunturi, rakka, kivivuori, kangas.
- Mallit: `makeAnimal` kind `hare` (litteät pitkät mustakärkiset korvat, pitkät takakäpälät, valkoinen häntätupsu), `fox` (wolf + tuuhea
  valkokärkinen häntä, mustat sukat, vaalea rinta), `rein` (deer + taakse-eteen kaartuvat sarvet piikkeineen, vaalea kaulaharja).
- **Sulitetut nuolet** (puu 2, piikivi 2, sulka 1 → 15, taso 4): lento +12 %, vahinko +15 %, tuulen vaikutus puolet. `AMMO` =
  nuolet → sulkanuolet → tulinuolet.

### v0.84 (tuuli – päivityslista kohta 4)
- `WIND` + `updateWind` (environment.js), tila `flags.wind` (tallentuu). Suunta pysyy 2–6 min, kääntyy 40–90 s:ssa (smoothstep) uuteen
  arvottuun suuntaan enintään ±120°, lisäksi hidas ±8° huojunta. Nopeus säätyypin mukaan `WIND_RANGE` (selkeä 1–4, sumu 1–3, pilvi/tihku/
  lumi 3–7, sade 4–8, tuulinen 8–13, myrsky 15–22 m/s), tavoite vaihtuu 20–45 s välein, hidas siirtymä + puuskat (enint. +25 %).
- **Vaikutukset:** pilvet (maailma: `u.ox/u.oz` tuulen suuntaan, nopeus 1,2 + 0,55·m/s; kartan pilvikerrokset kertyvällä siirtymällä `mapCO`),
  puut (`treeMat`: vanha edestakainen heilunta säilyy + kallistus tuulen suuntaan `uWDir`/`uLean` = m/s / 22, instanssin kierto huomioitu,
  sykkivä puuska; pois kun "Puiden heilunta" pois), sade viistää ja ajautuu, savu ja kipinät ajautuvat (savu 0,32, kipinä 0,18 × m/s),
  nuolet (kiihtyvyys 0,08 × m/s → 13 m/s ≈ 0,5 m sivuttain 30 m:llä; ei luolastossa).
- **Näyttö:** isolla kartalla kompassi (P/I/E/L, nuoli = puhallussuunta) ja "Tuuli: lounaasta 6 m/s"; minikartan reunalla tuulinuoli sillä
  puolella, josta tuuli tulee, + m/s. Kohdan 15 ruoho käyttää samaa `SWAY.uWDir/uLean`-tuulta.

### v0.83 (vihollisten spawnaus – päivityslista kohta 2)
- `spawner`/`spawnSpot` (ai.js). **Yö:** 90 % syntyy 55–85 m päähän (ennen 38–68) ja vaeltaa omia reittejään; 10 % 20–30 m päähän,
  mieluiten puun tai kiven taakse pelaajasta katsottuna (`nodesNear`, 8 yritystä), muuten avoimelle. Lähelle syntyvä susi tulee yksin.
  **Aarnimetsä** vetää: yöllä muiden biomien ehdokas hyväksytään 55 %:lla, aarnimetsän aina; pelaajan ollessa aarnimetsässä tahti 1,5 s
  (muuten 2,5 s) ja raja 18 (muuten 14).
- **Päivä:** eläimet kuten ennen. Vihollisia enintään 2 (aarnimetsässä 3) ja vain `DAY_FOE_BIOMES`: korpimetsä, suo, kangas, nummi, aarni
  (metsä/suo/aarni: vihollisten osuus ×1,4). Muualla päivällä vain eläimiä.
- **Aarnimetsässä** viholliset (ja vihaiset neutraalit) liikkuvat 20 % nopeammin (`moveMob`, biomi tarkistetaan 1 s välein `m.aarni`).
  Aarnimetsään astuessa ilmoitus "Hirviöt ovat vihaisia Aarnimetsässä – ne liikkuvat täällä nopeammin." (enintään kerran minuutissa).
- Testattu 400 spawnauskierroksella: yö med. 68–71 m, lähelle 8–10 % (min 19 m); päivä max 2 vihollista (aarnin lähellä 3).
- Raunioiden/portaalien/arkkukivien 50 m suoja ja aloitusalueen päiväsuoja ennallaan.

### v0.82 (uudet biomit ja alueet – päivityslista kohta 3)
- **Uudet biomit** vievät tilaa metsältä ja niityltä (`biomeAt`, world.js); vuori, nummi, aarnimetsä ja ranta ennallaan, aloitusniitty pysyy:
  - `suo` **Upposuo**: matalat alueet (h < 4,2) kosteuskohinalla `fbm(.025)` > 0,6, järvien ympärillä kosteus +0,18. Tumma maa ja märät
    painanteet, lätäköt (`lampare`, deco), kelot, pienet koivut, puolukat. **Liike 15 % hitaampaa** (`P.zone==='suo'`, player.js).
  - `kangas` **Jäkäläkangas**: kuivat harjut h > 6 ja `fbm(.022)` > 0,58. Vaalea jäkälä, uusi puu **mänty** (`manty`: puu 4–6, pihka 0–2,
    korkeus 8,4 m), kivet, piikivi, vähän kuparia.
  - `koivu` **Koivulehto**: rengas aloitusniityn ympärillä (40–52 m) ja niityn/metsän raja (`meadowT`…+0,07). Koivuja, marjoja, sieniä.
  - `tunturi` **Tunturikangas**: rinne `mtnH−6`…`mtnH` (puurajan yläpuoli): kääpiökoivut, varvikko, marjat, kivet.
  - `rakka` **Rakka**: louhikko samassa vyöhykkeessä (`ridge(.035)` > 0,62): paljon lohkareita ja kuparisuonia.
- **Nimet** (`BIOMES`, world.js): Rantaniitty, Koivulehto, Korpimetsä, Upposuo, Jäkäläkangas, Aarnimetsä, Kalmanummi, Tunturikangas, Rakka,
  Kivivuori, Routahuiput (`zoneAt`: vuori yli 33 m), Hietaranta, Meri. Jokaisella: lämpö, vaarallisuus, eläimet, viholliset, resurssit, huomio.
- **Näkyvyys:** biomin nimi minikartan alla kellorivillä; repussa laatikko "Alue: …" (`renderBiome`) + löydetyt alueet x / 13.
- **Uusi alue löydetty** (`updateZone` 0,4 s välein, `flags.bio`): iso keskiteksti (häivytys sisään 1 s, näkyy 3 s, ulos 1,5 s), hiljainen
  kolmisointu `sfx('discover')` ja lokiviesti. Vain ensimmäisellä kerralla. Uusi peli: `bio={meadow:1}`; latauksessa nykyinen alue merkitään
  hiljaa (`zoneQuiet`).
- `SPAWN`-taulut uusille biomeille (kohta 2 säätää päivä/yö-jakauman).
- **Tallennus v9:** solmujen numerointi muuttui → v < 9 kaadettujen/siirrettyjen puiden lista ohitetaan (puut ovat taas pystyssä).
- Jakauma kartalla 0 (maa-alasta): korpimetsä 28 %, aarni 11 %, huiput 11 %, nummi 10 %, kivivuori 8 %, niitty 7 %, koivulehto 6 %,
  kangas 6 %, ranta 5 %, suo 5 %, tunturi 2 %, rakka 1,5 %.

### v0.81 (eläinmallien liitokset – päivityslista kohta 1)
- `makeAnimal`: jalan nivel on rungon sisällä (`by − 0,1·s`, ennen `lh` eli rungon alapuolella → peuralla näkyvä rako). Jokaisen jalan
  yläpäässä lihaksikas lapa (edessä) / reisi (takana, `rump`-väri), joka sulautuu kylkeen. Polven korkeus maasta ennallaan (`lh/2`).
- Kaula lasketaan rinnasta pään tyveen (pituus ja kulma `atan2`), ennen kiinteä 0,42 m putki → peuran pää leijui 0,2 m irti.
- Tarkastettu kuvin: peura, villikarju, harmaasusi, routasusi (edestä, sivulta, takaa, kävelyasento).

### v0.80 (kuoleman ruutu)
- Kuollessa kaikki valikot sulkeutuvat heti ja uudelleen ruudun ilmestyessä (`closeAllForDeath`, player.js): reppu, rakennus, kartta,
  arkku, edistyminen, loki, DEV, päävalikko, asetukset ja näppäinikkuna. Vain "Kaaduit"-ruutu jää. Kuolinanimaation aikana (1,4 s)
  näppäimet eivät avaa valikoita eikä Esc avaa päävalikkoa (`P.dead`-ehto `togglePanel`/`pauseGame`/keydown).
- Kuoleman ruudulla **Enter** (tai Numpad Enter) herättää hiiren lisäksi; hiiren kursori näkyy ruudulla (`#deadS{cursor:default}`).
  `respawn()` toimii vain tilassa `dead` (ei tuplaherätystä).

### v0.79 (rakennusnäppäimet vain rakennettaessa)
- R, Shift+R, G, H, Q ja Z toimivat ja antavat ilmoituksen vain rakennustilassa (`isBuilding()`, building.js: vasara kädessä **ja**
  rakennusosa valittuna). Ennen Shift+R ilmoitti "Asento vaihtuu…" ilman vasaraakin, ja G/H ilmoittivat pelkällä vasaralla.

### v0.78 (DEV: kartan paljastus)
- DEV-valikkoon (Ä) rivi **Kartta → Paljasta kartta ja kohteet** (`devRevealMap`, ui.js): `explored` täyteen (pilviverho pois koko kartalta,
  tallentuu) ja kaikki nimetyt `LOC`-paikat `flags.disc`:iin (rauniot, portaalit, kummut, riimukivet, arvotut paikat). `resetFog` tyhjentää
  sumukankaan suoraan, kun kaikki on paljastettu (ei 90 000 gradienttia latauksessa).

### v0.77 (DEV: V-nopeus ja Ä-valikko)
- DEV-tilan 10× nopeus näppäimeen **V** (ennen vasen Alt). **Ä** (`Quote`) avaa DEV-valikon (`#devP`, `renderDev`): sää (kaikki `WEATHERS`,
  pysyy 10 min), kellonaika (liukusäädin + aamu/päivä/ilta/yö), terveys ja kylläisyys liukusäätimillä; E/Ä/✕ sulkee. DEV-merkki ruudun yläreunaan.

### v0.76 (ammusten järjestys)
- Ammukset listassa `AMMO` heikoimmasta parhaaseen (piikivinuolet → tulinuolet → tulevat). Ilman valintaa jousi käyttää heikointa jota on;
  valittu ammus ensin ja sen loputtua taas heikoimmasta. Valitun napin uusi painallus palauttaa automaattiseen. Ominaisuuslistassa "Ammus".

### v0.75 (pomot, alttari, reppu ja arkut, tuli, tulinuolet)
- **Isot pomot eivät parane:** Kalmanvartija (ennen +30 hp/s pelaajan kuoltua) ja ulottuvuuksien pomot (+40 hp/s) eivät enää palauta
  terveyttä. Ulottuvuuspomon terveys säilyy poistuttaessa (`flags.rbHp[ulottuvuus]`), Kalmanvartijan maahan vajotessa (`flags.bossHp`).
- **Alttarin hiidenkivet eivät katoa:** kun vartija vajoaa takaisin (pelaaja > 90 m tai luolastossa), kivet jäävät alttarille pysyvästi
  (`flags.altarSt`) eikä niitä pudoteta maahan katoaviksi esineiksi; uusi herätys alttarilta ilman uusia kiviä, terveys säilyy.
- **Valikot:** E sulkee avoimen valikon. Repussa: napsautus valitsee, toinen napsautus toiseen paikkaan siirtää/vaihtaa paikat (sama esine
  pinoutuu), saman paikan napsautus poistaa valinnan; hiiren oikea puolittaa pinon tyhjään paikkaan; kaksoisnapsautus käyttää;
  **Q** pudottaa valitusta yhden, **Shift+Q** koko pinon. Arkut ja löydetyt säiliöt: napsautus valitsee esineen (arkusta tai repusta) ja
  seuraava napsautus siirtää/vaihtaa sen valittuun paikkaan; **Shift+napsautus** siirtää heti toiselle puolelle; oikea puolittaa repussa.
- **Tuli (uusi fysiikka):** kädessä palava soihtu sytyttää lyödyn mobin/eläimen; palaa satunnaisesti 5–10 s, 5 hp/s (palkki näkyy,
  liekit ja kipinät mobissa). Sade (> 0,5) tai vesi (mobi y < −0,9) sammuttaa heti. Palava eläin pakenee (lyöty-tila).
- **Tulinuolet** (uusi esine, `tulinuolet`): puu 2 + piikivi 2 + pihka 1 → 15 (työpenkki, taso 3, kuten piikivinuolet + pihka).
  Liekki kärjessä, osuma sytyttää kohteen samoin kuin soihtu. Ammuksen valinta repusta: "Käytä ammuksena" (`flags.ammo`);
  jos valittua ei ole, käytetään toista.
- **DEV-nopeus** vasempaan Altiin (ennen Ö); Alt ei avaa selaimen valikkoa.

### v0.74 (⚠ väliaikainen kehitystila)
- `const DEV=true` (core.js) – käyttäjän pyynnöstä testailua varten: kestävyys ei kulu, korkein taso (kaikki ohjeet auki), ei painorajaa
  (ei ylikuormitusta), **Ö pohjassa (näppäinkoodi `Semicolon`) liike 10× nopeampi**, vasemmassa alakulmassa merkki "DEV-tila".
  Kytkennät: player.js (`over`, kestävyys, nopeus), environment.js (ylikuormitusmerkki), progress.js (`lvlInfo`), ui.js (merkki).
  **Poista ennen julkaisua: `DEV=false`** (muu peli ennallaan, tallennusmuoto ei muutu).

### v0.73 (mobien terveyspalkit)
- **Palkki ja pääkallot korkeammalle:** palkin korkeus lasketaan mallin todellisesta korkeudesta (`m.barH`, rajauslaatikko kerran mobia kohden)
  + 0,45 m – ennen `r × 2,8 + 0,8`, joka osui uusien mallien päähän/sarviin. Pääkallot nimen yläpuolelle (ennen palkin alla).
- **Näkyy vasta tarkasti katsottaessa:** katseen ja mobin keskikohdan välinen kulma ≤ ~11° (vahvat ☠≥3: ~9°), ennen 22° / 18°.
  Etäisyysrajat ennallaan (12 m, vahvat 70 m); lyöty mobi näkyy 10 s katseesta riippumatta.

### v0.72 (vasara vyölle, luonnolliset lyönnit ilman läpimenoa, napavektori-IK, erä 45: eläimet)
- **Vasara vyöllä takana:** kun vasara ei ole kädessä, se roikkuu vyön yläreunasta selän puolella (ripustus y 0,94, z −0,24): pää vyön päällä
  selän suuntaisesti (90° pystyakselin ympäri aiemmasta, jolloin pää sojotti taaksepäin), varsi alas. Heiluu askelten tahdissa ja kallistuu
  juostessa taaksepäin (`backHang`, aina ≥ 0 eli ei vartalon sisään). Muu työkalu/ase näkyy selässä kuten ennen.
- **Lyöntianimaatio uusittu:** avainasennot [olka rx, rz, kyynärpää] nosto W → osuma H → loppuliike E → lepo (`swingPose`). Vuorotellen
  pään yli → alas oikealle eteen ja oikean olan yli → alas vartalon eteen; kahden käden nosto pään yläpuolella edessä (ei pään takana).
  Loppuliike nopeutui (palautus 6 → 13 /s) ja laskeutuu vartalon eteen.
- **Kädet eivät mene vartalon läpi:** `armClear` tarkistaa kämmenen ja kyynärpään vartaloellipsiä vasten (x 0,27, z 0,16, korkeus 0,78–1,55 m)
  ja nostaa olkaa eteen (vaakatasossa ulospäin) kunnes ulkona. Mittaus: kirves ja nuija molempiin suuntiin, 0 läpimenoa (ennen kirveen
  loppuliikkeessä molemmat kädet vatsan sisällä).
- **IK napavektorilla (`armIK(arm,elbow,T,w,pole)`):** kyynärpää osoittaa luonnolliseen suuntaan (oletus alas-ulos), olan asento kantavektoreista
  (kvaternio). Vanha rx/rz-IK jätti vasemman kyynärpään rinnan sisään kirveen nostossa. Vedossa oikea kyynärpää taakse-ulos.
- **Eläimet (erä 45, `makeAnimal`):** peura, villikarju, harmaasusi ja routasusi pelaajahahmon tyyliin – rinta/keskivartalo/lantio, vaaleampi
  vatsa, kaula, kallo ja kuono, silmät, korvat, nivelletyt jalat (reisi, polvi, sääri, kavio/tassu), häntä. Peura: haarautuvat sarvet, valkoinen
  peili ja häntä, täplät. Karju: harjas, kärsälevy ja torahampaat. Susi: turkkikaulus, tuuhea häntä tummalla kärjellä. Routasusi: jääpiikit
  selässä. Animaatio: polvet koukistuvat askeleissa, häntä heiluu (jahdissa nopeammin).

### v0.71 (erä 44: pomot ja humanoidit yksityiskohtaisiksi; äänet ja koivu)
- **Uusi `makeHumanoid` (models.js):** kaksijalkainen pelaajahahmon tyyliin – pyöristetyt raajat, nivelpallot, kyynärpää- ja polvinivel,
  kämmenet peukaloineen, jalkaterät, kaula ja pallopää; luurankotila (`skel`: selkäranka, kaarevat kylkiluut, lantio) ja kivitila (`flat`).
  Rajapinta kuten `makeBiped`, joten tekoälyn animaatiot toimivat; `torso`/`head` ovat skaalaamattomia ryhmiä. Animaatio (`animMob`):
  polvi koukistuu taakse jäävässä jalassa, kyynärpäät koukussa, viitat ja rievut heiluvat (`f.sway`).
- **Kalmanvartija** (`figGolem(3.1,true)`): lohkareista koottu kivijätti – rinta- ja selkälohkareet, hehkuvat riimuhalkeamat rinnassa ja
  käsivarsissa, sammaloituneet olkalohkareet piikkeineen, kivinyrkit, polvilohkareet, kivilaattalannevaate, kulmakaari ja hehkuva suu,
  7-piikkinen kivikruunu, selässä riimumonoliitti. **Kivivartija** samalla rungolla (s 1,3, ilman monoliittia).
- **Kalmon ylimys** (`figYlimys`): luurankoaatelinen – kallo silmäkuopissa liekkisilmät, nenäaukko, leuka ja hampaat, pronssikruunu
  punaisin kivin, ruostunut olkapanssari, tabardi, vyö kallosoljella, heiluva repaleinen viitta, pitkä ruostunut miekka.
- **Kalmo** (`figKalmo`): luurankosoturi, syaanit silmät, riepulannevaate (heiluu), olkalevy, ruostunut kirves.
- **Sammalhiisi** (`figHiisi`): iso pää, suippokorvat, kyömynenä, suu kulmahampain, oksasarvet, sammaltupsut, lehtihame, piikkinuija.
- **Ulottuvuuksien pomot** (Jäätär, Kalmaherra, Aarnihirviö): runko vaihdettu `makeHumanoid`:iin (nivelet, pyöreät raajat); omat
  yksityiskohdat ennallaan. Täysi uudelleensuunnittelu ideajonossa (erä 44b).
- Mobin materiaalikloonit jaetaan saman mobin sisällä (yksityiskohtaisissa malleissa 8–13 materiaalia 50–96 osalle).
- **Äänet uudelleen (käyttäjän toive):** puun ja tukin jokainen isku on sama kirveenisku (sävel vaihtelee ±3,5 %). Pystypuun viimeinen isku
  lähes sama, vain hiljainen ritinä; kaatunut puu tömähtää tummasti (`thud`). Tukin viimeinen isku = sama isku + pehmeä tumma tömähdys.
  Kiven viimeinen isku = sama hakkuääni + pehmeä tumma murtuminen.
- **Koivun mustat täplät heiluvat rungon mukana:** runko jaettu 12 korkeussegmenttiin (huojunta ei ole lineaarinen korkeuden suhteen).

### v0.70 (korjauksia: varjojen jähmettyminen, hiipiminen, korjausmuistio, ominaisuustarkistus)
- **Varjot jähmettyivät:** automaattisen laadun tasolla 3 (tai tulien varjot pois) pistevalojen varjokarttoja ei enää päivitetty, mutta
  valot heittivät varjoa vanhasta kartasta. Nyt `setQuality` kytkee `castShadow`:n samalla pois/päälle. Kaukana tulesta varjojen
  päivitysväli 60/120 → 12/30 kehystä (pimeä/päivä).
- **Eläimet säikähtivät kyykyssä:** kyykyssä paikallaan ei huomata; hiipiessä 1,5 m (eläin katsoo kohti) tai 0,9 m (selin). Ennen 3,5 m ja
  alle 4 m aina, jolloin hiiviskelyisku ei koskaan ylettynyt. Kävely 7 m / juoksu 16 m ennallaan.
- **Uusi `docs/KORJAUKSET.md`:** toistuvat viat, syyt ja korjaukset koodinpätkineen + pakolliset tarkistukset.
- **Uusi `tools/tarkistus.mjs`:** 39 ominaisuuden regressiotesti (G-tilat, 3D-hila, H, reunakohdistus, kartat, ulottuvuudet, tehtävät,
  asetukset, puut, myrsky, soihtu, kartta, päivitykset, ehdotukset, haku, IK, jousi, Kalmanpesä, löydetyt arkut, varjot, hiipiminen…).

### v0.69 (korjauksia: 3D-hila, löydetyt arkut, haku, tukin ääni, ominaisuustarkistus)
- **3D-ruudukko näkyväksi:** 3D-tila oli koodissa, mutta pystyruudukko oli niin haalea (opasiteetti 0,28, yksi kameraa kohti käännetty
  taso), ettei sitä erottanut. Nyt `gridV` on oikea 3D-hila: pystytolpat jokaisessa ruudukon kulmassa (7 × 7, kaksi kerrosta korkeita) ja
  vaakaruudukot puolen kerroksen välein (WH/2) kahteen kerrokseen, opasiteetti 0,5. Seuraavan kerroksen ruudukko 0,3 → 0,45.
- **Löydetyt arkut, kirstut ja tynnyrit avautuvat arkkuikkunaan** kuten omat arkut (ulottuvuuksien arkut, hautakirstut ja tynnyrit,
  Hautakummun kirstut ja tynnyrit, raunioiden aarrearkut, löytöpaikkojen arkut). Sisältö luodaan ensimmäisellä avauksella saalistaulukosta
  ja tallentuu `flags.fc[avain]`; esineitä voi ottaa ja jättää. Vanhassa tallennuksessa jo avattu paikka on tyhjä (saalis annettiin jo).
  Ensimmäisen avauksen vaikutukset (XP, vartijaviesti, kannen avaus, tehtäväliput) säilyvät. Ei laajennusnappia löydetyissä.
- **Haku:** `body{user-select:none}` periytyi hakukenttään, mikä estää kirjoittamisen esim. Safarissa → hakukentille `user-select:text`.
- **Tukin viimeinen isku** tummemmaksi: matala halkeava rusahdus, puun repeämisen jyrinä ja raskas tömähdys (ei kirkasta napsahdusta).
  Pystypuun viimeiseen iskuun lisätty selkeämpi ritinä.
- **Korjaus:** tynnyrin kannen tila luettiin latauksessa ennen kuin `flags` oli olemassa (kaatoi skriptin) → luetaan laiskasti.
- **Ominaisuustarkistus:** kaikki muistioissa mainitut tunnisteet tarkistettu koodia vasten (puuttuvat olivat vain vanhoja nimiä:
  `palkki_iso` → `palkki2`, `gripWithLeft` → `armIK`, `KEYLIST` → `ACTIONS`/`BIND`, ukkosen ääni poistettu tarkoituksella v0.36) ja
  34 keskeistä ominaisuutta testattu pelissä (G-tilat, H-tila, reunakohdistus, kartat, ulottuvuudet, tehtävät, asetukset, puut, myrskyt,
  soihtu, kartta, päivitykset, ehdotukset, haku, IK, Kalmanpesä, arkut ym.): kaikki toiminnassa.

### v0.68 (erä 43: kirveen ote, jousi, Kalmanpesän murskaus, äänet)
- **Kahden nivelen IK (`armIK`, player.js):** käsivarsi (olka rx/rz) ja kyynärpää lasketaan niin, että kämmen osuu annettuun pisteeseen
  (olkavarsi 0,35 m, kyynärvarsi 0,33 m; ratkaisu ja kaavat funktion kommentissa). Korvaa vanhan `gripAngles`-suuntauksen, joka ei
  huomioinut kyynärpään taivutusta.
- **Kirveen ote:** kahden käden iskussa vasen käsi tarttuu varteen kohtaan, joka on lähimpänä vasenta olkaa (0,11–0,42 m oikeasta kädestä,
  kädet eivät mene päällekkäin). Jos oikea käsi on yli 0,58 m vasemmasta olasta, se tuodaan keskilinjaa kohti (IK), jotta ote ylettyy.
  Kahden käden nosto matalampi ja kapeampi (−2,25 / sivukulma × 0,55). Testi: käsi on 0,01–0,02 m varresta koko iskun ajan.
  Ote pehmenee sisään/ulos (`P.gripK`).
- **Jousi oikein päin:** jousen malli oli käännetty 180°, joten kaari osoitti ampujaan ja jänne venyi eteenpäin. Kääntö poistettu: selkä
  eteenpäin, jänne ja nuoli vedetään ampujaa kohti. Jousi pysyy pystyssä myös kyynärpään taivutuksella. Vedossa jousikäsi suoraan eteen
  hieman sisäänpäin (rz −0,3) ja **vetokäsi IK:lla jänteelle** nuolen kannan kohdalle (leuan korkeus) (`P.drawK`).
- **Kalmanpesä tuhottavissa hakulla:** kestävyys 240 (`SPW_HP`), vahinko = louhintateho (9 + 3 × hakun taso, laatu +25 %/★);
  kivihakulla 20 iskua. Muut aseet: "Kalmanpesän voi murskata vain hakulla." Isku näyttää jäljellä olevan prosentin. Tuhottuna pesä,
  törmäys ja hehku poistuvat, tilalle rauniot (kivet ja luut), saalis 4 luunsirua + 4 kiveä (+ Kalmankammiossa 3 kuparia, Aarnihaudassa
  1 hiidenkivi), 40 XP. Tila tallentuu `flags.sd[ulottuvuus]` (ei tallennusversion muutosta: vanhoissa ei ole kenttää).
- **Äänet:** `sfx(nimi, sävel, voimakkuus)`; jokainen soitto vaihtelee sävelkorkeutta satunnaisesti ±3,5 %. Uudet äänet: `chopFinal`
  (viimeinen isku ennen rungon katkeamista, hieman kimeämpi + ritinä), `chopLog` (tukin hakkuu, ontompi), `logBreak` (tukki katkeaa),
  `thud` (kaatunut puu osuu maahan: matala jytinä, sävel puun koon mukaan, voimakkuus etäisyyden mukaan), `rockBreak` (kivi hajoaa),
  `crumble` (kivirakenne tai Kalmanpesä murtuu), `woodBreak` (puurakenne hajoaa tai puretaan).

### v0.67 (erä 42: ehdotukset ja haku)
- **Ehdotukset-välilehti** on oletuksena ensimmäinen sekä rakennusvalikossa (B) että valmistuksessa (reppu), Alkupeli toisena.
  - Valmistus (`suggestCrafts`, enintään 8): avoimet ja tunnetut ohjeet pisteytetään. Aineet valmiina +4 (työpiste puuttuu +2,5,
    muuten osuus aineista ×2); varuste jota ei vielä ole +3 tai parempi kuin paras omistettu samaa ryhmää +3, huonompi/sama −8
    (ryhmät `gearKey`: kirveet hakkuun, hakut louhinnan, aseet vahingon, haarniskat suojan, kilvet torjunnan mukaan);
    nuolet jos jousi ja alle 20 nuolta; soihtu jos ei ole; ruoka nälkäisenä. Pelin vaihe: + 0,5 × min(ohjeen taso, pelaajan taso).
    Kynnys 2,5. Jokaisessa rivissä syy keltaisella (esim. "Parempi kuin nykyinen · Aineet valmiina").
  - Rakennus (`suggestBuilds`, enintään 10): työpenkki ensin (+10), nuotio (+6), sänky (+5), perussuoja lattia/seinä/ovi/katto
    kun seiniä ja lattioita alle 12 (+4), arkku kun reppu yli 60 % täynnä (+4), sulatin kun repussa malmia (+7), ahjo kun kuparia (+6),
    kiviseinä/-lattia kun kiveä ≥ 30 ja talo pystyssä (+3); varaa rakentaa +2, puuttuvat aineet −1; muuten uusi osa jota on varaa
    rakentaa (talon jälkeen). Syy näkyy kortissa.
- **Haku:** hakukenttä kummassakin valikossa (`#buildSearch`, `#craftSearch`). Hakee kaikista välilehdistä nimen osalla, kirjainkoko
  ja tarkkeet ohitetaan (`fold`). Esc tyhjentää / poistuu kentästä. Pelin näppäimet eivät toimi kenttään kirjoitettaessa.

### v0.66 (erä 39: tavarat ja päivitykset)
- **Päivityksen esikatselu:** kaikki päivitykset (tavaran ★, reppu, arkut ja tynnyrit) avaavat ensin alle laatikon "Päivitys ★1 → ★2",
  jossa muuttuvat ominaisuudet (nyt → uusi, vihreällä) ja hinta (punainen = puuttuu). Vasta laatikon **Päivitä nyt** tekee päivityksen.
  Uusi painallus (Piilota), toisen tavaran valinta tai paneelin sulkeminen sulkee esikatselun (`upPrev`, `upPreviewHTML`, `upBtn`).
- **Ominaisuudet repussa:** tietopaneelissa tavaran nimi isolla (Uncial Antiqua 26 px) ja kaikki ominaisuudet taulukkona (`itemProps(s,q)`):
  taso, vahinko, tyyppi, kestävyys/isku, hakkuu- ja louhintateho, ulottuvuus, jousen jännitysaika ja nuolen nopeus, torjunta,
  suoja ja vahingon vähennys, soihdun palamisaika max / jäljellä / tila, ruoan arvot, polttoarvo, paino ja määrä. Sama funktio laskee
  päivityksen vertailun.
- **Käsisoihtu ★:** täysi palamisaika `torchMax(s)` = 120 s × (1 + 0,5 × (★ − 1)) → 120 / 180 / 240 s. Päivitys lisää myös jäljellä olevaa
  aikaa erotuksen verran. Seisova soihtu ennallaan.
- **Korjaus:** soihdun polttoaine ja sytytystila säilyvät arkun kautta siirrettäessä (ennen soihtu täyttyi arkussa käyttämällä).

### v0.65 (yleinen reunakohdistus kaikille osille)
- **`smartSnap` korvaa vanhan `edgeSnap`:in.** Toimii kaikille osien muodoille (seinät, palkit, pylväät, lattiat, katot, kalusteet,
  työpisteet) ja kaikissa G-tiloissa paitsi *vapaa*. Kohteen muoto = sen törmäyslaatikoiden yhteinen rajaus (`unionBox(worldBoxes)`).
- **Alueet osumakohdan mukaan:**
  - **Yläosa** (yläpinta tai sivun ylin kaista: 30 % korkeudesta, 0,12–0,5 m) → uusi osa kohteen **päälle**. Suunta keskelle, reunalle
    tai kulmaan: yläpinnalla osumakohdasta (keskialue 35 %), sivulta katsottuna katsottu sivu + vasen/oikea yläkulma (sivun uloimmat 30 %).
    Näin jokaisessa osassa on 4 sivua ja ylhäältä katsottuna 8 suuntaa (sivut + kulmat) + keskikohta.
  - **Pääty** (pitkän ohuen osan, kuten seinän tai palkin, päätypinta tai sivun uloin 15 %) → seinä/palkki jatkuu samaan linjaan.
  - **Sivun keski** (vain reuna-tilassa) → viereen ulospäin; ohut osa (seinä, pylväs) asettuu ison kohteen reunalinjalle.
- **Sijoitus akseleittain kokoeron mukaan** (ohut = alle 0,4 m, `THIN`): molemmat ohuita → keskitetty (pylväs pylvään päälle);
  ohut kohde isomman osan alla → kohteen keskilinja osan reunalle (lattia seinän/pylvään päälle katsotulle puolelle); ohut osa
  isomman päällä → kohteen reunalle/kulmaan (pylväs palkin päähän, seinä lattian reunalle); samankokoiset → reunat tasan
  (puoliseinä seinän päällä katsottuun yläkulmaan).
- **Ruudukkoviivasääntö:** lattia/katto ohuen kohteen päällä seuraa lähimmän lattian ruudukkoa (`gridOrigin`). Ruudukon kulmassa
  oleva pylväs → lattia katsottuun kulmaruutuun; ruudukkoviivalla (kahden ruudun välissä) oleva pylväs → katsottu ruutu.
- **Kierto:** seinä/palkki seinän päälle tai jatkoksi samaan suuntaan; muuten katsotun reunan suuntaisesti (pylvään +x-sivun yläreuna →
  palkki z-suuntaan, kulmasta katsottuna palkin pää pylvään kohdalle). Seinä lattian keskelle → lähimmälle reunalle.
- **Korkeus:** päälle = kohteen yläpinta (lattia: yläpinta tasan tuen yläpinnan kanssa); viereen = sama pohjataso (lattian kohdalla
  sen yläpinta). 3D-/pystytilassa reunakohdistuksen korkeutta ei pyöristetä, Q/Z-nosto toimii yhä.
- **Ruudukkotiloissa:** lattioiden yläpinta ja sivujen keskiosat jätetään tavalliselle ruudukolle; ei-ohuilla kohteilla (työpenkki)
  lattia pysyy ruudussa. Ohitetaan: vinossa (45°) olevat kohteet, katot, portaat ja tikkaat.

### Dokumentaatio (v0.64 jälkeen)
- Uusi `docs/OMINAISUUDET.md`: kaikki pelin järjestelmät, säännöt ja fysiikan arvot yhdessä viiteoppaassa (maailma, liikkuminen,
  selviytyminen, keräily ja puut, valmistus, rakentaminen ja kohdistus, tuli ja valo, taistelu, viholliset, pomot, luolastot,
  tarina, sää, kartta, asetukset, tallennus). "Peli lyhyesti" ja tasapainoarvot päivitetty.

### v0.64 (rakennuskohdistus, ähky, auringon hehku, koivun oksat näkyvämmiksi)
- **G-kohdistustilat:** ruudukko (G = 2,5 m), **1 m** (kaikki osat 1 m välein, 1 m ruudukko näkyy), puoli, **3D** (vaakaruudukko +
  pystyruudukko: pystyviivat G välein, vaakaviivat WH/2 välein kameraa kohti käännettynä, korkeus kohdistuu WH/4 portain, Q/Z
  nostaa/laskee, seuraava kerros näkyy), vapaa, reuna. **Korjaus:** ruudukkotiloissa myös "vapaat" osat (pylväät, huonekalut,
  soihdut, työpisteet) kohdistuvat: pylväät ruudun kulmiin, muut ruudun keskelle (ennen ne ohittivat ruudukon 0,25 m tarkkuudella).
- **Reunajatko seinän yläkulmasta:** kun katse osuu seinän ylimpään 0,5 m:iin (ei yläpintaan), haamu ehdottaa uutta seinää
  päälle jatkoksi (korkeus = seinän korkeus, myös puoli- ja neljäsosaseinät `dim`); muualta sivulle jatkoksi kuten ennen.
- **Ähky (vatsakipu) vasta kun palkki on jo täynnä:** syöminen ei enää estynyt 96 %:ssa eikä palkin täyttyminen aiheuta ähkyä;
  ähky tulee vain jos kylläisyys on jo ≥ 99 ja syö silti (ei raakaa eikä tehoruokaa). Kesto 75 → 52 s (−30 %).
- **Auringon hehku pyöreäksi:** neliö auringon ympärillä johtui auringonsäteiden pitkistä tasoista, joiden päät näkyivät neliönä
  aurinkoon katsottaessa. Säteet häivytetään nyt kun katse osoittaa aurinkoa kohti, ja auringon ympärillä on pehmeä pyöreä
  hehku (`sunGlow`, additiivinen säteittäinen sprite; himmenee pilvissä ja synkässä säässä, voimistuu matalalla auringolla).
- **Koivun oksat** pidemmiksi, paksummiksi ja matalammalle (7 oksaa), jotta ne erottuvat latvuksen alta.

### v0.63 (erä 35: myrskyn puut, koivun oksat, nopeudet, soihtu, salama, leijuvat luut)
- **Myrsky kaataa puita noin 5 s välein** (4–6 s, `stormT`) satunnaisesta puusta 9–100 m päässä pelaajasta (ei aarnipuita eikä
  rakennusalueelta, `nearBase`). Kaatuminen on normaali `fallTree` (murskaa alle jäävän, oksat, tukit/tavarat, tärähdys lähellä).
  Viesti "Myrsky kaataa puita!" enintään 30 s välein ja vain jos puu kaatui alle 40 m päässä. Aiemmin vain 12 % salamoista kaatoi
  puun alle 40 m säteellä.
- **Koivun oksat näkyvät pystypuussa:** `TREE_BR.koivu` (6 oksaa: korkeus, kulma, pituus, kallistus) + `brParts()` rakentaa ne koivun
  geometriaan (resources.js). Kaatuva koivu käyttää runkoa ilman oksia (`NGEO_FALL.koivu`) ja samat oksat erillisinä, jotka irtoavat
  kaatuessa (sama asettelu, koko ja puun kierto `n.rot`). Kaatuva puu kääntyy nyt samaan asentoon kuin pystypuu (`m.rotation.y=n.rot`).
- **Vihollisten ja eläinten nopeus −15 %** (`MOB_SPD=.85` `moveMob`issa, koskee kaikkea liikettä myös pomojen rynnäkköä).
- **Käsisoihtu palaa 2× kauemmin:** `TORCH_T` 60 → 120 s, pihka lisää 60 s (ennen 30 s).
- **Salaman välähdys kevyemmäksi:** `flash` 1 → 0,45 ja häipyy nopeammin; taivaan, auringon, hemi- ja ympäristövalon lisäys pienempi.
- **Leijuvat kallot korjattu:** Hautakummun portin kalloja pinottiin korkeutta kasvattaen (k·0,13 m), vaikka paikat arvottiin eri
  kohtiin → leijuivat. Nyt jokainen kallo on maassa omassa kohdassaan (`terrainH`).

### v0.62 (korjaus: haamupuut latauksen jälkeen)
- **Uudelleen kasvaneen puun läpi pystyi kävelemään eikä sitä voinut hakata.** Syy: uusiutuva puu siirtyy enintään 5 m alkuperäisestä
  paikastaan; tallennus muistaa siirron (`moved`), mutta latauksessa `moveNode` siirsi vain törmäyksen, hakkuukohteen ja korkeuden,
  ei puun kuvaa (InstancedMesh-matriisi jäi alkuperäiseen paikkaan). Näkyvä puu oli siis haamu ja oikea puu näkymätön 2–5 m päässä.
  Nyt `moveNode` päivittää myös kuvan (`setNodeMatrix`), kun puu on elossa. Testattu: kuva = puun paikka latauksen jälkeen.

### v0.61 (kartan merkit vain paljastetulla alueella)
- Löydetyn paikan merkki (◆ + nimi) näkyy kartalla ja minikartalla vain, jos sen kohta on paljastettu (pelaaja on käynyt ~12 m
  säteellä, `isExplored`, ui.js). Riimukivi tai tavoite voi edelleen kertoa paikan (`flags.disc`), jolloin suunta ja etäisyys näkyvät
  tehtävässä, mutta merkki pysyy pilviverhon takana, kunnes alue on tutkittu.

### v0.60 (puun kaatuminen ja minikartan zoom)
- **Oksat irtoavat jo kaatumisen aikana:** jokaisella oksalla oma irtoamishetki 30–90 % kaatumisesta (`b.userData.det`), loput maahan
  osuessa. Irronnut oksa saa alkunopeuden kaatumissuuntaan, pyörähtää ilmassa, jää maahan ja vajoaa (`dropBranch(b,ivx,ivz)`).
  Kuusessa 5 neulasoksaa (kartiot), **koivussa 6 tummaa oksaa lehvästöineen** (`BRANCH_C.koivu`, aiemmin valkoiset ohuet oksat
  eivät erottuneet), aarnipuussa 7 isoa.
- **Pieni puu (koko < `SMALL_TREE` 0,8) muuttuu suoraan tavaroiksi** maahan osuessaan: puu (`drops`, vähintään 1) + pihka ym.
  kaatumislinjalle, ei tukkeja; puusäleitä pöllähtää. Isommat puut jättävät tukit kuten ennen.
- **Minikartan zoom:** koodissa ei löytynyt vikaa (N vaihtaa 60 → 35 → 110 m testissä). Varmuudeksi: zoomitaso ja näppäin näkyvät
  aina minikartan alareunassa, minikarttaa voi napsauttaa (kun hiiri on vapaana) ja näppäin toimii myös paneelien ollessa auki.

### v0.59 (puiden uusiutuminen yöllä)
- **Kaadetut puut kasvavat takaisin vain kerran yössä ja vain pelaajan 100 m säteellä** (`nightRegrow`, `REGROW_R`, resources.js).
  Yritys tehdään yön alkaessa (`isNight`, tarkistus 1 s välein, ei luolastossa) tai nukkuessa (`regrowForest`); jos jo tehty samana
  yönä, ei uutta yritystä. Yön tunnus `nightId()` (ilta = kuluva päivä, aamuyö = edellinen), viimeisin yritys `flags.rgN` (tallentuu).
  Rakennusalue (`nearBase`) ja löytöpaikat torjuvat edelleen. Päivällä `respawnNodes` ei enää uusi puita (kivet ym. ennallaan),
  marjat ja kasvit uusiutuvat nukkuessa kuten ennen.

### v0.58 (erä 34: grafiikka- ja varjoasetukset, soihdun varjokorjaus, rakennusalueet, karsinta, kartan pilvet)
- **Oletustaso = nykyinen grafiikka** (`SET_DEF`). Kaikki valinnat merkitään: oletusarvo näkyy vaaleana (`select.isdef`, `option.def`
  "· oletus") ja rivin otsikossa on merkki "OLETUS" (`.defTag`). Jokaisella asetussivulla on "Palauta sivun oletusasetukset"
  (`SET_PAGES`, `resetPage`, vahvistus).
- **Grafiikka-sivu:** alussa **3D-resoluutio** (`res`: Terävä = näytön tarkkuus ≤2, Normaali = oletus min(dpr,1,5), 85/70/55/40 %;
  `renderer.setPixelRatio`, käyttöliittymä pysyy terävänä), automaattinen laatu, piirtoetäisyys (uusi 60 m), yksityiskohdat,
  rakennusten yksityiskohdat, hiukkaset, **valonlähteitä yhtä aikaa** (`lights` 6/4/2), **usva ja höyry** (`mist`), **pilvet**
  (`clouds` kaikki/vähemmän/vähän/pois), **auringon valonsäteet** (`shafts`), puiden heiluminen.
- **Uusi Varjot-sivu:** varjot (hyvät/kevyet/pois), auringon varjojen tarkkuus (`sunRes` 1024/2048/4096), auringon varjojen
  etäisyys (`shDist` 35/55/80/110 m, varjokameran laatikko), päivitystiheys (`shRate` nopea/normaali/hidas: hidas = aurinko joka 3.
  kuva ja tulet ×2,5 harvemmin, nopea = tulet ×0,5), tulien ja soihtujen varjot päälle/pois (`ptShadow`), tulien varjojen
  tarkkuus (`ptRes` 256/384/768). `setQuality` käyttää näitä (automaattinen laatu puolittaa edelleen tarvittaessa).
- **Korjaus: pelaajan varjo jäi maahan seisovan soihdun luota poistuttaessa.** Syy: lähimmän tulen varjokartta päivitettiin
  tiheästi vain alle 9 m:n päässä (varjokameran kantama on 15 m), sen jälkeen vain 2–4 s välein. Nyt tiheä päivitys 17 m asti ja
  kun pelaaja poistuu alueelta, kartta päivitetään heti kerran (`shNearPrev`).
- **Puut eivät kasva rakennusalueelle:** `nearBase` = 15 m jokaisesta pelaajan rakennusosasta + työpenkin alue × 1,3 (26 m).
  Korjattu virhe: jos uusiutuvalle puulle ei löytynyt kelvollista paikkaa, se palasi alkuperäiseen paikkaansa, vaikka se oli
  rakennusalueella. Nyt `respawnNode` palauttaa false ja yrittää minuutin päästä uudelleen. Löytöpaikat: metsä väistää kaikkia
  `LOC`-paikkoja 20 m (riimukivet 4 m) ja uusiutuva puu ei siirry niitä lähemmäs (`locMin`).
- **Piirtoetäisyys oikeasti karsii:** `cullStatics` (0,5 s välein) piilottaa riimukivet, rauniot, portaalit, kummun ja löytöpaikat
  sumun takana (keskipiste + säde lasketaan kerran; InstancedMesh instanssien mukaan) ja Hautakummun sisätilan, kun pelaaja ei
  ole siellä. Puut/kivet (ruuduittain), rakennukset ja viholliset karsittiin jo; ulottuvuudet ovat omia ryhmiään.
- **Kartan pilvet pilvimäisemmiksi:** `mkMapClouds` = saumaton jaksollinen arvokohina (5 oktaavia) → pyöreät kumpupilvet pehmeillä
  reunoilla, valaistu luoteesta (vaalea yläreuna, harmaampi pohja); kaksi kerrosta eri nopeuksilla/suunnilla/mittakaavoilla ja
  pilvien varjot (`CLOUDSH`) alla. Edelleen vain kun kartta on auki.

### v0.57 (päävalikon vieritys)
- Päävalikko (`.screen`) vierii pystysuunnassa hiiren rullalla ja kosketuksella, vierityspalkki piilotettu (`scrollbar-width:none`,
  `::-webkit-scrollbar`). Asetus- ja näppäinkortit eivät enää vieri erikseen (max-height pois), vaan koko valikko vierii; sisältö
  keskitetään pystysuunnassa, kun se mahtuu (`margin-block:auto`).
- Vierityksen vihjeet (`scrollHints`, main.js): ohuet, raaputetun näköiset SVG-tikkunuolet sarakkeen vasemmassa reunuksessa;
  ylänuoli näkyy kun yläpuolella on piilossa sisältöä, alanuoli kun alapuolella on lisää. Sykkivät rauhallisesti (2,6 s,
  läpinäkyvyys 0,3–0,85, 2 px liike). Päivittyy vierityksessä, ikkunan koon muuttuessa ja kun kortteja avataan/suljetaan.

### v0.56 (erä 33: kolme uutta karttaa)
- **Uudet kartat** (`MAPS` 3 → 6, uusi peli arpoo kartan kuten ennenkin):
  - **Routasaari** (id 3): vuoristo idässä (`mtn` dx 1), matala vuoriraja `mtnH` 18 → laajat tunturirinteet, nummi ja Hautakumpu
    pohjois-luoteessa, vähän niittyjä (`meadowT` 0,24), meri lännessä ja etelässä.
  - **Aarnikorpi** (id 4): neljä isoa aarnimetsää, yksinäinen tunturi (`peak`) pohjoisessa, nummi ja kumpu koillisessa, niittyjä
    hyvin vähän (`meadowT` 0,14), aloitus etelärannalla.
  - **Nummiluodot** (id 5): iso keskijärvi, laaja nummi (`moorR` 88) pohjoisessa, tunturi kaakossa, paljon niittyjä (`meadowT` 0,46).
- **Biomiparametrit kartoittain** (`biomeAt`, valinnaiset): `moorR` (68), `mtnH` (23), `meadowT` (0,33). Vanhat kartat ennallaan.
- **Suunnat lasketaan:** `dirIn(k,from)` (world.js, esim. "lounaassa") ja `dirText` (story.js). Rannan riimukivi 2 ja 3, tavoitteet
  "Hae kolme hiidenkiveä" / "Herätä Kalmanvartija" ja tehtävä "Löydä Hautakumpu" kertovat suunnan oikein jokaisella kartalla
  (GOALS/QUESTS `get d()`). Riimukivi A puhuu tuntureista eikä pohjoisesta. Sääntö "Hautakumpu aina lounaassa" poistettu.
- Routaportin (pref mountain) sijoittelu: tunturissa sallitaan jyrkempi rinne (≤10 m / 16 m, tasoitetaan) ja etäisyys kiinteisiin raunioihin/riimukiviin 30 m → portti on tunturissa kaikilla kuudella kartalla. Paikat siirtyivät myös vanhoilla kartoilla (ei vaikuta tallennuksiin, koska paikat lasketaan aina uudelleen).
- Tarkistettu jokaiselle uudelle kartalle: kaikki paikat maalla, 25 rautasuonta, kuparia, Hautakumpu toimii, ei konsolivirheitä.

### v0.55 (erä 32: ulottuvuuksien koristelu, spawneri, luolan muodot ja avainketju)
- **Avainketju korjattu** (ks. Pysyvät päätökset): Routaportti lukittu Jääavaimella (maailmasta), uusi esine **Luuavain** (Jäätär → Kalmankammio),
  Aarniavain Kalmaherralta (ei enää `drops`-listassa, vaan `REALMS.portal2.key`). Lukitun portin viesti kertoo, mistä avain löytyy, ja merkitsee
  lähteen karttaan (`hint`, `reveal`). `portalLocked` huomioi myös `flags.rs` (jo käyty). Tehtävät: 13 kpl (lisätty "Avaa Routaportti"),
  riimukivet runeA/B/D kertovat uuden järjestyksen.
- **Koristeet (`dressFloor`, InstancedMesh-rivit `instM`):** luut, kallot ja leuat lattialla (ei törmäystä), tippukivet kattoon (luola 38 %
  ruuduista, muut 14 %, Hautakumpu 12 %), luolassa tippukivet myös lattialla seinien vieressä, kiiltävät lätäköt (märkä pinta). Seinät ja
  lattiat kiiltävämpiä (roughness 0,5–0,72).
- **Seinäsoihdut telineissä:** `wallTorch()` (landmarks.js: rautalevy, varsi, rengas, vino soihtu, liekin ydin) Hautakummussa ja ulottuvuuksissa;
  avoimilla paikoilla (pomoareenan kulmat) `brazier()`-tulimalja.
- **Tynnyrit:** `buildBarrel` (puulieriö + 2 rautavannetta, kansi irtoaa), 1–2 vierekkäin seinän vieressä, 0–8 ryhmää/ulottuvuus ja 3 Hautakummussa;
  sisältö `BARREL_LOOT`, avaus `flags.rc['id:bI:K']`. Törmäys ympyränä (r 0,44), käytävään jää ≥2,2 m.
- **Spawnerihuone (Kalmanpesä):** `finishRealm` avaa 5×5 huoneen 35–72 % matkan päähän sisäänkäynnistä (≥8 ruutua pomosta). Jalusta + leijuva
  hehkuva kide; kun pelaaja on < 26 m ja kaikki sen viholliset ovat kuolleet, se nostattaa 20 s (`SPW_T`) välein 3 vihollista (`REALMS.spw`).
  Kutsutut eivät tallennu (eivät kuulu `flags.rm`:ään).
- **Luola (Aarnihauta) kivisemmäksi:** seinät epäsäännöllisinä kivimöhkäleinä (3 päällekkäin / seinäruutu, IcosahedronGeometry, sävyvaihtelu),
  katossa roikkuvia möhkäleitä, lattialla kivimurskaa; lattia epätasainen: korkeus 0 / 0,15 / 0,3 / 0,45 m (kvantisoitu `fbm`, törmäyslaatikot
  riveittäin, kaikki erot < `STEPUP`), tasainen sisäänkäynnillä, areenalla, spawnerilla ja esineiden kohdalla. Sisäänkäynnin seinä on tasainen
  laatikko, jotta paluuportti näkyy.
- **Pisarat:** `DRIPS` (tippukivien kärjet), `DROPS` (28) putoavat painovoimalla, `SPLASH` (18) roiskerenkaat; 20 m säteellä, enintään 9/s.
- **Lisää usvaa:** `MIST` 44 → 72 (nopeampi ajelehtiminen + kiemurtelu), uusi `WISP` (48 pientä kiertelevää usvahattaraa sisätiloissa),
  `STEAM` 48. Laatutaso ≥2 vähentää 60 %.
- **Suorituskyky:** jokainen ulottuvuus on oma `THREE.Group` (`R.g`), joka näkyy vain kun pelaaja on siellä.
- Huom: v0.54:n pohjat arpoutuvat nyt eri tavalla samasta siemenestä (v0.54 ei ehtinyt julkaisuun).

### v0.54 (erä 31: ulottuvuudet, löytöpaikat ja tarina)
- **Uudet tiedostot:** `js/dungeons.js` (ulottuvuudet, portaalit, generaattorit, vaiheittainen pomo, portaalisuoja) ja `js/story.js` (löytöpaikat, vartijat, lisäriimukivet, tehtävät). Molemmat latautuvat `mobs.js`:n jälkeen.
- **Löytöpaikat (`world.js` `SITE_DEFS`):** 3 portaalia (Routaportti vuorilla, Kalmankammion portti nummella, Aarnihaudan portti aarnimetsässä), 4 rauniotaloa, 3 arkkukiveä ja 6 lisäriimukiveä. Sijainnit arvotaan kartan mukaan (siemen `9001+MAP_ID*77`, sama joka kerta), maasto tasoitetaan (`flatten`, portaali/rauniot r 8–9 m) ja paikat lisätään `LOC`:iin (`kind`, `name`, portaaleilla `ax` = aukon suunta). Metsä/kivet väistävät niitä 20 m (resources `clear`), spawneri 50 m (`nearSite`).
- **Ulottuvuudet (`REALMS`):** Routaluola (sokkelo 31×31, jäävartija **Jäätär**), Kalmankammio (huoneet 43×35, **Kalmaherra**), Aarnihauta (luola 47×47, **Aarnihirviö**). Sisätila rakennetaan laiskasti vasta ensimmäisellä käynnillä (`ensureRealm`), pohja arvotaan siemenestä `flags.rs[id]` (tallennetaan → sama pohja aina; vanhoissa tallennuksissa arvonta tapahtuu ensimmäisellä portaalikäynnillä). Sijainti `DUN.x+(k+1)*230`. `resetRealms()` purkaa rakenteet (`resetWorld`). Vain näkyvät seinät piirretään/törmäytetään (vierekkäiset yhdistetty laatikoiksi). Generaattorit: `genMaze` (rekursiivinen peruutus + silmukat + huoneet), `genRooms` (11 huonetta + käytävät), `genCave` (soluautomaatti, suurin yhtenäinen alue). `finishRealm`: sisäänkäynti vasempaan reunaan, pomoareena (7×7 avarrettu) kauimmaiseen kohtaan, mobit ≥10 ruudun päähän sisäänkäynnistä, soihtuja, 2–4 arkkua (`flags.rc`). Pelaaja palaa ulos portaalin eteen (`portalFront`); tallennus ulottuvuudessa lataa pelaajan portaalin eteen (`P.realm` tallennetaan).
- **Lukot:** Kalmankammion portti vaatii **Jääavaimen** (rauniotalon `poiR1` arkussa, kivivartijan vahtimana), Aarnihaudan portti **Aarniavaimen** (Kalmaherran pudotus). Avain kuluu lukkoon (`flags.rl`). Lukittu portti hehkuu punaisena ja siinä on ketju+lukko.
- **Vaiheittainen pomo (`ai:'rboss'`, `realmBossAI`):** nukkuu kunnes pelaaja <17 m; vaiheet 100–66 / 66–33 / 33–0 % (nopeampi, lyhyempi tauko). Kierto `kit`: swipe, slam, charge, throw (kivi), nova (vaihe 3, 11 m, väistä hyppäämällä), summon (kutsuu 2–3 apulaista, max 4; myös vaiheenvaihdossa `sum`). Pomopalkki näyttää nimen + vaiheen. Pudotukset: rauta, kupari, **1 hiidenkivi**, Kalmaherralla aarniavain. Kaatuminen tallentuu (`flags.rb`), ei uusiudu.
- **Portaalisuoja:** `P.spawnProt` 3,2 s kaikissa portaali-/kumpusiirtymissä: `hurtPlayer` ei tee vahinkoa, viholliset eivät aloita jahtia. Sisätilan viholliset ≥10 ruudun päässä sisäänkäynnistä, maailman spawneri ei toimi portaalien lähellä.
- **Vartijat:** `GUARDS`-taulukko (kivivartija, kalmo, hiisi) kohteille; syntyvät kun pelaaja <75 m, pysyvät kohteen lähellä (`m.guard.r` 15–16 m, palaavat ja paranevat), kaatuminen tallentuu (`flags.gk`). Eivät kuluta spawnerin kattoa. Uudet mobit: `kivivartija` (110 hp, tylppä heikkous), `routasusi`, kolme pomoa.
- **Rauniot ja arkkukivet:** `buildPoiRuin` (suorakaiteen muotoinen talonpohja rikkinäisine seinineen, nurkkapylväät, arkku), `buildPoiRock` (lohkarekehä, hohtava riimu, arkku keskellä + valo). Arkusta XP:tä; löytö merkitään karttaan 30 m päästä.
- **Hautakummun portti:** `landmarks.js` – kaarimainen kivinen sisäänkäynti, rosoiset sammaloituneet lohkareet kummun kyljessä, portaat, soihtuvarret, riimulaatat, kallot, kivikehä kummun päällä ja hehkuva kiviröykkiö huipulla. `rockC()` sävyttää kivet (kanavat kerrotaan, ei lisätä).
- **Tarina:** `XRUNES` runeA–F (neljä eri kivimuotoa) kertovat vihjeitä ja suuntia (`dirText`: ilmansuunta + etäisyys, lasketaan lukuhetkellä → toimii kaikilla kartoilla) ja merkitsevät kohteet karttaan. `QUESTS` (12 tehtävää ketjuna: rannan riimukivi → Hautakumpu → kirstut → Routaportti → Jäätär → Jääavain → Kalmankammio → Kalmaherra → Aarnihauta → Aarnihirviö → Kalmanvartija x2) näkyy oikeassa yläkulmassa (`#quest`) suunnan ja etäisyyden kanssa; suoritus +60 XP; `flags.qi` tallennetaan, vanhassa tallennuksessa jo tehdyt ohitetaan hiljaa.
- **Viimeistely (v0.54):** ulottuvuuksien katto nostettu 4,2 → 7,6 m (`RCH`), pomot lyhennetty (s 2,5 → 1,75–1,85; korkeimmat ≈5,5 m sarvineen) ja mallit tehty yksityiskohtaisiksi (`figJaatar`, `figKalmaherra`, `figAarni` mobs.js: hiukset/sarvet/kruunut/viitat/ketjut/miekka/sienet; heiluvat osat `swayAdd` → `f.sway`, animoi `realmBossAI`). Usva (`MIST`, 44 spriteä pelaajan ympärillä ulottuvuuksissa, Hautakummussa ja löytöpaikoilla) ja höyrypuhurit (`VENTS`, `STEAM`; ulottuvuuksissa 0–8 kpl/pohja, kummun portilla, arkkukivillä ja portaaleilla) `updateMist` dungeons.js; laatutaso ≥2 vähentää 60 %.
- **Muut:** uudet esineet `jaaavain`, `aarniavain` (+kuvakkeet); ulottuvuuden sumun väri (`REALMS[id].fog`); kello näyttää ulottuvuuden nimen; versio 0.54.

### v0.53 (erä 30: kartta ja piirtoetäisyys)
- **Sileämpi ja pienempi tutkittu alue:** `FOGC` 2 m / px, paljastus pehmeillä säteittäisillä gradienteilla (`fogReveal`), tutkimussäde 24 → 12 m (`exploreTick`, 4 m ruudut, säde 3); `resetFog` piirtää tallennetun alueen samoin.
- **Löytämättömät paikat piilossa:** merkit vain `flags.disc`-paikoista, ja sumu peittää alueen kunnes se on tutkittu.
- **Liikkuvat pilvet kartalla** (vain kun kartta on auki): `CLOUDC` (saumaton kohina) liukuu sumun päällä (`source-atop`), `mapLoop` pyörii vain `openPanel==='map'` aikana.
- **Kartan zoom ja siirto:** rulla zoomaa kohdistimeen (×1–6), vedä siirtää, kaksoisnapsautus keskittää (`mapZ`, `mapCX/CZ`, `mapView`).
- **Rakennukset kartalle ja minikartalle** ylhäältä päin pikseleinä (`BLDC`, 1 px / m, `drawBld`): lattiat 3×3 px, seinät 3×1, katot päällimmäisinä; värit materiaalin mukaan (puu, kivi, terva, olki). Päivittyy `bldDirty`-lipulla (`markShadowDirty`).
- **Minikartan 3 zoomitasoa** (N): 60 (oletus) / 35 / 110 m.
- **Piirtoetäisyys (Minecraft-tyyliin):** `SET.renderDist` 90/165/260/400 m → sumun near/far ja kasvillisuuden näkyvyys (`RDK`); sumun takana olevia mobeja ja rakennuksia ei piirretä eikä mobeja animoida.

### v0.52 (erä 29: valikko, asetukset ja tallennus)
- **Uusi `js/settings.js`** (latautuu state.js:n jälkeen): `ACTIONS`/`BIND` (22 vaihdettavaa näppäintoimintoa, tallennus `hiidenmaa_keys`), `kd(action)` korvaa kovakoodatut `keys.KeyX`, `validateKey` (varatut: Esc, 1–8, F-näppäimet, erikoisnäppäimet; Shift vain juoksulle; ei jo käytössä olevia), vaihto kahdessa vaiheessa (paina näppäintä → vahvista pienessä ikkunassa `#keyDlg`), oletusten palautus; `SET` (grafiikka/ohjaus, tallennus `hiidenmaa_set`) ja `applyGfx()`.
- **Pelivalikko uusiksi:** puuteemaiset painikkeet + otsikon korostusviiva; **Asetukset**-kortti välilehdin (Näppäimet, Grafiikka, Ohjaus ja ääni, Tallennus). **Tallenna nyt -bugi korjattu** (ei enää avaa asetuksia; tila näkyy painikkeessa ja rivillä).
- **Tallennuskoodi pakattu:** `HM2:` + base64(deflate-raw JSON) (`packSave`/`unpackSave`, CompressionStream); testissä 5797 → 488 merkkiä. Vanha base64-koodi latautuu edelleen. **.txt-tiedosto:** "Tallenna .txt-tiedostoon" ja "Lataa .txt-tiedostosta".
- **Hiiren rulla pikapaikkoihin** (asetus, `SET.wheelHotbar`): vaihtaa valittua pikapaikkaa (`hotSel`, korostus `.hsel`) ja varustaa varustettavan esineen; zoom säädetään liukusäätimellä (`SET.zoom`). Numeronäppäimet 1–8 asettavat myös valinnan.
- **Grafiikka-asetukset:** varjot (hyvät/kevyet/pois), automaattinen laatu, puiden heiluminen (`SWAY.uWind`), hiukkaset (`PF` kerroin: `burst`, kipinät, sade/lumi `drawRange`), yksityiskohdat (`DETK`), rakennusten yksityiskohdat (`DET()`-merkityt meshit: ovenkahvat, tikkaiden puolat, ikkunalauta, tynnyrin vanteet, työpenkin työkalut), piirtoetäisyys (`RDK` = metrit/165: sumun `near/far` ja puiden/kivien näkyvyys).
- **Minikartan zoom** (näppäin N, `MINI_R` 60/35/110 m).
- **Kilpi torjunnassa:** vasen käsi koukussa oikealle ruumiin eteen (olka −.65, sisäänpäin −.8, kyynärpää −1.2) ja kilpi käännetään pehmeästi (`P.blockK`) osoittamaan eteenpäin (käden kierto kumotaan kvaternionilla).

### v0.51 (näppäinlista päävalikossa)
- Päävalikkoon **Näppäimet**-painike (`#bKeys`): avaa/sulkee puuteemaisen listan jossa kaikki näppäimet isojen kategorioiden alla (Liikkuminen, Toiminnot, Rakentaminen, Valikot ja paneelit, Näkymä). Lista on taulukkona `KEYLIST` (main.js) – päivitä se kun näppäimiä lisätään (pohja myöhemmälle näppäinten vaihtovalikolle, erä 29).

### v0.50 (ilmoitukset piiloon valikoiden ajaksi)
- Ruudun ilmoitukset (`#msgs`) piilotetaan (`visibility:hidden`) kun mikä tahansa paneeli (reppu, rakennus, kartta, arkku, J, T) on auki tai peli ei ole `play`-tilassa; ne palaavat valikon sulkeuduttua (ajastimet jatkuvat) ja säilyvät T-lokissa.

### v0.49 (kiinteiden valojen varjot harvoin, muutoksessa heti)
- Paikalle sijoitettujen valojen (`LIGHTS[0]`) varjokartta kauempana (> 9 m) vain joka 60. (pimeällä) / 120. (päivällä) kehys. **Ympäristön muuttuessa päivitys heti** (`markShadowDirty()` → `shDirty`): rakennuksen lisäys/purku/rikkoutuminen (`addPiece`, `removePiece`), oven liike (`setDoor`), puun/solmun kaato ja uusiutuminen (`killNode`, `reviveNode`). Lähellä (< 9 m) pelaajan varjon takia ennallaan (2./4. kehys). Lippu pysyy päällä kunnes valo palaa.

### v0.48 (ilmoitusten näkyvyysaika)
- Ilmoituksen näkyvyysaika pituuden mukaan: 3 s + 70 ms / merkki, rajattuna 4–13 s (aiemmin aina 4,5 s). Pitkät ohjeviestit (esim. soihdun loppuminen) ehtii lukea; kaikki pysyy myös T-lokissa.

### v0.47 (pelaajan varjo tulen vieressä)
- Pelaajan varjo seisovan soihdun/nuotion vieressä päivittyy tiheään: kun pelaaja on < 9 m päässä `LIGHTS[0]`:sta, varjokarttaa päivitetään pimeällä joka 2. (päivällä joka 4.) kehys; kauempana 8./16. (kantama pysyy 15 m). Rajoitus: three.js r128:ssa päivitystiheys on valokohtainen eikä sitä voi säätää heittäjäkohtaisesti (pelaaja vs. kiinteät esineet), joten ratkaisu perustuu etäisyyteen.

### v0.46 (varjojen laatu liikkuvuuden mukaan)
- **Liikkuvat varjot (käsisoihto, pelaaja) himeämmiksi ja sumeammiksi:** varjokartta 64 → 40 px (blobimaisempi), päivitys joka kehys. Uusi **täytevalo** `torchFill` (sama paikka, ei varjoa): soihdun intensiteetti jaetaan 55 % varjoa heittävälle ja 45 % täytevalolle, joten soihdun varjot jäävät himeiksi (varjoalue saa täytevalon). Laatutasolla 3 (pistevalovarjot pois) koko teho varjottomalle.
- **Paikallaan olevat valot (seisova soihtu, nuotio = `LIGHTS[0]`) terävämmiksi, harvemmin:** varjokartta 192 → 384 px, päivitys pimeällä joka 8. (aiemmin 2.) ja päivällä joka 16. kehys (×2 laatutasolla ≥1); lähimmän valon vaihtuessa heti.

### v0.45 (ilmoituslokki)
- **T avaa viimeiset 10 ilmoitusta** (`msgLog`, `renderLog`, paneeli `#logP`): uusin ylimpänä, pelin kellonaika, varoitukset punaisella ja löydöt vihreällä reunalla. Suljetaan T:llä/Esc:llä/✕:llä. Mainittu valikon ohjelistassa.

### v0.44 (korjaus: soihdun sytytys, ilmoitukset ja varjot)
- **Uudelleensytytys:** sammunut soihtu (fuel > 0) syttyy kun pelaaja on toisen palavan liekin (nuotio, grilli, seisova soihtu) vieressä < 1.15 m ja odottaa **2.5 s** (`torchIgn`); poistuminen nollaa ajastimen; ei sateessa/vedessä.
- **Ilmoitukset** (viestilokiin): loppuun palaessa "Soihtusi paloi loppuun! Avaa reppu (Tab) ja napsauta soihtua – sieltä voit lisätä siihen pihkaa…", sateen/veden sammuttaessa "…Sytytä se uudelleen viemällä se kiinni toiseen liekkiin ja odota hetki." ja "Soihtu syttyy… pysy liekin vieressä."
- **Käsisoihdun varjo vain pimeässä:** `shDark` (yö, sisällä, luolasto, Aarnimetsä, synkkä sää) → varjokameran kantama .3 m (ei varjoa) … 2.4 m; päivänvalossa kutistuu sulavasti nollaan.
- **Tulien (LIGHTS[0]) varjot:** kartta 512 → 192 px, kantama 18 → 15 m, bias suurempi (huonolaatuisempi ja sumeampi, ei seuraa reunoja tarkasti), päivitys pimeällä joka 2. kehys (aiemmin 3.), päivällä 6.

### v0.43 (korjaus: käsisoihdun varjo)
- Käsisoihdun varjo pieneksi, huonolaatuiseksi läntiksi: varjokameran kantama 18 → 3.2 m, varjokartta 512 → 64 px, `radius` 3 (pehmeä), päivittyy **joka kehys** (`fT=1`) eli piirtyy koko ajan sulavasti; halpa koska kamera näkee vain lähimmät esineet. Tulien (LIGHTS[0]) varjot ennallaan (512 px, harvemmin).

### v0.42 (korjauserä: varjot, hakkuu, soihtu, kyykky, kädet)
- **Varjobugi korjattu:** v0.40:ssä pistevalon varjokartta (`shadow.autoUpdate=false`) päivittyi vain pimeällä → päivällä jäi vanha kartta (varjot "jäätyivät", sitten puuttuivat). Nyt `needsUpdate` nostetaan itse säännöllisesti kun valo palaa: pimeällä soihtu joka 2., tuli joka 3. kehys, päivällä 6./8.; lähimmän tulen vaihtuessa heti (`updateLights`). Kevyempi kuin autoUpdate (aiemmin 2×6 kuutiopassia joka kehys).
- **Mukautuva laatu** (`QUAL`, `setQuality`, `autoQuality` main.js): kehysajan liukuva keskiarvo > 36 ms 3 s → laatu −1 taso (1: varjopäivitykset harvemmin, 2: aurinkovarjokartta 1024 px, 3: pistevalovarjot pois); < 18 ms 12 s → takaisin ylöspäin. Varjot säilyvät mahdollisimman pitkään.
- **Tukkien lohkeamat pienemmiksi ja pinnassa kiinni:** litteät laastarit rungon pinnalla (`logPatch`, kulma θ poikkileikkauksessa) + tumma reunus; halkeamia kuoreen (`logCrack`, 3 tukin syntyessä + lisää iskuista). Puiden kestävyys +20 % (pystypuu ×1.2, tukki 24·s²).
- **Käsisoihtu ei katoa:** palaessa loppuun vain pää sammuu (`fuel`=0, `lit`=false, mittari harmaa); pihkaa voi lisätä repun yksityiskohdista (+30 s / pihka). **Sammuu myös vedessä** (`P.inWater`), ei syty vedessä.
- **Kyykky luonnollisemmaksi:** vartalon etukallistus .38 → .1, vasen käsi koukussa (kyynärpää −.95) sivulla ja alhaalla, oikea sivulla; kyykkykävely: iso hidas askel (reiden heilahdus ±.6, polvi nostaa jalan kun se tulee eteen, vartalo keinuu ±.035). **Selkätavarat** kuuluvat nyt `fig.rig`-ryhmään (seuraavat kyykkyä) ja ovat aivan selän pinnassa (kilpi z −.1, jousi −.19, työkalu −.17/−.29).
- **Kädet palaavat pehmeästi:** isku ajastetusti: nopea vain osumaikkunassa (30), sen jälkeen 6, iskun jälkeen .55 s hidas palautus (5); kyynärpäät 20 → 8. **Hakkuussa olkapäät pysyvät kiinni paikoillaan** (`tSh` .14 → .31), kädet eivät enää katoa vartalon eteen.
- Pieniä optimointeja: kipinöiden materiaalit poolissa (`emPool`), valolista ei luoda uudelleen joka kehys (`ALL_LIGHTS`).

### v0.41 (erä 28: maasto ja työkalut)
- **Multaisuus** (`MUD`, resources.js): jokaisella maaston kärjellä arvo 0–1; väri sekoittuu alkuperäisestä (`TCOL0`) kohti tummaa multaa (`MUDC`). Tallentuu harvana listana (`mud:[[i,v]]`, `mudList`/`applyMud`), nollautuu uudessa pelissä (`resetMud` resetTerran yhteydessä).
- **Lapio:** tasoittaa kuten ennen ja lisäksi tekee maasta multaisen ja tummemman (+.4 / käyttö keskellä) → polut.
- **Uusi Kuokka** (`kuokka`, cat shovel, puu 4 + kivi 3, Alkupeli): nostaa maata (+.15 m / käyttö, max +3 m alkuperäisestä, ei aivan jalkojen alla) ja vähentää multaisuutta (−.45) eli palauttaa maan alkuperäiseksi. Oma malli ja kuvake.
- Huom: maaston kärkiväli rajoittaa polkujen tarkkuutta (polku on muutaman metrin levyinen).

### v0.40 (erä 27: valo ja soihtu)
- **Tulien varjot pimeällä:** lähin pistevalo (`LIGHTS[0]`) ja käsisoihtu (`torchLight`) heittävät varjoja (cube-varjokartta 512 px, far 18 m). Varjokartta päivittyy vain pimeällä (yö, sisällä, luolasto, synkkä sää; `shadow.autoUpdate`), päivällä ei kuormita. Tulipaikan omat osat ja soihdun liekit eivät varjosta omaa valoaan.
- **Käsisoihtu kuluu:** `TORCH_T` = 60 s palamista yhteensä, juostessa 20 % nopeammin; tila esineessä (`s.fuel`, `s.lit`, tallentuu). Hotbarin/repun paikassa oranssi mittari (harmaa kun sammunut). Palaessa loppuun esine poistuu.
- **Sade sammuttaa** soihdun ulkona (`wRain` > .5, ei suojassa). **Sytytys:** vie sammunut soihtu kädessä toisen liekin viereen (palava nuotio/grilli < 2.5 m tai seisova soihtu < 2.2 m). Sammunut soihtu ei valaise eikä pelota vihollisia (`torchLit()`).

### v0.39 (erä 26: taivas ja pilvet)
- **Taivaskupoli** (`skyDome`, ShaderMaterial, `SKY_U`): liukuväri horisontista (= sumun väri) tummempaan zeniittiin + auringon hehku (heikkenee pilvisellä). `updateSky()` environment.js.
- **Pilvet uusiksi:** 26 isoa, leveää ja litteäpohjaista pilvilauttaa (70–170 m, 26–40 palloa, korkeus 96–126 m eli aiempaa matalammalla, `CLOUD_R` 420). Peitto säästä (kynnys `th`), koko kasvaa peiton mukana (×.75–1.3). Kaukana pilvet häipyvät horisontin väriin (opasiteetti + väri, `far`) eivätkä piirry `CLOUD_R`:n takana.
- **Pilvikansi** (`cloudDeck`): rankassa sateessa ja myrskyssä koko taivaan peittävä harmaa kerros (128 m), salama valaisee sen.
- **Auringonsäteet** (`sunShafts`): selkeällä/puolipilvisellä säällä matalalla paistavasta auringosta läpikuultavia valokeiloja (additiivinen, opasiteetti ≤ .07), ei sisällä eikä Aarnimetsässä.

### v0.38 (erä 25: eläimet, viholliset ja terveyspalkit)
- **Eläinten säikähdys:** kävellessä 7 m, juostessa 16 m, vahinkoa tekevä ase/jousi kädessä ×1.4, kyykyssä 3.5 m (näköyhteys tai < 4 m). Vahingoitettu eläin pelkää 10 s; pakosuunta pois pelaajasta satunnaisella poikkeamalla (±.4….8 rad), vaihtuu 1.2–3 s välein; rauhoittuu > 28 m päässä.
- **Viholliset huomaavat iskun:** 10 s iskusta (myös nuoli) vihollinen jahtaa ilman näköyhteyttäkin eikä luovuta jahtia; sen jälkeen taas läheisyys + näköyhteys.
- **Terveyspalkit** (`updateMobBars`): näkyvät 10 s iskusta tai kun katsoo mobia < 12 m päästä; vaikeat (`MOB_SKULL` ≥ 3) jo < 70 m. Nimi + `hp/max` (+ kerros ×N), alla pääkallot (`MOB_SKULL`: peura 0, karju 1, hiisi 1, susi 2, kalmo 2, ylimys 3, vartija 5). Yksi kerros = 60 hp; useampikerroksinen palkki pidempi (max 3×), kerrokset eri värisiä (`LAYER_C`).
- **Vaikeat parantuvat:** ≥ 3 pääkalloa, 30 s ilman iskuja → +1 % maksimiterveydestä / s.

### v0.37 (erä 24: puut ja hakkuu)
- **Tukit alkuperäisen puun värisiä:** `TRUNK_C` (kuusi, koivu + mustat raidat, kelo, aarnipuu), `logMatOf(type)`; `LEAF_C` oksien lehville.
- **Oksat:** kaatuvan puun rungon sivuilla 4 oksaa (aarnipuulla 7, lehvät lehtipuilla/havuilla); maahan osuessa ne irtoavat (`dropBranch`), putoavat ja vajoavat ~6 s maan alle (poistetaan 9 s).
- **Lohkeamat ja kolot:** tukkia lyödessä (`chopLog`) osumakohtaan kuoren sisävärinen (`WOOD_IN` 0xc08a52) lohkeama sille puolelle josta lyödään; samaan kohtaan lyötäessä kolo kasvaa (4 tasoa). Joka iskulla puupartikkeleja (sisä- ja kuoriväri).
- **Iso puu kestää kauemmin:** tukin kesto 20·s → 20·s² (pystypuu jo hp·s²). Kaatumisaika (1+.3·s) s (aarnipuu ×2), alku hidas (k^2.6).
- **Ruutu tärähtää** kun puu kaatuu lähelle (etäisyys < pituus + 8 m, voimakkuus koon ja etäisyyden mukaan).

### v0.36 (erä 23: hahmo ja animaatiot)
- **Hahmo laihemmaksi ja litteäpintaiseksi:** `makePlayer` uusiksi (kapeampi vartalo, ohuemmat raajat, 8-sivuiset sylinterit + `flatShading`; pää/kiharat pehmeämmät). Nivelet: `elbowL/R` (olka–kyynärpää) ja `kneeL/R` (lonkka–polvi); koko keho `fig.rig`-ryhmässä (voi laskea ja kallistaa).
- **Jalat joustavat:** kävelyssä polvet taipuvat, hypyssä polvet koukussa, laskeutumisessa joustaminen (`P.landT`, .25 s), iskussa askel ja pieni etukenoon (`lunge`). Kyykky (C): polvet syvälle (reisi −1.0, polvi 1.8), vartalo etukenoon, runko laskee .3 m, toinen käsi pitkällä eteen ja toinen sivulle.
- **Kyynärpäät** taipuvat käsivarren noston mukaan (.14 + .28·kulma); jousella jousikäsi suorana, vetokäsi taipuu vedon mukaan.
- **Käännösviive:** isku/toiminta alkaa vasta kun hahmo on kääntynyt kursorin suuntaan: `P.turnWait` (.08+ero·.1 s, max .28 s), iskun ajastin odottaa, kääntyminen hitaammin.
- **Viistoiskut vuorotellen:** `P.swingSide` vaihtuu joka iskulla (vasen-ylhäältä → oikea-alas ja päinvastoin) kirveellä ja muilla aseilla (`swingPose` hz/lz).
- **Keihäs:** kärki kohdistetaan kohteeseen (`P.atk.aimP`, lähin mobi edessä tai kameran osoittama piste); vedä taakse (kyynärpää taipuu) → työntö kohti kohdetta.
- Olkapäiden etäisyys `armSh` .44 → .35 (grip .14).

### v0.35 (korjausversio)
- **Käsisoihdun valo palautettu:** v0.34:n riville jäänyt `//`-kommentti kommentoi pois valon asettamisen (`torchLight.intensity=…`). Kommentti poistettu. Muista: älä kirjoita rivinloppukommenttia riville, jolla on lisää koodia.
- **`LIGHT_CAP` 2.2 → 3.0**, koska 2.2 litisti yksittäisen käsisoihdun (max ~2.7) vakioksi eikä välkettä näkynyt. Yksittäinen valo ei enää kattoon osu; päällekkäiset valot rajataan edelleen.

### v0.34 (korjauserä)
- **Käsisoihdun elävyys säädetty ~30 % seisovaa soihtua elävämmäksi:** välkekerroin .52 (seisova .4) + hengitys ±4 %.

### v0.33 (korjauserä)
- **Käsisoihtu hengittää hieman enemmän ja satunnaisemmin:** satunnaisvälke ×.55 + hidas, satunnaisvaiheinen "hengitys" (kaksi siniä, ±5 %).

### v0.32 (korjauserä)
- **Käsisoihdun elävyys vielä hillitympi:** valon ja liekin vaihtelu ~40 % aiemmasta (`1+(flick−1)·.4`), liekin ja hehkun koonvaihtelu pieni.

### v0.31 (korjauserä)
- **Polttoaineen näyttö:** nuotion, grillin ja seisovan soihdun kehote näyttää "Polttoainetta 62/100 · 3,4 min". 100 = palamisaika heti viimeisen lisäyksen jälkeen (`p.data.full`, `markFull()`),
  joten prosentti kertoo kuinka suuri osa kyseisen polttoaineen ajasta on jäljellä; minuutit ovat arvio jäljellä olevasta ajasta. Yli 50:n ei voi lisätä. `full` tallentuu.

### v0.30 (korjauserä)
- **Iso vilkahtava objekti korjattu:** uusi kipinä/savuhiukkanen luotiin mittakaavassa 1 (1 m pallo) ja pieneni vasta seuraavassa päivityksessä → yhden kehyksen välähdys. Nyt mittakaava asetetaan heti (.001).
- **Välke hillitympi:** `flick()` palauttaa kertoimen ~.82–1.04 (aiemmin ~.55–1.1), liekkien koon vaihtelu pienenee samalla.

### v0.29 (korjauserä)
- **Käsisoihtu näyttävämmäksi:** kolmikerroksinen liekki (oranssi, keltainen, valkoinen) + himmeä hehku, liekit osoittavat aina ylös; liekki ja valo elävät satunnaisesti, kipinöitä ja savua lähtee kärjestä.
- **Satunnaistettu välke kaikkiin valoihin:** `flick(u,dt)` (state.js) – arvo hakeutuu satunnaisesti vaihtuvaan tavoitteeseen (.82–1.1), harvoin pieni vajaus; käytössä pistevaloissa (`LIGHTS`), käsisoihdussa ja nuotioiden/grillien/seisovien soihtujen liekeissä.
- **Hiukkaset:** `emitEmber(x,y,z,'spark'|'smoke')` + `updateEmbers` – kevyet nousevat kipinät ja savu nuotioille, grilleille, seisoville soihduille (alle 30–35 m) ja käsisoihdulle; enintään 70 kerrallaan.

### v0.28 (korjauserä)
- **Välkkymisbugi korjattu:** `updateLights()` (0,4 s välein) asetti valojen intensiteetin kattoa edeltävään arvoon, joten kahden valon huoneessa kirkkaus hyppäsi 0,4 s välein.
  Nyt se asettaa vain `userData.base`n; intensiteetti lasketaan joka kehys `updateStations`issa (välke + `LIGHT_CAP`). Testi: kahden soihdun huoneessa suurin kehysten välinen hyppy 0,055.
- **Tulen sammutus iskemällä:** lähitaisteluisku sammuttaa edessä olevan nuotion, grillinuotion tai seisovan soihdun (`doMeleeHit`, polttoaine/palamisaika nollataan; syttyy uudelleen lisäämällä polttoainetta).

### v0.27 (korjauserä)
- **Selkä:** vain kilpi + yksi työkalu/ase (tai jousi). Työkalu käännetty `rotation.z=π/2`, jolloin hakun siivet ja miekan terä ovat selän suuntaisesti (ei piikkejä selkää vasten).
- **Valot:** pistevalojen voimakkuus ×1.7 → ×1.15, kantama 22 → 17 m (käsisoihtu 2.6, 18 m). **Valokatto** `LIGHT_CAP`=2.2 (ai.js `updateStations`): pelaajan kohdan yhteisvalo
  (intensiteetti × (1−d/etäisyys)^1.5 summattuna) ei ylitä rajaa, vaan kaikki valot skaalataan alas – päällekkäiset tulet eivät kirkastu loputtomiin.

### v0.26 (korjauserä)
- **Hautakasa:** pieni valomajakka (läpikuultava valopylväs `g.beam` + himmeä pistevalo `g.light`), pylväs näkyy alle 50 m päästä. Kartalle (iso kartta ja minikartta) **pääkallo** kunnes tavarat kerätty.
  Keräys vaatii, että kaikki mahtuu reppuun (`fitsAll()`); muuten ei voi poimia ja kehote kertoo sen. `removeGrave()` siivoaa mallin, valon ja listan.

### v0.25 (korjauserä)
- **Tulen palamisaika prosentteina** (`firePct`, `torchPct`) kehotteessa; kun yli 50 % jäljellä, polttoainetta ei voi lisätä (nuotio, grilli, seisova soihtu). Puu antaa +1 yksikköä, hiili +10.

### v0.24 (korjauserä)
- **Ovi tummemmaksi:** `MAT.doorwood` (plank-tekstuuri, väri 0xa58468) oven lehdelle ja karmille (kiviovi säilyttää kiven).
- **Vasara:** pää poikittain varteen nähden (aiemmin pystyssä), reunarenkaat.
- **Kilpi eeppisemmäksi:** `makeShield` uusiksi: pyöreä levy, metallireunus, pultit, keskinasta + piikki, puukilvessä laudat ja vanteet, kupari/rauta ristivahvikkeet ja kultarengas.
- **Selkäkantaminen:** repussa olevat käyttämättömät kilpi, jousi ja aseet/työkalut näkyvät selässä (`updateBack()` state.js; kilpi keskellä, jousi vinossa, enintään 3 työkalua varret ylöspäin).
- **Esinekuvakkeet** (64 px, `icon()`): kaikki työkalut piirretään omalla muodollaan ja materiaalitason värillä (kivi/kupari/rauta/hiiden): kirves, hakku (kaareva, kärjet), lapio (T-kahva), keihäs (lehtiterä + tupsu), nuija (nastat), vasara, miekat, soihtu, jouset, kilvet.

### v0.23 (korjauserä)
- **Jousi:** malli käännetty 180° pystyakselin ympäri (`makeHeld` jousi: sisäryhmä `rotation.y=π`), jänne ja nuoli venyvät oikeaan suuntaan.
- **Tikkaat:** Shift+R vaihtaa kaltevuutta (`poses:3`: pysty, nojaa 15°, nojaa 30°); yläpää pysyy WH:n korkeudella, törmäys ja kiipeäminen (`ladderAt`) seuraavat kallistusta.
- **Kiviversiot kaikista järkevistä osista:** kivinen portaikko (ontto), kivitikkaat, kivi-puoli- ja neljännesseinät (pysty/vaaka), iso kivipalkki, kivipylväät (ohut/lyhyt/pitkä),
  kivivinoseinä, kivipäätykolmio, kiviarkku, kivitynnyri (säilytys ja päivitykset toimivat; `PIECES[t].store` yleistetty `interact`issa). Mallit käyttävät `W`-materiaalia.

### v0.22 (erä 22)
- **Uudet esineet:** Puuhiili (`hiili`, polttoaine 10 yksikköä), Paistettu sieni, Rautakilpi, harvinaiset Hiidenjousi / Hiidenmiekka / Hiidenpanssari (tasot 10/12/14).
  Hiilen saa nuotiolla puusta (5 puuta → 2 hiiltä) tai ylipaistetusta ruoasta.
- **Grillinuotio** (`grilli`, kivi 6 + puu 4 + kupari 2): teline neljälle ruoalle, jokaisella oma aika (`{id,t,need}`, need 9–14 s). Kypsä ruoka pysyy telineessä
  (näkyy värinä raaka → ruskea → musta); `t ≥ need` kypsä (liha → paisti, sieni → paistettu sieni), `t ≥ 2·need` ylipaistunut → **hiili**. E ottaa kaikki
  valmiit. Sama logiikka nuotiolla (3 paikkaa). Tulen polttoaine: puu +1, hiili +10 (`FUEL_MAX` 40; `fireInteract()` actions.js).
- **Hiili polttoaineena:** nuotio/grilli (+10), sulatusuuni (1 hiili = 10 puun verran, max 20), **seisova soihtu** palaa nyt `p.data.burn` s (5 min aluksi,
  puu → 10 min, hiili → 30 min; sammuu nollaan, uudelleensytytys E:llä).
- **Viholliset pelkäävät tulta:** palava nuotio/grilli (7 m), seisova soihtu (5 m) ja pelaajan soihtu (6 m, ei luolastossa) → mobi kävelee pois päin (`fearT`, `fireSrc`);
  Kalmanvartija ja ylimys eivät pelkää.
- **Piiritys:** ovet (myös suljetut) eivät estä näköyhteyttä (`pointBlocked`, `losClear(...,doors)`), mutta iskut eivät mene suljetun oven läpi. Jos tie on tukossa,
  vihainen mobi valitsee lähimmän ovi/ikkunaseinän (`nearestOpening`, `m.siege`) ja hajottaa sen 2× vahingolla.
- **Jousi:** täysi veto 1,6 s (laatu 2: 1,3 s, laatu 3: 1,07 s); `bowDrawTime()`. Vajaa veto: vahinko .2+.8k, nopeus (14+36k)·(1+.1(q−1)), laatu pienentää nuolen painovoimaa
  (7/(1+.3(q−1))) → suorempi ja kauemmas. Uusi jousimalli (kaari vatsa eteenpäin, jänne + nuoli vedossa, `updateBowMesh`), pysyy pystyssä (`rotation.x = −armL.rotation.x`).
- **Taso ja XP** (progress.js): `flags.xp`, `needXp(n)=50+30n`, taso 1–20. XP: tavoitteet, saavutukset (+50), tapot (hp/5+3), ensimmäinen valmistus (+6) ja rakennus (+4).
  Valmistusohjeilla `lvl` (lukittu = "Taso N"), valmistusvalikossa välilehdet (Alkupeli/Työkalut/Aseet/Varusteet/Ruoka/Muut).
- **Saavutukset** (15 kpl, `ACH`): pysyvät pienet bonukset (`BON`: enimmäisterveys, kestävyys, kantokyky, nopeus %). Laskurit `flags.cnt` (`bump()`).
- **Tavoitteet:** 28 yksinkertaista järjestettyä tavoitetta (`GOALS`, siirretty ui.js:stä progress.js:ään, id:t). Vanhat tallennukset muunnetaan (`migrateProgress`, `flags.gv`).
  Panelissa **J**: taso, saavutukset, tavoitelista, tason avaamat ohjeet. HUD:ssa tason palkki (`#lvlbox`).
- Uusi tiedosto `js/progress.js` (latautuu ui.js:n jälkeen, ennen save.js:ää).

### v0.21 (erä 21)
- **Pelaajahahmo uusiksi** (`makePlayer()`, models.js): pehmeä low-poly – pyöreät raajat (sylinterit/pallot, `smat()` ilman flatShadingia), kiharat hiukset
  ja parta, ei hattua; alkukantaiset vaatteet: nahkatunika, turkisharteet, vyö ja pussi, turkisreunaiset saappaat. Panssari värjää tunikan ja hihat
  (`fig.cloth`). Aseet (`makeHeld`): pyöreät varret (`shaft`), muotoillut terät (`poly()` = ExtrudeGeometry sivuprofiilista): kirves, miekka, lapio, keihäs,
  kaareva hakku, piikkinuija, soihtu. Jousi ennallaan (erä 22).
- **Varjot ja valot:** aurinko .85 → 1.4, taivasvalo .12+.4·valo → .07+.2·valo, ambient pienemmäksi; pistevalot ×1.7 ja pidemmälle (22 m), käsisoihtu 3.4.
- **Tilat** (`effects()`, `calcFx()` environment.js): jokaisella kuvaus ja ajastin, `P.fx` = {speed, dmg, stamRegen, hpRegen} kertoimet vaikuttavat
  kävelyyn, iskuun ja palautumiseen. Näkyvät HUD-chipeinä (tooltip) ja repun vieressä "Tilat"-laatikossa. Uusia: Nälkäinen (<25), Vatsakipu (syöminen
  kun kylläisyys ≥ 85: 75 s, kramppi vie kestävyyttä), Märkä näyttää ajastimen. Kylmä −7 % kävely, −10 % isku, −40 % kestävyyden palautus.
- **Taivas:** 46 liikkuvaa pehmeää pilveä (`CLOUDS`, `updateClouds()`), peitto säästä (`WEATHERS.*.cloud`), tuuli kuljettaa niitä; aurinko ja kuu jäävät pilvien taakse;
  pilvet tummuvat ennen sadetta (`wDark` k=.12; sade alkaa vasta kun `wDark/W.dark` > ~.6–.9), välkkyvät salamasta; harvinainen näkyvä salama (`strikeBolt()`,
  35 % myrskyn iskuista).

### v0.20 (erä 20)
- **Puutekstuurit:** `bxw()` (render.js) skaalaa laatikon UV:t mittoihin (u = pituus/G, v = korkeus/WH); kaikki puuosat (aita, portaat,
  palkit, pylväät, ovi, työpenkki, arkku, sänky) käyttävät `MAT.wood`ia. Seinän tumma pylväs poistettu.
- **Ovi kaksipuoleinen:** ripa kummallakin puolella, aukeaa pelaajasta poispäin (`p.data.dir` ±1, sarana samassa kohdassa;
  tallentuu `d:{open,dir}`).
- **Pystykohdistus:** H vaihtaa auto / pysty (askel `VSTEP`=WH/4=0,65 m) / 3D (näkyy myös seuraavan kerroksen ruudukko);
  Q nostaa ja Z laskee haamua (`buildLift`).
- **Hiiri:** `contextmenu` estetty koko sivulla; oikealla avattu valikko ei valitse korttia 400 ms:iin (`panelOpenedAt`).
- **Rakennusvalikko:** puuteemainen, läpinäkymätön, välilehdet (`BUILD_CATS`; Alkupeli oletuksena = osat joilla `alku:1`),
  aineet punaisella puuttuessa ("Puu 0/12", `costChips`).
- **Säilytys:** Tynnyri (12 paikkaa). Säiliön laajennus (`STORE_UP`: taso 2 tervaspuu 6, taso 3 kupari 6 + nahka 4; +8 paikkaa/taso).
  Reppu: `P.packLv` 0–2, `PACK_UP` (nahka 6 + puu 4; nahka 12 + kupari 4), +8 paikkaa ja +40 painoa/taso (`setPack`, `invN()`).
- **Uudet osat:** ikkunaseinä, puoli- ja neljännesseinät (pysty/vaaka, `dim`), pylväät (ohut/lyhyt/pitkä, `col`), palkki ja iso palkki
  kallistuvat Shift+R:llä 5 asentoa (0, 22,5, 45, 67,5, 90°), tikkaat (`ladderAt()` player.js: W/Välilyönti ylös, S alas),
  ontot **Portaat** (`portaat_ontelo`, Shift+R: tavallinen/jyrkkä/loiva, `stairGeom`); vanhat portaat nimeltä **Raput**.
- **Kiviversiot** (`base`+`stone:1`): kivilattia, kiviikkuna, kiviovi, kivipylväs, kivipalkki, kiviraput; **Kivikatot**-kategoria
  (kivikatto, loiva kivikatto, kiviharjakatto). `bt(t)` palauttaa muodon antavan perustyypin.
- **Tallennus v8:** `P.packLv`, säiliöiden `lv`, ovien `dir`.
- Siirretty erään 22: valmistusvalikon kategoriat/Alkupeli (liittyy tavoitteisiin ja avautuviin reseptteihin).

### v0.19 (erä 19)
- **Päätykolmio tasakylkiseksi:** `kolmio` = pohja G, kärki keskellä korkeudella G/2, sopii yhden ruudun harjakaton päähän
  ja katon kääntökohtaan. **Vinoseinä pysyy** suorakulmaisena kolmiona (G × WH). Vanhat `kolmio`-tallennukset saavat uuden
  muodon automaattisesti (sama tyyppi, törmäys lasketaan uudelleen).
- **Kolmioiden tekstuuri:** `triMesh()` normalisoi UV:t (u = x/G, v = y/WH), joten lankkukuvio on yhtä harva kuin seinässä
  (aiemmin ExtrudeGeometryn metriset UV:t tiheyttivät kuvion).
- **Neljä asentoa:** `PIECES.kolmio/vinoseina` `flip:1`; **Shift+R** vaihtaa asentoa (normaali, peilattu, ylösalaisin,
  ylösalaisin peilattu; `buildPose`, `cyclePose()`), R kääntää 45° ja G kohdistustilaa. Pose tallentuu (`p.f`, tallennuksessa `f`).
  Haamu rakennetaan uudelleen asennon vaihtuessa; törmäysviipaleet lasketaan asennon mukaan (`pieceBoxes(t,f)`).
- **Uudet katot:** `katto_loiva` (loivempi: nousu G/2 / G, ~27°) ja `harjakatto` (yksi ruutu, kaksi lappeita, harja G/2 korkeudessa
  keskellä). Kaikki katot (`roof:1`) ovat kävelykelpoisia (portaat), vain yksi katto ruutua kohden. Testi: nousu 2,5 / 1,25 / 1,25 m.
  Olkireunus matalissa päissä (`roofSlope()`).
- Testi: kolmion/vinoseinän laatikot ja asennot, UV-alueet (vino u 0–1, v 0–1, kolmio v 0–.48), tallennus/lataus `f`,
  Shift+R / R, katot, roof-duplikaatti estetty, vanha kolmio uuteen muotoon, ei konsolivirheitä.


### v0.18 (erä 18)
- **Kohdistustilat (G, vasara kädessä):** `snapMode` (building.js) = ruudukko (oletus), puoli (G/2-askeleet), vapaa
  (.25 m), reuna (reunajatko). Tila näkyy rakennusvihjeessä. Ruudukko/puoli: läpinäkyvä `THREE.GridHelper`
  (10×G, puolitilassa 20 jakoa) haamun ympärillä. Myös kalusteet (vapaat osat) kohdistuvat ruudukkoon.
- **Kohdistus suosii rakennettua osaa:** `buildRaycast` valitsee osan, jos se on enintään 1 m maata kauempana.
  Maahan tähdätessä viereinen lattia (≤1,6·G) määrää ruudukon paikan (`ox,oz`) ja korkeuden, eli uusi osa jatkaa
  lattian ruudukkoa vaikka lattia olisi rakennettu vapaasti.
- **Reunajatko** (`edgeSnap`, v0.65 alkaen `smartSnap`, ks. versioloki): seinän sivusta → jatke samaan suuntaan; seinän päältä → pinoaminen; lattian päältä:
  lattia → viereinen lattia, seinä → lattian lähin reuna (suunta automaattisesti); seinän sivusta lattia → viereen.
- **R kääntää 45°:** `buildRot` 0–7, `p.rot` on nyt kahdeksasosakierroksia (`rotation.y=rot·π/4`). Parittomat kierrot:
  `worldBoxes` jakaa laatikot ~.4 m paloihin ja kiertää ne (AABB-palat). **Tallennusversio 7:** v<7 → `r*2`.
- **Palkit:** `palkki` (G pitkä, .22 m, puu 1) ja `palkki2` (2·G, .3 m, puu 2, päät ruudukon reunoihin `span2`),
  snap 'wall': asettuvat maahan, seinän päälle tai lattian reunalle.
- **Välkkymisen esto (z-fighting):** jokaiselle osalle hieman erilainen mittakaava (`hash(x,y,z)`, ≤.4 % / 8 askelta),
  joten päällekkäiset, samassa tasossa olevat pinnat eivät enää taistele. Testi: 8 vierekkäistä seinää → 5 eri mittakaavaa.
- Testit: ruudukko/puoli/vapaa-sijainnit, 45° seinä (7 laatikkoa, pelaaja ei kävele läpi), reunajatkot, ruudukon linjaus
  viereiseen lattiaan, raycast suosii osaa, palkit, tallennus v7 ja v6→v7.


### v0.17 (erä 17)
- **Puu uusiutuu lähelle:** `respawnNode(n)` (resources.js): puu uusiutuu enintään 5 m, kasvi 3 m alkuperäisestä paikasta
  (`n.ox,n.oz`), 10 yritystä, ehdot: sama biomi, maa (h>1), ei `nearBase`, ei toista solmua 2,5 m:ssä, ei lähempänä
  `LOC`-paikkaa kuin alkuperäinen. Muuten alkuperäiseen paikkaan. Uusi satunnainen koko (`treeS()`), törmäys ja
  ruudukko siirretään (`moveNode`), sama puu on täysin normaali (hakkuu, kaato, tukit, myrsky). Testi: 40 puusta 36
  siirtyi, suurin siirto 4,93 m. Tallennus v6: `moved` (siirtyneet solmut), `terra`. Uusi peli palauttaa alkupaikat.
- **Sade ei tule katon läpi:** sadepisarat ovat maailmakoordinaateissa ja pysähtyvät `roofTopAt(x,z)`:aan (maa tai
  rakennuslaatikon yläpinta, lasketaan kun pisara syntyy); ei raycastia joka kehys.
- **Sisävalo:** `indoorScore()` (8 sädettä 6 m, ≥5 osumaa = sisällä) 0,5 s välein; `indoorK` himmentää `hemi` (−60 %), `amb`
  (−50 %), aurinko/kuu (−70 %) ja poistaa hemisfäärin sinisen sävyn. Testi: sisällä hemi 0,41×, aurinko 0,32×. Seinämeshit G+.02.
- **Lapio:** `lapio` (`cat:'shovel'`, ryhmä 'weapon'), resepti puu 4 + kivi 2. Hiiren vasen (pohjassa toistuu .45 s välein)
  tasoittaa maata katsottavassa kohdassa (≤6 m) kohti jalkojen korkeutta, säde 3,2 m, ±.4 m / käyttö, pehmeä reuna (`sstep`),
  kestävyys −6. Päivittää `HGT`-ruudukon, maastoverkon ja solmujen korkeudet; ei rakennusten lähellä ("Rakennus on tiellä.").
  Muokatut kärjet tallentuvat (`TERRA`, `HGT0`). Testi: 3,3 m kumpu tasoittui 14 käytöllä (≤.4 m/käyttö).


### v0.16 (erä 16)
- **Putoamisvahinko ×2:** `(-vy-15)*6` (ennen ×3). 14 m pudotus ≈ 59 vahinkoa. Korjattu samalla
  vahinkonumeron puuttuva z-koordinaatti (`floatText`).
- **Esineet katoavat maasta 5 min jälkeen** (`DROP_LIFE=300`), vilkkuvat viimeiset 15 s. Hautakasat eivät katoa.
- **Näköyhteys kaikille:** myös pakenevat eläimet (peura) huomaavat pelaajan vain näköyhteydellä
  (`m.los` lasketaan kaikille <45 m). Vihollisilla näköyhteys oli jo (erä 9).
- **Vasaralla korjaus (F):** katsottava rakennus korjataan täyteen; hinta = vaurion osuus rakennuksen
  aineista (vähintään 1 kutakin). Ehjästä tulee viesti, puuttuvista aineista lista. Vihje rakennuspalkissa.
- **Ei päällekkäisiä rakennuksia:** sama osa samaan paikkaan (myös käännettynä) kielletty, ja pystysuuntainen
  päällekkäisyysmarginaali mitoitetaan ohuiden osien mukaan (lattiat .2 m eivät enää mene päällekkäin).
- Regressiotestit (erät 7–15) ajettu uudelleen.


### v0.15 (erä 15)
- **Ukkosen ääni pois** (toistaiseksi): salama välähtää edelleen, `sfx('thunder')` poistettu.
- **Myrsky kaataa puita:** jokaisella salamalla 12 %:n todennäköisyys, että puu 3–40 m päässä kaatuu
  satunnaiseen suuntaan (`stormFellTree`). Kaatuvan puun alle jäävä (puun pituus, sivulla ±1,4·s m)
  menettää 80 % maksimiterveydestä (`crushPlayer`). Testissä ~9 kaatoa / 100 salamaa.
- **Mobin ulottuvuus 3D:ssä:** `mobReach(m,dist)` = vaakaetäisyys + pystyväli mobin iskukohdasta
  (biped 1 m·s, nelijalkainen .6 m·s) pelaajan vartaloon (0–1,8 m). Seinän päällä seisovaa ei
  enää lyödä juurelta (testi: ulottuvuus 2,25 > 1,95).
- **Kamera pehmeämmäksi:** esteen etäisyys 30 näytteellä (ennen 12), kamera tulee lähemmäs nopeasti
  ja palaa hitaasti (`camD`), kohteen korkeus pehmennetty (`camTY`, portaat/askelmat). Seinän vieressä
  kävellessä suurin nykäys 0,008 m/kehys.
- **Uusiutuminen:** nukkuessa vain kaadetut puut ja poimitut kasvit uusiutuvat (ei enää uusia
  puita). Rakennusten (myös arkku, sänky, työpenkki) `BENCH_R`×1,5 = 30 m:n säteelle ei uusiudu
  mitään (myös ajastettu `respawnNodes`) eikä synny eläimiä/vihollisia (`nearBase`).


### v0.14 (erä 14, käyttäjän toive)
- **Aarnipuu uudelleen:** paksu runko ja 7 kerrosta leveitä, alaspäin roikkuvia havuoksia (`aarniGeo()`),
  alimmat kärjet ~1,5–3 m korkeudessa; ~1270 kolmiota/puu. Tiheys .13→.085 (latvukset ovat leveitä).
- **Aarnimetsä isommaksi** kaikilla kartoilla (säteet ~1,5×) ja täyteen pensaita: uusi koriste-solmu
  `pensas` (kind 'deco', ei törmäystä eikä toimintoa, ei varjoa), aarnissa ~55 % ruuduista, metsässä 4 %.
- **Sumuisempi ja pimeämpi:** sumu near 6–40 / far 45–165 (ennen 8–60 / 55–230), Aarnimetsässä near 3 /
  far 38. Taivas harmaampi, yö tummempi, aurinko ×.85, kuunvalo .2, hemi .12+.40·valo, amb .06+.05·valo,
  Aarnimetsän valo ×.55.
- **Kartta:** tuntematon alue on läpinäkymätöntä pilviverhoa (`FOGIMG`, fbm-kohina), maastoa ei erota.
  Paljastussäde 40 m → 24 m (6 ruutua).
- **Näkyvyysetäisyydet** sumuun sopiviksi: `VIS_R` puut 130, kivet 110, poimittavat 60, pensaat 55.
  Mittaus (swiftshader): ~610 k kolmiota (ennen erää 515 k), päivitys ~0,3 ms.
- **Tallennusversio 5:** pensaat muuttivat solmujen numeroinnin, joten v<5 tallennuksen kaadettujen
  solmujen lista ohitetaan (kaikki kasvaa takaisin); muu tila säilyy.


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

### Päivityslista 2: 17 kohtaa (v1.08–) – yksi kohta kerrallaan, 1–5 tarkentavaa kysymystä per kohta
**JATKA TÄSTÄ:** PR #23 yhdistetty (v1.07). Haara `claude/hiidenmaa-survival-game-fmxt0m` aloitettu uudelleen mainista. Uusi PR tälle listalle.
1. TEHTY v1.08 (muutettu: ei hiireen tarttumista) – valinta selkeämmäksi (sykkivä reunus, haamukuvake, kohdevihje, ohje), oikea = puolet, raahaus, myös arkut.
2. Vartijat palaavat alueelleen ajan kanssa (esim. 10 s kävellen); pelaajan tullessa lähelle paluu keskeytyy.
3. Savut/usvat kohteiden yllä: sama ulkonäkö ja paksuus vähemmillä entiteeteillä (kääntyvät siivut); nykyinen = korkein grafiikka-asetus.
4. Ohjetekstit pois (kuten Minecraft): "Rulla = zoom" yms.
5. "Toimii parhaiten tietokoneella…" -teksti valikossa eri paikkaan; näkyy vain ensimmäisellä kerralla ja häipyy.
6. Valikon taustakuva kuvaa eri kohteita pelissä, vaihtaa kohdetta satunnaisesti.
7. Ehdotukset-kategoria: ensin mihin on varaa (repun materiaalit), toissijaisesti mitä pelaajalta puuttuu ja olisi hyödyllistä (pelin vaihe).
8. Tehtävät ja tavoitteet piiloon/näkyviin napista; piilotettuna pieni teksti "piilotettu – näytä painamalla (näppäin)".
9. Puut kallistuvat tuulen suuntaan (runko taipuu, myrskyllä paljon); myrskyssä kaatuminen 70 % tuulen suuntaan;
   puu pelaajan päälle = 80 % suurimmasta kestosta (terveys + suojat).
10. Iso kartta: liikkuvat pilvet näkyvät ohuina myös avatulla alueella.
11. Kartan valkoisille teksteille pieni varjo (näkyvät valkoisten vuorten päällä).
12. Tasolla 5 pelaajan maksimiterveys 100.
13. Monikertaisen terveyden mobeille useita päällekkäisiä hp-palkkeja; palkit ja kallot nousevat määrän mukaan (eivät mobin edessä).
14. Jousi: jänne venyy väärään suuntaan → korjaa; latauksessa jousi keskelle eteen ja oikea käsi vetää jänteen pään oikealle puolelle;
    jousi heiluu käden mukana kävellessä.
15. Nuolten tiedot näkyviin; sulkanuolet kauemmas, tasaisemmin ja nopeammin; tulinuoli = tavallinen + sytyttää; palamisesta tulisempi + valo maahan.
16. Paremmat aseet/työkalut = paremmat ominaisuudet (esim. hiidenjousi latautuu nopeammin, kantama, nopeus ja vahinko isommat).
17. Jousen tähtäysympyrä: alkaa isona ja pienenee latautuessa, keltainen → punainen; vajaa lataus = nuoli satunnaisesti ympyrän alueelle,
    täysi lataus = pieni ympyrä + piste, nuoli suoraan.

### Päivityslista 15 kohtaa (v0.81–) – yksi kohta kerrallaan, 1–5 tarkentavaa kysymystä per kohta
**JATKA TÄSTÄ (päivitetty v1.06):** v1.06 nuija oikein päin (paksu pää kärkeen), takaraivon hiukset, tuulikompassi kartan vasemmalle puolelle – v1.07 palautettu kartan päälle läpikuultavana, häipyy hiiren alla, merkit sen päällä. v1.05 lisäsi DEV-esinehaun (Ä-valikko, määrä hakunapin vieressä) ja korjasi jousen laukaisun. Aiempi tila: päivityslistan KAIKKI kohdat 1–15 tehty (v0.81–v1.00) + välilisäykset:
v0.93 (hautakasa arkkuna, Kalmanpesä millä vain, DEV-jumalvoimatäpät, harppova juoksu), v0.94 (Shift-tietoikkuna), v1.01–v1.03 (arkkukivi
suljetuksi linnakkeeksi: korkea muuri, vaikeat siksak-hyppypilarit, kierreportaat; ruoho kevyemmäksi ja laikuittaiseksi; kiviröykkiöt 2/kartta).
Haara `claude/hiidenmaa-survival-game-fmxt0m`, PR #23 auki (tarkista ennen jatkoa onko yhdistetty; jos on, aloita origin/mainista
tarkistettuasi ettei commiteja katoa). Linnake hyväksytty. v1.04: ruoho kasoina, kasvillisuuden esto kohteissa, tuulinäyttö, leirien yksityiskohdat. Avoin: käyttäjä testaa ruohon (v1.04). Mahdolliset jatkot: realm-pomojen laatikkomaiset lisäosat (Erä 44b), pelaajan soihdun varjoasetus ja kartan piirto
vain tapahtumista (Erä 40), DEV=false kun käyttäjä pyytää. Linkit: haaralinkki = aina uusin (välimuistiviive), commit-linkki = tarkka versio heti (selitetty käyttäjälle, kirjattu CLAUDE.md:hen).
Työtapa: välikommentit heti, sitten jatketaan; 1–5 tarkentavaa kysymystä per kohta;
kun käyttäjä ei voi vastata, tee kohdat joihin vastauksia ei tarvita ja kirjaa oletukset.
1. Eläinmallit kuntoon (peuran jalat irti rungosta) – TEHTY v0.81.
2. TEHTY v0.83. Mobien spawnaus: yöllä suurin osa, vähän kauempana (jahtaavat); osa lähelle mieluiten esteen taakse. Päivällä max 2, vain tiheä metsä /
   suo / kuiva biomi; tumma aarnimetsä hyvin todennäköinen, hirviöt siellä 20 % nopeampia + ilmoitus biomille astuessa.
3. TEHTY v0.82. Uusia biomeja + nimet; nykyinen biomi näkyy, repussa biomin ominaisuudet; "Uusi alue löydetty: …" fade in/out vain ensimmäisellä kerralla
   (aloitusbiomi merkitty löydetyksi ilman ilmoitusta).
4. TEHTY v0.84. Tuulensuunta: vaihtuu hitaasti satunnaisesti (minuutteja, kääntyy hitaasti); kartalla suunta ja nopeus; pilvet liikkuvat tuulen suuntaan.
5. TEHTY v0.85–v0.88. 4 uutta eläintä (samaa tyyliä) + 2 joskus vihamielistä + harvinaisia pelottavia (seuraa 30–60 s, poistuu 5 s ja unohtaa); luonteen mukaiset
   säikähdys/reaktiot. Karhu: iso, lyö kauas ja nopeasti, kaataa eteen jäävät puut tukeiksi, HP 200 % pelaajasta, palautuu jos ei lyöty 1 min.
6. TEHTY v0.89. Kalmanvartija: harvemmin liuku/ryntäys, iskulla pidempi viive. Kaikki kiviä heittävät pomot: kivi 30 % hitaampi, hyökkäysviive +10 %.
7. TEHTY v0.90. Haarniskoille kunnon painavat erottuvat mallit.
8. TEHTY v0.91. Ulottuvuuksien mobeille enemmän yksityiskohtia (vaatetus, koristeet, silmäanimaatiot, liekit silmissä).
9. TEHTY v0.92. Hirviöille (sammalhiisi, kalmo) harppaavammat askeleet, lyöntiulottuma +10 %.
10. TEHTY v0.95. Kalmanvartija vajoaa maahan (ei katoa) ilmoituksen aikana, maapartikkeleita.
11. TEHTY v0.96. Kuokka nostaa maata enemmän, oikea klikkaus palauttaa alkuperäisen värin; lapio syvempi kuoppa, oikea klikkaus = ruskea polku.
12. TEHTY v0.97. Aluevartijat: alue ×2, jäävät rajalle taistelemaan, 1–10 s päästä palaavat, kunnes huomaavat pelaajan taas.
13. TEHTY v0.98. Kivikasat arkun ympärillä liian tiiviit – arkulle pääsy.
14. TEHTY v0.99. Hylätyt leiripaikat (1–2 / kartta): sammunut nuotio (sytytys puulla), teltta jossa sänky.
15. TEHTY v1.00. Ruoho: pystyheinää laajalti, eri pituuksia, heiluu tuulessa (kallistuu tuulen suuntaan); grafiikka-asetus pois/oletus/täysi.

### Käyttäjän ideat 0–11 (erät 23–31) – ryhmittely teemoittain
Kirjattu v0.35:n jälkeen. Jokainen erä: testaa, päivitä muistio, versio+`?v=`, commit, push, PR. Järjestys on ehdotus; ensimmäinen on 23.

**Erä 23 – Hahmo ja animaatiot (0.1, 0.2, 0.4, 0.8)** – TEHTY (v0.36)
1. Hahmo laihemmaksi, vähemmän palloinen, litteämmät pinnat; kädet taittuvat kyynärpäästä (olkavarsi + kyynärvarsi), jalat polvesta (reisi + sääri); jalat joustavat hypyssä ja iskussa, käsi taittuu iskussa.
2. Kääntyminen kursoria kohti ei ole hetkellinen: pieni viive (~.18 s) iskun alussa jonka aikana hahmo kääntyy. Kyykky (C) kunnolla: polvet koukussa, kädet levällään, toinen käsi pitkällä eteen (vaanimisasento, melkein polvistuminen).
3. Kirveen isku viistoon, vuorotellen vasen-ylhäältä ja oikea-ylhäältä viistosti alas.
4. Keihäs: isku kääntää kärjen kohti kohdetta (työntö kohti kohdetta, ei suoraan eteen).

**Erä 24 – Puut ja hakkuu (0.3, 0.7)** – TEHTY (v0.37)
1. Kaadettu runko saa alkuperäisen puun värin (kuori), oksat jäävät rungon sivuille ja irtoavat kaatuessa; oksat uppoavat hitaasti maahan ja katoavat.
2. Kaadettua runkoa lyödessä sen pinnalle ilmestyy ruskeita (kuoren sisäväri) lohkeamia; joka iskulla puupartikkeleja ja isompi kolo.
3. Mitä isompi puu, sitä kauemmin hakkuu; kaatuminen alkaa hitaana, kaatuessa lähellä pelaajaa ruutu tärähtää.

**Erä 25 – Eläimet, viholliset ja terveyspalkit (0.5, 0.6, 4)** – TEHTY (v0.38)
1. Eläimet säikähtävät jo kaukaa kun pelaaja juoksee kohti, vielä kauempaa jos kädessä vahinkoa tekevä ase/työkalu; kävellessä vasta lähempää. Vahingoitettu eläin pelkää 10 s ja juoksee satunnaisiin suuntiin kauemmas.
2. Vahingoitetun eläimen/mobin terveyspalkki + numero (10 s iskusta; lähellä ja kun katsoo sitä; bossit ja vaikeat jo kaukaa katsottaessa), palkin alla pääkalloja vaikeustasosta, palkki pitenee/monikerroksinen (1 kerros ≈ pelaajan terveys), pahimmat bossit parantuvat 30 s iskuttomuuden jälkeen.
3. Vihollinen huomaa pelaajan aina 10 s sen jälkeen kun pelaaja vahingoitti sitä (myös jousella), muuten tarvitaan läheisyys.

**Erä 26 – Taivas ja pilvet (0)** – TEHTY (v0.39; grafiikka-asetukset erässä 29)
1. Pilvet suuremmiksi, leveämmiksi ja realistisemmiksi (taivaalle levittäytyviä), koko säästä riippuen; kaukana sumeat/häipyvät (optimointi); pilviä hieman matalammalle; selkeällä säällä aurinko paistaa sumun/pilvien välistä; realistisempi taivas (asetuksiin myöhemmin yksinkertaistus).

**Erä 27 – Valo ja soihtu (0.9, 0.99)** – TEHTY (v0.40)
1. Tulet/valot heittävät varjoja ympäröivien esineiden taakse pimeällä (ei päivänvalossa ulkona).
2. Käsisoihtu sammuu sateessa (sateen alla), syttyy kun vie toisen liekin viereen; soihtu kuluu käytettäessä (mittari, 1 min yhteensä, sateessa 20 % nopeammin), sammuessa liekki ja valo katoavat.

**Erä 28 – Maasto ja työkalut (1)** – TEHTY (v0.41)
1. Lapio: vasen klikkaus tekee maasta multaisemman ja tummemman (polut). Uusi kuokka: nostaa maanmuotoja ja vähentää multaisuutta (palauttaa alkuperäiseksi).

**Erä 29 – Valikko, asetukset ja tallennus (1.1, 1.2, 1.3, 9)** – TEHTY (v0.52)
1. Asetuksiin lista kaikista näppäimistä; keybind-vaihtovalikko (oma pieni, varmistus, ei päällekkäisiä/kiellettyjä näppäimiä).
2. Pelivalikko hienommaksi teemaan sopivaksi; BUG: Tallenna-nappi avaa asetusvalikon – korjaa; tallennuskoodi tiivistetympi (lyhyempi muoto) + lataus/tallennus .txt-tiedostona.
3. Hiiren rulla hotbarin selaukseen (kuten Minecraft), zoom manuaalisesti jos toggle päällä.
4. Grafiikka-asetusvalikko joka muistaa valinnat (localStorage): varjot (siirretään), puiden heiluminen, partikkelien määrä, detaljien määrä, piirtoetäisyys, rakennusten detaljit.

**Erä 30 – Kartta ja piirtoetäisyys (2, 8, 10)** – TEHTY (v0.53)
1. Kartan löydetty alue sileämmäksi ja hienojakoisemmaksi; löytämättömät paikat piiloon (pilvisumu); karttanäkymässä pilvet liikkuvat (vain kun auki), kartan zoom, rakennukset ylhäältä pikseleinä.
2. Minimapin 3 zoomitasoa näppäimellä (oletus nykyinen).
3. Piirtoetäisyys (render distance) Minecraft-tyyliin: sumu piirtoalueen reunalla; etäisyyden päässä partikkelit/animaatiot/visuaalit pois.

**Erä 31 – Maailma, ulottuvuudet ja tarina (3, 5, 6, 7)** – TEHTY (v0.54)
1. Hautakumpu ja löydöt näyttävämmiksi; portti luolamaisesti kumpuun; uusia löytöpaikkoja (rakennuksen jäänteet, kivet+arkku) karttaan; kohteita suojelevia mobeja.
2. Lisää labyrintti-ulottuvuuksia portteineen ja bosseineen; isoja, vaihtelevia pohjia (arvonta uuden pelin alussa, vanhoissa portaaliin mentäessä); portin spawn-suoja 3 s (ei iskuja), mobit eivät spawnaa portin lähelle.
3. Tarina: riimukivien tekstit vaihtelevat ja antavat vihjeitä/tehtäviä (yläkulman tehtävä); osa portaaleista lukittu (avain/esine kartalta).

**Raportti (11):** pelin ongelmat/rasitteet raportoidaan käyttäjälle erillisenä (tehty erän 23 yhteydessä).

### Käyttäjän 19 ideaa ryhmiteltynä kolmeen erään (tulkinnat sovittu käyttäjän kanssa)
Tulkinnat: hahmo = pehmeä low-poly (sylinterit/pallot, ei ulkoisia malleja); taso kasvaa kokemuspisteistä (tavoitteet,
saavutukset ja teot), saavutukset antavat pysyviä pieniä bonuksia; "palkki" = rakennusosa.

### Erä 20 – rakennus ja valikot (ideat 1,2,3,6,7,9,10,11) – TEHTY (ks. versioloki v0.20)
1. Puutekstuurit yhtenäisiksi: seinän tumma pylväs pois; kaikki puuosat `MAT.wood` ja UV:t metrisiksi (`bxw()`), aidat ja portaat
   eivät enää tiheitä. Ovi kaksipuoleinen: ripa molemmilla puolilla, aukeaa pelaajasta poispäin, sarana pysyy samassa kohdassa.
2. Pystykohdistus: H vaihtaa pysty-snappia (pois / pysty G/2-askelin / 3D-ruudukko = pystyviivat + kerrostasot).
3. Hiiren oikean napin selainvalikko pois (`contextmenu` estetty kaikkialla) ja oikealla avattu B-valikko ei klikkaa korttia.
4. Valikot puuteemaisiksi ja läpinäkymättömiksi; puuttuva aines punaisella "0/12"; kategoriat: valmistusvalikko (Alkupeli oletus,
   Työkalut, Aseet, Varusteet, Ruoka, Muut) ja rakennusvalikko (Alkupeli oletus = vain puuosat, Puu, Kivi, Terva, Katot, Kivikatot,
   Kalusto ja työpisteet, Valo ja puolustus).
5. Tynnyri (säilytys 10 paikkaa) ja kehitysnappi: arkku 16→24→32, tynnyri 10→16→22, reppu 32→40→48→56 (aineet maksavat).
6. Pylväät: ohut, lyhyt ja pitkä; ikkunaseinä (neliöreikä); puoli- ja neljännesseinät (matala G×WH/2, kapea G/2×WH, neljännes).
7. Palkin Shift+R: 5 asentoa 0–90° (22,5° välein) kaiteita varten.
8. Tikkaat (kiivettävät, 3 kaltevuutta Shift+R) ja uudet ontot portaat (vain askelmat ja sivupalkit, 3 jyrkkyyttä Shift+R);
   nykyiset portaat nimeltään Raput. Kiviversiot järkevistä osista (`kivi_*`) ja kivikatot omaan kategoriaan.

### Erä 21 – hahmo, taivas, valo ja tilat (ideat 4,5,8,12) – TEHTY (ks. versioloki v0.21)
1. Pelihahmo uusiksi pehmeällä low-polylla: pyöreät raajat, kiharat hiukset ja parta (ei hattua), alkuasukasvaatteet (nahka/turkki);
   uudet työkalumallit (kirves, hakku, miekka, lapio, vasara, keihäs, nuija, soihtu, jousi, kilpi).
2. Kontrastimpi valaistus: syvemmät varjot (matalampi hemi/amb, vahvempi aurinko), voimakkaammat valonlähteet.
3. Tilaefektit (nälkä, kylmä, märkä, pahoinvointi, ylikuormitus, levännyt, voimistunut) vaikuttavat kykyihin (nopeus, kestävyyden ja
   terveyden palautuminen, vahinko); lista repun Tilat-osiossa, hiirellä kohteen päällä lisätiedot ja jäljellä oleva aika.
4. Taivas: liikkuvia, tuuheita pilviä sään mukaan, aurinko ja kuu pilvien takana, pilvet tummuvat ennen myrskyä (pilvi → sade →
   myrsky), pilvet välkkyvät, harvinaiset näkyvät salamat.

### Erä 22 – ruoka, tuli, viholliset, jousi, saavutukset ja taso (ideat 12b,13–19) – TEHTY (ks. versioloki v0.22)
1. Uudet esineet ja monipuolisemmat reseptit (köysi, hiili, paistettu sieni, jne.).
2. Grillinuotio: teline 4 ruoalle, jokaisella oma vaihteleva ajastin; kypsyy (liha → paisti), 2× ajalla ylipaistuu → hiili.
3. Hiili polttoaineena (10× puu): nuotio, sulatin, pystysoihtu (aika 5 min, puu nollaa 10 min, hiili 30 min).
4. Viholliset pelkäävät tulta (soihtu kädessä, palava nuotio/pystysoihtu) ja kävelevät pois päin.
5. Viholliset murtavat ovia ja ikkunoita: ikkunat ja avoimet ovet eivät estä näköyhteyttä; vihainen mobi menee lähimmälle ovelle/ikkunalle
   ja hajottaa sen (2× vahinko).
6. Jousi: pidempi lataus, vajaalla latauksella vähemmän vahinkoa ja voimakkaampi kaari, laatu/kehitys nopeuttaa ja suoristaa;
   jousimalli oikein päin (jänne pelaajaan päin, nuoli ja jänne näkyvät vedossa).
7. Saavutukset (pysyvät bonukset: kantokyky, max terveys, kestävyys, pieni nopeus), pelaajan taso ja XP, paljon uusia yksinkertaisia
   tavoitteita, reseptit ja harvinaiset esineet aukeavat tasoilla.

### Erä 16 – korjaukset ja ylläpito – TEHTY (ks. versioloki v0.16)
- Putoamisvahinko ×2, maassa olevat esineet katoavat 5 min jälkeen, kaikki eläimet tarvitsevat
  näköyhteyden huomatakseen pelaajan, vasaralla korjaus (F), ei päällekkäisiä samoja rakennuksia.

### Erä 15 – pelattavuuskorjaukset – TEHTY (ks. versioloki v0.15)
- Ukkosen ääni pois, myrsky kaataa harvoin puita (alle jäävä −80 % HP), mobien ulottuvuus kaikkiin
  suuntiin, pehmeämpi kamera, kasvit/puut vain uusiutuvat eivätkä tukikohdan lähelle.

### Erä 17 – maailma: puiden uusiutuminen paikalleen, sade, valo, lapio – TEHTY (ks. versioloki v0.17)
Versio 0.17, `?v=0.17`, tallennusversio 6.
1. **Kaadettu puu uusiutuu vain lähelle (≤5 m) kaatopaikkaa** ja on täysin normaali puu (törmäys, hakkuu,
   kaatuminen, tukit, myrsky). Tee `respawnTree(n)` (resources.js), jota sekä `respawnNodes()` (ai.js) että
   `regrowForest()` kutsuvat `reviveNode`n sijaan puille: arvo enintään 10 kertaa uusi piste ≤5 m
   alkuperäisestä (`n.ox,n.oz` = alkuperäinen paikka, tallenna `initNode`ssa), hyväksy jos `terrainH>1`,
   `biomeAt` on sama kuin ennen, `!nearBase`, `nodesNear(x,z,2.5)` tyhjä (ei muita solmuja) eikä 20 m
   sisällä `LOC`-paikoista; muuten jää alkuperäiseen paikkaan. Siirto: `gridRemove(n.col)` + uusi
   `addCircle`, `ngridRemove/ngridAdd`, `n.y=terrainH`, uusi koko `treeS()` (aarnipuu .8–1.15), `maxHp=hp·s²`,
   `setNodeMatrix`. Ruudun instanssi saa jäädä vanhaan ruutuun (rajauspallossa +30 m varaa).
   Tallennus: `moved:[[id,x,z,s]]` siirtyneille → `loadData` palauttaa paikat ennen `nodes`-listaa (v6).
   Kasvit (marjat, sienet) samoin ≤3 m.
2. **Sade ei tule katon/rakennusten läpi:** sadepisaroille oma pysähtymiskorkeus. Kun pisara syntyy
   (render/environment `rain`-silmukka), laske maailmakoordinaateissa `stopY = max(terrainH, korkein
   rakennuslaatikon yläpinta kohdassa x,z)` (`gridQuery` + `c.t==='b'&&c.owner&&c.owner.t`), tallenna
   `Float32Array`iin. Pisara uudelleensyntyy kun `y < stopY`. Älä tee raycastia joka kehys.
3. **Valo ei tule seinien/katon läpi (yksinkertainen):** `indoorK` (environment.js): suojassa (`shelterCache`)
   ja seiniä ≥5/8 suunnassa 6 m säteellä (8 vaakasädettä `pieceRoots`-raycastilla, päivitys 0,5 s välein) →
   lerp kohti 1. Kerro `hemi`, `amb` ja `sun` (1−.65·indoorK); tulet ja soihdut (`LIGHTS`, `torchLight`)
   ennallaan. Varmista että kaikki rakennusmeshit `castShadow` (paitsi olkireunus) ja seinäsaumat eivät vuoda
   (seinän pituus G+.02).
4. **Lapio (maanmuokkaus):** esine `lapio` (`cat:'shovel'`, `equipGroup` → 'weapon'), resepti työpenkki:
   puu 4, kivi 2, kuvake ja malli (`makeHeld`). Hiiren vasen: tasoittaa maata katsottavassa kohdassa
   (`camRayPoint`, ≤6 m) säteellä 2,5 m kohti pelaajan jalkojen korkeutta, enintään ±.4 m/painallus,
   pehmeä reuna (`sstep`), kestävyys −6. Muokkaa `HGT`-ruudukkoa (GS=2 → ~3×3 kärkeä), päivitä
   maastoverkon `position` + normaalit (tallenna verkko globaaliin `terrainGeo` render.js:ssä; laske
   normaalit vain muokatulle alueelle tai koko verkolle kerran per painallus), siirrä alueen solmut
   (`n.y`, `setNodeMatrix`, törmäysympyrä). Ei rakennusten päälle (`nearBase` ei estä, mutta
   `pointBlocked`/rakennuslaatikot alueella → "Rakennus on tiellä."). Tallennus: `terra:[[i,h]]` muutetut
   kärjet (v6). Kartta-kuvaa ei tarvitse päivittää.

### Erä 18 – rakentamisen kohdistus – TEHTY (ks. versioloki v0.18)
Versio 0.18. Kohdistustila `snapMode` (building.js), vaihto **G**, tila näkyy `#buildhint`issä.
1. **Kohdistus suosii rakennettua osaa:** `buildRaycast` – jos osa osuu ≤1 m kauempana kuin maa, valitse
   osa. Lattia/seinä maahan, kun vieressä (≤1,6·G, |Δy|<1,5) on lattia: käytä sen korkeutta ja kohdista
   x,z sen ruudukkoon (`floor.x+k·G`), ei maailman ruudukkoon.
2. **Tilat:** `ruudukko` (oletus; läpinäkyvä `THREE.GridHelper` 10×G haamun ympärillä haamun korkeudella,
   näkyy vain vasara kädessä), `puoli` (G/2-askeleet), `vapaa` (ei kohdistusta, 0,25 m askel), `reuna`
   (katsottavan osan lähimpään reunaan jatkoksi osuman pinnan normaalin suuntaan: seinän päälle, viereen,
   lattian jatkoksi).
3. **Ei välkkymistä (z-fighting):** `addPiece`ssa pieni mittakaava-ero `1+((x·7+z·13)&3)·.0015`, lisäksi
   `polygonOffset` lattioille. (Päällekkäisten samojen osien esto tehtiin jo erässä 16.)
4. **Palkki** kahdessa koossa: `palkki` (pituus G, .22×.22) ja `palkki_iso` (2·G, .3×.3), puu 1 / 2,
   snap 'wall', asettuu seinän yläreunaan tai lattian reunaan, R kääntää.
5. **R kääntää 45°:** `buildRot` 0–7, `rotation.y=rot·π/4`. 45°-kierrolla törmäys: jaa laatikko pitkän
   akselin suuntaan ~0,4 m paloihin ja kierrä keskipisteet (AABB-palat). Tallennus v7: `r` kahdeksasosina,
   v<7 → `r*2`.

### Erä 19 – katot ja kolmiot – TEHTY (ks. versioloki v0.19)
Versio 0.19. (Käyttäjän ideat 15–16 tehty tässä: kolmioiden tekstuuri samaan mittakaavaan kuin seinät, vinoseinä pysyy
suorakulmaisena ja päätykolmio on tasakylkinen kattoon sopiva kolmio.)
1. **Päätykolmio tasakylkiseksi:** `kolmio` = pohja G, kärki keskellä korkeudella G/2 (sopii yhden ruudun
   harjakaton päätyyn ja parittoman talon katon kärkeen). Vanhat `kolmio`-tallennukset muuttuvat
   automaattisesti uuteen muotoon (sama tyyppi).
2. **Tylpempi olkikatto** `katto_loiva` (nousu G/2 / G, 8 viipaletta yläpinta G/16·(i+1)) ja **harjakatto**
   `harjakatto` yhden ruudun kokoisena: kaksi lapetta, harja ruudun keskellä korkeudella G/2,
   viipaleet symmetrisesti, olkireunus molempiin päihin.
3. **Neljä asentoa:** päätykolmio ja vinoseinä: R vaihtaa asennon (normaali, peilattu, ylösalaisin,
   ylösalaisin peilattu), Shift+R kääntää suuntaa. Kenttä `p.f` (0–3, tallennukseen `f`).
   Peilaus `scale.x=-1`, ylösalaisin kierto keskikohdan ympäri; törmäysviipaleet lasketaan asennon mukaan.

### Erä 14 – Aarnimetsä, sumu ja kartan pilviverho – TEHTY (ks. versioloki v0.14)
- Roikkuvat havuoksat, iso alue ja pensaat, sumuisempi ja pimeämpi peli, pimeä kartta.

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

### Käyttäjän 11 ideaa (v0.62 jälkeen) – erät 35–38
**Erä 35 – Pelattavuus ja korjaukset (2, 3, 4, 5, 8, 10)** – TEHTY (v0.63)
1. Myrsky kaataa puita ~1 / 5 s 100 m säteellä (oikea kaatumisfysiikka). 2. Koivun oksat näkyvät jo pystypuussa ja ovat samat, jotka irtoavat.
3. Mobien nopeus −15 %. 4. Käsisoihtu palaa 100 % kauemmin. 5. Salaman välähdys kevyemmäksi. 6. Leijuvat luut/koristeet maahan.

**Lisäpyynnöt v0.63:n jälkeen (12, 13 + korjaukset)** – TEHTY (v0.64)
12. G-valintaan 3D-ruudukko (vaaka + pysty); normaali ruudukko kohdistaa oikeasti; seinän yläkulmasta ehdotus rakentaa päälle.
13. Ähky vain kun palkki on jo täynnä ja syö uudelleen, kesto 30 % lyhyempi. + Koivun oksat näkyviksi, auringon neliö → pyöreä hehku.

**Erä 36 – Pomot ja saalis (6, 7)**
1. Pomon terveyspalkki kerroksina: 1 palkki = pelaajan maksimiterveys (esim. 340 hp / 100 → 3,4 palkkia päällekkäin), luku palkin alla.
2. Maailman arkut: parempaa ja monipuolisempaa saalista. Ulottuvuuksien arkut ja tynnyrit: tosi hyvää saalista, ~40 % todennäköisyydellä
   valmis hyvä työkalu/ase.

**Erä 37 – Piirtoetäisyys ja optimointi (1, 9)**
1. Piirtoetäisyys vapauttaa muistia: maasto ruutuihin, rajalla vahva sumu/blur, rajan takana maastoa, puita, kiviä ja objekteja ei piirretä.
2. Yleinen optimointi ilman suuria visuaalisia haittoja.

**Erä 38 – Mobien mallit (11)** – yhdistetty eriin 44–45
1. Kaikki eläimet ja hirviöt pelaajahahmon tyyliin (ei palikkamaisia): pehmeät low-poly-muodot, nivelet, yksityiskohdat.

#### Käyttäjän päivityslista (v0.65 jälkeen, 8 kohtaa) – vastaukset tarkentaviin kysymyksiin kirjattu

**Erä 39 – Tavarat ja päivitykset (3, 4, 5)** – ✅ tehty v0.66
1. Päivityksen esikatselu: päivitysnappi avaa ensin alle listan "mitä muuttuu" (nykyinen → uusi arvo) ja vasta sen alla oleva
   **Päivitä nyt** tekee päivityksen. Koskee kaikkia päivityksiä: tavarat ★, reppu, arkut ja tynnyrit.
2. Ominaisuudet repussa: tavaraa napsauttamalla nykyinen tietopaneeli näyttää nimen isolla ja kaikki ominaisuudet listana
   (esim. soihtu: palamisaika jäljellä / max).
3. Käsisoihtu ★-päivitettäväksi: palamisaika +50 % per taso (★1 120 s, ★2 180 s, ★3 240 s). Seisova soihtu ennallaan.

**Erä 40 – Varjot, kartta ja oksat (2, 6, 7)**
1. Pelaajan varjo seisovasta soihdusta: uusi korkein päivitysnopeus **Joka ruutu** (vain pelaajan soihtuvarjo). Automaattinen
   varjolaatu siirretään Varjot-sivulle.
2. Kartta ja minikartta: maaston pikselikuva piirretään uudelleen vain tapahtumasta (rakennus/purku, puun kaatuminen, uusi alue
   paljastuu), ei jatkuvasti silmukassa. Mobien punaiset pisteet ja pelaaja päivittyvät normaalisti.
3. Grafiikka-asetus "Puiden oksat": pois päältä → ei oksia pystypuissa eikä kaatuessa, ei maahan jääviä paloja. Lastut ja pöly lyödessä jäävät.

**Erä 41 – Haarniskat ja äänet (1, 8)**
1. Nahkavaatteet: uusi tekstuuri ja paksumpi malli, vaaleat reunat, siteet, selässä repeävä roikkuva nahkaliuska joka heiluu kävellessä.
   Muille haarniskoille (kupari, rauta, hiidenpanssari) omaan tyyliinsä sopivat yksityiskohdat.
2. Äänet: puun kaatuminen ja tömähdys matalammaksi, viimeinen isku ennen rungon katkeamista hieman kimeämpi, kaikkiin toistuviin
   ääniin pieni satunnainen sävelkorkeuden vaihtelu (jokainen lyönti hieman eri). – ✅ tehty v0.68 (erä 43)

**Erä 42 – Ehdotukset ja haku** – ✅ tehty v0.67
1. Rakennusvalikon ja valmistuksen ensimmäinen (oletus)välilehti "Ehdotukset": todennäköisesti seuraavaksi tarvittavat ja ne,
   joihin aineet ovat jo valmiina. Alkupeli toisena.
2. Haku kummassakin valikossa (rakennusosat / tavarat).

#### Käyttäjän päivityslista (v0.67 jälkeen, 5 kohtaa)

**Erä 43 – Ote, jousi, Kalmanpesä ja äänet (1, 3, 4, 5)** – ✅ tehty v0.68
1. Vasen käsi paremmin kiinni kirveen varteen.
2. Mob-spawnerit (Kalmanpesät) tuhottaviksi hakulla.
3. Jousi oikein päin pelaajan kädessä, myös vedossa.
4. Äänien sävelvaihtelu hakatessa; puun tömähdys maahan matala; tukin lyönti ja viimeinen isku omat äänensä; sama kaikkeen tuhoamiseen.

**Erä 44 – Pomot ja humanoidit yksityiskohtaisiksi (2)** – ✅ tehty v0.71 (ulottuvuuksien pomoista vain runko, ks. 44b)
1. Pomot ensin (käyttäjän kuvissa Kalmanvartija ja Kalmon ylimys): pelaajahahmon tyyli (pyöristetyt low-poly-muodot, nivelet kyynärpäissä
   ja polvissa, kasvot, vaatteet/haarniska, yksityiskohdat), sitten ulottuvuuksien pomot (Jäätär, Kalmaherra, Aarnihirviö).
2. Humanoidit: kalmo, hiisi, kivivartija, routa- ja muut ulottuvuuksien viholliset.

**Erä 44b – Ulottuvuuksien pomot kokonaan uusiksi**
1. Jäätär, Kalmaherra ja Aarnihirviö: laatikkomaiset lisäosat (kylkiluut, olkapäät, sarvet, viitat) pyöristetyiksi ja nivelellisiksi
   samaan tyyliin kuin Kalmanvartija ja ylimys v0.71.

**Erä 45 – Eläimet yksityiskohtaisiksi (2)** – ✅ tehty v0.72
1. Peura, karju, susi, routasusi ja muut nelijalkaiset: pehmeämmät muodot, nivelletyt jalat, pää ja häntä, turkki- ja sarviyksityiskohdat.

### Avoimet: käyttäjän ehdotuksista toteuttamatta tai osittain (tarkistettu v0.62, koko keskusteluhistoria käyty läpi)
1. **Portaalisuoja ei estä pelaajan omia iskuja** (kohta 5: "silloin pelaajakaan ei voi lyödä ketään"). Nyt suoja estää vain vihollisten
   iskut ja jahdin.
2. **Tehtävät eivät ohjaa yksittäisille riimukiville** (kohta 6, esim. "löydä riimukivi vuoristosta"). Riimukivet A–F antavat vihjeitä,
   mutta tehtäväketjussa on vain rannan riimukivi.
3. **Taivaan yksinkertaistus asetuksista** (kohta 0): pilvien määrä ja valonsäteet säädettävissä, mutta yksinkertaista taivasta
   (ilman taivaskupolin varjostinta, tähtiä tai kuuta) ei ole.
4. **Piirtoetäisyys ja muisti** (kohta 10): kaukana olevaa ei piirretä eikä animoida, mutta tiedot (puut, kivet, maasto) pysyvät muistissa,
   ja maasto on yksi kokonainen verkko (sumu peittää kaukaisen osan). Maaston paloittelu ruutuihin olisi seuraava askel.
5. **Ctrl kyykyksi / Ctrl+W:n esto** (kysymys): selain ei anna estää Ctrl+W:tä, joten Ctrl ei sovi kyykylle; kyykky on C (vaihdettavissa).
- Omia jatkoideoita (ei käyttäjän pyyntöjä): pata ja keitot (grillaus tukee vain lihaa ja sientä), huonekalujen kohdistus ruudukkoon.

## Tunnetut puutteet

- Katon reunat eivät liity siististi toisiinsa (katoilla on törmäys erästä 8 alkaen).
- Huonekalut (työpenkki, sänky, arkku) eivät kohdistu ruudukkoon.
- Hiiren lukitus voi olla estetty joissain upotetuissa näkymissä. Silloin kamera käännetään vetämällä.
