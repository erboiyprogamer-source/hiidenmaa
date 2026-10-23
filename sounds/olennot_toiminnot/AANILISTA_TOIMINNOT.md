# Hiidenmaan äänilista: olentojen toiminnot ja ääniefektit

Projekti `sounds/olennot_toiminnot/` (äänierä B1, v2.16). Taulukko päivittyy automaattisesti (`python3 tools/process_sounds.py`) – älä muokkaa käsin.
Olentojen omat äänet (ääntely, kipu, kuolema, suuttuminen, jahti, kaiku) ovat erillisessä projektissa `sounds/olennot_aanet/` (AANILISTA.md).

## Kansiot

- `raw/<ryhmä>/<ääni>_<n>.mp3` – **sinun raa'at äänesi** (korvaa paikkamerkki täsmälleen samalla nimellä, esim. `raw/nelijalkaiset/askel_ruoho_1.mp3`).
  Paikkoja on kaksi (`_1`, `_2`); lisää versioita vapaasti `_3`, `_4` … – peli arpoo kaikista.
- `valmiit/<ryhmä>/…` – työkalun käsittelemät äänet, jotka peli lataa (älä muokkaa).
- Ryhmän olennot jakavat äänet (sävel vaihtelee hieman). **Puuttuva ääni = hiljaisuus** – ryhmät eivät lainaa toisiltaan.

## Merkit

- Ryhmät: 🦶 kaksijalkaiset · 💀 luurangot · 🐾 nelijalkaiset · 🐻 raskaat · 🐇 kevyet nelijalkaiset · 🐦 kevyet kaksijalkaiset · 🪨 kivivartija ·
  🗿 Kalmanvartija · ❄️ Jäätär · 🔥 Kalmaherra · 🌳 Aarnihirviö · 🌐 yhteiset.
- Tila: ✅ oma ääni · ⬜ puuttuu (hiljaa) · 🎯 lisää ensin (kuuluu pelissä usein: ruoho- tai lattia-askel, kaatuminen).

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

**Käsittely:** askel ≤ 0,5 s (iso 0,8), −27 LUFS; kahlaus/uinti ≤ 1,2–1,8 s; kaatuminen ≤ 1,5 s (iso 2,5); isku/osuma ≤ 0,7–1,0 s; syöminen ≤ 2,5 s;
palaminen ≤ 3 s (soi silmukkana). Isot ryhmät +2 dB. Anna raaka kuivana ja puhtaana (peli lisää etäisyyden ja kaiun).

## Ryhmät (0/138 ääntä omilla äänillä)

### 🦶 Kaksijalkaiset – `kaksijalkaiset/` (0/15 ääntä)

Jäsenet: Sammalhiisi, Suonäkki.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: ruoho, maa, kangas, nummi | footstep grass dirt, small creature |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset | footstep stone rock, small creature |
| askel_hiekka | `askel_hiekka_1`, `askel_hiekka_2` | ⬜ puuttuu (hiljaa) | askel: hietaranta | footstep sand, small creature |
| askel_lumi | `askel_lumi_1`, `askel_lumi_2` | ⬜ puuttuu (hiljaa) | askel: routahuiput | footstep snow crunch, small creature |
| askel_suo | `askel_suo_1`, `askel_suo_2` | ⬜ puuttuu (hiljaa) | askel: upposuo, muta | footstep mud squelch swamp, small creature |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ⬜ puuttuu (hiljaa) | askel: puurakennukset (lattiat, portaat) | footstep wood floor, small creature |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ⬜ puuttuu (hiljaa) | askel: Routaluolan jää | footstep ice, small creature |
| askel_pusikko | `askel_pusikko_1`, `askel_pusikko_2` | ⬜ puuttuu (hiljaa) | askel: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa) | walking through bushes leaves, small creature |
| askel_kahlaus | `askel_kahlaus_1`, `askel_kahlaus_2` | ⬜ puuttuu (hiljaa) | askel: matala vesi | wading water footsteps, small creature |
| oksa | `oksa_1`, `oksa_2` | ⬜ puuttuu (hiljaa) | oksa rasahtaa jalan alla (Aarnimetsä, välillä) | twig snap, branch crack footstep, small creature |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | ruumis kaatuu maahan kuollessa | body fall thud, animal collapse, small creature |
| tormays | `tormays_1`, `tormays_2` | ⬜ puuttuu (hiljaa) | törmää kovassa vauhdissa seinään, puuhun tai kiveen (myös tönäistynä) | body impact wall, thud bump, small creature |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, small creature |
| osuma | `osuma_1`, `osuma_2` | ⬜ puuttuu (hiljaa) | osuu pelaajaan (purema, kynsi, isku) | bite impact, claw hit flesh, small creature |
| nousu | `nousu_1`, `nousu_2` | ⬜ puuttuu (hiljaa) | nousee makuulta syntyessään (ähkäisy, rapina) | creature getting up, rustle grunt, small creature |

### 💀 Luurangot – `luurangot/` (0/16 ääntä)

Jäsenet: Kalmo, Kalmon ylimys.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: ruoho, maa, kangas, nummi | footstep grass dirt, skeleton bony |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset | footstep stone rock, skeleton bony |
| askel_hiekka | `askel_hiekka_1`, `askel_hiekka_2` | ⬜ puuttuu (hiljaa) | askel: hietaranta | footstep sand, skeleton bony |
| askel_lumi | `askel_lumi_1`, `askel_lumi_2` | ⬜ puuttuu (hiljaa) | askel: routahuiput | footstep snow crunch, skeleton bony |
| askel_suo | `askel_suo_1`, `askel_suo_2` | ⬜ puuttuu (hiljaa) | askel: upposuo, muta | footstep mud squelch swamp, skeleton bony |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ⬜ puuttuu (hiljaa) | askel: puurakennukset (lattiat, portaat) | footstep wood floor, skeleton bony |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ⬜ puuttuu (hiljaa) | askel: Routaluolan jää | footstep ice, skeleton bony |
| askel_pusikko | `askel_pusikko_1`, `askel_pusikko_2` | ⬜ puuttuu (hiljaa) | askel: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa) | walking through bushes leaves, skeleton bony |
| askel_kahlaus | `askel_kahlaus_1`, `askel_kahlaus_2` | ⬜ puuttuu (hiljaa) | askel: matala vesi | wading water footsteps, skeleton bony |
| oksa | `oksa_1`, `oksa_2` | ⬜ puuttuu (hiljaa) | oksa rasahtaa jalan alla (Aarnimetsä, välillä) | twig snap, branch crack footstep, skeleton bony |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | luut romahtavat kasaan kuollessa | skeleton collapse, bones falling |
| tormays | `tormays_1`, `tormays_2` | ⬜ puuttuu (hiljaa) | törmää kovassa vauhdissa seinään, puuhun tai kiveen (myös tönäistynä) | body impact wall, thud bump, skeleton bony |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, skeleton bony |
| osuma | `osuma_1`, `osuma_2` | ⬜ puuttuu (hiljaa) | osuu pelaajaan (purema, kynsi, isku) | bite impact, claw hit flesh, skeleton bony |
| nousu | `nousu_1`, `nousu_2` | ⬜ puuttuu (hiljaa) | nousee makuulta syntyessään (ähkäisy, rapina) | creature getting up, rustle grunt, skeleton bony |
| kalina | `kalina_1`, `kalina_2` | ⬜ puuttuu (hiljaa) | luut kalisevat liikkuessa (hiljainen, 1–1,6 s välein) | bones rattle, skeleton clatter soft, skeleton bony |

### 🐾 Nelijalkaiset – `nelijalkaiset/` (0/21 ääntä)

Jäsenet: Peura, Poro, Hirvi, Karju, Emakko, Susi, Routasusi, Kalmasusi, Ilves, Ahma.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: ruoho, maa, kangas, nummi | footstep grass dirt, animal hooves paws |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset | footstep stone rock, animal hooves paws |
| askel_hiekka | `askel_hiekka_1`, `askel_hiekka_2` | ⬜ puuttuu (hiljaa) | askel: hietaranta | footstep sand, animal hooves paws |
| askel_lumi | `askel_lumi_1`, `askel_lumi_2` | ⬜ puuttuu (hiljaa) | askel: routahuiput | footstep snow crunch, animal hooves paws |
| askel_suo | `askel_suo_1`, `askel_suo_2` | ⬜ puuttuu (hiljaa) | askel: upposuo, muta | footstep mud squelch swamp, animal hooves paws |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ⬜ puuttuu (hiljaa) | askel: puurakennukset (lattiat, portaat) | footstep wood floor, animal hooves paws |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ⬜ puuttuu (hiljaa) | askel: Routaluolan jää | footstep ice, animal hooves paws |
| askel_pusikko | `askel_pusikko_1`, `askel_pusikko_2` | ⬜ puuttuu (hiljaa) | askel: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa) | walking through bushes leaves, animal hooves paws |
| askel_kahlaus | `askel_kahlaus_1`, `askel_kahlaus_2` | ⬜ puuttuu (hiljaa) | askel: matala vesi | wading water footsteps, animal hooves paws |
| askel_uinti | `askel_uinti_1`, `askel_uinti_2` | ⬜ puuttuu (hiljaa) | askel: syvä vesi | animal swimming splash paddle, animal hooves paws |
| oksa | `oksa_1`, `oksa_2` | ⬜ puuttuu (hiljaa) | oksa rasahtaa jalan alla (Aarnimetsä, välillä) | twig snap, branch crack footstep, animal hooves paws |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | ruumis kaatuu maahan kuollessa | body fall thud, animal collapse, animal hooves paws |
| tormays | `tormays_1`, `tormays_2` | ⬜ puuttuu (hiljaa) | törmää kovassa vauhdissa seinään, puuhun tai kiveen (myös tönäistynä) | body impact wall, thud bump, animal hooves paws |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, animal hooves paws |
| osuma | `osuma_1`, `osuma_2` | ⬜ puuttuu (hiljaa) | osuu pelaajaan (purema, kynsi, isku) | bite impact, claw hit flesh, animal hooves paws |
| nousu | `nousu_1`, `nousu_2` | ⬜ puuttuu (hiljaa) | nousee makuulta syntyessään (ähkäisy, rapina) | creature getting up, rustle grunt, animal hooves paws |
| ravistus | `ravistus_1`, `ravistus_2` | ⬜ puuttuu (hiljaa) | ravistaa turkin vedestä noustessa | dog shake off water, fur shake, animal hooves paws |
| nuuhkiminen | `nuuhkiminen_1`, `nuuhkiminen_2` | ⬜ puuttuu (hiljaa) | nuuhkii uteliaana (kun katsoo sinua) | animal sniffing, sniff, animal hooves paws |
| syominen_laidun | `syominen_laidun_1`, `syominen_laidun_2` | ⬜ puuttuu (hiljaa) | laiduntaa: repii ja jauhaa ruohoa (peura, poro, hirvi) | deer grazing, grass chewing, animal hooves paws |
| syominen_tonkiminen | `syominen_tonkiminen_1`, `syominen_tonkiminen_2` | ⬜ puuttuu (hiljaa) | tonkii maata röhkien (karju, emakko, porsas) | pig rooting, boar snuffling dirt, animal hooves paws |
| syominen_rouskutus | `syominen_rouskutus_1`, `syominen_rouskutus_2` | ⬜ puuttuu (hiljaa) | kalvaa raatoa, luu rouskuu (sudet, karhu, ahma) | wolf gnawing bone, chewing meat, animal hooves paws |

### 🐻 Raskaat nelijalkaiset – `raskaat/` (0/18 ääntä)

Jäsenet: Karhu, Hiidenkarhu, Hiidenhirvi. Iso: kovempi, askeleet kuuluvat 40 m.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: ruoho, maa, kangas, nummi – raskas, kuuluu 40 m | footstep grass dirt, heavy animal bear |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset – raskas, kuuluu 40 m | footstep stone rock, heavy animal bear |
| askel_hiekka | `askel_hiekka_1`, `askel_hiekka_2` | ⬜ puuttuu (hiljaa) | askel: hietaranta – raskas, kuuluu 40 m | footstep sand, heavy animal bear |
| askel_lumi | `askel_lumi_1`, `askel_lumi_2` | ⬜ puuttuu (hiljaa) | askel: routahuiput – raskas, kuuluu 40 m | footstep snow crunch, heavy animal bear |
| askel_suo | `askel_suo_1`, `askel_suo_2` | ⬜ puuttuu (hiljaa) | askel: upposuo, muta – raskas, kuuluu 40 m | footstep mud squelch swamp, heavy animal bear |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ⬜ puuttuu (hiljaa) | askel: puurakennukset (lattiat, portaat) – raskas, kuuluu 40 m | footstep wood floor, heavy animal bear |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ⬜ puuttuu (hiljaa) | askel: Routaluolan jää – raskas, kuuluu 40 m | footstep ice, heavy animal bear |
| askel_pusikko | `askel_pusikko_1`, `askel_pusikko_2` | ⬜ puuttuu (hiljaa) | askel: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa) – raskas, kuuluu 40 m | walking through bushes leaves, heavy animal bear |
| askel_kahlaus | `askel_kahlaus_1`, `askel_kahlaus_2` | ⬜ puuttuu (hiljaa) | askel: matala vesi – raskas, kuuluu 40 m | wading water footsteps, heavy animal bear |
| askel_uinti | `askel_uinti_1`, `askel_uinti_2` | ⬜ puuttuu (hiljaa) | askel: syvä vesi – raskas, kuuluu 40 m | animal swimming splash paddle, heavy animal bear |
| oksa | `oksa_1`, `oksa_2` | ⬜ puuttuu (hiljaa) | oksa rasahtaa jalan alla (Aarnimetsä, välillä) | twig snap, branch crack footstep, heavy animal bear |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | ruumis kaatuu maahan kuollessa | body fall thud, animal collapse, heavy animal bear |
| tormays | `tormays_1`, `tormays_2` | ⬜ puuttuu (hiljaa) | törmää kovassa vauhdissa seinään, puuhun tai kiveen (myös tönäistynä) | body impact wall, thud bump, heavy animal bear |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, heavy animal bear |
| osuma | `osuma_1`, `osuma_2` | ⬜ puuttuu (hiljaa) | osuu pelaajaan (purema, kynsi, isku) | bite impact, claw hit flesh, heavy animal bear |
| nousu | `nousu_1`, `nousu_2` | ⬜ puuttuu (hiljaa) | nousee makuulta syntyessään (ähkäisy, rapina) | creature getting up, rustle grunt, heavy animal bear |
| ravistus | `ravistus_1`, `ravistus_2` | ⬜ puuttuu (hiljaa) | ravistaa turkin vedestä noustessa | dog shake off water, fur shake, heavy animal bear |
| syominen_rouskutus | `syominen_rouskutus_1`, `syominen_rouskutus_2` | ⬜ puuttuu (hiljaa) | kalvaa raatoa, luu rouskuu (sudet, karhu, ahma) | wolf gnawing bone, chewing meat, heavy animal bear |

### 🐇 Kevyet nelijalkaiset – `kevyet_nelijalkaiset/` (0/18 ääntä)

Jäsenet: Jänis, Kettu, Porsas.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: ruoho, maa, kangas, nummi | footstep grass dirt, small animal light |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset | footstep stone rock, small animal light |
| askel_hiekka | `askel_hiekka_1`, `askel_hiekka_2` | ⬜ puuttuu (hiljaa) | askel: hietaranta | footstep sand, small animal light |
| askel_lumi | `askel_lumi_1`, `askel_lumi_2` | ⬜ puuttuu (hiljaa) | askel: routahuiput | footstep snow crunch, small animal light |
| askel_suo | `askel_suo_1`, `askel_suo_2` | ⬜ puuttuu (hiljaa) | askel: upposuo, muta | footstep mud squelch swamp, small animal light |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ⬜ puuttuu (hiljaa) | askel: puurakennukset (lattiat, portaat) | footstep wood floor, small animal light |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ⬜ puuttuu (hiljaa) | askel: Routaluolan jää | footstep ice, small animal light |
| askel_pusikko | `askel_pusikko_1`, `askel_pusikko_2` | ⬜ puuttuu (hiljaa) | askel: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa) | walking through bushes leaves, small animal light |
| askel_kahlaus | `askel_kahlaus_1`, `askel_kahlaus_2` | ⬜ puuttuu (hiljaa) | askel: matala vesi | wading water footsteps, small animal light |
| askel_uinti | `askel_uinti_1`, `askel_uinti_2` | ⬜ puuttuu (hiljaa) | askel: syvä vesi | animal swimming splash paddle, small animal light |
| oksa | `oksa_1`, `oksa_2` | ⬜ puuttuu (hiljaa) | oksa rasahtaa jalan alla (Aarnimetsä, välillä) | twig snap, branch crack footstep, small animal light |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | ruumis kaatuu maahan kuollessa | body fall thud, animal collapse, small animal light |
| tormays | `tormays_1`, `tormays_2` | ⬜ puuttuu (hiljaa) | törmää kovassa vauhdissa seinään, puuhun tai kiveen (myös tönäistynä) | body impact wall, thud bump, small animal light |
| nousu | `nousu_1`, `nousu_2` | ⬜ puuttuu (hiljaa) | nousee makuulta syntyessään (ähkäisy, rapina) | creature getting up, rustle grunt, small animal light |
| ravistus | `ravistus_1`, `ravistus_2` | ⬜ puuttuu (hiljaa) | ravistaa turkin vedestä noustessa | dog shake off water, fur shake, small animal light |
| nuuhkiminen | `nuuhkiminen_1`, `nuuhkiminen_2` | ⬜ puuttuu (hiljaa) | nuuhkii uteliaana (kun katsoo sinua) | animal sniffing, sniff, small animal light |
| syominen_tonkiminen | `syominen_tonkiminen_1`, `syominen_tonkiminen_2` | ⬜ puuttuu (hiljaa) | tonkii maata röhkien (karju, emakko, porsas) | pig rooting, boar snuffling dirt, small animal light |
| syominen_nakerrus | `syominen_nakerrus_1`, `syominen_nakerrus_2` | ⬜ puuttuu (hiljaa) | nakertaa (jänis) | rabbit nibbling, gnawing, small animal light |

### 🐦 Kevyet kaksijalkaiset – `kevyet_kaksijalkaiset/` (0/12 ääntä)

Jäsenet: Metso.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: ruoho, maa, kangas, nummi | footstep grass dirt, bird hop light |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset | footstep stone rock, bird hop light |
| askel_hiekka | `askel_hiekka_1`, `askel_hiekka_2` | ⬜ puuttuu (hiljaa) | askel: hietaranta | footstep sand, bird hop light |
| askel_lumi | `askel_lumi_1`, `askel_lumi_2` | ⬜ puuttuu (hiljaa) | askel: routahuiput | footstep snow crunch, bird hop light |
| askel_suo | `askel_suo_1`, `askel_suo_2` | ⬜ puuttuu (hiljaa) | askel: upposuo, muta | footstep mud squelch swamp, bird hop light |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ⬜ puuttuu (hiljaa) | askel: puurakennukset (lattiat, portaat) | footstep wood floor, bird hop light |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ⬜ puuttuu (hiljaa) | askel: Routaluolan jää | footstep ice, bird hop light |
| askel_pusikko | `askel_pusikko_1`, `askel_pusikko_2` | ⬜ puuttuu (hiljaa) | askel: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa) | walking through bushes leaves, bird hop light |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | lintu putoaa ja höyhenet pöllähtävät | bird fall, feathers flutter |
| tormays | `tormays_1`, `tormays_2` | ⬜ puuttuu (hiljaa) | törmää kovassa vauhdissa seinään, puuhun tai kiveen (myös tönäistynä) | body impact wall, thud bump, bird hop light |
| nousu | `nousu_1`, `nousu_2` | ⬜ puuttuu (hiljaa) | nousee makuulta syntyessään (ähkäisy, rapina) | creature getting up, rustle grunt, bird hop light |
| lentoonlahto | `lentoonlahto_1`, `lentoonlahto_2` | ⬜ puuttuu (hiljaa) | lähtee lentoon (siivet räpyttävät) | grouse flush, bird wings takeoff flapping, bird hop light |

### 🪨 Kivivartija – `kivivartija/` (0/14 ääntä)

Jäsenet: Kivivartija. Iso: kovempi, askeleet kuuluvat 40 m.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2` | ⬜ puuttuu (hiljaa) | askel: ruoho, maa, kangas, nummi – raskas, kuuluu 40 m | footstep grass dirt, stone golem rock |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset – raskas, kuuluu 40 m | footstep stone rock, stone golem rock |
| askel_hiekka | `askel_hiekka_1`, `askel_hiekka_2` | ⬜ puuttuu (hiljaa) | askel: hietaranta – raskas, kuuluu 40 m | footstep sand, stone golem rock |
| askel_lumi | `askel_lumi_1`, `askel_lumi_2` | ⬜ puuttuu (hiljaa) | askel: routahuiput – raskas, kuuluu 40 m | footstep snow crunch, stone golem rock |
| askel_suo | `askel_suo_1`, `askel_suo_2` | ⬜ puuttuu (hiljaa) | askel: upposuo, muta – raskas, kuuluu 40 m | footstep mud squelch swamp, stone golem rock |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ⬜ puuttuu (hiljaa) | askel: puurakennukset (lattiat, portaat) – raskas, kuuluu 40 m | footstep wood floor, stone golem rock |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ⬜ puuttuu (hiljaa) | askel: Routaluolan jää – raskas, kuuluu 40 m | footstep ice, stone golem rock |
| askel_pusikko | `askel_pusikko_1`, `askel_pusikko_2` | ⬜ puuttuu (hiljaa) | askel: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa) – raskas, kuuluu 40 m | walking through bushes leaves, stone golem rock |
| askel_kahlaus | `askel_kahlaus_1`, `askel_kahlaus_2` | ⬜ puuttuu (hiljaa) | askel: matala vesi – raskas, kuuluu 40 m | wading water footsteps, stone golem rock |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | kivet romahtavat kasaan | rock golem collapse, stones crumble |
| tormays | `tormays_1`, `tormays_2` | ⬜ puuttuu (hiljaa) | törmää kovassa vauhdissa seinään, puuhun tai kiveen (myös tönäistynä) | body impact wall, thud bump, stone golem rock |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, stone golem rock |
| osuma | `osuma_1`, `osuma_2` | ⬜ puuttuu (hiljaa) | osuu pelaajaan (purema, kynsi, isku) | bite impact, claw hit flesh, stone golem rock |
| nousu | `nousu_1`, `nousu_2` | ⬜ puuttuu (hiljaa) | nousee makuulta syntyessään (ähkäisy, rapina) | creature getting up, rustle grunt, stone golem rock |

### 🗿 Kalmanvartija (pomo) – `kalmanvartija/` (0/7 ääntä)

Jäsenet: Kalmanvartija. Iso: kovempi, askeleet kuuluvat 40 m. Pomo: askeleet tärisyttävät maata (kamera tärähtää alle 15 m:ssä).

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: ruoho, maa, kangas, nummi – raskas, kuuluu 40 m | footstep grass dirt, giant stone heavy boom |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset – raskas, kuuluu 40 m | footstep stone rock, giant stone heavy boom |
| askel_suo | `askel_suo_1`, `askel_suo_2` | ⬜ puuttuu (hiljaa) | askel: upposuo, muta – raskas, kuuluu 40 m | footstep mud squelch swamp, giant stone heavy boom |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ⬜ puuttuu (hiljaa) | askel: puurakennukset (lattiat, portaat) – raskas, kuuluu 40 m | footstep wood floor, giant stone heavy boom |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | kivenlohkareet putoavat maahan (kova, raskas) | huge stones falling, heavy rock impact |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | valtava kivinen isku viuhuu | giant stone swing whoosh heavy |
| osuma | `osuma_1`, `osuma_2` | ⬜ puuttuu (hiljaa) | kivinen nyrkki murskaa | heavy stone punch impact |

### ❄️ Jäätär (pomo) – `jaatar/` (0/5 ääntä)

Jäsenet: Jäätär. Iso: kovempi, askeleet kuuluvat 40 m. Pomo: askeleet tärisyttävät maata (kamera tärähtää alle 15 m:ssä).

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: Routaluolan jää – raskas, kuuluu 40 m | footstep ice, ice giant crystal |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset – raskas, kuuluu 40 m | footstep stone rock, ice giant crystal |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | jääkappaleet putoavat ja särkyvät | ice chunks fall shatter |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, ice giant crystal |
| osuma | `osuma_1`, `osuma_2` | ⬜ puuttuu (hiljaa) | osuu pelaajaan (purema, kynsi, isku) | bite impact, claw hit flesh, ice giant crystal |

### 🔥 Kalmaherra (pomo) – `kalmaherra/` (0/4 ääntä)

Jäsenet: Kalmaherra. Iso: kovempi, askeleet kuuluvat 40 m. Pomo: askeleet tärisyttävät maata (kamera tärähtää alle 15 m:ssä).

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset – raskas, kuuluu 40 m | footstep stone rock, demon lord heavy |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | panssarin ja luiden palat putoavat | armor pieces fall, bones clatter heavy |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, demon lord heavy |
| osuma | `osuma_1`, `osuma_2` | ⬜ puuttuu (hiljaa) | osuu pelaajaan (purema, kynsi, isku) | bite impact, claw hit flesh, demon lord heavy |

### 🌳 Aarnihirviö (pomo) – `aarnihirvio/` (0/5 ääntä)

Jäsenet: Aarnihirviö. Iso: kovempi, askeleet kuuluvat 40 m. Pomo: askeleet tärisyttävät maata (kamera tärähtää alle 15 m:ssä).

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | askel: ruoho, maa, kangas, nummi – raskas, kuuluu 40 m | footstep grass dirt, giant tree creature wood |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2` | ⬜ puuttuu (hiljaa) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset – raskas, kuuluu 40 m | footstep stone rock, giant tree creature wood |
| kaatuminen | `kaatuminen_1`, `kaatuminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | puun kappaleet putoavat ja natisevat | wood chunks fall, timber crash |
| huitaisu | `huitaisu_1`, `huitaisu_2` | ⬜ puuttuu (hiljaa) | hyökkäyksen viuhahdus iskun hetkellä | swipe whoosh, claw swing, giant tree creature wood |
| osuma | `osuma_1`, `osuma_2` | ⬜ puuttuu (hiljaa) | osuu pelaajaan (purema, kynsi, isku) | bite impact, claw hit flesh, giant tree creature wood |

### 🌐 Yhteiset (kaikki olennot, sävel koon mukaan) – `yhteiset/` (0/3 ääntä)

Jäsenet: kaikki olennot.

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| palaminen | `palaminen_1`, `palaminen_2` | ⬜ puuttuu (hiljaa)<br>🎯 lisää ensin (kuuluu usein) | liekkien rätinä olennon palaessa (silmukka) | fire crackle loop, burning |
| kahina | `kahina_1`, `kahina_2` | ⬜ puuttuu (hiljaa) | juoksee pensaan tai heinikon läpi | bush rustle, running through foliage |
| loiskahdus | `loiskahdus_1`, `loiskahdus_2` | ⬜ puuttuu (hiljaa) | menee tai putoaa veteen | splash into water, body splash |
