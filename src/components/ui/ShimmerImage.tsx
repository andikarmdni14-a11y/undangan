"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * #40 + #49 Gambar dengan skeleton shimmer di belakangnya dan placeholder blur (LQIP)
 * yang menajam saat gambar asli selesai dimuat. Shimmer dihentikan setelah onLoad
 * agar tidak memakan CPU di latar.
 */
export default function ShimmerImage({ wrapperClassName = "", className = "", onLoad, alt, ...props }: ImageProps & { wrapperClassName?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${loaded ? "bg-rose-100" : "shimmer"} ${wrapperClassName}`}>
      <Image
        {...props}
        alt={alt}
        className={`${className} transition-[filter,opacity] duration-700 ${loaded ? "blur-0 opacity-100" : "blur-md opacity-90"}`}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </div>
  );
}
