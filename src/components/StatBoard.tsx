"use client";

import { Fragment, useEffect, useRef } from "react";
import Reveal from "@/components/Reveal";

/* 5x7 dot-matrix glyphs, same species as the machine's marquee display */
const GLYPHS: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  s: ["00000", "00000", "01111", "10000", "01110", "00001", "11110"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

const CHARS = 6; // every board is 6 chars wide so dots are identical size
const COLS = CHARS * 6 - 1;
const ROWS = 7;
const SCRAMBLE_MS = 450;
const COUNT_MS = 1400;

function centerPad(s: string) {
  const total = CHARS - s.length;
  const left = Math.floor(total / 2);
  return " ".repeat(left) + s + " ".repeat(total - left);
}

function DotCounter({
  format,
  color,
  delay,
}: {
  format: (p: number) => string;
  color: string;
  delay: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t0: number | null = null;
    let onScreen = false;

    const render = (str: string, settled: boolean) => {
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      const cssH = (cssW * ROWS) / COLS;
      if (canvas.width !== Math.round(cssW * dpr)) {
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
      }
      const pitch = canvas.width / COLS;
      const dot = pitch * 0.74;
      const inset = (pitch - dot) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let c = 0; c < CHARS; c++) {
        const glyph = GLYPHS[str[c]] ?? GLYPHS[" "];
        for (let gy = 0; gy < ROWS; gy++) {
          for (let gx = 0; gx < 5; gx++) {
            const col = c * 6 + gx;
            const lit = glyph[gy][gx] === "1";
            const x = col * pitch + inset;
            const y = gy * pitch + inset;
            if (lit) {
              // rare single-LED dropout keeps the board feeling physical
              if (settled && Math.random() < 0.003) continue;
              ctx.fillStyle = color;
              ctx.fillRect(x, y, dot, dot);
            } else {
              ctx.fillStyle = "rgba(235, 230, 220, 0.055)";
              ctx.fillRect(x, y, dot, dot);
            }
          }
        }
        // spacer column between chars: unlit dots only
        if (c < CHARS - 1) {
          const col = c * 6 + 5;
          for (let gy = 0; gy < ROWS; gy++) {
            ctx.fillStyle = "rgba(235, 230, 220, 0.055)";
            ctx.fillRect(col * pitch + inset, gy * pitch + inset, dot, dot);
          }
        }
      }
    };

    const tick = (now: number) => {
      if (t0 === null) t0 = now;
      if (!onScreen) {
        // settled + scrolled away: don't burn frames on an invisible board
        raf = requestAnimationFrame(tick);
        return;
      }
      const elapsed = now - t0 - delay * 1000;
      let str: string;
      let settled = false;
      if (elapsed < 0) {
        str = centerPad("");
      } else if (elapsed < SCRAMBLE_MS) {
        str = Array.from(
          { length: CHARS },
          () => "0123456789"[Math.floor(Math.random() * 10)],
        ).join("");
      } else if (elapsed < SCRAMBLE_MS + COUNT_MS) {
        const p = (elapsed - SCRAMBLE_MS) / COUNT_MS;
        str = centerPad(format(1 - Math.pow(1 - p, 3)));
      } else {
        str = centerPad(format(1));
        settled = true;
      }
      render(str, settled);
      raf = requestAnimationFrame(tick);
    };

    render(centerPad(""), false);

    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting;
        if (onScreen && !started) {
          started = true;
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [format, color, delay]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="w-full"
      style={{ aspectRatio: `${COLS} / ${ROWS}` }}
    />
  );
}

const STATS = [
  {
    key: "reliability",
    format: (p: number) => `${(99.99 * p).toFixed(2)}%`,
    color: "#c96f4a",
    delay: 0,
    label: "Reliability",
    reading: "99.99% reliability",
    sub: "Requests reroute across regions and providers before you see an error.",
  },
  {
    key: "ttft",
    format: (p: number) => `${(9.9 - 8.5 * p).toFixed(1)}s`,
    color: "#efe9dd",
    delay: 0.25,
    label: "P99 time to first token",
    reading: "1.4 seconds p99 time to first token",
    sub: "Session-sticky routing keeps your prompt cache warm on every request.",
  },
  {
    key: "tokens",
    format: (p: number) => `${(2.4 * p).toFixed(1)}B`,
    color: "#efe9dd",
    delay: 0.5,
    label: "Tokens served",
    reading: "2.4 billion tokens served",
    sub: "And counting. Real production traffic through the gateway, right now.",
  },
] as const;

export default function StatBoard() {
  return (
    <div>
      <Reveal>
        <p className="text-center font-pixel text-xs tracking-[0.3em] text-[#c4beb4]">
          LIVE FROM THE GATEWAY
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mx-auto mt-5 max-w-[900px] text-center font-pixel text-[30px] font-semibold leading-[1.16] tracking-[0.01em] text-cream sm:text-[40px] xl:text-[48px]">
          Measured, <span className="text-terracotta">not promised.</span>
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-10 md:grid-cols-[1fr_1px_1fr_1px_1fr] md:gap-x-8 lg:mt-20">
        {STATS.map((stat, i) => (
          <Fragment key={stat.key}>
            {i > 0 && (
              <div
                aria-hidden
                className="hidden self-stretch bg-[#4a4d54]/50 md:block"
              />
            )}
            <Reveal delay={0.1 + i * 0.12}>
              <div className="flex h-full flex-col items-center text-center">
                <span className="sr-only">{stat.reading}</span>
                {/* the LED panel: same dark inset display as the machine */}
                <div className="w-full border border-black/60 bg-[#141519] px-5 py-6 shadow-[inset_0_2px_14px_rgba(0,0,0,0.65)]">
                  <DotCounter
                    format={stat.format}
                    color={stat.color}
                    delay={stat.delay}
                  />
                </div>
                <h3 className="mt-8 font-pixel text-lg font-semibold uppercase tracking-[0.1em] text-cream sm:text-xl">
                  {stat.label}
                </h3>
                <p className="mt-3 max-w-[340px] text-[15px] leading-relaxed text-[#c4beb4] [text-wrap:balance]">
                  {stat.sub}
                </p>
              </div>
            </Reveal>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
