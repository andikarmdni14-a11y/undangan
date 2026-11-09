"""Fase 0 — Optimasi aset undangan Raihan & Andini.

Semua keluaran ditulis ke OUT/public/... agar bisa langsung disalin ke proyek Next.js.
"""
import os, json, subprocess
import numpy as np
import cv2
from PIL import Image

UP = "/mnt/user-data/uploads"
ZIP = "/tmp/aset-undangan-3D/public/images"
OUT = "/mnt/user-data/outputs/fase-0/public"
manifest = []

ALABASTER = (250, 250, 250)
BURGUNDY = (114, 47, 55)


def save_webp(img: Image.Image, rel: str, q: int = 80):
    path = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "WEBP", quality=q, alpha_quality=80, method=6)
    manifest.append({"file": rel, "w": img.width, "h": img.height, "kb": round(os.path.getsize(path) / 1024, 1)})


def resize_w(img: Image.Image, w: int) -> Image.Image:
    if img.width <= w:
        return img
    return img.resize((w, round(img.height * w / img.width)), Image.LANCZOS)


# ---------------------------------------------------------------- 1. Amplop
# Geometri komponen ditulis dalam % canvas → aman di-downscale selama ketiga layer sama ukurannya.
for name in ["envelope-flap", "envelope-body", "card"]:
    src = Image.open(f"{ZIP}/envelope/{name}.png").convert("RGBA")
    save_webp(resize_w(src, 2816), f"images/envelope/{name}.webp", 82)       # desktop retina
    save_webp(resize_w(src, 1408), f"images/envelope/{name}-sm.webp", 80)    # mobile

# ---------------------------------------------------------------- 2. Efek (sudah kecil, salin ulang)
for f in ["butterfly-left", "butterfly-right"]:
    save_webp(Image.open(f"{ZIP}/{f}.webp").convert("RGBA"), f"images/fx/{f}.webp", 85)
for i in range(1, 10):
    save_webp(Image.open(f"{ZIP}/petals/petal-{i}.webp").convert("RGBA"), f"images/fx/petal-{i}.webp", 85)

# ---------------------------------------------------------------- 3. Foto
PORTRAITS = {"101877.jpg": "bride", "101876.jpg": "groom"}
GALLERY = ["101871.jpg", "101872.jpg", "101873.jpg", "101874.jpg", "101875.jpg"]

for f, slug in PORTRAITS.items():
    src = Image.open(f"{UP}/{f}").convert("RGB")
    save_webp(resize_w(src, 1080), f"images/couple/{slug}.webp", 78)
    save_webp(resize_w(src, 640), f"images/couple/{slug}-sm.webp", 75)

for n, f in enumerate(GALLERY, 1):
    src = Image.open(f"{UP}/{f}").convert("RGB")
    save_webp(resize_w(src, 1920), f"images/gallery/g{n}.webp", 78)       # lightbox
    save_webp(resize_w(src, 720), f"images/gallery/g{n}-thumb.webp", 72)  # grid masonry

# Open Graph 1200×630 (foto pasangan berjalan menghadap kamera)
og = Image.open(f"{UP}/101872.jpg").convert("RGB")
r = 1200 / 630
h = round(og.width / r)
top = max(0, (og.height - h) // 2 - 60)
og = og.crop((0, top, og.width, top + h)).resize((1200, 630), Image.LANCZOS)
os.makedirs(f"{OUT}/images/meta", exist_ok=True)
og.save(f"{OUT}/images/meta/og.jpg", quality=82, optimize=True, progressive=True)
manifest.append({"file": "images/meta/og.jpg", "w": 1200, "h": 630, "kb": round(os.path.getsize(f"{OUT}/images/meta/og.jpg") / 1024, 1)})

# ---------------------------------------------------------------- 4. Monogram & logo nama
mono = Image.open(f"{UP}/101885.png").convert("RGBA")
mono = mono.crop(mono.getchannel("A").getbbox())
save_webp(resize_w(mono, 960), "images/brand/monogram-ra.webp", 85)

script = Image.open(f"{UP}/101884.png").convert("RGBA")
script = script.crop(script.getchannel("A").getbbox())
save_webp(resize_w(script, 1200), "images/brand/logo-raihan-andini.webp", 85)
save_webp(resize_w(script, 640), "images/brand/logo-raihan-andini-sm.webp", 82)

# Favicon (Next.js App Router: app/icon.png & app/apple-icon.png)
def icon(size, pad):
    canvas = Image.new("RGBA", (size, size), ALABASTER + (255,))
    m = mono.copy()
    m.thumbnail((size - 2 * pad, size - 2 * pad), Image.LANCZOS)
    canvas.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return canvas

APP = "/mnt/user-data/outputs/fase-0/app"
os.makedirs(APP, exist_ok=True)
icon(512, 40).save(f"{APP}/icon.png", optimize=True)
icon(180, 16).convert("RGB").save(f"{APP}/apple-icon.png", optimize=True)
manifest += [{"file": "../app/icon.png", "w": 512, "h": 512, "kb": round(os.path.getsize(f"{APP}/icon.png") / 1024, 1)},
             {"file": "../app/apple-icon.png", "w": 180, "h": 180, "kb": round(os.path.getsize(f"{APP}/apple-icon.png") / 1024, 1)}]

# ---------------------------------------------------------------- 5. Bingkai floral
frame = Image.open(f"{UP}/101882.png").convert("RGBA")
frame = frame.crop(frame.getchannel("A").point(lambda v: 255 if v > 250 else 0).getbbox())
rgb = np.array(frame.convert("RGB"))
alpha_src = np.array(frame.getchannel("A"))

# 5a. Recolor daun hijau → Dusty Rose (#DCAE96, hue ≈ 20°)
hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV).astype(np.float32)
H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
green = (H > 22) & (H < 110) & (S > 10)
# Bobot lembut agar tepi tidak patah
w = cv2.GaussianBlur(green.astype(np.float32), (5, 5), 0)
H2 = np.where(w > 0, 3.0, H)            # OpenCV hue 0–180 → 10 ≈ 20°
S2 = np.where(w > 0, np.clip(S * 1.6 + 30, 70, 150), S)
V2 = np.where(w > 0, np.clip(V * 1.05, 0, 255), V)
mix = np.stack([H2, S2, V2], -1)
rec = cv2.cvtColor(mix.astype(np.uint8), cv2.COLOR_HSV2RGB).astype(np.float32)
rgb_re = (rec * w[..., None] + rgb.astype(np.float32) * (1 - w[..., None])).astype(np.uint8)

card_img = Image.fromarray(np.dstack([rgb_re, alpha_src]), "RGBA")
save_webp(resize_w(card_img, 1000), "images/ornament/floral-card.webp", 80)

# 5b. Ekstraksi ornamen bunga transparan (atas & bawah), tanpa kertas & garis bingkai
#     "Ink" = jarak warna terhadap kertas lokal (median blur besar).
f32 = rgb_re.astype(np.float32)
paper = cv2.medianBlur(rgb_re, 151).astype(np.float32)
paper = np.maximum(paper, np.array([236, 214, 214], np.float32))  # kertas tak pernah lebih gelap dari ini
diff = np.linalg.norm(paper - f32, axis=-1)
lum = f32.mean(-1)
sat = hsv[..., 1]
ink = np.clip((diff - 26) / 50, 0, 1)
ink = np.maximum(ink, np.clip((S2 - 95) / 50, 0, 1) * (lum < 230))  # mawar pink pucat tetap ikut

# Hapus garis bingkai tipis: lolos opening garis panjang, gagal opening kotak 7×7
binary = (ink > 0.35).astype(np.uint8)
lines_h = cv2.morphologyEx(binary, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (90, 1)))
lines_v = cv2.morphologyEx(binary, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (1, 90)))
thick = cv2.morphologyEx(binary, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7)))
lines = ((lines_h | lines_v) & (1 - cv2.dilate(thick, np.ones((9, 9), np.uint8)))).astype(np.uint8)
lines = cv2.dilate(lines, np.ones((5, 5), np.uint8))
# Garis bingkai lurus penuh: hitung hanya piksel garis TIPIS per kolom/baris, lalu hapus pitanya
thin = ((lines_h | lines_v) & (1 - thick)).astype(np.uint8)
col = thin.sum(0); row = thin.sum(1)
band = np.zeros_like(lines)
for c in np.where(col > binary.shape[0] * 0.15)[0]:
    band[:, max(0, c - 3):c + 4] = 1
for r_ in np.where(row > binary.shape[1] * 0.15)[0]:
    band[max(0, r_ - 3):r_ + 4, :] = 1
band = band & (1 - thick)  # bunga/daun tebal yang menimpa garis tetap utuh
lines = np.maximum(lines, band)
ink = ink * (1 - lines)
ink = cv2.GaussianBlur(ink, (3, 3), 0)

# Buang tepi kertas (14px) dan serpihan garis tipis yang tersisa
m = 14
ink[:m, :] = 0; ink[-m:, :] = 0; ink[:, :m] = 0; ink[:, -m:] = 0
n_cc, lab, stats, _ = cv2.connectedComponentsWithStats((ink > 0.15).astype(np.uint8), 8)
for i in range(1, n_cc):
    x_, y_, w_, h_, area = stats[i]
    thin_stick = min(w_, h_) <= 9 and max(w_, h_) >= 12
    if area < 80 or thin_stick or area / float(w_ * h_) < 0.08 and min(w_, h_) < 14:
        ink[lab == i] = 0
orn_alpha = (ink * (alpha_src / 255.0) * 255).astype(np.uint8)
orn = Image.fromarray(np.dstack([rgb_re, orn_alpha]), "RGBA")
Hh = orn.height
for name, box in {"floral-top": (0, 0, orn.width, int(Hh * 0.27)),
                  "floral-bottom": (0, int(Hh * 0.76), orn.width, Hh)}.items():
    part = orn.crop(box)
    part = part.crop(part.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox())
    save_webp(resize_w(part, 1200), f"images/ornament/{name}.webp", 82)
    save_webp(resize_w(part, 640), f"images/ornament/{name}-sm.webp", 80)

# ---------------------------------------------------------------- 6. Audio
os.makedirs(f"{OUT}/audio", exist_ok=True)
subprocess.run([
    "ffmpeg", "-y", "-loglevel", "error", "-i", f"{UP}/Christina_Perri_-_A_Thousand_Years__Official_Music_Video__1.mp3",
    "-t", "284", "-af", "afade=t=in:d=2,afade=t=out:st=280:d=4,loudnorm=I=-18:TP=-2",
    "-c:a", "aac", "-b:a", "80k", "-movflags", "+faststart", f"{OUT}/audio/a-thousand-years.m4a"], check=True)
manifest.append({"file": "audio/a-thousand-years.m4a", "w": None, "h": None,
                 "kb": round(os.path.getsize(f"{OUT}/audio/a-thousand-years.m4a") / 1024, 1)})

with open("/mnt/user-data/outputs/fase-0/manifest.json", "w") as fp:
    json.dump(manifest, fp, indent=2)
for m in manifest:
    print(f"{m['kb']:>8} KB  {m['w']}x{m['h']}  {m['file']}")
print("TOTAL", round(sum(m["kb"] for m in manifest)), "KB")

# ---------------------------------------------------------------- 7. Potongan portrait galeri (Fase 5)
# Foto solo mempelai dipotong 3:4 agar grid masonry punya ritme portrait/landscape.
for f, name, top_ratio in [("101876.jpg", "g6", 0.10), ("101877.jpg", "g7", 0.12)]:
    im = Image.open(f"{UP}/{f}").convert("RGB")
    w, h = im.size
    ch = round(w * 4 / 3)
    top = min(h - ch, round(h * top_ratio))
    im = im.crop((0, top, w, top + ch))
    save_webp(im.resize((1440, 1920), Image.LANCZOS), f"images/gallery/{name}.webp", 78)
    save_webp(im.resize((720, 960), Image.LANCZOS), f"images/gallery/{name}-thumb.webp", 72)
