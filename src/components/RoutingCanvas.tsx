"use client";

import { useState } from "react";

const TABS = ["Cost", "Latency", "Uptime"] as const;
type Tab = (typeof TABS)[number];

/* shared palette */
const CREAM = "#F0EBE2";
const GRAY = "#9A948B";
const TERRA = "#B77F5A";
const CARD = "#2a2c30";
const EDGE = "rgba(154,148,139,0.35)";

function Card({
  x,
  y,
  w,
  h,
  title,
  sub,
  badge,
  badgeColor = TERRA,
  dim = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  badge?: string;
  badgeColor?: string;
  dim?: boolean;
}) {
  return (
    <g opacity={dim ? 0.55 : 1}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill={CARD}
        stroke={EDGE}
      />
      <text
        x={x + 16}
        y={y + (sub ? 26 : h / 2 + 4)}
        fill={CREAM}
        fontSize="13"
        fontFamily="var(--font-jetbrains), monospace"
      >
        {title}
      </text>
      {sub && (
        <text
          x={x + 16}
          y={y + 46}
          fill={GRAY}
          fontSize="11"
          fontFamily="var(--font-jetbrains), monospace"
        >
          {sub}
        </text>
      )}
      {badge && (
        <>
          <rect
            x={x + w - 78}
            y={y + h / 2 - 12}
            width={64}
            height={24}
            rx={12}
            fill={badgeColor}
            opacity="0.15"
          />
          <text
            x={x + w - 46}
            y={y + h / 2 + 4}
            fill={badgeColor}
            fontSize="11"
            textAnchor="middle"
            fontFamily="var(--font-jetbrains), monospace"
          >
            {badge}
          </text>
        </>
      )}
    </g>
  );
}

function Pulse({ path, dur, delay = 0 }: { path: string; dur: number; delay?: number }) {
  return (
    <circle r="3.5" fill={TERRA}>
      <animateMotion
        path={path}
        dur={`${dur}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}

function CompassNode({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="44" fill={CARD} stroke={TERRA} strokeOpacity="0.5" />
      <circle cx={cx} cy={cy} r="58" fill="none" stroke={TERRA} strokeOpacity="0.15" />
      <g transform={`translate(${cx - 16}, ${cy - 16}) scale(0.107)`}>
        <circle cx="150" cy="150" r="130" fill="none" stroke={TERRA} strokeWidth="14" />
        <path d="M 234.57,65.43 L 172.06,172.06 L 127.94,127.94 Z" fill={TERRA} />
        <path
          d="M 65.43,234.57 L 172.06,172.06 L 127.94,127.94 Z"
          fill={TERRA}
          opacity="0.55"
        />
      </g>
    </g>
  );
}

function CostDiagram() {
  const toPool = [
    "M 220 90 C 320 90, 340 190, 420 200",
    "M 220 200 C 300 200, 330 200, 415 205",
    "M 220 310 C 320 310, 340 220, 420 212",
  ];
  const toProviders = [
    "M 512 200 C 600 190, 620 100, 700 92",
    "M 512 206 C 600 206, 620 206, 700 206",
    "M 512 212 C 600 222, 620 312, 700 320",
  ];
  return (
    <svg viewBox="0 0 960 412" className="h-auto w-full">
      {toPool.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={EDGE} strokeDasharray="3 5" />
      ))}
      {toProviders.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={EDGE} strokeDasharray="3 5" />
      ))}
      {toPool.map((d, i) => (
        <Pulse key={i} path={d} dur={3.2} delay={i * 1.1} />
      ))}
      {toProviders.map((d, i) => (
        <Pulse key={i} path={d} dur={3.2} delay={1.6 + i * 1.1} />
      ))}

      <Card x={60} y={60} w={160} h={60} title="your app" />
      <Card x={60} y={170} w={160} h={60} title="acme corp" dim />
      <Card x={60} y={280} w={160} h={60} title="+ 400 teams" dim />

      <CompassNode cx={466} cy={206} />
      <text
        x={466}
        y={290}
        fill={GRAY}
        fontSize="11"
        textAnchor="middle"
        fontFamily="var(--font-jetbrains), monospace"
      >
        pooled volume, one bulk contract
      </text>

      <Card x={700} y={62} w={200} h={60} title="Anthropic" badge="-15%" />
      <Card x={700} y={176} w={200} h={60} title="OpenAI" badge="-20%" />
      <Card x={700} y={290} w={200} h={60} title="Google" badge="-25%" />
    </svg>
  );
}

function LatencyDiagram() {
  const fast = "M 220 206 C 330 206, 350 206, 460 206 S 640 130, 700 122";
  const slow = "M 220 206 C 330 206, 350 206, 460 206 S 640 282, 700 290";
  return (
    <svg viewBox="0 0 960 412" className="h-auto w-full">
      <path d={fast} fill="none" stroke={TERRA} strokeOpacity="0.6" strokeWidth="1.5" />
      <path d={slow} fill="none" stroke={EDGE} strokeDasharray="3 5" />
      <Pulse path={fast} dur={2.2} />
      <Pulse path={fast} dur={2.2} delay={1.1} />

      <Card x={60} y={176} w={160} h={60} title="your app" />

      <CompassNode cx={466} cy={206} />
      <text
        x={466}
        y={290}
        fill={GRAY}
        fontSize="11"
        textAnchor="middle"
        fontFamily="var(--font-jetbrains), monospace"
      >
        health-checked every second
      </text>

      <Card x={700} y={92} w={200} h={60} title="us-east provider" badge="96ms" badgeColor="#8fae6b" />
      <Card x={700} y={260} w={200} h={60} title="eu-west provider" badge="210ms" dim />

      <text
        x={800}
        y={78}
        fill={GRAY}
        fontSize="11"
        textAnchor="middle"
        fontFamily="var(--font-jetbrains), monospace"
      >
        routed: fastest healthy
      </text>
    </svg>
  );
}

function UptimeDiagram() {
  const primary = "M 480 200 C 560 190, 600 110, 700 96";
  const fallback = "M 480 212 C 560 222, 600 302, 700 316";
  return (
    <svg viewBox="0 0 960 412" className="h-auto w-full">
      <path d={primary} fill="none" stroke={EDGE} strokeDasharray="3 5" />
      <path
        d={fallback}
        fill="none"
        stroke={TERRA}
        strokeOpacity="0.7"
        strokeWidth="1.5"
      />
      <path d="M 220 206 L 372 206" fill="none" stroke={EDGE} strokeDasharray="3 5" />
      <Pulse path={fallback} dur={2.4} />
      <Pulse path={fallback} dur={2.4} delay={1.2} />

      <Card x={60} y={176} w={160} h={60} title="your app" />

      <rect x={372} y={182} width={108} height={48} rx={24} fill={CARD} stroke={EDGE} />
      <text
        x={426}
        y={210}
        fill={CREAM}
        fontSize="11"
        textAnchor="middle"
        fontFamily="var(--font-jetbrains), monospace"
      >
        degraded?
      </text>

      <text
        x={560}
        y={128}
        fill={GRAY}
        fontSize="10"
        fontFamily="var(--font-jetbrains), monospace"
      >
        primary
      </text>
      <rect x={548} y={252} width={64} height={20} rx={10} fill={TERRA} />
      <text
        x={580}
        y={266}
        fill="#313338"
        fontSize="10"
        textAnchor="middle"
        fontFamily="var(--font-jetbrains), monospace"
      >
        fallback
      </text>

      <Card
        x={700}
        y={66}
        w={220}
        h={60}
        title="Claude Opus 5"
        sub="Anthropic"
        badge="degraded"
        badgeColor="#c96f5f"
        dim
      />
      <Card
        x={700}
        y={286}
        w={220}
        h={60}
        title="Claude Opus 5"
        sub="Amazon Bedrock"
        badge="healthy"
        badgeColor="#8fae6b"
      />
    </svg>
  );
}

const COPY: Record<Tab, string> = {
  Cost: "Your usage pools with hundreds of other teams. One bulk contract per provider, and the committed-use discount flows back to you.",
  Latency:
    "Every request is routed to the fastest healthy provider for your model. We're a pass-through, not an extra hop.",
  Uptime:
    "If a provider degrades, the gateway fails over to the same model on another provider. Identical output, no downtime.",
};

export default function RoutingCanvas() {
  const [tab, setTab] = useState<Tab>("Cost");

  return (
    <div>
      <div className="mb-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-end">
        <h2 className="font-display text-4xl font-semibold leading-[1.05] text-cream sm:text-5xl">
          One gateway, optimized for
          <br />
          <span className="text-terracotta">cost, latency & uptime</span>
        </h2>
        <p className="text-sm leading-relaxed text-warm-gray sm:text-base">
          {COPY[tab]}
        </p>
      </div>

      {/* tabs */}
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer rounded-md px-4 py-1.5 font-mono text-xs transition-colors sm:text-sm ${
              tab === t
                ? "bg-cream text-charcoal"
                : "text-warm-gray hover:text-cream"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* dotted canvas */}
      <div
        className="overflow-hidden rounded-xl border border-warm-gray/15"
        style={{
          background:
            "radial-gradient(rgba(154,148,139,0.18) 1px, transparent 1px), #2d2f34",
          backgroundSize: "22px 22px",
        }}
      >
        {tab === "Cost" && <CostDiagram />}
        {tab === "Latency" && <LatencyDiagram />}
        {tab === "Uptime" && <UptimeDiagram />}
      </div>
    </div>
  );
}
