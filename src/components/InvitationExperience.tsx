"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { LazyMotion, MotionConfig } from "framer-motion";
import CoverHero from "@/components/hero/CoverHero";
import { ENVELOPE_OPEN_DURATION, POCKET_RATIO } from "@/components/hero/Envelope";
import ParticleLayer from "@/components/fx/ParticleLayer";
import BackgroundLayer from "@/components/fx/BackgroundLayer";
import MusicToggle from "@/components/audio/MusicToggle";
import Preloader from "@/components/layout/Preloader";
import PageSwipe from "@/components/layout/PageSwipe";
import SiteHeader from "@/components/layout/SiteHeader";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useFxMode } from "@/hooks/useFxMode";
import { useScrollLock } from "@/hooks/useScrollLock";
import { particleModuleReady, warmParticleModule } from "@/lib/fx/loader";
import { supportsWebGL } from "@/lib/fx/capability";
import { detectFxTier, FxTierContext, type FxTier } from "@/lib/fx/tier";

const loadMotionFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

/** Batas tunggu modul WebGL saat amplop dibuka; lewat dari ini → fallback 2D untuk burst ini. */
const FX_READY_TIMEOUT_MS = 650;
/** Kanvas latar menunggu burst partikel selesai agar tidak ada dua konteks WebGL bersamaan. */
const BACKGROUND_DELAY_MS = 7000;

type Props = {
  guestName: string;
  hero: {
    greetingPrefix: string;
    tagline: string;
    coupleLabel: string;
    dateLabel: string;
    openLabel: string;
  };
  music: { src: string; title: string };
  /** Isi undangan (Server Components) — tersedia di DOM sejak awal, aktif setelah amplop dibuka. */
  children: ReactNode;
};

export default function InvitationExperience({ guestName, hero, music, children }: Props) {
  const [opened, setOpened] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [tier, setTier] = useState<FxTier>("lite");
  const [background, setBackground] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fxMode, setFxMode] = useFxMode();

  // Tier efek ditentukan setelah mode efek diketahui; ditandai di <html> untuk CSS glassmorphism.
  useEffect(() => {
    const t = detectFxTier(window.location.search, fxMode);
    setTier(t);
    document.documentElement.dataset.fx = t;
  }, [fxMode]);

  const getOrigin = useCallback(() => {
    const r = stageRef.current?.getBoundingClientRect();
    return r ? { x: r.left + r.width * POCKET_RATIO.x, y: r.top + r.height * POCKET_RATIO.y } : null;
  }, []);
  const fallbackTo2D = useCallback(() => setFxMode("dom"), [setFxMode]);
  const dropToLite = useCallback(() => {
    setBackground(false);
    setTier("lite");
    document.documentElement.dataset.fx = "lite";
  }, []);
  const [webglReady, setWebglReady] = useState(false);
  const warm = useCallback(() => {
    if (fxMode === "webgl") void warmParticleModule();
  }, [fxMode]);
  const bgm = useBackgroundMusic(music.src);

  useScrollLock(!unlocked);

  const handleOpen = useCallback(() => {
    if (opened) return;
    setOpened(true);
    bgm.start(); // harus di dalam gesture pengguna agar tidak diblokir autoplay policy
    const webgl = fxMode === "webgl" && supportsWebGL();
    if (fxMode === "webgl" && !webgl) {
      fallbackTo2D();
      dropToLite();
    } else if (webgl) {
      void particleModuleReady(FX_READY_TIMEOUT_MS).then((ready) => (ready ? setWebglReady(true) : fallbackTo2D()));
    }
    window.setTimeout(() => setUnlocked(true), ENVELOPE_OPEN_DURATION * 1000);
  }, [opened, bgm, fxMode, fallbackTo2D, dropToLite]);

  // Kanvas latar (tier kaya) baru dipasang setelah burst selesai.
  useEffect(() => {
    if (!opened || tier !== "rich") return;
    const id = window.setTimeout(() => setBackground(true), BACKGROUND_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [opened, tier]);

  /** #6 zoom menembus amplop + #50 sapuan warna, lalu lompat ke isi undangan. */
  const handleContinue = useCallback(() => {
    setUnlocked(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const land = (behavior: ScrollBehavior) => {
      contentRef.current?.scrollIntoView({ behavior, block: "start" });
      contentRef.current?.focus({ preventScroll: true });
    };
    if (reduce) {
      requestAnimationFrame(() => land("auto"));
      return;
    }
    setZooming(true);
    window.setTimeout(() => setSwiping(true), 450);
    window.setTimeout(() => {
      land("auto");
      setZooming(false);
    }, 1050);
    window.setTimeout(() => setSwiping(false), 1150);
  }, []);

  return (
    <LazyMotion features={loadMotionFeatures} strict>
      {/* reducedMotion="user": Framer otomatis menonaktifkan animasi transform bila OS meminta */}
      <MotionConfig reducedMotion="user">
        <FxTierContext.Provider value={tier}>
          <Preloader />
          {unlocked && <ScrollProgress />}
          {unlocked && <SiteHeader />}
          {background && <BackgroundLayer onError={dropToLite} />}

          <main className="relative z-10">
            <div onPointerOver={warm} onPointerDown={warm} onFocusCapture={warm} onTouchStart={warm}>
              <CoverHero
                isOpen={opened}
                onOpen={handleOpen}
                onContinue={handleContinue}
                stageRef={stageRef}
                domParticles={fxMode === "dom"}
                zooming={zooming}
                guestName={guestName}
                {...hero}
              />
            </div>

            <div ref={contentRef} id="undangan" tabIndex={-1} inert={!unlocked} className="outline-none">
              {children}
            </div>
          </main>

          {fxMode === "webgl" && webglReady && <ParticleLayer active={opened} getOrigin={getOrigin} onFallback={fallbackTo2D} />}

          <PageSwipe active={swiping} />

          {bgm.isReady && <MusicToggle isPlaying={bgm.isPlaying} onToggle={bgm.toggle} title={music.title} />}
        </FxTierContext.Provider>
      </MotionConfig>
    </LazyMotion>
  );
}
