from pathlib import Path
import re

clients = Path(r"E:\Andre1\web\magpictures\public\images\clients")
for p in clients.glob("*.svg"):
    t = p.read_text(encoding="utf-8", errors="ignore")
    t2 = re.sub(r'fill="(?!none|url)[^"]+"', 'fill="#ffffff"', t, flags=re.I)
    t2 = re.sub(r"fill='(?!none|url)[^']+'", "fill='#ffffff'", t2, flags=re.I)
    t2 = re.sub(r'stroke="(?!none|url)[^"]+"', 'stroke="#ffffff"', t2, flags=re.I)
    if p.name == "marvel.svg":
        # Drop solid red plate so white wordmark remains
        t2 = re.sub(r"<rect\b[^>]*/>", "", t2, count=1, flags=re.I)
    p.write_text(t2, encoding="utf-8")
    print("whitened", p.name)
