/* Official brand wordmarks (public/logos/wordmarks/), normalized to the
   site's cream via a CSS filter so every mark reads as one family.
   `h` nudges each logo's height so they all sit at the same optical size.
   Warp has no official wordmark asset yet, so it stays icon + styled text. */
/* Heights compensate for each SVG's internal padding (measured ink
   coverage: railway 69%, perplexity 79%, rest ~100%) so all marks land
   at the same optical size. */
const WORDMARKS = [
  { logo: "replit", name: "Replit", h: 30 },
  { logo: "perplexity", name: "Perplexity", h: 38 },
  { logo: "linear", name: "Linear", h: 28 },
  { logo: "opencode", name: "opencode", h: 24 },
  { logo: "cline", name: "Cline", h: 29 },
  { logo: "railway", name: "Railway", h: 39 },
] as const;

const MONO_TINT =
  "invert(92%) sepia(6%) saturate(153%) hue-rotate(357deg) brightness(103%) contrast(89%)";
const TINT = `brightness(0) saturate(100%) ${MONO_TINT}`;

function Wordmark({
  logo,
  name,
  h,
  small,
}: {
  logo: string;
  name: string;
  h: number;
  small?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/logos/wordmarks/${logo}.svg`}
      alt={name}
      className="w-auto shrink-0"
      style={{ height: small ? h * 0.72 : h, filter: TINT }}
    />
  );
}

function WarpItem({ small }: { small?: boolean }) {
  return (
    <span className={`flex shrink-0 items-center ${small ? "gap-2.5" : "gap-3.5"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logos/warp.svg"
        alt="Warp"
        className={small ? "h-6 w-6" : "h-9 w-9"}
        style={{ filter: TINT }}
      />
      <span
        className={`font-semibold tracking-tight text-cream ${
          small ? "text-base" : "text-2xl sm:text-[27px]"
        }`}
      >
        Warp
      </span>
    </span>
  );
}

export function TrustedBy() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-center font-pixel text-xs tracking-[0.3em] text-[#c4beb4]">
        TRUSTED BY ENGINEERS AT
      </p>

      {/* mobile: one compact auto-scrolling strip, edges faded out */}
      <div
        className="overflow-hidden lg:hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div className="animate-logo-marquee flex w-max items-center gap-10 pr-10">
          {[0, 1].flatMap((rep) => [
            ...WORDMARKS.map((c) => (
              <Wordmark key={`${c.logo}-${rep}`} {...c} small />
            )),
            <WarpItem key={`warp-${rep}`} small />,
          ])}
        </div>
      </div>

      {/* desktop: unchanged wrapped row */}
      <div className="hidden flex-wrap items-center justify-between gap-x-10 gap-y-10 lg:flex">
        {WORDMARKS.map((c) => (
          <Wordmark key={c.logo} {...c} />
        ))}
        <WarpItem />
      </div>
    </div>
  );
}
