"use client";

import Image from "next/image";
import { useEffect, type CSSProperties, type KeyboardEvent, type Ref } from "react";
import { animate, m, useMotionValue, useReducedMotion, useTransform, type Variants } from "framer-motion";
import ButterflyBurst from "./ButterflyBurst";
import PetalBurst from "./PetalBurst";

/* ========================================================================== */
/*  GEOMETRI ASET                                                             */
/*  Semua angka diturunkan dari canvas asli 2816 × 1536 px. Karena ketiga      */
/*  PNG berukuran sama, semua koordinat ditulis dalam % canvas.               */
/* ========================================================================== */

/** Engsel lipatan: garis dasar segitiga penutup, dari (779, 683) ke (1899, 495). */
const HINGE = {
  /** Titik tengah engsel → (1339, 589) px = (47.55%, 38.35%). */
  origin: "47.55% 38.35%",
  /** Kemiringan engsel terhadap horizontal: atan2(495 − 683, 1899 − 779). */
  tiltDeg: -9.53,
  /** Garis engsel diperpanjang ke tepi canvas: y = 52.98% di x = 0, y = 22.21% di x = 100%. */
  clipAbove: "polygon(0% 0%, 100% 0%, 100% 22.41%, 0% 53.18%)", // +0.2% agar tidak ada celah garis rambut
  clipBelow: "polygon(0% 52.98%, 100% 22.21%, 100% 100%, 0% 100%)",
};

/** Bounding box amplop (+ padding) agar canvas transparan 2816×1536 tidak memakan ruang layout. */
const VIEWBOX = { x: 750, y: 60, w: 1470, h: 1380, canvasW: 2816, canvasH: 1536 };
const CANVAS_STYLE: CSSProperties = {
  width: `${(VIEWBOX.canvasW / VIEWBOX.w) * 100}%`,
  height: `${(VIEWBOX.canvasH / VIEWBOX.h) * 100}%`,
  left: `${(-VIEWBOX.x / VIEWBOX.w) * 100}%`,
  top: `${(-VIEWBOX.y / VIEWBOX.h) * 100}%`,
};

/**
 * Perpanjangan kartu: card.png hanya berisi bagian yang terlihat di atas saku.
 * Saat kartu naik, potongan bawahnya akan tampak, jadi kita tambahkan persegi
 * panjang krem (miring −9.3°, sama dengan kartu) yang bersembunyi di dalam saku.
 */
const CARD_EXTENSION: CSSProperties = {
  left: "30.45%", // 857.5 / 2816
  top: "43.13%", // 662.5 / 1536
  width: "35.33%", // 995 / 2816
  height: "39.06%", // 600 / 1536
  transform: "rotate(-9.3deg)",
  transformOrigin: "0 0",
  backgroundColor: "#E5E1DE",
};

const ASSETS = {
  flap: "/images/envelope/envelope-flap.webp",
  flapMask: "/images/envelope/envelope-flap-sm.webp",
  card: "/images/envelope/card.webp",
  body: "/images/envelope/envelope-body.webp",
  bodyMask: "/images/envelope/envelope-body-sm.webp",
};

/** Warna sisi luar penutup (bagian polos amplop). */
const FLAP_OUTSIDE = "linear-gradient(180deg, #C99492 0%, #BE8584 70%, #B47A79 100%)";

/**
 * #2 Ilusi tekstur kertas timbul (emboss) tanpa WebGL: noise fraktal yang "diterangi"
 * cahaya terarah (feDiffuseLighting) → peta relief abu-abu, dicampur soft-light di atas kertas.
 * Dirender sekali sebagai ubin 180px oleh browser (murah, tanpa JavaScript per frame).
 */
const EMBOSS_TILE = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='e' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='1.25' numOctaves='2' seed='7' stitchTiles='stitch'/><feDiffuseLighting lighting-color='#fff' surfaceScale='1.3' diffuseConstant='1'><feDistantLight azimuth='225' elevation='48'/></feDiffuseLighting></filter><rect width='100%' height='100%' filter='url(#e)'/></svg>",
)}")`;

/** Canvas ±1,9× lebar stage → minta resolusi yang sesuai agar tajam tanpa boros. */
const IMAGE_SIZES = "(max-width: 640px) 170vw, 1000px";

const EASE_FOLD = [0.65, 0, 0.35, 1] as const;
const EASE_SLIDE = [0.22, 1, 0.36, 1] as const;
const FLAP_OPEN = 0;
const FLAP_CLOSED = -180;

/** Total durasi animasi pembukaan (detik) — dipakai induk untuk membuka kunci scroll. */
export const ENVELOPE_OPEN_DURATION = 1.8;

const cardVariants: Variants = {
  closed: { y: "2.5%", scale: 1 },
  open: { y: "-24.7%", scale: 1.05, transition: { duration: 0.9, delay: 0.7, ease: EASE_SLIDE } },
};

/** Titik tengah bukaan saku amplop dalam koordinat stage (viewBox 1470×1380). */
const POCKET_CENTER = { x: "40.1%", y: "50.7%" };
export const POCKET_RATIO = { x: 0.401, y: 0.507 };

type EnvelopeProps = {
  isOpen: boolean;
  onOpen: () => void;
  /** Efek partikel DOM (fallback 2D). Dimatikan saat layer WebGL aktif atau reduced motion. */
  withParticles?: boolean;
  ref?: Ref<HTMLDivElement>;
};

/**
 * Amplop CSS 3D satu arah: tertutup → terbuka. Setelah terbuka tidak bisa ditutup kembali
 * karena undangan sudah ditampilkan di bawahnya.
 */
export default function Envelope({ isOpen, onOpen, withParticles = true, ref }: EnvelopeProps) {
  const reduceMotion = useReducedMotion();
  const flapRotate = useMotionValue(FLAP_CLOSED);
  const flapZ = useTransform(flapRotate, (v) => (v < -90 ? 40 : 5));

  useEffect(() => {
    if (!isOpen) return;
    const controls = animate(flapRotate, FLAP_OPEN, { duration: reduceMotion ? 0 : 0.9, ease: EASE_FOLD });
    return () => controls.stop();
  }, [isOpen, reduceMotion, flapRotate]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      ref={ref}
      role={isOpen ? undefined : "button"}
      tabIndex={isOpen ? -1 : 0}
      aria-label={isOpen ? undefined : "Buka amplop undangan"}
      aria-hidden={isOpen || undefined}
      onClick={isOpen ? undefined : onOpen}
      onKeyDown={onKeyDown}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduceMotion) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        e.currentTarget.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        e.currentTarget.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        e.currentTarget.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 6).toFixed(2)}deg) rotateY(${((px - 0.5) * 8).toFixed(2)}deg)`;
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.transform = "";
      }}
      className={`relative aspect-[1470/1380] w-full select-none rounded-xl outline-none transition-transform duration-500 ease-out focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-8 focus-visible:ring-offset-alabaster ${
        isOpen ? "" : "cursor-pointer"
      }`}
    >
      <div className="absolute" style={{ ...CANVAS_STYLE, perspective: 1200, perspectiveOrigin: HINGE.origin }}>
        {/* 1. Panel belakang (di bawah engsel, tidak berputar) */}
        <div className="absolute inset-0" style={{ zIndex: 1, clipPath: HINGE.clipBelow }}>
          <Image src={ASSETS.flap} alt="" fill priority sizes={IMAGE_SIZES} draggable={false} />
        </div>

        {/* 2. Penutup: rotateZ(−tilt) → rotateX(φ) → rotateZ(+tilt) agar berputar pada engsel miring */}
        <m.div
          className="absolute inset-0"
          style={{ zIndex: flapZ, rotate: HINGE.tiltDeg, transformOrigin: HINGE.origin, transformStyle: "preserve-3d" }}
        >
          <m.div
            className="absolute inset-0"
            style={{ rotateX: flapRotate, transformOrigin: HINGE.origin, transformStyle: "preserve-3d" }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `rotate(${-HINGE.tiltDeg}deg)`,
                transformOrigin: HINGE.origin,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Sisi dalam (ukiran emas) */}
              <div className="absolute inset-0" style={{ clipPath: HINGE.clipAbove, backfaceVisibility: "hidden" }}>
                <Image src={ASSETS.flap} alt="" fill priority sizes={IMAGE_SIZES} draggable={false} />
              </div>
              {/* Sisi luar (kertas polos) — siluet sama via mask */}
              <div
                className="absolute inset-0"
                style={{
                  clipPath: HINGE.clipAbove,
                  transform: "translateZ(-1px)",
                  background: FLAP_OUTSIDE,
                  WebkitMaskImage: `url(${ASSETS.flapMask})`,
                  maskImage: `url(${ASSETS.flapMask})`,
                  WebkitMaskSize: "100% 100%",
                  maskSize: "100% 100%",
                }}
              >
                {/* #2 relief kertas pada sisi luar penutup */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ backgroundImage: EMBOSS_TILE, backgroundSize: "180px", mixBlendMode: "soft-light", opacity: 0.32 }}
                />
              </div>
            </div>
          </m.div>
        </m.div>

        {/* 3. Kartu Save the Date */}
        <m.div
          className="absolute inset-0"
          style={{ zIndex: 10, originX: 0.48, originY: 0.5 }}
          variants={cardVariants}
          initial={false}
          animate={isOpen ? "open" : "closed"}
          transition={reduceMotion ? { duration: 0 } : undefined}
        >
          <div className="absolute" style={CARD_EXTENSION} aria-hidden="true">
            <span className="absolute inset-y-0 left-[4.02%] w-px bg-[#CFC7BB]" />
            <span className="absolute inset-y-0 left-[5.03%] w-px bg-[#D8D1C6]" />
            <span className="absolute inset-y-0 right-[4.02%] w-px bg-[#CFC7BB]" />
            <span className="absolute inset-y-0 right-[5.03%] w-px bg-[#D8D1C6]" />
          </div>
          <Image src={ASSETS.card} alt="" fill priority sizes={IMAGE_SIZES} draggable={false} />
        </m.div>

        {/* 4. Saku amplop — selalu di atas kartu */}
        <div className="absolute inset-0" style={{ zIndex: 20 }}>
          <Image src={ASSETS.body} alt="" fill priority sizes={IMAGE_SIZES} draggable={false} />
          {/* #2 Relief kertas + sorotan cahaya yang mengikuti kursor, dibatasi siluet saku */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at var(--mx, 35%) var(--my, 30%), rgb(255 255 255 / 0.55), transparent 38%), ${EMBOSS_TILE}`,
              backgroundSize: "100% 100%, 180px",
              mixBlendMode: "soft-light",
              opacity: 0.38,
              WebkitMaskImage: `url(${ASSETS.bodyMask})`,
              maskImage: `url(${ASSETS.bodyMask})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
          />
        </div>
      </div>

      {withParticles && (
        <>
          <PetalBurst isOpen={isOpen} count={18} originX={POCKET_CENTER.x} originY={POCKET_CENTER.y} startDelay={0.55} />
          <ButterflyBurst isOpen={isOpen} startDelay={0.9} />
        </>
      )}
    </div>
  );
}
