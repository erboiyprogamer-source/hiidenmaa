# Hiidenmaan äänilista

Äänisuunnitelma: `docs/KEHITYSMUISTIO.md` → "Äänisuunnitelma". Tämä taulukko päivittyy automaattisesti
(`python3 tools/process_sounds.py`) – älä muokkaa taulukkoa käsin.

## Näin lisäät äänen

1. Etsi ääni (CC0 / vapaa käyttö): **Kenney** (kenney.nl), **Pixabay** (pixabay.com/sound-effects), **Freesound** (CC0-suodatin),
   **OpenGameArt**. Käytä alla olevia hakusanoja.
2. **Kuuntele ääni omalla koneellasi** ennen lisäämistä – git-historia muistaa jokaisen version, joten vaihda vain harkiten.
3. Korvaa paikkamerkki `sounds/raw/`-kansiossa **täsmälleen samalla nimellä** (esim. `susi_aggro_1.mp3`). Lyhyet äänet saa olla wav
   (pääte voi jäädä .mp3 – muoto tunnistetaan sisällöstä), pitkät (musiikki, loopit) mp3, alle 25 Mt.
4. Commit ja push GitHub Desktopilla ja pyydä Claudea ajamaan `python3 tools/process_sounds.py`: ääni normalisoidaan,
   hiljaisuus leikataan ja se siirtyy peliin (`sounds/<nimi>.mp3`). Raakatiedostot jäävät `sounds/raw/`-kansioon.

**Tilat:** ✅ oma ääni · 🔁 väliaikainen varaääni toiselta olennolta (sävelkorkeutta muutettu) · ⬜ puuttuu (peli käyttää tehtyä
ääntä tai on hiljaa). ⭐ = tämän olennon äänet toimivat varaäänenä luetelluille – lisää nämä ensin, niin moni olento saa äänen.
Varaäänet ovat vain väliaikaisia: jokaiselle olennolle kannattaa lopulta lisätä omat äänet.

## Äänierä A: olennot (0/124 omaa ääntä)

### Eläimet

| Olento | Ääni | Tiedosto | Tila | Kuvaus | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- | --- |
| **Peura** (`peura`) ⭐ varaääni: poro | idle_1 | `sounds/raw/peura_idle_1.mp3` | ⬜ puuttuu (varalla: hirvi) | rauhallinen ääntely (0,5–2 s) – metsäkauris, arka | deer snort, deer bleat soft |
|  | idle_2 | `sounds/raw/peura_idle_2.mp3` | ⬜ puuttuu (varalla: hirvi) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – metsäkauris, arka | deer snort, deer bleat soft |
|  | hurt_1 | `sounds/raw/peura_hurt_1.mp3` | ⬜ puuttuu (varalla: hirvi) | lyhyt kivun ääni (0,2–0,8 s) – metsäkauris, arka | deer distress call |
|  | death_1 | `sounds/raw/peura_death_1.mp3` | ⬜ puuttuu (varalla: hirvi) | kuoleman ääni (0,8–2,5 s) – metsäkauris, arka | deer death cry |
| **Villikarju** (`karju`) ⭐ varaääni: emakko, porsas | idle_1 | `sounds/raw/karju_idle_1.mp3` | ⬜ puuttuu | rauhallinen ääntely (0,5–2 s) – villisika, karju | wild boar grunt |
|  | idle_2 | `sounds/raw/karju_idle_2.mp3` | ⬜ puuttuu | toinen ääntely, eri kuin idle_1 (0,5–2 s) – villisika, karju | wild boar grunt |
|  | hurt_1 | `sounds/raw/karju_hurt_1.mp3` | ⬜ puuttuu | lyhyt kivun ääni (0,2–0,8 s) – villisika, karju | boar squeal pain |
|  | death_1 | `sounds/raw/karju_death_1.mp3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – villisika, karju | boar death squeal |
|  | aggro_1 | `sounds/raw/karju_aggro_1.mp3` | ⬜ puuttuu | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – villisika, karju | boar angry grunt charge |
| **Metsäjänis** (`janis`) | idle_1 | `sounds/raw/janis_idle_1.mp3` | ⬜ puuttuu (varalla: kettu) | rauhallinen ääntely (0,5–2 s) – metsäjänis, lähes äänetön | rabbit sniff, rabbit foot thump |
|  | idle_2 | `sounds/raw/janis_idle_2.mp3` | ⬜ puuttuu (varalla: kettu) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – metsäjänis, lähes äänetön | rabbit sniff, rabbit foot thump |
|  | hurt_1 | `sounds/raw/janis_hurt_1.mp3` | ⬜ puuttuu (varalla: kettu) | lyhyt kivun ääni (0,2–0,8 s) – metsäjänis, lähes äänetön | rabbit squeal |
|  | death_1 | `sounds/raw/janis_death_1.mp3` | ⬜ puuttuu (varalla: kettu) | kuoleman ääni (0,8–2,5 s) – metsäjänis, lähes äänetön | rabbit scream short |
| **Kettu** (`kettu`) ⭐ varaääni: janis | idle_1 | `sounds/raw/kettu_idle_1.mp3` | ⬜ puuttuu (varalla: susi) | rauhallinen ääntely (0,5–2 s) – kettu, kimeä | fox yip, fox bark |
|  | idle_2 | `sounds/raw/kettu_idle_2.mp3` | ⬜ puuttuu (varalla: susi) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – kettu, kimeä | fox yip, fox bark |
|  | hurt_1 | `sounds/raw/kettu_hurt_1.mp3` | ⬜ puuttuu (varalla: susi) | lyhyt kivun ääni (0,2–0,8 s) – kettu, kimeä | fox yelp |
|  | death_1 | `sounds/raw/kettu_death_1.mp3` | ⬜ puuttuu (varalla: susi) | kuoleman ääni (0,8–2,5 s) – kettu, kimeä | fox whimper death |
| **Metso** (`metso`) | idle_1 | `sounds/raw/metso_idle_1.mp3` | ⬜ puuttuu | rauhallinen ääntely (0,5–2 s) – metso, iso metsäkanalintu | capercaillie call, grouse clucking |
|  | idle_2 | `sounds/raw/metso_idle_2.mp3` | ⬜ puuttuu | toinen ääntely, eri kuin idle_1 (0,5–2 s) – metso, iso metsäkanalintu | capercaillie call, grouse clucking |
|  | hurt_1 | `sounds/raw/metso_hurt_1.mp3` | ⬜ puuttuu | lyhyt kivun ääni (0,2–0,8 s) – metso, iso metsäkanalintu | bird squawk pain |
|  | death_1 | `sounds/raw/metso_death_1.mp3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – metso, iso metsäkanalintu | bird distress flutter |
| **Poro** (`poro`) | idle_1 | `sounds/raw/poro_idle_1.mp3` | ⬜ puuttuu (varalla: peura) | rauhallinen ääntely (0,5–2 s) – poro, matala röhkintä | reindeer grunt, reindeer snort |
|  | idle_2 | `sounds/raw/poro_idle_2.mp3` | ⬜ puuttuu (varalla: peura) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – poro, matala röhkintä | reindeer grunt, reindeer snort |
|  | hurt_1 | `sounds/raw/poro_hurt_1.mp3` | ⬜ puuttuu (varalla: peura) | lyhyt kivun ääni (0,2–0,8 s) – poro, matala röhkintä | reindeer grunt pain |
|  | death_1 | `sounds/raw/poro_death_1.mp3` | ⬜ puuttuu (varalla: peura) | kuoleman ääni (0,8–2,5 s) – poro, matala röhkintä | deer death groan |
| **Hirvi** (`hirvi`) ⭐ varaääni: hiidenhirvi, peura | idle_1 | `sounds/raw/hirvi_idle_1.mp3` | ⬜ puuttuu | rauhallinen ääntely (0,5–2 s) – hirvi, suuri ja matala | moose call, moose grunt |
|  | idle_2 | `sounds/raw/hirvi_idle_2.mp3` | ⬜ puuttuu | toinen ääntely, eri kuin idle_1 (0,5–2 s) – hirvi, suuri ja matala | moose call, moose grunt |
|  | hurt_1 | `sounds/raw/hirvi_hurt_1.mp3` | ⬜ puuttuu | lyhyt kivun ääni (0,2–0,8 s) – hirvi, suuri ja matala | moose bellow pain |
|  | death_1 | `sounds/raw/hirvi_death_1.mp3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – hirvi, suuri ja matala | moose death groan |
|  | aggro_1 | `sounds/raw/hirvi_aggro_1.mp3` | ⬜ puuttuu | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – hirvi, suuri ja matala | moose bellow angry |
| **Ilves** (`ilves`) ⭐ varaääni: ahma | idle_1 | `sounds/raw/ilves_idle_1.mp3` | ⬜ puuttuu (varalla: susi) | rauhallinen ääntely (0,5–2 s) – ilves, kissapeto | lynx growl soft, bobcat purr growl |
|  | idle_2 | `sounds/raw/ilves_idle_2.mp3` | ⬜ puuttuu (varalla: susi) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – ilves, kissapeto | lynx growl soft, bobcat purr growl |
|  | hurt_1 | `sounds/raw/ilves_hurt_1.mp3` | ⬜ puuttuu (varalla: susi) | lyhyt kivun ääni (0,2–0,8 s) – ilves, kissapeto | cat hiss yowl |
|  | death_1 | `sounds/raw/ilves_death_1.mp3` | ⬜ puuttuu (varalla: susi) | kuoleman ääni (0,8–2,5 s) – ilves, kissapeto | big cat death |
|  | aggro_1 | `sounds/raw/ilves_aggro_1.mp3` | ⬜ puuttuu (varalla: susi) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – ilves, kissapeto | lynx hiss snarl |
| **Ahma** (`ahma`) | idle_1 | `sounds/raw/ahma_idle_1.mp3` | ⬜ puuttuu (varalla: ilves) | rauhallinen ääntely (0,5–2 s) – ahma, pieni raivokas peto | wolverine growl, badger grunt |
|  | idle_2 | `sounds/raw/ahma_idle_2.mp3` | ⬜ puuttuu (varalla: ilves) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – ahma, pieni raivokas peto | wolverine growl, badger grunt |
|  | hurt_1 | `sounds/raw/ahma_hurt_1.mp3` | ⬜ puuttuu (varalla: ilves) | lyhyt kivun ääni (0,2–0,8 s) – ahma, pieni raivokas peto | animal snarl pain |
|  | death_1 | `sounds/raw/ahma_death_1.mp3` | ⬜ puuttuu (varalla: ilves) | kuoleman ääni (0,8–2,5 s) – ahma, pieni raivokas peto | small animal death growl |
|  | aggro_1 | `sounds/raw/ahma_aggro_1.mp3` | ⬜ puuttuu (varalla: ilves) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – ahma, pieni raivokas peto | wolverine snarl |
| **Villikarjuemakko** (`emakko`) | idle_1 | `sounds/raw/emakko_idle_1.mp3` | ⬜ puuttuu (varalla: karju) | rauhallinen ääntely (0,5–2 s) – villisikaemakko | pig oink grunt |
|  | idle_2 | `sounds/raw/emakko_idle_2.mp3` | ⬜ puuttuu (varalla: karju) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – villisikaemakko | pig oink grunt |
|  | hurt_1 | `sounds/raw/emakko_hurt_1.mp3` | ⬜ puuttuu (varalla: karju) | lyhyt kivun ääni (0,2–0,8 s) – villisikaemakko | pig squeal |
|  | death_1 | `sounds/raw/emakko_death_1.mp3` | ⬜ puuttuu (varalla: karju) | kuoleman ääni (0,8–2,5 s) – villisikaemakko | pig death squeal |
|  | aggro_1 | `sounds/raw/emakko_aggro_1.mp3` | ⬜ puuttuu (varalla: karju) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – villisikaemakko | pig angry grunt |
| **Porsas** (`porsas`) | idle_1 | `sounds/raw/porsas_idle_1.mp3` | ⬜ puuttuu (varalla: karju) | rauhallinen ääntely (0,5–2 s) – porsas, kimeä | piglet oink |
|  | idle_2 | `sounds/raw/porsas_idle_2.mp3` | ⬜ puuttuu (varalla: karju) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – porsas, kimeä | piglet oink |
|  | hurt_1 | `sounds/raw/porsas_hurt_1.mp3` | ⬜ puuttuu (varalla: karju) | lyhyt kivun ääni (0,2–0,8 s) – porsas, kimeä | piglet squeal |
|  | death_1 | `sounds/raw/porsas_death_1.mp3` | ⬜ puuttuu (varalla: karju) | kuoleman ääni (0,8–2,5 s) – porsas, kimeä | piglet squeal short |
| **Karhu** (`karhu`) ⭐ varaääni: hiidenkarhu | idle_1 | `sounds/raw/karhu_idle_1.mp3` | ⬜ puuttuu | rauhallinen ääntely (0,5–2 s) – karhu, raskas | bear grunt sniff |
|  | idle_2 | `sounds/raw/karhu_idle_2.mp3` | ⬜ puuttuu | toinen ääntely, eri kuin idle_1 (0,5–2 s) – karhu, raskas | bear grunt sniff |
|  | hurt_1 | `sounds/raw/karhu_hurt_1.mp3` | ⬜ puuttuu | lyhyt kivun ääni (0,2–0,8 s) – karhu, raskas | bear roar pain |
|  | death_1 | `sounds/raw/karhu_death_1.mp3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – karhu, raskas | bear death groan |
|  | aggro_1 | `sounds/raw/karhu_aggro_1.mp3` | ⬜ puuttuu | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – karhu, raskas | bear roar angry |

### Viholliset

| Olento | Ääni | Tiedosto | Tila | Kuvaus | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- | --- |
| **Hiidenkarhu** (`hiidenkarhu`) | idle_1 | `sounds/raw/hiidenkarhu_idle_1.mp3` | ⬜ puuttuu (varalla: karhu) | rauhallinen ääntely (0,5–2 s) – hiiden turmelema karhu, synkkä ja matala | monster bear growl low |
|  | idle_2 | `sounds/raw/hiidenkarhu_idle_2.mp3` | ⬜ puuttuu (varalla: karhu) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – hiiden turmelema karhu, synkkä ja matala | monster bear growl low |
|  | hurt_1 | `sounds/raw/hiidenkarhu_hurt_1.mp3` | ⬜ puuttuu (varalla: karhu) | lyhyt kivun ääni (0,2–0,8 s) – hiiden turmelema karhu, synkkä ja matala | beast roar pain |
|  | death_1 | `sounds/raw/hiidenkarhu_death_1.mp3` | ⬜ puuttuu (varalla: karhu) | kuoleman ääni (0,8–2,5 s) – hiiden turmelema karhu, synkkä ja matala | monster death roar |
|  | aggro_1 | `sounds/raw/hiidenkarhu_aggro_1.mp3` | ⬜ puuttuu (varalla: karhu) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – hiiden turmelema karhu, synkkä ja matala | monster bear roar |
| **Hiidenhirvi** (`hiidenhirvi`) ⭐ varaääni: aarnihirvio | idle_1 | `sounds/raw/hiidenhirvi_idle_1.mp3` | ⬜ puuttuu (varalla: hirvi) | rauhallinen ääntely (0,5–2 s) – hiiden turmelema hirvi, aavemainen | eerie deep moose call creature |
|  | idle_2 | `sounds/raw/hiidenhirvi_idle_2.mp3` | ⬜ puuttuu (varalla: hirvi) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – hiiden turmelema hirvi, aavemainen | eerie deep moose call creature |
|  | hurt_1 | `sounds/raw/hiidenhirvi_hurt_1.mp3` | ⬜ puuttuu (varalla: hirvi) | lyhyt kivun ääni (0,2–0,8 s) – hiiden turmelema hirvi, aavemainen | monster bellow pain |
|  | death_1 | `sounds/raw/hiidenhirvi_death_1.mp3` | ⬜ puuttuu (varalla: hirvi) | kuoleman ääni (0,8–2,5 s) – hiiden turmelema hirvi, aavemainen | creature death groan |
|  | aggro_1 | `sounds/raw/hiidenhirvi_aggro_1.mp3` | ⬜ puuttuu (varalla: hirvi) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – hiiden turmelema hirvi, aavemainen | monster elk bellow roar |
| **Kalmasusi** (`kalmasusi`) | idle_1 | `sounds/raw/kalmasusi_idle_1.mp3` | ⬜ puuttuu (varalla: susi) | rauhallinen ääntely (0,5–2 s) – kalmasusi, epäkuollut susi | zombie wolf growl, ghost wolf breath |
|  | idle_2 | `sounds/raw/kalmasusi_idle_2.mp3` | ⬜ puuttuu (varalla: susi) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – kalmasusi, epäkuollut susi | zombie wolf growl, ghost wolf breath |
|  | hurt_1 | `sounds/raw/kalmasusi_hurt_1.mp3` | ⬜ puuttuu (varalla: susi) | lyhyt kivun ääni (0,2–0,8 s) – kalmasusi, epäkuollut susi | wolf yelp distorted |
|  | death_1 | `sounds/raw/kalmasusi_death_1.mp3` | ⬜ puuttuu (varalla: susi) | kuoleman ääni (0,8–2,5 s) – kalmasusi, epäkuollut susi | undead creature death |
|  | aggro_1 | `sounds/raw/kalmasusi_aggro_1.mp3` | ⬜ puuttuu (varalla: susi) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – kalmasusi, epäkuollut susi | eerie wolf howl |
| **Suonäkki** (`suonakki`) | idle_1 | `sounds/raw/suonakki_idle_1.mp3` | ⬜ puuttuu (varalla: hiisi) | rauhallinen ääntely (0,5–2 s) – suon olento, kurlaava | swamp monster gurgle, water creature bubbles |
|  | idle_2 | `sounds/raw/suonakki_idle_2.mp3` | ⬜ puuttuu (varalla: hiisi) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – suon olento, kurlaava | swamp monster gurgle, water creature bubbles |
|  | hurt_1 | `sounds/raw/suonakki_hurt_1.mp3` | ⬜ puuttuu (varalla: hiisi) | lyhyt kivun ääni (0,2–0,8 s) – suon olento, kurlaava | creature gurgle scream |
|  | death_1 | `sounds/raw/suonakki_death_1.mp3` | ⬜ puuttuu (varalla: hiisi) | kuoleman ääni (0,8–2,5 s) – suon olento, kurlaava | monster death gurgle |
|  | aggro_1 | `sounds/raw/suonakki_aggro_1.mp3` | ⬜ puuttuu (varalla: hiisi) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – suon olento, kurlaava | swamp monster roar |
| **Sammalhiisi** (`hiisi`) ⭐ varaääni: suonakki | idle_1 | `sounds/raw/hiisi_idle_1.mp3` | ⬜ puuttuu | rauhallinen ääntely (0,5–2 s) – sammalhiisi, pieni ilkeä metsän olento | goblin chatter, troll mumble |
|  | idle_2 | `sounds/raw/hiisi_idle_2.mp3` | ⬜ puuttuu | toinen ääntely, eri kuin idle_1 (0,5–2 s) – sammalhiisi, pieni ilkeä metsän olento | goblin chatter, troll mumble |
|  | hurt_1 | `sounds/raw/hiisi_hurt_1.mp3` | ⬜ puuttuu | lyhyt kivun ääni (0,2–0,8 s) – sammalhiisi, pieni ilkeä metsän olento | goblin hurt |
|  | death_1 | `sounds/raw/hiisi_death_1.mp3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – sammalhiisi, pieni ilkeä metsän olento | goblin death |
|  | aggro_1 | `sounds/raw/hiisi_aggro_1.mp3` | ⬜ puuttuu | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – sammalhiisi, pieni ilkeä metsän olento | goblin attack yell |
| **Harmaasusi** (`susi`) ⭐ varaääni: ilves, kalmasusi, kettu, routasusi | idle_1 | `sounds/raw/susi_idle_1.mp3` | ⬜ puuttuu | rauhallinen ääntely (0,5–2 s) – harmaasusi | wolf growl, wolf panting |
|  | idle_2 | `sounds/raw/susi_idle_2.mp3` | ⬜ puuttuu | toinen ääntely, eri kuin idle_1 (0,5–2 s) – harmaasusi | wolf growl, wolf panting |
|  | hurt_1 | `sounds/raw/susi_hurt_1.mp3` | ⬜ puuttuu | lyhyt kivun ääni (0,2–0,8 s) – harmaasusi | wolf yelp |
|  | death_1 | `sounds/raw/susi_death_1.mp3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – harmaasusi | wolf death whimper |
|  | aggro_1 | `sounds/raw/susi_aggro_1.mp3` | ⬜ puuttuu | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – harmaasusi | wolf snarl bark |
| **Kalmo** (`kalmo`) ⭐ varaääni: vartija, ylimys | idle_1 | `sounds/raw/kalmo_idle_1.mp3` | ⬜ puuttuu | rauhallinen ääntely (0,5–2 s) – kalmo, epäkuollut soturi | zombie groan, skeleton rattle |
|  | idle_2 | `sounds/raw/kalmo_idle_2.mp3` | ⬜ puuttuu | toinen ääntely, eri kuin idle_1 (0,5–2 s) – kalmo, epäkuollut soturi | zombie groan, skeleton rattle |
|  | hurt_1 | `sounds/raw/kalmo_hurt_1.mp3` | ⬜ puuttuu | lyhyt kivun ääni (0,2–0,8 s) – kalmo, epäkuollut soturi | zombie hurt |
|  | death_1 | `sounds/raw/kalmo_death_1.mp3` | ⬜ puuttuu | kuoleman ääni (0,8–2,5 s) – kalmo, epäkuollut soturi | zombie death, bones collapse |
|  | aggro_1 | `sounds/raw/kalmo_aggro_1.mp3` | ⬜ puuttuu | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – kalmo, epäkuollut soturi | zombie scream attack |
| **Kalmon ylimys** (`ylimys`) ⭐ varaääni: jaajattari, kalmaherra | idle_1 | `sounds/raw/ylimys_idle_1.mp3` | ⬜ puuttuu (varalla: kalmo) | rauhallinen ääntely (0,5–2 s) – kalmon ylimys, kuiskiva epäkuollut | undead whisper groan, lich breath |
|  | idle_2 | `sounds/raw/ylimys_idle_2.mp3` | ⬜ puuttuu (varalla: kalmo) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – kalmon ylimys, kuiskiva epäkuollut | undead whisper groan, lich breath |
|  | hurt_1 | `sounds/raw/ylimys_hurt_1.mp3` | ⬜ puuttuu (varalla: kalmo) | lyhyt kivun ääni (0,2–0,8 s) – kalmon ylimys, kuiskiva epäkuollut | ghoul hurt |
|  | death_1 | `sounds/raw/ylimys_death_1.mp3` | ⬜ puuttuu (varalla: kalmo) | kuoleman ääni (0,8–2,5 s) – kalmon ylimys, kuiskiva epäkuollut | undead death scream |
|  | aggro_1 | `sounds/raw/ylimys_aggro_1.mp3` | ⬜ puuttuu (varalla: kalmo) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – kalmon ylimys, kuiskiva epäkuollut | lich shout |
| **Kivivartija** (`kivivartija`) | idle_1 | `sounds/raw/kivivartija_idle_1.mp3` | ⬜ puuttuu (varalla: vartija) | rauhallinen ääntely (0,5–2 s) – kivivartija, kivinen golem | stone grind, rock golem rumble |
|  | idle_2 | `sounds/raw/kivivartija_idle_2.mp3` | ⬜ puuttuu (varalla: vartija) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – kivivartija, kivinen golem | stone grind, rock golem rumble |
|  | hurt_1 | `sounds/raw/kivivartija_hurt_1.mp3` | ⬜ puuttuu (varalla: vartija) | lyhyt kivun ääni (0,2–0,8 s) – kivivartija, kivinen golem | rock impact crack |
|  | death_1 | `sounds/raw/kivivartija_death_1.mp3` | ⬜ puuttuu (varalla: vartija) | kuoleman ääni (0,8–2,5 s) – kivivartija, kivinen golem | rock crumble collapse |
|  | aggro_1 | `sounds/raw/kivivartija_aggro_1.mp3` | ⬜ puuttuu (varalla: vartija) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – kivivartija, kivinen golem | golem roar stone |
| **Routasusi** (`routasusi`) | idle_1 | `sounds/raw/routasusi_idle_1.mp3` | ⬜ puuttuu (varalla: susi) | rauhallinen ääntely (0,5–2 s) – routasusi, jäinen susi | wolf growl cold breath |
|  | idle_2 | `sounds/raw/routasusi_idle_2.mp3` | ⬜ puuttuu (varalla: susi) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – routasusi, jäinen susi | wolf growl cold breath |
|  | hurt_1 | `sounds/raw/routasusi_hurt_1.mp3` | ⬜ puuttuu (varalla: susi) | lyhyt kivun ääni (0,2–0,8 s) – routasusi, jäinen susi | wolf yelp |
|  | death_1 | `sounds/raw/routasusi_death_1.mp3` | ⬜ puuttuu (varalla: susi) | kuoleman ääni (0,8–2,5 s) – routasusi, jäinen susi | wolf whimper death |
|  | aggro_1 | `sounds/raw/routasusi_aggro_1.mp3` | ⬜ puuttuu (varalla: susi) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – routasusi, jäinen susi | wolf howl |

### Pomot

| Olento | Ääni | Tiedosto | Tila | Kuvaus | Hakusanat (englanniksi) |
| --- | --- | --- | --- | --- | --- |
| **Kalmanvartija** (`vartija`) ⭐ varaääni: kivivartija | idle_1 | `sounds/raw/vartija_idle_1.mp3` | ⬜ puuttuu (varalla: kalmo) | rauhallinen ääntely (0,5–2 s) – Kalmanvartija, valtava pomo | giant breathing, deep monster breath |
|  | idle_2 | `sounds/raw/vartija_idle_2.mp3` | ⬜ puuttuu (varalla: kalmo) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – Kalmanvartija, valtava pomo | giant breathing, deep monster breath |
|  | hurt_1 | `sounds/raw/vartija_hurt_1.mp3` | ⬜ puuttuu (varalla: kalmo) | lyhyt kivun ääni (0,2–0,8 s) – Kalmanvartija, valtava pomo | giant hurt roar |
|  | death_1 | `sounds/raw/vartija_death_1.mp3` | ⬜ puuttuu (varalla: kalmo) | kuoleman ääni (0,8–2,5 s) – Kalmanvartija, valtava pomo | boss death roar |
|  | aggro_1 | `sounds/raw/vartija_aggro_1.mp3` | ⬜ puuttuu (varalla: kalmo) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – Kalmanvartija, valtava pomo | boss monster roar |
| **Jäätär** (`jaajattari`) | idle_1 | `sounds/raw/jaajattari_idle_1.mp3` | ⬜ puuttuu (varalla: ylimys) | rauhallinen ääntely (0,5–2 s) – Jäätär, jäinen noita (pomo) | ice witch whisper, cold wind voice |
|  | idle_2 | `sounds/raw/jaajattari_idle_2.mp3` | ⬜ puuttuu (varalla: ylimys) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – Jäätär, jäinen noita (pomo) | ice witch whisper, cold wind voice |
|  | hurt_1 | `sounds/raw/jaajattari_hurt_1.mp3` | ⬜ puuttuu (varalla: ylimys) | lyhyt kivun ääni (0,2–0,8 s) – Jäätär, jäinen noita (pomo) | female monster scream |
|  | death_1 | `sounds/raw/jaajattari_death_1.mp3` | ⬜ puuttuu (varalla: ylimys) | kuoleman ääni (0,8–2,5 s) – Jäätär, jäinen noita (pomo) | witch death scream, ice shatter |
|  | aggro_1 | `sounds/raw/jaajattari_aggro_1.mp3` | ⬜ puuttuu (varalla: ylimys) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – Jäätär, jäinen noita (pomo) | evil witch laugh |
| **Kalmaherra** (`kalmaherra`) | idle_1 | `sounds/raw/kalmaherra_idle_1.mp3` | ⬜ puuttuu (varalla: ylimys) | rauhallinen ääntely (0,5–2 s) – Kalmaherra, kalmojen valtias (pomo) | deep demon whisper |
|  | idle_2 | `sounds/raw/kalmaherra_idle_2.mp3` | ⬜ puuttuu (varalla: ylimys) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – Kalmaherra, kalmojen valtias (pomo) | deep demon whisper |
|  | hurt_1 | `sounds/raw/kalmaherra_hurt_1.mp3` | ⬜ puuttuu (varalla: ylimys) | lyhyt kivun ääni (0,2–0,8 s) – Kalmaherra, kalmojen valtias (pomo) | demon hurt roar |
|  | death_1 | `sounds/raw/kalmaherra_death_1.mp3` | ⬜ puuttuu (varalla: ylimys) | kuoleman ääni (0,8–2,5 s) – Kalmaherra, kalmojen valtias (pomo) | demon death roar |
|  | aggro_1 | `sounds/raw/kalmaherra_aggro_1.mp3` | ⬜ puuttuu (varalla: ylimys) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – Kalmaherra, kalmojen valtias (pomo) | demon lord roar |
| **Aarnihirviö** (`aarnihirvio`) | idle_1 | `sounds/raw/aarnihirvio_idle_1.mp3` | ⬜ puuttuu (varalla: hiidenhirvi) | rauhallinen ääntely (0,5–2 s) – Aarnihirviö, metsän hirviö (pomo) | forest monster creak, tree creature groan |
|  | idle_2 | `sounds/raw/aarnihirvio_idle_2.mp3` | ⬜ puuttuu (varalla: hiidenhirvi) | toinen ääntely, eri kuin idle_1 (0,5–2 s) – Aarnihirviö, metsän hirviö (pomo) | forest monster creak, tree creature groan |
|  | hurt_1 | `sounds/raw/aarnihirvio_hurt_1.mp3` | ⬜ puuttuu (varalla: hiidenhirvi) | lyhyt kivun ääni (0,2–0,8 s) – Aarnihirviö, metsän hirviö (pomo) | monster roar wood creak |
|  | death_1 | `sounds/raw/aarnihirvio_death_1.mp3` | ⬜ puuttuu (varalla: hiidenhirvi) | kuoleman ääni (0,8–2,5 s) – Aarnihirviö, metsän hirviö (pomo) | giant tree creature death |
|  | aggro_1 | `sounds/raw/aarnihirvio_aggro_1.mp3` | ⬜ puuttuu (varalla: hiidenhirvi) | hyökkäyshuuto tai uhkaava murina (0,5–2 s) – Aarnihirviö, metsän hirviö (pomo) | forest monster roar |

## Tulevat äänierät

B pelaajan ja toimintojen äänet · C taustaäänet ja sää · D musiikki · E äänifysiikka (ks. kehitysmuistion ideajono). Jokainen erä saa tähän oman osionsa.
