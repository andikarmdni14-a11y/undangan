"use client";

import { createContext, useContext } from "react";

/**
 * Tier efek visual:
 *  - "rich" : perangkat kuat → kanvas latar 3D, glassmorphism, galeri horizontal ter-pin.
 *  - "lite" : semua perangkat lain → animasi 2D ringan saja.
 */
export type FxTier = "rich" | "lite";
export const FxTierContext = createContext<FxTier>("lite");
export const useFxTier = () => useContext(FxTierContext);

type NavigatorExt = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** Dipanggil setelah hydrate. Override QA: ?fxtier=rich | ?fxtier=lite */
export function detectFxTier(search: string, fxMode: "webgl" | "dom" | "none"): FxTier {
  const forced = new URLSearchParams(search).get("fxtier");
  if (forced === "rich" || forced === "lite") return forced;
  if (fxMode !== "webgl") return "lite";
  const nav = navigator as NavigatorExt;
  const strongCpu = (nav.hardwareConcurrency ?? 4) >= 6;
  const enoughRam = nav.deviceMemory === undefined || nav.deviceMemory >= 4;
  return strongCpu && enoughRam && !nav.connection?.saveData ? "rich" : "lite";
}
