/** Dibuat otomatis oleh scripts (Fase 9, #49): placeholder blur 16px untuk next/image. */
export const BLUR: Record<string, string> = {
  "/images/couple/bride.webp": "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAADwAQCdASoJABAAA4BaJYgCw7D5aTkZo4AA/fg/y713BEEKVdp4mLH9+iiX2I05ETaF/uYr+VecnmyZkckZUWUvNvjJscNqF5owN2tJdGuUiAAA",
  "/images/couple/groom.webp": "data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADwAQCdASoJABAAA4BaJYgCdADZaZsvEgAA/rQrvZHsoDLAiSGudpXqe3xYVXM7tdoCXvLjEV5BNz2QHS78jyHpUPzFu2xCdSwAAA==",
  "/images/gallery/g1-thumb.webp": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAkAA4BaJYgCdADwe5vUgAD+5spuj1apDK4xNyTL087OKWguj961o9Hufr6iw1HBK/coVssKBJpBZcyXukuhnsKHY9wgAAA=",
  "/images/gallery/g2-thumb.webp": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADwAQCdASoQAAkAA4BaJbACdAEPhPj/hIgA/lvXQOsau70Jxpdhmepk7yA1via/jotzF8cogmgnH4P9avnCcs6F3wYq3d598O2WDfgAAAA=",
  "/images/gallery/g3-thumb.webp": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAADQAQCdASoQAAkAA4BaJbACdAEORM7D4AD+W9dA66FezFj3XWVSllKNf6zyMtrEyF7fou/blMz+vC7dyc/j5TL6wfYXWVL3OuI1X980AAA=",
  "/images/gallery/g4-thumb.webp": "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAwAgCdASoQAAkAA4BaJbACdAEQFTyTJFBgAAD+kb9CxfZlaryfiL8hJF/XXoid+Uwcozx/ELIlsBA6naAQT3I/Wpu9P93xCBq2mdVkUAA=",
  "/images/gallery/g5-thumb.webp": "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAACwAQCdASoQAAkAA4BaJbACdAEFpsYAAP38Zm7FnMRSlMa1CeD2SnqzSTBiv/qps0eIRLFYHD+ZwdvS1jNYzM6FtB4d6MQuDc4fSr01zAAAAA==",
  "/images/gallery/g6-thumb.webp": "data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAAAwAgCdASoMABAAA4BaJYgCdADdlqYBiGR+AAD30psa/ZebTS0B/DAOy0CEVBjshCtZdXgquyVN+UVGHOJz459+RkSm/kcwe3+CocVDc8D9MdSJlfeSVBAA",
  "/images/gallery/g7-thumb.webp": "data:image/webp;base64,UklGRmoAAABXRUJQVlA4IF4AAAAQAgCdASoMABAAA4BaJYgCw7D673qwpGwAAPxnVjWexLvojvrohTszSv7dFJbBAfKa2DXxZ7tTzjZTdwOXzjtQhErRpGsZ7zVlsDi2T3+VJX7n9zW6YmZ9hhH66IAA",
};

export const blurFor = (src: string) => BLUR[src] ?? BLUR[src.replace(/(\.webp)$/, "-thumb$1")];
