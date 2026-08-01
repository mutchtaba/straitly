import Reveal from "@/components/Reveal";

const STATS = [
  {
    value: "0%",
    label: "No markup on tokens",
    detail: "Pay provider prices, never a cent more.",
  },
  {
    value: "99.9%",
    label: "Uptime, guaranteed",
    detail: "Automatic failover reroutes around provider outages.",
  },
  {
    value: "0ms",
    label: "No added latency",
    detail: "Every request hits the fastest live provider.",
  },
];

/* Value-prop bar: cost / uptime / latency. Pixel number + plain-text
   explanation, echoing the hero's pixel-meets-modern mix. */
export default function StatBar() {
  return (
    <div className="grid gap-16 sm:grid-cols-3 sm:gap-8">
      {STATS.map((s, i) => (
        <Reveal key={s.value + s.label} delay={i * 0.12}>
          <div className="flex items-center justify-center gap-6 sm:justify-start lg:gap-8">
            <span className="font-pixel text-5xl leading-none text-cream lg:text-6xl">
              {s.value}
            </span>
            <div className="max-w-[240px]">
              <p className="text-sm font-semibold tracking-tight text-cream lg:text-base">
                {s.label}
              </p>
              <p className="mt-2 text-sm leading-snug text-warm-gray lg:text-[15px]">
                {s.detail}
              </p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
