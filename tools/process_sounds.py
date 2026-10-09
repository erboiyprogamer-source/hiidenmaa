#!/usr/bin/env python3
"""Hiidenmaa – äänien käsittely (äänisuunnitelma, ks. docs/KEHITYSMUISTIO.md "Äänisuunnitelma").

Käyttö (repon juuressa):
  python3 tools/process_sounds.py --init   luo puuttuvat paikkamerkit sounds/raw/ (ei koskaan ylikirjoita) + käsittelee
  python3 tools/process_sounds.py          käsittelee oikeat äänet, kirjoittaa sounds/manifest.json ja sounds/AANILISTA.md

Työnjako: Claude tekee paikkamerkit (hiljainen mp3 alle 3 kt) oikeilla nimillä. Käyttäjä kuuntelee ja korvaa paikkamerkin
TÄSMÄLLEEN samalla nimellä (GitHub Desktop). Tämä työkalu tunnistaa oikeat äänet (yli 3 kt, muoto sisällöstä eikä päätteestä),
ajaa ffmpeg → sounds/<nimi>.mp3 (mono 96 kbps). Käsittely (v1.86): matalat rumpuäänet pois (40 Hz), hiljaisuus pois alusta ja lopusta,
pituus katkaistaan lajin ylärajaan ja häivytetään (PROFIILI), voimakkuus mitataan (LUFS) ja nostetaan lajin tavoitteeseen + alimiter
(ei leikkaa). Raakatiedostoja ei poisteta. Käsittelyn tapa vaihtuessa (PV) kaikki ajetaan uudestaan.
Jos raaka palautetaan paikkamerkiksi, käsitelty ääni poistetaan. Peli lukee vain manifestissa olevat käsitellyt äänet.

ffmpeg: järjestelmän ffmpeg, tai `pip install imageio-ffmpeg`.
"""
import hashlib, json, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'sounds', 'raw')
OUT = os.path.join(ROOT, 'sounds')
MANIFEST = os.path.join(OUT, 'manifest.json')
LISTA = os.path.join(OUT, 'AANILISTA.md')
PLACEHOLDER_MAX = 3072          # tavua: tätä pienempi/yhtä suuri = paikkamerkki
AGGRO_AI = ('neutral', 'hostile', 'boss', 'rboss')   # suuttumisääni (aggro)
CHASE_AI = ('hostile', 'boss', 'rboss')               # + toistuva jahtiääni (chase)
ECHO_AI = ('rboss', 'boss')                           # v1.88: kaikuääni (echo): nukkuva ulottuvuuspomo kaikuu luolastossa kunnes pelaaja kohtaa sen; v1.95 myös Kalmanvartija maan alta
VARIANTS = (1, 2, 3)                                  # jokaisella lajilla enintään 3 versiota; peli arpoo olemassa olevista
PV = 3                                                # käsittelyn versio: vaihtuessa kaikki äänet käsitellään uudestaan


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


def event_end(ff, wav, win=0.025, drop=20.0, hold=4):
    """v1.97: osuma-äänen (hurt) loppuhäntä pois. Etsii ensimmäisen tapahtuman lopun: kohdan, jossa taso (RMS, 25 ms ikkunat) on pysyvästi
    (hold ikkunaa) yli `drop` dB kulkevan huipun alapuolella; palauttaa sen ajan sekunteina (+ 60 ms jättö). Raakaäänen perässä oleva hiljainen
    kohina, veden kaltainen ääni tai uusi alkava ääni jää pois. Palauttaa None, jos ei löydy (ääni jää ennalleen)."""
    r = run([ff, '-hide_banner', '-nostats', '-i', wav, '-af', f'asetnsamples={int(44100 * win)},astats=metadata=1:reset=1,'
             'ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-', '-f', 'null', '-'])
    lv = [float(x) if x not in ('-inf', 'inf') else -120.0 for x in re.findall(r'RMS_level=(-?[\d.]+|-inf)', r.stdout + r.stderr)]
    if len(lv) < hold + 2:
        return None
    m = -120.0   # kulkeva huippu: ensimmäinen tapahtuma päättyy kun taso pysyy `drop` dB sen alapuolella (myöhempi kovempi osa ei jatka ääntä)
    for i in range(len(lv) - hold + 1):
        m = max(m, lv[i])
        if m > -60 and all(lv[j] < m - drop for j in range(i, i + hold)):
            return round(i * win + 0.06, 3)
    return None


def process(ff, src, dst, fmt, ai='hostile', kind='idle'):
    cap_n, cap_b, fade, target = PROFIILI.get(kind, PROFIILI['idle'])
    boss = ai in BOSS_DB
    cap = cap_b if boss else cap_n
    target += BOSS_DB.get(ai, 0)
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
        if kind == 'hurt':
            ee = event_end(ff, w1)
            if ee and ee > 0.15:
                L = min(L, ee)
        f = min(fade, L * 0.5)
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
    return None, round(gain, 1)


def main():
    init = '--init' in sys.argv
    ff = ffmpeg_exe()
    os.makedirs(RAW, exist_ok=True)
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
            mm = re.match(r'^([a-z_0-9]+?)_(idle|hurt|death|aggro|chase|echo)_[123]$', n)
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
        mm = re.match(r'^([a-z_0-9]+?)_(idle|hurt|death|aggro|chase|echo)_[123]$', n)
        cid, kind = (mm.group(1), mm.group(2)) if mm else (None, 'idle')
        ai = next((a for c, _, a in creatures() if c == cid), 'hostile')
        if n in old and old[n].get('src') == src_h and old[n].get('pv') == PV and os.path.exists(dst):
            sounds[n] = old[n]
            skipped += 1
            continue
        err, gain = process(ff, p, dst, sniff(p), ai, kind)
        if err:
            errors.append(f'{os.path.basename(p)}: {err}')
            continue
        sounds[n] = {'h': sha(dst, 10), 'src': src_h, 'dur': duration(ff, dst), 'pv': PV, 'gain': gain}
        print(f'  {n}: {sounds[n]["dur"]} s, vahvistus {gain:+.1f} dB')
        done += 1
    # tarkistusraportti erästä: samat tiedostot eri paikoissa, ylimääräiset oikeat äänet, lyhyet ja kovat vahvistukset
    warn = []
    byh = {}
    for n in sounds:
        byh.setdefault(sounds[n]['src'], []).append(n)
    for h, ns in byh.items():
        if len(ns) > 1:
            warn.append('SAMA TIEDOSTO useassa paikassa: ' + ', '.join(ns))
    expset = set(exp)
    for n in sounds:
        if n not in expset:
            warn.append(f'{n}: ei odotettu paikka (lajin versioita on vähemmän, peli käyttää silti jos _1.._3)')
        g = sounds[n].get('gain')
        if g is not None and abs(g) > 12:
            warn.append(f'{n}: iso vahvistus {g:+.1f} dB (raaka erittäin hiljainen tai kova – tarkista kuuntelemalla)')
        if sounds[n].get('dur', 1) < 0.15:
            warn.append(f'{n}: erittäin lyhyt ({sounds[n]["dur"]} s)')
    # käsitellyt äänet, joiden raaka on kadonnut, poistetaan
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and os.path.splitext(f)[0] not in raws:
            os.remove(os.path.join(OUT, f))
            removed += 1
    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump({'v': 2, 'sounds': dict(sorted(sounds.items()))}, f, ensure_ascii=False, indent=1)
        f.write('\n')
    write_list(sounds, raws)
    print(f'Käsitelty: {done}, ennallaan: {skipped}, poistettu: {removed}, oikeita ääniä yhteensä: {len(sounds)}')
    for w in warn:
        print('HUOM', w)
    for e in errors:
        print('VIRHE', e)
    return 1 if errors else 0


def resolve(cid, kind, have, vara):
    """Sama logiikka kuin pelissä (audio.js creRes): omat versiot _1.._3 → varaääniketju. Palauttaa (nimet, sävelkerroin)."""
    cur, p = cid, 1.0
    for _ in range(6):
        if not cur:
            break
        L = [f'{cur}_{kind}_{n}' for n in VARIANTS if f'{cur}_{kind}_{n}' in have]
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
    own = tot = 0
    rows = []
    for title, ais in cats:
        rows.append(f'\n### {title}\n')
        rows.append('| Olento | Ääni | Tiedostot (1–3 versiota, kuolema ja kaiku 1–2) | Tila | Millainen ääni | Hakusanat (englanniksi) |')
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
            else:
                star = ''
            for j, kind in enumerate(kinds_of(ai)):
                tot += 1
                mine = [n for n in variants_of(ai, kind) if f'{cid}_{kind}_{n}' in sounds]
                vs = variants_of(ai, kind)
                files = ', '.join(f'`{cid}_{kind}_{n}`' for n in vs)
                if mine:
                    st = f'✅ oma: {", ".join(f"_{n}" for n in mine)} ({len(mine)}/{len(vs)})'
                    own += 1
                else:
                    src, p = resolve(cid, kind, sounds, vara)
                    if src:
                        st = f'🔁 varaääni: {", ".join(src)}' + (f' (sävel ×{p:.2f})' if abs(p - 1) > .001 else '')
                    elif kind == 'echo':
                        st = '⬜ puuttuu' + ('' if cid == 'aarnihirvio' else ' (varalla: aarnihirvio)') + (' – **kaikuäänien pääääni 💎**' if cid == 'aarnihirvio' else '')
                    elif kind == 'chase' and cid in vara:
                        st = f'⬜ puuttuu (varalla: {vara[cid]["to"]})'
                    elif kind == 'aggro' and ai in CHASE_AI:
                        st = '⬜ puuttuu → ei erillistä suuttumisääntä, jahtiääni alkaa heti'
                    else:
                        st = '⬜ puuttuu' + (f' (varalla: {vara[cid]["to"]})' if cid in vara else '')
                who = f'**{name}** (`{cid}`){star}' if j == 0 else ''
                rows.append(f'| {who} | {kind} | {files} | {st} | {KIND_FI[kind]} – {info[0]} | {info[1].get(kind, info[1].get("aggro", "") if kind == "chase" else "")} |')
    head = f'''# Hiidenmaan äänilista

Äänisuunnitelma: `docs/KEHITYSMUISTIO.md` → "Äänisuunnitelma". Tämä taulukko päivittyy automaattisesti
(`python3 tools/process_sounds.py`) – älä muokkaa taulukkoa käsin.

## Näin lisäät äänen

1. Etsi ääni (CC0 / vapaa käyttö): **Kenney** (kenney.nl), **Pixabay** (pixabay.com/sound-effects), **Freesound** (CC0-suodatin),
   **OpenGameArt**. Käytä alla olevia hakusanoja.
2. **Kuuntele ääni omalla koneellasi** ennen lisäämistä – git-historia muistaa jokaisen version, joten vaihda vain harkiten.
3. Korvaa paikkamerkki `sounds/raw/`-kansiossa **täsmälleen samalla nimellä** (esim. `susi_aggro_1.mp3`). Jokaisella äänellä on kolme paikkaa
   `_1`, `_2`, `_3`: täytä vain ne jotka haluat – peli arpoo olemassa olevista (yksi riittää, tyhjät paikat ohitetaan). Lyhyet äänet saa olla wav
   (pääte voi jäädä .mp3 – muoto tunnistetaan sisällöstä), pitkät (musiikki, loopit) mp3, alle 25 Mt.
4. Commit ja push GitHub Desktopilla ja pyydä Claudea ajamaan `python3 tools/process_sounds.py`: hiljaisuus leikataan alusta ja lopusta,
   ääni katkaistaan lajin ylärajaan (häivytys), voimakkuus tasataan lajin tavoitteeseen ja se siirtyy peliin (`sounds/<nimi>.mp3`).
   Raakatiedostot jäävät `sounds/raw/`-kansioon. **Älä itse trimmaa tai normalisoi** – työkalu tekee sen; anna raaka mieluummin pitkänä ja puhtaana.
   Kaikuääni (`<pomo>_echo_1/2`) on ulottuvuuspomoilla ja Kalmanvartijalla (maan alta Kalmankehän lähellä); **Aarnihirviön kaikuäänet ovat kaikkien pomojen varaääni**. Kuolemaäänelle on **1 paikka** ulottuvuuksien hirviöillä (Jäätär, Kalmaherra, Aarnihirviö) ja **2 paikkaa** kaikilla muilla.

**Käsittelyn rajat (lajeittain):** idle ≤ 3 s (pomo 4), hurt ≤ 1,2 s (1,6), death ≤ 3,5 s (6), aggro ≤ 2,5 s (3,5), chase ≤ 2,5 s (4), echo ≤ 5 s (6).
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
'''
    with open(LISTA, 'w', encoding='utf-8') as f:
        f.write(head + '\n'.join(rows) + '\n\n## Tulevat äänierät\n\nB pelaajan ja toimintojen äänet · C taustaäänet ja sää · D musiikki · '
                'E äänifysiikka (ks. kehitysmuistion ideajono). Jokainen erä saa tähän oman osionsa.\n')


if __name__ == '__main__':
    sys.exit(main())
