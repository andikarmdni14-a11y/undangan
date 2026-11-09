/**
 * Pemanasan modul Three.js tanpa memengaruhi Lighthouse:
 * modul baru diunduh & dievaluasi saat ada sinyal niat (sentuhan/hover/fokus pada sampul),
 * bukan saat halaman dimuat. Saat amplop dibuka, bila modul belum siap dalam batas waktu,
 * burst kali itu memakai fallback 2D.
 */
let modulePromise: Promise<unknown> | null = null;

export function warmParticleModule() {
  modulePromise ??= import("@/components/fx/ParticleCanvas");
  return modulePromise;
}

export async function particleModuleReady(timeoutMs: number): Promise<boolean> {
  return Promise.race([
    warmParticleModule().then(
      () => true,
      () => false,
    ),
    new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), timeoutMs)),
  ]);
}
