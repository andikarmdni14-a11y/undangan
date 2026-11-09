/**
 * Menentukan mode efek partikel saat amplop dibuka.
 *  - "webgl" : layer React Three Fiber (kedalaman 3D nyata)
 *  - "dom"   : fallback 2D (Framer Motion + <img>) — browser tanpa WebGL / perangkat lemah / hemat data
 *  - "none"  : prefers-reduced-motion → tanpa partikel sama sekali
 * Override untuk QA: ?fx=webgl | ?fx=dom | ?fx=none
 */
export type FxMode = "webgl" | "dom" | "none";

type NavigatorExt = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const opts: WebGLContextAttributes = { failIfMajorPerformanceCaveat: true, powerPreference: "low-power" };
    const gl = (canvas.getContext("webgl2", opts) ?? canvas.getContext("webgl", opts)) as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    if (!gl) return false;
    // Bebaskan konteks uji segera (jumlah konteks WebGL per halaman terbatas).
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectFxMode(search = ""): FxMode {
  const forced = new URLSearchParams(search).get("fx");
  if (forced === "webgl" || forced === "dom" || forced === "none") return forced;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "none";

  const nav = navigator as NavigatorExt;
  const lowEnd =
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) ||
    nav.connection?.saveData === true ||
    nav.connection?.effectiveType === "2g" ||
    nav.connection?.effectiveType === "slow-2g";
  if (lowEnd) return "dom";

  // Konteks WebGL uji SENGAJA tidak dibuat di sini: getContext() bisa memakan ratusan ms di
  // perangkat tanpa GPU dan memperburuk Total Blocking Time. Verifikasi dilakukan saat amplop
  // dibuka (lihat InvitationExperience) — gagal → fallback 2D.
  return "webgl";
}
