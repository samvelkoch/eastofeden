"""Скачивает картинки из data.json (world[].items[].img.file) с Wikimedia Commons в img/w/,
делает ч/б JPEG ~800px и прописывает img.src. Запускается в GitHub Actions (.github/workflows/images.yml)."""
import hashlib, io, json, sys, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data.json'
OUT = ROOT / 'img' / 'w'
UA = 'eastofeden-reading-diary/1.0 (https://github.com/samvelkoch/eastofeden)'

def fetch(name: str) -> bytes:
    url = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(name.replace(' ', '_')) + '?width=960'
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def main() -> int:
    d = json.loads(DATA.read_text(encoding='utf-8'))
    OUT.mkdir(parents=True, exist_ok=True)
    changed, failed = False, []
    for s in d.get('world', []):
        for it in s['items']:
            im = it.get('img')
            if not im or not im.get('file'):
                continue
            slug = hashlib.sha1(im['file'].encode()).hexdigest()[:12] + '.jpg'
            dst = OUT / slug
            if not dst.exists():
                try:
                    raw = fetch(im['file'])
                    pic = ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert('L')
                    pic.thumbnail((800, 800))
                    pic.save(dst, 'JPEG', quality=74, optimize=True, progressive=True)
                    print('ok  ', im['file'], pic.size, dst.stat().st_size // 1024, 'KB')
                    time.sleep(1)
                except Exception as e:  # noqa: BLE001 — логируем и идём дальше
                    failed.append(im['file']); print('FAIL', im['file'], repr(e)); continue
            src = 'img/w/' + slug
            if im.get('src') != src:
                im['src'] = src; changed = True
    if changed:
        DATA.write_text(json.dumps(d, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('failed:', failed)
    return 0

if __name__ == '__main__':
    sys.exit(main())
