"use client";

import { useEffect, useState } from "react";
import { detectFxMode, type FxMode } from "@/lib/fx/capability";

/** Mode efek dideteksi sekali setelah hydrate. Sebelum itu "dom" agar SSR & klien konsisten. */
export function useFxMode() {
  const [mode, setMode] = useState<FxMode>("dom");
  useEffect(() => {
    setMode(detectFxMode(window.location.search));
  }, []);
  return [mode, setMode] as const;
}
