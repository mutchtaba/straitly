const COMPANIES = [
  { logo: "replit", name: "Replit" },
  { logo: "perplexity", name: "Perplexity" },
  { logo: "linear", name: "Linear" },
  { logo: "opencode", name: "opencode" },
  { logo: "cline", name: "Cline" },
  { logo: "warp", name: "Warp" },
  { logo: "railway", name: "Railway" },
];

const MONO_TINT =
  "invert(92%) sepia(6%) saturate(153%) hue-rotate(357deg) brightness(103%) contrast(89%)";

function LogoItem({ logo, name, small }: { logo: string; name: string; small?: boolean }) {
  return (
    <span className={`flex shrink-0 items-center ${small ? "gap-2.5" : "gap-3.5"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/logos/${logo}.svg`}
        alt={name}
        className={small ? "h-6 w-6" : "h-9 w-9"}
        style={{ filter: `brightness(0) saturate(100%) ${MONO_TINT}` }}
      />
      <span
        className={`font-semibold tracking-tight text-cream ${
          small ? "text-base" : "text-xl sm:text-2xl"
        }`}
      >
        {name}
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
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <LogoItem key={`${c.logo}-${i}`} logo={c.logo} name={c.name} small />
          ))}
        </div>
      </div>

      {/* desktop: unchanged wrapped row */}
      <div className="hidden flex-wrap items-center justify-between gap-x-10 gap-y-10 lg:flex">
        {COMPANIES.map((c) => (
          <LogoItem key={c.logo} logo={c.logo} name={c.name} />
        ))}
      </div>
    </div>
  );
}

