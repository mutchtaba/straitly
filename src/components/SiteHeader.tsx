"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/* Ramp-style header: starts as a near-full-width bar with a subtle
   border, then shrinks into a compact floating pill once you scroll
   ~30% of the first viewport. Pure CSS transitions on max-width /
   padding / radius keep it buttery. */
export default function SiteHeader() {
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setShrunk(window.scrollY > window.innerHeight * 0.3);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 lg:px-2">
      <div
        className={[
          "pointer-events-auto mt-2.5 flex w-full items-center justify-between rounded-xl border px-4 py-2 backdrop-blur-xl",
          "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          shrunk
            ? "max-w-[840px] border-warm-gray/25 bg-charcoal/90 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            : "max-w-[1344px] border-warm-gray/15 bg-charcoal/75",
        ].join(" ")}
      >
        <div className="flex items-center gap-2.5">
          <Image
            src="/straitly-mark.svg"
            alt="Straitly compass logo"
            width={26}
            height={26}
            priority
          />
          <span
            className="font-pixel text-lg tracking-wide text-cream"
            style={{ WebkitTextStroke: "0.6px var(--cream)" }}
          >
            straitly
          </span>
        </div>
        <a
          href="#access"
          className="border border-terracotta px-3.5 py-1.5 text-xs text-terracotta transition-colors hover:bg-terracotta hover:text-charcoal"
        >
          See if you qualify
        </a>
      </div>
    </header>
  );
}
