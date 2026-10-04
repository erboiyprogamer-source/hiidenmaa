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
| Portaat / Raput | 6 askelmaa (0,43 m) |
| Reppu | 32 paikkaa, päivitys +8 paikkaa +40 painoa (2 tasoa) |

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
- **Reunajatko** (`edgeSnap`): seinän sivusta → jatke samaan suuntaan; seinän päältä → pinoaminen; lattian päältä:
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

**Erä 26 – Taivas ja pilvet (0)**
1. Pilvet suuremmiksi, leveämmiksi ja realistisemmiksi (taivaalle levittäytyviä), koko säästä riippuen; kaukana sumeat/häipyvät (optimointi); pilviä hieman matalammalle; selkeällä säällä aurinko paistaa sumun/pilvien välistä; realistisempi taivas (asetuksiin myöhemmin yksinkertaistus).

**Erä 27 – Valo ja soihtu (0.9, 0.99)**
1. Tulet/valot heittävät varjoja ympäröivien esineiden taakse pimeällä (ei päivänvalossa ulkona).
2. Käsisoihtu sammuu sateessa (sateen alla), syttyy kun vie toisen liekin viereen; soihtu kuluu käytettäessä (mittari, 1 min yhteensä, sateessa 20 % nopeammin), sammuessa liekki ja valo katoavat.

**Erä 28 – Maasto ja työkalut (1)**
1. Lapio: vasen klikkaus tekee maasta multaisemman ja tummemman (polut). Uusi kuokka: nostaa maanmuotoja ja vähentää multaisuutta (palauttaa alkuperäiseksi).

**Erä 29 – Valikko, asetukset ja tallennus (1.1, 1.2, 1.3, 9)**
1. Asetuksiin lista kaikista näppäimistä; keybind-vaihtovalikko (oma pieni, varmistus, ei päällekkäisiä/kiellettyjä näppäimiä).
2. Pelivalikko hienommaksi teemaan sopivaksi; BUG: Tallenna-nappi avaa asetusvalikon – korjaa; tallennuskoodi tiivistetympi (lyhyempi muoto) + lataus/tallennus .txt-tiedostona.
3. Hiiren rulla hotbarin selaukseen (kuten Minecraft), zoom manuaalisesti jos toggle päällä.
4. Grafiikka-asetusvalikko joka muistaa valinnat (localStorage): varjot (siirretään), puiden heiluminen, partikkelien määrä, detaljien määrä, piirtoetäisyys, rakennusten detaljit.

**Erä 30 – Kartta ja piirtoetäisyys (2, 8, 10)**
1. Kartan löydetty alue sileämmäksi ja hienojakoisemmaksi; löytämättömät paikat piiloon (pilvisumu); karttanäkymässä pilvet liikkuvat (vain kun auki), kartan zoom, rakennukset ylhäältä pikseleinä.
2. Minimapin 3 zoomitasoa näppäimellä (oletus nykyinen).
3. Piirtoetäisyys (render distance) Minecraft-tyyliin: sumu piirtoalueen reunalla; etäisyyden päässä partikkelit/animaatiot/visuaalit pois.

**Erä 31 – Maailma, ulottuvuudet ja tarina (3, 5, 6, 7)** (iso; jaetaan tarvittaessa 31a–c)
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

### Jäljelle jääneet / jatkoideat
- Pelaajan käsisoihtu ei kulu loppuun (vain seisova soihtu).
- Ruokia ei voi vielä keittää (ei padan mallia); grillaus tukee vain lihaa ja sientä.

## Tunnetut puutteet

- Katossa ei ole törmäystä, ja katon reunat eivät liity siististi toisiinsa.
- Huonekalut (työpenkki, sänky, arkku) eivät kohdistu ruudukkoon.
- Hiiren lukitus voi olla estetty joissain upotetuissa näkymissä. Silloin kamera käännetään vetämällä.
