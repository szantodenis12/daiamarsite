"use client";

import { useEffect, useRef } from "react";

// Silent office loop for the home hero. Visitors who ask for reduced motion get the still poster.
export default function HeroVideo({ poster, label }: { poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }
    // Browsers only autoplay when the element is muted as a property, not just as an attribute.
    video.muted = true;
    video.play().catch(() => {});
  }, []);
  return (
    <video ref={ref} autoPlay muted loop playsInline preload="metadata" poster={poster} aria-label={label}>
      <source src="/video/daiamar-birou.webm" type="video/webm" />
      <source src="/video/daiamar-birou.mp4" type="video/mp4" />
    </video>
  );
}
