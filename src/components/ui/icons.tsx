import type { SVGProps } from "react";

/** Ikon SVG kustom (PRD §3: tanpa emoji). Garis 1.6px, mengikuti currentColor. */
const base = (props: SVGProps<SVGSVGElement>) => ({
  viewBox: "0 0 24 24",
  width: 20,
  height: 20,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const InstagramIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);
export const PinIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);
export const CalendarIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
);
/** #27 Jarum menit & jam berputar halus saat kartu induk (.group) di-hover. */
export const ClockIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path className="clock-hand clock-hand--min" d="M12 12V6.5" />
    <path className="clock-hand clock-hand--hour" d="M12 12l3 2" />
  </svg>
);
export const LiveIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    <path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6M5.4 5.4a9.3 9.3 0 0 0 0 13.2M18.6 5.4a9.3 9.3 0 0 1 0 13.2" />
  </svg>
);
export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const ChevronIcon = ({ direction = "right", ...p }: SVGProps<SVGSVGElement> & { direction?: "left" | "right" }) => (
  <svg {...base(p)}>
    <path d={direction === "right" ? "M9 5l7 7-7 7" : "M15 5l-7 7 7 7"} />
  </svg>
);

/** Ornamen pemisah kecil: tangkai daun simetris. Dipakai hanya di bawah judul seksi. */
export const SprigDivider = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 120 16" width="96" height="13" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" aria-hidden="true" {...p}>
    <path d="M6 8h40M74 8h40" />
    <path d="M60 3.5c-2.6 1.6-2.6 7.4 0 9c2.6-1.6 2.6-7.4 0-9Z" fill="currentColor" stroke="none" />
    <path d="M46 8c3-3.6 6.8-4 9.2-2.6M46 8c3 3.6 6.8 4 9.2 2.6M74 8c-3-3.6-6.8-4-9.2-2.6M74 8c-3 3.6-6.8 4-9.2 2.6" />
  </svg>
);
