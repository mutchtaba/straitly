"use client";

import { useEffect, useRef, useState } from "react";

const SIZE = 1000;
/** visible vertical extent of the tilted ellipse + chips */
const STAGE_H = 720;
const C = SIZE / 2;
const TILT = (-12 * Math.PI) / 180;

type Ring = {
  rx: number;
  ry: number;
  /** radians per second; negative = counter-clockwise */
  speed: number;
  logos: string[];
};

const RINGS: Ring[] = [
  {
    rx: 265,
    ry: 175,
    speed: (2 * Math.PI) / 95,
    logos: ["openai", "claude", "gemini", "deepseek"],
  },
  {
    rx: 438,
    ry: 292,
    speed: (-2 * Math.PI) / 150,
    logos: ["kimi", "mistral", "meta", "grok", "qwen"],
  },
];

type Chip = { ring: Ring; phase: number; logo: string };

const CHIPS: Chip[] = RINGS.flatMap((ring) =>
  ring.logos.map((logo, i) => ({
    ring,
    logo,
    phase: (i / ring.logos.length) * Math.PI * 2,
  })),
);

const MONO_TINT =
  "invert(92%) sepia(6%) saturate(153%) hue-rotate(357deg) brightness(103%) contrast(89%)";

function chipStyle(chip: Chip, t: number) {
  const a = chip.phase + t * chip.ring.speed;
  const x0 = chip.ring.rx * Math.cos(a);
  const y0 = chip.ring.ry * Math.sin(a);
  const x = x0 * Math.cos(TILT) - y0 * Math.sin(TILT);
  const y = x0 * Math.sin(TILT) + y0 * Math.cos(TILT);
  const depth = Math.sin(a); // +1 front, -1 back
  const f = (depth + 1) / 2;
  return {
    transform: `translate(${x}px, ${y}px) scale(${0.78 + 0.32 * f})`,
    opacity: 0.45 + 0.55 * f,
    filter: (1 - f) * 1.6 > 0.25 ? `blur(${(1 - f) * 1.6}px)` : "none",
    zIndex: depth > 0 ? 10 : 1,
  };
}

export default function OrbitSystem() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(([entry]) => {
      // allow the stage to render up to 1.45x the column width so the
      // orbit bleeds past the container edge and dominates the hero
      setScale(Math.min((entry.contentRect.width * 1.45) / SIZE, 1));
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number;
    const frame = (now: number) => {
      const t = now / 1000;
      CHIPS.forEach((chip, i) => {
        const el = chipRefs.current[i];
        if (!el) return;
        const s = chipStyle(chip, t);
        el.style.transform = s.transform;
        el.style.opacity = String(s.opacity);
        el.style.filter = s.filter;
        el.style.zIndex = String(s.zIndex);
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      style={{ height: STAGE_H * scale }}
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 select-none"
        style={{
          width: SIZE,
          height: SIZE,
          top: (-(SIZE - STAGE_H) / 2) * scale,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        {/* ring paths */}
        <svg
          className="absolute inset-0"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          fill="none"
        >
          {RINGS.map((r, i) => (
            <ellipse
              key={i}
              cx={C}
              cy={C}
              rx={r.rx}
              ry={r.ry}
              transform={`rotate(${(TILT * 180) / Math.PI} ${C} ${C})`}
              stroke="#B77F5A"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="4 7"
            />
          ))}
        </svg>

        {/* center compass with breathing halo */}
        <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(183,127,90,0.18),rgba(183,127,90,0.05)_55%,transparent_72%)]">
          <div className="animate-halo absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(183,127,90,0.16),transparent_65%)]" />
          <svg
            width="84"
            height="84"
            viewBox="0 0 300 300"
            className="relative"
          >
            <circle
              cx="150"
              cy="150"
              r="130"
              fill="none"
              stroke="#B77F5A"
              strokeWidth="8"
            />
            <path
              d="M 234.57,65.43 L 172.06,172.06 L 127.94,127.94 Z"
              fill="#B77F5A"
            />
            <path
              d="M 65.43,234.57 L 172.06,172.06 L 127.94,127.94 Z M 83.36,216.64 L 161.68,170.73 L 129.27,138.32 Z"
              fill="#B77F5A"
              fillRule="evenodd"
            />
          </svg>
        </div>

        {/* orbiting logo chips */}
        {CHIPS.map((chip, i) => {
          const s = chipStyle(chip, 0);
          return (
            <div
              key={i}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 -ml-8 -mt-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-warm-gray/30 bg-gradient-to-b from-[#35373c] to-[#2b2d31] shadow-[0_10px_28px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(240,235,226,0.08)] will-change-transform"
              style={s}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/logos/${chip.logo}.svg`}
                alt=""
                className="h-8 w-8"
                style={{ filter: MONO_TINT }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
