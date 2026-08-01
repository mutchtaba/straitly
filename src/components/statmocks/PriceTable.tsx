import Reveal from "@/components/Reveal";

const G_BRIGHT = "#66ff99";

const ROWS = [
  { model: "anthropic/fable-5", provider: "$3.00", straitly: "$3.00" },
  { model: "openai/gpt-sol-5.6", provider: "$2.50", straitly: "$2.50" },
  { model: "google/gemini-3.5-flash", provider: "$0.30", straitly: "$0.30" },
  { model: "xai/grok-4.6", provider: "$2.00", straitly: "$2.00" },
];

/* Proof over claims: identical provider vs straitly prices, terminal-style. */
export default function PriceTable() {
  return (
    <Reveal>
      <div className="mx-auto w-full max-w-[880px] overflow-hidden rounded-lg border border-warm-gray/20 bg-black/25">
        <div className="border-b border-warm-gray/15 px-6 py-4 sm:px-8">
          <p className="font-pixel text-xs tracking-[0.2em] text-warm-gray sm:text-sm">
            <span style={{ color: G_BRIGHT }}>$</span> straitly prices
            --compare
          </p>
        </div>

        <div className="px-6 py-2 sm:px-8">
          <div className="grid grid-cols-[minmax(0,2.2fr)_1fr_1fr_0.8fr] gap-4 border-b border-warm-gray/15 py-4 font-pixel text-[10px] tracking-[0.18em] text-warm-gray sm:text-xs">
            <span>MODEL</span>
            <span className="text-right">PROVIDER</span>
            <span className="text-right">STRAITLY</span>
            <span className="text-right">MARKUP</span>
          </div>

          {ROWS.map((r) => (
            <div
              key={r.model}
              className="grid grid-cols-[minmax(0,2.2fr)_1fr_1fr_0.8fr] items-center gap-4 border-b border-warm-gray/10 py-4 font-pixel text-xs last:border-b-0 sm:text-sm"
            >
              <span className="truncate text-cream">{r.model}</span>
              <span className="text-right text-warm-gray">{r.provider}</span>
              <span className="text-right text-cream">{r.straitly}</span>
              <span
                className="text-right"
                style={{
                  color: G_BRIGHT,
                  textShadow: "0 0 8px rgba(102,255,153,0.5)",
                }}
              >
                0%
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-warm-gray/15 px-6 py-4 sm:px-8">
          <p className="font-pixel text-[10px] tracking-[0.18em] text-warm-gray sm:text-xs">
            PER 1M INPUT TOKENS &middot; 99.9% UPTIME &middot; 0MS ADDED
            LATENCY
          </p>
        </div>
      </div>
    </Reveal>
  );
}
