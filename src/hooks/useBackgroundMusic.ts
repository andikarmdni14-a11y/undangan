"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TARGET_VOLUME = 0.55;
const FADE_MS = 1600;

/**
 * Musik latar yang baru dimuat & diputar setelah interaksi pertama (kebijakan autoplay browser).
 * - Elemen <audio> dibuat saat start() → file 2,9 MB tidak ikut dimuat di awal (Lighthouse aman).
 * - Fade-in volume (diabaikan di iOS yang mengunci volume).
 * - Otomatis jeda saat tab disembunyikan, lanjut saat kembali (kecuali tamu mematikannya).
 */
export function useBackgroundMusic(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userMuted = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const fadeTo = useCallback((audio: HTMLAudioElement, target: number) => {
    const from = audio.volume;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / FADE_MS);
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * k));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setIsPlaying(true);
      fadeTo(audio, TARGET_VOLUME);
    } catch {
      setIsPlaying(false); // diblokir browser → tombol tetap tersedia untuk memutar manual
    }
  }, [fadeTo]);

  /** Dipanggil di dalam handler klik "Buka Undangan". */
  const start = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(src);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("play", () => setIsPlaying(true));
      audioRef.current = audio;
      setIsReady(true);
    }
    userMuted.current = false;
    void play();
  }, [src, play]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      userMuted.current = false;
      void play();
    } else {
      userMuted.current = true;
      audio.pause();
    }
  }, [play]);

  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.hidden) audio.pause();
      else if (!userMuted.current) void play();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      audioRef.current?.pause();
    };
  }, [play]);

  return { start, toggle, isPlaying, isReady };
}
