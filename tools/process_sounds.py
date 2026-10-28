#!/usr/bin/env python3
"""Hiidenmaa – äänien käsittely (äänisuunnitelma, ks. docs/KEHITYSMUISTIO.md "Äänisuunnitelma").

Käyttö (repon juuressa):
  python3 tools/process_sounds.py --init   luo puuttuvat paikkamerkit sounds/olennot_aanet/raw/ (+ olennot_toiminnot/raw/<ryhmä>/) (ei koskaan ylikirjoita) + käsittelee
  python3 tools/process_sounds.py          käsittelee oikeat äänet, kirjoittaa sounds/manifest.json, sounds/olennot_aanet/AANILISTA.md
                                           ja sounds/olennot_toiminnot/AANILISTA_TOIMINNOT.md

Työnjako: Claude tekee paikkamerkit (hiljainen mp3 alle 3 kt) oikeilla nimillä. Käyttäjä kuuntelee ja korvaa paikkamerkin
TÄSMÄLLEEN samalla nimellä (GitHub Desktop). Tämä työkalu tunnistaa oikeat äänet (yli 3 kt, muoto sisällöstä eikä päätteestä),
ajaa ffmpeg → sounds/olennot_aanet/valmiit/<nimi>.mp3 (mono 96 kbps). Käsittely (v1.86): matalat rumpuäänet pois (40 Hz), hiljaisuus pois alusta ja lopusta,
pituus katkaistaan lajin ylärajaan ja häivytetään (PROFIILI), voimakkuus mitataan (LUFS) ja nostetaan lajin tavoitteeseen + alimiter
(ei leikkaa). Raakatiedostoja ei poisteta. Käsittelyn tapa vaihtuessa (PV) kaikki ajetaan uudestaan.
Jos raaka palautetaan paikkamerkiksi, käsitelty ääni poistetaan. Peli lukee vain manifestissa olevat käsitellyt äänet.

ffmpeg: järjestelmän ffmpeg, tai `pip install imageio-ffmpeg`.
"""
import hashlib, json, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# v2.16 kansiorakenne: jokainen ääniprojekti omassa kansiossaan (raw/, valmiit/, oma lista); manifest on yhteinen (peli lukee sen)
SND = os.path.join(ROOT, 'sounds')
PROJ_A = 'olennot_aanet'                                   # olentojen äänet (ääntely, kipu, kuolema, suuttuminen, jahti, kaiku)
PROJ_T = 'olennot_toiminnot'                               # olentojen toiminto- ja ääniefektit (askeleet, kaatuminen, syöminen …)
RAW = os.path.join(SND, PROJ_A, 'raw')
OUT = os.path.join(SND, PROJ_A, 'valmiit')
MANIFEST = os.path.join(SND, 'manifest.json')
LISTA = os.path.join(SND, PROJ_A, 'AANILISTA.md')
RAW_T = os.path.join(SND, PROJ_T, 'raw')
OUT_T = os.path.join(SND, PROJ_T, 'valmiit')
VALMIS = '_valmis'   # v2.17: käsiteltyjen ryhmäkansioiden pääte (valmiit/<ryhmä>_valmis/), erottuu raa'oista raw/<ryhmä>/
def out_dir_t(g):
    return os.path.join(OUT_T, g + VALMIS)
LISTA_T = os.path.join(SND, PROJ_T, 'AANILISTA_TOIMINNOT.md')
PLACEHOLDER_MAX = 3072          # tavua: tätä pienempi/yhtä suuri = paikkamerkki
AGGRO_AI = ('neutral', 'hostile', 'boss', 'rboss')   # suuttumisääni (aggro)
CHASE_AI = ('hostile', 'boss', 'rboss')               # + toistuva jahtiääni (chase)
ECHO_AI = ('rboss', 'boss')                           # v1.88: kaikuääni (echo): nukkuva ulottuvuuspomo kaikuu luolastossa kunnes pelaaja kohtaa sen; v1.95 myös Kalmanvartija maan alta
VARIANTS = (1, 2, 3)                                  # paikkamerkit _1.._3; v2.11: lisäversiot _4, _5 … kelpaavat ilman koodimuutosta (peli arpoo kaikista)
PV = 4                                                # käsittelyn versio: vaihtuessa kaikki äänet käsitellään uudestaan


def variants_of(ai, kind):
    """Montako versiota lajista on: kuolema = 1 ulottuvuuksien hirviöillä (rboss), 2 kaikilla muilla; muut lajit 3."""
    if kind == 'death':
        return (1,) if ai == 'rboss' else (1, 2)
    if kind == 'echo':
        return (1, 2)
    return VARIANTS


# käsittelyprofiili lajeittain: (pituuden yläraja s: tavallinen, pomo; häivytys s; tavoite-LUFS). Pomoille lisätään BOSS_DB.
# Tavoitteet: kuolema ja suuttuminen kovimpia, osuma ja jahti keskitasoa, rauhallinen ääntely hiljaisin (soi usein).
PROFIILI = {
    'idle':  (3.0, 4.0, 0.30, -22),
    'hurt':  (1.2, 1.6, 0.20, -17),   # v1.97: pehmeämpi häntä; lisäksi yksitapahtumaleikkaus (event_end)
    'death': (3.5, 6.0, 0.50, -16),
    'aggro': (2.5, 3.5, 0.30, -16),
    'chase': (2.5, 4.0, 0.30, -18),
    'echo':  (5.0, 6.0, 0.80, -26),   # kaukainen kaiku: hiljainen, pitkä pehmeä häivytys (kaiku lisätään pelissä)
}
BOSS_DB = {'boss': 1.0, 'rboss': 1.5}
# v2.12: PITKÄT ÄÄNET – jos raaka jatkuu yli lajin ylärajan (ulvonta, soidin, mylvintä), sitä ei katkaista kesken: ääni päättyy luonnolliseen
# taukoon (viimeinen ≥ 0,3 s hiljainen kohta ennen pitkää ylärajaa) tai, jos taukoa ei ole, pitkään ylärajaan pitkällä häivytyksellä.
# Osumaääni (hurt) pysyy aina lyhyenä. (pituuden yläraja s: tavallinen, pomo)
PITKA = {'idle': (10.0, 10.0), 'death': (5.0, 8.0), 'aggro': (4.0, 5.0), 'chase': (3.5, 4.5), 'echo': (10.0, 10.0)}
# v2.12: KUTSUÄÄNET kuuluvat pelissä kauas (manifestissa far=1, noin 150 m; muut noin 64 m hiljaisempina – v2.14). Laji + äänilaji; vain vähintään
# 1,5 s pitkät versiot (lyhyt murahdus ei kanna). Lainaajat (esim. routasusi susi-ulvonnalla) perivät tämän.
KUTSU = {('susi', 'idle'), ('susi', 'chase'), ('hirvi', 'idle'), ('hirvi', 'aggro'), ('metso', 'idle'), ('karhu', 'aggro'),
         ('aarnihirvio', 'aggro'), ('aarnihirvio', 'idle'), ('kalmasusi', 'idle'), ('routasusi', 'idle'), ('hiidenhirvi', 'idle')}
KUTSU_MIN = 1.5

# ---------------------------------------------------------------- olennot (äänierä A)
# Kuvaus (millainen ääni) ja hakusanat englanniksi lajeittain. Nimet ja ai luetaan js/mobs.js:n MOBDEFistä, varaäänet js/audio.js:n VARAANIsta.
CRE_INFO = {
    'peura': ('metsäkauris, arka', {'idle': 'deer snort, deer bleat soft', 'hurt': 'deer distress call', 'death': 'deer death cry'}),
    'karju': ('villisika, karju', {'idle': 'wild boar grunt', 'hurt': 'boar squeal pain', 'death': 'boar death squeal', 'aggro': 'boar angry grunt charge'}),
    'janis': ('metsäjänis, lähes äänetön', {'idle': 'rabbit sniff, rabbit foot thump', 'hurt': 'rabbit squeal', 'death': 'rabbit scream short'}),
    'kettu': ('kettu, kimeä', {'idle': 'fox yip, fox bark', 'hurt': 'fox yelp', 'death': 'fox whimper death'}),
    'metso': ('metso, iso metsäkanalintu', {'idle': 'capercaillie call, grouse clucking', 'hurt': 'bird squawk pain', 'death': 'bird distress flutter'}),
    'poro': ('poro, matala röhkintä', {'idle': 'reindeer grunt, reindeer snort', 'hurt': 'reindeer grunt pain', 'death': 'deer death groan'}),
    'hirvi': ('hirvi, suuri ja matala', {'idle': 'moose call, moose grunt', 'hurt': 'moose bellow pain', 'death': 'moose death groan', 'aggro': 'moose bellow angry'}),
    'ilves': ('ilves, kissapeto', {'idle': 'lynx growl soft, bobcat purr growl', 'hurt': 'cat hiss yowl', 'death': 'big cat death', 'aggro': 'lynx hiss snarl'}),
    'ahma': ('ahma, pieni raivokas peto', {'idle': 'wolverine growl, badger grunt', 'hurt': 'animal snarl pain', 'death': 'small animal death growl', 'aggro': 'wolverine snarl'}),
    'emakko': ('villisikaemakko', {'idle': 'pig oink grunt', 'hurt': 'pig squeal', 'death': 'pig death squeal', 'aggro': 'pig angry grunt'}),
    'porsas': ('porsas, kimeä', {'idle': 'piglet oink', 'hurt': 'piglet squeal', 'death': 'piglet squeal short'}),
    'karhu': ('karhu, raskas', {'idle': 'bear grunt sniff', 'hurt': 'bear roar pain', 'death': 'bear death groan', 'aggro': 'bear roar angry'}),
    'hiidenkarhu': ('hiiden turmelema karhu, synkkä ja matala', {'idle': 'monster bear growl low', 'hurt': 'beast roar pain', 'death': 'monster death roar', 'aggro': 'monster bear roar'}),
    'hiidenhirvi': ('hiiden turmelema hirvi, aavemainen', {'idle': 'eerie deep moose call creature', 'hurt': 'monster bellow pain', 'death': 'creature death groan', 'aggro': 'monster elk bellow roar'}),
    'kalmasusi': ('kalmasusi, epäkuollut susi', {'idle': 'zombie wolf growl, ghost wolf breath', 'hurt': 'wolf yelp distorted', 'death': 'undead creature death', 'aggro': 'eerie wolf howl'}),
    'suonakki': ('suon olento, kurlaava', {'idle': 'swamp monster gurgle, water creature bubbles', 'hurt': 'creature gurgle scream', 'death': 'monster death gurgle', 'aggro': 'swamp monster roar'}),
    'hiisi': ('sammalhiisi, pieni ilkeä metsän olento', {'idle': 'goblin chatter, troll mumble', 'hurt': 'goblin hurt', 'death': 'goblin death', 'aggro': 'goblin attack yell'}),
    'susi': ('harmaasusi', {'idle': 'wolf growl, wolf panting', 'hurt': 'wolf yelp', 'death': 'wolf death whimper', 'aggro': 'wolf snarl bark'}),
    'kalmo': ('kalmo, epäkuollut soturi', {'idle': 'zombie groan, skeleton rattle', 'hurt': 'zombie hurt', 'death': 'zombie death, bones collapse', 'aggro': 'zombie scream attack'}),
    'ylimys': ('kalmon ylimys, kuiskiva epäkuollut', {'idle': 'undead whisper groan, lich breath', 'hurt': 'ghoul hurt', 'death': 'undead death scream', 'aggro': 'lich shout'}),
    'vartija': ('Kalmanvartija, valtava pomo', {'idle': 'giant breathing, deep monster breath', 'hurt': 'giant hurt roar', 'death': 'boss death roar', 'aggro': 'boss monster roar', 'echo': 'distant underground rumble, giant groan from below, earth tremor voice'}),
    'kivivartija': ('kivivartija, kivinen golem', {'idle': 'stone grind, rock golem rumble', 'hurt': 'rock impact crack', 'death': 'rock crumble collapse', 'aggro': 'golem roar stone'}),
    'routasusi': ('routasusi, jäinen susi', {'idle': 'wolf growl cold breath', 'hurt': 'wolf yelp', 'death': 'wolf whimper death', 'aggro': 'wolf howl'}),
    'jaajattari': ('Jäätär, jäinen noita (pomo)', {'idle': 'ice witch whisper, cold wind voice', 'hurt': 'female monster scream', 'death': 'witch death scream, ice shatter', 'aggro': 'evil witch laugh', 'echo': 'distant ghostly wail, ice cave wind voice'}),
    'kalmaherra': ('Kalmaherra, kalmojen valtias (pomo)', {'idle': 'deep demon whisper', 'hurt': 'demon hurt roar', 'death': 'demon death roar', 'aggro': 'demon lord roar', 'echo': 'distant demon growl dungeon, deep rumble voice'}),
    'aarnihirvio': ('Aarnihirviö, metsän hirviö (pomo)', {'idle': 'forest monster creak, tree creature groan', 'hurt': 'monster roar wood creak', 'death': 'giant tree creature death', 'aggro': 'forest monster roar', 'echo': 'distant monster growl cave, deep creature roar far away'}),
}
KIND_FI = {
    'idle': 'rauhallinen ääntely, satunnaisesti 6–15 s välein (0,5–2 s)',
    'hurt': 'lyhyt kivun ääni, kun olentoon osuu (0,2–0,8 s)',
    'death': 'kuoleman ääni (0,8–3,5 s, pomoilla jopa 6 s; paikkoja: ulottuvuuksien hirviöt 1, muut 2)',
    'aggro': 'SUUTTUMISÄÄNI: huomaa sinut ensimmäistä kertaa – vihamieliset ja pomot vain kerran, neutraalit aina kun suuttuvat (0,5–2 s)',
    'echo': 'KAIKUÄÄNI (pomot): kuuluu kaukaa, 24–48 s välein, kunnes pelaaja kohtaa pomon (Kalmanvartija: maan alta Kalmankehän lähellä, kunnes se herätetään) – matala, pitkä, kuiva raaka (kaiku ja tumma sointi lisätään pelissä; 1–2 versiota)',
    'chase': 'JAHTIÄÄNI: toistuu 4–9 s välein kun olento jahtaa sinua suuttumisäänen jälkeen – murina, huohotus tai huuto (0,5–1,5 s)',
}


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def creatures():
    """MOBDEF-avaimet, nimet ja ai järjestyksessä (js/mobs.js)."""
    src = read(os.path.join(ROOT, 'js', 'mobs.js'))
    i = src.index('const MOBDEF={')
    out = []
    for m in re.finditer(r"^  ([a-z_0-9]+):\{n:'([^']*)'.*?ai:'([a-z]+)'", src[i:], re.M):
        if m.group(1) not in [o[0] for o in out]:
            out.append((m.group(1), m.group(2), m.group(3)))
    return out


def varaani():
    src = read(os.path.join(ROOT, 'js', 'audio.js'))
    m = re.search(r'/\*VARAANI-ALKU\*/(.*?)/\*VARAANI-LOPPU\*/', src, re.S)
    return json.loads(m.group(1)) if m else {}


def kinds_of(ai):
    return ['idle', 'hurt', 'death'] + (['aggro'] if ai in AGGRO_AI else []) + (['chase'] if ai in CHASE_AI else []) + (['echo'] if ai in ECHO_AI else [])


def expected():
    names = []
    for cid, _, ai in creatures():
        names += [f'{cid}_{k}_{n}' for k in kinds_of(ai) for n in variants_of(ai, k)]
    return names


def ffmpeg_exe():
    exe = shutil.which('ffmpeg')
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        sys.exit('ffmpeg puuttuu: asenna ffmpeg tai `pip install imageio-ffmpeg`.')


def sniff(path):
    """Äänen muoto tiedoston sisällöstä (pääte voi valehdella)."""
    with open(path, 'rb') as f:
        h = f.read(16)
    if h[:4] == b'RIFF' and h[8:12] == b'WAVE':
        return 'wav'
    if h[:3] == b'ID3' or (len(h) > 1 and h[0] == 0xFF and (h[1] & 0xE0) == 0xE0):
        return 'mp3'
    if h[:4] == b'OggS':
        return 'ogg'
    if h[:4] == b'fLaC':
        return 'flac'
    if h[4:8] == b'ftyp':
        return 'mp4'
    if h[:4] == b'FORM':
        return 'aiff'
    return None


def sha(path, n=12):
    with open(path, 'rb') as f:
        return hashlib.sha1(f.read()).hexdigest()[:n]


def duration(ff, path):
    r = subprocess.run([ff, '-hide_banner', '-i', path, '-f', 'null', '-'], capture_output=True, text=True)
    t = re.findall(r'time=(\d+):(\d+):([\d.]+)', r.stderr)
    if not t:
        return 0
    h, m, s = t[-1]
    return round(int(h) * 3600 + int(m) * 60 + float(s), 2)


def make_placeholder(ff, path):
    subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=8000:cl=mono', '-t', '0.1',
                    '-c:a', 'libmp3lame', '-b:a', '8k', '-write_xing', '0', '-id3v2_version', '0', '-f', 'mp3', path], check=True)
    assert os.path.getsize(path) <= PLACEHOLDER_MAX


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def loudness(ff, wav):
    """Integroitu äänekkyys (LUFS); alle 0,4 s äänillä ebur128 ei anna lukua → arvio keskitasosta."""
    r = run([ff, '-hide_banner', '-nostats', '-i', wav, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr.split('Summary')[-1])
    if m and float(m[-1]) > -69:
        return float(m[-1])
    r = run([ff, '-hide_banner', '-nostats', '-i', wav, '-af', 'volumedetect', '-f', 'null', '-'])
    m = re.search(r'mean_volume:\s+(-?[\d.]+) dB', r.stderr)
    return float(m.group(1)) - 1.0 if m else None


def levels(ff, wav, win):
    """RMS-taso (dB) win-sekunnin ikkunoissa."""
    r = run([ff, '-hide_banner', '-nostats', '-i', wav, '-af', f'asetnsamples={int(44100 * win)},astats=metadata=1:reset=1,'
             'ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-', '-f', 'null', '-'])
    return [float(x) if x not in ('-inf', 'inf') else -120.0 for x in re.findall(r'RMS_level=(-?[\d.]+|-inf)', r.stdout + r.stderr)]


def natural_end(ff, wav, d, cap, cap_long, win=0.1, drop=30.0, gap=3):
    """v2.12: pitkän äänen loppukohta. Koko ääni, jos mahtuu pitkään ylärajaan; muuten viimeinen luonnollinen tauko (≥ gap ikkunaa
    yli `drop` dB huipun alapuolella) välillä 0,6×yläraja … pitkä yläraja; jos taukoa ei ole, pitkä yläraja. Palauttaa (pituus, katkaistiinko)."""
    if d <= cap_long:
        return d, False
    lv = levels(ff, wav, win)
    if not lv:
        return cap_long, True
    pk = max(lv)
    best = None
    i = 0
    while i < len(lv):
        if lv[i] < pk - drop:
            j = i
            while j < len(lv) and lv[j] < pk - drop:
                j += 1
            t = i * win
            if j - i >= gap and cap * 0.6 <= t <= cap_long:
                best = t
            i = j
        else:
            i += 1
    return (round(best + 0.05, 3), False) if best else (cap_long, True)


def event_end(ff, wav, win=0.025, drop=20.0, hold=4):
    """v1.97: osuma-äänen (hurt) loppuhäntä pois. Etsii ensimmäisen tapahtuman lopun: kohdan, jossa taso (RMS, 25 ms ikkunat) on pysyvästi
    (hold ikkunaa) yli `drop` dB kulkevan huipun alapuolella; palauttaa sen ajan sekunteina (+ 60 ms jättö). Raakaäänen perässä oleva hiljainen
    kohina, veden kaltainen ääni tai uusi alkava ääni jää pois. Palauttaa None, jos ei löydy (ääni jää ennalleen)."""
    lv = levels(ff, wav, win)
    if len(lv) < hold + 2:
        return None
    m = -120.0   # kulkeva huippu: ensimmäinen tapahtuma päättyy kun taso pysyy `drop` dB sen alapuolella (myöhempi kovempi osa ei jatka ääntä)
    for i in range(len(lv) - hold + 1):
        m = max(m, lv[i])
        if m > -60 and all(lv[j] < m - drop for j in range(i, i + hold)):
            return round(i * win + 0.06, 3)
    return None


def process(ff, src, dst, fmt, ai='hostile', kind='idle', prof=None, big=False):
    """prof (toiminnot): (yläraja, iso yläraja, häivytys, LUFS) – isojen +2 dB on jo mukana; big valitsee ison ylärajan."""
    cap_n, cap_b, fade, target = prof or PROFIILI.get(kind, PROFIILI['idle'])
    boss = ai in BOSS_DB or big
    cap = cap_b if boss else cap_n
    target += 0 if prof else BOSS_DB.get(ai, 0)
    trim = 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.02'
    inp = (['-f', fmt] if fmt and fmt != 'mp4' else []) + ['-i', src]
    with tempfile.TemporaryDirectory() as td:
        w1, w2, tmp = os.path.join(td, 'a.wav'), os.path.join(td, 'b.wav'), os.path.join(td, 'o.mp3')
        # 1) mono, rumina pois, hiljaisuus pois alusta ja lopusta
        r = run([ff, '-hide_banner', '-loglevel', 'error', '-y'] + inp + ['-af', f'highpass=f=40,{trim},areverse,{trim},areverse',
                '-ac', '1', '-ar', '44100', '-c:a', 'pcm_s16le', w1])
        if r.returncode != 0 or not os.path.exists(w1):
            return r.stderr.strip()[-300:] or 'tuntematon virhe', None
        d = duration(ff, w1)
        if d < 0.05:
            return 'ääni on käytännössä hiljaa', None
        # 2) pituuden yläraja + häivytykset (ei klikkausta alussa, pehmeä loppu)
        L = min(d, cap)
        cut = d > cap
        if kind == 'hurt':
            ee = event_end(ff, w1)
            if ee and ee > 0.15:
                L = min(L, ee)
        elif d > cap and kind in PITKA:
            L, cut = natural_end(ff, w1, d, cap, PITKA[kind][1 if boss else 0])
        f = min(max(fade, 0.6) if cut and L > cap else fade, L * 0.5)
        r = run([ff, '-hide_banner', '-loglevel', 'error', '-y', '-i', w1, '-af',
                 f'atrim=duration={L:.3f},afade=t=in:d=0.006,afade=t=out:st={max(L - f, 0):.3f}:d={f:.3f}', '-c:a', 'pcm_s16le', w2])
        if r.returncode != 0:
            return r.stderr.strip()[-300:], None
        # 3) äänekkyyden mittaus → vahvistus tavoitteeseen (−24…+24 dB) + alimiter (katto −1 dBFS)
        lu = loudness(ff, w2)
        gain = 0.0 if lu is None else max(-24.0, min(24.0, target - lu))
        r = run([ff, '-hide_banner', '-loglevel', 'error', '-y', '-i', w2, '-af', f'volume={gain:.2f}dB,alimiter=limit=0.89:attack=2:release=60:level=disabled',
                 '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', '-id3v2_version', '0', tmp])
        if r.returncode != 0 or not os.path.exists(tmp) or os.path.getsize(tmp) < 200:
            return r.stderr.strip()[-300:] or 'tuntematon virhe', None
        shutil.copyfile(tmp, dst + '.tmp.mp3')
    os.replace(dst + '.tmp.mp3', dst)
    return None, (round(gain, 1), round(d, 2))


def main():
    init = '--init' in sys.argv
    ff = ffmpeg_exe()
    os.makedirs(RAW, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    exp = expected()
    if init:
        made = 0
        with tempfile.TemporaryDirectory() as td:
            ph = os.path.join(td, 'ph.mp3')
            make_placeholder(ff, ph)
            have = {os.path.splitext(f)[0] for f in os.listdir(RAW)}
            for n in exp:
                if n not in have:
                    shutil.copyfile(ph, os.path.join(RAW, n + '.mp3'))
                    made += 1
        # ylimääräiset paikkamerkit (esim. death_3, kun kuolemaäänille on 1–2 paikkaa) pois; oikeaan ääneen ei koskaan kosketa
        gone = 0
        expset = set(exp)
        creset = {c for c, _, _ in creatures()}
        for f in sorted(os.listdir(RAW)):
            n, p = os.path.splitext(f)[0], os.path.join(RAW, f)
            mm = re.match(r'^([a-z_0-9]+?)_(idle|hurt|death|aggro|chase|echo)_(\d+)$', n)
            if mm and mm.group(1) in creset and n not in expset and os.path.getsize(p) <= PLACEHOLDER_MAX:
                os.remove(p)
                gone += 1
        print(f'Paikkamerkkejä luotu: {made}, ylimääräisiä poistettu: {gone}')

    old = {}
    if os.path.exists(MANIFEST):
        try:
            old = json.load(open(MANIFEST, encoding='utf-8')).get('sounds', {})
        except Exception:
            old = {}
    # raakatiedostot nimen (ilman päätettä) mukaan; jos samalla nimellä useampi, oikea (iso) ääni voittaa
    raws = {}
    for f in sorted(os.listdir(RAW)):
        p = os.path.join(RAW, f)
        if not os.path.isfile(p) or f.startswith('.'):
            continue
        n = os.path.splitext(f)[0]
        if n not in raws or os.path.getsize(p) > os.path.getsize(raws[n]):
            raws[n] = p
    sounds, done, skipped, errors, removed = {}, 0, 0, [], 0
    for n, p in sorted(raws.items()):
        dst = os.path.join(OUT, n + '.mp3')
        if os.path.getsize(p) <= PLACEHOLDER_MAX:
            if os.path.exists(dst):
                os.remove(dst)
                removed += 1
            continue
        src_h = sha(p)
        mm = re.match(r'^([a-z_0-9]+?)_(idle|hurt|death|aggro|chase|echo)_(\d+)$', n)
        cid, kind = (mm.group(1), mm.group(2)) if mm else (None, 'idle')
        ai = next((a for c, _, a in creatures() if c == cid), 'hostile')
        if n in old and old[n].get('src') == src_h and old[n].get('pv') == PV and os.path.exists(dst):
            sounds[n] = old[n]
            skipped += 1
            continue
        err, res = process(ff, p, dst, sniff(p), ai, kind)
        if err:
            errors.append(f'{os.path.basename(p)}: {err}')
            continue
        gain, rawd = res
        sounds[n] = {'h': sha(dst, 10), 'src': src_h, 'dur': duration(ff, dst), 'pv': PV, 'gain': gain, 'raw': rawd}
        print(f'  {n}: {sounds[n]["dur"]} s (raaka {rawd} s), vahvistus {gain:+.1f} dB')
        done += 1
    for n, e in sounds.items():
        mm = re.match(r'^([a-z_0-9]+?)_(idle|hurt|death|aggro|chase|echo)_(\d+)$', n)
        if mm and (mm.group(1), mm.group(2)) in KUTSU and e.get('dur', 0) >= KUTSU_MIN:
            e['far'] = 1
        else:
            e.pop('far', None)
    # tarkistusraportti erästä: samat tiedostot eri paikoissa, ylimääräiset oikeat äänet, lyhyet ja kovat vahvistukset
    warn = []
    byh = {}
    for n in sounds:
        byh.setdefault(sounds[n]['src'], []).append(n)
    for h, ns in byh.items():
        if len(ns) > 1:
            warn.append('SAMA TIEDOSTO useassa paikassa: ' + ', '.join(ns))
    expset = set(exp)
    extra = []
    creai = {c: a for c, _, a in creatures()}
    for n in sounds:
        if n not in expset:
            mm = re.match(r'^([a-z_0-9]+?)_(idle|hurt|death|aggro|chase|echo)_(\d+)$', n)
            if mm and mm.group(1) in creai and mm.group(2) in kinds_of(creai[mm.group(1)]):
                extra.append(n)   # v2.11: lisäversio (_4, _5 … tai kuolemaäänen ylimääräinen) – peli käyttää sen
            else:
                warn.append(f'{n}: tuntematon olento tai laji, jota olennolla ei ole (peli ei käytä)')
        g = sounds[n].get('gain')
        if g is not None and abs(g) > 12:
            warn.append(f'{n}: iso vahvistus {g:+.1f} dB (raaka erittäin hiljainen tai kova – tarkista kuuntelemalla)')
        if n.split('_')[-2] == 'hurt' and sounds[n].get('raw', 0) > 3:
            warn.append(f'{n}: osumaäänen raaka on {sounds[n]["raw"]} s pitkä (ulvonta tms.?) – osumaääni leikataan alle 1,2 s; onko oikea paikka?')
        if sounds[n].get('dur', 1) < 0.15:
            warn.append(f'{n}: erittäin lyhyt ({sounds[n]["dur"]} s)')
    # käsitellyt äänet, joiden raaka on kadonnut, poistetaan
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and os.path.splitext(f)[0] not in raws:
            os.remove(os.path.join(OUT, f))
            removed += 1
    for n, e in sounds.items():
        e['f'] = f'{PROJ_A}/valmiit/{n}.mp3'   # v2.16: peli hakee tiedoston tästä polusta (sounds/ + f)
    t_sounds, t_stat, t_warn, t_err = process_toiminnot(ff, init, old)
    warn += t_warn
    errors += t_err
    allsnd = dict(sounds)
    allsnd.update(t_sounds)
    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump({'v': 3, 'sounds': dict(sorted(allsnd.items()))}, f, ensure_ascii=False, indent=1)
        f.write('\n')
    write_list(sounds, raws)
    write_list_t(t_sounds)
    print(f'Toiminnot: käsitelty {t_stat[0]}, ennallaan {t_stat[1]}, poistettu {t_stat[2]}, oikeita ääniä {len(t_sounds)}')
    print(f'Käsitelty: {done}, ennallaan: {skipped}, poistettu: {removed}, oikeita ääniä yhteensä: {len(sounds)}')
    if extra:
        print('Lisäversiot käytössä (yli paikkamerkkien): ' + ', '.join(sorted(extra, key=natkey)))
    for w in warn:
        print('HUOM', w)
    for e in errors:
        print('VIRHE', e)
    return 1 if errors else 0


def natkey(n):
    """Luonnollinen järjestys: idle_2 ennen idle_10."""
    return [int(t) if t.isdigit() else t for t in re.split(r'(\d+)', n)]


def own_versions(cid, kind, have):
    """Kaikki olemassa olevat versionumerot (v2.11: rajaton määrä, _4, _5 …)."""
    pre = f'{cid}_{kind}_'
    return sorted(int(n[len(pre):]) for n in have if n.startswith(pre) and n[len(pre):].isdigit())


# ================================================================ OLENTOJEN TOIMINNOT (v2.16, äänierä B1)
# Ryhmät jalkojen ja koon mukaan; ryhmän olennot jakavat äänet. Raa'at: sounds/olennot_toiminnot/raw/<ryhmä>/<ääni>_<n>.mp3,
# valmiit: …/valmiit/<ryhmä>_valmis/<ääni>_<n>.mp3, manifestin avain t/<ryhmä>/<ääni>_<n>. Puuttuva ääni = hiljaisuus (lainaa vain pomot, käyttäjän päätös).
# Pelin ryhmäjako on audio.js:n TG-taulussa – pidä samana kuin TG_GROUPS:n jäsenet.
SURF = ['ruoho', 'kivi', 'hiekka', 'lumi', 'suo', 'puu', 'jaa', 'pusikko', 'kahlaus', 'uinti']
SURF_FI = {'ruoho': 'ruoho, maa, kangas, nummi', 'kivi': 'vuoret, rakka, luolat ja ulottuvuudet, kivirakennukset', 'hiekka': 'hietaranta',
           'lumi': 'routahuiput', 'suo': 'upposuo, muta', 'puu': 'puurakennukset (lattiat, portaat)', 'jaa': 'Routaluolan jää',
           'pusikko': 'Aarnimetsä: pusikon ja lehvien läpi kulkeminen (välillä oksa rasahtaa, ks. oksa)', 'kahlaus': 'matala vesi',
           'uinti': 'syvä vesi'}
LAND = [x for x in SURF if x not in ('kahlaus', 'uinti')]
def _steps(surfs):
    return [f'askel_{x}' for x in surfs]
COMMON_ATK = ['huitaisu', 'osuma']
# v2.17: pomot jakavat yhteisen pääkansion `pomot/`; jokaisen pomon omassa kansiossa on samat paikat – oma ääni voittaa, muuten lainataan pomot-kansiosta
# v2.21: pomojen askeleet tulevat kaksijalkaisilta (kerrostus, TG_BASE) + tömistys päälle, joten askelpaikkoja ei enää ole
BOSS_EV = ['tomistys', 'kaatuminen'] + COMMON_ATK + ['ryntays_lataus', 'ryntays']
# v2.21 KERROSTUS (käyttäjän päätös): raskaat ja kevyet eläimet, luurangot, kivivartija ja pomot eivät tarvitse omia ääniä jokaiselle
# tapahtumalle. Peli soittaa pohjaryhmän äänen (kaksijalkaiset / nelijalkaiset, sävel ja voimakkuus ryhmän mukaan) ja ryhmän oman
# samannimisen äänen PÄÄLLE, jos sellainen on. Paikkamerkit vain ryhmän omille kerroksille (tömistys, kalina) ja ainutlaatuisille äänille;
# pohjaryhmän ääniä saa lisätä kansioon vapaasti samalla nimellä (soivat päällekkäin). Pidä samana kuin audio.js:n TG_BASE/TG_BASEP.
TG_BASE = {'raskaat_nelijalkaiset': 'nelijalkaiset', 'kevyet_nelijalkaiset': 'nelijalkaiset', 'kevyet_kaksijalkaiset': 'kaksijalkaiset',
           'luurangot': 'kaksijalkaiset', 'kivivartija': 'kaksijalkaiset', 'pomot': 'kaksijalkaiset', 'kalmanvartija': 'kaksijalkaiset',
           'jaatar': 'kaksijalkaiset', 'kalmaherra': 'kaksijalkaiset', 'aarnihirvio': 'kaksijalkaiset'}
TG_BASEP = {'raskaat_nelijalkaiset': (.8, 1), 'kevyet_nelijalkaiset': (1.3, .55), 'kevyet_kaksijalkaiset': (1.5, .45), 'luurangot': (1.05, .8),
            'kivivartija': (.8, 1), 'pomot': (.7, 1), 'kalmanvartija': (.62, 1), 'jaatar': (.75, 1), 'kalmaherra': (.72, 1), 'aarnihirvio': (.68, 1)}
# kerros joka askeleella (soi askeleen kanssa yhtä aikaa; ei uidessa, tömistys ei kahlatessa)
TG_STEP_LAYER = {'raskaat_nelijalkaiset': 'tomistys', 'kivivartija': 'tomistys', 'luurangot': 'kalina', 'pomot': 'tomistys',
                 'kalmanvartija': 'tomistys', 'jaatar': 'tomistys', 'kalmaherra': 'tomistys', 'aarnihirvio': 'tomistys'}
TG_BORROW = {'kalmanvartija': 'pomot', 'jaatar': 'pomot', 'kalmaherra': 'pomot', 'aarnihirvio': 'pomot'}
TG_GROUPS = [   # (id, nimi, emoji, jäsenet, tapahtumat, iso)
    ('kaksijalkaiset', 'Kaksijalkaiset', '🦶', ['hiisi', 'suonakki'], _steps(SURF[:-1]) + ['oksa', 'kaatuminen', 'tormays'] + COMMON_ATK + ['nousu'], False),
    ('luurangot', 'Luurangot', '💀', ['kalmo', 'ylimys'], ['kalina'], False),
    ('nelijalkaiset', 'Nelijalkaiset', '🐾', ['peura', 'poro', 'hirvi', 'karju', 'emakko', 'susi', 'routasusi', 'kalmasusi', 'ilves', 'ahma'],
     _steps(SURF) + ['oksa', 'kaatuminen', 'tormays'] + COMMON_ATK + ['nousu', 'ravistus', 'nuuhkiminen', 'syominen_laidun', 'syominen_tonkiminen', 'syominen_rouskutus'], False),
    ('raskaat_nelijalkaiset', 'Raskaat nelijalkaiset (ei pomoja)', '🐻', ['karhu', 'hiidenkarhu', 'hiidenhirvi'], ['tomistys'], True),
    ('kevyet_nelijalkaiset', 'Kevyet nelijalkaiset', '🐇', ['janis', 'kettu', 'porsas'], ['syominen_nakerrus'], False),
    ('kevyet_kaksijalkaiset', 'Kevyet kaksijalkaiset', '🐦', ['metso'], ['lentoonlahto'], False),
    ('kivivartija', 'Kivivartija', '🪨', ['kivivartija'], ['tomistys'], True),
    ('pomot', 'Pomot – yhteinen pääkansio', '👑', ['vartija', 'jaajattari', 'kalmaherra', 'aarnihirvio'], BOSS_EV, True),
    ('kalmanvartija', 'Kalmanvartija (oma, muuten pomot)', '🗿', ['vartija'], BOSS_EV, True),
    ('jaatar', 'Jäätär (oma, muuten pomot)', '❄️', ['jaajattari'], BOSS_EV, True),
    ('kalmaherra', 'Kalmaherra (oma, muuten pomot)', '🔥', ['kalmaherra'], BOSS_EV, True),
    ('aarnihirvio', 'Aarnihirviö (oma, muuten pomot)', '🌳', ['aarnihirvio'], BOSS_EV, True),
    ('yhteiset', 'Yhteiset (kaikki olennot, sävel koon mukaan)', '🌐', ['kaikki'], ['palaminen', 'kahina', 'loiskahdus'], False),
]
TG_BY = {g[0]: g for g in TG_GROUPS}
# käsittelyprofiili: (yläraja s: tavallinen, iso; häivytys s; tavoite-LUFS). Isoille (iso=True) +2 dB.
T_PROF = {'askel': (.5, .8, .05, -27), 'kahlaus': (1.2, 1.5, .15, -25), 'uinti': (1.5, 1.8, .2, -25), 'oksa': (.5, .5, .05, -23),
          'kaatuminen': (1.5, 2.5, .25, -19), 'tormays': (.8, 1.0, .1, -19), 'huitaisu': (.7, 1.0, .1, -21), 'osuma': (.8, 1.0, .1, -17),
          'nousu': (1.5, 2.0, .2, -25), 'kalina': (1.0, 1.0, .15, -27), 'ravistus': (1.5, 1.5, .2, -23), 'nuuhkiminen': (1.5, 1.5, .2, -27),
          'syominen': (2.5, 2.5, .3, -25), 'lentoonlahto': (2.0, 2.0, .3, -19), 'palaminen': (3.0, 3.0, .15, -24), 'kahina': (1.2, 1.2, .15, -25),
          'loiskahdus': (1.2, 1.5, .2, -21), 'ryntays': (2.0, 2.5, .25, -18), 'tomistys': (.6, .9, .08, -26)}
def t_prof(ev, big):
    k = 'kahlaus' if ev == 'askel_kahlaus' else 'uinti' if ev == 'askel_uinti' else ev.split('_')[0]
    a, b, f, t = T_PROF[k]
    return (a, b, f, t + (2 if big else 0))
T_SLOTS = 2   # paikkamerkkejä per ääni (_1, _2); lisää _3, _4 … vapaasti
EV_FI = {   # kuvaus ja oletushakusanat (englanniksi)
    'oksa': ('oksa rasahtaa jalan alla (Aarnimetsä, välillä; soi hiljaa, enintään 2 s välein)', 'twig snap, branch crack footstep'),
    'kaatuminen': ('ruumis kaatuu maahan kuollessa', 'body fall thud, animal collapse'),
    'tormays': ('törmää kovassa vauhdissa seinään, puuhun tai kiveen (myös tönäistynä)', 'body impact wall, thud bump'),
    'huitaisu': ('hyökkäyksen viuhahdus iskun hetkellä', 'swipe whoosh, claw swing'),
    'osuma': ('osuu pelaajaan (purema, kynsi, isku)', 'bite impact, claw hit flesh'),
    'nousu': ('nousee makuulta syntyessään (ähkäisy, rapina)', 'creature getting up, rustle grunt'),
    'kalina': ('luut kalisevat joka askeleella (soi askeleen päällä, lyhyt ja hiljainen)', 'bones rattle, skeleton clatter soft'),
    'tomistys': ('matala tömähdys joka askeleella (soi askeleen kanssa yhtä aikaa, lyhyt ja pieni)', 'low thump footstep, heavy stomp, deep impact'),
    'ravistus': ('ravistaa turkin vedestä noustessa', 'dog shake off water, fur shake'),
    'nuuhkiminen': ('nuuhkii uteliaana (kun katsoo sinua)', 'animal sniffing, sniff'),
    'syominen_laidun': ('laiduntaa: repii ja jauhaa ruohoa (peura, poro, hirvi)', 'deer grazing, grass chewing'),
    'syominen_tonkiminen': ('tonkii maata röhkien (karju, emakko, porsas)', 'pig rooting, boar snuffling dirt'),
    'syominen_rouskutus': ('kalvaa raatoa, luu rouskuu (sudet, karhu, ahma)', 'wolf gnawing bone, chewing meat'),
    'syominen_nakerrus': ('nakertaa (jänis)', 'rabbit nibbling, gnawing'),
    'ryntays_lataus': ('ryntäyksen lataus: pomo kumartuu ja kerää voimaa (0,6 s ennen syöksyä)', 'monster charge up growl, heavy breath windup'),
    'ryntays': ('ryntäys: raskas syöksy eteenpäin', 'monster charge rush roar, heavy stampede dash'),
    'lentoonlahto': ('lähtee lentoon (siivet räpyttävät)', 'grouse flush, bird wings takeoff flapping'),
    'palaminen': ('liekkien rätinä olennon palaessa (silmukka)', 'fire crackle loop, burning'),
    'kahina': ('juoksee pensaan tai heinikon läpi', 'bush rustle, running through foliage'),
    'loiskahdus': ('menee tai putoaa veteen', 'splash into water, body splash'),
}
STEP_KEYS = {'ruoho': 'footstep grass dirt', 'kivi': 'footstep stone rock', 'hiekka': 'footstep sand', 'lumi': 'footstep snow crunch',
             'suo': 'footstep mud squelch swamp', 'puu': 'footstep wood floor', 'jaa': 'footstep ice', 'pusikko': 'walking through bushes leaves',
             'kahlaus': 'wading water footsteps', 'uinti': 'animal swimming splash paddle'}
G_KEYS = {'kaksijalkaiset': 'small creature', 'luurangot': 'skeleton bony', 'nelijalkaiset': 'animal hooves paws', 'raskaat_nelijalkaiset': 'heavy animal bear', 'pomot': 'giant monster heavy boss',
          'kevyet_nelijalkaiset': 'small animal light', 'kevyet_kaksijalkaiset': 'bird hop light', 'kivivartija': 'stone golem rock',
          'kalmanvartija': 'giant stone heavy boom', 'jaatar': 'ice giant crystal', 'kalmaherra': 'demon lord heavy', 'aarnihirvio': 'giant tree creature wood'}
G_OVER = {('luurangot', 'kaatuminen'): ('luut romahtavat kasaan kuollessa', 'skeleton collapse, bones falling'),
          ('kivivartija', 'kaatuminen'): ('kivet romahtavat kasaan', 'rock golem collapse, stones crumble'),
          ('kalmanvartija', 'kaatuminen'): ('kivenlohkareet putoavat maahan (kova, raskas)', 'huge stones falling, heavy rock impact'),
          ('jaatar', 'kaatuminen'): ('jääkappaleet putoavat ja särkyvät', 'ice chunks fall shatter'),
          ('kalmaherra', 'kaatuminen'): ('panssarin ja luiden palat putoavat', 'armor pieces fall, bones clatter heavy'),
          ('aarnihirvio', 'kaatuminen'): ('puun kappaleet putoavat ja natisevat', 'wood chunks fall, timber crash'),
          ('kalmanvartija', 'huitaisu'): ('valtava kivinen isku viuhuu', 'giant stone swing whoosh heavy'),
          ('kalmanvartija', 'osuma'): ('kivinen nyrkki murskaa', 'heavy stone punch impact'),
          ('kevyet_kaksijalkaiset', 'kaatuminen'): ('lintu putoaa ja höyhenet pöllähtävät', 'bird fall, feathers flutter')}

def t_info(g, ev):
    if ev.startswith('askel_'):
        x = ev[6:]
        big = TG_BY[g][5]
        return (f'askel: {SURF_FI[x]}' + (' – raskas, kuuluu 40 m' if big else ''), f'{STEP_KEYS[x]}, {G_KEYS.get(g, "")}'.strip(', '))
    if (g, ev) in G_OVER:
        return G_OVER[(g, ev)]
    d, k = EV_FI[ev]
    return d, (f'{k}, {G_KEYS[g]}' if g in G_KEYS else k)

def t_allowed(g):
    """Ryhmän kansioon kelpaavat äänet: omat paikat + kerrostuvan ryhmän pohjaryhmän äänet (soivat pohjaäänen päällä)."""
    evs = list(TG_BY[g][4])
    b = TG_BASE.get(g)
    return evs + [e for e in TG_BY[b][4] if e not in evs] if b else evs

def t_expected():
    return [f't/{g}/{ev}_{n}' for g, _, _, _, evs, _ in TG_GROUPS for ev in evs for n in range(1, T_SLOTS + 1)]

def process_toiminnot(ff, init, old):
    """Toimintoäänet: paikkamerkit (--init), käsittely ryhmäkansioittain, poistot. Palauttaa (äänet, (tehty, ennallaan, poistettu), huom, virheet)."""
    warn, errors, sounds = [], [], {}
    done = skipped = removed = 0
    if init:
        with tempfile.TemporaryDirectory() as td:
            ph = os.path.join(td, 'ph.mp3')
            make_placeholder(ff, ph)
            made = dropped = 0
            for g, _, _, _, evs, _ in TG_GROUPS:
                d = os.path.join(RAW_T, g)
                os.makedirs(d, exist_ok=True)
                for f in sorted(os.listdir(d)):   # v2.21: paikkamerkki äänelle, jota ryhmällä ei enää ole (kerrostus) → pois; oikeat äänet jäävät
                    fp, mm2 = os.path.join(d, f), re.match(r'^(.+)_(\d+)\.mp3$', f)
                    if mm2 and mm2.group(1) not in evs and os.path.getsize(fp) <= PLACEHOLDER_MAX:
                        os.remove(fp)
                        dropped += 1
                have = {os.path.splitext(f)[0] for f in os.listdir(d)}
                for ev in evs:
                    for n in range(1, T_SLOTS + 1):
                        if f'{ev}_{n}' not in have:
                            shutil.copyfile(ph, os.path.join(d, f'{ev}_{n}.mp3'))
                            made += 1
            print(f'Toimintojen paikkamerkkejä luotu: {made}' + (f', vanhentuneita poistettu: {dropped}' if dropped else ''))
    if not os.path.isdir(RAW_T):
        return sounds, (0, 0, 0), warn, errors
    raws = {}
    for g in sorted(os.listdir(RAW_T)):
        d = os.path.join(RAW_T, g)
        if not os.path.isdir(d):
            continue
        if g not in TG_BY:
            warn.append(f'toiminnot/{g}: tuntematon ryhmäkansio (ei käytetä)')
            continue
        for f in sorted(os.listdir(d)):
            p = os.path.join(d, f)
            if not os.path.isfile(p) or f.startswith('.'):
                continue
            n = f't/{g}/{os.path.splitext(f)[0]}'
            if n not in raws or os.path.getsize(p) > os.path.getsize(raws[n]):
                raws[n] = p
    for n, p in sorted(raws.items(), key=lambda kv: natkey(kv[0])):
        _, g, base = n.split('/')
        mm = re.match(r'^(.+)_(\d+)$', base)
        dst = os.path.join(out_dir_t(g), base + '.mp3')
        if os.path.getsize(p) <= PLACEHOLDER_MAX:
            if os.path.exists(dst):
                os.remove(dst)
                removed += 1
            continue
        if not mm or mm.group(1) not in t_allowed(g):
            warn.append(f'{n}: tuntematon ääni ryhmälle {g} (peli ei käytä) – sallitut: {", ".join(t_allowed(g))}')
            continue
        ev = mm.group(1)
        src_h = sha(p)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if n in old and old[n].get('src') == src_h and old[n].get('pv') == PV and os.path.exists(dst):
            sounds[n] = old[n]
            skipped += 1
        else:
            err, res = process(ff, p, dst, sniff(p), 'hostile', ev, prof=t_prof(ev, TG_BY[g][5]), big=TG_BY[g][5])
            if err:
                errors.append(f'{n}: {err}')
                continue
            gain, rawd = res
            sounds[n] = {'h': sha(dst, 10), 'src': src_h, 'dur': duration(ff, dst), 'pv': PV, 'gain': gain, 'raw': rawd}
            print(f'  {n}: {sounds[n]["dur"]} s (raaka {rawd} s), vahvistus {gain:+.1f} dB')
            done += 1
        sounds[n]['f'] = f'{PROJ_T}/valmiit/{g}{VALMIS}/{base}.mp3'
        gn = sounds[n].get('gain')
        if gn is not None and abs(gn) > 12:
            warn.append(f'{n}: iso vahvistus {gn:+.1f} dB (raaka erittäin hiljainen tai kova – tarkista kuuntelemalla)')
    byh = {}
    for n in sounds:
        byh.setdefault(sounds[n]['src'], []).append(n)
    for h, ns in byh.items():
        if len(ns) > 1:
            warn.append('SAMA TIEDOSTO useassa paikassa: ' + ', '.join(ns))
    # valmiit-kansioon jokaiselle ryhmälle oma <ryhmä>_valmis/-kansio (myös tyhjänä, .gitkeep pitää sen gitissä)
    for g, *_ in TG_GROUPS:
        d = out_dir_t(g)
        os.makedirs(d, exist_ok=True)
        if not any(f.endswith('.mp3') for f in os.listdir(d)):
            open(os.path.join(d, '.gitkeep'), 'a').close()
        elif os.path.exists(os.path.join(d, '.gitkeep')):
            os.remove(os.path.join(d, '.gitkeep'))
    if os.path.isdir(OUT_T):
        for dn in os.listdir(OUT_T):
            d = os.path.join(OUT_T, dn)
            if not os.path.isdir(d):
                continue
            g = dn[:-len(VALMIS)] if dn.endswith(VALMIS) else dn
            for f in os.listdir(d):
                if f.endswith('.mp3') and (not dn.endswith(VALMIS) or f't/{g}/{os.path.splitext(f)[0]}' not in sounds):
                    os.remove(os.path.join(d, f))
                    removed += 1
            if not dn.endswith(VALMIS) and not os.listdir(d):
                os.rmdir(d)
    return sounds, (done, skipped, removed), warn, errors

def write_list_t(sounds):
    tot = own = 0
    rows = []
    for g, name, emo, mem, evs, big in TG_GROUPS:
        have_g = sum(1 for ev in evs if CRE_T_HAVE(sounds, g, ev))
        tot += len(evs)
        own += have_g
        mems = ', '.join(MEM_FI.get(x, x) for x in mem)
        rows.append(f'\n### {emo} {name} – `{g}/` ({have_g}/{len(evs)} ääntä)\n')
        if g == 'pomot':
            rows.append('💎 **Pääkansio:** kaikki pomot lainaavat nämä äänet (sävel pomon mukaan), ellei pomon omassa kansiossa ole samannimistä ääntä.\n')
        elif g in TG_BORROW:
            rows.append(f'🔁 Lainaa `{TG_BORROW[g]}/`-kansiosta. Lisää tähän oma ääni samalla nimellä, niin se valitaan ensin.\n')
        if g in TG_BASE:
            bp, bv = TG_BASEP[g]
            ly = TG_STEP_LAYER.get(g)
            rows.append(f'➕ **Kerrostuu:** soittaa `{TG_BASE[g]}/`-kansion äänet (sävel ×{bp:g}, voimakkuus ×{bv:g}) ja tämän kansion samannimisen äänen päälle. '
                        + (f'`{ly}` soi joka askeleella askeleen kanssa yhtä aikaa. ' if ly else '')
                        + f'Voit lisätä tähän myös `{TG_BASE[g]}`-ryhmän ääniä samalla nimellä (esim. `askel_ruoho_1`) – ne soivat pohjaäänen päällä.\n')
        rows.append(f'Jäsenet: {mems}.' + (' Iso: kovempi, askeleet kuuluvat 40 m.' if big else '') + (' Pomo: askeleet tärisyttävät maata (kamera tärähtää alle 15 m:ssä).' if g in BOSS_G else '') + '\n')
        rows.append('| Ääni | Tiedostot (paikat _1, _2; lisää _3 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |')
        rows.append('| --- | --- | --- | --- | --- |')
        for ev in evs:
            mine = own_versions_t(sounds, g, ev)
            files = ', '.join(f'`{ev}_{n}`' for n in sorted(set(range(1, T_SLOTS + 1)) | set(mine)))
            bg = TG_BORROW.get(g)
            if mine:
                st = f'✅ oma: {", ".join(f"_{n}" for n in mine)} ({len(mine)} kpl)'
            elif bg and own_versions_t(sounds, bg, ev):
                st = f'🔁 lainaa: {bg}/{ev}'
            elif bg:
                st = f'⬜ puuttuu (lainaa {bg}-kansiosta, kun sinne lisätään)'
            elif ev == TG_STEP_LAYER.get(g):
                st = '⬜ puuttuu (askel soi ilman tätä kerrosta)'
            else:
                st = '⬜ puuttuu (hiljaa)'
            if not mine and not bg and (ev in PRIO_T or ev == PRIO_STEP.get(g)):
                st += '<br>🎯 lisää ensin (kuuluu usein)'
            d, k = t_info(g, ev)
            rows.append(f'| {ev} | {files} | {st} | {d} | {k} |')
    head = f"""# Hiidenmaan äänilista: olentojen toiminnot ja ääniefektit

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

{chr(10).join(f'- `askel_{x}`: {SURF_FI[x]}' for x in SURF)}

**Käsittely:** askel ≤ 0,5 s (iso 0,8), −27 LUFS; tömistys ≤ 0,6 s (iso 0,9), −26 LUFS; kahlaus/uinti ≤ 1,2–1,8 s; kaatuminen ≤ 1,5 s (iso 2,5); isku/osuma ≤ 0,7–1,0 s; syöminen ≤ 2,5 s;
palaminen ≤ 3 s (soi silmukkana). Isot ryhmät +2 dB. Anna raaka kuivana ja puhtaana (peli lisää etäisyyden ja kaiun).

## Ryhmät ({own}/{tot} ääntä omilla äänillä)
"""
    with open(LISTA_T, 'w', encoding='utf-8') as f:
        f.write(head + '\n'.join(rows) + '\n')

MEM_FI = {'hiisi': 'Sammalhiisi', 'suonakki': 'Suonäkki', 'kalmo': 'Kalmo', 'ylimys': 'Kalmon ylimys', 'peura': 'Peura', 'poro': 'Poro',
          'hirvi': 'Hirvi', 'karju': 'Karju', 'emakko': 'Emakko', 'susi': 'Susi', 'routasusi': 'Routasusi', 'kalmasusi': 'Kalmasusi',
          'ilves': 'Ilves', 'ahma': 'Ahma', 'karhu': 'Karhu', 'hiidenkarhu': 'Hiidenkarhu', 'hiidenhirvi': 'Hiidenhirvi', 'janis': 'Jänis',
          'kettu': 'Kettu', 'porsas': 'Porsas', 'metso': 'Metso', 'kivivartija': 'Kivivartija', 'vartija': 'Kalmanvartija',
          'jaajattari': 'Jäätär', 'kalmaherra': 'Kalmaherra', 'aarnihirvio': 'Aarnihirviö', 'kaikki': 'kaikki olennot'}
BOSS_G = {'pomot', 'kalmanvartija', 'jaatar', 'kalmaherra', 'aarnihirvio'}
PRIO_T = {'kaatuminen'}
PRIO_STEP = {'kaksijalkaiset': 'askel_ruoho', 'luurangot': 'kalina', 'nelijalkaiset': 'askel_ruoho', 'raskaat_nelijalkaiset': 'tomistys', 'pomot': 'tomistys',
             'kevyet_nelijalkaiset': '', 'kevyet_kaksijalkaiset': 'lentoonlahto', 'kivivartija': 'tomistys', 'yhteiset': 'palaminen'}

def own_versions_t(sounds, g, ev):
    pre = f't/{g}/{ev}_'
    return sorted(int(n[len(pre):]) for n in sounds if n.startswith(pre) and n[len(pre):].isdigit())

def CRE_T_HAVE(sounds, g, ev):
    return bool(own_versions_t(sounds, g, ev))


def resolve(cid, kind, have, vara):
    """Sama logiikka kuin pelissä (audio.js creRes): omat versiot (kaikki) → varaääniketju. Palauttaa (nimet, sävelkerroin)."""
    cur, p = cid, 1.0
    for _ in range(6):
        if not cur:
            break
        L = [f'{cur}_{kind}_{n}' for n in own_versions(cur, kind, have)]
        if L:
            return L, p
        v = vara.get(cur)
        if not v:
            break
        p *= v['p']
        cur = v['to']
    return [], p


def write_list(sounds, raws):
    vara = varaani()
    cre = creatures()
    users = {}
    for cid, (to) in ((k, v['to']) for k, v in vara.items()):
        users.setdefault(to, []).append(cid)
    names = {cid: name for cid, name, _ in cre}
    order = {cid: i for i, (cid, _, _) in enumerate(cre)}

    def borrowers(cid):
        """Kaikki jotka lainaavat tältä (myös ketjun kautta): [(id, ketjun_väli_id tai None)], suorat ensin."""
        out, seen = [], {cid}
        for u in sorted(users.get(cid, []), key=order.get):
            out.append((u, None))
            seen.add(u)
        todo = [u for u, _ in out]
        while todo:
            cur = todo.pop(0)
            for u in sorted(users.get(cur, []), key=order.get):
                if u not in seen:
                    seen.add(u)
                    out.append((u, cur))
                    todo.append(u)
        return out
    cats = [('Eläimet', ('flee', 'neutral')), ('Viholliset', ('hostile',)), ('Pomot', ('boss', 'rboss'))]
    aiof = {cid: ai for cid, _, ai in cre}

    def silent_fill(cid, kind):
        """v2.11 🎯: olennot, joilla ei nyt ole lainkaan tätä ääntä ja jotka saisivat sen, jos `cid` saa oman (cid itse mukaan lukien)."""
        out = []
        for u, _ in [(cid, None)] + borrowers(cid):
            if kind in kinds_of(aiof[u]) and not resolve(u, kind, sounds, vara)[0]:
                out.append(u)
        return out
    def kind_root(cid, kind):
        """Ketjun alku tälle lajille: kukaan ketjussa ylempänä ei voi antaa tätä lajia (ei lainaa tai ylemmillä ei ole lajia, esim. jahtiääni)."""
        cur, seen = vara.get(cid, {}).get('to'), {cid}
        while cur and cur not in seen:
            if cur in aiof and kind in kinds_of(aiof[cur]):
                return False
            seen.add(cur)
            cur = vara.get(cur, {}).get('to')
        return True
    gaps = []   # (cid, kind, täyttyvät)
    own = tot = 0
    rows = []
    for title, ais in cats:
        rows.append(f'\n### {title}\n')
        rows.append('| Olento | Ääni | Tiedostot (paikat 1–3, kuolema ja kaiku 1–2; lisää _4, _5 … vapaasti) | Tila | Millainen ääni | Hakusanat (englanniksi) |')
        rows.append('| --- | --- | --- | --- | --- | --- |')
        for cid, name, ai in cre:
            if ai not in ais:
                continue
            info = CRE_INFO.get(cid, (name, {}))
            # roolit: 💎 pääääni (muut lainaavat, ei lainaa itse) · ⭐ väliääni (lainaa itse ja muut lainaavat siltä) · ei merkkiä = vain lainaa
            deps = borrowers(cid)
            if deps:
                mark = '⭐' if cid in vara else '💎'
                lst = ', '.join(names[u].lower() + (f' (via {names[v].lower()})' if v else '') for u, v in deps)
                star = f' {mark} ({len(deps)})<br>lainaavat: {lst}'
            elif cid not in vara:
                star = ' 🌱<br>ei lainaa eikä lainata'
            else:
                star = ''
            for j, kind in enumerate(kinds_of(ai)):
                tot += 1
                mine = own_versions(cid, kind, sounds)
                vs = variants_of(ai, kind)
                files = ', '.join(f'`{cid}_{kind}_{n}`' for n in sorted(set(vs) | set(mine)))
                if mine:
                    st = f'✅ oma: {", ".join(f"_{n}" for n in mine)} ({len(mine)} kpl)'
                    fr = [n for n in mine if sounds.get(f'{cid}_{kind}_{n}', {}).get('far')]
                    if fr:
                        st += f'<br>📢 kuuluu kauas: {", ".join(f"_{n}" for n in fr)}'
                    own += 1
                else:
                    src, p = resolve(cid, kind, sounds, vara)
                    if src:
                        st = f'🔁 varaääni: {", ".join(src)}' + (f' (sävel ×{p:.2f})' if abs(p - 1) > .001 else '')
                    elif kind == 'echo':
                        st = '⬜ puuttuu' + ('' if cid == 'aarnihirvio' else ' (varalla: aarnihirvio)') + (' – **kaikuäänien pääääni 💎**' if cid == 'aarnihirvio' else '')
                    elif kind == 'chase' and cid in vara:
                        st = '⬜ puuttuu (varaääniketjussa ei ole jahtiääntä)' if kind_root(cid, kind) else f'⬜ puuttuu (varalla: {vara[cid]["to"]})'
                    elif kind == 'aggro' and ai in CHASE_AI:
                        st = '⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti'
                    else:
                        st = '⬜ puuttuu' + (f' (varalla: {vara[cid]["to"]})' if cid in vara else '')
                if not mine and kind_root(cid, kind):
                    fill = silent_fill(cid, kind)
                    if fill:
                        st += f'<br>🎯 lisää tämä → ääni {len(fill)} olennolle'
                        gaps.append((cid, kind, fill))
                who = f'**{name}** (`{cid}`){star}' if j == 0 else ''
                rows.append(f'| {who} | {kind} | {files} | {st} | {KIND_FI[kind]} – {info[0]} | {info[1].get(kind, info[1].get("aggro", "") if kind == "chase" else "")} |')
    gap_txt = ('Kaikilla olennoilla on jokin ääni jokaiseen lajiin. ✅' if not gaps else
               f'{len(gaps)} ääntä puuttuu ketjujen alusta – lisää nämä, niin jokainen olento saa jokaiseen lajiin jonkin äänen:\n\n' +
               '\n'.join(f'- `{c}_{k}_1` → {", ".join(names[u].lower() for u in f)}' for c, k, f in gaps))
    head = f'''# Hiidenmaan äänilista

Projekti `sounds/olennot_aanet/` (raa'at `raw/`, valmiit `valmiit/`). Olentojen toiminto- ja ääniefektit (askeleet, kaatuminen, syöminen …) ovat omassa
projektissaan `sounds/olennot_toiminnot/` (AANILISTA_TOIMINNOT.md). Äänisuunnitelma: `docs/KEHITYSMUISTIO.md` → "Äänisuunnitelma". Tämä taulukko päivittyy automaattisesti
(`python3 tools/process_sounds.py`) – älä muokkaa taulukkoa käsin.

## Näin lisäät äänen

1. Etsi ääni (CC0 / vapaa käyttö): **Kenney** (kenney.nl), **Pixabay** (pixabay.com/sound-effects), **Freesound** (CC0-suodatin),
   **OpenGameArt**. Käytä alla olevia hakusanoja.
2. **Kuuntele ääni omalla koneellasi** ennen lisäämistä – git-historia muistaa jokaisen version, joten vaihda vain harkiten.
3. Korvaa paikkamerkki `sounds/olennot_aanet/raw/`-kansiossa **täsmälleen samalla nimellä** (esim. `susi_aggro_1.mp3`). Jokaisella äänellä on kolme paikkaa
   `_1`, `_2`, `_3`: täytä vain ne jotka haluat – peli arpoo olemassa olevista (yksi riittää, tyhjät paikat ohitetaan). **Lisää versioita:**
   tee uusi tiedosto seuraavalla numerolla (`susi_idle_4.mp3`, `_5` …) – ei rajaa, peli ottaa sen käyttöön automaattisesti.
   **Muokattu ääni:** korvaa raaka samalla nimellä – työkalu huomaa muutoksen ja käsittelee sen uudestaan (vanha käsitelty korvautuu). Lyhyet äänet saa olla wav
   (pääte voi jäädä .mp3 – muoto tunnistetaan sisällöstä), pitkät (musiikki, loopit) mp3, alle 25 Mt.
4. Commit ja push GitHub Desktopilla ja pyydä Claudea ajamaan `python3 tools/process_sounds.py`: hiljaisuus leikataan alusta ja lopusta,
   ääni katkaistaan lajin ylärajaan (häivytys), voimakkuus tasataan lajin tavoitteeseen ja se siirtyy peliin (`sounds/olennot_aanet/valmiit/<nimi>.mp3`).
   Raakatiedostot jäävät `sounds/olennot_aanet/raw/`-kansioon. **Älä itse trimmaa tai normalisoi** – työkalu tekee sen; anna raaka mieluummin pitkänä ja puhtaana.
   Kaikuääni (`<pomo>_echo_1/2`) on ulottuvuuspomoilla ja Kalmanvartijalla (maan alta Kalmankehän lähellä); **Aarnihirviön kaikuäänet ovat kaikkien pomojen varaääni**. Kuolemaäänelle on **1 paikka** ulottuvuuksien hirviöillä (Jäätär, Kalmaherra, Aarnihirviö) ja **2 paikkaa** kaikilla muilla.

**Käsittelyn rajat (lajeittain):** idle ≤ 3 s (pomo 4), hurt ≤ 1,2 s (1,6), death ≤ 3,5 s (6), aggro ≤ 2,5 s (3,5), chase ≤ 2,5 s (4), echo ≤ 5 s (6).
**Pitkät äänet (v2.12):** jos raaka jatkuu yli rajan (ulvonta, soidin, mylvintä), sitä ei katkaista kesken vaan se päättyy luonnolliseen taukoon,
enintään idle 10 s, death 5 s (pomo 8), aggro 4 s (5), chase 3,5 s (4,5), echo 10 s. Osumaääni pysyy aina lyhyenä.
**Kuuluvuus (v2.12):** 📢 = kutsuääni (suden ulvonta, hirven mylvintä, metson soidin, karhun karjaisu…, vähintään 1,5 s) kuuluu noin 150 m päähän (v2.14);
muut äänet noin 64 m (rauhallinen ääntely 36 m), kaukana hiljaisempina. Kaukana ääni tummuu ja kaikuu luonnollisesti (peli lisää efektin, älä lisää sitä raakaan).
Yöllä kuuluu lisäksi kaukaista suden ulvontaa (100–145 m) satunnaisesta suunnasta. Sudet ulvovat päivällä harvoin, yöllä useammin.
Tavoiteäänekkyys (LUFS): idle −22, hurt −17, death −16, aggro −16, chase −18, echo −26; pomot +1…1,5 dB. Ulottuvuuksissa (luolasto, ulottuvuudet)
olennot saavat pelissä kaiun (ei tiedostoon), joten anna raakaääni kuivana, ilman omaa kaikua.

**Tilat (Tila-sarake):** ✅ oma ääni · 🔁 väliaikainen varaääni toiselta olennolta (sävelkorkeutta muutettu) · ⬜ puuttuu (peli käyttää
tehtyä ääntä tai on hiljaa). Varaäänet ovat vain väliaikaisia: jokaiselle olennolle kannattaa lopulta lisätä omat äänet.

## Äänierä A: olennot ({own}/{tot} äänilajia omilla äänillä)

**Selite (Olento-sarake, varaääniketju):**
- 💎 = **pääääni**: muut lainaavat tältä, se ei lainaa itse. Lisää nämä ensin – yksi ääni täyttää monta olentoa.
- ⭐ = **väliääni**: lainaa itse toiselta ja muut lainaavat siltä.
- ei merkkiä = **vain lainaa** (esim. Poro). Metsolla ei ole varaääntä lainkaan, joten se ei lainaa eikä lainata.
- Ulottuvuuksien hirviöt (Aarnihirviö 💎, Jäätär ja Kalmaherra) lainaavat Aarnihirviöltä, kunnes saavat omat äänet. Aarnihirviön äänet ovat siis
  tärkeimmät: ne täyttävät kolmen pomon puuttuvat äänet (sävelkorkeus muutettu).
- Merkin perässä oleva luku, esim. 💎 (3) = montako olentoa lainaa tältä (myös ketjun kautta). `lainaavat:` listaa ne; "via X" = lainaa
  ketjun kautta X:n välityksellä (kun X:llä on oma ääni, se lainaa X:ltä).
- 🌱 = **ei lainaa keneltäkään eikä kukaan lainaa siltä** (esim. Metso): ilman omaa ääntä se on hiljaa.
- 🎯 (Tila-sarakkeessa) = **lisää tämä ääni**: se on ketjun alku, ja ilman sitä yksi tai useampi olento on tässä lajissa kokonaan ilman ääntä.
  Kun kaikki 🎯-rivit on täytetty, **jokaisella olennolla on jokin ääni jokaiseen lajiin** (oma tai lainattu).
- **Lisää versioita vapaasti:** paikkamerkit ovat `_1`–`_3`, mutta voit lisätä `_4`, `_5`, `_6` … samalla nimikaavalla (esim. `susi_idle_4.mp3`).
  Peli arpoo kaikista olemassa olevista, eikä koodia tarvitse muuttaa.

### Kattavuus: puuttuvat ketjun alut (🎯)

{gap_txt}
'''
    with open(LISTA, 'w', encoding='utf-8') as f:
        f.write(head + '\n'.join(rows) + '\n\n## Tulevat äänierät\n\nB pelaajan ja toimintojen äänet · C taustaäänet ja sää · D musiikki · '
                'E äänifysiikka (ks. kehitysmuistion ideajono). Jokainen erä saa tähän oman osionsa.\n')


if __name__ == '__main__':
    sys.exit(main())
