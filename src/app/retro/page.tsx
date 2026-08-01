import RetroTerminal, { type ScreenRect } from "@/components/RetroTerminal";

const CONTAINER = "mx-auto w-full max-w-[1360px] px-6";

type Option = {
  id: number;
  name: string;
  src: string;
  screen: ScreenRect;
};

/* screen rects measured programmatically from the generated images */
const OPTIONS: Option[] = [
  {
    id: 1,
    name: "Classic Macintosh (pixel)",
    src: "/retro/01-macintosh-pixel.png",
    screen: { left: 29.92, top: 18.75, width: 40.08, height: 39.16 },
  },
  {
    id: 2,
    name: "90s CRT battlestation (pixel)",
    src: "/retro/02-crt-battlestation-pixel.png",
    screen: { left: 32.73, top: 12.6, width: 34.77, height: 30.86 },
  },
  {
    id: 3,
    name: "Industrial phosphor terminal (pixel)",
    src: "/retro/03-phosphor-terminal-pixel.png",
    screen: { left: 30.2, top: 16.9, width: 39.3, height: 37.9 },
  },
  {
    id: 4,
    name: "Commodore-style wedge (pixel)",
    src: "/retro/04-wedge-commodore-pixel.png",
    screen: { left: 33.83, top: 15.92, width: 32.5, height: 28.52 },
  },
  {
    id: 5,
    name: "Retro-futuristic console (pixel)",
    src: "/retro/05-retrofuture-console-pixel.png",
    screen: { left: 25.86, top: 13.96, width: 48.36, height: 48.54 },
  },
  {
    id: 6,
    name: "Vintage Macintosh (painted)",
    src: "/retro/06-macintosh-painted.png",
    screen: { left: 31.72, top: 22.66, width: 36.88, height: 34.38 },
  },
  {
    id: 7,
    name: "Late-night hacker desk (pixel)",
    src: "/retro/07-desk-scene-pixel.png",
    screen: { left: 29.92, top: 15.04, width: 44.22, height: 44.24 },
  },
];

export default function RetroPreview() {
  return (
    <main className="flex flex-col">
      <nav className="fixed inset-x-0 top-0 z-50 bg-charcoal/85 backdrop-blur-md">
        <div
          className={`${CONTAINER} flex items-center gap-4 py-3 font-pixel text-xs tracking-widest text-warm-gray`}
        >
          <span className="text-terracotta">JUMP TO:</span>
          {OPTIONS.map((opt) => (
            <a
              key={opt.id}
              href={`#opt-${opt.id}`}
              className="border border-warm-gray/30 px-3 py-1.5 transition-colors hover:border-terracotta hover:text-terracotta"
            >
              {opt.id}
            </a>
          ))}
        </div>
      </nav>
      {OPTIONS.map((opt) => (
        <section
          key={opt.id}
          id={`opt-${opt.id}`}
          className="relative flex min-h-screen items-center overflow-x-clip border-b border-warm-gray/15"
        >
          <span className="absolute left-6 top-6 z-10 border border-terracotta/60 bg-charcoal/80 px-3 py-1.5 font-pixel text-xs tracking-widest text-terracotta">
            OPTION {opt.id} — {opt.name.toUpperCase()}
          </span>

          <div className={`${CONTAINER} py-24`}>
            <div className="mx-auto max-w-[640px]">
              <h1 className="font-display text-6xl font-semibold leading-[1.0] text-cream sm:text-7xl xl:text-[92px]">
                <span className="whitespace-nowrap">Wholesale API</span>
                <br />
                <span className="text-terracotta">for Tokens</span>
              </h1>
              <p className="mt-7 font-pixel text-base tracking-[0.18em] text-warm-gray sm:text-lg">
                ONE API &middot; EVERY FRONTIER MODEL
              </p>
              <div className="mt-10 w-[118%] lg:-ml-[9%]">
                <RetroTerminal
                  src={opt.src}
                  alt={`Retro computer concept: ${opt.name}`}
                  screen={opt.screen}
                />
              </div>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
