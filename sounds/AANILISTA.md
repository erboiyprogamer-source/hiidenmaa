# Hiidenmaan äänilista

Äänisuunnitelma: `docs/KEHITYSMUISTIO.md` → "Äänisuunnitelma". Tämä taulukko päivittyy automaattisesti
(`python3 tools/process_sounds.py`) – älä muokkaa taulukkoa käsin.

## Näin lisäät äänen

1. Etsi ääni (CC0 / vapaa käyttö): **Kenney** (kenney.nl), **Pixabay** (pixabay.com/sound-effects), **Freesound** (CC0-suodatin),
   **OpenGameArt**. Käytä alla olevia hakusanoja.
2. **Kuuntele ääni omalla koneellasi** ennen lisäämistä – git-historia muistaa jokaisen version, joten vaihda vain harkiten.
3. Korvaa paikkamerkki `sounds/raw/`-kansiossa **täsmälleen samalla nimellä** (esim. `susi_aggro_1.mp3`). Jokaisella äänellä on kolme paikkaa
   `_1`, `_2`, `_3`: täytä vain ne jotka haluat – peli arpoo olemassa olevista (yksi riittää, tyhjät paikat ohitetaan). Lyhyet äänet saa olla wav
   (pääte voi jäädä .mp3 – muoto tunnistetaan sisällöstä), pitkät (musiikki, loopit) mp3, alle 25 Mt.
4. Commit ja push GitHub Desktopilla ja pyydä Claudea ajamaan `python3 tools/process_sounds.py`: ääni normalisoidaan,
   hiljaisuus leikataan ja se siirtyy peliin (`sounds/<nimi>.mp3`). Raakatiedostot jäävät `sounds/raw/`-kansioon.

**Tilat:** ✅ oma ääni · 🔁 väliaikainen varaääni toiselta olennolta (sävelkorkeutta muutettu) · ⬜ puuttuu (peli käyttää tehtyä
ääntä tai on hiljaa). ⭐ = tämän olennon äänet toimivat varaäänenä luetelluille – lisää nämä ensin, niin moni olento saa äänen.
Varaäänet ovat vain väliaikaisia: jokaiselle olennolle kannattaa lopulta lisätä omat äänet.

## Äänierä A: olennot (0/112 äänilajia omilla äänillä)

### Eläimet

| Olento | Ääni | Tiedostot (1–3 versiota) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- | --- |
| **Peura** (`peura`) ⭐ varaääni: poro | idle | `peura_idle_1`, `peura_idle_2`, `peura_idle_3` | ⬜ puuttuu (varalla: hirvi) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – metsäkauris, arka | deer snort, deer bleat soft |
|  | hurt | `peura_hurt_1`, `peura_hurt_2`, `peura_hurt_3` | ⬜ puuttuu (varalla: hirvi) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – metsäkauris, arka | deer distress call |
|  | death | `peura_death_1`, `peura_death_2`, `peura_death_3` | ⬜ puuttuu (varalla: hirvi) | kuoleman ääni (0,8–2,5 s) – metsäkauris, arka | deer death cry |
| **Villikarju** (`karju`) ⭐ varaääni: emakko, porsas | idle | `karju_idle_1`, `karju_idle_2`, `karju_idle_3` | ⬜ puuttuu | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – villisika, karju | wild boar grunt |
|  | hurt | `karju_hurt_1`, `karju_hurt_2`, `karju_hurt_3` | ⬜ puuttuu | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – villisika, karju | boar squeal pain |
|  | death | `karju_death_1`, `karju_death_2`, `karju_death_3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – villisika, karju | boar death squeal |
|  | aggro | `karju_aggro_1`, `karju_aggro_2`, `karju_aggro_3` | ⬜ puuttuu | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – villisika, karju | boar angry grunt charge |
| **Metsäjänis** (`janis`) | idle | `janis_idle_1`, `janis_idle_2`, `janis_idle_3` | ⬜ puuttuu (varalla: kettu) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – metsäjänis, lähes äänetön | rabbit sniff, rabbit foot thump |
|  | hurt | `janis_hurt_1`, `janis_hurt_2`, `janis_hurt_3` | ⬜ puuttuu (varalla: kettu) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – metsäjänis, lähes äänetön | rabbit squeal |
|  | death | `janis_death_1`, `janis_death_2`, `janis_death_3` | ⬜ puuttuu (varalla: kettu) | kuoleman ääni (0,8–2,5 s) – metsäjänis, lähes äänetön | rabbit scream short |
| **Kettu** (`kettu`) ⭐ varaääni: janis | idle | `kettu_idle_1`, `kettu_idle_2`, `kettu_idle_3` | ⬜ puuttuu (varalla: susi) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – kettu, kimeä | fox yip, fox bark |
|  | hurt | `kettu_hurt_1`, `kettu_hurt_2`, `kettu_hurt_3` | ⬜ puuttuu (varalla: susi) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – kettu, kimeä | fox yelp |
|  | death | `kettu_death_1`, `kettu_death_2`, `kettu_death_3` | ⬜ puuttuu (varalla: susi) | kuoleman ääni (0,8–2,5 s) – kettu, kimeä | fox whimper death |
| **Metso** (`metso`) | idle | `metso_idle_1`, `metso_idle_2`, `metso_idle_3` | ⬜ puuttuu | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – metso, iso metsäkanalintu | capercaillie call, grouse clucking |
|  | hurt | `metso_hurt_1`, `metso_hurt_2`, `metso_hurt_3` | ⬜ puuttuu | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – metso, iso metsäkanalintu | bird squawk pain |
|  | death | `metso_death_1`, `metso_death_2`, `metso_death_3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – metso, iso metsäkanalintu | bird distress flutter |
| **Poro** (`poro`) | idle | `poro_idle_1`, `poro_idle_2`, `poro_idle_3` | ⬜ puuttuu (varalla: peura) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – poro, matala röhkintä | reindeer grunt, reindeer snort |
|  | hurt | `poro_hurt_1`, `poro_hurt_2`, `poro_hurt_3` | ⬜ puuttuu (varalla: peura) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – poro, matala röhkintä | reindeer grunt pain |
|  | death | `poro_death_1`, `poro_death_2`, `poro_death_3` | ⬜ puuttuu (varalla: peura) | kuoleman ääni (0,8–2,5 s) – poro, matala röhkintä | deer death groan |
| **Hirvi** (`hirvi`) ⭐ varaääni: hiidenhirvi, peura | idle | `hirvi_idle_1`, `hirvi_idle_2`, `hirvi_idle_3` | ⬜ puuttuu | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – hirvi, suuri ja matala | moose call, moose grunt |
|  | hurt | `hirvi_hurt_1`, `hirvi_hurt_2`, `hirvi_hurt_3` | ⬜ puuttuu | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – hirvi, suuri ja matala | moose bellow pain |
|  | death | `hirvi_death_1`, `hirvi_death_2`, `hirvi_death_3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – hirvi, suuri ja matala | moose death groan |
|  | aggro | `hirvi_aggro_1`, `hirvi_aggro_2`, `hirvi_aggro_3` | ⬜ puuttuu | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – hirvi, suuri ja matala | moose bellow angry |
| **Ilves** (`ilves`) ⭐ varaääni: ahma | idle | `ilves_idle_1`, `ilves_idle_2`, `ilves_idle_3` | ⬜ puuttuu (varalla: susi) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – ilves, kissapeto | lynx growl soft, bobcat purr growl |
|  | hurt | `ilves_hurt_1`, `ilves_hurt_2`, `ilves_hurt_3` | ⬜ puuttuu (varalla: susi) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – ilves, kissapeto | cat hiss yowl |
|  | death | `ilves_death_1`, `ilves_death_2`, `ilves_death_3` | ⬜ puuttuu (varalla: susi) | kuoleman ääni (0,8–2,5 s) – ilves, kissapeto | big cat death |
|  | aggro | `ilves_aggro_1`, `ilves_aggro_2`, `ilves_aggro_3` | ⬜ puuttuu (varalla: susi) | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – ilves, kissapeto | lynx hiss snarl |
| **Ahma** (`ahma`) | idle | `ahma_idle_1`, `ahma_idle_2`, `ahma_idle_3` | ⬜ puuttuu (varalla: ilves) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – ahma, pieni raivokas peto | wolverine growl, badger grunt |
|  | hurt | `ahma_hurt_1`, `ahma_hurt_2`, `ahma_hurt_3` | ⬜ puuttuu (varalla: ilves) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – ahma, pieni raivokas peto | animal snarl pain |
|  | death | `ahma_death_1`, `ahma_death_2`, `ahma_death_3` | ⬜ puuttuu (varalla: ilves) | kuoleman ääni (0,8–2,5 s) – ahma, pieni raivokas peto | small animal death growl |
|  | aggro | `ahma_aggro_1`, `ahma_aggro_2`, `ahma_aggro_3` | ⬜ puuttuu (varalla: ilves) | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – ahma, pieni raivokas peto | wolverine snarl |
| **Villikarjuemakko** (`emakko`) | idle | `emakko_idle_1`, `emakko_idle_2`, `emakko_idle_3` | ⬜ puuttuu (varalla: karju) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – villisikaemakko | pig oink grunt |
|  | hurt | `emakko_hurt_1`, `emakko_hurt_2`, `emakko_hurt_3` | ⬜ puuttuu (varalla: karju) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – villisikaemakko | pig squeal |
|  | death | `emakko_death_1`, `emakko_death_2`, `emakko_death_3` | ⬜ puuttuu (varalla: karju) | kuoleman ääni (0,8–2,5 s) – villisikaemakko | pig death squeal |
|  | aggro | `emakko_aggro_1`, `emakko_aggro_2`, `emakko_aggro_3` | ⬜ puuttuu (varalla: karju) | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – villisikaemakko | pig angry grunt |
| **Porsas** (`porsas`) | idle | `porsas_idle_1`, `porsas_idle_2`, `porsas_idle_3` | ⬜ puuttuu (varalla: karju) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – porsas, kimeä | piglet oink |
|  | hurt | `porsas_hurt_1`, `porsas_hurt_2`, `porsas_hurt_3` | ⬜ puuttuu (varalla: karju) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – porsas, kimeä | piglet squeal |
|  | death | `porsas_death_1`, `porsas_death_2`, `porsas_death_3` | ⬜ puuttuu (varalla: karju) | kuoleman ääni (0,8–2,5 s) – porsas, kimeä | piglet squeal short |
| **Karhu** (`karhu`) ⭐ varaääni: hiidenkarhu | idle | `karhu_idle_1`, `karhu_idle_2`, `karhu_idle_3` | ⬜ puuttuu | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – karhu, raskas | bear grunt sniff |
|  | hurt | `karhu_hurt_1`, `karhu_hurt_2`, `karhu_hurt_3` | ⬜ puuttuu | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – karhu, raskas | bear roar pain |
|  | death | `karhu_death_1`, `karhu_death_2`, `karhu_death_3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – karhu, raskas | bear death groan |
|  | aggro | `karhu_aggro_1`, `karhu_aggro_2`, `karhu_aggro_3` | ⬜ puuttuu | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – karhu, raskas | bear roar angry |

### Viholliset

| Olento | Ääni | Tiedostot (1–3 versiota) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- | --- |
| **Hiidenkarhu** (`hiidenkarhu`) | idle | `hiidenkarhu_idle_1`, `hiidenkarhu_idle_2`, `hiidenkarhu_idle_3` | ⬜ puuttuu (varalla: karhu) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – hiiden turmelema karhu, synkkä ja matala | monster bear growl low |
|  | hurt | `hiidenkarhu_hurt_1`, `hiidenkarhu_hurt_2`, `hiidenkarhu_hurt_3` | ⬜ puuttuu (varalla: karhu) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – hiiden turmelema karhu, synkkä ja matala | beast roar pain |
|  | death | `hiidenkarhu_death_1`, `hiidenkarhu_death_2`, `hiidenkarhu_death_3` | ⬜ puuttuu (varalla: karhu) | kuoleman ääni (0,8–2,5 s) – hiiden turmelema karhu, synkkä ja matala | monster death roar |
|  | aggro | `hiidenkarhu_aggro_1`, `hiidenkarhu_aggro_2`, `hiidenkarhu_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – hiiden turmelema karhu, synkkä ja matala | monster bear roar |
|  | chase | `hiidenkarhu_chase_1`, `hiidenkarhu_chase_2`, `hiidenkarhu_chase_3` | ⬜ puuttuu (varalla: karhu) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – hiiden turmelema karhu, synkkä ja matala | monster bear roar |
| **Hiidenhirvi** (`hiidenhirvi`) ⭐ varaääni: aarnihirvio | idle | `hiidenhirvi_idle_1`, `hiidenhirvi_idle_2`, `hiidenhirvi_idle_3` | ⬜ puuttuu (varalla: hirvi) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – hiiden turmelema hirvi, aavemainen | eerie deep moose call creature |
|  | hurt | `hiidenhirvi_hurt_1`, `hiidenhirvi_hurt_2`, `hiidenhirvi_hurt_3` | ⬜ puuttuu (varalla: hirvi) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – hiiden turmelema hirvi, aavemainen | monster bellow pain |
|  | death | `hiidenhirvi_death_1`, `hiidenhirvi_death_2`, `hiidenhirvi_death_3` | ⬜ puuttuu (varalla: hirvi) | kuoleman ääni (0,8–2,5 s) – hiiden turmelema hirvi, aavemainen | creature death groan |
|  | aggro | `hiidenhirvi_aggro_1`, `hiidenhirvi_aggro_2`, `hiidenhirvi_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – hiiden turmelema hirvi, aavemainen | monster elk bellow roar |
|  | chase | `hiidenhirvi_chase_1`, `hiidenhirvi_chase_2`, `hiidenhirvi_chase_3` | ⬜ puuttuu (varalla: hirvi) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – hiiden turmelema hirvi, aavemainen | monster elk bellow roar |
| **Kalmasusi** (`kalmasusi`) | idle | `kalmasusi_idle_1`, `kalmasusi_idle_2`, `kalmasusi_idle_3` | ⬜ puuttuu (varalla: susi) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – kalmasusi, epäkuollut susi | zombie wolf growl, ghost wolf breath |
|  | hurt | `kalmasusi_hurt_1`, `kalmasusi_hurt_2`, `kalmasusi_hurt_3` | ⬜ puuttuu (varalla: susi) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – kalmasusi, epäkuollut susi | wolf yelp distorted |
|  | death | `kalmasusi_death_1`, `kalmasusi_death_2`, `kalmasusi_death_3` | ⬜ puuttuu (varalla: susi) | kuoleman ääni (0,8–2,5 s) – kalmasusi, epäkuollut susi | undead creature death |
|  | aggro | `kalmasusi_aggro_1`, `kalmasusi_aggro_2`, `kalmasusi_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – kalmasusi, epäkuollut susi | eerie wolf howl |
|  | chase | `kalmasusi_chase_1`, `kalmasusi_chase_2`, `kalmasusi_chase_3` | ⬜ puuttuu (varalla: susi) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – kalmasusi, epäkuollut susi | eerie wolf howl |
| **Suonäkki** (`suonakki`) | idle | `suonakki_idle_1`, `suonakki_idle_2`, `suonakki_idle_3` | ⬜ puuttuu (varalla: hiisi) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – suon olento, kurlaava | swamp monster gurgle, water creature bubbles |
|  | hurt | `suonakki_hurt_1`, `suonakki_hurt_2`, `suonakki_hurt_3` | ⬜ puuttuu (varalla: hiisi) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – suon olento, kurlaava | creature gurgle scream |
|  | death | `suonakki_death_1`, `suonakki_death_2`, `suonakki_death_3` | ⬜ puuttuu (varalla: hiisi) | kuoleman ääni (0,8–2,5 s) – suon olento, kurlaava | monster death gurgle |
|  | aggro | `suonakki_aggro_1`, `suonakki_aggro_2`, `suonakki_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – suon olento, kurlaava | swamp monster roar |
|  | chase | `suonakki_chase_1`, `suonakki_chase_2`, `suonakki_chase_3` | ⬜ puuttuu (varalla: hiisi) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – suon olento, kurlaava | swamp monster roar |
| **Sammalhiisi** (`hiisi`) ⭐ varaääni: suonakki | idle | `hiisi_idle_1`, `hiisi_idle_2`, `hiisi_idle_3` | ⬜ puuttuu | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – sammalhiisi, pieni ilkeä metsän olento | goblin chatter, troll mumble |
|  | hurt | `hiisi_hurt_1`, `hiisi_hurt_2`, `hiisi_hurt_3` | ⬜ puuttuu | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – sammalhiisi, pieni ilkeä metsän olento | goblin hurt |
|  | death | `hiisi_death_1`, `hiisi_death_2`, `hiisi_death_3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – sammalhiisi, pieni ilkeä metsän olento | goblin death |
|  | aggro | `hiisi_aggro_1`, `hiisi_aggro_2`, `hiisi_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – sammalhiisi, pieni ilkeä metsän olento | goblin attack yell |
|  | chase | `hiisi_chase_1`, `hiisi_chase_2`, `hiisi_chase_3` | ⬜ puuttuu | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – sammalhiisi, pieni ilkeä metsän olento | goblin attack yell |
| **Harmaasusi** (`susi`) ⭐ varaääni: ilves, kalmasusi, kettu, routasusi | idle | `susi_idle_1`, `susi_idle_2`, `susi_idle_3` | ⬜ puuttuu | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – harmaasusi | wolf growl, wolf panting |
|  | hurt | `susi_hurt_1`, `susi_hurt_2`, `susi_hurt_3` | ⬜ puuttuu | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – harmaasusi | wolf yelp |
|  | death | `susi_death_1`, `susi_death_2`, `susi_death_3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – harmaasusi | wolf death whimper |
|  | aggro | `susi_aggro_1`, `susi_aggro_2`, `susi_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – harmaasusi | wolf snarl bark |
|  | chase | `susi_chase_1`, `susi_chase_2`, `susi_chase_3` | ⬜ puuttuu | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – harmaasusi | wolf snarl bark |
| **Kalmo** (`kalmo`) ⭐ varaääni: vartija, ylimys | idle | `kalmo_idle_1`, `kalmo_idle_2`, `kalmo_idle_3` | ⬜ puuttuu | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – kalmo, epäkuollut soturi | zombie groan, skeleton rattle |
|  | hurt | `kalmo_hurt_1`, `kalmo_hurt_2`, `kalmo_hurt_3` | ⬜ puuttuu | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – kalmo, epäkuollut soturi | zombie hurt |
|  | death | `kalmo_death_1`, `kalmo_death_2`, `kalmo_death_3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – kalmo, epäkuollut soturi | zombie death, bones collapse |
|  | aggro | `kalmo_aggro_1`, `kalmo_aggro_2`, `kalmo_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – kalmo, epäkuollut soturi | zombie scream attack |
|  | chase | `kalmo_chase_1`, `kalmo_chase_2`, `kalmo_chase_3` | ⬜ puuttuu | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – kalmo, epäkuollut soturi | zombie scream attack |
| **Kalmon ylimys** (`ylimys`) ⭐ varaääni: jaajattari, kalmaherra | idle | `ylimys_idle_1`, `ylimys_idle_2`, `ylimys_idle_3` | ⬜ puuttuu (varalla: kalmo) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – kalmon ylimys, kuiskiva epäkuollut | undead whisper groan, lich breath |
|  | hurt | `ylimys_hurt_1`, `ylimys_hurt_2`, `ylimys_hurt_3` | ⬜ puuttuu (varalla: kalmo) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – kalmon ylimys, kuiskiva epäkuollut | ghoul hurt |
|  | death | `ylimys_death_1`, `ylimys_death_2`, `ylimys_death_3` | ⬜ puuttuu (varalla: kalmo) | kuoleman ääni (0,8–2,5 s) – kalmon ylimys, kuiskiva epäkuollut | undead death scream |
|  | aggro | `ylimys_aggro_1`, `ylimys_aggro_2`, `ylimys_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – kalmon ylimys, kuiskiva epäkuollut | lich shout |
|  | chase | `ylimys_chase_1`, `ylimys_chase_2`, `ylimys_chase_3` | ⬜ puuttuu (varalla: kalmo) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – kalmon ylimys, kuiskiva epäkuollut | lich shout |
| **Kivivartija** (`kivivartija`) | idle | `kivivartija_idle_1`, `kivivartija_idle_2`, `kivivartija_idle_3` | ⬜ puuttuu (varalla: vartija) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – kivivartija, kivinen golem | stone grind, rock golem rumble |
|  | hurt | `kivivartija_hurt_1`, `kivivartija_hurt_2`, `kivivartija_hurt_3` | ⬜ puuttuu (varalla: vartija) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – kivivartija, kivinen golem | rock impact crack |
|  | death | `kivivartija_death_1`, `kivivartija_death_2`, `kivivartija_death_3` | ⬜ puuttuu (varalla: vartija) | kuoleman ääni (0,8–2,5 s) – kivivartija, kivinen golem | rock crumble collapse |
|  | aggro | `kivivartija_aggro_1`, `kivivartija_aggro_2`, `kivivartija_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – kivivartija, kivinen golem | golem roar stone |
|  | chase | `kivivartija_chase_1`, `kivivartija_chase_2`, `kivivartija_chase_3` | ⬜ puuttuu (varalla: vartija) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – kivivartija, kivinen golem | golem roar stone |
| **Routasusi** (`routasusi`) | idle | `routasusi_idle_1`, `routasusi_idle_2`, `routasusi_idle_3` | ⬜ puuttuu (varalla: susi) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – routasusi, jäinen susi | wolf growl cold breath |
|  | hurt | `routasusi_hurt_1`, `routasusi_hurt_2`, `routasusi_hurt_3` | ⬜ puuttuu (varalla: susi) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – routasusi, jäinen susi | wolf yelp |
|  | death | `routasusi_death_1`, `routasusi_death_2`, `routasusi_death_3` | ⬜ puuttuu (varalla: susi) | kuoleman ääni (0,8–2,5 s) – routasusi, jäinen susi | wolf whimper death |
|  | aggro | `routasusi_aggro_1`, `routasusi_aggro_2`, `routasusi_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – routasusi, jäinen susi | wolf howl |
|  | chase | `routasusi_chase_1`, `routasusi_chase_2`, `routasusi_chase_3` | ⬜ puuttuu (varalla: susi) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – routasusi, jäinen susi | wolf howl |

### Pomot

| Olento | Ääni | Tiedostot (1–3 versiota) | Tila | Millainen ääni | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- | --- |
| **Kalmanvartija** (`vartija`) ⭐ varaääni: kivivartija | idle | `vartija_idle_1`, `vartija_idle_2`, `vartija_idle_3` | ⬜ puuttuu (varalla: kalmo) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – Kalmanvartija, valtava pomo | giant breathing, deep monster breath |
|  | hurt | `vartija_hurt_1`, `vartija_hurt_2`, `vartija_hurt_3` | ⬜ puuttuu (varalla: kalmo) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – Kalmanvartija, valtava pomo | giant hurt roar |
|  | death | `vartija_death_1`, `vartija_death_2`, `vartija_death_3` | ⬜ puuttuu (varalla: kalmo) | kuoleman ääni (0,8–2,5 s) – Kalmanvartija, valtava pomo | boss death roar |
|  | aggro | `vartija_aggro_1`, `vartija_aggro_2`, `vartija_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – Kalmanvartija, valtava pomo | boss monster roar |
|  | chase | `vartija_chase_1`, `vartija_chase_2`, `vartija_chase_3` | ⬜ puuttuu (varalla: kalmo) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – Kalmanvartija, valtava pomo | boss monster roar |
| **Jäätär** (`jaajattari`) | idle | `jaajattari_idle_1`, `jaajattari_idle_2`, `jaajattari_idle_3` | ⬜ puuttuu (varalla: ylimys) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – Jäätär, jäinen noita (pomo) | ice witch whisper, cold wind voice |
|  | hurt | `jaajattari_hurt_1`, `jaajattari_hurt_2`, `jaajattari_hurt_3` | ⬜ puuttuu (varalla: ylimys) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – Jäätär, jäinen noita (pomo) | female monster scream |
|  | death | `jaajattari_death_1`, `jaajattari_death_2`, `jaajattari_death_3` | ⬜ puuttuu (varalla: ylimys) | kuoleman ääni (0,8–2,5 s) – Jäätär, jäinen noita (pomo) | witch death scream, ice shatter |
|  | aggro | `jaajattari_aggro_1`, `jaajattari_aggro_2`, `jaajattari_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – Jäätär, jäinen noita (pomo) | evil witch laugh |
|  | chase | `jaajattari_chase_1`, `jaajattari_chase_2`, `jaajattari_chase_3` | ⬜ puuttuu (varalla: ylimys) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – Jäätär, jäinen noita (pomo) | evil witch laugh |
| **Kalmaherra** (`kalmaherra`) | idle | `kalmaherra_idle_1`, `kalmaherra_idle_2`, `kalmaherra_idle_3` | ⬜ puuttuu (varalla: ylimys) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – Kalmaherra, kalmojen valtias (pomo) | deep demon whisper |
|  | hurt | `kalmaherra_hurt_1`, `kalmaherra_hurt_2`, `kalmaherra_hurt_3` | ⬜ puuttuu (varalla: ylimys) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – Kalmaherra, kalmojen valtias (pomo) | demon hurt roar |
|  | death | `kalmaherra_death_1`, `kalmaherra_death_2`, `kalmaherra_death_3` | ⬜ puuttuu (varalla: ylimys) | kuoleman ääni (0,8–2,5 s) – Kalmaherra, kalmojen valtias (pomo) | demon death roar |
|  | aggro | `kalmaherra_aggro_1`, `kalmaherra_aggro_2`, `kalmaherra_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – Kalmaherra, kalmojen valtias (pomo) | demon lord roar |
|  | chase | `kalmaherra_chase_1`, `kalmaherra_chase_2`, `kalmaherra_chase_3` | ⬜ puuttuu (varalla: ylimys) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – Kalmaherra, kalmojen valtias (pomo) | demon lord roar |
| **Aarnihirviö** (`aarnihirvio`) | idle | `aarnihirvio_idle_1`, `aarnihirvio_idle_2`, `aarnihirvio_idle_3` | ⬜ puuttuu (varalla: hiidenhirvi) | rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s) – Aarnihirviö, metsän hirviö (pomo) | forest monster creak, tree creature groan |
|  | hurt | `aarnihirvio_hurt_1`, `aarnihirvio_hurt_2`, `aarnihirvio_hurt_3` | ⬜ puuttuu (varalla: hiidenhirvi) | lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s) – Aarnihirviö, metsän hirviö (pomo) | monster roar wood creak |
|  | death | `aarnihirvio_death_1`, `aarnihirvio_death_2`, `aarnihirvio_death_3` | ⬜ puuttuu (varalla: hiidenhirvi) | kuoleman ääni (0,8–2,5 s) – Aarnihirviö, metsän hirviö (pomo) | giant tree creature death |
|  | aggro | `aarnihirvio_aggro_1`, `aarnihirvio_aggro_2`, `aarnihirvio_aggro_3` | ⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti | SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s) – Aarnihirviö, metsän hirviö (pomo) | forest monster roar |
|  | chase | `aarnihirvio_chase_1`, `aarnihirvio_chase_2`, `aarnihirvio_chase_3` | ⬜ puuttuu (varalla: hiidenhirvi) | JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s) – Aarnihirviö, metsän hirviö (pomo) | forest monster roar |

## Tulevat äänierät

B pelaajan ja toimintojen äänet · C taustaäänet ja sää · D musiikki · E äänifysiikka (ks. kehitysmuistion ideajono). Jokainen erä saa tähän oman osionsa.
