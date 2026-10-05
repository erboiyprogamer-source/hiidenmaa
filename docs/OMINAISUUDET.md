# Hiidenmaa – ominaisuudet ja fysiikat (v0.64)

Tämä on pelin nykytilan **viiteopas**: mitä pelissä on ja miten se toimii (säännöt, arvot, fysiikka).
Versiohistoria, päätösten taustat ja ideajono ovat `KEHITYSMUISTIO.md`:ssä. Päivitä tämä tiedosto aina,
kun ominaisuus tai arvo muuttuu (tiedosto ja funktio suluissa, jotta kohta löytyy koodista).

---

## 1. Maailma

- **Vihollisten syntyminen (v0.83):** yöllä 90 % 55–85 m päähän (vaeltavat), 10 % 20–30 m päähän puun/kiven taakse; aarnimetsä vetää
  vihollisia (yöllä tahti 1,5 s, raja 18). Päivällä enintään 2 vihollista (aarnimetsässä 3) ja vain korpimetsässä, suolla, kankaalla,
  nummella ja aarnimetsässä. Aarnimetsässä viholliset +20 % nopeampia, ilmoitus alueelle astuessa.
- **Biomit (`biomeAt`/`zoneAt`/`BIOMES`, world.js, v0.82):** Rantaniitty (aloitus), Koivulehto, Korpimetsä, Upposuo (liike −15 %, lätäköt),
  Jäkäläkangas (männyt, piikivi), Aarnimetsä, Kalmanummi, Tunturikangas, Rakka (lohkareet, kupari), Kivivuori, Routahuiput (> 33 m),
  Hietaranta. Nimi näkyy minikartan alla, ominaisuudet repussa. Ensimmäisellä käynnillä "Uusi alue löydetty: …" (häivytys), `flags.bio`.
- **Kartat (`MAPS`, world.js):** 6 karttaa – Hiidenmaa, Kalmansaaret (saaristo), Tunturinniemi (iso vuoristo), Routasaari (vuoristo idässä,
  laajat tunturit), Aarnikorpi (neljä aarnimetsää), Nummiluodot (iso keskijärvi, laaja nummi). Uusi peli arpoo kartan; vaihto lataa sivun.
- **Koko:** noin ±350 m (`HALF`), korkeusruudukko 2 m (`GS`), skaala `WS` = 1,75. Reunat laskevat mereen.
- **Biomit (`biomeAt`):** meri, ranta, niitty, metsä, aarnimetsä (sumuinen, pimeä, 14–22 m puut), vuori (yli `mtnH` 23 m, lumi yli 33 m),
  kalmanummi. Kartoittain säädettävä: `moorR` (nummen säde), `mtnH` (vuoriraja), `meadowT` (niittyjen osuus).
- **Kiinteät paikat (`LOC`):** aloitusranta, 3 raunioita arkkuineen, 3 riimukiveä, Hautakumpu, Kalmankehä.
- **Arvotut paikat (`SITE_DEFS`):** 3 portaalia, 4 rauniotaloa, 3 arkkukiveä, 6 lisäriimukiveä. Sama siemen → samat paikat samalla kartalla;
  maasto tasoitetaan (`flatten`). Metsä väistää kaikkia paikkoja 20 m (riimukivet 4 m).
- **Etäisyydet ja suunnat lasketaan** (`dirIn`, `dirText`): tarinateksteissä ei ole kiinteitä ilmansuuntia (pohjoinen = −z).

## 2. Pelaaja ja liikkumisen fysiikka (player.js)

| Asia | Arvo |
| --- | --- |
| Pituus / säde / askelnousu `STEPUP` | 1,8 m / 0,38 m / 0,55 m |
| Kävely / juoksu / kyykky / torjunta tai jousen veto | 4,6 / 8 / 2,3 / 2,4 m/s |
| Isku käynnissä | nopeus × 0,45 |
| Ylikuormitus (paino > `MAXW` 160) | nopeus × 0,55, ei juoksua eikä hyppyä |
| Uinti (vesi alle −1,3 m) | 2,6 m/s, kestävyys −6/s liikkuessa (−2/s paikallaan), tyhjällä kestävyydellä −4 hp/s |
| Hyppy | pystynopeus 7,2 m/s, maksaa 8 kestävyyttä |
| Painovoima | 22 m/s² |
| Putoamisvahinko | kun alastulonopeus > 15 m/s: (nopeus − 15) × 6 hp |
| Tikkaat | ylös/alas 2,6 m/s (eteen/hyppy = ylös, taakse = alas) |
| Kiihtyvyys | maassa nopea (×12), ilmassa hidas (×3) |

- **Törmäys (collision.js):** laatikot ja ympyrät ruudukossa (`CELL` 8 m). Alle `STEPUP`-korkuiset esteet ylitetään askeltamalla.
  Katto pysäyttää hypyn (`ceilingAt`).
- **Kestävyys:** palautuu 22/s viiveen jälkeen; juoksu −13/s.
- **Kamera:** kolmas persoona, pehmeä liike, ei mene seinien tai maaston läpi; zoom hiiren rullalla (tai asetuksista).
- **Hahmo:** low-poly, kyynär- ja polvinivelet, kääntymisviive iskun alussa, kyykky polvet koukussa ja vaanimisasennossa,
  selässä yksi työkalu + kilpi (`backG`), kilven torjunta osoittaa eteenpäin.

## 3. Selviytyminen (environment.js `survival`, `calcFx`)

- **Nälkä:** 100 → 0 noin 1000 s:ssa; kylmässä × 1,3, iskiessä/juostessa × 1,15. Terveys palautuu 0,35/s (nälkä > 35), 0,15/s (> 0),
  levänneenä + 0,6/s.
- **Syöminen:** ruoka lisää kylläisyyttä ja terveyttä (`heal` 3/s). **Ähky (vatsakipu) vain, jos kylläisyys on jo ≥ 99 ja syö silti**
  (52 s: kävely −10 %, kestävyys hitaammin, kramppi vie 12 kestävyyttä 8–14 s välein). Raaka liha: 45 % pahoinvointi (40 s).
- **Tilat** (repun Tilat-osio, hiirellä lisätiedot ja ajastin): märkä (60 s, kuivuu 5× nopeammin tulella), kylmä (−7 % nopeus, −10 % isku,
  −40 % kestävyyden palautus), nälkä / nälkäinen, pahoinvointi, vatsakipu, ylikuormitus, levännyt (12 s tulen ja katon alla →
  360 s, kestävyys +45 %), voimistunut, lämmin, suojassa, hiipii.
- **Kylmä tulee:** märkänä, lumisateessa vuorilla tai yöllä ulkona ilman lämpimiä vaatteita, ellei tulen lähellä.
- **Lepo ja uni:** sänky asettaa herätyspaikan; nukkuminen vaatii yön, katon eikä vihollisia 20 m sisällä → seuraava aamu, levännyt.
- **Kuoleman ruutu (Kaaduit):** kaikki valikot ja päävalikko sulkeutuvat, kursori näkyy, herätys napista tai Enterillä.
- **Kuolema:** koko reppu jää hautakasaan (valomajakka lähellä, pääkallo kartalla), herätys sängyltä tai rannalta. Kasaa ei voi poimia,
  ellei kaikki mahdu reppuun.

## 4. Keräily, puut ja maasto

- **Solmut (resources.js `NODE`):** puut (kuusi, koivu, kelo, aarnipuu), kivet (lohkare, kupari- ja rautasuoni), poimittavat (oksa, kivi,
  piikivi, marjat, sieni), koristeet (pensas). Piirretään ruuduittain instansseina (`CHUNK_IMS`).
- **Puun koko** `s` 0,6–2,0 (pienet yleisimpiä); kestävyys ∝ s², saalis ∝ s. Isompi puu kaatuu hitaammin (alku hidas, k^2,6).
- **Kaatuminen (state.js `fallTree`):** oksat irtoavat kaatumisen aikana (30–90 % kohdalla) ja loput maahan osuessa, vajoavat maahan.
  Koivun oksat näkyvät jo pystypuussa (`TREE_BR`, sama asettelu). Lähellä kaatuva puu tärähdyttää ruutua; alle jäävä menettää 80 % terveydestä.
- **Pieni puu (s < 0,8) muuttuu suoraan tavaroiksi**; isompi jättää 1–2 tukkia, joita hakataan (lohkeamat, puupartikkelit) → puuta.
- **Uusiutuminen:** kaadetut puut kasvavat takaisin **kerran yössä** pelaajan **100 m** säteellä (`nightRegrow`), enintään 5 m alkuperäisestä
  paikasta, samaan biomiin. Muut solmut uusiutuvat ajan kuluttua (> 40 m pelaajasta). Marjat ja kasvit uusiutuvat nukkuessa.
- **Rakennusalue on suojattu:** ei kasvua 15 m:n säteelle mistään pelaajan rakennusosasta eikä työpenkin alueelle + 30 % (26 m) (`nearBase`).
- **Myrsky kaataa puun noin 5 s välein** 9–100 m päässä (ei aarnipuita eikä rakennusalueelta).
- **Työkalutasot:** kirves/hakku taso 1–3 (piikivi/kivi, kupari, rauta); aarnipuu vaatii tason 3, rautasuoni tason 2.
- **Maanmuokkaus:** lapio tasoittaa ja tekee maasta multaisen (polut), kuokka nostaa maata ja palauttaa alkuperäisen (`TERRA`, `MUD`, tallentuu).
- **Esineet maassa** katoavat 5 min jälkeen; maahan pudonneita ei tallenneta.

## 5. Valmistus ja esineet (items.js)

- **48 esinettä, 27 valmistusohjetta.** Työpisteet: työpenkki, ahjo, nuotio/grilli, sulatusuuni. Ohjeilla tasovaatimus (`lvl`).
- **Aseet:** puunuija, kivikirves, piikivikeihäs, kupari-/rautamiekka, kupari-/rautakirves, kupari-/rautahakku, hiidenmiekka (harvinainen).
  Jouset: metsästysjousi, hiidenjousi. Kilvet: puu, kupari, rauta. Panssarit: nahka, kupari, rauta, hiiden.
- **Laatu (★1–3):** kehittäminen parantaa vahinkoa, nopeutta ja jousen vetoa; käsisoihdun palamisaika +50 % per taso.
- **Löydetyt arkut ja tynnyrit:** avautuvat arkkuikkunaan kuten omat arkut; sisältö pysyy (`flags.fc`), esineitä voi ottaa ja jättää.
- **Repun käyttö:** napsautus valitsee, toinen napsautus siirtää/vaihtaa paikat, oikea puolittaa pinon, kaksoisnapsautus käyttää,
  Q pudottaa yhden, Shift+Q kaikki. Arkuissa napsautus–napsautus siirtää, Shift+napsautus siirtää heti. E sulkee valikot.
- **Ehdotukset ja haku:** valmistuksen ja rakennusvalikon oletusvälilehti *Ehdotukset* näyttää syineen ne, joihin aineet ovat valmiina,
  puuttuvat tai paremmat varusteet ja pelin vaiheeseen sopivat rakennukset (työpenkki → nuotio → sänky → suoja → sulatin/ahjo).
  Hakukenttä hakee kaikista välilehdistä nimen osalla.
- **Tietopaneeli (reppu, napsautus):** nimi isolla, kaikki ominaisuudet taulukkona (esim. soihtu: palamisaika max ja jäljellä).
- **Päivitykset (★, reppu, arkku, tynnyri):** ensimmäinen painallus näyttää mitä muuttuu (nyt → uusi) ja hinnan; vasta **Päivitä nyt** päivittää.
- **Tuli:** palava käsisoihtu sytyttää lyödyn, tulinuoli osumansa: 5–10 s, 5 hp/s; sade tai vesi sammuttaa heti.
- **Ammukset:** piikivinuolet ja tulinuolet (+ pihka). Oletuksena käytetään heikointa ensin (`AMMO`-järjestys); repusta voi valita ammuksen
  ("Käytä ammuksena"), uusi painallus palauttaa automaattiseen.
- **Hiipiminen (kyykky):** paikallaan eläimet eivät huomaa; liikkuessa 1,5 m (eläin katsoo kohti) / 0,9 m (selin). Kävely 7 m, juoksu 16 m, ase ×1,4.
- **Kahden käden ote:** kirveellä vasen käsi tarttuu varteen (IK `armIK` napavektorilla, kyynärpää alas-ulos); jousen vedossa vetokäsi on jänteellä.
- **Lyönnit:** nosto pään/olan yli → isku viistosti alas vartalon eteen → loppuliike edessä; vuorottelevat suunnat. Kädet eivät mene vartalon läpi (`armClear`).
- **Selässä kannettavat:** kilpi ja jousi selässä, yksi muu työkalu/ase selässä; vasara roikkuu vyöllä takana (heiluu kävellessä).
- **Jousi:** täysi veto 1,6 s (laatu 2: 1,3 s, laatu 3: 1,07 s); vajaa veto = vähemmän vahinkoa, hitaampi nuoli, jyrkempi kaari.
- **Reppu:** 32 paikkaa, kehitys +8 paikkaa / +40 painoa (2 tasoa). Arkku 16→24→32, tynnyri 10→16→22.
- **Avaimet:** Jääavain, Luuavain, Aarniavain (ulottuvuuksien portit).

## 6. Rakentaminen (pieces.js, building.js)

- **Mitat:** ruudukko `G` 2,5 m, seinä `WH` 2,6 m, oviaukko 1,7 × 2,3 m, portaiden askelma alle `STEPUP`.
- **Työpenkki** tekee 20 m rakennusalueen (`BENCH_R`, oranssi raja näkyy vasara kädessä). Nuotio ja työpenkki eivät tarvitse aluetta.
- **Osat (58):** lattiat, seinät (täysi, ikkuna, puoli/neljännes pysty/vaaka, vino, päätykolmio), ovet, katot (olki, loiva, harja + kiviversiot),
  palkit, pylväät (ohut, lyhyt, pitkä), raput, portaat, tikkaat, paaluaita, seisova soihtu, työpisteet, sänky, arkku, tynnyri; kiviversiot.
- **Kohdistustilat (G):** ruudukko (2,5 m), **1 m**, puoli (1,25 m), **3D** (vaaka- + pystyruudukko, korkeus WH/4 portain), vapaa (0,25 m),
  reuna. Ruudukkotiloissa kaikki osat kohdistuvat: lattiat ruutujen keskelle, seinät reunoille, **pylväät kulmiin, muut ruudun keskelle**.
- **3D-tila:** näkyvä 3D-hila haamun ympärillä (pystytolpat ruudukon kulmissa, vaakaruudukot WH/2 välein kahteen kerrokseen).
- **Pystykohdistus (H):** auto, pysty (Q/Z nostaa/laskee), 3D (seuraava kerros näkyy).
- **Reunakohdistus (`smartSnap`, kaikki G-tilat paitsi vapaa, kaikki osat):** kohteen muoto = törmäyslaatikoiden rajaus.
  - Yläpinta tai sivun ylin kaista (30 % korkeudesta, 0,12–0,5 m) → **päälle**: keskelle, reunalle tai kulmaan (sivulta: katsottu sivu +
    vasen/oikea yläkulma). Esim. pylvään yläkulma → lattia/palkki/pylväs pylvään yläpuolelle katsottuun suuntaan.
  - Seinän/palkin pääty tai sivun uloin 15 % → jatko samaan linjaan. Sivun keski → viereen (vain reuna-tilassa).
  - Kokosäännöt (ohut < 0,4 m): ohut+ohut keskitetty, ohut kohde → osan reuna kohteen keskilinjalle, ohut osa → kohteen reunalle/kulmaan,
    muuten reunat tasan. Lattia/katto ohuen kohteen päällä seuraa ruudukkoa: ruudukkoviivalla oleva pylväs → katsottu ruutu.
  - Seinä/palkki kääntyy katsotun reunan suuntaiseksi (seinän päällä samaan suuntaan). Ruudukkotiloissa lattian yläpinta ja sivujen
    keskiosat kohdistuvat tavalliseen ruudukkoon. Ei vinoille (45°) kohteille, katoille, portaille eikä tikkaille.
- **Kääntö:** R = 45°, Shift+R = asento (kolmiot/vinoseinät 4 asentoa, palkit 5 kulmaa, portaat 3 jyrkkyyttä).
- **Rakennusnäppäimet** (R, Shift+R, G, H, Q, Z) toimivat ja ilmoittavat vain rakennustilassa: vasara kädessä ja osa valittuna (`isBuilding`).
- **Säännöt (`validPlace`):** sama osa samaan paikkaan kielletty, ei liian syvälle veteen, katto ei pelaajan päälle, maksu repusta.
- **Kunto:** 3 vauriotasoa näkyvät tekstuurissa; vasara: X purkaa (materiaalit takaisin), F korjaa. Paaluaita kestää mobit (piikit vahingoittavat).
- **Ovet:** kaksipuoliset, aukeavat pelaajasta poispäin. Katoilla voi kävellä.
- **Sade ja valo** eivät tule katon läpi (`roofTopAt`, `indoorK`).

## 7. Tuli ja valo

- **Nuotio/grilli:** polttoaine ≤ 40 yksikköä (`FUEL_MAX`), puu = 1 yksikkö = 90 s, hiili = 10 yksikköä. Lisäys vain kun alle 50 %.
  Grilli kypsentää 4 ruokaa kerrallaan (oma ajastin 9–14 s); 2× ajalla ruoka palaa hiileksi.
- **Seisova soihtu:** puu 10 min, hiili 30 min. Lyöminen sammuttaa tulen.
- **Käsisoihtu:** palaa **120 s** (★2 180 s, ★3 240 s; juostessa 20 % nopeammin), pihka lisää 60 s; sade ja vesi sammuttavat; sytytys toisen liekin vieressä 2,5 s.
- **Valot:** enintään 6 lähintä valonlähdettä kerralla (asetus), yhteisvalon katto (`LIGHT_CAP`), elävä välke.
- **Varjot:** aurinko/kuu (varjokartta 2048, alue 55 m); lähimmän tulen varjot pimeällä (päivitys tiheä pelaajan ollessa 17 m sisällä, kerran
  poistuttaessa); käsisoihdun pieni varjo pimeällä.

## 8. Taistelu (actions.js)

- **Isku:** kestävyys aseen `st`, kesto `spd`; nyrkki 3 vahinkoa. Vahinkotyypit: viilto, murskaus, pisto, tuli – viholliset heikkoja/vahvoja.
- **Hiiviskelyisku:** kyykyssä huomaamattomaan viholliseen × 2.
- **Torjunta (hiiren oikea, kilpi):** vain edestä, kestävyys = 90 % iskusta, vähennys kilven `block` (max 95 %); kestävyyden loppuessa torjunta murtuu.
- **Panssari:** vahinko × 20 / (20 + panssari). Iskun jälkeen 0,25 s suoja.
- **Keihäs** osoittaa kohdetta, kirves lyö viistosti vuorotellen.

- **Pomojen terveys:** isot pomot eivät parane; ulottuvuuspomon ja vartijan terveys säilyy poistuttaessa. Alttarin hiidenkivet jäävät
  alttarille, jos vartija vajoaa takaisin – uusi herätys ilman uusia kiviä.

## 9. Viholliset ja eläimet (mobs.js, ai.js)

- **Nopeudet −15 %** (`MOB_SPD` 0,85 kaikessa liikkeessä).
- **Terveyspalkit:** mobin yläpuolella (mallin korkeus + 0,45 m), nimi ja pääkallot palkin yllä; näkyy kun katse osuu mobiin (~11°, vahvat ~9°)
  alle 12 m (vahvat 70 m) tai 10 s osuman jälkeen. Pomoilla oma palkki ruudun yläreunassa.
- **Eläinmallit:** `makeAnimal` (nivelletyt jalat – nivel rungon sisällä, lapa/reisi kylkeen; kaula rinnasta pään tyveen, kuono, korvat, häntä; peuran sarvet, karjun harjas ja torahampaat, suden kaulus, routasuden jääpiikit).
- **Eläimet** (peura, villikarju): säikähtävät kävellen 7 m, juosten 16 m, ase kädessä × 1,4, kyykyssä paikallaan ei lainkaan, hiipiessä 1,5 m (kohti) / 0,9 m (selin); lyöty pelkää 10 s.
- **Viholliset** (sammalhiisi, harmaasusi, kalmo, ylimys, kivivartija, routasusi): tarvitsevat näköyhteyden; huomaavat pelaajan aina 10 s
  vahingon jälkeen (myös jousella); kyykky puolittaa huomausetäisyyden, yö × 1,35. Ilman näköyhteyttä 3 s → luopuvat.
- **Tulen pelko:** nuotio 7 m, seisova soihtu 5 m, käsisoihtu 6 m (ei luolastossa) – kaikki paitsi ylimys ja pomot.
- **Piiritys:** seinän takana vihollinen hakee lähimmän oven/ikkunan ja hajottaa sen (2× vahinko).
- **Terveyspalkit:** näkyvät lyödyllä tai lähellä katsottaessa; pääkallot kertovat vaikeuden; vaikeat (≥ 3 kalloa) näkyvät kaukaa ja
  parantuvat 30 s iskuttomuuden jälkeen.
- **Spawneri (`spawner`):** 2,5 s välein 38–68 m päähän biomin taulukosta (`SPAWN`), katto 10 (yö 14); ei rakennusten, löytöpaikkojen
  (50 m) eikä aloitusrannan lähelle päivällä.
- **Vartijat (`GUARDS`):** löytöpaikkojen ja portaalien vartijat syntyvät < 75 m, pysyvät paikallaan (palaavat 15–16 m jälkeen), kaatuminen tallentuu.

## 10. Pomot

- **Kalmanvartija (Kalmankehä):** herätetään 3 hiidenkivellä alttarilla; vaihe 2 alle 50 % (kalmot maasta); palaa maahan > 90 m päässä
  (kivet jäävät alttarille). Kaatuminen = voitto.
- **Ulottuvuuksien pomot** (Jäätär, Kalmaherra, Aarnihirviö, `realmBossAI`): nukkuvat kunnes < 17 m; vaiheet 100–66 / 66–33 / 33–0 %
  (nopeampi). Iskut: pyyhkäisy, maahanlyönti, rynnäkkö, kiven heitto, nova (vaihe 3, väistä hyppäämällä), kutsu (apulaiset, max 4).
  Pudottavat raudan, kuparin, hiidenkiven ja seuraavan avaimen (suoraan reppuun).

## 11. Hautakumpu ja ulottuvuudet (landmarks.js, dungeons.js)

- **Hautakumpu:** kiinteä luolasto (`DMAP`), 3 hautakirstua (hiidenkivet), kalmot ja ylimys, seinäsoihdut, luut, tippukivet, tynnyrit.
- **Ulottuvuudet:** Routaluola (sokkelo), Kalmankammio (huoneet), Aarnihauta (luola, kivimöhkäleseinät, epätasainen lattia 0–0,45 m).
  Pohja arvotaan ensimmäisellä käynnillä (`flags.rs`), rakennetaan vasta sisään astuessa ja piirretään vain siellä ollessa.
  Katto 7,6 m. Sisältö: soihdut telineissä, luut, tippukivet + pisarat, lätäköt, usva ja höyry, arkut ja tynnyrit, Kalmanpesä-spawneri
  (3 vihollista 20 s välein, kun edelliset kuolleet ja pelaaja < 26 m). **Kalmanpesän voi murskata hakulla** (kestävyys 240, isku =
  louhintateho, kivihakulla 20 iskua) → rauniot, saalista ja 40 XP; tuhottu pesä pysyy tuhottuna (`flags.sd`).
- **Etenemisketju:** Jääavain maailmasta → Routaluola → Luuavain → Kalmankammio → Aarniavain → Aarnihauta. Varmistus: portti aukeaa
  ilman avainta, jos lähde on jo käyty tai ulottuvuudessa on käyty.
- **Portaalisuoja:** 3,2 s siirtymän jälkeen viholliset eivät voi vahingoittaa eivätkä aloita jahtia; viholliset ≥ 10 ruudun päässä sisäänkäynnistä.

## 12. Löytöpaikat, tarina ja eteneminen

- **Rauniotalot ja arkkukivet** arkkuineen ja vartijoineen; löytyvät kartalle 30 m päästä.
- **Riimukivet:** 3 kiinteää + 6 arvottua; vihjeet laskevat suunnan ja etäisyyden ja merkitsevät paikkoja karttaan.
- **Karttapilvet:** kartta paljastuu kulkiessa (`explored`); löydetty paikka näkyy vain paljastetulla alueella. DEV-valikossa (Ä) voi paljastaa koko kartan ja kaikki kohteet.
- **Tehtäväketju (`QUESTS`, 13 kpl):** näkyy oikeassa yläkulmassa suunnan ja etäisyyden kanssa; +60 XP.
- **Tavoitteet (`GOALS`), saavutukset (`ACH`, pysyvät bonukset), taso ja XP** (J-paneeli); reseptejä aukeaa tasoilla.

## 13. Sää, vuorokausi ja taivas (environment.js)

- **Vuorokausi** 720 s (yö kun `dayT` < 0,21 tai > 0,79), pehmeä hämärä, kuu vaiheineen, tähdet.
- **Sää:** selkeä, pilvinen, tuulinen, tihku, sade, myrsky (salamat, puiden kaatuminen), lumisade (vuorilla), sumu.
- **Pilvet** isoina kerroksina sään mukaan, kaukana häipyvät; pilvikansi rankassa säässä; salaman välähdys kevyt.
- **Aurinko:** pyöreä hehku (`sunGlow`), säteet selkeällä säällä (häipyvät aurinkoon katsottaessa).
- **Aarnimetsässä** tiheä sumu ja pimeämpi valo.

## 14. Kartta (ui.js)

- **Iso kartta (M):** paljastettu alue 12 m säteellä (pehmeä), tutkimaton pilviverhon takana (liikkuvat kumpupilvet vain kartta auki),
  zoom rullalla, raahaus, rakennukset ylhäältä pikseleinä. **Merkit näkyvät vain paljastetulla alueella.**
- **Minikartta:** 3 zoomia (60 / 35 / 110 m, N tai napsautus), taso näkyy alareunassa.
- **Ilmoitukset:** näkyvät pituuden mukaan pidempään, piiloon valikoissa; T näyttää 10 viimeisintä.

## 15. Asetukset ja näppäimet (settings.js)

- **Näppäimet** vaihdettavissa vahvistuksella (ei varattuja eikä päällekkäisiä); oletus mm. WASD, Shift juoksu, Välilyönti hyppy, C kyykky,
  E käytä, B rakennus, R/G/H/Q/Z/X/F rakentaminen, Tab reppu, M kartta, J taso, T ilmoitukset, K koko näyttö, N minikartan zoom.
- **Grafiikka:** 3D-resoluutio, automaattinen laatu, piirtoetäisyys 60–400 m, yksityiskohdat, rakennusten yksityiskohdat, hiukkaset,
  valonlähteiden määrä, usva ja höyry, pilvet, valonsäteet, puiden heiluminen.
- **Varjot:** laatu, auringon varjojen tarkkuus ja etäisyys, päivitystiheys, tulien varjot ja niiden tarkkuus.
- **Äänet:** proseduraaliset (`sfx`), sävelkorkeus vaihtelee ±3,5 % joka soitolla. Puun ja tukin iskut ovat sama kirveenisku; viimeinen isku
  lähes sama (pystypuu: hiljainen ritinä, tukki: pehmeä tumma tömähdys), kaatunut puu tömähtää tummasti. Tömähdyksen sävel puun koon ja
  voimakkuus etäisyyden mukaan; omat äänet kiven hajoamiselle ja rakenteiden murtumiselle.
- **Ohjaus ja ääni:** rulla pikapaikoille, kameran etäisyys, äänet, käänteinen pystyhiiri. Oletukset merkitty, sivukohtainen palautus.
- **Piirtoetäisyys karsii:** maisema sumuun, puut ruuduittain, rakennukset, viholliset (ei animointia), staattiset kohteet, ulottuvuudet.

## 16. Tallennus (save.js)

- `localStorage` (`hiidenmaa_save_v1`, automaattisesti 90 s välein), pakattu tallennuskoodi (`HM2:`) ja .txt-tiedosto.
- Tallentuu: pelaaja, reppu, rakennukset, maanmuokkaukset, kaadetut ja siirtyneet puut, haudat, liput (`flags`: tarina, löydöt, avaimet,
  ulottuvuuksien siemenet, kaatuneet pomot, avatut arkut). Ei tallennu: maassa olevat esineet, kaukaiset viholliset.
