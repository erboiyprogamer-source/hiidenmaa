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
- **Enimmäisterveys (v1.20):** 60 tasolla 1, +10 per taso tasoille 2–5 (taso 5: 100), lisäksi saavutukset ja voima; tason nousu lisää terveyttä heti.

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
- **Päävalikon tausta (v1.25):** oletuksena 10 animoitua kuvaa (ei 3D-piirtoa valikossa); kuva arvotaan aina (v1.31, myös sivun avauksessa),
  vaihtuu 20 s välein. Asetus "Valikon tausta": kuvat / 3D-kamera (alla, v1.15).
- **Päävalikon tausta (v1.15):** kamera näyttää satunnaisia kohteita lähikuvina (biomit, järvi, hylätty leiri päivällä ja yöllä, eläimet),
  20 s / kohde, hidas kierto, vaihto mustan kautta; ensimmäinen kohde arvotaan joka latauksella.
- **Päävalikko (v1.14):** "Toimii parhaiten tietokoneella hiirellä ja näppäimistöllä" näkyy ruudun yläkeskellä kerran per käynnistys 3 s (v1.30) ja häipyy.
- **Ruoho (v1.00, v1.04 kasoina):** ohuita läpikuultavia heinäkasoja harvakseltaan biomin mukaan (ei kohteiden päällä), heiluu ja kallistuu tuulessa; asetus Grafiikka → Ruoho (Pois / Normaali / Täysi).
- **Kasvillisuuden esto (v1.04):** puut, kivet ja poimittavat eivät kasva uudelleen leirien, kiviröykkiöiden, linnakkeiden, raunioiden, portaalien ym. päälle (suoja 3,5–15 m).
- **Hylätyt leirit (v0.99):** 1–2 per kartta: sammunut nuotio (sytytä puulla), teltta jossa sänky (herätyspaikka, nukkuminen), tukki ja säkki tarvikkeineen. Teltan voi myös rakentaa itse (Kalusto).
- **Arkkukivet (v1.01, v1.03):** suljettu 3,5 m kivilinnake: arkulle pääsee juoksuhypyin viittä kapeaa siksak-pilaria pitkin muurin harjalle ja kierreportaita alas.
- **Kiviröykkiöt (v1.03):** 2 per kartta, avoin kivikasa, arkku näkyvissä keskellä (pieni saalis).
- **Aluevartijat (v0.97):** vartioalue 30–32 m; rajalla vartija jää seisomaan ja taistelemaan 1–10 s ennen paluuta, palaa jahtiin jos pelaaja tulee alueelle.
  **v1.09:** paluu kävellen (kalmo 30 m ≈ 21 s), paranee paluun aikana 1 %/s; pelaaja alle 8 m päässä keskeyttää paluun (myös alueen
  ulkopuolella) ja vartija taistelee niin kauan kuin pelaaja on alle 8 m päässä; sen jälkeen uusi 1–10 s ajastin ja paluu.
- **Kuokka ja lapio (v0.96):** kuokka vasen nostaa maata 0,3 m (perusväri), oikea palauttaa maan värin; lapio vasen kaivaa 0,3 m kuopan (enint. 3 m), oikea tekee ruskean polun.
- **Tietoikkuna (v0.94):** Shift pohjassa ja hiiri esineen päällä (reppu, arkku, valmistus) → esineen tiedot kursorin vieressä.
- **Hautakasa (v0.93):** ei katoa koskaan; jos kaikki ei mahdu reppuun, avautuu arkkuikkunaksi, tyhjänä vajoaa maahan.
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
- **Myrsky kaataa puun noin 5 s välein** 2–100 m päässä (ei aarnipuita eikä rakennusalueelta); 70 % tuulen suuntaan, 30 % satunnaisesti (v1.19).
- **Kaatuva puu (v1.19):** kaikki kaatuvat puut (myrsky, kirves, karhu) osuvat rungon alle jääviin: 80 % suurimmasta terveydestä, haarniska ei suojaa;
  osuu myös mobeihin, ei puun kaatanutta karhua. **Tuulen taivutus:** myrskyssä latva n. 12–17°, 10 m/s n. 3°.
- **Työkalutasot:** kirves/hakku taso 1–3 (piikivi/kivi, kupari, rauta); aarnipuu vaatii tason 3, rautasuoni tason 2.
- **Maanmuokkaus:** lapio tasoittaa ja tekee maasta multaisen (polut), kuokka nostaa maata ja palauttaa alkuperäisen (`TERRA`, `MUD`, tallentuu).
- **Esineet maassa** katoavat 5 min jälkeen (v1.17: aika kuluu vain, kun olet samassa ulottuvuudessa); maahan pudonneita ei tallenneta.
- **Täysi reppu (v1.17):** poiminta ei onnistu, jos kaikki ei mahdu (esine jää paikalleen), viesti "Reppu on täynnä – et voi poimia".

## 5. Valmistus ja esineet (items.js)

- **48 esinettä, 27 valmistusohjetta.** Työpisteet: työpenkki, ahjo, nuotio/grilli, sulatusuuni. Ohjeilla tasovaatimus (`lvl`).
- **Nuija:** mailamainen, ohut kahva kädessä ja paksu pää kärjessä (v1.06). Pelaajalla hiukset myös takaraivossa (piiloon kypärän alle).
- **Aseet:** puunuija, kivikirves, piikivikeihäs, kupari-/rautamiekka, kupari-/rautakirves, kupari-/rautahakku, hiidenmiekka (harvinainen).
  Jouset: metsästysjousi, hiidenjousi. Kilvet: puu, kupari, rauta. Panssarit: nahka, kupari, rauta, hiiden.
- **Laatu (★1–3):** kehittäminen parantaa vahinkoa, nopeutta ja jousen vetoa; käsisoihdun palamisaika +50 % per taso.
- **Löydetyt arkut ja tynnyrit:** avautuvat arkkuikkunaan kuten omat arkut; sisältö pysyy (`flags.fc`), esineitä voi ottaa ja jättää.
- **Repun käyttö:** napsautus valitsee, toinen napsautus siirtää/vaihtaa paikat, oikea puolittaa pinon, kaksoisnapsautus käyttää,
  Q pudottaa yhden, Shift+Q kaikki (v1.31: hiiren alla oleva esine, myös arkussa, ilman valintaa; itse pudotettu ei imeydy heti takaisin). Arkuissa napsautus–napsautus siirtää, Shift+napsautus siirtää heti. E sulkee valikot.
  **v1.08 (reppu ja arkku):** valittu ruutu sykkii oranssina ja nousee, sen kuvake seuraa hiirtä haamuna, kohderuudussa vihje
  Siirrä / Pinoa / Vaihda ja tietolaatikossa ohjeteksti. Valittuna oikea napsautus toiseen ruutuun siirtää puolet (tyhjään tai samaan
  esineeseen). Raahaus (hiiri pohjassa) siirtää ruutuun / pikapalkkiin; paneelin ulkopuolelle raahattu esine putoaa maahan.
  **v1.30:** oikea napsautus pinoon ottaa puolet valituksi (haamussa määrä), vasen laskee ne; oikealla raahaus siirtää puolet.
- **Valmistusehdotukset (v1.16):** kaksi osiota: "Voit valmistaa nyt" (aineet repussa, enint. 6; puuttuva työpiste merkitään, rakentamaton työpiste
  → myös toiseen osioon) ja "Hyödyllistä seuraavaksi" (enint. 4, pelin vaiheeseen sopivat). Järjestys: ei koskaan valmistettu → usein
  tarvittavat (nuolet, soihdut, ruoka) → valmistettu mutta ei mukana → välituotteet. Tarpeettomia varusteita ei ehdoteta.
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
- **Jousi:** hiiren vasen pohjassa jännittää, vapautus laukaisee (veto > 0,15). Täysi veto 1,6 s (laatu 2: 1,3 s, laatu 3: 1,07 s); vajaa veto = vähemmän vahinkoa, hitaampi nuoli, jyrkempi kaari.
  **Vetoasento (v1.22):** vartalo kääntyy sivuttain, jousi keskellä edessä, oikea käsi vetää jänteen posken oikealle puolelle; levossa jousi heiluu käden mukana.
  **Tähtäys (v1.23):** ympyrä = hajonta: vedon alussa n. 10°, pienenee vedettäessä (keltainen → punainen), täysi veto paikallaan = 0° (pieni ympyrä + piste); liike lisää 2–3°.
  **Jouset (v1.23):** hiidenjousi vetää 1,15 s, nuoli +25 % nopeampi, hajonta ×0,7; ★ nopeuttaa vetoa ja pienentää hajontaa.
- **Nuolet (v1.23):** piikivi = perus; sulitettu +25 % nopeus, −40 % pudotus, +15 % vahinko, tuuli puolet; tulinuoli = perus + sytyttää. Asetus: tulinuolten valo (oletus pois).
- **Kestävyys / isku (v1.23):** kupari −10 %, rauta −20 %, hiiden −30 %; kilven torjunta kuluttaa puu 90 %, kupari 75 %, rauta 60 % iskusta.
- **Palava mob (v1.23):** isommat liekit, kipinöitä ja savua, oranssi valo maahan.
- **Repun käyttö (v1.32):** kiinteä kolmen sarakkeen näkymä (ruudukko | tiedot | valmistus), mikään ei liiku. Napsautus valitsee,
  toinen napsautus siirtää. Haarniska/vaate, kilpi, soihtu ja nuolet otetaan käyttöön jo valintanapsautuksella (keltainen); jos seuraava
  napsautus siirtää esineen, käyttöönotto perutaan. Ruoka syödään VAIN pikapaikan numerolla. Pudotus (Q, Pudota-nappi, raahaus ulos) heittää
  esineen ~3 m eteenpäin kameran suuntaan.
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
- **Terveyspalkit (v1.21):** rivi = 100 hp, rivit päällekkäin (enint. 5, ylin tyhjenee ensin), yli 500 hp:lla toinen värikerros (oranssi).
- **Terveyspalkit:** mobin yläpuolella (mallin korkeus + 0,45 m), nimi ja pääkallot palkin yllä; näkyy kun katse osuu mobiin (~11°, vahvat ~9°)
  alle 12 m (vahvat 70 m) tai 10 s osuman jälkeen. Pomoilla oma palkki ruudun yläreunassa.
- **Juoksu (v0.93):** harppova juoksuanimaatio (takajalka taakse, polvi ylös, kädet koukussa); kävelyaskel hieman pidempi.
  **v1.13:** runko keinuu sivuttain edessä olevan jalan puolelle (kävely ±2°, juoksu ±5°); juoksusta kävelyyn etukeno ja askel palautuvat pehmeästi (~1,2 s).
- **Kalmanpesä (v0.93):** murskautuu millä tahansa, muulla kuin hakulla kaksi kertaa hitaammin; murskatun pesän ympärille ei synny mobeja.
- **Harppovat hirviöt (v0.92):** kaksijalkaiset hirviöt liikkuvat 10 % nopeammin pitkin, keinuvin askelin ja lyövät 10 % kauemmas.
- **Tönäisy (v1.31):** arvo ilman yksikköä, N = N/2 m tavalliseen viholliseen (10 = 5 m); nuija 6 (eniten), kivikirves 2, keihäs ja rautakirves 3,
  hiidenmiekka 3,5; isot olennot lentävät vähemmän. Tönäisty vihollinen on kyvytön lennon ajan (ei kävele eikä lyö).
- **Ulottuvuusmobit (v0.91):** teeman mukaiset koristeet (huurre/jää, hautavaatteet ja pronssikorut, sammal ja hohtavat sienet), liekkimäisesti
  sykkivät silmät ulottuvuuden värillä (kirkastuvat jahdatessa, räpäyttävät), +10 % terveys ja lisäsaalis. Ulkomaailman mobit ennallaan.
- **Haarniskat (v0.90):** jokaisella oma painava malli ja kypärä/huppu (kasvot näkyvät; Hiidenpanssarissa suljettu visiiri): nahkavaatteet,
  karhuntaljahaarniska (uusi: 2 taljaa + 4 nahkaa, arm 10, ei hidasta), kupari-, rauta- ja Hiidenpanssari. Kilpi ja selkätavarat siirtyvät
  haarniskan pinnalle, kun haarniska on päällä.
- **Pomot (v0.89):** Kalmanvartija ryntää harvemmin (25 %, väh. 8 s välein) ja sen huitaisun/maahaniskun ennakko on 40 % pidempi;
  kiviä heittävien pomojen (vartija, Jäätär) hyökkäykset ovat 10 % hitaampia ja kivi lentää 30 % hitaammin. Vartija vajoaa 3 s:ssa maahan ja nousee herätettäessä 2,5 s:ssa (v0.95, haavoittumaton sillä aikaa). Vajonneen vartijan alttari jää
  valmiiksi (3/3 kiveä näkyvissä) – herätys ei vaadi uusia kiviä.
- **Eläinten luonteet (v0.85, `per`):** jänis jähmettyy ja pakenee siksakkia, kettu jää katsomaan matkan päästä, metso antaa tulla lähelle
  ja lehahtaa 14–24 m, porolauma pakenee yhdessä. Uudet eläimet: metsäjänis, kettu, metso (sulat → sulitetut nuolet), poro.
- **Joskus vihaiset (v0.86, `temper`):** hirvi (35 % suuttuu alle 6 m:ssä, ryntää ja tönäisee ~2 m), ilves (yöllä hyökkää haavoittuneen
  < 50 % kimppuun, muuten väistää), ahma (suuttuu raa'asta lihasta repussa), emakko (puolustaa 2–4 porsastaan alle 7 m:ssä). Rauhoittuvat
  12 s:n kuluttua, kun pelaaja on kaukana.
- **Karhu (v0.87):** 120 hp, murisee 14 m:ssä ja hyökkää alle 8 m:ssä tai lyötynä; lyö liikkeestä pysähtymättä, tönäisee ~3,5 m, kaataa
  jahdatessaan edessään olevat puut tukeiksi, palautuu (5 %/s), jos sitä ei lyödä minuuttiin. Pelaaja pääsee juosten karkuun. Saalis
  karhuntalja → Karhuntaljamatto.
- **Harvinaiset pelottavat (v0.88):** vain öisin (≈ kerran 5 min, yksi kerrallaan): Hiidenkarhu, Hiidenhirvi, Kalmasusi (ulvoo ensin),
  Suonäkki (nousee suon lätäköstä). Huomatessaan pelaajan seuraavat 30–60 s, poistuvat 5 s ja unohtavat – suuttuvat uudelleen vain nähdessään
  pelaajan. Katoavat aamulla, jos eivät jahtaa.
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
- **Pomojen iskut (v1.17):** ryntäys enintään kerran 10 s:ssa; maahaniskussa kädet ylhäällä latautumassa 0,8 s ennen iskua.
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
- **Karttapilvet:** kartta paljastuu kulkiessa (`explored`); löydetty paikka näkyy vain paljastetulla alueella. DEV-valikossa (Ä) voi paljastaa koko kartan ja kaikki kohteet sekä hakea minkä tahansa esineen nimellä haluttu määrä (1–999; ylimenevä putoaa maahan).
- **Tehtäväketju (`QUESTS`, 13 kpl):** näkyy oikeassa yläkulmassa suunnan ja etäisyyden kanssa; +60 XP.
- **Tavoitteet (`GOALS`), saavutukset (`ACH`, pysyvät bonukset), taso ja XP** (J-paneeli); reseptejä aukeaa tasoilla.

## 13. Sää, vuorokausi ja taivas (environment.js)

- **Vuorokausi** 720 s (yö kun `dayT` < 0,21 tai > 0,79), pehmeä hämärä, kuu vaiheineen, tähdet.
- **Sää:** selkeä, pilvinen, tuulinen, tihku, sade, myrsky (salamat, puiden kaatuminen), lumisade (vuorilla), sumu.
- **Tuuli (v0.84):** suunta pysyy 2–6 min ja kääntyy hitaasti (40–90 s, enint. 120°); nopeus säästä (selkeä 1–4 … myrsky 15–22 m/s) + puuskat.
  Pilvet (myös kartalla) liikkuvat tuulen suuntaan, puut kallistuvat ja heiluvat, sade viistää, savu ja kipinät ajautuvat, nuolet kallistuvat
  (13 m/s ≈ 0,5 m / 30 m). Ison kartan oikeassa yläkulmassa iso kompassi, "Tuuli suunnasta / X m/s" ja voimakkuuspalkki – läpikuultava, häipyy kun hiiri viedään sen päälle, ja kartan merkit + pelaajan nuoli näkyvät sen päällä (v1.07); kartan päällä liukuvat tuuliviirut (v1.04); minikartan reunalla tuulinuoli + m/s.
- **Pilvet** isoina kerroksina sään mukaan, kaukana häipyvät; pilvikansi rankassa säässä; salaman välähdys kevyt.
- **Aurinko:** pyöreä hehku (`sunGlow`), säteet selkeällä säällä (häipyvät aurinkoon katsottaessa).
- **Aarnimetsässä** tiheä sumu ja pimeämpi valo.

## 14. Kartta (ui.js)

- **Kartta (v1.20):** avatun alueen päällä ohuet liikkuvat pilvet (20 %); paikkojen nimillä pehmeä varjo (näkyvät lumisilla vuorilla).
- **Iso kartta (M):** paljastettu alue 12 m säteellä (pehmeä), tutkimaton pilviverhon takana (liikkuvat kumpupilvet vain kartta auki),
  zoom rullalla, raahaus, rakennukset ylhäältä pikseleinä. **Merkit näkyvät vain paljastetulla alueella.**
- **Minikartta:** 3 zoomia (60 / 35 / 110 m, N tai napsautus), taso näkyy alareunassa.
- **Ilmoitukset:** näkyvät pituuden mukaan pidempään, piiloon valikoissa; L näyttää 10 viimeisintä (v1.18; ennen T).
- **Tehtävä ja tavoite piiloon (v1.18):** T kiertää: molemmat → vain tehtävä → vain tavoite → ei kumpaakaan; piilotettuna pieni vihje, valinta muistetaan.

## 15. Asetukset ja näppäimet (settings.js)

- **Näppäimet** vaihdettavissa vahvistuksella (ei varattuja eikä päällekkäisiä); oletus mm. WASD, Shift juoksu, Välilyönti hyppy, C kyykky,
  E käytä, B rakennus, R/G/H/Q/Z/X/F rakentaminen, Tab reppu, M kartta, J taso, L ilmoitukset, T tehtävä/tavoite piiloon, K koko näyttö, N minikartan zoom.
- **Grafiikka:** 3D-resoluutio, automaattinen laatu, piirtoetäisyys 60–400 m, yksityiskohdat, rakennusten yksityiskohdat, hiukkaset,
  valonlähteiden määrä, usva ja höyry, pilvet, valonsäteet, puiden heiluminen.
  **Väliotsikot (v1.12):** Yleiset, Luonto, Valo, Partikkelit, Rakennukset; Varjot-sivulla Auringon varjot ja Tulien varjot.
  **Automaattinen säätö (v1.12):** yleinen kytkin + osa-alueet (resoluutio, hiukkaset/usva/ruoho, piirtoetäisyys, varjot); nykiessä yksi
  askel kerrallaan 6 s välein, sujuessa takaisin. **FPS-näyttö:** valittava kulma (oletus pois, ensimmäinen vaihtoehto oikea yläkulma).
  **Usva ja höyry (v1.10):** Korkea (entinen), Normaali (oletus: höyry ja sisäkiehkurat puolet haituvista, 1,2× isommat ja 1,39× tiheämmät
  → sama paksuus), Matala, Pois. Maanpinnan usva täysimääräinen Korkealla ja Normaalilla.
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

## Taistelu v1.33 (lista 3)
- Kilpi kuluu: puu 20, kupari 15, rauta 15 torjuntaa; rikki 60 s, sitten ehjä. Torjunta puu 60 %, kupari 80 %, rauta 90 %.
- Kaikki eläimet ja hirviöt +25 % terveys ja vahinko. Pomot: Jäätär 840, Kalmaherra 1280, Aarnihirviö 1872, Kalmanvartija 2250.
- Pomo paranee täyteen ~10 s:ssa, jos siihen ei osuta minuuttiin; ulottuvuudesta poistuminen palauttaa pomon täyteen.
- Mobit lyövät liikkeestä 0,1 s viiveellä, jäähy lyöntien välillä. Tavallisten ulottuma enintään 1,9 m.
- Pelaajan taistelu −10 % (vahinko, tönäisy, lyöntinopeus).
- Yöhirviö: kerran yössä 20 % vuorilla / 10 % muualla, varmasti jos edellinen yö jäi nukkumatta; 6,6 m/s, hyökkää heti.
- Haudan majakka näkyy myös ulottuvuuksissa ja Hautakummussa (vain siinä tilassa, jossa kuoli).
- Tulinuolen valo hiipuu lennossa, sateessa kaksi kertaa nopeammin; osumasta sammuu 2 s:ssa.

## Eteneminen ja arvoesineet v1.34
- Järjestys: Jääavain (satunnainen vanha arkku, portti kertoo suunnan) → Routaportti → Jäätär (luuavain) → Kalmankammio → Kalmaherra
  (aarniavain) → Aarnihauta → Aarnihirviö (Kalmankruunun sirpale) + 2 sirpaletta Aarnihaudan arkuissa → Kalmankehän alttari (3 sirpaletta)
  → Kalmanvartija (viimeinen pomo).
- Pääsaaren arkkujen tavalliset tavarat arvotaan maailman luonnissa.
- Arvoesineet (avaimet, Vartijan sydän, sirpaleet, hiidenkivet, harvinaiset ★) eivät katoa maasta, hehkuvat ja siirtyvät 2 min jälkeen
  (pelaaja > 10 m tai muualla) satunnaiseen pääsaaren arkkuun. Kadonneet uniikit palautetaan automaattisesti.
- Kaksi kylttiä antaa kryptiset vihjeet (E lukee).
- Maassa olevat esineet näkyvät kuvakkeina, joilla on paksuutta (asetus).

## Asetukset v1.35
- Grafiikka-sivun ylälaidassa esiasetusliukusäädin Low → Ultra (8 tasoa, oletus Medium); käsin säädettynä "Custom".
- Varjot ovat Grafiikka-sivun väliotsikko. Uudet: Veri (Normaali/Vähän/Pois), Maassa olevat esineet (3D-kuvake/kevyt), Ultra-tasot.
- Usva ja höyry: Ultra / Korkea / Normaali (oletus, kevyempi kuin ennen) / Matala / Pois.
- Profiilit-välilehti: kaikki asetukset ja näppäimet tallennetaan nimellä, otetaan käyttöön tai poistetaan.
- Muutokset näkyvät heti myös tauolla. Automaattitallennus 2 min välein. Lumisade kulkee tuulen mukana.

## Valikko ja hiiri v1.36
- Päävalikon maailmalista: enintään 5 maailmaa (nimi, viimeksi pelattu, päivä, taso, kartta). Pelaa / Nimeä / Poista (vahvistus) / Uusi maailma.
- Tallenna nyt valikosta, automaattisesti 2 min välein nykyiseen maailmaan.
- Reppu, arkku, rakennusvalikko ja kartta pitävät hiiren lukittuna ja näyttävät pelin oman osoittimen: suljettaessa (Tab, E, M, B…) kamera
  kääntyy heti ilman napsautusta. Esc-taukovalikon jälkeen selain vaatii yhden napsautuksen.

## Efektit ja animaatiot v1.37
- Osumasta lentää verta (isoista enemmän) ja maahan jää läntti, joka häipyy 10 s:ssa; haavat näkyvät mobin pinnassa. Ei-elävät pölisevät.
  Asetus Veri: Normaali / Vähän / Pois.
- Kuollut mob kaatuu velttona, veriläntti alle, katoaa alle 10 s:ssa. Palanut: mustuu ja muuttuu vajoavaksi tuhkakasaksi.
- Pelaajan kuolema: kaatuminen ja veriläntti (1 min); palokuolema → tuhka. Nuotion päällä pelaaja syttyy (sade/vesi sammuttaa).
- Palava mob: isot liekit ja paljon savua.
- Kirves ja hakku: kahden käden isku olan yli vuorotellen kummaltakin puolelta, ei pään läpi. Jousen vetokäsi oikealla olan korkeudella.
- Selkäesineet viistoon (pitkä osa/terä sivulle), jousi ja työkalu ristiin; vyön takana nahkapussi.
- Ulottuvuusportit koristeltu (riimut, kulhot, paadet, teemakoristeet).
- DEV: lento tuplahypyllä (välilyönti ylös, Shift alas).

## Lista 4, erä A (v1.39)
- Kyykyssä eläimet eivät huomaa; ylämäkeen juoksu ja hyppy kuluttavat +30 % kestävyyttä.
- Pomojen iskut +20 %, porttien ja kohteiden vartijat +80 % eivätkä pelkää tulta. Vihollisten hp vaihtelee 100–160 %.
- Rikkinäinen kilpi ei torju ja on selässä. Aarnihirviö paranee vasta 1,7 min jälkeen hitaasti.
- Veren fysiikka (asetus, High+/Ultra): pisarat lentävät iskun suuntaan ja jäävät pintoihin, viillot ja tippuminen.
- Nuolet osuvat puihin ja kiviin. Linnakkeen portaat leveämmät ja muuri ei estä niitä.

## Lista 4, erä B (v1.40)
- P avaa päävalikon ja sulkee kaikki paneelit; Esc ei tee pelissä mitään. Näppäinopasteet (asetus).
- Napsautus paneelin ulkopuolelle sulkee sen, tai pudottaa valitun esineen. Puolitus oikealla napsautuksella kumpaankin suuntaan.
- Omat liukusäätimet ja kytkimet; paneelissa kirjoittaminen menee hakuun.
- Arkut ja tynnyrit avautuvat vain, kun niitä katsoo.

## Lista 4, erä C (v1.41)
- Lumi kiertää pelaajan ympärillä maailmassa ja kulkee tuulen mukana. Sade ja lumi tummuvat yöllä; Medium+ lähivalot värjäävät ne lämpimiksi.
- Seinäsoihtu (2 puu, 1 pihka, 1 rauta): kiinnitetään seinään, palaa 15 min, pihka lisää 15 min (enint. 30).
- Sammunut soihtu syttyy 2,5 m päässä liekistä (nuotio, soihtuteline, seinäsoihtu, hauta- ja ulottuvuussoihdut), kun seisoo 1–1,5 s.
- Arkut: puuarkut lankuista rautavantein ja niitein, linnakkeen kiviarkku riimuin; lukonreikä, avattuna ontto.

## Lista 4, erä D (v1.42)
- Kalmankammion arkuissa kaksinkertainen saalis; Kalmankammiossa ja Aarnihaudassa 30 % mahdollisuus harvinaiseen (sulat, karhuntalja, hiidenkivi, ★2-ase tai -kilpi).
- Kalmaherra ryntää 5 s välein eikä huitaise ilmaa. Alle 50 %: 20 s välein 1–3 tulilinjaa (8 m, 20 vahinkoa + palaminen 4 s, kestää 5 s).
  Alle 30 %: hehkuu punaisena, vain ryntäyksiä 1,5 s välein, 5 kalmoa 20 s välein.
- Kalmankammion kalmoista 10 % on jousikalmoja: ampuvat 3–20 m päästä 2,5 s välein, pitävät etäisyyttä, pudottavat joskus nuolia.
- Ensimmäinen käynti ulottuvuudessa: iso animoitu otsikko ja tavoite; myöhemmin sivuviesti.

## Lista 4, erä E (v1.43)
- Latausnäyttö: riimukiven riimut syttyvät latauksen edetessä, sumu, kipinät ja säe.
- Ensimmäisellä käynnillä 3 s suorituskykytesti valitsee grafiikan esiasetuksen (Low–Medium).
- Uusi maailma alkaa 6 s introlla pilvien yläpuolelta (ohitettavissa millä tahansa näppäimellä).
- Taukovalikossa "Tila: Tauko / Käynnissä": Käynnissä-tilassa maailma jatkuu valikon takana (et ota vahinkoa).
- Uusi alue löytyy vasta hieman syvemmällä (~6 m); löytöotsikot häivyttyvät hitaasti eivätkä tule päällekkäin (jono).

## Lista 4, erä F (v1.44)
- Grafiikka › Suorituskyky: kaukainen maasto kevennetty (yli 100 m), staattisten kohteiden yhdistäminen, auringon varjot harvemmin paikallaan.
  Esiasetukset: Low–Medium- kaikki päällä, Medium–Ultra vain yhdistäminen.

## Latausnäyttö (v1.45)
- Latauksen valmistuttua riimut leimahtavat 0,8 s lähes valkoisiksi ja kirkkaiksi, sitten näyttö häipyy. Reunoilla nousee hiilloshiukkasia ja tuhkaa.

## Päävalikko (v1.46)
- Päänäkymä ilman vieritystä: otsikko (kivi/metalli/riimut), sankaripainike Jatka seikkailua / Aloita seikkailu (pelissä Palaa peliin),
  Maailmat, Näppäimet, Asetukset (pelissä myös Tila ja Tallenna).
- Maailmat, Näppäimet ja Asetukset avautuvat leveäksi näkymäksi; takaisin Takaisin-painikkeella tai P:llä (Esc valikossa).
- Partikkelit vaihtuvat taustakuvan mukaan; painikkeet kipinöivät hiiren alla ja painettaessa.
- (v1.47) Esiasetussäätimen ulkoasu vaihtuu tason mukaan: Low kivi, Low+ vaskipatina, Medium- metsä, Medium ennallaan, Medium+ kulta,
  High routa, High+ palava punainen, Ultra violetti taika (partikkelit). Logo on halkeillut, sammaloitunut, malmeja ja riimuja sisältävä
  kivikaiverrus rautareunuksella ja hehkuvilla hiidenkivikristalleilla.
- (v1.48) Logolla on 7 teemaa, joista yksi arvotaan aina valikkoon tultaessa: halkeillut kivi, hiidenkivi, sammalkivi, taottu rauta,
  malmikallio, riimukivi ja yhdistelmä.

## Lista 5 (v1.49–)
- Jousi: seisten täysin vedettynä pieni tähtäinympyrä ja pieni hajonta; kyykyssä täysin vedettynä tähtäin pistemäinen, ei hajontaa,
  veto ja nuolen nopeus +10 %, ja näkyviin tulee tiputusristikko (20–70 m).
- Valikon Tallenna nyt -painike näyttää "Tallennettu ✓" ja välähtää vihreänä.
- Kalmot ja pelottavat yöolennot syttyvät auringossa avoimella alueella (ei metsässä, katoksen alla, pilvisellä/sateella eikä yöllä):
  ryntäilevät palaen ~3 s, hidastuvat ja muuttuvat tuhkaksi ~6 s:ssa (ei saalista). Liian lähelle mennessä syttyy itsekin.
- Valikossa 21 animoitua taustaa (mm. kaatuvia puita myrskyssä, raivoava karhu, susilauma, hirvi järvellä, ulottuvuuksien vihjeet,
  Kalmanvartijan varjo salamoissa, nousevat kalmot, ahjo). Portaalikuva on eeppinen riimukaari, joskus hahmo portin edessä.
- Uutta maailmaa luotaessa näkyy riimukivi-latausnäyttö; sen jälkeen pilvet aukeavat kameran edestä sivuille (Medium+ 3D-pilvet,
  muuten pilviverho) ja intro alkaa pilvien yläpuolelta ilman nykimistä.

## Lista 6 (v1.53–)
- Piikivikirves (työpenkki: 3 puuta, 3 piikiveä, 1 nahka; taso 2): kaataa puut kivikirvestä nopeammin, ei kovia puita.
- Kävellessä hahmo ei keinu sivulle; juostessa vähän ja osin eteenpäin.
- Asetukset › Ohjaus: kääntymisen herkkyys ja pelin paneelien osoittimen herkkyys. Osoitin liikkuu viiveettä.
- Ensimmäisellä käynnillä aloitusjakso: EricStudios / KSPK-tech ja tekijänoikeudet → HIIDENMAA kivikaiverruksena → varoitus
  (tietokone, hiiri ja näppäimistö) → riimusiirtymä latausnäyttöön. Ohitettavissa napsautuksella tai näppäimellä.
- Ultra-asetuksella veri lentää tuplasti rajummin. Verilätäköt mukailevat rinnettä, ja Medium+ jyrkässä (> 45°) rinteessä lammikko
  valuu 10 s alas.
- Jousi on selässä litteänä; jos repussa on nuolia, selässä näkyy 3 nuolta.
- Jousi: naru vedetään oikein taaksepäin, ote kahvasta, osumamerkki (X) osumasta. Kyykkyristikko 40/80/120 m.
- Q pudottaa pelissä valitusta pikapaikasta yhden, Shift+Q koko pinon (reppu auki: hiiren alla oleva/valittu kuten ennen).
- Kirveellä/hakulla hakatessa kädet hieman ylempänä ja edempänä, eikä iskujen välissä tai lopussa ole pyörähdystä.

## Katoamisajat (v1.57)
| Mikä | Katoaa |
| --- | --- |
| Osuman veriläiskä, pisaran läiskä (maa/seinä) | 10 s (häivytys viimeiset 2,5 s) |
| Vihollisen kuoleman lammikko ja ruumis | 9,4 s (ruumis vajoaa 7 s jälkeen; tuhkakasa samoin) |
| Pelaajan kuoleman lammikko | 60 s; ruumis/tuhkakasa uudelleensyntymässä |
| Rinteessä valuvan noron läiskät | 40 s |
| Läiskien enimmäismäärä | 140 (vanhin poistuu) |
| Juuttunut nuoli | 6 s |
| Maassa oleva esine | 5 min (vilkkuu viimeiset 15 s); arvoesineet siirtyvät arkkuun |
