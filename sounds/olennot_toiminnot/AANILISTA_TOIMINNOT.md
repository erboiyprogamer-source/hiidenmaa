# Hiidenmaan äänilista: olentojen toiminnot ja ääniefektit

Projekti `sounds/olennot_toiminnot/` (äänierä B1, v2.16). Taulukko päivittyy automaattisesti (`python3 tools/process_sounds.py`) – älä muokkaa käsin.
Olentojen omat äänet (ääntely, kipu, kuolema, suuttuminen, jahti, kaiku) ovat erillisessä projektissa `sounds/olennot_aanet/` (AANILISTA.md).

## Kansiot

- `raw/<ryhmä>/<ääni>_<n>.mp3` – **sinun raa'at äänesi** (korvaa paikkamerkki täsmälleen samalla nimellä, esim. `raw/nelijalkaiset/askel_ruoho_1.mp3`).
  Paikkoja on kaksi (`_1`, `_2`); lisää versioita vapaasti `_3`, `_4` … – peli arpoo kaikista.
- `valmiit/<ryhmä>_valmis/…` – työkalun käsittelemät äänet, jotka peli lataa (älä muokkaa). Pääte `_valmis` erottaa ne raa'oista.
- Ryhmän olennot jakavat äänet (sävel vaihtelee hieman). **Puuttuva ääni = hiljaisuus**, paitsi kerrostuvilla ryhmillä (➕), jotka käyttävät
  pohjaryhmän ääniä (kaksijalkaiset tai nelijalkaiset) ja soittavat omat äänensä niiden päälle (v2.21).

## Merkit

- Ryhmät: 🦶 kaksijalkaiset · 💀 luurangot · 🐾 nelijalkaiset · 🐻 raskaat nelijalkaiset (karhu, hiidenkarhu, hiidenhirvi – ei pomoja) · 🐇 kevyet
  nelijalkaiset · 🐦 kevyet kaksijalkaiset · 🪨 kivivartija · 👑 pomot (yhteinen pääkansio) · 🗿 Kalmanvartija · ❄️ Jäätär · 🔥 Kalmaherra ·
  🌳 Aarnihirviö · 🌐 yhteiset.
- Tila: ✅ oma ääni · 🔁 lainaa pomot-kansiosta · ⬜ puuttuu (hiljaa) · 💎 pääkansio (muut lainaavat) · ➕ kerrostuu pohjaryhmän päälle · 🎯 lisää ensin (kuuluu usein).
- **Pomot:** kaikki pomot käyttävät `pomot/`-kansion ääniä, ellei pomon omassa kansiossa ole samannimistä ääntä (oma voittaa).
- ➕ **Kerrostus (v2.21):** 🐻 raskaat ja 🐇 kevyet nelijalkaiset soittavat 🐾 nelijalkaisten äänet; 🐦 kevyet kaksijalkaiset, 💀 luurangot,
  🪨 kivivartija ja 👑 pomot soittavat 🦶 kaksijalkaisten äänet (sävel ja voimakkuus koon mukaan). Ryhmän oma samanniminen ääni soi päälle.
  Kerrokset joka askeleella: **tömistys** (🐻, 🪨, 👑 – pieni matala tömähdys) ja **kalina** (💀 – luut kalisevat). Ne eivät soi uidessa
  (tömistys ei myöskään kahlatessa).

## Alustat (askeleet)

- `askel_ruoho`: ruoho, maa, kangas, nummi
- `askel_kivi`: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset
- `askel_hiekka`: hietaranta
- `askel_lumi`: routahuiput
- `askel_suo`: upposuo, muta
- `askel_puu`: puurakennukset (lattiat, portaat)
- `askel_jaa`: Routaluolan jää
- `askel_pusikko`: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa)
- `askel_kahlaus`: matala vesi
- `askel_uinti`: syvä vesi

**Käsittely:** askel ≤ 0,5 s (iso 0,8), −27 LUFS; tömistys ≤ 0,6 s (iso 0,9), −26 LUFS; kahlaus/uinti ≤ 1,2–1,8 s; kaatuminen ≤ 1,5 s (iso 2,5); isku/osuma ≤ 0,7–1,0 s; syöminen ≤ 2,5 s;
palaminen ≤ 3 s (soi silmukkana). Isot ryhmät +2 dB. Anna raaka kuivana ja puhtaana (peli lisää etäisyyden ja kaiun).

## Ryhmät (53/75 ääntä omilla äänillä)

### 🦶 Kaksijalkaiset – `kaksijalkaiset/` (12/14 ääntä)

Jäsenet: Sammalhiisi, Suonäkki.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2`, `askel_ruoho_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: ruoho, maa, kangas, nummi | footstep grass dirt, small creature |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2`, `askel_kivi_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset | footstep stone rock, small creature |
| askel_hiekka | `askel_hiekka_1`, `askel_hiekka_2`, `askel_hiekka_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: hietaranta | footstep sand, small creature |
| askel_lumi | `askel_lumi_1`, `askel_lumi_2`, `askel_lumi_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: routahuiput | footstep snow crunch, small creature |
| askel_suo | `askel_suo_1`, `askel_suo_2`, `askel_suo_3` | ✅ oma: _1, _2, _3 (3 kpl) + 4 pätkää pitkästä nauhoituksesta | askel: upposuo, muta | footstep mud squelch swamp, small creature |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ✅ oma: _1, _2 (2 kpl) | askel: puurakennukset (lattiat, portaat) | footstep wood floor, small creature |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ✅ oma: _1 (1 kpl) | askel: Routaluolan jää | footstep ice, small creature |
| askel_pusikko | `askel_pusikko_1`, `askel_pusikko_2` | ✅ oma: _1 (1 kpl) | askel: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa) | walking through bushes leaves, small creature |
| askel_kahlaus | `askel_kahlaus_1`, `askel_kahlaus_2` | ✅ oma: _1 (1 kpl) + 4 pätkää pitkästä nauhoituksesta | askel: matala vesi | wading water footsteps, small creature |
| askel_uinti | `askel_uinti_1`, `askel_uinti_2`, `askel_uinti_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: syvä vesi | animal swimming splash paddle, small creature |
| oksa | `oksa_1`, `oksa_2` | ✅ oma: _1, _2 (2 kpl) | oksa rasahtaa jalan alla (Aarnimetsä, välillä; soi hiljaa, enintään 2 s välein) | twig snap, branch crack footstep, small creature |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ✅ oma: _1 (1 kpl) | ruumis kaatuu maahan kuollessa | body fall thud, animal collapse, small creature |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, small creature |
| nousu | `nousu_1`, `nousu_2` | ⬜ puuttuu (hiljaa) | nousee makuulta syntyessään (ähkäisy, rapina) | creature getting up, rustle grunt, small creature |

### 💀 Luurangot – `luurangot/` (1/1 ääntä)

➕ **Kerrostuu:** soittaa `kaksijalkaiset/`-kansion äänet (sävel ×1.05, voimakkuus ×0.8) ja tämän kansion samannimisen äänen päälle. `kalina` soi joka askeleella askeleen kanssa yhtä aikaa. Voit lisätä tähän myös `kaksijalkaiset`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.

Jäsenet: Kalmo, Kalmon ylimys.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| kalina | `kalina_1`, `kalina_2` | ✅ oma: _1, _2 (2 kpl) | luut kalisevat joka askeleella (soi askeleen päällä, lyhyt ja hiljainen) | bones rattle, skeleton clatter soft, skeleton bony |

### 🐾 Nelijalkaiset – `nelijalkaiset/` (17/20 ääntä)

Jäsenet: Peura, Poro, Hirvi, Karju, Emakko, Susi, Routasusi, Kalmasusi, Ilves, Ahma.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2`, `askel_ruoho_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: ruoho, maa, kangas, nummi | footstep grass dirt, animal hooves paws |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2`, `askel_kivi_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset | footstep stone rock, animal hooves paws |
| askel_hiekka | `askel_hiekka_1`, `askel_hiekka_2`, `askel_hiekka_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: hietaranta | footstep sand, animal hooves paws |
| askel_lumi | `askel_lumi_1`, `askel_lumi_2`, `askel_lumi_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: routahuiput | footstep snow crunch, animal hooves paws |
| askel_suo | `askel_suo_1`, `askel_suo_2`, `askel_suo_3` | ✅ oma: _1, _2, _3 (3 kpl) + 4 pätkää pitkästä nauhoituksesta | askel: upposuo, muta | footstep mud squelch swamp, animal hooves paws |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ✅ oma: _1, _2 (2 kpl) | askel: puurakennukset (lattiat, portaat) | footstep wood floor, animal hooves paws |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ✅ oma: _1 (1 kpl) | askel: Routaluolan jää | footstep ice, animal hooves paws |
| askel_pusikko | `askel_pusikko_1`, `askel_pusikko_2` | ✅ oma: _1 (1 kpl) | askel: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa) | walking through bushes leaves, animal hooves paws |
| askel_kahlaus | `askel_kahlaus_1`, `askel_kahlaus_2` | ✅ oma: _1 (1 kpl) + 4 pätkää pitkästä nauhoituksesta | askel: matala vesi | wading water footsteps, animal hooves paws |
| askel_uinti | `askel_uinti_1`, `askel_uinti_2`, `askel_uinti_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: syvä vesi | animal swimming splash paddle, animal hooves paws |
| oksa | `oksa_1`, `oksa_2` | ✅ oma: _1, _2 (2 kpl) | oksa rasahtaa jalan alla (Aarnimetsä, välillä; soi hiljaa, enintään 2 s välein) | twig snap, branch crack footstep, animal hooves paws |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ✅ oma: _1 (1 kpl) | ruumis kaatuu maahan kuollessa | body fall thud, animal collapse, animal hooves paws |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, animal hooves paws |
| nousu | `nousu_1`, `nousu_2` | ⬜ puuttuu (hiljaa) | nousee makuulta syntyessään (ähkäisy, rapina) | creature getting up, rustle grunt, animal hooves paws |
| ravistus | `ravistus_1`, `ravistus_2` | ✅ oma: _1 (1 kpl) | ravistaa turkin vedestä noustessa | dog shake off water, fur shake, animal hooves paws |
| nuuhkiminen | `nuuhkiminen_1`, `nuuhkiminen_2` | ✅ oma: _1 (1 kpl) | nuuhkii uteliaana (kun katsoo sinua) | animal sniffing, sniff, animal hooves paws |
| syominen_laidun | `syominen_laidun_1`, `syominen_laidun_2` | ✅ oma: _1 (1 kpl) | laiduntaa: repii ja jauhaa ruohoa (peura, poro, hirvi) | deer grazing, grass chewing, animal hooves paws |
| syominen_tonkiminen | `syominen_tonkiminen_1`, `syominen_tonkiminen_2` | ✅ oma: _1 (1 kpl) | tonkii maata röhkien (karju, emakko, porsas) | pig rooting, boar snuffling dirt, animal hooves paws |
| syominen_rouskutus | `syominen_rouskutus_1`, `syominen_rouskutus_2` | ✅ oma: _1, _2 (2 kpl) | kalvaa raatoa, luu rouskuu (sudet, karhu, ahma) | wolf gnawing bone, chewing meat, animal hooves paws |
| juominen | `juominen_1`, `juominen_2` | ⬜ puuttuu (hiljaa) | latkii vettä rannalla (silmukka juomisen ajan; kaikki nelijalkaiset, kevyet ja raskaat kerrostuvat) | animal drinking water lapping, dog lapping, animal hooves paws |

### 🐻 Raskaat nelijalkaiset (ei pomoja) – `raskaat_nelijalkaiset/` (0/1 ääntä)

➕ **Kerrostuu:** soittaa `nelijalkaiset/`-kansion äänet (sävel ×0.8, voimakkuus ×1) ja tämän kansion samannimisen äänen päälle. `tomistys` soi joka askeleella askeleen kanssa yhtä aikaa. Voit lisätä tähän myös `nelijalkaiset`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.

Jäsenet: Karhu, Hiidenkarhu, Hiidenhirvi. Iso: kovempi, askeleet kuuluvat 40 m.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| tomistys | `tomistys_1`, `tomistys_2` | ⬜ puuttuu (askel soi ilman tätä kerrosta)<br>🎯 lisää ensin (kuuluu usein) | matala tömähdys joka askeleella (soi askeleen kanssa yhtä aikaa, lyhyt ja pieni) | low thump footstep, heavy stomp, deep impact, heavy animal bear |

### 🐇 Kevyet nelijalkaiset – `kevyet_nelijalkaiset/` (1/1 ääntä)

➕ **Kerrostuu:** soittaa `nelijalkaiset/`-kansion äänet (sävel ×1.3, voimakkuus ×0.55) ja tämän kansion samannimisen äänen päälle. Voit lisätä tähän myös `nelijalkaiset`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.

Jäsenet: Jänis, Kettu, Porsas.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| syominen_nakerrus | `syominen_nakerrus_1`, `syominen_nakerrus_2` | ✅ oma: _1, _2 (2 kpl) | nakertaa (jänis) | rabbit nibbling, gnawing, small animal light |

### 🐦 Kevyet kaksijalkaiset – `kevyet_kaksijalkaiset/` (1/1 ääntä)

➕ **Kerrostuu:** soittaa `kaksijalkaiset/`-kansion äänet (sävel ×1.5, voimakkuus ×0.45) ja tämän kansion samannimisen äänen päälle. Voit lisätä tähän myös `kaksijalkaiset`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.

Jäsenet: Metso.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| lentoonlahto | `lentoonlahto_1`, `lentoonlahto_2` | ✅ oma: _1, _2 (2 kpl) | lähtee lentoon (siivet räpyttävät) | grouse flush, bird wings takeoff flapping, bird hop light |

### 🪨 Kivivartija – `kivivartija/` (1/1 ääntä)

➕ **Kerrostuu:** soittaa `kaksijalkaiset/`-kansion äänet (sävel ×0.8, voimakkuus ×1) ja tämän kansion samannimisen äänen päälle. `tomistys` soi joka askeleella askeleen kanssa yhtä aikaa. Voit lisätä tähän myös `kaksijalkaiset`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.

Jäsenet: Kivivartija. Iso: kovempi, askeleet kuuluvat 40 m.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| tomistys | `tomistys_1`, `tomistys_2` | ✅ oma: _1 (1 kpl) | matala tömähdys joka askeleella (soi askeleen kanssa yhtä aikaa, lyhyt ja pieni) | low thump footstep, heavy stomp, deep impact, stone golem rock |

### 👑 Pomot – yhteinen pääkansio – `pomot/` (4/5 ääntä)

💎 **Pääkansio:** kaikki pomot lainaavat nämä äänet (sävel pomon mukaan), ellei pomon omassa kansiossa ole samannimistä ääntä.

➕ **Kerrostuu:** soittaa `kaksijalkaiset/`-kansion äänet (sävel ×0.7, voimakkuus ×1) ja tämän kansion samannimisen äänen päälle. `tomistys` soi joka askeleella askeleen kanssa yhtä aikaa. Voit lisätä tähän myös `kaksijalkaiset`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.

Jäsenet: Kalmanvartija, Jäätär, Kalmaherra, Aarnihirviö. Iso: kovempi, askeleet kuuluvat 40 m. Pomo: askeleet tärisyttävät maata (kamera tärähtää alle 15 m:ssä).

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| tomistys | `tomistys_1`, `tomistys_2` | ✅ oma: _1 (1 kpl) | matala tömähdys joka askeleella (soi askeleen kanssa yhtä aikaa, lyhyt ja pieni) | low thump footstep, heavy stomp, deep impact, giant monster heavy boss |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ✅ oma: _1 (1 kpl) | ruumis kaatuu maahan kuollessa | body fall thud, animal collapse, giant monster heavy boss |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, giant monster heavy boss |
| ryntays_lataus | `ryntays_lataus_1`, `ryntays_lataus_2` | ✅ oma: _1 (1 kpl) | ryntäyksen lataus: pomo kumartuu ja kerää voimaa (0,6 s ennen syöksyä) | monster charge up growl, heavy breath windup, giant monster heavy boss |
| ryntays | `ryntays_1`, `ryntays_2` | ✅ oma: _1 (1 kpl) | ryntäys: raskas syöksy eteenpäin | monster charge rush roar, heavy stampede dash, giant monster heavy boss |

### 🗿 Kalmanvartija (oma, muuten pomot) – `kalmanvartija/` (1/5 ääntä)

🔁 Lainaa `pomot/`-kansiosta. Lisää tähän oma ääni samalla nimellä, niin se valitaan ensin.

➕ **Kerrostuu:** soittaa `kaksijalkaiset/`-kansion äänet (sävel ×0.62, voimakkuus ×1) ja tämän kansion samannimisen äänen päälle. `tomistys` soi joka askeleella askeleen kanssa yhtä aikaa. Voit lisätä tähän myös `kaksijalkaiset`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.

Jäsenet: Kalmanvartija. Iso: kovempi, askeleet kuuluvat 40 m. Pomo: askeleet tärisyttävät maata (kamera tärähtää alle 15 m:ssä).

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| tomistys | `tomistys_1`, `tomistys_2` | ✅ oma: _1 (1 kpl) | matala tömähdys joka askeleella (soi askeleen kanssa yhtä aikaa, lyhyt ja pieni) | low thump footstep, heavy stomp, deep impact, giant stone heavy boom |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | 🔁 lainaa: pomot/kaatuminen | kivenlohkareet putoavat maahan (kova, raskas) | huge stones falling, heavy rock impact |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (lainaa pomot-kansiosta, kun sinne lisätään) | valtava kivinen isku viuhuu | giant stone swing whoosh heavy |
| ryntays_lataus | `ryntays_lataus_1`, `ryntays_lataus_2` | 🔁 lainaa: pomot/ryntays_lataus | ryntäyksen lataus: pomo kumartuu ja kerää voimaa (0,6 s ennen syöksyä) | monster charge up growl, heavy breath windup, giant stone heavy boom |
| ryntays | `ryntays_1`, `ryntays_2` | 🔁 lainaa: pomot/ryntays | ryntäys: raskas syöksy eteenpäin | monster charge rush roar, heavy stampede dash, giant stone heavy boom |

### ❄️ Jäätär (oma, muuten pomot) – `jaatar/` (2/5 ääntä)

🔁 Lainaa `pomot/`-kansiosta. Lisää tähän oma ääni samalla nimellä, niin se valitaan ensin.

➕ **Kerrostuu:** soittaa `kaksijalkaiset/`-kansion äänet (sävel ×0.75, voimakkuus ×1) ja tämän kansion samannimisen äänen päälle. `tomistys` soi joka askeleella askeleen kanssa yhtä aikaa. Voit lisätä tähän myös `kaksijalkaiset`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.

Jäsenet: Jäätär. Iso: kovempi, askeleet kuuluvat 40 m. Pomo: askeleet tärisyttävät maata (kamera tärähtää alle 15 m:ssä).

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| tomistys | `tomistys_1`, `tomistys_2` | ✅ oma: _1 (1 kpl) | matala tömähdys joka askeleella (soi askeleen kanssa yhtä aikaa, lyhyt ja pieni) | low thump footstep, heavy stomp, deep impact, ice giant crystal |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | 🔁 lainaa: pomot/kaatuminen | jääkappaleet putoavat ja särkyvät | ice chunks fall shatter |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ✅ oma: _1 (1 kpl) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, ice giant crystal |
| ryntays_lataus | `ryntays_lataus_1`, `ryntays_lataus_2` | 🔁 lainaa: pomot/ryntays_lataus | ryntäyksen lataus: pomo kumartuu ja kerää voimaa (0,6 s ennen syöksyä) | monster charge up growl, heavy breath windup, ice giant crystal |
| ryntays | `ryntays_1`, `ryntays_2` | 🔁 lainaa: pomot/ryntays | ryntäys: raskas syöksy eteenpäin | monster charge rush roar, heavy stampede dash, ice giant crystal |

### 🔥 Kalmaherra (oma, muuten pomot) – `kalmaherra/` (2/5 ääntä)

🔁 Lainaa `pomot/`-kansiosta. Lisää tähän oma ääni samalla nimellä, niin se valitaan ensin.

➕ **Kerrostuu:** soittaa `kaksijalkaiset/`-kansion äänet (sävel ×0.72, voimakkuus ×1) ja tämän kansion samannimisen äänen päälle. `tomistys` soi joka askeleella askeleen kanssa yhtä aikaa. Voit lisätä tähän myös `kaksijalkaiset`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.

Jäsenet: Kalmaherra. Iso: kovempi, askeleet kuuluvat 40 m. Pomo: askeleet tärisyttävät maata (kamera tärähtää alle 15 m:ssä).

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| tomistys | `tomistys_1`, `tomistys_2` | ✅ oma: _1 (1 kpl) | matala tömähdys joka askeleella (soi askeleen kanssa yhtä aikaa, lyhyt ja pieni) | low thump footstep, heavy stomp, deep impact, demon lord heavy |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | 🔁 lainaa: pomot/kaatuminen | panssarin ja luiden palat putoavat | armor pieces fall, bones clatter heavy |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ✅ oma: _1 (1 kpl) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, demon lord heavy |
| ryntays_lataus | `ryntays_lataus_1`, `ryntays_lataus_2` | 🔁 lainaa: pomot/ryntays_lataus | ryntäyksen lataus: pomo kumartuu ja kerää voimaa (0,6 s ennen syöksyä) | monster charge up growl, heavy breath windup, demon lord heavy |
| ryntays | `ryntays_1`, `ryntays_2` | 🔁 lainaa: pomot/ryntays | ryntäys: raskas syöksy eteenpäin | monster charge rush roar, heavy stampede dash, demon lord heavy |

### 🌳 Aarnihirviö (oma, muuten pomot) – `aarnihirvio/` (1/5 ääntä)

🔁 Lainaa `pomot/`-kansiosta. Lisää tähän oma ääni samalla nimellä, niin se valitaan ensin.

➕ **Kerrostuu:** soittaa `kaksijalkaiset/`-kansion äänet (sävel ×0.68, voimakkuus ×1) ja tämän kansion samannimisen äänen päälle. `tomistys` soi joka askeleella askeleen kanssa yhtä aikaa. Voit lisätä tähän myös `kaksijalkaiset`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.

Jäsenet: Aarnihirviö. Iso: kovempi, askeleet kuuluvat 40 m. Pomo: askeleet tärisyttävät maata (kamera tärähtää alle 15 m:ssä).

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| tomistys | `tomistys_1`, `tomistys_2` | ✅ oma: _1 (1 kpl) | matala tömähdys joka askeleella (soi askeleen kanssa yhtä aikaa, lyhyt ja pieni) | low thump footstep, heavy stomp, deep impact, giant tree creature wood |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | 🔁 lainaa: pomot/kaatuminen | puun kappaleet putoavat ja natisevat | wood chunks fall, timber crash |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (lainaa pomot-kansiosta, kun sinne lisätään) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, giant tree creature wood |
| ryntays_lataus | `ryntays_lataus_1`, `ryntays_lataus_2` | 🔁 lainaa: pomot/ryntays_lataus | ryntäyksen lataus: pomo kumartuu ja kerää voimaa (0,6 s ennen syöksyä) | monster charge up growl, heavy breath windup, giant tree creature wood |
| ryntays | `ryntays_1`, `ryntays_2` | 🔁 lainaa: pomot/ryntays | ryntäys: raskas syöksy eteenpäin | monster charge rush roar, heavy stampede dash, giant tree creature wood |

### 💥 Osumat – kun olento osuu toiseen (esim. pelaajaan) tai nuoli osuu – `osumat/` (5/6 ääntä)

Jäsenet: kaikki olennot.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| osuma_raapaisu | `osuma_raapaisu_1`, `osuma_raapaisu_2` | ✅ oma: _1, _2 (2 kpl) | kynnet raapaisevat (ilves, karhut, Suonäkki) | claw scratch hit, slash flesh |
| osuma_purema | `osuma_purema_1`, `osuma_purema_2` | ✅ oma: _1, _2 (2 kpl) | purema (sudet, ahma, emakko, porsas, kettu, jänis) | bite hit, animal bite snap |
| osuma_murskaus | `osuma_murskaus_1`, `osuma_murskaus_2` | ✅ oma: _1, _2 (2 kpl) | raskas murskaava isku (kivivartija, Kalmanvartija, Jäätär, Aarnihirviö, Jäätären heittokivi) | heavy crush impact, smash hit |
| osuma_sarvet | `osuma_sarvet_1`, `osuma_sarvet_2` | ⬜ puuttuu (hiljaa) | sarvet tai torahampaat iskevät (peura, poro, hirvi, hiidenhirvi, karju) | antler horn hit, ram impact |
| osuma_isku | `osuma_isku_1`, `osuma_isku_2` | ✅ oma: _1, _2 (2 kpl) | ase tai nyrkki osuu (hiisi, kalmot, ylimys, Kalmaherra, metso nokkaisee) | weapon hit body, punch impact |
| osuma_nuoli | `osuma_nuoli_1`, `osuma_nuoli_2` | ✅ oma: _1, _2 (2 kpl) | nuoli osuu (jousikalmon nuoli pelaajaan, pelaajan nuoli olentoon) | arrow hit flesh, arrow impact thud |

### 🧱 Törmäykset – juoksuvauhdissa esteeseen (puu, kivi, seinä) – `tormaykset/` (2/2 ääntä)

Jäsenet: kaikki olennot.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| tormays_kevyt | `tormays_kevyt_1`, `tormays_kevyt_2` | ✅ oma: _1 (1 kpl) | tavallinen olento juoksee esteeseen (puu, kivi, seinä) – tömähdys, rasahdus | body bump into tree, thud collision light |
| tormays_raskas | `tormays_raskas_1`, `tormays_raskas_2` | ✅ oma: _1 (1 kpl) | raskas olento tai pomo juoksee esteeseen (karhu, kivivartija, pomot) – kova rysähdys | heavy body crash into tree, big impact thud |

### 🌐 Yhteiset (kaikki olennot, sävel koon mukaan) – `yhteiset/` (3/3 ääntä)

Jäsenet: kaikki olennot.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| palaminen | `palaminen_1`, `palaminen_2` | ✅ oma: _1, _2 (2 kpl) | liekkien rätinä olennon palaessa (silmukka) | fire crackle loop, burning |
| kahina | `kahina_1`, `kahina_2` | ✅ oma: _1 (1 kpl) | juoksee pensaan tai heinikon läpi | bush rustle, running through foliage |
| loiskahdus | `loiskahdus_1`, `loiskahdus_2` | ✅ oma: _1, _2 (2 kpl) | menee tai putoaa veteen | splash into water, body splash |
