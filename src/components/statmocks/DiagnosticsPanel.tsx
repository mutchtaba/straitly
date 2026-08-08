"use client";

import { useEffect, useRef, useState } from "react";

/* phosphor palette — same values as RetroTerminal */
const G_BRIGHT = "#66ff99";
const G_MAIN = "#33e06a";
const G_DIM = "#1c8f44";

type Seg = { t: string; c?: "bright" | "dim" };

/* the report, split into styled segments so we can type it linearly */
const SEGS: Seg[] = [
  { t: "$ ", c: "bright" },
  { t: "straitly --system-check\n\n" },
  { t: "RUNNING DIAGNOSTICS ...............\n\n", c: "dim" },
  { t: "MARKUP ON TOKENS ......... " },
  { t: "0%", c: "bright" },
  { t: "      " },
  { t: "[ OK ]\n", c: "bright" },
  { t: "UPTIME / LAST 90 DAYS .... " },
  { t: "99.9%", c: "bright" },
  { t: "   " },
  { t: "[ OK ]\n", c: "bright" },
  { t: "ADDED LATENCY ............ " },
  { t: "0ms", c: "bright" },
  { t: "     " },
  { t: "[ OK ]\n\n", c: "bright" },
  { t: "ALL SYSTEMS NOMINAL.\n" },
  { t: "PAY PROVIDER PRICES. NOTHING MORE.", c: "dim" },
];

const TOTAL = SEGS.reduce((n, s) => n + s.t.length, 0);
const CHAR_MS = 16;

const COLOR = { bright: G_BRIGHT, dim: G_DIM } as const;

export default function DiagnosticsPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(TOTAL);
      return;
    }

    let timer: ReturnType<typeof setInterval>;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        timer = setInterval(() => {
          setTyped((n) => {
            if (n >= TOTAL) {
              clearInterval(timer);
              return n;
            }
            return n + 1;
          });
        }, CHAR_MS);
      },
      { threshold: 0.35 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer);
    };
  }, []);

  /* slice the styled segments at the current typing position */
  let remaining = typed;
  const visible = SEGS.map((s, i) => {
    const take = Math.min(remaining, s.t.length);
    remaining -= take;
    return take > 0 ? (
      <span key={i} style={s.c ? { color: COLOR[s.c] } : undefined}>
        {s.t.slice(0, take)}
      </span>
    ) : null;
  });

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-[880px] overflow-hidden rounded-lg border border-warm-gray/25"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #0d1810 0%, #08100a 70%, #050a06 100%)",
        boxShadow:
          "inset 0 0 60px rgba(51, 224, 106, 0.14), 0 20px 60px rgba(0,0,0,0.4)",
      }}
    >
      <pre
        className="overflow-x-auto p-8 font-pixel text-[13px] leading-[1.9] sm:p-12 sm:text-[15px] lg:text-lg"
        style={{
          color: G_MAIN,
          textShadow: "0 0 8px rgba(102, 255, 153, 0.55)",
        }}
      >
        {visible}
        <span
          className="animate-caret inline-block h-[1em] w-[0.62em] align-middle"
          style={{
            background: G_BRIGHT,
            boxShadow: "0 0 8px rgba(102,255,153,0.8)",
          }}
        />
      </pre>

      {/* scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 3px)",
        }}
      />
      {/* glass sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 15%, rgba(240,235,226,0.06) 0%, transparent 45%)",
        }}
      />
    </div>
  );
}
