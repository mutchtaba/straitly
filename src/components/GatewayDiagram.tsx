"use client";

import { useEffect, useState } from "react";

/*
 * The "what is an LLM gateway" explainer diagram.
 * Composes the transparent gpt-image-2 sprites (public/gateway/) with a live
 * SVG connector layer: dotted phosphor lines + packets flowing
 * app -> straitly -> providers. The provider column is an endless vertical
 * carousel (all 8 tiles, two copies, -50% loop) masked at both ends.
 */

/* the lit coin-op TVs from the model catalog; logo + cycling model names
   overlaid on each CRT, same lineup as the catalog section below.
   Meta's screen is dark, so its ink flips to light. */
const PROVIDERS = [
  {
    key: "openai",
    logo: "openai",
    ink: "#0e0e0e",
    models: ["5.6-sol", "5.6-terra", "5.6-luna"],
  },
  {
    key: "anthropic",
    logo: "claude",
    ink: "#2b1a08",
    models: ["fable-5", "opus-5", "sonnet-5", "haiku-4-5"],
  },
  {
    key: "gemini",
    logo: "gemini",
    ink: "#1f2124",
    fullColor: true, // Gemini's mark keeps its own gradient colors
    models: ["3.1-pro", "3.6-flash", "3.5-flash-lite"],
  },
  {
    key: "meta",
    logo: "meta",
    ink: "#f4f8ff",
    models: ["spark-1.1"],
  },
] as const;

/* CRT glass inset, measured off the tv-*-on.png set (see ModelCatalog) */
const TV_SCREEN = { left: 24.5, top: 30, width: 50, height: 33 };
const MODEL_CYCLE_MS = 2200;

// viewBox units — everything below is laid out in this 1000x400 space
// (kept deliberately short so the whole section fits one viewport)
const W = 1000;
const H = 400;
const APP = { cx: 105, cy: H / 2, w: 200 };
const HUB = { cx: 500, cy: H / 2, w: 220 };
// carousel column: shorter than the canvas, vertically centered.
// w is the text/mask container; the tile sprite renders narrower inside it.
const COL = { cx: 925, w: 150, top: 11, height: 78 };

// fan lines end at fixed points spread along the carousel's left edge
const FAN_YS = [92, 200, 308];

const GREEN = "#33ff66";

function fanPath(y1: number) {
  const x0 = HUB.cx + HUB.w / 2 - 10;
  const y0 = HUB.cy;
  const x1 = COL.cx - 72;
  const mx = (x0 + x1) / 2;
  return `M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
}

const appPath = `M ${APP.cx + APP.w / 2 - 6} ${APP.cy} L ${HUB.cx - HUB.w / 2 + 6} ${APP.cy}`;

/* comet tracer: a lit stretch of the line itself travels the path.
   Three stacked dashes of different lengths share one center — the longer,
   dimmer, blurrier ones poke out past the bright core at both ends, so the
   head and tail fade instead of stopping cold. Longer dashes start slightly
   further back, so each gets a tiny extra delay to keep centers aligned
   (path speed is 200 units / 3.2s = 62.5 u/s). */
const TRACE_SPEED = 200 / 3.2;
const TRACE_LAYERS = [
  { dash: 24, width: 7, color: GREEN, opacity: 0.16, blur: 4 },
  { dash: 16, width: 3.5, color: GREEN, opacity: 0.45, blur: 1.5 },
  { dash: 9, width: 2, color: "#b6ffcb", opacity: 0.95, blur: 0 },
] as const;
const CORE_DASH = TRACE_LAYERS[TRACE_LAYERS.length - 1].dash;

export function Trace({ path, delay }: { path: string; delay: number }) {
  return (
    <g>
      {TRACE_LAYERS.map((l, i) => (
        <path
          key={i}
          d={path}
          pathLength={100}
          className="animate-line-trace"
          stroke={l.color}
          strokeOpacity={l.opacity}
          strokeWidth={l.width}
          strokeLinecap="round"
          style={{
            strokeDasharray: `${l.dash} ${200 - l.dash}`,
            filter: l.blur ? `blur(${l.blur}px)` : undefined,
            animationDelay: `${delay + (l.dash - CORE_DASH) / 2 / TRACE_SPEED}s`,
          }}
        />
      ))}
    </g>
  );
}

/* eslint-disable @next/next/no-img-element */
function Tv({ provider, offset }: { provider: (typeof PROVIDERS)[number]; offset: number }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (provider.models.length < 2) return;
    // stagger each TV so they don't all flip in lockstep
    const iv = setInterval(
      () => setIdx((i) => (i + 1) % provider.models.length),
      MODEL_CYCLE_MS + offset * 240,
    );
    return () => clearInterval(iv);
  }, [provider.models.length, offset]);

  const lightInk = provider.ink === "#f4f8ff";
  return (
    <div className="relative w-[72%]" style={{ containerType: "inline-size" }}>
      <img src={`/retro/tv-${provider.key}-on.png`} alt={provider.key} className="w-full" />
      {/* CRT glass: logo on top, model name cycling under it */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{
          left: `${TV_SCREEN.left}%`,
          top: `${TV_SCREEN.top}%`,
          width: `${TV_SCREEN.width}%`,
          height: `${TV_SCREEN.height}%`,
          gap: "6cqw",
        }}
      >
        <img
          src={`/logos/${provider.logo}.svg`}
          alt=""
          className="max-h-[48%] max-w-[52%]"
          style={{
            filter:
              "fullColor" in provider && provider.fullColor
                ? "none"
                : lightInk
                  ? "brightness(0) invert(1) opacity(0.9)"
                  : "brightness(0) opacity(0.82)",
          }}
        />
        <span
          key={provider.models[idx]}
          className="whitespace-nowrap font-pixel font-semibold"
          style={{ color: provider.ink, fontSize: "8.5cqw", lineHeight: 1 }}
        >
          {provider.models[idx]}
        </span>
      </div>
    </div>
  );
}

function TileStack() {
  return (
    <div className="flex flex-col gap-4 pb-4">
      {PROVIDERS.map((p, i) => (
        <div key={p.key} className="flex flex-col items-center">
          <Tv provider={p} offset={i} />
        </div>
      ))}
    </div>
  );
}

const LABEL =
  "absolute -translate-x-1/2 whitespace-nowrap text-center font-pixel text-sm tracking-[0.28em] text-cream sm:text-base";

export function GatewayDiagram({
  app = "window",
  center = "router",
}: {
  app?: "window" | "terminal";
  center?: "router" | "tower";
}) {
  return (
    <div className="relative mx-auto w-full" style={{ aspectRatio: `${W}/${H}` }}>
      {/* connector layer */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full"
        fill="none"
        aria-hidden
      >
        <path
          d={appPath}
          stroke={GREEN}
          strokeOpacity="0.55"
          strokeWidth="2.5"
          strokeDasharray="2 9"
          strokeLinecap="round"
        />
        {FAN_YS.map((y) => (
          <path
            key={y}
            d={fanPath(y)}
            stroke={GREEN}
            strokeOpacity="0.35"
            strokeWidth="2"
            strokeDasharray="2 9"
            strokeLinecap="round"
          />
        ))}
        {/* request arrives at the hub ~1.5s into the cycle; the routed
            pulses depart only after that, with a small ripple between them */}
        <Trace path={appPath} delay={0} />
        {FAN_YS.map((y, i) => (
          <Trace key={y} path={fanPath(y)} delay={1.55 + 0.15 * i} />
        ))}
      </svg>

      {/* sprites */}
      <img
        src={`/gateway/app-${app}.png`}
        alt="Your app"
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${(APP.cx / W) * 100}%`,
          top: `${(APP.cy / H) * 100}%`,
          width: `${(APP.w / W) * 100}%`,
        }}
      />
      <img
        src={`/gateway/straitly-${center}.png`}
        alt="Straitly router"
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${(HUB.cx / W) * 100}%`,
          top: `${(HUB.cy / H) * 100}%`,
          width: `${(HUB.w / W) * 100}%`,
        }}
      />

      {/* provider carousel: endless vertical crawl, faded at both ends */}
      <div
        className="absolute -translate-x-1/2 overflow-hidden"
        style={{
          left: `${(COL.cx / W) * 100}%`,
          top: `${COL.top}%`,
          height: `${COL.height}%`,
          width: `${(COL.w / W) * 100}%`,
          maskImage:
            "linear-gradient(180deg, transparent, black 16%, black 84%, transparent)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent, black 16%, black 84%, transparent)",
        }}
      >
        <div className="animate-tile-carousel">
          <TileStack />
          <TileStack />
        </div>
      </div>
      {/* eslint-enable @next/next/no-img-element */}

      {/* column labels */}
      <span className={LABEL} style={{ left: `${(APP.cx / W) * 100}%`, top: "84%" }}>
        YOUR APP
      </span>
      <span className={LABEL} style={{ left: `${(HUB.cx / W) * 100}%`, top: "84%" }}>
        STRAITLY
      </span>
      <span
        className={LABEL}
        style={{ left: `${(COL.cx / W) * 100}%`, top: "96%" }}
      >
        165+ MODELS
        <span className="mt-2 block font-pixel text-[10px] tracking-[0.28em] text-[#c4beb4] sm:text-xs">
          29+ PROVIDERS
        </span>
      </span>
    </div>
  );
}
