"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/** Lenis hanya dipasang pada subtree landing marketing, tidak pada blog/aplikasi. */
export default function MarketingExperience({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | undefined;
    let frame = 0;
    let syncEmphasisWithScroll = () => {};
    const onLenisScroll = () => syncEmphasisWithScroll();

    const syncMotionPreference = () => {
      if (reduceMotion.matches && lenis) {
        window.cancelAnimationFrame(frame);
        lenis.off("scroll", onLenisScroll);
        lenis.destroy();
        lenis = undefined;
      } else if (!reduceMotion.matches && !lenis) {
        lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1, smoothWheel: true });
        lenis.on("scroll", onLenisScroll);
        const raf = (time: number) => {
          lenis?.raf(time);
          frame = window.requestAnimationFrame(raf);
        };
        frame = window.requestAnimationFrame(raf);
      }
    };
    syncMotionPreference();
    reduceMotion.addEventListener("change", syncMotionPreference);

    let observer: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-scroll-visible", "true");
          observer?.unobserve(entry.target);
        }),
        { rootMargin: "0px 0px -8%", threshold: 0.12 },
      );
    }

    if (observer) {
      root.dataset.scrollRoot = "ready";
      root.querySelectorAll<HTMLElement>("[data-scroll-reveal]").forEach((item) => observer.observe(item));
    }

    const emphasisSection = root.querySelector<HTMLElement>("[data-scroll-emphasis]");
    let emphasisFrame = 0;
    const updateEmphasis = () => {
      emphasisFrame = 0;
      if (!emphasisSection) return;
      if (reduceMotion.matches) {
        emphasisSection.style.removeProperty("--statement-first-opacity");
        emphasisSection.style.removeProperty("--statement-second-opacity");
        return;
      }
      const bounds = emphasisSection.getBoundingClientRect();
      // Tahan section dalam posisi sticky. Beri jeda awal kecil sebelum
      // perpindahan fokus, lalu selesaikan saat section akan keluar viewport.
      const holdBeforeTransition = 72;
      const scrollableDistance = Math.max(1, bounds.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1,
        (-bounds.top - holdBeforeTransition) / Math.max(1, scrollableDistance - holdBeforeTransition),
      ));
      const transition = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
      emphasisSection.style.setProperty("--statement-first-opacity", (1 - transition * 0.62).toFixed(3));
      emphasisSection.style.setProperty("--statement-second-opacity", (0.38 + transition * 0.62).toFixed(3));
    };
    const requestEmphasisUpdate = () => {
      if (!emphasisFrame) emphasisFrame = window.requestAnimationFrame(updateEmphasis);
    };
    syncEmphasisWithScroll = updateEmphasis;
    const onNativeScroll = () => {
      if (!lenis || reduceMotion.matches) requestEmphasisUpdate();
    };
    if (emphasisSection) {
      requestEmphasisUpdate();
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      window.addEventListener("resize", requestEmphasisUpdate, { passive: true });
      reduceMotion.addEventListener("change", requestEmphasisUpdate);
    }

    return () => {
      reduceMotion.removeEventListener("change", syncMotionPreference);
      if (emphasisSection) {
        window.removeEventListener("scroll", onNativeScroll);
        window.removeEventListener("resize", requestEmphasisUpdate);
        reduceMotion.removeEventListener("change", requestEmphasisUpdate);
      }
      window.cancelAnimationFrame(emphasisFrame);
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      lenis?.off("scroll", onLenisScroll);
      lenis?.destroy();
    };
  }, []);

  return <div ref={rootRef} className="marketing-experience">{children}</div>;
}
