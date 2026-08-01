import Reveal from "@/components/Reveal";

const ROWS = [
  {
    value: "0%",
    label: "No markup on tokens.",
    detail:
      "You pay exactly what the provider charges — down to the cent. We make our money on volume, not on you.",
  },
  {
    value: "99.9%",
    label: "Uptime, guaranteed.",
    detail:
      "When a provider goes down, your request doesn't. Straitly reroutes to a healthy provider automatically, mid-request.",
  },
  {
    value: "0ms",
    label: "No added latency.",
    detail:
      "Routing decisions happen before your request leaves the edge. Every call goes straight to the fastest live provider.",
  },
];

/* One stat per full-width row, giant pixel number alternating sides. */
export default function EditorialStats() {
  return (
    <div className="flex flex-col">
      {ROWS.map((r, i) => {
        const flipped = i % 2 === 1;
        return (
          <Reveal key={r.value + r.label}>
            <div
              className={`grid items-center gap-8 py-16 lg:grid-cols-2 lg:gap-16 ${
                i > 0 ? "border-t border-warm-gray/10" : ""
              }`}
            >
              <div
                className={`text-center lg:text-left ${
                  flipped ? "lg:order-2 lg:text-right" : ""
                }`}
              >
                <span className="font-pixel text-7xl leading-none text-cream sm:text-8xl xl:text-9xl">
                  {r.value}
                </span>
              </div>
              <div className={flipped ? "lg:order-1" : ""}>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-cream sm:text-3xl">
                  {r.label}
                </h3>
                <p className="mt-4 max-w-md text-base leading-relaxed text-warm-gray sm:text-lg">
                  {r.detail}
                </p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
