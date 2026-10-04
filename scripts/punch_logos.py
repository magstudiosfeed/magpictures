from pathlib import Path
from PIL import Image

SRC_CLIENTS = Path(r"E:\Andre1\web\magpictures\dist\images\clients\clients")
SRC_COLLABS = Path(r"E:\Andre1\web\magpictures\dist\images\clients\collaborators")
DST_CLIENTS = Path(r"E:\Andre1\web\magpictures\public\images\clients")
DST_COLLABS = Path(r"E:\Andre1\web\magpictures\public\images\collabs")

CLIENT_MAP = {
    "Disney.svg": "disney.svg",
    "gunzilla.png": "gunzilla.png",
    "hulu.webp": "hulu.png",
    "netflix.png": "netflix.png",
    "Paramount.svg": "paramount.svg",
    "Marvel_Logo.svg": "marvel.svg",
}

COLLAB_MAP = {
    "cubica.jpg": "cubica.png",
    "sauvagetvlogoblack.jpg": "sauvage.png",
    "upp.png": "upp.png",
    "mpc.png": "mpc.png",
    "mrx.jpg": "mrx.png",
    "skydance INT.png": "skydance.png",
    "Logo_EL_GUIRI_STUDIOS.png": "el-guiri.png",
    "untold.jpg": "untold.png",
}


def border_is_light(im: Image.Image) -> tuple[bool, bool]:
    w, h = im.size
    px = im.load()
    light = dark = trans = 0
    coords = [(x, 0) for x in range(0, w, max(1, w // 80))]
    coords += [(x, h - 1) for x in range(0, w, max(1, w // 80))]
    coords += [(0, y) for y in range(0, h, max(1, h // 80))]
    coords += [(w - 1, y) for y in range(0, h, max(1, h // 80))]
    for x, y in coords:
        r, g, b, a = px[x, y]
        if a < 20:
            trans += 1
            continue
        l = (r + g + b) / 3
        if l > 170:
            light += 1
        else:
            dark += 1
    total = light + dark + trans
    return (trans / max(total, 1) > 0.55), (light > dark)


def crop_content(im: Image.Image, pad: int = 8) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def to_white_mark(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    px = im.load()
    transparent, light_bg = border_is_light(im)

    out = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            l = (r + g + b) / 3.0
            if transparent:
                alpha = a
            elif light_bg:
                alpha = min(255, max(0, int((130 - l) * 4.0)))
            else:
                alpha = min(255, max(0, int((l - 70) * 5.0)))
            if alpha > 18:
                opx[x, y] = (255, 255, 255, min(255, alpha))

    out = crop_content(out)
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest)
    print(f"{src.name} -> {dest.name} {out.size} trans={transparent} light={light_bg}")


def main() -> None:
    for src_name, dest_name in CLIENT_MAP.items():
        src = SRC_CLIENTS / src_name
        dest = DST_CLIENTS / dest_name
        if dest.suffix == ".svg":
            dest.write_bytes(src.read_bytes())
        else:
            to_white_mark(src, dest)
    for src_name, dest_name in COLLAB_MAP.items():
        to_white_mark(SRC_COLLABS / src_name, DST_COLLABS / dest_name)


if __name__ == "__main__":
    main()
