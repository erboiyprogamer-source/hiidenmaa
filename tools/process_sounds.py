#!/usr/bin/env python3
"""Hiidenmaa – äänien käsittely (äänisuunnitelma, ks. docs/KEHITYSMUISTIO.md "Äänisuunnitelma").

Käyttö (repon juuressa):
  python3 tools/process_sounds.py --init   luo puuttuvat paikkamerkit sounds/raw/ (ei koskaan ylikirjoita) + käsittelee
  python3 tools/process_sounds.py          käsittelee oikeat äänet, kirjoittaa sounds/manifest.json ja sounds/AANILISTA.md

Työnjako: Claude tekee paikkamerkit (hiljainen mp3 alle 3 kt) oikeilla nimillä. Käyttäjä kuuntelee ja korvaa paikkamerkin
TÄSMÄLLEEN samalla nimellä (GitHub Desktop). Tämä työkalu tunnistaa oikeat äänet (yli 3 kt, muoto sisällöstä eikä päätteestä),
ajaa ffmpeg → sounds/<nimi>.mp3 (mono 96 kbps, hiljaisuus pois alusta ja lopusta, loudnorm). Raakatiedostoja ei poisteta.
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
AGGRO_AI = ('neutral', 'hostile', 'boss', 'rboss')

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
    'vartija': ('Kalmanvartija, valtava pomo', {'idle': 'giant breathing, deep monster breath', 'hurt': 'giant hurt roar', 'death': 'boss death roar', 'aggro': 'boss monster roar'}),
    'kivivartija': ('kivivartija, kivinen golem', {'idle': 'stone grind, rock golem rumble', 'hurt': 'rock impact crack', 'death': 'rock crumble collapse', 'aggro': 'golem roar stone'}),
    'routasusi': ('routasusi, jäinen susi', {'idle': 'wolf growl cold breath', 'hurt': 'wolf yelp', 'death': 'wolf whimper death', 'aggro': 'wolf howl'}),
    'jaajattari': ('Jäätär, jäinen noita (pomo)', {'idle': 'ice witch whisper, cold wind voice', 'hurt': 'female monster scream', 'death': 'witch death scream, ice shatter', 'aggro': 'evil witch laugh'}),
    'kalmaherra': ('Kalmaherra, kalmojen valtias (pomo)', {'idle': 'deep demon whisper', 'hurt': 'demon hurt roar', 'death': 'demon death roar', 'aggro': 'demon lord roar'}),
    'aarnihirvio': ('Aarnihirviö, metsän hirviö (pomo)', {'idle': 'forest monster creak, tree creature groan', 'hurt': 'monster roar wood creak', 'death': 'giant tree creature death', 'aggro': 'forest monster roar'}),
}
KIND_FI = {
    'idle_1': 'rauhallinen ääntely (0,5–2 s)', 'idle_2': 'toinen ääntely, eri kuin idle_1 (0,5–2 s)',
    'hurt_1': 'lyhyt kivun ääni (0,2–0,8 s)', 'death_1': 'kuoleman ääni (0,8–2,5 s)', 'aggro_1': 'hyökkäyshuuto tai uhkaava murina (0,5–2 s)',
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


def expected():
    names = []
    for cid, _, ai in creatures():
        kinds = ['idle_1', 'idle_2', 'hurt_1', 'death_1'] + (['aggro_1'] if ai in AGGRO_AI else [])
        names += [f'{cid}_{k}' for k in kinds]
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


def process(ff, src, dst, fmt):
    trim = 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.01'
    af = f'{trim},areverse,{trim},areverse,loudnorm=I=-16:TP=-1.5:LRA=11'
    cmd = [ff, '-hide_banner', '-loglevel', 'error', '-y'] + (['-f', fmt] if fmt and fmt != 'mp4' else []) + \
          ['-i', src, '-af', af, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '96k', '-id3v2_version', '0', dst]
    tmp = dst + '.tmp.mp3'
    cmd[-1] = tmp
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(tmp) or os.path.getsize(tmp) < 200:
        if os.path.exists(tmp):
            os.remove(tmp)
        return r.stderr.strip()[-300:] or 'tuntematon virhe'
    os.replace(tmp, dst)
    return None


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
        print(f'Paikkamerkkejä luotu: {made}')

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
        if n in old and old[n].get('src') == src_h and os.path.exists(dst):
            sounds[n] = old[n]
            skipped += 1
            continue
        err = process(ff, p, dst, sniff(p))
        if err:
            errors.append(f'{os.path.basename(p)}: {err}')
            continue
        sounds[n] = {'h': sha(dst, 10), 'src': src_h, 'dur': duration(ff, dst)}
        done += 1
    # käsitellyt äänet, joiden raaka on kadonnut, poistetaan
    for f in os.listdir(OUT):
        if f.endswith('.mp3') and os.path.splitext(f)[0] not in raws:
            os.remove(os.path.join(OUT, f))
            removed += 1
    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump({'v': 1, 'sounds': dict(sorted(sounds.items()))}, f, ensure_ascii=False, indent=1)
        f.write('\n')
    write_list(sounds, raws)
    print(f'Käsitelty: {done}, ennallaan: {skipped}, poistettu: {removed}, oikeita ääniä yhteensä: {len(sounds)}')
    for e in errors:
        print('VIRHE', e)
    return 1 if errors else 0


def resolve(cid, kind, n, have, vara):
    """Sama logiikka kuin pelissä (audio.js creRes): oma → idle_2→idle_1 → varaääniketju."""
    cur, p = cid, 1.0
    for _ in range(6):
        if not cur:
            break
        a = f'{cur}_{kind}_{n}'
        if a in have:
            return a, p
        if n > 1 and f'{cur}_{kind}_1' in have:
            return f'{cur}_{kind}_1', p
        v = vara.get(cur)
        if not v:
            break
        p *= v['p']
        cur = v['to']
    return None, p


def write_list(sounds, raws):
    vara = varaani()
    cre = creatures()
    users = {}
    for cid, (to) in ((k, v['to']) for k, v in vara.items()):
        users.setdefault(to, []).append(cid)
    cats = [('Eläimet', ('flee', 'neutral')), ('Viholliset', ('hostile',)), ('Pomot', ('boss', 'rboss'))]
    own = mine = 0
    rows = []
    for title, ais in cats:
        rows.append(f'\n### {title}\n')
        rows.append('| Olento | Ääni | Tiedosto | Tila | Kuvaus | Hakusanat (englanniksi) |')
        rows.append('| --- | --- | --- | --- | --- | --- |')
        for cid, name, ai in cre:
            if ai not in ais:
                continue
            info = CRE_INFO.get(cid, (name, {}))
            kinds = ['idle_1', 'idle_2', 'hurt_1', 'death_1'] + (['aggro_1'] if ai in AGGRO_AI else [])
            star = f' ⭐ varaääni: {", ".join(sorted(users[cid]))}' if cid in users else ''
            for j, k in enumerate(kinds):
                fn = f'{cid}_{k}'
                kind, n = k.rsplit('_', 1)
                mine += 1
                if fn in sounds:
                    st = '✅ oma'
                    own += 1
                else:
                    src, p = resolve(cid, kind, int(n), sounds, vara)
                    if src:
                        st = f'🔁 varaääni: {src}' + (f' (sävel ×{p:.2f})' if abs(p - 1) > .001 else '')
                    else:
                        st = '⬜ puuttuu' + (f' (varalla: {vara[cid]["to"]})' if cid in vara else '')
                ext = os.path.splitext(raws[fn])[1] if fn in raws else '.mp3'
                who = f'**{name}** (`{cid}`){star}' if j == 0 else ''
                rows.append(f'| {who} | {k} | `sounds/raw/{fn}{ext}` | {st} | {KIND_FI[k]} – {info[0]} | {info[1].get(kind, "")} |')
    head = f'''# Hiidenmaan äänilista

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

## Äänierä A: olennot ({own}/{mine} omaa ääntä)
'''
    with open(LISTA, 'w', encoding='utf-8') as f:
        f.write(head + '\n'.join(rows) + '\n\n## Tulevat äänierät\n\nB pelaajan ja toimintojen äänet · C taustaäänet ja sää · D musiikki · '
                'E äänifysiikka (ks. kehitysmuistion ideajono). Jokainen erä saa tähän oman osionsa.\n')


if __name__ == '__main__':
    sys.exit(main())
