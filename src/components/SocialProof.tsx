"use client";

import { useEffect, useRef, useState } from "react";

const COMPANIES = [
  { logo: "replit", name: "Replit" },
  { logo: "perplexity", name: "Perplexity" },
  { logo: "linear", name: "Linear" },
  { logo: "opencode", name: "opencode" },
  { logo: "cline", name: "Cline" },
  { logo: "warp", name: "Warp" },
  { logo: "railway", name: "Railway" },
];

const MONO_TINT =
  "invert(92%) sepia(6%) saturate(153%) hue-rotate(357deg) brightness(103%) contrast(89%)";

export function TrustedBy() {
  return (
    <div className="flex flex-col gap-12">
      <p className="text-center font-pixel text-sm tracking-[0.35em] text-warm-gray sm:text-base">
        TRUSTED BY ENGINEERS AT
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-10">
        {COMPANIES.map((c) => (
          <span key={c.logo} className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/logos/${c.logo}.svg`}
              alt={c.name}
              className="h-9 w-9"
              style={{ filter: `brightness(0) saturate(100%) ${MONO_TINT}` }}
            />
            <span className="text-xl font-semibold tracking-tight text-cream sm:text-2xl">
              {c.name}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

const TARGET = 25;
const DURATION_MS = 1600;

export function SavingsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(TARGET);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const t0 = performance.now();
        const frame = (now: number) => {
          const p = Math.min((now - t0) / DURATION_MS, 1);
          // ease-out cubic: fast start, gentle landing
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(eased * TARGET));
          if (p < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-10 sm:flex-row sm:justify-center sm:gap-16"
    >
      <span className="font-display text-8xl font-semibold leading-none text-terracotta sm:text-9xl">
        -{value}%
        <span className="align-super text-3xl text-warm-gray sm:text-4xl">
          *
        </span>
      </span>
      <div className="max-w-xs text-center sm:text-left">
        <p className="font-pixel text-xs tracking-[0.25em] text-warm-gray">
          IN FEES
        </p>
        <p className="mt-3 text-lg leading-snug text-cream sm:text-xl">
          Save up to 25% on inference. Same models, same latency.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-warm-gray">
          *varies by model and commitment tier
        </p>
      </div>
    </div>
  );
}
