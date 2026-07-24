import Reveal from "@/components/Reveal";

const TIERS = [
  {
    name: "PAY-AS-YOU-GO",
    commit: "no commitment",
    figure: "0%",
    unit: "fees · list price",
    drop: "lg:translate-y-0",
  },
  {
    name: "STARTER",
    commit: "$100/mo committed",
    figure: "-10%",
    unit: "every model",
    drop: "lg:translate-y-14",
  },
  {
    name: "GROWTH",
    commit: "$1K/mo committed",
    figure: "-15%",
    unit: "every model",
    drop: "lg:translate-y-28",
  },
  {
    name: "SCALE",
    commit: "$10K+/mo",
    figure: "-25%",
    unit: "up to · negotiated",
    drop: "lg:translate-y-[10.5rem]",
    hot: true,
  },
];

export default function PricingLadder() {
  return (
    <div>
      <Reveal>
        <h2 className="font-display text-5xl font-semibold leading-[1.04] text-cream sm:text-6xl xl:text-7xl">
          We buy in bulk.
          <br />
          <span className="text-terracotta">You get the discount.</span>
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mt-6 font-pixel text-sm tracking-[0.18em] text-warm-gray sm:text-base">
          THE MORE YOU COMMIT, THE DEEPER THE CUT.
        </p>
      </Reveal>

      {/* staircase */}
      <Reveal delay={0.2}>
        <div className="relative mt-20 lg:pb-44">
          {/* step line behind the cards */}
          <svg
            className="absolute -top-10 left-0 hidden h-[calc(100%+2.5rem)] w-full lg:block"
            viewBox="0 0 1200 480"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="stepGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="6"
                  floodColor="#CF9268"
                  floodOpacity="0.35"
                />
              </filter>
              <linearGradient id="stepGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#9A948B" stopOpacity="0.5" />
                <stop offset="1" stopColor="#CF9268" />
              </linearGradient>
            </defs>
            <path
              d="M 0 40 L 280 40 L 310 96 L 580 96 L 610 152 L 880 152 L 910 208 L 1200 208"
              stroke="url(#stepGrad)"
              strokeWidth="3"
              filter="url(#stepGlow)"
            />
          </svg>

          <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`flex flex-col rounded-xl border p-7 backdrop-blur-sm transition-transform ${t.drop} ${
                  t.hot
                    ? "border-terracotta/60 bg-terracotta/10 shadow-[0_0_70px_rgba(183,127,90,0.15)]"
                    : "border-warm-gray/20 bg-charcoal-deep/90"
                }`}
              >
                <p
                  className={`font-pixel text-[11px] tracking-[0.22em] ${
                    t.hot ? "text-terracotta-bright" : "text-warm-gray"
                  }`}
                >
                  {t.name}
                </p>
                <p className="mt-1.5 text-xs text-warm-gray">{t.commit}</p>
                <p
                  className={`mt-9 font-display text-7xl font-semibold leading-none ${
                    t.hot ? "text-terracotta-bright" : "text-cream"
                  }`}
                >
                  {t.figure}
                </p>
                <p className="mt-3 text-xs text-warm-gray">{t.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.3}>
        <p className="mt-16 border-l-2 border-terracotta/50 pl-5 text-sm leading-relaxed text-warm-gray sm:text-base lg:mt-6">
          <span className="text-cream">
            Same weights. Same API. Routed straight to the provider.
          </span>{" "}
          We resell capacity — we don&apos;t run our own inference.
        </p>
      </Reveal>
    </div>
  );
}
