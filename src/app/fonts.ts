import localFont from "next/font/local";

/** Judul & identitas visual — self-hosted agar tidak bergantung pada Google Fonts saat build. */
export const tenorSans = localFont({
  src: "../fonts/tenor-sans-latin-400-normal.woff2",
  weight: "400",
  display: "swap",
  variable: "--font-tenor",
  fallback: ["Marcellus", "Georgia", "serif"],
});

/** Teks UI fungsional: paragraf, formulir, tombol. */
export const karla = localFont({
  src: [
    { path: "../fonts/karla-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/karla-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/karla-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-karla",
  fallback: ["Manrope", "system-ui", "sans-serif"],
});
