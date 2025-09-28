"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

type ImageWithFallbackProps = {
  src?: string | null;
  alt?: string | null;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  style,
  fallbackSrc,
  sizes = "100vw",
  priority,
  quality,
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(src ?? null);
  const [didError, setDidError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src ?? null);
    setDidError(false);
  }, [src]);

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }
    setDidError(true);
  };

  const wrapperClasses = `relative ${className ?? ""}`.trim();

  const resolvedAlt = typeof alt === "string" && alt.length > 0 ? alt : "";

  return (
    <div className={wrapperClasses} style={style} data-original-url={src || undefined}>
      <Image
        src={didError ? ERROR_IMG_SRC : (currentSrc || ERROR_IMG_SRC)}
        alt={didError ? `${resolvedAlt} (error)` : resolvedAlt}
        fill
        sizes={sizes}
        className="object-contain"
        onError={handleError}
        priority={priority}
        quality={quality}
      />
    </div>
  );
}
