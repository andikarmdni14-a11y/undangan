# Peta 49 Animasi (Fase 9)

Tier: **Semua** = semua perangkat · **Kaya** = perangkat kuat (≥ 6 core, ≥ 4 GB RAM, WebGL, bukan hemat data; QA: `?fxtier=rich`).
Semua animasi menghormati `prefers-reduced-motion` (MotionConfig `reducedMotion="user"` + aturan CSS global).

| # | Animasi | Tier | Lokasi |
|---|---|---|---|
| 1 | Amplop terbuka halus | Semua | `hero/Envelope.tsx` (CSS 3D, keputusan klien) |
| 2 | Ilusi tekstur timbul + sorotan cahaya | Semua | `hero/Envelope.tsx` — `EMBOSS_TILE` (feTurbulence + feDiffuseLighting) |
| 3 | Kupu-kupu & kelopak memancar ke layar | WebGL / DOM | `fx/ParticleCanvas.tsx`, fallback `hero/PetalBurst.tsx` |
| 4 | Objek 3D berotasi mengikuti scroll | Semua (2D) + Kaya (3D) | `hero/CoverHero.tsx` (useScroll), `fx/BackgroundCanvas.tsx` |
| 5 | Pre-loader SVG | Semua | `layout/Preloader.tsx` (+ fallback CSS 2,6 dtk) |
| 6 | Zoom sinematis menembus bukaan amplop | Semua | `CoverHero.tsx` prop `zooming` |
| 7 | Daun melayang tanpa gravitasi | Kaya | `fx/BackgroundCanvas.tsx` `Floaters` |
| 8 | Kartu info flip 180° saat hover | Semua (kursor) | `sections/EventsSection.tsx` + CSS `.flip-*` — layar sentuh: kedua muka bertumpuk |
| 9 | Parallax kursor berlawanan arah | Semua (tilt amplop) + Kaya (3D) | `Envelope.tsx`, `BackgroundCanvas.tsx` |
| 10 | Riak cahaya seperti air | Kaya | `BackgroundCanvas.tsx` `RippleBackdrop` (shader) |
| 11 | Crossfade teks di tempat | Semua | `hero/HeroTextCycle.tsx` |
| 12 | Mesin tik linimasa | Semua | `motion/Typewriter.tsx` → `StoryTimeline.tsx` |
| 13 | Kata meluncur dari garis tak terlihat | Semua | `motion/SplitText.tsx` (words) → kutipan |
| 14 | Huruf serif muncul bertahap | Semua | `SplitText` (chars) → semua judul seksi |
| 15 | Teks buram → tajam | Semua | `motion/BlurReveal.tsx` → penutup |
| 16 | Marquee horizontal | Semua | `sections/Marquee.tsx` |
| 17 | Teks keluar dari balik blok warna | Semua | `motion/MaskedReveal.tsx` → tanggal & judul acara |
| 18 | Gradasi mengalir dalam teks | Semua | utilitas `text-flow` → tagline hero, "&" |
| 19 | Parallax latar | Semua | `motion/Parallax.tsx` → ornamen floral |
| 20 | Kartu kubah fade-in-up | Semua | `motion/Reveal.tsx` |
| 21 | Masker kubah membesar | Semua | `motion/ArchScaleReveal.tsx` → foto mempelai |
| 22 | Scroll horizontal dalam halaman vertikal | Kaya + desktop ≥1024px | `sections/Gallery.tsx` `PinnedStrip` |
| 23 | Garis linimasa tergambar ikut scroll | Semua | `sections/StoryTimeline.tsx` |
| 24 | Pinning seksi | Kaya + desktop | `PinnedStrip` (sticky) |
| 25 | Header menyusut & berubah warna | Semua | `layout/SiteHeader.tsx` |
| 26 | Bilah progres scroll 2px | Semua | `motion/ScrollProgress.tsx` |
| 27 | Jarum jam berputar saat hover | Semua | `ui/icons.tsx` `ClockIcon` + CSS `.clock-hand` |
| 28 | Glassmorphism adaptif | Semua (header) + Kaya (seksi) | `SiteHeader.tsx`, CSS `glass-band` |
| 29 | Tombol magnetis | Semua (mouse) | `motion/Magnetic.tsx` |
| 30 | Tombol Instagram terisi dari bawah | Semua | utilitas `fill-up` |
| 31 | Riak konsentris CTA | Semua | `motion/useRipple.tsx` |
| 32 | Tombol musik memantul elastis | Semua | `audio/MusicToggle.tsx` |
| 33 | Garis bawah merayap | Semua | utilitas `link-underline` |
| 34 | Hamburger bermorf jadi X | Semua | `SiteHeader.tsx` |
| 35 | Tooltip naik + memudar | Semua | `motion/Tooltip.tsx` |
| 36 | Toast ucapan real-time | Semua | `rsvp/WishList.tsx` |
| 37 | Getar input saat validasi gagal | Semua | `rsvp/RsvpForm.tsx` `shake()` (WAAPI) |
| 38 | Label mengambang | Semua | `RsvpForm.tsx` (`peer` + `:placeholder-shown`) |
| 39 | Centang tergambar saat sukses | Semua | `RsvpForm.tsx` (pathLength) |
| 40 | Skeleton shimmer | Semua | `ui/ShimmerImage.tsx` |
| 41 | Sakelar kapsul Hadir/Tidak Hadir | Semua | `RsvpForm.tsx` (layoutId) |
| 42 | Angka menghitung naik | Semua | `motion/CountUp.tsx` → jumlah ucapan, statistik admin |
| 43 | Akordeon tanpa jank | Semua | `motion/Accordion.tsx` → `sections/FaqSection.tsx` |
| 44 | Laci navigasi dari kanan | Semua | `SiteHeader.tsx` (`<dialog>` modal) |
| 45 | — | — | Dikecualikan sesuai brief |
| 47 | Kartu terangkat + bayangan melebar | Semua | utilitas `lift` → kartu acara, ucapan |
| 48 | Grid mengatur ulang saat filter | Semua | `Gallery.tsx` (Semua/Berdua/Mempelai) |
| 49 | Foto blur-up | Semua | `content/blur.ts` (LQIP 16px) + `placeholder="blur"` |
| 50 | Sapuan blok warna | Semua | `layout/PageSwipe.tsx` (sampul → isi) |

Catatan #8: rotasi hanya aktif pada perangkat dengan kursor presisi (`hover: hover` & `pointer: fine`) dan juga
dipicu fokus keyboard (`:focus-within`). Di layar sentuh kedua muka tampil berurutan sebagai satu kartu, sehingga
lokasi & tombol peta tidak pernah tersembunyi bagi tamu yang tidak dapat melakukan hover.
