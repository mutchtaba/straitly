"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Trace } from "@/components/GatewayDiagram";

/*
 * "Optimized routing for VOLUME / UPTIME / SPEED / COST".
 * Four slides:
 *   0 VOLUME    — the ambient gateway diagram (app -> router -> TV carousel)
 *   1 UPTIME    — claude-opus-5 across Anthropic / Bedrock / Vertex
 *   2 SPEED     — gpt-5.6-sol across OpenAI / Azure
 *   3 COST      — kimi-k3 across Groq / Together / Fireworks
 * One-shot scrollytelling: the FIRST descent pins the section and scroll
 * drives the slides. Once the visitor has scrolled all the way through, the
 * pin retires — the section becomes a normal block and only clicking the
 * words changes slides from then on.
 */

/* ---------------- LED dot-matrix board (same species as StatBoard) -------- */

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
  ",": ["00000", "00000", "00000", "00000", "00110", "00110", "01100"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  $: ["00100", "01111", "10100", "01110", "00101", "11110", "00100"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  s: ["00000", "00000", "01111", "10000", "01110", "00001", "11110"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

const ROWS = 7;
// blank LED columns between characters — 2 gives the digits air so they
// don't read as one smashed-together block
const CHAR_GAP = 2;
const CHAR_W = 5 + CHAR_GAP;
// blank LED rows above and below the glyphs, so the digits get the same
// breathing room vertically that they have horizontally
const PAD_ROWS = 1;
const TOTAL_ROWS = ROWS + PAD_ROWS * 2;
// and blank LED columns on the left and right edges, so the board never
// starts a glyph flush against the panel
const PAD_COLS = 2;
const SCRAMBLE_MS = 450;
const COUNT_MS = 1200;

function centerPad(s: string, chars: number) {
  const total = Math.max(0, chars - s.length);
  const left = Math.floor(total / 2);
  return " ".repeat(left) + s + " ".repeat(total - left);
}

/* keyed by stage, so every mode switch remounts it and replays
   scramble -> count -> settle */
function DotCounter({
  format,
  color,
  chars = 6,
}: {
  format: (p: number) => string;
  color: string;
  chars?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const cols = chars * CHAR_W - CHAR_GAP + PAD_COLS * 2;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t0: number | null = null;
    let started = false;

    const render = (str: string, settled: boolean) => {
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth;
      const cssH = (cssW * TOTAL_ROWS) / cols;
      if (canvas.width !== Math.round(cssW * dpr)) {
        canvas.width = Math.round(cssW * dpr);
        canvas.height = Math.round(cssH * dpr);
      }
      // near-solid dots: reads as chunky digits, not a grid of dots
      const pitch = canvas.width / cols;
      const dot = pitch * 0.9;
      const inset = (pitch - dot) / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // unlit backing grid across the WHOLE board first — pad rows, pad
      // columns and inter-character gaps all get the same blank cells
      ctx.fillStyle = "rgba(235, 230, 220, 0.14)";
      for (let col = 0; col < cols; col++) {
        for (let gy = 0; gy < TOTAL_ROWS; gy++) {
          ctx.fillRect(col * pitch + inset, gy * pitch + inset, dot, dot);
        }
      }

      // then the lit dots, offset past the padding
      ctx.fillStyle = color;
      for (let c = 0; c < chars; c++) {
        const glyph = GLYPHS[str[c]] ?? GLYPHS[" "];
        for (let gy = 0; gy < ROWS; gy++) {
          for (let gx = 0; gx < 5; gx++) {
            if (glyph[gy][gx] !== "1") continue;
            // rare single-LED dropout keeps the board feeling physical
            if (settled && Math.random() < 0.003) continue;
            const x = (PAD_COLS + c * CHAR_W + gx) * pitch + inset;
            const y = (PAD_ROWS + gy) * pitch + inset;
            ctx.fillRect(x, y, dot, dot);
          }
        }
      }
    };

    const tick = (now: number) => {
      if (t0 === null) t0 = now;
      const elapsed = now - t0;
      let str: string;
      let settled = false;
      if (elapsed < SCRAMBLE_MS) {
        str = Array.from(
          { length: chars },
          () => "0123456789"[Math.floor(Math.random() * 10)],
        ).join("");
      } else if (elapsed < SCRAMBLE_MS + COUNT_MS) {
        const p = (elapsed - SCRAMBLE_MS) / COUNT_MS;
        str = centerPad(format(1 - Math.pow(1 - p, 3)), chars);
      } else {
        str = centerPad(format(1), chars);
        settled = true;
      }
      render(str, settled);
      raf = requestAnimationFrame(tick);
    };

    // don't roll the show before anyone's watching: the scramble/count-up
    // only starts once the board is actually on screen
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          raf = requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [format, color, chars, cols]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="w-full"
      style={{ aspectRatio: `${cols} / ${TOTAL_ROWS}` }}
    />
  );
}

/* ---------------- stage data --------------------------------------------- */

type CardState = "win" | "down" | "idle" | "neutral";

type Stage = {
  key: string;
  word: string | null;
  question: string | null;
  /* stage 0 swaps the three static TVs for the endless vertical crawl */
  carousel?: boolean;
  tagline: string;
  led: {
    format: (p: number) => string;
    color: string;
    caption: string;
    reading: string;
    /* board width in characters (default 6) */
    chars?: number;
  };
  cards?: {
    provider: string;
    logo: string;
    tv: string;
    badge: string;
    state: CardState;
    tag?: string;
  }[];
};

const STAGES: Stage[] = [
  {
    key: "volume",
    word: "VOLUME",
    question: "165+ models, 29+ providers",
    carousel: true,
    tagline:
      "Point your app at one endpoint, name the model, and Straitly handles the rest.",
    led: {
      // compact broadcast style, decimals ticking up on the same width board
      format: (p) => `${(53.71 * p).toFixed(2)}B`,
      color: "#efe9dd",
      caption: "TOKENS SERVED, AND COUNTING",
      reading: "53.71 billion tokens served",
    },
    // three neutral cards keep the fan lines drawn; the TVs themselves are
    // replaced by the carousel column
    cards: [
      {
        provider: "OpenAI",
        logo: "openai",
        tv: "openai",
        badge: "5.6-sol",
        state: "neutral",
      },
      {
        provider: "Anthropic",
        logo: "claude",
        tv: "anthropic",
        badge: "opus-5",
        state: "neutral",
      },
      {
        provider: "Google",
        logo: "gemini",
        tv: "gemini",
        badge: "3.1-pro",
        state: "neutral",
      },
    ],
  },
  {
    key: "uptime",
    word: "UPTIME",
    question: "Provider degraded?",
    tagline:
      "A provider has a bad day? The same model answers through the next healthy door. You never see the error.",
    led: {
      format: (p) => `${(99.97 * p).toFixed(2)}%`,
      color: "#c96f4a",
      caption: "RELIABILITY",
      reading: "99.97% reliability",
    },
    cards: [
      {
        provider: "AWS Bedrock",
        logo: "bedrock",
        tv: "bedrock",
        badge: "HEALTHY",
        state: "win",
        tag: "fallback",
      },
      {
        provider: "Anthropic",
        logo: "claude",
        tv: "anthropic",
        badge: "DEGRADED",
        state: "down",
        tag: "primary",
      },
      {
        provider: "Vertex AI",
        logo: "vertexai",
        tv: "vertexai",
        badge: "STANDBY",
        state: "idle",
      },
    ],
  },
  {
    key: "speed",
    word: "SPEED",
    question: "Fastest TTFT right now?",
    tagline:
      "The same model is served through more than one door. Every request takes whichever one is answering fastest.",
    led: {
      format: (p) => `${(9.9 - 8.5 * p).toFixed(1)}s`,
      color: "#efe9dd",
      caption: "P99 TIME TO FIRST TOKEN",
      reading: "1.4 seconds p99 time to first token",
    },
    cards: [
      {
        provider: "OpenAI",
        logo: "openai",
        tv: "openai",
        badge: "190ms",
        state: "win",
        tag: "fastest",
      },
      {
        provider: "Azure",
        logo: "azure",
        tv: "azure",
        badge: "340ms",
        state: "idle",
        tag: "slower",
      },
    ],
  },
  {
    key: "cost",
    word: "COST",
    question: "Lowest cost per token?",
    tagline:
      "No markup on tokens, not even payment processing fees. Plus, every request routed to the cheapest provider available.",
    led: {
      // the markup ticks DOWN and settles at zero — the whole pitch in one number
      format: (p) => `${Math.round(15 * (1 - p))}%`,
      color: "#33ff66",
      caption: "MARKUP ON TOKEN PRICE",
      reading: "0% markup on token price",
    },
    cards: [
      {
        provider: "Groq",
        logo: "groq",
        tv: "groq",
        badge: "$1.40/M",
        state: "idle",
      },
      {
        provider: "Together",
        logo: "together",
        tv: "together",
        badge: "$1.10/M",
        state: "idle",
      },
      {
        provider: "Fireworks",
        logo: "fireworks",
        tv: "fireworks",
        badge: "$0.60/M",
        state: "win",
        tag: "cheapest",
      },
    ],
  },
];

/* ---------------- routing diagram (stages 1-3) --------------------------- */

// every slide renders on this same 1000x400 stage with identical sprite
// positions and sizes, so nothing shifts between modes
const W = 1000;
const H = 400;
// endpoints pushed to the very edges of the stage so the diagram spans the
// full page width — app flush left, TVs flush right, router dead center
const APP = { cx: 85, cy: H / 2, w: 170 };
const HUB = { cx: 500, cy: H / 2, w: 190 };
// provider TVs: the coin-op CRT from the model catalog (788x958, aspect 0.822)
// right edge of the sprite sits exactly on the stage's right edge, so the
// column lines up with everything else that hugs the container
const TV = { cx: 961, w: 78 };
// fan lines all stop at this same x, a fixed gap SHORT of the TVs — they
// point at the TVs, they never plug into them
const FAN_X = TV.cx - TV.w / 2 - 16;
const YS3 = [66, 192, 316];
const YS2 = [128, 262];

const GREEN = "#33ff66";
const RED = "#ff5f56";

/* CRT glass inset, measured off the tv-*-on.png set (see ModelCatalog) */
const TV_SCREEN = { left: 24.5, top: 30, width: 50, height: 33 };

const appPath = `M ${APP.cx + APP.w / 2 - 6} ${APP.cy} L ${HUB.cx - HUB.w / 2 + 6} ${APP.cy}`;

function fanPath(y1: number) {
  const x0 = HUB.cx + HUB.w / 2 - 10;
  const mx = (x0 + FAN_X) / 2;
  return `M ${x0} ${HUB.cy} C ${mx} ${HUB.cy}, ${mx} ${y1}, ${FAN_X} ${y1}`;
}

/* where a line's word sits — always in guaranteed-empty air, never on the
   stroke. Every fan curve levels out to y1 well before the TV, so the word
   hangs at that flat altitude, clear above (rising lines) or below
   (descending lines), and pulled left so it never kisses the TV or its glow.
   Flat lines keep the word centered above the stroke. */
function fanTag(y1: number) {
  const x0 = HUB.cx + HUB.w / 2 - 10;
  if (Math.abs(y1 - HUB.cy) < 20) {
    // flat line: the word hangs BELOW the dashes, partway down the run,
    // so it never collides with the stroke or the router's exit
    return { x: x0 + (FAN_X - x0) * 0.6, y: y1 + 20 };
  }
  return { x: FAN_X - 110, y: y1 < HUB.cy ? y1 - 23 : y1 + 23 };
}

const LINE_STYLE: Record<
  CardState,
  { stroke: string; opacity: number; width: number; dash?: string }
> = {
  win: { stroke: GREEN, opacity: 0.75, width: 2.5 },
  down: { stroke: RED, opacity: 0.5, width: 2, dash: "2 9" },
  idle: { stroke: GREEN, opacity: 0.16, width: 2, dash: "2 9" },
  neutral: { stroke: GREEN, opacity: 0.35, width: 2, dash: "2 9" },
};

/* plain pixel words riding the lines, masked by the page background —
   no borders, no pills, just stamped text */
const TAG_STYLE: Record<CardState, string> = {
  win: "text-[#33ff66]",
  down: "text-[#ff5f56]",
  idle: "text-[#9a948b]",
  neutral: "text-[#9a948b]",
};

const TV_STYLE: Record<CardState, string> = {
  win: "drop-shadow-[0_0_16px_rgba(51,255,102,0.3)]",
  down: "drop-shadow-[0_0_14px_rgba(255,95,86,0.22)]",
  idle: "opacity-65",
  neutral: "",
};

const SCREEN_TEXT: Record<CardState, string> = {
  win: "#1c7a38",
  down: "#b3362c",
  idle: "#6b6e76",
  neutral: "#3a3e46",
};

const LABEL =
  "absolute -translate-x-1/2 whitespace-nowrap text-center font-pixel text-xs tracking-[0.28em] text-cream sm:text-sm";

/* eslint-disable @next/next/no-img-element */
function ProviderTv({
  card,
  y,
  delayIdx,
}: {
  card: NonNullable<Stage["cards"]>[number];
  y: number;
  delayIdx: number;
}) {
  return (
    <div
      className="animate-mode-in absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${(TV.cx / W) * 100}%`,
        top: `${(y / H) * 100}%`,
        width: `${(TV.w / W) * 100}%`,
        animationDelay: `${delayIdx * 0.08}s`,
      }}
    >
      <div className="relative" style={{ containerType: "inline-size" }}>
        <img
          src={`/retro/tv-${card.tv}-on.png`}
          alt={card.provider}
          className={`w-full ${TV_STYLE[card.state]}`}
        />
        {/* CRT glass: logo on top, status readout under it — same layout
            as the catalog TVs, ink dark enough to sit on the lit screen */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{
            left: `${TV_SCREEN.left}%`,
            top: `${TV_SCREEN.top}%`,
            width: `${TV_SCREEN.width}%`,
            height: `${TV_SCREEN.height}%`,
            gap: "5cqw",
          }}
        >
          <img
            src={`/logos/${card.logo}.svg`}
            alt=""
            className="max-h-[46%] max-w-[50%]"
            style={{ filter: "brightness(0) opacity(0.8)" }}
          />
          <span
            className="whitespace-nowrap font-pixel font-semibold"
            style={{ color: SCREEN_TEXT[card.state], fontSize: "9.5cqw", lineHeight: 1 }}
          >
            {card.badge}
          </span>
        </div>
      </div>
      {/* provider name stamped under the TV, same species as column labels */}
      <p
        className={`mt-1 whitespace-nowrap text-center font-pixel text-xs tracking-[0.18em] ${
          card.state === "idle" ? "text-[#8b8e96]" : "text-cream"
        }`}
      >
        {card.provider.toUpperCase()}
      </p>
    </div>
  );
}

/* ------- VOLUME stage: the endless vertical TV carousel ------------------ */

/* same lineup as the model catalog; Meta's screen is dark so its ink flips
   to light, Gemini's mark keeps its own gradient colors */
const CAROUSEL_PROVIDERS = [
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
    fullColor: true,
    models: ["3.1-pro", "3.6-flash", "3.5-flash-lite"],
  },
  {
    key: "meta",
    logo: "meta",
    ink: "#f4f8ff",
    models: ["spark-1.1"],
  },
] as const;

const MODEL_CYCLE_MS = 2200;
// carousel column: same center + TV width as the static TVs, masked crawl
const COL = { top: 6, height: 80 };

function CarouselTv({
  provider,
  offset,
}: {
  provider: (typeof CAROUSEL_PROVIDERS)[number];
  offset: number;
}) {
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
    <div className="relative w-full" style={{ containerType: "inline-size" }}>
      <img
        src={`/retro/tv-${provider.key}-on.png`}
        alt={provider.key}
        className="w-full"
      />
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
      {CAROUSEL_PROVIDERS.map((p, i) => (
        <CarouselTv key={p.key} provider={p} offset={i} />
      ))}
    </div>
  );
}

function RoutingDiagram({ stage }: { stage: Stage }) {
  const cards = stage.cards ?? [];
  const ys = cards.length === 3 ? YS3 : YS2;
  const winnerIdx = cards.findIndex((c) => c.state === "win");

  return (
    <div className="absolute inset-0">
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
        {cards.map((c, i) => {
          const s = LINE_STYLE[c.state];
          return (
            <path
              key={`${stage.key}-${i}`}
              d={fanPath(ys[i])}
              stroke={s.stroke}
              strokeOpacity={s.opacity}
              strokeWidth={s.width}
              strokeDasharray={s.dash}
              strokeLinecap="round"
            />
          );
        })}
        {/* request in, then routed out — through the winning door, or
            rippling across every line on the overview slide. The incoming
            beam is keyed by stage too, so both restart together on a slide
            change and stay in phase */}
        <Trace key={`${stage.key}-app-trace`} path={appPath} delay={0} />
        {winnerIdx >= 0 ? (
          <Trace
            key={`${stage.key}-trace`}
            path={fanPath(ys[winnerIdx])}
            delay={1.55}
          />
        ) : (
          cards.map((c, i) => (
            <Trace
              key={`${stage.key}-trace-${i}`}
              path={fanPath(ys[i])}
              delay={1.55 + 0.15 * i}
            />
          ))
        )}
      </svg>

      {/* sprites — same positions as the overview so the crossfade is seamless */}
      <img
        src="/gateway/app-terminal.png"
        alt="Your app"
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${(APP.cx / W) * 100}%`,
          top: `${(APP.cy / H) * 100}%`,
          width: `${(APP.w / W) * 100}%`,
        }}
      />
      <img
        src="/gateway/straitly-router.png"
        alt="Straitly router"
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${(HUB.cx / W) * 100}%`,
          top: `${(HUB.cy / H) * 100}%`,
          width: `${(HUB.w / W) * 100}%`,
        }}
      />

      {/* the routing question: bare phosphor text floating above the router —
          the diagram's centerpiece caption, so it reads big */}
      {stage.question && (
        <div
          key={`${stage.key}-q`}
          className="animate-mode-in absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-pixel text-sm tracking-[0.12em] text-terracotta-bright [text-shadow:0_0_12px_rgba(201,111,74,0.45)] sm:text-base"
          // optically the router sprite reads right-of-center, so the caption
          // sits a touch right of the true midpoint to look centered over it
          style={{ left: `${((HUB.cx + 12) / W) * 100}%`, top: "21%" }}
        >
          {stage.question}
        </div>
      )}

      <span
        className={LABEL}
        style={{ left: `${(APP.cx / W) * 100}%`, top: "85%" }}
      >
        YOUR APP
      </span>
      <span
        className={LABEL}
        style={{ left: `${(HUB.cx / W) * 100}%`, top: "85%" }}
      >
        STRAITLY
      </span>

      {/* provider column: endless crawl on VOLUME, three pinned TVs elsewhere */}
      {stage.carousel ? (
        <>
          <div
            className="animate-mode-in absolute -translate-x-1/2 overflow-hidden"
            style={{
              left: `${(TV.cx / W) * 100}%`,
              top: `${COL.top}%`,
              height: `${COL.height}%`,
              width: `${(TV.w / W) * 100}%`,
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
        </>
      ) : (
        cards.map((c, i) => (
          <ProviderTv
            key={`${stage.key}-${c.provider}`}
            card={c}
            y={ys[i]}
            delayIdx={i}
          />
        ))
      )}

      {/* line tags: bare pixel words floating just off the line, no backing */}
      {cards.map((c, i) => {
        if (!c.tag) return null;
        const pos = fanTag(ys[i]);
        return (
          <span
            key={`${stage.key}-tag-${i}`}
            className={`animate-mode-in absolute whitespace-nowrap px-1.5 font-pixel text-[11px] uppercase tracking-[0.18em] ${TAG_STYLE[c.state]}`}
            style={{
              left: `${((pos.x / W) * 100).toFixed(2)}%`,
              top: `${((pos.y / H) * 100).toFixed(2)}%`,
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.08 + 0.1}s`,
            }}
          >
            {c.tag}
          </span>
        );
      })}
    </div>
  );
}
/* eslint-enable @next/next/no-img-element */

/* ---------------- the section -------------------------------------------- */

// scroll fraction -> stage band, and where a click on each word lands
// (only used during the one first pinned pass)
const CLICK_POS = [0.06, 0.32, 0.6, 0.88];

function stageFromProgress(p: number) {
  return p < 0.18 ? 0 : p < 0.46 ? 1 : p < 0.74 ? 2 : 3;
}

export default function RoutingShowcase() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState(0);
  const [desktop, setDesktop] = useState(false);
  // true until the visitor has scrolled through the whole tour once
  const [pinned, setPinned] = useState(true);
  const retireTargetY = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // header nav (RELIABILITY / SPEED / COST) jumps straight to a slide
  useEffect(() => {
    const onNav = (e: Event) => {
      const s = (e as CustomEvent<number>).detail;
      if (typeof s !== "number" || !STAGES[s]) return;
      const el = wrapRef.current;
      if (desktop && pinned && el) {
        const total = el.offsetHeight - window.innerHeight;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: top + CLICK_POS[s] * total,
          behavior: "smooth",
        });
      } else {
        setStage(s);
        el?.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("straitly:goto-stage", onNav);
    return () => window.removeEventListener("straitly:goto-stage", onNav);
  }, [desktop, pinned]);

  // first pass only: scroll position drives the stage
  useEffect(() => {
    if (!desktop || !pinned) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = wrapRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        // tour finished and the section scrolled fully past: retire the pin.
        // remember the absolute scroll target (current position minus the
        // runway we're about to give back) so the page doesn't visibly jump —
        // absolute, because the browser may already clamp scrollY itself when
        // the document shrinks near the page bottom.
        if (rect.bottom <= 0) {
          retireTargetY.current = window.scrollY - total;
          setPinned(false);
          return;
        }
        const p = Math.min(1, Math.max(0, -rect.top / total));
        setStage(stageFromProgress(p));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [desktop, pinned]);

  // the wrapper just shrank above the viewport — restore the intended
  // absolute position in the same frame, so the page doesn't visibly jump
  useLayoutEffect(() => {
    if (!pinned && retireTargetY.current !== null) {
      window.scrollTo(0, Math.max(0, retireTargetY.current));
      retireTargetY.current = null;
    }
  }, [pinned]);

  const goTo = (s: number) => {
    const el = wrapRef.current;
    if (desktop && pinned && el) {
      const total = el.offsetHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + CLICK_POS[s] * total, behavior: "smooth" });
    } else {
      setStage(s);
    }
  };

  const active = STAGES[stage];
  const pinning = desktop && pinned;

  return (
    <div ref={wrapRef} style={pinning ? { height: "340vh" } : undefined}>
      <div
        className={
          pinning
            ? // pt clears the fixed site header + announcement strip
              "sticky top-0 flex h-screen flex-col justify-center pt-28"
            : desktop
              ? // retired: same centered one-screen layout, just not sticky
                "flex h-screen flex-col justify-center pt-28"
              : ""
        }
      >
        {/* header: words + tagline left, LED board right */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,60fr)_minmax(0,40fr)] lg:items-start">
          <div>
            <h2 className="font-display text-4xl font-semibold text-cream sm:text-5xl xl:text-6xl">
              Optimized routing for
            </h2>
            <div className="mt-6 flex flex-wrap gap-8">
              {STAGES.map(
                (s, i) =>
                  s.word && (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-pressed={stage === i}
                      className={`relative pb-2 font-pixel text-lg tracking-[0.16em] transition-colors duration-300 sm:text-xl ${
                        stage === i
                          ? "text-terracotta-bright"
                          : "text-[#8b8e96] hover:text-cream"
                      }`}
                    >
                      {s.word}
                      {/* active tab: terracotta line draws itself in */}
                      {stage === i && (
                        <span className="animate-tab-line absolute bottom-0 left-0 h-[4px] w-full bg-terracotta" />
                      )}
                    </button>
                  ),
              )}
            </div>
            {/* fixed two-line box: taglines swap inside it without moving
                anything below (kills the stage-change jitter) */}
            <div className="mt-8 h-14 max-w-2xl overflow-hidden">
              <p
                key={active.key}
                className="animate-mode-in text-[15px] leading-relaxed text-[#c4beb4]"
              >
                {active.tagline}
              </p>
            </div>
          </div>

          <div
            className="w-full lg:mt-5 lg:justify-self-end"
            // panel width tracks the character count, so digits render at the
            // same physical size no matter how long the reading is; sized so
            // the whole board (panel + caption) spans the same height as the
            // headline + word tabs on its left
            style={{ maxWidth: `${(active.led.chars ?? 6) * 60}px` }}
          >
            <span className="sr-only">{active.led.reading}</span>
            <div className="bg-[#26282d] px-4 py-3.5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.35)]">
              {/* fixed-height stage keeps every board dead-centered, whether
                  it's the 6-char or the 11-char one */}
              <div className="flex h-[68px] w-full items-center justify-center">
                <DotCounter
                  key={active.key}
                  format={active.led.format}
                  color={active.led.color}
                  chars={active.led.chars}
                />
              </div>
            </div>
            <p
              key={`${active.key}-cap`}
              className="animate-mode-in mt-2.5 h-4 text-center font-pixel text-[10px] tracking-[0.24em] text-[#c4beb4]"
            >
              {active.led.caption}
            </p>
          </div>
        </div>

        {/* the diagram: one shared layout for every slide — only lines,
            screens and readouts change between modes */}
        <div
          className="relative mt-6 w-full"
          style={{ aspectRatio: `${W}/${H}` }}
        >
          <RoutingDiagram stage={active} />
        </div>
      </div>
    </div>
  );
}
