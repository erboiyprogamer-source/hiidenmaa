# Hiidenmaan äänilista: pelaajan toiminnot

Projekti `sounds/pelaaja_toiminnot/` (v2.24). Taulukko päivittyy automaattisesti (`python3 tools/process_sounds.py`) – älä muokkaa käsin.
Olentojen äänet: `sounds/olennot_aanet/` (AANILISTA.md) ja `sounds/olennot_toiminnot/` (AANILISTA_TOIMINNOT.md).

## Kansiot

- `raw/<ryhmä>/<ääni>_<n>.mp3` – **sinun raa'at äänesi** (korvaa tiedosto täsmälleen samalla nimellä). Lisää versioita vapaasti `_3`, `_4` … – peli arpoo kaikista.
- `valmiit/<ryhmä>_valmis/…` – työkalun käsittelemät äänet, jotka peli lataa (älä muokkaa).
- **Aloitusäänet (v2.24):** kopioitu olentojen toimintokansiosta (kaksijalkaisten askeleet, kahlaus, uinti, yhteinen loiskahdus, osumat).
  Vaihda ne pelaajan omiin, kun löydät sopivat – olentojen äänet eivät muutu.
- Pelaajan äänet soivat pelaajan kohdalta ilman kaukoefektiä; voimakkuus: Asetukset › Ohjaus ja ääni › **Pelaajan äänet**.
- Askel soi jalan osuessa maahan (kävelyn tahdissa), uidessa uintiveto, veteen mennessä loiskahdus. Osumat: pelaajan isku osuu olentoon
  (nuija = murskaus, muut aseet ja nyrkki = isku), pelaajan nuoli osuu = nuoli. Olennon isku pelaajaan käyttää olentojen osumakansiota.

## Ryhmät (16/17 ääntä omilla äänillä)

### 👣 Askeleet (alustan mukaan) – `askeleet/`

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Milloin soi | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_ruoho | `askel_ruoho_1`, `askel_ruoho_2`, `askel_ruoho_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: ruoho, maa, kangas, nummi | player footstep grass dirt |
| askel_kivi | `askel_kivi_1`, `askel_kivi_2`, `askel_kivi_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset | player footstep stone rock |
| askel_hiekka | `askel_hiekka_1`, `askel_hiekka_2`, `askel_hiekka_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: hietaranta | player footstep sand |
| askel_lumi | `askel_lumi_1`, `askel_lumi_2`, `askel_lumi_3` | ✅ oma: _1, _2, _3 (3 kpl) | askel: routahuiput | player footstep snow crunch |
| askel_suo | `askel_suo_1`, `askel_suo_2`, `askel_suo_3` | ✅ oma: _1, _2, _3 (3 kpl) + 4 pätkää pitkästä nauhoituksesta | askel: upposuo, muta | player footstep mud squelch swamp |
| askel_puu | `askel_puu_1`, `askel_puu_2` | ✅ oma: _1, _2 (2 kpl) | askel: puurakennukset (lattiat, portaat) | player footstep wood floor |
| askel_jaa | `askel_jaa_1`, `askel_jaa_2` | ✅ oma: _1 (1 kpl) | askel: Routaluolan jää | player footstep ice |
| askel_pusikko | `askel_pusikko_1`, `askel_pusikko_2` | ✅ oma: _1 (1 kpl) | askel: Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa) | walking through bushes leaves |

### 💧 Vesi – `vesi/`

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Milloin soi | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| askel_kahlaus | `askel_kahlaus_1`, `askel_kahlaus_2` | ✅ oma: _1 (1 kpl) + 4 pätkää pitkästä nauhoituksesta | kahlaa matalassa vedessä (joka askeleella) | wading water footsteps |
| askel_uinti | `askel_uinti_1`, `askel_uinti_2`, `askel_uinti_3` | ✅ oma: _1, _2, _3 (3 kpl) | uintiveto (noin kerran sekunnissa uidessa) | swimming stroke splash |
| loiskahdus | `loiskahdus_1`, `loiskahdus_2` | ✅ oma: _1, _2 (2 kpl) | menee tai putoaa veteen (kova pudotus = isompi) | splash into water, jump into water |

### 💥 Osumat – pelaajan isku tai nuoli osuu olentoon – `osumat/`

| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Milloin soi | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- |
| osuma_raapaisu | `osuma_raapaisu_1`, `osuma_raapaisu_2` | ✅ oma: _1, _2 (2 kpl) | varalla (ei vielä käytössä) | slash flesh |
| osuma_purema | `osuma_purema_1`, `osuma_purema_2` | ✅ oma: _1, _2 (2 kpl) | varalla (ei vielä käytössä) | bite |
| osuma_murskaus | `osuma_murskaus_1`, `osuma_murskaus_2` | ✅ oma: _1, _2 (2 kpl) | nuija osuu olentoon (murskaava isku) | club hit, blunt impact body |
| osuma_sarvet | `osuma_sarvet_1`, `osuma_sarvet_2` | ⬜ puuttuu (hiljaa) | varalla (ei vielä käytössä) | ram impact |
| osuma_isku | `osuma_isku_1`, `osuma_isku_2` | ✅ oma: _1, _2 (2 kpl) | miekka, kirves, keihäs, hakku tai nyrkki osuu olentoon | sword hit flesh, axe hit body |
| osuma_nuoli | `osuma_nuoli_1`, `osuma_nuoli_2` | ✅ oma: _1, _2 (2 kpl) | pelaajan nuoli osuu olentoon | arrow hit flesh, arrow impact |
