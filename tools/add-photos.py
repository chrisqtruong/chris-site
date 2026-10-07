#!/usr/bin/env python3
"""Turn the photos in photos-src/ into the gallery on /photos/.

For each photo it makes two clean JPEGs in assets/photos/ (no GPS or other hidden camera data):
  <name>.jpg       1600 px on the long side, for the page
  <name>-full.jpg  up to 6000 px, what opens when you click
Then it rewrites the gallery in photos/index.html, oldest first by the date the photo was taken.

Captions live in photos/captions.json ({"file-name": "Caption"}); new photos get an empty one to fill in.
Run:  python3 tools/add-photos.py
Originals stay in photos-src/, which isn't published.
"""
import json, re, subprocess, html, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, OUT, PAGE, CAPS = ROOT / 'photos-src', ROOT / 'assets/photos', ROOT / 'photos/index.html', ROOT / 'photos/captions.json'
BIN = ROOT / 'tools/.bin/photo-export'
if not BIN.exists():
    subprocess.run(['swiftc', '-O', str(ROOT / 'tools/photo-export.swift'), '-o', str(BIN)], check=True)
OUT.mkdir(parents=True, exist_ok=True); SRC.mkdir(exist_ok=True)
caps = json.loads(CAPS.read_text()) if CAPS.exists() else {}

def slug(p): return re.sub(r'[^a-z0-9]+', '-', p.stem.lower()).strip('-')
def export(src, dst, size, q):
    return json.loads(subprocess.run([str(BIN), str(src), str(dst), str(size), str(q)], check=True, capture_output=True, text=True).stdout)

photos, seen = [], set()
for src in sorted(SRC.iterdir()):
    if src.suffix.lower() not in {'.jpg', '.jpeg', '.heic', '.png', '.tif', '.tiff'}: continue
    s = slug(src); seen.add(s)
    info = export(src, OUT / f'{s}-full.jpg', 6000, 0.9)
    export(src, OUT / f'{s}.jpg', 1600, 0.82)
    caps.setdefault(s, '')
    photos.append({'slug': s, **info})
    print(f'  {s}: {info["w"]}×{info["h"]} {info["camera"] or ""} {info["date"] or ""}')
# drop exports whose original was removed
for f in OUT.glob('*.jpg'):
    if f.stem.removesuffix('-full') not in seen: f.unlink()
CAPS.write_text(json.dumps({k: caps[k] for k in sorted(caps) if k in seen}, indent=2, ensure_ascii=False) + '\n')

photos.sort(key=lambda p: (p['date'] or '9999', p['slug']))
def figure(p):
    cap = caps.get(p['slug'], '')
    cam = re.sub(r'^(RICOH IMAGING COMPANY, LTD\.|SONY|Apple) ', '', p['camera']).strip()
    label = ' · '.join(x for x in [cap, cam] if x)
    alt = html.escape(cap or 'Photo by Chris Truong', quote=True)
    return (f'  <figure><img src="/assets/photos/{p["slug"]}.jpg" data-full="/assets/photos/{p["slug"]}-full.jpg" '
            f'width="{p["w"]}" height="{p["h"]}" loading="lazy" alt="{alt}">'
            + (f'<figcaption>{html.escape(label)}</figcaption>' if label else '') + '</figure>')
block = '\n'.join(figure(p) for p in photos)
page = PAGE.read_text()
page = re.sub(r'(<!-- photos:start -->).*?(<!-- photos:end -->)', lambda m: m.group(1) + ('\n' + block + '\n' if block else '') + m.group(2), page, flags=re.S)
PAGE.write_text(page)
print(f'{len(photos)} photo(s) in the gallery. Captions: photos/captions.json')
