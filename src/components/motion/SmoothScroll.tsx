"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getLenis, scrollToTarget, setLenis } from "./scroll";
import { useMediaQuery, useReducedMotion } from "./observe";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

const normalize = (path: string) => (path.endsWith("/") ? path : `${path}/`);

function hashTarget(hash: string) {
  if (hash.length < 2) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

/** Scrolls to the hash target once layout has settled (images and fonts can still move it). */
function settleOnHash(hash: string) {
  const go = () => {
    const el = hashTarget(hash);
    if (el) scrollToTarget(el, { immediate: true });
  };
  requestAnimationFrame(go);
  const timer = window.setTimeout(go, 250);
  const onLoad = () => go();
  if (document.readyState !== "complete") window.addEventListener("load", onLoad, { once: true });
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("load", onLoad);
  };
}

/** Lenis smooth scrolling for mouse devices; everything else keeps the native scroll. Renders nothing. */
export default function SmoothScroll() {
  const reduced = useReducedMotion();
  const fine = useMediaQuery(FINE_POINTER);
  const active = fine && !reduced;
  const pathname = usePathname();

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let instance: import("lenis").default | null = null;
    let stopHash: (() => void) | undefined;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      instance = new Lenis({ autoRaf: false, anchors: false, lerp: 0.1, wheelMultiplier: 1 });
      setLenis(instance);
      if (window.location.hash) stopHash = settleOnHash(window.location.hash);
    });

    // Same-page anchors scroll smoothly with the header offset; other links are left to the browser and Next.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !getLenis()) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !url.hash) return;
      if (normalize(url.pathname) !== normalize(window.location.pathname) || url.search !== window.location.search) return;
      const el = hashTarget(url.hash);
      if (!el) return;
      e.preventDefault();
      scrollToTarget(el);
      history.pushState(null, "", url.hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelled = true;
      document.removeEventListener("click", onClick);
      stopHash?.();
      setLenis(null);
      instance?.destroy();
    };
  }, [active]);

  // New page: start at the top (or at the hash target), also resetting Lenis' own position.
  useEffect(() => {
    if (!active || !getLenis()) return;
    const hash = window.location.hash;
    if (hash && hashTarget(hash)) return settleOnHash(hash);
    getLenis()?.scrollTo(0, { immediate: true, force: true });
  }, [pathname, active]);

  return null;
}
