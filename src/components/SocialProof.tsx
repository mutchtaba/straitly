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

export function TrustedBy() {
  return (
    <div className="flex flex-col gap-5">
      <p className="text-center font-pixel text-xs tracking-[0.3em] text-[#c4beb4]">
        TRUSTED BY ENGINEERS AT
      </p>
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-10">
        {COMPANIES.map((c) => (
          <span key={c.logo} className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/logos/${c.logo}.svg`}
              alt={c.name}
              className="h-9 w-9"
              style={{ filter: `brightness(0) saturate(100%) ${MONO_TINT}` }}
            />
            <span className="text-xl font-semibold tracking-tight text-cream sm:text-2xl">
              {c.name}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

