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

## Nykytila (päivitetty v2.10)

- **Versio 2.10**, haara `claude/hiidenmaa-survival-game-fmxt0m` (aloitettu uudelleen mainista PR #25:n yhdistämisen jälkeen). **PR #25** (v1.38–v1.83) on **yhdistetty**. PR #27 (v1.84–v1.95) on **yhdistetty**. Uusi PR [#28](https://github.com/erboiyprogamer-source/hiidenmaa/pull/28) (v1.96–v2.10). Aiemmin #27: äänierä A (v1.84–v1.86: äänet, Aarnihirviön äänet pääääneksi, kaiku ulottuvuuksiin). **JATKA TÄSTÄ (äänet):** käyttäjä lisää olentojen ääniä erissä → noudata "Äänierän rutiini"; korvattavia: `aarnihirvio_idle_1`/`chase_2` ovat sama tiedosto (käyttäjä sanoi, ettei haittaa toistaiseksi). Aiempi:
  `main` = v1.37. Kaikki käyttäjän pyynnöt tehty: päivityslistat 4 (v1.39–v1.44), 5 (v1.49–v1.52) ja 6 (v1.53–v1.57) sekä valikon ja
  logon uudistukset (v1.45–v1.48). Seuraava työ: uusi lista käyttäjältä.
- **Koko pelin tarkistus v1.57** (6 karttaa, päivä/yö, kaikki 22 vihollistyyppiä, 3 ulottuvuutta + pomot, Hautakumpu, tallennus/lataus,
  8 grafiikkatasoa): 0 virhettä, 0 NaN; `tools/tarkistus.mjs` KAIKKI OK.
- **Avoimet huomiot (eivät bugeja):** (1) ensimmäinen yö on kova – paikallaan seisova pelaaja kuolee aloituspaikalla ~30 s:ssa;
  (2) Ultra jopa ~830 piirtokutsua (heikoille koneille suorituskykytesti valitsee kevyemmän). Aiempi huomio "isojen taisteluiden jälkeen
  +100 objektia" selvitetty: se oli pudonnutta saalista, joka katoaa 5 min:ssa (ks. katoamisajat OMINAISUUDET.md) – ei vuoto.
- **Katoamisajat:** osumaläiskät ja pisaraläiskät 10 s, vihollisen lammikko ja ruumis 9,4 s (tavallinen ja tuhka), pelaajan lammikko
  60 s, valumanoro 40 s, läiskiä enintään 140, ilmassa oleva pisara 3 s, juuttunut nuoli 6 s, maassa oleva esine 5 min (vilkkuu
  viimeiset 15 s; arvoesineet siirtyvät arkkuun), pelaajan ruumis/tuhkakasa uudelleensyntymässä.
- Testauksen huomiot: headless-testissä CSS-animaatiot eivät etene raskaan 3D:n aikana (tarkista ulkoasu animaatiot pois tai ilman
  pelin skriptejä), ulottuvuuden rakennus kestää testikoneella sekunteja (`waitForFunction`), suorituskykytesti ja aloitusjakso
  ohitetaan automaatiossa (`navigator.webdriver`; `?perf=1` ja `?splash=1` pakottavat; testinäkymän kuva: `preserveDrawingBuffer` + toDataURL, ruutukaappaus on liian hidas). Uusi maailma alkaa tilassa `intro`. Jousen
  narua mitatessa katso pätkien päätepisteet (KORJAUKSET 30). Testipalvelin: käynnistä taustakomentona pitkällä aikarajalla.

## PR #25 – yhteenveto (v1.38–v1.83, valmis yhdistettäväksi)

#### Korjaukset ja perusta
- **v1.38** – "Script error" vuorilla porttien lähellä korjattu (ruohon piirto).
- **v1.58** – Välimuistin vanhat tiedostot tunnistetaan, ja peli neuvoo käyttämään commit-linkkiä.

#### Päivityslista 4 (v1.39–v1.44)
- **v1.39** – Kyykky ja hiipiminen, ylämäen hidastus, selkäesineet, esineet maassa 3D:nä, pomot ja vartijat, kilpi, vihollisten terveyden vaihtelu, veren fysiikka, portaat.
- **v1.40** – P = päävalikko (Esc ei enää sotke peliä), opasteet, reppunapsautukset, omat säätimet, arkku avautuu katseella.
- **v1.41** – Lumi ja sade, seinäsoihtu, soihdun sytytys, uudet arkut.
- **v1.42** – Ulottuvuuksien saalis, Kalmaherran tulilinjat, jousikalmot.
- **v1.43** – Latausnäyttö (riimukivi), suorituskykytesti, uuden maailman alkulento, Tauko/Käynnissä-tila, aluebannerit.
- **v1.44** – Optimoinnit asetuksiin (maaston LOD, kohteiden yhdistäminen, varjojen harvennus).

#### Valikko (v1.45–v1.48)
- Latausnäytön leimahdus, päävalikon uudistus, esiasetussäätimen teemat, 7 satunnaista logoteemaa.

#### Päivityslista 5 (v1.49–v1.52)
- **v1.49** – Tallennettu-ilmoitus, jousen tähtäin, kyykkyammunta ja tiputusristikko.
- **v1.50** – Yöolennot palavat auringossa.
- **v1.51** – 10 uutta valikkotaustaa, myrskyn sade, eeppinen portaali.
- **v1.52** – Uusi maailma latausnäytön takana, pilvet aukeavat.

#### Päivityslista 6 (v1.53–v1.57)
- **v1.53** – Kävelyn keinunta pois, piikivikirves.
- **v1.54** – Kääntymisen ja osoittimen herkkyys, nopeampi virtuaaliosoitin.
- **v1.55** – Ensikäynnin aloitusjakso (EricStudios & KSPK-tech → HIIDENMAA → varoitus).
- **v1.56** – Ultra-veri, lätäköt rinteen mukaan ja valuvina, jousi ja nuolet selässä.
- **v1.57** – Jousen naru oikein päin, ote kahvasta, osumamerkki, Q-pudotus pikapaikasta, kirveen iskun pyörähdys pois.

#### Aloitusjakso ja käynnistys (v1.59–v1.73)
- **v1.59** – Studionimet allekkain, Esc-varoitus, näkyvä FPS-testi ja selvä tulos.
- **v1.60** – Käynnistys uusiksi: jakso ja testi ennen latausta, joten animaatiot eivät pätki. Latausnäytössä riimut täyttyvät ja vaalea leimahdus tulee vasta latauksen jälkeen. Uusi `js/boot.js`.
- **v1.61** – Myrskytaustan sade tuulen suuntaan, FPS-tuloksen suositusteksti.
- **v1.62** – Intro vain ensimmäisellä käynnillä (ei maailman luonnissa), uusi kolmikerroksinen pilviverho heikoille koneille.
- **v1.63–v1.64** – HIIDENMAA-otsikko pelkällä häivytyksellä, palaavalle kävijälle lyhyt otsikko, lyhyemmät ajat, Windows-yhteensopivuusrivi ja -ikoni.
- **v1.65** – FPS-testi 7 s ja realistisempi.
- **v1.66** – Logo nousee mustasta savusta ja vajoaa mustaan, ohitusteksti vain palaavalle.
- **v1.67, v1.69** – Uusi riimusiirtymä: kehä piirtyy, riimut tavaavat HIIDENMAA, sininen ᚺ ja kaartuva riimurivi.
- **v1.69** – FPS-testi kuormaportain kaikille 8 tasolle (Ultra, kun indeksi ≥ 140); tasaantumisnopeus ja tasaisuus vaikuttavat tulokseen.
- **v1.71** – Ensikäynnin jaksoa ja testiä ei voi ohittaa, merkintä tallentuu vasta lopussa.
- **v1.72–v1.73** – Testin aikana yläilmoitus: testi auttaa heikompia koneita, grafiikkaa voi nostaa itse.

#### Pelaaja ja animaatiot
- **v1.65–v1.66** – Jousen kantoasento: kaari alas, jänne suorana ylhäällä, seuraa käsivartta.
- **v1.68** – Hengitys paikallaan, AFK-animaatio 3 s jälkeen, pieni kävelykeinunta.
- **v1.69** – AFK-eleet ilman tärinää (heilunta, pään rapsutus, kädet levälleen) ja sulava paluu.
- **v1.74** – Leveämmät hartiat ja hieman V-muotoinen vartalo, kaulan alla välkkynyt laikku korjattu.

#### Taistelu ja pelattavuus
- **v1.70** – Kaatuvan puun vihjeet: lyhyt ilmoitus osumasta ja vihje kuolinruudussa.
- **v1.77** – Pääosumat jousella: tarkka pään osuma, +10 % vahinkoa, punainen merkki ja "Pääosuma!". Nuoliteksti hotbarin yläpuolella. Pikapaikan nimi harvinaisuusvärillä.
- **v1.78** – Herätessä läheiset viholliset katoavat savuna.
- **v1.81** – Kolme kuolemaa samalle pomolle: pomo ei enää palauta terveyttään (laskuri kuolinruudussa).

#### Käyttöliittymä ja ohjaus
- **v1.65–v1.66** – Valmistushaku kuten DEV-haussa, napsautus valitsee vanhan tekstin.
- **v1.74–v1.75** – Täysi näppäinlista; kaikki näppäimet testattu; "Näytä kaikki toiminnot" -ikkuna tilanteittain (oletusnäppäimet + "nyt: X").
- **v1.76** – Shift pohjassa näyttää esinetiedot liikkuessa, nopeampi osoitin, valikko ei kuormita pelissä (asetus: älä pysäytä animaatioita).
- **v1.82** – DEV-työkalut oletuksena pois (kytkin Asetukset › Ohjaus ja ääni -sivun alareunassa) ja DEV-viitteet piilossa. "Early Access 1.0" -merkintä päävalikossa.

#### Grafiikka
- **v1.76** – Tulinuolen valo High+:lla ja Ultralla. Erittäin tarkat varjot omana valintana: Terävä 8192 / pehmeät reunat / laaja alue (punainen = raskain, "!" kun päällä).
- **v1.79** – High–Ultra kytkevät kaikki automaattisäädön alavalinnat pois (myös varjojen laadun).
- **v1.80** – Erittäin tarkat varjot ohittavat tavalliset varjoasetukset (harmaana): 8192 px, päivitys joka ruudussa, 90 / 110 / 160 m.
- **v1.83** – Veren fysiikka päällä Mediumista ylöspäin.

#### Testaus
- `tools/tarkistus.mjs`: KAIKKI OK jokaisen version jälkeen (oma tarkistusrivi jokaiselle uudelle ominaisuudelle).
- Koko pelin tarkistus kaikilla 6 kartalla (päivä ja yö, 22 vihollistyyppiä, 3 ulottuvuutta pomoineen, Hautakumpu, tallennus ja lataus, 8 grafiikkatasoa), myös DEV pois päältä: 0 virhettä.

## Äänisuunnitelma (pysyvä päätös, v1.84)

**Työnjako (käyttäjän idea):**
- Claude tekee jokaiselle tarvittavalle äänelle **paikkamerkin** (hiljainen, kelvollinen mp3 alle 3 kt) oikealla nimellä kansioon
  `sounds/raw/` (`python3 tools/process_sounds.py --init`; olemassa olevia ei koskaan ylikirjoiteta).
- Käyttäjä etsii äänet netistä (Kenney, Pixabay, Freesound CC0, OpenGameArt), **kuuntelee ne koneellaan** ja korvaa paikkamerkin
  **täsmälleen samalla nimellä** GitHub Desktopilla (commit + push).
- Claude ajaa käsittelytyökalun `python3 tools/process_sounds.py`: tunnistaa oikeat äänet (yli 3 kt, muoto tiedoston sisällöstä eikä
  päätteestä) → ffmpeg → `sounds/<nimi>.mp3` (mono, 96 kbps; käsittely ks. "Käsittely ja toisto (v1.86)" alla). Kirjoittaa
  `sounds/manifest.json` (nimi → sisältötiiviste, kesto) ja päivittää tilataulukon `sounds/AANILISTA.md`. Raakatiedostoja ei poisteta.
  Jos raaka palautetaan paikkamerkiksi, käsitelty ääni poistuu.
- **Peli lukee vain käsitellyt äänet** `sounds/`-kansiosta (manifestin kautta, tiiviste osoitteessa → välimuisti ei näytä vanhaa ääntä).
  Ilman palvelinta (tuplaklikkaus, file://) tiedostoäänet eivät lataudu → peli käyttää tehtyjä ääniä / hiljaisuutta.

**Säännöt:**
- Jokaisella olennolla voi olla omat äänet. **Varaäänet ovat vain väliaikaisia** (ketju `VARAANI`, audio.js, sävelkorkeutta muutetaan).
  Äänilistan merkinnät (`sounds/AANILISTA.md`, selite taulukon alussa): 💎 pääääni (muut lainaavat, ei lainaa itse), ⭐ väliääni
  (lainaa itse ja muut lainaavat siltä), ei merkkiä = vain lainaa. Merkin perässä käyttäjien määrä, esim. 💎 (3), ja sarake
  "lainaavat: …" (myös ketjun kautta, "via X").
- Raakaäänet: lyhyet saa olla wav, pitkät (musiikki, loopit) mp3, alle 25 Mt / tiedosto. **Vaihda ääni vasta kuuntelun jälkeen** –
  git-historia muistaa vanhat versiot (repo kasvaa). Arvio: noin 300 ääntä on ok (repo alle 1 Gt).
- Nimet: `<id>_<laji>_<n>` (lajit nyt myös `echo`, vain ulottuvuuspomot, 1–2 versiota), id = MOBDEF-avain (olennot), n = 1–3 (arpoo olemassa olevista, yksi riittää; **kuolemaäänelle 1 paikka ulottuvuuksien hirviöillä (rboss) ja 2 muilla**). Lajit: idle, hurt, death,
  aggro = suuttumisääni (ai neutral/hostile/boss/rboss; vihamielisillä ja pomoilla vain kerran), chase = toistuva jahtiääni (hostile/boss/rboss).
- Jokainen äänierä (A–E, ks. ideajono) tehdään samalla paikkamerkkitavalla ja saa oman osion AANILISTA.md:hen.

**Käsittely ja toisto (v1.86, käyttäjän päätökset):**
- **Aarnihirviö = pääääni 💎.** Se on isoin varaääni: Jäätär, Kalmaherra ja v1.95 alkaen Kalmanvartija lainaavat siltä (`jaajattari` ×1,20, `kalmaherra` ×0,85, `vartija` ×0,70). **Kivivartija (tavallinen vihollinen) ei lainaa pomoääniä** (v1.96: `kivivartija` → `kalmo` ×0,75) kunnes saavat
  omat. Hiidenhirvi lainaa taas suoraan hirveltä. "Ulottuvuuksien hirviöt" = `ai:'rboss'` (3 kpl).
- **Kuolemaäänet:** ulottuvuuksien hirviöillä 1 paikka (`_1`), kaikilla muilla olennoilla 2 (`_1`, `_2`); `variants_of(ai, laji)` työkalussa,
  ylimääräiset paikkamerkit poistuvat `--init`:llä (oikeaan ääneen ei koskaan kosketa).
- **Trimmaus (työkalu):** ylipäästö 40 Hz, hiljaisuus (−48 dB) pois alusta ja lopusta, pituus katkaistaan lajin ylärajaan ja häivytetään
  (6 ms sisään, laji-kohtainen ulos). Rajat (tavallinen / pomo): idle 3 / 4 s, hurt 1,2 / 1,6 s, death 3,5 / 6 s, aggro 2,5 / 3,5 s, chase 2,5 / 4 s.
- **Voimakkuus (työkalu):** mitataan LUFS ja nostetaan lajin tavoitteeseen: idle −22, hurt −17, death −16, aggro −16, chase −18 (pomot +1,5 dB,
  boss +1) ja `alimiter` (katto −1 dBFS, ei leikkaa). Samat äänet siis suunnilleen samalla tasolla ja idle hiljaisin. Manifestin `pv` = käsittelyn
  versio (`PV`): vaihtuessa kaikki ajetaan uudestaan; `gain` = käytetty vahvistus (dB). Anna raaka puhtaana ja kuivana (ei omaa kaikua).
- **Kaiku (peli):** vain olennoille joilla `m.dun` (luolasto ja ulottuvuudet, tiheitä tiloja). Yksi yhteinen `ConvolverNode` (proseduraalinen
  vastaus 1,2 s, stereo, alipäästö 3,2 kHz; sama näytetaajuus kuin AudioContextilla, muuten Chrome heittää virheen). Lähetysmäärä: tavallinen
  0,45, boss 0,6, rboss 0,75. Kaiku kytketään vain kun kaiullinen ääni soi ja irrotetaan 3 s viimeisen jälkeen → maailmassa ei kuormaa. Ei
  oman tiedoston kaikua → sama ääni toimii sekä ulkona (kuiva) että luolassa.
- **Toistosäännöt (`creSnd`):** tärkeys kuolema 5 > osuma 4 > suuttuminen 3 > jahti 2 > rauhallinen 1. Yhdellä olennolla soi yksi ääni
  kerrallaan: tärkeämpi katkaisee (nopea häivytys 30 ms), heikompi jää pois, samanarvoinen vasta 0,35 s jälkeen. Kuolema vaientaa olennon
  muut äänet. Koko peliin enintään 10 samanaikaista ääntä (`CRE.max`); täyden ollessa uusi syrjäyttää heikoimman (tasatilanteessa kaukaisimman)
  tai jää pois jos on heikompi kuin kaikki. Rauhallista/jahtiääntä enintään 3 samaa lajia+tyyppiä kerrallaan ja uusi aikaisintaan 0,3 s edellisen
  jälkeen (ei kuoroa). Sama versio ei toistu heti perään. Äänekkyys: idle ×0,75, chase ×0,9 muut ×1; pomoilla 3D-viite 8 m (muilla 3 m).

**Äänierän rutiini (kun käyttäjä lisää uusia ääniä; v1.86, jotta isotkin erät sujuvat nopeasti):**
1. `git pull`/fetch: katso mitä uusia tiedostoja `sounds/raw/` sai (`git diff --stat HEAD origin/main`). Älä lue ääniä itse – työkalu mittaa.
2. `python3 tools/process_sounds.py` (tarvittaessa `--init` uusille olennoille). Lue **HUOM**-rivit: sama tiedosto kahdessa paikassa, vahvistus yli ±12 dB
   (raaka hyvin hiljainen/kova → kerro käyttäjälle), ylimääräiset paikat. Tuplatiedosto tai kova vahvistus ei estä erää; ilmoita ne ja jatka.
3. Tarkista AANILISTA.md:n tilarivit ja VARAANI: jos olento sai omat äänet, varaääniketju voi jäädä; uusi 💎/⭐-rooli päivittyy itse.
   Jos uusi olento ei ole VARAANI-ketjussa eikä saa ääntä, älä lisää varaääntä ilman syytä.
4. Muutokset koodiin vain jos sääntö muuttuu (toisto, kaiku, profiilit). Muuten pelkkä dataerä: `sounds/`, manifest, AANILISTA, muistio, versio.
5. Versio + muistion versioloki + `tarkistus.mjs` → KAIKKI OK (sisältää VARAANI-eheyden). `full157` vain kun koodi muuttui (pelkkä äänidata ei vaadi sitä).
6. Commit, push, PR, linkit (commit-SHA, haara, PR) ja muistutus Mergestä.
- Mallisuositus: rutiiniäänierä = Sonnet, medium. Opus/korkea ajattelu vain uudelle koodille (äänierät B–E: askeleet, sää, musiikki, äänifysiikka).
  Anna äänet isoina erinä (10–20 oliota kerralla), niin konteksti ja testit ajetaan vain kerran.

## Pysyvät päätökset

- **Pelin teksteissä ei mainita muita pelejä** (esim. Minecraft, Valheim) – v1.11, käyttäjän toive.
- Alueen löytöotsikot eivät koskaan tule päällekkäin (jono), ja alue paljastuu vasta hieman rajan sisäpuolella (v1.43, käyttäjän toive).
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
| Terveys / kestävyys / max paino | 60 (taso 5: 100, v1.20) / 100 / 160 |
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
| Kivivartija | 220 (v1.31) | 3,8 | 17 | ulottuma 2,8 m (v1.31) |
| Kalmanvartija | 900 | 3,6 | 22–28 | 4 hyökkäystä, kutsuu kalmoja 50 %:ssa; v0.89 ryntäys 25 %/8 s, ennakko +40 %, kivi 30 % hitaampi |

## Versioloki

### Äänilistan merkinnät (vain työkalu ja dokumentit, ei versionostoa)
- `tools/process_sounds.py` tuottaa AANILISTA.md:hen roolit varaääniketjusta (`VARAANI`): 💎 = juuri (lainaajia, ei lainaa itse), ⭐ = väli
  (lainaa itse ja muut lainaavat siltä), ei merkkiä = vain lainaa. Luku merkin perässä = kaikki lainaajat ketju mukaan lukien; vasemman
  sarakkeen rivi `lainaavat: …` (suorat ensin, ketjun kautta tulevat "via X"). Selite taulukoiden alussa. Nykyiset (v1.95): 💎 susi (6), aarnihirviö (4),
  hirvi (3), karju (2), kalmo (1), karhu (1), sammalhiisi (1); ⭐ peura, kettu, ilves, kalmanvartija (1 kukin); kalmon ylimys ja hiidenhirvi vain lainaavat.
  Metsolla ei ole varaääntä (ei merkkiä, ei lainaa).

### v2.10 (emakon suuttumisäänet eivät kerrostu)
- Porsaita jahdatessa emakon suuttuminen soitti useita ääniä päällekkäin: `temperAI`:n `anger()` karjaisi (`sfx('roar')`) ja `creTick` soitti
  lisäksi tiedostoäänen (emakko lainaa karjun `aggro`-äänen), ja lauma/useampi emakko lisäsi omansa. Nyt **yksi suuttumisääni / suuttuminen**:
  karjaisu vain jos olennolla ei ole tiedostoääntä; lupa `creAngerOk(m)` (audio.js): sama olento enintään 15 s välein, sama laji 6 s välein
  (`CRE_AGT`); neutraalin uusi suuttumisääni vasta kun se on rauhoittunut (`!m.angry`) ja ollut 5 s ilman jahtia. KORJAUKSET 42.

### v2.09 (kodin lämpö – käyttäjän prompti osa 3/3)
- **Tunnistus** (`homeScan`, environment.js, 0,5 s välein, vain jos rakennusosia 15 m sisällä): 16 vaakasädettä (kulmasiirto 0,031 rad, ettei säde kulje
  seinäsaumaa pitkin) kolmella korkeudella 0,6 / 1,5 / 2,2 m enintään 15 m; jokaisen on osuttava **rakennusosaan** (ovet lasketaan kiinni, lasi kelpaa) tai
  maastoon alle 6 m:ssä (rinnetalo). Puut/kivet/rauniot eivät kelpaa (aukon läpi mennyt säde osui ennen kaukaiseen puuhun). Katto: `sheltered` pelaajan
  kohdalla ja 1 m joka suuntaan. **Aukkoikkuna** tai **avoin ovi** talon reunalla (`homeOnEdge`, keskipiste ±1,6 m reunasta) tarkistetaan erikseen, koska
  16 sädettä voi ohittaa kapean aukon: aukkoikkuna → ei tehostetta; avoin ovi → "ovi auki".
- **Tasot** (`HOME.lvl`): 1 = **Mukava lämpötila** (+0,5 hp/s, nälkä × 0,7), 2 = **Lämmin koti** (sisällä palanut lämmönlähde ≥ 5 s: nuotio/grilli `fuel>0`,
  seisova soihtu/seinäsoihtu `burn>0`; +1,0 hp/s, nälkä × 0,5). Lähde sisällä = etäisyys < reunan etäisyys siihen suuntaan (viereisten säteiden suurin, koska
  esine voi katkaista säteen). Lähde sammuu → 30 s → takaisin tasolle 1. Ovi auki: 20 s armo, sitten harmaa tehoste "… – ovesi on auki" (`.chip.off`) +
  ilmoitus, sulkiessa palaa heti. Ulkona taso säilyy 20 s ja hiipuu (`HOME.k`). Parannus ei toimi nälkäisenä 0 tai pahoinvoinnissa.
- **Nukkuminen** (`sleepAt`): ei enää palauta terveyttä täyteen; Mukava +10 %, Lämmin koti +20 % enimmäisterveydestä (muualla 0), ilmoitus herätessä.
- Testattu (kuva-/simulaatiotesti): kaikki yllä olevat siirtymät. Tarkistukseen 1 rivi.

### v2.08 (viholliset: ovet, muisti ja piiritys – käyttäjän prompti osa 2/3)
- **Näköyhteys:** vihollisten `m.los` laskee nyt `losClear(...,true)` → suljettu ovi estää näkemisen (avoin ovi `off` ei); lasi ei estä (v2.07).
- **Muisti** `MOB_MEM` 30 s (`mobKnows`): `m.seenT` päivittyy, kun jahtaava vihollinen näkee pelaajan tai osuu/saa osuman (`damageMob`); myös viimeinen
  sijainti `lastPX/lastPZ`. Jahti päättyy, kun muisti loppuu (ennen: 3 s ilman näköyhteyttä) tai pelaaja näkyy yli 1,6 × huomausetäisyyden päässä.
- **Piiritys** (`siegeTarget`): kun vihollinen ei näe (≥ 1 s) mutta muistaa pelaajan (alle 30 m), tai jää jumiin, se valitsee pelaajan lähellä (14 m) olevista
  osista: suljettu ovi, jos sen kestävyys < lähimmän seinän (`SIEGE_WALLS`: seinä, tervas-, kiviseinä, aukko-/lasi-ikkunat), muuten lähin seinä. Lasi ei ole
  erikoisasemassa. Hajottaa 2 × vahingolla. Murron jälkeen (`m.breach`, `m.thru` 1→3): 1,8 m aukon ulkopuolelle (kiertää kulman) → aukkoon → 1,5 m sisään,
  kunnes näkee pelaajan. Muistin loputtua talossa → tila `exit`: 4 m murtokohdasta ulos, sitten normaalisti. `nearestOpening` ei ole enää käytössä.
- **Lauma** (`packAlert`): kun vihollinen aloittaa jahdin tai piirityksen, saman lajin viholliset 20 m säteellä liittyvät (neutraalit suuttuvat). Muut lajit eivät.
- Testattu: puuovi (130) < seinä (150) → vain ovi rikki ja susi aukkoon; rautaovi (900) → lähin seinä; lauma; muisti 30 s; ulos murtokohdasta.
- Tarkistukseen 1 rivi.

### v2.07 (hiekka, lasi, lasi-ikkunat, rautaovi – käyttäjän prompti osa 1/3)
- **Hiekkakasat** (`NODE.hiekkakasa`, pick, 2–3 hiekkaa, uusiutuu 1200 s = 20 min): 5–10 per kartta rannalla (`beach`, korkeus 0,15–1,05, väli ≥ 60 m),
  oma satunnaislähde `mulberry32(4242+MAP_ID*97)` ja lisätään viimeisinä → muiden solmujen id:t eivät muutu (tallennukset ehjät). Malli: hiekkakasa + simpukka.
- **Sulatusuuni:** hiekka (enint. `SAND_MAX` 20) → 2 hiekkaa + 1 puu = 1 lasi, `GLASS_T` 15 s. Malmit ja hiekka vuorotellen (`D.job`). Uudet kentät `sand`, `glass`.
- **Esineet** `hiekka` (paino 0,5, pino 50), `lasi` (0,4, pino 20): kuvakkeet ja 3D-mallit maassa (`matDropMesh`).
- **Rakennusosat:** Aukkoikkuna (ent. Ikkunaseinä) ja Kivinen aukkoikkuna (ent. Kiviikkuna) säilyvät. Uudet **Puinen lasi-ikkuna** (`lasiikkuna`, 2 puuta + 1 lasi,
  100) ja **Kivinen lasi-ikkuna** (`kivilasiikkuna`, 5 kiveä + 1 lasi, 250): base `ikkunaseina`, lasiruutu = törmäyslaatikko `glass` (estää kulun, nuolet ja sateen),
  `losClear` ohittaa lasin (`pointBlocked(...,seeThru)`) → olennot näkevät läpi. Malli `GLASS_MAT` (läpikuultava sinertävä) + ristipuitteet. Rikkoutuessa
  `shatterGlass` (building.js): helinä, sirpaleet, osa vaihtuu aukkoikkunaksi (`def.glass` = kohdetyyppi) täydellä kestävyydellä.
- **Rautaovi** (`rautaovi`, 4 rautaharkkoa + 2 puuta, 900): base `ovi`, ovilehti `IRON_MAT` + vanteet ja niitit.
- Tarkistukseen 1 rivi.

### v2.06 (puunuolet, tuuli +10 %, tähtäimen ohjeet)
- **Puunuolet** (`puunuolet`, työpenkki, 2 puuta → 15, taso 3): `AMMO_STATS.puunuolet` = putoaa 30 % enemmän (grav 1,3), tuuli 20 % enemmän (wind 1,2),
  vahinko −40 % (dmg 0,6). Heikoin ammus (`AMMO` alkaa siitä → automaattinen valinta käyttää ensin). Kuvake ja lentävä nuoli: teroitettu puukärki
  (`shootArrow(...,wood)`). Tuulikerroin on nyt nuolikohtainen `p.windK` = `AMMO_STATS[am].wind` (sulitettu .5, puu 1.2; ennen `steady`), sama `bowTraj`issa.
- **Tuuli +10 %:** `ARROW_WIND` .13 → .143 (13 m/s ≈ 0,9 m sivuun 30 m:ssä).
- **Ohjeet** (`#aimHint`) oikeammalle (+74 px) ja pienemmät (10,5 px); piilossa, kun Näppäinopasteet (`SET.keyHints`) on pois. Maahan osuman ▼ 11 → 8,8 px (−20 %).
- Tarkistukseen 1 rivi (arvot, lento sivutuulessa: kaarto ×1,2 ja pudotus ×1,3, ohjeiden piilotus).

### v2.05 (apuviivaston vilkkuminen, Z: apuviivasto pois)
- **Vika (KORJAUKSET 41):** apuviivasto ei vilkkunut, vaikka piste vilkkui: `#dropRet`:n sisääntuloanimaatio `drIn` oli täyttötilalla `both`, ja CSS-animaation
  täyttötila ohittaa elementin `style.opacity`n → laskettu läpinäkyvyys jäi 1:ksi. Nyt `backwards` → viivat ja piste samaan tahtiin (mitattu: samat arvot).
- **Z-tyylit:** Viivasto / Pisteet / Kevyt / **Pois** (viimeinen piilottaa apuviivaston, ohjeessa "Tähtäin: Pois (4/4)").
- Tarkistukseen 1 rivi.

### v2.04 (linnakkeen muurin harja, tähtäin suoraan alas, tuulimittari)
- **Arkkukivilinnakkeen muuri (KORJAUKSET 40):** harjan törmäys on ympyröitä (v1.39), mutta `groundAt` huomioi vain laatikot → harjalla ei ollut lattiaa,
  pelaaja vajosi ja putosi (testissä heti 3,57 m alas). Nyt ympyrä, jolla `ground=1`, toimii lattiana (keskipiste alle `c.r + 0,35·r` päässä), harjan
  pinta sammaleen tasolla (+7 cm). Testattu: koko kierros harjalla kolmessa linnakkeessa, jalat tasan pinnalla.
- **Kyykkytähtäin:** merkit ja viiva nyt suoraan tähtäyspisteen alla (x = ruudun keskikohta), symmetrisesti; korkeus tulee yhä todellisesta lentoradasta
  (katsekulma, painovoima, tuuli). Maahan osuma ▼ samalla viivalla. Punainen täyden vedon piste 4 → 2,8 px (−30 %); Pisteet-tyylin pisteet −20 % (r 1,6).
- **Vilkkuminen** oletuksena POIS; **X** (`BIND.remove`, jousta jännittäessä) kytkee (`aimBlink`, localStorage `hiidenmaa_aimblink`). Piste ja viivat
  vilkkuvat samaan aikaan yhdellä ajastimella (`aimBlinkOp`): 3 s näkyvä, 3 s himmeä (0,55), pehmeä 0,4 s siirtymä. Ohjeissa X-rivi (seisten ja kyykyssä).
- **Tuulimittari** (`#windWarn`) näkyy aina jousta jännittäessä ulkona ristikon yläpuolella: "Tuuli 3,3 m/s" + suuntanuoli reaaliajassa (hillitty);
  ≥ 8 m/s varoitus ⚠ kuten ennen. Tuuli vaikuttaa nuoleen (`ARROW_WIND` .13, sulitetut puolet) ja tähtäimen laskettuun rataan.
- Tarkistukseen 1 rivi.

### v2.03 (valojen etäisyydet, tulinuolen hehku kaukaa, uusi kyykkytähtäin, minimiveto 0,4 s)
- **Minimiveto** `BOW_MIN_T` 0,7 → 0,4 s.
- **Uudet asetukset (Grafiikka › Valo):** `lightDist` "Valojen näkyvyysetäisyys" (40/60/90/150/300/800 = koko kartta; ennen kiinteä 60 m, `updateLights`)
  ja `lightRange` "Valon kantama" (PointLight.distance 17/20/24/28/32 m; tulien varjokameran far = kantama − 2, enint. 30). Esiasetukset Low…Ultra:
  lightDist 40,40,60,60,90,150,300,800; lightRange 17,17,17,17,20,24,28,32. **Auringon varjoetäisyys** suurempi: High 80→110, High+ 110→160, Ultra 140→220
  (uudet valinnat 160/220; varjokameran far kasvaa mukana). Vanhat tallennetut esiasetukset päivittyvät (`SET._v` 3), eivät muutu Customiksi.
- **Tulinuolen hehku** (`arrowGlowTick`, state.js): additiivinen sprite liekissä, ei sumua, koko kasvaa etäisyyden mukaan (näkyy valopisteenä), näkyy
  `lightDist`:n sisällä → Ultralla kartan päästä päähän. Himmenee valon/liekin mukana (`p.glowK`), myös ilman "tulinuolten valo" -asetusta.
- **Kyykkytähtäin** (`bowTraj` actions.js + `updDropRet` ui.js): lentorata lasketaan samalla fysiikalla kuin oikea nuoli (lähtöpiste, `bowAimPoint`, nopeus,
  painovoima, tuuli; kärki 0,45 m) ja projisoidaan ruudulle → katsekulma ylös/alas venyttää ja kaartaa viivastoa; testattu: ennustettu osuma = oikea
  nuoli < 1 cm. Merkit 10…150 m (vaakamatka), ohut viiva tähtäyspisteestä merkkien kautta, merkkien leveys kapenee, pienet metrit sivussa ("m" vain
  viimeisessä), maahan/esteeseen osuma ▼ + metrit. **Z** vaihtaa tyyliä Viivasto / Pisteet / Kevyt (`AIM_ST`, localStorage `hiidenmaa_aimst`).
- **Täysi veto:** piste pienempi (kyykyssä 2 px, seisten 3 px) ja piste + viivat himmenevät 2 s välein läpinäkyviksi ja palaavat (CSS `aimBlink`).
  Ohjeet `#aimHint`: seisten "C Kyykkyyn: tarkka laukaus ja lentorata", kyykyssä "C Nouse ylös" + "Z Tähtäin: X (n/3)". Tuulivaroitus siirtyi ristikon yläpuolelle.
- Tarkistukseen 1 rivi.

### v2.02 (tärkeimmät esineet maassa 3D-malleina)
- `dropModel(id)` (state.js, `dropMesh` käyttää ensin sitä): aseet, työkalut, vasara ja jouset = sama malli kuin kädessä (`makeHeld`), kilvet `makeShield`,
  haarniskat `armorDropMesh` (sorvattu rintapanssari LatheGeometry, olkasuojat, kaula, vyö + solki; metallisissa vanteet, karhuntaljassa turkiskaulus,
  Hiidenpanssarissa hehkuvat riimuviivat ja kivi), avaimet `keyMesh` (rengas, varsi, lovet, hehku), arvoesineet `treasureMesh` (hiidenkivi kristallirypäs,
  kruunusirpale kultareunus + piikit, vartijan sydän). Juomat `potionMesh` (v2.00). Keskitys + skaalaus pisin sivu ≤ 0,8 m; pystyyn osoittava pitkä esine
  käännetään makaamaan (ei jouset), lyömäaseet pieneen kallistukseen; `userData.lift` = lepokorkeus (ei uppoa maahan). Raaka-aineet, ruoka, nuolet ja soihtu
  pysyvät kuvakelaattoina (näyttävät niinkin hyviltä).
- Tarkistukseen 1 rivi.

### v2.01 (jousen tähtäys, minimiveto, tuuli, tulinuolen valo)
- **Tähtäysvika (KORJAUKSET 39):** nuolet osuivat vasemmalle. Kamera on tähdätessä 0,75 m pelaajan oikealla; nuoli lähtee pelaajasta kohti kameran säteen
  osumapistettä, mutta `camRayPoint` ei huomioinut olentoja → osuma maahan/70 m olennon taakse → nuoli kulki kohteen kohdalla 0,4–0,7 m vasemmalla (mitattu
  6–35 m, kaikki ohi). Nyt `bowAimPoint` (actions.js) testaa säteen myös olentojen pystylieriöihin (säde `def.r`+0,1, korkeus `barH`) → kaikki osuivat.
  Pystysuunnassa painovoima pudottaa nuolta edelleen (tarkoituksellinen; kyykyssä tiputusristikko).
- **Minimiveto 0,7 s** (`BOW_MIN_T`, `P.drawT`): lyhyempi veto peruuntuu (nuoli ei kulu, ei laukausta), ilmoitus enintään 4 s välein. Koskee myös kestävyyden loppumista.
- **Tuuli:** vaikutus nuoleen `ARROW_WIND` .08 → .13 (13 m/s ≈ 0,8 m sivuun 30 m:ssä; sulitetut puolet). **Tuulivaroitus** `#windWarn` jousta jännittäessä, kun tuuli
  ≥ 8 m/s (`WIND_WARN`): ⚠ "Kova tuuli N m/s – nuoli kaartuu" (≥ 15 m/s punainen "Myrskytuuli") ja nuoli, joka näyttää tuulen suunnan ruudulla.
- **Tulinuolen valo kohteessa:** voimakkuus 2,8 (lennossa 1,5), palaa täysillä 3,2 s ja hiipuu pehmeästi (smoothstep) 5 s:iin; liekki kutistuu samalla. **Sateessa**
  (ei katon alla) valo 2,2 ja hiipuu pehmeästi 1,6 s:ssa (ennen: sammui heti); mobiin osuessa sateessa 1,2 s. Veteen osuessa sammuu yhä heti.
- Tarkistukseen 1 rivi, v1.98-rivin sadetesti päivitetty.

### v2.00 (juomat, kylläisyys 100, DEV Å -esinevalikko)
- **Juomat** (items.js, `potion`): Parannusjuoma (punainen, terveys heti täyteen), Elpymisjuoma (vihreä, +1 terveys/s 60 s, tila `elpyminen`),
  Sisujuoma (sininen, kylläisyys täynnä 5 min `kylla` + kestävyys täynnä 30 s `sisu`). Juodaan pikapaikasta (`useSlot` → `drink`, actions.js), pino 5,
  paino 0,4, harvinaisuus "rare". Kuvake: lasipullo, neste, korkki. Maassa oikea 3D-pullo (`potionMesh`, state.js; nesteessä hehku, koko ×1,7).
  **Saatavuus:** vain arkuista – ensimmäisellä avauksella jokaisella juomalla 10 % mahdollisuus (`POTIONS`, `openFound`, ui.js); ei tynnyreissä eikä
  säkeissä (testattu 3000 arkkua: ~9,5 % / juoma, tynnyrit 0).
- **Kylläisyys 100:** aiemmin mittari kului heti syömisen jälkeen (99,97 → näytti 99). Nyt täyteen syöty = tasan 100 ja `P.buffs.taysi` 60 s: kylläisyys ei
  kulu minuuttiin, sitten normaalisti. Sisujuoman aikana sama.
- **DEV Å** (`renderDevI`, `#devIP`, näppäin `BracketLeft`/å): oma esinesivu. Pikavalinnat `DEV_PICKS` (Hiidenmiekka, Hiidenpanssari, Rautakilpi, Hiidenjousi,
  sulitetut ja tulinuolet 100, pihka 100, hiidenkivet 3, kaikki avaimet + kruunusirpaleet 3, juomat 5) "Anna"-napein + "Anna kaikki", alla esinehaku
  määrällä. Esinehaku poistettiin Ä-valikosta.
- Tarkistukseen 3 riviä.

### v1.99 (pomot murskaavat rakennelmat, ulottuvuuksissa vain työpenkki)
- **`bossTrample(m,dt)`** (ai.js, kaikille `boss`/`rboss`, 0,2 s välein; ei tiloissa sleep/rise/sink eikä vajotessa tai kuolleena): rakennusosa, jonka törmäyslaatikko
  osuu pomon ympärille (säde `def.r`+0,5 m – suurempi kuin pomon oma törmäyssäde, jotta seinä jota vasten se painaa murskautuu; korkeus jaloista −0,3 m
  mallin korkeuteen), poistetaan heti: seinät, aidat (myös `mobProof`), ovet, lattiat, katot, työpisteet, sängyt… **Ei** `store`-osia (arkut, tynnyrit – tavarat
  säilyvät) eikä ulottuvuuksien pintoja (eivät ole rakennusosia). Puut (ei aarnipuita) kaatuvat poispäin pomosta (`fallTree`). Ääni + tärähdys, ilmoitus
  "X murskaa kaiken tieltään!" enintään 4 s välein.
- **Rakentaminen ulottuvuuksissa** (`validPlace`, building.js): vain **työpenkki**, ja vain lattialle (`DUN.y`), vapaisiin ruutuihin (`rCell`/`rWall`: kulmat ja
  keskipiste), ei päällekkäin minkään törmäyksen kanssa (0,15 m marginaali), näköyhteys pelaajasta (ei seinän takaa). Muu osa → "Ulottuvuuksissa ei voi rakentaa
  – vain työpenkin voi asettaa." (`placeBuild` ilmoittaa myös, kun haamu ei näy). Hautakummussa ei rakenneta lainkaan. Haamu: `marchTerrain` osuu ulottuvuudessa
  lattiatasoon, sijoitus vapaa (0,25 m). Penkin rengas lattian korkeudelle (`makeBenchRing(x,z,fy)`).
- Tarkistukseen 2 riviä.

### v1.98 (nuolten tarkka osuma ja ajastimet)
- **Tarkka pysähtyminen (`arrowStep`/`arrowContact`, state.js; `arrowBlocked`, collision.js):** nuolen liike pilkotaan enintään 12 cm:n askeliin ja kärjen
  (0,45 m keskeltä) osuma tarkennetaan puolittamalla 6 kertaa → nuoli jää kiinni täsmälleen pintaan (virhe < 2 cm; testattu 75–90 m/s). Aiemmin tarkistus
  oli vain kerran kehyksessä (nopea nuoli saattoi mennä ohuen seinän läpi tai jäädä sen sisään) ja laatikoissa oli 15 cm:n marginaali. Pysäyttävät:
  rakennetut seinät/lattiat/katot/pylväät, **suljetut ovet** (avoin ovi `off` päästää läpi), luolaston ja rauniomuurit, puut/kivet/tukit (ympyrät), maa ja
  **vesi** (pinta y≈0 pysäyttää nuolen). Koskee myös vihollisten nuolia. Kivet (`rock`) käyttävät vanhaa tarkistusta.
- **Ajastimet alkavat osumahetkestä:** nuoli häviää 10 s (tulinuoli 8 s) osumasta (aiemmin 6 s); tulinuolen liekki ja valo sammuvat 5 s:ssa (valo
  himmenee tasaisesti, `arrowFade` dur 5; mobiin osunut tulinuoli 2 s). **Sade** (`wRain>.3`, ei katon alla: `sheltered`) tai **veteen osuminen** sammuttaa
  liekin ja valon heti osuessa (savupuuska); lennossa valo säilyy (sateessa himmenee nopeammin kuten ennenkin).
- Tarkistukseen 1 rivi (seinäosuma, ovi auki/kiinni, ajastimet, sade).

### v1.97 (sade ja tuli ilman spämmiä, Suonäkki syntyy, osuma-äänen häntä pois)
- **Sade + nuotio (korjaus, KORJAUKSET 38):** pelaaja syttyi nuotiossa, sade sammutti heti, uudestaan… joka ruudulla → ilmoitusspämmi ja tiheä ääni.
  Nyt `playerWet()` (effects.js) = vedessä TAI sataa (`wRain>.5`) eikä pelaaja ole katon alla (`shelterCache`). Märkä pelaaja **ei syty lainkaan**
  (`canIgnitePlayer`), sama sääntö palavan olennon sytytykselle; palava sammuu märäksi tullessa; katon alla sateessakin voi syttyä ja palaa. Jäähy
  `P.igniteCd` 3 s sammutuksen/syttymisen jälkeen; ilmoitus ("Syttyit tuleen!") enintään 12 s välein (`P.igMsgT`). Mobit: `mobWet(m)` (actions.js,
  suoja tarkistetaan enintään 1 s välein vain sateella, `m.shU`/`m.shd`), märkä mobi ei syty, `m.igniteCd` 3 s, "Syttyi!"-ääni/teksti 4 s välein (`m.igFx`).
  Aiemmin sateen tarkistus ei huomioinut kattoa (sade sammutti myös katon alla).
- **Suonäkki:** syntyi vain yön "pelottavana" (10 %/yö, vain jos pelaaja on suolla) → käytännössä ei koskaan. Nyt `SPAWN.suo.night` sisältää sen (22 %),
  spawner käsittelee väijyjän: enintään yksi, nousee 2 s maasta tai lätäköstä (lampare), jahdissa kuten ennen (katoaa aamulla). Testattu: 6 kartasta 5:llä
  syntyy suolla (kartta 1 pienin suo, ei satunnaisesti). `BIOMES.suo.foe` mainitsee sen.
- **Osuma-äänen häntä (`tools/process_sounds.py`, PV 3):** `event_end()` leikkaa osuma-äänen (hurt) ensimmäisen tapahtuman loppuun (taso pysyy 20 dB
  kulkevan huipun alla ≥ 100 ms) + 60 ms; häivytys 0,20 s. Raaka `aarnihirvio_hurt_1` oli 4 s: ääni 0–0,45 s, sitten veden kaltaista kohinaa ja uusi
  kova ääni 1,3 s:stä (leikkautui keskeltä) → nyt 0,47 s siisti. Muut lajit ennallaan. Käyttäjä aikoo vaihtaa jo lisättyjä ääniä → tarkista ne
  seuraavalla äänierällä (HUOM-rivit: `aarnihirvio_idle_1`/`chase_2` sama tiedosto, `chase_1` +12,5 dB).
- Tarkistukseen 2 riviä (sade/tuli-skenaariot, Suonäkki-spawn).

### v1.96 (kivivartijalta pois pomoäänet)
- Käyttäjän korjaus: boss-äänet kuuluvat vain Kalmanvartijalle. `VARAANI.kivivartija` oli `vartija` ×1,15 → kivivartija lainasi Aarnihirviön pomoääniä
  vartijan kautta. Nyt `kivivartija` → `kalmo` ×0,75 (tavallinen vihollinen; kalmolla ei vielä ole ääniä → kivivartija on hiljainen, kunnes se saa
  omat `kivivartija_*`-äänet tai kalmo omansa). Tarkistusrivi (v1.95-rivi) varmistaa, ettei kivivartijan varaketjussa ole pomoa.

### v1.95 (Kalmanvartijan äänet)
- **Ongelma:** Kalmanvartijalla oli kaikki äänipaikat (idle, hurt, death ×2, aggro, chase), mutta varaääni oli `kalmo`, jolla ei ole yhtään
  ääntä → vartija (ja kivivartija sen kautta) oli mykkä. **Korjaus:** `VARAANI.vartija` → `aarnihirvio` sävelellä ×0,70 (matala kivijättiläinen),
  Kun käyttäjä lisää `vartija_*`-äänet, ne korvaavat lainan automaattisesti. (v1.95:n kivivartija lainasi vartijan kautta pomoääniä – korjattu v1.96:ssa.)
- **Uusi kaikuääni Kalmanvartijalle** (`vartija_echo_1/2`, paikkamerkit luotu, `ECHO_AI`/`CRE_ECHO` = rboss + boss). Soi `vartijaEcho` (audio.js,
  `creTick`): maailmassa alle 80 m Kalmankehästä, kunnes vartija on kukistettu ensimmäisen kerran (`flags.boss`) ja vain kun vartija ei ole hereillä.
  24–48 s välein (ensimmäinen 4–10 s), maan alta (piilo-olento `VEC.m` 3 m maan alla kehän keskellä), tumma (alipäästö), kaiku 0,9, voimakkuus ×0,6.
  Ilman omaa ääntä lainaa Aarnihirviön kaikuäänen; jos sitäkään ei ole, hiljaa (tarkistus 10 s välein).
- Äänilista (AANILISTA.md) ja työkalun ohjeteksti päivitetty (`python3 tools/process_sounds.py --init`). Tarkistukseen 1 rivi.

### v1.94 (eeppinen pomopalkki, vaihe-efektit, rauha ja arkkujen täyttyminen)
- **Pomopalkki uusittu** (`bossBarTick`, ui.js; ainoa paikka joka ohjaa `#bossbar`:ia – muualta piilotus/näyttö poistettu). Ajetaan joka
  ruudunpäivitys `updateHUD`:n alussa (ennen 0,1 s:n rajoitinta). Näyttää lähimmän herännyn pomon samassa tilassa (< 70 m; ei `sleep`/`sink`).
  Teemat `BB_T`: vartija = kivi (turkoosi, ᛟ, kivisärö), Jäätär = jää (sininen, ᛁ, jääpuikot), Kalmaherra = kalma (veren punainen, ᛞ, valuvat
  veripisarat), Aarnihirviö = aarni (vihreä, ᛉ, köynnös ja lehdet). Värit CSS-muuttujina `--bc/--bd/--bl` (rgb-kolmikot) – teemaluokan
  valitsimen pitää olla `#bossbar.bbT-x` (id-valitsin voittaa pelkän luokan). Kehys, sykkivät riimut, välkkyvä nimi, alaotsikko,
  virtaava raitakuvio, kiiltojuova, vaihemerkit (vartija 50 %, muut 2/3 ja 1/3), viivepalkki (jää 0,45 s ja valuu 0,32/s).
- **Vaihe-efekti** (`bbPhaseOf`: vartija `phase2` → 2, rboss `phase`, Kalmaherran `fin` → 4): palkki tärähtää, välähtää, iso teksti
  "VAIHE II"/"VAIHE III"/"VIIMEINEN RAIVO" (2,8 s), halkeamat (ph2 0,5 / ph3+ 0,9), syke ph3+, viimeisessä raivossa koko palkki punaiseksi.
  Ruudun reunoille `#bbVig` teeman värissä (0,55), välähtää vaihtuessa ja sykkii sydämenlyöntinä alle 25 %:ssa. Kuollessa "KUKISTETTU",
  harmaa, häipyy 2,3–3,5 s.
- **Rauha** (ai.js): `bossVictory(kind)` kutsutaan vartijan (`bossDefeated`) ja ulottuvuuspomon (`onMobKilled`) kaatuessa. Kun kaikki neljä on
  kaatunut (`allBossesDown`), `flags.peace=1` ja voittoruutu "Hiidenmaa on rauhallinen" (otsikko `#winT`) 13 s kuoleman jälkeen (kuolema-animaatio
  ehtii; ennen 3,5 s). Vartijan oma voittoruutu vain ensimmäisellä kerralla (`flags.won`). `peaceTick` (updateHUD): kun `flags.peacePend` ja ruutu
  on suljettu (state play) → 2 s → `peaceRefill`: jokainen **tyhjennetty** maailman arkku (`worldChests`, sisältö olemassa mutta tyhjä; avaamattomat
  ennallaan) saa 8 eri satunnaista esinettä `PEACE_LOOT`-listasta (hiidenkivi 25 %, karhuntalja 30 %) + ilmoitukset. Kerran per tallennus.
- Tarkistus: 2 uutta riviä (palkki 4 teemaa + vaihe + KUKISTETTU; rauha + täyttö).

### v1.93 (pomojen uudet korkealaatuiset mallit, Ultra-efektit, saaliin majakkasäde)
- **Uusi tiedosto `js/bossmodels.js`** (ladataan `models.js`:n jälkeen, ennen `mobs.js`:ää): kaikkien pomojen mallit uusittu **ilman palikoita**,
  vanhoja malleja matkien. Apurit: `bqLump` (kohinalla muotoiltu pallo – kivi, kaarna, sammal), `bqTaper` (kapeneva kaareva putki – sarvet,
  piikit, jääpuikot, kylkiluut, juuret, hehkuvat halkeamat), `bqCapsule`, `bqCrystal` (kuusikulmainen jääkristalli), `bqCloth` (kaareva repaleinen
  kangas), `bqSkirt` (hammastettu helma), `bqChain` (rengasketju), `bqShroom` (sieni), `bqFlameGeo` (liekki); suurmiekka `ExtrudeGeometry`llä.
  - **Kalmanvartija** (`figVartija`, ennen `figGolem(3.1,true)`; kivivartija käyttää yhä figGolemia): pyöreät kivimöhkäleet, mutkittelevat
    hehkuvat riimuhalkeamat (ydin + hehku), sammalolkapäät, olkapiikit, rystyset, kivikruunu, kulmakaari, selässä riimumonoliitti.
  - **Jäätär**: 11 kaarevaa jääpuikkoa harjana, jääkruunu (rengas + kristallit), naamio ja torahampaat, huurrekaulus, repaleinen viitta
    (keinuu), kristalliviuhkat olkapäillä, rintakivi kehyksineen, kyynärvarsien jääpiikit, kaarevat jääkynnet, jääpuikkohelma.
  - **Kalmaherra**: kylkiluukaaret, rintalanka ja selkäranka, kallo (leuka, hampaat, hehkuvat silmäkuopat), pässinsarvet, kultakruunu kivineen,
    kalloolkapäät piikein, iso repaleinen viitta ja sivukaistaleet, rengasketjut, suurmiekka (uurre, sahalaita, kaareva väistin, ponsi), sieluorbi.
  - **Aarnihirviö**: haarautuvat sarvet (4 haaraa, luukärjet), kaarnakuono, kulmakaari, sammallakki, torahampaat, lisäsilmät, sammalolkapäät ja
    hohtavat sienet, kaarnalevyt, selkäkyttyrä luupiikein, köynnökset lehtineen (keinuvat), puukynnet.
  - Kolmiot: 12–20 tuhatta / pomo (ennen ~2 300). Rakenne sama (`makeHumanoid` + osat) → animaatiot, silmät (`f.eyes`), herätys, ryntäys toimivat.
- **Ultra-efektit** (`bossUltra()`: Ultra-esiasetus tai Ultra-ruoho; `f.fx(dt,m)` kutsutaan joka ruutu ai.js:ssä ennen pomon tekoälyä):
  silmissä isot värisevät liekit kaikilla; Kalmanvartijan ympärillä 6 leijuvaa riimukiveä hehkuvine renkaineen, Jäättären ympärillä 8 jääkristallia ja
  huurrehiukkasia, Kalmaherran ympärillä 3 kulkusuuntaan katsovaa aavekalloa ja orbista nouseva sieluliekki, Aarnihirviön ympärillä 12 lehteä ja
  6 tulikärpästä. Riimuhalkeamat, rintakivi ja sienet sykkivät kaikilla tasoilla. Leijuvat palat ovat `f.g`:n suoria lapsia → irtoavat kuollessa.
- **Kuolema uusilla malleilla:** näkymättömät lapset (Ultra-palat muulla tasolla) poistetaan ennen repeämistä, joten ne eivät ole osia eivätkä saa
  kumpua. Hehkuvat osat (MeshBasic: silmät, riimut, sienet, orbi) himmenevät valon kadotessa ja häipyvät maatuessa (`D.basic`). Testi: kaikki 4 –
  osia 12–25 (Ultra-palat mukana), saaliilla säde, loppu ~21,5 s.
- **Majakkasäde pomon saaliille** (`beaconAdd`/`beaconTick`, state.js): pystysuora hehkuva valopylväs (ydin + leveä hehku, häipyy ylöspäin,
  maailmassa 22 m, luolassa 6 m), sykkivä maarengas ja kipinät pomon värissä; näkyy vain samassa ulottuvuudessa, poistuu poimittaessa (`removeDrop`).
- `tarkistus.mjs` KAIKKI OK (2 uutta riviä: mallit + Ultra, majakkasäde + kuoleman osat).

### v1.92 (DEV: reittiviiva pomohuoneeseen, Ä-valikon isot napit, seinien läpi, aika/sää-lukko, maailman pysäytys, V lennossa)
- **Ö: reittiviiva** (täppä `route`, `devRouteLine`/`bossRoute`, dungeons.js): valkoinen nauha lattialla **lyhintä reittiä pomohuoneeseen**, näkyy
  seinien läpi. Leveyshaku ulottuvuuden ruudukossa (`R.grid`, tallennetaan `ensureRealm`issa) pelaajan ruudusta ensimmäiseen pomohuoneen ruutuun,
  sitten suoristus (hypätään niin pitkälle kuin suora mahtuu 0,6 m välillä seiniin, `rClear`). Lasketaan uudelleen kun pelaajan ruutu vaihtuu,
  ensimmäinen pätkä seuraa pelaajaa joka ruudussa; huoneessa viiva katoaa. Testi: Aarnihauta sisäänkäynniltä 5 pistettä / 135 m, kaikki pätkät
  seinättömiä, reittiä kävelemällä (ei noclipiä) päästiin huoneeseen ilman jumitusta ja pomo heräsi.
- **Ä-valikko käytännöllisemmäksi:** **isot napit alkuun** (vihreä = päällä): *Kuolemattomuus*, *Lento* (alkaa heti, ei tarvitse tuplahypätä),
  *Seinien läpi*, *Lukitse aika ja sää*, *Pysäytä maailma* ja punainen toimintonappi *Terveys täyteen* (terveys, kestävyys, kylläisyys, palaminen pois).
  Pienet täpät jäivät: ei nälkää, rajaton kestävyys, korkein taso, ei painorajaa (Kaikki päälle/pois koskee vain niitä).
- **Seinien läpi** (`noclip`, player.js): ei törmäyksiä eikä kattoa; maa = maasto tai luolan lattia (esineiden päälle ei nousta). Testi: seinä pysäytti
  1,22 m:ssä, noclipillä läpi 6,67 m.
- **Lukitse aika ja sää** (`lockTW`, main.js): kello ei etene eikä sää vaihdu. **Pysäytä maailma** (`freeze`): olennot, ammukset, pudotukset,
  hiukkaset, työpisteet, syntyminen, nälkä/kylmä, aika, sää ja Kalmanpesä seis – vain pelaaja, kamera ja käyttöliittymä päivittyvät.
- **V nopeuttaa lentoa:** lennossa V pohjassa vaaka- ja pystynopeus ×6 (Ctrl ×2 lisäksi). Testi: 8,8× matka sekunnissa (kiihtyminen mukana).
- `tarkistus.mjs` KAIKKI OK (2 uutta riviä).

### v1.91 (DEV Ö-valikko: olennot ja pomot; pomon herätys pomohuoneeseen astuessa)
- **DEV-valikko Ö** (`renderDevM`, ui.js; vain DEV-tilassa, näppäin `Semicolon` / `e.key` ö): **Luo olento 3 m eteen** – kaikki 26 lajia
  ryhmissä Eläimet / Viholliset / Pomot, kameran katsesuuntaan (`devSpawnMob`). Ulottuvuudessa olento saa ulottuvuusversion; vihamielinen aloittaa
  jahdin. **Pomot syntyvät herätysanimaatiolla** (nousevat 8 s maasta). DEV-luotu olento `m.devSpawn`: vartija ei vajoa pois kehästä kaukana eikä
  kirjaa voittoa, ulottuvuuspomo ilman `rmIdx`:ää ei merkitse ulottuvuutta kukistetuksi; terveyspalkki näkyy myös maailmassa.
- **Ulottuvuuksien pomot:** *Pomohuoneeseen* (`devTpBossRoom`: siirtyy heti ulottuvuuteen ilman häivytystä, pisimpään vapaaseen suuntaan 75 %
  seinään, katse pomoon → herätys alkaa heti), *Portin eteen* (`devTpPortal`: maailman puolen portin eteen, katse porttiin; poistuu luolasta
  `devLeaveDun`), *Elvytä pomo* kukistetulle (`devReviveBoss`: `fo('rb')`/`fo('rbHp')` pois, luodaan nukkumaan). Kalmanvartija: *Kalmankehään*.
- **Apuväline: pomohuoneen ääriviiva** (DEV-täppä `bossLine`, `devRoomOutline`): näkyy seinien läpi ulottuvuudessa – huoneen reuna lattialla ja 2,5 m
  korkeudella, pystytolpat, keltainen varaetäisyyden ympyrä ja punainen pylväs pomon paikalla; kirkastuu kun olet huoneessa. Viivoilla `fog:false`
  (muuten luolan tiheä sumu himmensi ne).
- **Herätys pomohuoneeseen astuessa:** `ensureRealm` laskee **pomohuoneen** (`R.room`): 48 sädettä pomon paikalta lähimpään seinään (enintään 5,5 ruutua
  = 17,6 m, ettei käytävä venytä huonetta) ja keskiarvon `avg` = keskimääräinen matka keskeltä seinään. `inBossRoom(R,x,z)`: pelaaja säteiden
  ääriviivan sisällä **tai** varaetäisyyden (`avg`) sisällä → herätys. Korvaa v1.90:n etäisyys + näköyhteys -ehdon. Mitattu: Routaluola avg 10,1 m
  (säteet 1,5–17,8 m, pomo reunan lähellä), Kalmankammiossa sisään kävellessä herätys juuri ääriviivan kohdalla.
- Testattu `?dev=1`: Ö avaa valikon (26 olentoa, 3 pomoriviä), susi täsmälleen 3,00 m eteen, pomohuoneeseen → herätys + ääriviiva, portin eteen
  0 m, elvytys luo pomon, DEV-Aarnihirviö maailmassa nousee ja jahtaa, DEV-vartija ei vajoa eikä kirjaa voittoa. `tarkistus.mjs` KAIKKI OK (2 uutta riviä).

### v1.90 (pomojen 8 s herätys ja 12 s kuolema + maatuminen, ryntäyksen etukeno, jousikalmon miekkaan vaihto)
- **Jousikalmo:** kun pelaaja tulee alle 3,2 m päähän kesken vedon, kalmo **keskeyttää vedon heti** (`aimT=0`) ja hakkaa miekalla; jousiasento
  rentoutuu. Uusi veto alkaa vasta yli 3,6 m päässä (ei edestakaista vaihtelua). Testi: veto alkoi, pelaaja tuli viereen → 0 nuolta, 3 miekaniskua.
- **Bugi korjattu – pomo vilahti näkyviin ennen herätystä:** nukkuva ulottuvuuspomo luodaan heti **näkymättömänä maan alle** (`bossHide`,
  syvyys `fh`+1,5 m, `m.riseY` = lattia, haavoittumaton). Herätys alkaa vasta kun **pelaaja astuu huoneeseen**: etäisyys < `aggro` **ja näköyhteys**
  pomon paikalta (`losClear`, seinät estävät) ja korkeusero < 4 m. Pelaajan kuollessa pomo vajoaa piiloon kotipaikalleen ja herää uudelleen.
- **Herätys 8 s (`BOSS_RISE`, `bossRisePose`):** 0–1,2 s lattia halkeaa (hehkuva rengas + 9 säröä pomon värissä, halkeamasta nousee oikeaa valoa,
  maa tärisee) · 1,2–5,6 s nousee maan alta pää alhaalla ja kädet sivuilla, multaa varisee maasta ja vartalosta · 5,6–6,6 s pää nousee ja
  **5,9 s pomo huomaa pelaajan** (`bossWakeRoar`: suuttumisääni, silmät leimahtavat, halkeama välähtää, "X herää!", alkaa kääntyä pelaajaan –
  ennen sitä se ei seuraa pelaajaa) · 6,6–7,6 s suoristuu ja levittää kätensä, 7,5 s paineaalto, pöly ja jysähdys · 8 s jahti. Sama Kalmanvartijalla.
- **Kuolema ~12 s + maatuminen ~10 s (`bossDeathAnim`):** kalpenee **heti** noustessaan · kolme **todellista pistevaloa pinoutuu** 0,4 / 1,6 / 2,8 s
  (kukin 0 → 9 pehmeästi, kiertävät pomon ympäri) ja `BOSS_GLOW` kirkastaa koko huoneen (hemi +1,2 ja amb +0,5 luolassa) · 2,6–5,2 s kädet
  levälleen, pää taakse · **5,6 s kuolinääni kaiulla** ja ruumis **repeää: vartalo jää keskelle**, muut osat liukuvat 1,8 s:ssa omiin suuntiinsa
  hieman irti (0,45–0,9 m + koon mukaan), valosäikeet vartalon ja osien välissä; jälkikaiku 0,45 s · saalis ilmestyy leijumaan vartalon korkeudelle ·
  8,4–9,1 s valo, hehku ja vaaleus katoavat · 8,9 s → **osat putoavat yksitellen** (enintään 0,22 s välein, vartalo viimeisenä), pieni pomppu,
  pöly · **saalis leijuu ja putoaa nätisti 12,6 s** (`d.hold`, ei poimittavissa leijuessa) · **maatuminen** (yllätys): osat tummuvat mullaksi,
  painuvat kokoon ja vajoavat; alle kasvaa multakumpu, jolle nousee pomon värissä **hehkuvia sieniä** ja itiöitä leijuu (tulikuolemassa tuhkakasa,
  hiillos ja savu); kaikki häipyy ~10 s laskeutumisesta. Pomo poistetaan ~21 s kohdalla. Jos pomo poistetaan ennen repeämistä, saalis tulee pelaajan luo.
- **Valot:** `updateLights` lajittelee nyt ensin etusijan (`pri`) mukaan → pomon valot saavat aina valopaikan, vaikka soihtuja olisi lähempänä
  (aiemmin kuolemavalo saattoi jäädä kokonaan pois). Herätyksen halkeamavalo `pri:2`, kuolemavalot `pri:4`.
- **Ryntäys (`bossChargePose`):** kierrosjärjestys **YXZ** → kallistus hahmon omaan eteen (XYZ:llä kallistus tapahtui maailman X-akselin ympäri, joten
  se näkyi sivukenona). 0–0,6 s kyyristyy, kädet taakse ja **silmät kirkastuvat**; ryntäyksessä etukeno 0,45 rad, polvet koukussa, jalat juoksevat.
  Asento nollataan myös keskeytyksessä (`bossChargeReset`). Testi: pää 1,1–2,1 m eteenpäin, 0,00 sivulle kaikilla pomoilla kaikissa suunnissa.
- **Silmät:** `makeHumanoid` palauttaa `f.eyes`; `bossEyes(m,k)` kirkastaa, suurentaa ja lisää hehkupallon (omat materiaalit, ei vaikuta muihin).
- Testattu pelissä (Kalmaherra, Aarnihirviö, Kalmanvartija ulkona): piilossa 5,9 m maan alla, palkki ei näy ennen huonetta; huomaaminen 5,93 s, aggro 1 kerta;
  kuoleman kuvasarja; saalis 3,7 m ilmassa leijumassa ja maassa lopuksi; ei jääneitä valoja. `tarkistus.mjs` KAIKKI OK (5 uutta/päivitettyä riviä).

### v1.89 (jousikalmon kädet ja miekka, pomojen herätys- ja kuolema-animaatiot)
- **Jousikalmo:** jousi on nyt **vasemmassa** kädessä ja **miekka oikeassa**, täsmälleen kuten pelaajalla (`state.js`: `cat==='bow'` → `fig.handL`).
  Alle 2,4 m päässä kalmo lyö miekalla (tavallinen lähihyökkäys), kauempana ampuu. Vetoon lisätty sekunti: `ARCH_DRAW` 0,9 → **1,9 s**
  (mitattu testissä: ensimmäisestä tähtäyksestä laukaukseen 1,9 s).
- **Pomon herätys (`bossRisePose`, effects.js; `BOSS_RISE`=5 s):** pomo nousee maasta **5 sekunnissa** pää alhaalla ja kädet sivuilla (nukkuu yhä);
  viimeisen viidenneksen aikana pää nousee ja hahmo suoristuu. **Haavoittumaton** koko nousun ajan (`m.sinking=1` → `damageMob` ei tee vahinkoa).
  **Terveyspalkki tulee heti** animaation alkaessa (tila ei ole enää `sleep`; ulottuvuuksissa yhden ruudun viive, koska `updateDungeons` ajetaan ennen
  `updateMobs`-kutsua). **Suuttumisääni vasta kun pomo seisoo** ja on huomannut pelaajan (`bossWakeRoar`: oma aggro-ääni tai tehty karjaisu;
  asettaa `angerDone`, joten `creTick` ei soita sitä toiseen kertaan). Tilan nimi on nyt molemmilla **`rise`** (ennen ulottuvuuspomoilla `intro`,
  Kalmanvartijalla 2,5 s `rise` + 2,2 s `intro`). Nousun aikana ei soi rauhallista ääntelyä eikä kaikuääntä.
- **Pomon kuolema (`bossDeathAnim`, effects.js; muilla olennoilla ennallaan):** 0–3 s irtoaa maasta ja kohoaa hitaasti raajat veltoiksi · 3–4,9 s kalpenee
  valkoiseksi · 4,9–6,2 s sokaiseva valo valaisee huoneen (`lightSources`, kirkkaus 26, + additiivinen hehkupallo) · **5,3 s kuolinääni** `creSnd`illa
  (`rev:1.8`) ja **ruumis hajoaa osiin ilmassa** (hahmon ylimmän tason osat irrotetaan `scene.attach`illa, saavat sinkoamisnopeuden ja pyörimisen) ·
  jälkikaiku 0,45 s myöhemmin (`rev:2.4`, `v:.4`, `p:.92`, `add:1`) · 5,3–6,8 s osat putoavat painovoimalla (15 m/s²) ja jäävät maahan · **6,2–6,55 s valo
  ja vaaleus katoavat nopeasti**, ennen kuin osat osuvat maahan · 7,4–9,4 s osat maatuvat (läpinäkyvyys häivyttää, `DEATH_END` 9,4 s kuten muillakin).
  Tulikuolemassa osat tummuvat tuhkan värisiksi ja kipinöivät. Kuolinääni ei enää soi `killMob`issa pomoilla (vain tärähdys), vaan animaatiossa.
  Siivous `bossDeathEnd`: osat, valo ja hehku poistetaan myös jos pomo poistetaan kesken (esim. ulottuvuudesta poistuminen, `mobRemove`).
- **`creSnd(m, laji, o)` uudet valinnat:** `rev` = pakotettu kaiun määrä (myös maailmassa), `add` = lisä-ääni joka ei katkaise olennon muita ääniä eikä katkea niistä.
- Testattu: jousi vasemmassa / miekka oikeassa ja kuva vedosta; lähellä 6 miekaniskua eikä yhtään nuolta; herätys 5 s (0,7 s kohdalla 4,4 m maan alla, pää 0,85 rad),
  vahinko 0 nousun aikana, lopussa pystyssä ja `angerDone`; kuolema: 19 osaa irtosi, valo 26 → 0,05 ennen maahantuloa, molemmat äänet, poisto 9,4 s, ei jääneitä valoja.

### v1.88 (jousikalmo ampuu kuin pelaaja, ulottuvuuspomojen kaikuääni)
- **Jousikalmo (`archerAI`, ai.js):** veto 0,9 s (`ARCH_DRAW`). Tähtäyspiste seuraa pelaajaa **viiveellä** (aikavakio ~0,25 s) ja kalmo **kääntyy hitaasti**
  (`ARCH_TURN` 1,0 rad/s, ylös/alas `ARCH_PITCH` 0,9 rad/s; painovoimakorjaus lentoajalle). **Nuoli lähtee vapautushetkellä täsmälleen siihen suuntaan, johon
  jousi osoittaa** (+ 2° hajonta kuten pelaajan jousessa); ei ennakointia (vanha `P.vel`-ennakointi poistettu). Nuolen fysiikka sama kuin pelaajalla
  (`shootArrow`, nopeus 32 m/s, painovoima 7, tuuli). Testi (12 m, yö): paikallaan seisova osuu 14/14, sinimuotoisesti sivulle liikkuva 3/14,
  0,67 s välein puolta vaihtava 0/14 → väistäminen ja häilyminen toimii.
- **Jousen asento:** `bowAim` (player.js) yleistettiin `bowAimFig(F, jousi, k, yaw, sijainti)`; pelaaja käyttää sitä `bowAim`-kääreen kautta, jousikalmo `archerPose`:lla
  (ai.js, animMobin jälkeen): vasen käsi kahvaan edessä, jänne poskelle oikealle, nuoli jänteellä (`updateBowMesh`), sulava sisään 0,2 s / ulos 0,3 s.
  Kalmon keho ei käänny kylkeä kuten pelaajan `rig` (mobeilla ei rigiä) – vain kädet ja jousi.
- **Kaikuääni (`echo`, uusi äänilaji, vain `ai:'rboss'`: Jäätär, Kalmaherra, Aarnihirviö):** 1–2 versiota (`<pomo>_echo_1/2`). Kuuluu **vain kun pomo nukkuu
  (`state==='sleep'`) ja pelaaja on samassa ulottuvuudessa** (`m.realm===P.realm`), 24–48 s välein (ensimmäinen 5–14 s sisääntulosta); loppuu kun pomo herää
  (`intro`) tai pelaaja poistuu. Soi pomon suunnasta, mutta **enintään 38 m päästä** (`creEchoPos`) → kaukainen pomo kuuluu vaimeana kaikuna. Sointi:
  alipäästö 1,5 kHz, voimakkuus ×0,6, kaiun lähetys 1,3 (kuiva jää hiljaiseksi), tärkeys 1 (ei syrjäytä muita). **Aarnihirviön kaikuäänet ovat kaikkien
  pomojen varaääni 💎** (Jäätär ×1,2, Kalmaherra ×0,85 VARAANI-ketjun kautta). **v1.95: myös Kalmanvartijalla on kaikuääni** (`vartija_echo_1/2`, ks. v1.95). Työkalu: `ECHO_AI`, raja 5 s (pomo 6), tavoite −26 LUFS, pitkä häivytys 0,8 s; 6 uutta paikkamerkkiä (`aarnihirvio/jaajattari/kalmaherra_echo_1/2`).
- Testattu: keinoäänillä (voice `ec`, etäisyys 38 m, send 1,3, gain 0,6, sävel ×0,85), herääminen ja toinen ulottuvuus → ei kaikua.

### v1.87 (palavan pomon kipuääni)
- **Palava pomo (`ai` boss tai rboss) ähkii:** kun pomo on tulessa (`burnT>0`, `updateBurn` actions.js), se toistaa oman **hurt-äänensä silmukkana**
  1,4–2,2 s välein (alle 60 m päässä), **matalampana (sävel ×0,78) ja hiljaisempana (voimakkuus ×0,55)**. Ei omaa hurt-ääntä → varaääniketju (Aarnihirviön
  ääni) kuten normaalisti; ei ääntä lainkaan → hiljaa (ei tehtyä ääntä). Tavalliset osumat soivat edelleen normaalisti; muut olennot eivät ähki palaessaan.
- **`creSnd(m, laji, o)`:** uusi valinnainen `o` = `{p: sävelkerroin, v: voimakkuuskerroin, pri: tärkeys, key: oma laskuriavain}`. Palokipu käyttää
  `pri:1.5` (rauhallinen 1 < palokipu 1.5 < jahti 2): jahti- ja muut tärkeämmät äänet katkaisevat sen, eikä se tuki muita; dungeoneissa kaiku mukana.
- Testattu: aarnihirviö palaa 10 s → 6 kutsua (~1,6 s välein) sävel 0,78 ja voimakkuus 0,55, kaiku mukana (dun); palava susi ei ähki. `tarkistus.mjs` + `full157`.

### v1.86 (Aarnihirviön äänet pääääneksi, kuolemapaikat 1/2, trimmaus ja voimakkuus, kaiku, toistosäännöt)
- Käyttäjä lisäsi Aarnihirviön 7 ääntä (aggro 1–2, chase 1–2, death 1, hurt 1, idle 1). **Aarnihirviö on nyt 💎**: Jäätär ja Kalmaherra lainaavat
  siltä (ei enää Kalmon ylimykseltä). Havainto: `aarnihirvio_idle_1` ja `aarnihirvio_chase_2` ovat sama tiedosto (sama md5) – korvaa toinen eri äänellä.
- **Kuolemaäänet:** 1 paikka ulottuvuuksien hirviöille, 2 muille (aiemmin 3). 29 ylimääräistä paikkamerkkiä poistettu (`sounds/raw/*_death_3`,
  `_death_2` rboss). Työkalu, taulukko ja pelin haku mukautettu (creRes toimii mille tahansa versioille 1–3).
- **Trimmaus ja voimakkuus:** uusi työkalun käsittely (ks. Äänisuunnitelma). Aarnihirviön tulokset: kesto 1,6–6,0 s, äänekkyys −21…−15 LUFS,
  huiput −1,3…−7,7 dBFS (ei leikkaa), tiedostot 20–73 kt.
- **Kaiku:** yhteinen ConvolverNode vain `m.dun`-olennoille, kytkeytyy tarvittaessa (ei kuormaa ulkona). **Toistosäännöt:** tärkeys, yksi ääni per
  olento, 10 äänen raja, ei kuoroa, ei saman version toistoa (ks. Äänisuunnitelma).
- Työkalu varoittaa nyt erästä (HUOM-rivit: tuplatiedostot, iso vahvistus, lyhyt, ylimääräinen paikka). Koko pelin tarkistus (6 karttaa) 0 virhettä.
- Testattu selaimessa (oikea AudioContext, autoplay sallittu): ketju (jaajattari ×1,2, kalmaherra ×0,85), tärkeys (osuma katkaisee jahdin, jahti ei
  osumaa), 1 ääni/olento, kaiun lähetys vain dun-olennoilla, kaiku irtoaa 3 s jälkeen kun mikään kaiullinen ääni ei soi; `tarkistus.mjs` KAIKKI OK.

### v1.85 (äänet: 3 versiota, suuttumisääni kerran, jahtiääni)
- **Versiot:** jokaisella äänilajilla paikat `_1`, `_2`, `_3`; peli arpoo vain olemassa olevista (yksi riittää, tyhjät ohitetaan). Varaääniketju
  tuo myös toisen olennon kaikki versiot. Paikkamerkit kaikille paikoille (336 kpl, 288 t). `creRes(id, laji)` palauttaa `{names, p}`.
- **Suuttumisääni (`aggro`):** vihamieliset ja pomot **vain kerran koko elinaikanaan** (kun huomaavat sinut ensimmäistä kertaa); jos sitä ei
  ole (ei omaa eikä varaääntä), erillistä ääntä ei soiteta vaan jahtiääni alkaa heti. Neutraalit (karhu, hirvi, karju, ilves, ahma, emakko)
  pitävät vanhan käytöksen: suuttumisääni aina kun suuttuvat (uusi vasta 5 s jahdin päättymisen jälkeen), ei jahtiääntä.
- **Jahtiääni (`chase`, uusi, vihamieliset ja pomot):** toistuu 4–9 s välein kun olento jahtaa sinua (alle 55 m), ensimmäinen suuttumisäänen
  keston + 1–3 s jälkeen; kun jahti alkaa uudelleen ensimmäinen 1–3 s kuluttua. Jahdin aikana rauhallinen ääntely (idle) vaihtuu jahtiääneen,
  jos sellainen on. Pomon herääminen (`intro`) laukaisee suuttumisäänen.
- **Taulukko:** AANILISTA.md rivi per (olento, laji) ja 3 versiota samalla rivillä, tila `✅ oma: _1, _3 (2/3)`.
- Testattu keinoäänillä (kalmo/susi/karju/ylimys): suuttumisääni kerran, jahtiäänen ensimmäinen suuttumisäänen jälkeen, väli 4–9 s, paluu
  jahtiin ei uutta suuttumisääntä, susi (ei aggro) alkaa heti, ylimys käyttää kalmon ääniä. Testiäänet palautettu paikkamerkeiksi.

### v1.84 (äänierä A: olentojen äänijärjestelmä ja äänipohja)
- **Äänisuunnitelma** kirjattu pysyväksi päätökseksi (oma osio) ja äänierät A–E ideajonoon.
- **Paikkamerkit:** 124 hiljaista mp3:ta (288 t) `sounds/raw/`: jokaiselle 26 olennolle `<id>_idle_1/_idle_2/_hurt_1/_death_1`, hyökkääville
  (ai neutral/hostile/boss/rboss) lisäksi `_aggro_1`.
- **`tools/process_sounds.py`:** `--init` luo puuttuvat paikkamerkit (ei ylikirjoita). Käsittely: oikea ääni = yli 3 kt, muoto sisällöstä
  (RIFF/WAVE, ID3/kehystahdistus, OggS, fLaC, ftyp, FORM) → ffmpeg: hiljaisuus pois alusta ja lopusta (−50 dB), loudnorm I −16 /
  TP −1,5, mono 44,1 kHz 96 kbps → `sounds/<nimi>.mp3`. Ohittaa muuttumattomat (raakatiedoston tiiviste `src`), poistaa käsitellyn, jos
  raaka palautetaan paikkamerkiksi tai poistetaan. Jos samalla nimellä on useampi raakatiedosto (esim. .wav ja paikkamerkki .mp3), isompi
  voittaa. Kirjoittaa `sounds/manifest.json` {nimi: {h, src, dur}} ja `sounds/AANILISTA.md` (ohje + taulukko eläimet / viholliset /
  pomot: tila ✅/🔁 mistä ja sävelkerroin/⬜ + "varalla", kuvaus, hakusanat englanniksi, 💎/⭐ + lainaajat). Kuvaukset ja hakusanat
  ovat työkalun `CRE_INFO`:ssa, nimet ja ai luetaan mobs.js:stä, varaäänet audio.js:n VARAANI-lohkosta (tiukkaa JSONia merkkien välissä).
- **Peli (`audio.js`):** `VARAANI` (19 olentoa, ketju seurataan, kertoimet kertautuvat), `CRE`, `creInit` (manifest kerran, `?v=HV`),
  `creRes` (oma → idle_2→idle_1 → ketju), `creLoad` (laiska, spawnMob), `creBuf` (`?h=tiiviste`), `creSnd` (PannerNode equalpower/inverse,
  ref 3 m – pomot 8 m, max 90 m, sävel ×ketju ±6 %, enintään 14 ääntä), `creTick` (kuuntelija = kamera, äänet seuraavat olentoa, idle
  6–15 s välein alle 25 m, aggro kerran jahdin/pomon heräämisen alkaessa alle 70 m, uusi aggro vasta 5 s jahdin jälkeen). Osuma
  `damageMob` (tauko 0,4 s, ei jos kuolee), kuolema `killMob` (tehty 'die' jos ei tiedostoa). Asetus Ohjaus ja ääni › "Olentojen äänet"
  (`SET.creVol`, oletus 80 %).
- Testattu: testiäänet (wav .mp3-päätteellä + erillinen .wav) läpi putkesta, hiljaisuus leikattu 2,4 → 1,2 s, −16 dB; pelissä lataus,
  idle, aggro, osuma (1 / 2 iskua), kuolinääni, 3D-paikka seuraa olentoa, kalmasusi → susi ×0,88, voimakkuus 0 = hiljaa. Testiäänet
  poistettu (työkalu siivosi käsitellyt).
- Huom: ilman palvelinta (index.html tuplaklikkaamalla) tiedostoäänet eivät lataudu (selaimen rajoitus) → tehdyt äänet.

### v1.83 (veren fysiikka Mediumista ylöspäin)
- `bloodFx` (pisarat lentävät lyönnin suuntaan ja jäävät maahan, lammikko kasvaa) päällä esiasetuksissa Medium–Ultra (ennen vain High+/Ultra)
  ja oletuksena (`SET_DEF`, Medium). Kertasiirto `SET._v` 4: esiasetusta vastaava vanha tallenne saa uuden arvon (ei Customiksi).

### v1.82 (DEV-työkalut oletuksena pois)
- `DEV` (core.js) ei ole enää kiinteä `true`: luetaan `localStorage.hiidenmaa_devon` ('1' = päällä) sivun latauksessa; `?dev=1` kytkee
  päälle pysyvästi. Kytkin: Asetukset › Ohjaus ja ääni › alareunan "Kehittäjä" › Kehittäjätyökalut (DEV) → vahvistus, peli tallennetaan,
  sivu ladataan uudelleen. DEV pois → ei DEV-valikkoa (Ä), ei 10× nopeutta (V), ei DEV-merkkiä, ei DEV-etuja (kestävyys, korkein taso,
  painoraja) – normaali eteneminen. Tarkistus: DEV-paneelin tarkistus ehdolliseksi.
- Kun DEV pois, kaikki DEV-viitteet piilossa (merkki, paneeli, näppäinlistan ja Kaikki toiminnot -ikkunan DEV-rivit, kytkimen kuvaus
  lyhyenä); vain kytkin "Kehittäjätyökalut (DEV)" näkyy. Testattu tekstihaulla.
- **Päävalikko:** "Selviytymispeli · versio X" perään turkoosi tunnus "Early Access 1.0" (`.eaTag`). **Pysyvä sääntö:** numeroa 1.0 ei
  muuteta päivitysten mukana (käyttäjä); bump.sh muuttaa vain "versio X".

### v1.81 (pomo väsyy: 3 kuolemaa → ei enää parane)
- `playerDie`: tappaja = lähin elossa oleva pomo (`ai` boss/rboss) ≤ 45 m samassa tilassa (maailma/ulottuvuus) → `flags.bossDeaths[tyyppi]++`
  (tallentuu maailman mukana, maailmakohtainen). `bossTired(type)` (mobs.js) ≥ 3 → ai.js:n pomojen terveyden palautus ohitetaan pysyvästi.
  Kuolinruudun vihje: "X kaatoi sinut (1/3) … kolme kertaa → ei enää palauta terveyttään" ja 3. kerralla "X on voittanut sinut 3 kertaa.
  Se ei enää palauta terveyttään". Testattu: laskuri 1→3, palautus 50 % → 50 % (ilman 50 % → 55 %), tallennus/lataus säilyttää.

### v1.80 (erittäin tarkat varjot ohittavat varjoasetukset)
- Kun `shUltra` päällä (`SHU`, `shUltraOn`): varjot aina päällä (myös jos Varjot = Pois/Kevyet), kartta 8192 (tai suurin tuettu, ei
  puolitusta), päivitys joka ruutu (autoUpdate, shRate/shFar ohitetaan), automaattinen varjojen laatu pois, oma etäisyys: Terävä 90 m,
  pehmeät 110 m (PCF, säde 3,5), laaja 160 m näkymän suuntaan (siirto 72 m). Bias −0,00035, varjokameran far 420. Ohitetut rivit
  (`SHU_OVR`: Varjot, tarkkuus, etäisyys, päivitystiheys, automaattinen laatu, harvemmin paikallaan) harmaina ja lukittuina, huomautus
  "ohitettu"; ultrarivin huomautus näyttää tason arvot. Testattu: kartta 8192 kaikilla, alueet 90/110/160, joka ruutu, varjo selvästi terävämpi.

### v1.79 (esiasetukset kytkevät automaattisäädön alavalinnat)
- Käyttäjä huomasi: Ultralla "Automaattinen varjojen laatu" jäi Päällä-tilaan (esiasetus kytki vain `autoAll`:n). Nyt esiasetukset asettavat
  myös `autoRes`, `autoFx`, `autoDist`, `autoQ`: Low–Medium+ päällä, High–Ultra pois. Kertasiirto `SET._v` 3: vanha tallenne, joka vastaa
  esiasetusta näitä (ja arrowLight) lukuun ottamatta, saa ne esiasetuksesta (ei muutu Customiksi). Testattu: Ultra → kaikki pois, Medium →
  päällä, vanha Ultra-tallenne → edelleen Ultra.
- **Päätös:** v1.74:n hartia/kaulus/V-vartalomuutos jää pysyväksi (käyttäjä piti siitä); peruutuskoodi säilyy v1.74:n kohdassa.

### v1.78 (herätessä läheiset viholliset katoavat)
- `respawn()`: herätyspaikan ≤ 35 m säteellä olevat viholliset (hostile, myös suuttunut neutraali kuten karhu) poistetaan savupilvellä,
  jottei pelaaja kuole heti uudelleen. Jäävät: pomot, vartijat (`m.guard`), ulottuvuuksien viholliset, rauhalliset eläimet. Testi: 2 kalmoa
  lähellä poistuivat, 60 m päässä ja peura jäivät.

### v1.77 (jousen nuoliteksti, pääosumat, pikapaikan nimi)
- **Nuoliteksti** (`#ammoT`, `showAmmo`): jousi käteen → hotbarin yläpuolelle 2,5 s "Piikivinuolet ×12" (kuvake) tai punertava "Ei nuolia";
  latauksen alussa 2 s pienempänä; häivytys. z-index 6 (muuten HUD-elementti peitti).
- **Pääosuma** (`headShot`, state.js): nuolen kulkema jana (edellinen → nykyinen kohta) vs. pään rajauslaatikko (`f.head`, animaatio mukana)
  pallona (45 % suurimmasta sivusta + 3 cm), tarkistetaan ennen vartaloa. +10 % vahinko, punainen osumamerkki, "Pääosuma!". Testi: päähän
  13,2 vs. vartaloon 12.
- **Pikapaikan nimi** (`#hotName`, `showHotName`, `itemRarity`): valinnassa nimi valitun ruudun yläpuolelle ~1 s + häivytys, ohut fontti
  (300), väri: kulta = arvoesine/harvinainen (rare, VALUABLE), sininen = valmistustaso ≥ 6, vihreä = taso ≥ 3 tai laatu ≥ 2, muut vaalea.
  Yksi elementti → nopeassa vaihdossa vanha nimi korvautuu heti. Laatutähdet nimen perässä.

### v1.76 (grafiikkatasot, erittäin tarkat varjot, valikon kuorma, osoitin, Shift-tiedot)
- **Esiasetukset:** tulinuolten valo päällä High+ ja Ultra (muilla pois). Automaattisäädöt pois High-tasolta ylöspäin (autoAll false, kuten ennen).
- **Erittäin tarkat varjot** (`SET.shUltra`, ei esiasetuksissa, oletus Pois): Terävä 8192 / Terävä + pehmeät reunat (PCFShadowMap, säde 3,5) /
  Terävä + laaja alue (1,6× alue näkymän suuntaan, päivitys joka ruutu; punainen = raskain). 8192 tai suurin tuettu (maxTextureSize).
  Rivi violetilla katkoviivakehyksellä, valintanapit pyöreinä, päällä punainen kehys + "!" (`ultraShRow`). Aito kaskadivarjo vaatisi
  three.js-lisäosan (CSM), jota r128-buildissa ei ole – siksi "laaja alue" näkymään sovitettuna.
- **Valikko ei kuormita pelissä:** taustakuva piirretään vain päävalikossa, partikkelit (`mfxFrame`) vain kun valikko näkyy, esiasetus-
  säätimen efektit pysähtyvät itsestään, CSS-animaatiot eivät pyöri piilossa. Uutta: valikon avautuessa partikkelikerros häivyttyy esiin
  (`.mfFade`). Asetus Ohjaus ja ääni › "Älä pysäytä valikon animaatioita pelin aikana" (`menuAnimKeep`, oletus pois).
- **Osoitin:** Chromen `pointerrawupdate` liikuttaa osoitinta heti (mousemove varalla, jos raw ei tule 150 ms:iin); paneelin ollessa auki
  3D piirretään joka toinen ruutu (`uiAlt`) → osoittimen päivitys tihenee.
- **Shift-tiedot:** VC:n keinotekoiset hiiritapahtumat saavat Shift/Ctrl-tilan näppäimistä (`vcInit`) → Shift pohjassa esinetiedot näkyvät
  heti, kun osoitin siirtyy esineen päälle (kaikkialla, missä `[data-it]`). Ennen piti siirtyä ensin ja sitten painaa Shift.

### v1.75 (näppäintesti + Kaikki toiminnot -ikkuna)
- **Kaikki näppäimet testattu** (keytest: painallus + 8 ruutua, tilan ero): pelatessa W/A/S/D liike 4,6 m/s, Space hyppy, C kyykky (pohjassa),
  B ilman vasaraa → viesti, Q pudottaa pikapaikasta, P tauko, Tab/I reppu, M kartta, J edistyminen, L loki, T HUD-tila, N minikartta,
  2–8 pikapaikka, Ä DEV-valikko; E/X/F/K/Esc/Enter/V tarvitsevat kohteen/tilan (ei muutosta tyhjässä). Rakentaessa: R kierto, G
  kohdistus, H pystykohdistus, Q/Z haamu ylös/alas, B valikko, Shift+R asento. Repussa: E/Tab/P sulkee, M kartta, Q pudottaa 1, Shift+Q
  koko pinon. Kuolleena Enter herää. Ei virheitä; ei kuolleita näppäimiä (vapaat: O, U, Y, Ö, Backspace…).
- **"Näytä kaikki toiminnot"** (Asetukset › Näppäimet, alareuna) → ponnahdusikkuna `#allKeys` (`showAllKeys`, data `ALL_KEYS`): Pelatessa,
  Rakentaessa, Lapio ja kuokka, Valikot ja paneelit, Repussa ja arkussa, Päävalikossa, Erikoistilanteet (+ DEV-tila). Oletusnäppäimet;
  vaihdettu näppäin → perässä "nyt: X" (käyttäjän valinta). Kolme palstaa (CSS columns), sulku Sulje-napista tai taustasta.

### v1.74 (näppäinlista täydeksi, hartiat ja kaulus)
- **Näppäinlista (Asetukset › Näppäimet, Kiinteät):** lisätty I (reppu, Tab:n lisäksi), Q / Shift+Q repussa (hiiren alla tai valittu,
  koko pino), Enter (herää uudelleen / lopeta kirjoitus), Mikä tahansa (ohita maailman alkulento ja avausotsikko), DEV-tilassa V ja Ä,
  sekä tarkemmat hiiren vasen/oikea (jousi, lapio, kuokka). Vaihdettavat näppäimet tulevat ACTIONS-listasta kuten ennen.
- **Pelaajamalli (käyttäjä hyväksyi v1.79 – pysyvä):** kaulus (turkis) hieman leveämpi → olkapäät näyttävät kiinnittyvän;
  vartalo hieman V-muotoinen; kaulan alla välkkynyt tumma laikku korjattu (vartalon yläkansi oli samassa tasossa kuin kauluksen kansi):
  vartalon yläpinta kauluksen sisään ja tumma osa pyöreäreunaisena kumpuna 2,4 cm kauluksen yläpuolelle.
  **PERUUTUS – alkuperäinen koodi (`js/models.js` makePlayer):**
  `const torso=tube(rig,.2,.22,.76,cloth,0,hip+.38,0,1.18,.62,8);` (ilman `rnd(rig,0,hip+.758,…)`-kumpua) ja
  `tube(rig,.27,.23,.12,fur,0,hip+.7,0,1.2,.7,8);`. Uudet: `tube(rig,.218,.205,.74,cloth,0,hip+.37,…)` + `rnd(rig,0,hip+.758,0,.2,cloth,1.12,.13,.58,10)`
  ja `tube(rig,.285,.235,.12,fur,0,hip+.7,0,1.22,.7,8)`.

### v1.73 (yläilmoitus vain testin ajan, tiiviimpi)
- `.ppTop` näkyy vain testin aikana ja häipyy ylös tuloksen tullessa (`.spPerf.res`). Teksti tiivistetty: "Testi auttaa heikompia koneita
  – grafiikkaa kevennetään vain tarvittaessa. Jaksaako koneesi enemmän? Nosta laatua: Asetukset › Grafiikka."

### v1.72 (suorituskykytestin yläilmoitus)
- Testin ja tuloksen ajan yläreunassa (`.ppTop`): "Testi varmistaa sujuvan pelin myös heikommilla koneilla. Se säätää grafiikkaa
  kevyemmäksi vain, jos koneesi tehot jäävät tavallista pienemmiksi. Jos tiedät koneesi jaksavan enemmän, voit nostaa grafiikan laatua
  milloin tahansa: Asetukset › Grafiikka." Matalilla näytöillä (≤ 620 px) pienempi, tulospaneeli alareunaan.

### v1.71 (ensikäynnin jakso ei ohitettavissa)
- Ensikäynnillä (ei merkintää `hiidenmaa_intro`) koko jakso studio → HIIDENMAA → varoitus → suorituskykytesti → siirtymä ilman ohitusta
  (`skip` palaa heti, kun `needSplash`), jotta testi tehdään aina. Palaavan kävijän otsikon voi ohittaa edelleen.
- Merkintä tallennetaan vasta jakson lopussa (`end`), ei alussa: kesken suljettu ensikäynti näyttää jakson ja testin uudelleen.

### v1.70 (kaatuvan puun vihjeet + päivän tarkistus)
- Kaatuvan puun osuma, jos henkiin jää: lyhyt sivuilmoitus "Kaatuva puu osui! Väistä sivuun, kun puu kallistuu." Jos puu tappaa:
  `P.deathCause='tree'` → kuolinruudussa (#deadTip) vihje: astu sivuun kun puu narisee ja kallistuu, älä jää kaatumissuuntaan; myös
  myrskytuuli ja pedot kaatavat puita. Kuolinsyy nollataan jokaisen kuoleman jälkeen (muut kuolemat ilman vihjettä).
- **Päivän tarkistus (v1.59–v1.70):** kaikki käyttäjän pyynnöt käyty läpi. Poistetut koodit vs. v1.58 tarkistettu: vain tarkoitukselliset
  korvaukset (perfStart/Step/End/Needed → boot.js perfRun/perfApply; aloitusjakson skripti → boot.js; vanha latausleimahdus, pilviverho ja
  riimusiirtymä → uudet). Koko pelin tarkistus (full157: 6 karttaa, päivä/yö, 22 vihollistyyppiä, 3 ulottuvuutta + pomot, Hautakumpu,
  tallennus v10, 8 esiasetusta): 0 virhettä, 0 NaN.

### v1.69 (suorituskykytesti kaikille tasoille, riimusiirtymän loppu, AFK-eleet)
- **Suorituskykytesti:** selain tahdistaa piirron näytön virkistystaajuuteen (yleensä 60 Hz, ei muuta rajoitinta), joten pelkkä FPS ei
  erota tehokkaita koneita. Nyt kuormaportaat: 0–2,5 s 1×, 2,5–4,7 s 2× ja 4,7–7 s 4× (näkymä piirretään 2/4 kertaa ruudussa), jos edellinen
  porras ≥ 45 FPS. **Suorituskykyindeksi** = ylimmän portaan FPS × kerroin. Vähennykset: hidas tasaantuminen (> 1,5 s, 0,5 s:n liukuva FPS
  90 %:iin) enintään −20 %, nykivyys (> 5 % ruuduista > 1,6 × mediaani) enintään −25 %. Tasot: < 22 Low, 22 Low+, 30 Medium-, 40 Medium,
  55 Medium+, 75 High, 100 High+, **≥ 140 Ultra** (esim. 4× kuormalla ≥ 35 FPS). Tulos näyttää indeksin, tasaantumisajan ja tasaisuuden.
  `perfApply` hyväksyy nyt indeksit 0–7.
- **Riimusiirtymän loppu** (3,5 s): päällekkäinen sinetti poistettu. ᚺ syttyy sinisenä keskelle ja muut riimut (ᛁᛁᛞᛖᚾᛗᚨᚨ) liukuvat sen
  alta sivuille oransseina kaartuvaksi riviksi (ulommat alempana ja kallistettuina), sitten leimahdus 2,7 s.
- **AFK-kädet:** v1.68:ssa hengityksen/AFK:n z-merkit väärin → kädet painuivat vartaloon ja armClear tärisytti (vasen käsi 41 suunnanvaihtoa
  / 20 s → 1). Nyt kädet ulospäin ja irti reisistä. Eleet 5,5 s jaksoissa: heilunta → pään rapsutus (oikea käsi, kyynärpää rapsuttaa) →
  heilunta → kädet levälleen; pehmeät käyrät (sstep). Liikkeelle lähtiessä afkK laskee 2,6/s → kädet palaavat sulavasti (~0,5 s).

### v1.68 (elävä hahmo: hengitys, AFK, kävelykeinunta)
- **Kävely:** pieni sivukeinunta ±0,012 rad (~0,7°) kävelyssä, juoksussa ennallaan ±0,045 (v1.53 kävelyssä 0).
- **Hengitys** paikallaan (`P.idleK`, maassa, nopeus < 0,3, ei isku/veto/torjunta/kyykky): 4,2 s rytmi, rungon nousu ±6 mm, rinta ±0,012 rad,
  pää vastaliike, kädet avautuvat ±0,035 rad.
- **AFK** (`P.afkT` > 3 s ilman näppäintä, hiiren nappia tai kameran kääntöä; `P.afkK` nousee ~1 s): pää katselee ympärilleen (±0,6 rad +
  pieni nopeampi liike, nyökkäys ±0,09), kädet heiluvat hieman (±0,13), polvet joustavat ja paino siirtyy jalalta toiselle (polvet
  0–0,14, rungon kallistus ±0,03, lasku 2,2 cm). Mikä tahansa syöte palauttaa nopeasti (4/s).

### v1.67 (uusi riimusiirtymä latausnäyttöön)
- Vanha siirtymä (yksi ᚺ + rengas skaalattuna ×160 → suttuinen litteä kehä, ja edellisen ruudun teksti näkyi läpi) korvattu, 2,9 s:
  peittävä tausta; SVG-riimukehä piirtyy (stroke-dashoffset), 48 asteikkoviivaa ja pisteviivakehä, 24 vanhemman riimurivin riimua syttyy
  kierroksena; keskellä riimut tavaavat ᚺᛁᛁᛞᛖᚾᛗᚨᚨ (HIIDENMAA, 0,15 s välein), sitten 6 riimua sulautuu päällekkäin sinetiksi, joka
  leimahtaa: 22 kipinää, kaksi paineaaltoa, valkoinen välähdys → latausnäyttö. Kipinöissä/aalloissa `forwards` (ei `both`, muuten ne näkyvät
  keskellä ennen vuoroaan).

### v1.66 (jousi kaari alas, hakukentän valinta, HIIDENMAA mustasta pilvestä)
- **Jousen kanto:** kaari (etupuoli, josta nuoli lähtee) alas, kaari aukeaa ylöspäin, jänne suorana ylhäällä, raajat eteen/taakse.
  Käden mukainen kierto `BOW_CARRY`=1,71 (mitattu: levossa jänteen päiden korkeusero 0,001 m; kävellessä heiluu käsivarren mukana –
  käyttäjän toive). Vartaloon lukittu suunta (aina vaakatasossa) kokeiltiin ja hylättiin. Mittaus: jänteen kärkien maailmakorkeudet.
- **Ohitusteksti:** ensikäynnillä piilossa (`#splash.first`), palaavalle kävijälle pieni ja himmeä "Ohita: mikä tahansa näppäin".
- **Hakukentät:** virtuaalisen osoittimen napsautus tekstikenttään valitsee aina koko tekstin (ennen vain kun kenttä ei ollut jo valittuna),
  joten kirjoitus korvaa vanhan haun – kuten DEV-haussa. (`input.js` vcFire mousedown.)
- **HIIDENMAA-otsikko:** studio häivyttyy ensin (z-index päällä), ruutu mustana `--tw` (ensikäynti 1,5 s = 1 s häivytys + 0,5 s musta,
  palaava 0,5 s), sitten logo nousee mustasta: 8 mustaa savuläiskää (`.spSm i`) väistyvät ulospäin ja reunavarjo (`.spVig`) avautuu keskeltä.
  Lopussa reunavarjo tummenee ensin, savu valuu takaisin ja lopuksi täysi musta (`.spFull`). Vain opacity/transform. Kesto: ensikäynti
  6,2 s, palaava 4,1 s.

### v1.65 (jousen kantoasento, pidempi ja tarkempi testi, valmistushaku)
- **Jousen kanto** (ei vedossa): kuten ennen pystyssä jousikädessä (vasen), mutta kierretty `BOW_CARRY`=0,75 rad käden x-akselin ympäri →
  kaari (rungon etupuoli, joka vedossa osoittaa kohdetta) osoittaa alaviistoon maata kohti. Vaakasuora kanto vartalon edessä kokeiltiin ja
  hylättiin (käyttäjä). Vedossa ennallaan (-0,15 + bowAim).
- **Suorituskykytesti:** 5 → 7 s, lämmittely 0,8 → 1,2 s; puiden latvat heiluvat (matriisipäivitykset ≈ pelin CPU-kuorma); tulos =
  keskimääräinen ruutuaika ilman hitaimpia 3 % (nykäisyt kuten varjostinkäännös eivät vääristä). Headless edelleen 2 FPS (sama kuin peli).
- **Valmistushaku** kuten DEV-esinehaku: osuu nimeen tai tunnisteeseen, järjestys täsmälleen sama → alkaa → sisältää, Enter valmistaa
  ensimmäisen valmistettavan osuman. Hakupalkki max 300 px.
- Varoitusruudun Windows-ikoni suoraan Windows-sanan edessä tekstin sisällä.

### v1.64 (aloitusjakson ajat, Windows-rivi)
- Ajat: studio 6,5 → 3,5 s, HIIDENMAA 7,2 → 5,2 s, varoitus 11 → 9 s; palaavan kävijän otsikko 4,6 → 3,6 s.
- Varoitusruudun alaosaan "Paras yhteensopivuus Windows-käyttöjärjestelmällä" ja pieni valkoinen neliruutuikoni (`.spWin`).

### v1.63 (HIIDENMAA-otsikko: pelkkä häivytys; palaavalle kävijälle otsikko)
- Otsikko "paljastui monta kertaa": vaiheen oma opacity-siirtymä + logon opacity 2,6 s + skaalaus 1,06→1 + alhaalta nouseva pyyhkäisyvarjo
  (`spShade`). Nyt vain logon häivytys sisään 1,6 s ja ulos 1,3 s (animaatiot `spLogoIn`/`spLogoOut`, kesto `--td`), muut pois.
- **Palaava kävijä** (merkintä löytyy, ei maailman käynnistys): HIIDENMAA-otsikko 4,6 s → latausnäyttö → valikko (`needTitle`; ?title=1 pakottaa
  testissä). Ohitettavissa millä tahansa näppäimellä/napsautuksella. Maailman luonnin intro ennallaan (käyttäjä: täydellinen).

### v1.62 (intro vain kerran, uusi pilviverho)
- **Intro tuli maailman käynnistyksessä:** syy oli testilinkin `?splash=1`, joka säilyy karttavaihdon/uuden maailman sivun uudelleenlatauksessa.
  Nyt jaksoa ei koskaan näytetä, kun `sessionStorage.hiidenmaa_pending` on asetettu (maailman käynnistys), eikä silloin myöskään testiä.
- **Vain ensimmäinen käynti:** Shift+F5-tunnistus poistettu (käyttäjän toive). Merkintä `localStorage.hiidenmaa_intro='1'` tallennetaan heti
  jakson alkaessa; jos se löytyy → latausnäyttö → valikko. Uusi maailma: latausnäyttö → pilvet aukeavat → yläilman kamera.
- **Pilviverho (alle Medium, `introVeil`/`veilCloud`):** ennen kaksi litteää CSS-puoliskoa. Nyt 3 kerrosta × 2 puolta canvasilla maalattuja
  kumpupilviä (läpinäkymättömät kummut ylhäältä alas, valo ylhäältä, sinertävä varjo, rosoinen aaltoileva sisäreuna, utu, blur 3,5 px),
  sävy `lightK`:n mukaan. Aukeaminen: kerrokset liukuvat ulos eri nopeuksilla (1,9/2,3/2,7 s) ja kasvavat 1,08–1,4×, keskeltä valohehku,
  tausta häipyy; vain transform/opacity. Maalaus kerran latausnäytön aikana.

### v1.61 (intro vain ensikäynnillä, ohitus millä tahansa näppäimellä, valikon myrskysade)
- **(Korvattu v1.62:ssa: vain ensikäynti.)** Aloitusjakso + FPS-testi vain ensikäynnillä tai Shift+F5/Ctrl+F5:n jälkeen. Tunnistus: navigaatio `reload` ja `css/style.css` siirtyi
  kokonaan verkosta (`transferSize > encodedBodySize`); tavallisessa F5:ssä tyylitiedosto tulee välimuistista (0) tai 304:nä. Testattu:
  F5 → 0 tavua, välimuistin ohittava lataus → koko tiedosto. Palaava pelaaja → suoraan latausnäyttöön, ei testiä eikä grafiikan säätöä.
  (Huom: Playwrightin `page.route` poistaa välimuistin → mittaa ilman reitityksiä.)
- **Ohitus:** mikä tahansa näppäin tai napsautus → suoraan latausnäyttöön (ei pelkät Shift/Ctrl/Alt/Meta eikä F-näppäimet tai toistot,
  jottei Shift+F5 ohita heti).
- **Tulosteksti:** "Grafiikka-asetukset säädettiin automaattisesti suorituskyvyn mukaan." + "Grafiikkavalinnan suositus: X" + ohje
  Asetukset › Grafiikka.
- **Valikon myrskytaustat:** partikkelikerroksen (`MFX` storm) sadepisarat menivät vasemmalle (vx −220) vastoin taustan sadetta, puita ja
  lehtiä → nyt `vx = vy·0,45` oikealle (tuulen suuntaan), osa syntyy vasemmasta reunasta.

### v1.60 (käynnistys uusiksi: sulavat animaatiot, testi ennen latausta, ohitus)
- **Uusi järjestys (`js/boot.js`):** aloitusjakso (studio 6,5 s → HIIDENMAA 7,2 s → varoitus 11 s) → suorituskykytesti (0,8 s lämmittely + 5 s
  mittaus, tulos näkyy 9 s) → riimusiirtymä → latausnäyttö → valikko. Pelin skriptit ladataan vasta latausnäytössä (`window.__GJS`, järjestys
  säilyy; esiladataan taustalla jakson aikana). Ennen jakso pyöri latauksen päällä ja pätki (KORJAUKSET 32).
- **Suorituskykytesti omassa näkymässä:** pieni metsä (230 puuta, 60 kiveä, 24 000 ruohonkortta, 2048-varjot, 4 pistevaloa, sumu), kuorma
  pelin Medium-tason luokkaa (headless-vertailu: sama 2 FPS kuin vanha pelinäkymätesti). Paneeli: selitys, palkki, sekunnit ja eläva FPS;
  tulos "Tulos: N FPS (taso)", valittu esiasetus ja ohje Asetukset › Grafiikka. Tallennus `hiidenmaa_perf {fps,preset,idx,pend:1}`;
  main.js `perfApply()` ottaa esiasetuksen käyttöön ladattuaan ja nollaa `pend`. Vanhat `perfStart/perfStep/perfEnd` poistettu.
- **Ohitus:** välilyönti, Enter tai napsautus ohittaa KOKO jakson ja testin → suoraan latausnäyttöön. Kesken jäänyt testi: tulos tallentuu,
  jos mitattu ≥ 1,5 s; muuten testi tulee seuraavalla kerralla (ilman aloitusjaksoa). Muut näppäimet eivät ohita.
- **Latausnäyttö:** latauksen aikana vain riimujen oranssi täyttyminen + palkki (kipinät, sumu, sivupartikkelit ja kiven keinunta levossa).
  Valmis → vaalea leimahdus (`.lsGlow`, opacity/transform), riimut vaaleiksi, partikkelit esiin; 1,7 s myöhemmin häivytys valikkoon.
- Käynnistysvahti (20 s) alkaa vasta latauksen alkaessa (`__bootWatch`), versiotarkistus (`__verCheck`) myös boot.js:lle (`__BJV`).

### v1.59 (aloitusjakso ja näkyvä suorituskykytesti)
- **Studiotunnus:** "EricStudios & KSPK-tech" yhtä isoina allekkain (välissä pieni &). Tekijänoikeusrivin versio asetetaan vasta
  kun `window.HV` on määritelty (DOMContentLoaded), ennen rivillä luki pelkkä "Versio".
- **Varoitusruutu:** lisätty laatikko "Vältä turhaa Esc-näppäimen painamista – selaimessa Esc vapauttaa hiiren ja keskeyttää pelin…
  Valikko ja paneelien sulkeminen: P". Ruutu näkyy 6,5 s (ennen lyhyempi).
- **Suorituskykytesti näkyväksi:** kesto 3 s → 5 s (`PERF_T`). Latausnäytön alle paneeli `#lsPerf`: otsikko, selitys, edistymispalkki ja
  sekuntilaskuri. Lopuksi selvä tulos "Tulos: N FPS (Sujuva/Hyvä/Kohtalainen/Raskas)", valittu esiasetus ja ohje "Voit muuttaa
  grafiikkaa milloin tahansa itse: Asetukset › Grafiikka". Tulos näkyy 5 s ennen valikkoa. Testi alkaa vasta aloitusjakson jälkeen.

### v1.58 (korjaus: välimuistin vanhat tiedostot)
- Käyttäjän näkymä: valikko ilman tyylejä ja virhe main.js:39 Ctrl+Shift+R:n jälkeen haaralinkissä. Syy: raw.githack antoi vanhan
  main.js:n ja style.css:n uuden index.html:n kanssa (KORJAUKSET 31). Lisätty versiotarkistus (`__JSV`, `__JSV2`, `--css-v` vs. `HV`), joka
  kertoo selvästi, että tiedostot ovat vanhoja ja ohjaa commit-linkkiin. Pelikoodissa ei vikaa (commit-linkki toimii).

### v1.57 (lista 6, erä E: jousen naru, ote, osumamerkki, ristikko, Q-pudotus + koko pelin tarkistus)
- **Jousen naru (käyttäjä huomasi):** `updateBowMesh` pätkien kulma oli väärää etumerkkiä (`-atan2`) → kumpikin pätkä peilautui
  keskipisteensä ympäri: narun päät eivät olleet jousen kärjissä vaan ampujan takana ja kärki kahvalla, eli naru "veti eteenpäin".
  Nyt `rotation.x = atan2(dz,dy)`: päät kärjissä, kärki vedetään poskelle. (Aiemmat mittaukset katsoivat vain pätkien keskipisteitä.)
- **Ote:** kädessä jousi pidetään kaaren kahvasta (`position = (0,0,−.12)` kierrettynä), ennen käsi oli 12 cm rungon takana ilmassa.
- **Kyynärpää vedossa:** napavektori `_poleBow` (−1, −.95, .3) → (−1.85, −.95, .15): olkapäästä hieman enemmän sivulle (käyttäjän
  toive kahdessa vaiheessa; taaksevienti kokeiltu ja hylätty).
- **Kirveen/hakun isku:** kädet koko iskun ajan 5 cm ylempänä ja 6 cm edempänä. "Pyörähdys" poistettu: jatkuvassa hakkuussa paino ei
  enää putoa uuden iskun alussa (ennen 82–171° hyppy yhdessä ruudussa), nosto alkaa edellisen iskun loppuasennosta ja kirveen kierto
  siirtyy kiertona (slerp) nostovaiheen ajan (huippu 46°/ruutu); lopetuksessa asento häivytetään (−5/s) eikä hypätä. Läpäisytesti ok.
- **Osumamerkki (`hitMarker`, state.js):** pelaajan nuolen osuessa viholliseen valkoinen X osumakohdassa, näkyy kaikkien esineiden läpi
  (depthTest pois), 0,28 s, ei animaatiota, koko etäisyyden mukaan.
- **Tiputusristikko:** viivat 40, 80 ja 120 m, ohuemmat (1 px), teksti viivan vieressä keskitettynä.
- **Q pelissä:** pudottaa valitusta pikapaikasta 1, Shift+Q koko pinon (`dropHot`); rakennustilassa Q nostaa haamua kuten ennen.

**Koko pelin tarkistus (v1.57, `full157.mjs`):** kaikki 6 karttaa: päivä 20 s, yö 30 s, aamu 20 s, kaikki 22 vihollistyyppiä yhtä
aikaa, 3 ulottuvuutta + pomojen kaato (avain reppuun `giveOrDrop`), Hautakumpu sisään/ulos, tallennus/lataus (v 10), kaikki 8 esiasetusta
piirtäen, NaN-tarkistus joka kuvalla → 0 virhettä, 0 NaN. Huomiot: (1) yöllä aloituspaikalla paikallaan seisova pelaaja kuolee 30 s:ssa
(kartta 3) – vaikeus, ei bugi; (2) isojen taisteluiden jälkeen scene-lapsia +100 (kartat 0 ja 4: saalis, läikät, ruumiit) – poistuvat ajan
kanssa; (3) Ultra-asetuksella jopa ~830 piirtokutsua.

### v1.56 (lista 6, erä D: veri, jousi selässä, jousen kuvake)
- **Ultra-veri (`bloodUltra`):** veren fysiikalla ja Ultra-esiasetuksella (tai Custom + piirtoetäisyys ≥ 520) pisaroita ja
  hiukkasia 2×, lentonopeus ×1,45, sivuhajonta 2×, pystyvauhti ×1,3, pisararaja 240.
- **Läikät rinteen mukaan (`slopeN`):** maanpinnalla olevat läikät käännetään maastonormaalin suuntaisiksi (ei rakennuksilla/luolassa).
- **Valuminen (`poolFlow`/`updateFlow`, Medium+ `fxHiQ`):** kuoleman lammikko (mobit ja pelaaja), jos rinne > 45° (gradientti > 1):
  10 s ajan noro etenee alarinteeseen (0,35 → 0,06 m/s), 0,12 s välein pitkulainen pieni läikkä (elää 40 s). Läikkäraja 60 → 140.
- **Jousi selässä:** litteänä selkää vasten (kaari sivulle, `m.rotation.y = π/2`), ja jos repussa on nuolia (`hasArrows`), 3 nuolta
  jousen keskellä sen suuntaisesti, kärjet alaviistoon; päivittyy repun muuttuessa (`updateBack`-avaimessa nuolilippu).
- **Jousen jänne:** 3D-mallissa jänne ja kaari tarkistettu (veto posken kohdalle, kaari tähtäyssuuntaan) – oikein. Väärin päin oli
  **repun kuvake**: kaari pullistui taaksepäin ja jänne kulki kaaren sisällä. Korjattu: kaari tähtäyssuuntaan, jänne kärkien välissä,
  nuoli sulkineen jänteeltä kaaren läpi.

### v1.55 (lista 6, erä C: ensikäynnin aloitusjakso)
- `#splash` (index.html, oma skripti latausnäytön skriptin jälkeen), vain ensikäynnillä (`hiidenmaa_intro` puuttuu, ei karttavaihdon
  uudelleenlataus, ei automaatioselain; `?splash=1` pakottaa). Kesto ~18 s, napsautus/näppäin siirtää seuraavaan vaiheeseen:
  0,8 s musta → **EricStudios** (Cinzel, kirjainväli laajenee) + pieni **KSPK-tech** + alareunassa © 2026 EricStudios · KSPK-tech,
  oikeudet pidätetään, kuvitteellisuuslauseke ja versio (5,2 s) → **HIIDENMAA** halkeillut kivikaiverrus (SVG: kivi + rae, 16
  satunnaista halkeamaa, viistetty valo, rosoiset reunat) pitkä fade in 2,6 s + hidas zoom, 4,2 s kohdalla varjo nousee alhaalta ja
  nielaisee sen (6,4 s) → varoitus "Toimii parhaiten tietokoneella" + näppäimistö- ja hiirikuvake (4,2 s) → siirtymä (1,3 s):
  hehkuva riimu ᚺ kasvaa ja valorengas laajenee koko ruutuun → latausnäyttö tulee esiin zoomaten (`#loadScr.enter`).
- `__ldDone` kääritään: jakson aikana valmistuminen jää odottamaan (`__ldPend`) ja tehdään 1,4 s jakson jälkeen, jotta latausnäyttö
  ja sen leimahdus nähdään aina. `#pcHint` ("Toimii parhaiten…") ei enää näy valikossa. Testi: peli valmis 1,9 s, jakso ohitettuna
  6,8 s, latausnäyttö pois 10,6 s, valikko auki, ei virheitä.

### v1.54 (lista 6, erä B: herkkyydet ja osoittimen viive)
- Ohjaus: **Kääntymisen herkkyys** `SET.sens` (0,2–3×, oletus 1 = 0,0028 rad/px) ja **Osoittimen herkkyys** `SET.curSens` (0,3–3×)
  pelin paneelien virtuaaliosoittimelle. Päävalikko käyttää käyttöjärjestelmän osoitinta (selain ei salli nopeuden muuttamista) –
  tästä huomautus asetussivulla.
- Viive: `vcMove` siirtää osoitinta heti (`translate3d`, `will-change`), mutta `elementFromPoint` (pakottaa asettelun), hover-luokat ja
  keinotekoinen mousemove tehdään kerran ruudunpäivitystä kohti kertyneellä liikkeellä (`vcFlush`, rAF); painallus/vapautus purkaa
  jonon ensin. Testi: 8 liikettä → 1 välitetty mousemove.

### v1.53 (lista 6, erä A: liikkeen keinunta, jousen tarkistus, piikivikirves)
- Jousen veto kuvattu edestä, takaa, molemmilta sivuilta ja ylhäältä seisten ja kyykyssä: jousi ojennetussa kädessä, nuoli jänteellä,
  vetokäsi kasvojen vieressä – ei korjattavaa.
- Keinunta (player.js): kävelyssä ei sivukallistusta (ennen ±1°), juoksussa ±2,6° (ennen ±4,4°) ja askeltahtinen eteenpäin
  nyökkäys |sin|·2° (osa kallistuksesta eteenpäin).
- **Piikivikirves** `piikivikirves`: työpenkki, 3 puuta + 3 piikiveä + 1 nahka, taso 2. chop 1,5 (puuhun 11 / isku, kivikirves 9,
  kuparikirves 13; ei kovia puita), vahinko 10, nopeus .49. Malli: tumma lohkottu piikiviterä, nahkasidokset ristiin.

### v1.52 (lista 5, erä D: uuden maailman latausnäyttö ja aukeavat pilvet)
- `startNewGame` → `worldLoad(build)`: riimukivi-latausnäyttö uudelleen (`__ldShow`, index.html; latausnäytön funktiot hakevat elementit
  joka kutsulla ja pohja `__ldHTML` talteen), maailma rakennetaan, intro alkaa pidossa (`startIntro(true)`, `intro.hold`: korkea kamera
  piirtyy valmiiksi 24 kuvan ajan, otsikko piilossa, ohitus ei toimi). `__ldDone` → leimahdus → häivytyksen alkaessa `__ldAfter` =
  `introRelease`: pito pois, otsikko näkyviin ja pilvet aukeavat. Karttavaihdossa (sivu latautuu) sama pito ja `__ldAfter`.
- Pilvet: Medium ja yli (`introHiQ`: esiasetus ≥ Medium, Custom = varjot Hyvät + valot 6) → 22 sprite-pilveä kameran edessä
  (`introCloudsMake`/`introCloudsTick`), vasen puoli liukuu vasemmalle ja oikea oikealle 2,1 s ja häipyy, sitten poistetaan.
  Alle Medium: CSS-pilviverho `#cloudVeil` (kaksi puoliskoa liukuvat sivuille 2 s). Sitten tavallinen intro (4 s ylhäällä + 2 s syöksy).

### v1.51 (lista 5, erä C: kymmenen uutta valikkotaustaa, myrskyn sade, eeppinen portaali)
- **Uudet kuvat (`MBG_SCENES.push`, menubg.js):** Myrskytuuli (puut taipuvat puuskissa, yksi kaatuu 9 s välein pölypilveen, salamat,
  lentävät oksat), Karhun raivo (karhu nousee takajaloilleen karjuen, iskee koivuun → puu tärisee, linnut pakenevat, lehtiä putoaa),
  Routaluolan suu (jääpuikot, sininen huuru hengittää ulos, sisällä himmeä sykkivä valo), Kalmankammion käytävä (perspektiivikäytävä,
  kynttilät lepattavat, kaukana hahmo kulkee ohi hehkuvin silmin), Aarnihaudan juurakko (jättipuun juuret kaartuvat kuopan yli, vihreä
  hohde ja itiöt), Susilauma kuutamossa (kolme sutta kalliolla ulvoo vuorotellen, usva), Hirvi aamujärvellä (hirvi juo, väreet,
  heijastus, sumuvyöt), Kalmanvartijan varjo (jättisiluetti näkyy salamoiden välähdyksissä, hehkuvat silmät aina), Hautakummun usva
  (kalmot nousevat kummuista ja vajoavat), Ahjo yöllä (seppä takoo, kipinäryöppy ja välähdys iskussa, savu). Ulottuvuuksien kuvat
  eivät paljasta pomoja. Apurit: `mbgBear`, `mbgWolf`, `mbgElk`, `mbgFigure`, `mbgFlash`, `mbgBolt`, `mbgRain`.
- **Myrsky:** sade viistää nyt oikealle alas, samaan suuntaan kuin puut kallistuvat.
- **Portaali (`mbgPortalBg`/`mbgPortalFx`):** riimuin kaiverrettu kivikaari lohkoista (riimut syttyvät aaltona), lakikivi, raunioituneet
  pylväät, portaat, kerroksellinen pyörre aukossa (leikattu kaaren ja portaiden väliin), hehkuvat maan halkeamat, leijuvat kivet,
  energiakipinät. Kaksi versiota: "Portaalin hehku" ja "Portaalin vartija" (viittapäinen hahmo sauvoineen portaiden juurella).
- **Partikkelit:** `MFX_KIND` 21 kpl; uudet lajit `frost` (Routaluola) ja `spores` (Aarnihauta).

### v1.50 (lista 5, erä B: yöolennot palavat auringossa)
- `sunBurnAI` / `sunExposed` (ai.js), tarkistus 0,5 s välein: `SUN_BURN` = kalmo, ylimys, hiidenkarhu, hiidenhirvi, kalmasusi, suonakki
  (+ `stalk`-tyypit), ei pomoja eikä vartijoita (`m.guard`). Altistus: `lightK` ≥ .55, `wDark` ≤ .35, `wRain` ≤ .25, biomi ei
  korpi/koivikko/aarnimetsä (`SUN_SHADE`) eikä katosta yläpuolella (`roofTopAt`).
- Kulku: syttyy (`igniteMob`, `burnT` pidetään yllä, `updateBurn` ei vähennä hp:tä), 0–3 s paniikkiryntäily 1,3× juoksu satunnaisiin
  suuntiin, 3–5,2 s hidastuu ja horjuu, sitten `killMob` `sunKill`-lipulla → tuhkakuolema, ei saalista, XP:tä eikä tappotilastoa.
  1 m päässä ryntäilevä sytyttää pelaajan (`P.burnT` 4 s). Testattu: niityllä kuoli 5,5 s, metsässä ja yöllä ei, susi ei pala.

### v1.49 (lista 5, erä A: Tallennettu-teksti, jousen tähtäin ja kyykkyammunta)
- **Tallennettu (5):** syy: v1.46:ssa painikkeeseen lisätty riimulaatta on `firstChild`, joten "Tallennettu ✓" kirjoitettiin laatan sisään
  (piiloon). Nyt teksti on omassa `.bLbl`-elementissä ja painike välähtää vihreänä (`.saved`) 2,2 s; alle "Tallennettu selaimeen."
- **Jousi (3):** `bowSpread` + `BOW_STAND_MIN` 1,1°: seisten täysi veto = pieni ympyrä (~26 px) ja pientä hajontaa. Kyykyssä (`bowCrouch`)
  täysi veto paikallaan = hajonta 0, tähtäin 5 px; veto ja nuolen nopeus ×1,1 (`BOW_CROUCH_K`; 1,6 → 1,455 s, 50 → 55 m/s).
  `bowShot(k,am)` laskee nopeuden ja painovoiman (sama ammuttaessa ja ristikossa).
- **Tiputusristikko:** `#dropRet` (`updDropRet`, ui.js) vain kyykyssä täysin vedettynä: vaakaviivat 20–70 m etäisyyksille
  (pudotus ½·g·(d/v)² → kulma → pikselit näkökentän mukaan), numerot 20/40/60 m.

### v1.48 (logoteemat, käyttäjän tarkennus)
- **Käyttäjä tarkensi:** jokainen logotyyli on oma logonsa, ja valikkoon tultaessa arvotaan yksi (ei yhdistelmää aina).
- `LOGO_T` (menubg.js), 7 teemaa: `crack` halkeillut kivi (paljon haarautuvia halkeamia, lohkeamat), `hiisi` hehkuva hiidenkivi (vihreä
  läpikuultava kivi, hehkuvat suonet ja kristallit kaikissa kirjaimissa, vihreä aura), `moss` sammalkivi (tiheä sammal myös alas valuvana,
  jäkäläpisteet), `iron` taottu rauta (metalliliuku, vasaranjäljet, niitit, hehkuva ahjon kuumuus alareunassa), `ore` malmikallio
  (ruskea kallio, paljon kulta-, kupari-, hopea- ja vihermalmia, kultasuonet, kimallukset), `rune` riimukivi (punaiseksi maalatut
  kaiverretut riimut jotka hehkuvat, punainen riimurivi), `all` v1.47:n yhdistelmä.
- `logoRandom()` sivun latauksessa ja `pauseGame`:ssa; ei samaa kahdesti peräkkäin. Fontin latauduttua sama teema rakennetaan uudelleen.
- Korjattu samalla: lisäys meni ensin `menuBack`iin (sama merkkijono) ja rivikommentti nieli koodin – KORJAUKSET 29 pätee yhä.

### v1.47 (esiasetussäätimen teemat ja uusi logo, käyttäjän pyyntö)
- **Esiasetussäädin (`pvTheme`, `PV_FX`, `pvFxStart`):** `#presetBox` saa luokan pv0…pv7 (pvc = Custom). Low kivi (karhea harmaa täyttö,
  pyöreä kivinuppi, putoavaa pölyä), Low+ vaskipatina (turkoosi, nousevia itiöitä), Medium- metsä (vihreä, tulikärpäset), Medium
  ennallaan, Medium+ kulta (liukuva kimallus, kultapöly), High routa (jäänsininen, vinoneliönuppi, jääkiteitä), High+ punainen ja palava
  (liikkuva tuligradientti, lepattava nuppi ja nimi, nousevat kipinät), Ultra violetti taika (kimalteleva gradientti, sykkivä nuppi,
  nupin ympäri kiertävät ja nousevat violetit hiukkaset). Partikkelit omalla canvasilla täytön kohdalta, määrä × Hiukkaset-asetus.
  Vedettäessä teema, nimi ja asteikon korostus vaihtuvat heti.
- **Logo (`buildLogo`, menubg.js):** SVG, kirjaimet leikkausmaskina (Cinzel Decorative, `textLength` 968). Sisällä kivi (liukuväri +
  läikät + rae), malmisuonet ja -kokkareet (kulta, kupari, rauta), halkeamat haaroineen, sammal yläreunoilla (rosoistettu), kaiverretut
  riimut (syttyvät oransseiksi hiiren alla), kolmessa kirjaimessa hehkuvat hiidenkivikristallit (sykkivät). Ulkona taottu rautareunus
  vasarajäljin. Kivi viistetään valolla (feSpecularLighting) ja reunat rosoistetaan (feDisplacementMap). Valojuova 8 s välein.
  Kirjainten paikat `getExtentOfChar`; rakennetaan uudelleen fonttien latauduttua; kiinteä siemen. Vanha teksti jää varalle (`.hasLogo`).

### v1.46 (valikon uudistus, käyttäjän pyyntö)
- **Päätökset (käyttäjän vastaukset):** tyyli "yllätä, käytä kaikkia" → kivi + taottu metalli + riimut yhdessä; valikot eivät vieritä vaan
  korvaavat päänäkymän leveällä näkymällä tyhjään tilaan (Takaisin-painike ja P/Esc); partikkelit vaihtuvat taustakuvan mukaan;
  jatka/aloita-painike on erityinen, silmään pistävä.
- **Rakenne:** `#menu[data-view]` = `main` | `worlds` | `settings`. Päänäkymä `.mHome` (otsikko, tarina, painikkeet), leveä näkymä `#mView`
  (`.mvHead` Takaisin + otsikko, `.mvBody` jossa `#worlds` tai `#settings`). `setMenuView`, `menuBack` (P/Esc valikossa ja tauolla:
  ensin takaisin, päänäkymässä P jatkaa peliä). `#settings`-paneelin hidden-tila ohjaa settings-näkymää (MutationObserver), otsikko
  Näppäimet/Asetukset välilehden mukaan. Pelin aikana tarina piilossa (`#menu.inGame`), jotta kaikki mahtuu 768 px korkeuteen.
- **Otsikko:** Cinzel Decorative 900 (Google Fonts, varalla Uncial Antiqua), kivitekstuuri (SVG-kohina) + pronssi-luugradientti
  tekstin täyttönä, kaiverrusvarjo, sykkivä hiilloshehku, valojuova 7 s välein, alla riimurivi ᚺᛁᛁᛞᛖᚾᛗᚨᚨ (kirkastuu hiiren alla).
- **Painikkeet:** tumma puu + syykuvio, rautaniitit kulmissa, vasemmalla kivinen riimulaatta (`data-rune` → `.mIco`), Cinzel-teksti;
  hiiren alla siirtymä, hehkureuna, riimu syttyy ja kääntyy, valojuova (`.mSheen`); painettaessa painuma. Sisääntulo porrastettuna.
- **Sankaripainike `.mHero`:** `#bContinue` (ei pelissä: "Jatka seikkailua" viimeisimpään maailmaan tai "Aloita seikkailu" kun
  maailmoja ei ole → luo uuden) ja `#bResume` (pelissä): pyörivä kultainen conic-reunus (`@property --ha`), sykkivä hehku, pyöreä hehkuva
  riimusinetti katkoviivakehällä, kultainen gradienttiteksti, reunoilta jatkuvasti nousevia kipinöitä, painettaessa iso kipinäryöppy.
- **Maailmat-näkymä:** kortit ruudukkona (pelaa / nimeä / poista), uusi maailma katkoviivakortissa.
- **Partikkelit (`menubg.js`, `MFX`, `#menuFx`):** laji `MFX_KIND[MBG.i]`: hiillos, kultapöly, kevyt lumi, tulikärpäset, virvatulet+tuhka,
  valopöly+lehdet, nousevat riimut, vino sade+lehdet, lumisade, taikakipinät; 3D-taustalla/tauolla hiillos. Hiiri työntää hiukkasia,
  painikkeet kipinöivät. Määrä × Hiukkaset-asetus, enintään 45 kuvaa/s, enintään 420 hiukkasta.

### v1.45 (latausnäytön viimeistely, käyttäjän pyyntö)
- **Loppuleimahdus:** kun lataus (ja mahdollinen suorituskykytesti) valmistuu, `__ldDone` lisää `#loadScr.done`: 0,8 s kaikki riimut
  syttyvät lähes valkoisiksi (#fff → #fff4e0) voimakkaalla hehkulla (`lsFlare`, porrastettu 12 ms/riimu), kivi ja otsikko kirkastuvat,
  palkki valkoinen; sen jälkeen häivytys 1,3 s (ennen 0,4 s viive).
- **Sivupartikkelit:** vasemmalle ja oikealle reunalle (`.lsSide`, 24 % leveys, reunat häivytetty) 34 nousevaa hiilloshiukkasta ja
  leijuvaa tuhkaa kummallekin puolelle (satunnainen koko, ajo, sivuttaisajelehdinta); leimahduksessa hiukkaset vaalenevat.

### v1.44 (lista 4, erä F: optimoinnit asetuksiin)
- **Kaukainen maasto (terrLod):** sama kärkipuskuri, uusi indeksipuskuri: kameran 100 m säteellä täysi 2 m ruudukko, kauempana
  8 m lohkot viuhkana; tarkan naapurin puolelle kaikki reunakärjet → ei rakoja. Uudelleen kun kamera liikkuu 24 m (`terrLodTick`,
  `updateChunkVis`). Maaston kolmiot ~245 000 → ~35 000 (kokonaisuus 797k → 586k kolmiota). Lapion muokkaukset toimivat (kärjet samat).
- **Staattisten yhdistäminen (mergeSt):** `mergeStatics` 64 m ruuduittain + materiaali + varjoliput; alkuperäiset piiloon (`userData.mg`,
  `MG_HID`), ei luolastoa/instansseja/arkun kansia/liekkejä/läpinäkyviä; uudet kohteet → yhdistetään uudelleen (`mergeTick`).
  Alussa 553 meshiä → 112. Ulkoasu sama (sama materiaaliolio).
- **Auringon varjot harvemmin (shFar):** `sun.shadow.autoUpdate=false`; paikallaan joka 4. kuva, liikkeessä/hyökätessä/kameraa
  kääntäessä joka kuva; kaukaisen tulen varjokartta 2× harvemmin.
- **Esiasetukset:** Low, Low+, Medium-: kaikki päällä; Medium–Ultra: vain yhdistäminen. Vanhaan tallenteeseen puuttuvat avaimet otetaan
  sen esiasetuksesta (nimi ei muutu Customiksi). Asetussivulla uusi väliotsikko "Suorituskyky".

### v1.43 (lista 4, erä E: latausnäyttö, suorituskykytesti, maailman intro, tauko/käynnissä + aluebannerit)
- **Latausnäyttö (10):** `#loadScr` heti `<body>`:n alussa: riimukivi (SVG, 24 riimua kahdessa nauhassa) jonka riimut syttyvät sitä
  mukaa kuin 29 skriptiä latautuu (dokumentin `load`-tapahtuma kaapataan, `__ldSet`), sumukerrokset, nousevat kipinät (CSS, toimivat
  vaikka pääsäie on kiireinen), satunnainen säe (5 omaa säettä), edistymispalkki. `__ldDone()` häivyttää 1,3 s:ssa ja poistaa.
- **Suorituskykytesti (31):** ensimmäisellä käynnillä (ei `hiidenmaa_perf`- eikä `hiidenmaa_set`-tallennetta) latausnäytön aikana 3 s:
  3D-valikkokamera oletusasetuksilla, 0,6 s lämmittely, sitten FPS. ≥ 50 → Medium (oletus), 35–50 → Medium-, 22–35 → Low+, < 22 → Low.
  Tulos `hiidenmaa_perf` ja näkyy latausnäytöllä ("Grafiikka: X (N FPS)"). Automaatioselaimessa (`navigator.webdriver`) ohitetaan,
  `?perf=1` pakottaa. Testattu: swiftshader 2 FPS → Low.
- **Intro (11):** `startIntro()` uudessa maailmassa (myös karttavaihdon jälkeen): `state='intro'`, 4 s 175 m korkeudella 80 m säteellä
  hitaasti kiertäen, otsikko "Hiidenmaa" + "Kartta · nimi" (`#introT`), sumu kauas (260–700 m) ja ruudut näkyviin; 2 s syöksy
  easeInOut tavalliseen kameraan (sijainti lerp + kierto slerp). Mikä tahansa näppäin/napsautus/kosketus ohittaa (`endIntro`).
- **Tauko/Käynnissä (32):** taukovalikon painike `#bRun` "Tila: Tauko / Käynnissä" (muistetaan, `hiidenmaa_prun`). Käynnissä-tilassa
  `update(dt)` ajetaan valikon takana (syötteet eivät liikuta pelaajaa); pelaaja ei ota vahinkoa eikä kuole tauolla/introssa.
- **Aluebannerit (käyttäjän lisäpyyntö):** alue löytyy vasta, kun 5/6 pistettä 6 m säteellä on samaa aluetta (`zoneDeep`). Bannerit
  jonossa (`zoneQ`): häivytys sisään 2,2 s, näkyy 3 s, ulos 3 s, 1 s tauko → seuraava; ei koskaan päällekkäin.

### v1.42 (lista 4, erä D: ulottuvuuksien saalis, Kalmaherra, jousikalmot, ensikäynnin otsikko)
- **Saalis (12–13):** `realmLoot(id,base)`: Kalmankammion arkuissa ja kirstuissa määrät 2×; Kalmankammiossa ja Aarnihaudassa 30 %
  mahdollisuus harvinaiseen (`RARE_LOOT`): 3–5 metson sulkaa, karhuntalja, 1–2 hiidenkiveä tai ★2 rautamiekka/-kirves, kuparimiekka,
  keihäs, kupari-/rautakilpi tai jousi. Testattu 1000 avausta: 2× aina, harvinainen 28–31 %, Routaluolassa 0.
- **Kalmaherra (14):** ryntäys 5 s välein (ennen 10 s, `chargeGap`), ei huitaise ilmaa (`noAir`: lyönti vain alle ulottuman + 0,6 m).
  Kun hp ≤ 50 %: 20 s välein (ensimmäinen 4 s jälkeen) 1–3 latausiskua (0,7 s nosto, `act 'fireline'`), jokainen jättää 8 m tulilinjan
  pelaajaa kohti (`fireLine`, pysähtyy seinään, oma valo): 20 vahinkoa kerran + palaminen 4 s (uusiutuu linjassa seistessä), kestää 5 s.
- **Loppuvaihe (15):** alle 30 %: materiaalit kopioidaan ja hehkuvat sykkien punaisena (`bossFinalGlow`), vain ryntäyksiä (1,5 s tauko),
  20 s välein 5 kalmoa ympärille (`summonMinions(m,5,12)`). Ei tulilinjoja loppuvaiheessa.
- **Jousikalmot (16):** `makeArcher` (realmize, Kalmankammio, 10 %): kirves piiloon, jousi käteen. `archerAI` (ai.js): 0,6 s tähtäys
  (käsi ylhäällä), nuoli 3–20 m kaarella ja ennakolla, vahinko = lähi-isku, 1 nuoli / 2,5 s; pitää 6–14 m (peruuttaa kasvot pelaajaan),
  lähestyy jos ei näe; alle 2,4 m lyö. Kuollessa 50 %: 2–5 nuolta.
- **Ensikäynti (17):** `realmIntro(id)`: ensimmäisellä kerralla (`fo('ri')`) koko ruudun otsikko ulottuvuuden hehkuvärillä (`#realmBan`:
  riimurivit, "Astut ulottuvuuteen", nimi sumeasta väristen esiin + välke, tavoite "Kukista X ja ota Y.", karjaisu ja tärähdys, 6,5 s).
  Myöhemmin vain sivuviesti; voitetussa ulottuvuudessa "X on kukistettu. Tutki rauhassa."
  Huom. testaus: headless-selaimessa CSS-animaatiot eivät etene raskaan 3D:n aikana – ulkoasu tarkistettu animaatiot pois kytkettynä.

### v1.41 (lista 4, erä C: lumi ja sade, seinäsoihtu, soihdun sytytys, arkkujen ulkonäkö)
- **Lumi (2):** hiutaleet ovat maailmankoordinaateissa (`updateSnow`): 50 × 50 m alue kiertää pelaajan ympäri silmukkana (x/z ±25 m),
  tuuli kuljettaa, maahan pudonnut syntyy ylös. Ei enää "seuraa kameraa". Sade ja lumi saavat pistekohtaiset värit (`precipTint`):
  yöllä tummat (sade hyvin tumma, kerroin `max(.12, lightK·(1−.35·wDark))`), Medium+ (valot ≥ 4 ja hiukkaset ≥ 50 %) 8 m sisällä
  olevat valot (myös oma soihtu) värjäävät lämpimäksi.
- **Seinäsoihtu (20):** `seinasoihtu` (Valo): 2 puu, 1 pihka, 1 rauta; kiinnitetään vain rakennuksen pystypintaan (`wallMount`,
  kierto pinnan normaalista, haamu punainen muualla). Palaa 15 min, pihka +15 min (enint. 30 min). Sytyttää käsisoihdun, valaisee.
  Ulottuvuuksien seinäsoihtujen takana luolissa kivilohkare (Aarnihaudan soihdut kiveen).
- **Sytytys (21–22):** sammunut käsisoihtu syttyy 2,5 m sisällä palavasta nuotiosta, soihtutelineestä, seinäsoihdusta tai Hautakummun /
  ulottuvuuden soihdusta (`FLAMES`-rekisteri, landmarks.js). Heti viesti "Pysy paikallasi hetki – soihtu syttyy…", sitten 1–1,5 s
  paikallaan (liike kuluttaa aikaa takaisin). Testattu: syttyi 1,13 s:ssa, 8 m päässä ei.
- **Arkut (24):** `makeChest(kind,w,h,d)` / `openLid(g,k)`: puuarkku lankuista, rautavanteet ja niitit, lukkolevy + lukonreikä;
  linnakkeen kiviarkku kivinen riimuin. Avattu arkku on ontto (kansi aukeaa saranasta, tumma sisus). Käytössä raunioissa, löytöpaikoilla,
  linnakkeissa, kätköissä, ulottuvuuksissa (ei hautakirstuissa) ja rakennettavassa arkussa. Rauniot palauttavat avatun kannen latauksessa
  (`syncChests`). Korjattu samalla: lumen vanha silmukka jäi environment.js:ään (syntaksivirhe) ja `flags` luettiin ennen state.js:ää.

### v1.40 (lista 4, erä B: P-näppäin, Esc pois, opasteet, reppunapsautukset, omat säätimet, arkku katseella)
- **P (7):** uusi toiminto `menu` (KeyP, vaihdettavissa): avaa ja sulkee päävalikon, sulkee minkä tahansa paneelin. Esc ei tee pelissä
  mitään (selain vapauttaa silti hiiren → taukovalikko näkyy). Kiinteiden näppäinten listaan selitys.
- **Opasteet (28):** paneelin oikeaan yläkulmaan "Sulje: P / Tab" jne. (`refreshKeyHints`, `.pHint`), pelinäkymän vasempaan alakulmaan
  "Päävalikko: P" (`#gameHint`); asetus Ohjaus › Näppäinopasteet (`SET.keyHints`).
- **Reppu (26, 27, 29):** puolitus: oikea valitsee puolet ja vasen tai oikea toiseen ruutuun siirtää; vasen valinta + oikea toiseen = puolet
  (testattu). Napsautus paneelin reunojen ulkopuolelle: ilman valintaa sulkee paneelin, valittuna pudottaa esineen (puolikkaan jos valittu).
- **Omat säätimet (4):** liukusäätimet `sldHTML`/`bindSld` (esiasetus, zoom, DEV aika/terveys/kylläisyys) ja kytkimet `tglHTML`
  (asetukset, DEV-jumalvoimat) korvaavat selaimen omat; napit ja valikot eivät jää fokukseen; tekstikenttään palatessa vanha teksti
  valitaan (kirjoitus korvaa). Hakukentät tyhjenevät paneelia avattaessa, DEV-määrä tyhjä (= 1). Paneelissa kirjoittaminen menee suoraan
  hakuun (paitsi toimintonäppäimet E, Tab, I, P, B, M, J, L, K, T, Q, Ä); Enter lopettaa kirjoittamisen, Tab sulkee repun.
  Huom: kun hakukenttä on aktiivinen, P kirjoittaa tekstiä – Enter ensin, sitten P.
- **Arkku katseella (23):** arkut, tynnyrit, kirstut, säkit, rakennetut säiliöt ja hautakasa vain kun tähtäin on päällä tai 15° sisällä.

### v1.39 (lista 4, erä A: kyykky, ylämäki, selkäterät, esineet maassa, pomot/vartijat, kilpi, hp-vaihtelu, veren fysiikka, portaat)
- **Kyykky (1):** eläimet (pakenevat ja luonteelliset) eivät huomaa kyykyssä lainkaan; noustessa 0,1 s viive (`P.uncrouchT`).
- **Ylämäki (3):** juoksu ja hyppy ylämäkeen (rinne > 0,1) kestävyys ×1,3 (jyrkkä enint. ×1,6), `P.upK`.
- **Selkäterät (5):** miekka, lapio ja kuokka lappeellaan selkää vasten (`backPose` y = selän normaali).
- **Esineet maassa (6):** `dropGround` = korkein maakohta viidestä pisteestä, leijuu 0,25 m (kuvake 0,38 m) ylempänä.
- **Pomot ja vartijat (8–9):** `HURT_K` (actions.js) asetetaan mob-silmukassa: pomot ×1,2, vartijat (portit ja kohteet, `m.guard`) ×1,8;
  koskee myös heitettyjä kiviä ja nuolia. Vartijat eivät pelkää tulta (pomot eivät ole koskaan pelänneet).
- **Kilpi rikki (18):** ei torjuntaa, viesti "Kilpi on rikki (m:ss)", kilpi näkyy selässä kunnes ehjä.
- **Aarnihirviö (19):** paranee 1,7 min jälkeen 1 %/s (muut pomot 1 min, 10 %/s).
- **Hp-vaihtelu (25):** viholliset ja eläimet 100–160 % (`m.hpK`), koko +0–10 %. Pomot ennallaan.
- **Veren fysiikka (extra 1):** asetus `bloodFx` (High+ ja Ultra): pisarat lentävät iskun suuntaan 1–5 m tönäisyn mukaan, jäävät läikiksi maahan,
  lattioille ja seinien/kivien kylkiin (`drips`); viiltävä isku → punainen viilto ja mobista tippuu verta 5 s; kuoleman lammikko kasvaa
  4 s (+25 %). `pointBlocked(...,circ)`: nuolet ja pisarat osuvat nyt myös puihin, kiviin, tukkeihin ja linnakkeen muuriin.
- **Linnakkeen portaat (extra 2):** muurin osuma ympyröinä kaaren mukaan (ennen kierretyn lohkon AABB ulottui portaille), askelmat 0,82 → 1,05 m.

### v1.38 (korjaus: "Script error." vuorilla porttien lähellä)
- Syy: ruohoton alue → ruohon InstancedMesh ilman instanssivärejä, jaettu materiaali käännetty värien kanssa → three.js kaatui piirrossa.
  Korjattu (`rebuildGrass` ei lisää tyhjää, `instM` aina värit), `renderer.render` try-lohkoon, three.js `crossorigin="anonymous"`,
  laajennusten "Script error." ei näy. KORJAUKSET 28. Toistettu ja varmistettu testillä, joka kävelee kaikkien karttojen portille.

### v1.37 (lista 3: veri ja kuolema-animaatiot, palokuolema, savu, DEV-lento, portit, kirves/hakku IK, jousen veto, selkäesineet)
- **Uusi tiedosto `js/effects.js`** (ladataan state.js:n jälkeen).
- **Veri (kohta 24):** jokainen osuma: pisaroita (määrä vahingon ja koon mukaan, isoilla enemmän) ja läntti maahan, joka häipyy 10 s:ssa
  (`bleed`, `splat`, enint. 60). Haavat: tummanpunaiset läikät mobin pintaan (`addWound`, enint. 6). Kivihahmot: kivisiruja, kalmot: luupölyä,
  Jäätär: jääsiruja, Suonäkki: usvaa, hiidet ja Aarnihirviö: vihreää mahlaa. Asetus `SET.blood` 1 / .5 / 0. Myös pelaaja vuotaa.
- **Kuolema (kohta 23b):** `mobDeathAnim`: kaatuu kyljelleen 0,6 s, raajat valahtavat, veriläntti alle, makaa → 7,4 s alkaen häipyy ja vajoaa,
  poistuu 9,4 s (`DEATH_END`). Palokuolema (palaa kuollessa, soihtu-isku `m.fireHit`, tulinuoli, nuotioon astunut): mustuu liekeissä 1,5 s
  → tuhkakasa (hehkuvat hiillokset), joka vajoaa ~8 s, savua. Pelaaja: kaatuu selälleen, raajat veltoiksi, läntti 60 s; palokuolemassa
  hahmo mustuu → tuhkakasa (`startPlayerDeath`, `endPlayerDeath` herätessä). Pelaaja syttyy nuotion päällä (4 s, 4 hp/s, sade/vesi sammuttaa).
- **Tuli ja savu (kohta 36):** palavalla mobilla korkeampi liekkikruunu + hehkupallo, kipinöitä 24/s, isot pehmeät savupilvet (`smokePuff`).
- **DEV-lento (kohta 33):** DEV-valikko › Jumalvoimat › Lento: tuplahyppy (0,35 s) aloittaa/lopettaa, välilyönti ylös, Shift alas, Ctrl 2×.
- **Portit (kohta 41):** hehkuvat riimut pylväissä, lakikivi ja sarvet, kivikulhot liekkeineen, 4 riimupaatta, portaat; teema: Routa
  jääpuikot, Kalma kallot, Aarni sammal ja köynnökset.
- **Kirves ja hakku (kohdat 23, 31):** `chopIK` – käsi ja varren suunta avainasennoista (`CHOP_K`), nosto rinnan edestä olan yli viistoon
  taakse vuorotellen oikea/vasen olka, isku eteen-alas, terä johtaa. Mitattu varsi ≥ 0,22 m pään keskeltä (ennen 0,04), ei vartalon läpäisyä,
  vasen käsi varressa ≥ 0,17 m oikeasta. Hakku käyttää samaa kahden käden iskua. KORJAUKSET 26.
- **Jousi (kohta 15):** jänne vedetään oikealle (−0,2 m), kyynärpää oikealla hieman edessä olan korkeudella (`_poleBow`).
- **Selkäesineet (kohta 37):** `backPose`: kirves/nuija/hakku vasemmalta lantiolta oikean olan taakse, pää ylhäällä, terä/piikit sivulle;
  miekka ja lapio/kuokka kahva oikean olan takana, terä alas; jousi vasemmalta olalta oikealle lantiolle (näkyy nyt työkalun lisäksi);
  keihäs ristiin. Vasara vyöllä kuten ennen. Vyön takana karvapallon tilalla nahkapussi kiinni vyössä.

### v1.36 (lista 3: maailmalista ja 5 tallennuspaikkaa, virtuaalinen osoitin – ei välinapsautusta)
- **Maailmat (kohta 20):** päävalikossa lista (enint. 5): nimi, viimeksi pelattu (pvm + klo), päivä, taso, kartta, minuutit. Pelaa, Nimeä
  (rivin sisällä, Enter/Esc), Poista (vahvistus). Uusi maailma omalla nimellä (oletus "Maailma N"). Pelin aikana toiseen maailmaan siirtyminen
  ja uusi maailma tallentavat nykyisen ensin (vahvistus). Paikka 0 = vanha `hiidenmaa_save_v1` ("Maailma 1"), paikat 1–4 = `…_1`–`…_4`,
  tiedot `hiidenmaa_slots`. Nykyinen paikka `curSlot` säilyy kartanvaihdon uudelleenlatauksen yli (`sessionStorage hiidenmaa_cur`).
  "Jatka matkaa" ja "Uusi peli" -napit korvattu listalla; "Palaa peliin" näyttää maailman nimen.
- **Tallennus (kohta 21):** "Tallenna nyt" tallentaa nykyiseen paikkaan, automaattisesti 2 min välein (v1.35).
- **Hiiren lukitus (kohta 22):** paneelit (reppu, arkku, rakennus, kartta, edistyminen, loki, DEV) eivät enää vapauta lukitusta. Oma osoitin
  `#vcur` liikkuu lukitun hiiren liikkeellä; oikeat hiiritapahtumat pysäytetään ikkunan kaappausvaiheessa ja lähetetään osoittimen alla olevalle
  elementille (mousedown/up/click/dblclick/contextmenu/mousemove/wheel, hover = luokka `.vh`, tekstikentät saavat fokuksen, rulla vierittää
  lähintä vieritettävää). Paneelin sulkeminen näppäimellä → kamera kääntyy heti. Esc vapauttaa lukituksen aina (selain); suljettaessa
  yritetään heti lukita uudelleen, mutta selain voi vaatia napsautuksen. Testattu: valinta + siirto osoittimella, Tab sulkee → kamera kääntyy.

### v1.35 (lista 3: esiasetukset, varjot Grafiikka-sivulle, profiilit, heti voimaan, usvatasot, lumi tuulessa, autotallennus)
- **Esiasetukset (kohta 17):** liukusäädin Grafiikka-sivun ylälaidassa, `PRESETS`/`PRESET_N` (Low, Low+, Medium-, Medium, Medium+, High, High+,
  Ultra), oletus Medium (= SET_DEF:n grafiikka). Esiasetus asettaa 18 avainta (res, piirtoetäisyys, yksityiskohdat, ruoho, heilunta, pilvet,
  valot, säteet, hiukkaset, usva, rakennusdetaljit, 3D-esineet, varjot ×6, autosäätö). Low–Medium autosäätö päällä, High–Ultra pois.
  Käsin säädettynä nimi "Custom" (`presetIdx` = −1). Ultra-tasot: piirtoetäisyys 520 m (uudet myös 120 ja 210), ruoho 3 (54 m, väli 1,45),
  varjoalue 140 m, tulien varjot 1024.
- **Varjot (kohta 16):** Varjot-välilehti poistettu, asetukset Grafiikka-sivun väliotsikon "Varjot" alla (`SET_PAGES.gfx`).
- **Heti voimaan (kohta 18):** tauolla (asetukset avoinna) ruoho, valot ja usva päivittyvät joka kehys (main.js `paused`).
- **Profiilit (kohta 19):** uusi välilehti Profiilit: nimi + "Tallenna nykyiset asetukset" tallentaa KAIKKI asetukset ja näppäimet
  (`hiidenmaa_profiles`), "Ota käyttöön" ja "Poista" (vahvistus), korvaus kysyy vahvistuksen.
- **Usva (kohta 35):** tasot Ultra 2 / Korkea 1 / Normaali .6 (uusi oletus) / Matala .3 / Pois; vanhat asetukset siirretään (`SET._v`=2).
- **Uudet asetukset:** `drop3d` (maassa olevat esineet 3D-kuvakkeina, kohta 25), `blood` (Normaali/Vähän/Pois, erä 6).
- **Lumi (kohta 27):** hiutaleet kulkevat tuulen suuntaan, vaakanopeus `WIND.spd*.32` (13 m/s → ~62° kulma).
- **Automaattitallennus (kohta 21):** 90 s → 120 s.

### v1.34 (lista 3: Kalmankruunun sirpaleet, uusi etenemisjärjestys, arvottu saalis, arvoesineet eivät katoa, hehku, kyltit, 3D-kuvakkeet)
- **Kalmankruunun sirpale (kohta 8):** `kruunusirpale`. Aarnihirviö antaa 1 (`REALMS.portal3.key`), 2 on Aarnihaudan satunnaisissa arkuissa
  (`flags.sirpC`, arvotaan kun ulottuvuus rakennetaan; lisätään `openFound`issa). Kalmankehän alttari vaatii 3 sirpaletta (ei hiidenkiviä).
  Tallennuksen `bossPending` palauttaa sirpaleet (v ≥ 10).
- **Tavoitteet (gv 3):** `kivet` korvattu: routa → jaatar → kalmaherra → aarnihirvio → sirpaleet → vartija → vapaa. Siirto gv 2 → 3
  (`GOALS_V2`, kivet → routa). Tehtäviin lisätty "Kerää kolme Kalmankruunun sirpaletta"; Jääavaimen tehtävä käyttää epämääräistä vihjettä.
- **Maailman saalis (kohta 38):** `planLoot` (uusi peli; vanhaan tallennukseen latauksessa avaamattomille arkuille) sekoittaa raunioiden,
  rauniotalojen, linnakkeiden, kiviröykkiöiden ja Hautakummun kirstujen tavarat keskenään ja arpoo Jääavaimen yhteen niistä (`flags.wl`,
  paikka `flags.wl._key`). Portti antaa vain suunnan (`keyHint`). Portin varmistus: avaimen arkku avattu.
- **Arvoesineet (kohta 9):** `VALUABLE` (avaimet, sydän, sirpale, hiidenkivi) + kaikki `rare`. Maassa eivät katoa; jos pelaaja on yli 10 m
  päässä tai toisessa tilassa 2 min, tai esine putoaa kartalta, se siirtyy satunnaiseen pääsaaren arkkuun (`relocateValuable`, avattuun vapaaseen
  paikkaan tai avaamattoman suunnitelmaan, `flags.vloc`). Tallennettaessa maassa olevat arvoesineet (`vdrops`) siirtyvät latauksessa arkkuun.
  `valuableCensus` 15 s välein: avaimet, sirpaleet ja sydän lasketaan kaikkialta (`countAll`) ja puuttuvat palautetaan (`expectedUnique`).
- **Hehku (kohta 39):** maassa oleva arvoesine: esineen värinen sykkivä halo, pistevalo (`lightSources`) ja kipinät.
- **Kyltit ja riimut (kohta 40):** 2 puukylttiä (`SIGNS`, 50–260 m aloituspaikasta) kryptisillä vihjeillä (Jääavaimen arkun suunta, kiviröykkiö).
  Riimukivet päivitetty: kolme porttia, sirpaleet alttarille, Jääavain vanhassa arkussa (suunta).
- **3D-kuvakkeet (kohta 25, osa):** maassa oleva esine = kuvake 7 kerroksena (paksuus), `dropMesh`, asetus `SET.drop3d` (erä 4).
- Tallennusmuoto v 10 (`vdrops`).

### v1.33 (lista 3: kilpien kuluminen, vaikeampi taistelu, pomojen paraneminen, lyönti liikkeestä, yöhirviö, hautamajakka, tulinuoli)
- **Kilvet (kohta 4):** `SHIELD_HITS` puu 20, kupari 15, rauta 15 torjuttua osumaa; torjunta 60/80/90 % ennallaan. Rikki (`s.shBrk`) → ei
  torju 60 s (`SHIELD_FIX`), sitten ehjä (`shieldOk`, tarkistus HUD:ssa 1 s välein). Kunto näkyy tiedoissa ja palkkina ruudussa.
- **Vaikeus (kohdat 5, 6, 11):** `MOB_HARD` 1,25 kaikkien terveyteen ja vahinkoon. Pomot `BOSS_HP_K`: Jäätär ×1,5 = 840, Kalmaherra ×2 = 1280,
  Aarnihirviö ×2,6 = 1872, Kalmanvartija ×2,5 = 2250 (pomojen vahinko ×1,15). Esim. susi 44 → 55 hp, kivivartija 220 → 275, karhu 120 → 150.
- **Pomojen paraneminen (kohta 7):** ilman osumaa 60 s → +10 %/s (täyteen ~10 s). Ulottuvuudesta poistuminen nollaa tallennetun hp:n (täysi).
- **Lyönti liikkeestä (kohta 14):** `MOB_WIND` 0,1 s (ennen 0,4–0,8 s paikallaan), mob jatkaa liikettä lyödessä, jäähy `d.cd` ennallaan.
  Tavallisten ulottuma enint. 1,9 m (`MOB_RANGE_MAX`); karhu, kivivartija ja pelottavat pitävät omansa.
- **Pelaaja −10 % (kohta 28):** `PCOMBAT` 0,9: vahinko (myös jousi), tönäisy, lyönnin kesto /0,9.
- **Yöhirviö (kohta 12):** `nightRoll` kerran yössä satunnaisella hetkellä: vuorilla (mountain/tunturi/rakka) 20 %, muualla 10 %, ja jos
  edellinen yö jäi nukkumatta (`flags.missN`), varmasti. Syntyy 20–30 m päähän ja jahtaa heti, nopeus `SCARY_SPD` 6,6 m/s. Vanha satunnainen
  0,8 %:n pelottava poistettu. Yöllä tavallisia enemmän: tahti 2,5 → 1,9 s, raja 14 → 18 (aarnimetsä 18 → 22).
- **Hautamajakka (kohta 13):** hauta tallentaa tilansa (`g.dim`), näkyy ja loistaa vain omassa tilassaan, myös ulottuvuuksissa ja Hautakummussa.
- **Tulinuoli (kohta 34):** valo hiipuu lennossa (sateessa 2×), osumasta (maa/kohde) sammuu 2 s:ssa (sateessa 1 s), `arrowFade`.

### v1.32 (lista 3: reppu kiinteäksi, käyttöönotto napsautuksella, syönti vain numerolla, pudotus eteen, keinunta)
- **Reppu (kohdat 1–2):** kolme kiinteää saraketta (ruudukko 451 px | tiedot 300 px | valmistus 320 px), koko 1089×690, pienellä näytöllä
  skaalataan (`fitInv`, `--invK`). Ruudukon korkeus varattu 6 riville, joten mikään ei liiku valittaessa tai päivittäessä. Tiedot, päivitys
  ja repun kehityksen esikatselu näkyvät keskisarakkeessa (`upBtn(...,prevEl)`), ei vieritystä. Haamukuva vain raahatessa (`updGhost`).
- **Syöminen (kohta 3):** vain pikapaikan numerolla (`useSlot`). Syö-nappi ja kaksoisnapsautussyönti poistettu.
- **Käyttöönotto (kohdat 29–30):** napsautus valitsee siirtoon ja ottaa haarniskan/vaatteen, kilven, soihdun tai nuolet käyttöön
  (`clickEquips`, `clickEquip`). Jos seuraava napsautus osuu toiseen ruutuun, esine siirtyy ja käyttöönotto perutaan (`selEq.undo`).
  Käytössä olevat nuolet näkyvät keltaisella reunuksella. Nuolet otetaan käyttöön myös pikapaikan numerolla (pysyvät valittuina).
- **Pudotus (kohta 26):** `playerDrop` heittää aina kameran suuntaan eteenpäin, ~3 m (ennen ~1,2 m satunnaiseen suuntaan).
- **Keinunta (kohta 32):** käsien heilunta −10 % (.7 → .63, juoksulisä .35 → .315), sivukeinunta kävely puolet (.035 → .0175), juoksu −10 % (.085 → .0765).

### v1.31 (Q hiiren alla, tönäisyarvot ja kyvyttömyys, kivivartija, valikon kuva arvottu)
- **Q / Shift+Q** pudottaa hiiren alla olevan esineen repussa ja arkussa ilman valintaa (`hoverSlot`, `dropAt`). Itse pudotettu esine
  ei imeydy heti takaisin (`drop.noPick`, poimitaan vasta kun pelaaja on käynyt yli 2,5 m päässä) – ennen se palasi reppuun 0,5 s:ssa.
- **Tönäisy** näytetään arvona ilman yksikköä: arvo N = N/2 m tavalliseen viholliseen (10 = 5 m), isot olennot vähemmän (r > .6 70 %,
  r > .8 40 %). Fysiikka: nopeus N·3,75 m/s (`KB_V`), vaimennus 6/s. Mitattu susi: 10 → 5,0 m, nuija 6 → 2,9 m, kivikirves 2 → 1,0 m;
  karhu nuijalla 1,0 m. Uudet arvot: kivikirves 2, kuparikirves 2,5, rautakirves 3, nuija 6, hakut 1,5/1,5/2, keihäs 3, miekat 2/2,5,
  hiidenmiekka 3,5, nyrkki 1,5. **Kyvytön lennon ajan** (ai.js: nopeus > 0,5 m/s → ei kävele, ei lyö, isku keskeytyy; mitattu 0,4–0,7 s).
- **Kivivartija:** terveys 110 → 220, ulottuma 2 → 2,55 (× harppova 1,1 = 2,8 m).
- **Valikon kuva** aina arvottu, myös sivun avauksessa (ennen avauksessa Öinen leiri).

### v1.30 (oikea napsautus ottaa puolet, vihje 3 s)
- **Oikea napsautus** pinoon (ilman valintaa): ottaa puolet valituksi samalla sykkivällä korostuksella ja haamukuvakkeella (haamussa
  siirrettävä määrä + katkoviivareunus); seuraava vasen napsautus laskee puolikkaan ruutuun (`moveHalf`). Vihjeet "Siirrä ½" /
  "Pinoa ½" / "Ei käy". Oikea uudestaan samaan ruutuun poistaa valinnan. **Oikealla raahaus** siirtää puolet (paneelin ulos = puolet
  maahan). Sama arkuissa (`chestSel.half`). Ennen oikea napsautus jakoi pinon automaattisesti ensimmäiseen tyhjään ruutuun.
  `selHalf`, `pickHalf`, `slotHint(...,half)`; raahauksen jälkeinen contextmenu syödään.
- "Toimii parhaiten…" -vihje näkyy 3 s (ennen 6 s).

### v1.29 (v1.25:n valikko palautettu)
- Käyttäjän WebGL toimii taas (selaimen uudelleenkäynnistys). `MENU_V2_OFF=false` → valikossa taas animoidut kuvat (oletus) ja
  asetus "Valikon tausta" (kuvat / 3D-kamera). Testattu: vanhan version tallennus → kuvat näkyvät (Öinen leiri), "Jatka matkaa" ja
  "Uusi peli" käynnistävät pelin; 3D-kamera-tila toimii; karttavaihdon uudelleenlataus toimii (tarkistusrivi).
- Huom: peli on aina käyttänyt WebGL:ää (three.js); valikon kuvat ovat 2D-canvasta (eivät tarvitse näytönohjainta) → keventävät valikkoa.

### v1.28 (WebGL-varmistus – käyttäjän ongelman todellinen syy)
- Käyttäjän virhelaatikko paljasti syyn: selain ei antanut WebGL:ää (KORJAUKSET 24). `render.js`: piirturi 3 yrityksellä + `webglFail()`-ohje
  (myös `webglcontextlost`). Käyttäjälle: sulje koko selain ja avaa uudelleen, grafiikkakiihdytys päälle, chrome://gpu.

### v1.27 (valikkokameran muutokset väliaikaisesti pois – käyttäjän pyyntö)
- `main.js`: `MENU_V2_OFF=true` → valikossa alkuperäinen kamera (`menuCamOld`, kiertää kartan keskikohtaa 60 m säteellä, 22 m korkeudella),
  ei v1.15:n 3D-kierrosta eikä v1.25:n animoituja kuvia; "Valikon tausta" -asetus piilotettu. Koodi säilyy (`menuCam`, `js/menubg.js`):
  palautus = `MENU_V2_OFF=false`. Testattu: vanhan version tallennus → "Jatka matkaa" ja "Uusi peli" käynnistävät pelin.

### v1.26 (käynnistysvahti ja virheet näkyviin)
- Käyttäjä: "painan pelaa, mitään ei tapahdu, uudet kuvat eivät näy" – ruudulla versio 1.23 (vanha, rikkinäinen). Paikallisesti
  toistettuna (vanhan version tallennus + asetukset) kaikki toimii → todennäköisesti välimuistissa vanha versio (KORJAUKSET 23).
- `index.html`: `window.HV` (versio), `#bootErr`-laatikko näyttää virheet + version, 20 s vahti "Peli ei käynnistynyt…".
  `main.js` näyttää myös pelisilmukan ensimmäisen virheen. **Päivitä `window.HV` aina version mukana.**

### v1.25 (valikon tausta animoiduiksi kuviksi)
- Uusi tiedosto `js/menubg.js` (ennen main.js): 10 proseduraalista animoitua 2D-kuvaa (`MBG_SCENES`): Öinen leiri (nuotio + valon
  lepatus + kipinät + vilkkuvat silmät puskassa), Iltarusko järvellä, Revontulet tunturilla, Sumuinen aarnimetsä (sumu + tulikärpäset),
  Kalmankehä kuutamossa (sykkivät riimut), Kivilinnake aamulla (valonsäteet), Riimukivi rannalla (aallot), Myrsky (sade, salama,
  taipuvat kuuset), Lumisade (lumihiutaleet, ikkunan valo), Portaalin hehku. Tyyli: low poly -muodot + maalaukselliset taivaat/sumut.
- Kevyt: kiinteä osa piirretään kerran välikankaalle, animaatio 30 kuvaa/s 60 % tarkkuudella; mitattu 0,1–2,4 ms/kehys (ohjelmistorenderöinti).
  Valikossa **ei piirretä 3D-maailmaa** (`skip3d`), mitattu 0 3D-kuvaa valikossa.
- Sivun avauksessa aina Öinen leiri, sen jälkeen arvottu (ei sama peräkkäin) 20 s välein mustan kautta. Vasen reuna tummennettu (tekstit).
- Asetus Grafiikka → Yleiset → **Valikon tausta**: Animoidut kuvat (oletus) / 3D-kamera. 3D-kamera käyttää nyt oikeaa aikaa (ei hidastu
  alle 20 FPS:llä).

### v1.24 (KORJAUS: peli ei käynnistynyt karttavaihdon jälkeen)
- "Uusi peli" → toinen kartta → uudelleenlataus → `startPlay` → `menuClear` käytti alustamatonta `let menuDeco` → musta ruutu.
  Valikkokameran tila esitelty `main.js`:n alussa. KORJAUKSET 22, tarkistusrivi avaa sivun automaattisen aloituksen tilassa.

### v1.23 (lista 2, kohdat 15–17: nuolet, paremmat jouset/aseet, tähtäysympyrä)
- **Nuolet** (`AMMO_STATS`): sulitettu nopeus ×1,25 (ennen 1,12), pudotus ×0,6, vahinko ×1,15, tuuli puolet; tulinuoli = piikivinuoli +
  sytyttää. Nuolten tiedot tietolaatikossa (lentonopeus, kaaren pudotus, vahinko, tuuli, sytyttää).
- **Tulinuolen valo**: uusi grafiikka-asetus `SET.arrowLight` (Valo-osio, oletus pois) → lentävä tulinuoli kantaa valoa (valolähde
  `move:true`, sijainti päivitetään joka kehys `ai.js`:n valosilmukassa; `updateLights` tallettaa `l.userData.src`).
- **Palava mob:** 4 lisäliekkiä vartalolla, kipinöitä ×2,3 ja savua, oranssi valo mobin alla (`m.fireLight`, poistuu `stopBurn`).
- **Jouset** (`BOW_STATS`): hiidenjousi veto 1,15 s (ennen 1,6), nuolen nopeus ×1,25, hajonta ×0,7. ★-laatu nopeuttaa vetoa (ennallaan)
  ja pienentää hajontaa (÷ 1 + 0,3·(★−1)).
- **Aseiden kestävyys / isku** `matStamK`: kivi/puu ×1, kupari ×0,9, rauta ×0,8, hiiden ×0,7. **Kilvet** torjunnan kestävyyskulutus
  (`SHIELD_COST`): puu 90 %, kupari 75 %, rauta 60 % iskusta (ennen kaikilla 90 %). Näkyy tiedoissa.
- **Tähtäys** (`bowSpread`): hajonta 10° × (1 − veto) + liike (juoksu 2°, ilmassa 3°), × jousi/★. Laukaistessa nuolen suunta arvotaan
  ympyrän sisältä. `#cross.aim` koko = hajonta ruudulla (FOV:n mukaan), väri keltainen → punainen, täysi veto = pieni ympyrä + piste.
  Mitattu 100 laukausta: veto 20 % → enint. 7,9°, täysi veto → 0°.

### v1.22 (lista 2, kohta 14: jousen veto oikein)
- **Vika:** täydessä vedossa jänne ja oikea käsi menivät hahmon vasemmalle puolelle (~35 cm), jousi ei ollut edessä keskellä
  (jousen asento seurasi vasemman käden kiertoa). Mitattu pisteinä (eteen, sivu, korkeus).
- **Korjaus** (`bowAim`, player.js): ampuja-asento – vartalo kiertyy −0,55 rad (vasen olka eteen), pää kääntyy takaisin eteen;
  kahva keskellä edessä (eteen 0,7 m, sivu −0,04), jänne posken oikealla puolella (eteen 0,01, sivu −0,12, posken korkeus);
  vasen käsi IK:lla kahvaan, jousen paikallinen +z = tähtäys (jänteeltä kahvaan), oikea käsi IK:lla jänteelle. Kaikki pehmeästi `drawK`:lla.
- Vedon pituus `.42 → .32` (käsi ylettyy). **Levossa** jousi heiluu käden mukana (ennen käden kierto kumottiin).

### v1.21 (lista 2, kohta 13: terveyspalkit riveinä)
- Mobin pään päällä: yksi rivi = 100 hp (`HP_ROW`), rivit päällekkäin enint. 5 (`HP_ROWS`), ylin tyhjenee ensin; yli 500 hp:n mobilla
  toinen värikerros (oranssi) rivien päällä. Pino kasvaa ylöspäin (`translate(-50%,-100%)`), nimi ja kallot rivien yläpuolella → eivät
  peitä mobia. Korvaa v0.7x:n värikerrospalkin (`HP_LAYER` 60 poistettu). Pomot, joilla on ruudun yläreunan palkki, eivät saa pääpalkkia.

### v1.20 (lista 2, kohdat 10–12: kartan pilvet, tekstien varjot, terveys tasoilla)
- **Iso kartta:** avatun alueen päällä liikkuu ohut pilvikerros (alfa 0,2, `CLOUDC`-kuvio, sama tuulisiirtymä `mapCO`).
- **Karttatekstit:** löytöpaikkojen nimille ja alareunan tekstille pehmeä varjo (shadowBlur 3, siirto 1 px) → näkyvät lumisilla vuorilla.
  Nimetöntä paikkaa ei piirretä.
- **Enimmäisterveys tasoilla:** `lvlHp()` = 10 × (taso − 1), enint. 40 → taso 1: 60, 2: 70, 3: 80, 4: 90, 5+: 100 (+ saavutukset, voima).
  Tason noustessa nykyinen terveys kasvaa saman verran (`addXp`). Uusi peli alkaa täydellä terveydellä (`maxHp()`).

### v1.19 (lista 2, kohta 9: puut taipuvat tuulessa, myrskyn kaatosuunta, kaatuvan puun osuma)
- **Taipuminen:** `SWAY.uLean = 3,4 · min(1,1, v/22)^1,6` (ennen min(1,2, v/22)): myrskyssä latva n. 12–17° puuskien mukaan,
  10 m/s n. 3°, 3 m/s lähes suora. Ruoho käyttää edelleen enintään 1,2 (`min(uLean,1.2)`), ettei kaadu lattiaan.
- **Myrsky** (`stormFellTree`): voi kaataa myös pelaajan vieressä olevan puun (ennen vain > 9 m); 70 % tuulen suuntaan ±25°,
  30 % satunnaisesti (mitattu 200 kaatoa: 74–78 % myötätuuleen).
- **Osuma** (`treeHit`/`crushPlayer`): kaikki kaatuvat puut (myrsky, pelaajan ja karhun kaatamat) osuvat rungon alle jääviin:
  pelaaja ja mobit menettävät 80 % suurimmasta terveydestä, haarniska ei suojaa (yli 20 % menettänyt → kuolee). Puun kaatanut karhu ei
  vahingoitu. DEV "Ei voi kuolla" suojaa. Korkeusehto: kohde alle 3 m maanpinnasta (ennen verrattiin puun y:hyn, joka ei toiminut).

### v1.18 (lista 2, kohta 8: tehtävä ja tavoite piiloon)
- Uusi toiminto `hud` (oletus **T**, vaihdettavissa): kierto molemmat → vain tehtävä → vain tavoite → ei kumpaakaan (`SET.hudMode` 0–3,
  muistetaan). Piilotettuna tavoitteen paikalla (tai tavoitteen alla, jos vain tehtävä piilossa) pieni `#hudHint`:
  "Tavoite / Tehtävä / Tehtävä ja tavoite piilotettu – Näytä painamalla (T)". `applyHudMode` (ui.js).
- **Ilmoitusloki siirtyi T → L** (käyttäjän valinta). Vanha tallennettu sidonta: jos log = hud ja hud ei tallennettu → log = L.

### v1.17 (välilisäykset 4–7: täysi reppu, katoamisajastin, pomojen ryntäys ja maahanisku)
- **Täysi reppu:** solmun (kivi, oksa, marjat…) poiminta ei onnistu, jos kaikki ei mahdu; osittain lisätty perutaan ja solmu jää
  (ennen loput hävisivät). Maassa oleva esine: jos mitään ei mahdu, viesti "Reppu on täynnä – et voi poimia" enint. 4 s välein.
- **Katoamisajastin** (`DROP_LIFE` 300 s): jokaisella pudotuksella `dim` (`curDim()`: 'world' / 'barrow' / ulottuvuuden id); ajastin ja
  fysiikka käyvät vain, kun pelaaja on samassa ulottuvuudessa.
- **Pomojen ryntäys** enintään kerran 10 s:ssa (`BOSS_CHARGE_GAP`): Kalmanvartija (ennen 8 s) ja ulottuvuuspomot (ennen ei rajaa,
  `m.chargeT`). Mitattu Kalmanvartijalla 600 päätöstä: lyhin väli 11 s.
- **Maahanisku** (`slamArms`): kädet nousevat, pysyvät ylhäällä latautumassa 0,8 s (värisevät), sitten isku. Osuma-ajat ennallaan
  (Kalmanvartija 1,54 → todellinen 1,69 s, ulottuvuuspomot 1,1).

### v1.16 (lista 2, kohta 7: valmistusehdotukset uudelleen)
- `suggestCrafts` palauttaa `{now, next}`: **Voit valmistaa nyt** (aineet repussa, enint. 6) ja **Hyödyllistä seuraavaksi** (enint. 4).
  Työpiste ei lähellä → merkintä "Tarvitset: X"; jos työpistettä ei ole rakennettu lainkaan → "(rakenna ensin)" ja esine myös next-osioon.
- Järjestys molemmissa (käyttäjän määrittely): 1) ei koskaan valmistettu (`flags.first['c_'+id]`), 2) usein tarvittavat (`SUG_REPEAT`:
  nuolet, soihtu, hiili, varras + ruoka), 3) valmistettu ennen mutta ei mukana, 4) välituotteet uuteen esineeseen. Tasapelissä
  keräystyökalut → aseet/jousi → suojat → lapio/kuokka, sitten aineiden osuus. Tarpeettomat (huonompi tai jo omistettu varuste) pois.
- Pelin vaihe: next-osiossa vain ohjeet, joiden taso ≤ korkein omistetun varusteen ohjetaso + 2 (ei hiidenvarusteita alussa, vaikka
  DEV-tilassa taso olisi korkea). Väliotsikot `.sugH`.

### v1.15 (lista 2, kohta 6: valikon taustakamera kiertää kohteita)
- `main.js` `menuCam`: kohdelista `buildMenuSpots` (luonto: 10 biomia, järvi kaukaa rannalta, hylätyt leirit päivällä ja yöllä,
  eläimet: peura, poro, karhu, kettu, hirvi, jänis). 20 s / kohde (`MENU_SHOT_T`), hidas 30° kierto ja hieman laskeutuen, lähikuva
  (luonto 8–12 m, eläin 5–6,5 m, kamera seuraa eläintä joka vaeltaa `moveMob`/`animMob`). Kohde kuvan oikealle puolelle (valikon tekstit
  vasemmalla). Vaihto mustan kautta (`#menuFade` 0,8 s). Vuorokaudenaika arvotaan (aamu/päivä/iltapäivä/ilta), leirin yökuvassa nuotio
  palaa (valo `menuLight` lepattaa). Leirin teltta + nuotio tehdään valikkoa varten erillisinä malleina (`menuDeco`), eivät ole rakennuksia.
  Ensimmäinen kohde arvotaan joka latauksella. `startPlay` siivoaa (`menuClear`). Pelaajahahmo piilossa valikossa.
- Esc pelistä: tausta on edelleen pelaajan oma paikka (ennallaan).

### v1.14 (lista 2, kohta 5: "Toimii parhaiten…" kerran; rautakypärä palautettu)
- Valikon alaosan teksti poistettu; tilalle `#pcHint` ruudun yläkeskellä (hiirikuvake + teksti), näkyy kerran per käynnistys 6 s ja
  häipyy 1,5 s:ssa (`.fade`). Ajastin alkaa toisesta kehyksestä (latausaika ei syö näkymisaikaa); pelin aloitus häivyttää heti.
- **Rautakypärä:** käyttäjä piti alkuperäisestä mallista enemmän → v1.12:n kapeneva verho + nauha poistettu, alkuperäinen palautettu,
  mutta rengasverho nostettu 4 cm (y .2 → .24) ja nenäpalkki 3 cm (y .26 → .29).

### v1.13 (välilisäys 3: sivukeinunta ja pehmeä juoksu → kävely)
- `player.js`: `P.runKs` = pehmennetty juoksukerroin (nousu 6/s, lasku 2,2/s); käytetään askeleen, käsien ja etukenon laskennassa.
  Mitattu juoksusta kävelyyn: etukeno .13 → .01 rad n. 1,2 s:ssa tasaisesti (ennen hyppäsi heti).
- Sivukeinunta `fig.rig.rotation.z = sin(walkPh) · min(1, v/4) · (.035 + .05·runK)` (ei kyykyssä, ilmassa tai uidessa): runko kallistuu
  edessä olevan jalan puolelle (oikea jalka edessä → oikealle). Mitattu: juoksu ±4,9°, kävely ±2,1°, suunta oikein 100 %.

### v1.12 (välilisäykset 1–2: grafiikka-asetusten väliotsikot, automaattisäätö, FPS; rautakypärä, huppu)
- **Asetukset:** Grafiikka-sivulla väliotsikot Yleiset / Luonto / Valo / Partikkelit / Rakennukset (`.setSub`), Varjot-sivulla
  Auringon varjot / Tulien ja soihtujen varjot. "Automaattinen laatu" (varjot, `autoQ`) siirretty Varjot-sivulle.
- **Yleinen automaattinen säätö** `SET.autoAll` + osa-alueet `autoRes` (3D-resoluutio ×1/.85/.7/.55), `autoFx` (hiukkaset + usva ×1/.5/.25,
  ruoho Täysi→Normaali→pois), `autoDist` (piirtoetäisyys ×1/.8/.6) ja `autoQ` (varjot, `QUAL.lvl`). `AUTO`/`AUTO_K`/`autoOn` (settings.js),
  `autoQuality` (main.js): nykiessä (>36 ms 3 s) lasketaan yksi askel järjestyksessä varjot → fx → resoluutio → etäisyys, sujuessa
  (<18 ms 12 s) palautetaan käänteisesti, 6 s välein. Usva ei enää riipu varjojen tasosta vaan `AUTO.fx`:stä.
- **FPS-näyttö** `SET.fps` (Pois / oikea ylä / vasen ylä / oikea ala / vasen ala), `#fps` HUD:ssa, päivitys 0,5 s, väri ≥50 vihreä, ≥30 keltainen.
- **Rautakypärä (peruttu v1.14, alkuperäinen palautettu ja nostettu):** rengasverho kiinni kypärän reunassa (yläsäde = reunan säde, z-skaala 1,08, y .37 → .2, kapenee kaulaan, edestä avoin
  .5π) + alareunan nauha takana. Ennen verho oli leveämpi ja matalampi → näytti irrallisilta laatoilta poskissa.
- **Nahka- ja karhuhuppu:** hiukset jäävät näkyviin hupun alta (`hoodHair`: piiloon vain hupun läpi puhkaisevat tupsut), huppu r .255.

### v1.11 (lista 2, kohta 4: ei muiden pelien mainintoja)
- Asetus "Hiiren rulla vaihtaa pikapaikkaa": selite "kuten Minecraftissa; …" → "rulla vaihtaa pikapaikkaa zoomin sijaan; zoom säädetään alta".
  Koko koodi tarkistettu (js, index.html, css): ei muita mainintoja. Tarkistusrivi estää paluun.

### v1.10 (lista 2, kohta 3: höyryn ja usvakiehkuroiden optimointi)
- `SET.mist`: 2 = Korkea (entinen ulkonäkö), 1 = Normaali (oletus), .5 = Matala, 0 = Pois (vanha tallennettu 1 = Normaali, .5 = Matala).
- `updateMist`: `fxN` (höyryn syntytahti ja WISP-määrä) Normaali .5, Matala .25; haituvan koko `szK` 1,2 ja peitto `opK` 1,39
  (määrä × koko² × peitto ≈ vakio). Maanpinnan usva (`MIST`) ennallaan. Mitattu portaalilla höyryä 8 → 4, Hautakummussa kiehkuroita 48 → 24.

### v1.09 (lista 2, kohta 2: vartijoiden paluu ajan kanssa)
- `ai.js` vartijat (`m.guard`): paluu `d.walk`-nopeudella (ennen `d.run`), parantuminen paluun aikana 1 %/s (ennen 5 %/s).
  Keskeytys: pelaaja alle 8 m TAI näkyvissä alueen sisällä. `m.intr` = keskeytetty alueen ulkopuolella → ei rajarajoitusta niin kauan
  kuin pelaaja < 8 m; kun pelaaja kauempana, uusi 1–10 s ajastin ja paluu. Mitattu: kalmo 30 m rajalta kotiin 20,8 s.

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

### Äänierät (äänisuunnitelma, ks. "Äänisuunnitelma")
- [x] **A olennot** (v1.84): paikkamerkit kaikille 26 olennolle, varaääniketju, 3D-ääni, idle/aggro/hurt/death, voimakkuusasetus.
- [ ] **B pelaajan ja toimintojen äänet:** askeleet pinnan mukaan, hyppy, uinti, taistelu, keräily, työkalut, rakentaminen, työpisteet,
  käyttöliittymä.
- [ ] **C taustaäänet ja sää:** metsä päivä/yö, Aarnimetsä, luolasto, sade, tuuli, myrsky, tuli.
- [ ] **D musiikki:** päivä, yö, Aarnimetsä, luolasto, taistelu, pomo, voitto; pehmeä ristiinhäivytys.
- [ ] **E äänifysiikka:** vaimennus seinän takana (lowpass + losClear), luolan kaiku (olennoille tehty v1.86; jäljellä pelaajan askeleet ym.), veden alla vaimea, askeleet
  hiljaisempia kyykyssä.
- Jokainen erä samalla paikkamerkkitavalla ja oma osio AANILISTA.md:hen.

### Päivityslista 6 (v1.53–) – julkaisupäivitys
**JATKA TÄSTÄ (lista 6):** KAIKKI tehty v1.53–v1.83 + koko pelin tarkistus (6 karttaa, 0 virhettä); PR #25 odottaa yhdistämistä.
- A: jousen veto kuvattu 5 kulmasta seisten ja kyykyssä (asento kunnossa), kävelyn sivukeinunta pois, juoksussa vähemmän + osin
  eteenpäin, piikivikirves.
- B: Ohjaus: kääntymisen herkkyys ja valikko-osoittimen herkkyys; virtuaaliosoittimen viive pois.
- C: ensikäynnin aloitusjakso: musta → "EricStudios" + "KSPK-tech" + tekijänoikeusrivi → HIIDENMAA (kivi, halkeamat) pitkä fade in,
  katoaa varjoon → varoitus "toimii parhaiten tietokoneella, hiirellä ja näppäimistöllä" (ei enää valikossa) → siirtymäanimaatio
  latausnäyttöön.

### Päivityslista 5 (v1.49–) – vastaukset ja erät
**JATKA TÄSTÄ (lista 5):** KAIKKI erät A–D tehty (v1.49–v1.52); PR #25 auki odottaa yhdistämistä.
**Erät:**
- A (v1.49): 5 Tallennettu-teksti piilossa (bugi: `#bSave.firstChild` on nyt riimulaatta), 3 jousen tähtäin ja kyykkyammunta.
- B (v1.50): 2 yöolennot palavat auringossa.
- C (v1.51): 1 kymmenen uutta valikkotaustaa, myrskyn sade puiden suuntaan, eeppisempi portaali (2 versiota: hahmolla ja ilman).
- D (v1.52): 4 uuden maailman latausnäyttö + pilvet aukeavat.
**Vastaukset:**
- 1: kaikki neljä ryhmää: ulottuvuuksien vihjeet (Routaluola, Kalmankammio, Aarnihauta, eivät paljasta pomoja), eläimet/luonto,
  vaara/jännitys, selviytyjän elämä; lisäksi myrsky jossa puita kaatuu ja metsä jossa karhu riehuu. Myrskyn sade puiden taipumisen
  suuntaan. Portaali: riimukaari ja kivipylväät, leijuvat kivet ja partikkelit; hahmo portin edessä vain joskus (kaksi versiota).
- 2: palavat vain niityllä (avoimella alueella) olevat kalmot ja pelottavat yöolennot (SCARY-tyypit). Katos, sää (pilvi/sade) ja tiheä
  metsä suojaavat. Noin 6 s: ~3 s ryntäilee paniikissa, ~2 s hidastuu, kaatuu ja muuttuu tuhkaksi. Sytyttää pelaajan läheltä (1 m).
  Ei saalista, ei rakennusten sytytystä.
- 3: seisten täysin vedettynä tähtäimen pienin ympyrä pieni (ei mini) ja pientä hajontaa; kyykyssä täysin vedettynä tähtäin hyvin pieni,
  ei hajontaa, veto ja nuolen nopeus +10 %; tiputusristikko (viivat eri etäisyyksille) vain kyykyssä täysin vedettynä.
- 4: uutta maailmaa luotaessa riimukivi-latausnäyttö; sen jälkeen pilvet aukeavat sivuille: Medium ja yli 3D-lisäpilvet kameran edessä
  (poistuvat animaation jälkeen), alle Medium CSS-pilviverho. Ei nykimistä eikä teleporttia näkyviin.
- 5: Tallennettu-teksti näkyy samassa paikassa kuin ennen (painikkeessa), mutta ei saa jäädä piiloon.

### Päivityslista 4: 32 kohtaa (v1.39–) – tarkentavat kysymykset kysytään ensin, vastaukset kirjataan tähän
**JATKA TÄSTÄ (lista 4):** PR #25 auki. KAIKKI erät A–F tehty (v1.39–v1.44) + aluebannerien jono/syvyys. PR #25 odottaa yhdistämistä.
**Erät (lista 4):**
- A (v1.39): 1 kyykky, 3 ylämäki, 5 selkäterät, 6 esineet maassa, 8–9 pomot/vartijat, 18 rikki kilpi, 19 Aarnihirviö, 25 hp-vaihtelu,
  extra 1 veren fysiikka, extra 2 linnakkeen portaat.
- B (v1.40): 7 P-näppäin ja Esc pois, 28 opasteet, 26/27/29 reppunapsautukset, 4 omat kentät, 23 arkun katse.
- C (v1.41): 2 lumi/sade, 20 seinäsoihtu, 21–22 soihtujen sytytys, 24 arkkujen ulkonäkö.
- D (v1.42): 12–13 saalis, 14–15 Kalmaherra, 16 jousikalmot, 17 ulottuvuuden intro.
- E (v1.43): 10 latausnäyttö, 11 maailman intro, 31 suorituskykytesti, 32 tauko/käynnissä.
- F (v1.44): 30 optimoinnit asetuksiin.
- Lisäpyyntö (tehty v1.43): aluebannerit pitkä häivytys sisään/ulos, jonossa ei päällekkäin, alue löytyy vasta ~6 m syvemmällä.
**Vastaukset (lista 4):**
- 1: kyykyssä täysin huomaamaton (myös liikkuessa, ellei lyö); nousu kyykystä → 0,1 s → säikähtää.
- 3: vain juoksu ja hyppy ylämäkeen +30 %.
- 7: Esc ei tee pelissä mitään. P = yleinen sulkunäppäin (sulkee minkä tahansa paneelin) ja avaa/sulkee päävalikon (tauon).
  Valikon oma näppäin sulkee myös sen (Tab, M…). Pienet näppäinopasteet nurkkaan (esim. "Päävalikko: P"), asetuksista pois päältä.
- 2: pelaajan ympärille alue, jossa lumihiutaleet kiertävät silmukkana ylhäältä alas, suunta tuulen mukaan (ei näkyvää kameran seurantaa).
  Pimetessä sade ja lumi tummuvat (sade yöllä hyvin tumma). Medium ja ylöspäin: lähellä olevat valot (myös pelaajan soihtu) värjäävät
  pisarat ja hiutaleet kellertäviksi/vaaleammiksi (heijastus).
- 4: omat valintaruudut ja liukusäätimet (selaimen omat eivät toimi kunnolla); fokus ei jää päälle; tekstikentät: kursori tekstin
  loppuun, kun palaa kirjoittamaan vanha teksti valittuna (kirjoitus korvaa); DEV-määrä: kursori oikealla, ei muista määrää (tyhjä);
  hakukenttä aina tyhjä avattaessa; valikoissa kirjoittaminen menee suoraan hakuun ilman napsautusta.

- 5: miekka, lapio ja kuokka selässä lappeellaan selkää vasten (kierto 90° pituusakselin ympäri), terä alas vinosti.
- 6: molemmat: esine lepää korkeimman maakohdan päällä alueen alla, leijuu 0,25 m ylempänä, pysähtyy rinteessä oikein.
- 8: pomojen iskut +20 %. 9: porttien JA kohteiden (rauniotalot, linnakkeet) vartijat: +80 % vahinko, eivät pelkää tulta; pomot eivät pelkää.
- 10: latausnäyttö – yllätä (esim. riimukivi, jonka riimut syttyvät latauksen edetessä, usva, kipinät, runosäe).
- 11: uuden maailman intro ~6 s: 4 s korkealla pilvien yllä hidas kierto + "Hiidenmaa" ja kartan nimi animoituna, 2 s nopea syöksy
  pelaajaan; ohitettavissa.
- 12–13: Kalmankammio 2× saalis; Kalmankammio ja Aarnihauta: 30 % mahdollisuus harvinaiseen (metson sulat, karhuntalja, hiidenkivi, ★2-ase/kilpi).
- 14: Kalmaherra: ryntää 2× useammin, ei lyö ilmaa; kun hp ≤ 50 %, 20 s välein 1–3 ladattua iskua (0,7 s), jokainen 8 m tulijana
  pelaajaa kohti, 20 vahinkoa + palaminen 4 s, jana palaa maassa 5 s.
- 15: loppuvaihe hp < 30 %: hehkuu punaisena, vain ryntäyksiä (~1,5 s välein), 5 kalmoa ympärille 20 s välein.
- 16: jousikalmot 10 %: ampuu 3–20 m, 1 nuoli / 2,5 s, vahinko kuin lyönti, pitää etäisyyttä, pudottaa joskus nuolia.
- 17: ensimmäisellä kerralla iso pelottava animoitu teksti (alueen löytymisbannerin tyyliin + ulottuvuuden koristeet): pomo ja esine;
  myöhemmin vain viesti sivuun.
- 18: rikkinäinen kilpi: oikea hiiri → viesti "Kilpi on rikki (0:42)", ei torjuntaa; kilpi selässä kunnes ehjä.
- 19: Aarnihirviö: 1,7 min ilman osumaa → paranee hitaasti (1 %/s).
- 20: seinäsoihtu: 2 puuta, 1 pihka, 1 rauta, palaa 15 min, pihkaa lisäämällä lisää; Aarnihaudan seinäsoihdut kiinni kivissä.
- 21–22: sytytys alle 2,5 m nuotiosta/soihdusta/seinäsoihdusta/ulottuvuuden soihdusta; heti viesti "Pysy paikallasi hetki…", 1–1,5 s
  paikallaan → syttyy. Nuotio sytyttää pelaajan ja mobit alle 0,8 m.
- 23: arkku/tynnyri: tähtäin päällä tai 15° sisällä.
- 24: puuarkut lankkutekstuuri + rautavanteet + niitit, kansi saranoista; kiviarkku kivitekstuuri + riimut, avattuna ontto, lukonreikä.
- 25: viholliset + eläimet (ei pomot) hp 100–160 %, vahvemmat +0–10 % kokoa.
- 26: oikea valitsee puolet, seuraava vasen TAI oikea toiseen ruutuun siirtää puolet; vasen valitsee kaiken, sitten oikea toiseen = puolet.
- 27/29: napsautus paneelin reunojen ulkopuolelle: ilman valintaa sulkee, valittuna pudottaa.
- 28: paneelin oikeaan yläkulmaan "Sulje: P / Tab"; pelinäkymän vasempaan alakulmaan "P päävalikko"; asetus Näppäinopasteet.
- 30: LOD kaukomaastolle, staattisten yhdistäminen, varjot harvemmin kaukana – kaikki grafiikka-asetuksiin, esiasetukset päättävät.
- 31: suorituskykytesti 3 s latausnäytön aikana ensimmäisellä käynnillä → esiasetus (läppärit pääsevät valikkoon).
- 32: päävalikossa (tauko) vaihdettava nappi "Tila: Tauko / Käynnissä" – käynnissä maailma päivittyy taustalla ja muutokset näkyvät heti.

Extra 1. (lisä) High+ ja Ultra: veri lentää lyönnin suuntaan pisaroina, jotka jäävät maahan pieniksi läikiksi; kuoleman lammikko kasvaa
   hitaasti. Oma asetus (Veren fysiikka), esiasetukset High+ ja Ultra päällä.
Extra 2. (lisä) Arkkukivilinnakkeen kierreportaat leveämmiksi: muurin osumalaatikko (kierretyn lohkon AABB) on iso ja vie askelmista
   tilaa, joten portaita on vaikea kävellä.
- Extra 1 tarkennus: pisarat 1–5 m tönäisyn mukaan, lammikko +25 %; viiltävä ase → punaiset viillot mobiin ja mobista tippuu pisaroita
  5 s; pisarat jäävät kaikkiin pintoihin (maa, lattiat, kivet, seinät); myös pelaajasta; tarkista että nuolet jäävät kaikkiin objekteihin.
- Extra 2 tarkennus: muurin osuma tarkaksi (kaaren mukaan) + hieman leveämmät portaat, askel 0,3 m ennallaan.
1. Kyykyssä eläin ei huomaa; kun nousee kyykystä, 0,1 s viive ja eläin säikähtää.
2. Lumisade ei saa näkyvästi seurata pelaajaa/kameraa (kevyt korjaus).
3. Ylämäkeen kävely/juoksu kuluttaa kestävyyttä 30 % enemmän.
4. Liukusäätimet (myös DEV), hakukentät (ei muista hakua – aina tyhjä), valintaruudut: ei jää fokukseen/siniseksi; omat valintaruudut.
5. Miekka selässä: kierto 90° oman pituusakselinsa ympäri (lappeen tasainen puoli selkää vasten).
6. Maassa olevat esineet ylemmäs (eivät uppoa maahan) tai parempi maaston osuma.
7. Esc pois käytöstä (näyttää oikean kursorin); valikko toisella näppäimellä (H?), valikoista poistutaan samalla näppäimellä.
8. Pomojen iskut +20 % vahinkoa.
9. Porttien vartijat eivät pelkää valoa, +80 % vahinkoa; pomot ja vartijat eivät pelkää valoa.
10. Latausnäyttö sivua avattaessa (teeman mukainen, yllätä).
11. Uusi maailma: korkea kamera-ajo pilvien yläpuolella, hidas kierto, "Hiidenmaa" + kartan nimi hienoin animaatioin, sitten nopeasti pelaajaan.
12. Kalmankammion arkkuihin enemmän saalista.
13. Kahden viimeisen ulottuvuuden arkkuihin harvinaisia esineitä (kuten metson saalis).
14. Kalmaherra: ei lyö ilmaa jatkuvasti, ryntää useammin, ladattu isku 3 putkeen → tulijanat maassa ~5 s, sytyttää pelaajan.
15. Kalmaherran loppuvaihe: hehkuu punaisena, pelkkää ryntäystä, 5 kalmoa ympärille 20 s välein.
16. Kalmankammiossa ~10 % kalmoista ampuu jousella.
17. Ulottuvuuteen astuessa viiveellä teksti: kukista (pomo) ja ota siltä (esine).
18. Rikki oleva kilpi: ei voi torjua, menee selkään vaikka valittu; ehjänä takaisin käteen.
19. Aarnihirviö: hp palautuu, jos siihen ei ole osuttu 1,7 min.
20. Aarnihaudan seinäsoihdut kiinni kivissä; vasaralla rakennettava seinäsoihtu.
21. Ulottuvuuksien soihdut ja nuotiot sytyttävät pelaajan soihdun (ei tarvitse olla kiinni); nuotiot sytyttävät pelaajan ja mobit tuleen.
22. Uudelleensytytys 1–1,5 s, viesti "pysy paikallasi hetki" heti tulen vieressä.
23. Tynnyri/arkku avautuu vain suoraan katsottaessa.
24. Kiviarkku ja luonnon arkut paremmalla tekstuurilla; avattuna ontto, lukonreikä.
25. Vihollisten hp vaihtelee 100–160 %.
26. Puolitus: oikea → vasen tai vasen → oikea napsautus siirtää puolet haluttuun paikkaan.
27. Valikossa ilman valintaa napsautus valikon ulkopuolelle sulkee sen.
28. Pieniä näppäinvihjeitä (esim. "Poistu: H").
29. Valittu esine pudotetaan, kun napsautetaan repun/ruutujen ulkopuolelle.
30. Kysymys: optimointi – rasittavatko ulottuvuudet maailmassa ollessa, toimiiko piirtoetäisyys kuten oikeissa peleissä. Suunnitellaan yhdessä.
31. Ensimmäisellä käynnillä 3 s suorituskykytesti → esiasetus; resurssien kevyt lataus valikossa.
32. Pelissä grafiikka-asetusten muutokset näkyvät heti (esim. varjot).

### Päivityslista 3: 33 kohtaa + lisät (v1.32–) – kaikki kysymykset kysytty etukäteen, vastaukset alla
**JATKA TÄSTÄ (lista 3, nykytila v1.38 – korjaus KORJAUKSET 28):** KAIKKI kohdat 1–41 TEHTY v1.32–v1.37. Haara `claude/hiidenmaa-survival-game-fmxt0m`, PR #24 auki
(main = v1.07). Seuraavaksi: odotetaan käyttäjän testiä ja Mergeä. Testaa aina commit-linkillä (välimuisti).
1. TEHTY v1.32. Haamukuva pois kursorilta (näkyy vain raahatessa).
2. TEHTY v1.32. Reppu ei liiku eikä veny: kiinteä koko. Tietoalue (tiedot, päivitys, ota käyttöön) kiinteässä paikassa, ei vieritystä tietoalueessa.
3. TEHTY v1.32. Syöminen VAIN pikapaikan numerolla (ruoka käteen = syö kerran). Syö-nappi ja tuplaklikkaussyönti pois.
4. TEHTY v1.33. Kilpi kuluu: Puukilpi 20 osumaa (torjuu vähiten), Kuparikilpi 15, Rautakilpi 15 (torjuu eniten). Rikki → ~60 s jäähy → ehjä. Ei uutta kilpeä.
5/6/11. TEHTY v1.33. Kaikki eläimet ja hirviöt: terveys ja vahinko +25 %. Ulottuvuuksien pomot: Jäätär ×1,5, Kalmaherra ×2, Aarnihirviö ×2,6;
   Kalmanvartija ×2,5 (2250 hp).
7. TEHTY v1.33. Pomot paranevat täyteen ~10 s:ssa, jos niihin ei osuta 1 min, tai pelaaja poistuu ulottuvuudesta.
8. TEHTY v1.34. Uusi esine **Kalmankruunun sirpale** (vain Aarnihaudasta: Aarnihirviö 1 + 2 satunnaisessa Aarnihaudan arkussa). Kalmankehän alttari vaatii
   3 sirpaletta (ei enää hiidenkiviä). Kalmanvartija = viimeinen pomo Aarnihirviön jälkeen. Tavoitteet ja tehtävät järjestetään uudelleen
   (ulottuvuudet ennen vartijaa). Hiidenkivet jäävät valmistusaineiksi.
9. TEHTY v1.34. Arvoesineet (avaimet, Vartijan sydän, sirpaleet, hiidenkivet, harvinaiset ★-varusteet) eivät koskaan katoa. Jos esine ei ole ollut
   pelaajan repussa tai missään arkussa/säilytyksessä 2 min ja pelaaja on yli 10 m päässä, se siirtyy satunnaiseen maailman kohdearkkuun.
   Kartalta pudonnut sama. Myös bugin takia kadonneet uniikit (avaimet, sirpaleet, sydän) palautetaan.
10. Vastattu: Vartijan sydän = Kalmanvartijan pudotus, tarvitaan Hiidenmiekkaan.
12. TEHTY v1.33. Pelottava yömob kerran yössä: vuorella 20 %, muualla 10 %, syntyy lähelle ja hyökkää. Nukkuessa ei synny. Jos pelaaja ei nuku yöllä,
   seuraavana yönä 100 % varmasti yksi. Nopeus (4,6+8)/2 × 1,05 ≈ 6,6 m/s. Tavallisia yömobeja enemmän.
13. TEHTY v1.33. Hautakiven majakka toimii myös ulottuvuuksissa/luolissa.
14. TEHTY v1.33. Mobit lyövät kävellessä (ei pysähdystä, ei latausviivettä; 0,1 s viive), lyöntien välillä jäähy. Tavallisten mobien ulottuma ~20 %
   pelaajaa lyhyempi (~1,9 m). Karhu, kivivartija, pelottavat ja pomot pitävät oman ulottumansa.
15. TEHTY v1.37. Jousen veto: oikea käsi vetää enemmän oikealle, kyynärpää taittuu, olkavarsi pysyy oikealla hieman edessä samalla korkeudella.
16. TEHTY v1.35. Varjot = Grafiikka-sivun väliotsikko (ei erillistä sivua).
17. TEHTY v1.35. Esiasetukset liukusäätimellä: Low, Low+, Medium-, Medium, Medium+, High, High+, Ultra (oletus Medium). Säätö käsin → "Custom".
   Ultra ylittää nykyiset maksimit (varjot 4096, piirtoetäisyys +30 %, tiheämpi ruoho). Low–Medium: autosäätö päälle, High–Ultra: pois.
18. TEHTY v1.35. Asetukset tulevat voimaan heti valittaessa.
19. TEHTY v1.35. Asetusprofiilit omalla nimellä – tallentaa KAIKKI asetukset (myös ohjaus, äänet, näppäimet).
20. TEHTY v1.36. Päävalikko: tallennuslista, enintään 5 paikkaa. Uusi maailma (nimi + kartta) tai jatka valittua. Näkyy viimeksi pelattu, päivät, taso,
   nimi. Uudelleennimeä, poista vahvistuksella. Vanha tallennus → "Maailma 1".
21. TEHTY v1.35–v1.36. Automaattitallennus 2 min välein, valikosta voi tallentaa itse.
22. TEHTY v1.36. Hiiren lukitus pysyy päällä paneelien ajan, peli piirtää oman osoittimen (ei välikliksua). Esc-taukovalikko vaatii yhä klikkauksen (selain).
23/31. TEHTY v1.37. Kirves- ja hakkuanimaatio uusiksi: kädet koukistuvat noustessa, kirves olkapäiden yli, vuorotellen kumpaankin viistoon, kädet kiinni
   varressa ja olkapäissä, ei mene pään tai kehon läpi, kädet eivät mene päällekkäin.
23b. TEHTY v1.37. Kuolema: ruumis kaatuu, raajat valahtavat, makaa ~7 s, vajoaa ja häipyy (alle 10 s); veriläntti. Pelaajan läntti jää 1 min.
   Palokuolema (palaa, soihtu-isku, nuotion päällä, tulinuoli) mobille, pelaajalle ja pomoille: mustuu → tuhkakasa vajoaa maahan.
24. TEHTY v1.37. Osuma: veripisaroita (tummanpunainen, maltillinen; isoilla eläimillä enemmän) ja läntti maahan, häipyy 10 s. Haavoittuneen mobin
   pintaan punaisia läikkiä. Kivihahmot: kivisiruja/pölyä, kalmot: luupölyä, usvaolennot: usvaa. Asetus Veri: Normaali / Vähän / Pois.
25. TEHTY v1.34–v1.35. Maassa olevat esineet näyttävät ikonilta, jolla on syvyyttä (3D). Medium ja ylöspäin + oma asetus.
26. TEHTY v1.32. Pelaajan pudotus heittää 2× kauemmas ja aina eteenpäin.
27. TEHTY v1.35. Lumisade kulkee tuulen suuntaan, kulma tuulen nopeuden mukaan.
28. TEHTY v1.33. Pelaajan taistelu −10 % kaikessa (vahinko, ampumanopeus/lyöntinopeus, tönäisy).
29. TEHTY v1.32. Nuolet otetaan käyttöön painamalla niiden pikapaikan numeroa; käytössä pysyy (kuten kilpi).
30. TEHTY v1.32. Haarniska, vaate, nuolet (ja kilpi): yksi klikkaus repussa ottaa käyttöön (keltainen). Jos seuraava klikkaus on toiseen ruutuun,
   esine siirtyy ja käyttöönotto perutaan.
32. TEHTY v1.32. Käsien heilunta kävellessä/juostessa −10 %. Sivuttaiskeinunta: kävely puolet, juoksu −10 %.
33. TEHTY v1.37. DEV-valikko: lento. Tuplahyppy aloittaa/lopettaa lennon, välilyönti ylös, Shift alas.
34. TEHTY v1.33. Sateessa tulinuolen valo hiipuu 2× nopeammin. Osuessa kohteeseen tai maahan nuolen valo sammuu 2 s:ssa (palavan mobin valo ei).
35. TEHTY v1.35. Usva/sumu: oletus kevyemmäksi. Tasot: Ultra (= vanha Korkea), Korkea (= vanha Normaali), Normaali (uusi, kevyempi, oletus),
   Matala, Pois.

36. TEHTY v1.37. Palavan mobin tuli näyttävämmäksi, savua paljon enemmän (isoja partikkeleita, kohtuudella).
37. TEHTY v1.37. Selässä olevat esineet asettuvat hyvin: pitkä osa sivuille (hakun piikit sivuille). Kirves/nuija viistossa, terä/pää ylös olan
   taakse. Jousi ja keihäs ristiin viistoon. Miekka ja lapio viistossa terä alaspäin. Vasara vyötärötasolla kuten ennen.
   Vyötärön takana oleva pallomainen osa kiinni vyötäröön ja paremman näköiseksi (pussi/laukku).
   Ei enää kysymyksiä – tehdään loppuun.

38. TEHTY v1.34. Jääavain arvotaan maailman luonnissa satunnaiseen pääsaaren arkkuun (rauniot, linnakkeet, kiviröykkiöt) tai Hautakummun
   hautakirstuun. Myös muiden kohdearkkujen tavalliset tavarat arvotaan maailmakohtaisesti. Portti antaa epämääräisen vihjeen (suunta).
39. TEHTY v1.34. Arvoesineet hehkuvat maassa (esineen värinen sykkivä valo + kipinät, näkyy yöllä kauas).

40. TEHTY v1.34. Riimukivien vihjeet päivitetään nykyiseen etenemiseen (ulottuvuudet → sirpaleet → vartija). Kartalle 2 kylttiä, joiden
   teksti (luetaan läheltä) antaa hyvin kryptisen vihjeen jonkin asian sijainnista (esim. jääavain, kiviröykkiö).

41. TEHTY v1.37. Ulottuvuusportteja koristellaan enemmän (riimut, soihtukulhot, kivipaasit, hehku).

### Päivityslista 2: 17 kohtaa (v1.08–) – yksi kohta kerrallaan, 1–5 tarkentavaa kysymystä per kohta
**JATKA TÄSTÄ (nykytila v1.31):** Haara `claude/hiidenmaa-survival-game-fmxt0m`, PR #24 auki (ei vielä yhdistetty; main = v1.07).
Lista 2 (17 kohtaa) + välilisäykset TEHTY v1.08–v1.23. Sen jälkeen: v1.24 korjaus (karttavaihdon käynnistys, KORJAUKSET 22),
v1.25 valikon animoidut kuvat, v1.26 käynnistysvahti (virheet ruudulle), v1.27 valikko väliaikaisesti vanhaksi, v1.28 WebGL-varmistus
(käyttäjän ongelma oli selaimen estämä WebGL → ratkesi selaimen uudelleenkäynnistyksellä, KORJAUKSET 24), v1.29 valikko palautettu,
v1.30 oikea napsautus ottaa puolet + vihje 3 s, v1.31 Q hiiren alla pudottaa, tönäisyarvot (10 = 5 m) + kyvyttömyys lennon ajan,
kivivartija 220 hp / 2,8 m, valikon kuva aina arvottu, itse pudotettu ei imeydy heti takaisin.
Ei avoimia ongelmia. Seuraavaksi: odotetaan käyttäjän testiä ja Mergeä, sitten uusi lista. Testaa aina commit-linkillä (välimuisti).
1. TEHTY v1.08 (muutettu: ei hiireen tarttumista) – valinta selkeämmäksi (sykkivä reunus, haamukuvake, kohdevihje, ohje), oikea = puolet, raahaus, myös arkut.
2. TEHTY v1.09. Vartijat palaavat alueelleen kävellen (1 %/s parannus); pelaaja alle 8 m keskeyttää; uusi ajastin kun pelaaja kauempana.
3. TEHTY v1.10. Höyrypuhurit + sisäkiehkurat: Normaali = puolet haituvista isompina/tiheämpinä; Korkea = entinen; Matala; Pois.
4. TEHTY v1.11 (tarkennettu): asetuksissa luki "kuten Minecraftissa" → poistettu. Pelin teksteissä ei mainita muita pelejä.
5. TEHTY v1.14. "Toimii parhaiten…" ruudun yläkeskelle, kerran per käynnistys 6 s, häipyy.
6. TEHTY v1.15. Valikon tausta: luonto, järvi, leiri päivällä/yöllä, eläimet lähikuvina; 20 s, vaihto mustan kautta.
7. TEHTY v1.16. Ehdotukset: "Voit valmistaa nyt" + "Hyödyllistä seuraavaksi", järjestys uudet → toistuvat → ei mukana → välituotteet.
8. TEHTY v1.18. T kiertää tehtävän/tavoitteen näkyvyyttä (4 tilaa), piilotettuna pieni vihje; loki T → L.
9. TEHTY v1.19. Taipuminen (myrsky ~15°), myrskyn kaato 70 % myötätuuleen, kaikki kaatuvat puut osuvat (80 %, ei suojaa), karhu ei itseensä.
10. TEHTY v1.20. Ohuet liikkuvat pilvet avatulla alueella (20 %).
11. TEHTY v1.20. Pehmeä varjo karttateksteille.
12. TEHTY v1.20. Terveys 60 → 100 portaittain tasoilla 2–5, lisäys heti.
13. TEHTY v1.21. 100 hp / rivi, enint. 5 riviä, > 500 hp toinen värikerros; nimi + kallot rivien yllä.
14. TEHTY v1.22. Ampuja-asento: jousi keskellä edessä, jänne posken oikealle puolelle, levossa heiluu käden mukana.
15. TEHTY v1.23. Nuolten tiedot, sulitettu +25 %/−40 % pudotus, tulinuoli = tavallinen + sytyttää (+ valoasetus), palava mob tulisempi + valo.
16. TEHTY v1.23. Hiidenjousi nopeampi veto/lento/tarkkuus, ★ tarkkuus, aseiden kestävyyskulutus materiaalin mukaan, kilpien torjuntakulutus.
17. TEHTY v1.23. Tähtäysympyrä = hajonta (enint. ~10°), keltainen → punainen, täysi veto pieni + piste ja suora nuoli.

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
