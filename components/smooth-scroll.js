"use client";

import { useEffect } from "react";

/**
 * Lenis Smooth Scroll — buttery scroll feel.
 * Wraps the entire app for silk-like scrolling.
 */
export default function SmoothScroll({ children }) {
  useEffect(() => {
    let lenis;

    async function init() {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    init();
    return () => lenis?.destroy();
  }, []);

  return children;
}
