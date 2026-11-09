"use client";

import dynamic from "next/dynamic";
import { m } from "framer-motion";
import FxErrorBoundary from "./FxErrorBoundary";

const BackgroundCanvas = dynamic(() => import("./BackgroundCanvas"), { ssr: false, loading: () => null });

/** Lapisan kanvas latar tetap (fixed) di belakang konten; muncul memudar. Gagal → diam-diam hilang. */
export default function BackgroundLayer({ onError }: { onError: () => void }) {
  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.4, ease: "easeOut" }}
    >
      <FxErrorBoundary onError={onError}>
        <BackgroundCanvas />
      </FxErrorBoundary>
    </m.div>
  );
}
