"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";

type ModelRow = {
  /* short display name — provider prefix stripped, must fit one line */
  name: string;
  /* full API id, for screen readers */
  id: string;
  read: string;
  write: string;
  cacheR: string;
  cacheW: string;
};

type Provider = {
  key: string;
  label: string;
  coin: string;
  off: string;
  on: string;
  /* overlay text color tuned to each brand's lit screen */
  ink: string;
  inkSoft: string;
  models: ModelRow[];
};

/* Program rates = public list price minus the program discount:
   45% off Anthropic, 50% off everyone else. List prices pulled from each
   provider's published API pricing, Aug 3 2026:
   - Anthropic: fable-5 $10/$50, opus-5 $5/$25, sonnet-5 $2/$10 (intro),
     haiku-4-5 $1/$5. Cache read = 10% of input, 5-min cache write = 1.25x.
   - OpenAI GPT-5.6 family: sol $5/$30, terra $2/$12, luna $0.20/$1.20.
     Cache read = 10% of input, cache write = 1.25x input.
   - Google: 3.1-pro $2/$12, 3.6-flash $1.50/$7.50, 3.5-flash-lite
     $0.30/$2.50. Cache read = 10% of input; no per-token write price
     (storage billed hourly) -> em dash.
   - Meta: muse-spark-1.1 $1.25/$4.25, cached input $0.15; no write price. */
const PROVIDERS: Provider[] = [
  {
    key: "anthropic",
    label: "Anthropic",
    coin: "/retro/coin-ai-cut.png",
    off: "/retro/tv-anthropic-off.png",
    on: "/retro/tv-anthropic-on.png",
    ink: "#2b1a08",
    inkSoft: "rgba(43,26,8,0.45)",
    models: [
      { name: "fable-5", id: "claude-fable-5", read: "$5.50", write: "$27.50", cacheR: "$0.55", cacheW: "$6.88" },
      { name: "opus-5", id: "claude-opus-5", read: "$2.75", write: "$13.75", cacheR: "$0.28", cacheW: "$3.44" },
      { name: "sonnet-5", id: "claude-sonnet-5", read: "$1.10", write: "$5.50", cacheR: "$0.11", cacheW: "$1.38" },
      { name: "haiku-4-5", id: "claude-haiku-4-5", read: "$0.55", write: "$2.75", cacheR: "$0.06", cacheW: "$0.69" },
    ],
  },
  {
    key: "openai",
    label: "OpenAI",
    coin: "/retro/coin-openai-cut.png",
    off: "/retro/tv-openai-off.png",
    on: "/retro/tv-openai-on.png",
    ink: "#0e0e0e",
    inkSoft: "rgba(14,14,14,0.45)",
    models: [
      { name: "5.6-sol", id: "gpt-5.6-sol", read: "$2.50", write: "$15.00", cacheR: "$0.25", cacheW: "$3.13" },
      { name: "5.6-terra", id: "gpt-5.6-terra", read: "$1.00", write: "$6.00", cacheR: "$0.10", cacheW: "$1.25" },
      { name: "5.6-luna", id: "gpt-5.6-luna", read: "$0.10", write: "$0.60", cacheR: "$0.01", cacheW: "$0.13" },
    ],
  },
  {
    key: "gemini",
    label: "Google",
    coin: "/retro/coin-gemini-cut.png",
    off: "/retro/tv-gemini-off.png",
    on: "/retro/tv-gemini-on.png",
    ink: "#1f2124",
    inkSoft: "rgba(31,33,36,0.45)",
    models: [
      { name: "3.1-pro", id: "gemini-3.1-pro", read: "$1.00", write: "$6.00", cacheR: "$0.10", cacheW: "\u2014" },
      { name: "3.6-flash", id: "gemini-3.6-flash", read: "$0.75", write: "$3.75", cacheR: "$0.08", cacheW: "\u2014" },
      { name: "3.5-flash-lite", id: "gemini-3.5-flash-lite", read: "$0.15", write: "$1.25", cacheR: "$0.02", cacheW: "\u2014" },
    ],
  },
  {
    key: "meta",
    label: "Meta",
    coin: "/retro/coin-meta-cut.png",
    off: "/retro/tv-meta-off.png",
    on: "/retro/tv-meta-on.png",
    ink: "#f4f8ff",
    inkSoft: "rgba(244,248,255,0.5)",
    models: [
      { name: "spark-1.1", id: "muse-spark-1.1", read: "$0.63", write: "$2.13", cacheR: "$0.08", cacheW: "\u2014" },
    ],
  },
];

/* Geometry measured off the tv-*-{off,on}.png set (788x958, shared union
   crop — all eight images overlay pixel-perfectly).
   CRT glass: x 22.2%-77.0%, y 28.4%-65.0%. SCREEN is the text-safe inset.
   Coin mech slot center sits at ~(21.5%, 79%). Retune if the art changes. */
const SCREEN = { left: 24.5, top: 30, width: 50, height: 33 };
const SLOT = { left: 21.5, top: 79 };
const COIN_W = 24; // % of cabinet width
const IMG = { w: 788, h: 958 };

const CYCLE_MS = 3400;
/* coin choreography (seconds, relative to the TV activating) */
const FALL_DELAY = 0.05;
const FALL_DUR = 0.55;
const INSERT_DUR = 0.26;
const POWER_AT = FALL_DELAY + FALL_DUR + INSERT_DUR - 0.1;

function ScreenFace({
  model,
  ink,
  inkSoft,
  coin,
}: {
  model: ModelRow;
  ink: string;
  inkSoft: string;
  coin: string;
}) {
  const rows = [
    ["READ", model.read],
    ["WRITE", model.write],
    ["CACHE R", model.cacheR],
    ["CACHE W", model.cacheW],
  ] as const;
  /* one line, always: shrink the name type to fit the longest ids,
     leaving room for the brand mark at the left of the title */
  const nameSize = Math.min(6.4, 55 / model.name.length);
  return (
    <motion.div
      key={model.name}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.75, 1] }}
      transition={{ duration: 0.28, times: [0, 0.4, 0.7, 1] }}
      className="flex h-full w-full flex-col"
      style={{ color: ink, paddingTop: "1.5cqw" }}
    >
      <div className="flex items-center" style={{ gap: "1.6cqw" }}>
        <Image
          src={coin}
          alt=""
          width={376}
          height={384}
          className="shrink-0"
          style={{ width: "7cqw", height: "auto" }}
        />
        <div
          className="whitespace-nowrap font-pixel font-semibold"
          style={{ fontSize: `${nameSize}cqw`, lineHeight: 1.1, letterSpacing: "0.01em" }}
        >
          {model.name}
        </div>
      </div>
      <div
        className="border-t"
        style={{ borderColor: inkSoft, marginTop: "2.5cqw", paddingTop: "1.6cqw" }}
      >
        {rows.map(([label, price]) => (
          <div
            key={label}
            className="flex items-baseline justify-between"
            style={{ fontSize: "4.1cqw", lineHeight: 1.52 }}
          >
            <span className="font-pixel" style={{ letterSpacing: "0.1em" }}>
              {label}
            </span>
            <span className="font-mono font-semibold">{price}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* Coin flight start offset: measured at runtime from the dispenser pan of
   the token machine in the section above, so the coin travels a true
   diagonal from the machine to this TV's slot on any screen size. */
function flightFrom(tvEl: HTMLElement): { dx: number; dy: number } {
  /* mobile: the token machine is hidden, so the coin simply appears just
     above the TV's own coin slot and drops straight in — no cross-page
     flight */
  if (window.matchMedia("(max-width: 1023px)").matches) {
    return { dx: 0, dy: -tvEl.offsetHeight * 0.26 };
  }
  const slotX =
    tvEl.getBoundingClientRect().left +
    (tvEl.offsetWidth * SLOT.left) / 100;
  const slotY =
    tvEl.getBoundingClientRect().top +
    (tvEl.offsetHeight * SLOT.top) / 100;
  const pan = document.getElementById("straitly-dispenser");
  if (!pan) return { dx: 0, dy: -720 };
  const r = pan.getBoundingClientRect();
  let dx = r.left + r.width * 0.5 - slotX;
  let dy = r.top + r.height * 0.86 - slotY;
  /* keep the flight on-camera even when the machine is scrolled far away */
  const MAX = 1100;
  if (dy < -MAX) {
    dx = (dx * MAX) / -dy;
    dy = -MAX;
  }
  return { dx, dy };
}

function CoinOpTv({ provider, index }: { provider: Provider; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [powered, setPowered] = useState(false);
  const [modelIdx, setModelIdx] = useState(0);
  const [flight, setFlight] = useState<{ dx: number; dy: number } | null>(null);

  const baseDelay = 0.1 + index * 0.22;

  useEffect(() => {
    if (!inView || !ref.current) return;
    setFlight(flightFrom(ref.current));
    const t = setTimeout(
      () => setPowered(true),
      (baseDelay + POWER_AT) * 1000,
    );
    return () => clearTimeout(t);
  }, [inView, baseDelay]);

  useEffect(() => {
    if (!powered || provider.models.length < 2) return;
    const iv = setInterval(
      () => setModelIdx((i) => (i + 1) % provider.models.length),
      CYCLE_MS + index * 260,
    );
    return () => clearInterval(iv);
  }, [powered, provider.models.length, index]);

  const advance = () => {
    if (powered && provider.models.length > 1) {
      setModelIdx((i) => (i + 1) % provider.models.length);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={ref}
        onClick={advance}
        className={`relative w-full ${
          powered && provider.models.length > 1 ? "cursor-pointer" : ""
        }`}
        style={{ containerType: "inline-size" }}
        role="img"
        aria-label={`${provider.label} coin-op TV showing qualified model rates`}
      >
        <Image
          src={provider.off}
          alt=""
          width={IMG.w}
          height={IMG.h}
          className="w-full"
        />

        {/* powered skin: CRT-style flicker up over the dead cabinet */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={powered ? { opacity: [0, 1, 0.55, 1] } : { opacity: 0 }}
          transition={{ duration: 0.42, times: [0, 0.35, 0.6, 1] }}
        >
          <Image
            src={provider.on}
            alt=""
            width={IMG.w}
            height={IMG.h}
            className="w-full"
          />
        </motion.div>

        {/* the token: flies in on a diagonal from the machine's dispenser
            pan, lands on the mech, turns edge-on and enters the slot */}
        {inView && !powered && flight && (
          <motion.div
            aria-hidden
            className="absolute"
            style={{
              left: `${SLOT.left - COIN_W / 2}%`,
              top: `${SLOT.top - COIN_W * (IMG.w / IMG.h)}%`,
              width: `${COIN_W}%`,
            }}
            initial={{ x: flight.dx, y: flight.dy, opacity: 0 }}
            animate={{
              x: [flight.dx, 0, 0, 0],
              y: [flight.dy, 0, -26, 0],
              opacity: [0, 1, 1, 1],
            }}
            transition={{
              delay: baseDelay + FALL_DELAY,
              duration: FALL_DUR,
              times: [0, 0.62, 0.8, 1],
              x: {
                delay: baseDelay + FALL_DELAY,
                duration: FALL_DUR,
                times: [0, 0.62, 0.8, 1],
                ease: ["linear", "linear", "linear"],
              },
              y: {
                delay: baseDelay + FALL_DELAY,
                duration: FALL_DUR,
                times: [0, 0.62, 0.8, 1],
                ease: ["easeIn", "easeOut", "easeIn"],
              },
              opacity: { delay: baseDelay + FALL_DELAY, duration: 0.2 },
            }}
          >
            {/* inner layer handles the slot insertion after the landing */}
            <motion.div
              initial={{ scaleX: 1, y: 0, opacity: 1, rotate: -420 }}
              animate={{
                scaleX: [1, 1, 0.16],
                y: [0, 0, 34],
                opacity: [1, 1, 0],
                rotate: 0,
              }}
              transition={{
                delay: baseDelay + FALL_DELAY,
                duration: FALL_DUR + INSERT_DUR,
                times: [0, FALL_DUR / (FALL_DUR + INSERT_DUR), 1],
                rotate: {
                  delay: baseDelay + FALL_DELAY,
                  duration: FALL_DUR * 0.62,
                  ease: "easeOut",
                },
              }}
            >
              <Image
                src={provider.coin}
                alt=""
                width={376}
                height={384}
                className="w-full"
              />
            </motion.div>
          </motion.div>
        )}

        {/* live screen content, overlaid on the blank lit CRT */}
        <div
          aria-hidden
          className="absolute overflow-hidden"
          style={{
            left: `${SCREEN.left}%`,
            top: `${SCREEN.top}%`,
            width: `${SCREEN.width}%`,
            height: `${SCREEN.height}%`,
          }}
        >
          {powered && (
            <ScreenFace
              model={provider.models[modelIdx]}
              ink={provider.ink}
              inkSoft={provider.inkSoft}
              coin={provider.coin}
            />
          )}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Image
          src={provider.coin}
          alt=""
          width={376}
          height={384}
          className="h-9 w-auto"
        />
        <div>
          <h3 className="font-pixel text-[13px] uppercase tracking-[0.18em] text-cream">
            {provider.label}
          </h3>
          <p className="mt-1 font-pixel text-[11px] tracking-[0.14em] text-[#c4beb4]">
            {provider.models.length}{" "}
            {provider.models.length === 1 ? "MODEL" : "MODELS"} &middot; $ PER
            MTOK
          </p>
        </div>
      </div>

      {/* full catalog for screen readers; the CRT text is decorative */}
      <ul className="sr-only">
        {provider.models.map((m) => (
          <li key={m.id}>
            {m.id}: read {m.read}, write {m.write}, cache read {m.cacheR},
            cache write {m.cacheW} per million tokens
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ModelCatalog() {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInView = useInView(gridRef, { once: true, amount: 0.25 });

  /* the TVs spend the same coins the machine above dispensed: once the
     TVs activate, tell TheDeal to empty its dispenser pan */
  useEffect(() => {
    if (gridInView) {
      window.dispatchEvent(new CustomEvent("straitly:coins-spent"));
    }
  }, [gridInView]);

  return (
    <div>
      <Reveal>
        <p className="text-center font-pixel text-xs tracking-[0.3em] text-[#c4beb4]">
          INSERT COIN &middot; EVERY PROVIDER
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mx-auto mt-5 max-w-[900px] text-center font-pixel text-[30px] font-semibold leading-[1.16] tracking-[0.01em] text-cream sm:text-[40px] xl:text-[48px]">
          Every frontier model.
          <br />
          <span className="text-terracotta">Qualified rates.</span>
        </h2>
      </Reveal>

      <div
        ref={gridRef}
        className="mt-16 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:mt-20"
      >
        {PROVIDERS.map((p, i) => (
          <Reveal key={p.key} delay={0.1 + i * 0.08}>
            <CoinOpTv provider={p} index={i} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <p className="mx-auto mt-12 max-w-[560px] text-center text-[13px] leading-relaxed text-[#c4beb4]/80">
          Program rates: 45% off Claude, 50% off the rest. Everyone else pays
          each provider&apos;s list price.
        </p>
      </Reveal>
    </div>
  );
}
