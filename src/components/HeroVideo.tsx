"use client";

import { useEffect, useRef } from "react";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Silent office loop for the home hero. Visitors who ask for reduced motion get the still poster.
// The <video> is written as raw HTML so `muted`, `playsinline`, `autoplay` and `loop` are real
// lowercase attributes in the server markup (iOS Safari decides on autoplay from the parsed attributes).
// mp4 (H.264, faststart) comes first because iOS can't always play the webm.
export default function HeroVideo({ poster, label }: { poster: string; label: string }) {
  const host = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const video = host.current?.querySelector("video");
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.removeAttribute("autoplay");
      video.pause();
      return;
    }

    let done = false;
    const prime = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.setAttribute("muted", "");
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
    };
    const interactionEvents = ["touchstart", "pointerdown", "click", "keydown", "scroll"] as const;
    const cleanup = () => {
      interactionEvents.forEach((e) => window.removeEventListener(e, onInteract));
    };
    const tryPlay = () => {
      if (done) return;
      prime();
      if (!video.paused && video.currentTime > 0) return;
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          done = true;
          cleanup();
        }).catch(() => {});
      }
    };
    // Low Power Mode / data saver block autoplay until the first gesture: retry then, once played stop listening.
    function onInteract() {
      tryPlay();
    }

    tryPlay();
    video.addEventListener("loadedmetadata", tryPlay);
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("pause", () => {
      // Something paused us (not the loop end): try to resume while visible.
      if (!document.hidden && !video.ended) setTimeout(tryPlay, 0);
    });
    const onVisible = () => {
      if (!document.hidden) {
        done = false;
        tryPlay();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    interactionEvents.forEach((e) => window.addEventListener(e, onInteract, { passive: true }));

    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((en) => en.isIntersecting)) tryPlay();
        },
        { threshold: 0 },
      );
      io.observe(video);
    }

    return () => {
      done = true;
      cleanup();
      document.removeEventListener("visibilitychange", onVisible);
      io?.disconnect();
    };
  }, []);

  const html =
    `<video autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture disableremoteplayback poster="${esc(poster)}" aria-label="${esc(label)}">` +
    `<source src="/video/daiamar-birou.mp4" type="video/mp4">` +
    `<source src="/video/daiamar-birou.webm" type="video/webm">` +
    `</video>`;

  return <span ref={host} style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: html }} />;
}
