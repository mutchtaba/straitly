import Image from "next/image";
import Reveal from "@/components/Reveal";

const PANELS = [
  {
    src: "/compare/panel-without-v5.png",
    alt: "Pixel art: three AI lab server towers each selling through a thin pipe to one lone developer desk, which pays a huge $$$ retail price tag",
    label: "WITHOUT STRAITLY",
    caption: "BUY ALONE. PAY LIST PRICE.",
    hot: false,
  },
  {
    src: "/compare/panel-with-v5.png",
    alt: "Pixel art: three AI lab towers feed one merged pipe labeled 'we buy in bulk at a discount' into a glowing pallet of tokens tagged $$, redistributed to three developer desks with small $ tags",
    label: "WITH STRAITLY",
    caption: "WE BUY THE PALLET. YOU PAY WHOLESALE.",
    hot: true,
  },
];

export default function DealCompare() {
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
          SAME TOWER. SAME MODELS. DIFFERENT DEAL.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-6 md:grid-cols-2 md:gap-8">
        {PANELS.map((panel, i) => (
          <Reveal key={panel.label} delay={0.2 + i * 0.15}>
            <figure
              className={`overflow-hidden rounded-xl border backdrop-blur-sm ${
                panel.hot
                  ? "border-terracotta/50 bg-terracotta/5 shadow-[0_0_70px_rgba(183,127,90,0.14)]"
                  : "border-warm-gray/20 bg-charcoal-deep/90"
              }`}
            >
              <figcaption
                className={`flex items-center gap-3 border-b px-5 py-4 ${
                  panel.hot ? "border-terracotta/30" : "border-warm-gray/15"
                }`}
              >
                <span
                  className={`h-2 w-2 ${
                    panel.hot ? "bg-terracotta-bright" : "bg-warm-gray/50"
                  }`}
                />
                <span
                  className={`font-pixel text-[11px] tracking-[0.22em] ${
                    panel.hot ? "text-terracotta-bright" : "text-warm-gray"
                  }`}
                >
                  {panel.label}
                </span>
              </figcaption>

              <Image
                src={panel.src}
                alt={panel.alt}
                width={1280}
                height={1024}
                sizes="(min-width: 768px) 660px, 100vw"
                className="h-auto w-full"
              />

              <p
                className={`border-t px-5 py-4 font-pixel text-xs tracking-[0.18em] ${
                  panel.hot
                    ? "border-terracotta/30 text-cream"
                    : "border-warm-gray/15 text-warm-gray"
                }`}
              >
                {panel.caption}
              </p>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
